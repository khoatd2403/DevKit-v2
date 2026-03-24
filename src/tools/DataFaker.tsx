import { useState, useCallback } from 'react'
import { Plus, Trash2, Copy, Check, RefreshCw } from 'lucide-react'

// ---- Seed data ----
const FIRST_NAMES = ['James','Mary','John','Patricia','Robert','Jennifer','Michael','Linda','William','Barbara','David','Elizabeth','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Charles','Karen','Christopher','Lisa','Daniel','Nancy','Matthew','Betty','Anthony','Margaret','Mark','Sandra','Donald','Ashley','Steven','Dorothy','Paul','Kimberly','Andrew','Emily','Kenneth','Donna','Joshua','Michelle','Kevin','Carol','Brian','Amanda','George','Melissa','Timothy','Deborah','Ronald','Stephanie','Edward','Rebecca','Jason','Sharon','Jeffrey','Laura','Ryan','Cynthia','Jacob','Kathleen','Gary','Amy','Nicholas','Angela','Eric','Shirley','Jonathan','Anna','Stephen','Brenda','Larry','Pamela','Justin','Emma','Scott','Nicole','Brandon','Helen','Benjamin','Samantha','Samuel','Katherine','Nathan','Christine','Raymond','Debra','Gregory','Rachel','Frank','Carolyn','Alexander','Janet','Patrick','Catherine','Jack','Maria','Dennis','Heather','Jerry','Diane']
const LAST_NAMES = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Gomez','Phillips','Evans','Turner','Diaz','Parker','Cruz','Edwards','Collins','Reyes','Stewart','Morris','Morales','Murphy','Cook','Rogers','Gutierrez','Ortiz','Morgan','Cooper','Peterson','Bailey','Reed','Kelly','Howard','Ramos','Kim','Cox','Ward','Richardson','Watson','Brooks','Chavez','Wood','James','Bennett','Gray','Mendoza','Ruiz','Hughes','Price','Alvarez','Castillo','Sanders','Patel','Myers','Long','Ross','Foster','Jimenez']
const DOMAINS = ['gmail.com','yahoo.com','outlook.com','hotmail.com','example.com','company.com','mail.com','proton.me','icloud.com','test.org','dev.io','sample.net']
const STREETS = ['Main St','Oak Ave','Maple Dr','Cedar Ln','Pine Rd','Elm St','Washington Blvd','Park Ave','Lake Dr','River Rd','Hill St','Forest Ave','Sunset Blvd','Valley Rd','Spring St','Summer Ave','Autumn Ln','Winter Dr']
const CITIES = ['New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego','Dallas','San Jose','Austin','Jacksonville','Fort Worth','Columbus','Charlotte','Indianapolis','San Francisco','Seattle','Denver','Nashville','Oklahoma City','El Paso','Portland','Las Vegas','Louisville']
const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']
const COUNTRIES = ['United States','United Kingdom','Canada','Australia','Germany','France','Japan','Brazil','India','Mexico','Italy','Spain','Netherlands','Switzerland','Sweden','Norway','Denmark','Finland','Poland','Portugal']
const COMPANIES = ['Acme Corp','TechFlow Inc','Digital Solutions','Bright Ideas LLC','Summit Ventures','Apex Systems','Blue Ocean Co','Nexus Technologies','Global Dynamics','Pinnacle Group','Stellar Innovations','CloudBase Solutions','DataBridge Inc','ClearPath Analytics','TrueNorth Consulting']
const ADJECTIVES = ['amazing','bold','clever','dynamic','elegant','fierce','graceful','happy','innovative','joyful','keen','lively','mighty','noble','optimal','peaceful','quick','robust','sharp','trusted','unique','vivid','wise','xenial','young','zealous']
const NOUNS = ['tiger','eagle','panda','falcon','dragon','phoenix','lion','wolf','hawk','bear','fox','lynx','raven','viper','cobra','falcon','shark','whale']
const LOREM_WORDS = ['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi','aliquip','ex','ea','commodo','consequat','duis','aute','irure','in','reprehenderit','voluptate','velit','esse','cillum','fugiat','nulla','pariatur','excepteur','sint','occaecat','cupidatat','non','proident','sunt','culpa','qui','officia','deserunt','mollit','anim','est','laborum']
const TLDS = ['com','net','org','io','dev','app','co','tech','online','site']
const COLORS_LIST = ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c','#e67e22','#34495e','#e91e63','#00bcd4','#8bc34a','#ff5722','#607d8b','#795548','#ffc107']

