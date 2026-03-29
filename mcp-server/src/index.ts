#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import crypto from "node:crypto";

// Core logic imports
import { autoFixJson, formatJson, validateJson } from "../../src/core/json.js";
import { decodeJwt, isTokenExpired } from "../../src/core/jwt.js";
import { converters, convertCase, generateSlug } from "../../src/core/string.js";
import { urlEncode, urlDecode, parseUrl } from "../../src/core/url.js";
import { base64Encode, base64Decode } from "../../src/core/base64.js";
import { generatePassword, generateUuid } from "../../src/core/generators.js";
import { getTextStats, generateLoremIpsum } from "../../src/core/text.js";
import { hexToRgb, rgbToHex } from "../../src/core/color.js";
import { parseTimestamp } from "../../src/core/time.js";
import { htmlEncode, htmlDecode } from "../../src/core/html.js";
import { convertNumberBase, convertBytes } from "../../src/core/number.js";
import { calculateCidr, lookupDns } from "../../src/core/network.js";
import { minifyHtml, minifyCss, minifyJson, minifyXml, escapeString, unescapeString } from "../../src/core/formatters.js";
import { csvToJson, jsonToCsv, envToJson, jsonToEnv, jsonDiff } from "../../src/core/data_conversion.js";
import { sortLines, randomString, generateNanoid, robotsTxtGenerate, htmlToMarkdownBasic } from "../../src/core/text_tools.js";

/**
 * DevTools Online MCP Server
 * Exposes 40+ developer tools logic to AI agents.
 */
class DevToolsMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server({ name: "devtoolsonline-core-server", version: "1.2.0" }, { capabilities: { tools: {} } });
    this.setupHandlers();
    this.server.onerror = (error) => console.error("[MCP Error]", error);
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        { name: "json_repair", description: "Auto-fix and format broken JSON (handles missing commas, wrong quotes, etc.)", inputSchema: { type: "object", properties: { input: { type: "string" }, indent: { type: "number" } }, required: ["input"] } },
        { name: "json_format", description: "Format (prettify) a valid JSON string", inputSchema: { type: "object", properties: { input: { type: "string" }, indent: { type: "number" } }, required: ["input"] } },
        { name: "json_validate", description: "Confirm if a string is a valid JSON document", inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] } },
        { name: "jwt_decode", description: "Decode a JSON Web Token (JWT) to see Header and Payload", inputSchema: { type: "object", properties: { token: { type: "string", description: "The encoded JWT string" } }, required: ["token"] } },
        { name: "string_case", description: "Convert string to camelCase, snake_case, PascalCase, kebab-case, etc.", inputSchema: { type: "object", properties: { input: { type: "string" }, mode: { type: "string", enum: Object.keys(converters), description: "The target case type" } }, required: ["input", "mode"] } },
        { name: "url_encode", description: "Encode a string or URL into a percent-encoded format", inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] } },
        { name: "url_decode", description: "Decode a percent-encoded string or URL back to its original form", inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] } },
        { name: "base64_encode", description: "Encode a string to Base64 format", inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] } },
        { name: "base64_decode", description: "Decode a Base64 string back to human-readable text", inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] } },
        { name: "password_generate", description: "Generate a secure random password", inputSchema: { type: "object", properties: { length: { type: "number", description: "Length of the password (default 16)" }, uppercase: { type: "boolean" }, lowercase: { type: "boolean" }, numbers: { type: "boolean" }, symbols: { type: "boolean" } } } },
        { name: "uuid_generate", description: "Generate a universally unique identifier (UUID v4)", inputSchema: { type: "object", properties: {} } },
        { name: "text_stats", description: "Get word count, character count, lines, and reading time for a text block", inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] } },
        { name: "lorem_ipsum", description: "Generate placeholder lorem ipsum text", inputSchema: { type: "object", properties: { paragraphs: { type: "number", description: "Number of paragraphs (default 1)" }, wordsPerParagraph: { type: "number", description: "Words per paragraph (default 50)" } } } },
        { name: "hex_to_rgb", description: "Convert a HEX color code to RGB values", inputSchema: { type: "object", properties: { hex: { type: "string", description: "Hex color code (e.g. #FF5733 or FF5733)" } }, required: ["hex"] } },
        { name: "rgb_to_hex", description: "Convert RGB color values to a HEX code", inputSchema: { type: "object", properties: { r: { type: "number" }, g: { type: "number" }, b: { type: "number" } }, required: ["r", "g", "b"] } },
        { name: "unix_timestamp", description: "Parse a unix timestamp (seconds/milliseconds) or an ISO date. Use empty input for 'Now'", inputSchema: { type: "object", properties: { input: { type: "string", description: "Timestamp number or Date String. Leave empty for 'Now'" } } } },
        { name: "html_encode", description: "Convert HTML characters like < and > into safe entities.", inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] } },
        { name: "html_decode", description: "Decode HTML entities back to readable text.", inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] } },
        { name: "number_base_convert", description: "Convert numbers across binary, octal, decimal, and hexadecimal bases.", inputSchema: { type: "object", properties: { input: { type: "string" }, fromBase: { type: "number", description: "Base of input (e.g. 10 for decimal, 16 for hex)" }, toBase: { type: "number", description: "Base to convert to" } }, required: ["input", "fromBase", "toBase"] } },
        { name: "hash_generate", description: "Generate MD5, SHA-1, SHA-256, or SHA-512 hashes.", inputSchema: { type: "object", properties: { input: { type: "string" }, algorithm: { type: "string", enum: ["md5", "sha1", "sha256", "sha512"], description: "The hashing algorithm to use" } }, required: ["input", "algorithm"] } },
        { name: "url_parse", description: "Parse a URL into its components (protocol, host, port, path, params, etc.)", inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] } },
        { name: "slug_generate", description: "Convert text to a URL-friendly slug (e.g. 'Hello World!' -> 'hello-world')", inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] } },
        { name: "byte_convert", description: "Convert bytes to human-readable format (KB, MB, GB, TB, etc.)", inputSchema: { type: "object", properties: { bytes: { type: "number" } }, required: ["bytes"] } },
        { name: "cidr_calculator", description: "Calculate network address, broadcast address, and host range from a CIDR notation (e.g. 192.168.1.0/24)", inputSchema: { type: "object", properties: { cidr: { type: "string" } }, required: ["cidr"] } },
        { name: "dns_lookup", description: "Lookup DNS records for a given domain name (A, AAAA, MX, TXT, NS, etc.)", inputSchema: { type: "object", properties: { domain: { type: "string" }, type: { type: "string", description: "Record type (e.g. A, MX, TXT, ANY)", default: "ANY" } }, required: ["domain"] } },
        { name: "minify_html", description: "Minify HTML to remove whitespaces and comments", inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] } },
        { name: "minify_css", description: "Minify CSS code", inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] } },
        { name: "minify_json", description: "Minify JSON into a single line", inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] } },
        { name: "minify_xml", description: "Minify XML tags and strip comments", inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] } },
        { name: "string_escape", description: "Escape string for standard programming literal (e.g. handle quotes and newlines)", inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] } },
        { name: "string_unescape", description: "Unescape literal string (turns \\n back to new line)", inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] } },
        { name: "csv_to_json", description: "Convert CSV string into JSON array of objects", inputSchema: { type: "object", properties: { input: { type: "string" }, separator: { type: "string", default: "," } }, required: ["input"] } },
        { name: "json_to_csv", description: "Convert JSON array to CSV format", inputSchema: { type: "object", properties: { input: { type: "string" }, separator: { type: "string", default: "," } }, required: ["input"] } },
        { name: "env_to_json", description: "Parse .env string to JSON object", inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] } },
        { name: "json_to_env", description: "Convert flat JSON object to .env format", inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] } },
        { name: "json_diff", description: "Compare two JSON strings and identify added, removed, and changed keys", inputSchema: { type: "object", properties: { json1: { type: "string" }, json2: { type: "string" } }, required: ["json1", "json2"] } },
        { name: "text_sort_lines", description: "Sort text by line (alphabetical)", inputSchema: { type: "object", properties: { input: { type: "string" }, order: { type: "string", enum: ["asc", "desc"], default: "asc" }, removeDuplicates: { type: "boolean", default: false } }, required: ["input"] } },
        { name: "random_string", description: "Generate a random string of a specific length and charset", inputSchema: { type: "object", properties: { length: { type: "number" }, charset: { type: "string", enum: ["alphanumeric", "alpha", "numeric", "hex"], default: "alphanumeric" } }, required: ["length"] } },
        { name: "nanoid_generate", description: "Generate a secure NanoID", inputSchema: { type: "object", properties: { size: { type: "number", default: 21 } } } },
        { name: "robots_txt_generate", description: "Generate robots.txt format", inputSchema: { type: "object", properties: { allow: { type: "array", items: { type: "string" } }, disallow: { type: "array", items: { type: "string" } }, sitemapUrl: { type: "string" } }, required: ["allow", "disallow"] } },
        { name: "html_to_markdown", description: "Convert HTML elements cleanly to Markdown", inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] } }
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const parsedArgs = args || {};

      switch (name) {
        case "json_repair": {
          const result = autoFixJson(z.string().parse(parsedArgs.input), z.number().optional().parse(parsedArgs.indent) || 2);
          return { content: [{ type: "text", text: result.output || `Error: ${result.error}` }], isError: !!result.error && !result.output };
        }
        case "json_format": {
          const result = formatJson(z.string().parse(parsedArgs.input), z.number().optional().parse(parsedArgs.indent) || 2);
          return { content: [{ type: "text", text: result.output || `Error: ${result.error}` }], isError: !!result.error };
        }
        case "json_validate": {
          const message = validateJson(z.string().parse(parsedArgs.input));
          return { content: [{ type: "text", text: message }], isError: !message.includes("✅") };
        }
        case "jwt_decode": {
          try {
            const decoded = decodeJwt(z.string().parse(parsedArgs.token));
            const status = decoded.payload.exp ? `\nStatus: ${isTokenExpired(decoded.payload.exp).expired ? '⚠️ EXPIRED' : '✅ VALID'}` : '';
            return { content: [{ type: "text", text: JSON.stringify(decoded, null, 2) + status }] };
          } catch (e) { return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true }; }
        }
        case "string_case":
          return { content: [{ type: "text", text: convertCase(z.string().parse(parsedArgs.input), z.string().parse(parsedArgs.mode) as keyof typeof converters) }] };
        case "url_encode":
          return { content: [{ type: "text", text: urlEncode(z.string().parse(parsedArgs.input)) }] };
        case "url_decode":
          return { content: [{ type: "text", text: urlDecode(z.string().parse(parsedArgs.input)) }] };
        case "base64_encode":
          return { content: [{ type: "text", text: base64Encode(z.string().parse(parsedArgs.input)) }] };
        case "base64_decode":
          return { content: [{ type: "text", text: base64Decode(z.string().parse(parsedArgs.input)) }] };
        case "uuid_generate":
          return { content: [{ type: "text", text: generateUuid() }] };
        case "password_generate": {
          const length = z.number().optional().parse(parsedArgs.length) || 16;
          const upper = z.boolean().optional().parse(parsedArgs.uppercase) ?? true;
          const lower = z.boolean().optional().parse(parsedArgs.lowercase) ?? true;
          const nums = z.boolean().optional().parse(parsedArgs.numbers) ?? true;
          const syms = z.boolean().optional().parse(parsedArgs.symbols) ?? true;
          try {
            return { content: [{ type: "text", text: generatePassword(length, { uppercase: upper, lowercase: lower, numbers: nums, symbols: syms }) }] };
          } catch (e) { return { content: [{ type: "text", text: (e as Error).message }], isError: true }; }
        }
        case "text_stats":
          return { content: [{ type: "text", text: JSON.stringify(getTextStats(z.string().parse(parsedArgs.input)), null, 2) }] };
        case "lorem_ipsum":
          return { content: [{ type: "text", text: generateLoremIpsum(z.number().optional().parse(parsedArgs.paragraphs) || 1, z.number().optional().parse(parsedArgs.wordsPerParagraph) || 50) }] };
        case "hex_to_rgb": {
          const rgb = hexToRgb(z.string().parse(parsedArgs.hex));
          return { content: [{ type: "text", text: rgb ? JSON.stringify(rgb, null, 2) : "Invalid Hex Code" }], isError: !rgb };
        }
        case "rgb_to_hex":
          return { content: [{ type: "text", text: rgbToHex(z.number().parse(parsedArgs.r), z.number().parse(parsedArgs.g), z.number().parse(parsedArgs.b)) }] };
        case "unix_timestamp": {
          try {
             const input = parsedArgs.input ? String(parsedArgs.input) : undefined;
             const time = parseTimestamp(input);
             return { content: [{ type: "text", text: JSON.stringify(time, null, 2) }] };
          } catch (e) { return { content: [{ type: "text", text: (e as Error).message }], isError: true }; }
        }
        case "html_encode":
          return { content: [{ type: "text", text: htmlEncode(z.string().parse(parsedArgs.input)) }] };
        case "html_decode":
          return { content: [{ type: "text", text: htmlDecode(z.string().parse(parsedArgs.input)) }] };
        case "number_base_convert": {
          try {
            const input = z.string().parse(parsedArgs.input);
            const fromBase = z.number().parse(parsedArgs.fromBase);
            const toBase = z.number().parse(parsedArgs.toBase);
            return { content: [{ type: "text", text: convertNumberBase(input, fromBase, toBase) }] };
          } catch (e) { return { content: [{ type: "text", text: (e as Error).message }], isError: true }; }
        }
        case "hash_generate": {
          const input = z.string().parse(parsedArgs.input);
          const alg = z.enum(["md5", "sha1", "sha256", "sha512"]).parse(parsedArgs.algorithm);
          return { content: [{ type: "text", text: crypto.createHash(alg).update(input).digest("hex") }] };
        }
        case "url_parse": {
          return { content: [{ type: "text", text: JSON.stringify(parseUrl(z.string().parse(parsedArgs.input)), null, 2) }] };
        }
        case "slug_generate": {
          return { content: [{ type: "text", text: generateSlug(z.string().parse(parsedArgs.input)) }] };
        }
        case "byte_convert":
          try {
            return { content: [{ type: "text", text: JSON.stringify(convertBytes(z.number().parse(parsedArgs.bytes)), null, 2) }] };
          } catch (e) { return { content: [{ type: "text", text: (e as Error).message }], isError: true }; }
        case "cidr_calculator":
          try {
            return { content: [{ type: "text", text: JSON.stringify(calculateCidr(z.string().parse(parsedArgs.cidr)), null, 2) }] };
          } catch (e) { return { content: [{ type: "text", text: (e as Error).message }], isError: true }; }
        case "dns_lookup":
          try {
            const domain = z.string().parse(parsedArgs.domain);
            const type = parsedArgs.type ? z.string().parse(parsedArgs.type) : "ANY";
            const records = await lookupDns(domain, type);
            return { content: [{ type: "text", text: JSON.stringify(records, null, 2) }] };
          } catch (e) { return { content: [{ type: "text", text: (e as Error).message }], isError: true }; }
        case "minify_html": return { content: [{ type: "text", text: minifyHtml(z.string().parse(parsedArgs.input)) }] };
        case "minify_css": return { content: [{ type: "text", text: minifyCss(z.string().parse(parsedArgs.input)) }] };
        case "minify_json": return { content: [{ type: "text", text: minifyJson(z.string().parse(parsedArgs.input)) }] };
        case "minify_xml": return { content: [{ type: "text", text: minifyXml(z.string().parse(parsedArgs.input)) }] };
        case "string_escape": return { content: [{ type: "text", text: escapeString(z.string().parse(parsedArgs.input)) }] };
        case "string_unescape": return { content: [{ type: "text", text: unescapeString(z.string().parse(parsedArgs.input)) }] };
        case "csv_to_json": {
          try {
            return { content: [{ type: "text", text: JSON.stringify(csvToJson(z.string().parse(parsedArgs.input), z.string().optional().parse(parsedArgs.separator)), null, 2) }] };
          } catch(e) { return { content: [{ type: "text", text: (e as Error).message }], isError: true }; }
        }
        case "json_to_csv": {
          try {
            return { content: [{ type: "text", text: jsonToCsv(z.string().parse(parsedArgs.input), z.string().optional().parse(parsedArgs.separator)) }] };
          } catch(e) { return { content: [{ type: "text", text: (e as Error).message }], isError: true }; }
        }
        case "env_to_json": return { content: [{ type: "text", text: JSON.stringify(envToJson(z.string().parse(parsedArgs.input)), null, 2) }] };
        case "json_to_env": {
          try {
            return { content: [{ type: "text", text: jsonToEnv(z.string().parse(parsedArgs.input)) }] };
          } catch(e) { return { content: [{ type: "text", text: (e as Error).message }], isError: true }; }
        }
        case "json_diff": {
          try {
            return { content: [{ type: "text", text: JSON.stringify(jsonDiff(z.string().parse(parsedArgs.json1), z.string().parse(parsedArgs.json2)), null, 2) }] };
          } catch(e) { return { content: [{ type: "text", text: (e as Error).message }], isError: true }; }
        }
        case "text_sort_lines": {
          const order = z.enum(["asc", "desc"]).optional().parse(parsedArgs.order) || "asc";
          const dDup = z.boolean().optional().parse(parsedArgs.removeDuplicates) || false;
          return { content: [{ type: "text", text: sortLines(z.string().parse(parsedArgs.input), order as "asc"|"desc", dDup) }] };
        }
        case "random_string": {
          const charset = z.enum(["alphanumeric", "alpha", "numeric", "hex"]).optional().parse(parsedArgs.charset) || "alphanumeric";
          return { content: [{ type: "text", text: randomString(z.number().parse(parsedArgs.length), charset as any) }] };
        }
        case "nanoid_generate": return { content: [{ type: "text", text: generateNanoid(z.number().optional().parse(parsedArgs.size)) }] };
        case "robots_txt_generate": {
          const allow = z.array(z.string()).parse(parsedArgs.allow);
          const disallow = z.array(z.string()).parse(parsedArgs.disallow);
          const sitemap = z.string().optional().parse(parsedArgs.sitemapUrl);
          return { content: [{ type: "text", text: robotsTxtGenerate(allow, disallow, sitemap) }] };
        }
        case "html_to_markdown": return { content: [{ type: "text", text: htmlToMarkdownBasic(z.string().parse(parsedArgs.input)) }] };
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("DevTools Online MCP Server running on stdio");
  }
}

const server = new DevToolsMcpServer();
server.run().catch(console.error);
