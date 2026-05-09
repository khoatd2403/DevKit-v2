---
title: "JWT Decoded: How Tokens Work and Why Invalid Signature Happens"
slug: "jwt-decoded-debugging"
description: "What's actually inside a JWT, why signature verification fails for non-obvious reasons, and a debugging checklist that resolves 90% of token issues in the first five minutes."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - jwt
  - jwt decoded
  - invalid signature
  - jwt debugging
  - bearer token
  - jose
tags:
  - Encoding
  - Security
  - Problem-solving
cover: "/og-image.svg"
excerpt: "A JWT is three Base64URL strings separated by dots. The first two are JSON. The third is a signature. About half the JWT bugs in production come from people forgetting that last detail."
---

2:47am, on-call. Auth gateway is rejecting tokens. Logs say `JsonWebTokenError: invalid signature`. Same secret as yesterday. Same code. Same client. Three engineers on the bridge call. We added more logging. We re-deployed. We rotated the key. We rolled it back. At 4am someone pasted a token into a decoder and noticed a stray `\n` at the end of the secret read from a file. We had been signing with `secret` and verifying with `secret\n`. Three hours, gone.

I have a list of every weird way JWT signature verification has failed on me over six years on-call. There are about ten of them and they always come back. This post is that list, in order, so the next 2am you have, you walk through it instead of guessing.

## What's actually in a JWT

A JWT is three parts, separated by dots:

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.dBjftJeZ4CVP-mB92K27uhbUJU1p
^^^^^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
       Header                Payload                      Signature
