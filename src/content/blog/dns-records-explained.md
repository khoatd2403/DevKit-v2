---
title: "Reading DNS Records Like a Sysadmin: A, AAAA, CNAME, MX, TXT Explained"
slug: "dns-records-explained"
description: "What each DNS record type does, in what order browsers and mail servers query them, and the rules of thumb that prevent the most common DNS misconfigurations."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - dns records
  - a record
  - aaaa record
  - cname record
  - mx record
  - txt record spf dkim
tags:
  - DNS
  - Networking
  - Reference
cover: "/og-image.svg"
excerpt: "DNS isn't black magic. It's a public lookup table with a dozen record types, each answering a specific question. If you know which question each one answers, you can debug 90% of DNS issues."
---

The DNS record types you'll actually touch in 2026, ordered by frequency:

| Type | Question it answers | Most common use |
|---|---|---|
| `A` | What's the IPv4? | Web traffic |
| `AAAA` | What's the IPv6? | Web traffic, IPv6 |
| `CNAME` | What's the alias of this name? | `www` → apex |
| `MX` | Where does mail go? | Email |
| `TXT` | Arbitrary text | SPF, DKIM, DMARC, domain verify |
| `NS` | Which servers are authoritative? | Delegation |
| `CAA` | Which CAs may issue certs? | TLS hardening |
| `SOA` | Zone metadata | Set by provider |
| `PTR` | What's the hostname for this IP? | Reverse DNS, mail |
| `SRV` | Where's this service? | SIP, XMPP, AD |

The rest of the post: when each is the right answer, plus the rules-of-thumb that prevent the most common DNS misconfigurations.

## DNS in one paragraph

DNS is a hierarchical lookup system. You ask "what's the IP for `example.com`?" and a chain of servers (root → TLD → authoritative) returns an answer. The answer comes in **records**: typed entries like A, AAAA, CNAME, MX. A domain has a set of records; queries match by record type. That's it.

You can interactively query records for any domain in [DNS Lookup](/web-tools/dns-lookup/), paste a domain, see all the records.

## The records in order of how often you'll touch them

### A — IPv4 address

Maps a hostname to an IPv4 address.

```
example.com.      300   IN   A   93.184.215.14
www.example.com.  300   IN   A   93.184.215.14
```

When a browser visits `example.com`, it queries A records. **300** is the TTL (time to live) in seconds, how long DNS resolvers cache the answer.

If you have multiple A records for the same name:

```
example.com.   300   IN   A   1.2.3.4
example.com.   300   IN   A   1.2.3.5
```

Most resolvers return them in random or round-robin order. This is how DNS-based load balancing works in its simplest form.

### AAAA — IPv6 address

Same as A but for IPv6.

```
example.com.   300   IN   AAAA   2606:2800:21f:cb07:6820:80da:af6b:8b2c
```

In 2026, you should have both A and AAAA records. About 40% of users in some countries use IPv6 by default. Missing AAAA = unnecessary IPv4 fallback latency.

### CNAME, alias

Points one name to another name.

```
www.example.com.   300   IN   CNAME   example.com.
```

Visiting `www.example.com` causes the resolver to follow the CNAME, then query A records for `example.com`. The browser ends up with the IP, transparently.

**The rule:** a CNAME on a name **must be the only record** at that name. You cannot have both `CNAME` and `A` on the same hostname. You cannot have `CNAME` and `MX`. The exception in real life: many DNS providers allow CNAME at the apex (`example.com` itself) by flattening, but that's a provider feature, not the spec.

### MX, mail exchange

Points a domain to its email servers.

```
example.com.   3600   IN   MX   10 mail1.example.com.
example.com.   3600   IN   MX   20 mail2.example.com.
```

The number is **priority** (lower = preferred). When sending mail to `user@example.com`, the sender queries MX records, picks the lowest priority, falls back to higher.

The right side of the MX record must be a hostname (which then resolves via A/AAAA records), **not an IP**. Pointing MX at a CNAME is technically illegal per RFC 1035 and RFC 5321, but every modern mail server tolerates it. Don't do it in new setups; resolve to a real A record.

If you don't host email on your domain, set MX to nothing, many providers default to a placeholder. Or:

```
example.com.   3600   IN   MX   0 .
```

The single dot tells the world "no mail accepted here."

### TXT, text string (used for everything)

Originally for arbitrary text. Now used for:

- **SPF**: `v=spf1 include:_spf.google.com ~all`
- **DKIM**: long signing key strings
- **DMARC**: `v=DMARC1; p=reject; rua=mailto:dmarc@example.com`
- **Domain verification**: Google, AWS, GitHub, Stripe all use TXT records to prove you own the domain

```
example.com.            300   IN   TXT   "v=spf1 include:_spf.google.com ~all"
_dmarc.example.com.     300   IN   TXT   "v=DMARC1; p=reject; rua=mailto:dmarc@example.com"
mail._domainkey.example.com.  300  IN  TXT  "v=DKIM1; k=rsa; p=MIGfMA..."
```

TXT records have a 255-byte limit per string, but a record can have multiple strings concatenated. DKIM keys regularly exceed 255 bytes, that's why they're shown wrapped in quotes.

### NS, name server

