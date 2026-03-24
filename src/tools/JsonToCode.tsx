import { useState, useMemo } from 'react'
import { Copy, Check, Code2, AlertCircle } from 'lucide-react'
import FileDropTextarea from '../components/FileDropTextarea'

type Language =
  | 'typescript'
  | 'python'
  | 'java'
  | 'go'
  | 'csharp'
  | 'rust'
  | 'php'
  | 'swift'

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'typescript', label: 'TypeScript Interface' },
  { value: 'python', label: 'Python Dataclass' },
  { value: 'java', label: 'Java Class' },
  { value: 'go', label: 'Go Struct' },
  { value: 'csharp', label: 'C# Class' },
  { value: 'rust', label: 'Rust Struct' },
  { value: 'php', label: 'PHP Class' },
  { value: 'swift', label: 'Swift Struct' },
]

// ──────────────────────────────────────────────────────────────────────────────
// Type inference helpers
// ──────────────────────────────────────────────────────────────────────────────

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

function toPascalCase(s: string): string {
  return s
    .replace(/[-_\s]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^(.)/, (_, c: string) => c.toUpperCase())
}

function toCamelCase(s: string): string {
  const p = toPascalCase(s)
  return p.charAt(0).toLowerCase() + p.slice(1)
}

interface FieldInfo {
  key: string
  value: JsonValue
}

function inferType(value: JsonValue, lang: Language, optional: boolean, name: string, collector: Map<string, JsonValue>): string {
  if (value === null) {
    switch (lang) {
      case 'typescript': return optional ? 'string | null' : 'string | null'
      case 'python': return 'Optional[Any]'
      case 'java': return 'Object'
      case 'go': return 'interface{}'
      case 'csharp': return 'object?'
      case 'rust': return 'Option<serde_json::Value>'
      case 'php': return 'mixed'
      case 'swift': return 'Any?'
    }
  }
  if (typeof value === 'boolean') {
    switch (lang) {
      case 'typescript': return 'boolean'
      case 'python': return 'bool'
      case 'java': return 'boolean'
      case 'go': return 'bool'
      case 'csharp': return 'bool'
      case 'rust': return 'bool'
      case 'php': return 'bool'
      case 'swift': return 'Bool'
    }
  }
  if (typeof value === 'number') {
    const isInt = Number.isInteger(value)
    switch (lang) {
      case 'typescript': return isInt ? 'number' : 'number'
      case 'python': return isInt ? 'int' : 'float'
      case 'java': return isInt ? 'int' : 'double'
      case 'go': return isInt ? 'int' : 'float64'
      case 'csharp': return isInt ? 'int' : 'double'
      case 'rust': return isInt ? 'i64' : 'f64'
      case 'php': return isInt ? 'int' : 'float'
      case 'swift': return isInt ? 'Int' : 'Double'
    }
  }
  if (typeof value === 'string') {
    switch (lang) {
      case 'typescript': return 'string'
      case 'python': return 'str'
      case 'java': return 'String'
      case 'go': return 'string'
      case 'csharp': return 'string'
      case 'rust': return 'String'
      case 'php': return 'string'
      case 'swift': return 'String'
    }
  }
  if (Array.isArray(value)) {
    const innerName = toPascalCase(name) + 'Item'
    const itemType = value.length > 0
      ? inferType(value[0], lang, optional, innerName, collector)
      : (lang === 'typescript' ? 'unknown' : lang === 'python' ? 'Any' : lang === 'go' ? 'interface{}' : 'Object')
    switch (lang) {
      case 'typescript': return `${itemType}[]`
      case 'python': return `List[${itemType}]`
      case 'java': return `List<${itemType}>`
      case 'go': return `[]${itemType}`
      case 'csharp': return `List<${itemType}>`
      case 'rust': return `Vec<${itemType}>`
      case 'php': return 'array'
      case 'swift': return `[${itemType}]`
    }
  }
  if (typeof value === 'object') {
    const nestedName = toPascalCase(name)
    collector.set(nestedName, value)
    return nestedName
  }
  return 'unknown'
}

