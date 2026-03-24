import { useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { Copy, Check } from 'lucide-react'
import FileDropTextarea from '../components/FileDropTextarea'

type Language =
  | 'js-fetch'
  | 'js-axios'
  | 'python-requests'
  | 'php-curl'
  | 'go-http'
  | 'ruby-http'
  | 'java-httpclient'
  | 'csharp-httpclient'
  | 'rust-reqwest'

interface ParsedCurl {
  url: string
  method: string
  headers: Record<string, string>
  body: string | null
  formData: Record<string, string> | null
  username: string | null
  password: string | null
  cookies: string | null
}

const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'js-fetch', label: 'JavaScript (fetch)' },
  { id: 'js-axios', label: 'JavaScript (axios)' },
  { id: 'python-requests', label: 'Python (requests)' },
  { id: 'php-curl', label: 'PHP (cURL)' },
  { id: 'go-http', label: 'Go (net/http)' },
  { id: 'ruby-http', label: 'Ruby (net/http)' },
  { id: 'java-httpclient', label: 'Java (HttpClient)' },
  { id: 'csharp-httpclient', label: 'C# (HttpClient)' },
  { id: 'rust-reqwest', label: 'Rust (reqwest)' },
]

function tokenize(cmd: string): string[] {
  const tokens: string[] = []
  let current = ''
  let inSingle = false
  let inDouble = false
  let i = 0
  while (i < cmd.length) {
    const c = cmd[i]!
    if (c === "'" && !inDouble) {
      inSingle = !inSingle
    } else if (c === '"' && !inSingle) {
      inDouble = !inDouble
    } else if (c === '\\' && !inSingle && i + 1 < cmd.length) {
      i++
      current += cmd[i]!
    } else if ((c === ' ' || c === '\t' || c === '\n') && !inSingle && !inDouble) {
      if (current) { tokens.push(current); current = '' }
    } else {
      current += c
    }
    i++
  }
  if (current) tokens.push(current)
  return tokens
}

function parseCurl(raw: string): ParsedCurl {
  const cleaned = raw.trim().replace(/\\\n/g, ' ').replace(/\s+/g, ' ')
  const tokens = tokenize(cleaned)

  let url = ''
  let method = ''
  const headers: Record<string, string> = {}
  let body: string | null = null
  const formData: Record<string, string> = {}
  let hasForm = false
  let username: string | null = null
  let password: string | null = null
  let cookies: string | null = null

  let i = 0
  // skip 'curl'
  if (tokens[0]?.toLowerCase() === 'curl') i = 1

  while (i < tokens.length) {
    const t = tokens[i]!
    if (t === '-X' || t === '--request') {
      method = tokens[++i] ?? ''
    } else if (t === '-H' || t === '--header') {
      const header = tokens[++i] ?? ''
      const colon = header.indexOf(':')
      if (colon > 0) {
        headers[header.slice(0, colon).trim()] = header.slice(colon + 1).trim()
      }
    } else if (t === '-d' || t === '--data' || t === '--data-raw' || t === '--data-ascii') {
      body = tokens[++i] ?? ''
    } else if (t === '--data-binary') {
      body = tokens[++i] ?? ''
    } else if (t === '--json') {
      const jd = tokens[++i] ?? ''
      body = jd
      headers['Content-Type'] = 'application/json'
      headers['Accept'] = 'application/json'
    } else if (t === '-F' || t === '--form') {
      const part = tokens[++i] ?? ''
      const eq = part.indexOf('=')
      if (eq > 0) { formData[part.slice(0, eq)] = part.slice(eq + 1); hasForm = true }
    } else if (t === '-u' || t === '--user') {
      const creds = tokens[++i] ?? ''
      const colon = creds.indexOf(':')
      if (colon > 0) { username = creds.slice(0, colon); password = creds.slice(colon + 1) }
      else { username = creds }
    } else if (t === '-b' || t === '--cookie') {
      cookies = tokens[++i] ?? ''
    } else if (t === '-A' || t === '--user-agent') {
      headers['User-Agent'] = tokens[++i] ?? ''
    } else if (t === '--compressed') {
      headers['Accept-Encoding'] = 'gzip, deflate, br'
    } else if (!t.startsWith('-') && !url) {
      url = t
    }
    i++
  }

  if (!method) {
    if (body || hasForm) method = 'POST'
    else method = 'GET'
  }

  if (cookies) headers['Cookie'] = cookies

  return {
    url,
    method: method.toUpperCase(),
    headers,
    body: hasForm ? null : body,
    formData: hasForm ? formData : null,
    username,
    password,
    cookies,
  }
}

