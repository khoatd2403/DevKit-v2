import { useState, useRef, useCallback } from 'react'
import { History, X, CornerDownLeft, Variable } from 'lucide-react'

// ── Tokenizer ────────────────────────────────────────────────────────────────

type TokenType =
  | 'NUMBER' | 'IDENT' | 'PLUS' | 'MINUS' | 'STAR' | 'SLASH' | 'PERCENT'
  | 'CARET' | 'STARSTAR' | 'LPAREN' | 'RPAREN' | 'COMMA' | 'EOF'
  | 'ASSIGN' | 'LET'

interface Token { type: TokenType; value: string }

function tokenize(expr: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < expr.length) {
    const ch = expr[i]!
    if (/\s/.test(ch)) { i++; continue }
    if (ch === '#') { while (i < expr.length && expr[i] !== '\n') i++; continue } // comment
    if (/\d/.test(ch) || (ch === '.' && /\d/.test(expr[i + 1] ?? ''))) {
      let num = ''
      while (i < expr.length && /[\d.]/.test(expr[i]!)) num += expr[i++]
      if (expr[i] === 'e' || expr[i] === 'E') {
        num += expr[i++]
        if (expr[i] === '+' || expr[i] === '-') num += expr[i++]
        while (i < expr.length && /\d/.test(expr[i]!)) num += expr[i++]
      }
      tokens.push({ type: 'NUMBER', value: num })
      continue
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let ident = ''
      while (i < expr.length && /[a-zA-Z_0-9]/.test(expr[i]!)) ident += expr[i++]
      if (ident === 'let') tokens.push({ type: 'LET', value: ident })
      else tokens.push({ type: 'IDENT', value: ident })
      continue
    }
    if (ch === '*' && expr[i + 1] === '*') { tokens.push({ type: 'STARSTAR', value: '**' }); i += 2; continue }
    switch (ch) {
      case '+': tokens.push({ type: 'PLUS', value: '+' }); break
      case '-': tokens.push({ type: 'MINUS', value: '-' }); break
      case '*': tokens.push({ type: 'STAR', value: '*' }); break
      case '/': tokens.push({ type: 'SLASH', value: '/' }); break
      case '%': tokens.push({ type: 'PERCENT', value: '%' }); break
      case '^': tokens.push({ type: 'CARET', value: '^' }); break
      case '(': tokens.push({ type: 'LPAREN', value: '(' }); break
      case ')': tokens.push({ type: 'RPAREN', value: ')' }); break
      case ',': tokens.push({ type: 'COMMA', value: ',' }); break
      case '=': tokens.push({ type: 'ASSIGN', value: '=' }); break
      default: throw new Error(`Unexpected character: '${ch}'`)
    }
    i++
  }
  tokens.push({ type: 'EOF', value: '' })
  return tokens
}

// ── Parser / Evaluator ───────────────────────────────────────────────────────

const MATH_FUNCS: Record<string, (...args: number[]) => number> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  atan2: Math.atan2,
  sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  sqrt: Math.sqrt, cbrt: Math.cbrt,
  abs: Math.abs, sign: Math.sign,
  log: Math.log, log2: Math.log2, log10: Math.log10,
  ln: Math.log,
  exp: Math.exp,
  floor: Math.floor, ceil: Math.ceil, round: Math.round,
  trunc: Math.trunc,
  min: Math.min, max: Math.max,
  pow: Math.pow, hypot: Math.hypot,
  random: Math.random,
}

const MATH_CONSTS: Record<string, number> = {
  PI: Math.PI, E: Math.E, LN2: Math.LN2, LN10: Math.LN10,
  LOG2E: Math.LOG2E, LOG10E: Math.LOG10E,
  SQRT2: Math.SQRT2, Infinity: Infinity, NaN: NaN,
  pi: Math.PI, e: Math.E,
}

class Parser {
  private tokens: Token[]
  private pos = 0
  private vars: Record<string, number>

  constructor(tokens: Token[], vars: Record<string, number>) {
    this.tokens = tokens
    this.vars = vars
  }

  private peek(): Token { return this.tokens[this.pos]! }
  private consume(): Token { return this.tokens[this.pos++]! }
  private expect(type: TokenType): Token {
    const t = this.consume()
    if (t.type !== type) throw new Error(`Expected ${type} but got ${t.type} ('${t.value}')`)
    return t
  }

  parse(): number {
    // Check for assignment: [let] ident = expr
    const saved = this.pos
    try {
      if (this.peek().type === 'LET') this.consume()
      if (this.peek().type === 'IDENT') {
        const name = this.consume().value
        if (this.peek().type === 'ASSIGN') {
          this.consume()
          const val = this.parseExpr()
          this.expect('EOF')
          this.vars[name] = val
          return val
        }
      }
    } catch { /* fall through */ }
    this.pos = saved
    const val = this.parseExpr()
    this.expect('EOF')
    return val
  }

