// Shared code syntax highlighters for C#, JSON, CSS
// VS Code-inspired color palette

// ─── C# Highlighter ──────────────────────────────────────────────────────────

const CS_KEYWORDS = new Set([
  'using','namespace','class','struct','interface','enum','record','delegate',
  'public','private','protected','internal','static','abstract','virtual','override',
  'sealed','partial','readonly','const','new','this','base','typeof','sizeof','nameof',
  'void','return','yield','break','continue','throw','try','catch','finally',
  'if','else','switch','case','default','for','foreach','while','do','in',
  'var','dynamic','async','await','lock','using','checked','unchecked',
  'is','as','ref','out','params','get','set','init','add','remove','value',
  'null','true','false','when','with',
])

const CS_TYPES = new Set([
  'string','int','long','short','byte','sbyte','uint','ulong','ushort',
  'bool','char','float','double','decimal','object','void',
  'String','Int32','Int64','Boolean','DateTime','DateOnly','TimeOnly',
  'Guid','Uri','TimeSpan','List','Dictionary','IList','IEnumerable',
  'ICollection','Task','ValueTask','Action','Func','Nullable','Tuple',
  'Array','Span','Memory','ReadOnlySpan',
])

type CsTokenType = 'keyword' | 'type' | 'string' | 'number' | 'comment' | 'attribute' | 'method' | 'plain'

interface CsToken { type: CsTokenType; text: string }

function tokenizeCsharp(code: string): CsToken[] {
  const tokens: CsToken[] = []
  let i = 0

  while (i < code.length) {
    // Line comment
    if (code[i] === '/' && code[i + 1] === '/') {
      let end = code.indexOf('\n', i)
      if (end === -1) end = code.length
      tokens.push({ type: 'comment', text: code.slice(i, end) })
      i = end; continue
    }
    // Block comment
    if (code[i] === '/' && code[i + 1] === '*') {
      let end = code.indexOf('*/', i + 2)
      if (end === -1) end = code.length - 2
      tokens.push({ type: 'comment', text: code.slice(i, end + 2) })
      i = end + 2; continue
    }
    // Verbatim string @"..."
    if (code[i] === '@' && code[i + 1] === '"') {
      let j = i + 2
      while (j < code.length) {
        if (code[j] === '"' && code[j + 1] !== '"') break
        if (code[j] === '"') j++
        j++
      }
      tokens.push({ type: 'string', text: code.slice(i, j + 1) })
      i = j + 1; continue
    }
    // Interpolated string $"..."
    if (code[i] === '$' && code[i + 1] === '"') {
      let j = i + 2, depth = 0
      while (j < code.length) {
        if (code[j] === '{') { depth++; j++; continue }
        if (code[j] === '}' && depth > 0) { depth--; j++; continue }
        if (depth === 0 && code[j] === '"') break
        j++
      }
      tokens.push({ type: 'string', text: code.slice(i, j + 1) })
      i = j + 1; continue
    }
    // Regular string
    if (code[i] === '"') {
      let j = i + 1
      while (j < code.length && !(code[j] === '"' && code[j - 1] !== '\\')) j++
      tokens.push({ type: 'string', text: code.slice(i, j + 1) })
      i = j + 1; continue
    }
    // Char literal
    if (code[i] === "'") {
      let j = i + 1
      if (code[j] === '\\') j++
      j += 2
      tokens.push({ type: 'string', text: code.slice(i, j) })
      i = j; continue
    }
    // Attribute [Something]
    if (code[i] === '[') {
      let j = code.indexOf(']', i)
      if (j !== -1) {
        tokens.push({ type: 'attribute', text: code.slice(i, j + 1) })
        i = j + 1; continue
      }
    }
    // Number
    if (/[0-9]/.test(code[i])) {
      let j = i
      while (j < code.length && /[0-9._xXabcdefABCDEFulUL]/.test(code[j])) j++
      tokens.push({ type: 'number', text: code.slice(i, j) })
      i = j; continue
    }
    // Word
    if (/[a-zA-Z_$@]/.test(code[i])) {
      let j = i
      if (code[j] === '@') j++ // verbatim identifier
      while (j < code.length && /[\w$]/.test(code[j])) j++
      const word = code.slice(i, j)
      const clean = word.startsWith('@') ? word.slice(1) : word
      let type: CsTokenType = 'plain'
      if (CS_KEYWORDS.has(clean)) type = 'keyword'
      else if (CS_TYPES.has(clean)) type = 'type'
      else if (code[j] === '(') type = 'method'
      tokens.push({ type, text: word })
      i = j; continue
    }
    tokens.push({ type: 'plain', text: code[i] })
    i++
  }
  return tokens
}

