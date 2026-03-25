import { useState, useEffect } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { Trash2, Wand2 } from 'lucide-react'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'
import { GqlCodeBlock } from '../lib/codeHighlight'

// --- GraphQL Tokenizer ---
function tokenize(input: string): string[] {
  const tokenRegex = /#.*|"(?:[^"\\\n\r]|\\(?:"|\\|\/|b|f|n|r|t|u[0-9A-Fa-f]{4}))*"|[_A-Za-z][_0-9A-Za-z]*|-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?|!|\$|&|\(|\)|\.\.\.|:|=|\?|@|\[|\]|\{|\/|\|\}|[^\s]/g
  return input.match(tokenRegex) || []
}

// --- GraphQL Formatter ---
function formatGraphQL(input: string, indentSize: number): string {
  const tokens = tokenize(input)
  let result = ''
  let indent = 0
  const pad = () => ' '.repeat(indent * indentSize)
  let lineStarted = false

  const addNewline = () => {
    if (result.endsWith('\n')) return
    result = result.trimEnd() + '\n'
    lineStarted = false
  }

  const addToken = (token: string, spaceBefore = true) => {
    if (!lineStarted) {
      result += pad()
      lineStarted = true
    } else if (spaceBefore) {
      if (!result.endsWith(' ') && !result.endsWith('\n') && !result.endsWith('(') && !result.endsWith('[') && !result.endsWith('{')) {
        result += ' '
      }
    }
    result += token
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const next = tokens[i + 1]

    if (token.startsWith('#')) {
      if (lineStarted) addNewline()
      addToken(token, false)
      addNewline()
      continue
    }

    if (token === '{') {
      addToken('{', true)
      indent++
      addNewline()
    } else if (token === '}') {
      indent = Math.max(0, indent - 1)
      if (lineStarted) addNewline()
      addToken('}', false)
      if (next && next !== '}' && next !== ')' && next !== ']') {
        addNewline()
      }
    } else if (token === '(' || token === '[') {
      addToken(token, true)
    } else if (token === ')' || token === ']') {
      addToken(token, false)
    } else if (token === ':') {
      addToken(':', false)
    } else if (token === ',') {
      continue
    } else {
      addToken(token, true)
      
      const keywordsSameLine = ['query', 'mutation', 'subscription', 'fragment', 'on', 'type', 'interface', 'enum', 'input', 'scalar', 'schema', 'extend', 'directive']
      
      if (next && !['{', '}', '(', ')', '[', ']', ':', ',', '=', '@', '$', '!', '...'].includes(next) && !next.startsWith('#')) {
        if (!keywordsSameLine.includes(token) && !keywordsSameLine.includes(next)) {
           addNewline()
        }
      }
      
      if (next === '...' || next === '@') {
        addNewline()
      }
    }
  }

  return result.trim()
}

// --- GraphQL Minifier ---
function minifyGraphQL(input: string): string {
  const tokens = tokenize(input)
  let result = ''
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.startsWith('#')) continue
    if (token === ',') continue
    
    if (result.length > 0) {
      const lastChar = result[result.length - 1]
      const firstChar = token[0]
      if (/[A-Za-z0-9_]/.test(lastChar) && /[A-Za-z0-9_]/.test(firstChar)) {
        result += ' '
      }
    }
    result += token
  }
  return result
}

const SAMPLE = `query getUser($id: ID!) {
  user(id: $id) @cached {
    id
    username
    email
    profile {
      firstName
      lastName
      avatarUrl
    }
    posts(limit: 10) {
      id
      title
    }
  }
}

fragment UserInfo on User {
  id
  name
}`

export default function GraphQlFormatter() {
  const [input, setInput] = usePersistentState('tool-graphql-input', SAMPLE)
  const [output, setOutput] = useState('')
  const [mode, setMode] = usePersistentState<'format' | 'minify'>('graphql-formatter-mode', 'format')
  const [indent, setIndent] = usePersistentState('graphql-formatter-indent', 2)

  useEffect(() => {
    if (!input.trim()) { setOutput(''); return }
    if (mode === 'format') setOutput(formatGraphQL(input, indent))
    else setOutput(minifyGraphQL(input))
  }, [input, mode, indent])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => setInput(SAMPLE)} className="btn-ghost text-xs">Load Example</button>
        
        <div className="tool-tabs">
          {(['format', 'minify'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`tool-tab capitalize ${mode === m ? 'active' : ''}`}
            >
              {m === 'format' ? 'Beautify' : 'Minify'}
            </button>
          ))}
        </div>

        {mode === 'format' && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ml-auto">
            <span>Indent:</span>
            {[2, 4].map(v => (
              <button
                key={v}
                onClick={() => setIndent(v)}
                className={`px-2 py-0.5 rounded text-xs border transition-colors ${indent === v
                  ? 'bg-primary-100 dark:bg-primary-900 border-primary-400 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}
              >
                {v}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => { setInput(''); setOutput('') }}
          className="btn-ghost flex items-center gap-1 text-xs ml-auto"
        >
          <Trash2 size={12} /> Clear
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Input GraphQL</label>
            {output && mode === 'format' && (
              <button onClick={() => setInput(output)} className="btn-ghost flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 font-medium" title="Apply formatted output to input">
                <Wand2 size={12} /> Format code
              </button>
            )}
          </div>
          <FileDropTextarea
            className="h-80 font-mono text-sm"
            placeholder="query { user { id name } }"
            value={input}
            onChange={setInput}
            accept=".graphql,.gql,text/plain,text/*"
          />
        </div>
        <div>
          <div className="tool-output-header">
            <label className="tool-label">
              {mode === 'format' ? 'Beautified' : 'Minified'} Output
            </label>
            <CopyButton text={output} toast="GraphQL copied" />
          </div>
          <GqlCodeBlock 
            code={output} 
            className="h-80" 
            placeholder="Output will appear here..." 
          />
          {output && (
            <div className="text-xs text-gray-400 mt-1 text-right">
              {output.split('\n').length} lines · {output.length} chars
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