function indent(s: string, n = 2) {
  return s.split('\n').map(l => ' '.repeat(n) + l).join('\n')
}

function headersToJsObj(headers: Record<string, string>, extra = 2): string {
  const entries = Object.entries(headers)
  if (!entries.length) return '{}'
  const pad = ' '.repeat(extra)
  const lines = entries.map(([k, v]) => `${pad}  '${k}': '${v.replace(/'/g, "\\'")}'`)
  return `{\n${lines.join(',\n')}\n${pad}}`
}

function generateCode(parsed: ParsedCurl, lang: Language): string {
  const { url, method, headers, body, formData, username, password } = parsed

  const authHeader = (username != null)
    ? `Basic ${btoa(`${username}:${password ?? ''}`)}`
    : null

  const allHeaders = authHeader ? { ...headers, Authorization: authHeader } : { ...headers }

  switch (lang) {
    case 'js-fetch': {
      const opts: string[] = [`method: '${method}'`]
      if (Object.keys(allHeaders).length) opts.push(`headers: ${headersToJsObj(allHeaders)}`)
      if (body) opts.push(`body: ${JSON.stringify(body)}`)
      else if (formData) {
        const lines = Object.entries(formData).map(([k, v]) => `  fd.append('${k}', '${v}')`)
        return `const fd = new FormData();\n${lines.join(';\n')};\n\nconst response = await fetch('${url}', {\n  method: '${method}',\n  body: fd,\n});\nconst data = await response.json();`
      }
      return `const response = await fetch('${url}', {\n${opts.map(o => '  ' + o).join(',\n')}\n});\nconst data = await response.json();`
    }
    case 'js-axios': {
      const config: string[] = [`  method: '${method.toLowerCase()}'`, `  url: '${url}'`]
      if (Object.keys(allHeaders).length) config.push(`  headers: ${headersToJsObj(allHeaders)}`)
      if (body) {
        try { config.push(`  data: ${JSON.stringify(JSON.parse(body), null, 2).split('\n').map((l, i) => i === 0 ? l : '  ' + l).join('\n')}`) }
        catch { config.push(`  data: ${JSON.stringify(body)}`) }
      } else if (formData) {
        const lines = Object.entries(formData).map(([k, v]) => `  fd.append('${k}', '${v}')`)
        return `const fd = new FormData();\n${lines.join(';\n')};\n\nconst { data } = await axios({\n  method: '${method.toLowerCase()}',\n  url: '${url}',\n  data: fd,\n});`
      }
      return `const { data } = await axios({\n${config.join(',\n')}\n});`
    }
    case 'python-requests': {
      const lines: string[] = ['import requests', '']
      if (authHeader) lines.push(`auth = ('${username}', '${password ?? ''}')`)
      const hlines = Object.entries(allHeaders).map(([k, v]) => `    '${k}': '${v.replace(/'/g, "\\'")}'`)
      if (hlines.length) lines.push(`headers = {\n${hlines.join(',\n')}\n}`)
      let bodyArg = ''
      if (body) {
        try { lines.push(`payload = ${JSON.stringify(JSON.parse(body), null, 4)}`); bodyArg = ', json=payload' }
        catch { lines.push(`payload = ${JSON.stringify(body)}`); bodyArg = ', data=payload' }
      } else if (formData) {
        const flines = Object.entries(formData).map(([k, v]) => `    '${k}': '${v}'`)
        lines.push(`files = {\n${flines.join(',\n')}\n}`)
        bodyArg = ', files=files'
      }
      const harg = hlines.length ? ', headers=headers' : ''
      lines.push(`\nresponse = requests.${method.toLowerCase()}('${url}'${harg}${bodyArg})`)
      lines.push(`data = response.json()`)
      return lines.join('\n')
    }
    case 'php-curl': {
      const lines = ['<?php', '', `$ch = curl_init('${url}');`, `curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);`, `curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${method}');`]
      if (Object.keys(allHeaders).length) {
        const hlines = Object.entries(allHeaders).map(([k, v]) => `    '${k}: ${v}'`)
        lines.push(`curl_setopt($ch, CURLOPT_HTTPHEADER, [\n${hlines.join(',\n')}\n]);`)
      }
      if (body) lines.push(`curl_setopt($ch, CURLOPT_POSTFIELDS, ${JSON.stringify(body)});`)
      else if (formData) {
        const flines = Object.entries(formData).map(([k, v]) => `    '${k}' => '${v}'`)
        lines.push(`curl_setopt($ch, CURLOPT_POSTFIELDS, [\n${flines.join(',\n')}\n]);`)
      }
      if (username) lines.push(`curl_setopt($ch, CURLOPT_USERPWD, '${username}:${password ?? ''}');`)
      lines.push('', `$response = curl_exec($ch);`, `$data = json_decode($response, true);`, `curl_close($ch);`)
      return lines.join('\n')
    }
    case 'go-http': {
      const lines = ['package main', '', 'import (', '\t"bytes"', '\t"encoding/json"', '\t"fmt"', '\t"io"', '\t"net/http"', ')', '', 'func main() {']
      if (body) lines.push(`\tbody := bytes.NewBufferString(${JSON.stringify(body)})`)
      else lines.push('\tbody := http.NoBody')
      lines.push(`\treq, err := http.NewRequest("${method}", "${url}", body)`)
      lines.push('\tif err != nil { panic(err) }')
      for (const [k, v] of Object.entries(allHeaders)) lines.push(`\treq.Header.Set("${k}", "${v}")`)
      lines.push('\tclient := &http.Client{}')
      lines.push('\tresp, err := client.Do(req)')
      lines.push('\tif err != nil { panic(err) }')
      lines.push('\tdefer resp.Body.Close()')
      lines.push('\tdata, _ := io.ReadAll(resp.Body)')
      lines.push('\tvar result map[string]any')
      lines.push('\tjson.Unmarshal(data, &result)')
      lines.push('\tfmt.Println(result)')
      lines.push('}')
      return lines.join('\n')
    }
    case 'ruby-http': {
      const lines = ['require "net/http"', 'require "json"', 'require "uri"', '']
      lines.push(`uri = URI.parse("${url}")`)
      lines.push(`http = Net::HTTP.new(uri.host, uri.port)`)
      lines.push('http.use_ssl = true if uri.scheme == "https"')
      lines.push('')
      const reqClass = method === 'GET' ? 'Get' : method === 'POST' ? 'Post' : method === 'PUT' ? 'Put' : method === 'DELETE' ? 'Delete' : method === 'PATCH' ? 'Patch' : 'Get'
      lines.push(`request = Net::HTTP::${reqClass}.new(uri.request_uri)`)
      for (const [k, v] of Object.entries(allHeaders)) lines.push(`request["${k}"] = "${v}"`)
      if (username) lines.push(`request.basic_auth("${username}", "${password ?? ''}")`)
      if (body) lines.push(`request.body = ${JSON.stringify(body)}`)
      lines.push('')
      lines.push('response = http.request(request)')
      lines.push('data = JSON.parse(response.body)')
      return lines.join('\n')
    }
    case 'java-httpclient': {
      const lines = ['import java.net.URI;', 'import java.net.http.HttpClient;', 'import java.net.http.HttpRequest;', 'import java.net.http.HttpResponse;', '']
      lines.push('var client = HttpClient.newHttpClient();')
      lines.push('var request = HttpRequest.newBuilder()')
      lines.push(`    .uri(URI.create("${url}"))`)
      for (const [k, v] of Object.entries(allHeaders)) lines.push(`    .header("${k}", "${v}")`)
      if (body) lines.push(`    .method("${method}", HttpRequest.BodyPublishers.ofString(${JSON.stringify(body)}))`)
      else lines.push(`    .${method === 'GET' ? 'GET()' : `method("${method}", HttpRequest.BodyPublishers.noBody())`}`)
      lines.push('    .build();')
      lines.push('')
      lines.push('var response = client.send(request, HttpResponse.BodyHandlers.ofString());')
      lines.push('System.out.println(response.body());')
      return lines.join('\n')
    }
    case 'csharp-httpclient': {
      const lines = ['using System.Net.Http;', 'using System.Text;', 'using System.Text.Json;', '']
      lines.push('using var client = new HttpClient();')
      for (const [k, v] of Object.entries(allHeaders)) {
        if (k.toLowerCase() === 'content-type') continue
        lines.push(`client.DefaultRequestHeaders.Add("${k}", "${v}");`)
      }
      if (username) lines.push(`var credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes("${username}:${password ?? ''}"));\nclient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", credentials);`)
      if (body) {
        const ct = (allHeaders as Record<string, string>)['Content-Type'] ?? 'application/json'
        lines.push(`var content = new StringContent(${JSON.stringify(body)}, Encoding.UTF8, "${ct}");`)
        lines.push(`var response = await client.${method === 'POST' ? 'PostAsync' : method === 'PUT' ? 'PutAsync' : method === 'PATCH' ? 'PatchAsync' : 'SendAsync(new HttpRequestMessage(new HttpMethod("' + method + '"), "' + url + '") { Content = content })'}("${url}", content);`)
      } else {
        const methodMap: Record<string, string> = { GET: 'GetAsync', DELETE: 'DeleteAsync' }
        const m = methodMap[method] ?? `SendAsync(new HttpRequestMessage(new HttpMethod("${method}"), "${url}"))`
        lines.push(`var response = await client.${m}("${url}");`)
      }
      lines.push('var result = await response.Content.ReadAsStringAsync();')
      lines.push('Console.WriteLine(result);')
      return lines.join('\n')
    }
    case 'rust-reqwest': {
      const lines = ['use reqwest::header::{HeaderMap, HeaderValue, CONTENT_TYPE};', '']
      lines.push('#[tokio::main]')
      lines.push('async fn main() -> Result<(), reqwest::Error> {')
      lines.push('    let client = reqwest::Client::new();')
      if (Object.keys(allHeaders).length) {
        lines.push('    let mut headers = HeaderMap::new();')
        for (const [k, v] of Object.entries(allHeaders)) {
          lines.push(`    headers.insert("${k}", HeaderValue::from_static("${v}"));`)
        }
      }
      const chain: string[] = [`    let response = client.${method.toLowerCase()}("${url}")`]
      if (Object.keys(allHeaders).length) chain.push('        .headers(headers)')
      if (username) chain.push(`        .basic_auth("${username}", Some("${password ?? ''}"))`)
      if (body) chain.push(`        .body(${JSON.stringify(body)})`)
      chain.push('        .send()')
      chain.push('        .await?;')
      lines.push(chain.join('\n'))
      lines.push('    let text = response.text().await?;')
      lines.push('    println!("{}", text);')
      lines.push('    Ok(())')
      lines.push('}')
      return lines.join('\n')
    }
    default:
      return '// Unsupported language'
  }
}