// ---- Seeded random ----
let _seed = 42
function srandom(): number {
  _seed = (_seed * 1664525 + 1013904223) & 0xffffffff
  return ((_seed >>> 0) / 0x100000000)
}
function srandInt(min: number, max: number): number {
  return Math.floor(srandom() * (max - min + 1)) + min
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(srandom() * arr.length)]!
}
function initSeed(s: number) { _seed = s }

// ---- Field types ----
type FieldType =
  | 'fullName' | 'firstName' | 'lastName'
  | 'email' | 'phone'
  | 'addressFull' | 'addressStreet' | 'addressCity' | 'addressCountry' | 'addressZip'
  | 'uuid' | 'date' | 'number' | 'boolean'
  | 'company' | 'url' | 'ip' | 'username' | 'password'
  | 'color' | 'lorem' | 'custom'

const FIELD_TYPE_OPTIONS: { value: FieldType; label: string }[] = [
  { value: 'fullName', label: 'Name (Full)' },
  { value: 'firstName', label: 'Name (First)' },
  { value: 'lastName', label: 'Name (Last)' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'addressFull', label: 'Address (Full)' },
  { value: 'addressStreet', label: 'Address (Street)' },
  { value: 'addressCity', label: 'Address (City)' },
  { value: 'addressCountry', label: 'Address (Country)' },
  { value: 'addressZip', label: 'Address (Zip)' },
  { value: 'uuid', label: 'UUID' },
  { value: 'date', label: 'Date' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'company', label: 'Company' },
  { value: 'url', label: 'URL' },
  { value: 'ip', label: 'IP Address' },
  { value: 'username', label: 'Username' },
  { value: 'password', label: 'Password (hash)' },
  { value: 'color', label: 'Color (hex)' },
  { value: 'lorem', label: 'Lorem Text' },
  { value: 'custom', label: 'Custom (enum)' },
]

interface FieldDef {
  id: number
  name: string
  type: FieldType
  // date range
  dateFrom?: string
  dateTo?: string
  // number range
  numMin?: number
  numMax?: number
  // custom enum
  enumValues?: string
}

let fieldIdCounter = 10

function generateUUID(): string {
  const h = () => Math.floor(srandom() * 0xFFFF).toString(16).padStart(4, '0')
  return `${h()}${h()}-${h()}-4${h().slice(1)}-${(8 + Math.floor(srandom() * 4)).toString(16)}${h().slice(1)}-${h()}${h()}${h()}`
}

function generateValue(field: FieldDef, i: number): unknown {
  switch (field.type) {
    case 'fullName': return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
    case 'firstName': return pick(FIRST_NAMES)
    case 'lastName': return pick(LAST_NAMES)
    case 'email': {
      const fn = pick(FIRST_NAMES).toLowerCase()
      const ln = pick(LAST_NAMES).toLowerCase()
      return `${fn}.${ln}${srandInt(1, 99)}@${pick(DOMAINS)}`
    }
    case 'phone': return `+1-${srandInt(200,999)}-${srandInt(100,999)}-${srandInt(1000,9999)}`
    case 'addressFull': return `${srandInt(1, 9999)} ${pick(STREETS)}, ${pick(CITIES)}, ${pick(STATES)} ${srandInt(10000,99999)}`
    case 'addressStreet': return `${srandInt(1, 9999)} ${pick(STREETS)}`
    case 'addressCity': return pick(CITIES)
    case 'addressCountry': return pick(COUNTRIES)
    case 'addressZip': return String(srandInt(10000, 99999))
    case 'uuid': return generateUUID()
    case 'date': {
      const from = field.dateFrom ? new Date(field.dateFrom).getTime() : new Date('2000-01-01').getTime()
      const to = field.dateTo ? new Date(field.dateTo).getTime() : Date.now()
      const d = new Date(from + srandom() * (to - from))
      return d.toISOString().split('T')[0]!
    }
    case 'number': {
      const mn = field.numMin ?? 0
      const mx = field.numMax ?? 1000
      return srandInt(mn, mx)
    }
    case 'boolean': return srandom() > 0.5
    case 'company': return pick(COMPANIES)
    case 'url': return `https://${pick(ADJECTIVES)}-${pick(NOUNS)}.${pick(TLDS)}`
    case 'ip': return `${srandInt(1,254)}.${srandInt(0,254)}.${srandInt(0,254)}.${srandInt(1,254)}`
    case 'username': return `${pick(ADJECTIVES)}_${pick(NOUNS)}${srandInt(10,999)}`
    case 'password': return `$2b$10$${Array.from({length: 40}, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./'.charAt(srandInt(0, 63))).join('')}`
    case 'color': return pick(COLORS_LIST)
    case 'lorem': {
      const wordCount = srandInt(6, 20)
      const words = Array.from({length: wordCount}, () => pick(LOREM_WORDS))
      return words.join(' ') + '.'
    }
    case 'custom': {
      const vals = (field.enumValues ?? 'value1,value2,value3').split(',').map(v => v.trim()).filter(Boolean)
      return pick(vals.length ? vals : ['value'])
    }
    default:
      return `record-${i + 1}`
  }
}