// ──────────────────────────────────────────────────────────────────────────────
// Code generators
// ──────────────────────────────────────────────────────────────────────────────

function collectStructures(obj: { [key: string]: JsonValue }, rootName: string, lang: Language, optional: boolean): Map<string, { [key: string]: JsonValue }> {
  const allStructures = new Map<string, { [key: string]: JsonValue }>()
  const queue: { name: string; obj: { [key: string]: JsonValue } }[] = [{ name: rootName, obj }]

  while (queue.length > 0) {
    const { name, obj: current } = queue.shift()!
    if (allStructures.has(name)) continue
    allStructures.set(name, current)

    for (const [key, val] of Object.entries(current)) {
      const nested = new Map<string, JsonValue>()
      inferType(val, lang, optional, toPascalCase(key), nested)
      for (const [nestedName, nestedVal] of nested) {
        if (typeof nestedVal === 'object' && nestedVal !== null && !Array.isArray(nestedVal)) {
          queue.push({ name: nestedName, obj: nestedVal as { [key: string]: JsonValue } })
        }
      }
    }
  }

  return allStructures
}

function generateTypescript(structures: Map<string, { [key: string]: JsonValue }>, optional: boolean): string {
  const chunks: string[] = []
  const allEntries = [...structures.entries()].reverse()

  for (const [name, obj] of allEntries) {
    const fields: string[] = []
    const nested = new Map<string, JsonValue>()
    for (const [key, val] of Object.entries(obj)) {
      const type = inferType(val, 'typescript', optional, toPascalCase(key), nested)
      const optMark = optional && val === null ? '?' : ''
      fields.push(`  ${key}${optMark}: ${type};`)
    }
    chunks.push(`interface ${name} {\n${fields.join('\n')}\n}`)
  }
  return chunks.join('\n\n')
}

function generatePython(structures: Map<string, { [key: string]: JsonValue }>): string {
  const chunks: string[] = ['from dataclasses import dataclass\nfrom typing import List, Optional, Any']
  const allEntries = [...structures.entries()].reverse()

  for (const [name, obj] of allEntries) {
    const fields: string[] = []
    const nested = new Map<string, JsonValue>()
    for (const [key, val] of Object.entries(obj)) {
      const type = inferType(val, 'python', false, toPascalCase(key), nested)
      fields.push(`    ${key}: ${type}`)
    }
    chunks.push(`@dataclass\nclass ${name}:\n${fields.length > 0 ? fields.join('\n') : '    pass'}`)
  }
  return chunks.join('\n\n')
}

function generateJava(structures: Map<string, { [key: string]: JsonValue }>, includeGetters: boolean): string {
  const chunks: string[] = ['import java.util.List;']
  const allEntries = [...structures.entries()].reverse()

  for (const [name, obj] of allEntries) {
    const entries = Object.entries(obj)
    const nested = new Map<string, JsonValue>()
    const fieldLines: string[] = []
    const getterLines: string[] = []

    for (const [key, val] of entries) {
      const type = inferType(val, 'java', false, toPascalCase(key), nested)
      fieldLines.push(`    private ${type} ${toCamelCase(key)};`)
      if (includeGetters) {
        const cap = toPascalCase(key)
        const camel = toCamelCase(key)
        getterLines.push(
          `    public ${type} get${cap}() { return ${camel}; }`,
          `    public void set${cap}(${type} ${camel}) { this.${camel} = ${camel}; }`
        )
      }
    }

    const body = [
      ...fieldLines,
      ...(getterLines.length > 0 ? ['', ...getterLines] : []),
    ].join('\n')

    chunks.push(`public class ${name} {\n${body}\n}`)
  }
  return chunks.join('\n\n')
}

