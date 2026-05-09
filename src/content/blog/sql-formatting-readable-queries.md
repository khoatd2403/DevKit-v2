---
title: "SQL Formatting: From Unreadable Queries to Pull-Request-Ready Code"
slug: "sql-formatting-readable-queries"
description: "A formatting style for SQL that makes 200-line queries readable, plus tooling that enforces it. With examples of the same query in three styles and which one wins code review."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - sql formatting
  - sql formatter online
  - readable sql query
  - sql style guide
  - sqlfluff
tags:
  - SQL
  - Formatting
  - Tutorial
cover: "/og-image.svg"
excerpt: "Most SQL is unreadable because nobody formats it. Run it through a formatter once, agree on a style, and your team's queries become reviewable code instead of write-only blobs."
---

The query was 47 lines, no indentation, all keywords lowercase. Three nested subqueries. A `LEFT JOIN` halfway down the screen. The author had clearly written it in a database GUI that ran the query without ever forcing them to look at the structure. Reviewing it took twenty minutes and three "could you walk me through this?" Slack messages.

SQL is a real programming language, and it deserves the same formatting hygiene as any other code. This post is the style and the tools that make 47-line queries reviewable in three minutes.

## Why most SQL is ugly

A few historical reasons, none good:

1. **GUI clients don't format.** SSMS, MySQL Workbench, DBeaver — most have a "format" button buried in a menu, and most users never find it.
2. **Strings in code don't get formatted.** SQL embedded in Java, Python, Node — the formatter for the host language doesn't touch SQL strings.
3. **AI-generated SQL is one-line.** Copy-paste from ChatGPT often loses formatting.
4. **No standard.** Unlike JavaScript (Prettier) or Python (Black), SQL doesn't have a single "this is the format" tool everyone agrees on.

## A working SQL style

The style that works for 90% of queries:

```sql
SELECT
    u.id,
    u.email,
    u.created_at,
    COUNT(o.id) AS order_count,
    SUM(o.total) AS lifetime_value
FROM users u
LEFT JOIN orders o
    ON o.user_id = u.id
    AND o.status = 'completed'
WHERE u.created_at >= '2026-01-01'
    AND u.email NOT LIKE '%@example.com'
GROUP BY u.id, u.email, u.created_at
HAVING COUNT(o.id) > 0
ORDER BY lifetime_value DESC
LIMIT 100;
```

The rules:

- **Keywords UPPERCASE.** `SELECT`, `FROM`, `WHERE`, `JOIN` — always uppercase. Identifiers (`users`, `o.user_id`) lowercase.
- **One column per line in SELECT** when more than 2-3 columns.
- **Each major clause on its own line** at the same indent level (`FROM`, `JOIN`, `WHERE`, `GROUP BY`, etc.).
- **JOIN conditions indented** one level deeper than the JOIN keyword.
- **WHERE and JOIN conditions, one per line** when more than 2.
- **Aliases short and lowercase** — `u` for users, not `users_alias`.

It looks vertical. That's the point. A 50-line vertical query is readable; a 5-line horizontal query of the same content is not.

## The same query, three styles

### Bad: one line of horror

```sql
select u.id,u.email,u.created_at,count(o.id) as order_count,sum(o.total) as lifetime_value from users u left join orders o on o.user_id=u.id and o.status='completed' where u.created_at>='2026-01-01' and u.email not like '%@example.com' group by u.id,u.email,u.created_at having count(o.id)>0 order by lifetime_value desc limit 100;
```

This is what 50% of production SQL looks like. Don't be that team.

### Better: comma-leading style

```sql
SELECT u.id
     , u.email
     , u.created_at
     , COUNT(o.id) AS order_count
     , SUM(o.total) AS lifetime_value
FROM users u
LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'completed'
WHERE u.created_at >= '2026-01-01'
  AND u.email NOT LIKE '%@example.com'
GROUP BY u.id, u.email, u.created_at
HAVING COUNT(o.id) > 0
ORDER BY lifetime_value DESC
LIMIT 100;
```

Comma-leading (commas at the start of each new line) is a tradition some DBA teams swear by. The reason: a missing comma is visible because the column doesn't line up. The downside: it looks weird if you've spent your career with trailing commas.

Pick a side; either is fine. Be consistent.

### Best: vertical, structured

The style I showed at the top. Verbose, but every condition is searchable, every column is on its own line, diff-friendly.

You can paste any of these into [SQL Formatter](/formatter-tools/sql-formatter/) to auto-format to the structured style.

## Subqueries and CTEs

Multi-level subqueries become unreadable fast. CTEs (`WITH ... AS (...)`) are the fix:

```sql
-- Painful
SELECT *
FROM (
    SELECT user_id, COUNT(*) AS n
    FROM orders
    WHERE status = 'completed'
    GROUP BY user_id
) AS user_orders
WHERE n > 5;

-- Readable
WITH user_orders AS (
    SELECT
        user_id,
        COUNT(*) AS n
    FROM orders
    WHERE status = 'completed'
    GROUP BY user_id
)
SELECT *
FROM user_orders
WHERE n > 5;
```

CTEs let you build up a query in named layers, top-down. Even with no performance difference, they're worth it for readability. Most modern databases (PostgreSQL, MySQL 8+, SQL Server, BigQuery, Snowflake) have CTEs.

For complex queries with 3+ CTEs, name them by what they represent (`recent_orders`, `vip_users`, `merged_data`), not by what they technically are (`subquery_1`, `temp_data`).