function generateRecords(fields: FieldDef[], count: number, seed: number): Record<string, unknown>[] {
  initSeed(seed)
  const records: Record<string, unknown>[] = []
  for (let i = 0; i < count; i++) {
    const rec: Record<string, unknown> = {}
    for (const f of fields) {
      rec[f.name || f.type] = generateValue(f, i)
    }
    records.push(rec)
  }
  return records
}

function toCSV(records: Record<string, unknown>[]): string {
  if (!records.length) return ''
  const keys = Object.keys(records[0]!)
  const header = keys.map(k => JSON.stringify(k)).join(',')
  const rows = records.map(r => keys.map(k => {
    const v = r[k]
    if (typeof v === 'string') return JSON.stringify(v)
    return String(v)
  }).join(','))
  return [header, ...rows].join('\n')
}

function toSQL(records: Record<string, unknown>[], table = 'records'): string {
  if (!records.length) return ''
  const keys = Object.keys(records[0]!)
  const cols = keys.map(k => `\`${k}\``).join(', ')
  const rows = records.map(r => {
    const vals = keys.map(k => {
      const v = r[k]
      if (v === null || v === undefined) return 'NULL'
      if (typeof v === 'boolean') return v ? '1' : '0'
      if (typeof v === 'number') return String(v)
      return `'${String(v).replace(/'/g, "''")}'`
    }).join(', ')
    return `(${vals})`
  })
  return `INSERT INTO \`${table}\` (${cols})\nVALUES\n  ${rows.join(',\n  ')};`
}

