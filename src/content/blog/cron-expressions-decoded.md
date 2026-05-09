---
title: "Cron Expressions Decoded: Reading 0 0 * * * Without Cheat Sheets"
slug: "cron-expressions-decoded"
description: "What each of the five cron fields means, the special values that trip people up, and the modern alternatives. Quartz, systemd timers, k8s CronJobs, that smooth over cron's rough edges."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - cron expression
  - cron syntax
  - crontab
  - cron schedule
  - cron parser
tags:
  - Scheduling
  - Reference
cover: "/og-image.svg"
excerpt: "Cron is the scheduling syntax that survived 50 years because it's compact and ubiquitous. Once you know the five fields and three special characters, you can read any cron line at a glance."
---

Years ago, an oncall page woke me at 4am because a "daily at midnight" job had run twice. The cron line was `0 0 * * *`, the system clock was UTC, the box was healthy. It still ran twice. Took us most of the day to figure out: someone had set the server's TZ to America/Chicago in `/etc/profile`, and the daylight-saving fall-back hour repeats. Cron, doing exactly what it was told, fired at 1am CST, then fired again at 1am CST. We'd run the same idempotent-ish ETL twice, double-charged a few hundred customers, and spent the rest of the week refunding them.

I have a list of cron gotchas like that, accumulated from a decade of running scheduled jobs. The format itself is fifty years old and small enough to fit on a postcard. The traps in it are the kind that seem absurd until you've been bitten. This post is both: the format, in five fields and three special characters, plus every weird edge case I've collected since 2014.

## The five fields

```
*    *    *    *    *
│    │    │    │    │
│    │    │    │    └── day of week (0-7, Sunday = 0 or 7)
│    │    │    └─────── month (1-12)
│    │    └──────────── day of month (1-31)
│    └───────────────── hour (0-23)
└────────────────────── minute (0-59)
```

That's the entire format. Five fields, separated by whitespace, in the order minute → hour → day-of-month → month → day-of-week.

A `*` in any field means "every value." So `* * * * *` is "every minute, every hour, every day, every month, every day-of-week", i.e., every minute.

[Cron Parser](/datetime-tools/cron-parser/) decodes any cron expression into human-readable English and shows the next 10 fire times.

## Common patterns

```
0 0 * * *        Every day at midnight
0 9 * * *        Every day at 9:00 AM
0 9 * * 1-5      9:00 AM, Monday to Friday
*/5 * * * *      Every 5 minutes
0 */2 * * *      Every 2 hours, on the hour
0 0 1 * *        First day of the month at midnight
0 0 * * 0        Every Sunday at midnight
30 4 * * 6       4:30 AM every Saturday
0 12 * * MON-FRI Noon every weekday
```

The `*/N` syntax is "every N units." So `*/5` in the minute field is "every 5 minutes" (i.e., 0, 5, 10, ..., 55).

## The four special values

### `*`, every

`* * * * *` runs every minute. `0 * * * *` runs at minute 0 of every hour.

### `,`, list

`0 9,12,15 * * *` runs at 9 AM, 12 PM, and 3 PM. Use commas to specify discrete values.

### `-`, range

`0 9-17 * * *` runs every hour from 9 AM to 5 PM. Useful for business-hours jobs.

### `/`, step

`*/15 * * * *` runs at minutes 0, 15, 30, 45, every 15 minutes. Steps work with ranges too: `0-30/5 * * * *` runs at minutes 0, 5, 10, 15, 20, 25, 30.

## Day of week is annoying

Cron has two ways to specify days:

- `0` or `7` = Sunday
- `1` = Monday
- `6` = Saturday
- Or named: `SUN`, `MON`, `TUE`, `WED`, `THU`, `FRI`, `SAT`

Both work, but the numbering differs from ISO 8601 (which has Monday=1). For readability, use names:

```
0 9 * * MON-FRI     # business hours weekdays
0 9 * * SAT,SUN     # weekends
```

### The day-of-month / day-of-week interaction

This is the most confusing cron behavior. If you specify **both** day-of-month and day-of-week (neither is `*`), they are **OR'd**, not AND'd:

```
0 0 1 * MON
```

You might expect "midnight on the 1st of the month, but only if the 1st is a Monday." Cron interprets this as "midnight on the 1st of the month, OR on any Monday." So this fires on the 1st AND every Monday.

To avoid: use only one of day-of-month / day-of-week. Set the other to `*`. If you really need AND logic ("first Monday of the month"), use Quartz or systemd timers, not cron.

## Common gotchas

### Time zone

Standard Unix cron runs in the **system local time**. If your server is in UTC and you write `0 9 * * *`, the job fires at 9 AM UTC, not 9 AM local time.

Modern alternatives (anacron, systemd timers, Kubernetes CronJobs) often let you specify a time zone explicitly:

```yaml
# k8s CronJob
spec:
  schedule: "0 9 * * *"
  timeZone: "Asia/Ho_Chi_Minh"
```

When in doubt, set the server time zone to UTC and convert in your head. Or use the `CRON_TZ=` prefix in `crontab` (supported by some implementations):

```
CRON_TZ=Asia/Ho_Chi_Minh
0 9 * * *  /run-daily.sh
```

### Daylight saving time

Two awkward cases per year:

- **Spring forward**: 2:30 AM doesn't exist on the day clocks jump from 2 AM to 3 AM. A job scheduled for 2:30 AM will be skipped.
- **Fall back**: 2:30 AM exists twice. Some cron implementations run the job twice; others run it once.

