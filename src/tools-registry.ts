import type { Tool, Category } from './types'

export const categories: Category[] = [
  { id: 'all', name: 'All Tools', icon: '🧰', color: 'gray' },
  { id: 'json', name: 'JSON', icon: '📋', color: 'yellow' },
  { id: 'encoding', name: 'Encoding', icon: '🔐', color: 'blue' },
  { id: 'crypto', name: 'Crypto & Hash', icon: '🔒', color: 'red' },
  { id: 'string', name: 'String', icon: '🔤', color: 'green' },
  { id: 'number', name: 'Number', icon: '🔢', color: 'purple' },
  { id: 'datetime', name: 'Date & Time', icon: '📅', color: 'orange' },
  { id: 'web', name: 'Web', icon: '🌐', color: 'cyan' },
  { id: 'color', name: 'Color', icon: '🎨', color: 'pink' },
  { id: 'generator', name: 'Generators', icon: '⚡', color: 'indigo' },
  { id: 'formatter', name: 'Formatters', icon: '✨', color: 'teal' },
  { id: 'misc', name: 'Misc', icon: '🔧', color: 'slate' },
  { id: 'converter', name: 'Converter', icon: '🔄', color: 'violet' },
  { id: 'dotnet', name: '.NET / C#', icon: '💜', color: 'purple' },
  { id: 'ai', name: 'AI Tools', icon: '🤖', color: 'violet' },
]