  private parseExpr(): number { return this.parseAddSub() }

  private parseAddSub(): number {
    let left = this.parseMulDiv()
    while (this.peek().type === 'PLUS' || this.peek().type === 'MINUS') {
      const op = this.consume().type
      const right = this.parseMulDiv()
      left = op === 'PLUS' ? left + right : left - right
    }
    return left
  }

  private parseMulDiv(): number {
    let left = this.parsePower()
    while (['STAR', 'SLASH', 'PERCENT'].includes(this.peek().type)) {
      const op = this.consume().type
      const right = this.parsePower()
      if (op === 'STAR') left *= right
      else if (op === 'SLASH') left /= right
      else left %= right
    }
    return left
  }

  private parsePower(): number {
    let base = this.parseUnary()
    if (this.peek().type === 'STARSTAR' || this.peek().type === 'CARET') {
      this.consume()
      const exp = this.parseUnary() // right-associative: recurse into parsePower for true right-assoc
      base = Math.pow(base, exp)
    }
    return base
  }

  private parseUnary(): number {
    if (this.peek().type === 'MINUS') { this.consume(); return -this.parseUnary() }
    if (this.peek().type === 'PLUS') { this.consume(); return this.parseUnary() }
    return this.parsePostfix()
  }

  private parsePostfix(): number {
    return this.parsePrimary()
  }

  private parsePrimary(): number {
    const t = this.peek()
    if (t.type === 'NUMBER') { this.consume(); return parseFloat(t.value) }
    if (t.type === 'LPAREN') {
      this.consume()
      const val = this.parseExpr()
      this.expect('RPAREN')
      return val
    }
    if (t.type === 'IDENT') {
      this.consume()
      const name = t.value
      // Function call
      if (this.peek().type === 'LPAREN') {
        this.consume()
        const args: number[] = []
        if (this.peek().type !== 'RPAREN') {
          args.push(this.parseExpr())
          while (this.peek().type === 'COMMA') { this.consume(); args.push(this.parseExpr()) }
        }
        this.expect('RPAREN')
        const fn = MATH_FUNCS[name]
        if (!fn) throw new Error(`Unknown function: ${name}`)
        return fn(...args)
      }
      // Constant
      if (name in MATH_CONSTS) return MATH_CONSTS[name]!
      // Variable
      if (name in this.vars) return this.vars[name]!
      throw new Error(`Unknown identifier: ${name}`)
    }
    throw new Error(`Unexpected token: '${t.value}' (${t.type})`)
  }
}

// ── Evaluator entry point ────────────────────────────────────────────────────

function evaluate(expr: string, vars: Record<string, number>): { result: number; assignedVar?: string } {
  const trimmed = expr.trim()
  if (!trimmed) throw new Error('Empty expression')
  const tokens = tokenize(trimmed)

  // Detect assignment for return info
  let assignedVar: string | undefined
  const assignMatch = trimmed.match(/^(?:let\s+)?([a-zA-Z_][a-zA-Z_0-9]*)\s*=\s*/)
  if (assignMatch) assignedVar = assignMatch[1]

  const parser = new Parser(tokens, vars)
  const result = parser.parse()
  return { result, assignedVar }
}

// ── Component ────────────────────────────────────────────────────────────────

interface HistoryEntry { expr: string; result: number; display: string }

function formatResult(n: number): string {
  if (Number.isNaN(n)) return 'NaN'
  if (!isFinite(n)) return n > 0 ? '+Infinity' : '-Infinity'
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return n.toString()
  if (Math.abs(n) >= 1e12 || (Math.abs(n) < 1e-6 && n !== 0)) return n.toExponential(8).replace(/\.?0+e/, 'e')
  return parseFloat(n.toPrecision(12)).toString()
}

