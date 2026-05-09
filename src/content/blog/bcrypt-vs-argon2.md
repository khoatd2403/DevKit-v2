---
title: "BCrypt vs Argon2: Password Hashing in 2026"
slug: "bcrypt-vs-argon2"
description: "Argon2id won the Password Hashing Competition in 2015, but bcrypt is still the most-deployed password hash in the world. Here's the actual comparison and when to switch."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - bcrypt vs argon2
  - argon2id
  - password hashing 2026
  - memory hard hash
  - migrate password hash
tags:
  - Security
  - Crypto
  - Comparison
cover: "/og-image.svg"
excerpt: "Both algorithms are good. The choice in 2026 is less about cryptographic merit and more about library maturity, parameter tuning, and whether you're willing to migrate an existing user base."
---

If you read security blogs from 2015 to 2020, you'd think bcrypt was on the way out and argon2id was the obvious successor. It has been a decade. bcrypt is still everywhere. Argon2 is widespread but not universal. Both are good. The actual decision is more nuanced than "argon2 won."

## Why argon2 was supposed to replace bcrypt

In 2013, the Password Hashing Competition started. Goals:

- Resist GPU and ASIC parallelism (memory-hardness)
- Tunable along multiple axes (CPU, memory, parallelism)
- Modern cryptographic foundations

In 2015, **argon2** won. There are three variants:

- **argon2d**: max GPU resistance, but vulnerable to side-channel attacks
- **argon2i**: side-channel resistant, but weaker against GPUs
- **argon2id**: hybrid, recommended default

The pitch was clear: bcrypt is from 1999, predates GPU-based attacks, and isn't memory-hard. Argon2id is purpose-built for the 2020s. Migrate.

## Why bcrypt didn't disappear

A few reasons:

1. **Universal library support**. Every language has a battle-tested bcrypt library. Argon2 has good libraries, but not as universal — and the parameter choices (memory, iterations, parallelism) require thought.
2. **Stable parameter choices**. bcrypt has one tunable parameter (cost). Argon2 has three. More flexibility = more ways to misconfigure.
3. **Legacy migration**. Most companies have millions of bcrypt'd passwords. Migrating means dual-hashing during the transition or waiting for users to re-login. Often nobody prioritizes it.
4. **bcrypt is "good enough"**. At cost 12, brute-forcing a single bcrypt password takes years on consumer hardware, decades on a GPU. The threat model that distinguishes argon2 from bcrypt is "billion-dollar attacker with custom ASICs," and most apps don't have that adversary.

## What memory-hardness actually means

bcrypt does iterations of a CPU-bound calculation. GPUs do many calculations in parallel — a GPU with 10,000 cores can attempt 10,000 bcrypt cracks at once.

Argon2 deliberately uses **a lot of memory** (64MB+ per hash). GPU memory is fast but limited; you can't fit 10,000 64MB hashes simultaneously. The parallelism collapses, and argon2 becomes much harder to brute-force per dollar of attacker hardware.

This matters most when:

- You're storing passwords for high-value targets (financial, healthcare, government)
- An attacker is sophisticated enough to build custom hardware
- You expect long-lived breaches — even if your DB leaks, attackers don't get every hash

For typical web apps, bcrypt cost 12 is plenty. Argon2 is "more future-proof" but the future-proof gap is small for most threat models.

## Parameters: bcrypt is simpler

### bcrypt

```js
import bcrypt from 'bcrypt'

const hash = await bcrypt.hash(password, 12)  // cost 12
const ok = await bcrypt.compare(password, hash)
```

One parameter: cost. Default 10, recommended 12 in 2026, bump to 14 for high-value systems. Higher cost = more time per hash.

### Argon2

```js
import argon2 from 'argon2'

const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536,    // 64 MB
  timeCost: 3,          // 3 iterations
  parallelism: 4,       // 4 threads
})
```

Four parameters (type, memory, time, parallelism). OWASP's 2026 recommendation:

- **memoryCost**: 47104 KiB (≈46 MB) minimum for argon2id
- **timeCost**: 1 (yes, just 1 — memory does most of the work)
- **parallelism**: 1
- For high-value: 65536 KiB, t=3, p=4

If you set `memoryCost` too low (e.g., 1024 KiB), you've got argon2 with bcrypt-class security and slower runtime. Don't.

## Performance comparison

Approximate hash time on a 2024 M1 Mac, OWASP-recommended params:

| Algorithm | Time per hash | Memory |
|---|---|---|
| bcrypt (cost 10) | ~60ms | <1 KB |
| bcrypt (cost 12) | ~250ms | <1 KB |
| bcrypt (cost 14) | ~1s | <1 KB |
| argon2id (m=46MB, t=1) | ~150ms | 46 MB |
| argon2id (m=64MB, t=3) | ~500ms | 64 MB |

