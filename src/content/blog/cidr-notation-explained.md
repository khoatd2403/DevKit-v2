---
title: "CIDR Notation Explained: /24, /16, and the IP Math You Forgot"
slug: "cidr-notation-explained"
description: "What /24 actually means, how to subdivide a /16 into smaller networks, and the cheat sheet for cloud security groups, VPCs, and firewall rules."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - cidr
  - subnet mask
  - cidr calculator
  - ipv4 subnet
  - vpc cidr
tags:
  - Networking
  - Reference
cover: "/og-image.svg"
excerpt: "CIDR is just IP address ranges in shorthand. /24 means 256 addresses, /16 means 65,536, and the math for everything in between is the same boring power of two."
---

You're configuring a security group. The wizard asks for a "CIDR block." You type `0.0.0.0/0` because you remember that's "everything." You should be more specific — but with what? `192.168.1.0/24`? `/25`? `/26`? Why are these the only valid numbers?

This is the post that makes CIDR boring (in a good way).

## CIDR in one sentence

CIDR ("Classless Inter-Domain Routing") writes an IP range as `address/prefix-length`, where the prefix is how many leading bits are fixed and the rest is the host portion.

```
192.168.1.0/24
```

Means: the first 24 bits (`192.168.1`) are fixed; the last 8 bits can be anything. That's 256 addresses, from `192.168.1.0` to `192.168.1.255`.

That's all CIDR is. Everything else is consequences.

## The math, in three rules

### Rule 1: subtract from 32 to get host bits

```
host bits = 32 - prefix
addresses = 2 ^ host bits
```

| Prefix | Host bits | Addresses |
|---|---|---|
| /32 | 0 | 1 |
| /30 | 2 | 4 |
| /29 | 3 | 8 |
| /28 | 4 | 16 |
| /27 | 5 | 32 |
| /26 | 6 | 64 |
| /25 | 7 | 128 |
| /24 | 8 | 256 |
| /20 | 12 | 4,096 |
| /16 | 16 | 65,536 |
| /8 | 24 | 16,777,216 |
| /0 | 32 | all of IPv4 |

Memorize a few: `/24` is 256, `/16` is 65k, `/8` is 16M. Adjust by powers of two for everything else.

### Rule 2: usable addresses are usually `total - 2`

For most subnets, the first address is the **network address** (e.g., `192.168.1.0`) and the last is the **broadcast address** (`192.168.1.255`). Neither is assignable to a host.

So `/24` has 256 total addresses but **254 usable**. `/30` has 4 total, 2 usable. `/31` and `/32` are special exceptions used for point-to-point links.

This matters in cloud setups: AWS reserves additional addresses (network, gateway, DNS, future, broadcast) — typically the first 4 and last 1 of any subnet. So an AWS `/24` has 251 usable addresses.

[CIDR Calculator](/web-tools/cidr-calculator/) shows the breakdown for any prefix.

### Rule 3: address must align with the prefix

`192.168.1.5/24` is **not** a valid CIDR network — it's an IP within the `/24` network `192.168.1.0/24`. The address part of a CIDR block must have all host bits zeroed.

| Valid | Why |
|---|---|
| `192.168.1.0/24` | last 8 bits all zero ✅ |
| `192.168.0.0/16` | last 16 bits all zero ✅ |
| `10.0.0.0/8` | last 24 bits all zero ✅ |
| `192.168.1.5/24` | last 8 bits ≠ 0 ❌ |
| `10.0.0.0/7` | last 25 bits not all zero (10 = 00001010, bit 25 is 1) ❌ |

Tools like firewalls usually mask off invalid bits silently — they treat `192.168.1.5/24` as `192.168.1.0/24`. Don't rely on that. Write valid CIDR.

## Why prefixes go in increments

Prefixes are bit-aligned. You can have a `/24` (256 addresses) or a `/25` (128) but not "150 addresses" — there's no prefix length that gives you 150.

The granularity halves with each step:

```
/24 = 256
/25 = 128 (half of /24)
/26 = 64
/27 = 32
/28 = 16
```

To allocate "around 150 addresses," round up to the next valid size: `/24` (256). Or split the need across multiple subnets — but that's usually more pain than it's worth.

## Splitting a network into smaller subnets

You have `10.0.0.0/16` (65,536 addresses). You want to split it into 16 subnets. Each subnet has 65,536 / 16 = 4,096 addresses, which is `/20`:

```
10.0.0.0/20    = 10.0.0.0   – 10.0.15.255
10.0.16.0/20   = 10.0.16.0  – 10.0.31.255
10.0.32.0/20   = 10.0.32.0  – 10.0.47.255
...
10.0.240.0/20  = 10.0.240.0 – 10.0.255.255
```