export default function DataFaker() {
  const [fields, setFields] = useState<FieldDef[]>([
    { id: 1, name: 'id', type: 'uuid' },
    { id: 2, name: 'name', type: 'fullName' },
    { id: 3, name: 'email', type: 'email' },
  ])
  const [count, setCount] = useState(10)
  const [format, setFormat] = useState<'json' | 'csv' | 'sql'>('json')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [seed, setSeed] = useState(42)

  const addField = () => setFields(prev => [...prev, { id: ++fieldIdCounter, name: `field${prev.length + 1}`, type: 'lorem' }])
  const removeField = (id: number) => setFields(prev => prev.filter(f => f.id !== id))
  const updateField = useCallback(<K extends keyof FieldDef>(id: number, key: K, value: FieldDef[K]) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, [key]: value } : f))
  }, [])

  const generate = () => {
    const records = generateRecords(fields.filter(f => f.name), count, seed)
    let result = ''
    if (format === 'json') result = JSON.stringify(records, null, 2)
    else if (format === 'csv') result = toCSV(records)
    else result = toSQL(records)
    setOutput(result)
  }

  const regenerate = () => {
    const newSeed = Math.floor(Math.random() * 0xFFFFFF)
    setSeed(newSeed)
    const records = generateRecords(fields.filter(f => f.name), count, newSeed)
    let result = ''
    if (format === 'json') result = JSON.stringify(records, null, 2)
    else if (format === 'csv') result = toCSV(records)
    else result = toSQL(records)
    setOutput(result)
  }

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      {/* Schema builder */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label-text">Schema Fields</label>
          <button onClick={addField} className="btn-secondary text-xs py-1 px-3 flex items-center gap-1">
            <Plus size={13} /> Add Field
          </button>
        </div>
        <div className="space-y-2">
          {fields.map((f, idx) => (
            <div key={f.id} className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
              <div className="flex items-center gap-1 text-xs text-gray-400 w-6 pt-2 flex-shrink-0">
                {idx + 1}
              </div>
              <input
                type="text"
                value={f.name}
                onChange={e => updateField(f.id, 'name', e.target.value)}
                placeholder="Field name"
                className="tool-textarea h-auto py-1.5 text-sm flex-1 min-w-0"
              />
              <select
                value={f.type}
                onChange={e => updateField(f.id, 'type', e.target.value as FieldType)}
                className="tool-textarea h-auto py-1.5 text-sm flex-1 min-w-0"
              >
                {FIELD_TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {/* Extra options */}
              {f.type === 'date' && (
                <div className="flex gap-1 flex-shrink-0">
                  <input type="date" value={f.dateFrom ?? '2000-01-01'} onChange={e => updateField(f.id, 'dateFrom', e.target.value)} className="tool-textarea h-auto py-1.5 text-xs w-32" title="From date" />
                  <input type="date" value={f.dateTo ?? new Date().toISOString().split('T')[0]!} onChange={e => updateField(f.id, 'dateTo', e.target.value)} className="tool-textarea h-auto py-1.5 text-xs w-32" title="To date" />
                </div>
              )}
              {f.type === 'number' && (
                <div className="flex gap-1 flex-shrink-0">
                  <input type="number" value={f.numMin ?? 0} onChange={e => updateField(f.id, 'numMin', Number(e.target.value))} className="tool-textarea h-auto py-1.5 text-xs w-20 text-center" placeholder="Min" title="Min value" />
                  <input type="number" value={f.numMax ?? 1000} onChange={e => updateField(f.id, 'numMax', Number(e.target.value))} className="tool-textarea h-auto py-1.5 text-xs w-20 text-center" placeholder="Max" title="Max value" />
                </div>
              )}
              {f.type === 'custom' && (
                <input
                  type="text"
                  value={f.enumValues ?? ''}
                  onChange={e => updateField(f.id, 'enumValues', e.target.value)}
                  placeholder="val1,val2,val3"
                  className="tool-textarea h-auto py-1.5 text-xs w-40 flex-shrink-0"
                  title="Comma-separated enum values"
                />
              )}
              <button onClick={() => removeField(f.id)} className="text-gray-400 hover:text-red-500 transition-colors pt-2 flex-shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Options row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label-text block mb-2">Record Count (1–1000)</label>
          <input
            type="number" min={1} max={1000} value={count}
            onChange={e => setCount(Math.min(1000, Math.max(1, Number(e.target.value))))}
            className="tool-textarea h-auto py-2 text-center font-mono"
          />
        </div>
        <div>
          <label className="label-text block mb-2">Output Format</label>
          <div className="tool-tabs h-[38px]">
            {(['json', 'csv', 'sql'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`tool-tab flex-1 uppercase text-xs font-semibold ${format === f ? 'active' : ''}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-end gap-2">
          <button onClick={generate} className="btn-primary">Generate Data</button>
          <button onClick={regenerate} className="btn-secondary text-xs flex items-center justify-center gap-1">
            <RefreshCw size={13} /> Randomize Seed
          </button>
        </div>
      </div>

      {/* Output */}
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label-text">Output</label>
            <button onClick={copy} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
              {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            className="tool-textarea-output font-mono text-xs h-80"
          />
          <p className="text-xs text-gray-400 mt-1">
            {format === 'json' && `${JSON.parse(output).length} records`}
            {format === 'csv' && `${output.split('\n').length - 1} records`}
            {format === 'sql' && `INSERT statement`}
            {' · '}{output.length.toLocaleString()} characters
          </p>
        </div>
      )}
    </div>
  )
}