For a login endpoint, target ~250-500ms per hash. Faster than that and brute-forcers have an easier job. Slower than that and your users notice login lag.

The memory column is the interesting part. bcrypt fits in CPU L1/L2 cache; argon2 deliberately doesn't. That's the GPU-resistance baked in.

## Migration: bcrypt → argon2

If you have an existing bcrypt user table and want to move to argon2:

### Strategy 1: Migrate on next login

```js
async function login(email, password) {
  const user = await db.users.findOne({ email })
  
  if (user.hashAlgo === 'bcrypt') {
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return null
    
    // Re-hash with argon2 since we have the plain password right now
    const newHash = await argon2.hash(password, ARGON2_PARAMS)
    await db.users.update(user.id, {
      passwordHash: newHash,
      hashAlgo: 'argon2'
    })
    
    return user
  }
  
  // argon2 path
  const ok = await argon2.verify(user.passwordHash, password)
  return ok ? user : null
}
```

This is clean. Users are transparently upgraded as they log in. Inactive users stay on bcrypt forever, which is fine — bcrypt at cost 12 is still secure.

### Strategy 2: Wrap bcrypt in argon2

You can argon2-hash the bcrypt hash:

```
new_hash = argon2(bcrypt(password))
```

This lets you migrate the entire DB without users logging in. It's a real technique used by some companies. Drawback: now both bcrypt's 72-byte limit AND argon2's params apply, and the analysis is more complex.

Most teams use strategy 1. It's boring, takes time, but is straightforward.

## When to use which in 2026

**Use bcrypt when:**

- Existing system, no compelling reason to migrate
- Library support in your stack is uneven for argon2
- Your team isn't confident tuning argon2 parameters
- Threat model doesn't include sophisticated GPU attackers

**Use argon2id when:**

- New system from scratch
- High-value passwords (finance, healthcare, government)
- Compliance requires "modern" password hashing (some recent standards mention argon2 explicitly)
- You're comfortable tuning memory parameters

**Use scrypt when:**

- You're already using it (don't migrate scrypt → argon2 unless there's a reason)
- Specific compatibility requirement (Bitcoin uses scrypt-like KDF, etc.)

**Don't use:**

- PBKDF2 except for FIPS-required systems (it's not memory-hard)
- SHA-2 with salt (insufficiently slow against GPUs)
- Plain MD5/SHA-1 (broken)
- Anything you wrote yourself

## Verifying parameters in practice

A real bcrypt hash looks like:

```
$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
```

The `$12$` is the cost. You can read it from the hash itself. If you find `$2b$08$...` in your DB, that's cost 8 — too low for 2026, upgrade those on next login.

Argon2 hashes encode all parameters:

```
$argon2id$v=19$m=65536,t=3,p=4$<salt>$<hash>
```

`m=65536` (64MB), `t=3` (iterations), `p=4` (parallelism). If params are too low for current standards, re-hash on next login.

You can generate and inspect both formats in [bcrypt online](/security-tools/bcrypt/) and a similar argon2 tool.

## Common mistakes

### Pre-hashing with SHA-256, then bcrypt

To work around bcrypt's 72-byte limit:

```js
const sha = crypto.createHash('sha256').update(password).digest('base64')
const hash = await bcrypt.hash(sha, 12)
```

This is **safe** for security but creates a permanent dependency. If you ever migrate to argon2, you have to re-apply the same pre-hash, or migrate cost is even higher. Better: use argon2 from day one if your password constraints exceed 72 bytes.

### Storing parameters separately

Don't. Store the entire hash output (`$2b$12$...` or `$argon2id$...`). It contains the algo, version, params, and salt. Keep them together.

### Not bumping cost over time

Every 18 months or so, hardware gets fast enough that the previous cost is too low. Plan to re-hash on login when you bump the cost. The migration code is the same as a bcrypt → argon2 migration, just simpler.

## Recommended workflow

1. **New system**: argon2id with OWASP 2026 params (m=65536, t=3, p=4). Use a battle-tested library.
2. **Existing bcrypt system**: stay, bump cost to 12+ if not already. Migrate to argon2 only if compliance or threat model warrants.
3. **Migration**: re-hash on next login. Inactive users stay on bcrypt; that's fine.
4. **Test parameters before deploy**: hash latency should be 250-500ms in production. Tune accordingly.

The takeaway: argon2id is the better algorithm. bcrypt is still safe. The cost-of-migration vs. benefit-of-migration calculation is what's keeping bcrypt alive in 2026, and that's not a bad tradeoff.

---

**Related tools on DevTools Online:**

- [bcrypt](/security-tools/bcrypt/) — generate and verify bcrypt hashes
- [Hash Generator](/security-tools/hash-generator/) — for SHA-2 family
- [Password Generator](/security-tools/password-generator/) — high-entropy passwords as input
- [Read more on hash selection](/blog/md5-sha256-bcrypt-which-hash/) — when to use which