The third octet jumps in increments of 16 because each `/20` covers 16 in the third octet (4096 / 256 = 16).

This is the kind of math you do once when designing a VPC, then never touch. Cloud consoles usually have a "split this CIDR into subnets" feature; learn the manual math once so you understand what it's doing.

## Common CIDR ranges to memorize

### Private IP ranges (RFC 1918)

```
10.0.0.0/8         16.7M addresses, big enterprise networks
172.16.0.0/12       1M addresses, often default for VPNs
192.168.0.0/16     65k addresses, home networks and small offices
```

If you're designing a VPC, pick from these. Don't reuse the same range as your home network or you'll have routing nightmares with VPN clients.

### Special-purpose ranges

```
0.0.0.0/0           "everything" (default route, "any" in firewalls)
0.0.0.0/32          "this host"
127.0.0.0/8         loopback (mostly 127.0.0.1, but the whole /8 is reserved)
169.254.0.0/16      link-local (DHCP failure)
224.0.0.0/4         multicast
```

`0.0.0.0/0` in a security group rule means "open to the world." Only use for public services (HTTP/HTTPS) on hardened servers.

### Cloud provider assigned

- **AWS VPC default**: `172.31.0.0/16`
- **GCP default**: `10.128.0.0/9` (split per region)
- **Azure default**: customizable, often `10.0.0.0/16`

Avoid these ranges in your own networks if you might peer with cloud VPCs later. The `10.0.0.0/16` overlap is a particularly common pain point.

## Subnet masks vs CIDR

Subnet masks and CIDR notations are equivalent:

| CIDR | Subnet mask |
|---|---|
| /8 | 255.0.0.0 |
| /16 | 255.255.0.0 |
| /24 | 255.255.255.0 |
| /25 | 255.255.255.128 |
| /26 | 255.255.255.192 |
| /27 | 255.255.255.224 |
| /28 | 255.255.255.240 |
| /29 | 255.255.255.248 |
| /30 | 255.255.255.252 |

Modern tooling uses CIDR. Older tools (ifconfig output, certain Cisco configs) use subnet masks. They're the same information, written differently.

## Common CIDR mistakes

### Using /32 in a security group rule for a single IP

```
allow inbound from 1.2.3.4/32
```

This is correct! `/32` means "exactly this address." Don't write just `1.2.3.4` — most validators want the prefix.

### Confusing /24 with class C

Pre-CIDR (1990s), IP classes (A, B, C) defined fixed prefixes:

- Class A = `/8`
- Class B = `/16`
- Class C = `/24`

CIDR replaced classes in 1993. Modern networking is class-less. If you hear someone say "class C," they probably mean `/24`. The class system is gone except in very old docs and equipment.

### Overlap between security groups

You allow `10.0.0.0/16` in one rule and `10.0.5.0/24` in another. The first rule already covers the second. Most cloud providers warn about this; it's not wrong, just redundant.

### Forgetting that /31 has 0 usable addresses (or 2, depending on RFC)

RFC 3021 (2000) says `/31` is valid for point-to-point links and both addresses are usable (no broadcast). Older equipment treats `/31` as having 0 usable hosts. In modern setups, `/31` works for router-to-router links.

### Using /0 because "we'll figure it out later"

`0.0.0.0/0` in a security group rule means anyone on the internet can hit that port. It's the most common cause of unintentional public exposure. Always be specific:

- For office traffic: your office's public IP `/32`
- For corp VPN: VPN's CIDR
- For Cloud-only: VPC CIDR

## Recommended workflow

1. **Designing a VPC**: pick a `/16` from RFC 1918, leave room to grow. Avoid overlaps with future peering targets.
2. **Splitting subnets**: usually `/24` or `/22` for app subnets. Use [CIDR Calculator](/web-tools/cidr-calculator/) to verify ranges.
3. **Security group rules**: be specific. `/32` for individual hosts, `/16` for VPC-internal, `/0` only for public services.
4. **Reading firewall logs**: check that source IPs match the CIDR rule that allowed them.
5. **Migrating old "class C" docs**: replace mental model with prefix length. The math is the same, the language is just modern.

CIDR is one of those topics where the boring foundation pays off forever. Twenty minutes of "I get it" beats years of guessing.

---

**Related tools on DevTools Online:**

- [CIDR / IP Calculator](/web-tools/cidr-calculator/) — paste a CIDR, see range, mask, host count
- [DNS Lookup](/web-tools/dns-lookup/) — for verifying which IP a hostname resolves to
- [IP Geolocation](/web-tools/ip-lookup/) — see where an IP is located
- [HTTP Request Builder](/web-tools/http-request-builder/) — test connectivity to specific IPs
