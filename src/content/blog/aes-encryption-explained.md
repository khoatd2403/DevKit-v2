---
title: "AES Encryption Explained for Developers Who Don't Want a PhD in Math"
slug: "aes-encryption-explained"
description: "AES-256-GCM is the encryption you should reach for in 2026. What it does, why GCM and not CBC, and the small set of rules that keeps you out of trouble."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - aes encryption
  - aes-256
  - aes-gcm
  - cbc vs gcm
  - symmetric encryption
tags:
  - Security
  - Crypto
  - Tutorial
cover: "/og-image.svg"
excerpt: "AES is the symmetric encryption standard. AES-256-GCM is what you should reach for. The math is hard, the usage is short, half a dozen rules and you'll avoid the classic mistakes."
---

You need to encrypt some data. You read four blog posts. They mention AES, RSA, ChaCha20, ECDH, GCM, CBC, IV, nonce, salt, KDF, and HMAC. You close the tabs and go ask Slack.

The good news: in 2026, the answer for most "encrypt this small thing" problems is one specific combination — **AES-256-GCM**: and the rules for using it correctly fit on one page.

## What AES is

AES (Advanced Encryption Standard) is a symmetric cipher. Symmetric means the same key encrypts and decrypts. AES is the cipher; **how you use it** (the "mode of operation") is what changes between -GCM, -CBC, -CTR, etc.

The number after AES (128, 192, 256) is the key size in bits. **Use 256.** The performance difference between AES-128 and AES-256 is negligible on modern CPUs, and 256 gives you a wider security margin against future attacks.

The number after the dash is the mode. **Use GCM** (Galois/Counter Mode). It encrypts AND authenticates in one step. Most past mistakes (padding oracles, CBC bit-flipping) come from modes that only encrypt without authentication.

**AES-256-GCM** is the answer. Use this unless you have a specific reason not to.

## The minimum to encrypt safely

```js
import crypto from 'node:crypto'

function encrypt(plaintext, key) {
  const iv = crypto.randomBytes(12)  // 12 bytes is GCM standard
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ])
  
  const tag = cipher.getAuthTag()
  
  // Output: iv + tag + ciphertext (concatenated)
  return Buffer.concat([iv, tag, encrypted])
}

function decrypt(blob, key) {
  const iv = blob.subarray(0, 12)
  const tag = blob.subarray(12, 28)
  const ciphertext = blob.subarray(28)
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]).toString('utf8')
}
```

That's it. Four imports, two functions. Pass it a 32-byte key and a string. Get back a `Buffer`. Reverse the process to decrypt.

You can also paste a string into [AES Encrypt / Decrypt](/crypto-tools/aes-encrypt/) for one-off encryption, it does AES-256-GCM in your browser.

## The five rules

Get any of these wrong and you've got an insecure system that *looks* like it works.

### 1. The key must be high-entropy

A 256-bit AES key needs 256 bits of randomness. Don't:

- Use a passphrase as the key directly
- Use a hash of a passphrase as the key (insufficient)

Do:

```js
const key = crypto.randomBytes(32)  // 256 bits of CSPRNG randomness
```

If you must derive the key from a password (e.g., file encryption with a user passphrase), use a **KDF** like PBKDF2 or Argon2:

```js
const salt = crypto.randomBytes(16)
const key = crypto.pbkdf2Sync(password, salt, 600000, 32, 'sha256')
```

600,000 iterations of PBKDF2-SHA256 is OWASP's 2026 recommendation. Argon2id is even better. Save the salt with the encrypted output.

### 2. Never reuse an IV with the same key

This is the rule everyone breaks. The IV (initialization vector) doesn't need to be secret, but it must be **unique per encryption** under the same key. For AES-GCM, IV reuse is catastrophic, it leaks the plaintext.

```js
// ❌ WRONG: hardcoded IV
const iv = Buffer.from('aaaaaaaaaaaa')

// ❌ WRONG: incrementing counter without persistence — duplicates after restart
let counter = 0
const iv = Buffer.from(String(counter++).padStart(12, '0'))

// ✅ RIGHT: random per encryption
const iv = crypto.randomBytes(12)
```

GCM specifies 12-byte (96-bit) IVs. With random IVs, the chance of collision is ~2^-32 after 2^32 messages, fine for most apps, but if you encrypt billions of messages, switch to a counter-based deterministic IV with explicit storage.

### 3. Always check the auth tag

The 16-byte authentication tag is what makes GCM "authenticated." If an attacker modifies a single bit of the ciphertext, decryption fails with an exception. **Don't catch and ignore that exception.**

```js
try {
  const plaintext = decrypt(blob, key)
  // Use it
} catch (err) {
  // The data was tampered with. Reject the request. Log the event.
  return res.status(400).send('Invalid')
}
```

