---
title: "MD5 Is Dead. SHA-256, SHA-512, BCrypt. Picking the Right Hash for the Job"
slug: "md5-sha256-bcrypt-which-hash"
description: "Hashes for passwords, hashes for integrity, hashes for deduplication, all different requirements, all different algorithms. Here's the matrix."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - md5
  - sha-256
  - sha-512
  - bcrypt
  - password hashing
  - file integrity hash
tags:
  - Security
  - Crypto
  - Comparison
cover: "/og-image.svg"
excerpt: "MD5 still has uses in 2026. Hashing passwords isn't one of them. Pick the algorithm based on what you're protecting against, collisions, brute force, or just integrity."
---

"MD5 is broken, use SHA-256" gets repeated like scripture. It's also wrong half the time it's said. MD5 is fine for cache keys, file deduplication, and checksums against transmission errors. SHA-256 is wrong for password storage. The "use this, never that" rules of thumb skip the actual question, which is: **what are you protecting against?**

The honest answer to "which hash should I use" depends on whether you're worried about (a) random bit-flips, (b) someone crafting a malicious file with the same hash as a benign one, or (c) someone with a GPU farm trying to brute-force passwords from a leaked database. Different threats, different algorithms. Below is the matrix that actually maps to those threats.

## TL;DR matrix

| What are you doing? | Use | Don't use |
|---|---|---|
| Hashing passwords | **bcrypt**, **argon2**, **scrypt** | MD5, SHA-anything |
| Verifying file integrity (post-download) | **SHA-256**, **SHA-512** | MD5 (collisions exist) |
| Deduplicating files (cache key) | MD5 or SHA-256 | — (both fine) |
| HMAC for API signatures | **SHA-256** in HMAC mode | MD5 (deprecated in HMAC) |
| Cryptographic commitments | **SHA-256** or **SHA-3** | MD5, SHA-1 |
| Quick hash for non-security use | **xxHash**, **CityHash** | (cryptographic hashes are overkill) |

The rest is justification.

## The categories of hash

There are three things people call "hashing" that are actually different:

### 1. Cryptographic hashes (SHA-256, SHA-512, BLAKE3)

Designed to be fast, irreversible, and collision-resistant. Use for:

- **Integrity checks**: does this download match what I expected?
- **Commitments**: I won't reveal X yet, but here's its hash to prove it later.
- **HMAC**: message authentication.
- **Block chains**: content addressing.

### 2. Password hashes (bcrypt, argon2, scrypt)

Designed to be **slow**: slow enough that brute-forcing is impractical even with a GPU farm. They use salts, iteration counts, and (for argon2 and scrypt) memory hardness.

Use for:

- **Storing passwords** in a database. That's it. Don't reach for these for anything else.

### 3. Non-cryptographic hashes (xxHash, MurmurHash)

Designed for speed in hash tables and dedup keys. **Not collision-resistant for adversaries**: but very fast for honest workloads.

Use for:

- **Hash tables**, **bloom filters**, **sharding**.

If you mix these up, say, use SHA-256 for password storage, or xxHash for integrity, you get a system that's correct in the abstract but wrong for your threat model.

## Why MD5 is dead (for security)

MD5 was state of the art in 1992. By 2005, researchers could generate two different files with the same MD5 hash on a laptop. Today, you can do it on your phone in seconds. **This is called a collision attack**, and it has consequences:

- An attacker can produce a malicious file that has the same MD5 as a benign one. Any system trusting MD5 for "this is the same file" is bypassable.
- HMAC-MD5 is theoretically still secure against forgery, but no one builds new HMAC systems around MD5.

What MD5 is still fine for in 2026:

- **Cache keys**: collisions happen by accident roughly never; for cache invalidation, fine.
- **Checksums against transmission errors**: random bit flips, fine.
- **Internal dedup IDs**: if no adversary can craft inputs.

What it is **not** fine for: passwords, signatures, downloads from untrusted sources, anything where someone might benefit from a collision.

## Why SHA-256 is the default cryptographic hash

SHA-256 is part of the SHA-2 family. It's:

- **Standardized** (NIST, FIPS 180-4)
- **Fast on modern CPUs** (~500 MB/s on a 2024 laptop, faster with hardware acceleration)
- **Collision-free in practice**: no real attack has been published
- **Universally supported**: every language, every platform

SHA-512 is essentially the same algorithm with larger internal state. It's slightly faster than SHA-256 on 64-bit machines (because of 64-bit operations) and slightly slower on 32-bit. The output is twice as long. Pick SHA-256 unless you specifically need 512 bits (rare).