const CS_COLORS: Record<CsTokenType, string> = {
  keyword:   'text-[#569cd6]',
  type:      'text-[#4ec9b0]',
  string:    'text-[#ce9178]',
  number:    'text-[#b5cea8]',
  comment:   'text-[#6a9955] italic',
  attribute: 'text-[#c8c8a9]',
  method:    'text-[#dcdcaa]',
  plain:     'text-[#d4d4d4]',
}

export function CsharpHighlight({ code }: { code: string }) {
  return (
    <code>
      {tokenizeCsharp(code).map((t, i) => (
        <span key={i} className={CS_COLORS[t.type]}>{t.text}</span>
      ))}
    </code>
  )
}

export function CsharpCodeBlock({
  code,
  className = '',
  placeholder = '',
}: { code: string; className?: string; placeholder?: string }) {
  return (
    <pre className={`bg-[#1e1e1e] rounded-xl p-3 font-mono text-xs overflow-auto whitespace-pre ${className}`}>
      {code ? <CsharpHighlight code={code} /> : <span className="text-gray-500">{placeholder}</span>}
    </pre>
  )
}

// ─── JSON Highlighter ─────────────────────────────────────────────────────────

type JsonTokenType = 'key' | 'string' | 'number' | 'boolean' | 'null' | 'punctuation' | 'plain'
interface JsonToken { type: JsonTokenType; text: string }