If you skip the tag check or set it incorrectly, GCM degrades to a non-authenticated cipher. You've got encryption without integrity, which is worse than no encryption.

### 4. Don't roll your own framing

The encrypted output needs to package: the IV, the tag, and the ciphertext. The example above concatenates them in a fixed order. That works, but be **strict**: define the format once and never change it without versioning.

A defensive pattern:

```
Format: [version byte][IV 12 bytes][tag 16 bytes][ciphertext]
```

If you ever need to change the algorithm or rotate keys, the version byte tells the decryptor what to expect.

### 5. Don't reach for asymmetric crypto unless you need it

RSA, ECDSA, ECDH, these are slow (1000x slower than AES) and have their own footguns. Use them only for key exchange or signatures. For "encrypt some data with a key both ends know," AES-GCM is faster, simpler, and safer.

The hybrid pattern is standard:

- Asymmetric (RSA or ECDH) to **exchange a session key**
- Symmetric (AES-GCM) to **encrypt the actual data**

This is how TLS, age, and most modern systems work.

## When to use AES-CBC

Almost never, in new code. CBC has issues:

- **No authentication built in**: pair with HMAC, or you're vulnerable to padding oracle attacks
- **Padding** required, opens attack surfaces
- **Slower than CTR/GCM** on modern hardware

You'll see AES-CBC in legacy code (TLS 1.0, older protocols, some older databases). Don't introduce it in new systems.

If you're stuck with CBC for compatibility, **always pair with HMAC** in encrypt-then-MAC order:

```
ciphertext = AES-CBC(plaintext, key1)
mac = HMAC-SHA256(iv + ciphertext, key2)
output = iv + ciphertext + mac
```

Verify the MAC **before** decrypting. Use separate keys for encryption and MAC.

## What about ChaCha20-Poly1305?

ChaCha20-Poly1305 is an alternative to AES-GCM with similar properties. It's faster than AES on platforms without AES-NI hardware acceleration (older mobile, some IoT). Modern x86 and ARM both have AES-NI, so AES-GCM is faster on real servers.

Both are good. If you're cross-platform and don't know what your low end is, ChaCha20-Poly1305 is the conservative choice. For 99% of server-side encryption, AES-256-GCM is fine.

## Common mistakes

### Encrypting with a password without a KDF

```js
// ❌
const key = Buffer.from(password.padEnd(32))
```

A short password is **not** a 256-bit key. Brute-forcing it takes seconds. Use PBKDF2 or argon2id with a salt and high iteration count.

### Storing the key next to the data

If the encryption key sits in the same database as the encrypted data, anyone with DB access has both. Use a separate key management system (AWS KMS, GCP KMS, HashiCorp Vault) or at minimum a separately-deployed config service.

### Forgetting to authenticate associated data

GCM has an "AAD" (additional authenticated data) field, extra data covered by the tag but not encrypted. Use it for context that should be tied to the ciphertext:

```js
cipher.setAAD(Buffer.from('user_id=42'))
```

Without AAD, an attacker could move ciphertext between contexts. With AAD, decryption fails if the context changes.

### Encoding raw binary as utf8

Encrypted output is binary. If you naively store it as a UTF-8 string, you've corrupted it. Use Base64, hex, or Buffer.

```js
// ❌ corrupts binary
db.insert({ data: ciphertext.toString('utf8') })

// ✅
db.insert({ data: ciphertext.toString('base64') })
```

## Recommended workflow

1. **Encrypting data at rest**: AES-256-GCM with a per-record IV. Store IV + tag + ciphertext together.
2. **Key management**: AWS/GCP KMS, HashiCorp Vault, or a separately-deployed config service. **Not** in the same database as the data.
3. **Password-based encryption**: PBKDF2 (600k iterations) or Argon2id to derive the key. Save the salt.
4. **Ad-hoc encryption**: paste into [AES Encrypt / Decrypt](/crypto-tools/aes-encrypt/) for one-off use. Browser-side, never sent to a server.
5. **Verify decryption catches tampering**: if your decrypt function silently returns plaintext when the tag is bad, you have a bug. Test it.

The cleanest mental model: **AES-256-GCM, random IV, store IV + tag with the ciphertext, fail closed on any error.** Most production encryption code that goes wrong gets one of those bullets wrong. Most that goes right gets all four.

---

**Related tools on DevTools Online:**

- [AES Encrypt / Decrypt](/crypto-tools/aes-encrypt/). AES-256-GCM in your browser
- [Hash Generator](/security-tools/hash-generator/), for HMAC and integrity checks
- [Password Generator](/security-tools/password-generator/), for generating high-entropy keys
- [Base64 Encode / Decode](/encoding-tools/base64-encode-decode/), for serializing ciphertext