function generateGo(structures: Map<string, { [key: string]: JsonValue }>): string {
  const chunks: string[] = ['package main']
  const allEntries = [...structures.entries()].reverse()

  for (const [name, obj] of allEntries) {
    const fields: string[] = []
    const nested = new Map<string, JsonValue>()
    for (const [key, val] of Object.entries(obj)) {
      const type = inferType(val, 'go', false, toPascalCase(key), nested)
      const goKey = toPascalCase(key)
      fields.push(`\t${goKey} ${type} \`json:"${key}"\``)
    }
    chunks.push(`type ${name} struct {\n${fields.join('\n')}\n}`)
  }
  return chunks.join('\n\n')
}

function generateCsharp(structures: Map<string, { [key: string]: JsonValue }>, includeGetters: boolean): string {
  const chunks: string[] = ['using System.Collections.Generic;']
  const allEntries = [...structures.entries()].reverse()

  for (const [name, obj] of allEntries) {
    const fields: string[] = []
    const nested = new Map<string, JsonValue>()
    for (const [key, val] of Object.entries(obj)) {
      const type = inferType(val, 'csharp', false, toPascalCase(key), nested)
      const propName = toPascalCase(key)
      if (includeGetters) {
        fields.push(`    public ${type} ${propName} { get; set; }`)
      } else {
        fields.push(`    public ${type} ${propName};`)
      }
    }
    chunks.push(`public class ${name}\n{\n${fields.join('\n')}\n}`)
  }
  return chunks.join('\n\n')
}

function generateRust(structures: Map<string, { [key: string]: JsonValue }>): string {
  const chunks: string[] = ['use serde::{Deserialize, Serialize};']
  const allEntries = [...structures.entries()].reverse()

  for (const [name, obj] of allEntries) {
    const fields: string[] = []
    const nested = new Map<string, JsonValue>()
    for (const [key, val] of Object.entries(obj)) {
      const type = inferType(val, 'rust', false, toPascalCase(key), nested)
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
      const rename = snakeKey !== key ? `    #[serde(rename = "${key}")]\n` : ''
      fields.push(`${rename}    pub ${snakeKey}: ${type},`)
    }
    chunks.push(`#[derive(Debug, Serialize, Deserialize)]\npub struct ${name} {\n${fields.join('\n')}\n}`)
  }
  return chunks.join('\n\n')
}

function generatePhp(structures: Map<string, { [key: string]: JsonValue }>): string {
  const chunks: string[] = ['<?php']
  const allEntries = [...structures.entries()].reverse()

  for (const [name, obj] of allEntries) {
    const fields: string[] = []
    const nested = new Map<string, JsonValue>()
    for (const [key, val] of Object.entries(obj)) {
      const type = inferType(val, 'php', false, toPascalCase(key), nested)
      fields.push(`    public ${type} $${toCamelCase(key)};`)
    }
    chunks.push(`class ${name}\n{\n${fields.join('\n')}\n}`)
  }
  return chunks.join('\n\n')
}

