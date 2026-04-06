import { useState, useMemo, useCallback, useEffect } from 'react'
import { 
  ShieldCheck, ShieldAlert, Copy, RefreshCw, 
  Settings, LayoutList, Zap, Info, Plus, Trash2, 
  ChevronRight, AlertCircle, CheckCircle2, Globe
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { useLang } from '../context/LanguageContext'

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

type Directive = 
  | 'default-src' | 'script-src' | 'style-src' | 'img-src' | 'connect-src'
  | 'font-src' | 'object-src' | 'media-src' | 'frame-src' | 'worker-src'
  | 'manifest-src' | 'base-uri' | 'form-action' | 'frame-ancestors'
  | 'report-uri' | 'block-all-mixed-content' | 'upgrade-insecure-requests'

const CATEGORIES: Record<string, Directive[]> = {
  'Fetch Directives': ['default-src', 'script-src', 'style-src', 'img-src', 'connect-src', 'font-src', 'object-src', 'media-src', 'frame-src', 'worker-src', 'manifest-src'],
  'Document Directives': ['base-uri'],
  'Navigation Directives': ['form-action', 'frame-ancestors'],
  'Reporting & Cleanup': ['report-uri', 'block-all-mixed-content', 'upgrade-insecure-requests']
}

const COMMON_VALUES = ["'self'", "'none'", "'unsafe-inline'", "'unsafe-eval'", "data:", "https:", "*"]

interface PolicyEntry {
  directive: Directive
  values: string[]
}

const DEFAULT_POLICY: PolicyEntry[] = [
  { directive: 'default-src', values: ["'self'"] },
  { directive: 'script-src', values: ["'self'", "https:"] },
  { directive: 'style-src', values: ["'self'", "'unsafe-inline'"] },
  { directive: 'img-src', values: ["'self'", "data:"] },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CspTool() {
  const [policy, setPolicy] = useState<PolicyEntry[]>(DEFAULT_POLICY)
  const [customCsp, setCustomCsp] = useState('')
  const [activeTab, setActiveTab] = useState<'build' | 'evaluate'>('build')
  
  const { showToast } = useToast()
  const { lang } = useLang()
  const isVi = lang === 'vi'

  // Generator Logic
  const generatedCsp = useMemo(() => {
    return policy
      .filter(p => p.values.length > 0 || ['block-all-mixed-content', 'upgrade-insecure-requests'].includes(p.directive))
      .map(p => {
        if (['block-all-mixed-content', 'upgrade-insecure-requests'].includes(p.directive)) return p.directive;
        return `${p.directive} ${p.values.join(' ')}`;
      })
      .join('; ')
  }, [policy])

  const updateDirective = useCallback((dir: Directive, newValues: string[]) => {
    setPolicy(prev => {
      const idx = prev.findIndex(p => p.directive === dir)
      if (idx === -1) return [...prev, { directive: dir, values: newValues }]
      const next = [...prev]
      next[idx] = { ...next[idx], values: newValues }
      return next
    })
  }, [])

  const addValue = (dir: Directive, val: string) => {
    const existing = policy.find(p => p.directive === dir)?.values || []
    if (existing.includes(val)) return
    updateDirective(dir, [...existing, val])
  }

  const removeValue = (dir: Directive, val: string) => {
    const existing = policy.find(p => p.directive === dir)?.values || []
    updateDirective(dir, existing.filter(v => v !== val))
  }

  // Evaluator Logic
  const evalResults = useMemo(() => {
    if (!customCsp.trim()) return []
    const results: { severity: 'high' | 'medium' | 'info', msg: string, dir?: string }[] = []
    
    if (customCsp.includes("'unsafe-inline'")) {
      results.push({ severity: 'high', msg: isVi ? "'unsafe-inline' cho phép tấn công XSS qua thuộc tính HTML và thẻ script." : "'unsafe-inline' allows XSS attacks via HTML attributes and script tags.", dir: 'script-src/style-src' })
    }
    if (customCsp.includes("'unsafe-eval'")) {
      results.push({ severity: 'medium', msg: isVi ? "'unsafe-eval' cho phép thực thi chuỗi dưới dạng mã, có thể bị lợi dụng." : "'unsafe-eval' allows string execution as code, which can be exploited.", dir: 'script-src' })
    }
    if (customCsp.includes('*')) {
      results.push({ severity: 'high', msg: isVi ? "Sử dụng '*' quá rộng, cho phép tải tài nguyên từ bất kỳ đâu." : "Using '*' is too broad, allowing resources from anywhere.", dir: 'any' })
    }
    if (customCsp.includes('data:') && (customCsp.includes('script-src') || customCsp.includes('default-src'))) {
      results.push({ severity: 'medium', msg: isVi ? "data: trong script-src cho phép tấn công XSS qua URL data." : "data: in script-src allows XSS via data URLs.", dir: 'script-src' })
    }
    if (!customCsp.includes('default-src')) {
      results.push({ severity: 'info', msg: isVi ? "Thiếu default-src. Nên có một giá trị mặc định an toàn." : "Missing default-src. It's recommended to have a safe fallback." })
    }
    
    return results
  }, [customCsp, isVi])

  const copyResult = (type: 'header' | 'meta') => {
    const text = type === 'header' 
      ? `Content-Security-Policy: ${generatedCsp}`
      : `<meta http-equiv="Content-Security-Policy" content="${generatedCsp}">`
    navigator.clipboard.writeText(text)
    showToast(isVi ? `Đã chép ${type === 'header' ? 'Header' : 'Meta Tag'}` : `Copied ${type === 'header' ? 'Header' : 'Meta Tag'}`, 'success')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation Tabs */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl self-start">
         <button 
           onClick={() => setActiveTab('build')}
           className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'build' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
         >
           <Zap size={16} /> {isVi ? 'Trình tạo CSP' : 'CSP Builder'}
         </button>
         <button 
           onClick={() => setActiveTab('evaluate')}
           className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'evaluate' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
         >
           <ShieldCheck size={16} /> {isVi ? 'Đánh giá & Kiểm tra' : 'Evaluator'}
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[600px]">
        {/* Left Side: Configuration or Input */}
        <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-6">
          {activeTab === 'build' ? (
            <div className="space-y-6 overflow-y-auto max-h-[80vh] pr-2 custom-scrollbar">
              {Object.entries(CATEGORIES).map(([cat, dirs]) => (
                <div key={cat} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <LayoutList size={14} /> {cat}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {dirs.map(dir => {
                      const entry = policy.find(p => p.directive === dir)
                      const isFlag = ['block-all-mixed-content', 'upgrade-insecure-requests'].includes(dir)
                      
                      return (
                        <div key={dir} className="flex flex-col gap-2">
                           <div className="flex items-center justify-between">
                              <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300 font-mono">{dir}</label>
                              {isFlag && (
                                <input 
                                  type="checkbox" 
                                  checked={!!entry}
                                  onChange={e => {
                                    if (e.target.checked) updateDirective(dir, [])
                                    else setPolicy(prev => prev.filter(p => p.directive !== dir))
                                  }}
                                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                />
                              )}
                           </div>
                           {!isFlag && (
                             <div className="flex flex-col gap-2">
                                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-gray-50 dark:bg-gray-950/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                   {entry?.values.map(val => (
                                     <span key={val} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-[11px] font-mono text-primary-600 dark:text-primary-400">
                                       {val}
                                       <button onClick={() => removeValue(dir, val)} className="hover:text-red-500"><Trash2 size={10} /></button>
                                     </span>
                                   ))}
                                   <input 
                                      type="text"
                                      placeholder={isVi ? "Thêm domain..." : "Add origin..."}
                                      className="flex-1 bg-transparent border-none outline-none text-[11px] font-mono placeholder:text-gray-400 min-w-[80px]"
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                          const v = e.currentTarget.value.trim()
                                          if (v) { addValue(dir, v); e.currentTarget.value = '' }
                                        }
                                      }}
                                   />
                                </div>
                                <div className="flex flex-wrap gap-1">
                                   {COMMON_VALUES.map(v => (
                                     <button 
                                       key={v}
                                       onClick={() => addValue(dir, v)}
                                       className="px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-500 hover:text-primary-600 rounded text-[10px] transition-colors"
                                     >
                                       {v}
                                     </button>
                                   ))}
                                </div>
                             </div>
                           )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
               <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">{isVi ? 'Dán CSP của bạn' : 'Paste your CSP Policy'}</h3>
                     <button onClick={() => setCustomCsp('')} className="text-xs text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                  <textarea 
                    value={customCsp}
                    onChange={e => setCustomCsp(e.target.value)}
                    placeholder="default-src 'self'; script-src https://example.com; ..."
                    className="w-full h-40 p-4 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl font-mono text-sm focus:ring-2 focus:ring-primary-500/20 outline-none resize-none shadow-inner"
                  />
               </div>

               {customCsp && (
                 <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                       <ShieldAlert size={18} className="text-amber-500" />
                       {isVi ? 'Phân tích Bảo mật' : 'Security Analysis'}
                    </h3>
                    <div className="space-y-3">
                       {evalResults.length === 0 ? (
                         <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/50 rounded-2xl flex items-center gap-3">
                            <CheckCircle2 className="text-green-500" size={20} />
                            <p className="text-sm text-green-700 dark:text-green-400 font-medium">No major security flaws detected in this policy.</p>
                         </div>
                       ) : (
                         evalResults.map((res, i) => (
                           <div key={i} className={`p-4 rounded-2xl border flex items-start gap-4 ${
                             res.severity === 'high' ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/50' : 
                             res.severity === 'medium' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50' :
                             'bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/50'
                           }`}>
                              <AlertCircle size={20} className={res.severity === 'high' ? 'text-red-500' : res.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'} />
                              <div className="flex-1">
                                 <p className="text-sm font-bold tracking-tight mb-1">{res.msg}</p>
                                 {res.dir && <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Directive: {res.dir}</span>}
                              </div>
                           </div>
                         ))
                       )}
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Right Side: Output & Quick Actions */}
        <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6 h-full">
           <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-primary-500/20 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{isVi ? 'Kết quả CSP' : 'Policy Output'}</h3>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">{isVi ? 'Sao chép để áp dụng' : 'Copy to deploy'}</p>
                  </div>
              </div>

              <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6 font-mono text-xs break-all leading-relaxed shadow-inner max-h-60 overflow-y-auto">
                 {generatedCsp || "'none'"}
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => copyResult('header')} className="flex flex-col items-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group">
                    <Globe size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase">{isVi ? 'Sao chép Header' : 'Copy Header'}</span>
                 </button>
                 <button onClick={() => copyResult('meta')} className="flex flex-col items-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group">
                    <Copy size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase">{isVi ? 'Sao chép Meta' : 'Copy Meta'}</span>
                 </button>
              </div>

              <div className="mt-8 space-y-4">
                 <div className="flex items-center gap-2 text-white/50 mb-2">
                    <Settings size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{isVi ? 'Mẫu nhanh' : 'Quick Presets'}</span>
                 </div>
                 <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => setPolicy([{ directive: 'default-src', values: ["'self'"] }, { directive: 'script-src', values: ["'self'"] }, { directive: 'style-src', values: ["'self'"] }, { directive: 'img-src', values: ["'self'"] }])}
                      className="w-full py-2 bg-white/10 hover:bg-white/20 text-xs font-medium rounded-xl text-left px-4 flex items-center justify-between"
                    >
                      Strict Base
                      <ChevronRight size={12} />
                    </button>
                    <button 
                      onClick={() => setPolicy([{ directive: 'default-src', values: ["'none'"] }, { directive: 'script-src', values: ["'self'"] }, { directive: 'connect-src', values: ["'self'"] }, { directive: 'img-src', values: ["'self'"] }, { directive: 'style-src', values: ["'self'"] }, { directive: 'base-uri', values: ["'self'"] }, { directive: 'form-action', values: ["'self'"] }])}
                      className="w-full py-2 bg-white/10 hover:bg-white/20 text-xs font-medium rounded-xl text-left px-4 flex items-center justify-between"
                    >
                      Safe Default
                      <ChevronRight size={12} />
                    </button>
                 </div>
              </div>

              <div className="mt-8 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl flex gap-3 italic">
                 <Info size={16} className="shrink-0 text-yellow-300" />
                 <p className="text-[10px] text-yellow-100 leading-relaxed">
                   {isVi ? 'Hãy luôn kiểm tra chính sách trong môi trường Staging trước khi đẩy lên Production.' : 'Always verify your policy in a Staging environment before deploying to Production.'}
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
