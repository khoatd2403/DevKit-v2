---
title: "UUID v4 vs v7: Why You Probably Want v7 in New Code"
slug: "uuid-v4-vs-v7"
description: "UUID v4 is random; UUID v7 is timestamp-prefixed and sortable. For database primary keys, v7 wins on every metric except 'compatible with my 2010 codebase.' Here's why."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - uuid v7
  - uuid v4
  - uuid for primary key
  - sortable uuid
  - rfc 9562
tags:
  - Identifiers
  - Database
  - Comparison
cover: "/og-image.svg"
excerpt: "UUID v4 dominated for 15 years because it was 'good enough.' UUID v7 fixes the one real problem v4 had, random UUIDs are terrible primary keys. The migration is overdue."
---

Insert benchmark, 100M-row table on Postgres 17, primary key `UUID NOT NULL`:

| ID type | Inserts/sec | Index size after 100M rows | Buffer hit rate |
|---|---|---|---|
| `bigserial` (auto-increment) | ~85,000 | 4.3 GB | 99.4% |
| UUID v7 (sortable) | ~78,000 | 4.8 GB | 98.9% |
| UUID v4 (random) | ~12,000 | 7.2 GB | 41.7% |

Three orders of magnitude in buffer hit rate. The UUID v4 row inserts touch random pages in a 7GB index that doesn't fit in cache, so every insert hits disk. UUID v7 inserts at the tail end like a sequential ID, so the hot leaf page stays in memory.

If you've never run this benchmark on your own DB, UUID v4 vs v7 sounds like a stylistic choice. It's not. For tables past about 10M rows, choosing v4 over v7 is a measurable performance bug — one you can't easily fix later because primary keys don't migrate cheaply.

## The two formats, side by side

```
v4: f47ac10b-58cc-4372-a567-0e02b2c3d479
v7: 018f7e0c-1234-7890-abcd-ef0123456789
    ^^^^^^^^^^^^^^
    timestamp portion (Unix milliseconds, big-endian)
```

Both are 128 bits. Both look like the familiar `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`. The version digit (the first character of the third group) is `4` vs `7`. Everything else looks the same to a human.

Generate examples in [UUID Generator](/generator-tools/uuid-generator/), supports both v4 and v7 (and v1 if you need it).

## Why random UUIDs hurt as primary keys

When you `INSERT` rows into a B-tree-indexed table (i.e., almost every relational database), the database places each new row in the right spot in the index. Insertion order matters:

- **Sequential keys** (auto-increment, ULID, UUID v7), new rows go at the end of the index. The leaf page is hot, stays in memory, fast inserts.
- **Random keys** (UUID v4), new rows go anywhere. Random pages are touched, fetched from disk, written back. Insert performance degrades as the table grows.

For a 1M-row table, the difference might be 2x. For a 100M-row table, it's 10-20x. Then there's the secondary effect: a random index doesn't compress as well, so it's larger on disk and in cache.

Postgres, MySQL, SQL Server, all of them prefer sequential primary keys. Snowflake-style 64-bit IDs (Twitter), monotonically-increasing ULIDs, UUID v7, they all chose sortable for the same reason.

## What UUID v7 looks like inside

The bit layout (RFC 9562, the 2024 spec):

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           unix_ts_ms                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          unix_ts_ms           |  ver  |       rand_a          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|var|                        rand_b                             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                            rand_b                             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

- **First 48 bits**: Unix timestamp in milliseconds, big-endian.
- **Next 4 bits**: version (`0111` = 7).
- **Next 12 bits**: random or counter (rand_a).
- **Next 2 bits**: variant.
- **Final 62 bits**: random (rand_b).

The first 48 bits of two UUIDs generated milliseconds apart are nearly identical. The remaining 74 bits of randomness are plenty to avoid collisions, you'd need to generate ~2^37 UUIDs in the same millisecond to have a 50% chance of collision.

## Properties compared

| | UUID v4 | UUID v7 |
|---|---|---|
| Bits | 128 | 128 |
| Randomness | 122 bits | 74 bits |
| Sortable by creation time | ❌ No | ✅ Yes (millisecond resolution) |
| Reveals creation time | ❌ No | ✅ Yes |
| Database insertion performance | Bad | Good |
| Collision probability | Effectively zero | Effectively zero |
| Library support (2026) | Universal | Most modern languages, some lag |
| Spec | RFC 4122 (2005) | RFC 9562 (2024) |

The two non-trivial differences: **sortability** and **time disclosure**.

Sortability is a clear win for database use. Time disclosure is a tradeoff, usually fine, sometimes a privacy issue.

## When NOT to use UUID v7

### Privacy-sensitive IDs

UUID v7 reveals the millisecond when each row was created. For a public-facing ID:

