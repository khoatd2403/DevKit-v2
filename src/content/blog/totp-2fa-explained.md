---
title: "TOTP and 2FA: How 6-Digit Codes That Refresh Every 30 Seconds Work"
slug: "totp-2fa-explained"
description: "TOTP isn't magic. It's HMAC-SHA1 of the current 30-second timestep, truncated to 6 digits. Here's the algorithm, the failure modes, and why TOTP stays relevant in the passkey era."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - totp
  - 2fa
  - rfc 6238
  - authenticator app
  - time-based one-time password
tags:
  - Security
  - Crypto
  - Tutorial
cover: "/og-image.svg"
excerpt: "TOTP looks like magic — six digits that match between your phone and the server, refreshing every 30 seconds. The actual algorithm fits in 20 lines of code, and the failure modes are surprisingly mundane."
---

You scan a QR code with your authenticator app. From then on, the app spits out a fresh 6-digit number every 30 seconds, and the website accepts only the current one. Different sites have different numbers. The numbers somehow match between the server's expectations and your phone's display, even with no internet connection.

This is TOTP — Time-based One-Time Password, RFC 6238. The algorithm is straightforward once you've seen it. Here's the whole thing.

## The algorithm in 20 lines

```js
import crypto from 'node:crypto'

function totp(secret, time = Date.now()) {
  const step = 30  // seconds per code
  const digits = 6
  
  // Counter: which 30-second timestep are we in?
  const counter = Math.floor(time / 1000 / step)
  
  // Convert counter to 8-byte big-endian buffer
  const buf = Buffer.alloc(8)
  buf.writeBigInt64BE(BigInt(counter))
  
  // HMAC-SHA1 of the counter with the shared secret
  const hmac = crypto.createHmac('sha1', secret).update(buf).digest()
  
  // Dynamic truncation: pick 4 bytes from the HMAC
  const offset = hmac[hmac.length - 1] & 0x0F
  const code = (
    ((hmac[offset]     & 0x7F) << 24) |
    ((hmac[offset + 1] & 0xFF) << 16) |
    ((hmac[offset + 2] & 0xFF) << 8)  |
    ((hmac[offset + 3] & 0xFF))
  ) % (10 ** digits)
  
  return code.toString().padStart(digits, '0')
}
```

That's the entire RFC 6238 algorithm. Every authenticator app is just this code with a UI on top.

## What's happening, step by step

1. **Both sides know a shared secret** (32+ bytes, Base32-encoded). This is set up once when you scan the QR code.
2. **Both sides compute the current 30-second timestep** — Unix time divided by 30, rounded down. At 12:00:00 UTC the counter is `1715000000 / 30 = 57166666`. Thirty seconds later it's `57166667`.
3. **Both sides HMAC-SHA1 the counter with the secret**, producing a 20-byte output.
4. **Dynamic truncation** picks 4 bytes from the HMAC and clamps them to 6 digits.
5. **The user sees** the 6-digit number. The server computes the same number for the same timestep. If they match, the user is authenticated.

The trick is that **the secret is never transmitted**. Only the derived 6-digit number is shared, and it's only valid for 30 seconds.

## Why HMAC-SHA1 specifically?

RFC 6238 is from 2011. SHA1 was already known to be weakening, but HMAC-SHA1 (which is different from raw SHA1 and not affected by SHA1's collision attacks) was still secure. Most implementations stick with HMAC-SHA1 for compatibility.

Some authenticators support HMAC-SHA256 and HMAC-SHA512 (bigger output, same algorithm). They're slightly more future-proof. The QR code's `algorithm` parameter specifies which.

The math doesn't care which hash. It's the protocol convention that's stuck.

## The QR code format

When you scan a 2FA QR code, it's an `otpauth://` URI:

```
otpauth://totp/Example:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example&algorithm=SHA1&digits=6&period=30
```

Decoded:

- **`totp/`** — type (vs `hotp` for counter-based)
- **`Example:alice@example.com`** — display name
- **`secret=`** — Base32-encoded shared secret
- **`issuer=`** — service name (helps the app group entries)
- **`algorithm=`**, **`digits=`**, **`period=`** — usually defaults

You can paste a secret into [TOTP / 2FA Generator](/crypto-tools/totp-generator/) to see the live code, useful for testing or transferring to a new phone.

## Common failure modes

### Clock skew

Your phone's clock is 30 seconds off. The server expects the current code, you give it the previous code, login fails.

Fix: most servers accept ±1 timestep (60 seconds total). Some accept ±2 (90 seconds). If your codes consistently fail, check `time.is` or your phone's NTP settings.

### Rate limiting

Sites rate-limit TOTP attempts to prevent brute-forcing. 6-digit codes have only 1 million possibilities — without rate limiting, a brute-forcer would crack any TOTP in ~10 seconds at 100k attempts per second. Rate limits typically: 5 attempts per minute, then lockout.

### Replay within the timestep

If an attacker watches you type a TOTP code and races to use it within the 30-second window, they can. TOTP doesn't prevent replay during a window; rate-limited attempts and HTTPS make it hard, but not impossible.

WebAuthn / FIDO2 don't have this issue — each authentication is challenged with a unique nonce.

### Lost phone

Without backup codes, losing the phone with the authenticator app means losing access. Always print or save backup codes when you set up TOTP. Most sites give you 8-10 single-use backup codes.

### Multiple devices

If you want TOTP on your phone AND iPad, scan the QR code with both before completing setup. After enrollment, you can't add more devices unless the service offers a "show secret" feature (Google does, GitHub doesn't).

