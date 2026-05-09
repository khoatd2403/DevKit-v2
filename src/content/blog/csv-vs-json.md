---
title: "CSV vs JSON: When to Use Which for Data Exchange"
slug: "csv-vs-json"
description: "CSV is dead, long live CSV. A practical comparison of CSV and JSON for data exchange in 2026, file size, schema, streaming, tooling, and why analysts still ask for CSV."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - csv vs json
  - csv or json
  - data exchange format
  - convert csv to json
  - csv json comparison
tags:
  - JSON
  - CSV
  - Comparison
cover: "/og-image.svg"
excerpt: "Engineers love JSON. Analysts ask for CSV. Both groups are right, for different reasons. Here's how to pick the format that won't waste anyone's afternoon."
---

"CSV is dead, just use JSON" is a take you hear in engineering Slacks every six months. It's been wrong each time. As of 2026, **the most-loaded format in BigQuery is still CSV**, marketing analysts still ask for spreadsheets, and Snowflake ingests CSV faster than JSON. The "modern format wins" narrative collapses the moment you check what real users do.

The honest comparison isn't "which is technically better." Both formats are technically fine for their lanes. The interesting question is: when does each lane actually apply? That depends almost entirely on **who reads the file**, which is the opposite of how engineers usually pick a format.

## TL;DR

| Criterion | CSV | JSON |
|---|---|---|
| Human-readable in Excel | ✅ Yes (open and go) | ⚠️ Garbage in Excel |
| Nested data | ❌ Flat only | ✅ Native |
| Type information | ❌ Strings everywhere | ✅ string, number, bool, null |
| File size | ✅ Smaller | ❌ Larger (keys repeated per row) |
| Streaming | ✅ Line-by-line | ⚠️ Need NDJSON |
| Schema | ❌ Implicit | ✅ JSON Schema |
| Tooling | Universal but quirky | Excellent in code |

If your data is **flat tabular** and the consumer might open it in Excel. CSV. If your data has **any nesting or types matter**: JSON. There's no single "best" answer, just the right answer for the consumer.

## When CSV is the right call

CSV wins anywhere a non-engineer might need to look at the file:

- **Marketing exports**: campaign lists, customer segments
- **Finance**: transactions, invoices, accounting reports
- **Analytics**: pivot tables, ad-hoc reporting
- **Bulk imports**: CRM uploads, mass mailing lists
- **Data warehouses**: Snowflake, BigQuery, Redshift load CSV faster than JSON

A 10-million-row dataset is **30-50% smaller as CSV** than as JSON, because you don't repeat the keys on every row. That matters when you're paying for storage or piping through a network.

The tooling is universal. Every spreadsheet, every database, every language has CSV support. There is no "obscure CSV library that doesn't quite work", there are obscure JSON libraries.

## When JSON is the right call

JSON wins anywhere structure matters:

- **API responses**: nested resources, optional fields, type signals
- **Config files**: type-safe key-value
- **Logs**: newline-delimited JSON (NDJSON / JSON Lines) is the modern observability standard
- **Inter-service communication**: REST, gRPC-Web, message queues
- **Anywhere code reads it**: JavaScript, Python, Go, every language has a one-liner parser

The single biggest JSON win: **types are preserved**. `42` is a number. `"42"` is a string. `null` is null. CSV makes you parse all that yourself, every time, for every column.

## The CSV problems no one warns you about

CSV looks simple. The simple version is simple. But the moment you have real data, you hit the gotchas:

### Quoting and escaping

The "Comma-Separated Values" name is a lie. CSV is more accurately "delimiter-separated values, where the delimiter is usually a comma but might be a tab or semicolon, and any field containing the delimiter or a newline must be quoted, and any quote inside a quoted field must be doubled."

```
name,address,note
"Smith, John","123 Main St","Said: ""Hello"""
```

Roll your own CSV parser at your peril. Use a real library — `papaparse` in JS, the standard `csv` module in Python, `csv` package in Go.

### Excel mangles your data

Excel will:

- **Reformat dates**: `04/05/2026` becomes `5-Apr-2026` becomes `15071` when re-saved.
- **Drop leading zeros**: `0123` becomes `123`. Phone numbers, ZIP codes, IDs, all destroyed.
- **Convert long numbers to scientific notation**: `9007199254740993` becomes `9.0072E+15`.
- **Auto-correct strings**: `=SUM(A1)` typed in a cell becomes a formula, not text. Worse, fields starting with `=`, `+`, `-`, or `@` are formula-injection vectors.

