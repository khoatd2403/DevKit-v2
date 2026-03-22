# DevKit — 130+ Free Online Developer Tools

A fast, private, all-in-one developer toolbox that runs entirely in your browser. No sign-up, no tracking, no server calls (except optional API-powered tools like DNS, IP lookup, and SSL checker).

Live: https://devkit.tools/

## Features

- 130+ tools across JSON, SQL, C#/.NET, encoding, crypto, web, color, generators, formatters, and more
- VS Code-style syntax highlighting for SQL, C#, JSON, and CSS code blocks
- All tools run client-side — your data never leaves the browser
- Dark mode with persistent user preferences
- PWA-ready — installable as a desktop/mobile app

## Tool Categories

### JSON
JSON Formatter · JSON Minifier · JSON Diff · JSON to CSV · JSON to TypeScript · JSON to C# Classes · JSON to Code · JSON Schema Validator · JSONPath Tester · YAML JSON

### SQL / .NET / C#
SQL Formatter · SQL Syntax Reference · SQL to LINQ · SQL Execution Plan Viewer · ERD Diagram · Connection String Builder · JSON to C# Classes · NuGet Package Checker · C# String Escape · Mermaid Diagram Creator · Log Viewer

### Encoding
Base64 · URL Encode/Decode · HTML Encode/Decode · JWT Decoder · JWT Encoder · Hex Encode/Decode · Binary Encode/Decode

### Crypto & Security
Hash Generator (MD5, SHA-256, SHA-512) · BCrypt · AES Encrypt/Decrypt · TOTP 2FA · Password Generator · Password Strength Checker · Certificate (X.509) Decoder

### Web & Network
CSS Minifier · HTML Minifier · CSS Formatter · JS Formatter · HTML Formatter · Markdown Preview · Meta Tag Generator · URL Parser · HTTP Status Codes · MIME Types · CIDR Calculator · HTTP Security Headers · robots.txt Generator · Sitemap Generator · Curl to Code · DNS Lookup · IP Address Lookup · SSL Certificate Checker · HTTP Request Builder · User-Agent Parser · CSS Filter Generator · Px to Rem Converter · SVG Previewer

### Color
Color Converter · Color Palette Generator · CSS Gradient Generator · CSS Shadow Generator · Color Extractor · Color Contrast Checker (WCAG)

### Generators
UUID Generator · Nano ID / ULID · Random String · QR Code · Barcode · Favicon Generator · Data Faker · National ID Generator

### String & Text
Case Converter · Text Diff · Lorem Ipsum · String Inspector · Regex Tester · Slug Generator · String Escape · HTML to Markdown · Text Sorter · Word Frequency · Text Statistics · Markdown Table Generator

### Date & Time
Unix Timestamp · Cron Parser · Timezone Converter · Date Calculator

### Number & Units
Number Base Converter · Byte Converter · Unit Converter · Math Evaluator · Number Formatter · Aspect Ratio Calculator

### Formatters
SQL Formatter · XML Formatter · YAML Formatter · CSV to JSON · CSV Viewer · XML Minifier / Formatter

### Converters
Image Converter · Image Resizer · Image Compressor · SVG to PNG · CSV to Excel · JSON to Excel · Markdown to HTML · HTML to PDF · TypeScript to JavaScript

## Tech Stack

- React 18 + TypeScript + Vite
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

## Adding a New Tool

1. Create src/tools/YourTool.tsx — export a default React component
2. Register in src/tools-registry.ts — add tool metadata and category
3. Add lazy import in src/lazyToolComponents.ts

## License

MIT
