import { useState, useEffect, useRef, useCallback } from 'react'
import { Copy, Check, Download, RefreshCw, AlertCircle } from 'lucide-react'

declare global {
  interface Window { mermaid: { render: (id: string, code: string) => Promise<{ svg: string }>; initialize: (cfg: object) => void } }
}

const EXAMPLES: { label: string; code: string }[] = [
  {
    label: 'Flowchart',
    code: `flowchart TD
    A([Start]) --> B{Validate Input}
    B -->|Valid| C[Process Request]
    B -->|Invalid| D[Return 400 Error]
    C --> E[(Save to Database)]
    E --> F{Email Required?}
    F -->|Yes| G[Send Notification]
    F -->|No| H([End])
    G --> H`,
  },
  {
    label: 'Sequence',
    code: `sequenceDiagram
    participant C as Client
    participant A as API Gateway
    participant S as Auth Service
    participant D as Database

    C->>A: POST /api/login {email, password}
    A->>S: Validate credentials
    S->>D: SELECT user WHERE email=?
    D-->>S: User record
    S-->>A: User valid + roles
    A-->>C: 200 OK {access_token, refresh_token}

    C->>A: GET /api/profile (Bearer token)
    A->>S: Verify JWT
    S-->>A: Token valid, userId=42
    A->>D: SELECT profile WHERE id=42
    D-->>A: Profile data
    A-->>C: 200 OK {profile}`,
  },
  {
    label: 'Class Diagram',
    code: `classDiagram
    class IRepository~T~ {
        <<interface>>
        +GetById(id) T
        +GetAll() List~T~
        +Add(entity T) void
        +Update(entity T) void
        +Delete(id) void
    }

    class UserRepository {
        -DbContext _context
        +GetById(id) User
        +GetByEmail(email) User
        +GetAll() List~User~
        +Add(user User) void
        +Update(user User) void
        +Delete(id) void
    }

    class User {
        +int Id
        +string Name
        +string Email
        +string PasswordHash
        +DateTime CreatedAt
        +List~Order~ Orders
    }

    class Order {
        +int Id
        +int UserId
        +decimal Total
        +OrderStatus Status
        +DateTime OrderDate
        +List~OrderItem~ Items
        +Calculate() decimal
    }

    IRepository~T~ <|.. UserRepository : implements
    UserRepository --> User : manages
    User "1" --> "0..*" Order : places`,
  },
  {
    label: 'ER Diagram',
    code: `erDiagram
    USERS {
        int Id PK
        varchar Name
        varchar Email UK
        varchar PasswordHash
        datetime CreatedAt
    }
    ORDERS {
        int Id PK
        int UserId FK
        decimal Total
        varchar Status
        datetime OrderDate
    }
    ORDER_ITEMS {
        int Id PK
        int OrderId FK
        int ProductId FK
        int Quantity
        decimal UnitPrice
    }
    PRODUCTS {
        int Id PK
        int CategoryId FK
        varchar Name
        decimal Price
        int Stock
    }
    CATEGORIES {
        int Id PK
        varchar Name
        varchar Slug UK
    }

    USERS ||--o{ ORDERS : "places"
    ORDERS ||--|{ ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "in"
    CATEGORIES ||--o{ PRODUCTS : "has"`,
  },
  {
    label: 'State Diagram',
    code: `stateDiagram-v2
    [*] --> Draft

    Draft --> PendingReview : Submit for review
    PendingReview --> Draft : Request changes
    PendingReview --> Approved : Approve
    PendingReview --> Rejected : Reject

    Approved --> Published : Publish
    Approved --> Draft : Edit again

    Published --> Archived : Archive
    Rejected --> Draft : Revise

    Archived --> [*]`,
  },
  {
    label: 'Gantt',
    code: `gantt
    title Project Roadmap
    dateFormat YYYY-MM-DD

    section Backend
    API Design          :done,    a1, 2024-01-01, 7d
    Authentication      :done,    a2, 2024-01-07, 7d
    Core API            :active,  a3, 2024-01-14, 21d
    Unit Tests          :         a4, 2024-02-04, 14d

    section Frontend
    UI Mockups          :done,    f1, 2024-01-07, 7d
    Component Library   :active,  f2, 2024-01-14, 14d
    Main Pages          :         f3, 2024-01-28, 21d
    E2E Tests           :         f4, 2024-02-18, 14d

    section DevOps
    CI/CD Pipeline      :         d1, 2024-02-04, 7d
    Staging Deploy      :         d2, 2024-02-25, 5d
    Production          :milestone,2024-03-04, 0d`,
  },
  {
    label: 'Mindmap',
    code: `mindmap
  root((.NET Architecture))
    Presentation
      REST API
        Controllers
        DTOs
        Filters
      gRPC
      SignalR
    Application
      Commands
        Handlers
        Validators
      Queries
        Handlers
      Events
    Domain
      Entities
      Value Objects
      Aggregates
      Domain Events
    Infrastructure
      EF Core
        Migrations
        Repositories
      Redis Cache
      Message Bus`,
  },
  {
    label: 'Git Graph',
    code: `gitGraph
    commit id: "Initial commit"
    commit id: "Add project structure"

    branch feature/auth
    checkout feature/auth
    commit id: "Add JWT auth"
    commit id: "Add refresh tokens"

    branch feature/users
    checkout feature/users
    commit id: "Add user model"
    commit id: "Add user endpoints"

    checkout main
    merge feature/auth id: "Merge auth"

    checkout feature/users
    commit id: "Add user tests"

    checkout main
    merge feature/users id: "Merge users"
    commit id: "v1.0.0 release"`,
  },
]