```

Each part is **Base64URL-encoded** (not Base64, note the `-` and `_` instead of `+` and `/`, and no padding). The first two parts decode back to JSON. The third is a binary signature, encoded.

Decode the header — `{"alg":"HS256"}`, and the payload, `{"sub":"1234"}`, and you've got everything except the cryptographic check. Paste your token into [JWT Decoder](/encoding-tools/jwt-decoder/) and you'll see this in two seconds.

## What "Invalid signature" actually means

The signature is computed as:

```
HMAC-SHA256( base64url(header) + "." + base64url(payload),  secret )
```

The signature you receive in the JWT and the signature your server computes must be **byte-for-byte identical**. If they differ by a single bit, you get "Invalid signature."

There are about 10 things that can cause that bit to differ. Knowing them is what separates 30 minutes of debugging from a 5-minute fix.

## The 10 reasons your JWT signature is "invalid"

### 1. Wrong secret

Most common. Worth ruling out first. The secret you used to sign and the secret you're verifying with must match exactly. Check for:

- Trailing newlines (`echo "secret"` adds one; use `echo -n` or `printf`)
- Different secrets in different env vars (e.g., `JWT_SECRET` in `.env.local` vs `.env.production`)
- Secret loaded from a file with a BOM (yes, [the BOM strikes again](/blog/json-bom-byte-order-mark/))

### 2. The token was modified

JWTs are signed, not encrypted. Changing one character in the payload, even adding a space, invalidates the signature. If you copied a token and editor word-wrap split it across lines, you may have introduced a newline. Strip whitespace and try again.

### 3. Algorithm mismatch

The `alg` field in the header says how the signature was computed. If the token says `HS256` but your verifier expects `RS256`, the verifier reads the wrong number of bytes and fails.

Worse: many libraries had (and some still have) the **`alg: none` vulnerability**. An attacker sets `alg: none` and removes the signature; broken verifiers accept it. Always pin the algorithm at verification time:

```js
jwt.verify(token, secret, { algorithms: ['HS256'] })
```

### 4. HS256 vs RS256 secret confusion

`HS256` uses a shared secret (HMAC). `RS256` uses an RSA key pair, sign with the private key, verify with the public key. Mixing these:

- "I'm using the public key to verify HS256" → fails (HS256 is symmetric, no public key)
- "I'm using the private key for HS256" → works as a string, but the value should be a high-entropy random secret, not your RSA private key

If your provider uses RS256 (Auth0, AWS Cognito, Firebase, most OIDC), download the **public key** from their JWKS endpoint and verify against that. Your code never sees the private key.

### 5. Clock skew on `exp`, `nbf`, `iat`

Token has `exp: 1715000000`. Your server clock is 5 minutes ahead. The token is "expired" before your user can use it. Most libraries support a `clockTolerance` option:

```js
jwt.verify(token, secret, { clockTolerance: 30 })  // 30 seconds
```

This is one of those defaults that *should* be 30 seconds and inexplicably defaults to 0 in some libraries.

### 6. Wrong key in JWKS

Provider rotates keys. Your code is caching the old public key. Token signed with new key fails to verify. Fix: refresh JWKS on signature failure (with rate limiting), or shorten the cache TTL. The `kid` (key ID) in the header tells you which key to use.

### 7. Whitespace in the token

`Bearer ` has a trailing space. If your code does:

```js
const token = req.headers.authorization.replace('Bearer ', '')
```

…and a client sends `Bearer  token` with two spaces, you've got `" token"`. Strip whitespace explicitly:

```js
const token = req.headers.authorization?.replace(/^Bearer\s+/i, '').trim()
```

### 8. Token URL-encoded

Some clients URL-encode the entire `Authorization` header value. Now `Bearer eyJhbGc...` becomes `Bearer%20eyJhbGc...`. Decode at the boundary or fail loudly.

### 9. UTF-8 vs binary secret encoding

If the secret is stored as a hex string and your library treats it as raw text:

```js
// Provider says: secret is hex "deadbeef"
const secret = "deadbeef"          // ❌ 8 bytes of ASCII
const secret = Buffer.from("deadbeef", "hex")  // ✅ 4 bytes of binary
```

Same secret, different bytes, different signatures. Read the docs for the exact format.

### 10. Subtle: trailing `=` padding

Standard Base64 uses `=` padding. Base64URL strips it. Some libraries are sloppy and emit standard Base64 in JWT, which technically is invalid but often accepted. When two libraries disagree, signature verification fails.

The fix is on the producer side: use a JWT library that emits proper Base64URL.

## Debugging checklist (in order)

When you get "Invalid signature":

1. **Decode the token**. Confirm the header `alg` and the payload claims look right. [JWT Decoder](/encoding-tools/jwt-decoder/) is fastest.
2. **Print the secret your verifier is using**. Strip whitespace. Compare byte-for-byte to what signed it.
3. **Print the algorithm both sides expect**. They must match.
4. **Print the current server time**. Compare to `exp` and `iat`. Within tolerance?
5. **Try verifying with a known-good library**. If `jsonwebtoken` (Node) or `pyjwt` (Python) accepts the token, the problem is in your code, not the token. If they reject it, the problem is in how the token was signed.
6. **Check the network**. Is the token being mangled in transit (proxies stripping headers, gateway URL-encoding, etc.)?

## Common JWT myths

### "JWTs are encrypted"

They're not. JWTs are **signed** by default. The payload is plain Base64URL, anyone with the token can read it. If you put sensitive data in a JWT, **anyone with the token can see it**.

If you need encryption, use **JWE** (JSON Web Encryption), a separate spec that encrypts the payload. Most apps don't, and shouldn't use JWE unless they have a specific reason.

### "Long secrets are always better"

For HS256, the secret should be at least 256 bits (32 bytes) of randomness. Beyond that, more length doesn't help. Don't use a passphrase like `"my-secret-key"`, that's about 5 bits of entropy, trivially brute-forceable. Generate a secret:

```bash
openssl rand -base64 32
```

…and store it where only the server can read it.

### "JWTs are stateless, so you don't need a database"

You can revoke a token only by:

- Waiting for it to expire (so use short-lived tokens)
- Maintaining a revocation list (which is now state)
- Rotating the signing secret (which kills every token)

If revocation matters (it usually does), you need state somewhere. The "stateless" pitch is half-true at best.

## Where JWT shines

Despite the gotchas, JWT works well when:

- **Short-lived access tokens** (5-15 minutes) where you accept that revocation isn't immediate
- **Cross-service auth** where the verifier shouldn't have to call back to the issuer (RS256 + JWKS)
- **OIDC ID tokens** where the spec mandates JWT format

For session management with revocation needs, consider opaque tokens + a session store. JWT is a hammer, useful, but not for every nail.

## Recommended workflow

1. **Inspecting any token**: paste into [JWT Decoder](/encoding-tools/jwt-decoder/). 5 seconds, no software install.
2. **Implementing JWT verification**: pin the algorithm, set a clock tolerance, verify the signature with the public key (RS256) or shared secret (HS256).
3. **Debugging "Invalid signature"**: walk the checklist top to bottom. The bug is on it.
4. **Generating signing secrets**: `openssl rand -base64 32` for HS256. RSA key pair for RS256.
5. **Storing tokens client-side**: `httpOnly` cookies for browser apps, secure storage for mobile. Not localStorage.

JWT is one of those technologies where 80% of the docs are about how to use it and 20% are about what can go wrong. The 20% is where the bugs live, and where most blog posts stop short.

---

**Related tools on DevTools Online:**

- [JWT Decoder](/encoding-tools/jwt-decoder/), paste a token, see header + payload
- [Hash Generator](/security-tools/hash-generator/), for testing HMAC-SHA256 manually
- [Base64 Encode / Decode](/encoding-tools/base64-encode-decode/). JWT parts are Base64URL
- [Password Generator](/security-tools/password-generator/), for generating signing secrets
