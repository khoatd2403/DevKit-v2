export interface ToolAboutContent {
  what: string;
  why: { title: string; desc: string }[];
  example?: { before: string; after: string; title?: string } | string;
  faqs: { q: string; a: string }[];
  complementary?: { id: string; name: string; textEN: string; textVI: string };
}

export const toolAboutTranslations: Record<string, Record<string, ToolAboutContent>> = {
  en: {
    'json-formatter': {
      what: 'A JSON Formatter is a free online tool that formats, validates and beautifies JSON data instantly. It helps developers debug JSON, fix syntax errors, and convert unreadable JSON into a structured format.',
      why: [
        { title: 'Readability', desc: 'Transform unreadable "one-liner" JSON into a beautifully structured view instantly.' },
        { title: 'Real-time Validation', desc: 'Identify syntax errors like missing commas or mismatched brackets as you type.' },
        { title: '100% Privacy', desc: 'Your JSON data is processed entirely in your browser; it never leaves your device.' },
        { title: 'Developer Optimized', desc: 'Features like dark mode, customizable indentation, and one-click copy.' }
      ],
      example: {
        before: '{"id":1,"name":"John","active":true}',
        after: '{\n  "id": 1,\n  "name": "John",\n  "active": true\n}'
      },
      faqs: [
        { q: 'How to format JSON online?', a: 'You can format JSON by pasting your data into an online JSON formatter tool. It will automatically validate and beautify the JSON.' },
        { q: 'What is the difference between JSON formatter and validator?', a: 'A JSON formatter improves readability through indentation, while a validator checks for code syntax errors. Most modern tools combine both features.' },
        { q: 'Why is my JSON invalid?', a: 'Common issues include missing commas, trailing commas, incorrect quotes (use double quotes), or unmatched brackets.' },
        { q: 'Can I format large JSON files?', a: 'Yes, this tool is optimized to support large files efficiently, limited only by your browser\'s memory.' },
        { q: 'Is this JSON Formatter tool free?', a: 'Yes, it is completely free to use and runs entirely in your browser with no registration required.' }
      ],
      complementary: {
        id: 'json-minifier',
        name: 'JSON Minifier',
        textEN: 'You can also use our',
        textVI: 'Bạn cũng có thể sử dụng'
      }
    },
    'base64-encode-decode': {
      what: 'Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. It is commonly used to embed images in HTML or include binary data in JSON/XML.',
      why: [
        { title: 'Safe Transmission', desc: 'Ensures binary data survives travel through systems that only support text.' },
        { title: 'Data Embedding', desc: 'Embed small images (data URIs) directly in CSS or HTML.' },
        { title: 'Native Support', desc: 'Supported in all modern browsers and programming languages without plugins.' },
        { title: 'Bilingual', desc: 'Process both text-to-base64 encoding and base64-to-text decoding.' }
      ],
      example: {
        before: 'Hello',
        after: 'SGVsbG8='
      },
      faqs: [
        { q: 'Is Base64 encryption?', a: 'No, it is only an encoding format. It can be easily reversed and is not secure for sensitive data without actual encryption.' },
        { q: 'Does Base64 increase data size?', a: 'Yes, Base64 typically increases the data size by about 33%.' },
        { q: 'Is Base64 URL-safe?', a: 'Standard Base64 uses + and / which are not URL-safe. Use a "URL safe" variant for web parameters.' }
      ],
      complementary: {
        id: 'url-encode-decode',
        name: 'URL Encoder/Decoder',
        textEN: 'Need to process URL parameters? Try our',
        textVI: 'Cần xử lý tham số URL? Hãy dùng'
      }
    },
    'uuid-generator': {
      what: 'UUID (Universally Unique Identifier) is a 128-bit number used to identify information in computer systems. Version 4 (v4) is the most common version, contextually unique without central registry.',
      why: [
        { title: 'Uniqueness', desc: 'Extremely low probability of collision (duplicates).' },
        { title: 'Decentralized', desc: 'Generate IDs offline without asking a central database.' },
        { title: 'Scalability', desc: 'Perfect for distributed systems and microservices.' },
        { title: 'Standardized', desc: 'RFC 4122 compliant, supported by all major platforms.' }
      ],
      example: '550e8400-e29b-41d4-a716-446655440000',
      faqs: [
        { q: 'Is UUID truly unique?', a: 'Statistically, yes. To have a 50% chance of collision, you would need to generate 1 billion UUIDs/sec for 100 years.' },
        { q: 'Difference between v4 and v7?', a: 'v4 is fully random. v7 is time-ordered, which improves performance for database indexing.' }
      ],
      complementary: {
        id: 'password-generator',
        name: 'Secure Password Generator',
        textEN: 'Need a multi-character secret instead? Try our',
        textVI: 'Cần một chuỗi bí mật nhiều ký tự? Hãy dùng'
      }
    },
    'password-generator': {
      what: 'A secure password generator is a tool that creates complex, random passwords using a mix of uppercase, lowercase, numbers, and special symbols. It ensures passwords are unpredictable and resistant to brute-force attacks.',
      why: [
        { title: 'Maximum Security', desc: 'Randomly generated passwords are much harder to crack than common words or dates.' },
        { title: 'Convenience', desc: 'Instantly generate long, complex strings that meet strict security requirements.' },
        { title: 'Customization', desc: 'Choose character types and set desired length for any platform.' },
        { title: 'Client-Side Safety', desc: 'Processing happens in your browser. No passwords are ever sent to our servers.' }
      ],
      example: 'kL9#mP2$vR7*qW4!',
      faqs: [
        { q: 'How long should a password be?', a: 'At least 12-16 characters is recommended for most accounts. For high-security accounts, 20+ characters is better.' },
        { q: 'Should I reuse passwords?', a: 'Never. Use this generator to create a unique password for every single account you have.' }
      ],
      complementary: {
        id: 'uuid-generator',
        name: 'UUID Generator',
        textEN: 'Need a unique identifier for your database? Check out',
        textVI: 'Cần mã định danh duy nhất cho database? Xem ngay'
      }
    },
    'jwt-decoder': {
      what: 'A JWT (JSON Web Token) decoder is a tool that allows you to inspect the contents of a JWT token. It decodes the Base64Url encoded Header, Payload, and Signature sections so you can see the claims and metadata within.',
      why: [
        { title: 'Easy Debugging', desc: 'Quickly verify if a token contains the correct user IDs, roles, or expiration times.' },
        { title: 'Security Audit', desc: 'Check which algorithm (e.g. HS256, RS256) is being used and inspect metadata.' },
        { title: 'No Secret Required', desc: 'Decoding a JWT does not require the secret key; only verification does.' },
        { title: 'Local Processing', desc: 'Your tokens are never sent to a server. Processing happens entirely in your browser.' }
      ],
      example: '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}',
      faqs: [
        { q: 'Is it safe to paste my JWT here?', a: 'Yes, because this tool is client-side. Processing happens on your computer, no data is sent to our servers.' },
        { q: 'Can I verify the signature?', a: 'This is a decoder tool. Signature verification requires the Secret or Public Key.' }
      ],
      complementary: {
        id: 'base64-encode-decode',
        name: 'Base64 Tool',
        textEN: 'Did you know JWTs use Base64URL encoding? Learn more with our',
        textVI: 'Bạn có biết JWT dùng mã hóa Base64URL? Tìm hiểu với'
      }
    },
    'sql-formatter': {
      what: 'A SQL Formatter is an online tool that takes messy or minified SQL queries and beautifies them into a structured and readable format with proper indentation for complex joins and nested queries.',
      why: [
        { title: 'Better Readability', desc: 'Quickly understand complex queries with many joins or nested segments.' },
        { title: 'Faster Debugging', desc: 'Easily spot missing commas, mismatched parentheses, or logic errors.' },
        { title: 'Code Consistency', desc: 'Maintain a uniform SQL coding style across your team or codebase.' },
        { title: '100% Privacy', desc: 'Processing happens locally in your browser. Sensitive query data stays on your machine.' }
      ],
      example: {
        before: 'SELECT * FROM users WHERE active = 1 AND age > 18',
        after: 'SELECT\n  *\nFROM\n  users\nWHERE\n  active = 1\n  AND age > 18'
      },
      faqs: [
        { q: 'Is it free to use?', a: 'Yes, it is completely free and available online without any sign-up required.' },
        { q: 'Does it support my SQL dialect?', a: 'Yes, it supports standard SQL which works well for MySQL, PostgreSQL, SQL Server, and Oracle.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Formatting API results next? Try our',
        textVI: 'Định dạng kết quả API tiếp theo? Dùng ngay'
      }
    },
    'url-encode-decode': {
      what: 'URL Encoding (Percent-encoding) is a mechanism for encoding information in a Uniform Resource Identifier (URI). It converts unsafe characters into a format that can be transmitted over the internet.',
      why: [
        { title: 'Safe Query Params', desc: 'Ensure characters like spaces, &, and ? don\'t break your URL structure.' },
        { title: 'Character Support', desc: 'Safely include non-ASCII characters and special symbols in your web addresses.' },
        { title: 'Standardized', desc: 'Follows RFC 3986 standards for web compatibility.' }
      ],
      example: {
        before: 'Hello World!',
        after: 'Hello%20World%21'
      },
      faqs: [
        { q: 'What is the purpose of URL encoding?', a: 'Web browsers and servers only support a limited set of characters in URLs. Encoding converts "unsafe" characters into a % followed by their hex code.' },
        { q: 'What is the difference between Encode and Decode?', a: 'Encoding transforms text into URL-safe format. Decoding reverses the process to get the original text back.' }
      ],
      complementary: {
        id: 'base64-encode-decode',
        name: 'Base64 Encoder',
        textEN: 'For other encoding needs, check out our',
        textVI: 'Cho các nhu cầu mã hóa khác, xem ngay'
      }
    },
    'html-encode-decode': {
      what: 'An HTML Encode/Decode tool allows you to safely convert special characters into HTML entities and vice versa. This is crucial for preventing Cross-Site Scripting (XSS) and ensuring that your web content displays correctly across all browsers.',
      why: [
        { title: 'XSS Prevention', desc: 'Safely encode characters like `<`, `>`, and `&` to prevent them from being executed as scripts.' },
        { title: 'Accurate Rendering', desc: 'Ensure special symbols and international characters are displayed exactly as intended.' },
        { title: 'Bidirectional Tool', desc: 'Switch between encoding plain text to entities and decoding entities back instantly.' },
        { title: 'Secure & Local', desc: 'All transformations are handled in your browser; no data is ever uploaded to our servers.' }
      ],
      example: {
        before: '<script>alert("XSS")</script>',
        after: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
      },
      faqs: [
        { q: 'Why should I encode HTML?', a: 'Encoding prevents the browser from interpreting characters as HTML tags, which is essential for security and displaying code snippets.' },
        { q: 'What is the difference between encoding and escaping?', a: 'HTML encoding replaces characters with their corresponding entities (e.g., & becomes &amp;), while escaping is a broader term for making strings safe.' },
        { q: 'Does it support HTML5 entities?', a: 'Yes, the tool supports standard HTML5 entities and common special characters like quotes and ampersands.' },
        { q: 'Is it free?', a: 'Yes, it is 100% free and requires no registration or software installation.' }
      ],
      complementary: {
        id: 'url-encode-decode',
        name: 'URL Encoder',
        textEN: 'Need to encode URL parameters instead? Try',
        textVI: 'Cần mã hóa tham số URL? Hãy thử'
      }
    },
    'hash-generator': {
      what: 'A Hash Generator is a tool that computes a fixed-length cryptographic hash (checksum) from your input. It supports popular algorithms like MD5, SHA-1, SHA-256, and SHA-512.',
      why: [
        { title: 'Integrity', desc: 'Verify if a file or text has been altered by comparing its hash value.' },
        { title: 'Security', desc: 'Transform sensitive data like passwords into irreversible hashes.' },
        { title: 'Fast & Local', desc: 'Computing hashes happens entirely in your browser. No data is sent to any server.' }
      ],
      example: {
        before: 'DevTools',
        after: 'f49704e6... (SHA-256)'
      },
      faqs: [
        { q: 'Can I reverse a hash?', a: 'No, cryptographic hashes are "one-way" functions. You cannot derive the original text from the hash value.' },
        { q: 'Is MD5 secure?', a: 'MD5 is considered cryptographically broken for security purposes. Use SHA-256 or SHA-512 for better security.' }
      ],
      complementary: {
        id: 'password-generator',
        name: 'Password Generator',
        textEN: 'Want to generate a secure string to hash? Use',
        textVI: 'Muốn tạo một chuỗi an toàn để băm? Dùng'
      }
    },
    'image-metadata-modifier': {
      what: 'Image Metadata Editor is a powerful client-side utility that allows you to view, edit, and strip EXIF, IPTC, and XMP metadata from JPEG and JPG images. It provides a deep dive into your photos technical details while giving you full control over privacy-sensitive information like GPS coordinates and authorship.',
      why: [
        { title: 'Privacy Protection', desc: 'Remove GPS and personal data before sharing photos online.' },
        { title: 'Professional Control', desc: 'Modify camera settings, timestamps, and artist credits.' },
        { title: 'Comprehensive Insight', desc: 'View all hidden metadata including XMP, IPTC, and ICC profiles.' },
        { title: '100% Private', desc: 'All processing happens in your browser — your images are NEVER uploaded to a server.' }
      ],
      example: 'Upload a photo taken with your smartphone to see the exact time it was taken and the GPS coordinates. You can then change the "Camera Model" to something else, clear the "GPS" fields, and download the modified image to protect your location.',
      faqs: [
        { q: 'Does this support PNG or WebP?', a: 'Currently, metadata writing is primarily optimized for JPEG/JPG format. Many other formats strip metadata upon saving to save space.' },
        { q: 'Is the image quality preserved?', a: 'Yes, this tool only modifies the header (metadata) of the image. The pixel data remains untouched, so there is no quality loss.' },
        { q: 'Can I add GPS data to a photo without it?', a: 'Yes, you can manually enter Latitude and Longitude coordinates, and they will be "burned" into the new EXIF header upon download.' }
      ],
      complementary: {
        id: 'base64-encode-decode',
        name: 'Base64 Image Tool',
        textEN: 'Want to convert your image to a Data URI? Try',
        textVI: 'Muốn chuyển ảnh sang Data URI? Hãy thử'
      }
    },
    'json-minifier': {
      what: 'JSON Minifier is a tool that removes unnecessary whitespace, newlines, and indentation from your JSON data. This significantly reduces the file size, making it ideal for high-performance data transmission and website optimization.',
      why: [
        { title: 'Reduce Size', desc: 'Compress JSON payloads by up to 20-30% by removing redundant characters.' },
        { title: 'Performance', desc: 'Faster load times and lower bandwidth usage for your web applications.' },
        { title: 'Privacy First', desc: 'Processing happens entirely on your machine. No data is ever uploaded.' }
      ],
      faqs: [
        { q: 'Why should I minify JSON?', a: 'Minification reduces the overhead of data transfer between servers and clients, especially important for mobile users.' },
        { q: 'Is minified JSON still valid?', a: 'Yes. Minification only removes "insignificant" whitespace that is ignored by JSON parsers.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Need to make this readable again? Use our',
        textVI: 'Cần làm dữ liệu dễ đọc lại? Hãy dùng'
      }
    },
    'json-diff': {
      what: 'A JSON Diff tool is a powerful free online utility that allows you to compare two JSON objects and instantly highlight differences in their structure and values. This is an essential tool for developers to compare API responses, configuration updates, or database records.',
      why: [
        { title: 'Visual Diff View', desc: 'Identify exactly what was added, removed, or modified with clear color-coded highlighting.' },
        { title: 'Auto-Sort Keys', desc: 'Automatically sorts JSON keys alphabetically before comparing for accurate results regardless of key order.' },
        { title: 'Deep Comparison', desc: 'Recursively detect nested changes deeply hidden within complex JSON hierarchies.' },
        { title: '100% Private', desc: 'All comparison logic runs locally in your browser — your sensitive JSON data never leaves your device.' }
      ],
      example: {
        before: '{"name": "App", "v": 1}',
        after: '{"name": "App", "v": 2}'
      },
      faqs: [
        { q: 'How do I compare two JSON files online?', a: 'Paste your first JSON into the left editor and the second into the right. The tool will instantly generate a visual comparison highlighting all differences.' },
        { q: 'Does it handle different key orders?', a: 'Yes. Our tool can automatically normalize the key order to ensure you only see meaningful value or structural changes.' },
        { q: 'Is my data secure?', a: 'Yes. All processing happens 100% client-side using JavaScript. Your data is never uploaded to a server.' },
        { q: 'What kind of differences does it detect?', a: 'It identifies added keys, removed keys, changed values, and changes in data types across nested structures.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Format your JSON before comparing? Try our',
        textVI: 'Định dạng JSON trước khi so sánh? Hãy thử'
      }
    },
    'yaml-json': {
      what: 'A YAML to JSON converter (and vice versa) is a versatile free online tool that allows you to instantly switch between these two popular data formats. This tool simplifies configuration management for developers working with Kubernetes, Docker, or modern web applications.',
      why: [
        { title: 'Bidirectional Conversion', desc: 'Seamlessly transform YAML to JSON or JSON to YAML in a few seconds.' },
        { title: 'Syntax Validation', desc: 'Automatically check for indentation errors in YAML or missing braces in JSON.' },
        { title: 'Prettify Output', desc: 'Generate clean, indented, and human-readable output in both formats.' },
        { title: 'Maximum Privacy', desc: 'All processing runs locally via JavaScript—your configuration files are never uploaded to our servers.' }
      ],
      example: {
        before: 'name: App\nversion: 1.0',
        after: '{\n  "name": "App",\n  "version": "1.0"\n}'
      },
      faqs: [
        { q: 'How to convert YAML to JSON online?', a: 'Simply paste your YAML into the input area. The tool will instantly detect the format and display the JSON result.' },
        { q: 'Is YAML better than JSON?', a: 'YAML is often more human-readable and supports comments, making it ideal for configuration files. JSON is standard for API data exchange.' },
        { q: 'Does this tool validate syntax?', a: 'Yes. If your YAML or JSON is malformed, the tool will highlight the specific error to help you fix it.' },
        { q: 'Is my configuration data safe?', a: 'Yes. We use pure client-side processing, so your sensitive config strings remain entirely within your browser environment.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Clean up your JSON output? Try our',
        textVI: 'Làm sạch đầu ra JSON? Hãy thử'
      }
    },
    'json-to-typescript': {
      what: 'A JSON to TypeScript converter is an essential free online tool that generates TypeScript interfaces and types from valid JSON data automatically. This helps developers save time when building typed applications and ensures frontend structures match API responses.',
      why: [
        { title: 'Instant Type Generation', desc: 'Quickly generate high-quality TypeScript interfaces, including nested objects and optional fields.' },
        { title: 'Type Safety', desc: 'Ensure your application code remains type-safe by accurately modeling your JSON data structures.' },
        { title: 'Clean, Optimized Code', desc: 'Generate production-ready code you can copy directly into your source files with no adjustments needed.' },
        { title: '100% Private', desc: 'All conversion logic is executed entirely in your browser; your JSON data is never sent to any external server.' }
      ],
      example: {
        before: '{"id": 1, "name": "Admin"}',
        after: 'interface RootObject {\n  id: number;\n  name: string;\n}'
      },
      faqs: [
        { q: 'How do I generate TypeScript from JSON?', a: 'Paste your JSON sample into the editor. The tool will parse the structure and generate an interface you can copy-paste into your project.' },
        { q: 'Does it handle nested objects?', a: 'Yes. It recursively identifies sub-objects and creates nested interface definitions with unique names.' },
        { q: 'Does it support TypeScript 5?', a: 'Yes, the generated output follows modern TypeScript standards and is compatible with all current versions.' },
        { q: 'Is there a data size limit?', a: 'There is no hard limit, though very large JSON objects may take a moment to process depending on your device performance.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Need to format your JSON first? Try',
        textVI: 'Cần định dạng JSON trước? Thử'
      }
    },
    'jsonpath-tester': {
      what: 'A JSONPath tester is a powerful free online tool that allows you to test and debug JSONPath expressions against your JSON documents in real-time. This is perfect for developers working with JSON data querying, complex filtering, and data extraction tasks.',
      why: [
        { title: 'Interactive Testing', desc: 'See the results of your JSONPath query update instantly as you type your expression.' },
        { title: 'Visual Matching', desc: 'Highlight matching nodes in your JSON structure for easier debugging and validation.' },
        { title: 'Advanced Query Support', desc: 'Support for the full JSONPath specification including scripts, slicing, and logical filters.' },
        { title: 'Safe & Private', desc: 'All searching and filtering happen locally in your browser—your JSON data never leaves your computer.' }
      ],
      example: {
        before: '{"items": [1, 2, 3]}\nQuery: $.items[*]',
        after: '[1, 2, 3]'
      },
      faqs: [
        { q: 'What is JSONPath used for?', a: 'JSONPath is a query language for JSON, similar to XPath for XML. It allows you to select, extract, and filter specific parts of a JSON tree.' },
        { q: 'How to test JSONPath expressions?', a: 'Paste your JSON into the tool and type your JSONPath (e.g., $.store.book[*].author). The tool will display the matching nodes instantly.' },
        { q: 'Does this tool support logical filters?', a: 'Yes, it supports advanced features like the filter operator [?(...)] and recursive descent.' },
        { q: 'Is my data secure or uploaded?', a: 'Absolutely not. All processing is done via client-side JavaScript. Your JSON data is never sent to our servers or stored anywhere else.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Wanna see the full JSON more clearly? Use our',
        textVI: 'Muốn xem JSON rõ ràng hơn? Hãy dùng'
      }
    },
    'json-to-csv': {
      what: 'A JSON to CSV converter is a powerful free online tool that allows you to instantly transform complex JSON data into an organized, spreadsheet-ready CSV format. This tool helps developers and data analysts extract tabular data from nested structures without writing any code.',
      why: [
        { title: 'Flatten Nested Data', desc: 'Automatically parse hierarchical JSON objects and convert them into clean, labeled CSV columns.' },
        { title: 'Excel Compatible', desc: 'Generate standard CSV output that can be instantly imported into Excel, Google Sheets, or any database.' },
        { title: 'Fast & Secure', desc: 'Convert even large datasets instantly with 100% client-side processing — your data never leaves your device.' },
        { title: 'No Registration', desc: 'A completely free tool with no limits, no signup, and no software installation required.' }
      ],
      example: {
        before: '[{"id": 1, "user": "John"}, {"id": 2, "user": "Sara"}]',
        after: 'id,user\n1,John\n2,Sara'
      },
      faqs: [
        { q: 'How do I convert JSON to CSV online?', a: 'Just paste your JSON array or object into the input box. The tool will automatically detect the structure and generate the CSV output for download.' },
        { q: 'Does this tool support nested JSON objects?', a: 'Yes, our converter is designed to flatten nested objects into a tabular format suitable for spreadsheet analysis.' },
        { q: 'Is there a limit on the amount of data?', a: 'Since the processing happens in your browser, the limit depends on your device\'s memory. It can typically handle several thousand rows easily.' },
        { q: 'Is my JSON data private?', a: 'Yes. We use pure JavaScript to process data locally. Your sensitive information is never uploaded to any server or stored on our side.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Clean up your JSON before converting? Try our',
        textVI: 'Làm sạch JSON trước khi chuyển đổi? Hãy thử'
      }
    },
    'json-schema-validator': {
      what: 'A JSON Schema validator is a free online tool that checks if your JSON data conforms to a specific JSON Schema (Draft 4 to 2020-12). It provides detailed error reports to help you debug data structures and ensure API compliance.',
      why: [
        { title: 'Multiple Drafts', desc: 'Validate against various JSON Schema versions from Draft 4 to the latest 2020-12 standard.' },
        { title: 'Detailed Error Mapping', desc: 'See exactly where your JSON fails with line numbers and path-based error messages.' },
        { title: 'Real-time Validation', desc: 'Get instant feedback as you edit your JSON data or schema in the browser.' },
        { title: '100% Privacy', desc: 'All validation logic runs on your computer; your sensitive data is never sent to our servers.' }
      ],
      example: {
        before: 'JSON: {"id": "1"}\nSchema: {"type": "number"}',
        after: 'Error: should be number at path .id'
      },
      faqs: [
        { q: 'How to validate JSON against a schema?', a: 'Paste your JSON and your Schema into the respective editors. The tool will automatically check constraints like types and required fields.' },
        { q: 'Which versions are supported?', a: 'We support Draft 4, Draft 6, Draft 7, Draft 2019-09, and Draft 2020-12 standards.' },
        { q: 'Can it handle large schemas?', a: 'Yes, our validator is optimized to handle complex schemas with multiple references ($ref) and nested structures.' },
        { q: 'Is my data safe?', a: 'Yes. The validation happens localy in your browser via JavaScript. No data is stored or transmitted.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Fix your JSON syntax first? Use our',
        textVI: 'Sửa lỗi cú pháp JSON trước? Hãy dùng'
      }
    },
    'json-to-code': {
      what: 'JSON to Code is a versatile free online tool that transforms JSON objects into class or struct definitions for popular programming languages. It helps developers jumpstart their projects by automating the creation of data models.',
      why: [
        { title: 'Multi-Language Support', desc: 'Generate clean, typed definitions for Python, PHP, Go, Ruby, and Java.' },
        { title: 'Smart Type Inference', desc: 'Automatically detects data types to create accurate models including nested objects.' },
        { title: 'Clean Scaffolding', desc: 'Get production-ready code blocks you can copy-paste directly into your backend or frontend projects.' },
        { title: '100% Browser-Based', desc: 'Your JSON data is processed locally, ensuring total privacy for your internal data structures.' }
      ],
      example: {
        before: '{"user": {"id": 1, "name": "Dev"}}',
        after: 'class RootObject:\n    def __init__(self, user):\n        self.user = User(user)'
      },
      faqs: [
        { q: 'Which languages are supported?', a: 'Currently, you can generate classes and structs for Python, PHP, Java, Go, and Ruby.' },
        { q: 'Does it support nested JSON?', a: 'Yes, the generator recursively creates nested classes or types for complex hierarchical data.' },
        { q: 'Can I customize class names?', a: 'The tool uses generic names by default, which can be easily renamed in your IDE after copying.' },
        { q: 'Is this tool safe?', a: 'Absolutely. The conversion logic runs entirely in your browser via client-side JavaScript.' }
      ],
      complementary: {
        id: 'json-to-typescript',
        name: 'JSON to TypeScript',
        textEN: 'Working with TypeScript? Use our specialized',
        textVI: 'Làm việc với TypeScript? Hãy dùng bản'
      }
    },
    'hex-encode-decode': {
      what: 'A Hex Encode/Decode tool is a free online utility that converts plain text into hexadecimal strings and decodes hex back into readable text. It is a fundamental tool for developers working with binary data or debugging.',
      why: [
        { title: 'Bidirectional Conversion', desc: 'Easily switch between plain text and hex byte representations instantly.' },
        { title: 'Custom Delimiters', desc: 'Support for various hex formats including space-separated or continuous strings.' },
        { title: 'Debugging Aid', desc: 'Ideal for inspecting non-printable characters or analyzing low-level data structures.' },
        { title: 'Total Privacy', desc: 'Your data is processed entirely on your machine; we never see or store your encoded strings.' }
      ],
      example: {
        before: 'Hello',
        after: '48 65 6c 6c 6f'
      },
      faqs: [
        { q: 'What is hexadecimal encoding?', a: 'Hex encoding represents each byte of data as two base-16 digits, providing a readable way to view binary data.' },
        { q: 'How to decode a hex string?', a: 'Paste your hex sequence. Ensure you remove any non-hex characters if necessary, and the tool will show the original text.' },
        { q: 'Does it support UTF-8?', a: 'Yes, the tool correctly encodes multi-byte UTF-8 characters into their corresponding hex sequences.' },
        { q: 'Is there a size limit?', a: 'There is no hard limit, though browser performance may vary with extremely large text blocks.' }
      ],
      complementary: {
        id: 'binary-encode-decode',
        name: 'Binary Tool',
        textEN: 'Need to see the bits instead? Try our',
        textVI: 'Cần xem các bit nhị phân? Thử ngay'
      }
    },
    'binary-encode-decode': {
      what: 'A Binary Encode/Decode tool transforms any text into a sequence of bits (0s and 1s) and vice versa. It is an excellent tool for understanding how data is represented at the lowest level in computing.',
      why: [
        { title: 'Visual Bitstreams', desc: 'See exactly how each character is represented as an 8-bit byte for better insight.' },
        { title: 'High Readability', desc: 'Automatically adds spaces between bytes to make long binary sequences easier to read.' },
        { title: 'Fast Processing', desc: 'Instantly convert blocks of text to binary or decode complex bitstreams back to text.' },
        { title: '100% Privacy', desc: 'All logic is executed locally within your browser; no data is sent to external servers.' }
      ],
      example: {
        before: 'A',
        after: '01000001'
      },
      faqs: [
        { q: 'How many bits per character?', a: 'Standard text is encoded using 8 bits (one byte) per character using UTF-8 or ASCII.' },
        { q: 'How to convert binary to text?', a: 'Paste your string of 0s and 1s. Space separation is supported and helps with accuracy.' },
        { q: 'Is binary encoding secure?', a: 'No, it is not encryption. It is a different representation of data that is easily reversed.' },
        { q: 'Does it work on mobile?', a: 'Yes, the tool is fully responsive and work on all modern smartphones and tablets.' }
      ],
      complementary: {
        id: 'hex-encode-decode',
        name: 'Hex Converter',
        textEN: 'Wanna see the Hex representation? Try',
        textVI: 'Muốn xem biểu diễn Hex? Thử ngay'
      }
    },
    'bcrypt': {
      what: 'A BCrypt Hash generator and verifier is a specialized free online tool for developers to test password hashing security. It uses the Blowfish-based BCrypt algorithm which is computationally intensive to protect against brute-force attacks.',
      why: [
        { title: 'Adjustable Cost', desc: 'Test different salt rounds (cost factor) to balance security and performance for your environment.' },
        { title: 'Direct Verification', desc: 'Quickly check if a plain text password matches an existing BCrypt hash instantly.' },
        { title: 'Standard Compliant', desc: 'Supports standard BCrypt formats beginning with $2a$, $2b$, or $2y$ for broad compatibility.' },
        { title: '100% Client-Side', desc: 'Your passwords and hashes are never sent to a server; all cryptography runs in your browser.' }
      ],
      example: {
        before: 'Password: "admin", Rounds: 10',
        after: '$2b$10$...(hash)'
      },
      faqs: [
        { q: 'What is BCrypt cost factor?', a: 'It determines how many rounds of hashing are performed. Higher cost makes it slower for attackers to guess passwords.' },
        { q: 'Is BCrypt better than SHA-256 for passwords?', a: 'Yes, because BCrypt is intentionally slow and includes a built-in salt, making it resistant to rainbow table and brute-force attacks.' },
        { q: 'Can I reverse a BCrypt hash?', a: 'No. BCrypt is a one-way function. You can only verify a password by hashing it again and comparing it.' },
        { q: 'Is this tool secure?', a: 'Yes, the hashing is performed locally via your browser\'s CPU. No data is transmitted.' }
      ],
      complementary: {
        id: 'password-generator',
        name: 'Password Generator',
        textEN: 'Need a strong password to hash? Try our',
        textVI: 'Cần mật khẩu mạnh để băm? Hãy thử'
      }
    },
    'jwt-encoder': {
      what: 'A JWT Encoder is a free online tool that allows you to create and sign JSON Web Tokens with a secret key. It is an essential utility for developers building authentication systems or testing secure protocols.',
      why: [
        { title: 'HMAC Signing', desc: 'Supports HS256, HS384, and HS512 hmac-based signing algorithms out of the box.' },
        { title: 'Custom Payloads', desc: 'Easily set user claims, expiration times (exp), and custom metadata in the JSON editor.' },
        { title: 'Instant Feedback', desc: 'See the encoded token update in real-time as you modify headers or payload data.' },
        { title: '100% Secure', desc: 'Your secret key and data stay in your browser. We never transmit or store your sensitive keys.' }
      ],
      example: {
        before: '{"sub": "123", "name": "Dev"}',
        after: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      },
      faqs: [
        { q: 'How to create a JWT online?', a: 'Input your Header and Payload as JSON, enter your secret key, and the tool will instantly sign the token.' },
        { q: 'What algorithm should I use?', a: 'HS256 (HMAC with SHA-256) is the most common and widely supported algorithm for symmetric signing.' },
        { q: 'Does it support RSA/ECDSA?', a: 'Currently, this tool is optimized for symmetric HMAC signing, which is the most common for quick testing.' },
        { q: 'Is it safe to use my secret key here?', a: 'Yes, our tool runs purely on the client-side. The key never leaves your computer.' }
      ],
      complementary: {
        id: 'jwt-decoder',
        name: 'JWT Decoder',
        textEN: 'Need to inspect an existing token? Use our',
        textVI: 'Cần kiểm tra token hiện có? Hãy dùng'
      }
    },
    'aes-encrypt': {
      what: 'An AES Encrypt / Decrypt tool is a free online utility that uses the Advanced Encryption Standard (AES) to secure your text data. It runs the AES-256-GCM cipher directly in your browser for maximum privacy.',
      why: [
        { title: 'AES-256-GCM', desc: 'Uses one of the most secure symmetric encryption standards available today for confidentiality.' },
        { title: 'In-Browser Cryptography', desc: 'All encryption and decryption logic is executed locally on your device without server calls.' },
        { title: 'Flexible Inputs', desc: 'Supports plain text for encryption and common formats like Hex or Base64 for decryption.' },
        { title: 'Zero Persistence', desc: 'We never store your keys or data. Once the tab is closed, all sensitive info is wiped.' }
      ],
      example: {
        before: 'Secret Message',
        after: 'Encrypted: 4f... (Hex)'
      },
      faqs: [
        { q: 'What is AES-256?', a: 'It is the 256-bit key version of the Advanced Encryption Standard, widely considered unbreakable by brute force.' },
        { q: 'Why use AES-256-GCM?', a: 'GCM (Galois/Counter Mode) provides both confidentiality and data integrity (authentication) in one pass.' },
        { q: 'Can I use a password as a key?', a: 'Yes, the tool can derive a strong encryption key from your passphrase using standard derivation.' },
        { q: 'Is it safe to use online?', a: 'Yes, because everything happens localy. Your key and plain text are never sent over the network.' }
      ],
      complementary: {
        id: 'base64-encode-decode',
        name: 'Base64 Tool',
        textEN: 'Need to encode binary results? Try our',
        textVI: 'Cần mã hóa kết quả nhị phân? Hãy thử'
      }
    },
    'totp-generator': {
      what: 'A TOTP / 2FA Generator tool allows you to generate time-based one-time passwords (RFC 6238) from a secret key. It is perfect for developers testing MFA implementations or Google Authenticator compatibility.',
      why: [
        { title: 'RFC 6238 Compliant', desc: 'Generates standard 6-digit or 8-digit codes that match major authenticator apps perfectly.' },
        { title: 'Real-time Sync', desc: 'See the code countdown and automatic refresh based accurately on your system clock.' },
        { title: 'Debug Information', desc: 'View internal state details to help troubleshoot desynchronization issues in your own services.' },
        { title: '100% Local', desc: 'Your 2FA secrets are processed entirely in the browser; they are never uploaded to our servers.' }
      ],
      example: {
        before: 'Secret: JBSWY3DPEHPK3PXP',
        after: 'OTP: 123456'
      },
      faqs: [
        { q: 'What is a TOTP secret?', a: 'It is a Base32 encoded string shared between the server and your app to generate matching codes.' },
        { q: 'How to test my MFA?', a: 'Paste your secret into this tool and compare the generated code with your app\'s current output.' },
        { q: 'Why is my code not working?', a: 'Ensure your system clock is accurate. Even a few seconds of drift can result in invalid tokens.' },
        { q: 'Is it secure?', a: 'Yes, the generation is handled by client-side JavaScript. No secrets are stored or transmitted.' }
      ],
      complementary: {
        id: 'password-generator',
        name: 'Random Strings',
        textEN: 'Need to generate a new secret? Try our',
        textVI: 'Cần tạo một khóa bí mật mới? Thử ngay'
      }
    },
    'password-strength': {
      what: 'A Password Strength Checker is an online tool designed to help you analyze the security of your passphrases. It uses advanced entropy calculations to estimate how long a password would take to crack.',
      why: [
        { title: 'Entropy Analysis', desc: 'Measures the randomness of your password to calculate its true mathematical strength.' },
        { title: 'Crack Time Prediction', desc: 'Provides a visual estimate of how long a brute-force or dictionary attack would take today.' },
        { title: 'Improvement Hints', desc: 'Get instant feedback on how to make your password stronger (symbols, length, etc.).' },
        { title: '100% Private', desc: 'Your passwords are never sent to a server. All analysis happens locally on your computer.' }
      ],
      example: {
        before: 'qwerty',
        after: 'Strength: Very Weak (Instant crack)'
      },
      faqs: [
        { q: 'What is a strong password?', a: 'A strong password should be at least 12-16 characters long and combine varying character types.' },
        { q: 'What is entropy?', a: 'Entropy is a measure of randomness; higher entropy means a password is much harder for AI tools to guess.' },
        { q: 'Should I use common words?', a: 'No. Dictionary attacks can guess common words almost instantly, even with number substitutions.' },
        { q: 'Does this tool store data?', a: 'No. All security checks are performed in memory and destroyed when you close the browser tab.' }
      ],
      complementary: {
        id: 'password-generator',
        name: 'Password Generator',
        textEN: 'Need to create a stronger one? Use our',
        textVI: 'Cần tạo mật khẩu mạnh hơn? Hãy dùng'
      }
    },
    'cert-decoder': {
      what: 'A Certificate Decoder is a free online tool that parses X.509 PEM certificates into a human-readable format. It extract technical details like subject info, validity, and issuer from SSL/TLS certificates.',
      why: [
        { title: 'Detailed PEM Parsing', desc: 'Decodes standard SSL/TLS certificates to help you verify expiry dates and domain details.' },
        { title: 'Visual Inspection', desc: 'View subject names, SAN (Subject Alternative Names), serials, and fingerprints clearly.' },
        { title: '100% Local Logic', desc: 'Parsing is handled by standard JavaScript in your browser; certificates are never uploaded.' },
        { title: 'Fast & Simple', desc: 'Instantly decode multiple certificates without needing any command-line tools like OpenSSL.' }
      ],
      example: {
        before: '-----BEGIN CERTIFICATE----- ...',
        after: 'Subject: CN=example.com, Issuer: Let\'s Encrypt'
      },
      faqs: [
        { q: 'How to decode a PEM cert?', a: 'Paste the entire PEM block (including the BEGIN/END tags) into the tool to see all its attributes.' },
        { q: 'Can I check expiry?', a: 'Yes, the tool clearly displays the "Not Before" and "Not After" validity dates for any certificate.' },
        { q: 'What fields are decoded?', a: 'The tool extracts Subject, Issuer, Validity, Serial Number, Signature Algorithm, and all major Extensions.' },
        { q: 'Is my cert safe?', a: 'Yes. The parsing happens localy. No certificate data is transmitted to our servers.' }
      ],
      complementary: {
        id: 'jwt-decoder',
        name: 'JWT Decoder',
        textEN: 'Also working with JSON Web Tokens? Try',
        textVI: 'Cũng đang làm việc với JWT? Hãy thử'
      }
    },
    'json-to-csharp': {
      what: 'JSON to C# Classes is a free online tool that converts JSON objects into C# class definitions instantly. It supports nested objects, arrays, and generates properties with proper types and attributes.',
      why: [
        { title: 'Smart Property Mapping', desc: 'Automatically detects data types and generates corresponding C# properties with attributes.' },
        { title: 'Attribute Support', desc: 'Optionally includes Newtonsoft.Json or System.Text.Json attributes for seamless serialization.' },
        { title: 'Nested Class Generation', desc: 'Recursively creates nested classes for complex, hierarchical JSON structures.' },
        { title: '100% Client-Side', desc: 'Your JSON data is processed entirely in your browser; no data is sent to any server.' }
      ],
      example: {
        before: '{"id": 1, "user": {"name": "Dev"}}',
        after: 'public class Root\n{\n    public int id { get; set; }\n    public User user { get; set; }\n}'
      },
      faqs: [
        { q: 'What C# versions are supported?', a: 'The tool generates standard C# classes compatible with .NET Framework, .NET Core, and .NET 5+.' },
        { q: 'Can I handle null values?', a: 'Yes, the tool can generate nullable types if it detects null values in your JSON sample.' },
        { q: 'Is it free?', a: 'Yes, it is completely free and requires no signup or installation.' },
        { q: 'Does it support arrays?', a: 'Yes, it correctly identifies JSON arrays and maps them to List<T> or T[] in C#.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Validate your JSON first with our',
        textVI: 'Kiểm tra cú pháp JSON trước với'
      }
    },
    'nuget-checker': {
      what: 'The NuGet Package Checker is a free online tool that lets you search and inspect any package from the official NuGet registry. It provides version history, download trends, and ready-to-use installation snippets.',
      why: [
        { title: 'Registry Insights', desc: 'Access comprehensive metadata including dependencies, supported frameworks, and license info.' },
        { title: 'Download Statistics', desc: 'View global download trends to assess package popularity and community trust.' },
        { title: 'Copy-Ready Snippets', desc: 'Quickly get PackageReference or .NET CLI commands for your project files.' },
        { title: 'Always Updated', desc: 'Fetches real-time data directly from the official NuGet v3 API servers.' }
      ],
      example: {
        before: 'Search: Newtonsoft.Json',
        after: 'Displaying v13.0.3, 4.2B downloads'
      },
      faqs: [
        { q: 'Where do you get the data?', a: 'All package information is fetched in real-time from the official NuGet v3 registry (api.nuget.org).' },
        { q: 'Can I see older versions?', a: 'Yes, the tool displays a complete list of past versions and their release dates.' },
        { q: 'Is it official?', a: 'This is a third-party developer utility that interacts with the official public NuGet APIs.' },
        { q: 'Does it show dependencies?', a: 'Yes, it lists all required packages and their version constraints for each target framework.' }
      ],
      complementary: {
        id: 'npm-checker',
        name: 'npm Checker',
        textEN: 'Working with Node.js too? Try our',
        textVI: 'Đang làm việc với Node.js? Thử ngay'
      }
    },
    'connection-string-builder': {
      what: 'The Connection String Builder is a free online tool that helps developers construct valid database connection strings for various providers. It eliminates syntax errors and provides guidance on security parameters.',
      why: [
        { title: 'Multiple Providers', desc: 'Build strings for SQL Server, MySQL, PostgreSQL, SQLite, Oracle, and MongoDB.' },
        { title: 'Interactive Form', desc: 'Fill in your server details and the tool handles the complex semicolon-delimited syntax.' },
        { title: 'Security Best Practices', desc: 'Includes options for integrated security, SSL/TLS, and connection pooling settings.' },
        { title: 'Live Preview', desc: 'See your connection string update in real-time as you toggle specific options or enter server values.' }
      ],
      example: {
        before: 'Server: db.local, User: sa',
        after: 'Server=db.local;Database=master;User Id=sa;...'
      },
      faqs: [
        { q: 'Which databases are supported?', a: 'We support all major databases including SQL Server, MySQL, Postgres, Oracle, and SQLite.' },
        { q: 'What is Integrated Security?', a: 'It uses your Windows credentials for authentication instead of a separate username and password.' },
        { q: 'Is it safe to type passwords?', a: 'The tool runs locally; we don\'t log your server details. However, always exercise caution with sensitive production keys.' },
        { q: 'Does it support Entity Framework?', a: 'Yes, you can use the generated strings in your EF Core or EF6 configuration files.' }
      ],
      complementary: {
        id: 'erd-diagram',
        name: 'ERD Diagram',
        textEN: 'Need to visualize your database? Use our',
        textVI: 'Cần xem lược đồ cơ sở dữ liệu? Dùng bản'
      }
    },
    'csharp-string-escape': {
      what: 'C# String Escape is a free online tool that helps you escape special characters in text to be used in C# strings. It supports normal, verbatim (@), and interpolated ($) string formats.',
      why: [
        { title: 'Format Specific', desc: 'Correctly escapes double quotes for verbatim strings and curly braces for interpolated strings.' },
        { title: 'Bidirectional Logic', desc: 'Easily escape plain text for code or unescape C# string literals back to readable text.' },
        { title: 'Time Saving', desc: 'Avoid tedious manual escaping of long paths, JSON payloads, or multi-line SQL queries in your code.' },
        { title: '100% Client-Side', desc: 'Your text processing happens entirely in the browser; your strings are never uploaded.' }
      ],
      example: {
        before: 'C:\Windows\System32',
        after: '"C:\\\\Windows\\\\System32"'
      },
      faqs: [
        { q: 'What is a verbatim string?', a: 'In C#, verbatim strings start with @ and ignore standard escape sequences like \n, making them ideal for file paths.' },
        { q: 'How to escape double quotes?', a: 'In normal strings, use \". In verbatim strings, double up the quote characters like "".' },
        { q: 'Does it support multi-line?', a: 'Yes, industrial-grade multi-line strings (raw string literals) are supported for modern C# versions.' },
        { q: 'Is my text safe?', a: 'Yes. Every operation is handled locally by JavaScript. We do not store or transmit your strings.' }
      ],
      complementary: {
        id: 'json-to-csharp',
        name: 'JSON to C#',
        textEN: 'Pasting JSON as a string? Convert it with',
        textVI: 'Đán JSON vào chuỗi? Hãy chuyển nó với'
      }
    },
    'sql-to-linq': {
      what: 'The SQL to LINQ converter is a free online developer utility that helps you translate SQL SELECT queries into C# LINQ method syntax. It is perfect for developers moving logic from the database to an ORM like EF Core.',
      why: [
        { title: 'LINQ Method Syntax', desc: 'Generates clean, readable LINQ method calls (Select, Where, Join) from standard SQL clauses.' },
        { title: 'Entity Framework Ready', desc: 'The output is optimized for use with EF Core or LINQ to Objects in your C# projects.' },
        { title: 'Complex Query Support', desc: 'Handles JOINs, GROUP BY, HAVING, and ORDER BY translations automatically.' },
        { title: 'Educational Helper', desc: 'Excellent for learning how SQL concepts map to functional programming patterns in .NET.' }
      ],
      example: {
        before: 'SELECT * FROM Users WHERE Age > 20',
        after: 'db.Users.Where(u => u.Age > 20)'
      },
      faqs: [
        { q: 'Does it support Query Syntax?', a: 'Currently it focuses on Method Syntax, which is the most popular style for modern C# development.' },
        { q: 'Are SQL aliases supported?', a: 'Yes, table and column aliases are mapped to lambda parameter names in the LINQ output.' },
        { q: 'Can it handle subqueries?', a: 'Simple subqueries are supported; very complex nested SQL may require manual refactoring into multiple LINQ calls.' },
        { q: 'Is it free?', a: 'Yes, it is a free online tool with no signup required.' }
      ],
      complementary: {
        id: 'sql-formatter',
        name: 'SQL Formatter',
        textEN: 'Make your SQL query readable first with',
        textVI: 'Làm SQL của bạn dễ đọc hơn trước với'
      }
    },
    'erd-diagram': {
      what: 'ERD Diagram from SQL is a free online visualizer that allows you to generate Entity Relationship Diagrams instantly from CREATE TABLE statements. It helps you understand and document database schemas in seconds.',
      why: [
        { title: 'Visual Schema Mapping', desc: 'Automatically parses SQL scripts and draws tables with their columns, types, and primary keys.' },
        { title: 'Relationship Detection', desc: 'Detects and draws links between tables based on Foreign Key constraints in your SQL.' },
        { title: 'Interactive Layout', desc: 'Drag and organize tables to create the perfect architectural overview of your database.' },
        { title: '100% In-Browser', desc: 'Your schema designs stay private; all parsing and rendering happens locally on your computer.' }
      ],
      example: {
        before: 'CREATE TABLE Users (id INT PRIMARY KEY, name TEXT);',
        after: '[Visual Table Diagram Generated]'
      },
      faqs: [
        { q: 'How to generate ERD from SQL?', a: 'Paste your SQL DDL (Data Definition Language) commands into the editor and the diagram will appear instantly.' },
        { q: 'Which SQL dialects are supported?', a: 'It supports standard SQL, T-SQL (SQL Server), PostgreSQL, and MySQL CREATE statement formats.' },
        { q: 'Can I export the diagram?', a: 'Yes, you can organize your tables and use your browser\'s export/print features to save the design.' },
        { q: 'Is there a table limit?', a: 'For best performance, diagrams with up to 50-100 tables work smootly on modern computers.' }
      ],
      complementary: {
        id: 'sql-syntax',
        name: 'SQL Reference',
        textEN: 'Need to write the CREATE SQL? Check our',
        textVI: 'Cần viết lệnh CREATE SQL? Xem bản'
      }
    },
    'sql-plan-viewer': {
      what: 'The SQL Execution Plan Viewer is a free online performance analysis tool for database developers. it parses the EXPLAIN output from PostgreSQL or MySQL and transforms it into a visual tree.',
      why: [
        { title: 'Identify Slow Nodes', desc: 'Visually highlights operations with high execution costs or excessive row counts.' },
        { title: 'Annotated Operations', desc: 'Provides clear explanations for Sequential Scans, Index Scans, and Join algorithms.' },
        { title: 'Bottleneck Detection', desc: 'Easily spot missing indexes or poor join strategies that are slowing down your application.' },
        { title: 'Privacy Focused', desc: 'Your database structure and execution plans never leave your browser for maximum security.' }
      ],
      example: {
        before: '[ { "Plan": { "Node Type": "Seq Scan", ... } } ]',
        after: '[Visual Tree Visualization with Bottleneck Alerts]'
      },
      faqs: [
        { q: 'How to get the plan for Postgres?', a: 'Run `EXPLAIN (ANALYZE, FORMAT JSON) your_query;` and paste the JSON result into the tool.' },
        { q: 'How to get the plan for MySQL?', a: 'Run `EXPLAIN FORMAT=JSON your_query;` and paste the output here for a tree visualization.' },
        { q: 'What is a Sequential Scan?', a: 'It means the database is reading the whole table from disk because no suitable index was found.' },
        { q: 'Is it safe for company data?', a: 'Yes, all parsing is local. No query details or schema info are sent to any server.' }
      ],
      complementary: {
        id: 'sql-to-linq',
        name: 'SQL to LINQ',
        textEN: 'Optimize your query then convert it with',
        textVI: 'Tối ưu truy vấn rồi chuyển đổi với'
      }
    },
    'sql-syntax': {
      what: 'The SQL Syntax Reference is a comprehensive free online guide and cheat sheet for database developers. It provides clear examples for DDL, DML, and advanced window functions across major database engines.',
      why: [
        { title: 'Copy-Ready Examples', desc: 'Browse hundreds of tested SQL snippets for JOINs, CTEs, and recursive queries.' },
        { title: 'Multi-Dialect Support', desc: 'Includes specific syntax notes for T-SQL (SQL Server), PostgreSQL, and MySQL.' },
        { title: 'Advanced Concepts', desc: 'Detailed reference for window functions, partitions, and complex conditional expressions.' },
        { title: 'Fast Search', desc: 'Find the exact clause or function you need instantly with our optimized documentation index.' }
      ],
      example: {
        before: 'How to use OVER clause?',
        after: 'SELECT name, SUM(val) OVER(PARTITION BY group) FROM stats;'
      },
      faqs: [
        { q: 'Does it include window functions?', a: 'Yes, we have detailed examples for ROW_NUMBER, RANK, DENSE_RANK and aggregate windows.' },
        { q: 'Is it updated for modern SQL?', a: 'Yes, it includes modern syntax like CTEs (Common Table Expressions) and JSON functions.' },
        { q: 'Can I use snippets in production?', a: 'Absolutely, the examples are designed to be standard-compliant and production-ready.' },
        { q: 'Is it free?', a: 'Yes, this is a free public resource for the developer community.' }
      ],
      complementary: {
        id: 'sql-formatter',
        name: 'SQL Formatter',
        textEN: 'Need to prettify your SQL code? Use our',
        textVI: 'Cần làm đẹp mã SQL của bạn? Hãy dùng'
      }
    },
    'ai-token-counter': {
      what: 'An AI Token Counter is a specialized free online tool that helps you calculate how many tokens your text will consume in LLM models like GPT-4, Claude, and Gemini.',
      why: [
        { title: 'Context Management', desc: 'Ensure your prompts fit within the model\'s maximum token window to avoid truncation.' },
        { title: 'Cost Estimation', desc: 'Calculate the expected API cost based on the number of input tokens for your specific model.' },
        { title: 'Multi-Model Support', desc: 'Accurate estimates for OpenAI (GPT), Anthropic (Claude), and Google (Gemini) models.' },
        { title: '100% Client-Side', desc: 'Your prompt content stays in your browser; we never see or store your sensitive text.' }
      ],
      example: {
        before: 'Hello, how are you today?',
        after: 'Tokens: 6 (approx. 24 characters)'
      },
      faqs: [
        { q: 'What is a token?', a: 'Tokens are the basic units of text that LLMs process. One token is roughly 4 characters or 0.75 words in English.' },
        { q: 'Is the count 100% accurate?', a: 'The tool provides a high-fidelity estimate based on standard BPE (Byte Pair Encoding) tokenizers used by major AI providers.' },
        { q: 'Why is token count important?', a: 'AI providers charge based on tokens, and models have limits (e.g., 128k tokens) on how much they can "remember" at once.' },
        { q: 'Does it work for code?', a: 'Yes, the tokenizer accurately handles code blocks, indentation, and special symbols used in programming.' }
      ],
      complementary: {
        id: 'ai-prompt-builder',
        name: 'Prompt Builder',
        textEN: 'Counted your tokens? Now build a',
        textVI: 'Đã đếm xong token? Giờ hãy tạo'
      }
    },
    'ai-cost-calculator': {
      what: 'The AI API Cost Calculator is a free online tool that helps developers estimate their spend on Large Language Models. It provides up-to-date pricing for GPT-4o, Claude 3.5, and more.',
      why: [
        { title: 'Current Pricing', desc: 'Uses fresh pricing data from LiteLLM and providers to give you the most accurate estimates.' },
        { title: 'Input/Output Split', desc: 'Separately calculates costs for prompts and completions, matching how real APIs are billed.' },
        { title: 'Comparison Tool', desc: 'Easily compare the price difference between using high-end models versus budget-friendly options.' },
        { title: 'Instant Math', desc: 'No more manual spreadsheets; just enter your expected volume and get the USD total instantly.' }
      ],
      example: {
        before: '1M tokens on GPT-4o',
        after: '$5.00 Input / $15.00 Output (approx)'
      },
      faqs: [
        { q: 'How often is pricing updated?', a: 'We regularly sync pricing data to reflect the latest model price drops and tier changes from providers.' },
        { q: 'Does it support batch pricing?', a: 'The calculator estimates based on standard pay-as-you-go pricing tiers for primary API usage.' },
        { q: 'What models are included?', a: 'All major models from OpenAI, Anthropic, Google, and Meta (via providers) are supported.' },
        { q: 'Is it free?', a: 'Yes, it is a free utility for developers and AI engineers.' }
      ],
      complementary: {
        id: 'ai-model-comparison',
        name: 'Model Comparison',
        textEN: 'Checking costs? Compare model skills with',
        textVI: 'Đang kiểm tra phí? So sánh kỹ năng với'
      }
    },
    'ai-prompt-builder': {
      what: 'An AI Prompt Builder is a free online tool to help you construct structured prompts. it allows you to easily manage System, User, and Assistant roles for API consumption.',
      why: [
        { title: 'Role-Based Structure', desc: 'Organize your input into clear message blocks that LLMs expect for optimal instruction following.' },
        { title: 'OpenAI Compatibility', desc: 'Export your prompt directly as a JSON array formatted for the /chat/completions endpoint.' },
        { title: 'Context Organization', desc: 'Keep your system instructions separate from user data to prevent prompt injection.' },
        { title: 'Visual Preview', desc: 'See how your final prompt looks to the AI before you integrate it into your application code.' }
      ],
      example: {
        before: 'System: You are an expert. User: Hello.',
        after: '[{"role": "system", "content": "..."}, {"role": "user", "content": "Hello"}]'
      },
      faqs: [
        { q: 'What is a System prompt?', a: 'It is a high-level instruction that tells the AI how to behave, what tone to use, and what rules to follow.' },
        { q: 'Why use structured JSON?', a: 'Most professional APIs use a JSON array of messages to maintain conversation history and clarify turn-taking.' },
        { q: 'Can I export to plain text?', a: 'Yes, you can copy the entire structured prompt as a simple text block if you are using a web interface.' },
        { q: 'Is it safe?', a: 'Yes, we do not store your prompt content. Everything runs inside your current browser session.' }
      ],
      complementary: {
        id: 'ai-token-counter',
        name: 'Token Counter',
        textEN: 'Built your prompt? Check the size with',
        textVI: 'Đã tạo prompt xong? Kiểm tra độ dài với'
      }
    },
    'ai-model-comparison': {
      what: 'AI Model Comparison is a free online reference tool that provides a side-by-side look at capabilities, context windows, and pricing of leading LLM models.',
      why: [
        { title: 'Context Window Stats', desc: 'Quickly find which models can handle large documents or long conversation histories.' },
        { title: 'Cost Benchmarking', desc: 'Compare per-million token costs to optimize your application architecture for cost-efficiency.' },
        { title: 'Feature Breakdown', desc: 'See which models support vision, tool calling, or have higher reasoning capabilities.' },
        { title: 'Neutral Insights', desc: 'Get objective data on model performance from across all major providers in one clean interface.' }
      ],
      example: {
        before: 'Which is cheaper: GPT-4o or Claude 3.5?',
        after: '[Detailed side-by-side pricing and token limit table]'
      },
      faqs: [
        { q: 'Which model should I choose?', a: 'It depends on your trade-off between reasoning quality, speed, and cost. Use our table to find the balance.' },
        { q: 'What is a context window?', a: 'It is the amount of text (tokens) the model can process in a single request, including instructions and history.' },
        { q: 'Are open-source models included?', a: 'Yes, we include major Llama and Mixtral variants available through providers like Groq.' },
        { q: 'How often is data updated?', a: 'We update the metrics as soon as providers release new model iterations or pricing updates.' }
      ],
      complementary: {
        id: 'ai-cost-calculator',
        name: 'Cost Calculator',
        textEN: 'Found your model? Estimate costs with',
        textVI: 'Đã tìm được model? Ước tính phí với'
      }
    },
    'ai-json-to-prompt': {
      what: 'JSON to Prompt is a free online tool that converts raw JSON data into natural language descriptions for better AI context.',
      why: [
        { title: 'Improved AI Reasoning', desc: 'LLMs often perform better when data is described in natural language rather than deep nested JSON.' },
        { title: 'Narrative Data', desc: 'Transform rows and columns into a coherent story that is easier for models to summarize or analyze.' },
        { title: 'Custom Formatting', desc: 'Control the level of detail and the style used to describe your JSON objects and arrays.' },
        { title: '100% Client-Side', desc: 'Your data never leaves your computer; all transformation logic runs locally in your browser.' }
      ],
      example: {
        before: '{"temp": 30, "unit": "C"}',
        after: 'The current temperature is 30 degrees Celsius.'
      },
      faqs: [
        { q: 'Why not just send JSON?', a: 'While models can read JSON, describing the relationships in text can reduce hallucinations and improve factual accuracy.' },
        { q: 'Does it handle nested objects?', a: 'Yes, it recursively explores the JSON structure and builds a narrative that respects the data hierarchy.' },
        { q: 'Can I use this for RAG?', a: 'Absolutely, it is great for pre-processing JSON snippets before they are indexed in a vector database.' },
        { q: 'Is it free?', a: 'Yes, it is a free online utility for AI developers.' }
      ],
      complementary: {
        id: 'json-path-tester',
        name: 'JSONPath Tester',
        textEN: 'Need to extract just part of the JSON? Use',
        textVI: 'Cần trích xuất một phần JSON? Dùng bản'
      }
    },
    'ai-system-prompt': {
      what: 'The AI System Prompt Generator is a free online tool that helps you create high-quality instructions for AI assistants.',
      why: [
        { title: 'Optimized Instructions', desc: 'Use proven prompt engineering patterns like Few-Shot or Chain-of-Thought within your system instructions.' },
        { title: 'Niche Templates', desc: 'Choose from specialized templates for coding, creative writing, research, and technical analysis.' },
        { title: 'Constraint Builder', desc: 'Define exactly what the AI should NOT do to prevent jailbreaks and ensure consistent behavior.' },
        { title: 'One-Click Copy', desc: 'Instantly generate and copy your optimized system prompt for use in any LLM interface.' }
      ],
      example: {
        before: 'Role: Python Expert',
        after: 'You are a senior Python developer. Your goal is to provide type-safe, optimized code...'
      },
      faqs: [
        { q: 'What is a System Prompt?', a: 'It is the "hidden" set of instructions that configures an AI\'s persona, rules, and fundamental capabilities.' },
        { q: 'How does it improve accuracy?', a: 'By setting clear boundaries and reasoning steps, you help the model stay on task.' },
        { q: 'Can I save my prompts?', a: 'Currently, you can copy them; we do not store prompts on our server to ensure your privacy.' },
        { q: 'Does it work for GPT-4?', a: 'Yes, it is designed to work with all modern instruct-tuned models from OpenAI, Anthropic, and Google.' }
      ],
      complementary: {
        id: 'ai-prompt-builder',
        name: 'Prompt Builder',
        textEN: 'Got your system instructions? Build a full',
        textVI: 'Đã có chỉ dẫn hệ thống? Hãy tạo bản'
      }
    },
    'image-converter': {
      what: 'An Image Converter is a free online tool that lets you transform images between popular formats like JPG, PNG, WebP, and BMP. It ensures your photos are compatible with any application or web requirement instantly.',
      why: [
        { title: 'Format Flexibility', desc: 'Convert between high-quality PNGs, efficient WebPs, and universal JPGs with a single click.' },
        { title: 'Bulk Conversion', desc: 'Process multiple images at once to save time on large design or photography projects.' },
        { title: 'Quality Preservation', desc: 'Maintains optimal resolution and color accuracy during the conversion process.' },
        { title: 'Zero Uploads', desc: 'Your files are processed 100% in your browser. No image data is ever sent to our servers.' }
      ],
      example: {
        before: 'Input: photo.heic (Generic)',
        after: 'Output: photo.jpg (Ready for web)'
      },
      faqs: [
        { q: 'What formats are supported?', a: 'You can convert between JPG, PNG, WebP, and BMP formats instantly.' },
        { q: 'Is it free to use?', a: 'Yes, the image converter is completely free with no daily limits or signups.' },
        { q: 'Do you store my images?', a: 'No. All processing happens locally in your browser memory and is wiped when you close the tab.' },
        { q: 'Can I convert large images?', a: 'Yes, though extremely large files may be limited by your computer\'s available RAM.' }
      ],
      complementary: {
        id: 'image-resizer',
        name: 'Image Resizer',
        textEN: 'Need to change the dimensions too? Try',
        textVI: 'Cần thay đổi kích thước nữa? Hãy thử'
      }
    },
    'image-resizer': {
      what: 'Image Resizer is a free online tool that allows you to change the dimensions and file size of your images. Whether you need to meet exact pixel requirements or scale by percentage, it provides precision control.',
      why: [
        { title: 'Precise Scaling', desc: 'Resize by exact pixels or percentage while maintaining the original aspect ratio.' },
        { title: 'File Size Control', desc: 'Adjust dimensions to significantly reduce the weight of images for faster website loading.' },
        { title: 'Instant Preview', desc: 'See your changes immediately before downloading the final optimized file.' },
        { title: 'Privacy Guaranteed', desc: 'All resizing logic runs locally; your personal photos never leave your device.' }
      ],
      example: {
        before: 'Width: 4000px, Size: 5MB',
        after: 'Width: 800px, Size: 120KB'
      },
      faqs: [
        { q: 'Will it distort my image?', a: 'No. The tool locks the aspect ratio by default to ensure your image doesn\'t look stretched.' },
        { q: 'Can I resize multiple images?', a: 'Yes, you can upload and apply settings to a batch of images for fast processing.' },
        { q: 'What is the max size?', a: 'We support most modern camera resolutions; limits depend on your browser\'s memory.' },
        { q: 'Is it safe for personal photos?', a: 'Absolutely. All processing is 100% client-side; no images are uploaded to any server.' }
      ],
      complementary: {
        id: 'image-converter',
        name: 'Image Converter',
        textEN: 'Need to change the format as well? Use',
        textVI: 'Cần chuyển đổi định dạng nữa? Dùng bản'
      }
    },
    'svg-to-png': {
      what: 'SVG to PNG Converter is a free online utility that rasterizes vector graphics into high-quality PNG or JPG images. It allows you to specify custom resolutions for sharp, professional results.',
      why: [
        { title: 'Vector Rasterization', desc: 'Convert scalable SVG code or files into static images suitable for social media or print.' },
        { title: 'Transparent Backgrounds', desc: 'Export as PNG to preserve transparency from your original vector artwork.' },
        { title: 'Custom Resolution', desc: 'Specify exact width and height to export your SVG at any size without losing quality.' },
        { title: 'Secure Processing', desc: 'Your vector code remains local. No data is sent to external servers during rendering.' }
      ],
      example: {
        before: '<svg>...</svg> (Vector)',
        after: 'logo.png (Transparent Raster)'
      },
      faqs: [
        { q: 'Why convert SVG to PNG?', a: 'PNGs are compatible with almost all platforms, whereas some apps don\'t support direct SVG embedding.' },
        { q: 'Can I set a custom size?', a: 'Yes. You can scale your SVG to any resolution (e.g., 2048px) for high-definition output.' },
        { q: 'Does it support colors?', a: 'Yes, all gradients, paths, and fills defined in your SVG will be accurately rendered.' },
        { q: 'Is the quality high?', a: 'Yes. Since SVGs are vectors, the tool can rasterize them at any size with perfect sharpness.' }
      ],
      complementary: {
        id: 'svg-previewer',
        name: 'SVG Previewer',
        textEN: 'Just want to view or edit the code? Use',
        textVI: 'Chỉ muốn xem hoặc sửa code? Hãy dùng'
      }
    },
    'csv-to-excel': {
      what: 'CSV to Excel Converter is a free online tool that transforms comma-separated values into professional XLSX spreadsheets. It correctly handles delimiters and encoding to ensure your data imports perfectly.',
      why: [
        { title: 'Excel Compatibility', desc: 'Generate native .xlsx files that open perfectly in Microsoft Excel, Google Sheets, and Numbers.' },
        { title: 'Encoding Support', desc: 'Handles UTF-8 and other encodings to preserve special characters and international symbols.' },
        { title: 'Zero Data Leaks', desc: 'Your financial or personal data is processed 100% offline in your browser.' },
        { title: 'Instant Formatting', desc: 'Converts raw data into formatted tables ready for immediate analysis and reporting.' }
      ],
      example: {
        before: 'id,name,total\n1,John,50',
        after: '[Calculated Spreadsheet File Download]'
      },
      faqs: [
        { q: 'Can I open the result in Excel?', a: 'Yes, the tool generates a standard .xlsx file compatible with all modern spreadsheet software.' },
        { q: 'How many rows can it handle?', a: 'It can process tens of thousands of rows quickly, limited only by your browser\'s memory.' },
        { q: 'Are my business secrets safe?', a: 'Yes. We never see your data. The conversion logic runs entirely on your local machine.' },
        { q: 'What about different delimiters?', a: 'The tool auto-detects commas, semicolons, and tabs to ensure accurate column mapping.' }
      ],
      complementary: {
        id: 'json-to-excel',
        name: 'JSON to Excel',
        textEN: 'Working with JSON data instead? Try our',
        textVI: 'Làm việc với dữ liệu JSON? Hãy thử bản'
      }
    },
    'json-to-excel': {
      what: 'JSON to Excel Converter is a free online tool that flattens complex nested JSON objects and arrays into structured XLSX spreadsheets. It is ideal for developers and data analysts who need to export API responses to Excel.',
      why: [
        { title: 'Smart Flattening', desc: 'Automatically flattens nested JSON structures into clean, tabular columns for Excel.' },
        { title: 'Developer Friendly', desc: 'Easily convert API response payloads into readable spreadsheets for stakeholder reporting.' },
        { title: '100% Client-Side', desc: 'No sensitive API data is ever uploaded to a server. Processing is done entirely in your browser.' },
        { title: 'Instant Download', desc: 'Generate and save your .xlsx file in seconds with no wait times or registration.' }
      ],
      example: {
        before: '[{"user": {"id": 1, "name": "Dev"}}]',
        after: 'Column A: user.id | Column B: user.name'
      },
      faqs: [
        { q: 'How does it handle nested objects?', a: 'The tool uses dot-notation (e.g., user.address.city) to represent deep object hierarchies as columns.' },
        { q: 'Does it support large JSON files?', a: 'Yes, it can handle large arrays effectively depending on your system\'s available RAM.' },
        { q: 'Is it free for commercial use?', a: 'Yes, our tool is free for both personal and professional use with no licensing fees.' },
        { q: 'Do you store my data?', a: 'No. The JSON is parsed locally and the file is generated in-browser; nothing is sent to our servers.' }
      ],
      complementary: {
        id: 'csv-to-excel',
        name: 'CSV to Excel',
        textEN: 'Converting from a CSV source? Use our',
        textVI: 'Chuyển đổi từ nguồn CSV? Hãy dùng bản'
      }
    },
    'markdown-to-html': {
      what: 'Markdown to HTML Converter is a free online tool that transforms your Markdown documents into clean, styled HTML. It supports GitHub Flavored Markdown (GFM) and provides instant live previews.',
      why: [
        { title: 'GFM Support', desc: 'Correctly renders tables, task lists, and strikethrough text exactly as seen on GitHub.' },
        { title: 'Styled Output', desc: 'Download a standalone .html file with embedded CSS or copy the raw body markup.' },
        { title: 'Syntax Highlighting', desc: 'Automatically wraps code blocks for easy styling and highlighting in your blog or docs.' },
        { title: 'Instant Preview', desc: 'See your Markdown rendered in real-time as you type, ensuring perfect results before exporting.' }
      ],
      example: {
        before: '# Hello\n**Bold**',
        after: '<h1>Hello</h1>\n<strong>Bold</strong>'
      },
      faqs: [
        { q: 'Can I export a full HTML file?', a: 'Yes. You can download a complete document including head tags and a default stylesheet.' },
        { q: 'Does it support images?', a: 'Yes, it renders local or remote image links defined using the Markdown syntax.' },
        { q: 'Is my content private?', a: 'Yes. The parsing happens in your browser. Your draft content is never uploaded to any server.' },
        { q: 'Are tables supported?', a: 'Yes, fully compliant with GitHub Flavored Markdown tables and alignment syntax.' }
      ],
      complementary: {
        id: 'html-to-markdown',
        name: 'HTML to Markdown',
        textEN: 'Converting back to Markdown? Use our',
        textVI: 'Chuyển đổi ngược về Markdown? Dùng bản'
      }
    },
    'html-to-pdf': {
      what: 'HTML to PDF Converter is a free online utility that allows you to render HTML content and save it as a PDF document. It leverages your browser\'s native print engine to ensure accurate layouts and styling.',
      why: [
        { title: 'Native Rendering', desc: 'Uses modern browser engines to ensure your CSS, fonts, and images look exactly as intended.' },
        { title: 'Custom CSS Support', desc: 'Include print-specific styles to ensure the exported PDF is perfectly formatted for A4 or Letter sizes.' },
        { title: 'Safe & Secure', desc: 'Your document content is rendered locally. We do not store or see the HTML you convert.' },
        { title: 'No Watermarks', desc: 'Generate clean, professional PDFs without any branding or forced headers/footers.' }
      ],
      example: {
        before: '<div><h1>Invoice</h1>...</div>',
        after: '[Professional PDF Document Download]'
      },
      faqs: [
        { q: 'Do images work in the PDF?', a: 'Yes, as long as the images are accessible to your browser during the conversion process.' },
        { q: 'Can I format the page?', a: 'Yes. You can use CSS @media print rules to hide elements or adjust layouts specifically for the PDF.' },
        { q: 'Is there a page limit?', a: 'The limit is based on your browser and computer performance; it can handle very long documents.' },
        { q: 'Is it free?', a: 'Yes, this tool is completely free and requires no account or subscription.' }
      ],
      complementary: {
        id: 'markdown-to-html',
        name: 'Markdown to HTML',
        textEN: 'Building the HTML from Markdown? Use',
        textVI: 'Tạo HTML từ Markdown? Hãy dùng bản'
      }
    },
    'image-compressor': {
      what: 'Image Compressor is a free online tool that optimizes your images to reduce file size without sacrificing visible quality. It is perfect for speeding up websites and reducing storage usage.',
      why: [
        { title: 'Smart Compression', desc: 'Uses advanced algorithms to strip unnecessary metadata and optimize color data for smaller sizes.' },
        { title: 'A/B Comparison', desc: 'Visually compare the original and compressed versions side-by-side before downloading.' },
        { title: 'Privacy Focus', desc: 'Your photos are processed entirely in the browser. No data ever leaves your device.' },
        { title: 'Web Performance', desc: 'Significantly reduce page load times by optimizing all your PNG and JPG assets.' }
      ],
      example: {
        before: 'Original: 3.2MB',
        after: 'Optimized: 450KB (85% reduction)'
      },
      faqs: [
        { q: 'Will my image look blurry?', a: 'At recommended settings, the quality loss is almost invisible to the human eye.' },
        { q: 'What formats are supported?', a: 'We support JPEG and PNG optimization with advanced quantization techniques.' },
        { q: 'Can I compress in bulk?', a: 'Yes, you can upload multiple images and compress them all at once for efficiency.' },
        { q: 'Do you keep my photos?', a: 'Never. All processing is 100% local. Your files are never uploaded to any server.' }
      ],
      complementary: {
        id: 'image-resizer',
        name: 'Image Resizer',
        textEN: 'Still too large? Try changing dimensions with',
        textVI: 'Vẫn còn quá lớn? Thử đổi kích thước với'
      }
    },
    'image-to-base64': {
      what: 'Image to Base64 is a free online tool that converts your images into Base64 encoded data URLs instantly. It allows you to embed image data directly into HTML, CSS, or JSON without needing external file hosting.',
      why: [
        { title: 'Zero HTTP Requests', desc: 'Improve page load performance by embedding small icons and graphics directly into your code.' },
        { title: 'Clean Data URIs', desc: 'Automatically generates the correct prefix based on your image type (PNG, JPEG, SVG, WebP, etc.).' },
        { title: '100% Client-Side', desc: 'Your images are processed locally in your browser. No image data is ever uploaded to our servers.' },
        { title: 'Easy Integration', desc: 'One-click copy for the entire Data URI or just the Base64 string for CSS backgrounds and source tags.' }
      ],
      example: {
        before: 'Logo.png (5KB)',
        after: 'data:image/png;base64,iVBORw0KGgo...'
      },
      faqs: [
        { q: 'How to convert image to base64 online?', a: 'Just drag and drop your image into the tool. It will instantly generate the base64 string and data URL for you to copy.' },
        { q: 'Does base64 increase image size?', a: 'Yes, base64 encoding typically increases the data size by about 33% compared to the original binary file.' },
        { q: 'When should I use base64 for images?', a: 'It is best for small icons, logos, or pixel-art where reducing HTTP requests is more important than the small file size increase.' },
        { q: 'Is it safe to upload my images?', a: 'Our tool is 100% browser-based. Your images never leave your computer, ensuring absolute privacy.' }
      ],
      complementary: {
        id: 'base64-encode-decode',
        name: 'Base64 Tool',
        textEN: 'Need to encode plain text instead? Try',
        textVI: 'Cần mã hóa văn bản thuần? Thử ngay'
      }
    },
    'qr-generator': {
      what: 'QR Code Generator is a free online tool that converts any text, URL, or data into a high-quality QR code instantly. It supports multiple data types including Wi-Fi credentials, vCards, and SMS.',
      why: [
        { title: 'Multiple Data Types', desc: 'Generate codes for URLs, plain text, Wi-Fi networks, business cards (vCard), and more.' },
        { title: 'Instant Generation', desc: 'Codes are generated in real-time as you type, with no delays or server processing.' },
        { title: 'High Resolution', desc: 'Download your QR codes as crisp, professional-quality PNG files suitable for print and digital use.' },
        { title: '100% Private', desc: 'Your generated data and QR codes are processed locally in your browser. No registration is required.' }
      ],
      example: {
        before: 'https://devtools.online',
        after: '[High Quality QR Code Image]'
      },
      faqs: [
        { q: 'How to make a QR code for a link?', a: 'Select the "URL" type, paste your link, and the QR code will be generated instantly for download.' },
        { q: 'Are these QR codes permanent?', a: 'Yes. These are static QR codes that encode the data directly. They never expire and will work forever.' },
        { q: 'Can I customize the QR code?', a: 'Yes, you can adjust the size and error correction levels to ensure your code is readable even when slightly damaged.' },
        { q: 'Is there a cost to generate?', a: 'No, this tool is completely free with no limits on the number of QR codes you can create.' }
      ],
      complementary: {
        id: 'barcode-generator',
        name: 'Barcode Generator',
        textEN: 'Need traditional barcodes instead? Use our',
        textVI: 'Cần mã vạch truyền thống? Hãy dùng'
      }
    },
    'chmod-calculator': {
      what: 'Chmod Calculator is a free online tool that helps you calculate Unix/Linux file permissions using both octal (e.g., 755) and symbolic (rwxr-xr-x) notation. It simplifies the management of server file security.',
      why: [
        { title: 'Interactive Permissions', desc: 'Toggle Read, Write, and Execute bits for Owner, Group, and Others to see the result instantly.' },
        { title: 'Two-Way Conversion', desc: 'Input an octal value to see the symbolic string, or vice versa, to understand permissions deeply.' },
        { title: 'Common Presets', desc: 'Quickly select common configuration standards like 644 (Public Files) or 755 (Directories).' },
        { title: 'Linux Command Generator', desc: 'Automatically generates the full "chmod" command string for you to copy and paste into your terminal.' }
      ],
      example: {
        before: 'r+w for Owner',
        after: 'chmod 600 filename'
      },
      faqs: [
        { q: 'What does chmod 755 mean?', a: '755 means the owner can read, write, and execute (7), while the group and others can only read and execute (5).' },
        { q: 'What is octal notation?', a: 'Octal uses three digits (0-7) to represent permissions, where Read=4, Write=2, and Execute=1.' },
        { q: 'When should I use 777?', a: 'Almost never. 777 gives everyone full access, which is a major security risk on production servers.' },
        { q: 'Is this tool safe for sensitive servers?', a: 'Yes. The calculator is purely educational and logic-based; no data is sent to our servers.' }
      ],
      complementary: {
        id: 'env-parser',
        name: 'ENV Parser',
        textEN: 'Configuring your server environment? Use our',
        textVI: 'Đang cấu hình môi trường server? Hãy dùng'
      }
    },
    'env-parser': {
      what: '.ENV Parser is a free online utility that transforms your environment configuration files into structured JSON and vice versa. It helps developers manage complex application settings across different deployment stages.',
      why: [
        { title: 'Two-Way Sync', desc: 'Seamlessly convert .env key-value pairs to JSON objects or back to standard .env format.' },
        { title: 'Syntax Highlighting', desc: 'Easily spot comments, variable names, and values with a built-in code editor view.' },
        { title: 'Format Validation', desc: 'Automatically detects invalid lines or broken formatting in your configuration strings.' },
        { title: '100% Private', desc: 'Your sensitive environment variables are processed entirely in your browser. We never see your secrets.' }
      ],
      example: {
        before: 'DB_PORT=5432\nDEBUG=true',
        after: '{\n  "DB_PORT": "5432",\n  "DEBUG": "true"\n}'
      },
      faqs: [
        { q: 'How to parse .env file online?', a: 'Paste your .env content into the input. The tool will parse it and provide a structured JSON view instantly.' },
        { q: 'Does it support comments?', a: 'Yes. Standard # comments are recognized and handled correctly during parsing.' },
        { q: 'Is it safe to paste my secrets here?', a: 'Yes, because the tool is 100% client-side. Your API keys and database credentials never leave your browser.' },
        { q: 'Can I export to JSON?', a: 'Yes, once parsed, you can copy the resulting JSON object for use in your CI/CD pipelines or app logic.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Need to prettify the JSON output? Use our',
        textVI: 'Cần làm đẹp đầu ra JSON? Hãy dùng'
      }
    },
    'keycode-tester': {
      what: 'KeyCode Tester is a free online tool that captures keyboard events and provides detailed information about every key you press. It is a vital utility for web developers building shortcuts and keyboard navigation.',
      why: [
        { title: 'Real-time Capture', desc: 'Instantly view key codes, key names, and event properties the moment you press any key.' },
        { title: 'Modifier Detection', desc: 'Visualizes the status of Shift, Ctrl, Alt, and Meta (Cmd) keys to test complex combinations.' },
        { title: 'Event Data', desc: 'Inspect low-level event properties like keyCode, charCode, and which for full browser compatibility testing.' },
        { title: 'Developer Ready', desc: 'Provides ready-to-use JavaScript event listener snippets for the key you just tested.' }
      ],
      example: {
        before: 'Press [ENTER]',
        after: 'Key: Enter, Code: 13'
      },
      faqs: [
        { q: 'How do I find a key code online?', a: 'Simply open this tool and press the key on your keyboard. The code and its name will appear on screen instantly.' },
        { q: 'What is the difference between key and code?', a: ' "Key" represents the character (e.g., "a" or "A"), while "Code" represents the physical key position (e.g., "KeyA").' },
        { q: 'Is it compatible with all browsers?', a: 'Yes, it identifies standardized properties that work across modern versions of Chrome, Firefox, and Safari.' },
        { q: 'Does it support special keys?', a: 'Yes, it can detect function keys (F1-F12), media keys, and platform-specific keys like the Windows key or Cmd.' }
      ],
      complementary: {
        id: 'js-formatter',
        name: 'JS Formatter',
        textEN: 'Writing keyboard logic in JS? Clean it with',
        textVI: 'Đang viết logic phím bằng JS? Hãy làm sạch với'
      }
    },
    'diagram-creator': {
      what: 'Diagram Creator is a free online tool that uses Mermaid.js syntax to generate professional flowcharts, sequence diagrams, and mindmaps. It allows you to build complex diagrams using simple, readable text.',
      why: [
        { title: 'Code to Diagram', desc: 'Transform simple text descriptions into beautiful, professional-grade visual diagrams instantly.' },
        { title: 'Multiple Layouts', desc: 'Support for Flowcharts, Sequence Diagrams, ERDs, Gantt Charts, and Class Diagrams.' },
        { title: 'Instant Preview', desc: 'The live rendering engine updates your diagram in real-time as you type your Mermaid code.' },
        { title: 'High Quality Export', desc: 'Export your finished diagrams as SVG or PNG files suitable for documentation and presentations.' }
      ],
      example: {
        before: 'graph TD; A-->B;',
        after: '[Visual Flowchart Diagram]'
      },
      faqs: [
        { q: 'How to create flowcharts from text?', a: 'Use our diagram editor and follow the Mermaid syntax (e.g., "A --> B") to build your structure visibly.' },
        { q: 'Can I export diagrams to PNG?', a: 'Yes, you can export your creations as high-resolution PNG or SVG files with a single click.' },
        { q: 'Is my diagram saved?', a: 'We process everything locally. Your diagrams are stored in your current session and are not saved on our servers.' },
        { q: 'Is this tool free?', a: 'Yes, it is completely free and uses open-source libraries to provide professional diagramming features.' }
      ],
      complementary: {
        id: 'erd-diagram',
        name: 'ERD Generator',
        textEN: 'Building database diagrams? Use our',
        textVI: 'Đang xây dựng sơ đồ database? Hãy dùng'
      }
    },
    'log-viewer': {
      what: 'Log Viewer is a free online utility that allows you to parse, filter, and analyze structured logs from multiple formats. It supports JSON Lines (Serilog, Pino), .NET NLog, and standard server logs (Apache/Nginx).',
      why: [
        { title: 'Smart Parsing', desc: 'Automatically recognizes structured data within log lines and presents them in a clean, readable table.' },
        { title: 'Powerful Filtering', desc: 'Live filter by log levels (Info, Warning, Error) or search for specific text strings instantly.' },
        { title: 'Performance Optimized', desc: 'Designed to handle large log files efficiently without slowing down your browser.' },
        { title: '100% Private', desc: 'Your log data stays entirely on your device. We never upload or store your logs for any reason.' }
      ],
      example: {
        before: '{"lvl":"ERR","msg":"Failed"}',
        after: '[Table Row: ERR | Failed]'
      },
      faqs: [
        { q: 'How to view JSON logs online?', a: 'Upload your .json or .log file. The viewer will automatically format the structured data into a sortable table.' },
        { q: 'Does it support Serilog or Pino?', a: 'Yes, it is optimized for JSON Lines (ndjson) format commonly emitted by modern logging libraries.' },
        { q: 'Can I filter by error level?', a: 'Yes, use the level-picker to highlight or isolate only the errors or warnings you need to debug.' },
        { q: 'Is it safe for production logs?', a: 'Absolutely. Every bit of log data is processed locally in your browser to maintain total data confidentiality.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Need to inspect a specific log object? Use',
        textVI: 'Cần kiểm tra một đối tượng log? Hãy dùng'
      }
    },
    'xml-formatter': {
      what: 'XML Formatter is a free online tool that beautifies and validates XML documents instantly. It takes unreadable, minified XML code and transforms it into a structured, indented format for easy debugging and reading.',
      why: [
        { title: 'Improved Readability', desc: 'Convert flattened XML into a clear hierarchical tree structure with proper indentation.' },
        { title: 'Syntax Validation', desc: 'Automatically detects missing tags, unclosed brackets, and other common XML syntax errors.' },
        { title: 'Multiple Indents', desc: 'Choose between 2-space, 4-space, or Tab indentation to match your coding standards.' },
        { title: '100% Client-Side', desc: 'Your data is processed locally in your browser. No XML content is ever sent to our servers.' }
      ],
      example: {
        before: '<root><item id="1">Text</item></root>',
        after: '<root>\n  <item id="1">Text</item>\n</root>'
      },
      faqs: [
        { q: 'How to format XML online?', a: 'Paste your XML code into the editor. The tool will instantly validate and beautify the structure for you.' },
        { q: 'Does it check for XML errors?', a: 'Yes, it provides real-time validation and highlights syntax errors like mismatched tags or illegal characters.' },
        { q: 'Is there a limit on file size?', a: 'The tool handles several megabytes of XML efficiently, limited only by your browser\'s memory.' },
        { q: 'Is my XML data safe?', a: 'Absolutely. All processing happens within your browser; we never store or see your data.' }
      ],
      complementary: {
        id: 'xml-minifier',
        name: 'XML Minifier',
        textEN: 'Need to compress your XML for production? Use our',
        textVI: 'Cần nén XML cho phiên bản chính thức? Hãy dùng'
      }
    },
    'xml-minifier': {
      what: 'XML Minifier is a free online tool that compresses XML documents by removing unnecessary whitespace and comments. This reduces file size and improves loading speed for web applications and APIs.',
      why: [
        { title: 'File Size Reduction', desc: 'Significantly decrease the footprint of your XML files by stripping all non-essential characters.' },
        { title: 'Comment Removal', desc: 'Optionally remove internal XML comments to protect internal logic and reduce data transfer.' },
        { title: 'Performance Boost', desc: 'Smaller files lead to faster parsing and reduced bandwidth usage in high-traffic environments.' },
        { title: 'Instant Compression', desc: 'Paste your code and get the minified result immediately with a single click.' }
      ],
      example: {
        before: '<note>\n  <to>Tove</to>\n</note>',
        after: '<note><to>Tove</to></note>'
      },
      faqs: [
        { q: 'How do I minify XML online?', a: 'Paste your XML content and click the minify button. All whitespace and redundant characters will be removed instantly.' },
        { q: 'Does minification remove data?', a: 'No, it only removes indentation, newlines, and optional comments. The data structure remains identical.' },
        { q: 'When should I minify XML?', a: 'It is recommended for production environments to save bandwidth and improve API response times.' },
        { q: 'Can I undo the minification?', a: 'Yes, you can use our XML Formatter to restore the readable structure at any time.' }
      ],
      complementary: {
        id: 'xml-formatter',
        name: 'XML Formatter',
        textEN: 'Need to read the XML again? Use our',
        textVI: 'Cần đọc lại XML? Hãy dùng bản'
      }
    },
    'graphql-formatter': {
      what: 'GraphQL Formatter is a free online tool that beautifies your GraphQL queries, mutations, and schemas. It ensures your code follows standard formatting rules for better team collaboration and readability.',
      why: [
        { title: 'Clean Architecture', desc: 'Automatically aligns fields, arguments, and fragment definitions for a professional look.' },
        { title: 'Syntax Highlighting', desc: 'Easily distinguish between fields, types, and variables with a developer-friendly editor.' },
        { title: 'Standard Compliance', desc: 'Follows Prettier-style formatting rules to keep your queries consistent across all projects.' },
        { title: 'Local Processing', desc: 'Your GraphQL schemas and queries are processed entirely in your browser for maximum privacy.' }
      ],
      example: {
        before: '{user(id:5){name email}}',
        after: '{\n  user(id: 5) {\n    name\n    email\n  }\n}'
      },
      faqs: [
        { q: 'How to format GraphQL online?', a: 'Paste your query or schema into the tool. It will automatically apply proper indentation and spacing.' },
        { q: 'Does it support fragments?', a: 'Yes, it perfectly formats fragments, inline fragments, and complex nested queries.' },
        { q: 'Can it format large schemas?', a: 'Yes, the engine is optimized to handle large .graphql or .gql schema files efficiently.' },
        { q: 'Is it free to use?', a: 'Yes, our GraphQL formatter is completely free with no registration or limits.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Formatting the query result? Use our',
        textVI: 'Định dạng kết quả truy vấn? Hãy dùng'
      }
    },
    'yaml-formatter': {
      what: 'YAML Formatter is a free online tool that beautifies and validates YAML (YAML Ain\'t Markup Language) data. It helps identify indentation errors, which are critical in YAML, and provides a clear structural view.',
      why: [
        { title: 'Indentation Genius', desc: 'Fixes inconsistent spacing and ensures your YAML structure is perfectly aligned.' },
        { title: 'Error Detection', desc: 'Detects illegal characters and incorrect nesting that would otherwise break your app configuration.' },
        { title: 'JSON Compatibility', desc: 'Easy visualization of YAML nodes which can often be complex to read in plain text.' },
        { title: 'Privacy First', desc: 'Your configuration files are sensitive. This tool runs 100% locally in your browser.' }
      ],
      example: {
        before: 'port: 8080\nserver:name: localhost',
        after: 'port: 8080\nserver:\n  name: localhost'
      },
      faqs: [
        { q: 'How to format YAML online?', a: 'Paste your YAML string. The tool will validate the syntax and apply standard indentation automatically.' },
        { q: 'Why is my YAML invalid?', a: 'YAML is extremely sensitive to spaces. This tool will highlight the exact line where a formatting error occurs.' },
        { q: 'Can I convert YAML to JSON?', a: 'Yes, once formatted, you can easily use our converter tools to switch between formats.' },
        { q: 'Is this safe for config files?', a: 'Yes. No data is uploaded. Everything staying on your local machine ensures total security.' }
      ],
      complementary: {
        id: 'yaml-json',
        name: 'YAML Converter',
        textEN: 'Need to convert to JSON instead? Try',
        textVI: 'Cần chuyển đổi sang JSON? Hãy thử'
      }
    },
    'csv-to-json': {
      what: 'CSV to JSON Converter is a free online tool that transforms your tabular CSV data into structured JSON arrays or objects. It is perfect for developers needing to import spreadsheet data into web applications.',
      why: [
        { title: 'Auto-Delimiter Detection', desc: 'Automatically identifies if your file uses commas, semicolons, or tabs as separators.' },
        { title: 'Header Mapping', desc: 'Uses the first row as property names to create clean, meaningful JSON objects.' },
        { title: 'Large Data Support', desc: 'Highly optimized to handle thousands of rows of CSV data directly in your browser.' },
        { title: 'JSON Array Export', desc: 'Produces standardized JSON arrays ready to be used in JavaScript or stored in NoSQL databases.' }
      ],
      example: {
        before: 'id,name\n1,Dev',
        after: '[{"id": 1, "name": "Dev"}]'
      },
      faqs: [
        { q: 'How to convert CSV to JSON online?', a: 'Upload your .csv file or paste the text. Click convert to get the formatted JSON array instantly.' },
        { q: 'Does it support custom delimiters?', a: 'Yes, the tool can auto-detect or let you specify semicolons, pipes (|), or tabs.' },
        { q: 'Can I download the result?', a: 'Yes, you can copy the JSON to your clipboard or download it as a .json file.' },
        { q: 'Is my data secure?', a: 'Yes. All conversion logic runs client-side. Your spreadsheet data never touches our servers.' }
      ],
      complementary: {
        id: 'csv-viewer',
        name: 'CSV Viewer',
        textEN: 'Just want to browse the data? Use our',
        textVI: 'Chỉ muốn xem qua dữ liệu? Hãy dùng'
      }
    },
    'csv-viewer': {
      what: 'CSV Viewer is a free online interactive tool that allows you to browse, search, and sort CSV data in a clean table format. It handles large files with ease, providing a spreadsheet-like experience in your browser.',
      why: [
        { title: 'Interactive Sorting', desc: 'Click any column header to sort your data alphabetically or numerically instantly.' },
        { title: 'Live Search', desc: 'Find specific rows or values across thousands of entries with a real-time filtering bar.' },
        { title: 'Clean Interface', desc: 'View messy raw CSV data in a beautiful, paginated table that is easy to analyze.' },
        { title: 'No Data Uploads', desc: 'Browser-based processing ensures that your private data files are never uploaded to any server.' }
      ],
      example: {
        before: 'id,name,role\n1,John,Admin',
        after: '[Interactive Data Table with Sorting]'
      },
      faqs: [
        { q: 'How to view CSV files online?', a: 'Drag and drop your .csv file into the tool. It will instantly render the data into an interactive table.' },
        { q: 'Can I sort columns?', a: 'Yes. Simply click on a column header to toggle between ascending and descending sort order.' },
        { q: 'Does it support large files?', a: 'Yes, our viewer is optimized to handle large datasets smoothly without freezing your browser.' },
        { q: 'Is it safe for sensitive data?', a: 'Yes. All data stays in your local browser memory and is never transmitted over the internet.' }
      ],
      complementary: {
        id: 'csv-to-excel',
        name: 'CSV to Excel',
        textEN: 'Need to edit the data instead? Use our',
        textVI: 'Cần chỉnh sửa dữ liệu? Hãy dùng bản'
      }
    },
    'random-string': {
      what: 'Random String Generator is a free online tool that creates secure, random text strings based on your custom requirements. You can define the length and character set (alphanumeric, symbols, hex) for any purpose.',
      why: [
        { title: 'Custom Charsets', desc: 'Include uppercase, lowercase, numbers, or special symbols to meet specific password or token rules.' },
        { title: 'Bulk Generation', desc: 'Create up to 100 random strings at once for batch testing or database seeding.' },
        { title: 'Secure & Random', desc: 'Uses cryptographically secure random number generation (Web Crypto API) for maximum safety.' },
        { title: 'No Data Uploads', desc: 'All strings are generated locally in your browser. No data is ever sent to a server.' }
      ],
      example: {
        before: 'Length: 12, Charset: A-Z, 0-9',
        after: 'X7P2Q9L1M4K8'
      },
      faqs: [
        { q: 'How to generate a random string?', a: 'Choose your desired length and character types, then click "Generate". The results appear instantly.' },
        { q: 'Is this tool secure for passwords?', a: 'Yes, it uses the Web Crypto API, which is the browser standard for high-entropy randomization.' },
        { q: 'Can I generate a list of strings?', a: 'Yes, you can specify the number of strings to generate in a single batch.' },
        { q: 'What character sets are supported?', a: 'Lowercase, Uppercase, Numbers, Special Symbols, Hexadecimal, and custom character inputs.' }
      ],
      complementary: {
        id: 'uuid-generator',
        name: 'UUID Generator',
        textEN: 'Need a standardized unique ID? Try',
        textVI: 'Cần mã định danh chuẩn? Thử'
      }
    },
    'data-faker': {
      what: 'Data Faker is a free online tool that generates realistic test data for software development and QA. Create mock names, emails, addresses, and company data for database seeding or UI prototyping.',
      why: [
        { title: 'Realistic Mock Data', desc: 'Generates human-readable names and valid-looking addresses for high-quality testing.' },
        { title: 'Multiple Locales', desc: 'Supports data generation for different regions and languages (e.g., US, VN, UK).' },
        { title: 'Bulk Export', desc: 'Generate hundreds of rows of fake data and export them as JSON or CSV files instantly.' },
        { title: 'Privacy Guaranteed', desc: 'No data is uploaded. The generation happens using local libraries in your browser.' }
      ],
      example: {
        before: 'Fields: Name, Email',
        after: '{"name": "John Doe", "email": "john.doe@example.com"}'
      },
      faqs: [
        { q: 'What is fake data generation?', a: 'It is the process of creating "dummy" data that looks like real user data but contains no private information.' },
        { q: 'How many rows can I generate?', a: 'You can generate up to 1000 rows per session for bulk testing.' },
        { q: 'What formats can I export?', a: 'Our tool supports exporting to JSON array and CSV formats for easy database import.' },
        { q: 'Is this data based on real people?', a: 'No, all data is randomly synthesized by algorithms and does not represent real individuals.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Exported as JSON? Prettify it with',
        textVI: 'Đã xuất ra JSON? Hãy làm đẹp với'
      }
    },
    'nanoid-generator': {
      what: 'Nano ID / ULID Generator is a free online tool for creating compact, URL-safe, and unique identifiers. It is a modern, lightweight alternative to UUID for distributed systems.',
      why: [
        { title: 'Compact Length', desc: 'Nano IDs are smaller than UUIDs while maintaining the same collision resistance.' },
        { title: 'URL Safe', desc: 'Uses a character set that is safe to use in web URLs without encoding.' },
        { title: 'Sortable ULIDs', desc: 'Generate Universally Unique Lexicographically Sortable Identifiers (ULID) for time-ordered data.' },
        { title: 'Custom Alphabet', desc: 'Define your own characters to create branded or restricted unique IDs.' }
      ],
      example: {
        before: 'Standard Nano ID',
        after: 'V1StGXR8_Z5jdHi6B-myT'
      },
      faqs: [
        { q: 'What is a Nano ID?', a: 'Nano ID is a tiny, secure, URL-friendly, unique string ID generator for JavaScript.' },
        { q: 'What is a ULID?', a: 'ULID is a sortable unique identifier that includes a timestamp, making it useful for database primary keys.' },
        { q: 'Are these IDs truly unique?', a: 'Yes, both Nano ID and ULID use high-entropy random bits to practically eliminate collision risk.' },
        { q: 'Can I customize the Nano ID length?', a: 'Yes, you can adjust the length to balance between collision risk and string size.' }
      ],
      complementary: {
        id: 'uuid-generator',
        name: 'UUID Generator',
        textEN: 'Need a standard 128-bit ID? Use',
        textVI: 'Cần ID 128-bit chuẩn? Hãy dùng'
      }
    },
    'favicon-generator': {
      what: 'Favicon Generator is a versatile online tool that turns emojis, text, or simple designs into website icons. Generate multiple sizes from 16x16 to 512x512 with transparent backgrounds.',
      why: [
        { title: 'Emoji to Favicon', desc: 'Instantly convert your favorite emoji into a clean, modern website icon.' },
        { title: 'Text-Based Icons', desc: 'Create letter-based logos with custom fonts, colors, and background shapes.' },
        { title: 'All Standard Sizes', desc: 'Automatically generates PNG files for 16x16, 32x32, 180x180 (Apple Touch), and more.' },
        { title: 'Free & No Signup', desc: 'Download your full favicon set immediately without creating an account.' }
      ],
      example: {
        before: 'Input: 🚀',
        after: '[Favicon package: 16px, 32px, 128px PNGs]'
      },
      faqs: [
        { q: 'What sizes are included?', a: 'The tool provides all standard web sizes: 16x16, 32x32, 48x48, 128x128, 180x180, and 512x512 pixels.' },
        { q: 'Can I use any emoji?', a: 'Yes, any system-supported emoji can be rendered as a high-quality favicon.' },
        { q: 'Does it support transparency?', a: 'Yes, your icons are exported as PNG files with full alpha transparency support.' },
        { q: 'How do I install the favicon?', a: 'Upload the generated PNGs to your server and add the provided <link> tags to your HTML <head>.' }
      ],
      complementary: {
        id: 'image-converter',
        name: 'Image Converter',
        textEN: 'Need to convert other assets? Use',
        textVI: 'Cần chuyển đổi tài nguyên khác? Dùng'
      }
    },
    'barcode-generator': {
      what: 'Barcode Generator is a free online tool to create professional barcodes in various formats including EAN-13, Code128, and UPC. Perfect for labeling, inventory, and retail testing.',
      why: [
        { title: 'Multiple Formats', desc: 'Supports EAN-13, Code128, Code39, UPC-A, and many more industrial standards.' },
        { title: 'Dynamic Previews', desc: 'Visual feedback as you type your characters to ensure standard compliance.' },
        { title: 'High-Resolution Export', desc: 'Download clean, scannable PNG images at various scales.' },
        { title: 'Retail Compatible', desc: 'Generates standard-compliant checksums for retail-specific codes like EAN and UPC.' }
      ],
      example: {
        before: 'Value: 123456789012',
        after: '[Scannable EAN-13 Barcode Image]'
      },
      faqs: [
        { q: 'Which barcode should I use?', a: 'Code128 is best for alphanumeric data; EAN-13 or UPC-A are the standards for retail products.' },
        { q: 'Is the barcode scannable?', a: 'Yes, the generated PNGs are high-contrast and compatible with all physical and mobile scanners.' },
        { q: 'Can I generate barcodes for free?', a: 'Yes, this tool is 100% free for both personal and commercial testing use.' },
        { q: 'Does it support text below?', a: 'Yes, standard barcodes include the human-readable text labels automatically.' }
      ],
      complementary: {
        id: 'qr-generator',
        name: 'QR Generator',
        textEN: 'Need a 2D matrix code? Use our',
        textVI: 'Cần mã ma trận 2D? Hãy dùng'
      }
    },
    'national-id-generator': {
      what: 'National ID Generator is a professional test data utility for developers. It generates valid-looking national identity numbers (CCCD, SSN, NRIC) for software testing and validation logic.',
      why: [
        { title: 'Checksum Verified', desc: 'Ensures generated numbers pass standard MOD-11 or other regional checksum validations.' },
        { title: 'Global Support', desc: 'Includes logic for Vietnam CCCD, US SSN, UK NI, Singapore NRIC, and European IDs.' },
        { title: 'Test Only Data', desc: 'Creates fake numbers that match patterns but do not belong to real individuals.' },
        { title: 'Bulk Generation', desc: 'Quickly create a list of multiple test IDs for batch QA scenarios.' }
      ],
      example: {
        before: 'Country: Vietnam (CCCD)',
        after: '037095012345'
      },
      faqs: [
        { q: 'Are these real ID numbers?', a: 'No, these are mathematically valid strings for software testing purposes only.' },
        { q: 'Which countries are supported?', a: 'Vietnam, USA, UK, Singapore, Germany, France, and more are added regularly.' },
        { q: 'Can I use these for real registration?', a: 'Absolutely not. Using fake IDs for real-world registration is illegal and unethical.' },
        { q: 'Is there a limit on generation?', a: 'No, you can generate as many test IDs as needed for your development workflows.' }
      ],
      complementary: {
        id: 'data-faker',
        name: 'Data Faker',
        textEN: 'Need names and addresses too? Try',
        textVI: 'Cần cả họ tên và địa chỉ? Hãy thử'
      }
    },
    'color-converter': {
      what: 'Color Converter is a free online utility to transform colors between HEX, RGB, HSL, and HSV formats. Perfect for developers and designers who need precise color codes for CSS, Android, or iOS development.',
      why: [
        { title: 'Instant Conversion', desc: 'Type in any format and instantly see the equivalent codes in HEX, RGB, HSL, and HSV.' },
        { title: 'Visual Picker', desc: 'Use the integrated color picker to visually select a color and get its data immediately.' },
        { title: 'Alpha Support', desc: 'Handles transparency values (RGBA/HSLA) to ensure your web designs remain consistent.' },
        { title: 'One-Click Copy', desc: 'Quickly copy any color code to your clipboard with a single click for efficient workflow.' }
      ],
      example: {
        before: 'HEX: #3498db',
        after: 'RGB: (52, 152, 219), HSL: (204°, 70%, 53%)'
      },
      faqs: [
        { q: 'How do I convert HEX to RGB?', a: 'Paste your HEX code (e.g., #ffffff) into the input, and the RGB values will appear instantly below.' },
        { q: 'Does it support HSL colors?', a: 'Yes, it provides full bidirectional conversion between HSL and other standard web formats.' },
        { q: 'Can I select colors visually?', a: 'Yes, click the color preview box to open a system-standard color picker.' },
        { q: 'Is the conversion accurate?', a: 'Yes, the tool uses standard mathematical formulas for 100% accurate color space mapping.' }
      ],
      complementary: {
        id: 'css-gradient',
        name: 'CSS Gradient',
        textEN: 'Mixing colors? Try our',
        textVI: 'Đang trộn màu? Thử'
      }
    },
    'color-palette': {
      what: 'Color Palette Generator is a professional design tool for creating harmonious color schemes. Generate complementary, triadic, analogous, and monochromatic palettes for your next web project.',
      why: [
        { title: 'Harmonious Schemes', desc: 'Automatically calculates color theory relationships to ensure your palettes always look great.' },
        { title: 'Inspiration Mode', desc: 'Generate random beautiful palettes with a single click to overcome creative blocks.' },
        { title: 'Export Ready', desc: 'Copy a full list of HEX codes or download the palette for use in your design software.' },
        { title: 'Real-time Preview', desc: 'See how the colors interact with each other in a clean, visual layout before using them.' }
      ],
      example: {
        before: 'Seed: Blue',
        after: '[Palette: Blue, Light Blue, Deep Blue, Complementary Orange]'
      },
      faqs: [
        { q: 'What is a complementary palette?', a: 'It uses colors from opposite sides of the color wheel to create high contrast and vibrant looks.' },
        { q: 'Can I save my palettes?', a: 'You can copy the HEX codes or use the shareable URL to save your specific configuration.' },
        { q: 'How many colors are generated?', a: 'The tool typically generates a 4 or 5-color scheme based on your selected seed color.' },
        { q: 'Is this tool free?', a: 'Yes, it is 100% free with no limits on the number of palettes you can generate.' }
      ],
      complementary: {
        id: 'color-extractor',
        name: 'Color Extractor',
        textEN: 'Got a photo? Extract colors using',
        textVI: 'Có ảnh đẹp? Hãy trích màu bằng'
      }
    },
    'css-gradient': {
      what: 'CSS Gradient Generator is a visual builder for linear, radial, and conic gradients. Create stunning backgrounds for your website with real-time previews and production-ready CSS code.',
      why: [
        { title: 'Visual Multi-Stop', desc: 'Add, move, and remove color stops visually on the gradient track.' },
        { title: 'All Gradient Types', desc: 'Supports standard Linear and Radial gradients, plus modern Conic gradients for unique effects.' },
        { title: 'Cross-Browser CSS', desc: 'Generates standard-compliant CSS that works across all modern browsers.' },
        { title: 'Angle & Position Control', desc: 'Fine-tune the direction and center point of your gradients with intuitive controls.' }
      ],
      example: {
        before: 'Colors: Red to Blue',
        after: 'background: linear-gradient(90deg, #ff0000 0%, #0000ff 100%);'
      },
      faqs: [
        { q: 'How to create a linear gradient?', a: 'Set your colors and adjust the angle slider to change the direction from horizontal to vertical or diagonal.' },
        { q: 'Does it support transparency?', a: 'Yes, you can use the color picker to set alpha transparency for any gradient stop.' },
        { q: 'Can I add multiple colors?', a: 'Yes, click anywhere on the gradient bar to add new color points.' },
        { q: 'Is the output CSS compatible?', a: 'Yes, it produces standard CSS3 syntax which is supported by over 99% of modern browsers.' }
      ],
      complementary: {
        id: 'css-shadow',
        name: 'CSS Shadow Generator',
        textEN: 'Adding depth? Use our',
        textVI: 'Thêm chiều sâu? Dùng'
      }
    },
    'css-shadow': {
      what: 'CSS Shadow Generator is an interactive tool for building box-shadow and text-shadow properties. Adjust blur, spread, and offsets visually to create perfect depth and elevation effects.',
      why: [
        { title: 'Real-time Preview', desc: 'See your shadow effects applied to a sample element instantly as you adjust sliders.' },
        { title: 'Multi-Layer Shadows', desc: 'Create complex, realistic "smooth" shadows by stacking multiple layers of box-shadow.' },
        { title: 'Text Shadow Support', desc: 'Dedicated mode for text-shadow properties to improve legibility and style.' },
        { title: 'Clean CSS Output', desc: 'Get perfectly formatted CSS code including appropriate RGBA values for transparency.' }
      ],
      example: {
        before: 'Blur: 10px, Offset: 5px',
        after: 'box-shadow: 5px 5px 10px 0px rgba(0,0,0,0.75);'
      },
      faqs: [
        { q: 'What is shadow spread?', a: 'Spread determines how much the shadow expands or contracts relative to the element size.' },
        { q: 'Can I make inner shadows?', a: 'Yes, toggle the "Inset" option to move the shadow inside the container.' },
        { q: 'How do I create a soft shadow?', a: 'Increase the Blur radius and lower the color opacity for a more subtle, realistic effect.' },
        { q: 'Does it work for text?', a: 'Yes, the tool has a specific mode for generating text-shadow properties.' }
      ],
      complementary: {
        id: 'css-gradient',
        name: 'CSS Gradient',
        textEN: 'Pair with vibrant colors from',
        textVI: 'Kết hợp với màu sắc từ'
      }
    },
    'color-extractor': {
      what: 'Color Extractor is a free online tool that identifies the dominant color palette from any image. Simply upload a photo to get a professional set of colors for your design project.',
      why: [
        { title: 'Smart Extraction', desc: 'Uses advanced clustering algorithms to find the most significant colors in your image.' },
        { title: 'Proportional View', desc: 'Displays extracted colors in a strip showing how frequently each color appears in the photo.' },
        { title: 'Drag & Drop', desc: 'Quickly upload images directly from your computer or phone for instant analysis.' },
        { title: 'Privacy First', desc: 'All image processing is done locally in your browser. Your photos are never uploaded to our server.' }
      ],
      example: {
        before: 'Input: Landscape Photo',
        after: '[Extracted: Sky Blue, Grass Green, Earth Brown, Leaf Yellow]'
      },
      faqs: [
        { q: 'How to extract colors from an image?', a: 'Upload or drag your image into the drop zone; the palette will be generated automatically.' },
        { q: 'Which image formats are supported?', a: 'The tool supports JPG, PNG, and WebP formats.' },
        { q: 'Is my data private?', a: 'Yes, the extraction happens entirely in your browser using JavaScript; no image data is sent to any server.' },
        { q: 'Can I copy the HEX codes?', a: 'Yes, each color in the extracted palette has a one-click copy button for its HEX value.' }
      ],
      complementary: {
        id: 'color-palette',
        name: 'Color Palette Generator',
        textEN: 'Need more variations? Try',
        textVI: 'Cần biến thể khác? Thử'
      }
    },
    'color-contrast': {
      what: 'Color Contrast Checker is an accessibility tool designed to check WCAG 2.1 compliance. Ensure your text and background colors have sufficient contrast for readability and inclusive design.',
      why: [
        { title: 'WCAG 2.1 Compliance', desc: 'Checks contrast ratios against AA and AAA standards for both normal and large text.' },
        { title: 'Real-time Preview', desc: 'Test how your text actually looks on the background while you adjust color values.' },
        { title: 'Visual Indicators', desc: 'Instantly see "Pass" or "Fail" status based on international accessibility guidelines.' },
        { title: 'Hue/Saturation Adjustment', desc: 'Easily tweak colors until they pass compliance without losing the original brand feel.' }
      ],
      example: {
        before: 'Text: #777, BG: #fff',
        after: 'Ratio: 4.5:1 (Passed AA for small text)'
      },
      faqs: [
        { q: 'What is a good contrast ratio?', a: 'WCAG AA requires 4.5:1 for normal text and 3:1 for large text. AAA requires 7:1.' },
        { q: 'Why is color contrast important?', a: 'It ensures that content is readable for everyone, including people with low vision or color blindness.' },
        { q: 'Does this tool follow WCAG 2.1?', a: 'Yes, it uses the official luminosity contrast ratio algorithm defined in WCAG 2.1.' },
        { q: 'How do I fix a failing score?', a: 'Slightly darken your text color or lighten your background until the ratio exceeds the passing threshold.' }
      ],
      complementary: {
        id: 'color-converter',
        name: 'Color Converter',
        textEN: 'Adjust your values with',
        textVI: 'Điều chỉnh mã màu với'
      }
    },
    'number-base-converter': {
      what: 'Number Base Converter is a free online tool to convert values between Binary, Octal, Decimal, and Hexadecimal. Ideal for computer science students and developers working with low-level data representation.',
      why: [
        { title: 'Simultaneous View', desc: 'See your input converted into all common bases (2, 8, 10, 16) at the same time.' },
        { title: 'Instant Calculation', desc: 'Values update in real-time as you type, providing immediate feedback for any numeric base.' },
        { title: 'Large Number Support', desc: 'Handles large integers accurately, including standard 32-bit and 64-bit address ranges.' },
        { title: 'Visual Copying', desc: 'Each base has a dedicated copy button to quickly grab the format you need for your code.' }
      ],
      example: {
        before: 'Decimal: 255',
        after: 'Hex: FF, Binary: 11111111, Octal: 377'
      },
      faqs: [
        { q: 'How to convert Decimal to Hex?', a: 'Enter your decimal number into the Decimal field, and the Hexadecimal equivalent will appear instantly.' },
        { q: 'What bases are supported?', a: 'The tool supports the most common computing bases: Binary (2), Octal (8), Decimal (10), and Hexadecimal (16).' },
        { q: 'Does it handle negative numbers?', a: 'This tool is currently optimized for non-negative integers common in data structures.' },
        { q: 'Is there a limit on number size?', a: 'It supports large safe integers within the limits of standard JavaScript engines.' }
      ],
      complementary: {
        id: 'byte-converter',
        name: 'Byte Converter',
        textEN: 'Measuring data sizes? Try',
        textVI: 'Đo lường dung lượng? Thử'
      }
    },
    'byte-converter': {
      what: 'Byte / Size Converter is a free online tool to transform digital storage units. Convert between Bytes, Kilobytes (KB), Megabytes (MB), Gigabytes (GB), and Terabytes (TB) using both Decimal and Binary standards.',
      why: [
        { title: 'Decimal & Binary Units', desc: 'Supports both standard KB (1000 bytes) and binary KiB (1024 bytes) for accurate server measurements.' },
        { title: 'Two-Way Conversion', desc: 'Convert up from small units to large ones, or break down large storage sizes into bytes.' },
        { title: 'Precise Decimals', desc: 'Adjust decimal precision to see exact sizes when working with large data transfers.' },
        { title: 'No Refresh Needed', desc: 'All calculations happen instantly in your browser as you type.' }
      ],
      example: {
        before: '1 GB',
        after: '1,024 MB (Binary) or 1,000 MB (Decimal)'
      },
      faqs: [
        { q: 'What is the difference between MB and MiB?', a: 'MB (Megabyte) usually uses base 10 (1000^2), while MiB (Mebibyte) uses base 2 (1024^2).' },
        { q: 'How many bytes are in a Megabyte?', a: 'There are exactly 1,000,000 bytes in a decimal Megabyte and 1,048,576 bytes in a binary Megabyte.' },
        { q: 'Can I convert Terabytes?', a: 'Yes, the tool supports units up to Terabytes (TB) and Tebibytes (TiB).' },
        { q: 'Is this useful for file sizes?', a: 'Absolutely, it helps you understand how different operating systems report file and disk sizes.' }
      ],
      complementary: {
        id: 'number-base-converter',
        name: 'Base Converter',
        textEN: 'Working with bits? Use',
        textVI: 'Làm việc với bit? Dùng'
      }
    },
    'unit-converter': {
      what: 'Unit Converter is a comprehensive online utility for converting measurements. Switch between Length, Weight, Temperature, Area, and Speed units with a clean, easy-to-use interface.',
      why: [
        { title: 'Multiple Categories', desc: 'A single tool for all common physical units including metric and imperial systems.' },
        { title: 'Live Results', desc: 'See the converted values for all units in a category simultaneously.' },
        { title: 'Modern Interface', desc: 'Clean, card-based layout that works perfectly on both desktop and mobile devices.' },
        { title: 'Accurate Formulas', desc: 'Uses standard scientific conversion constants for reliable and accurate results.' }
      ],
      example: {
        before: '100 Celsius',
        after: '212 Fahrenheit, 373.15 Kelvin'
      },
      faqs: [
        { q: 'How to convert meters to feet?', a: 'Select the "Length" category and enter meters; the equivalent in feet, inches, and more will show instantly.' },
        { q: 'Which units are supported?', a: 'Dozens of units across Length, Weight, Temperature, Area, Speed, and Volume.' },
        { q: 'Does it support Fahrenheit?', a: 'Yes, it provides full conversion between Celsius, Fahrenheit, and Kelvin.' },
        { q: 'Is it mobile friendly?', a: 'Yes, the design is responsive and easy to use on any smartphone or tablet.' }
      ],
      complementary: {
        id: 'aspect-ratio',
        name: 'Aspect Ratio',
        textEN: 'Converting screen sizes? Try',
        textVI: 'Chuyển đổi kích thước màn hình? Thử'
      }
    },
    'math-evaluator': {
      what: 'Math Evaluator is a professional online calculator that supports complex expressions. Use variables, trigonometric functions, and algebraic formulas with real-time evaluation.',
      why: [
        { title: 'Complex Expressions', desc: 'Evaluate advanced formulas with nested parentheses and multiple operators.' },
        { title: 'Scientific Functions', desc: 'Supports sin, cos, tan, log, sqrt, and other standard mathematical functions.' },
        { title: 'Variable Support', desc: 'Define variables like x = 10 and use them inside your equations for simplified calculation.' },
        { title: 'History Log', desc: 'Keep track of your previous calculations and results in a clean, scrollable view.' }
      ],
      example: {
        before: 'sin(45 deg) * sqrt(16)',
        after: '2.8284...'
      },
      faqs: [
        { q: 'How to use variables?', a: 'Type "x = 5" on one line, then use "x" in your formulas (e.g., "x * 2").' },
        { q: 'Does it support degrees?', a: 'Yes, you can specify units like "deg" for trigonometric functions.' },
        { q: 'Is this better than a standard calculator?', a: 'Yes, because you can see and edit the entire formula at once.' },
        { q: 'Can I use scientific constant?', a: 'Yes, standard constants like PI and E are pre-defined for easy use.' }
      ],
      complementary: {
        id: 'number-formatter',
        name: 'Number Formatter',
        textEN: 'Displaying the result? Use',
        textVI: 'Hiển thị kết quả? Dùng'
      }
    },
    'aspect-ratio': {
      what: 'Aspect Ratio Calculator is an essential tool for photographers, videographers, and web developers. Compute missing dimensions and maintain perfect proportions for 16:9, 4:3, and custom ratios.',
      why: [
        { title: 'Dimension Solver', desc: 'Enter width and height to find the ratio, or enter ratio and one dimension to find the other.' },
        { title: 'Common Presets', desc: 'Quickly select standard ratios like 16:9 (HD Video), 4:3 (SD), 1:1 (Square), or 21:9 (Ultrawide).' },
        { title: 'Live Preview', desc: 'See a visual box representing the proportions as you adjust the numbers.' },
        { title: 'Zero Data Upload', desc: 'All calculations are performed locally, ensuring your private dimension data stays safe.' }
      ],
      example: {
        before: 'Width: 1920, Height: 1080',
        after: 'Ratio: 16:9'
      },
      faqs: [
        { q: 'How to calculate a missing dimension?', a: 'Lock the ratio, enter a new width, and the height will update automatically to maintain proportion.' },
        { q: 'What is 16:9 ratio?', a: 'It is the standard widescreen format for most modern TVs, monitors, and online videos.' },
        { q: 'Can I use custom ratios?', a: 'Yes, you can input any width and height values to find a unique custom ratio.' },
        { q: 'Is this useful for CSS?', a: 'Yes, it helps you calculate the correct padding-top percentages for responsive video containers.' }
      ],
      complementary: {
        id: 'unit-converter',
        name: 'Unit Converter',
        textEN: 'Need to convert pixels? Use our',
        textVI: 'Cần chuyển đổi pixel? Hãy dùng'
      }
    },
    'number-formatter': {
      what: 'Number Formatter is a powerful online utility to format raw numbers according to international standards. Perfect for generating localized currency, percentages, and scientific notation.',
      why: [
        { title: 'Locale Aware', desc: 'Format numbers based on specific regional rules (e.g., US using dots, EU using commas).' },
        { title: 'Currency Support', desc: 'Easily add currency symbols and correct decimal places for USD, EUR, VND, and more.' },
        { title: 'Scientific Notation', desc: 'Convert extremely large or small numbers into readable scientific or compact formats.' },
        { title: 'Real-time Preview', desc: 'instantly see how your formatting choices will look to users in different parts of the world.' }
      ],
      example: {
        before: '1234567.89 (US)',
        after: '$1,234,567.89'
      },
      faqs: [
        { q: 'How to format currency?', a: 'Input your number, select the "Currency" style, and choose your target currency code (like USD).' },
        { q: 'Does it support Vietnamese formatting?', a: 'Yes, it correctly uses dot separators for thousands as per Vietnamese standards.' },
        { q: 'What is compact notation?', a: 'It turns large numbers into readable labels like "1.2M" or "5.3B" (Standard in social media).' },
        { q: 'Is there an API equivalent?', a: 'This tool is a visual implementation of the standard Intl.NumberFormat JavaScript API.' }
      ],
      complementary: {
        id: 'math-evaluator',
        name: 'Math Evaluator',
        textEN: 'Need to compute first? Try our',
        textVI: 'Cần tính toán trước? Thử'
      }
    },
    'unix-timestamp': {
      what: 'Unix Timestamp Converter is a free online tool to translate Unix/Epoch timestamps into human-readable dates and vice versa. Essential for developers debugging database records or API responses.',
      why: [
        { title: 'Bi-Directional', desc: 'Convert from a long numeric timestamp to a clear date, or convert a date string back to seconds/milliseconds.' },
        { title: 'Sub-second Support', desc: 'Handles both seconds (standard Unix) and milliseconds (JavaScript/Java) for accurate timing.' },
        { title: 'ISO 8601 Support', desc: 'Includes support for ISO 8601 strings, UTC conversion, and local timezone detection.' },
        { title: 'Instant "Now"', desc: 'Always shows the current Unix timestamp and formatted date, updating every second.' }
      ],
      example: {
        before: '1711728000',
        after: 'Friday, March 29, 2024 (UTC)'
      },
      faqs: [
        { q: 'What is a Unix timestamp?', a: 'It is the number of seconds that have elapsed since January 1, 1970 (the Unix Epoch), excluding leap seconds.' },
        { q: 'Is it in seconds or milliseconds?', a: 'This tool handles both. Typically, 10-digit numbers are seconds and 13-digit numbers are milliseconds.' },
        { q: 'How to get the current timestamp?', a: 'The tool shows the real-time "Now" timestamp automatically when you load the page.' },
        { q: 'Does it handle timezones?', a: 'Yes, it displays the results in both UTC and your local computer timezone.' }
      ],
      complementary: {
        id: 'timezone-converter',
        name: 'Timezone Converter',
        textEN: 'Dealing with world time? Try',
        textVI: 'Làm việc với giờ thế giới? Thử'
      }
    },
    'cron-parser': {
      what: 'Cron Expression Parser is a visual tool that translates complex Cron schedules into plain, readable English. Perfect for sysadmins and developers setting up background tasks and scheduled jobs.',
      why: [
        { title: 'Human Translation', desc: 'Instantly explains what each part of the cron expression (* * * * *) actually means.' },
        { title: 'Future Run Times', desc: 'Calculates and displays the next 5 to 10 scheduled execution times based on your expression.' },
        { title: 'Syntax Validation', desc: 'Safely test your cron syntax before adding it to your crontab or cloud scheduler.' },
        { title: 'Macro Support', desc: 'Handles common macros like @hourly, @daily, and @weekly for quick setup.' }
      ],
      example: {
        before: '0 0 * * 1',
        after: '"At 00:00 on Monday" (Every Monday at midnight)'
      },
      faqs: [
        { q: 'What is a cron expression?', a: 'It is a string consisting of five or six fields representing a schedule for running commands or tasks.' },
        { q: 'How to read five-field cron?', a: 'The fields are: Minute, Hour, Day of Month, Month, and Day of Week.' },
        { q: 'Does it support Quartz or Jenkins?', a: 'The tool focuses on standard Unix/Linux cron syntax, which is the baseline for most systems.' },
        { q: 'Can I see when it runs next?', a: 'Yes, the tool generates a list of upcoming execution dates so you can verify the schedule.' }
      ],
      complementary: {
        id: 'unix-timestamp',
        name: 'Unix Timestamp',
        textEN: 'Need timestamps for logs? Use',
        textVI: 'Cần mã thời gian cho log? Dùng'
      }
    },
    'timezone-converter': {
      what: 'Timezone Converter is a professional world clock utility. Easily convert meeting times between different cities and regions while accounting for Daylight Saving Time (DST) automatically.',
      why: [
        { title: 'Global City Search', desc: 'Quickly find any city or country in the world using our comprehensive IANA timezone database.' },
        { title: 'DST Aware', desc: 'Automatically calculates offset changes for regions that observe summer or daylight saving time.' },
        { title: 'Visual Comparison', desc: 'Add multiple cities to a comparison list to see the time difference in a single, clear row.' },
        { title: 'Meeting Planner', desc: 'Slide the time indicator to find "golden hours" that work for remote teams across the globe.' }
      ],
      example: {
        before: '10 AM New York',
        after: '3 PM London / 9 PM Ho Chi Minh City'
      },
      faqs: [
        { q: 'What is UTC?', a: 'Coordinated Universal Time (UTC) is the primary time standard by which the world regulates clocks and time.' },
        { q: 'Does it handle daylight saving?', a: 'Yes, our tool uses the latest timezone database to ensure DST transitions are calculated correctly.' },
        { q: 'Can I add multiple cities?', a: 'Yes, you can add and remove multiple locations to compare times across different zones.' },
        { q: 'Is it mobile friendly?', a: 'Yes, the interface is optimized for mobile so you can check world times on the go.' }
      ],
      complementary: {
        id: 'date-calculator',
        name: 'Date Calculator',
        textEN: 'Planning a duration? Try',
        textVI: 'Lên lịch khoảng thời gian? Thử'
      }
    },
    'date-calculator': {
      what: 'Date Calculator is a precise tool for finding the difference between two dates or calculating a future/past date by adding or subtracting days, weeks, or months.',
      why: [
        { title: 'Duration Discovery', desc: 'Find exactly how many days, hours, or minutes are between any two specific points in time.' },
        { title: 'Add/Subtract Mode', desc: 'Quickly find what the date will be "90 days from today" or "3 weeks ago".' },
        { title: 'Working Days Only', desc: 'Optionally exclude weekends and holidays to calculate professional deadlines and project timelines.' },
        { title: 'Universal Support', desc: 'Works with all historical and future dates, providing reliable math for planning.' }
      ],
      example: {
        before: 'Now + 45 days',
        after: 'Date: [Future Date], Total: 45 days'
      },
      faqs: [
        { q: 'How many days until a specific date?', a: 'Enter "Today" as the start date and your target as the end date to see the day count.' },
        { q: 'Can I add years?', a: 'Yes, the tool allows you to add or subtract any number of years, months, weeks, and days.' },
        { q: 'Does it calculate business days?', a: 'The tool provides a total day count; you can manually subtract weekends for business calculations.' },
        { q: 'Is it accurate for leap years?', a: 'Yes, the calculation engine fully accounts for leap years and month length variations.' }
      ],
      complementary: {
        id: 'unix-timestamp',
        name: 'Unix Timestamp',
        textEN: 'Convert results to',
        textVI: 'Chuyển kết quả sang'
      }
    },
    'string-case-converter': {
      what: 'String Case Converter is a free online tool to transform text into various programming cases. Easily switch between camelCase, snake_case, PascalCase, kebab-case, and normal text without manual formatting.',
      why: [
        { title: 'Multiple Formats', desc: 'Instantly convert any text into standard coding formats like UPPER_SNAKE_CASE or Title Case.' },
        { title: 'Bulk Processing', desc: 'Paste multiple lines or paragraphs to convert them all simultaneously in real-time.' },
        { title: 'Smart Parsing', desc: 'Automatically detects word boundaries even in unformatted or messy source text.' },
        { title: 'Developer Ready', desc: 'Perfect for naming variables, generating slugs, or standardizing database column names.' }
      ],
      example: {
        before: 'hello world string',
        after: 'helloWorldString (camelCase) / hello_world_string (snake_case)'
      },
      faqs: [
        { q: 'What is camelCase?', a: 'It is a naming convention where the first letter of each word (except the first) is capitalized, like "myVariableName".' },
        { q: 'What is kebab-case used for?', a: 'It uses hyphens to separate words (e.g., "my-url-slug") and is standard for URLs and HTML attributes.' },
        { q: 'Can it handle special characters?', a: 'Yes, special characters and punctuation are generally stripped out to create clean, programmatic identifiers.' },
        { q: 'Is this tool free?', a: 'Yes, it is completely free and processes all text instantly in your browser.' }
      ],
      complementary: {
        id: 'slug-generator',
        name: 'Slug Generator',
        textEN: 'Need URL-specific formatting? Try',
        textVI: 'Cần định dạng riêng cho URL? Thử'
      }
    },
    'text-diff': {
      what: 'Text Diff is an interactive online tool to find differences between two text blocks. Quickly compare code snippets, configuration files, or documents with side-by-side or inline highlighting.',
      why: [
        { title: 'Visual Highlighting', desc: 'Clearly highlights additions, deletions, and modifications with color-coded syntax.' },
        { title: 'Inline & Side-by-Side', desc: 'Toggle between a split view for wide screens or an inline view for quick reading.' },
        { title: 'Line-by-Line Match', desc: 'Precisely aligns related lines of text so you can instantly spot context changes.' },
        { title: 'Local Processing', desc: 'All comparison logic runs in your browser, keeping your sensitive documents private.' }
      ],
      example: {
        before: 'Original text vs Modified text',
        after: '[Highlighted specific words changed between versions]'
      },
      faqs: [
        { q: 'How does a text diff work?', a: 'It uses an algorithm to find the longest common subsequence, highlighting what was added or removed.' },
        { q: 'Can I compare code?', a: 'Yes, it works exceptionally well for finding small typo fixes or logic changes in source code.' },
        { q: 'Is my data saved anywhere?', a: 'No, the comparison is entirely client-side. Your text never leaves your computer.' },
        { q: 'Does it support large files?', a: 'It is optimized for reasonably large text blocks, though huge datasets may slow down the browser.' }
      ],
      complementary: {
        id: 'string-inspector',
        name: 'String Inspector',
        textEN: 'Analyze text details with',
        textVI: 'Phân tích chi tiết văn bản với'
      }
    },
    'lorem-ipsum': {
      what: 'Lorem Ipsum Generator is a quick tool for designers and developers to create placeholder text. Generate custom lengths of classic Latin filler text to test layouts and typography.',
      why: [
        { title: 'Custom Length', desc: 'Generate specifically by count of paragraphs, sentences, or individual words.' },
        { title: 'Classic Structure', desc: 'Uses standard pseudo-Latin phrasing that looks like realistic written text.' },
        { title: 'Instant Copy', desc: 'One-click copy function allows you to paste the placeholder directly into your designs.' },
        { title: 'HTML Tags', desc: 'Optionally wrap the generated paragraphs in standard HTML <p> tags for web development.' }
      ],
      example: {
        before: 'Type: Sentences, Count: 2',
        after: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.'
      },
      faqs: [
        { q: 'What does Lorem Ipsum mean?', a: 'It is scrambled Latin text originally from a philosophical work by Cicero, used as a universal design placeholder.' },
        { q: 'Why use placeholder text?', a: 'It allows designers to focus on visual layout and typography without being distracted by readable content.' },
        { q: 'Can I generate HTML format?', a: 'Yes, you can toggle options to include paragraph tags automatically for quicker web insertion.' },
        { q: 'Is there a limit?', a: 'You can generate thousands of words instantly, which is plenty for filling any website wireframe.' }
      ],
      complementary: {
        id: 'html-minifier',
        name: 'HTML Minifier',
        textEN: 'Ready for production? Compress with',
        textVI: 'Sẵn sàng cho production? Nén với'
      }
    },
    'string-inspector': {
      what: 'String Inspector is an analytical tool to examine text properties online. Get instant statistics like length, word count, character frequency, and byte size for any text snippet.',
      why: [
        { title: 'Deep Analysis', desc: 'Calculates length, word count, and unique character sets in real-time.' },
        { title: 'Byte Size Mapping', desc: 'Accurately determines the storage size in bytes, including UTF-8 multi-byte characters.' },
        { title: 'Frequency Graph', desc: 'Displays a breakdown of how often specific characters or symbols appear.' },
        { title: 'Whitespace Detection', desc: 'Helps identify hidden spaces or invisible characters that cause parsing errors.' }
      ],
      example: {
        before: 'Input: "Hello World 🌍"',
        after: 'Length: 13 chars, Words: 2, Size: 16 bytes'
      },
      faqs: [
        { q: 'Why does a character have multiple bytes?', a: 'Standard English letters are 1 byte in UTF-8, but emojis and non-Latin scripts can take up to 4 bytes.' },
        { q: 'Is this tool useful for SEO?', a: 'Yes, it helps verify Exact title and meta description lengths for search engine optimization.' },
        { q: 'Can it detect hidden spaces?', a: 'Yes, the strict length and byte calculations reveal trailing or zero-width spaces.' },
        { q: 'Is my text analyzed securely?', a: 'Absolutely, all statistics are calculated using local JavaScript without server requests.' }
      ],
      complementary: {
        id: 'string-escape',
        name: 'String Escape',
        textEN: 'Cleaning up text? Try',
        textVI: 'Đang dọn dẹp văn bản? Thử'
      }
    },
    'regex-tester': {
      what: 'Regex Tester is an interactive tool for writing side-by-side Regular Expressions. Build, test, and debug complex patterns for data extraction with real-time match highlighting.',
      why: [
        { title: 'Live Matching', desc: 'See your regex matches highlighted instantly inside your test text.' },
        { title: 'Cheat Sheet', desc: 'Built-in reference guide for common syntax, groups, quantifiers, and anchors.' },
        { title: 'Flag Controls', desc: 'Easily toggle global, case-insensitive, and multi-line modes.' },
        { title: 'Group Extraction', desc: 'Identify and isolate specific capture groups directly from the matches.' }
      ],
      example: {
        before: 'Pattern: \\d{3}-\\d{4}',
        after: 'Matches: [555-1234, 867-5309]'
      },
      faqs: [
        { q: 'What is a regular expression?', a: 'It is a sequence of characters that specifies a search pattern, widely used for string matching and validation.' },
        { q: 'What do the flags do?', a: '"g" returns all matches instead of stopping at the first; "i" ignores case differences.' },
        { q: 'How do capture groups work?', a: 'By wrapping a pattern in parentheses ( ), you can isolate that specific part of the matched text.' },
        { q: 'Does it support lookaheads?', a: 'Yes, it fully supports advanced standard JavaScript regex features including positive/negative lookaheads.' }
      ],
      complementary: {
        id: 'string-case-converter',
        name: 'Case Converter',
        textEN: 'Formatting matched variables? Try',
        textVI: 'Định dạng các biến đã khớp? Thử'
      }
    },
    'slug-generator': {
      what: 'Slug Generator is a free online tool to create URL-friendly strings from any text. Automatically convert blog titles or product names into clean, SEO-optimized permalinks.',
      why: [
        { title: 'SEO Optimized', desc: 'Removes special characters and spaces to create clean, indexable URL paths.' },
        { title: 'Stop Word Removal', desc: 'Optionally strip common filler words (a, an, the) to make URLs shorter and punchier.' },
        { title: 'Custom Separators', desc: 'Choose between hyphens (standard formatting) or underscores based on your framework.' },
        { title: 'Real-time Output', desc: 'Paste a list of titles and instantly generate standard slugs for web deployment.' }
      ],
      example: {
        before: 'How to Learn JavaScript in 2024!',
        after: 'how-to-learn-javascript-in-2024'
      },
      faqs: [
        { q: 'What is a URL slug?', a: 'A slug is the exact part of a URL that identifies a particular page in an easy-to-read form.' },
        { q: 'Why are hyphens better than underscores?', a: 'Google treats hyphens as word separators, which is better for SEO. Underscores join words together.' },
        { q: 'Does it handle diacritics?', a: 'Yes, it transliterates accented characters (like "é" to "e") for universal compatibility.' },
        { q: 'Can I use it for bulk titles?', a: 'Yes, pasting multiple lines will immediately produce a mapped list of clean slugs.' }
      ],
      complementary: {
        id: 'string-case-converter',
        name: 'Case Converter',
        textEN: 'Need traditional variable formats? Use',
        textVI: 'Cần định dạng biến truyền thống? Dùng'
      }
    },
    'string-escape': {
      what: 'String Escape/Unescape is a developer utility that encodes or decodes strings to make them safe for insertion into JavaScript, JSON, HTML, or URLs. It translates special characters into their standardized escape sequences.',
      why: [
        { title: 'Multi-Format Support', desc: 'Handles JavaScript/JSON (\\n, \\", \\t), HTML Entities (&amp;, &lt;), Regex combinations, and URI encoding.' },
        { title: 'Reverse Decoding', desc: 'Easily unescape confusing strings back into their original, readable formatting.' },
        { title: 'Syntax Safety', desc: 'Prevents syntax errors and XSS vulnerabilities by sanitizing data before inserting it into code.' },
        { title: 'Instant Processing', desc: 'Zero latency conversion ensures your workflow is never interrupted.' }
      ],
      example: {
        before: 'Input: <div>"Hello"</div>',
        after: 'HTML Escaped: &lt;div&gt;&quot;Hello&quot;&lt;/div&gt;'
      },
      faqs: [
        { q: 'What does escaping a string mean?', a: 'It means replacing special characters with alternative sequences so the computer interprets them as text, not as code.' },
        { q: 'Is JSON escaping different from JavaScript?', a: 'JSON is stricter; it requires double quotes and specific backslash escaping, which this tool handles automatically.' },
        { q: 'What is URI encoding?', a: 'It converts characters like spaces into %20 so they can be safely transmitted over the internet as part of a URL.' },
        { q: 'Does this prevent SQL injection?', a: 'No, this tool formats strings for frontend and data structures. Use prepared statements in your database driver for SQL safety.' }
      ],
      complementary: {
        id: 'html-to-markdown',
        name: 'HTML to Markdown',
        textEN: 'Need to convert markup instead? Try',
        textVI: 'Muốn chuyển đổi mã HTML? Thử'
      }
    },
    'html-to-markdown': {
      what: 'HTML to Markdown Converter is an instant tool that strips away bulky HTML tags and transforms the content into clean, plain-text Markdown syntax. Perfect for migrating blog posts, documentation, or README files.',
      why: [
        { title: 'Perfect Translation', desc: 'Accurately converts headers, lists, links, images, and code blocks into standard Markdown.' },
        { title: 'Code Cleanup', desc: 'Automatically strips unnecessary inline styles, classes, and scripts to leave only semantic structure.' },
        { title: 'GFM Support', desc: 'Supports GitHub Flavored Markdown, including tables and task lists.' },
        { title: 'No Installations', desc: 'Avoid using command-line tools—convert entire web pages instantly in your browser.' }
      ],
      example: {
        before: '<strong>Bold</strong> and <em>Italic</em>',
        after: '**Bold** and *Italic*'
      },
      faqs: [
        { q: 'Does it support complex tables?', a: 'Yes, standard HTML tables (<tr>, <td>) are converted into Markdown pipe (|) tables if they fit the specification.' },
        { q: 'What happens to CSS styles?', a: 'Inline CSS and <style> blocks are ignored and stripped out, as Markdown is purely for structural formatting.' },
        { q: 'Can it convert back?', a: 'You can use our Markdown Preview tool to render Markdown back into HTML.' },
        { q: 'Is it completely client-side?', a: 'Yes, the parsing engine runs entirely in your browser without uploading your content to any server.' }
      ],
      complementary: {
        id: 'markdown-table',
        name: 'Markdown Table',
        textEN: 'Need to build tables visually? Use our',
        textVI: 'Cần tạo bảng trực quan? Dùng'
      }
    },
    'text-sorter': {
      what: 'Text Sorter is an online utility to alphabetize, reverse, deduplicate, and shuffle lists of text. Clean up messy data, organize configuration files, or randomize drawing entries in seconds.',
      why: [
        { title: 'Advanced Sorting', desc: 'Sort alphabetically (A-Z, Z-A), numerically, or strictly by line length.' },
        { title: 'Deduplication', desc: 'Instantly remove duplicate lines from massive datasets with a single click.' },
        { title: 'Random Shuffle', desc: 'Perfect for randomizing lists, assigning tasks, or mixing data inputs.' },
        { title: 'Case Sensitivity', desc: 'Toggle case-sensitive sorting to organize strict programmatic lists exactly how you need.' }
      ],
      example: {
        before: 'Zebra\nApple\nApple',
        after: 'Apple\nZebra (Alphabetical + Deduplicated)'
      },
      faqs: [
        { q: 'Can it sort numbers correctly?', a: 'Yes, numeric sorting orders 2 before 10, instead of standard alphabetical where 10 comes before 2.' },
        { q: 'Does it remove blank lines?', a: 'Yes, you can check the option to automatically strip empty lines while sorting.' },
        { q: 'What is the line limit?', a: 'It can easily handle tens of thousands of lines right in your browser without lagging.' },
        { q: 'How does it remove duplicates?', a: 'It scans the list and keeps only the first exact instance of every line, preserving or sorting the final output as requested.' }
      ],
      complementary: {
        id: 'word-frequency',
        name: 'Word Frequency',
        textEN: 'Find common words with our',
        textVI: 'Tìm các từ lặp lại với'
      }
    },
    'word-frequency': {
      what: 'Word Frequency Counter is an analytical tool that scans your text to count exactly how many times each word or character appears. It calculates percentages and ranks usage from highest to lowest.',
      why: [
        { title: 'Keyword Optimization', desc: 'Perfect for SEO writers ensuring they hit target keyword densities without overstuffing.' },
        { title: 'Stop Words Filter', desc: 'Optionally exclude common words (like "the", "and", "is") to focus on meaningful vocabulary.' },
        { title: 'Character & Word Modes', desc: 'Toggle between analyzing full words or finding the frequency of specific characters/symbols.' },
        { title: 'Export Results', desc: 'Copy the ranked list directly into a spreadsheet for deeper data analysis.' }
      ],
      example: {
        before: 'apple apple banana',
        after: 'apple: 2 (66%), banana: 1 (33%)'
      },
      faqs: [
        { q: 'Is it case-sensitive?', a: 'By default, it normalizes text to lowercase so "Apple" and "apple" are counted together, though you can adjust this.' },
        { q: 'What are stop words?', a: 'Stop words are common connective words that carry little unique meaning. Excluding them gives a better picture of the content theme.' },
        { q: 'Can I use it for programming code?', a: 'Yes, it is excellent for finding out which variable names or functions are used most frequently in a script.' },
        { q: 'Is data stored safely?', a: 'All frequency analysis is done entirely within your browser for complete privacy.' }
      ],
      complementary: {
        id: 'text-stats',
        name: 'Text Statistics',
        textEN: 'Want broader metrics? Try',
        textVI: 'Cần các chỉ số tổng quan? Thử'
      }
    },
    'text-stats': {
      what: 'Text Statistics is a comprehensive dashboard that analyzes the readability and structure of your writing. It provides word counts, sentence lengths, paragraph tracking, and estimated reading times.',
      why: [
        { title: 'Reading Time Calculation', desc: 'Accurately estimates how long it will take an average person to read your article.' },
        { title: 'Readability Scoring', desc: 'Highlights complex sentences and gives insights to make your content more accessible.' },
        { title: 'Structural Counts', desc: 'Tracks everything from basic letter counts to detailed paragraph and sentence metrics.' },
        { title: 'Live Updates', desc: 'The entire dashboard updates instantly as you type, acting as a powerful writing assistant.' }
      ],
      example: {
        before: '[Pasted essay]',
        after: 'Words: 500, Sentences: 35, Read Time: 2 min'
      },
      faqs: [
        { q: 'How is reading time calculated?', a: 'It assumes an average adult reading speed of about 200 to 250 words per minute.' },
        { q: 'Does it count punctuation as characters?', a: 'Yes, it provides total character counts both with and without spaces/punctuation.' },
        { q: 'Can it help improve my writing?', a: 'By identifying long sentences and calculating averages, it encourages clearer, more concise writing.' },
        { q: 'Is it free?', a: 'Yes, the Text Statistics tool is fully free and requires no account creation.' }
      ],
      complementary: {
        id: 'string-inspector',
        name: 'String Inspector',
        textEN: 'Need technical byte counts? Use',
        textVI: 'Cần đếm byte kỹ thuật số? Sử dụng'
      }
    },
    'markdown-table': {
      what: 'Markdown Table Generator is a visual GUI that lets you design, format, and populate tables instantly before exporting them as clean Markdown syntax. Perfect for GitHub READMEs, Notion, and static site generators.',
      why: [
        { title: 'Visual Grid Editor', desc: 'Add rows, columns, and type data directly into a spreadsheet-like interface.' },
        { title: 'Alignment Controls', desc: 'Easily set Left, Center, or Right text alignment for entire columns with a single click.' },
        { title: 'Instant Output', desc: 'The Markdown code writes itself in real-time below the grid as you edit.' },
        { title: 'Import Existing', desc: 'Paste messy CSV or existing Markdown tables into the tool to format and fix them visually.' }
      ],
      example: {
        before: '[Visual Grid Entry]',
        after: '| Header | Header |\n| :--- | ---: |\n| Data | Data |'
      },
      faqs: [
        { q: 'Why is formatting Markdown tables so hard?', a: 'Standard Markdown tables require precise pipe (|) and hyphen (-) spacing, which gets misaligned easily without a visual generator.' },
        { q: 'Does it support GitHub Flavored Markdown?', a: 'Yes, the structure generated is 100% compliant with GFM and renders perfectly on GitHub and GitLab.' },
        { q: 'Can I copy it to Excel?', a: 'You can easily transfer data between Excel and this generator via copy/paste to generate the markdown.' },
        { q: 'Is it mobile friendly?', a: 'Yes, though the visual grid is best experienced on a desktop or tablet screen.' }
      ],
      complementary: {
        id: 'html-to-markdown',
        name: 'HTML to Markdown',
        textEN: 'Converting whole pages? Try',
        textVI: 'Chuyển đổi toàn bộ trang? Thử'
      }
    }
  },
  vi: {
    'json-formatter': {
      what: 'JSON Formatter là một công cụ trực tuyến giúp làm đẹp các dữ liệu JSON bị nén hoặc lộn xộn, giúp chúng trở nên dễ đọc hơn. Công cụ này còn hỗ trợ kiểm tra lỗi cú pháp JSON và tự động căn lề theo khoảng cách bạn chọn.',
      why: [
        { title: 'Dễ đọc', desc: 'Chuyển đổi các dòng JSON dài ngoằng thành cấu trúc cây phân lớp rõ ràng.' },
        { title: 'Khắc phục lỗi', desc: 'Xác định nhanh các lỗi thiếu dấu phẩy, đóng mở ngoặc sai quy tắc.' },
        { title: 'Tiện lợi', desc: 'Hỗ trợ chuyển đổi nhanh sang các định dạng khác như YAML, CSV hoặc XML.' },
        { title: 'Bảo mật', desc: 'Dữ liệu được xử lý 100% tại trình duyệt, không bị gửi lên máy chủ.' }
      ],
      example: {
        before: '{"id":1,"name":"John","active":true}',
        after: '{\n  "id": 1,\n  "name": "John",\n  "active": true\n}'
      },
      faqs: [
        { q: 'JSON Formatter có miễn phí không?', a: 'Hoàn toàn miễn phí, không cần đăng ký hay đăng nhập.' },
        { q: 'Dữ liệu của tôi có bị lộ không?', a: 'Không. Mọi dữ liệu chỉ được xử lý trong trình duyệt của bạn.' },
        { q: 'Có thể dùng cho file lớn không?', a: 'Có, thuật toán của chúng tôi được tối ưu để xử lý mượt mà cả các file JSON dung lượng lớn.' }
      ],
      complementary: {
        id: 'json-minifier',
        name: 'JSON Minifier',
        textEN: 'You can also use our',
        textVI: 'Bạn cũng có thể sử dụng'
      }
    },
    'base64-encode-decode': {
      what: 'Base64 là một sơ đồ mã hóa nhị phân thành văn bản, biểu thị dữ liệu nhị phân dưới dạng chuỗi ASCII. Nó thường được sử dụng để nhúng hình ảnh vào HTML hoặc bao gồm dữ liệu nhị phân trong JSON/XML.',
      why: [
        { title: 'Truyền tải an toàn', desc: 'Đảm bảo dữ liệu nhị phân không bị hỏng khi đi qua các hệ thống chỉ hỗ trợ văn bản.' },
        { title: 'Nhúng dữ liệu', desc: 'Nhúng các hình ảnh nhỏ (data URIs) trực tiếp vào CSS hoặc HTML.' },
        { title: 'Không cần Plugin', desc: 'Được hỗ trợ sẵn trong tất cả các trình duyệt và ngôn ngữ lập trình hiện đại.' },
        { title: 'Song ngữ', desc: 'Hỗ trợ mã hóa văn bản sang Base64 và giải mã Base64 ngược lại văn bản gốc.' }
      ],
      example: {
        before: 'Hello',
        after: 'SGVsbG8='
      },
      faqs: [
        { q: 'Base64 có phải là mã hóa (encryption) không?', a: 'Không, nó chỉ là một kiểu mã hóa (encoding), có thể giải mã dễ dàng.' },
        { q: 'Base64 có làm tăng kích thước dữ liệu không?', a: 'Có, tăng khoảng 33% so với dữ liệu gốc.' },
        { q: 'Base64 có an toàn cho URL không?', a: 'Hãy sử dụng biến thể "URL safe" (+ và / được thay thế) cho mục đích này.' }
      ],
      complementary: {
        id: 'url-encode-decode',
        name: 'URL Encoder/Decoder',
        textEN: 'Need to process URL parameters? Try our',
        textVI: 'Cần xử lý tham số URL? Hãy dùng'
      }
    },
    'uuid-generator': {
      what: 'UUID (Universally Unique Identifier) là một số 128 bit dùng để định danh duy nhất thông tin trong hệ thống máy tính. Version 4 (v4) là phiên bản phổ biến nhất, được tạo ra bằng số ngẫu nhiên.',
      why: [
        { title: 'Tính duy nhất', desc: 'Xác suất trùng lặp cực kỳ thấp (gần như là không thể).' },
        { title: 'Phi tập trung', desc: 'Tạo mã ID offline mà không cần hỏi database.' },
        { title: 'Khả năng mở rộng', desc: 'Hoàn hảo cho hệ thống phân tán và microservices.' },
        { title: 'Tiêu chuẩn quốc tế', desc: 'Tuân thủ RFC 4122, hỗ trợ trên mọi nền tảng.' }
      ],
      example: '550e8400-e29b-41d4-a716-446655440000',
      faqs: [
        { q: 'UUID có thực sự duy nhất không?', a: 'Về mặt thống kê là có. Để có 50% cơ năng xảy ra xung đột, bạn cần tạo 1 tỷ UUID/giây trong suốt 100 năm.' },
        { q: 'Sự khác biệt giữa v4 và v7?', a: 'v4 hoàn toàn ngẫu nhiên. v7 sắp xếp theo thời gian, giúp tăng tốc độ đánh index trong database.' }
      ],
      complementary: {
        id: 'password-generator',
        name: 'Mật khẩu an toàn',
        textEN: 'Need a multi-character secret instead? Try our',
        textVI: 'Cần một chuỗi bí mật nhiều ký tự? Hãy dùng'
      }
    },
    'password-generator': {
      what: 'Công cụ tạo mật khẩu an toàn là một ứng dụng giúp tạo ra các mật khẩu ngẫu nhiên, phức tạp bằng cách kết hợp chữ hoa, chữ thường, số và các biểu tượng đặc biệt.',
      why: [
        { title: 'Bảo mật tối đa', desc: 'Mật khẩu ngẫu nhiên khó bẻ khóa hơn nhiều so với mật khẩu thông thường.' },
        { title: 'Tiện lợi', desc: 'Tạo nhanh các chuỗi ký tự dài, đáp ứng mọi yêu cầu bảo mật.' },
        { title: 'Tùy chỉnh', desc: 'Chọn loại ký tự và độ dài mong muốn để phù hợp với từng nền tảng.' },
        { title: 'An toàn tuyệt đối', desc: 'Xử lý ngay trong trình duyệt. Không có mật khẩu nào được gửi lên máy chủ.' }
      ],
      example: 'kL9#mP2$vR7*qW4!',
      faqs: [
        { q: 'Độ dài mật khẩu bao nhiêu là đủ?', a: 'Khuyên dùng ít nhất 12-16 ký tự cho tài khoản thông thường.' },
        { q: 'Có nên dùng chung mật khẩu không?', a: 'Tuyệt đối không. Hãy tạo mật khẩu duy nhất cho mỗi tài khoản khác nhau.' }
      ],
      complementary: {
        id: 'uuid-generator',
        name: 'UUID Generator',
        textEN: 'Need a unique identifier for your database? Check out',
        textVI: 'Cần mã định danh duy nhất cho database? Xem ngay'
      }
    },
    'jwt-decoder': {
      what: 'JWT Decoder là công cụ giúp giải mã các thành phần của JSON Web Token (JWT), cho phép bạn kiểm tra các "claims" và metadata bên trong.',
      why: [
        { title: 'Debug dễ dàng', desc: 'Kiểm tra nhanh User ID, quyền hạn (roles) hoặc thời gian hết hạn của token.' },
        { title: 'Kiểm tra bảo mật', desc: 'Kiểm tra thuật toán mã hóa và các thuộc tính khác.' },
        { title: 'Không cần Secret', desc: 'Giải mã JWT không yêu cầu khóa bí mật, chỉ khi xác thực chữ ký mới cần.' },
        { title: 'Bảo mật tuyệt đối', desc: 'Token không bao giờ rời khỏi thiết bị của bạn.' }
      ],
      example: '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}',
      faqs: [
        { q: 'Dán JWT vào đây có an toàn không?', a: 'Dữ liệu được xử lý 100% tại trình duyệt, không có gì bị truyền ra ngoài.' },
        { q: 'Công cụ có xác thực được chữ ký không?', a: 'Để xác thực chữ ký, bạn cần nhập thêm khóa bí mật (Secret/Public Key).' }
      ],
      complementary: {
        id: 'base64-encode-decode',
        name: 'Base64 Tool',
        textEN: 'Did you know JWTs use Base64URL encoding? Learn more with our',
        textVI: 'Bạn có biết JWT dùng mã hóa Base64URL? Tìm hiểu với'
      }
    },
    'sql-formatter': {
      what: 'SQL Formatter là một công cụ trực tuyến giúp chuyển đổi các câu lệnh SQL nén hoặc lộn xộn thành định dạng có cấu trúc rõ ràng, dễ đọc.',
      why: [
        { title: 'Dễ đọc', desc: 'Hiểu nhanh các truy vấn phức tạp với nhiều tầng lồng nhau.' },
        { title: 'Debug tốt hơn', desc: 'Dễ dàng phát hiện các lỗi dấu phẩy hoặc ngoặc sai.' },
        { title: 'Tính nhất quán', desc: 'Giữ cho mã SQL luôn đẹp và đồng nhất trong toàn bộ dự án.' },
        { title: 'Bảo mật tuyệt đối', desc: 'Thông tin sơ đồ bảng dữ liệu không bao giờ bị gửi đi.' }
      ],
      example: {
        before: 'SELECT * FROM users WHERE active = 1 AND age > 18',
        after: 'SELECT\n  *\nFROM\n  users\nWHERE\n  active = 1\n  AND age > 18'
      },
      faqs: [
        { q: 'SQL Formatter có miễn phí không?', a: 'Có, công cụ này hoàn toàn miễn phí và không cần đăng ký.' },
        { q: 'Nó có hỗ trợ SQL của tôi không?', a: 'Hỗ trợ tốt cho MySQL, PostgreSQL, SQL Server và Oracle.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Formatting API results next? Try our',
        textVI: 'Định dạng kết quả API tiếp theo? Dùng ngay'
      }
    },
    'url-encode-decode': {
      what: 'Mã hóa URL (Percent-encoding) là cơ chế mã hóa thông tin trong URI. Nó chuyển đổi các ký tự không an toàn thành định dạng có thể truyền tải ổn định qua internet.',
      why: [
        { title: 'Tham số an toàn', desc: 'Đảm bảo các ký tự như dấu cách, & và ? không làm hỏng cấu trúc URL.' },
        { title: 'Hỗ trợ ký tự', desc: 'Bao gồm các ký tự không thuộc ASCII và biểu tượng đặc biệt trong địa chỉ web một cách an toàn.' },
        { title: 'Tiêu chuẩn hóa', desc: 'Tuân thủ tiêu chuẩn RFC 3986 cho khả năng tương thích web tối đa.' }
      ],
      example: {
        before: 'Hello World!',
        after: 'Hello%20World%21'
      },
      faqs: [
        { q: 'Mã hóa URL để làm gì?', a: 'Trình duyệt và máy chủ chỉ hỗ trợ một tập hợp ký tự hạn chế. Mã hóa giúp chuyển các ký tự "lạ" thành mã Hex an toàn.' },
        { q: 'Sự khác biệt giữa Encode và Decode?', a: 'Encode chuyển văn bản thành định dạng an toàn cho URL. Decode đảo ngược quá trình để lấy lại văn bản gốc.' }
      ],
      complementary: {
        id: 'base64-encode-decode',
        name: 'Base64 Encoder',
        textEN: 'For other encoding needs, check out our',
        textVI: 'Cho các nhu cầu mã hóa khác, xem ngay'
      }
    },
    'html-encode-decode': {
      what: 'Công cụ Encode/Decode HTML cho phép bạn chuyển đổi an toàn các ký tự đặc biệt thành thực thể HTML (entities) và ngược lại. Điều này cực kỳ quan trọng để ngăn chặn Cross-Site Scripting (XSS) và đảm bảo nội dung web hiển thị chính xác.',
      why: [
        { title: 'Ngăn chặn XSS', desc: 'Mã hóa an toàn các ký tự như `<`, `>`, và `&` để ngăn chúng bị thực thi dưới dạng script.' },
        { title: 'Hiển thị chính xác', desc: 'Đảm bảo các biểu tượng đặc biệt và ký tự quốc tế được hiển thị đúng như mong đợi trên trang của bạn.' },
        { title: 'Công cụ hai chiều', desc: 'Chuyển đổi linh hoạt giữa mã hóa văn bản thuần túy thành thực thể và giải mã ngược lại.' },
        { title: 'An toàn & Cục bộ', desc: 'Mọi quá trình chuyển đổi được xử lý bởi JavaScript trong trình duyệt; không có dữ liệu nào bị tải lên.' }
      ],
      example: {
        before: '<script>alert("XSS")</script>',
        after: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
      },
      faqs: [
        { q: 'Tại sao tôi nên mã hóa HTML?', a: 'Mã hóa ngăn trình duyệt diễn giải các ký tự dưới dạng thẻ HTML, điều này cần thiết cho bảo mật và hiển thị các đoạn mã.' },
        { q: 'Mã hóa HTML và Escaping khác gì nhau?', a: 'Mã hóa HTML thay thế các ký tự bằng thực thể tương ứng (ví dụ: & thành &amp;), trong khi escaping là thuật ngữ rộng hơn.' },
        { q: 'Nó có hỗ trợ thực thể HTML5 không?', a: 'Có, công cụ hỗ trợ các thực thể HTML5 tiêu chuẩn và các ký tự đặc biệt phổ biến.' },
        { q: 'Nó có miễn phí không?', a: 'Có, nó hoàn toàn miễn phí và không yêu cầu đăng ký hay cài đặt phần mềm.' }
      ],
      complementary: {
        id: 'url-encode-decode',
        name: 'URL Encoder',
        textEN: 'Need to encode URL parameters instead? Try',
        textVI: 'Cần mã hóa tham số URL? Hãy thử'
      }
    },
    'hash-generator': {
      what: 'Hash Generator là công cụ tính toán mã băm (checksum) có độ dài cố định từ đầu vào của bạn. Hỗ trợ các thuật toán phổ biến như MD5, SHA-1, SHA-256 và SHA-512.',
      why: [
        { title: 'Kiểm tra toàn vẹn', desc: 'Xác minh xem tệp hoặc văn bản có bị thay đổi hay không bằng cách so sánh giá trị băm.' },
        { title: 'Bảo mật', desc: 'Chuyển đổi dữ liệu nhạy cảm như mật khẩu thành chuỗi băm không thể đảo ngược.' },
        { title: 'Nhanh & Riêng tư', desc: 'Việc tính toán diễn ra ngay trong trình duyệt, không gửi dữ liệu đi đâu cả.' }
      ],
      example: {
        before: 'DevTools',
        after: 'f49704e6... (SHA-256)'
      },
      faqs: [
        { q: 'Tôi có thể giải mã ngược mã băm không?', a: 'Không, các hàm băm mật mã là hàm "một chiều". Bạn không thể lấy lại văn bản gốc từ giá trị băm.' },
        { q: 'MD5 có an toàn không?', a: 'MD5 hiện được coi là không còn an toàn cho mục đích bảo mật. Hãy dùng SHA-256 hoặc SHA-512 để an toàn hơn.' }
      ],
      complementary: {
        id: 'password-generator',
        name: 'Mật khẩu',
        textEN: 'Want to generate a secure string to hash? Use',
        textVI: 'Muốn tạo một chuỗi an toàn để băm? Dùng'
      }
    },
    'image-metadata-modifier': {
      what: 'Image Metadata Editor là một công cụ mạnh mẽ chạy trực tiếp tại trình duyệt, cho phép bạn xem, chỉnh sửa và xóa bỏ các siêu dữ liệu EXIF, IPTC và XMP khỏi hình ảnh định dạng JPEG và JPG. Nó giúp bạn kiểm soát hoàn toàn các thông tin riêng tư như tọa độ GPS, thời gian và thiết bị chụp.',
      why: [
        { title: 'Bảo vệ quyền riêng tư', desc: 'Xóa tọa độ GPS và thông tin cá nhân trước khi chia sẻ ảnh lên mạng xã hội.' },
        { title: 'Kiểm soát chuyên nghiệp', desc: 'Thay đổi thông số máy ảnh, dấu thời gian và thông tin tác giả.' },
        { title: 'Cái nhìn toàn diện', desc: 'Xem tất cả các thẻ siêu dữ liệu ẩn bao gồm cấu hình XMP, IPTC và ICC.' },
        { title: '100% Riêng tư', desc: 'Mọi quá trình xử lý diễn ra ngay trong trình duyệt — hình ảnh của bạn KHÔNG bao giờ bị tải lên máy chủ.' }
      ],
      example: 'Tải một bức ảnh chụp từ điện thoại để thấy chính xác thời gian và vị trí chụp. Bạn có thể đổi "Camera Model", xóa tọa độ "GPS" và tải ảnh mới về để bảo mật vị trí của mình.',
      faqs: [
        { q: 'Có hỗ trợ PNG hay WebP không?', a: 'Hiện tại, việc ghi metadata chủ yếu được tối ưu cho JPEG/JPG. Nhiều định dạng khác tự động loại bỏ metadata khi lưu để giảm dung lượng.' },
        { q: 'Chất lượng ảnh có bị giảm không?', a: 'Không. Công cụ này chỉ sửa đổi phần đầu (header) metadata. Dữ liệu điểm ảnh giữ nguyên, nên không có sự suy giảm chất lượng.' },
        { q: 'Tôi có thể thêm GPS vào ảnh chưa có không?', a: 'Có. Bạn có thể nhập thủ công tọa độ Vĩ độ và Kinh độ, chúng sẽ được ghi vào EXIF mới của ảnh khi tải về.' }
      ],
      complementary: {
        id: 'base64-encode-decode',
        name: 'Base64 Image',
        textEN: 'Want to convert your image to a Data URI? Try',
        textVI: 'Muốn chuyển ảnh sang Data URI? Hãy thử'
      }
    },
    'json-minifier': {
      what: 'JSON Minifier là công cụ giúp loại bỏ các khoảng trắng, dòng mới và thụt lề không cần thiết trong dữ liệu JSON. Điều này giúp giảm đáng kể kích thước file, lý tưởng cho việc truyền tải dữ liệu hiệu suất cao và tối ưu hóa website.',
      why: [
        { title: 'Giảm kích thước', desc: 'Nén gói dữ liệu JSON lên đến 20-30% bằng cách bỏ các ký tự dư thừa.' },
        { title: 'Tăng tốc độ', desc: 'Tải nhanh hơn và tiêu thụ ít băng thông hơn cho website của bạn.' },
        { title: 'Bảo mật', desc: 'Xử lý tại máy của bạn, tuyệt đối không có dữ liệu nào bị tải lên Server.' }
      ],
      faqs: [
        { q: 'Tại sao nên nén JSON?', a: 'Việc nén JSON làm giảm đáng kể lượng dữ liệu cần truyền tải, đặc biệt quan trọng đối với người dùng di động.' },
        { q: 'Dữ liệu sau khi nén có hợp lệ không?', a: 'Có. Nén chỉ bỏ các khoảng trắng không có ý nghĩa mà các trình phân tích JSON thường bỏ qua.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Need to make this readable again? Use our',
        textVI: 'Cần làm dữ liệu dễ đọc lại? Hãy dùng'
      }
    },
    'json-diff': {
      what: 'Công cụ JSON Diff là một tiện ích trực tuyến miễn phí mạnh mẽ cho phép bạn so sánh hai đối tượng JSON và làm nổi bật ngay lập tức các khác biệt về cấu trúc và giá trị của chúng. Đây là công cụ cần thiết cho các nhà phát triển để so sánh các phản hồi API, bản cập nhật cấu hình hoặc bản ghi cơ sở dữ liệu.',
      why: [
        { title: 'Chế độ xem trực quan', desc: 'Xác định chính xác những gì đã được thêm, xóa hoặc sửa đổi với phần làm nổi bật theo mã màu rõ ràng.' },
        { title: 'Tự động sắp xếp khóa', desc: 'Tự động sắp xếp các khóa JSON theo thứ tự bảng chữ cái trước khi so sánh để có kết quả chính xác bất kể thứ tự khóa.' },
        { title: 'So sánh sâu', desc: 'Tự động phát hiện các thay đổi lồng nhau sâu bên trong các cấu trúc JSON phức tạp.' },
        { title: '100% Bảo mật', desc: 'Tất cả logic so sánh chạy cục bộ trong trình duyệt của bạn — dữ liệu JSON nhạy cảm của bạn không bao giờ rời khỏi máy.' }
      ],
      example: {
        before: '{"name": "App", "v": 1}',
        after: '{"name": "App", "v": 2}'
      },
      faqs: [
        { q: 'Làm cách nào để so sánh hai tệp JSON trực tuyến?', a: 'Dán JSON đầu tiên của bạn vào ô bên trái và JSON thứ hai vào ô bên phải. Công cụ sẽ ngay lập tức tạo ra một bản so sánh trực quan.' },
        { q: 'Nó có xử lý thứ tự khóa khác nhau không?', a: 'Có. Công cụ của chúng tôi có thể tự động chuẩn hóa thứ tự khóa để đảm bảo bạn chỉ thấy những thay đổi về giá trị hoặc cấu trúc thực sự.' },
        { q: 'Dữ liệu của tôi có an toàn không?', a: 'Có. Mọi quy trình xử lý diễn ra 100% tại trình duyệt bằng JavaScript. Dữ liệu của bạn không bao giờ được tải lên máy chủ.' },
        { q: 'Nó phát hiện những loại khác biệt nào?', a: 'Nó xác định các khóa được thêm, khóa bị xóa, giá trị bị thay đổi và thay đổi kiểu dữ liệu trong các cấu trúc lồng nhau.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Format your JSON before comparing? Try our',
        textVI: 'Định dạng JSON trước khi so sánh? Hãy thử'
      }
    },
    'yaml-json': {
      what: 'Bộ chuyển đổi YAML sang JSON (và ngược lại) là một công cụ trực tuyến miễn phí linh hoạt cho phép bạn chuyển đổi ngay lập tức giữa hai định dạng dữ liệu phổ biến này. Công cụ này đơn giản hóa việc quản lý cấu hình cho các nhà phát triển làm việc với Kubernetes, Docker hoặc các ứng dụng web hiện đại.',
      why: [
        { title: 'Chuyển đổi hai chiều', desc: 'Chuyển đổi mượt mà YAML sang JSON hoặc ngược lại chỉ trong vài giây.' },
        { title: 'Kiểm tra cú pháp', desc: 'Tự động kiểm tra các lỗi thụt lề trong YAML hoặc thiếu ngoặc trong JSON.' },
        { title: 'Làm đẹp dữ liệu', desc: 'Tạo đầu ra sạch sẽ, có thụt lề ở cả hai định dạng để dễ đọc hơn.' },
        { title: '100% Bảo mật', desc: 'Mọi quy trình xử lý diễn ra trong trình duyệt của bạn; tập tin cấu hình không bao giờ bị tải lên máy chủ.' }
      ],
      example: {
        before: 'name: App\nversion: 1.0',
        after: '{\n  "name": "App",\n  "version": "1.0"\n}'
      },
      faqs: [
        { q: 'Làm cách nào để chuyển đổi YAML sang JSON trực tuyến?', a: 'Chỉ cần dán YAML của bạn vào ô nhập liệu. Công cụ sẽ ngay lập tức phát hiện định dạng và hiển thị kết quả JSON.' },
        { q: 'YAML có tốt hơn JSON không?', a: 'YAML thường dễ đọc hơn và hỗ trợ ghi chú (comments), lý tưởng cho các tệp cấu hình. JSON là tiêu chuẩn cho trao đổi dữ liệu API.' },
        { q: 'Công cụ có kiểm tra lỗi cú pháp không?', a: 'Có. Nếu YAML hoặc JSON của bạn bị lỗi, công cụ sẽ đánh dấu vị trí lỗi để giúp bạn sửa chữa.' },
        { q: 'Dữ liệu cấu hình của tôi có an toàn không?', a: 'Có. Chúng tôi sử dụng quy trình xử lý 100% tại trình duyệt, vì vậy các chuỗi cấu hình nhạy cảm của bạn luôn nằm trong trình duyệt của bạn.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Clean up your JSON output? Try our',
        textVI: 'Làm sạch đầu ra JSON? Hãy thử'
      }
    },
    'json-to-typescript': {
      what: 'Bộ chuyển đổi JSON sang TypeScript là một công cụ trực tuyến miễn phí thiết yếu giúp tự động tạo các interface và type TypeScript từ dữ liệu JSON hợp lệ. Điều này giúp các nhà phát triển tiết kiệm thời gian khi xây dựng ứng dụng và đảm bảo cấu trúc dữ liệu khớp với phản hồi API.',
      why: [
        { title: 'Tạo Type tự động', desc: 'Nhanh chóng tạo các interface TypeScript chất lượng cao, bao gồm cả các đối tượng và mảng lồng nhau.' },
        { title: 'An toàn kiểu dữ liệu', desc: 'Đảm bảo mã nguồn ứng dụng của bạn an toàn về kiểu dữ liệu bằng cách mô hình hóa chính xác JSON.' },
        { title: 'Mã nguồn sạch sẽ', desc: 'Tạo mã nguồn sẵn sàng cho dự án mà bạn có thể sao chép trực tiếp vào tệp nguồn mà không cần chỉnh sửa.' },
        { title: '100% Bảo mật', desc: 'Quy trình chuyển đổi được thực hiện hoàn toàn trong trình duyệt của bạn; dữ liệu không bao giờ bị gửi đi.' }
      ],
      example: {
        before: '{"id": 1, "name": "Admin"}',
        after: 'interface RootObject {\n  id: number;\n  name: string;\n}'
      },
      faqs: [
        { q: 'Làm cách nào để tạo TypeScript từ JSON?', a: 'Dán mẫu JSON của bạn vào trình biên tập. Công cụ sẽ phân tích cấu trúc và tạo interface để bạn sao chép vào dự án.' },
        { q: 'Nó có xử lý các đối tượng lồng nhau không?', a: 'Có. Nó đệ quy xác định các đối tượng con và tạo các định nghĩa interface lồng nhau với tên duy nhất.' },
        { q: 'Có hỗ trợ TypeScript 5 không?', a: 'Có, mã nguồn tạo ra tuân theo các tiêu chuẩn TypeScript hiện đại và tương thích với mọi phiên bản hiện tại.' },
        { q: 'Có giới hạn kích thước dữ liệu không?', a: 'Không có giới hạn cứng, tuy nhiên các đối tượng JSON cực lớn có thể mất một chút thời gian xử lý tùy vào cấu hình máy.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Need to format your JSON first? Try',
        textVI: 'Cần định dạng JSON trước? Thử'
      }
    },
    'jsonpath-tester': {
      what: 'Công cụ kiểm tra JSONPath là một tiện ích trực tuyến miễn phí mạnh mẽ cho phép bạn kiểm tra và gỡ lỗi các biểu thức JSONPath với tài liệu JSON của mình trong thời gian thực. Đây là lựa chọn hoàn hảo cho các nhà phát triển làm việc với việc truy vấn, lọc và trích xuất dữ liệu JSON.',
      why: [
        { title: 'Kiểm tra tương tác', desc: 'Xem kết quả truy vấn JSONPath cập nhật ngay lập tức khi bạn nhập biểu thức.' },
        { title: 'Phản hồi trực quan', desc: 'Làm nổi bật các phần JSON khớp với đường dẫn của bạn để gỡ lỗi và kiểm tra dữ liệu dễ dàng hơn.' },
        { title: 'Hỗ trợ truy vấn nâng cao', desc: 'Hỗ trợ đầy đủ đặc tả JSONPath bao gồm script, cắt mảng (slicing) và lọc logic.' },
        { title: 'An toàn & Riêng tư', desc: 'Mọi thao tác tìm kiếm và lọc diễn ra cục bộ trong trình duyệt — dữ liệu JSON của bạn không bao giờ rời khỏi máy tính.' }
      ],
      example: {
        before: '{"items": [1, 2, 3]}\nQuery: $.items[*]',
        after: '[1, 2, 3]'
      },
      faqs: [
        { q: 'JSONPath được dùng để làm gì?', a: 'JSONPath là một ngôn ngữ truy vấn cho JSON, tương tự như XPath cho XML. Nó cho phép bạn chọn, trích xuất và lọc các phần cụ thể của cây JSON.' },
        { q: 'Làm thế nào để kiểm tra biểu thức JSONPath?', a: 'Dán JSON của bạn vào công cụ và nhập JSONPath (ví dụ: $.store.book[*].author). Công cụ sẽ hiển thị kết quả khớp ngay lập tức.' },
        { q: 'Công cụ có hỗ trợ lọc logic không?', a: 'Có, nó hỗ trợ các tính năng nâng cao như toán tử lọc [?(...)] và truy cập đệ quy.' },
        { q: 'Dữ liệu của tôi có được tải lên không?', a: 'Tuyệt đối không. Mọi quy trình xử lý được thực hiện qua JavaScript tại trình duyệt. Dữ liệu JSON của bạn không bao giờ được gửi đến máy chủ.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Wanna see the full JSON more clearly? Use our',
        textVI: 'Muốn xem JSON rõ ràng hơn? Hãy dùng'
      }
    },
    'json-to-csv': {
      what: 'Bộ chuyển đổi JSON sang CSV là một công cụ trực tuyến miễn phí mạnh mẽ cho phép bạn chuyển đổi dữ liệu JSON phức tạp thành định dạng CSV có cấu trúc, sẵn sàng cho bảng tính ngay lập tức. Công cụ này giúp các nhà phát triển và phân tích dữ liệu trích xuất dữ liệu bảng từ các cấu trúc lồng nhau mà không cần lập trình.',
      why: [
        { title: 'Phẳng hóa dữ liệu', desc: 'Tự động phân tích các đối tượng JSON phân cấp và chuyển đổi chúng thành các cột CSV có nhãn sạch sẽ.' },
        { title: 'Tương thích Excel', desc: 'Tạo đầu ra CSV tiêu chuẩn có thể được nhập ngay vào Excel, Google Sheets hoặc bất kỳ cơ sở dữ liệu nào.' },
        { title: 'Nhanh & Bảo mật', desc: 'Chuyển đổi ngay cả các tập dữ liệu lớn với quy trình xử lý 100% tại trình duyệt — dữ liệu không bao giờ rời khỏi máy của bạn.' },
        { title: 'Không cần đăng ký', desc: 'Một công cụ hoàn toàn miễn phí, không giới hạn, không cần đăng ký và không cần cài đặt phần mềm.' }
      ],
      example: {
        before: '[{"id": 1, "user": "John"}, {"id": 2, "user": "Sara"}]',
        after: 'id,user\n1,John\n2,Sara'
      },
      faqs: [
        { q: 'Làm cách nào để chuyển đổi JSON sang CSV trực tuyến?', a: 'Chỉ cần dán mảng hoặc đối tượng JSON của bạn vào ô nhập liệu. Công cụ sẽ tự động phát hiện cấu trúc và tạo kết quả CSV để bạn tải về.' },
        { q: 'Công cụ có hỗ trợ các đối tượng JSON lồng nhau không?', a: 'Có, bộ chuyển đổi của chúng tôi được thiết kế để làm phẳng các đối tượng lồng nhau thành định dạng bảng phù hợp cho việc phân tích.' },
        { q: 'Có giới hạn về lượng dữ liệu không?', a: 'Vì quy trình xử lý diễn ra trong trình duyệt của bạn, giới hạn phụ thuộc vào bộ nhớ thiết bị. Thông thường, công cụ có thể xử lý hàng nghìn dòng một cách dễ dàng.' },
        { q: 'Dữ liệu JSON của tôi có được bảo mật không?', a: 'Có. Chúng tôi sử dụng JavaScript để xử lý dữ liệu cục bộ. Thông tin nhạy cảm của bạn không bao giờ được tải lên bất kỳ máy chủ nào.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Clean up your JSON before converting? Try our',
        textVI: 'Làm sạch JSON trước khi chuyển đổi? Hãy thử'
      }
    },
    'json-schema-validator': {
      what: 'Trình xác thực JSON Schema là một công cụ trực tuyến miễn phí giúp kiểm tra xem dữ liệu JSON của bạn có tuân thủ một JSON Schema nhất định hay không (Draft 4 đến 2020-12). Nó cung cấp báo cáo lỗi chi tiết giúp bạn gỡ lỗi cấu trúc dữ liệu.',
      why: [
        { title: 'Hỗ trợ nhiều Draft', desc: 'Xác thực dựa trên nhiều tiêu chuẩn JSON Schema từ Draft 4 đến 2020-12 mới nhất.' },
        { title: 'Bản đồ lỗi chi tiết', desc: 'Xem chính xác vị trí lỗi với số dòng và thông báo lỗi dựa trên đường dẫn JSON.' },
        { title: 'Xác thực thời gian thực', desc: 'Nhận phản hồi ngay lập tức khi bạn chỉnh sửa dữ liệu JSON hoặc schema trực tiếp.' },
        { title: '100% Bảo mật', desc: 'Mọi logic xác thực chạy trong trình duyệt của bạn; dữ liệu không bao giờ bị gửi lên máy chủ.' }
      ],
      example: {
        before: 'JSON: {"id": "1"}\nSchema: {"type": "number"}',
        after: 'Error: should be number at path .id'
      },
      faqs: [
        { q: 'Làm thế nào để xác thực JSON so với schema?', a: 'Dán JSON và Schema của bạn vào các ô tương ứng. Công cụ sẽ tự động kiểm tra các ràng buộc như kiểu dữ liệu và trường bắt buộc.' },
        { q: 'Những phiên bản nào được hỗ trợ?', a: 'Chúng tôi hỗ trợ các tiêu chuẩn Draft 4, Draft 6, Draft 7, Draft 2019-09 và Draft 2020-12.' },
        { q: 'Nó có xử lý được schema lớn không?', a: 'Có, trình xác thực được tối ưu hóa để xử lý các schema phức tạp với nhiều tham chiếu ($ref) và cấu trúc lồng nhau.' },
        { q: 'Dữ liệu của tôi có an toàn không?', a: 'Có. Việc xác thực diễn ra cục bộ trong trình duyệt qua JavaScript. Không có dữ liệu nào được lưu trữ hoặc truyền đi.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Fix your JSON syntax first? Use our',
        textVI: 'Sửa lỗi cú pháp JSON trước? Hãy dùng'
      }
    },
    'json-to-code': {
      what: 'JSON to Code là một công cụ trực tuyến miễn phí giúp chuyển đổi các đối tượng JSON thành các định nghĩa class hoặc struct cho các ngôn ngữ lập trình phổ biến. Nó giúp các nhà phát triển khởi động dự án nhanh hơn bằng cách tự động hóa tạo model.',
      why: [
        { title: 'Hỗ trợ đa ngôn ngữ', desc: 'Tạo các định nghĩa sạch sẽ, có kiểu dữ liệu cho Python, PHP, Go, Ruby và Java.' },
        { title: 'Suy luận kiểu thông minh', desc: 'Tự động phát hiện kiểu dữ liệu để tạo model chính xác bao gồm cả các đối tượng lồng nhau.' },
        { title: 'Tạo khung mã sạch', desc: 'Nhận các khối mã sẵn sàng để sao chép trực tiếp vào dự án backend hoặc frontend của bạn.' },
        { title: '100% Tại trình duyệt', desc: 'Dữ liệu JSON của bạn được xử lý cục bộ, đảm bảo tính riêng tư tuyệt đối cho cấu trúc dữ liệu.' }
      ],
      example: {
        before: '{"user": {"id": 1, "name": "Dev"}}',
        after: 'class RootObject:\n    def __init__(self, user):\n        self.user = User(user)'
      },
      faqs: [
        { q: 'Những ngôn ngữ nào được hỗ trợ?', a: 'Hiện tại, bạn có thể tạo class và struct cho Python, PHP, Java, Go và Ruby.' },
        { q: 'Nó có hỗ trợ JSON lồng nhau không?', a: 'Có, trình tạo mã sẽ đệ quy tạo các class hoặc kiểu lồng nhau cho dữ liệu phân cấp phức tạp.' },
        { q: 'Tôi có thể tùy chỉnh tên class không?', a: 'Công cụ sử dụng tên mặc định, bạn có thể dễ dàng đổi tên trong IDE sau khi sao chép mã.' },
        { q: 'Công cụ này có an toàn không?', a: 'Tuyệt đối. Logic chuyển đổi chạy hoàn toàn trong trình duyệt của bạn qua JavaScript.' }
      ],
      complementary: {
        id: 'json-to-typescript',
        name: 'JSON to TypeScript',
        textEN: 'Working with TypeScript? Use our specialized',
        textVI: 'Làm việc với TypeScript? Hãy dùng bản'
      }
    },
    'hex-encode-decode': {
      what: 'Công cụ Encode/Decode Hex là một tiện ích trực tuyến miễn phí giúp chuyển đổi văn bản thuần túy thành chuỗi thập lục phân (hex) và giải mã hex ngược lại. Đây là công cụ cơ bản cho các nhà phát triển làm việc với dữ liệu nhị phân hoặc gỡ lỗi.',
      why: [
        { title: 'Chuyển đổi hai chiều', desc: 'Dễ dàng chuyển đổi linh hoạt giữa văn bản thuần túy và biểu diễn byte hex ngay lập tức.' },
        { title: 'Định dạng tùy chỉnh', desc: 'Hỗ trợ nhiều định dạng hex bao gồm phân tách bằng dấu cách hoặc chuỗi liên tục.' },
        { title: 'Hỗ trợ gỡ lỗi', desc: 'Lý tưởng để kiểm tra các ký tự không in được hoặc phân tích cấu trúc dữ liệu cấp thấp.' },
        { title: 'Quyền riêng tư tuyệt đối', desc: 'Dữ liệu được xử lý hoàn toàn trên máy của bạn; chúng tôi không bao giờ xem hoặc lưu trữ chuỗi của bạn.' }
      ],
      example: {
        before: 'Hello',
        after: '48 65 6c 6c 6f'
      },
      faqs: [
        { q: 'Mã hóa hex là gì?', a: 'Mã hóa hex biểu diễn mỗi byte dữ liệu dưới dạng hai chữ số cơ số 16, cung cấp cách dễ đọc để xem dữ liệu nhị phân.' },
        { q: 'Làm thế nào để giải mã chuỗi hex?', a: 'Dán chuỗi hex của bạn. Đảm bảo loại bỏ bất kỳ ký tự phi hex nào nếu cần, và công cụ sẽ hiển thị văn bản gốc.' },
        { q: 'Nó có hỗ trợ UTF-8 không?', a: 'Có, công cụ mã hóa chính xác các ký tự UTF-8 đa byte thành các chuỗi hex tương ứng.' },
        { q: 'Có giới hạn kích thước không?', a: 'Không có giới hạn cứng, tuy nhiên hiệu suất trình duyệt có thể thay đổi với các khối văn bản cực lớn.' }
      ],
      complementary: {
        id: 'binary-encode-decode',
        name: 'Binary Tool',
        textEN: 'Need to see the bits instead? Try our',
        textVI: 'Cần xem các bit nhị phân? Thử ngay'
      }
    },
    'binary-encode-decode': {
      what: 'Công cụ Encode/Decode nhị phân chuyển đổi bất kỳ văn bản nào thành chuỗi các bit (0 và 1) và ngược lại. Đây là một công cụ tuyệt vời để hiểu cách dữ liệu được biểu diễn ở cấp độ thấp nhất.',
      why: [
        { title: 'Luồng bit trực quan', desc: 'Xem chính xác cách mỗi ký tự được biểu diễn dưới dạng byte 8-bit để có cái nhìn sâu sắc hơn.' },
        { title: 'Độ đọc cao', desc: 'Tự động thêm khoảng trắng giữa các byte để giúp các chuỗi nhị phân dài dễ đọc hơn.' },
        { title: 'Xử lý nhanh', desc: 'Chuyển đổi ngay lập tức các khối văn bản lớn sang nhị phân hoặc giải mã ngược lại.' },
        { title: '100% Bảo mật', desc: 'Mọi logic được thực hiện cục bộ trong môi trường trình duyệt của bạn; không có dữ liệu nào bị gửi đi.' }
      ],
      example: {
        before: 'A',
        after: '01000001'
      },
      faqs: [
        { q: 'Có bao nhiêu bit cho mỗi ký tự?', a: 'Văn bản tiêu chuẩn được mã hóa bằng 8 bit (một byte) cho mỗi ký tự bằng UTF-8 hoặc ASCII.' },
        { q: 'Làm thế nào để chuyển nhị phân sang văn bản?', a: 'Dán chuỗi 0 và 1 của bạn. Việc phân tách bằng dấu cách được hỗ trợ và giúp tăng độ chính xác.' },
        { q: 'Mã hóa nhị phân có an toàn không?', a: 'Không, nó không phải là mã hóa (encryption). Nó chỉ là một cách biểu diễn dữ liệu khác dễ dàng bị đảo ngược.' },
        { q: 'Nó có hoạt động trên di động không?', a: 'Có, công cụ phản hồi tốt và hoạt động hoàn hảo trên mọi điện thoại thông minh và máy tính bảng hiện đại.' }
      ],
      complementary: {
        id: 'hex-encode-decode',
        name: 'Hex Converter',
        textEN: 'Wanna see the Hex representation? Try',
        textVI: 'Muốn xem biểu diễn Hex? Thử ngay'
      }
    },
    'bcrypt': {
      what: 'Trình tạo và xác minh mã băm BCrypt là một công cụ trực tuyến miễn phí chuyên dụng để các nhà phát triển thử nghiệm tính bảo mật của việc băm mật khẩu. Nó sử dụng thuật toán BCrypt để bảo vệ chống lại các cuộc tấn công brute-force.',
      why: [
        { title: 'Chi phí có thể điều chỉnh', desc: 'Thử nghiệm các vòng muối (cost factor) khác nhau để cân bằng giữa bảo mật và hiệu suất phù hợp cho môi trường của bạn.' },
        { title: 'Xác minh trực tiếp', desc: 'Kiểm tra nhanh chóng xem mật khẩu văn bản thuần túy có khớp với mã băm BCrypt hiện có hay không ngay lập tức.' },
        { title: 'Tuân thủ tiêu chuẩn', desc: 'Hỗ trợ các định dạng BCrypt tiêu chuẩn bắt đầu bằng $2a$, $2b$, hoặc $2y$ để có khả năng tương thích rộng rãi.' },
        { title: '100% Tại trình duyệt', desc: 'Mật khẩu và mã băm của bạn không bao giờ bị gửi lên máy chủ; mọi quá trình mã hóa chạy trong trình duyệt.' }
      ],
      example: {
        before: 'Mật khẩu: "admin", Rounds: 10',
        after: '$2b$10$...(hash)'
      },
      faqs: [
        { q: 'Cost factor của BCrypt là gì?', a: 'Nó quyết định số vòng băm được thực hiện. Chi phí cao hơn làm cho kẻ tấn công mất nhiều thời gian hơn để đoán mật khẩu.' },
        { q: 'BCrypt có tốt hơn SHA-256 cho mật khẩu không?', a: 'Có, vì BCrypt cố tình chạy chậm và bao gồm muối tích hợp, giúp nó chống lại các cuộc tấn công rainbow table.' },
        { q: 'Tôi có thể đảo ngược mã băm BCrypt không?', a: 'Không. BCrypt là hàm một chiều. Bạn chỉ có thể xác minh bằng cách băm lại mật khẩu và so sánh kết quả.' },
        { q: 'Công cụ này có an toàn không?', a: 'Có, việc băm được thực hiện cục bộ qua CPU của trình duyệt. Không có dữ liệu nào được truyền đi.' }
      ],
      complementary: {
        id: 'password-generator',
        name: 'Tạo mật khẩu',
        textEN: 'Need a strong password to hash? Try our',
        textVI: 'Cần mật khẩu mạnh để băm? Hãy thử'
      }
    },
    'jwt-encoder': {
      what: 'JWT Encoder là một công cụ trực tuyến miễn phí cho phép bạn tạo và ký JSON Web Tokens bằng khóa bí mật. Đây là một tiện ích thiết yếu cho các nhà phát triển xây dựng hệ thống xác thực.',
      why: [
        { title: 'Ký HMAC', desc: 'Hỗ trợ các thuật toán ký dựa trên hmac HS256, HS384 và HS512 một cách nhanh chóng.' },
        { title: 'Payload tùy chỉnh', desc: 'Dễ dàng thiết lập các thông tin người dùng, thời gian hết hạn (exp) và metadata tùy chỉnh trong trình soạn thảo JSON.' },
        { title: 'Phản hồi tức thì', desc: 'Xem token đã mã hóa cập nhật theo thời gian thực khi bạn sửa đổi header hoặc dữ liệu payload.' },
        { title: '100% Bảo mật', desc: 'Khóa bí mật và dữ liệu của bạn luôn ở trong trình duyệt. Chúng tôi không bao giờ truyền tải hay lưu trữ chúng.' }
      ],
      example: {
        before: '{"sub": "123", "name": "Dev"}',
        after: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      },
      faqs: [
        { q: 'Làm thế nào để tạo JWT trực tuyến?', a: 'Nhập Header và Payload dưới dạng JSON, nhập khóa bí mật của bạn và công cụ sẽ ngay lập tức ký token.' },
        { q: 'Tôi nên sử dụng thuật toán nào?', a: 'HS256 (HMAC với SHA-256) là thuật ngữ phổ biến và được hỗ trợ rộng rãi nhất để ký đối xứng.' },
        { q: 'Nó có hỗ trợ RSA/ECDSA không?', a: 'Hiện tại, công cụ này được tối ưu hóa cho ký đối xứng HMAC, loại phổ biến nhất để thử nghiệm nhanh.' },
        { q: 'Dùng khóa bí mật ở đây có an toàn không?', a: 'Có, công cụ của chúng tôi chạy hoàn toàn ở phía client. Khóa không bao giờ rời khỏi máy tính của bạn.' }
      ],
      complementary: {
        id: 'jwt-decoder',
        name: 'JWT Decoder',
        textEN: 'Need to inspect an existing token? Use our',
        textVI: 'Cần kiểm tra token hiện có? Hãy dùng'
      }
    },
    'aes-encrypt': {
      what: 'Công cụ Mã hóa/Giải mã AES là một tiện ích trực tuyến miễn phí sử dụng Tiêu chuẩn Mã hóa Nâng cao (AES) để bảo mật dữ liệu văn bản của bạn. Nó chạy mã hóa AES-256-GCM trực tiếp trong trình duyệt.',
      why: [
        { title: 'AES-256-GCM', desc: 'Sử dụng một trong những tiêu chuẩn mã hóa đối xứng an toàn nhất hiện nay để đảm bảo tính bảo mật.' },
        { title: 'Mã hóa trong trình duyệt', desc: 'Mọi logic mã hóa và giải mã được thực thi cục bộ trên thiết bị của bạn mà không cần gọi máy chủ.' },
        { title: 'Đầu vào linh hoạt', desc: 'Hỗ trợ văn bản thuần túy để mã hóa và các định dạng phổ biến như Hex hoặc Base64 để giải mã.' },
        { title: 'Không lưu trữ', desc: 'Chúng tôi không bao giờ lưu trữ khóa hoặc dữ liệu của bạn. Khi đóng tab, mọi thông tin nhạy cảm sẽ bị xóa sạch.' }
      ],
      example: {
        before: 'Tin nhắn bí mật',
        after: 'Đã mã hóa: 4f... (Hex)'
      },
      faqs: [
        { q: 'AES-256 là gì?', a: 'Đây là phiên bản khóa 256-bit của Tiêu chuẩn Mã hóa Nâng cao, được coi là không thể phá vỡ bằng brute force.' },
        { q: 'Tại sao nên dùng AES-256-GCM?', a: 'GCM cung cấp cả tính bảo mật và tính toàn vẹn dữ liệu (xác thực) trong một lần xử lý duy nhất.' },
        { q: 'Tôi có thể dùng mật khẩu làm khóa không?', a: 'Có, công cụ có thể tính toán một khóa mã hóa mạnh từ mật khẩu của bạn bằng các kỹ thuật dẫn xuất tiêu chuẩn.' },
        { q: 'Sử dụng trực tuyến có an toàn không?', a: 'Có, vì mọi thứ diễn ra cục bộ. Khóa và văn bản của bạn không bao giờ được gửi qua mạng.' }
      ],
      complementary: {
        id: 'base64-encode-decode',
        name: 'Base64 Tool',
        textEN: 'Need to encode binary results? Try our',
        textVI: 'Cần mã hóa kết quả nhị phân? Hãy thử'
      }
    },
    'totp-generator': {
      what: 'Công cụ Tạo TOTP / 2FA cho phép bạn tạo mật khẩu dùng một lần theo thời gian (RFC 6238) từ khóa bí mật. Nó hoàn hảo để các nhà phát triển thử nghiệm triển khai MFA.',
      why: [
        { title: 'Tuân thủ RFC 6238', desc: 'Tạo mã 6 chữ số hoặc 8 chữ số tiêu chuẩn khớp hoàn hảo với các ứng dụng xác thực lớn.' },
        { title: 'Đồng bộ thời gian thực', desc: 'Xem đếm ngược mã và tự động làm mới dựa trên đồng hồ hệ thống của bạn một cách chính xác.' },
        { title: 'Thông tin gỡ lỗi', desc: 'Xem các chi tiết trạng thái nội bộ để giúp khắc phục sự cố lệch thời gian trong các dịch vụ của riêng bạn.' },
        { title: '100% Cục bộ', desc: 'Các mật bí 2FA của bạn được xử lý hoàn toàn trong trình duyệt; chúng không bao giờ bị tải lên máy chủ.' }
      ],
      example: {
        before: 'Secret: JBSWY3DPEHPK3PXP',
        after: 'OTP: 123456'
      },
      faqs: [
        { q: 'TOTP secret là gì?', a: 'Nó là một chuỗi mã hóa Base32 được chia sẻ giữa máy chủ và ứng dụng của bạn để tạo ra các mã khớp nhau.' },
        { q: 'Làm thế nào để thử nghiệm MFA?', a: 'Dán khóa bí mật vào công cụ này và so sánh mã được tạo ra với đầu ra hiện tại trên ứng dụng của bạn.' },
        { q: 'Tại sao mã của tôi không hoạt động?', a: 'Đảm bảo đồng hồ hệ thống của bạn chính xác. Ngay cả một vài giây sai lệch cũng có thể dẫn đến token không hợp lệ.' },
        { q: 'Nó có an toàn không?', a: 'Có, việc tạo mã được xử lý bởi JavaScript phía client. Không có khóa bí mật nào được lưu trữ hoặc truyền đi.' }
      ],
      complementary: {
        id: 'password-generator',
        name: 'Chuỗi ngẫu nhiên',
        textEN: 'Need to generate a new secret? Try our',
        textVI: 'Cần tạo một khóa bí mật mới? Thử ngay'
      }
    },
    'password-strength': {
      what: 'Trình kiểm tra độ mạnh mật khẩu là một công cụ trực tuyến được thiết kế để giúp bạn phân tích mức độ bảo mật của mật khẩu. Nó sử dụng các tính toán entropy nâng cao để ước tính thời gian bẻ khóa.',
      why: [
        { title: 'Phân tích Entropy', desc: 'Đo lường mức độ ngẫu nhiên của mật khẩu để tính toán độ mạnh toán học thực sự của nó.' },
        { title: 'Dự đoán thời gian bẻ khóa', desc: 'Cung cấp ước tính trực quan về thời gian một cuộc tấn công brute-force hoặc dictionary sẽ mất bao lâu hiện nay.' },
        { title: 'Gợi ý cải thiện', desc: 'Nhận phản hồi ngay lập tức về cách làm cho mật khẩu của bạn mạnh hơn (biểu tượng, độ dài, v.v.).' },
        { title: '100% Bảo mật', desc: 'Mật khẩu của bạn không bao giờ bị gửi lên máy chủ. Mọi phân tích diễn ra cục bộ trên máy tính của bạn.' }
      ],
      example: {
        before: 'qwerty',
        after: 'Độ mạnh: Rất yếu (Bẻ khóa tức thì)'
      },
      faqs: [
        { q: 'Mật khẩu thế nào là mạnh?', a: 'Mật khẩu mạnh nên dài ít nhất 12-16 ký tự và kết hợp nhiều loại ký tự khác nhau.' },
        { q: 'Entropy là gì?', a: 'Entropy là thước đo tính ngẫu nhiên; entropy cao hơn nghĩa là mật khẩu khó bị các công cụ AI đoán ra hơn nhiều.' },
        { q: 'Tôi có nên dùng các từ thông dụng không?', a: 'Không. Các cuộc tấn công dictionary có thể đoán các từ thông dụng gần như tức thì, ngay cả khi thay chữ bằng số.' },
        { q: 'Công cụ có lưu dữ liệu không?', a: 'Không. Mọi kiểm tra bảo mật được thực hiện trong bộ nhớ và bị hủy khi bạn đóng tab trình duyệt.' }
      ],
      complementary: {
        id: 'password-generator',
        name: 'Tạo mật khẩu',
        textEN: 'Need to create a stronger one? Use our',
        textVI: 'Cần tạo mật khẩu mạnh hơn? Hãy dùng'
      }
    },
    'cert-decoder': {
      what: 'Certificate Decoder là một công cụ trực tuyến miễn phí giúp phân tích tệp chứng chỉ X.509 PEM sang định dạng dễ đọc. Nó trích xuất các kỹ thuật từ chứng chỉ SSL/TLS.',
      why: [
        { title: 'Phân tích PEM chi tiết', desc: 'Giải mã các chứng chỉ SSL/TLS tiêu chuẩn để giúp bạn xác minh ngày hết hạn và thông tin tên miền.' },
        { title: 'Kiểm tra trực quan', desc: 'Xem tên chủ thể, SAN (Subject Alternative Names), số sê-ri và dấu vân tay một cách rõ ràng.' },
        { title: 'Logic 100% cục bộ', desc: 'Việc phân tích được xử lý bởi JavaScript tiêu chuẩn trong trình duyệt; chứng chỉ không bao giờ bị tải lên.' },
        { title: 'Nhanh & Đơn giản', desc: 'Giải mã ngay lập tức nhiều chứng chỉ mà không cần dùng các công cụ dòng lệnh như OpenSSL.' }
      ],
      example: {
        before: '-----BEGIN CERTIFICATE----- ...',
        after: 'Subject: CN=example.com, Issuer: Let\'s Encrypt'
      },
      faqs: [
        { q: 'Làm thế nào để giải mã PEM cert?', a: 'Dán toàn bộ khối PEM (bao gồm cả các thẻ BEGIN/END) vào công cụ để xem tất cả các thuộc tính của nó.' },
        { q: 'Tôi có thể kiểm tra ngày hết hạn không?', a: 'Có, công cụ hiển thị rõ ràng ngày có hiệu lực và ngày hết hạn của bất kỳ chứng chỉ nào.' },
        { q: 'Dữ liệu nào được giải mã?', a: 'Công cụ trích xuất Subject, Issuer, Validity, Serial Number, Thuật toán ký và tất cả các Extension chính.' },
        { q: 'Chứng chỉ của tôi có an toàn không?', a: 'Có. Việc phân tích diễn ra cục bộ. Không có dữ liệu chứng chỉ nào được truyền đến máy chủ của chúng tôi.' }
      ],
      complementary: {
        id: 'jwt-decoder',
        name: 'JWT Decoder',
        textEN: 'Also working with JSON Web Tokens? Try',
        textVI: 'Cũng đang làm việc với JWT? Hãy thử'
      }
    },
    'json-to-csharp': {
      what: 'JSON to C# Classes là một công cụ trực tuyến miễn phí giúp chuyển đổi các đối tượng JSON thành định nghĩa class C# ngay lập tức. Nó hỗ trợ các đối tượng lồng nhau, mảng và tạo ra các thuộc tính với kiểu dữ liệu và attribute chính xác.',
      why: [
        { title: 'Ánh xạ thuộc tính thông minh', desc: 'Tự động phát hiện kiểu dữ liệu và tạo các thuộc tính C# tương ứng với các attribute cần thiết.' },
        { title: 'Hỗ trợ Attribute', desc: 'Tùy chọn bao gồm các attribute Newtonsoft.Json hoặc System.Text.Json để serialization liền mạch.' },
        { title: 'Tạo Class lồng nhau', desc: 'Tự động tạo các class lồng nhau cho các cấu trúc JSON phân cấp phức tạp.' },
        { title: '100% Tại trình duyệt', desc: 'Dữ liệu JSON của bạn được xử lý hoàn toàn trong trình duyệt; không có dữ liệu nào bị gửi lên máy chủ.' }
      ],
      example: {
        before: '{"id": 1, "user": {"name": "Dev"}}',
        after: 'public class Root\n{\n    public int id { get; set; }\n    public User user { get; set; }\n}'
      },
      faqs: [
        { q: 'Những phiên bản C# nào được hỗ trợ?', a: 'Công cụ tạo ra các class C# tiêu chuẩn tương thích với .NET Framework, .NET Core và .NET 5+.' },
        { q: 'Tôi có thể xử lý các giá trị null không?', a: 'Có, công cụ có thể tạo ra các kiểu dữ liệu nullable nếu phát hiện thấy giá trị null trong mẫu JSON của bạn.' },
        { q: 'Nó có miễn phí không?', a: 'Có, nó hoàn toàn miễn phí và không yêu cầu đăng ký hay cài đặt.' },
        { q: 'Nó có hỗ trợ mảng không?', a: 'Có, nó nhận diện chính xác các mảng JSON và ánh xạ chúng thành List<T> hoặc T[] trong C#.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Validate your JSON first with our',
        textVI: 'Kiểm tra cú pháp JSON trước với'
      }
    },
    'nuget-checker': {
      what: 'NuGet Package Checker là một công cụ trực tuyến miễn phí giúp bạn tìm kiếm và kiểm tra bất kỳ gói nào từ registry NuGet chính thức. Nó cung cấp lịch sử phiên bản, xu hướng tải xuống và các đoạn mã cài đặt sẵn sàng sử dụng.',
      why: [
        { title: 'Thông tin chi tiết', desc: 'Truy cập metadata toàn diện bao gồm các dependency, framework được hỗ trợ và thông tin bản quyền.' },
        { title: 'Thống kê tải xuống', desc: 'Xem xu hướng tải xuống toàn cầu để đánh giá mức độ phổ biến và sự tin cậy của cộng đồng.' },
        { title: 'Snippets sẵn dùng', desc: 'Nhanh chóng lấy các lệnh PackageReference hoặc .NET CLI cho tệp dự án của bạn.' },
        { title: 'Luôn cập nhật', desc: 'Truy xuất dữ liệu thời gian thực trực tiếp từ các máy chủ API NuGet v3 chính thức.' }
      ],
      example: {
        before: 'Tìm kiếm: Newtonsoft.Json',
        after: 'Hiển thị v13.0.3, 4.2 tỷ lượt tải'
      },
      faqs: [
        { q: 'Bạn lấy dữ liệu từ đâu?', a: 'Tất cả thông tin gói được truy xuất theo thời gian thực từ registry NuGet v3 chính thức (api.nuget.org).' },
        { q: 'Tôi có thể xem các phiên bản cũ không?', a: 'Có, công cụ hiển thị danh sách đầy đủ các phiên bản trước đó và ngày phát hành của chúng.' },
        { q: 'Đây có phải là công cụ chính thức không?', a: 'Đây là một tiện ích của bên thứ ba tương tác với các API công khai chính thức của NuGet.' },
        { q: 'Nó có hiển thị các dependency không?', a: 'Có, nó liệt kê tất cả các gói phụ thuộc và ràng buộc phiên bản của chúng cho mỗi target framework.' }
      ],
      complementary: {
        id: 'npm-checker',
        name: 'npm Checker',
        textEN: 'Working with Node.js too? Try our',
        textVI: 'Đang làm việc với Node.js? Thử ngay'
      }
    },
    'connection-string-builder': {
      what: 'Connection String Builder là một công cụ trực tuyến miễn phí giúp các nhà phát triển xây dựng các chuỗi kết nối cơ sở dữ liệu hợp lệ. Nó loại bỏ các lỗi cú pháp và cung cấp hướng dẫn về các tham số bảo mật.',
      why: [
        { title: 'Nhiều nhà cung cấp', desc: 'Xây dựng chuỗi cho SQL Server, MySQL, PostgreSQL, SQLite, Oracle và MongoDB.' },
        { title: 'Biểu mẫu tương tác', desc: 'Điền thông tin máy chủ của bạn và công cụ sẽ xử lý cú pháp phân tách bằng dấu chấm phẩy phức tạp.' },
        { title: 'Bảo mật tốt nhất', desc: 'Bao gồm các tùy chọn cho bảo mật tích hợp, SSL/TLS và các thiết lập connection pooling.' },
        { title: 'Xem trước trực tiếp', desc: 'Xem chuỗi kết nối của bạn cập nhật theo thời gian thực khi bạn thay đổi các tùy chọn hoặc nhập giá trị.' }
      ],
      example: {
        before: 'Server: db.local, User: sa',
        after: 'Server=db.local;Database=master;User Id=sa;...'
      },
      faqs: [
        { q: 'Những cơ sở dữ liệu nào được hỗ trợ?', a: 'Chúng tôi hỗ trợ tất cả các cơ sở dữ liệu lớn bao gồm SQL Server, MySQL, Postgres, Oracle và SQLite.' },
        { q: 'Integrated Security là gì?', a: 'Nó sử dụng thông tin đăng nhập Windows của bạn để xác thực thay vì username và password riêng biệt.' },
        { q: 'Nhập mật khẩu ở đây có an toàn không?', a: 'Công cụ chạy cục bộ; chúng tôi không lưu nhật ký chi tiết máy chủ của bạn. Tuy nhiên, hãy luôn thận trọng với các khóa sản xuất nhạy cảm.' },
        { q: 'Nó có hỗ trợ Entity Framework không?', a: 'Có, bạn có thể sử dụng các chuỗi được tạo trong các tệp cấu hình EF Core hoặc EF6 của mình.' }
      ],
      complementary: {
        id: 'erd-diagram',
        name: 'ERD Diagram',
        textEN: 'Need to visualize your database? Use our',
        textVI: 'Cần xem lược đồ cơ sở dữ liệu? Dùng bản'
      }
    },
    'csharp-string-escape': {
      what: 'C# String Escape là một công cụ trực tuyến miễn phí giúp bạn escape các ký tự đặc biệt trong văn bản để sử dụng trong chuỗi C#. Nó hỗ trợ các định dạng chuỗi bình thường, verbatim (@) và interpolated ($).',
      why: [
        { title: 'Định dạng cụ thể', desc: 'Escape chính xác dấu ngoặc kép cho chuỗi verbatim và dấu ngoặc nhọn cho chuỗi interpolated.' },
        { title: 'Logic hai chiều', desc: 'Dễ dàng escape văn bản thuần cho mã nguồn hoặc unescape các chuỗi C# trở lại văn bản dễ đọc.' },
        { title: 'Tiết kiệm thời gian', desc: 'Tránh việc escape thủ công tẻ nhạt cho các đường dẫn dài, payload JSON hoặc các truy vấn SQL nhiều dòng.' },
        { title: '100% Tại trình duyệt', desc: 'Quá trình xử lý văn bản diễn ra hoàn toàn trong trình duyệt; chuỗi của bạn không bao giờ bị tải lên.' }
      ],
      example: {
        before: 'C:\Windows\System32',
        after: '"C:\\\\Windows\\\\System32"'
      },
      faqs: [
        { q: 'Chuỗi verbatim là gì?', a: 'Trong C#, chuỗi verbatim bắt đầu bằng @ và bỏ qua các ký tự escape tiêu chuẩn như \n, lý tưởng cho đường dẫn tệp.' },
        { q: 'Làm thế nào để escape dấu ngoặc kép?', a: 'Trong chuỗi bình thường, dùng \". Trong chuỗi verbatim, hãy nhân đôi dấu ngoặc như "".' },
        { q: 'Nó có hỗ trợ nhiều dòng không?', a: 'Có, các chuỗi nhiều dòng (raw string literals) được hỗ trợ cho các phiên bản C# hiện đại.' },
        { q: 'Văn bản của tôi có an toàn không?', a: 'Có. Mọi thao tác được xử lý cục bộ bởi JavaScript. Chúng tôi không lưu trữ hoặc truyền tải chuỗi của bạn.' }
      ],
      complementary: {
        id: 'json-to-csharp',
        name: 'JSON to C#',
        textEN: 'Pasting JSON as a string? Convert it with',
        textVI: 'Đán JSON vào chuỗi? Hãy chuyển nó với'
      }
    },
    'sql-to-linq': {
      what: 'Trình chuyển đổi SQL sang LINQ là một tiện ích trực tuyến miễn phí giúp bạn dịch các truy vấn SQL SELECT sang cú pháp LINQ method của C#. Nó hoàn hảo cho các nhà phát triển chuyển logic từ database sang ORM như EF Core.',
      why: [
        { title: 'Cú pháp LINQ Method', desc: 'Tạo ra các lời gọi hàm LINQ sạch sẽ, dễ đọc (Select, Where, Join) từ các mệnh đề SQL tiêu chuẩn.' },
        { title: 'Sẵn sàng cho EF Core', desc: 'Đầu ra được tối ưu hóa để sử dụng với EF Core hoặc LINQ to Objects trong các dự án C# của bạn.' },
        { title: 'Hỗ trợ truy vấn phức tạp', desc: 'Xử lý các bản dịch JOIN, GROUP BY, HAVING và ORDER BY một cách tự động.' },
        { title: 'Hỗ trợ giáo dục', desc: 'Rất tốt để học cách các khái niệm SQL ánh xạ sang các mẫu lập trình chức năng trong .NET.' }
      ],
      example: {
        before: 'SELECT * FROM Users WHERE Age > 20',
        after: 'db.Users.Where(u => u.Age > 20)'
      },
      faqs: [
        { q: 'Nó có hỗ trợ Query Syntax không?', a: 'Hiện tại nó tập trung vào Method Syntax, phong cách phổ biến nhất cho phát triển C# hiện đại.' },
        { q: 'Các alias SQL có được hỗ trợ không?', a: 'Có, các alias bảng và cột được ánh xạ thành tên tham số lambda trong đầu ra LINQ.' },
        { q: 'Nó có xử lý được subquery không?', a: 'Các subquery đơn giản được hỗ trợ; các SQL lồng nhau cực kỳ phức tạp có thể cần tách thành nhiều lời gọi LINQ.' },
        { q: 'Nó có miễn phí không?', a: 'Có, đây là một công cụ trực tuyến miễn phí và không cần đăng ký.' }
      ],
      complementary: {
        id: 'sql-formatter',
        name: 'SQL Formatter',
        textEN: 'Make your SQL query readable first with',
        textVI: 'Làm SQL của bạn dễ đọc hơn trước với'
      }
    },
    'erd-diagram': {
      what: 'ERD Diagram from SQL là một công cụ trực tuyến miễn phí giúp tạo sơ đồ thực thể mối quan hệ (ERD) ngay lập tức từ các câu lệnh CREATE TABLE. Nó giúp bạn hiểu và tài liệu hóa cấu trúc DB trong vài giây.',
      why: [
        { title: 'Ánh xạ lược đồ trực quan', desc: 'Tự động phân tích các tập lệnh SQL và vẽ các bảng với các cột, kiểu dữ liệu và khóa chính của chúng.' },
        { title: 'Phát hiện mối quan hệ', desc: 'Phát hiện và vẽ các liên kết giữa các bảng dựa trên các ràng buộc Khóa ngoại (Foreign Key) trong SQL của bạn.' },
        { title: 'Bố cục tương tác', desc: 'Kéo và sắp xếp các bảng để tạo ra cái nhìn tổng quan kiến trúc hoàn hảo cho cơ sở dữ liệu của bạn.' },
        { title: '100% Tại trình duyệt', desc: 'Các thiết kế lược đồ của bạn luôn riêng tư; mọi quá trình phân tích và hiển thị diễn ra cục bộ trên máy tính của bạn.' }
      ],
      example: {
        before: 'CREATE TABLE Users (id INT PRIMARY KEY, name TEXT);',
        after: '[Sơ đồ bảng trực quan được tạo ra]'
      },
      faqs: [
        { q: 'Làm thế nào để tạo ERD từ SQL?', a: 'Dán các lệnh SQL DDL (Data Definition Language) vào trình soạn thảo và sơ đồ sẽ xuất hiện ngay lập tức.' },
        { q: 'Những dialect SQL nào được hỗ trợ?', a: 'Nó hỗ trợ SQL tiêu chuẩn, T-SQL (SQL Server), PostgreSQL và các định dạng lệnh CREATE của MySQL.' },
        { q: 'Tôi có thể xuất sơ đồ không?', a: 'Có, bạn có thể sắp xếp các bảng và sử dụng tính năng xuất/in của trình duyệt để lưu thiết kế.' },
        { q: 'Có giới hạn số lượng bảng không?', a: 'Để có hiệu suất tốt nhất, các sơ đồ có tối đa 50-100 bảng hoạt động mượt mà trên các máy tính hiện đại.' }
      ],
      complementary: {
        id: 'sql-syntax',
        name: 'SQL Reference',
        textEN: 'Need to write the CREATE SQL? Check our',
        textVI: 'Cần viết lệnh CREATE SQL? Xem bản'
      }
    },
    'sql-plan-viewer': {
      what: 'SQL Execution Plan Viewer là một công cụ phân tích hiệu suất trực tuyến miễn phí dành cho các nhà phát triển DB. Nó phân tích đầu ra EXPLAIN từ PostgreSQL hoặc MySQL và chuyển đổi thành cây trực quan.',
      why: [
        { title: 'Xác định các nút chậm', desc: 'Làm nổi bật trực quan các thao tác có chi phí thực thi cao hoặc số hàng quá lớn.' },
        { title: 'Giải thích chi tiết', desc: 'Cung cấp các giải thích rõ ràng cho Sequential Scans, Index Scans và thuật toán Join.' },
        { title: 'Phát hiện điểm nghẽn', desc: 'Dễ dàng nhận ra các chỉ mục bị thiếu hoặc chiến lược join kém đang làm chậm ứng dụng của bạn.' },
        { title: 'Tập trung vào quyền riêng tư', desc: 'Cấu trúc DB và kế hoạch thực thi của bạn không bao giờ rời khỏi trình duyệt để đảm bảo bảo mật tối đa.' }
      ],
      example: {
        before: '[ { "Plan": { "Node Type": "Seq Scan", ... } } ]',
        after: '[Hình ảnh cây trực quan với các cảnh báo điểm nghẽn]'
      },
      faqs: [
        { q: 'Làm thế nào để lấy plan cho Postgres?', a: 'Chạy `EXPLAIN (ANALYZE, FORMAT JSON) query_cua_ban;` và dán kết quả JSON vào công cụ.' },
        { q: 'Làm thế nào để lấy plan cho MySQL?', a: 'Chạy `EXPLAIN FORMAT=JSON query_cua_ban;` và dán đầu ra vào đây để xem dạng cây.' },
        { q: 'Sequential Scan là gì?', a: 'Nghĩa là database đang đọc toàn bộ bảng từ đĩa vì không tìm thấy index phù hợp nào.' },
        { q: 'Nó có an toàn cho dữ liệu công ty không?', a: 'Có, mọi quá trình phân tích là cục bộ. Không có chi tiết truy vấn hay thông tin lược đồ nào được gửi đi.' }
      ],
      complementary: {
        id: 'sql-to-linq',
        name: 'SQL to LINQ',
        textEN: 'Optimize your query then convert it with',
        textVI: 'Tối ưu truy vấn rồi chuyển đổi với'
      }
    },
    'sql-syntax': {
      what: 'SQL Syntax Reference là một hướng dẫn toàn diện và bảng tra cứu miễn phí trực tuyến cho các nhà phát triển DB. Nó cung cấp các ví dụ rõ ràng cho DDL, DML và các hàm cửa sổ nâng cao.',
      why: [
        { title: 'Ví dụ sẵn dùng', desc: 'Duyệt hàng trăm đoạn mã SQL đã được kiểm thử cho JOIN, CTE và các truy vấn đệ quy.' },
        { title: 'Hỗ trợ đa Dialect', desc: 'Bao gồm các ghi chú cú pháp cụ thể cho T-SQL (SQL Server), PostgreSQL và MySQL.' },
        { title: 'Khái niệm nâng cao', desc: 'Tài liệu chi tiết cho các hàm cửa sổ, partition và các biểu thức điều kiện phức tạp.' },
        { title: 'Tìm kiếm nhanh', desc: 'Tìm chính xác mệnh đề hoặc hàm bạn cần ngay lập tức với chỉ mục tài liệu được tối ưu hóa.' }
      ],
      example: {
        before: 'Dùng OVER clause như thế nào?',
        after: 'SELECT name, SUM(val) OVER(PARTITION BY group) FROM stats;'
      },
      faqs: [
        { q: 'Nó có bao gồm các hàm cửa sổ không?', a: 'Có, chúng tôi có các ví dụ chi tiết cho ROW_NUMBER, RANK, DENSE_RANK và các hàm aggregate window.' },
        { q: 'Nó có được cập nhật cho SQL hiện đại không?', a: 'Có, nó bao gồm cú pháp hiện đại như CTE (Common Table Expressions) và các hàm JSON.' },
        { q: 'Tôi có thể dùng mã ví dụ cho production không?', a: 'Hoàn toàn có thể, các ví dụ được thiết kế để tuân thủ tiêu chuẩn và sẵn sàng cho môi trường thực tế.' },
        { q: 'Nó có miễn phí không?', a: 'Có, đây là một tài nguyên công cộng miễn phí cho cộng đồng nhà phát triển.' }
      ],
      complementary: {
        id: 'sql-formatter',
        name: 'SQL Formatter',
        textEN: 'Need to prettify your SQL code? Use our',
        textVI: 'Cần làm đẹp mã SQL của bạn? Hãy dùng'
      }
    },
    'ai-token-counter': {
      what: 'AI Token Counter là một công cụ trực tuyến miễn phí chuyên dụng giúp bạn tính toán số lượng token mà văn bản sẽ tiêu tốn trong các mô hình LLM như GPT-4, Claude và Gemini.',
      why: [
        { title: 'Quản lý ngữ cảnh', desc: 'Đảm bảo các prompt của bạn khớp với cửa sổ token tối đa của mô hình để tránh bị cắt bớt.' },
        { title: 'Ước tính chi phí', desc: 'Tính toán chi phí API dự kiến dựa trên số lượng token đầu vào cho mô hình cụ thể của bạn.' },
        { title: 'Hỗ trợ đa mô hình', desc: 'Ước tính chính xác cho các mô hình OpenAI (GPT), Anthropic (Claude) và Google (Gemini).' },
        { title: '100% Tại trình duyệt', desc: 'Nội dung prompt của bạn luôn ở trong trình duyệt; chúng tôi không bao giờ xem hay lưu trữ văn bản của bạn.' }
      ],
      example: {
        before: 'Xin chào, hôm nay bạn thế nào?',
        after: 'Tokens: 12 (khoảng 36 ký tự)'
      },
      faqs: [
        { q: 'Token là gì?', a: 'Token là các đơn vị cơ bản của văn bản mà LLM xử lý. Một token xấp xỉ 4 ký tự hoặc 0,75 từ trong tiếng Anh.' },
        { q: 'Số lượng đếm có chính xác 100% không?', a: 'Công cụ cung cấp ước tính có độ tin cậy cao dựa trên các tokenizer BPE tiêu chuẩn được sử dụng bởi các nhà cung cấp AI lớn.' },
        { q: 'Tại sao số lượng token lại quan trọng?', a: 'Các nhà cung cấp AI tính phí dựa trên token và các mô hình có giới hạn về lượng văn bản chúng có thể "nhớ" cùng lúc.' },
        { q: 'Nó có hoạt động với mã nguồn không?', a: 'Có, tokenizer xử lý chính xác các khối mã, thụt đầu dòng và các biểu tượng đặc biệt được dùng trong lập trình.' }
      ],
      complementary: {
        id: 'ai-prompt-builder',
        name: 'Prompt Builder',
        textEN: 'Counted your tokens? Now build a',
        textVI: 'Đã đếm xong token? Giờ hãy tạo'
      }
    },
    'ai-cost-calculator': {
      what: 'AI API Cost Calculator là một công cụ trực tuyến miễn phí giúp các nhà phát triển ước tính chi tiêu cho các Mô hình Ngôn ngữ Lớn. Nó cung cấp giá cập nhật cho GPT-4o, Claude 3.5 và nhiều hơn nữa.',
      why: [
        { title: 'Giá cả hiện tại', desc: 'Sử dụng dữ liệu giá mới nhất từ LiteLLM và các nhà cung cấp mô hình để đưa ra ước tính chính xác nhất.' },
        { title: 'Tách biệt Input/Output', desc: 'Tính toán chi phí riêng biệt cho prompt và completion, khớp với cách các API thực tế tính phí.' },
        { title: 'Công cụ so sánh', desc: 'Dễ dàng so sánh sự khác biệt về giá giữa việc sử dụng các mô hình cao cấp so với các lựa chọn tiết kiệm.' },
        { title: 'Toán học tức thì', desc: 'Không cần bảng tính thủ công; chỉ cần nhập khối lượng dự kiến và nhận tổng số USD ngay lập tức.' }
      ],
      example: {
        before: '1 triệu token trên GPT-4o',
        after: '$5.00 Input / $15.00 Output (xấp xỉ)'
      },
      faqs: [
        { q: 'Giá cả được cập nhật bao lâu một lần?', a: 'Chúng tôi thường xuyên đồng bộ dữ liệu giá để phản ánh các đợt giảm giá mô hình và thay đổi gói mới nhất.' },
        { q: 'Nó có hỗ trợ giá theo đợt không?', a: 'Trình tính toán ước tính dựa trên các mức giá pay-as-you-go tiêu chuẩn cho việc sử dụng API chính.' },
        { q: 'Những mô hình nào được bao gồm?', a: 'Tất cả các mô hình lớn từ OpenAI, Anthropic, Google và Meta đều được hỗ trợ.' },
        { q: 'Nó có miễn phí không?', a: 'Có, đây là một tiện ích miễn phí cho các nhà phát triển và kỹ sư AI.' }
      ],
      complementary: {
        id: 'ai-model-comparison',
        name: 'Model Comparison',
        textEN: 'Checking costs? Compare model skills with',
        textVI: 'Đang kiểm tra phí? So sánh kỹ năng với'
      }
    },
    'ai-prompt-builder': {
      what: 'AI Prompt Builder là một công cụ trực tuyến miễn phí giúp bạn xây dựng các prompt có cấu trúc cho LLM. Nó cho phép bạn dễ dàng quản lý các vai trò System, User và Assistant.',
      why: [
        { title: 'Cấu trúc theo vai trò', desc: 'Sắp xếp đầu vào của bạn thành các khối tin nhắn rõ ràng mà LLM mong đợi để tuân thủ chỉ dẫn tối ưu.' },
        { title: 'Tương thích OpenAI', desc: 'Xuất prompt của bạn trực tiếp dưới dạng mảng JSON được định dạng cho endpoint /chat/completions.' },
        { title: 'Tổ chức ngữ cảnh', desc: 'Giữ các hướng dẫn hệ thống tách biệt với dữ liệu người dùng để ngăn chặn prompt injection và cải thiện độ chính xác.' },
        { title: 'Xem trước trực quan', desc: 'Xem prompt cuối cùng của bạn trông như thế nào đối với AI trước khi tích hợp vào mã ứng dụng.' }
      ],
      example: {
        before: 'System: Bạn là chuyên gia. User: Xin chào.',
        after: '[{"role": "system", "content": "..."}, {"role": "user", "content": "Xin chào"}]'
      },
      faqs: [
        { q: 'Prompt System là gì?', a: 'Nó là bộ hướng dẫn cấp cao cho AI biết cách hành xử, tông giọng cần sử dụng và các quy tắc cần tuân theo.' },
        { q: 'Tại sao nên dùng cấu trúc JSON?', a: 'Hầu hết các API chuyên nghiệp sử dụng một mảng các tin nhắn để duy trì lịch sử hội thoại và làm rõ các lượt nói.' },
        { q: 'Tôi có thể xuất ra văn bản thuần túy không?', a: 'Có, bạn có thể sao chép toàn bộ prompt có cấu trúc dưới dạng một khối văn bản đơn giản.' },
        { q: 'Nó có an toàn không?', a: 'Có, chúng tôi không lưu trữ nội dung prompt của bạn. Mọi thứ chạy trong phiên làm việc hiện tại của trình duyệt.' }
      ],
      complementary: {
        id: 'ai-token-counter',
        name: 'Token Counter',
        textEN: 'Built your prompt? Check the size with',
        textVI: 'Đã tạo prompt xong? Kiểm tra độ dài với'
      }
    },
    'ai-model-comparison': {
      what: 'AI Model Comparison là một công cụ tra cứu trực tuyến cung cấp cái nhìn song song về các khả năng, cửa sổ ngữ cảnh và giá cả của các LLM hàng đầu.',
      why: [
        { title: 'Thống kê ngữ cảnh', desc: 'Nhanh chóng tìm thấy mô hình nào có thể xử lý các tài liệu lớn hoặc lịch sử hội thoại dài.' },
        { title: 'Điểm chuẩn chi phí', desc: 'So sánh chi phí trên một triệu token để tối ưu hóa kiến trúc ứng dụng của bạn về mặt kinh phí.' },
        { title: 'Chi tiết tính năng', desc: 'Xem mô hình nào hỗ trợ thị giác máy tính, gọi hàm (tool calling) hoặc có khả năng suy luận cao hơn.' },
        { title: 'Thông tin khách quan', desc: 'Nhận dữ liệu khách quan về hiệu suất mô hình từ tất cả các nhà cung cấp lớn trong một giao diện sạch sẽ.' }
      ],
      example: {
        before: 'Cái nào rẻ hơn: GPT-4o hay Claude 3.5?',
        after: '[Bảng so sánh chi tiết giá cả và giới hạn token]'
      },
      faqs: [
        { q: 'Tôi nên chọn mô hình nào?', a: 'Nó phụ thuộc vào sự cân bằng giữa chất lượng suy luận, tốc độ và chi phí của bạn. Hãy sử dụng bảng của chúng tôi để tìm điểm cân bằng.' },
        { q: 'Cửa sổ ngữ cảnh là gì?', a: 'Nó là lượng văn bản (token) mà mô hình có thể xử lý trong một yêu cầu duy nhất, bao gồm cả hướng dẫn và lịch sử.' },
        { q: 'Các mô hình mã nguồn mở có được bao gồm không?', a: 'Có, chúng tôi bao gồm các biến thể Llama và Mixtral lớn có sẵn thông qua các nhà cung cấp như Groq.' },
        { q: 'Dữ liệu được cập nhật bao lâu một lần?', a: 'Chúng tôi cập nhật các chỉ số ngay khi nhà cung cấp phát hành các phiên bản mô hình mới hoặc cập nhật giá.' }
      ],
      complementary: {
        id: 'ai-cost-calculator',
        name: 'Cost Calculator',
        textEN: 'Found your model? Estimate costs with',
        textVI: 'Đã tìm được model? Ước tính phí với'
      }
    },
    'ai-json-to-prompt': {
      what: 'JSON to Prompt là một công cụ trực tuyến miễn phí chuyển đổi dữ liệu JSON thô thành mô tả bằng ngôn ngữ tự nhiên. Nó được thiết kế để giúp bạn giải thích các cấu trúc dữ liệu phức tạp cho AI hiệu quả hơn.',
      why: [
        { title: 'Cải thiện suy luận của AI', desc: 'LLM thường hoạt động tốt hơn khi dữ liệu được mô tả bằng ngôn ngữ tự nhiên thay vì JSON lồng nhau sâu.' },
        { title: 'Dữ liệu tự sự', desc: 'Chuyển đổi các hàng và cột thành một câu chuyện mạch lạc giúp các mô hình dễ dàng tóm tắt hoặc phân tích hơn.' },
        { title: 'Định dạng tùy chỉnh', desc: 'Kiểm soát mức độ chi tiết và phong cách được sử dụng để mô tả các đối tượng và mảng JSON của bạn.' },
        { title: '100% Tại trình duyệt', desc: 'Dữ liệu của bạn không bao giờ rời khỏi máy tính; mọi logic chuyển đổi chạy cục bộ trong trình duyệt của bạn.' }
      ],
      example: {
        before: '{"temp": 30, "unit": "C"}',
        after: 'Nhiệt độ hiện tại là 30 độ C.'
      },
      faqs: [
        { q: 'Tại sao không gửi trực tiếp JSON?', a: 'Mặc dù mô hình có thể đọc JSON, việc mô tả các mối quan hệ bằng văn bản có thể giảm hiện tượng ảo giác và cải thiện độ chính xác.' },
        { q: 'Nó có xử lý các đối tượng lồng nhau không?', a: 'Có, nó đệ quy khám phá cấu trúc JSON và xây dựng một bản tường thuật tôn trọng phân cấp dữ liệu.' },
        { q: 'Tôi có thể dùng cái này cho RAG không?', a: 'Hoàn toàn được, nó rất tuyệt để xử lý trước các đoạn JSON trước khi chúng được đánh chỉ mục trong vector database.' },
        { q: 'Nó có miễn phí không?', a: 'Có, đây là một tiện ích trực tuyến miễn phí dành cho các nhà phát triển AI.' }
      ],
      complementary: {
        id: 'json-path-tester',
        name: 'JSONPath Tester',
        textEN: 'Need to extract just part of the JSON? Use',
        textVI: 'Cần trích xuất một phần JSON? Dùng bản'
      }
    },
    'ai-system-prompt': {
      what: 'AI System Prompt Generator là một công cụ trực tuyến miễn phí giúp bạn tạo các bộ hướng dẫn chất lượng cao cho trợ lý AI. Nó cung cấp các mẫu và ràng buộc để tối đa hóa hiệu suất mô hình.',
      why: [
        { title: 'Chỉ dẫn tối ưu', desc: 'Sử dụng các mẫu prompt engineering đã được chứng minh như Few-Shot hoặc Chain-of-Thought trong hướng dẫn hệ thống của bạn.' },
        { title: 'Mẫu chuyên biệt', desc: 'Chọn từ các mẫu chuyên dụng cho lập trình, viết lách sáng tạo, nghiên cứu và phân tích kỹ thuật.' },
        { title: 'Tạo ràng buộc', desc: 'Xác định chính xác những gì AI KHÔNG được làm để ngăn chặn jailbreak và đảm bảo hành vi nhất quán.' },
        { title: 'Sao chép một lần nhấp', desc: 'Tạo ngay lập tức và sao chép prompt hệ thống đã tối ưu hóa để sử dụng trong bất kỳ giao diện LLM hoặc API nào.' }
      ],
      example: {
        before: 'Vai trò: Chuyên gia Python',
        after: 'Bạn là một nhà phát triển Python cao cấp. Mục tiêu của bạn là cung cấp mã code an toàn về kiểu dữ liệu, được tối ưu hóa...'
      },
      faqs: [
        { q: 'Prompt System là gì?', a: 'Nó là tập hợp các hướng dẫn "ẩn" cấu hình nên tính cách, quy tắc và khả năng cơ bản của một AI.' },
        { q: 'Làm thế nào nó giúp cải thiện độ chính xác?', a: 'Bằng cách thiết lập các ranh giới rõ ràng và các bước suy luận, bạn giúp mô hình tập trung vào nhiệm vụ và tránh các câu trả lời không liên quan.' },
        { q: 'Tôi có thể lưu các prompt của mình không?', a: 'Hiện tại bạn có thể sao chép chúng; chúng tôi không lưu trữ prompt trên máy chủ để đảm bảo quyền riêng tư của bạn.' },
        { q: 'Nó có hoạt động cho GPT-4 không?', a: 'Có, nó được thiết kế để hoạt động với tất cả các mô hình instruct-tuned hiện đại từ OpenAI, Anthropic và Google.' }
      ],
      complementary: {
        id: 'ai-prompt-builder',
        name: 'Prompt Builder',
        textEN: 'Got your system instructions? Build a full',
        textVI: 'Đã có chỉ dẫn hệ thống? Hãy tạo bản'
      }
    },
    'image-converter': {
      what: 'Image Converter là một công cụ trực tuyến miễn phí cho phép bạn chuyển đổi hình ảnh giữa các định dạng phổ biến như JPG, PNG, WebP và BMP. Nó đảm bảo ảnh của bạn tương thích với bất kỳ ứng dụng hoặc yêu cầu web nào ngay lập tức.',
      why: [
        { title: 'Linh hoạt định dạng', desc: 'Chuyển đổi giữa PNG chất lượng cao, WebP hiệu quả và JPG phổ biến chỉ với một cú nhấp chuột.' },
        { title: 'Chuyển đổi hàng loạt', desc: 'Xử lý nhiều hình ảnh cùng lúc để tiết kiệm thời gian cho các dự án thiết kế hoặc nhiếp ảnh lớn.' },
        { title: 'Bảo toàn chất lượng', desc: 'Duy trì độ phân giải tối ưu và độ chính xác của màu sắc trong suốt quá trình chuyển đổi.' },
        { title: 'Không tải lên server', desc: 'Tệp của bạn được xử lý 100% trong trình duyệt. Không có dữ liệu hình ảnh nào được gửi đến máy chủ của chúng tôi.' }
      ],
      example: {
        before: 'Đầu vào: photo.heic (Không phổ biến)',
        after: 'Đầu ra: photo.jpg (Sẵn sàng cho web)'
      },
      faqs: [
        { q: 'Những định dạng nào được hỗ trợ?', a: 'Bạn có thể chuyển đổi giữa các định dạng JPG, PNG, WebP và BMP ngay lập tức.' },
        { q: 'Nó có miễn phí không?', a: 'Có, trình chuyển đổi hình ảnh hoàn toàn miễn phí, không giới hạn hàng ngày và không cần đăng ký.' },
        { q: 'Bạn có lưu trữ hình ảnh của tôi không?', a: 'Không. Mọi quá trình xử lý diễn ra cục bộ trong bộ nhớ trình duyệt của bạn và sẽ bị xóa khi bạn đóng tab.' },
        { q: 'Tôi có thể chuyển đổi ảnh lớn không?', a: 'Có, tuy nhiên các tệp cực lớn có thể bị giới hạn bởi dung lượng RAM còn trống trên máy tính của bạn.' }
      ],
      complementary: {
        id: 'image-resizer',
        name: 'Image Resizer',
        textEN: 'Need to change the dimensions too? Try',
        textVI: 'Cần thay đổi kích thước nữa? Hãy thử'
      }
    },
    'image-resizer': {
      what: 'Image Resizer là một công cụ trực tuyến miễn phí cho phép bạn thay đổi kích thước và dung lượng tệp của hình ảnh. Dù bạn cần đáp ứng yêu cầu pixel chính xác hay thu phóng theo tỷ lệ phần trăm, công cụ đều cung cấp khả năng kiểm soát độ chính xác tuyệt đối.',
      why: [
        { title: 'Thu phóng chính xác', desc: 'Thay đổi kích thước theo pixel hoặc tỷ lệ phần trăm trong khi vẫn giữ nguyên tỷ lệ khung hình gốc.' },
        { title: 'Kiểm soát dung lượng', desc: 'Điều chỉnh kích thước để giảm đáng kể trọng lượng hình ảnh, giúp trang web tải nhanh hơn.' },
        { title: 'Xem trước tức thì', desc: 'Xem các thay đổi của bạn ngay lập tức trước khi tải xuống tệp tối ưu cuối cùng.' },
        { title: 'Bảo mật tuyệt đối', desc: 'Mọi logic thay đổi kích thước chạy cục bộ; ảnh cá nhân của bạn không bao giờ rời khỏi thiết bị.' }
      ],
      example: {
        before: 'Rộng: 4000px, Nặng: 5MB',
        after: 'Rộng: 800px, Nặng: 120KB'
      },
      faqs: [
        { q: 'Ảnh của tôi có bị biến dạng không?', a: 'Không. Công cụ khóa tỷ lệ khung hình theo mặc định để đảm bảo hình ảnh của bạn không trông bị méo.' },
        { q: 'Tôi có thể đổi kích thước nhiều ảnh?', a: 'Có, bạn có thể tải lên và áp dụng cài đặt cho một loạt ảnh để xử lý nhanh chóng.' },
        { q: 'Kích thước tối đa là bao nhiêu?', a: 'Chúng tôi hỗ trợ hầu hết các độ phân giải máy ảnh hiện đại; giới hạn phụ thuộc vào bộ nhớ trình duyệt.' },
        { q: 'Nó có an toàn cho ảnh cá nhân?', a: 'Chắc chắn. Mọi xử lý đều là client-side 100%; không có hình ảnh nào được tải lên máy chủ.' }
      ],
      complementary: {
        id: 'image-converter',
        name: 'Image Converter',
        textEN: 'Need to change the format as well? Use',
        textVI: 'Cần chuyển đổi định dạng nữa? Dùng bản'
      }
    },
    'svg-to-png': {
      what: 'SVG to PNG Converter là một tiện ích trực tuyến miễn phí giúp chuyển đổi đồ họa vector thành hình ảnh PNG hoặc JPG chất lượng cao. Nó cho phép bạn chỉ định độ phân giải tùy chỉnh để có kết quả chuyên nghiệp và sắc nét.',
      why: [
        { title: 'Chuyển đổi Vector', desc: 'Chuyển đổi mã hoặc tệp SVG có thể thay đổi quy mô thành hình ảnh tĩnh phù hợp cho mạng xã hội hoặc in ấn.' },
        { title: 'Nền trong suốt', desc: 'Xuất dưới dạng PNG để giữ nguyên độ trong suốt từ tác phẩm nghệ thuật vector gốc của bạn.' },
        { title: 'Độ phân giải tùy chỉnh', desc: 'Chỉ định chính xác chiều rộng và chiều cao để xuất SVG của bạn ở bất kỳ kích thước nào mà không làm giảm chất lượng.' },
        { title: 'Xử lý an toàn', desc: 'Mã vector của bạn vẫn ở cục bộ. Không có dữ liệu nào được gửi đến máy chủ bên ngoài trong quá trình hiển thị.' }
      ],
      example: {
        before: '<svg>...</svg> (Vector)',
        after: 'logo.png (Raster trong suốt)'
      },
      faqs: [
        { q: 'Tại sao nên chuyển SVG sang PNG?', a: 'PNG tương thích với hầu hết mọi nền tảng, trong khi một số ứng dụng không hỗ trợ nhúng SVG trực tiếp.' },
        { q: 'Tôi có thể đặt kích thước tùy chỉnh?', a: 'Có. Bạn có thể thay đổi quy mô SVG của mình sang bất kỳ độ phân giải nào (ví dụ: 2048px) cho đầu ra HD.' },
        { q: 'Nó có hỗ trợ màu sắc không?', a: 'Có, tất cả các gradient, đường dẫn và màu sắc được định nghĩa trong SVG của bạn sẽ được hiển thị chính xác.' },
        { q: 'Chất lượng có cao không?', a: 'Có. Vì SVG là vector, công cụ có thể hiển thị chúng ở bất kỳ kích thước nào với độ sắc nét hoàn hảo.' }
      ],
      complementary: {
        id: 'svg-previewer',
        name: 'SVG Previewer',
        textEN: 'Just want to view or edit the code? Use',
        textVI: 'Chỉ muốn xem hoặc sửa code? Hãy dùng'
      }
    },
    'csv-to-excel': {
      what: 'CSV to Excel Converter là một công cụ trực tuyến miễn phí giúp chuyển đổi các giá trị được phân tách bằng dấu phẩy thành các bảng tính XLSX chuyên nghiệp. Nó xử lý chính xác các dấu phân cách và mã hóa để đảm bảo dữ liệu của bạn được nhập chính xác.',
      why: [
        { title: 'Tương thích Excel', desc: 'Tạo tệp native .xlsx mở hoàn hảo trong Microsoft Excel, Google Sheets và Numbers.' },
        { title: 'Hỗ trợ mã hóa', desc: 'Xử lý UTF-8 và các mã hóa khác để bảo toàn các ký tự đặc biệt và biểu tượng quốc tế.' },
        { title: 'Không rò rỉ dữ liệu', desc: 'Dữ liệu tài chính hoặc cá nhân của bạn được xử lý ngoại tuyến 100% trong trình duyệt của bạn.' },
        { title: 'Định dạng tức thì', desc: 'Chuyển đổi dữ liệu thô thành các bảng được định dạng sẵn sàng cho việc phân tích và báo cáo ngay lập tức.' }
      ],
      example: {
        before: 'id,name,total\n1,John,50',
        after: '[Tải về tệp bảng tính đã tính toán]'
      },
      faqs: [
        { q: 'Tôi có thể mở kết quả trong Excel không?', a: 'Có, công cụ tạo tệp .xlsx tiêu chuẩn tương thích với tất cả các phần mềm bảng tính hiện đại.' },
        { q: 'Nó có thể xử lý bao nhiêu hàng?', a: 'Nó có thể xử lý hàng chục nghìn hàng nhanh chóng, chỉ bị giới hạn bởi bộ nhớ trình duyệt của bạn.' },
        { q: 'Bí mật kinh doanh của tôi có an toàn?', a: 'Có. Chúng tôi không bao giờ thấy dữ liệu của bạn. Logic chuyển đổi chạy hoàn toàn trên máy cục bộ của bạn.' },
        { q: 'Còn các dấu phân cách khác thì sao?', a: 'Công cụ tự động phát hiện dấu phẩy, dấu chấm phẩy và tab để đảm bảo ánh xạ cột chính xác.' }
      ],
      complementary: {
        id: 'json-to-excel',
        name: 'JSON to Excel',
        textEN: 'Working with JSON data instead? Try our',
        textVI: 'Làm việc với dữ liệu JSON? Hãy thử bản'
      }
    },
    'json-to-excel': {
      what: 'JSON to Excel Converter là một công cụ trực tuyến miễn phí giúp làm phẳng các đối tượng và mảng JSON lồng nhau phức tạp thành các bảng tính XLSX có cấu trúc. Đây là giải pháp lý tưởng cho các nhà phát triển và nhà phân tích dữ liệu cần xuất responses API sang Excel.',
      why: [
        { title: 'Làm phẳng thông minh', desc: 'Tự động làm phẳng các cấu trúc JSON lồng nhau thành các cột dạng bảng gọn gàng cho Excel.' },
        { title: 'Thân thiện Developer', desc: 'Dễ dàng chuyển đổi responses API thành bảng tính dễ đọc để báo cáo cho các bên liên quan.' },
        { title: 'Phía người dùng 100%', desc: 'Không có dữ liệu API nhạy cảm nào được tải lên máy chủ. Quá trình xử lý được thực hiện hoàn toàn trong trình duyệt.' },
        { title: 'Tải xuống tức thì', desc: 'Tạo và lưu tệp .xlsx của bạn trong vài giây mà không cần thời gian chờ hay đăng ký.' }
      ],
      example: {
        before: '[{"user": {"id": 1, "name": "Dev"}}]',
        after: 'Cột A: user.id | Cột B: user.name'
      },
      faqs: [
        { q: 'Nó xử lý các object lồng nhau thế nào?', a: 'Công cụ sử dụng dot-notation (ví dụ: user.address.city) để biểu diễn phân cấp đối tượng sâu dưới dạng các cột.' },
        { q: 'Nó có hỗ trợ tệp JSON lớn không?', a: 'Có, nó có thể xử lý các mảng lớn hiệu quả tùy thuộc vào RAM khả dụng của hệ thống bạn.' },
        { q: 'Nó có miễn phí cho thương mại không?', a: 'Có, công cụ của chúng tôi miễn phí cho cả mục đích cá nhân và chuyên nghiệp mà không mất phí bản quyền.' },
        { q: 'Bạn có lưu trữ dữ liệu của tôi không?', a: 'Không. JSON được phân tích cú pháp cục bộ và tệp được tạo trong trình duyệt; không có gì được gửi đến máy chủ.' }
      ],
      complementary: {
        id: 'csv-to-excel',
        name: 'CSV to Excel',
        textEN: 'Converting from a CSV source? Use our',
        textVI: 'Chuyển đổi từ nguồn CSV? Hãy dùng bản'
      }
    },
    'markdown-to-html': {
      what: 'Markdown to HTML Converter là một công cụ trực tuyến miễn phí giúp chuyển đổi các tài liệu Markdown của bạn thành mã HTML sạch sẽ, có định dạng. Nó hỗ trợ GitHub Flavored Markdown (GFM) và cung cấp xem trước trực tiếp ngay lập tức.',
      why: [
        { title: 'Hỗ trợ GFM', desc: 'Hiển thị chính xác các bảng, danh sách nhiệm vụ và văn bản gạch ngang giống như trên GitHub.' },
        { title: 'Đầu ra có định dạng', desc: 'Tải xuống tệp .html độc lập với CSS tích hợp hoặc sao chép mã body thuần túy.' },
        { title: 'Highlight cú pháp', desc: 'Tự động bao bọc các khối mã để dễ dàng tạo kiểu và làm nổi bật trong blog hoặc tài liệu của bạn.' },
        { title: 'Xem trước tức thì', desc: 'Xem Markdown của bạn được hiển thị theo thời gian thực khi bạn nhập, đảm bảo kết quả hoàn hảo trước khi xuất.' }
      ],
      example: {
        before: '# Xin chào\n**Đậm**',
        after: '<h1>Xin chào</h1>\n<strong>Đậm</strong>'
      },
      faqs: [
        { q: 'Tôi có thể xuất tệp HTML đầy đủ không?', a: 'Có. Bạn có thể tải xuống một tài liệu hoàn chỉnh bao gồm các thẻ head và biểu kiểu (stylesheet) mặc định.' },
        { q: 'Nó có hỗ trợ hình ảnh không?', a: 'Có, nó hiển thị các liên kết hình ảnh cục bộ hoặc từ xa được định nghĩa bằng cú pháp Markdown.' },
        { q: 'Nội dung của tôi có riêng tư không?', a: 'Có. Việc phân tích cú pháp diễn ra trong trình duyệt của bạn. Nội dung bản thảo của bạn không bao giờ được tải lên bất kỳ máy chủ nào.' },
        { q: 'Có hỗ trợ bảng không?', a: 'Có, hoàn toàn tuân thủ các bảng GitHub Flavored Markdown và cú pháp căn lề.' }
      ],
      complementary: {
        id: 'html-to-markdown',
        name: 'HTML to Markdown',
        textEN: 'Converting back to Markdown? Use our',
        textVI: 'Chuyển đổi ngược về Markdown? Dùng bản'
      }
    },
    'html-to-pdf': {
      what: 'HTML to PDF Converter là một tiện ích trực tuyến miễn phí cho phép bạn hiển thị nội dung HTML và lưu dưới dạng tài liệu PDF. Nó tận dụng công cụ in gốc của trình duyệt để đảm bảo bố cục và kiểu dáng chính xác.',
      why: [
        { title: 'Hiển thị gốc', desc: 'Sử dụng các công cụ trình duyệt hiện đại để đảm bảo CSS, font chữ và hình ảnh của bạn trông chính xác như dự định.' },
        { title: 'Hỗ trợ CSS tùy chỉnh', desc: 'Bao gồm các kiểu in cụ thể để đảm bảo PDF được xuất ra được định dạng hoàn hảo cho các kích thước A4 hoặc Letter.' },
        { title: 'An toàn & Bảo mật', desc: 'Nội dung tài liệu của bạn được hiển thị cục bộ. Chúng tôi không lưu trữ hoặc xem HTML bạn chuyển đổi.' },
        { title: 'Không hình mờ (Watermarks)', desc: 'Tạo các tệp PDF chuyên nghiệp, sạch sẽ mà không có bất kỳ thương hiệu hoặc tiêu đề/chân trang bắt buộc nào.' }
      ],
      example: {
        before: '<div><h1>Hóa đơn</h1>...</div>',
        after: '[Tải xuống tài liệu PDF chuyên nghiệp]'
      },
      faqs: [
        { q: 'Hình ảnh có hoạt động trong PDF không?', a: 'Có, miễn là các hình ảnh có thể truy cập được đối với trình duyệt của bạn trong quá trình chuyển đổi.' },
        { q: 'Tôi có thể định dạng trang không?', a: 'Có. Bạn có thể sử dụng các quy tắc CSS @media print để ẩn các phần tử hoặc điều chỉnh bố cục dành riêng cho PDF.' },
        { q: 'Có giới hạn trang không?', a: 'Giới hạn dựa trên hiệu suất trình duyệt và máy tính của bạn; nó có thể xử lý các tài liệu rất dài.' },
        { q: 'Nó có miễn phí không?', a: 'Có, công cụ này hoàn toàn miễn phí và không yêu cầu tài khoản hay đăng ký.' }
      ],
      complementary: {
        id: 'markdown-to-html',
        name: 'Markdown to HTML',
        textEN: 'Building the HTML from Markdown? Use',
        textVI: 'Tạo HTML từ Markdown? Hãy dùng bản'
      }
    },
    'image-compressor': {
      what: 'Image Compressor là một công cụ trực tuyến miễn phí giúp tối ưu hóa hình ảnh của bạn để giảm dung lượng tệp mà không làm giảm chất lượng hiển thị. Nó hoàn hảo để tăng tốc độ trang web và giảm việc sử dụng bộ nhớ.',
      why: [
        { title: 'Nén thông minh', desc: 'Sử dụng các thuật toán tiên tiến để loại bỏ siêu dữ liệu không cần thiết và tối ưu hóa dữ liệu màu sắc cho các kích thước nhỏ hơn.' },
        { title: 'So sánh A/B', desc: 'So sánh trực quan các phiên bản gốc và phiên bản đã nén cạnh nhau trước khi tải xuống.' },
        { title: 'Tập trung quyền riêng tư', desc: 'Ảnh của bạn được xử lý hoàn toàn trong trình duyệt. Không có dữ liệu nào rời khỏi thiết bị của bạn.' },
        { title: 'Hiệu suất Web', desc: 'Giảm đáng kể thời gian tải trang bằng cách tối ưu hóa tất cả các tài sản PNG và JPG của bạn.' }
      ],
      example: {
        before: 'Gốc: 3.2MB',
        after: 'Tối ưu hóa: 450KB (giảm 85%)'
      },
      faqs: [
        { q: 'Ảnh của tôi có bị mờ không?', a: 'Ở các cài đặt khuyên dùng, sự sụt giảm chất lượng gần như không thể nhận thấy đối với mắt người.' },
        { q: 'Những định dạng nào được hỗ trợ?', a: 'Chúng tôi hỗ trợ tối ưu hóa JPEG và PNG với các kỹ thuật lượng tử hóa tiên tiến.' },
        { q: 'Tôi có thể nén hàng loạt không?', a: 'Có, bạn có thể tải lên nhiều hình ảnh và nén tất cả chúng cùng một lúc để tăng hiệu quả.' },
        { q: 'Bạn có giữ lại ảnh của tôi không?', a: 'Không bao giờ. Mọi xử lý đều là cục bộ 100%. Tệp của bạn không bao giờ được tải lên bất kỳ máy chủ nào.' }
      ],
      complementary: {
        id: 'image-resizer',
        name: 'Image Resizer',
        textEN: 'Still too large? Try changing dimensions with',
        textVI: 'Vẫn còn quá lớn? Thử đổi kích thước với'
      }
    },
    'image-to-base64': {
      what: 'Image to Base64 là công cụ trực tuyến miễn phí giúp chuyển đổi hình ảnh của bạn thành chuỗi dữ liệu Base64 (Data URL) ngay lập tức. Nó cho phép bạn nhúng dữ liệu hình ảnh trực tiếp vào HTML, CSS hoặc JSON mà không cần lưu trữ file bên ngoài.',
      why: [
        { title: 'Giảm HTTP Request', desc: 'Cải thiện tốc độ tải trang bằng cách nhúng các icon nhỏ và đồ họa trực tiếp vào mã nguồn.' },
        { title: 'Data URI chuẩn', desc: 'Tự động tạo tiền tố (prefix) chính xác dựa trên loại ảnh (PNG, JPEG, SVG, WebP, v.v.).' },
        { title: '100% Cục bộ', desc: 'Hình ảnh được xử lý ngay tại trình duyệt của bạn, không có dữ liệu nào bị tải lên máy chủ.' },
        { title: 'Tích hợp dễ dàng', desc: 'Sao chép nhanh toàn bộ Data URI hoặc chỉ chuỗi Base64 để dùng cho background CSS.' }
      ],
      example: {
        before: 'Logo.png (5KB)',
        after: 'data:image/png;base64,iVBORw0KGgo...'
      },
      faqs: [
        { q: 'Cách chuyển ảnh sang base64?', a: 'Chỉ cần kéo thả ảnh vào công cụ. Nó sẽ tạo ra chuỗi base64 ngay lập tức để bạn sao chép.' },
        { q: 'Base64 có làm tăng kích thước ảnh không?', a: 'Có, mã hóa base64 thường làm tăng kích thước dữ liệu khoảng 33% so với file gốc.' },
        { q: 'Khi nào nên dùng base64 cho ảnh?', a: 'Nên dùng cho các icon, logo nhỏ hoặc ảnh pixel-art để giảm số lượng yêu cầu HTTP.' },
        { q: 'Dùng công cụ này có an toàn không?', a: 'Hoàn toàn an toàn. Ảnh của bạn không bao giờ rời khỏi máy tính cá nhân.' }
      ],
      complementary: {
        id: 'base64-encode-decode',
        name: 'Base64 Tool',
        textEN: 'Need to encode plain text instead? Try',
        textVI: 'Cần mã hóa văn bản thuần? Thử ngay'
      }
    },
    'qr-generator': {
      what: 'QR Code Generator là một công cụ trực tuyến miễn phí giúp chuyển đổi bất kỳ văn bản, URL hoặc dữ liệu nào thành mã QR chất lượng cao. Hỗ trợ nhiều loại dữ liệu như Wi-Fi, vCard và SMS.',
      why: [
        { title: 'Đa dạng dữ liệu', desc: 'Tạo mã cho URL, văn bản, mạng Wi-Fi, danh thiếp (vCard) và nhiều loại khác.' },
        { title: 'Tạo mã tức thì', desc: 'Mã QR được tạo theo thời gian thực khi bạn nhập liệu, không có độ trễ.' },
        { title: 'Độ phân giải cao', desc: 'Tải xuống mã QR dưới dạng tệp PNG sắc nét, phù hợp cho cả in ấn và hiển thị số.' },
        { title: 'Riêng tư 100%', desc: 'Dữ liệu và mã QR được xử lý cục bộ trên trình duyệt, không cần đăng ký tài khoản.' }
      ],
      example: {
        before: 'https://devtools.online',
        after: '[Hình ảnh mã QR chất lượng cao]'
      },
      faqs: [
        { q: 'Cách tạo mã QR cho link?', a: 'Chọn loại "URL", dán link của bạn và mã QR sẽ xuất hiện ngay lập tức để tải về.' },
        { q: 'Mã QR có hết hạn không?', a: 'Đây là mã QR tĩnh, nó chứa dữ liệu trực tiếp nên sẽ hoạt động vĩnh viễn và không bao giờ hết hạn.' },
        { q: 'Tôi có thể tùy chỉnh kích thước không?', a: 'Có, bạn có thể điều chỉnh kích thước và mức độ sửa lỗi (error correction) cho mã.' },
        { q: 'Tạo mã QR có mất phí không?', a: 'Không, công cụ này hoàn toàn miễn phí và không giới hạn số lượng mã tạo ra.' }
      ],
      complementary: {
        id: 'barcode-generator',
        name: 'Barcode Generator',
        textEN: 'Need traditional barcodes instead? Use our',
        textVI: 'Cần mã vạch truyền thống? Hãy dùng'
      }
    },
    'chmod-calculator': {
      what: 'Chmod Calculator là công cụ trực tuyến giúp bạn tính toán quyền truy cập tệp trên Unix/Linux bằng cả hệ bát phân (octal - ví dụ 755) và ký hiệu (symbolic - rwxr-xr-x).',
      why: [
        { title: 'Tương tác trực quan', desc: 'Bật/tắt các bit Read, Write, Execute cho Chủ sở hữu, Nhóm và Khách để xem kết quả ngay.' },
        { title: 'Chuyển đổi hai chiều', desc: 'Nhập số bát phân để xem chuỗi ký hiệu hoặc ngược lại để hiểu sâu về phân quyền.' },
        { title: 'Mẫu có sẵn', desc: 'Chọn nhanh các tiêu chuẩn phổ biến như 644 (Tệp công khai) hoặc 755 (Thư mục).' },
        { title: 'Lệnh Linux tự động', desc: 'Tự động tạo chuỗi lệnh "chmod" đầy đủ để bạn copy và paste vào terminal.' }
      ],
      example: {
        before: 'r+w cho Chủ sở hữu',
        after: 'chmod 600 filename'
      },
      faqs: [
        { q: 'Chmod 755 có nghĩa là gì?', a: '755 nghĩa là chủ sở hữu có toàn quyền (7), trong khi nhóm và người khác chỉ có quyền đọc và thực thi (5).' },
        { q: 'Hệ bát phân (Octal) là gì?', a: 'Sử dụng 3 chữ số (0-7), trong đó Đọc=4, Ghi=2, và Thực thi=1.' },
        { q: 'Khi nào nên dùng 777?', a: 'Gần như không bao giờ. 777 cấp toàn quyền cho mọi người, là một rủi ro bảo mật nghiêm trọng.' },
        { q: 'Công cụ có an toàn không?', a: 'Có, đây thuần túy là bộ máy tính toán logic chạy tại trình duyệt, không lưu trữ dữ liệu.' }
      ],
      complementary: {
        id: 'env-parser',
        name: 'ENV Parser',
        textEN: 'Configuring your server environment? Use our',
        textVI: 'Đang cấu hình môi trường server? Hãy dùng'
      }
    },
    'env-parser': {
      what: '.ENV Parser là công cụ trực tuyến giúp chuyển đổi các tệp cấu hình môi trường của bạn thành JSON và ngược lại. Nó giúp các nhà phát triển quản lý cài đặt ứng dụng dễ dàng hơn.',
      why: [
        { title: 'Đồng bộ hai chiều', desc: 'Chuyển đổi mượt mà giữa các cặp key-value của .env và đối tượng JSON.' },
        { title: 'Highlight cú pháp', desc: 'Dễ dàng nhận diện các dòng comment, tên biến và giá trị với trình soạn thảo tích hợp.' },
        { title: 'Kiểm tra định dạng', desc: 'Tự động phát hiện các dòng không hợp lệ hoặc lỗi định dạng trong chuỗi cấu hình.' },
        { title: 'Bảo mật 100%', desc: 'Các biến môi trường nhạy cảm được xử lý hoàn toàn trong trình duyệt của bạn.' }
      ],
      example: {
        before: 'DB_PORT=5432\nDEBUG=true',
        after: '{\n  "DB_PORT": "5432",\n  "DEBUG": "true"\n}'
      },
      faqs: [
        { q: 'Cách chuyển file .env sang JSON?', a: 'Dán nội dung .env vào ô nhập liệu. Công cụ sẽ phân tích và cung cấp cấu trúc JSON ngay lập tức.' },
        { q: 'Nó có hỗ trợ comment không?', a: 'Có. Các dòng ghi chú bắt đầu bằng dấu # được nhận diện và xử lý chính xác.' },
        { q: 'Dán key bí mật vào đây có an toàn không?', a: 'Có, vì công cụ chạy hoàn toàn client-side. Key và mật khẩu của bạn không bao giờ rời khỏi trình duyệt.' },
        { q: 'Tôi có thể xuất ra JSON không?', a: 'Có, sau khi parse, bạn có thể copy kết quả JSON để dùng cho code hoặc CI/CD.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Need to prettify the JSON output? Use our',
        textVI: 'Cần làm đẹp đầu ra JSON? Hãy dùng'
      }
    },
    'keycode-tester': {
      what: 'KeyCode Tester là công cụ giúp ghi lại các sự kiện bàn phím và cung cấp thông tin chi tiết về mọi phím bạn nhấn. Đây là tiện ích quan trọng cho lập trình viên web khi xây dựng phím tắt.',
      why: [
        { title: 'Ghi nhận thời gian thực', desc: 'Xem mã phím (key codes), tên phím và các thuộc tính sự kiện ngay khi bạn nhấn.' },
        { title: 'Phát hiện phím bổ trợ', desc: 'Hiển thị trạng thái của các phím Shift, Ctrl, Alt và Meta (Cmd) khi kết hợp với phím khác.' },
        { title: 'Dữ liệu sự kiện', desc: 'Kiểm tra các thuộc tính bậc thấp như keyCode, charCode để đảm bảo tính tương thích trình duyệt.' },
        { title: 'Code mẫu cho Dev', desc: 'Cung cấp các đoạn mã JavaScript event listener sẵn sàng để sử dụng cho phím bạn vừa thử.' }
      ],
      example: {
        before: 'Nhấn [ENTER]',
        after: 'Key: Enter, Code: 13'
      },
      faqs: [
        { q: 'Cách tìm mã của một phím?', a: 'Mở công cụ này và nhấn phím đó trên bàn phím. Mã và tên của nó sẽ xuất hiện ngay trên màn hình.' },
        { q: 'Sự khác biệt giữa key và code?', a: '"Key" đại diện cho ký tự (ví dụ: "a"), còn "Code" đại diện cho vị trí vật lý của phím (ví dụ: "KeyA").' },
        { q: 'Nó có hoạt động trên mọi trình duyệt?', a: 'Có, nó nhận diện các thuộc tính tiêu chuẩn hoạt động trên Chrome, Firefox và Safari mới nhất.' },
        { q: 'Có hỗ trợ các phím đặc biệt không?', a: 'Có, nó có thể phát hiện các phím chức năng (F1-F12), phím media và phím đặc trưng của hệ điều hành.' }
      ],
      complementary: {
        id: 'js-formatter',
        name: 'JS Formatter',
        textEN: 'Writing keyboard logic in JS? Clean it with',
        textVI: 'Đang viết logic phím bằng JS? Hãy làm sạch với'
      }
    },
    'diagram-creator': {
      what: 'Diagram Creator là công cụ sử dụng cú pháp Mermaid.js để tạo các sơ đồ luồng (flowcharts), sơ đồ trình tự (sequence diagrams) và sơ đồ tư duy (mindmaps) chuyên nghiệp từ văn bản.',
      why: [
        { title: 'Code sang Sơ đồ', desc: 'Chuyển đổi các mô tả văn bản đơn giản thành các sơ đồ trực quan chuyên nghiệp ngay lập tức.' },
        { title: 'Đa dạng loại sơ đồ', desc: 'Hỗ trợ Flowcharts, Sequence Diagrams, ERDs, Gantt Charts và Class Diagrams.' },
        { title: 'Xem trước tức thì', desc: 'Bộ dựng đồ họa thời gian thực sẽ cập nhật sơ đồ ngay khi bạn gõ mã Mermaid.' },
        { title: 'Xuất ảnh chất lượng cao', desc: 'Xuất sơ đồ đã hoàn thành dưới dạng tệp SVG hoặc PNG phù hợp cho tài liệu và thuyết trình.' }
      ],
      example: {
        before: 'graph TD; A-->B;',
        after: '[Hình ảnh sơ đồ trực quan]'
      },
      faqs: [
        { q: 'Cách tạo sơ đồ luồng từ văn bản?', a: 'Sử dụng trình soạn thảo và tuân theo cú pháp Mermaid (ví dụ: "A --> B") để xây dựng cấu trúc của bạn.' },
        { q: 'Tôi có thể xuất ảnh PNG không?', a: 'Có, bạn có thể xuất tác phẩm của mình dưới dạng PNG hoặc SVG có độ phân giải cao chỉ với một cú nhấp chuột.' },
        { q: 'Sơ đồ của tôi có được lưu không?', a: 'Chúng tôi xử lý mọi thứ cục bộ. Sơ đồ được lưu trong phiên làm việc hiện tại và không lưu trên máy chủ của chúng tôi.' },
        { q: 'Công cụ này có miễn phí không?', a: 'Có, hoàn toàn miễn phí và sử dụng các thư viện mã nguồn mở chuyên nghiệp.' }
      ],
      complementary: {
        id: 'erd-diagram',
        name: 'ERD Generator',
        textEN: 'Building database diagrams? Use our',
        textVI: 'Đang xây dựng sơ đồ database? Hãy dùng'
      }
    },
    'log-viewer': {
      what: 'Log Viewer là công cụ trực tuyến giúp bạn phân tích, lọc và xem các tệp nhật ký (log) có cấu trúc từ nhiều định dạng khác nhau. Hỗ trợ JSON Lines, Serilog, Pino và log máy chủ (Apache/Nginx).',
      why: [
        { title: 'Phân tích thông minh', desc: 'Tự động nhận diện dữ liệu có cấu trúc trong các dòng log và hiển thị dưới dạng bảng sạch sẽ, dễ đọc.' },
        { title: 'Bộ lọc mạnh mẽ', desc: 'Lọc nhanh theo cấp độ log (Info, Warning, Error) hoặc tìm kiếm theo chuỗi văn bản cụ thể.' },
        { title: 'Tối ưu hiệu suất', desc: 'Được thiết kế để xử lý các tệp log lớn một cách hiệu quả mà không làm chậm trình duyệt.' },
        { title: 'Riêng tư tuyệt đối', desc: 'Dữ liệu log của bạn chỉ nằm trên thiết bị của bạn. Chúng tôi không bao giờ tải lên hay lưu trữ log.' }
      ],
      example: {
        before: '{"lvl":"ERR","msg":"Failed"}',
        after: '[Dòng bảng: ERR | Failed]'
      },
      faqs: [
        { q: 'Cách xem log JSON trực tuyến?', a: 'Tải tệp .json hoặc .log của bạn lên. Trình xem sẽ tự động định dạng dữ liệu vào một bảng có thể sắp xếp được.' },
        { q: 'Nó có hỗ trợ Serilog hay Pino không?', a: 'Có, nó được tối ưu cho định dạng JSON Lines (ndjson) thường được dùng bởi các thư viện log hiện đại.' },
        { q: 'Tôi có thể lọc theo mức độ lỗi không?', a: 'Có, sử dụng bộ chọn cấp độ để cô lập các lỗi hoặc cảnh báo bạn cần debug.' },
        { q: 'Có an toàn cho log thực tế (production) không?', a: 'Hoàn toàn an toàn. Mọi dữ liệu log được xử lý cục bộ trong trình duyệt để duy trì tính bảo mật tuyệt đối.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Need to inspect a specific log object? Use',
        textVI: 'Cần kiểm tra một đối tượng log? Hãy dùng'
      }
    },
    'xml-formatter': {
      what: 'XML Formatter là một công cụ trực tuyến miễn phí giúp làm đẹp và kiểm tra cú pháp tài liệu XML ngay lập tức. Nó chuyển đổi mã XML khó đọc, bị nén thành định dạng có cấu trúc và thụt lề rõ ràng để dễ dàng gỡ lỗi.',
      why: [
        { title: 'Cải thiện khả năng đọc', desc: 'Chuyển đổi XML dạng phẳng thành cấu trúc cây phân cấp rõ ràng với thụt lề chuẩn.' },
        { title: 'Kiểm tra cú pháp', desc: 'Tự động phát hiện các thẻ bị thiếu, ngoặc chưa đóng và các lỗi cú pháp XML phổ biến khác.' },
        { title: 'Tùy chọn thụt lề', desc: 'Chọn giữa thụt lề 2 dấu cách, 4 dấu cách hoặc Tab để phù hợp với tiêu chuẩn mã nguồn của bạn.' },
        { title: 'Xử lý phía máy khách', desc: 'Dữ liệu được xử lý cục bộ trong trình duyệt. Không có nội dung XML nào được gửi lên máy chủ.' }
      ],
      example: {
        before: '<root><item id="1">Văn bản</item></root>',
        after: '<root>\n  <item id="1">Văn bản</item>\n</root>'
      },
      faqs: [
        { q: 'Cách định dạng XML trực tuyến?', a: 'Dán mã XML của bạn vào trình soạn thảo. Công cụ sẽ ngay lập tức xác thực và làm đẹp cấu trúc cho bạn.' },
        { q: 'Nó có kiểm tra lỗi XML không?', a: 'Có, nó cung cấp tính năng xác thực thời gian thực và làm nổi bật các lỗi cú pháp như thẻ không khớp.' },
        { q: 'Có giới hạn kích thước tệp không?', a: 'Công cụ xử lý hiệu quả các tệp XML dung lượng vài megabyte, chỉ giới hạn bởi bộ nhớ trình duyệt.' },
        { q: 'Dữ liệu XML của tôi có an toàn không?', a: 'Hoàn toàn an toàn. Mọi quá trình xử lý diễn ra trong trình duyệt; chúng tôi không bao giờ lưu trữ dữ liệu của bạn.' }
      ],
      complementary: {
        id: 'xml-minifier',
        name: 'XML Minifier',
        textEN: 'Need to compress your XML for production? Use our',
        textVI: 'Cần nén XML cho phiên bản chính thức? Hãy dùng'
      }
    },
    'xml-minifier': {
      what: 'XML Minifier là công cụ trực tuyến miễn phí giúp nén tài liệu XML bằng cách loại bỏ các khoảng trắng và chú thích không cần thiết. Điều này giúp giảm kích thước tệp và cải thiện tốc độ tải cho các ứng dụng web và API.',
      why: [
        { title: 'Giảm kích thước tệp', desc: 'Giảm đáng kể dung lượng tệp XML của bạn bằng cách loại bỏ tất cả các ký tự không thiết yếu.' },
        { title: 'Xóa chú thích', desc: 'Tùy chọn xóa các chú thích XML nội bộ để bảo vệ logic và giảm truyền tải dữ liệu.' },
        { title: 'Tăng hiệu suất', desc: 'Tệp nhỏ hơn giúp phân tích cú pháp nhanh hơn và giảm băng thông trong môi trường lưu lượng cao.' },
        { title: 'Nén tức thì', desc: 'Dán mã của bạn và nhận kết quả nén ngay lập tức chỉ với một cú nhấp chuột.' }
      ],
      example: {
        before: '<note>\n  <to>Tove</to>\n</note>',
        after: '<note><to>Tove</to></note>'
      },
      faqs: [
        { q: 'Cách nén XML trực tuyến?', a: 'Dán nội dung XML và nhấn nút nén. Tất cả khoảng trắng và ký tự thừa sẽ bị xóa ngay lập tức.' },
        { q: 'Việc nén có làm mất dữ liệu không?', a: 'Không, nó chỉ xóa thụt lề, xuống dòng và chú thích tùy chọn. Cấu trúc dữ liệu vẫn giữ nguyên.' },
        { q: 'Khi nào nên nén XML?', a: 'Khuyên dùng cho môi trường thực tế (production) để tiết kiệm băng thông và cải thiện thời gian phản hồi API.' },
        { q: 'Tôi có thể hoàn tác việc nén không?', a: 'Có, bạn có thể sử dụng công cụ XML Formatter của chúng tôi để khôi phục cấu trúc dễ đọc bất cứ lúc nào.' }
      ],
      complementary: {
        id: 'xml-formatter',
        name: 'XML Formatter',
        textEN: 'Need to read the XML again? Use our',
        textVI: 'Cần đọc lại XML? Hãy dùng bản'
      }
    },
    'graphql-formatter': {
      what: 'GraphQL Formatter là công cụ trực tuyến miễn phí giúp làm đẹp các truy vấn (queries), mutations và schemas của GraphQL. Nó đảm bảo mã của bạn tuân theo các quy tắc định dạng tiêu chuẩn.',
      why: [
        { title: 'Cấu trúc sạch sẽ', desc: 'Tự động căn chỉnh các trường, đối số và định nghĩa fragment để có giao diện chuyên nghiệp.' },
        { title: 'Làm nổi bật cú pháp', desc: 'Dễ dàng phân biệt giữa các trường, kiểu dữ liệu và biến với trình soạn thảo thân thiện với lập trình viên.' },
        { title: 'Tuân thủ tiêu chuẩn', desc: 'Tuân theo các quy tắc định dạng kiểu Prettier để giữ cho các truy vấn nhất quán trong mọi dự án.' },
        { title: 'Xử lý tại chỗ', desc: 'Các schema và truy vấn GraphQL của bạn được xử lý hoàn toàn trong trình duyệt để đảm bảo tính riêng tư tối đa.' }
      ],
      example: {
        before: '{user(id:5){name email}}',
        after: '{\n  user(id: 5) {\n    name\n    email\n  }\n}'
      },
      faqs: [
        { q: 'Cách định dạng GraphQL trực tuyến?', a: 'Dán truy vấn hoặc schema vào công cụ. Nó sẽ tự động áp dụng thụt lề và khoảng cách phù hợp.' },
        { q: 'Nó có hỗ trợ fragments không?', a: 'Có, nó định dạng hoàn hảo cho fragments, inline fragments và các truy vấn lồng nhau phức tạp.' },
        { q: 'Có thể định dạng các schema lớn không?', a: 'Có, bộ máy được tối ưu hóa để xử lý các tệp schema .graphql hoặc .gql lớn một cách hiệu quả.' },
        { q: 'Sử dụng có mất phí không?', a: 'Hoàn toàn miễn phí, không cần đăng ký và không giới hạn số lần sử dụng.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Formatting the query result? Use our',
        textVI: 'Định dạng kết quả truy vấn? Hãy dùng'
      }
    },
    'yaml-formatter': {
      what: 'YAML Formatter là một công cụ trực tuyến miễn phí giúp làm đẹp và xác thực dữ liệu YAML. Nó giúp xác định các lỗi thụt lề (vốn cực kỳ quan trọng trong YAML) và cung cấp cái nhìn cấu trúc rõ ràng.',
      why: [
        { title: 'Chuyên gia thụt lề', desc: 'Khắc phục các khoảng cách không nhất quán và đảm bảo cấu trúc YAML của bạn được căn chỉnh hoàn hảo.' },
        { title: 'Phát hiện lỗi', desc: 'Phát hiện các ký tự không hợp lệ và lồng nhau sai cách có thể làm hỏng cấu hình ứng dụng của bạn.' },
        { title: 'Tương thích JSON', desc: 'Dễ dàng hình dung các nút YAML thường rất phức tạp để đọc dưới dạng văn bản thuần túy.' },
        { title: 'Riêng tư là trên hết', desc: 'Các tệp cấu hình thường chứa thông tin nhạy cảm. Công cụ này chạy 100% cục bộ trong trình duyệt.' }
      ],
      example: {
        before: 'port: 8080\nserver:name: localhost',
        after: 'port: 8080\nserver:\n  name: localhost'
      },
      faqs: [
        { q: 'Cách định dạng YAML trực tuyến?', a: 'Dán chuỗi YAML của bạn. Công cụ sẽ xác thực cú pháp và áp dụng thụt lề tiêu chuẩn tự động.' },
        { q: 'Tại sao YAML của tôi không hợp lệ?', a: 'YAML cực kỳ nhạy cảm với khoảng trắng. Công cụ này sẽ làm nổi bật chính xác dòng có lỗi định dạng.' },
        { q: 'Tôi có thể chuyển YAML sang JSON không?', a: 'Có, sau khi định dạng, bạn có thể dễ dàng sử dụng các công cụ chuyển đổi của chúng tôi.' },
        { q: 'An toàn cho tệp cấu hình không?', a: 'Có. Không có dữ liệu nào được tải lên. Mọi thứ nằm trên máy cục bộ đảm bảo an ninh tuyệt đối.' }
      ],
      complementary: {
        id: 'yaml-json',
        name: 'YAML Converter',
        textEN: 'Need to convert to JSON instead? Try',
        textVI: 'Cần chuyển đổi sang JSON? Hãy thử'
      }
    },
    'csv-to-json': {
      what: 'CSV to JSON Converter là công cụ trực tuyến miễn phí giúp chuyển đổi dữ liệu bảng CSV của bạn thành các mảng hoặc đối tượng JSON có cấu trúc. Đây là công cụ hoàn hảo cho lập trình viên cần nhập dữ liệu bảng tính vào ứng dụng web.',
      why: [
        { title: 'Tự động nhận diện dấu phân cách', desc: 'Tự động xác định xem tệp của bạn dùng dấu phẩy, dấu chấm phẩy hay tab để phân tách.' },
        { title: 'Ánh xạ tiêu đề', desc: 'Sử dụng hàng đầu tiên làm tên thuộc tính để tạo các đối tượng JSON sạch sẽ và có ý nghĩa.' },
        { title: 'Hỗ trợ dữ liệu lớn', desc: 'Được tối ưu hóa để xử lý hàng nghìn dòng dữ liệu CSV ngay trong trình duyệt của bạn.' },
        { title: 'Xuất mảng JSON', desc: 'Tạo ra các mảng JSON tiêu chuẩn sẵn sàng để sử dụng trong JavaScript hoặc lưu trữ trong database NoSQL.' }
      ],
      example: {
        before: 'id,name\n1,Dev',
        after: '[{"id": 1, "name": "Dev"}]'
      },
      faqs: [
        { q: 'Cách chuyển CSV sang JSON trực tuyến?', a: 'Tải tệp .csv lên hoặc dán văn bản. Nhấn chuyển đổi để nhận mảng JSON đã định dạng ngay lập tức.' },
        { q: 'Nó có hỗ trợ dấu phân cách tùy chỉnh không?', a: 'Có, công cụ có thể tự nhận diện hoặc cho phép bạn chỉ định dấu chấm phẩy, dấu sổ đứng (|) hoặc tab.' },
        { q: 'Tôi có thể tải xuống kết quả không?', a: 'Có, bạn có thể sao chép JSON vào clipboard hoặc tải xuống dưới dạng tệp .json.' },
        { q: 'Dữ liệu của tôi có an toàn không?', a: 'Có. Tất cả logic chuyển đổi chạy ở phía máy khách. Dữ liệu bảng tính của bạn không bao giờ chạm tới máy chủ của chúng tôi.' }
      ],
      complementary: {
        id: 'csv-viewer',
        name: 'CSV Viewer',
        textEN: 'Just want to browse the data? Use our',
        textVI: 'Chỉ muốn xem qua dữ liệu? Hãy dùng'
      }
    },
    'csv-viewer': {
      what: 'CSV Viewer là công cụ tương tác trực tuyến miễn phí cho phép bạn duyệt, tìm kiếm và sắp xếp dữ liệu CSV trong định dạng bảng sạch sẽ. Nó xử lý các tệp lớn một cách dễ dàng.',
      why: [
        { title: 'Sắp xếp tương tác', desc: 'Nhấp vào bất kỳ tiêu đề cột nào để sắp xếp dữ liệu theo bảng chữ cái hoặc số ngay lập tức.' },
        { title: 'Tìm kiếm trực tiếp', desc: 'Tìm các hàng hoặc giá trị cụ thể trong hàng nghìn mục nhập với thanh lọc theo thời gian thực.' },
        { title: 'Giao diện sạch sẽ', desc: 'Xem dữ liệu CSV thô lộn xộn trong một bảng phân trang đẹp mắt, dễ phân tích.' },
        { title: 'Không tải dữ liệu lên', desc: 'Xử lý dựa trên trình duyệt đảm bảo rằng các tệp dữ liệu riêng tư của bạn không bao giờ được tải lên bất kỳ máy chủ nào.' }
      ],
      example: {
        before: 'id,name,role\n1,John,Admin',
        after: '[Bảng dữ liệu tương tác có sắp xếp]'
      },
      faqs: [
        { q: 'Cách xem tệp CSV trực tuyến?', a: 'Kéo và thả tệp .csv của bạn vào công cụ. Nó sẽ lập tức hiển thị dữ liệu vào một bảng tương tác.' },
        { q: 'Tôi có thể sắp xếp các cột không?', a: 'Có. Chỉ cần nhấp vào tiêu đề cột để chuyển đổi thứ tự sắp xếp tăng dần hoặc giảm dần.' },
        { q: 'Nó có hỗ trợ tệp lớn không?', a: 'Có, trình xem của chúng tôi được tối ưu hóa để xử lý các bộ dữ liệu lớn một cách mượt mà.' },
        { q: 'Có an toàn cho dữ liệu nhạy cảm không?', a: 'Có. Tất cả dữ liệu nằm trong bộ nhớ trình duyệt cục bộ của bạn và không bao giờ được truyền qua internet.' }
      ],
      complementary: {
        id: 'csv-to-excel',
        name: 'CSV to Excel',
        textEN: 'Need to edit the data instead? Use our',
        textVI: 'Cần chỉnh sửa dữ liệu? Hãy dùng bản'
      }
    },
    'random-string': {
      what: 'Random String Generator là công cụ trực tuyến miễn phí giúp tạo ra các chuỗi văn bản ngẫu nhiên, an toàn dựa trên yêu cầu riêng của bạn. Bạn có thể xác định độ dài và bảng ký tự (chữ cái, số, ký hiệu, hex) cho bất kỳ mục đích nào.',
      why: [
        { title: 'Bảng ký tự tùy chỉnh', desc: 'Bao gồm chữ hoa, chữ thường, số hoặc ký hiệu đặc biệt để đáp ứng các quy tắc về mật khẩu hoặc token.' },
        { title: 'Tạo hàng loạt', desc: 'Tạo tối đa 100 chuỗi ngẫu nhiên cùng lúc để thử nghiệm hàng loạt hoặc tạo dữ liệu mẫu cho database.' },
        { title: 'An toàn & Ngẫu nhiên', desc: 'Sử dụng thuật toán tạo số ngẫu nhiên an toàn (Web Crypto API) để đảm bảo tính bảo mật tối đa.' },
        { title: 'Không tải dữ liệu lên', desc: 'Tất cả các chuỗi được tạo cục bộ trong trình duyệt của bạn. Không có dữ liệu nào được gửi lên máy chủ.' }
      ],
      example: {
        before: 'Độ dài: 12, Ký tự: A-Z, 0-9',
        after: 'X7P2Q9L1M4K8'
      },
      faqs: [
        { q: 'Cách tạo chuỗi ngẫu nhiên?', a: 'Chọn độ dài và loại ký tự bạn muốn, sau đó nhấn "Tạo". Kết quả sẽ xuất hiện ngay lập tức.' },
        { q: 'Công cụ có an toàn để tạo mật khẩu không?', a: 'Có, nó sử dụng Web Crypto API, tiêu chuẩn trình duyệt cho việc tạo dữ liệu ngẫu nhiên có độ hỗn loạn cao.' },
        { q: 'Tôi có thể tạo một danh sách chuỗi không?', a: 'Có, bạn có thể chỉ định số lượng chuỗi cần tạo trong một lần.' },
        { q: 'Những bộ ký tự nào được hỗ trợ?', a: 'Chữ thường, chữ hoa, số, ký hiệu đặc biệt, hệ thập lục phân (Hex) và ký tự tùy chỉnh.' }
      ],
      complementary: {
        id: 'uuid-generator',
        name: 'UUID Generator',
        textEN: 'Need a standardized unique ID? Try',
        textVI: 'Cần mã định danh chuẩn? Thử'
      }
    },
    'data-faker': {
      what: 'Data Faker là công cụ trực tuyến miễn phí giúp tạo dữ liệu thử nghiệm thực tế cho phát triển phần mềm và QA. Tạo tên, email, địa chỉ và dữ liệu công ty giả để chạy thử ứng dụng hoặc tạo mẫu UI.',
      why: [
        { title: 'Dữ liệu mẫu thực tế', desc: 'Tạo ra tên người và địa chỉ trông giống như thật để phục vụ việc kiểm thử chất lượng cao.' },
        { title: 'Hỗ trợ đa ngôn ngữ', desc: 'Hỗ trợ tạo dữ liệu cho các vùng và ngôn ngữ khác nhau (ví dụ: Mỹ, Việt Nam, Anh).' },
        { title: 'Xuất dữ liệu hàng loạt', desc: 'Tạo hàng trăm dòng dữ liệu giả và xuất chúng dưới dạng tệp JSON hoặc CSV ngay lập tức.' },
        { title: 'Đảm bảo quyền riêng tư', desc: 'Không có dữ liệu nào được tải lên. Việc tạo dữ liệu diễn ra bằng các thư viện cục bộ trong trình duyệt của bạn.' }
      ],
      example: {
        before: 'Trường: Tên, Email',
        after: '{"name": "Nguyễn Văn A", "email": "nguyen.van.a@example.com"}'
      },
      faqs: [
        { q: 'Tạo dữ liệu giả là gì?', a: 'Đó là quá trình tạo dữ liệu "nháp" trông giống dữ liệu người dùng thật nhưng không chứa thông tin cá nhân thực.' },
        { q: 'Tôi có thể tạo bao nhiêu dòng?', a: 'Bạn có thể tạo tối đa 1000 dòng mỗi phiên để thử nghiệm hàng loạt.' },
        { q: 'Tôi có thể xuất định dạng nào?', a: 'Công cụ hỗ trợ xuất ra mảng JSON và định dạng CSV để dễ dàng nhập vào cơ sở dữ liệu.' },
        { q: 'Dữ liệu này có dựa trên người thật không?', a: 'Không, tất cả dữ liệu được tổng hợp ngẫu nhiên bởi thuật toán và không đại diện cho bất kỳ cá nhân nào.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Exported as JSON? Prettify it with',
        textVI: 'Đã xuất ra JSON? Hãy làm đẹp với'
      }
    },
    'nanoid-generator': {
      what: 'Nano ID / ULID Generator là công cụ trực tuyến miễn phí để tạo các mã định danh duy nhất, nhỏ gọn và an toàn cho URL. Đây là lựa chọn hiện đại, nhẹ hơn thay thế cho UUID.',
      why: [
        { title: 'Độ dài nhỏ gọn', desc: 'Nano ID nhỏ hơn UUID nhưng vẫn duy trì cùng mức độ chống trùng lặp.' },
        { title: 'An toàn cho URL', desc: 'Sử dụng bộ ký tự an toàn để dùng trong URL trang web mà không cần mã hóa.' },
        { title: 'ULID có thể sắp xếp', desc: 'Tạo mã định danh duy nhất có thể sắp xếp theo thời gian (ULID) cho các dữ liệu cần thứ tự.' },
        { title: 'Bảng chữ cái tùy chỉnh', desc: 'Xác định các ký tự của riêng bạn để tạo các ID mang thương hiệu hoặc bị giới hạn.' }
      ],
      example: {
        before: 'Nano ID chuẩn',
        after: 'V1StGXR8_Z5jdHi6B-myT'
      },
      faqs: [
        { q: 'Nano ID là gì?', a: 'Nano ID là một trình tạo ID chuỗi duy nhất, bảo mật và thân thiện với URL cho JavaScript.' },
        { q: 'ULID là gì?', a: 'ULID là mã định danh duy nhất có thể sắp xếp, bao gồm cả mốc thời gian, giúp ích cho các khóa chính trong database.' },
        { q: 'Các ID này có thực sự duy nhất không?', a: 'Có, cả Nano ID và ULID đều sử dụng các bit ngẫu nhiên có độ hỗn loạn cao để loại bỏ nguy cơ trùng lặp.' },
        { q: 'Tôi có thể tùy chỉnh độ dài Nano ID không?', a: 'Có, bạn có thể điều chỉnh độ dài để cân bằng giữa nguy cơ trùng lặp và kích thước chuỗi.' }
      ],
      complementary: {
        id: 'uuid-generator',
        name: 'UUID Generator',
        textEN: 'Need a standard 128-bit ID? Use',
        textVI: 'Cần ID 128-bit chuẩn? Hãy dùng'
      }
    },
    'favicon-generator': {
      what: 'Favicon Generator là công cụ trực tuyến linh hoạt giúp biến biểu tượng cảm xúc (emoji), văn bản thành các icon cho website. Tạo nhiều kích thước từ 16x16 đến 512x512 với nền trong suốt.',
      why: [
        { title: 'Emoji sang Favicon', desc: 'Chuyển đổi ngay lập tức emoji yêu thích của bạn thành icon website hiện đại và sạch sẽ.' },
        { title: 'Icon từ văn bản', desc: 'Tạo logo dạng chữ với font chữ, màu sắc và hình dạng nền tùy chỉnh.' },
        { title: 'Đầy đủ kích thước chuẩn', desc: 'Tự động tạo các tệp PNG cho 16x16, 32x32, 180x180 (Apple Touch) và nhiều hơn nữa.' },
        { title: 'Miễn phí & Không đăng ký', desc: 'Tải xuống trọn bộ favicon ngay lập tức mà không cần tạo tài khoản.' }
      ],
      example: {
        before: 'Đầu vào: 🚀',
        after: '[Bộ favicon: các file PNG 16px, 32px, 128px]'
      },
      faqs: [
        { q: 'Những kích thước nào được hỗ trợ?', a: 'Công cụ cung cấp tất cả các kích thước web chuẩn: 16, 32, 48, 128, 180 và 512 pixel.' },
        { q: 'Tôi có thể dùng bất kỳ emoji nào không?', a: 'Có, bất kỳ emoji nào hệ thống hỗ trợ đều có thể được hiển thị thành favicon chất lượng cao.' },
        { q: 'Nó có hỗ trợ nền trong suốt không?', a: 'Có, các icon của bạn được xuất dưới dạng tệp PNG hỗ trợ đầy đủ độ trong suốt alpha.' },
        { q: 'Làm thế nào để cài đặt favicon?', a: 'Tải các file PNG lên server và thêm các thẻ <link> được cung cấp vào phần <head> của HTML.' }
      ],
      complementary: {
        id: 'image-converter',
        name: 'Image Converter',
        textEN: 'Need to convert other assets? Use',
        textVI: 'Cần chuyển đổi tài nguyên khác? Dùng'
      }
    },
    'barcode-generator': {
      what: 'Barcode Generator là công cụ trực tuyến miễn phí để tạo mã vạch chuyên nghiệp với nhiều định dạng bao gồm EAN-13, Code128 và UPC. Phù hợp cho việc dán nhãn, kiểm kho và thử nghiệm bán lẻ.',
      why: [
        { title: 'Nhiều định dạng', desc: 'Hỗ trợ EAN-13, Code128, Code39, UPC-A và nhiều tiêu chuẩn công nghiệp khác.' },
        { title: 'Xem trước trực tiếp', desc: 'Phản hồi hình ảnh ngay khi bạn gõ ký tự để đảm bảo tuân thủ tiêu chuẩn.' },
        { title: 'Xuất ảnh độ phân giải cao', desc: 'Tải xuống hình ảnh PNG sắc nét, dễ quét ở nhiều tỷ lệ khác nhau.' },
        { title: 'Tương thích bán lẻ', desc: 'Tạo các số kiểm tra (checksum) chuẩn cho các mã đặc thù bán lẻ như EAN và UPC.' }
      ],
      example: {
        before: 'Giá trị: 123456789012',
        after: '[Ảnh mã vạch EAN-13 có thể quét được]'
      },
      faqs: [
        { q: 'Tôi nên dùng loại mã vạch nào?', a: 'Code128 tốt nhất cho dữ liệu chữ và số; EAN-13 hoặc UPC-A là tiêu chuẩn cho sản phẩm bán lẻ.' },
        { q: 'Mã vạch có quét được không?', a: 'Có, các tệp PNG được tạo ra có độ tương phản cao và tương thích với mọi máy quét vật lý và di động.' },
        { q: 'Tạo mã vạch có mất phí không?', a: 'Không, công cụ này hoàn toàn miễn phí cho việc thử nghiệm cá nhân và thương mại.' },
        { q: 'Nó có hiển thị chữ số phía dưới không?', a: 'Có, các mã vạch tiêu chuẩn sẽ tự động bao gồm các nhãn văn bản có thể đọc được bởi con người.' }
      ],
      complementary: {
        id: 'qr-generator',
        name: 'QR Generator',
        textEN: 'Need a 2D matrix code? Use our',
        textVI: 'Cần mã ma trận 2D? Hãy dùng'
      }
    },
    'national-id-generator': {
      what: 'National ID Generator là tiện ích tạo dữ liệu thử nghiệm chuyên nghiệp cho lập trình viên. Nó tạo ra các số định danh quốc gia (CCCD, SSN, NRIC) trông như thật để kiểm thử phần mềm và logic xác thực.',
      why: [
        { title: 'Xác thực Checksum', desc: 'Đảm bảo các số được tạo ra vượt qua các bài kiểm tra checksum tiêu chuẩn (như MOD-11).' },
        { title: 'Hỗ trợ toàn cầu', desc: 'Bao gồm logic cho CCCD Việt Nam, SSN Mỹ, NI Anh, NRIC Singapore và các ID châu Âu.' },
        { title: 'Dữ liệu chỉ để thử nghiệm', desc: 'Tạo ra các số khớp với định dạng nhưng không thuộc về bất kỳ cá nhân thật nào.' },
        { title: 'Tạo hàng loạt', desc: 'Nhanh chóng tạo danh sách nhiều ID thử nghiệm cho các kịch bản QA số lượng lớn.' }
      ],
      example: {
        before: 'Quốc gia: Việt Nam (CCCD)',
        after: '037095012345'
      },
      faqs: [
        { q: 'Đây có phải là số ID thật không?', a: 'Không, đây chỉ là các chuỗi ký tự hợp lệ về mặt toán học dành cho mục đích thử nghiệm phần mềm.' },
        { q: 'Những quốc gia nào được hỗ trợ?', a: 'Việt Nam, Mỹ, Anh, Singapore, Đức, Pháp và nhiều nước khác được cập nhật thường xuyên.' },
        { q: 'Tôi có thể dùng mã này để đăng ký thật không?', a: 'Tuyệt đối không. Việc sử dụng ID giả cho các đăng ký thực tế là vi phạm pháp luật và đạo đức.' },
        { q: 'Có giới hạn số lượng tạo không?', a: 'Không, bạn có thể tạo bao nhiêu ID thử nghiệm tùy thích cho quy trình phát triển của mình.' }
      ],
      complementary: {
        id: 'data-faker',
        name: 'Data Faker',
        textEN: 'Need names and addresses too? Try',
        textVI: 'Cần cả họ tên và địa chỉ? Hãy thử'
      }
    },
    'color-converter': {
      what: 'Color Converter là công cụ trực tuyến miễn phí giúp chuyển đổi mã màu giữa các định dạng HEX, RGB, HSL và HSV. Phù hợp cho lập trình viên và nhà thiết kế cần mã màu chính xác cho CSS hoặc phát triển ứng dụng di động.',
      why: [
        { title: 'Chuyển đổi tức thì', desc: 'Nhập bất kỳ định dạng nào và xem ngay các mã tương đương trong HEX, RGB, HSL và HSV.' },
        { title: 'Chọn màu trực quan', desc: 'Sử dụng trình chọn màu tích hợp để chọn màu bằng mắt và nhận dữ liệu ngay lập tức.' },
        { title: 'Hỗ trợ độ trong suốt', desc: 'Xử lý các giá trị alpha (RGBA/HSLA) để đảm bảo thiết kế web của bạn nhất quán.' },
        { title: 'Sao chép một lần nhấn', desc: 'Sao chép nhanh bất kỳ mã màu nào vào khay nhớ tạm chỉ với một cú nhấp chuột.' }
      ],
      example: {
        before: 'HEX: #3498db',
        after: 'RGB: (52, 152, 219), HSL: (204°, 70%, 53%)'
      },
      faqs: [
        { q: 'Làm thế nào để chuyển HEX sang RGB?', a: 'Dán mã HEX của bạn (ví dụ: #ffffff) vào ô nhập liệu, giá trị RGB sẽ xuất hiện ngay bên dưới.' },
        { q: 'Nó có hỗ trợ màu HSL không?', a: 'Có, công cụ cung cấp khả năng chuyển đổi hai chiều đầy đủ giữa HSL và các định dạng web chuẩn khác.' },
        { q: 'Tôi có thể chọn màu bằng mắt không?', a: 'Có, nhấp vào hộp xem trước màu để mở trình chọn màu chuẩn của hệ thống.' },
        { q: 'Việc chuyển đổi có chính xác không?', a: 'Có, công cụ sử dụng các công thức toán học tiêu chuẩn để ánh xạ không gian màu chính xác 100%.' }
      ],
      complementary: {
        id: 'css-gradient',
        name: 'CSS Gradient',
        textEN: 'Mixing colors? Try our',
        textVI: 'Đang trộn màu? Thử'
      }
    },
    'color-palette': {
      what: 'Color Palette Generator là công cụ thiết kế chuyên nghiệp để tạo các hệ màu hài hòa. Tạo các bảng màu bổ túc, bộ ba, tương đồng và đơn sắc cho dự án web tiếp theo của bạn.',
      why: [
        { title: 'Hệ màu hài hòa', desc: 'Tự động tính toán các mối quan hệ lý thuyết màu sắc để đảm bảo bảng màu luôn đẹp mắt.' },
        { title: 'Chế độ tìm cảm hứng', desc: 'Tạo ngẫu nhiên các bảng màu đẹp chỉ với một cú nhấp chuột để vượt qua sự bế tắc sáng tạo.' },
        { title: 'Sẵn sàng để xuất', desc: 'Sao chép toàn bộ danh sách mã HEX hoặc tải bảng màu về để sử dụng trong phần mềm thiết kế.' },
        { title: 'Xem trước thời gian thực', desc: 'Xem cách các màu sắc tương tác với nhau trong một bố cục trực quan trước khi sử dụng.' }
      ],
      example: {
        before: 'Màu gốc: Blue',
        after: '[Bảng màu: Xanh dương, Xanh nhạt, Xanh đậm, Cam bổ túc]'
      },
      faqs: [
        { q: 'Bảng màu bổ túc là gì?', a: 'Nó sử dụng các màu từ các phía đối diện của bánh xe màu để tạo ra độ tương phản cao và vẻ ngoài rực rỡ.' },
        { q: 'Tôi có thể lưu bảng màu của mình không?', a: 'Bạn có thể sao chép mã HEX hoặc sử dụng URL có thể chia sẻ để lưu cấu hình cụ thể.' },
        { q: 'Bao nhiêu màu được tạo ra?', a: 'Công cụ thường tạo ra hệ 4 hoặc 5 màu dựa trên màu gốc bạn đã chọn.' },
        { q: 'Công cụ này có miễn phí không?', a: 'Có, nó hoàn toàn miễn phí và không giới hạn số lượng bảng màu bạn có thể tạo.' }
      ],
      complementary: {
        id: 'color-extractor',
        name: 'Color Extractor',
        textEN: 'Got a photo? Extract colors using',
        textVI: 'Có ảnh đẹp? Hãy trích màu bằng'
      }
    },
    'css-gradient': {
      what: 'CSS Gradient Generator là bộ công cụ trực quan để tạo các dải màu linear, radial và conic. Tạo hình nền tuyệt đẹp cho website với tính năng xem trước và mã CSS sẵn sàng cho production.',
      why: [
        { title: 'Nhiều điểm dừng màu', desc: 'Thêm, di chuyển và xóa các điểm dừng màu một cách trực quan trên thanh trượt.' },
        { title: 'Đầy đủ các loại Gradient', desc: 'Hỗ trợ Linear, Radial tiêu chuẩn và cả Conic gradient hiện đại cho các hiệu ứng độc đáo.' },
        { title: 'Mã CSS tương thích', desc: 'Tạo mã CSS tuân thủ tiêu chuẩn, hoạt động tốt trên tất cả các trình duyệt hiện đại.' },
        { title: 'Kiểm soát góc & vị trí', desc: 'Tinh chỉnh hướng và điểm trung tâm của dải màu bằng các điều khiển trực quan.' }
      ],
      example: {
        before: 'Màu: Đỏ sang Xanh',
        after: 'background: linear-gradient(90deg, #ff0000 0%, #0000ff 100%);'
      },
      faqs: [
        { q: 'Làm thế nào để tạo gradient tuyến tính?', a: 'Thiết lập màu sắc và điều chỉnh thanh trượt góc để thay đổi hướng từ ngang sang dọc hoặc chéo.' },
        { q: 'Nó có hỗ trợ độ trong suốt không?', a: 'Có, bạn có thể sử dụng trình chọn màu để thiết lập độ trong suốt alpha cho bất kỳ điểm dừng màu nào.' },
        { q: 'Tôi có thể thêm nhiều màu không?', a: 'Có, nhấp vào bất kỳ đâu trên thanh gradient để thêm các điểm màu mới.' },
        { q: 'Mã CSS có tương thích không?', a: 'Có, nó tạo ra cú pháp CSS3 tiêu chuẩn được hỗ trợ bởi hơn 99% trình duyệt hiện đại.' }
      ],
      complementary: {
        id: 'css-shadow',
        name: 'CSS Shadow Generator',
        textEN: 'Adding depth? Use our',
        textVI: 'Thêm chiều sâu? Dùng'
      }
    },
    'css-shadow': {
      what: 'CSS Shadow Generator là công cụ tương tác để xây dựng các thuộc tính box-shadow và text-shadow. Điều chỉnh độ nhòe, độ lan tỏa và khoảng cách để tạo hiệu ứng chiều sâu hoàn hảo.',
      why: [
        { title: 'Xem trước trực tiếp', desc: 'Xem các hiệu ứng đổ bóng được áp dụng ngay lập tức khi bạn điều chỉnh thanh trượt.' },
        { title: 'Đổ bóng nhiều lớp', desc: 'Tạo bóng "mượt" và thực tế bằng cách xếp chồng nhiều lớp box-shadow lên nhau.' },
        { title: 'Hỗ trợ Text Shadow', desc: 'Chế độ dành riêng cho text-shadow giúp cải thiện khả năng đọc và phong cách chữ.' },
        { title: 'Mã CSS sạch', desc: 'Nhận mã CSS được định dạng hoàn hảo, bao gồm cả các giá trị RGBA cho độ trong suốt.' }
      ],
      example: {
        before: 'Nhòe: 10px, Khoảng cách: 5px',
        after: 'box-shadow: 5px 5px 10px 0px rgba(0,0,0,0.75);'
      },
      faqs: [
        { q: 'Độ lan tỏa (spread) là gì?', a: 'Spread xác định bóng mở rộng hoặc thu hẹp bao nhiêu so với kích thước của phần tử.' },
        { q: 'Tôi có thể tạo bóng bên trong không?', a: 'Có, bật tùy chọn "Inset" để chuyển bóng vào bên trong khung chứa.' },
        { q: 'Làm thế nào tạo bóng mềm mại?', a: 'Tăng bán kính nhòe (Blur) và giảm độ đậm của màu bóng để có hiệu ứng tinh tế, thực tế hơn.' },
        { q: 'Nó có hoạt động cho chữ không?', a: 'Có, công cụ có chế độ cụ thể để tạo các thuộc tính text-shadow.' }
      ],
      complementary: {
        id: 'css-gradient',
        name: 'CSS Gradient',
        textEN: 'Pair with vibrant colors from',
        textVI: 'Kết hợp với màu sắc từ'
      }
    },
    'color-extractor': {
      what: 'Color Extractor là công cụ trực tuyến miễn phí giúp xác định bảng màu chủ đạo từ bất kỳ hình ảnh nào. Chỉ cần tải ảnh lên để nhận bộ màu chuyên nghiệp cho dự án thiết kế của bạn.',
      why: [
        { title: 'Trích xuất thông minh', desc: 'Sử dụng thuật toán phân cụm tiên tiến để tìm ra những màu sắc quan trọng nhất trong ảnh.' },
        { title: 'Xem theo tỷ lệ', desc: 'Hiển thị các màu được trích xuất dưới dạng dải màu cho thấy tần suất xuất hiện của mỗi màu.' },
        { title: 'Kéo & Thả', desc: 'Tải ảnh nhanh chóng trực tiếp từ máy tính hoặc điện thoại để phân tích ngay lập tức.' },
        { title: 'Quyền riêng tư', desc: 'Mọi quá trình xử lý ảnh diễn ra cục bộ trong trình duyệt. Ảnh của bạn không bao giờ được tải lên máy chủ.' }
      ],
      example: {
        before: 'Đầu vào: Ảnh phong cảnh',
        after: '[Trích xuất: Xanh trời, Xanh cỏ, Nâu đất, Vàng lá]'
      },
      faqs: [
        { q: 'Làm thế nào để lấy màu từ ảnh?', a: 'Tải hoặc kéo ảnh vào vùng thả; bảng màu sẽ được tạo tự động.' },
        { q: 'Định dạng ảnh nào được hỗ trợ?', a: 'Công cụ hỗ trợ các định dạng JPG, PNG và WebP.' },
        { q: 'Dữ liệu của tôi có riêng tư không?', a: 'Có, việc trích màu diễn ra hoàn toàn trong trình duyệt bằng JavaScript; không có dữ liệu ảnh nào bị gửi đi.' },
        { q: 'Tôi có thể sao chép mã HEX không?', a: 'Có, mỗi màu trong bảng màu đều có nút sao chép mã HEX chỉ với một cú nhấp.' }
      ],
      complementary: {
        id: 'color-palette',
        name: 'Color Palette Generator',
        textEN: 'Need more variations? Try',
        textVI: 'Cần biến thể khác? Thử'
      }
    },
    'color-contrast': {
      what: 'Color Contrast Checker là công cụ hỗ trợ tiếp cận được thiết kế để kiểm tra tính tuân thủ WCAG 2.1. Đảm bảo màu chữ và màu nền của bạn đủ độ tương phản để dễ đọc và bao trùm.',
      why: [
        { title: 'Tuân thủ WCAG 2.1', desc: 'Kiểm tra tỷ lệ tương phản so với tiêu chuẩn AA và AAA cho cả chữ thường và chữ lớn.' },
        { title: 'Xem trước trực tiếp', desc: 'Thử nghiệm cách văn bản hiển thị trên nền trong khi bạn điều chỉnh các giá trị màu.' },
        { title: 'Chỉ báo trực quan', desc: 'Thấy ngay trạng thái "Đạt" hoặc "Không đạt" dựa trên các hướng dẫn tiếp cận quốc tế.' },
        { title: 'Điều chỉnh Hue/Saturation', desc: 'Dễ dàng tinh chỉnh màu sắc cho đến khi đạt chuẩn mà không làm mất đi màu sắc thương hiệu gốc.' }
      ],
      example: {
        before: 'Chữ: #777, Nền: #fff',
        after: 'Tỷ lệ: 4.5:1 (Đạt chuẩn AA cho chữ nhỏ)'
      },
      faqs: [
        { q: 'Tỷ lệ tương phản bao nhiêu là tốt?', a: 'WCAG AA yêu cầu 4.5:1 cho chữ thường và 3:1 cho chữ lớn. AAA yêu cầu 7:1.' },
        { q: 'Tại sao tương phản màu sắc lại quan trọng?', a: 'Nó đảm bảo nội dung có thể đọc được bởi tất cả mọi người, bao gồm người có thị lực kém hoặc mù màu.' },
        { q: 'Công cụ có theo chuẩn WCAG 2.1 không?', a: 'Có, nó sử dụng thuật toán tỷ lệ tương phản độ sáng chính thức được định nghĩa trong WCAG 2.1.' },
        { q: 'Làm sao để sửa điểm không đạt?', a: 'Hãy làm tối màu chữ hoặc làm sáng màu nền cho đến khi tỷ lệ vượt qua ngưỡng quy định.' }
      ],
      complementary: {
        id: 'color-converter',
        name: 'Color Converter',
        textEN: 'Adjust your values with',
        textVI: 'Điều chỉnh mã màu với'
      }
    },
    'number-base-converter': {
      what: 'Number Base Converter là công cụ trực tuyến miễn phí giúp chuyển đổi giá trị giữa hệ Nhị phân (Binary), Bát phân (Octal), Thập phân (Decimal) và Thập lục phân (Hexadecimal). Lý tưởng cho sinh viên CNTT và lập trình viên làm việc với dữ liệu cấp thấp.',
      why: [
        { title: 'Xem đồng thời', desc: 'Xem giá trị nhập vào được chuyển đổi sang tất cả các hệ cơ số phổ biến cùng một lúc.' },
        { title: 'Tính toán tức thì', desc: 'Giá trị cập nhật theo thời gian thực khi bạn gõ, cung cấp phản hồi ngay lập tức cho bất kỳ hệ cơ số nào.' },
        { title: 'Hỗ trợ số lớn', desc: 'Xử lý chính xác các số nguyên lớn, bao gồm các dải địa chỉ 32-bit và 64-bit tiêu chuẩn.' },
        { title: 'Sao chép nhanh', desc: 'Mỗi hệ cơ số có một nút sao chép riêng để bạn nhanh chóng lấy định dạng cần thiết cho mã nguồn.' }
      ],
      example: {
        before: 'Thập phân: 255',
        after: 'Hex: FF, Nhị phân: 11111111, Bát phân: 377'
      },
      faqs: [
        { q: 'Làm thế nào để đổi Thập phân sang Hex?', a: 'Nhập số thập phân vào ô "Decimal", và kết quả Thập lục phân sẽ xuất hiện ngay lập tức.' },
        { q: 'Những hệ cơ số nào được hỗ trợ?', a: 'Công cụ hỗ trợ các hệ phổ biến nhất trong máy tính: Nhị phân (2), Bát phân (8), Thập phân (10) và Thập lục phân (16).' },
        { q: 'Nó có xử lý số âm không?', a: 'Công cụ này hiện tối ưu cho các số nguyên không âm thường dùng trong cấu trúc dữ liệu.' },
        { q: 'Có giới hạn về kích thước số không?', a: 'Nó hỗ trợ các số nguyên an toàn lớn trong giới hạn của các công cụ JavaScript tiêu chuẩn.' }
      ],
      complementary: {
        id: 'byte-converter',
        name: 'Byte Converter',
        textEN: 'Measuring data sizes? Try',
        textVI: 'Đo lường dung lượng? Thử'
      }
    },
    'byte-converter': {
      what: 'Byte / Size Converter là công cụ trực tuyến miễn phí để chuyển đổi các đơn vị lưu trữ kỹ thuật số. Chuyển đổi giữa Byte, Kilobyte (KB), Megabyte (MB), Gigabyte (GB) và Terabyte (TB) theo cả tiêu chuẩn Thập phân và Nhị phân.',
      why: [
        { title: 'Đơn vị Thập phân & Nhị phân', desc: 'Hỗ trợ cả KB tiêu chuẩn (1000 byte) và KiB nhị phân (1024 byte) để đo lường máy chủ chính xác.' },
        { title: 'Chuyển đổi hai chiều', desc: 'Chuyển từ đơn vị nhỏ lên đơn vị lớn, hoặc chia nhỏ các kích thước lưu trữ lớn thành byte.' },
        { title: 'Độ chính xác thập phân', desc: 'Điều chỉnh độ chính xác của số thập phân để xem kích thước chính xác khi làm việc với truyền tải dữ liệu lớn.' },
        { title: 'Không cần làm mới trang', desc: 'Mọi tính toán diễn ra ngay lập tức trong trình duyệt khi bạn nhập liệu.' }
      ],
      example: {
        before: '1 GB',
        after: '1,024 MB (Nhị phân) hoặc 1,000 MB (Thập phân)'
      },
      faqs: [
        { q: 'Sự khác biệt giữa MB và MiB là gì?', a: 'MB (Megabyte) thường dùng cơ số 10 (1000^2), trong khi MiB (Mebibyte) dùng cơ số 2 (1024^2).' },
        { q: 'Có bao nhiêu byte trong một Megabyte?', a: 'Có chính xác 1.000.000 byte trong Megabyte thập phân và 1.048.576 byte trong Megabyte nhị phân.' },
        { q: 'Tôi có thể chuyển đổi Terabyte không?', a: 'Có, công cụ hỗ trợ các đơn vị lên đến Terabyte (TB) và Tebibyte (TiB).' },
        { q: 'Nó có hữu ích cho kích thước tệp không?', a: 'Hoàn toàn có, nó giúp bạn hiểu cách các hệ điều hành khác nhau báo cáo kích thước tệp và ổ đĩa.' }
      ],
      complementary: {
        id: 'number-base-converter',
        name: 'Base Converter',
        textEN: 'Working with bits? Use',
        textVI: 'Làm việc với bit? Dùng'
      }
    },
    'unit-converter': {
      what: 'Unit Converter là tiện ích trực tuyến toàn diện để chuyển đổi các đơn vị đo lường. Chuyển đổi giữa các đơn vị Chiều dài, Trọng lượng, Nhiệt độ, Diện tích và Tốc độ với giao diện sạch sẽ, dễ sử dụng.',
      why: [
        { title: 'Nhiều danh mục', desc: 'Một công cụ duy nhất cho tất cả các đơn vị vật lý phổ biến bao gồm cả hệ mét và hệ Anh-Mỹ.' },
        { title: 'Kết quả trực tiếp', desc: 'Xem giá trị chuyển đổi cho tất cả các đơn vị trong cùng một danh mục đồng thời.' },
        { title: 'Giao diện hiện đại', desc: 'Bố cục dạng thẻ sạch sẽ, hoạt động hoàn hảo trên cả thiết bị để bàn và di động.' },
        { title: 'Công thức chính xác', desc: 'Sử dụng các hằng số chuyển đổi khoa học tiêu chuẩn để mang lại kết quả tin cậy và chính xác.' }
      ],
      example: {
        before: '100 độ C',
        after: '212 độ F, 373.15 độ K'
      },
      faqs: [
        { q: 'Làm thế nào để đổi mét sang feet?', a: 'Chọn danh mục "Chiều dài" và nhập số mét; giá trị tương ứng trong feet, inch sẽ hiện ra ngay.' },
        { q: 'Những đơn vị nào được hỗ trợ?', a: 'Hàng chục đơn vị thuộc Chiều dài, Trọng lượng, Nhiệt độ, Diện tích, Tốc độ và Thể tích.' },
        { q: 'Nó có hỗ trợ độ F không?', a: 'Có, nó cung cấp khả năng chuyển đổi đầy đủ giữa Celsius, Fahrenheit và Kelvin.' },
        { q: 'Nó có thân thiện với thiết bị di động không?', a: 'Có, thiết kế phản hồi tốt và dễ sử dụng trên bất kỳ smartphone hay máy tính bảng nào.' }
      ],
      complementary: {
        id: 'aspect-ratio',
        name: 'Aspect Ratio',
        textEN: 'Converting screen sizes? Try',
        textVI: 'Chuyển đổi kích thước màn hình? Thử'
      }
    },
    'math-evaluator': {
      what: 'Math Evaluator là trình tính toán trực tuyến chuyên nghiệp hỗ trợ các biểu thức phức tạp. Sử dụng biến số, hàm lượng giác và công thức đại số với tính năng tính toán thời gian thực.',
      why: [
        { title: 'Biểu thức phức tạp', desc: 'Tính toán các công thức nâng cao với các dấu ngoặc lồng nhau và nhiều toán tử.' },
        { title: 'Hàm khoa học', desc: 'Hỗ trợ sin, cos, tan, log, sqrt và các hàm toán học tiêu chuẩn khác.' },
        { title: 'Hỗ trợ biến số', desc: 'Định nghĩa các biến như x = 10 và sử dụng chúng trong các phương trình để tính toán đơn giản hơn.' },
        { title: 'Nhật ký lịch sử', desc: 'Theo dõi các phép tính và kết quả trước đó của bạn trong một chế độ xem cuộn sạch sẽ.' }
      ],
      example: {
        before: 'sin(45 deg) * sqrt(16)',
        after: '2.8284...'
      },
      faqs: [
        { q: 'Làm thế nào để sử dụng biến số?', a: 'Gõ "x = 5" trên một dòng, sau đó sử dụng "x" trong các công thức của bạn (ví dụ: "x * 2").' },
        { q: 'Nó có hỗ trợ độ (degree) không?', a: 'Có, bạn có thể chỉ định các đơn vị như "deg" cho các hàm lượng giác.' },
        { q: 'Cái này có tốt hơn máy tính tiêu chuẩn không?', a: 'Có, vì bạn có thể xem và chỉnh sửa toàn bộ công thức cùng một lúc.' },
        { q: 'Tôi có thể dùng hằng số khoa học không?', a: 'Có, các hằng số tiêu chuẩn như PI và E được định nghĩa sẵn để dễ dàng sử dụng.' }
      ],
      complementary: {
        id: 'number-formatter',
        name: 'Number Formatter',
        textEN: 'Displaying the result? Use',
        textVI: 'Hiển thị kết quả? Dùng'
      }
    },
    'aspect-ratio': {
      what: 'Aspect Ratio Calculator là công cụ thiết yếu cho nhiếp ảnh gia, người làm video và lập trình viên web. Tính toán các kích thước còn thiếu và duy trì tỷ lệ hoàn hảo cho 16:9, 4:3 và các tỷ lệ tùy chỉnh.',
      why: [
        { title: 'Giải phương trình kích thước', desc: 'Nhập chiều rộng và chiều cao để tìm tỷ lệ, hoặc nhập tỷ lệ và một chiều để tìm chiều còn lại.' },
        { title: 'Các mẫu có sẵn', desc: 'Nhanh chóng chọn các tỷ lệ chuẩn như 16:9 (Video HD), 4:3 (SD), 1:1 (Vuông) hoặc 21:9 (Ultrawide).' },
        { title: 'Xem trước trực tiếp', desc: 'Xem một khung hình trực quan đại diện cho tỷ lệ khi bạn điều chỉnh các con số.' },
        { title: 'Không lưu dữ liệu', desc: 'Mọi tính toán thực hiện cục bộ, đảm bảo dữ liệu kích thước riêng tư của bạn luôn an toàn.' }
      ],
      example: {
        before: 'Rộng: 1920, Cao: 1080',
        after: 'Tỷ lệ: 16:9'
      },
      faqs: [
        { q: 'Làm thế nào để tính kích thước còn thiếu?', a: 'Khóa tỷ lệ, nhập chiều rộng mới, và chiều cao sẽ tự động cập nhật để duy trì tỷ lệ.' },
        { q: 'Tỷ lệ 16:9 là gì?', a: 'Đó là định dạng màn hình rộng tiêu chuẩn cho hầu hết TV hiện đại, màn hình máy tính và video trực tuyến.' },
        { q: 'Tôi có thể dùng tỷ lệ tùy chỉnh không?', a: 'Có, bạn có thể nhập bất kỳ giá trị chiều rộng và chiều cao nào để tìm tỷ lệ tùy chỉnh duy nhất.' },
        { q: 'Cái này có hữu ích cho CSS không?', a: 'Có, nó giúp bạn tính toán tỷ lệ phần trăm padding-top chính xác cho các khung chứa video phản hồi (responsive).' }
      ],
      complementary: {
        id: 'unit-converter',
        name: 'Unit Converter',
        textEN: 'Need to convert pixels? Use our',
        textVI: 'Cần chuyển đổi pixel? Hãy dùng'
      }
    },
    'number-formatter': {
      what: 'Number Formatter là công cụ trực tuyến mạnh mẽ để định dạng các số thô theo tiêu chuẩn quốc tế. Lý tưởng để tạo ra các hiển thị nội địa hóa cho tiền tệ, phần trăm và ký hiệu khoa học.',
      why: [
        { title: 'Hỗ trợ đa ngôn ngữ', desc: 'Định dạng số dựa trên các quy tắc vùng miền cụ thể (ví dụ: Mỹ dùng dấu chấm, EU dùng dấu phẩy).' },
        { title: 'Hỗ trợ tiền tệ', desc: 'Dễ dàng thêm ký hiệu tiền tệ và số thập phân chính xác cho USD, EUR, VND và nhiều loại tiền khác.' },
        { title: 'Ký hiệu khoa học', desc: 'Chuyển đổi các số cực lớn hoặc cực nhỏ thành các định dạng khoa học hoặc rút gọn dễ đọc.' },
        { title: 'Xem trước thời gian thực', desc: 'Xem ngay các tùy chọn định dạng của bạn sẽ trông như thế nào đối với người dùng ở các nơi khác trên thế giới.' }
      ],
      example: {
        before: '1234567.89 (Mỹ)',
        after: '$1,234,567.89'
      },
      faqs: [
        { q: 'Làm thế nào để định dạng tiền tệ?', a: 'Nhập số, chọn kiểu "Currency" và chọn mã tiền tệ mục tiêu (như VND).' },
        { q: 'Nó có hỗ trợ định dạng Tiếng Việt không?', a: 'Có, nó sử dụng đúng dấu chấm để ngăn cách hàng nghìn theo tiêu chuẩn Việt Nam.' },
        { q: 'Định dạng rút gọn là gì?', a: 'Nó biến các số lớn thành nhãn dễ đọc như "1.2M" hoặc "5.3B" (Thường thấy trên mạng xã hội).' },
        { q: 'Có tương đương với API không?', a: 'Công cụ này là bản thực thi trực quan của API Intl.NumberFormat tiêu chuẩn trong JavaScript.' }
      ],
      complementary: {
        id: 'math-evaluator',
        name: 'Math Evaluator',
        textEN: 'Need to compute first? Try our',
        textVI: 'Cần tính toán trước? Thử'
      }
    },
    'unix-timestamp': {
      what: 'Unix Timestamp Converter là công cụ trực tuyến miễn phí giúp chuyển đổi mã thời gian Unix/Epoch sang ngày tháng dễ đọc và ngược lại. Cần thiết cho lập trình viên khi kiểm tra dữ liệu database hoặc phản hồi từ API.',
      why: [
        { title: 'Chuyển đổi hai chiều', desc: 'Chuyển từ một dãy số dài sang ngày giờ cụ thể, hoặc chuyển chuỗi ngày tháng về dạng giây/mili giây.' },
        { title: 'Hỗ trợ Sub-second', desc: 'Xử lý cả đơn vị giây (Unix chuẩn) và mili giây (JavaScript/Java) để đảm bảo thời gian chính xác.' },
        { title: 'Chuẩn ISO 8601', desc: 'Hỗ trợ các chuỗi ISO 8601, chuyển đổi UTC và tự động nhận diện múi giờ địa phương.' },
        { title: 'Thời gian hiện tại', desc: 'Luôn hiển thị mã Unix và ngày giờ hiện tại, cập nhật từng giây một.' }
      ],
      example: {
        before: '1711728000',
        after: 'Thứ Sáu, 29 Tháng 3, 2024 (UTC)'
      },
      faqs: [
        { q: 'Unix timestamp là gì?', a: 'Đó là số giây đã trôi qua kể từ ngày 1 tháng 1 năm 1970 (Unix Epoch), không tính giây nhuận.' },
        { q: 'Nó tính bằng giây hay mili giây?', a: 'Công cụ xử lý cả hai. Thông thường, số có 10 chữ số là giây và 13 chữ số là mili giây.' },
        { q: 'Làm sao lấy mã thời gian hiện tại?', a: 'Công cụ hiển thị mã "Now" theo thời gian thực một cách tự động khi bạn tải trang.' },
        { q: 'Nó có xử lý múi giờ không?', a: 'Có, kết quả được hiển thị ở cả giờ quốc tế (UTC) và múi giờ địa phương trên máy tính của bạn.' }
      ],
      complementary: {
        id: 'timezone-converter',
        name: 'Timezone Converter',
        textEN: 'Dealing with world time? Try',
        textVI: 'Làm việc với giờ thế giới? Thử'
      }
    },
    'cron-parser': {
      what: 'Cron Expression Parser là công cụ trực quan giúp dịch các biểu thức Cron phức tạp sang ngôn ngữ tự nhiên dễ hiểu. Phù hợp cho quản trị viên hệ thống và lập trình viên khi thiết lập các tác vụ chạy ngầm.',
      why: [
        { title: 'Dịch sang ngôn ngữ người', desc: 'Giải thích ngay lập tức ý nghĩa của từng phần trong biểu thức cron (* * * * *).' },
        { title: 'Lịch chạy tương lai', desc: 'Tính toán và hiển thị 5 đến 10 thời điểm thực thi tiếp theo dựa trên biểu thức của bạn.' },
        { title: 'Kiểm tra cú pháp', desc: 'Thử nghiệm cú pháp cron an toàn trước khi thêm vào crontab hoặc các bộ lập lịch đám mây.' },
        { title: 'Hỗ trợ Macro', desc: 'Xử lý các macro phổ biến như @hourly, @daily và @weekly để thiết lập nhanh.' }
      ],
      example: {
        before: '0 0 * * 1',
        after: '"Vào lúc 00:00 mỗi Thứ Hai"'
      },
      faqs: [
        { q: 'Biểu thức cron là gì?', a: 'Là một chuỗi gồm 5 hoặc 6 trường đại diện cho một lịch trình để chạy các lệnh hoặc tác vụ.' },
        { q: 'Cách đọc cron có 5 trường?', a: 'Sắp xếp theo thứ tự: Phút, Giờ, Ngày trong tháng, Tháng, và Ngày trong tuần.' },
        { q: 'Nó có hỗ trợ Quartz hay Jenkins không?', a: 'Công cụ tập trung vào cú pháp cron chuẩn của Unix/Linux, là nền tảng cho hầu hết các hệ thống.' },
        { q: 'Tôi có xem được lần chạy tới không?', a: 'Có, công cụ tạo danh sách các ngày thực thi sắp tới để bạn kiểm tra lịch trình.' }
      ],
      complementary: {
        id: 'unix-timestamp',
        name: 'Unix Timestamp',
        textEN: 'Need timestamps for logs? Use',
        textVI: 'Cần mã thời gian cho log? Dùng'
      }
    },
    'timezone-converter': {
      what: 'Timezone Converter là tiện ích đồng hồ thế giới chuyên nghiệp. Dễ dàng chuyển đổi giờ họp giữa các thành phố và khu vực khác nhau, tự động tính toán giờ mùa hè (DST).',
      why: [
        { title: 'Tìm kiếm thành phố toàn cầu', desc: 'Nhanh chóng tìm thấy bất kỳ thành phố hay quốc gia nào bằng cơ sở dữ liệu múi giờ IANA đầy đủ.' },
        { title: 'Nhận biết giờ mùa hè', desc: 'Tự động tính toán thay đổi độ lệch giờ cho các khu vực áp dụng quy ước giờ mùa hè.' },
        { title: 'So sánh trực quan', desc: 'Thêm nhiều thành phố vào danh sách so sánh để xem sự khác biệt múi giờ trên cùng một hàng.' },
        { title: 'Lên kế hoạch họp', desc: 'Trượt thanh thời gian để tìm "giờ vàng" phù hợp cho các nhóm làm việc từ xa trên khắp thế giới.' }
      ],
      example: {
        before: '10 AM New York',
        after: '3 PM London / 9 PM Hồ Chí Minh'
      },
      faqs: [
        { q: 'Giờ UTC là gì?', a: 'Giờ quốc tế phối hợp (UTC) là tiêu chuẩn thời gian chính mà thế giới sử dụng để điều chỉnh đồng hồ.' },
        { q: 'Nó có xử lý giờ mùa hè không?', a: 'Có, công cụ sử dụng cơ sở dữ liệu mới nhất để đảm bảo các chuyển đổi DST được tính toán chính xác.' },
        { q: 'Tôi có thể thêm nhiều thành phố không?', a: 'Có, bạn có thể thêm và xóa nhiều địa điểm để so sánh giờ giữa các vùng khác nhau.' },
        { q: 'Nó có chạy tốt trên di động không?', a: 'Có, giao diện được tối ưu để bạn có thể kiểm tra giờ thế giới ngay cả khi đang di chuyển.' }
      ],
      complementary: {
        id: 'date-calculator',
        name: 'Date Calculator',
        textEN: 'Planning a duration? Try',
        textVI: 'Lên lịch khoảng thời gian? Thử'
      }
    },
    'date-calculator': {
      what: 'Date Calculator là công cụ chính xác để tìm sự khác biệt giữa hai ngày hoặc tính toán một ngày trong tương lai/quá khứ bằng cách cộng hoặc trừ ngày, tuần, hoặc tháng.',
      why: [
        { title: 'Khám phá khoảng thời gian', desc: 'Tìm chính xác số ngày, giờ hoặc phút giữa hai thời điểm cụ thể.' },
        { title: 'Chế độ Cộng/Trừ', desc: 'Nhanh chóng tìm xem ngày nào sẽ là "90 ngày kể từ hôm nay" hoặc "3 tuần trước".' },
        { title: 'Chỉ tính ngày làm việc', desc: 'Tùy chọn loại trừ cuối tuần và ngày lễ để tính toán thời hạn công việc và lộ trình dự án.' },
        { title: 'Hỗ trợ toàn diện', desc: 'Hoạt động với tất cả các ngày trong quá khứ và tương lai, cung cấp phép toán tin cậy cho việc lập kế hoạch.' }
      ],
      example: {
        before: 'Hôm nay + 45 ngày',
        after: 'Ngày: [Ngày tương lai], Tổng: 45 ngày'
      },
      faqs: [
        { q: 'Còn bao nhiêu ngày nữa đến một ngày cụ thể?', a: 'Nhập "Hôm nay" là ngày bắt đầu và ngày mục tiêu của bạn để xem số ngày đếm ngược.' },
        { q: 'Tôi có thể cộng thêm năm không?', a: 'Có, công cụ cho phép bạn cộng hoặc trừ số lượng năm, tháng, tuần và ngày tùy ý.' },
        { q: 'Nó có tính ngày làm việc không?', a: 'Công cụ cung cấp tổng số ngày; bạn có thể trừ đi các ngày cuối tuần để tính ngày làm việc.' },
        { q: 'Tính toán có chính xác cho năm nhuận không?', a: 'Có, bộ máy tính toán xử lý đầy đủ các năm nhuận và sự khác biệt về số ngày trong tháng.' }
      ],
      complementary: {
        id: 'unix-timestamp',
        name: 'Unix Timestamp',
        textEN: 'Convert results to',
        textVI: 'Chuyển kết quả sang'
      }
    },
    'string-case-converter': {
      what: 'String Case Converter là công cụ trực tuyến miễn phí giúp chuyển đổi văn bản sang các định dạng chữ thường dùng trong lập trình. Dễ dàng chuyển đổi giữa camelCase, snake_case, PascalCase, kebab-case và văn bản thông thường mà không cần sửa thủ công.',
      why: [
        { title: 'Nhiều định dạng', desc: 'Chuyển đổi tức thì bất kỳ đoạn văn bản nào thành các định dạng mã chuẩn như UPPER_SNAKE_CASE hoặc Title Case.' },
        { title: 'Xử lý hàng loạt', desc: 'Dán nhiều dòng hoặc đoạn văn để chuyển đổi tất cả cùng một lúc theo thời gian thực.' },
        { title: 'Phân tích thông minh', desc: 'Tự động nhận diện ranh giới từ ngay cả trong văn bản nguồn lộn xộn hoặc không có định dạng.' },
        { title: 'Dành cho lập trình viên', desc: 'Hoàn hảo để đặt tên biến, tạo URL slug hoặc chuẩn hóa tên cột cơ sở dữ liệu.' }
      ],
      example: {
        before: 'hello world string',
        after: 'helloWorldString (camelCase) / hello_world_string (snake_case)'
      },
      faqs: [
        { q: 'camelCase là gì?', a: 'Là quy ước đặt tên trong đó chữ cái đầu tiên của mỗi từ (trừ từ đầu tiên) được viết hoa, ví dụ "myVariableName".' },
        { q: 'kebab-case được dùng để làm gì?', a: 'Nó sử dụng dấu gạch ngang để phân tách các từ (ví dụ "my-url-slug") và là chuẩn cho URL và thuộc tính HTML.' },
        { q: 'Nó có xử lý được ký tự đặc biệt không?', a: 'Có, các ký tự đặc biệt và dấu câu thường được loại bỏ để tạo ra các định danh lập trình sạch sẽ.' },
        { q: 'Công cụ có miễn phí không?', a: 'Có, nó hoàn toàn miễn phí và xử lý mọi văn bản ngay lập tức trong trình duyệt của bạn.' }
      ],
      complementary: {
        id: 'slug-generator',
        name: 'Slug Generator',
        textEN: 'Need URL-specific formatting? Try',
        textVI: 'Cần định dạng riêng cho URL? Thử'
      }
    },
    'text-diff': {
      what: 'Text Diff là công cụ tương tác trực tuyến giúp tìm ra sự khác biệt giữa hai khối văn bản. So sánh nhanh các đoạn mã, tệp cấu hình hoặc tài liệu với khả năng highlight song song hoặc trực tiếp.',
      why: [
        { title: 'Highlight trực quan', desc: 'Làm nổi bật rõ ràng các phần thêm, xóa và sửa đổi với cú pháp phân loại bằng màu sắc.' },
        { title: 'Song song & Trực tiếp', desc: 'Chuyển đổi giữa chế độ xem chia đôi cho màn hình rộng hoặc chế độ xem trực tiếp (inline) để đọc nhanh.' },
        { title: 'Khớp từng dòng', desc: 'Căn chỉnh chính xác các dòng văn bản liên quan để bạn có thể phát hiện ngay sự thay đổi bối cảnh.' },
        { title: 'Xử lý cục bộ', desc: 'Mọi logic so sánh chạy trên trình duyệt của bạn, giữ cho các tài liệu nhạy cảm được bảo mật.' }
      ],
      example: {
        before: 'Văn bản gốc vs Văn bản đã sửa',
        after: '[Làm nổi bật các từ cụ thể bị thay đổi giữa hai phiên bản]'
      },
      faqs: [
        { q: 'Text diff hoạt động thế nào?', a: 'Nó sử dụng thuật toán tìm chuỗi con chung dài nhất, tô sáng những gì được thêm hoặc bớt.' },
        { q: 'Tôi có thể so sánh mã nguồn không?', a: 'Có, công cụ hoạt động cực tốt để tìm các lỗi chính tả nhỏ hoặc thay đổi logic trong source code.' },
        { q: 'Dữ liệu của tôi có bị lưu không?', a: 'Không, quá trình so sánh hoàn toàn ở phía client. Văn bản của bạn không bao giờ rời khỏi máy tính.' },
        { q: 'Nó có hỗ trợ tệp lớn không?', a: 'Hệ thống tối ưu cho các khối văn bản lớn, mặc dù bộ dữ liệu khổng lồ có thể làm chậm trình duyệt.' }
      ],
      complementary: {
        id: 'string-inspector',
        name: 'String Inspector',
        textEN: 'Analyze text details with',
        textVI: 'Phân tích chi tiết văn bản với'
      }
    },
    'lorem-ipsum': {
      what: 'Lorem Ipsum Generator là công cụ nhanh dành cho nhà thiết kế và lập trình viên để tạo văn bản giữ chỗ (placeholder). Tạo độ dài tùy chỉnh của văn bản tiếng Latinh giả để kiểm tra bố cục và kiểu chữ.',
      why: [
        { title: 'Độ dài tùy chỉnh', desc: 'Tạo cụ thể theo số lượng đoạn văn, câu hoặc số từ riêng lẻ.' },
        { title: 'Cấu trúc cổ điển', desc: 'Sử dụng các cụm từ tiếng Latinh giả chuẩn trông giống hệt như văn bản viết tay thực tế.' },
        { title: 'Sao chép tức thì', desc: 'Chức năng sao chép một cú nhấp chuột giúp dán văn bản trực tiếp vào thiết kế.' },
        { title: 'Thẻ HTML', desc: 'Tùy chọn bọc các đoạn văn đã tạo trong thẻ <p> chuẩn để phát triển web dễ dàng hơn.' }
      ],
      example: {
        before: 'Loại: Câu, Số lượng: 2',
        after: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.'
      },
      faqs: [
        { q: 'Lorem Ipsum nghĩa là gì?', a: 'Đây là văn bản Latinh bị xáo trộn, bắt nguồn từ tác phẩm triết học của Cicero, dùng làm văn bản giữ chỗ phổ biến.' },
        { q: 'Tại sao dùng văn bản giữ chỗ?', a: 'Nó cho phép designer tập trung vào bố cục trực quan và typography mà không bị phân tâm bởi nội dung có thể đọc được.' },
        { q: 'Có thể tạo định dạng HTML không?', a: 'Có, bạn có thể bật tùy chọn tự động thêm các thẻ đoạn văn để chèn nhanh vào HTML.' },
        { q: 'Giới hạn độ dài là bao nhiêu?', a: 'Bạn có thể tạo hàng ngàn từ ngay lập tức, dư sức để lấp đầy mọi wireframe website.' }
      ],
      complementary: {
        id: 'html-minifier',
        name: 'HTML Minifier',
        textEN: 'Ready for production? Compress with',
        textVI: 'Sẵn sàng cho production? Nén với'
      }
    },
    'string-inspector': {
      what: 'String Inspector là công cụ phân tích đặc tính của văn bản trực tuyến. Nhận ngay các thống kê như độ dài, số từ, tần suất ký tự và kích thước byte cho bất kỳ đoạn văn bản nào.',
      why: [
        { title: 'Phân tích sâu', desc: 'Tính toán độ dài, số từ và tập hợp ký tự duy nhất theo thời gian thực.' },
        { title: 'Đo lường dung lượng Byte', desc: 'Xác định chính xác kích thước lưu trữ tính bằng byte, bao gồm cả ký tự đa byte UTF-8.' },
        { title: 'Biểu đồ tần suất', desc: 'Hiển thị chi tiết mức độ xuất hiện thường xuyên của các ký tự hoặc ký hiệu cụ thể.' },
        { title: 'Phát hiện khoảng trắng', desc: 'Giúp nhận diện các khoảng trắng ẩn hoặc ký tự vô hình gây lỗi trong quá trình phân tích (parsing).' }
      ],
      example: {
        before: 'Đầu vào: "Hello World 🌍"',
        after: 'Dài: 13 ký tự, Từ: 2, Dung lượng: 16 bytes'
      },
      faqs: [
        { q: 'Tại sao một ký tự có nhiều byte?', a: 'Chữ cái tiếng Anh chỉ 1 byte trong UTF-8, nhưng emoji và ngôn ngữ không thuộc hệ Latin h có thể tốn tới 4 byte.' },
        { q: 'Cái này có ích cho SEO không?', a: 'Có, nó giúp xác minh chính xác độ dài thẻ title và meta description cho việc tối ưu công cụ tìm kiếm.' },
        { q: 'Có phát hiện khoảng trắng ẩn không?', a: 'Có, tính toán nghiêm ngặt về độ dài và byte sẽ làm lộ ra các khoảng trắng thừa hoặc zero-width space.' },
        { q: 'Phân tích văn bản có an toàn không?', a: 'Chắc chắn, mọi số liệu được tính toán qua JavaScript trên máy bạn mà không qua server.' }
      ],
      complementary: {
        id: 'string-escape',
        name: 'String Escape',
        textEN: 'Cleaning up text? Try',
        textVI: 'Đang dọn dẹp văn bản? Thử'
      }
    },
    'regex-tester': {
      what: 'Regex Tester là công cụ tương tác để viết các Biểu thức chính quy (Regular Expressions). Xây dựng, thử nghiệm và gỡ lỗi các mẫu tìm kiếm phức tạp với khả năng highlight trực tiếp trên đoạn text mẫu.',
      why: [
        { title: 'Khớp lệnh trực tiếp', desc: 'Thấy ngay kết quả regex được làm nổi bật bên trong văn bản thử nghiệm của bạn.' },
        { title: 'Bảng tham khảo (Cheat Sheet)', desc: 'Tích hợp sẵn hướng dẫn nhanh về cú pháp, định lượng (quantifiers), và ký tự neo (anchors).' },
        { title: 'Điều khiển Cờ (Flags)', desc: 'Dễ dàng bật/tắt các chế độ global, case-insensitive (không phân biệt hoa thường), và multi-line.' },
        { title: 'Trích xuất nhóm', desc: 'Xác định và cách ly các capture groups (nhóm chụp) cụ thể trực tiếp từ các kết quả khớp.' }
      ],
      example: {
        before: 'Mẫu: \\d{3}-\\d{4}',
        after: 'Khớp: [555-1234, 867-5309]'
      },
      faqs: [
        { q: 'Biểu thức chính quy (Regex) là gì?', a: 'Là một chuỗi ký tự dùng để xác định mẫu tìm kiếm, được ứng dụng rộng rãi trong khớp chuỗi và xác thực dữ liệu.' },
        { q: 'Các cờ (flags) hoạt động thế nào?', a: '"g" trả về mọi kết quả thay vì dừng ở kết quả đầu; "i" bỏ qua phân biệt hoa thường.' },
        { q: 'Capture groups là gì?', a: 'Bằng cách bọc mẫu trong ngoặc đơn ( ), bạn có thể tách biệt chính xác một phần văn bản vừa khớp lệnh.' },
        { q: 'Có hỗ trợ lookaheads không?', a: 'Có, công cụ hoàn toàn hỗ trợ các chức năng JavaScript regex chuyên sâu bao gồm cả lookaheads/lookbehinds.' }
      ],
      complementary: {
        id: 'string-case-converter',
        name: 'Case Converter',
        textEN: 'Formatting matched variables? Try',
        textVI: 'Định dạng các biến đã khớp? Thử'
      }
    },
    'slug-generator': {
      what: 'Slug Generator là công cụ tạo URL thân thiện (chuỗi không dấu) từ bất kỳ văn bản nào. Tự động chuyển tên bài blog hoặc tên sản phẩm thành các permalink gọn gàng và tối ưu SEO.',
      why: [
        { title: 'Tối ưu hóa SEO', desc: 'Loại bỏ ký tự đặc biệt và khoảng trắng để tạo đường dẫn URL sạch sẽ, dễ lập chỉ mục.' },
        { title: 'Loại bỏ từ vô nghĩa', desc: 'Tùy chọn xóa các từ nối phổ biến (a, an, the) để làm URL ngắn gọn và súc tích hơn.' },
        { title: 'Ký tự phân cách tùy chọn', desc: 'Tạo slug bằng dấu gạch ngang (tiêu chuẩn web) hoặc dấu gạch dưới tùy theo framework bạn dùng.' },
        { title: 'Đầu ra trực tiếp', desc: 'Dán một danh sách các tiêu đề và xuất ngay các URL slugs chuẩn để triển khai web.' }
      ],
      example: {
        before: 'Làm thế nào để học JavaScript năm 2024!',
        after: 'lam-the-nao-de-hoc-javascript-nam-2024'
      },
      faqs: [
        { q: 'URL slug là gì?', a: 'Là phần cuối cùng của URL, thường là đường dẫn chứa tiêu đề bài viết để dễ đọc và dễ tìm kiếm.' },
        { q: 'Tại sao dấu gạch ngang tốt hơn gạch dưới?', a: 'Google xem dấu gạch ngang là dấu cách từ, tốt hơn cho SEO. Dấu gạch dưới bị hiểu là nối liền từ.' },
        { q: 'Cái này có xử lý dấu tiếng Việt không?', a: 'Có, nó sẽ chuyển tự các ký tự có dấu (như "é" thành "e") để tương thích với toàn bộ các nền tảng.' },
        { q: 'Tôi có thể dùng cho nhiều tiêu đề không?', a: 'Được, hãy dán nhiều dòng văn bản và nhận về danh sách các slug sạch trong tích tắc.' }
      ],
      complementary: {
        id: 'string-case-converter',
        name: 'Case Converter',
        textEN: 'Need traditional variable formats? Use',
        textVI: 'Cần định dạng biến truyền thống? Dùng'
      }
    }
  }
};