let mermaidReady = false
let mermaidLoading = false
const readyCallbacks: (() => void)[] = []

function loadMermaid(isDark: boolean): Promise<void> {
  return new Promise((resolve) => {
    if (mermaidReady) {
      window.mermaid?.initialize({ startOnLoad: false, theme: isDark ? 'dark' : 'base', securityLevel: 'loose' })
      resolve()
      return
    }
    readyCallbacks.push(resolve)
    if (mermaidLoading) return
    mermaidLoading = true
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js'
    script.onload = () => {
      window.mermaid?.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'base',
        securityLevel: 'loose',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
        themeVariables: isDark ? {} : {
          primaryColor: '#eff6ff',
          primaryTextColor: '#1e40af',
          primaryBorderColor: '#93c5fd',
          lineColor: '#6b7280',
          secondaryColor: '#f9fafb',
          tertiaryColor: '#fff',
          noteBkgColor: '#fefce8',
          noteTextColor: '#713f12',
        },
      })
      mermaidReady = true
      readyCallbacks.forEach(cb => cb())
      readyCallbacks.length = 0
    }
    script.onerror = () => { readyCallbacks.forEach(cb => cb()) }
    document.head.appendChild(script)
  })
}

export default function DiagramCreator() {
  const [code, setCode] = useState(EXAMPLES[0].code)
  const [svg, setSvg] = useState('')
  const [error, setError] = useState('')
  const [rendering, setRendering] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const renderIdRef = useRef(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDark = document.documentElement.classList.contains('dark')

  const render = useCallback(async (source: string) => {
    if (!source.trim()) { setSvg(''); setError(''); return }
    const rid = ++renderIdRef.current
    setRendering(true)
    setError('')
    try {
      await loadMermaid(isDark)
      if (rid !== renderIdRef.current) return
      const { svg: out } = await window.mermaid.render(`mmd-${rid}`, source)
      if (rid !== renderIdRef.current) return
      setSvg(out)
    } catch (e) {
      if (rid !== renderIdRef.current) return
      setError(String((e as Error).message ?? e).replace(/\n.*$/s, ''))
      setSvg('')
    } finally {
      if (rid === renderIdRef.current) setRendering(false)
    }
  }, [isDark])

  useEffect(() => {
    setRendering(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => render(code), 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [code])

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const downloadSvg = () => {
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'diagram.svg'; a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPng = async () => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svg, 'image/svg+xml')
    const svgEl = doc.querySelector('svg')
    if (!svgEl) return
    const w = svgEl.width?.baseVal?.value || 800
    const h = svgEl.height?.baseVal?.value || 600
    const canvas = document.createElement('canvas')
    canvas.width = w * 2; canvas.height = h * 2
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      ctx.scale(2, 2)
      ctx.drawImage(img, 0, 0)
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = 'diagram.png'
      a.click()
    }
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  }

  return (
    <div className="space-y-3">
      {/* Examples */}
      <div className="flex flex-wrap gap-1.5">
        {EXAMPLES.map(ex => (
          <button
            key={ex.label}
            onClick={() => setCode(ex.code)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              code === ex.code
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary-400'
            }`}
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Mermaid Syntax</label>
            <button onClick={() => copy(code, 'code')} className="btn-ghost text-xs px-2 py-1 flex items-center gap-1">
              {copied === 'code' ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
              {copied === 'code' ? 'Copied' : 'Copy code'}
            </button>
          </div>
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
            className="tool-textarea font-mono text-xs resize-none"
            style={{ height: 500 }}
            placeholder="Enter Mermaid diagram syntax..."
          />
          <p className="text-[11px] text-gray-400">
            flowchart · sequenceDiagram · classDiagram · erDiagram · stateDiagram-v2 · gantt · mindmap · gitGraph
          </p>
        </div>

        {/* Preview */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Preview</label>
              {rendering && <RefreshCw size={11} className="animate-spin text-gray-400" />}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => copy(svg, 'svg')} disabled={!svg} className="btn-ghost text-xs px-2 py-1 flex items-center gap-1 disabled:opacity-40">
                {copied === 'svg' ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                SVG
              </button>
              <button onClick={downloadSvg} disabled={!svg} className="btn-ghost text-xs px-2 py-1 flex items-center gap-1 disabled:opacity-40">
                <Download size={11} /> SVG
              </button>
              <button onClick={downloadPng} disabled={!svg} className="btn-ghost text-xs px-2 py-1 flex items-center gap-1 disabled:opacity-40">
                <Download size={11} /> PNG
              </button>
            </div>
          </div>
          <div
            className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-950 overflow-auto flex items-start justify-center p-6"
            style={{ height: 500 }}
          >
            {error ? (
              <div className="flex items-start gap-2 text-red-500 text-xs font-mono">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <pre className="whitespace-pre-wrap">{error}</pre>
              </div>
            ) : svg ? (
              <div dangerouslySetInnerHTML={{ __html: svg }} className="max-w-full [&_svg]:max-w-full" />
            ) : (
              <p className="text-sm text-gray-400 mt-20">
                {rendering ? 'Rendering diagram...' : 'Preview appears here'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
