import { tools } from '../tools-registry'
import type { Tool } from '../types'

interface DetectionResult {
  type: string
  confidence: number
  tools: Tool[]
  label: string
  icon: string
}

const detectors: Array<{
  type: string
  label: string
  icon: string
  toolIds: string[]
  test: (s: string) => number
}> = [
  // ── Data Formats ──────────────────────────────────────────────────────────
  {
    type: 'json',
    label: 'JSON',
    icon: '📋',
    toolIds: ['json-formatter', 'json-minifier', 'json-to-csv', 'json-to-typescript', 'json-to-csharp', 'json-to-code', 'json-schema-validator', 'jsonpath-tester', 'json-to-excel', 'json-diff'],
    test: (s) => {
      const t = s.trim()
      if ((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'))) {
        try { JSON.parse(t); return 1 } catch { return 0.8 }
      }
      return 0
    },
  },
  {
    type: 'yaml',
    label: 'YAML',
    icon: '📝',
    toolIds: ['yaml-json', 'yaml-formatter'],
    test: (s) => {
      const t = s.trim()
      if (t.startsWith('---')) return 0.9
      const lines = t.split('\n')
      const yamlLines = lines.filter(l => /^\s*[\w-]+\s*:/.test(l) && !l.includes('{'))
      if (yamlLines.length >= 2 && yamlLines.length / lines.length > 0.4) return 0.7
      return 0
    },
  },
  {
    type: 'csv',
    label: 'CSV Data',
    icon: '📊',
    toolIds: ['csv-to-json', 'csv-viewer', 'csv-to-excel'],
    test: (s) => {
      const lines = s.trim().split('\n')
      if (lines.length < 2) return 0
      const sep = lines[0]!.includes('\t') ? '\t' : ','
      const counts = lines.map(l => (l.match(new RegExp(sep === '\t' ? '\t' : ',', 'g')) || []).length)
      if (counts[0]! > 0 && counts.slice(1, 6).every(c => c === counts[0])) return 0.85
      return 0
    },
  },
  {
    type: 'xml',
    label: 'XML',
    icon: '📄',
    toolIds: ['xml-formatter', 'xml-minifier'],
    test: (s) => {
      const t = s.trim()
      if (t.startsWith('<?xml')) return 1
      if (/^<[a-zA-Z][\s\S]*>[\s\S]*<\/[a-zA-Z]/.test(t) && !t.startsWith('<html') && !t.startsWith('<!DOCTYPE')) return 0.8
      return 0
    },
  },
  {
    type: 'html',
    label: 'HTML',
    icon: '🌐',
    toolIds: ['html-formatter', 'html-minifier', 'html-to-markdown', 'html-preview', 'html-to-pdf'],
    test: (s) => {
      const t = s.trim()
      if (t.startsWith('<!DOCTYPE') || t.startsWith('<html')) return 0.95
      if (/<(div|span|p|a|img|table|form|section|header|footer|nav|main|article)\b/i.test(t)) return 0.8
      if (/<[a-zA-Z][\s\S]*>[\s\S]*<\/[a-zA-Z]/.test(t) && (t.includes('class=') || t.includes('id='))) return 0.7
      return 0
    },
  },
  {
    type: 'svg',
    label: 'SVG',
    icon: '✏️',
    toolIds: ['svg-previewer', 'svg-to-png'],
    test: (s) => {
      const t = s.trim()
      if (t.includes('<svg') && t.includes('</svg>')) return 1
      return 0
    },
  },
  {
    type: 'env',
    label: '.env Config',
    icon: '🔑',
    toolIds: ['env-parser'],
    test: (s) => {
      const lines = s.trim().split('\n')
      const envLines = lines.filter(l => /^[A-Z][A-Z0-9_]*=/.test(l.trim()) || l.trim().startsWith('#'))
      if (envLines.length >= 2 && envLines.length / lines.length > 0.5) return 0.85
      return 0
    },
  },

  // ── Code / Markup ─────────────────────────────────────────────────────────
  {
    type: 'sql',
    label: 'SQL',
    icon: '🗄️',
    toolIds: ['sql-formatter', 'sql-to-linq', 'sql-syntax'],
    test: (s) => {
      const t = s.trim().toUpperCase()
      if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH)\b/.test(t)) return 0.9
      if (t.includes(' FROM ') && t.includes(' WHERE ')) return 0.8
      return 0
    },
  },
  {
    type: 'sql-ddl',
    label: 'SQL DDL (CREATE TABLE)',
    icon: '🔗',
    toolIds: ['erd-diagram', 'sql-formatter'],
    test: (s) => {
      const t = s.trim().toUpperCase()
      if (t.startsWith('CREATE TABLE')) return 0.95
      if (t.includes('CREATE TABLE') && t.includes('PRIMARY KEY')) return 0.9
      return 0
    },
  },
  {
    type: 'css',
    label: 'CSS',
    icon: '🎨',
    toolIds: ['css-minifier', 'css-formatter', 'css-gradient', 'css-shadow', 'css-filter-generator'],
    test: (s) => {
      const t = s.trim()
      if (/^[.#@]?[a-zA-Z][\s\S]*\{[\s\S]*\}/.test(t)) return 0.7
      if (t.includes('{') && t.includes('}') && t.includes(':') && t.includes(';')) return 0.6
      return 0
    },
  },
  {
    type: 'typescript',
    label: 'TypeScript / JavaScript',
    icon: '📜',
    toolIds: ['ts-to-js', 'js-formatter'],
    test: (s) => {
      const t = s.trim()
      if (t.includes('interface ') && t.includes('{')) return 0.8
      if (t.includes(': string') || t.includes(': number') || t.includes(': boolean')) return 0.7
      if (/^(const|let|var|function|class|import|export)\s/.test(t)) return 0.6
      return 0
    },
  },
  {
    type: 'markdown',
    label: 'Markdown',
    icon: '📝',
    toolIds: ['markdown-to-html', 'markdown-preview', 'markdown-table'],
    test: (s) => {
      const t = s.trim()
      const mdPatterns = [/^#{1,6}\s/m, /^\*\s/m, /^\d+\.\s/m, /\[.*\]\(.*\)/, /\*\*.*\*\*/, /```/]
      const hits = mdPatterns.filter(p => p.test(t)).length
      if (hits >= 2) return 0.7
      return 0
    },
  },
  {
    type: 'mermaid',
    label: 'Mermaid Diagram',
    icon: '🗂️',
    toolIds: ['diagram-creator'],
    test: (s) => {
      const t = s.trim()
      if (/^(graph|flowchart|sequenceDiagram|classDiagram|erDiagram|gantt|pie|mindmap|gitGraph)\b/.test(t)) return 0.95
      return 0
    },
  },

  // ── Tokens / Encoding ─────────────────────────────────────────────────────
  {
    type: 'jwt',
    label: 'JWT Token',
    icon: '🎟️',
    toolIds: ['jwt-decoder', 'jwt-encoder'],
    test: (s) => {
      const t = s.trim()
      if (/^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(t)) return 1
      if (t.startsWith('eyJ') && t.includes('.')) return 0.7
      return 0
    },
  },
  {
    type: 'base64',
    label: 'Base64',
    icon: '🔐',
    toolIds: ['base64-encode-decode'],
    test: (s) => {
      const t = s.trim()
      if (t.length < 8) return 0
      if (/^[A-Za-z0-9+/]+=*$/.test(t) && t.length > 20) {
        try { atob(t); return 0.8 } catch { return 0 }
      }
      return 0
    },
  },
  {
    type: 'hex',
    label: 'Hex Encoded',
    icon: '🔢',
    toolIds: ['hex-encode-decode'],
    test: (s) => {
      const t = s.trim().replace(/\s+/g, '')
      if (/^[0-9a-fA-F]+$/.test(t) && t.length >= 6 && t.length % 2 === 0 && t.length > 10) return 0.7
      return 0
    },
  },
  {
    type: 'html-entities',
    label: 'HTML Entities',
    icon: '🔤',
    toolIds: ['html-encode-decode'],
    test: (s) => {
      const t = s.trim()
      if (/&(amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);/i.test(t)) return 0.8
      return 0
    },
  },
  {
    type: 'url-encoded',
    label: 'URL Encoded',
    icon: '🔗',
    toolIds: ['url-encode-decode'],
    test: (s) => {
      const t = s.trim()
      const pctCount = (t.match(/%[0-9A-Fa-f]{2}/g) || []).length
      if (pctCount >= 3) return 0.85
      if (pctCount >= 1 && t.length < 200) return 0.5
      return 0
    },
  },
  {
    type: 'pem-cert',
    label: 'PEM Certificate',
    icon: '📜',
    toolIds: ['cert-decoder'],
    test: (s) => {
      const t = s.trim()
      if (t.startsWith('-----BEGIN CERTIFICATE-----')) return 1
      if (t.startsWith('-----BEGIN')) return 0.8
      return 0
    },
  },
  {
    type: 'bcrypt',
    label: 'BCrypt Hash',
    icon: '🔒',
    toolIds: ['bcrypt'],
    test: (s) => {
      const t = s.trim()
      if (/^\$2[aby]?\$\d{2}\$.{53}$/.test(t)) return 1
      return 0
    },
  },

  // ── URLs / Network ────────────────────────────────────────────────────────
  {
    type: 'url',
    label: 'URL',
    icon: '🌐',
    toolIds: ['url-parser', 'url-encode-decode', 'qr-generator'],
    test: (s) => {
      const t = s.trim()
      if (/^https?:\/\//.test(t)) return 0.9
      return 0
    },
  },
  {
    type: 'curl',
    label: 'Curl Command',
    icon: '⚡',
    toolIds: ['curl-to-code', 'http-request-builder'],
    test: (s) => {
      const t = s.trim()
      if (/^curl\s+/i.test(t)) return 1
      return 0
    },
  },
  {
    type: 'ip',
    label: 'IP Address',
    icon: '📍',
    toolIds: ['ip-lookup', 'cidr-calculator'],
    test: (s) => {
      const t = s.trim()
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\/\d{1,2})?$/.test(t)) return 0.9
      if (/^[\da-f:]+$/i.test(t) && t.includes(':') && t.length > 6) return 0.7 // IPv6
      return 0
    },
  },
  {
    type: 'domain',
    label: 'Domain Name',
    icon: '🌐',
    toolIds: ['dns-lookup', 'ssl-checker'],
    test: (s) => {
      const t = s.trim()
      if (/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/.test(t)) return 0.85
      return 0
    },
  },
  {
    type: 'user-agent',
    label: 'User-Agent',
    icon: '🕵️',
    toolIds: ['user-agent-parser'],
    test: (s) => {
      const t = s.trim()
      if (/Mozilla\/\d/.test(t) && t.includes('(') && (t.includes('Chrome') || t.includes('Firefox') || t.includes('Safari'))) return 0.95
      return 0
    },
  },
  {
    type: 'conn-string',
    label: 'Connection String',
    icon: '🔌',
    toolIds: ['connection-string-builder'],
    test: (s) => {
      const t = s.trim()
      if (/Server=|Data Source=|Host=|mongodb(\+srv)?:\/\//i.test(t)) return 0.9
      if (/Initial Catalog=|Database=|Uid=|User Id=/i.test(t)) return 0.8
      return 0
    },
  },

  // ── Color / Design ────────────────────────────────────────────────────────
  {
    type: 'color',
    label: 'Color Code',
    icon: '🎨',
    toolIds: ['color-converter', 'color-contrast'],
    test: (s) => {
      const t = s.trim()
      if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(t)) return 1
      if (/^rgba?\s*\(/.test(t)) return 0.9
      if (/^hsla?\s*\(/.test(t)) return 0.9
      return 0
    },
  },

  // ── Dev / Misc ────────────────────────────────────────────────────────────
  {
    type: 'uuid',
    label: 'UUID',
    icon: '🆔',
    toolIds: ['uuid-generator'],
    test: (s) => {
      const t = s.trim()
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)) return 1
      return 0
    },
  },
  {
    type: 'regex',
    label: 'Regular Expression',
    icon: '🔍',
    toolIds: ['regex-tester'],
    test: (s) => {
      const t = s.trim()
      if (/^\/.*\/[gimsuy]*$/.test(t)) return 0.9
      return 0
    },
  },
  {
    type: 'cron',
    label: 'Cron Expression',
    icon: '⏰',
    toolIds: ['cron-parser'],
    test: (s) => {
      const t = s.trim()
      const parts = t.split(/\s+/)
      if ((parts.length === 5 || parts.length === 6) && parts.every(p => /^[\d*,\-\/]+$/.test(p))) return 0.85
      return 0
    },
  },
  {
    type: 'unix-ts',
    label: 'Unix Timestamp',
    icon: '📅',
    toolIds: ['unix-timestamp'],
    test: (s) => {
      const t = s.trim()
      if (/^\d{10}$/.test(t)) { const n = parseInt(t); if (n > 946684800 && n < 2524608000) return 0.9 }
      if (/^\d{13}$/.test(t)) { const n = parseInt(t); if (n > 946684800000 && n < 2524608000000) return 0.9 }
      return 0
    },
  },
  {
    type: 'chmod',
    label: 'Unix Permissions',
    icon: '🔐',
    toolIds: ['chmod-calculator'],
    test: (s) => {
      const t = s.trim()
      if (/^[0-7]{3,4}$/.test(t)) return 0.7
      if (/^[rwx-]{9,10}$/.test(t)) return 0.85
      return 0
    },
  },
  {
    type: 'log',
    label: 'Log / Server Output',
    icon: '📋',
    toolIds: ['log-viewer'],
    test: (s) => {
      const lines = s.trim().split('\n')
      if (lines.length < 2) return 0
      const jsonLogLines = lines.filter(l => {
        const t = l.trim()
        if (!t.startsWith('{')) return false
        try {
          const o = JSON.parse(t)
          return o && typeof o === 'object' && ('level' in o || 'Level' in o || 'severity' in o || 'message' in o || 'msg' in o)
        } catch { return false }
      })
      if (jsonLogLines.length >= 2) return 0.95
      const logPatternLines = lines.filter(l =>
        /\b(ERROR|WARN|INFO|DEBUG|TRACE|FATAL|ERR|WRN|INF|DBG|TRC)\b/i.test(l) ||
        /^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}/.test(l.trim()) ||
        /^\[\d{2}:\d{2}:\d{2}/.test(l.trim()) ||
        /^\S+\s+\S+\s+\S+\s+\[\d{2}\/\w{3}\/\d{4}/.test(l.trim())
      )
      if (logPatternLines.length >= 3 && logPatternLines.length / lines.length > 0.3) return 0.85
      if (logPatternLines.length >= 2) return 0.6
      return 0
    },
  },
  {
    type: 'sql-explain',
    label: 'SQL Execution Plan',
    icon: '📊',
    toolIds: ['sql-plan-viewer'],
    test: (s) => {
      const t = s.trim()
      if (/QUERY PLAN|Seq Scan|Index Scan|Nested Loop|Hash Join|Sort|Aggregate/i.test(t) && t.includes('->')) return 0.9
      if (t.toUpperCase().startsWith('EXPLAIN')) return 0.7
      return 0
    },
  },
  {
    type: 'csharp',
    label: 'C# Code',
    icon: '🔷',
    toolIds: ['csharp-string-escape', 'json-to-csharp'],
    test: (s) => {
      const t = s.trim()
      if (/\bnamespace\s+\w+/.test(t) && /\bclass\s+\w+/.test(t)) return 0.85
      if (/\b(using System|public class|private|protected|internal)\b/.test(t)) return 0.7
      return 0
    },
  },
]

export function detectContent(input: string): DetectionResult[] {
  if (!input.trim() || input.trim().length < 2) return []

  const results: DetectionResult[] = []

  for (const d of detectors) {
    const confidence = d.test(input)
    if (confidence > 0.4) {
      const matchedTools = d.toolIds
        .map(id => tools.find(t => t.id === id))
        .filter(Boolean) as Tool[]
      if (matchedTools.length > 0) {
        results.push({
          type: d.type,
          confidence,
          tools: matchedTools,
          label: d.label,
          icon: d.icon,
        })
      }
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence)
}