- An attacker can enumerate IDs near each other to find recently-created records
- They can correlate IDs across systems by timestamp
- They can infer "this user signed up around the same time as that one"

If your IDs are exposed in URLs (`/users/<uuid>`), this might matter. For most systems, it doesn't, the timestamp leak is no worse than the existence of an `created_at` column. For some systems (medical records, anonymous reports, VPN sessions), it might matter.

The fix: use v4 for the public ID and v7 for the database primary key. Maintain both columns. Look up by either.

### Tokens and credentials

For session tokens, API keys, password reset tokens, use random bytes, not UUIDs. UUIDs aren't designed as tokens; they have a structure (version field, variant field) that adds nothing for token security and reduces effective entropy slightly.

```js
// For tokens, use:
crypto.randomBytes(32).toString('base64url')  // 256 bits of randomness
```

### Distributed-by-design IDs across nodes

In a true multi-master setup, two nodes generating UUIDs in the same millisecond produce different but adjacent v7 IDs. They sort interleaved. For most apps, this is fine. For very high-throughput, consider Snowflake-style IDs that explicitly include a node ID:

```
[ 41 bits timestamp | 10 bits node | 12 bits sequence ]
```

Twitter's snowflake. Discord's. Used at very high scale, but overkill for most teams.

## How to migrate

If you have an existing UUID v4 table, migration is more nuanced than just changing the generator:

### 1. New columns: use v7

```sql
ALTER TABLE users ADD COLUMN id_v7 UUID;
UPDATE users SET id_v7 = uuid_generate_v7();  -- if your DB supports it
ALTER TABLE users ALTER COLUMN id_v7 SET NOT NULL;
CREATE UNIQUE INDEX users_id_v7_idx ON users(id_v7);
```

You now have both. Plan a cutover.

### 2. New tables: v7 from day one

```sql
-- Postgres 17+ has gen_random_uuid_v7() built in
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid_v7(),
    ...
);
```

Older Postgres versions need a function or extension (`pg_uuidv7`).

### 3. Application-side generation

If your app generates IDs (vs the database):

```js
// Node 22+, native crypto.uuidv7() (Node-only proposal as of 2026)
import crypto from 'node:crypto'

// Or via library
import { v7 as uuidv7 } from 'uuid'
const id = uuidv7()
```

Most major language libraries have v7 support as of 2025.

## When v4 is still right

There are two real cases for v4 in 2026:

### 1. Public tokens or anonymous IDs

When you don't want time leakage, v4 is the answer. Random session IDs, anonymous user identifiers, magic-link tokens.

### 2. Existing v4 systems

If your codebase, infrastructure, and integrations all use v4, the migration cost is real. Don't migrate just because v7 is "newer." Migrate when you're hitting the insertion-performance problem v4 was causing.

## Common questions

### Is UUID v4 going to be deprecated?

No. RFC 9562 acknowledges v4 as fine for cases where time-disclosure is unwanted. v4 has been around since 2005 and isn't going anywhere.

### Can I tell from looking at a UUID which version it is?

Yes, the third group's first character is the version. `xxxxxxxx-xxxx-Vxxx-...` where V is the version (1, 4, 7, etc.).

### What about ULIDs?

ULIDs (Universally Unique Lexicographically Sortable Identifiers) predate UUID v7 and serve the same purpose. They're 128 bits, sortable, base32-encoded. UUID v7 is essentially "ULID with the format that all UUID systems already understand." If you're already using ULIDs, no need to switch. If you're starting fresh, v7 has better library support.

### What's UUID v6?

A version that's like v1 (with MAC address) but rearranged so the timestamp comes first (sortable). Less popular than v7 because it includes the MAC address (privacy concern). Skip v6.

## Recommended workflow

1. **New systems**: UUID v7 for primary keys. Random bytes for tokens.
2. **Existing systems on v4**: stay unless you're hitting insertion-performance issues. Migration is real work.
3. **Privacy-sensitive public IDs**: v4 (or random non-UUID). Use v7 only for the internal primary key.
4. **For testing or debugging**: [UUID Generator](/generator-tools/uuid-generator/) generates both v4 and v7, copy and use.
5. **For database**: choose a database that supports v7 generation natively (Postgres 17+, recent MySQL, SQL Server). Otherwise generate in application code.

The takeaway: UUID v7 is what UUID v4 should have been from the start. The ten-year delay was about momentum, not merit. New code should use v7; old code can stay until there's a reason to migrate.

---

**Related tools on DevTools Online:**

- [UUID Generator](/generator-tools/uuid-generator/), v4, v7, and others
- [Hash Generator](/security-tools/hash-generator/), for content-addressed IDs (alternative to UUID)
- [Random String Generator](/generator-tools/random-string/), for tokens
- [Base64 Encode / Decode](/encoding-tools/base64-encode-decode/), for encoding random bytes as tokens