export default function CurlToCode() {
  const [input, setInput] = usePersistentState('tool-curl-input', `curl -X POST https://api.example.com/users -H "Content-Type: application/json" -H "Authorization: Bearer token123" -d '{"name":"Alice","email":"alice@example.com"}'`)
  const [lang, setLang] = useState<Language>('js-fetch')
  const [copied, setCopied] = useState(false)

  let output = ''
  let error = ''
  if (input.trim()) {
    try {
      const parsed = parseCurl(input)
      if (!parsed.url) error = 'Could not parse URL from cURL command.'
      else output = generateCode(parsed, lang)
    } catch (e) {
      error = (e as Error).message
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Language selector */}
      <div>
        <label className="label-text block mb-2">Target Language</label>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map(l => (
            <button
              key={l.id}
              onClick={() => setLang(l.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${lang === l.id ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div>
        <label className="label-text block mb-2">cURL Command</label>
        <FileDropTextarea
          value={input}
          onChange={setInput}
          placeholder={`curl -X POST 'https://api.example.com/users' \\\n  -H 'Content-Type: application/json' \\\n  -H 'Authorization: Bearer token123' \\\n  -d '{"name":"Alice","email":"alice@example.com"}'`}
          className="h-44 font-mono text-sm"
          accept="text/*"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="tool-msg tool-msg--error">
          {error}
        </p>
      )}

      {/* Output */}
      <div>
        <div className="tool-output-header">
          <label className="tool-label">Generated Code</label>
          <button onClick={copy} disabled={!output} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 disabled:opacity-50">
            {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
          </button>
        </div>
        <textarea
          readOnly
          value={output}
          placeholder="Generated code will appear here..."
          className="tool-textarea-output font-mono text-sm h-64"
        />
      </div>
    </div>
  )
}
