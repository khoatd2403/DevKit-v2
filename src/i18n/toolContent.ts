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
    'regex-tester': {
      what: 'A Regex Tester is an interactive tool for writing and testing Regular Expressions. It provides real-time matching and highlighting to help you build complex patterns for data extraction and validation.',
      why: [
        { title: 'Real-time Testing', desc: 'See your regex matches instantly as you type.' },
        { title: 'Syntax Highlighting', desc: 'Easily distinguish between groups, quantifiers, and anchor characters.' },
        { title: 'Productivity', desc: 'Debug patterns in seconds instead of trial-and-error in your code.' }
      ],
      example: {
        before: 'pattern: \\d{3}',
        after: 'Matches: 123, 456...'
      },
      faqs: [
        { q: 'What are flags?', a: 'Flags change how the regex behaves. "g" searches for all matches, "i" ignores case, and "m" enables multi-line mode.' },
        { q: 'Is my regex private?', a: 'Yes. All regex processing happens in your browser.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Need to extract data from a JSON? Use our',
        textVI: 'Cần trích xuất dữ liệu từ JSON? Hãy dùng'
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
    'html-to-markdown': {
      what: 'An HTML to Markdown converter allows you to quickly convert HTML code into clean, readable Markdown format. This tool helps developers, writers, and content creators transform HTML into Markdown instantly without installing any software.',
      why: [
        { title: 'Fast Conversion', desc: 'Transform complex HTML tags into clean Markdown syntax instantly.' },
        { title: 'Clean Markdown', desc: 'Automatically strips unnecessary styling and focuses on the content structure.' },
        { title: '100% Client-Side', desc: 'Your HTML code is processed in your browser, keeping your content private.' }
      ],
      example: {
        before: '<h1>Hello World</h1><p>This is a <strong>strong</strong> paragraph.</p>',
        after: '# Hello World\n\nThis is a **strong** paragraph.'
      },
      faqs: [
        { q: 'What is HTML to Markdown conversion?', a: 'HTML to Markdown conversion is the process of transforming HTML code into Markdown syntax for easier readability and editing.' },
        { q: 'Why convert HTML to Markdown?', a: 'Markdown is simpler, cleaner, and widely used in documentation, blogs, and developer tools.' },
        { q: 'Is this HTML to Markdown tool free?', a: 'Yes, it is completely free and runs entirely in your browser.' },
        { q: 'Does this tool support complex HTML?', a: 'Yes, it supports most common HTML tags including headings, links, lists, and formatting.' }
      ],
      complementary: {
        id: 'markdown-to-html',
        name: 'Markdown to HTML',
        textEN: 'Need to go the other way? Try our',
        textVI: 'Cần chuyển đổi ngược lại? Thử ngay'
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
    'regex-tester': {
      what: 'Regex Tester là công cụ tương tác để viết và thử nghiệm Biểu thức chính quy (Regular Expression). Nó cung cấp khả năng khớp lệnh và highlight thời gian thực.',
      why: [
        { title: 'Thử nghiệm trực tiếp', desc: 'Thấy kết quả khớp lệnh ngay lập tức khi bạn vừa gõ xong.' },
        { title: 'Highlight cú pháp', desc: 'Dễ dàng phân biệt giữa các nhóm, định lượng và ký tự neo.' },
        { title: 'Năng suất', desc: 'Sửa lỗi Regex trong vài giây thay vì phải thử sai nhiều lần trong mã nguồn.' }
      ],
      example: {
        before: 'mẫu: \\d{3}',
        after: 'Khớp: 123, 456...'
      },
      faqs: [
        { q: 'Flags là gì?', a: 'Flags thay đổi cách Regex hoạt động. "g" tìm mọi kết quả, "i" không phân biệt hoa thường, "m" cho phép khớp nhiều dòng.' },
        { q: 'Regex của tôi có được bảo mật không?', a: 'Có. Mọi quá trình xử lý Regex diễn ra ngay trong trình duyệt của bạn.' }
      ],
      complementary: {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Need to extract data from a JSON? Use our',
        textVI: 'Cần trích xuất dữ liệu từ JSON? Hãy dùng'
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
    'html-to-markdown': {
      what: 'Bộ chuyển đổi HTML sang Markdown cho phép bạn nhanh chóng chuyển đổi mã HTML sang định dạng Markdown sạch sẽ và dễ đọc. Công cụ này giúp các nhà phát triển, người viết và người sáng tạo nội dung chuyển đổi HTML sang Markdown ngay lập tức mà không cần cài đặt bất kỳ phần mềm nào.',
      why: [
        { title: 'Chuyển đổi nhanh', desc: 'Chuyển đổi các thẻ HTML phức tạp sang cú pháp Markdown sạch sẽ ngay lập tức.' },
        { title: 'Markdown sạch', desc: 'Tự động lược bỏ các định dạng không cần thiết và tập trung vào cấu trúc nội dung.' },
        { title: '100% Tại trình duyệt', desc: 'Mã HTML của bạn được xử lý ngay trong trình duyệt, đảm bảo tính riêng tư cho nội dung.' }
      ],
      example: {
        before: '<h1>Hello World</h1><p>This is a <strong>strong</strong> paragraph.</p>',
        after: '# Hello World\n\nThis is a **strong** paragraph.'
      },
      faqs: [
        { q: 'Mục đích của việc chuyển đổi HTML sang Markdown là gì?', a: 'Markdown dễ đọc và viết hơn HTML, làm cho nó trở thành tiêu chuẩn cho tài liệu, bài đăng blog và hệ thống quản lý nội dung.' },
        { q: 'Dữ liệu HTML của tôi có an toàn không?', a: 'Hoàn toàn an toàn. Công cụ này chạy hoàn toàn trong trình duyệt của bạn bằng JavaScript, vì vậy dữ liệu của bạn không bao giờ được tải lên bất kỳ máy chủ nào.' }
      ],
      complementary: {
        id: 'markdown-to-html',
        name: 'Markdown to HTML',
        textEN: 'Need to go the other way? Try our',
        textVI: 'Cần chuyển đổi ngược lại? Thử ngay'
      }
    }
  }
};
