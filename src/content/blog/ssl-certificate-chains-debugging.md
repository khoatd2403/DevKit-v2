---
title: "SSL/TLS Certificate Chains: Why Your Cert Works in Chrome but Fails in curl"
slug: "ssl-certificate-chains-debugging"
description: "The most common TLS bug isn't an expired cert, it's an incomplete certificate chain. How chains work, why browsers paper over the issue, and how to debug it in 60 seconds."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - ssl certificate chain
  - intermediate certificate
  - tls handshake debug
  - certificate chain incomplete
  - openssl s_client
tags:
  - TLS
  - Networking
  - Problem-solving
cover: "/og-image.svg"
excerpt: "Browsers fix incomplete certificate chains for you. curl, Java, Python, and most server-to-server tools don't. Half the 'TLS works in browser but fails everywhere else' bugs trace back to a missing intermediate cert."
---

First time I saw "unable to get local issuer certificate" was a Tuesday morning. We had renewed the cert the night before. Production looked fine in every browser. Then enterprise customers started filing tickets that their batch jobs couldn't reach our API. We spent half the day digging through nginx config, suspecting CipherSuites, before someone ran `openssl s_client -showcerts` and saw only the leaf cert. The intermediate had been left out of `nginx.conf`. We swapped `cert.pem` for `fullchain.pem`, reloaded, and ten thousand customer cron jobs unstuck themselves.

Browsers had hidden the bug because Chrome and Safari fetch missing intermediates automatically. `curl` doesn't. Java doesn't. Go doesn't. Most server-to-server clients don't. So you ship "TLS works in browser, fails everywhere else" without realizing the leaf-only cert was the cause. This is the debugging walk-through I wish someone had given me that morning.

```
curl: (60) SSL certificate problem: unable to get local issuer certificate
```

You panic, because Chrome says it's fine. The cert isn't expired. The hostname matches.

Welcome to the world of incomplete certificate chains.

## What a certificate chain actually is

A TLS certificate isn't trusted on its own. It's trusted because it was **signed by another certificate**, which was signed by another, ending at a **root CA** that the client already trusts (Mozilla CA bundle, OS root store, etc.).

For `example.com`, the chain typically looks like:

```
example.com  (the leaf, what you got from Let's Encrypt / DigiCert)
   ↑ signed by
Let's Encrypt R10  (intermediate)
   ↑ signed by
ISRG Root X1  (root, in the OS / browser trust store)
```

Three certs. The browser trusts the root. The intermediate vouches for the leaf. The leaf is your actual cert.

When the server does the TLS handshake, it should send the **leaf and all intermediates**. The client supplies its own root store. If any intermediate is missing, the client can't connect the chain to a trusted root.

## Why browsers "fix" the problem

Modern browsers cheat. When they encounter a missing intermediate, they:

1. Look at the leaf cert's `Authority Information Access` field (usually contains a URL to fetch the issuer cert)
2. Download the missing intermediate
3. Cache it for future requests

This is called "AIA chasing." It hides server misconfigurations. **`curl` doesn't do this** by default. Neither does Java's HttpsURLConnection, Python's `urllib`, Go's `crypto/tls`, or most server-to-server libraries.

Result: the server "works" in browsers and fails everywhere else. The fix is simple: **send the full chain from the server**, including intermediates.

## How to check if your chain is complete

The fastest check is from a terminal:

```bash
echo | openssl s_client -connect example.com:443 -showcerts 2>/dev/null | openssl crl2pkcs7 -nocrl -certfile /dev/stdin | openssl pkcs7 -print_certs -noout
```

You should see **multiple `subject=` and `issuer=` lines**, with the issuer of cert N matching the subject of cert N+1, until you reach a self-signed root or a known intermediate.

A simpler check, in a browser:

1. Visit your site
2. Click the padlock
3. Certificate → Details
4. The chain should show 2-3 levels: leaf, intermediate, root

[SSL Certificate Checker](/web-tools/ssl-checker/) on DevTools Online queries Certificate Transparency logs, useful to see what cert is currently issued for a domain, including its issuer chain.

## What "the full chain" means

Most CAs give you, at issuance:

