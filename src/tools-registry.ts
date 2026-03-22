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
    description: 'Format, validate and beautify JSON data online',
    category: 'json',
    icon: '📋',
    tags: ['json', 'format', 'validate', 'beautify', 'online'],
    popular: true,
  },
  {
    id: 'json-minifier',
    name: 'JSON Minifier',
    description: 'Minify and compress JSON data online',
    category: 'json',
    icon: '📉',
    tags: ['json', 'minify', 'compress', 'online'],
  },
  {
    id: 'json-to-csv',
    name: 'JSON to CSV',
    description: 'Convert JSON array data to CSV format online',
    category: 'json',
    icon: '📊',
    tags: ['json', 'csv', 'convert', 'online'],
  },
  {
    id: 'json-diff',
    name: 'JSON Diff',
    description: 'Compare and find differences between two JSON objects online',
    category: 'json',
    icon: '🔍',
    tags: ['json', 'diff', 'compare', 'online'],
    new: true,
  },

  // Encoding
  {
    id: 'base64-encode-decode',
    name: 'Base64 Encode/Decode',
    description: 'Encode and decode Base64 strings online',
    category: 'encoding',
    icon: '🔐',
    tags: ['base64', 'encode', 'decode', 'online'],
    popular: true,
  },
  {
    id: 'url-encode-decode',
    name: 'URL Encode/Decode',
    description: 'Encode and decode URL strings online',
    category: 'encoding',
    icon: '🔗',
    tags: ['url', 'encode', 'decode', 'percent', 'online'],
    popular: true,
  },
  {
    id: 'html-encode-decode',
    name: 'HTML Encode/Decode',
    description: 'Encode and decode HTML entities online',
    category: 'encoding',
    icon: '🏷️',
    tags: ['html', 'encode', 'decode', 'entities', 'online'],
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    description: 'Decode and inspect JSON Web Tokens online',
    category: 'encoding',
    icon: '🎫',
    tags: ['jwt', 'token', 'decode', 'auth', 'online'],
    popular: true,
  },

  // Crypto & Hash
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA1, SHA256, SHA512 hashes online',
    category: 'crypto',
    icon: '🔒',
    tags: ['hash', 'md5', 'sha1', 'sha256', 'sha512', 'crypto', 'online'],
    popular: true,
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate strong, secure passwords online',
    category: 'crypto',
    icon: '🔑',
    tags: ['password', 'generator', 'security', 'random', 'online'],
    popular: true,
  },
  {
    id: 'bcrypt',
    name: 'BCrypt Hash',
    description: 'Generate and verify BCrypt password hashes online',
    category: 'crypto',
    icon: '🛡️',
    tags: ['bcrypt', 'hash', 'password', 'security', 'online'],
    new: true,
  },

  // String
  {
    id: 'string-case-converter',
    name: 'Case Converter',
    description: 'Convert strings between camelCase, snake_case, PascalCase, kebab-case and more online',
    category: 'string',
    icon: '🔤',
    tags: ['string', 'case', 'camel', 'snake', 'pascal', 'kebab', 'online'],
    popular: true,
  },
  {
    id: 'text-diff',
    name: 'Text Diff',
    description: 'Find differences between two text blocks online',
    category: 'string',
    icon: '📝',
    tags: ['text', 'diff', 'compare', 'online'],
  },
  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum',
    description: 'Generate Lorem Ipsum placeholder text online',
    category: 'string',
    icon: '📃',
    tags: ['lorem', 'ipsum', 'placeholder', 'text', 'generator', 'online'],
  },
  {
    id: 'string-inspector',
    name: 'String Inspector',
    description: 'Analyze strings: length, word count, char frequency online',
    category: 'string',
    icon: '🔎',
    tags: ['string', 'analyze', 'count', 'inspect', 'online'],
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test and debug regular expressions with live highlighting online',
    category: 'string',
    icon: '🎯',
    tags: ['regex', 'regexp', 'test', 'pattern', 'match', 'online'],
    popular: true,
  },

  // Number
  {
    id: 'number-base-converter',
    name: 'Number Base Converter',
    description: 'Convert between binary, octal, decimal, and hexadecimal online',
    category: 'number',
    icon: '🔢',
    tags: ['number', 'binary', 'hex', 'octal', 'decimal', 'convert', 'online'],
  },
  {
    id: 'byte-converter',
    name: 'Byte / Size Converter',
    description: 'Convert between bytes, KB, MB, GB, TB online',
    category: 'number',
    icon: '💾',
    tags: ['bytes', 'kb', 'mb', 'gb', 'size', 'convert', 'online'],
  },

  // Date & Time
  {
    id: 'unix-timestamp',
    name: 'Unix Timestamp',
    description: 'Convert between Unix timestamps and human-readable dates online',
    category: 'datetime',
    icon: '📅',
    tags: ['unix', 'timestamp', 'date', 'time', 'convert', 'online'],
    popular: true,
  },
  {
    id: 'cron-parser',
    name: 'Cron Expression Parser',
    description: 'Parse and explain cron job expressions online',
    category: 'datetime',
    icon: '⏰',
    tags: ['cron', 'schedule', 'expression', 'parse', 'online'],
    new: true,
  },

  // Web
  {
    id: 'css-minifier',
    name: 'CSS Minifier',
    description: 'Minify and compress CSS code online',
    category: 'web',
    icon: '🎨',
    tags: ['css', 'minify', 'compress', 'web', 'online'],
  },
  {
    id: 'html-minifier',
    name: 'HTML Minifier',
    description: 'Minify and compress HTML markup online',
    category: 'web',
    icon: '🌐',
    tags: ['html', 'minify', 'compress', 'web', 'online'],
  },
  {
    id: 'markdown-preview',
    name: 'Markdown Preview',
    description: 'Live preview of Markdown rendered to HTML online',
    category: 'web',
    icon: '📖',
    tags: ['markdown', 'preview', 'render', 'html', 'online'],
    popular: true,
  },
  {
    id: 'meta-tag-generator',
    name: 'Meta Tag Generator',
    description: 'Generate SEO meta tags for your website online',
    category: 'web',
    icon: '🏷️',
    tags: ['meta', 'seo', 'tags', 'html', 'generator', 'online'],
    new: true,
  },

  // Color
  {
    id: 'color-converter',
    name: 'Color Converter',
    description: 'Convert between HEX, RGB, HSL, and HSV color formats online',
    category: 'color',
    icon: '🎨',
    tags: ['color', 'hex', 'rgb', 'hsl', 'hsv', 'convert', 'online'],
    popular: true,
  },
  {
    id: 'color-palette',
    name: 'Color Palette Generator',
    description: 'Generate beautiful color palettes and gradients online',
    category: 'color',
    icon: '🖌️',
    tags: ['color', 'palette', 'gradient', 'generator', 'online'],
    new: true,
  },

  // Generators
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate UUID v1, v4, and v7 identifiers online',
    category: 'generator',
    icon: '⚡',
    tags: ['uuid', 'guid', 'generate', 'id', 'random', 'online'],
    popular: true,
  },
  {
    id: 'random-string',
    name: 'Random String Generator',
    description: 'Generate random strings with custom length and charset online',
    category: 'generator',
    icon: '🎲',
    tags: ['random', 'string', 'generator', 'token', 'online'],
  },

  // Formatters
  {
    id: 'sql-formatter',
    name: 'SQL Formatter',
    description: 'Format and beautify SQL queries online — free SQL formatter',
    category: 'formatter',
    icon: '🗄️',
    tags: ['sql', 'format', 'query', 'database', 'online', 'beautify'],
  },
  {
    id: 'xml-formatter',
    name: 'XML Formatter',
    description: 'Format and validate XML documents online',
    category: 'formatter',
    icon: '📄',
    tags: ['xml', 'format', 'validate', 'beautify', 'online'],
  },

  // Misc
  {
    id: 'image-to-base64',
    name: 'Image to Base64',
    description: 'Convert images to Base64 encoded data URLs online',
    category: 'misc',
    icon: '🖼️',
    tags: ['image', 'base64', 'convert', 'data-url', 'online'],
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes from text or URLs online',
    category: 'misc',
    icon: '📱',
    tags: ['qr', 'qrcode', 'generate', 'barcode', 'online'],
  },

  // ── New tools ──────────────────────────────────────────────────────────────

  // JSON (new)
  {
    id: 'yaml-json',
    name: 'YAML ↔ JSON',
    description: 'Convert between YAML and JSON formats online',
    category: 'json',
    icon: '📄',
    tags: ['yaml', 'json', 'convert', 'online'],
    new: true,
  },
  {
    id: 'json-to-typescript',
    name: 'JSON to TypeScript',
    description: 'Generate TypeScript interfaces from JSON data online',
    category: 'json',
    icon: '🔷',
    tags: ['json', 'typescript', 'interface', 'type', 'generate', 'online'],
    new: true,
  },
  {
    id: 'jsonpath-tester',
    name: 'JSONPath Tester',
    description: 'Test JSONPath expressions against JSON data interactively online',
    category: 'json',
    icon: '🎯',
    tags: ['jsonpath', 'json', 'query', 'path', 'filter', 'online'],
    new: true,
  },
  {
    id: 'json-schema-validator',
    name: 'JSON Schema Validator',
    description: 'Validate JSON data against a JSON Schema online',
    category: 'json',
    icon: '✅',
    tags: ['json', 'schema', 'validate', 'jsonschema', 'online'],
    new: true,
  },

  // Encoding (new)
  {
    id: 'hex-encode-decode',
    name: 'Hex Encode/Decode',
    description: 'Encode text to hexadecimal or decode hex back to text online',
    category: 'encoding',
    icon: '🔢',
    tags: ['hex', 'hexadecimal', 'encode', 'decode', 'online'],
    new: true,
  },
  {
    id: 'binary-encode-decode',
    name: 'Binary Encode/Decode',
    description: 'Encode text to binary bits or decode binary back to text online',
    category: 'encoding',
    icon: '💻',
    tags: ['binary', 'bits', 'encode', 'decode', 'online'],
    new: true,
  },

  // String (new)
  {
    id: 'slug-generator',
    name: 'Slug Generator',
    description: 'Convert text to URL-friendly slugs with custom options online',
    category: 'string',
    icon: '🔗',
    tags: ['slug', 'url', 'permalink', 'string', 'seo', 'online'],
    new: true,
  },
  {
    id: 'string-escape',
    name: 'String Escape/Unescape',
    description: 'Escape and unescape strings for JS, JSON, HTML, Regex, and URL online',
    category: 'string',
    icon: '🔧',
    tags: ['escape', 'unescape', 'string', 'js', 'json', 'html', 'regex', 'online'],
    new: true,
  },
  {
    id: 'html-to-markdown',
    name: 'HTML to Markdown',
    description: 'Convert HTML markup to clean Markdown syntax online',
    category: 'string',
    icon: '📝',
    tags: ['html', 'markdown', 'convert', 'md', 'online'],
    new: true,
  },

  // Date & Time (new)
  {
    id: 'timezone-converter',
    name: 'Timezone Converter',
    description: 'Convert time between different timezones around the world online',
    category: 'datetime',
    icon: '🌍',
    tags: ['timezone', 'time', 'convert', 'utc', 'dst', 'world', 'online'],
    new: true,
  },
  {
    id: 'date-calculator',
    name: 'Date Calculator',
    description: 'Calculate difference between dates or add/subtract time online',
    category: 'datetime',
    icon: '🗓️',
    tags: ['date', 'calculator', 'difference', 'days', 'add', 'subtract', 'online'],
    new: true,
  },

  // Web (new)
  {
    id: 'css-formatter',
    name: 'CSS Formatter',
    description: 'Beautify or minify CSS code online',
    category: 'web',
    icon: '✨',
    tags: ['css', 'format', 'beautify', 'minify', 'web', 'online'],
    new: true,
  },
  {
    id: 'js-formatter',
    name: 'JS Minifier / Formatter',
    description: 'Minify or beautify JavaScript code online',
    category: 'web',
    icon: '⚡',
    tags: ['javascript', 'js', 'minify', 'format', 'beautify', 'online'],
    new: true,
  },
  {
    id: 'url-parser',
    name: 'URL Parser',
    description: 'Parse a URL into its components: protocol, host, path, query params online',
    category: 'web',
    icon: '🔍',
    tags: ['url', 'parse', 'query', 'params', 'host', 'path', 'online'],
    new: true,
  },

  // Formatters (new)
  {
    id: 'yaml-formatter',
    name: 'YAML Formatter',
    description: 'Format and validate YAML documents online',
    category: 'formatter',
    icon: '📋',
    tags: ['yaml', 'format', 'validate', 'beautify', 'online'],
    new: true,
  },
  {
    id: 'csv-to-json',
    name: 'CSV to JSON',
    description: 'Convert CSV data to JSON array with auto-detect delimiter online',
    category: 'formatter',
    icon: '📊',
    tags: ['csv', 'json', 'convert', 'table', 'data', 'online'],
    new: true,
  },

  // Misc (new)
  {
    id: 'chmod-calculator',
    name: 'Chmod Calculator',
    description: 'Calculate Unix file permissions from octal or symbolic notation online',
    category: 'misc',
    icon: '🔐',
    tags: ['chmod', 'unix', 'linux', 'permissions', 'octal', 'rwx', 'online'],
    new: true,
  },

  // Crypto (new)
  {
    id: 'jwt-encoder',
    name: 'JWT Encoder',
    description: 'Create and sign JSON Web Tokens with HS256/HS384/HS512 online',
    category: 'crypto',
    icon: '🎟️',
    tags: ['jwt', 'token', 'encode', 'sign', 'hmac', 'auth', 'online'],
    new: true,
  },

  // Converter
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Convert images between JPG, PNG, WebP, and BMP formats online',
    category: 'converter',
    icon: '🖼️',
    tags: ['image', 'convert', 'jpg', 'png', 'webp', 'bmp', 'online'],
    new: true,
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Resize and compress images with quality control online',
    category: 'converter',
    icon: '📐',
    tags: ['image', 'resize', 'compress', 'quality', 'scale', 'online'],
    new: true,
  },
  {
    id: 'svg-to-png',
    name: 'SVG to PNG / JPG',
    description: 'Convert SVG vector files to rasterized PNG or JPG images online',
    category: 'converter',
    icon: '✏️',
    tags: ['svg', 'png', 'jpg', 'convert', 'rasterize', 'vector', 'online'],
    new: true,
  },
  {
    id: 'csv-to-excel',
    name: 'CSV to Excel',
    description: 'Convert CSV files to Excel XLSX spreadsheet format online',
    category: 'converter',
    icon: '📊',
    tags: ['csv', 'excel', 'xlsx', 'convert', 'spreadsheet', 'online'],
    new: true,
  },
  {
    id: 'json-to-excel',
    name: 'JSON to Excel',
    description: 'Export JSON array data to Excel XLSX spreadsheet online',
    category: 'converter',
    icon: '📋',
    tags: ['json', 'excel', 'xlsx', 'convert', 'spreadsheet', 'export', 'online'],
    new: true,
  },
  {
    id: 'markdown-to-html',
    name: 'Markdown to HTML',
    description: 'Convert Markdown to styled HTML and download as a file online',
    category: 'converter',
    icon: '📝',
    tags: ['markdown', 'html', 'convert', 'export', 'md', 'online'],
    new: true,
  },
  {
    id: 'html-to-pdf',
    name: 'HTML to PDF',
    description: 'Render HTML content and export to PDF via browser print online',
    category: 'converter',
    icon: '📄',
    tags: ['html', 'pdf', 'convert', 'print', 'export', 'online'],
    new: true,
  },

  // String (new batch 2)
  { id: 'text-sorter', name: 'Text Sorter', description: 'Sort, deduplicate, reverse and shuffle text lines online', category: 'string', icon: '📑', tags: ['text', 'sort', 'deduplicate', 'lines', 'shuffle', 'online'], new: true },
  { id: 'word-frequency', name: 'Word Frequency', description: 'Count word and character frequency in text online', category: 'string', icon: '📊', tags: ['word', 'frequency', 'count', 'text', 'analyze', 'online'], new: true },
  { id: 'text-stats', name: 'Text Statistics', description: 'Detailed text stats: reading time, sentences, paragraphs online', category: 'string', icon: '📈', tags: ['text', 'statistics', 'reading', 'time', 'words', 'sentences', 'online'], new: true },

  // JSON (new batch 2)
  { id: 'json-to-code', name: 'JSON to Code', description: 'Generate Python, PHP, Go, Ruby, Java code from JSON online', category: 'json', icon: '💻', tags: ['json', 'code', 'python', 'php', 'go', 'ruby', 'generate', 'online'], new: true },

  // Crypto (new batch 2)
  { id: 'aes-encrypt', name: 'AES Encrypt / Decrypt', description: 'Encrypt and decrypt text using AES-256-GCM in the browser online', category: 'crypto', icon: '🛡️', tags: ['aes', 'encrypt', 'decrypt', 'crypto', 'security', 'cipher', 'online'], new: true },
  { id: 'totp-generator', name: 'TOTP / 2FA Generator', description: 'Generate and verify time-based one-time passwords (RFC 6238) online', category: 'crypto', icon: '🔑', tags: ['totp', '2fa', 'otp', 'authenticator', 'mfa', 'google', 'online'], new: true },

  // Number (new batch 2)
  { id: 'unit-converter', name: 'Unit Converter', description: 'Convert between units: length, weight, temperature, area, speed online', category: 'number', icon: '📏', tags: ['unit', 'convert', 'length', 'weight', 'temperature', 'area', 'speed', 'online'], new: true },
  { id: 'math-evaluator', name: 'Math Evaluator', description: 'Evaluate mathematical expressions with variables and functions online', category: 'number', icon: '🧮', tags: ['math', 'calculator', 'expression', 'evaluate', 'formula', 'online'], new: true },

  // Color (new batch 2)
  { id: 'css-gradient', name: 'CSS Gradient Generator', description: 'Visually build linear, radial, and conic CSS gradients online', category: 'color', icon: '🌈', tags: ['css', 'gradient', 'linear', 'radial', 'color', 'generator', 'online'], new: true },
  { id: 'css-shadow', name: 'CSS Shadow Generator', description: 'Visually build box-shadow and text-shadow CSS values online', category: 'color', icon: '🌑', tags: ['css', 'shadow', 'box-shadow', 'text-shadow', 'generator', 'online'], new: true },

  // Web (new batch 2)
  { id: 'http-status-codes', name: 'HTTP Status Codes', description: 'Searchable reference for all HTTP status codes with descriptions online', category: 'web', icon: '🌐', tags: ['http', 'status', 'codes', '404', '200', '500', 'reference', 'online'], new: true },
  { id: 'mime-types', name: 'MIME Types Lookup', description: 'Look up MIME types by file extension or content type online', category: 'web', icon: '📂', tags: ['mime', 'type', 'extension', 'content-type', 'file', 'online'], new: true },
  { id: 'curl-to-code', name: 'Curl to Code', description: 'Convert curl commands to fetch, axios, or Python requests code online', category: 'web', icon: '⚡', tags: ['curl', 'fetch', 'axios', 'python', 'http', 'convert', 'online'], new: true },

  // Generator (new batch 2)
  { id: 'data-faker', name: 'Data Faker', description: 'Generate realistic fake test data: names, emails, phones, addresses online', category: 'generator', icon: '🎭', tags: ['fake', 'data', 'faker', 'test', 'name', 'email', 'phone', 'mock', 'online'], new: true },

  // Generator (original)
  {
    id: 'nanoid-generator',
    name: 'Nano ID / ULID',
    description: 'Generate compact unique identifiers: Nano IDs and ULIDs online',
    category: 'generator',
    icon: '🆔',
    tags: ['nanoid', 'ulid', 'id', 'generate', 'unique', 'random', 'online'],
    new: true,
  },

  // Batch 4 - Text/Code
  { id: 'html-formatter', name: 'HTML Formatter', description: 'Beautify and format HTML markup with proper indentation online', category: 'web', icon: '🖊️', tags: ['html', 'format', 'beautify', 'indent', 'web', 'online'], new: true },
  { id: 'csv-viewer', name: 'CSV Viewer', description: 'View and explore CSV data as an interactive table with sorting online', category: 'formatter', icon: '📋', tags: ['csv', 'table', 'viewer', 'sort', 'filter', 'data', 'online'], new: true },
  { id: 'env-parser', name: '.ENV Parser', description: 'Parse .env files to JSON and convert back, view key/value pairs online', category: 'misc', icon: '🔑', tags: ['env', 'dotenv', 'environment', 'json', 'config', 'parse', 'online'], new: true },
  { id: 'markdown-table', name: 'Markdown Table Generator', description: 'Create Markdown tables from a visual grid editor online', category: 'string', icon: '📊', tags: ['markdown', 'table', 'generator', 'md', 'grid', 'online'], new: true },

  // Batch 4 - Web/Network
  { id: 'cidr-calculator', name: 'CIDR / IP Calculator', description: 'Calculate subnet, broadcast address, host range from CIDR notation online', category: 'web', icon: '🌐', tags: ['cidr', 'ip', 'subnet', 'network', 'calculator', 'ipv4', 'online'], new: true },
  { id: 'http-headers-builder', name: 'HTTP Security Headers', description: 'Build and understand CORS, CSP, HSTS and other security headers online', category: 'web', icon: '🔒', tags: ['http', 'headers', 'cors', 'csp', 'hsts', 'security', 'online'], new: true },
  { id: 'robots-txt', name: 'robots.txt Generator', description: 'Generate robots.txt file with GUI rule builder for crawlers online', category: 'web', icon: '🤖', tags: ['robots', 'txt', 'seo', 'crawler', 'sitemap', 'generator', 'online'], new: true },
  { id: 'sitemap-generator', name: 'Sitemap Generator', description: 'Generate XML sitemap from a list of URLs online', category: 'web', icon: '🗺️', tags: ['sitemap', 'xml', 'seo', 'url', 'generator', 'online'], new: true },

  // Batch 4 - Dev Tools
  { id: 'keycode-tester', name: 'KeyCode Tester', description: 'Test keyboard events and inspect key codes, modifiers, and event properties online', category: 'misc', icon: '⌨️', tags: ['keycode', 'keyboard', 'event', 'key', 'shortcut', 'test', 'online'], new: true },
  { id: 'aspect-ratio', name: 'Aspect Ratio Calculator', description: 'Calculate and convert aspect ratios for images and video (16:9, 4:3...) online', category: 'number', icon: '📐', tags: ['aspect', 'ratio', 'resolution', 'image', 'video', '16:9', 'online'], new: true },
  { id: 'number-formatter', name: 'Number Formatter', description: 'Format numbers with locale-aware separators, currency, and notation online', category: 'number', icon: '🔢', tags: ['number', 'format', 'locale', 'currency', 'thousand', 'separator', 'online'], new: true },
  { id: 'ts-to-js', name: 'TypeScript → JavaScript', description: 'Strip TypeScript types and transpile TS to plain JavaScript online', category: 'web', icon: '🟡', tags: ['typescript', 'javascript', 'ts', 'js', 'transpile', 'convert', 'online'], new: true },

  // Batch 4 - Media/Visual
  { id: 'favicon-generator', name: 'Favicon Generator', description: 'Generate favicons from emoji or text in multiple sizes online', category: 'generator', icon: '🎨', tags: ['favicon', 'icon', 'emoji', 'png', 'generator', 'website', 'online'], new: true },
  { id: 'barcode-generator', name: 'Barcode Generator', description: 'Generate EAN-13, Code128, and other barcode formats online', category: 'generator', icon: '🔲', tags: ['barcode', 'ean', 'code128', 'qr', 'scan', 'generator', 'online'], new: true },
  { id: 'image-compressor', name: 'Image Compressor', description: 'Compress and optimize images while preserving quality online', category: 'converter', icon: '📸', tags: ['image', 'compress', 'optimize', 'quality', 'size', 'jpg', 'png', 'online'], new: true },

  // npm
  { id: 'npm-checker', name: 'npm Package Checker', description: 'Look up any npm package — version, downloads, bundle size, dependencies, and changelog online', category: 'web', icon: '📦', tags: ['npm', 'package', 'node', 'registry', 'bundle', 'dependencies', 'version', 'online'], popular: true, new: true },

  // SVG Icons
  { id: 'svg-icons', name: 'SVG Icon Browser', description: 'Search and browse 200,000+ icons from Heroicons, Lucide, Material, Tabler and more — copy SVG, JSX, or CDN link instantly online', category: 'web', icon: '🎨', tags: ['svg', 'icons', 'heroicons', 'lucide', 'material', 'tabler', 'iconify', 'design', 'online'], popular: true, new: true },

  // .NET / C#
  { id: 'json-to-csharp', name: 'JSON to C# Classes', description: 'Generate C# class definitions from JSON — supports nested objects, arrays, nullable types, Newtonsoft & System.Text.Json attributes online', category: 'dotnet', icon: '🔷', tags: ['csharp', 'dotnet', 'json', 'class', 'model', 'poco', 'dto', 'newtonsoft', 'c#', 'online'], popular: true, new: true },
  { id: 'nuget-checker', name: 'NuGet Package Checker', description: 'Search NuGet packages — version history, download stats, install commands, PackageReference snippets online', category: 'dotnet', icon: '📦', tags: ['nuget', 'package', 'dotnet', 'csharp', 'c#', '.net', 'library', 'dependency', 'online'], popular: true, new: true },
  { id: 'connection-string-builder', name: 'Connection String Builder', description: 'Build database connection strings for SQL Server, MySQL, PostgreSQL, SQLite, Oracle and MongoDB with live preview online', category: 'dotnet', icon: '🔌', tags: ['connection', 'string', 'sql', 'server', 'mysql', 'postgresql', 'sqlite', 'oracle', 'mongodb', 'ef', 'dotnet', 'online'], popular: true, new: true },
  { id: 'csharp-string-escape', name: 'C# String Escape', description: 'Escape/unescape C# strings — regular, verbatim @"..." and interpolated $"..." string formats online', category: 'dotnet', icon: '✏️', tags: ['csharp', 'c#', 'string', 'escape', 'verbatim', 'interpolated', 'dotnet', 'online'], new: true },
  { id: 'sql-to-linq', name: 'SQL to LINQ', description: 'Convert SQL SELECT queries to LINQ method syntax — WHERE, ORDER BY, GROUP BY, HAVING, DISTINCT, TOP online', category: 'dotnet', icon: '🔃', tags: ['sql', 'linq', 'csharp', 'c#', 'dotnet', 'query', 'convert', 'ef', 'entity framework', 'online'], popular: true, new: true },

  // Diagram & Visualization
  { id: 'diagram-creator', name: 'Diagram Creator', description: 'Create flowcharts, sequence diagrams, ER diagrams, class diagrams, Gantt, mindmaps using Mermaid syntax — export SVG/PNG online', category: 'misc', icon: '🗂️', tags: ['diagram', 'mermaid', 'flowchart', 'sequence', 'erd', 'uml', 'class', 'gantt', 'mindmap', 'chart', 'online'], popular: true, new: true },
  { id: 'erd-diagram', name: 'ERD Diagram', description: 'Paste CREATE TABLE SQL to generate an interactive Entity Relationship Diagram — drag tables, visualize FK relationships online', category: 'dotnet', icon: '🔗', tags: ['erd', 'sql', 'diagram', 'entity', 'relationship', 'table', 'schema', 'foreign key', 'database', 'online'], popular: true, new: true },
  { id: 'sql-plan-viewer', name: 'SQL Execution Plan Viewer', description: 'Visualize PostgreSQL EXPLAIN ANALYZE and MySQL EXPLAIN output as an annotated tree — spot slow operations instantly online', category: 'dotnet', icon: '📊', tags: ['sql', 'explain', 'execution', 'plan', 'postgresql', 'mysql', 'performance', 'query', 'index', 'online'], popular: true, new: true },
  { id: 'log-viewer', name: 'Log Viewer', description: 'Parse and view structured logs — JSON Lines (Serilog, Pino), .NET NLog, Apache/Nginx access logs — filter by level, search online', category: 'misc', icon: '📋', tags: ['log', 'viewer', 'serilog', 'nlog', 'json', 'apache', 'nginx', 'dotnet', 'debug', 'error', 'filter', 'online'], popular: true, new: true },

  // Network / Web tools
  { id: 'dns-lookup', name: 'DNS Lookup', description: 'Query DNS records for any domain — A, AAAA, MX, TXT, NS, CNAME, SOA and more via Cloudflare DNS-over-HTTPS online', category: 'web', icon: '🌐', tags: ['dns', 'lookup', 'domain', 'a', 'mx', 'txt', 'ns', 'cname', 'nameserver', 'record', 'online'], popular: true, new: true },
  { id: 'ip-lookup', name: 'IP Address Lookup', description: 'Look up geolocation, ASN, timezone and organization for any IP address — detects your own IP automatically online', category: 'web', icon: '📍', tags: ['ip', 'lookup', 'geolocation', 'asn', 'country', 'city', 'timezone', 'network', 'online'], popular: true, new: true },
  { id: 'ssl-checker', name: 'SSL Certificate Checker', description: 'Check SSL/TLS certificate validity, expiry date, issuer and SANs for any domain via Certificate Transparency logs online', category: 'web', icon: '🔒', tags: ['ssl', 'tls', 'certificate', 'https', 'expiry', 'domain', 'security', 'crt.sh', 'online'], popular: true, new: true },
  { id: 'http-request-builder', name: 'HTTP Request Builder', description: 'Build and send HTTP requests with custom headers, body, params — generate fetch, axios, curl, Python code snippets online', category: 'web', icon: '📡', tags: ['http', 'request', 'api', 'rest', 'fetch', 'axios', 'curl', 'get', 'post', 'headers', 'builder', 'online'], popular: true, new: true },
  { id: 'user-agent-parser', name: 'User-Agent Parser', description: 'Parse User-Agent strings to detect browser, OS, device type and brand — analyze any UA or test your own browser online', category: 'web', icon: '🕵️', tags: ['user-agent', 'browser', 'os', 'device', 'parse', 'chrome', 'firefox', 'safari', 'mobile', 'detect', 'online'], new: true },

  // Color tools
  { id: 'color-extractor', name: 'Color Extractor', description: 'Upload an image to extract its dominant color palette — copy HEX, RGB, HSL values with proportional preview strip online', category: 'color', icon: '🎨', tags: ['color', 'palette', 'extract', 'image', 'dominant', 'hex', 'rgb', 'hsl', 'online'], new: true },
  { id: 'color-contrast', name: 'Color Contrast Checker', description: 'Check WCAG 2.1 color contrast ratio — AA and AAA compliance for normal/large text with live preview online', category: 'color', icon: '👁️', tags: ['color', 'contrast', 'wcag', 'accessibility', 'a11y', 'aa', 'aaa', 'ratio', 'online'], new: true },

  // CSS / Web visual
  { id: 'css-filter-generator', name: 'CSS Filter Generator', description: 'Visually adjust blur, brightness, contrast, hue-rotate and more — generates CSS filter property with live preview online', category: 'web', icon: '🎛️', tags: ['css', 'filter', 'blur', 'brightness', 'contrast', 'grayscale', 'sepia', 'generator', 'online'], new: true },
  { id: 'px-to-rem', name: 'Px ↔ Rem Converter', description: 'Convert between px and rem units with configurable base font size — includes reference table and CSS snippet online', category: 'web', icon: '📐', tags: ['px', 'rem', 'converter', 'css', 'font-size', 'responsive', 'units', 'online'], new: true },
  { id: 'svg-previewer', name: 'SVG Previewer', description: 'Preview and edit SVG code with zoom, background options, element info — export as SVG or PNG online', category: 'web', icon: '✏️', tags: ['svg', 'preview', 'editor', 'zoom', 'export', 'png', 'vector', 'online'], new: true },

  // Crypto / Security
  { id: 'password-strength', name: 'Password Strength Checker', description: 'Check password strength with entropy score, crack time estimate, WCAG checklist and improvement suggestions online', category: 'crypto', icon: '🔑', tags: ['password', 'strength', 'entropy', 'security', 'crack', 'checker', 'validate', 'online'], new: true },
  { id: 'cert-decoder', name: 'Certificate Decoder', description: 'Decode X.509 PEM certificates — view subject, issuer, validity dates, serial, extensions and public key info online', category: 'crypto', icon: '📜', tags: ['certificate', 'x509', 'pem', 'ssl', 'tls', 'decode', 'x.509', 'openssl', 'security', 'online'], new: true },

  // Generator
  { id: 'national-id-generator', name: 'National ID Generator', description: 'Generate test national identity numbers — Vietnam CCCD, US SSN, UK NI Number, Singapore NRIC, Germany, France online', category: 'generator', icon: '🪪', tags: ['national', 'id', 'identity', 'ssn', 'cccd', 'nric', 'generator', 'test', 'fake', 'online'], new: true },

  // Formatter
  { id: 'xml-minifier', name: 'XML Minifier / Formatter', description: 'Minify XML by removing whitespace and comments, or format/beautify XML with configurable indentation online', category: 'formatter', icon: '📄', tags: ['xml', 'minify', 'format', 'beautify', 'compress', 'whitespace', 'comments', 'online'], new: true },

  // SQL Reference
  { id: 'sql-syntax', name: 'SQL Syntax Reference', description: 'Complete SQL syntax reference with copy-ready examples — DDL, SELECT, JOINs, CTEs, Window Functions, DML, Transactions online', category: 'dotnet', icon: '📖', tags: ['sql', 'syntax', 'reference', 'select', 'join', 'ddl', 'dml', 'cte', 'window', 'functions', 'tsql', 'online'], popular: true, new: true },

  // AI Tools
  { id: 'ai-token-counter', name: 'Token Counter', description: 'Estimate token count for GPT, Claude and Gemini models — track context usage and cost before calling the API online', category: 'ai', icon: '🪙', tags: ['ai', 'token', 'gpt', 'claude', 'gemini', 'openai', 'anthropic', 'count', 'context', 'online'], new: true, popular: true },
  { id: 'ai-cost-calculator', name: 'AI Cost Calculator', description: 'Calculate API cost for any AI model — enter input/output tokens and get exact pricing for GPT-4o, Claude, Gemini and more online', category: 'ai', icon: '💰', tags: ['ai', 'cost', 'price', 'gpt', 'claude', 'gemini', 'openai', 'anthropic', 'token', 'calculator', 'online'], new: true },
  { id: 'ai-prompt-builder', name: 'Prompt Builder', description: 'Build structured AI prompts with System / User / Assistant roles — export as OpenAI JSON or plain text online', category: 'ai', icon: '🧱', tags: ['ai', 'prompt', 'system', 'user', 'assistant', 'openai', 'chatgpt', 'builder', 'json', 'online'], new: true },
  { id: 'ai-model-comparison', name: 'Model Comparison', description: 'Compare GPT, Claude, Gemini and open-source models — context window, pricing, strengths side by side online', category: 'ai', icon: '⚖️', tags: ['ai', 'model', 'compare', 'gpt', 'claude', 'gemini', 'llama', 'context', 'price', 'online'], new: true },
  { id: 'ai-json-to-prompt', name: 'JSON → Prompt', description: 'Convert JSON data into a natural language prompt — describe objects, arrays and values in readable sentences online', category: 'ai', icon: '🔀', tags: ['ai', 'json', 'prompt', 'convert', 'natural', 'language', 'describe', 'online'], new: true },
  { id: 'ai-system-prompt', name: 'System Prompt Generator', description: 'Generate system prompts for AI assistants — choose use case, tone and constraints to get a ready-to-use prompt online', category: 'ai', icon: '⚙️', tags: ['ai', 'system', 'prompt', 'generator', 'assistant', 'chatbot', 'instruction', 'online'], new: true },
]