Points to the authoritative DNS servers for a domain.

```
example.com.   86400   IN   NS   ns1.example.com.
example.com.   86400   IN   NS   ns2.example.com.
```

Set at your registrar to delegate DNS hosting. If you're using Cloudflare, you set NS records at your registrar to Cloudflare's nameservers, then create A/CNAME/MX/TXT records inside Cloudflare's interface.

### CAA, Certificate Authority Authorization

Tells the world which CAs are allowed to issue TLS certificates for your domain.

```
example.com.   300   IN   CAA   0 issue "letsencrypt.org"
```

Without CAA, any CA can issue a cert for your domain. With CAA, only the listed ones can. Free defense against rogue CA-issued certs.

### SOA, start of authority

Administrative metadata about the zone, primary nameserver, contact email, refresh intervals. You usually don't touch SOA directly; your DNS provider sets it.

### PTR, reverse DNS

Maps an IP address back to a hostname:

```
14.215.184.93.in-addr.arpa.   300   IN   PTR   example.com.
```

Set by the IP owner (not by you, unless you control the IP). Mail servers use PTR to verify a sender's reverse DNS matches their forward DNS, mismatches cause delivery problems.

### SRV, service record

Used for service discovery. SIP, XMPP, Minecraft, Active Directory all use SRV records:

```
_sip._tcp.example.com.   300   IN   SRV   10 60 5060 sipserver.example.com.
```

The fields: priority, weight, port, target. Less common in web services; more common in real-time and enterprise protocols.

## The rules of thumb

### 1. CNAMEs cost an extra round trip

Each CNAME chain adds latency. `www.example.com` → CNAME → `example.com` → A → IP is two queries. Most DNS resolvers cache aggressively, so this matters most for first-time visitors. Avoid deep CNAME chains.

### 2. Apex CNAME flattening is a Cloudflare-style hack

The DNS spec forbids CNAME at the apex (`example.com` itself). Cloudflare, Route 53, and others "flatten" CNAMEs at the apex by resolving them server-side and serving an A record. It works but is a non-standard feature. If you migrate providers, your apex CNAME may break.

### 3. TTL trade-offs

Low TTL (60-300 seconds): fast propagation, more DNS queries.
High TTL (3600-86400): slow propagation, less load.

Lower TTL temporarily before making changes (e.g., to 60s a day before, then back to 3600 after). Otherwise stick with 300-3600 for general records.

### 4. SPF, DKIM, DMARC: all three

For email deliverability:

- **SPF** says "these IPs can send mail for our domain"
- **DKIM** signs each outgoing message; receivers verify the signature
- **DMARC** tells receivers what to do if SPF/DKIM fail

Setting up email without all three (or with one misconfigured) is the most common reason transactional emails go to spam. If you send any email, audit these.

### 5. Verify with multiple resolvers

Different resolvers cache differently. After making a DNS change:

```bash
dig @1.1.1.1 example.com
dig @8.8.8.8 example.com
dig @9.9.9.9 example.com
```

If they disagree, propagation isn't complete. Wait for the highest TTL of the previous record to expire.

## Common DNS bugs

### "It works on my machine"

Your local resolver has cached the new value. Other resolvers haven't. Solution: wait for TTL.

### Stale subdomain after migration

You moved hosting; old A record is still cached somewhere with a 24-hour TTL. Solution: lower TTL **before** the migration (one full TTL period in advance), make the change, raise TTL after.

### MX pointing to a CNAME

Some validators flag this. Some mail servers tolerate it. Always point MX to an A/AAAA hostname directly.

### CNAME conflicts with other records

Adding `MX` to a name that has `CNAME` is invalid. Most DNS providers warn you, but some don't. The "fix" is to remove the CNAME and use A records directly, then re-add MX.

### Wildcard records

`*.example.com` matches anything not explicitly defined. Useful for SaaS multi-tenant setups but easy to misuse. A wildcard match doesn't extend to apex, `*.example.com` doesn't match `example.com`.

## Recommended workflow

1. **Inspecting any domain**: paste into [DNS Lookup](/web-tools/dns-lookup/), see all record types in one go.
2. **Setting up a new domain**: A + AAAA for the apex, CNAME for `www` to apex, MX + SPF + DKIM + DMARC for email.
3. **Migrating hosts**: lower TTL the day before, change records, raise TTL after.
4. **Debugging email delivery**: verify SPF, DKIM, DMARC all pass at the receiver. Tools like `mxtoolbox.com` show what mail servers see.
5. **Verifying TLS issuer**: CAA record for defense against rogue cert issuance. Pair with [SSL Checker](/web-tools/ssl-checker/) to confirm the actual cert.

DNS is unreliable in the same way the post office is unreliable, usually fine, but with edge cases that bite at 2am. The fix is usually patient diagnosis, not panic.

---

**Related tools on DevTools Online:**

- [DNS Lookup](/web-tools/dns-lookup/), query any domain's DNS records
- [SSL Certificate Checker](/web-tools/ssl-checker/), pair with CAA verification
- [HTTP Request Builder](/web-tools/http-request-builder/), for testing the actual server behind the DNS
- [Hash Generator](/security-tools/hash-generator/). DKIM keys are RSA-signed; HMAC tools help verify
