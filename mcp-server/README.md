<div align="center">
  <h1>🧰 DevTools Online MCP</h1>
  <p><strong>The official Model Context Protocol (MCP) server for <a href="https://devtoolsonline.dev">DevTools Online</a>.</strong></p>
  
  [![npm version](https://img.shields.io/npm/v/devtoolsonline-mcp.svg?style=flat-square)](https://www.npmjs.com/package/devtoolsonline-mcp)
  [![License: MIT](https://img.shields.io/npm/l/devtoolsonline-mcp?style=flat-square)](https://opensource.org/licenses/MIT)
  [![Platform](https://img.shields.io/badge/Platform-Node.js-blue.svg?style=flat-square)](https://nodejs.org)
</div>

<br />

Supercharge your AI assistants (Claude Desktop, Cursor, Zed, Windsurf) by empowering them with high-performance, local developer tools. No remote API calls, no cloud dependencies—just raw computational power exposed directly to your local AI.

## ✨ Why this MCP?

Over 120+ specialized frontend engineering utilities from [devtoolsonline.dev](https://devtoolsonline.dev) are currently being ported to be completely native to your AI. With a single configuration line, your Agent learns exactly how to fix broken JSON, decode JWTs, generate strong passwords, minify code, convert CSV to JSON, parse epochs, and more — perfectly on the first try.

---

## 🛠️ Available Tools

**42 tools available** across 7 categories:

| Tool Category | Available Methods | Description |
| :--- | :--- | :--- |
| **Networking & Web** | `url_parse`, `url_encode`, `url_decode`, `dns_lookup`, `cidr_calculator` | Parse URLs, encode/decode, fetch DNS records, calculate CIDR subnet ranges. |
| **Data Formats** | `json_repair`, `json_format`, `json_validate`, `json_diff`, `csv_to_json`, `json_to_csv`, `env_to_json`, `json_to_env` | Fix broken JSON, prettify, validate, diff objects, and convert between CSV/JSON/ENV. |
| **Encoding / Crypto** | `base64_encode`, `base64_decode`, `jwt_decode`, `hash_generate`, `number_base_convert`, `string_escape`, `string_unescape` | Encode strings, parse JWTs securely, generate hashes (MD5/SHA), convert bases, escape literals. |
| **Generators** | `uuid_generate`, `password_generate`, `slug_generate`, `nanoid_generate`, `random_string`, `robots_txt_generate` | Generate UUIDs, secure passwords, URL slugs, NanoIDs, random strings, and robots.txt files. |
| **Code Minifiers** | `minify_html`, `minify_css`, `minify_json`, `minify_xml` | Strip whitespace and comments from HTML, CSS, JSON, and XML for production-ready output. |
| **String & Text** | `string_case`, `text_stats`, `text_sort_lines`, `lorem_ipsum`, `html_to_markdown` | Convert casing (camelCase, snake_case...), analyze text stats, sort lines, generate placeholders. |
| **Misc / Conversions** | `html_encode`, `html_decode`, `byte_convert`, `hex_to_rgb`, `rgb_to_hex`, `unix_timestamp` | Escape HTML entities, convert byte sizes, switch between color formats, parse timestamps. |

*(More tools actively being ported from our [128+ Web Collection](https://devtoolsonline.dev)!)*

---

## ⚙️ Quick Installation (For AI IDEs)

You never have to install this globally. You can bind `devtoolsonline-mcp` directly to your favorite agent dynamically using `npx`.

<details open>
<summary><b>1. Cursor IDE Setup</b></summary>

1. Open Cursor Settings (`Ctrl + Shift + J` or `Cmd + Shift + J`).
2. Go to **Features** -> **MCP Servers** (Or Type 'MCP' in the search bar).
3. Click **+ Add new MCP server**.
4. Set name: `DevTools`
5. Set Type: `command`
6. Set Command: `npx -y devtoolsonline-mcp`
</details>

<details>
<summary><b>2. Claude Desktop Setup</b></summary>

Modify your configuration file located at:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "devtoolsonline": {
      "command": "npx",
      "args": ["-y", "devtoolsonline-mcp"]
    }
  }
}
```
</details>

<details>
<summary><b>3. VS Code (Cline / Roo Code) Setup</b></summary>

Open your global storage MCP Settings file (`~/.vscode/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "devtoolsonline": {
      "command": "npx",
      "args": ["-y", "devtoolsonline-mcp"]
    }
  }
}
```
</details>

<details>
<summary><b>4. Zed Editor Setup</b></summary>

Open configuration (`Ctrl + ,` / `Cmd + ,`) and set:
```json
{
  "mcpServers": {
    "devtoolsonline": {
      "command": "npx",
      "args": ["-y", "devtoolsonline-mcp"]
    }
  }
}
```
</details>

---

## 💡 Prompting Examples

You do not need to call the MCP manually! Once properly configured, simply talk to the AI using Natural Language Prompts:

### 🐛 Syntax Fixing
> *"I have a python dictionary that I need in JSON format but it's super broken (`{ "key": 'value', }`). Use your JSON repair tool to fix it into a rigid schema structure."*

### 🔐 Security & Auth Tokens
> *"Please decode this JWT token specifically tracking if the payload is expired or not."*

### ⚙️ Time Conversions
> *"I have an epoch reading `1716334581231`. Give me what standard time and date that aligns with."*

### 🎨 Design Conversions
> *"Convert all the `#FF5A2X` HEX codes inside this React component into specific RGB object literals."*

---

## 🤝 Community & Links
- **Web App**: Built with logic powering [devtoolsonline.dev](https://devtoolsonline.dev).
- **Core Library NPM**: Built on top of [@devtoolsonline/core](https://www.npmjs.com/package/@devtoolsonline/core).
- **Issues/Requests**: Please tweet or reach out if you'd like a specific tool ported to MCP.

<p align="center">Made with ❤️ for developers by developers. MIT License.</p>