For jobs that must run exactly once, schedule them outside the DST transition window, e.g., 4 AM is safer than 2:30 AM.

For "run hourly" jobs (`0 * * * *`), the same hour fires twice on fall-back day. Idempotency is your friend.

### Server clock drift

Cron fires when the system clock says so. If your server's clock is off by 5 minutes (NTP not running), so are your jobs.

NTP is automatic on most modern systems but worth checking on edge devices, embedded systems, and air-gapped environments.

### Long-running jobs and overlap

If a job runs every 5 minutes but takes 7 minutes to complete, you'll have two instances running at once. Cron doesn't lock against this.

The simplest fix: use `flock` to ensure only one instance runs:

```bash
*/5 * * * *  flock -n /tmp/myjob.lock /usr/local/bin/myjob.sh
```

Or use a job runner (Sidekiq, Celery, k8s CronJob with `concurrencyPolicy: Forbid`) that handles concurrency for you.

### Output goes to email by default

By default, Unix cron emails any stdout/stderr to the user's mail. On modern servers, mail isn't usually configured, so output is silently discarded.

To capture output:

```
*/5 * * * *  /myjob.sh > /var/log/myjob.log 2>&1
```

Or run via a system that handles logging (systemd timers log to journald, k8s CronJobs log to pod stdout).

## Beyond standard cron

### Quartz syntax (Java world, Spring, K8s)

Adds:

- **6th field**: seconds (or 7th: year)
- **`L`**: last (last day of month, last weekday)
- **`#`**: Nth occurrence (e.g., `2#1` = first Monday)
- **`?`**: "no specific value" (used in day-of-month or day-of-week to disambiguate)

```
0 0 9 ? * MON#1     First Monday of every month at 9 AM
0 0 9 L * ?         9 AM on the last day of the month
```

Quartz is more expressive but its expressions don't validate as standard cron. Some k8s implementations support extended cron; check before relying on it.

### systemd timers

Linux systemd has its own scheduling format:

```
[Timer]
OnCalendar=Mon..Fri 09:00
Persistent=true
```

`OnCalendar` syntax is more readable than cron. `Persistent=true` runs missed jobs after sleep/downtime, the standard cron doesn't do this.

### Kubernetes CronJobs

```yaml
apiVersion: batch/v1
kind: CronJob
spec:
  schedule: "0 9 * * 1-5"
  timeZone: "Asia/Ho_Chi_Minh"
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  concurrencyPolicy: Forbid
```

Standard cron syntax, but with explicit time zone, history retention, and concurrency policy. The right choice for containerized scheduled jobs.

### Cloud schedulers

- AWS EventBridge: cron syntax + extended for "rate(5 minutes)"
- GCP Cloud Scheduler: cron syntax with explicit time zones
- Azure Logic Apps: cron and recurrence

All accept standard cron with their own additions. Read the docs for the specific cloud.

## Reading cron quickly: a process

Given `30 14 * * 1-5`, mental walk-through:

1. **Minute 30**: at minute 30
2. **Hour 14**: at 2:30 PM
3. **Day of month `*`**: any day of the month
4. **Month `*`**: any month
5. **Day of week 1-5**: Monday through Friday

→ "2:30 PM, weekdays."

For complex expressions, paste into [Cron Parser](/datetime-tools/cron-parser/) and confirm. Faster than guessing.

## Common mistakes

### Confusing minute and hour fields

```
9 0 * * *    runs at 0:09 (12:09 AM), not 9:00 AM
0 9 * * *    runs at 9:00 AM ✅
```

Field order is **minute first, hour second**. Easy to swap if you're rushing.

### Specifying both day-of-month and day-of-week

```
0 9 1 * MON    runs at 9 AM on the 1st AND every Monday
```

Use only one (set the other to `*`). For "first Monday of the month," use Quartz syntax or compute in your job.

### Forgetting the time zone

Cron fires in server local time. If you migrate the server to a new region, your "9 AM" cron job now fires at a different wall-clock time. Standardize on UTC across your fleet, or document time zones explicitly.

### Running every minute when polling is enough

If a job pings an API every minute, you've got 1,440 requests per day. For most "check for new work" jobs, every 5 minutes (288 requests) is plenty.

For real-time work, don't use cron, use a queue or webhook-triggered worker.

## Recommended workflow

1. **Reading a cron line**: parse left-to-right (minute, hour, day, month, dow). Use [Cron Parser](/datetime-tools/cron-parser/) for verification.
2. **Writing a new schedule**: start with the closest example you know, modify. Test the next 10 fire times before deploy.
3. **Time zones**: explicit in modern systems (k8s, systemd). Default to UTC on bare cron.
4. **Long-running jobs**: prevent overlap with `flock` or a job runner.
5. **Beyond cron**: for "first Monday" or other advanced rules, use Quartz or systemd timers, don't try to encode in standard cron.

The takeaway: cron is older than most engineers using it. The format is compact, the gotchas are well-known, and once you've read 20 cron lines fluently, you'll read any cron line fluently. The path to fluency is just looking at fewer cheat sheets and more actual expressions.

---

**Related tools on DevTools Online:**

- [Cron Parser](/datetime-tools/cron-parser/), paste expression, see schedule + next fire times
- [Unix Timestamp](/datetime-tools/unix-timestamp/), for converting cron times to UTC
- [HTTP Request Builder](/web-tools/http-request-builder/), test what your cron job calls
- [JSON Formatter](/json-tools/json-formatter/), for inspecting cron job logs
