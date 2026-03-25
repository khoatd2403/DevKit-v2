import { useState, useRef, useEffect } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { Play, Plus, Trash2, RotateCcw, Zap, Timer, BarChart3, AlertCircle } from 'lucide-react'
import CopyButton from '../components/CopyButton'

interface TestCase {
  id: string
  name: string
  code: string
}

interface BenchmarkResult {
  id: string
  opsPerSec: number
  totalTime: number
  iterations: number
  error?: string
}

// ─── TypeScript → JavaScript stripper (Small version for benchmark) ──────────
function stripTS(code: string): string {
  let result = code
  // 1. Remove types/interfaces
  result = result.replace(/^\s*(?:export\s+)?(?:declare\s+)?(?:interface|type)\s+\w+.*\{[^}]*\}/gms, '')
  result = result.replace(/^\s*(?:export\s+)?(?:declare\s+)?type\s+\w+.*?;/gm, '')
  // 2. Remove cast 'as Type'
  result = result.replace(/\s+as\s+(?!const\b)(?:[A-Za-z_$][\w$.<>\[\]|& ,]*)/g, '')
  // 3. Remove function/var type annotations
  result = result.replace(/\)\s*:\s*(?:[A-Za-z_$][\w$.<>\[\]|& ,?]*)(?=\s*(?:\{|=>|\n))/g, ')')
  result = result.replace(/(\w)\s*:\s*(?:[A-Za-z_$][\w$.<>\[\]|& ,?]*(?:\[\])*)\s*(?=[,)=\n])/g, '$1')
  result = result.replace(/\b(const|let|var)\s+([A-Za-z_$][\w$]*)\s*:\s*(?![^=]*\n)(?:[A-Za-z_$][\w$.<>\[\]|& ,?]*)/g, '$1 $2')
  return result
}