For sync, modern authenticator apps (1Password, Authy, Bitwarden, Apple Passwords) sync TOTP secrets via cloud, encrypted. Google Authenticator finally added this in 2023.

## TOTP vs SMS 2FA

SMS 2FA is **the worst form of 2FA still in use**. SIM-swap attacks have been a documented attack vector since 2018. Phishing kits intercept SMS in real time. NIST has been deprecating SMS as a 2FA factor since 2017.

TOTP is significantly stronger:

- No SIM swap attack vector
- Works offline (the server-side accepts your code without internet on your end)
- Free (no SMS cost for the service)
- The secret never leaves your device after enrollment

If a site offers TOTP, prefer it over SMS. If the site only offers SMS, push them to add TOTP — many services have added it after user feedback.

## TOTP vs WebAuthn / Passkeys

WebAuthn (and its sibling, passkeys) is **better than TOTP** for sites that support it. Reasons:

- **Phishing-proof** — the authenticator binds to the origin (`example.com`), so a phishing site at `example.evil.com` can't trick you.
- **No code typing** — biometric or PIN unlocks the device, signs the challenge.
- **Per-site keys** — different keys for different sites, no correlation.

TOTP is still the best 2FA when:

- The site doesn't support WebAuthn (most non-tech sites)
- You want a portable second factor across devices
- You're sysadmin'ing legacy stuff

In 2026, the layered approach is: passkeys where supported, TOTP everywhere else, no SMS unless forced.

## Implementation tips for sites adding TOTP

If you're adding TOTP to your application:

- **Library** — `otpauth` (JS), `pyotp` (Python), `passwordless-totp` (.NET). Don't roll your own; the algorithm is short but the edge cases (encoding, timing) are real.
- **Allow ±1 timestep tolerance**, more if you have evidence of clock drift in your user base.
- **Rate-limit code attempts** — 5 per minute per user is common.
- **Generate backup codes** at enrollment and require the user to acknowledge they've saved them.
- **Provide a "show QR / show secret" option** so users can move to a new phone or add a second device.
- **Verify before enabling** — make the user enter a current code as part of enrollment, so a typo'd secret doesn't lock them out.

A 32-byte (256-bit) random secret is plenty. Encode as Base32 for the QR code.

## What the user sees vs what's happening

| What the user sees | What's actually happening |
|---|---|
| Codes that "refresh" every 30 seconds | The counter increments; HMAC produces a different output |
| "Magic" sync between phone and server | Both compute HMAC-SHA1 of the same counter with the same secret |
| 6 digits | The HMAC's 4-byte truncation, modulo 10^6 |
| 60-second tolerance | The server checks ±1 timestep |
| Backup codes | Pre-generated single-use random strings stored separately |

Once you see the algorithm, the magic disappears. It's just HMAC + truncation + modular arithmetic.

## Recommended workflow

1. **Enable 2FA** on every account that supports it. Use TOTP, not SMS.
2. **Use an authenticator app that syncs** — 1Password, Bitwarden, Apple Passwords. Single phone = single point of failure.
3. **Save backup codes** at enrollment. Print them, save in your password manager, both.
4. **For your own apps**: add TOTP support. Library, ±1 tolerance, rate limiting, backup codes. Test with [TOTP / 2FA Generator](/crypto-tools/totp-generator/) before deploying.
5. **For high-value accounts** (email, banking): switch to passkeys / WebAuthn where available.

TOTP is one of those technologies that makes the user's experience feel magical and the implementation feel boring. Both are correct.

---

**Related tools on DevTools Online:**

- [TOTP / 2FA Generator](/crypto-tools/totp-generator/) — paste a secret, see the live code
- [Hash Generator](/security-tools/hash-generator/) — for HMAC-SHA1 / SHA-256 testing
- [Password Generator](/security-tools/password-generator/) — for generating TOTP shared secrets
- [QR Code Generator](/generator-tools/qr-generator/) — for creating otpauth:// QR codes