export const tools: Tool[] = [
  // JSON
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate and beautify JSON data',
    category: 'json',
    icon: '📋',
    tags: ['json', 'format', 'validate', 'beautify'],
    popular: true,
  },
  {
    id: 'json-minifier',
    name: 'JSON Minifier',
    description: 'Minify and compress JSON data',
    category: 'json',
    icon: '📉',
    tags: ['json', 'minify', 'compress'],
  },
  {
    id: 'json-to-csv',
    name: 'JSON to CSV',
    description: 'Convert JSON array data to CSV format',
    category: 'json',
    icon: '📊',
    tags: ['json', 'csv', 'convert'],
  },
  {
    id: 'json-diff',
    name: 'JSON Diff',
    description: 'Compare and find differences between two JSON objects',
    category: 'json',
    icon: '🔍',
    tags: ['json', 'diff', 'compare'],
    new: true,
  },

  // Encoding
  {
    id: 'base64-encode-decode',
    name: 'Base64 Encode/Decode',
    description: 'Encode and decode Base64 strings',
    category: 'encoding',
    icon: '🔐',
    tags: ['base64', 'encode', 'decode'],
    popular: true,
  },
  {
    id: 'url-encode-decode',
    name: 'URL Encode/Decode',
    description: 'Encode and decode URL strings',
    category: 'encoding',
    icon: '🔗',
    tags: ['url', 'encode', 'decode', 'percent'],
    popular: true,
  },
  {
    id: 'html-encode-decode',
    name: 'HTML Encode/Decode',
    description: 'Encode and decode HTML entities',
    category: 'encoding',
    icon: '🏷️',
    tags: ['html', 'encode', 'decode', 'entities'],
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    description: 'Decode and inspect JSON Web Tokens',
    category: 'encoding',
    icon: '🎫',
    tags: ['jwt', 'token', 'decode', 'auth'],
    popular: true,
  },

  // Crypto & Hash
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA1, SHA256, SHA512 hashes',
    category: 'crypto',
    icon: '🔒',
    tags: ['hash', 'md5', 'sha1', 'sha256', 'sha512', 'crypto'],
    popular: true,
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate strong, secure passwords',
    category: 'crypto',
    icon: '🔑',
    tags: ['password', 'generator', 'security', 'random'],
    popular: true,
  },
  {
    id: 'bcrypt',
    name: 'BCrypt Hash',
    description: 'Generate and verify BCrypt password hashes',
    category: 'crypto',
    icon: '🛡️',
    tags: ['bcrypt', 'hash', 'password', 'security'],
    new: true,
  },

  // String
  {
    id: 'string-case-converter',
    name: 'Case Converter',
    description: 'Convert strings between camelCase, snake_case, PascalCase, kebab-case and more',
    category: 'string',
    icon: '🔤',
    tags: ['string', 'case', 'camel', 'snake', 'pascal', 'kebab'],
    popular: true,
  },
  {
    id: 'text-diff',
    name: 'Text Diff',
    description: 'Find differences between two text blocks',
    category: 'string',
    icon: '📝',
    tags: ['text', 'diff', 'compare'],
  },
  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum',
    description: 'Generate Lorem Ipsum placeholder text',
    category: 'string',
    icon: '📃',
    tags: ['lorem', 'ipsum', 'placeholder', 'text', 'generator'],
  },
  {
    id: 'string-inspector',
    name: 'String Inspector',
    description: 'Analyze strings: length, word count, char frequency',
    category: 'string',
    icon: '🔎',
    tags: ['string', 'analyze', 'count', 'inspect'],
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test and debug regular expressions with live highlighting',
    category: 'string',
    icon: '🎯',
    tags: ['regex', 'regexp', 'test', 'pattern', 'match'],
    popular: true,
  },

  // Number
  {
    id: 'number-base-converter',
    name: 'Number Base Converter',
    description: 'Convert between binary, octal, decimal, and hexadecimal',
    category: 'number',
    icon: '🔢',
    tags: ['number', 'binary', 'hex', 'octal', 'decimal', 'convert'],
  },
  {
    id: 'byte-converter',
    name: 'Byte / Size Converter',
    description: 'Convert between bytes, KB, MB, GB, TB',
    category: 'number',
    icon: '💾',
    tags: ['bytes', 'kb', 'mb', 'gb', 'size', 'convert'],
  },

  // Date & Time
  {
    id: 'unix-timestamp',
    name: 'Unix Timestamp',
    description: 'Convert between Unix timestamps and human-readable dates',
    category: 'datetime',
    icon: '📅',
    tags: ['unix', 'timestamp', 'date', 'time', 'convert'],
    popular: true,
  },
  {
    id: 'cron-parser',
    name: 'Cron Expression Parser',
    description: 'Parse and explain cron job expressions',
    category: 'datetime',
    icon: '⏰',
    tags: ['cron', 'schedule', 'expression', 'parse'],
    new: true,
  },

  // Web
  {
    id: 'css-minifier',
    name: 'CSS Minifier',
    description: 'Minify and compress CSS code',
    category: 'web',
    icon: '🎨',
    tags: ['css', 'minify', 'compress', 'web'],
  },
  {
    id: 'html-minifier',
    name: 'HTML Minifier',
    description: 'Minify and compress HTML markup',
    category: 'web',
    icon: '🌐',
    tags: ['html', 'minify', 'compress', 'web'],
  },
  {
    id: 'markdown-preview',
    name: 'Markdown Preview',
    description: 'Live preview of Markdown rendered to HTML',
    category: 'web',
    icon: '📖',
    tags: ['markdown', 'preview', 'render', 'html'],
    popular: true,
  },
  {
    id: 'meta-tag-generator',
    name: 'Meta Tag Generator',
    description: 'Generate SEO meta tags for your website',
    category: 'web',
    icon: '🏷️',
    tags: ['meta', 'seo', 'tags', 'html', 'generator'],
    new: true,
  },

  // Color
  {
    id: 'color-converter',
    name: 'Color Converter',
    description: 'Convert between HEX, RGB, HSL, and HSV color formats',
    category: 'color',
    icon: '🎨',
    tags: ['color', 'hex', 'rgb', 'hsl', 'hsv', 'convert'],
    popular: true,
  },
  {
    id: 'color-palette',
    name: 'Color Palette Generator',
    description: 'Generate beautiful color palettes and gradients',
    category: 'color',
    icon: '🖌️',
    tags: ['color', 'palette', 'gradient', 'generator'],
    new: true,
  },

  // Generators
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate UUID v1, v4, and v7 identifiers',
    category: 'generator',
    icon: '⚡',
    tags: ['uuid', 'guid', 'generate', 'id', 'random'],
    popular: true,
  },
  {
    id: 'random-string',
    name: 'Random String Generator',
    description: 'Generate random strings with custom length and charset',
    category: 'generator',
    icon: '🎲',
    tags: ['random', 'string', 'generator', 'token'],
  },

  // Formatters
  {
    id: 'sql-formatter',
    name: 'SQL Formatter',
    description: 'Format and beautify SQL queries',
    category: 'formatter',
    icon: '🗄️',
    tags: ['sql', 'format', 'query', 'database'],
  },
  {
    id: 'xml-formatter',
    name: 'XML Formatter',
    description: 'Format and validate XML documents',
    category: 'formatter',
    icon: '📄',
    tags: ['xml', 'format', 'validate', 'beautify'],
  },

  // Misc
  {
    id: 'image-to-base64',
    name: 'Image to Base64',
    description: 'Convert images to Base64 encoded data URLs',
    category: 'misc',
    icon: '🖼️',
    tags: ['image', 'base64', 'convert', 'data-url'],
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes from text or URLs',
    category: 'misc',
    icon: '📱',
    tags: ['qr', 'qrcode', 'generate', 'barcode'],
  },

  // ── New tools ──────────────────────────────────────────────────────────────

  // JSON (new)
  {
    id: 'yaml-json',
    name: 'YAML ↔ JSON',
    description: 'Convert between YAML and JSON formats',
    category: 'json',
    icon: '📄',
    tags: ['yaml', 'json', 'convert'],
    new: true,
  },
  {
    id: 'json-to-typescript',
    name: 'JSON to TypeScript',
    description: 'Generate TypeScript interfaces from JSON data',
    category: 'json',
    icon: '🔷',
    tags: ['json', 'typescript', 'interface', 'type', 'generate'],
    new: true,
  },
  {
    id: 'jsonpath-tester',
    name: 'JSONPath Tester',
    description: 'Test JSONPath expressions against JSON data interactively',
    category: 'json',
    icon: '🎯',
    tags: ['jsonpath', 'json', 'query', 'path', 'filter'],
    new: true,
  },
  {
    id: 'json-schema-validator',
    name: 'JSON Schema Validator',
    description: 'Validate JSON data against a JSON Schema',
    category: 'json',
    icon: '✅',
    tags: ['json', 'schema', 'validate', 'jsonschema'],
    new: true,
  },

  // Encoding (new)
  {
    id: 'hex-encode-decode',
    name: 'Hex Encode/Decode',
    description: 'Encode text to hexadecimal or decode hex back to text',
    category: 'encoding',
    icon: '🔢',
    tags: ['hex', 'hexadecimal', 'encode', 'decode'],
    new: true,
  },
  {
    id: 'binary-encode-decode',
    name: 'Binary Encode/Decode',
    description: 'Encode text to binary bits or decode binary back to text',
    category: 'encoding',
    icon: '💻',
    tags: ['binary', 'bits', 'encode', 'decode'],
    new: true,
  },

  // String (new)
  {
    id: 'slug-generator',
    name: 'Slug Generator',
    description: 'Convert text to URL-friendly slugs with custom options',
    category: 'string',
    icon: '🔗',
    tags: ['slug', 'url', 'permalink', 'string', 'seo'],
    new: true,
  },
  {
    id: 'string-escape',
    name: 'String Escape/Unescape',
    description: 'Escape and unescape strings for JS, JSON, HTML, Regex, and URL',
    category: 'string',
    icon: '🔧',
    tags: ['escape', 'unescape', 'string', 'js', 'json', 'html', 'regex'],
    new: true,
  },
  {
    id: 'html-to-markdown',
    name: 'HTML to Markdown',
    description: 'Convert HTML markup to clean Markdown syntax',
    category: 'string',
    icon: '📝',
    tags: ['html', 'markdown', 'convert', 'md'],
    new: true,
  },

  // Date & Time (new)
  {
    id: 'timezone-converter',
    name: 'Timezone Converter',
    description: 'Convert time between different timezones around the world',
    category: 'datetime',
    icon: '🌍',
    tags: ['timezone', 'time', 'convert', 'utc', 'dst', 'world'],
    new: true,
  },
  {
    id: 'date-calculator',
    name: 'Date Calculator',
    description: 'Calculate difference between dates or add/subtract time',
    category: 'datetime',
    icon: '🗓️',
    tags: ['date', 'calculator', 'difference', 'days', 'add', 'subtract'],
    new: true,
  },

  // Web (new)
  {
    id: 'css-formatter',
    name: 'CSS Formatter',
    description: 'Beautify or minify CSS code',
    category: 'web',
    icon: '✨',
    tags: ['css', 'format', 'beautify', 'minify', 'web'],
    new: true,
  },
  {
    id: 'js-formatter',
    name: 'JS Minifier / Formatter',
    description: 'Minify or beautify JavaScript code',
    category: 'web',
    icon: '⚡',
    tags: ['javascript', 'js', 'minify', 'format', 'beautify'],
    new: true,
  },
  {
    id: 'url-parser',
    name: 'URL Parser',
    description: 'Parse a URL into its components: protocol, host, path, query params',
    category: 'web',
    icon: '🔍',
    tags: ['url', 'parse', 'query', 'params', 'host', 'path'],
    new: true,
  },

  // Formatters (new)
  {
    id: 'yaml-formatter',
    name: 'YAML Formatter',
    description: 'Format and validate YAML documents',
    category: 'formatter',
    icon: '📋',
    tags: ['yaml', 'format', 'validate', 'beautify'],
    new: true,
  },
  {
    id: 'csv-to-json',
    name: 'CSV to JSON',
    description: 'Convert CSV data to JSON array with auto-detect delimiter',
    category: 'formatter',
    icon: '📊',
    tags: ['csv', 'json', 'convert', 'table', 'data'],
    new: true,
  },

  // Misc (new)
  {
    id: 'chmod-calculator',
    name: 'Chmod Calculator',
    description: 'Calculate Unix file permissions from octal or symbolic notation',
    category: 'misc',
    icon: '🔐',
    tags: ['chmod', 'unix', 'linux', 'permissions', 'octal', 'rwx'],
    new: true,
  },

  // Crypto (new)
  {
    id: 'jwt-encoder',
    name: 'JWT Encoder',
    description: 'Create and sign JSON Web Tokens with HS256/HS384/HS512',
    category: 'crypto',
    icon: '🎟️',
    tags: ['jwt', 'token', 'encode', 'sign', 'hmac', 'auth'],
    new: true,
  },

  // Converter
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Convert images between JPG, PNG, WebP, and BMP formats',
    category: 'converter',
    icon: '🖼️',
    tags: ['image', 'convert', 'jpg', 'png', 'webp', 'bmp'],
    new: true,
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Resize and compress images with quality control',
    category: 'converter',
    icon: '📐',
    tags: ['image', 'resize', 'compress', 'quality', 'scale'],
    new: true,
  },
  {
    id: 'svg-to-png',
    name: 'SVG to PNG / JPG',
    description: 'Convert SVG vector files to rasterized PNG or JPG images',
    category: 'converter',
    icon: '✏️',
    tags: ['svg', 'png', 'jpg', 'convert', 'rasterize', 'vector'],
    new: true,
  },
  {
    id: 'csv-to-excel',
    name: 'CSV to Excel',
    description: 'Convert CSV files to Excel XLSX spreadsheet format',
    category: 'converter',
    icon: '📊',
    tags: ['csv', 'excel', 'xlsx', 'convert', 'spreadsheet'],
    new: true,
  },
  {
    id: 'json-to-excel',
    name: 'JSON to Excel',
    description: 'Export JSON array data to Excel XLSX spreadsheet',
    category: 'converter',
    icon: '📋',
    tags: ['json', 'excel', 'xlsx', 'convert', 'spreadsheet', 'export'],
    new: true,
  },
  {
    id: 'markdown-to-html',
    name: 'Markdown to HTML',
    description: 'Convert Markdown to styled HTML and download as a file',
    category: 'converter',
    icon: '📝',
    tags: ['markdown', 'html', 'convert', 'export', 'md'],
    new: true,
  },
  {
    id: 'html-to-pdf',
    name: 'HTML to PDF',
    description: 'Render HTML content and export to PDF via browser print',
    category: 'converter',
    icon: '📄',
    tags: ['html', 'pdf', 'convert', 'print', 'export'],
    new: true,
  },

  // String (new batch 2)
  { id: 'text-sorter', name: 'Text Sorter', description: 'Sort, deduplicate, reverse and shuffle text lines', category: 'string', icon: '📑', tags: ['text', 'sort', 'deduplicate', 'lines', 'shuffle'], new: true },
  { id: 'word-frequency', name: 'Word Frequency', description: 'Count word and character frequency in text', category: 'string', icon: '📊', tags: ['word', 'frequency', 'count', 'text', 'analyze'], new: true },
  { id: 'text-stats', name: 'Text Statistics', description: 'Detailed text stats: reading time, sentences, paragraphs', category: 'string', icon: '📈', tags: ['text', 'statistics', 'reading', 'time', 'words', 'sentences'], new: true },

  // JSON (new batch 2)
  { id: 'json-to-code', name: 'JSON to Code', description: 'Generate Python, PHP, Go, Ruby, Java code from JSON', category: 'json', icon: '💻', tags: ['json', 'code', 'python', 'php', 'go', 'ruby', 'generate'], new: true },

  // Crypto (new batch 2)
  { id: 'aes-encrypt', name: 'AES Encrypt / Decrypt', description: 'Encrypt and decrypt text using AES-256-GCM in the browser', category: 'crypto', icon: '🛡️', tags: ['aes', 'encrypt', 'decrypt', 'crypto', 'security', 'cipher'], new: true },
  { id: 'totp-generator', name: 'TOTP / 2FA Generator', description: 'Generate and verify time-based one-time passwords (RFC 6238)', category: 'crypto', icon: '🔑', tags: ['totp', '2fa', 'otp', 'authenticator', 'mfa', 'google'], new: true },

  // Number (new batch 2)
  { id: 'unit-converter', name: 'Unit Converter', description: 'Convert between units: length, weight, temperature, area, speed', category: 'number', icon: '📏', tags: ['unit', 'convert', 'length', 'weight', 'temperature', 'area', 'speed'], new: true },
  { id: 'math-evaluator', name: 'Math Evaluator', description: 'Evaluate mathematical expressions with variables and functions', category: 'number', icon: '🧮', tags: ['math', 'calculator', 'expression', 'evaluate', 'formula'], new: true },

  // Color (new batch 2)
  { id: 'css-gradient', name: 'CSS Gradient Generator', description: 'Visually build linear, radial, and conic CSS gradients', category: 'color', icon: '🌈', tags: ['css', 'gradient', 'linear', 'radial', 'color', 'generator'], new: true },
  { id: 'css-shadow', name: 'CSS Shadow Generator', description: 'Visually build box-shadow and text-shadow CSS values', category: 'color', icon: '🌑', tags: ['css', 'shadow', 'box-shadow', 'text-shadow', 'generator'], new: true },

  // Web (new batch 2)
  { id: 'http-status-codes', name: 'HTTP Status Codes', description: 'Searchable reference for all HTTP status codes with descriptions', category: 'web', icon: '🌐', tags: ['http', 'status', 'codes', '404', '200', '500', 'reference'], new: true },
  { id: 'mime-types', name: 'MIME Types Lookup', description: 'Look up MIME types by file extension or content type', category: 'web', icon: '📂', tags: ['mime', 'type', 'extension', 'content-type', 'file'], new: true },
  { id: 'curl-to-code', name: 'Curl to Code', description: 'Convert curl commands to fetch, axios, or Python requests code', category: 'web', icon: '⚡', tags: ['curl', 'fetch', 'axios', 'python', 'http', 'convert'], new: true },

  // Generator (new batch 2)
  { id: 'data-faker', name: 'Data Faker', description: 'Generate realistic fake test data: names, emails, phones, addresses', category: 'generator', icon: '🎭', tags: ['fake', 'data', 'faker', 'test', 'name', 'email', 'phone', 'mock'], new: true },

  // Generator (original)
  {
    id: 'nanoid-generator',
    name: 'Nano ID / ULID',
    description: 'Generate compact unique identifiers: Nano IDs and ULIDs',
    category: 'generator',
    icon: '🆔',
    tags: ['nanoid', 'ulid', 'id', 'generate', 'unique', 'random'],
    new: true,
  },

  // Batch 4 - Text/Code
  { id: 'html-formatter', name: 'HTML Formatter', description: 'Beautify and format HTML markup with proper indentation', category: 'web', icon: '🖊️', tags: ['html', 'format', 'beautify', 'indent', 'web'], new: true },
  { id: 'csv-viewer', name: 'CSV Viewer', description: 'View and explore CSV data as an interactive table with sorting', category: 'formatter', icon: '📋', tags: ['csv', 'table', 'viewer', 'sort', 'filter', 'data'], new: true },
  { id: 'env-parser', name: '.ENV Parser', description: 'Parse .env files to JSON and convert back, view key/value pairs', category: 'misc', icon: '🔑', tags: ['env', 'dotenv', 'environment', 'json', 'config', 'parse'], new: true },
  { id: 'markdown-table', name: 'Markdown Table Generator', description: 'Create Markdown tables from a visual grid editor', category: 'string', icon: '📊', tags: ['markdown', 'table', 'generator', 'md', 'grid'], new: true },

  // Batch 4 - Web/Network
  { id: 'cidr-calculator', name: 'CIDR / IP Calculator', description: 'Calculate subnet, broadcast address, host range from CIDR notation', category: 'web', icon: '🌐', tags: ['cidr', 'ip', 'subnet', 'network', 'calculator', 'ipv4'], new: true },
  { id: 'http-headers-builder', name: 'HTTP Security Headers', description: 'Build and understand CORS, CSP, HSTS and other security headers', category: 'web', icon: '🔒', tags: ['http', 'headers', 'cors', 'csp', 'hsts', 'security'], new: true },
  { id: 'robots-txt', name: 'robots.txt Generator', description: 'Generate robots.txt file with GUI rule builder for crawlers', category: 'web', icon: '🤖', tags: ['robots', 'txt', 'seo', 'crawler', 'sitemap', 'generator'], new: true },
  { id: 'sitemap-generator', name: 'Sitemap Generator', description: 'Generate XML sitemap from a list of URLs', category: 'web', icon: '🗺️', tags: ['sitemap', 'xml', 'seo', 'url', 'generator'], new: true },

  // Batch 4 - Dev Tools
  { id: 'keycode-tester', name: 'KeyCode Tester', description: 'Test keyboard events and inspect key codes, modifiers, and event properties', category: 'misc', icon: '⌨️', tags: ['keycode', 'keyboard', 'event', 'key', 'shortcut', 'test'], new: true },
  { id: 'aspect-ratio', name: 'Aspect Ratio Calculator', description: 'Calculate and convert aspect ratios for images and video (16:9, 4:3...)', category: 'number', icon: '📐', tags: ['aspect', 'ratio', 'resolution', 'image', 'video', '16:9'], new: true },
  { id: 'number-formatter', name: 'Number Formatter', description: 'Format numbers with locale-aware separators, currency, and notation', category: 'number', icon: '🔢', tags: ['number', 'format', 'locale', 'currency', 'thousand', 'separator'], new: true },
  { id: 'ts-to-js', name: 'TypeScript → JavaScript', description: 'Strip TypeScript types and transpile TS to plain JavaScript', category: 'web', icon: '🟡', tags: ['typescript', 'javascript', 'ts', 'js', 'transpile', 'convert'], new: true },

  // Batch 4 - Media/Visual
  { id: 'favicon-generator', name: 'Favicon Generator', description: 'Generate favicons from emoji or text in multiple sizes', category: 'generator', icon: '🎨', tags: ['favicon', 'icon', 'emoji', 'png', 'generator', 'website'], new: true },
  { id: 'barcode-generator', name: 'Barcode Generator', description: 'Generate EAN-13, Code128, and other barcode formats', category: 'generator', icon: '🔲', tags: ['barcode', 'ean', 'code128', 'qr', 'scan', 'generator'], new: true },
  { id: 'image-compressor', name: 'Image Compressor', description: 'Compress and optimize images while preserving quality', category: 'converter', icon: '📸', tags: ['image', 'compress', 'optimize', 'quality', 'size', 'jpg', 'png'], new: true },

  // npm
  { id: 'npm-checker', name: 'npm Package Checker', description: 'Look up any npm package — version, downloads, bundle size, dependencies, and changelog', category: 'web', icon: '📦', tags: ['npm', 'package', 'node', 'registry', 'bundle', 'dependencies', 'version'], popular: true, new: true },

  // SVG Icons
  { id: 'svg-icons', name: 'SVG Icon Browser', description: 'Search and browse 200,000+ icons from Heroicons, Lucide, Material, Tabler and more — copy SVG, JSX, or CDN link instantly', category: 'web', icon: '🎨', tags: ['svg', 'icons', 'heroicons', 'lucide', 'material', 'tabler', 'iconify', 'design'], popular: true, new: true },

  // .NET / C#
  { id: 'json-to-csharp', name: 'JSON to C# Classes', description: 'Generate C# class definitions from JSON — supports nested objects, arrays, nullable types, Newtonsoft & System.Text.Json attributes', category: 'dotnet', icon: '🔷', tags: ['csharp', 'dotnet', 'json', 'class', 'model', 'poco', 'dto', 'newtonsoft', 'c#'], popular: true, new: true },
  { id: 'nuget-checker', name: 'NuGet Package Checker', description: 'Search NuGet packages — version history, download stats, install commands, PackageReference snippets', category: 'dotnet', icon: '📦', tags: ['nuget', 'package', 'dotnet', 'csharp', 'c#', '.net', 'library', 'dependency'], popular: true, new: true },
  { id: 'connection-string-builder', name: 'Connection String Builder', description: 'Build database connection strings for SQL Server, MySQL, PostgreSQL, SQLite, Oracle and MongoDB with live preview', category: 'dotnet', icon: '🔌', tags: ['connection', 'string', 'sql', 'server', 'mysql', 'postgresql', 'sqlite', 'oracle', 'mongodb', 'ef', 'dotnet'], popular: true, new: true },
  { id: 'csharp-string-escape', name: 'C# String Escape', description: 'Escape/unescape C# strings — regular, verbatim @"..." and interpolated $"..." string formats', category: 'dotnet', icon: '✏️', tags: ['csharp', 'c#', 'string', 'escape', 'verbatim', 'interpolated', 'dotnet'], new: true },
  { id: 'sql-to-linq', name: 'SQL to LINQ', description: 'Convert SQL SELECT queries to LINQ method syntax — WHERE, ORDER BY, GROUP BY, HAVING, DISTINCT, TOP', category: 'dotnet', icon: '🔃', tags: ['sql', 'linq', 'csharp', 'c#', 'dotnet', 'query', 'convert', 'ef', 'entity framework'], popular: true, new: true },

  // Diagram & Visualization
  { id: 'diagram-creator', name: 'Diagram Creator', description: 'Create flowcharts, sequence diagrams, ER diagrams, class diagrams, Gantt, mindmaps using Mermaid syntax — export SVG/PNG', category: 'misc', icon: '🗂️', tags: ['diagram', 'mermaid', 'flowchart', 'sequence', 'erd', 'uml', 'class', 'gantt', 'mindmap', 'chart'], popular: true, new: true },
  { id: 'erd-diagram', name: 'ERD Diagram', description: 'Paste CREATE TABLE SQL to generate an interactive Entity Relationship Diagram — drag tables, visualize FK relationships', category: 'dotnet', icon: '🔗', tags: ['erd', 'sql', 'diagram', 'entity', 'relationship', 'table', 'schema', 'foreign key', 'database'], popular: true, new: true },
  { id: 'sql-plan-viewer', name: 'SQL Execution Plan Viewer', description: 'Visualize PostgreSQL EXPLAIN ANALYZE and MySQL EXPLAIN output as an annotated tree — spot slow operations instantly', category: 'dotnet', icon: '📊', tags: ['sql', 'explain', 'execution', 'plan', 'postgresql', 'mysql', 'performance', 'query', 'index'], popular: true, new: true },
  { id: 'log-viewer', name: 'Log Viewer', description: 'Parse and view structured logs — JSON Lines (Serilog, Pino), .NET NLog, Apache/Nginx access logs — filter by level, search', category: 'misc', icon: '📋', tags: ['log', 'viewer', 'serilog', 'nlog', 'json', 'apache', 'nginx', 'dotnet', 'debug', 'error', 'filter'], popular: true, new: true },

  // Network / Web tools
  { id: 'dns-lookup', name: 'DNS Lookup', description: 'Query DNS records for any domain — A, AAAA, MX, TXT, NS, CNAME, SOA and more via Cloudflare DNS-over-HTTPS', category: 'web', icon: '🌐', tags: ['dns', 'lookup', 'domain', 'a', 'mx', 'txt', 'ns', 'cname', 'nameserver', 'record'], popular: true, new: true },
  { id: 'ip-lookup', name: 'IP Address Lookup', description: 'Look up geolocation, ASN, timezone and organization for any IP address — detects your own IP automatically', category: 'web', icon: '📍', tags: ['ip', 'lookup', 'geolocation', 'asn', 'country', 'city', 'timezone', 'network'], popular: true, new: true },
  { id: 'ssl-checker', name: 'SSL Certificate Checker', description: 'Check SSL/TLS certificate validity, expiry date, issuer and SANs for any domain via Certificate Transparency logs', category: 'web', icon: '🔒', tags: ['ssl', 'tls', 'certificate', 'https', 'expiry', 'domain', 'security', 'crt.sh'], popular: true, new: true },
  { id: 'http-request-builder', name: 'HTTP Request Builder', description: 'Build and send HTTP requests with custom headers, body, params — generate fetch, axios, curl, Python code snippets', category: 'web', icon: '📡', tags: ['http', 'request', 'api', 'rest', 'fetch', 'axios', 'curl', 'get', 'post', 'headers', 'builder'], popular: true, new: true },
  { id: 'user-agent-parser', name: 'User-Agent Parser', description: 'Parse User-Agent strings to detect browser, OS, device type and brand — analyze any UA or test your own browser', category: 'web', icon: '🕵️', tags: ['user-agent', 'browser', 'os', 'device', 'parse', 'chrome', 'firefox', 'safari', 'mobile', 'detect'], new: true },

  // Color tools
  { id: 'color-extractor', name: 'Color Extractor', description: 'Upload an image to extract its dominant color palette — copy HEX, RGB, HSL values with proportional preview strip', category: 'color', icon: '🎨', tags: ['color', 'palette', 'extract', 'image', 'dominant', 'hex', 'rgb', 'hsl'], new: true },
  { id: 'color-contrast', name: 'Color Contrast Checker', description: 'Check WCAG 2.1 color contrast ratio — AA and AAA compliance for normal/large text with live preview', category: 'color', icon: '👁️', tags: ['color', 'contrast', 'wcag', 'accessibility', 'a11y', 'aa', 'aaa', 'ratio'], new: true },

  // CSS / Web visual
  { id: 'css-filter-generator', name: 'CSS Filter Generator', description: 'Visually adjust blur, brightness, contrast, hue-rotate and more — generates CSS filter property with live preview', category: 'web', icon: '🎛️', tags: ['css', 'filter', 'blur', 'brightness', 'contrast', 'grayscale', 'sepia', 'generator'], new: true },
  { id: 'px-to-rem', name: 'Px ↔ Rem Converter', description: 'Convert between px and rem units with configurable base font size — includes reference table and CSS snippet', category: 'web', icon: '📐', tags: ['px', 'rem', 'converter', 'css', 'font-size', 'responsive', 'units'], new: true },
  { id: 'svg-previewer', name: 'SVG Previewer', description: 'Preview and edit SVG code with zoom, background options, element info — export as SVG or PNG', category: 'web', icon: '✏️', tags: ['svg', 'preview', 'editor', 'zoom', 'export', 'png', 'vector'], new: true },

  // Crypto / Security
  { id: 'password-strength', name: 'Password Strength Checker', description: 'Check password strength with entropy score, crack time estimate, WCAG checklist and improvement suggestions', category: 'crypto', icon: '🔑', tags: ['password', 'strength', 'entropy', 'security', 'crack', 'checker', 'validate'], new: true },
  { id: 'cert-decoder', name: 'Certificate Decoder', description: 'Decode X.509 PEM certificates — view subject, issuer, validity dates, serial, extensions and public key info', category: 'crypto', icon: '📜', tags: ['certificate', 'x509', 'pem', 'ssl', 'tls', 'decode', 'x.509', 'openssl', 'security'], new: true },

  // Generator
  { id: 'national-id-generator', name: 'National ID Generator', description: 'Generate test national identity numbers — Vietnam CCCD, US SSN, UK NI Number, Singapore NRIC, Germany, France', category: 'generator', icon: '🪪', tags: ['national', 'id', 'identity', 'ssn', 'cccd', 'nric', 'generator', 'test', 'fake'], new: true },

  // Formatter
  { id: 'xml-minifier', name: 'XML Minifier / Formatter', description: 'Minify XML by removing whitespace and comments, or format/beautify XML with configurable indentation', category: 'formatter', icon: '📄', tags: ['xml', 'minify', 'format', 'beautify', 'compress', 'whitespace', 'comments'], new: true },

  // SQL Reference
  { id: 'sql-syntax', name: 'SQL Syntax Reference', description: 'Complete SQL syntax reference with copy-ready examples — DDL, SELECT, JOINs, CTEs, Window Functions, DML, Transactions', category: 'dotnet', icon: '📖', tags: ['sql', 'syntax', 'reference', 'select', 'join', 'ddl', 'dml', 'cte', 'window', 'functions', 'tsql'], popular: true, new: true },

  // AI Tools
  { id: 'ai-token-counter', name: 'Token Counter', description: 'Estimate token count for GPT, Claude and Gemini models — track context usage and cost before calling the API', category: 'ai', icon: '🪙', tags: ['ai', 'token', 'gpt', 'claude', 'gemini', 'openai', 'anthropic', 'count', 'context'], new: true, popular: true },
  { id: 'ai-cost-calculator', name: 'AI Cost Calculator', description: 'Calculate API cost for any AI model — enter input/output tokens and get exact pricing for GPT-4o, Claude, Gemini and more', category: 'ai', icon: '💰', tags: ['ai', 'cost', 'price', 'gpt', 'claude', 'gemini', 'openai', 'anthropic', 'token', 'calculator'], new: true },
  { id: 'ai-prompt-builder', name: 'Prompt Builder', description: 'Build structured AI prompts with System / User / Assistant roles — export as OpenAI JSON or plain text', category: 'ai', icon: '🧱', tags: ['ai', 'prompt', 'system', 'user', 'assistant', 'openai', 'chatgpt', 'builder', 'json'], new: true },
  { id: 'ai-model-comparison', name: 'Model Comparison', description: 'Compare GPT, Claude, Gemini and open-source models — context window, pricing, strengths side by side', category: 'ai', icon: '⚖️', tags: ['ai', 'model', 'compare', 'gpt', 'claude', 'gemini', 'llama', 'context', 'price'], new: true },
  { id: 'ai-json-to-prompt', name: 'JSON → Prompt', description: 'Convert JSON data into a natural language prompt — describe objects, arrays and values in readable sentences', category: 'ai', icon: '🔀', tags: ['ai', 'json', 'prompt', 'convert', 'natural', 'language', 'describe'], new: true },
  { id: 'ai-system-prompt', name: 'System Prompt Generator', description: 'Generate system prompts for AI assistants — choose use case, tone and constraints to get a ready-to-use prompt', category: 'ai', icon: '⚙️', tags: ['ai', 'system', 'prompt', 'generator', 'assistant', 'chatbot', 'instruction'], new: true },
]