export default function BenchmarkBuilder() {
  const [setupCode, setSetupCode] = usePersistentState('tool-benchmark-setup', '// Setup code runs once before each test case\nconst array: number[] = Array.from({ length: 1000 }, (_, i) => i);')
  const [testCases, setTestCases] = usePersistentState<TestCase[]>('tool-benchmark-cases', [
    { id: '1', name: 'Array.forEach', code: 'let sum: number = 0;\narray.forEach((x: number) => sum += x);' },
    { id: '2', name: 'for...of', code: 'let sum: number = 0;\nfor (const x of array) sum += x;' },
    { id: '3', name: 'for loop', code: 'let sum: number = 0;\nfor (let i: number = 0; i < array.length; i++) sum += array[i];' }
  ])
  const [duration, setDuration] = useState(1000) // ms to run each test
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<Record<string, BenchmarkResult>>({})
  const [progress, setProgress] = useState(0)
  
  const abortController = useRef<AbortController | null>(null)

  const addTestCase = () => {
    const id = Date.now().toString()
    setTestCases([...testCases, { id, name: `Test case ${testCases.length + 1}`, code: '' }])
  }

  const removeTestCase = (id: string) => {
    if (testCases.length <= 1) return
    setTestCases(testCases.filter(t => t.id !== id))
    const newResults = { ...results }
    delete newResults[id]
    setResults(newResults)
  }

  const updateTestCase = (id: string, updates: Partial<TestCase>) => {
    setTestCases(testCases.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const runBenchmark = async () => {
    setIsRunning(true)
    setResults({})
    setProgress(0)
    abortController.current = new AbortController()

    try {
      const newResults: Record<string, BenchmarkResult> = {}
      
      for (let i = 0; i < testCases.length; i++) {
        if (abortController.current.signal.aborted) break
        
        const testCase = testCases[i]
        setProgress((i / testCases.length) * 100)
        
        try {
          // Wrap setup and code with TS stripping
          const jsSetup = stripTS(setupCode)
          const jsCode = stripTS(testCase.code)
          const result = await executeTest(jsSetup, jsCode, duration)
          newResults[testCase.id] = { ...result, id: testCase.id }
        } catch (err: any) {
          newResults[testCase.id] = { id: testCase.id, opsPerSec: 0, totalTime: 0, iterations: 0, error: err.message }
        }
        
        setResults({ ...newResults })
      }
      
      setProgress(100)
    } finally {
      setIsRunning(false)
    }
  }

  const stopBenchmark = () => {
    abortController.current?.abort()
    setIsRunning(false)
  }

  const reset = () => {
    setResults({})
    setProgress(0)
  }

  const executeTest = async (setup: string, code: string, targetDuration: number): Promise<{ opsPerSec: number; totalTime: number; iterations: number }> => {
    // Create the test function
    const fn = new Function(`
      ${setup};
      const startTime = performance.now();
      let iterations = 0;
      while (performance.now() - startTime < ${targetDuration}) {
        ${code};
        iterations++;
      }
      const endTime = performance.now();
      return { iterations, time: endTime - startTime };
    `)

    // Run once to warm up/JIT
    fn()

    // Actual run
    const { iterations, time } = fn()
    
    return {
      iterations,
      totalTime: time,
      opsPerSec: Math.round((iterations / time) * 1000)
    }
  }

  const sortedResults = Object.values(results).sort((a, b) => b.opsPerSec - a.opsPerSec)
  const fastest = sortedResults[0]?.opsPerSec || 0

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg">
            <Timer size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">JS / TS Benchmark Builder</h2>
            <p className="text-xs text-gray-500">Benchmark JavaScript and TypeScript code snippets</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={duration} 
            onChange={(e) => setDuration(Number(e.target.value))}
            className="tool-select text-xs py-1.5"
            disabled={isRunning}
          >
            <option value={500}>0.5s per test</option>
            <option value={1000}>1.0s per test</option>
            <option value={2000}>2.0s per test</option>
            <option value={5000}>5.0s per test</option>
          </select>

          {isRunning ? (
            <button onClick={stopBenchmark} className="btn-danger py-1.5 px-4 text-xs flex items-center gap-2">
              <RotateCcw size={14} className="animate-spin" /> Stop
            </button>
          ) : (
            <button onClick={runBenchmark} className="btn-primary py-1.5 px-4 text-xs flex items-center gap-2 shadow-lg shadow-primary-500/20">
              <Play size={14} /> Run Benchmark
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-primary-500 h-full transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Editor Side */}
        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Zap size={14} className="text-amber-500" /> Setup Code
              </label>
            </div>
            <textarea
              className="tool-textarea h-32 font-mono text-sm"
              value={setupCode}
              onChange={(e) => setSetupCode(e.target.value)}
              placeholder="// Variable declarations, data preparation..."
            />
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Test Cases</label>
              <button 
                onClick={addTestCase}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Plus size={14} /> Add Case
              </button>
            </div>

            <div className="space-y-4">
              {testCases.map((testCase, idx) => (
                <div key={testCase.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500">{idx + 1}</span>
                    <input
                      type="text"
                      className="bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-gray-900 dark:text-white flex-1 placeholder-gray-400"
                      value={testCase.name}
                      onChange={(e) => updateTestCase(testCase.id, { name: e.target.value })}
                      placeholder="Case Name..."
                    />
                    <button 
                      onClick={() => removeTestCase(testCase.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <textarea
                    className="tool-textarea h-24 font-mono text-sm bg-gray-50/50 dark:bg-gray-950/50 border-none focus:ring-1 focus:ring-primary-500/30"
                    value={testCase.code}
                    onChange={(e) => updateTestCase(testCase.id, { code: e.target.value })}
                    placeholder="// Snippet to benchmark..."
                  />
                  {results[testCase.id]?.error && (
                    <div className="mt-2 flex items-start gap-2 text-[10px] text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                      <AlertCircle size={12} className="shrink-0 mt-0.5" />
                      <span>{results[testCase.id].error}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Results Side */}
        <div className="space-y-6">
          <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 h-full overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-primary-500" /> Results
              </h3>
              {sortedResults.length > 0 && (
                <button 
                  onClick={reset}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {sortedResults.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                  <Play size={24} className="text-gray-300 ml-1" />
                </div>
                <p className="text-sm text-gray-500 max-w-[200px]">Click "Run Benchmark" to start measuring performance</p>
              </div>
            ) : (
              <div className="flex-1 p-5 space-y-6 overflow-y-auto">
                {sortedResults.map((res) => {
                  const testCase = testCases.find(t => t.id === res.id)
                  if (!testCase) return null
                  const percentOfFastest = fastest ? (res.opsPerSec / fastest) * 100 : 0
                  const isFastest = res.opsPerSec === fastest && res.opsPerSec > 0

                  return (
                    <div key={res.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-xs font-bold truncate ${isFastest ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            {testCase.name}
                          </span>
                          {isFastest && (
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[9px] font-black uppercase px-1.5 py-0.5 rounded leading-none">Fastest</span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black tabular-nums">{res.opsPerSec.toLocaleString()} <span className="text-[10px] font-normal text-gray-400">ops/s</span></div>
                        </div>
                      </div>
                      
                      <div className="relative w-full h-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg overflow-hidden group">
                        <div 
                          className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out ${isFastest ? 'bg-green-500/20' : 'bg-primary-500/10'}`}
                          style={{ width: `${percentOfFastest}%` }}
                        />
                        <div 
                          className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out border-r-2 ${isFastest ? 'bg-green-500 border-green-600' : 'bg-primary-500 border-primary-600'}`}
                          style={{ width: `2px`, left: `calc(${percentOfFastest}% - 2px)` }}
                        />
                        <div className="absolute inset-0 flex items-center px-3 justify-between text-[10px]">
                          <span className="text-gray-500 font-medium">
                            {res.iterations.toLocaleString()} iterations
                          </span>
                          {!isFastest && res.opsPerSec > 0 && (
                            <span className="text-red-500 font-bold">
                              -{Math.round(100 - percentOfFastest)}% slower
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] text-gray-400 leading-relaxed italic">
                * Benchmarks run in your browser's main thread. Results may vary based on system load and engine optimizations (V8, JavaScriptCore).
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