function generateSwift(structures: Map<string, { [key: string]: JsonValue }>): string {
  const chunks: string[] = ['import Foundation']
  const allEntries = [...structures.entries()].reverse()

  for (const [name, obj] of allEntries) {
    const fields: string[] = []
    const nested = new Map<string, JsonValue>()
    for (const [key, val] of Object.entries(obj)) {
      const type = inferType(val, 'swift', false, toPascalCase(key), nested)
      fields.push(`    let ${toCamelCase(key)}: ${type}`)
    }
    chunks.push(`struct ${name}: Codable {\n${fields.join('\n')}\n}`)
  }
  return chunks.join('\n\n')
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────

export default function JsonToCode() {
  const [input, setInput] = useState('{"name":"John Doe","age":30,"email":"john@example.com","address":{"city":"New York","zip":"10001"},"hobbies":["reading","coding","hiking"]}')
  const [language, setLanguage] = useState<Language>('typescript')
  const [rootName, setRootName] = useState('Root')
  const [includeGetters, setIncludeGetters] = useState(true)
  const [optionalFields, setOptionalFields] = useState(false)
  const [copied, setCopied] = useState(false)

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: null }

    let parsed: JsonValue
    try {
      parsed = JSON.parse(input)
    } catch (e: unknown) {
      return { output: '', error: (e as Error).message }
    }

    // Normalize: if array, use first element; if primitive, wrap it
    let obj: { [key: string]: JsonValue }
    if (Array.isArray(parsed)) {
      if (parsed.length === 0 || typeof parsed[0] !== 'object' || parsed[0] === null) {
        return { output: '', error: 'Top-level array must contain objects.' }
      }
      obj = parsed[0] as { [key: string]: JsonValue }
    } else if (typeof parsed === 'object' && parsed !== null) {
      obj = parsed as { [key: string]: JsonValue }
    } else {
      return { output: '', error: 'JSON must be an object or array of objects.' }
    }

    const name = rootName.trim() || 'Root'
    const structures = collectStructures(obj, toPascalCase(name), language, optionalFields)

    try {
      let code: string
      switch (language) {
        case 'typescript': code = generateTypescript(structures, optionalFields); break
        case 'python':     code = generatePython(structures); break
        case 'java':       code = generateJava(structures, includeGetters); break
        case 'go':         code = generateGo(structures); break
        case 'csharp':     code = generateCsharp(structures, includeGetters); break
        case 'rust':       code = generateRust(structures); break
        case 'php':        code = generatePhp(structures); break
        case 'swift':      code = generateSwift(structures); break
        default:           code = ''
      }
      return { output: code, error: null }
    } catch (e: unknown) {
      return { output: '', error: (e as Error).message }
    }
  }, [input, language, rootName, includeGetters, optionalFields])

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const showGetters = language === 'java' || language === 'csharp'
  const showOptional = language === 'typescript'

  return (
    <div className="space-y-4">
      {/* Input */}
      <div>
        <label className="label-text block mb-1">JSON Input</label>
        <FileDropTextarea
          value={input}
          onChange={setInput}
          placeholder={'{\n  "name": "Alice",\n  "age": 30,\n  "active": true\n}'}
          className="h-44"
          accept=".json,text/*"
        />
      </div>

      {/* Options */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Options</h3>

        {/* Language selector */}
        <div>
          <label className="label-text block mb-1.5">Target Language</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.value}
                onClick={() => setLanguage(lang.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors text-left ${
                  language === lang.value
                    ? 'bg-primary-50 dark:bg-primary-900/40 border-primary-400 dark:border-primary-600 text-primary-700 dark:text-primary-300'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row: name + toggles */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="label-text whitespace-nowrap">Class / Struct name</label>
            <input
              type="text"
              value={rootName}
              onChange={e => setRootName(e.target.value)}
              placeholder="Root"
              className="w-32 px-2 py-1 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
            />
          </div>

          {showGetters && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setIncludeGetters(v => !v)}
                className={`w-9 h-5 rounded-full transition-colors relative ${includeGetters ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${includeGetters ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Include getters/setters</span>
            </label>
          )}

          {showOptional && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setOptionalFields(v => !v)}
                className={`w-9 h-5 rounded-full transition-colors relative ${optionalFields ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${optionalFields ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Optional fields (<code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">?</code>)</span>
            </label>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Output */}
      <div>
        <div className="tool-output-header">
          <label className="tool-label flex items-center gap-2">
            <Code2 size={13} />
            Generated Code
          </label>
          <button
            onClick={handleCopy}
            disabled={!output}
            className="btn-ghost text-xs flex items-center gap-1"
          >
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <FileDropTextarea
          value={output}
          onChange={() => {}}
          readOnly
          placeholder="Generated code will appear here..."
          className="h-64"
        />
      </div>
    </div>
  )
}