[Hash Generator](/security-tools/hash-generator/) supports MD5, SHA-1, SHA-256, SHA-512, and BCrypt, paste a string and get all of them at once.

## Why bcrypt is the default for passwords

bcrypt has been "the answer" for password hashing since 1999 and remains so in 2026, despite newer competitors.

What it does:

1. Generates a random salt (16 bytes).
2. Runs a deliberately slow function (Blowfish-based) for `2^cost` iterations.
3. Outputs a string that includes the cost, salt, and hash:

```
$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
^^  ^^   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
algo cost   salt + hash
```

The cost factor makes bcrypt *tunable*. Cost 12 (default in most libraries) takes ~250ms per hash on modern hardware. That's fast enough for users at login, slow enough that a GPU brute-force takes years.

Bump the cost as hardware gets faster. Most teams settle on:

- **Cost 12** for general apps
- **Cost 14** for high-value targets (banking, healthcare)
- **Cost 10** if you have very high login throughput and other defenses

Try [bcrypt online](/security-tools/bcrypt/) to see what a real bcrypt hash looks like.

## bcrypt limitations

bcrypt has two well-known issues:

- **72-byte limit**: any password longer than 72 bytes is silently truncated. If your "password" is a passphrase or a long random string, this matters. Workaround: pre-hash with SHA-256 and Base64 the result, then bcrypt that.
- **Not memory-hard**: GPU brute-force is faster against bcrypt than against argon2 or scrypt because GPUs do many parallel hash computations. For very high-value targets, **argon2id** is preferred.

For new systems in 2026, **argon2id is arguably the better default**. We've written a [direct comparison](/blog/bcrypt-vs-argon2/). bcrypt remains the safe choice for stability, argon2 is slightly newer and library support, while widespread, isn't quite as universal.

## Salts: yes, you need them. No, you don't generate them.

A **salt** is random data added to the password before hashing. It prevents two users with the same password from getting the same hash, and defeats precomputed rainbow tables.

If you're using bcrypt or argon2: **the library handles salts for you**. Don't generate one yourself, don't store it separately. The full hash output (including salt) goes in one column.

If you're using SHA-256 for passwords (you shouldn't, but): generate a random 16-byte salt per user, prepend to the password, hash. Store salt + hash together.

## Hash output formats

The same hash can be presented multiple ways. SHA-256 of `"hello"`:

- **Hex**: `2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824`
- **Base64**: `LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=`
- **Base64URL**: `LPJNul-wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ`
- **Raw bytes**: 32 bytes of binary

These are all the same hash, encoded differently. When comparing hashes from two systems, make sure they're using the same encoding before deciding they're "different."

## Performance, roughly

Throughput for hashing a 1KB string on a 2024 M1 Mac:

| Algorithm | Hashes per second |
|---|---|
| MD5 | ~500,000 |
| SHA-256 | ~250,000 |
| SHA-512 | ~300,000 |
| BLAKE3 | ~1,000,000 |
| bcrypt (cost 12) | ~4 |
| argon2id (m=64MB, t=3) | ~3 |

Note the cliff: cryptographic hashes are millions of times faster than password hashes. This is **by design**. A password hash should be slow because the user only does it once per login, but a brute-forcer has to do it billions of times.

## Recommended workflow

1. **Storing user passwords**: bcrypt (cost 12+) or argon2id. Library generates the salt. Store the entire output string.
2. **Verifying file integrity**: SHA-256. Most package registries publish SHA-256 hashes.
3. **API request signing**: HMAC-SHA256 with a per-client secret.
4. **Quick "is this the same"**: SHA-256 (or MD5 if not adversarial).
5. **Hash table internals**: xxHash64, faster than cryptographic, fine for non-adversarial inputs.

The mistake: using a cryptographic hash for passwords. SHA-256 is too fast. A modern GPU does 10 billion SHA-256 hashes per second. Even with a salt, your users' passwords aren't safe under SHA-256. Always use a password-specific algorithm.

For ad-hoc work, [Hash Generator](/security-tools/hash-generator/) and [bcrypt](/security-tools/bcrypt/) both run in your browser, no input leaves the page.

---

**Related tools on DevTools Online:**

- [Hash Generator](/security-tools/hash-generator/). MD5, SHA-1, SHA-256, SHA-512 in one place
- [bcrypt](/security-tools/bcrypt/), generate and verify bcrypt hashes
- [Password Generator](/security-tools/password-generator/), for generating high-entropy inputs
- [HMAC Generator](/security-tools/hash-generator/), for API signing