The defensive technique: prefix anything Excel might mangle with a single quote, e.g., `'0123`. Excel treats it as text. Or, deliver as `.tsv` or `.txt`, which Excel doesn't auto-import.

### Encoding and the BOM

CSV exports from Excel often include a UTF-8 BOM (`EF BB BF`). Most consumers handle it; some don't. We've written about [how the BOM breaks JSON parsers](/blog/json-bom-byte-order-mark/), the same issue affects CSV consumers that don't expect a BOM.

### Delimiters depend on locale

In Vietnamese / European Excel installs, the default delimiter for CSV is `;` (semicolon), not `,`. Because in Vietnamese number formatting, `,` is the **decimal separator**: `1,5` means one and a half. Save a CSV in Vietnamese Excel, send it to a system expecting comma-separated, and every row breaks.

Workaround: use TSV (tab-separated), tabs aren't in any locale's decimal format.

## The JSON problems for tabular data

JSON has fewer problems but they're real:

- **No native streaming** for arrays. Parsing a 4GB JSON array means loading it all into memory unless you switch to **NDJSON** (one JSON object per line, parsed per line). NDJSON is what every modern logging system uses.
- **File size** for tabular data is bad. Each row repeats every key as a string. Example: 1M rows × 10 fields × 8-char field names = 80MB of just key bytes. CSV wouldn't have any of that.
- **Cells must be UTF-8 strings**: there's no `bytes` type in JSON. Binary data needs Base64 (≈33% bloat) or be handled out-of-band.

## Pragmatic patterns

### Convert on demand

Don't pick once and live with it. Maintain both. Most data exchange systems should be able to emit either:

```bash
# CSV from JSON
jq -r '(.[0] | keys_unsorted) as $keys | $keys, (.[] | [.[$keys[]]]) | @csv' data.json

# JSON from CSV
csvjson data.csv > data.json   # csvkit
```

Or use online converters when you don't want to script:

- [JSON to CSV](/json-tools/json-to-csv/), flatten nested fields with dot notation
- [CSV to JSON](/formatter-tools/csv-to-json/), type inference for numbers and booleans
- [JSON to Excel](/json-tools/json-to-excel/), for non-engineers
- [CSV Viewer](/formatter-tools/csv-viewer/), inspect CSV without opening Excel

### Use NDJSON for log-shaped data

If you'd put it in a database table, JSON Lines (NDJSON) is often the right format:

```
{"timestamp":"2026-05-09T08:00:01Z","level":"info","msg":"started"}
{"timestamp":"2026-05-09T08:00:02Z","level":"error","msg":"db timeout"}
```

You get JSON's type fidelity AND CSV's streamability. `jq` reads it, every observability tool ingests it, and parsing one line per row is trivial.

### Document your CSV format

If you must use CSV, ship a tiny README:

```
encoding: UTF-8 (no BOM)
delimiter: comma
quote: double
header: present
date format: ISO 8601 (YYYY-MM-DD)
empty values: empty string (not "NULL")
```

Half the CSV bugs in production are people guessing at undocumented format choices.

## Recommended workflow

1. **For Excel users / analysts**: CSV. Document the format. Be defensive against Excel mangling.
2. **For APIs and inter-service**: JSON. Use TypeScript / JSON Schema for safety.
3. **For logs and event streams**: NDJSON. Pipes well, streams well, types preserved.
4. **For data warehouse loads**: CSV (smaller, faster).
5. **For one-off conversion**: paste into [JSON to CSV](/json-tools/json-to-csv/) or [CSV to JSON](/formatter-tools/csv-to-json/) and move on.

The takeaway: the format follows the consumer. Don't pick CSV because it's "simpler" or JSON because it's "modern", pick whichever lets the person on the receiving end open the file and do their job.

---

**Related tools on DevTools Online:**

- [JSON to CSV](/json-tools/json-to-csv/), flatten with dot notation
- [CSV to JSON](/formatter-tools/csv-to-json/), with type inference
- [JSON to Excel](/json-tools/json-to-excel/), for analysts
- [CSV Viewer](/formatter-tools/csv-viewer/), inspect without Excel
- [JSON Formatter](/json-tools/json-formatter/), pretty-print before sending
