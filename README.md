# DevKit — 120+ Free Online Developer Tools

A fast, private, all-in-one developer toolbox that runs entirely in your browser. No sign-up, no tracking, no server calls (except optional API-powered tools like DNS, IP lookup, and SSL checker).

Live: https://devtoolsonline.dev/

## Features

- 120+ tools across JSON, encoding, crypto, web, color, generators, formatters, .NET/C#, AI, and more
- VS Code-style syntax highlighting for SQL, C#, JSON, and CSS code blocks
- All tools run client-side — your data never leaves the browser
- Dark mode with persistent user preferences
- PWA-ready — installable as a desktop/mobile app

## Tool Categories

### JSON
JSON Formatter · JSON Minifier · JSON Diff · JSON to CSV · JSON to TypeScript · JSON to C# Classes · JSON to Code · JSON Schema Validator · JSONPath Tester · YAML to JSON

### Encoding
Base64 · URL Encode/Decode · HTML Encode/Decode · JWT Decoder · JWT Encoder · Hex Encode/Decode · Binary Encode/Decode

### Crypto & Security
Hash Generator (MD5, SHA-256, SHA-512) · BCrypt · AES Encrypt/Decrypt · TOTP 2FA · Password Generator · Password Strength Checker · Certificate (X.509) Decoder

### String & Text
Case Converter · Text Diff · Lorem Ipsum · String Inspector · Regex Tester · Slug Generator · String Escape · HTML to Markdown · Text Sorter · Word Frequency · Text Statistics · Markdown Table Generator

### Number & Units
Number Base Converter · Byte Converter · Unit Converter · Math Evaluator · Number Formatter · Aspect Ratio Calculator

### Date & Time
Unix Timestamp · Cron Parser · Timezone Converter · Date Calculator

### Web & Network
CSS Minifier · HTML Minifier · CSS Formatter · JS Formatter · HTML Formatter · Markdown Preview · Meta Tag Generator · URL Parser · HTTP Status Codes · MIME Types · CIDR Calculator · HTTP Security Headers · robots.txt Generator · Sitemap Generator · Curl to Code · DNS Lookup · IP Address Lookup · SSL Certificate Checker · HTTP Request Builder · User-Agent Parser · CSS Filter Generator · Px to Rem Converter · SVG Previewer · npm Package Checker · SVG Icon Browser · TypeScript → JavaScript

### Color
Color Converter · Color Palette Generator · CSS Gradient Generator · CSS Shadow Generator · Color Extractor · Color Contrast Checker (WCAG)

### Generators
UUID Generator · Nano ID / ULID · Random String · QR Code · Barcode · Favicon Generator · Data Faker · National ID Generator

### Formatters
SQL Formatter · XML Formatter · YAML Formatter · CSV to JSON · CSV Viewer · XML Minifier / Formatter

### .NET / C#
JSON to C# Classes · NuGet Package Checker · Connection String Builder · C# String Escape · SQL to LINQ · ERD Diagram · SQL Execution Plan Viewer · SQL Syntax Reference

### AI Tools
Token Counter · AI Cost Calculator · Prompt Builder · Model Comparison · JSON → Prompt · System Prompt Generator

### Misc
Diagram Creator · Log Viewer · .ENV Parser · KeyCode Tester

### Converters
Image Converter · Image Resizer · Image Compressor · SVG to PNG · CSV to Excel · JSON to Excel · Markdown to HTML · HTML to PDF

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS for styling
- Lucide React for icons
- Lazy-loaded tool components for fast initial load
- Persistent state with localStorage

## Running Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Install git hooks (local dev only):

```bash
npm run setup-hooks
```

## Adding a New Tool

1. Create `src/tools/YourTool.tsx` — export a default React component
2. Register in `src/tools-registry.ts` — add tool metadata and category
3. Add lazy import in `src/lazyToolComponents.ts`

## License

MIT