function tokenizeJson(code: string): JsonToken[] {
  const tokens: JsonToken[] = []
  let i = 0
  let lastPunct = ''

  while (i < code.length) {
    // String
    if (code[i] === '"') {
      let j = i + 1
      while (j < code.length) {
        if (code[j] === '\\') { j += 2; continue }
        if (code[j] === '"') break
        j++
      }
      const str = code.slice(i, j + 1)
      // If preceded by { or , (after whitespace) → key
      const type: JsonTokenType = (lastPunct === '{' || lastPunct === ',') ? 'key' : 'string'
      tokens.push({ type, text: str })
      i = j + 1; continue
    }
    // Number
    if (/[-0-9]/.test(code[i]) && (i === 0 || /[\s:,[\]{]/.test(code[i - 1]))) {
      let j = i
      if (code[j] === '-') j++
      while (j < code.length && /[0-9.eE+\-]/.test(code[j])) j++
      tokens.push({ type: 'number', text: code.slice(i, j) })
      i = j; continue
    }
    // true / false / null
    if (/[tfn]/.test(code[i])) {
      const keywords = ['true', 'false', 'null']
      const match = keywords.find(k => code.startsWith(k, i))
      if (match) {
        tokens.push({ type: match === 'null' ? 'null' : 'boolean', text: match })
        i += match.length; continue
      }
    }
    // Punctuation
    if (/[{}[\]:,]/.test(code[i])) {
      if (code[i] !== ':') lastPunct = code[i]
      tokens.push({ type: 'punctuation', text: code[i] })
      i++; continue
    }
    tokens.push({ type: 'plain', text: code[i] })
    i++
  }
  return tokens
}

const JSON_COLORS: Record<JsonTokenType, string> = {
  key:        'text-[#9cdcfe]',
  string:     'text-[#ce9178]',
  number:     'text-[#b5cea8]',
  boolean:    'text-[#569cd6]',
  null:       'text-[#569cd6]',
  punctuation:'text-[#d4d4d4]',
  plain:      'text-[#d4d4d4]',
}

export function JsonHighlight({ code }: { code: string }) {
  return (
    <code>
      {tokenizeJson(code).map((t, i) => (
        <span key={i} className={JSON_COLORS[t.type]}>{t.text}</span>
      ))}
    </code>
  )
}

export function JsonCodeBlock({
  code,
  className = '',
  placeholder = '',
}: { code: string; className?: string; placeholder?: string }) {
  return (
    <pre className={`bg-[#1e1e1e] rounded-xl p-3 font-mono text-xs overflow-auto whitespace-pre ${className}`}>
      {code ? <JsonHighlight code={code} /> : <span className="text-gray-500">{placeholder}</span>}
    </pre>
  )
}

// ─── CSS Highlighter ──────────────────────────────────────────────────────────

const CSS_PROPS = new Set([
  'color','background','background-color','font-size','font-weight','font-family',
  'margin','padding','border','width','height','display','position','top','left',
  'right','bottom','flex','grid','gap','align-items','justify-content','z-index',
  'opacity','transform','transition','animation','filter','overflow','cursor',
  'border-radius','box-shadow','text-align','text-decoration','line-height',
  'letter-spacing','white-space','visibility','content','pointer-events',
])

type CssTokenType = 'atrule' | 'selector' | 'property' | 'value' | 'string' | 'number' | 'comment' | 'punctuation' | 'plain'
interface CssToken { type: CssTokenType; text: string }

function tokenizeCss(code: string): CssToken[] {
  const tokens: CssToken[] = []
  let i = 0
  let inBlock = false

  while (i < code.length) {
    // Comment
    if (code[i] === '/' && code[i + 1] === '*') {
      let end = code.indexOf('*/', i + 2)
      if (end === -1) end = code.length - 2
      tokens.push({ type: 'comment', text: code.slice(i, end + 2) })
      i = end + 2; continue
    }
    // String
    if (code[i] === '"' || code[i] === "'") {
      const q = code[i]; let j = i + 1
      while (j < code.length && code[j] !== q) j++
      tokens.push({ type: 'string', text: code.slice(i, j + 1) })
      i = j + 1; continue
    }
    // At-rule
    if (code[i] === '@') {
      let j = i + 1
      while (j < code.length && /[\w-]/.test(code[j])) j++
      tokens.push({ type: 'atrule', text: code.slice(i, j) })
      i = j; continue
    }
    // Block delimiters
    if (code[i] === '{') { inBlock = true; tokens.push({ type: 'punctuation', text: '{' }); i++; continue }
    if (code[i] === '}') { inBlock = false; tokens.push({ type: 'punctuation', text: '}' }); i++; continue }
    if (code[i] === ':' || code[i] === ';') { tokens.push({ type: 'punctuation', text: code[i] }); i++; continue }
    // Number + unit
    if (/[0-9]/.test(code[i]) || (code[i] === '-' && /[0-9]/.test(code[i + 1]))) {
      let j = i
      if (code[j] === '-') j++
      while (j < code.length && /[0-9.]/.test(code[j])) j++
      while (j < code.length && /[a-zA-Z%]/.test(code[j])) j++ // unit
      tokens.push({ type: 'number', text: code.slice(i, j) })
      i = j; continue
    }
    // Hex color
    if (code[i] === '#' && /[0-9a-fA-F]/.test(code[i + 1])) {
      let j = i + 1
      while (j < code.length && /[0-9a-fA-F]/.test(code[j])) j++
      tokens.push({ type: 'number', text: code.slice(i, j) })
      i = j; continue
    }
    // Word
    if (/[a-zA-Z_-]/.test(code[i])) {
      let j = i
      while (j < code.length && /[\w-]/.test(code[j])) j++
      const word = code.slice(i, j)
      let type: CssTokenType = 'plain'
      if (!inBlock) type = 'selector'
      else if (CSS_PROPS.has(word)) type = 'property'
      else type = 'value'
      tokens.push({ type, text: word })
      i = j; continue
    }
    tokens.push({ type: 'plain', text: code[i] })
    i++
  }
  return tokens
}

const CSS_COLORS: Record<CssTokenType, string> = {
  atrule:     'text-[#c586c0]',
  selector:   'text-[#d7ba7d]',
  property:   'text-[#9cdcfe]',
  value:      'text-[#ce9178]',
  string:     'text-[#ce9178]',
  number:     'text-[#b5cea8]',
  comment:    'text-[#6a9955] italic',
  punctuation:'text-[#d4d4d4]',
  plain:      'text-[#d4d4d4]',
}

export function CssHighlight({ code }: { code: string }) {
  return (
    <code>
      {tokenizeCss(code).map((t, i) => (
        <span key={i} className={CSS_COLORS[t.type]}>{t.text}</span>
      ))}
    </code>
  )
}

export function CssCodeBlock({
  code,
  className = '',
  placeholder = '',
}: { code: string; className?: string; placeholder?: string }) {
  return (
    <pre className={`bg-[#1e1e1e] rounded-xl p-3 font-mono text-xs overflow-auto whitespace-pre ${className}`}>
      {code ? <CssHighlight code={code} /> : <span className="text-gray-500">{placeholder}</span>}
    </pre>
  )
}