- **Your certificate** (leaf)
- **The intermediate certificate(s)**
- **The root** (sometimes, but you don't need this; clients have it)

For Let's Encrypt:

```bash
# After certbot, you get:
/etc/letsencrypt/live/example.com/cert.pem        # leaf only
/etc/letsencrypt/live/example.com/chain.pem       # intermediates only
/etc/letsencrypt/live/example.com/fullchain.pem   # leaf + intermediates ✅ use this
/etc/letsencrypt/live/example.com/privkey.pem     # private key
```

**Use `fullchain.pem`** for your nginx / Apache / haproxy `ssl_certificate` directive. Don't use `cert.pem` alone, that's the most common cause of incomplete chains.

For nginx:

```nginx
ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
```

For Apache:

```apache
SSLCertificateFile      /etc/letsencrypt/live/example.com/fullchain.pem
SSLCertificateKeyFile   /etc/letsencrypt/live/example.com/privkey.pem
```

For Cloudflare, Caddy, or modern PaaS providers: they handle this automatically.

## When chain validation fails: error messages by client

| Client | Error message |
|---|---|
| curl | `unable to get local issuer certificate` |
| Java | `PKIX path building failed` |
| Python (`requests`) | `[SSL: CERTIFICATE_VERIFY_FAILED]` |
| Go | `x509: certificate signed by unknown authority` |
| Node.js | `unable to verify the first certificate` |
| OpenSSL `s_client` | `verify error:num=20:unable to get local issuer certificate` |

All of these are the same problem: a client without AIA chasing can't follow the chain to a known root.

## Other things that look like chain problems but aren't

### Hostname mismatch

```
curl: (60) SSL: no alternative certificate subject name matches target host name
```

The cert is for `www.example.com` but you're connecting to `example.com`. Issue a cert with both names (SAN list) or use a wildcard.

### Cert expired

```
curl: (60) SSL certificate has expired
```

Self-explanatory. Renew. Use [SSL Checker](/web-tools/ssl-checker/) regularly to catch upcoming expirations.

### Self-signed cert in production

```
curl: (60) SSL certificate problem: self signed certificate
```

You're using a dev cert in production. Get a real one from Let's Encrypt (free) or a commercial CA.

### Clock too far off

```
x509: certificate has expired or is not yet valid
```

The client's clock is wrong. The cert isn't yet valid (NotBefore is in the future) or has "expired" because the system clock is ahead. Fix: NTP. This bites embedded devices and freshly-booted CI runners.

## Pinning chains: don't, mostly

Some clients used to pin specific certificates or chains. **Don't.** When the cert renews (every 90 days for Let's Encrypt), pinned clients break. The mobile world learned this the hard way around 2020.

If you do pin, pin to:

- The **public key** (SPKI) of a long-lived intermediate, not the leaf
- A **set** of acceptable keys, including the next-rotation key

For most apps, just trust the system root store and let the chain validate normally.

## The OCSP / CRL question

When clients verify a cert, they may also check whether it's been revoked:

- **CRL** (Certificate Revocation List), list of revoked serial numbers, downloaded periodically
- **OCSP** (Online Certificate Status Protocol), query the CA: "is this cert revoked?"
- **OCSP stapling**: the server fetches OCSP and includes the response in TLS handshake

In 2026, OCSP stapling is the standard. Enable it in your server config (`ssl_stapling on` in nginx). Without stapling, clients may make additional connections to the CA to check revocation, adding latency.

## A working debugging procedure

When a TLS connection fails:

1. **Confirm the cert exists and isn't expired**: visit in browser, or [SSL Checker](/web-tools/ssl-checker/).
2. **Check the chain length**: `openssl s_client -showcerts -connect example.com:443` should show the leaf AND intermediates.
3. **Verify hostname**: the SAN list must include the hostname being requested.
4. **Test with curl**: `curl -v https://example.com`. If browser works but curl doesn't, it's a chain or AIA issue.
5. **Compare to a known-good site**: `openssl s_client -connect google.com:443` should always succeed. If it doesn't, it's a client-side problem (CA bundle missing, wrong system time).
6. **Check ALPN/SNI**: if you're behind a load balancer, the wrong cert may be served if SNI isn't set right.

## Recommended workflow

1. **For new TLS setup**: Let's Encrypt + Certbot. Use `fullchain.pem` everywhere.
2. **For existing servers**: verify chain with `openssl s_client -showcerts`. Should show 2-3 certs.
3. **For renewals**: automate (Certbot, acme.sh, Caddy, AWS ACM). Manual renewals will eventually fail.
4. **For monitoring**: set up cert expiry alerts at 30 and 7 days. [SSL Checker](/web-tools/ssl-checker/) for ad-hoc checks; UptimeRobot or Grafana for ongoing.
5. **For debugging client errors**: ask "does it work in curl?", that's your AIA chasing test.

The takeaway: certificate chains are like a chain of references in a paper. If you only cite the latest source and not the citations it references, your reader (the client) can't trust your work. Send the full chain, every time.

---

**Related tools on DevTools Online:**

- [SSL Certificate Checker](/web-tools/ssl-checker/), see what cert is issued for a domain
- [DNS Lookup](/web-tools/dns-lookup/), verify domain resolution and CAA records
- [HTTP Request Builder](/web-tools/http-request-builder/), test against your TLS endpoint
- [Hash Generator](/security-tools/hash-generator/), for cert pinning SPKI hashes