export default function MathEvaluator() {
  const [input, setInput] = useState('sqrt(16) + 2^8 - sin(PI/2)')
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [vars, setVars] = useState<Record<string, number>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  const handleEvaluate = useCallback(() => {
    const expr = input.trim()
    if (!expr) return
    try {
      const varsCopy = { ...vars }
      const { result: res, assignedVar } = evaluate(expr, varsCopy)
      setVars(varsCopy)
      setResult(res)
      setError('')

      const display = assignedVar
        ? `${assignedVar} = ${formatResult(res)}`
        : formatResult(res)

      setHistory(prev => {
        const entry: HistoryEntry = { expr, result: res, display }
        const next = [entry, ...prev.filter(h => h.expr !== expr)].slice(0, 10)
        return next
      })
    } catch (e) {
      setError((e as Error).message)
      setResult(null)
    }
  }, [input, vars])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEvaluate()
  }

  const restoreFromHistory = (entry: HistoryEntry) => {
    setInput(entry.expr)
    setResult(entry.result)
    setError('')
    inputRef.current?.focus()
  }

  const clearHistory = () => setHistory([])
  const clearVars = () => setVars({})

  const varEntries = Object.entries(vars)

  return (
    <div className="space-y-4">
      {/* Expression input */}
      <div>
        <label className="label-text block mb-1">Expression</label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-base font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400 dark:placeholder-gray-600"
            value={input}
            onChange={e => { setInput(e.target.value); setError('') }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 2 ** 10, sin(PI/6), let x = 5"
            spellCheck={false}
            autoComplete="off"
          />
          <button onClick={handleEvaluate} className="btn-primary flex items-center gap-1.5">
            <CornerDownLeft size={15} /> Evaluate
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Press <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-xs">Enter</kbd> to evaluate
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="tool-msg tool-msg--error font-mono">
          {error}
        </p>
      )}

      {/* Result */}
      {result !== null && !error && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-1 font-mono">{input.trim()}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-lg">=</span>
            <span className="text-4xl font-mono font-bold text-primary-600 dark:text-primary-400 break-all">
              {formatResult(result)}
            </span>
          </div>
          {/* Additional representations */}
          {Number.isFinite(result) && result !== 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {!Number.isInteger(result) && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5">
                  <p className="text-xs text-gray-400">Decimal</p>
                  <p className="font-mono text-sm text-gray-700 dark:text-gray-300">{result.toFixed(8).replace(/\.?0+$/, '')}</p>
                </div>
              )}
              {Number.isFinite(result) && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5">
                  <p className="text-xs text-gray-400">Scientific</p>
                  <p className="font-mono text-sm text-gray-700 dark:text-gray-300">{result.toExponential(4)}</p>
                </div>
              )}
              {Number.isInteger(result) && result > 0 && result < 2 ** 32 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5">
                  <p className="text-xs text-gray-400">Hex</p>
                  <p className="font-mono text-sm text-gray-700 dark:text-gray-300">0x{result.toString(16).toUpperCase()}</p>
                </div>
              )}
              {Number.isInteger(result) && result > 0 && result < 2 ** 32 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5">
                  <p className="text-xs text-gray-400">Binary</p>
                  <p className="font-mono text-sm text-gray-700 dark:text-gray-300 break-all">{result.toString(2)}</p>
                </div>
              )}
              {Number.isInteger(result) && result > 0 && result < 2 ** 32 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5">
                  <p className="text-xs text-gray-400">Octal</p>
                  <p className="font-mono text-sm text-gray-700 dark:text-gray-300">0o{result.toString(8)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Variables */}
      {varEntries.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Variable size={13} /> Variables
            </h3>
            <button onClick={clearVars} className="btn-ghost text-xs py-0.5 px-2">Clear</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {varEntries.map(([name, val]) => (
              <div
                key={name}
                className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => { setInput(name); inputRef.current?.focus() }}
              >
                <span className="text-xs font-mono text-primary-600 dark:text-primary-400 font-semibold">{name}</span>
                <span className="text-xs text-gray-400">=</span>
                <span className="text-xs font-mono text-gray-700 dark:text-gray-300">{formatResult(val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <History size={13} /> History
            </h3>
            <button onClick={clearHistory} className="btn-ghost text-xs py-0.5 px-2 flex items-center gap-1">
              <X size={11} /> Clear
            </button>
          </div>
          <div className="space-y-1">
            {history.map((entry, i) => (
              <button
                key={i}
                className="w-full flex items-center justify-between gap-4 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group"
                onClick={() => restoreFromHistory(entry)}
              >
                <span className="font-mono text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 truncate">
                  {entry.expr}
                </span>
                <span className="font-mono text-sm font-semibold text-primary-600 dark:text-primary-400 shrink-0">
                  = {entry.display}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Help */}
      <details className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <summary className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none">
          Supported syntax & functions
        </summary>
        <div className="px-4 pb-3 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5 text-xs font-mono text-gray-600 dark:text-gray-400">
          {[
            ['Operators', '+ - * / % ** ^'],
            ['Grouping', '( )'],
            ['Constants', 'PI, E, LN2, LN10, SQRT2, Infinity'],
            ['Trig', 'sin, cos, tan, asin, acos, atan, atan2'],
            ['Hyperbolic', 'sinh, cosh, tanh'],
            ['Math', 'sqrt, cbrt, abs, sign, pow, hypot'],
            ['Log / Exp', 'log (ln), log2, log10, exp'],
            ['Rounding', 'floor, ceil, round, trunc'],
            ['Min / Max', 'min(a,b,...), max(a,b,...)'],
            ['Variables', 'let x = 5  then use x'],
            ['Assignment', 'x = expr (reassign)'],
            ['Comments', '# this is a comment'],
          ].map(([label, val]) => (
            <div key={label} className="flex gap-2 py-0.5">
              <span className="text-gray-400 w-24 shrink-0">{label}:</span>
              <span className="text-gray-700 dark:text-gray-300">{val}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