## Formatting tooling

### Online formatters

Fast, no install, paste-and-format:

- [SQL Formatter](/formatter-tools/sql-formatter/) — DevTools Online's formatter, browser-side
- `sqlformat.org`, `poorsql.com` — alternatives, similar features

For one-off queries, this is the simplest path.

### CLI / IDE formatters

For code in version control, you want a formatter that can run on save or in CI:

- **`sqlfluff`** — Python-based, supports multiple SQL dialects, has a linter mode too. The standard for serious SQL projects in 2026.
- **`pgFormatter`** — Perl, focused on PostgreSQL, very fast.
- **DBeaver / DataGrip / pgAdmin** — built-in formatters, configurable.
- **Prettier** with the `prettier-plugin-sql` plugin — works for embedded SQL strings, but not as nuanced as `sqlfluff`.

```bash
# Install sqlfluff
pip install sqlfluff

# Format
sqlfluff fix --dialect postgres queries/

# Lint (catch bad practices, not just formatting)
sqlfluff lint --dialect postgres queries/
```

`sqlfluff` configuration goes in `.sqlfluff`:

```ini
[sqlfluff]
dialect = postgres
templater = jinja  # if you have dbt-style templates

[sqlfluff:rules:capitalisation.keywords]
capitalisation_policy = upper

[sqlfluff:rules:capitalisation.identifiers]
capitalisation_policy = lower
```

## Linting SQL

`sqlfluff lint` catches:

- Inconsistent capitalization
- Missing aliases on column references in joins
- Cartesian joins (no JOIN condition)
- Implicit cross joins
- Use of `SELECT *` in production queries
- Multiple statements in one file when only one is allowed

Treat lint warnings the way you'd treat ESLint: fix them before commit, don't let them accumulate.

## Style choices that matter

A few opinions that affect readability more than they get credit for:

### Aliases on every join

```sql
-- Hard to scan
SELECT u.email, orders.total
FROM users u
JOIN orders ON orders.user_id = u.id

-- Better
SELECT u.email, o.total
FROM users u
JOIN orders o ON o.user_id = u.id
```

Single-letter aliases for every table. Even if a query has only one table, alias it — refactoring is easier when columns are always qualified.

### `INNER JOIN` over `JOIN`

`JOIN` is shorthand for `INNER JOIN`. Most databases accept both; spelling out `INNER` is one more keystroke and removes ambiguity for readers.

### Avoid `SELECT *` in production

In an exploratory query, fine. In application code, never. `SELECT *` breaks when:

- A column is added (your code might choke on extra fields)
- A column is renamed
- The order of columns changes
- The query joins multiple tables and a column name collides

List the columns explicitly. If you're querying 20 columns, that's a sign — maybe the table needs splitting, or the query needs to use a more focused subquery.

### Don't put logic in `WHERE` that belongs in `JOIN`

```sql
-- Confusing — moves a join condition to WHERE
SELECT u.id, o.id
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.status = 'completed';  -- effectively turns LEFT JOIN into INNER JOIN

-- Clear — keeps join logic in JOIN
SELECT u.id, o.id
FROM users u
LEFT JOIN orders o
    ON o.user_id = u.id
    AND o.status = 'completed';  -- preserves NULL rows from u
```

The first version surprises reviewers (the `LEFT JOIN` is a lie — the `WHERE` filters out NULLs). The second is honest about the intent.

## When SQL is in code

If your query is a string in TypeScript or Python, formatting depends on your stack:

- **Inline strings** in code — write them properly indented:

  ```ts
  const sql = `
    SELECT
      u.id,
      u.email
    FROM users u
    WHERE u.active = true
  `
  ```

- **External `.sql` files** — let `sqlfluff` format them. Your editor opens them as SQL, you get syntax highlighting and formatting for free.

- **ORMs and query builders** (Prisma, Drizzle, Knex) — they generate SQL for you; readability is on them. Inspect generated SQL with the ORM's debug output.

- **dbt models** — `.sql` files with Jinja templating. `sqlfluff` supports them with the `jinja` templater.

## Recommended workflow

1. **For ad-hoc queries**: paste into [SQL Formatter](/formatter-tools/sql-formatter/) before pasting into Slack or a ticket. Saves your reviewers' eyes.
2. **For repo SQL**: `sqlfluff` in pre-commit, format-on-save in your editor.
3. **For embedded queries**: external `.sql` files when over 5 lines. Inline only for trivial queries.
4. **For ORMs**: inspect generated SQL during development. ORMs sometimes generate weird joins that look fine in code but explode at scale.
5. **For database explainability**: pair formatting with `EXPLAIN` output to debug slow queries. [SQL Plan Viewer](/dotnet-tools/sql-plan-viewer/) renders execution plans in a readable form.

The takeaway: SQL is code. Treat it like code. Format it like code. Review it like code. The team that does this ships fewer bad queries and reviews each other's faster.

---

**Related tools on DevTools Online:**

- [SQL Formatter](/formatter-tools/sql-formatter/) — paste, format, copy
- [SQL to LINQ](/dotnet-tools/sql-to-linq/) — for .NET teams converting SQL to ORM
- [ERD Diagram](/dotnet-tools/erd-diagram/) — visualize schema
- [SQL Plan Viewer](/dotnet-tools/sql-plan-viewer/) — for query optimization
