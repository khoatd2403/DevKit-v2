import { useState } from 'react'
import { Copy, Check, Eye, EyeOff } from 'lucide-react'
import { CsharpHighlight, JsonHighlight } from '../lib/codeHighlight'

type DbType = 'sqlserver' | 'mysql' | 'postgresql' | 'sqlite' | 'oracle' | 'mongodb'

interface DbConfig {
  label: string
  icon: string
  color: string
}

const DB_CONFIG: Record<DbType, DbConfig> = {
  sqlserver: { label: 'SQL Server', icon: '🟦', color: 'blue' },
  mysql:     { label: 'MySQL', icon: '🐬', color: 'orange' },
  postgresql:{ label: 'PostgreSQL', icon: '🐘', color: 'indigo' },
  sqlite:    { label: 'SQLite', icon: '📦', color: 'gray' },
  oracle:    { label: 'Oracle', icon: '🔴', color: 'red' },
  mongodb:   { label: 'MongoDB', icon: '🍃', color: 'green' },
}

interface SqlServerFields {
  server: string; database: string; user: string; password: string
  windowsAuth: boolean; port: string; encrypt: boolean; trustServerCertificate: boolean
  connectionTimeout: string; appName: string; multipleActiveResultSets: boolean
}
interface MysqlFields {
  server: string; port: string; database: string; user: string; password: string
  ssl: boolean; charset: string; connectionTimeout: string
}
interface PostgresFields {
  host: string; port: string; database: string; username: string; password: string
  sslMode: string; schema: string; connectionTimeout: string; applicationName: string
}
interface SqliteFields { dataSource: string; mode: string; password: string }
interface OracleFields { dataSource: string; user: string; password: string; dbaPrivilege: string }
interface MongoFields {
  host: string; port: string; database: string; username: string; password: string; authSource: string; replicaSet: string
}

function buildSqlServer(f: SqlServerFields): string {
  const parts: string[] = [`Server=${f.server || 'localhost'}${f.port ? ',' + f.port : ''}`]
  parts.push(`Database=${f.database || 'MyDb'}`)
  if (f.windowsAuth) {
    parts.push('Integrated Security=True')
  } else {
    parts.push(`User Id=${f.user || 'sa'}`)
    parts.push(`Password=${f.password}`)
  }
  if (f.encrypt) parts.push('Encrypt=True')
  if (f.trustServerCertificate) parts.push('TrustServerCertificate=True')
  if (f.multipleActiveResultSets) parts.push('MultipleActiveResultSets=True')
  if (f.connectionTimeout) parts.push(`Connection Timeout=${f.connectionTimeout}`)
  if (f.appName) parts.push(`Application Name=${f.appName}`)
  return parts.join(';') + ';'
}

function buildMysql(f: MysqlFields): string {
  const parts = [
    `Server=${f.server || 'localhost'}`,
    `Port=${f.port || '3306'}`,
    `Database=${f.database || 'mydb'}`,
    `Uid=${f.user || 'root'}`,
    `Pwd=${f.password}`,
  ]
  if (f.ssl) parts.push('SslMode=Required')
  if (f.charset) parts.push(`CharSet=${f.charset}`)
  if (f.connectionTimeout) parts.push(`Connection Timeout=${f.connectionTimeout}`)
  return parts.join(';') + ';'
}

function buildPostgres(f: PostgresFields): string {
  const parts = [
    `Host=${f.host || 'localhost'}`,
    `Port=${f.port || '5432'}`,
    `Database=${f.database || 'mydb'}`,
    `Username=${f.username || 'postgres'}`,
    `Password=${f.password}`,
  ]
  if (f.sslMode && f.sslMode !== 'disable') parts.push(`SSL Mode=${f.sslMode}`)
  if (f.schema) parts.push(`Search Path=${f.schema}`)
  if (f.connectionTimeout) parts.push(`Timeout=${f.connectionTimeout}`)
  if (f.applicationName) parts.push(`Application Name=${f.applicationName}`)
  return parts.join(';') + ';'
}

function buildSqlite(f: SqliteFields): string {
  const parts = [`Data Source=${f.dataSource || 'mydb.db'}`]
  if (f.mode) parts.push(`Mode=${f.mode}`)
  if (f.password) parts.push(`Password=${f.password}`)
  return parts.join(';') + ';'
}

function buildOracle(f: OracleFields): string {
  const parts = [
    `Data Source=${f.dataSource || 'localhost:1521/ORCL'}`,
    `User Id=${f.user || 'system'}`,
    `Password=${f.password}`,
  ]
  if (f.dbaPrivilege) parts.push(`DBA Privilege=${f.dbaPrivilege}`)
  return parts.join(';') + ';'
}

function buildMongoDB(f: MongoFields): string {
  const auth = f.username
    ? `${encodeURIComponent(f.username)}:${encodeURIComponent(f.password)}@`
    : ''
  const host = `${f.host || 'localhost'}:${f.port || '27017'}`
  const params: string[] = []
  if (f.authSource) params.push(`authSource=${f.authSource}`)
  if (f.replicaSet) params.push(`replicaSet=${f.replicaSet}`)
  const qs = params.length > 0 ? '?' + params.join('&') : ''
  return `mongodb://${auth}${host}/${f.database || 'mydb'}${qs}`
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="tool-label mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
    </div>
  )
}

function CheckField({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 dark:text-gray-400">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="rounded" />
      {label}
    </label>
  )
}

export default function ConnectionStringBuilder() {
  const [db, setDb] = useState<DbType>('sqlserver')
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)

  const [ss, setSs] = useState<SqlServerFields>({
    server: 'localhost', database: '', user: 'sa', password: '', windowsAuth: false,
    port: '', encrypt: false, trustServerCertificate: false, connectionTimeout: '',
    appName: '', multipleActiveResultSets: false,
  })
  const [my, setMy] = useState<MysqlFields>({
    server: 'localhost', port: '3306', database: '', user: 'root', password: '',
    ssl: false, charset: 'utf8mb4', connectionTimeout: '',
  })
  const [pg, setPg] = useState<PostgresFields>({
    host: 'localhost', port: '5432', database: '', username: 'postgres', password: '',
    sslMode: 'disable', schema: '', connectionTimeout: '', applicationName: '',
  })
  const [sl, setSl] = useState<SqliteFields>({ dataSource: 'app.db', mode: '', password: '' })
  const [or, setOr] = useState<OracleFields>({
    dataSource: 'localhost:1521/ORCL', user: 'system', password: '', dbaPrivilege: '',
  })
  const [mg, setMg] = useState<MongoFields>({
    host: 'localhost', port: '27017', database: '', username: '', password: '',
    authSource: '', replicaSet: '',
  })

  const connectionString =
    db === 'sqlserver' ? buildSqlServer(ss) :
    db === 'mysql'     ? buildMysql(my) :
    db === 'postgresql'? buildPostgres(pg) :
    db === 'sqlite'    ? buildSqlite(sl) :
    db === 'oracle'    ? buildOracle(or) :
                         buildMongoDB(mg)

  const copy = async () => {
    await navigator.clipboard.writeText(connectionString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* DB tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {(Object.entries(DB_CONFIG) as [DbType, DbConfig][]).map(([id, cfg]) => (
          <button
            key={id}
            onClick={() => setDb(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              db === id
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary-400'
            }`}
          >
            <span>{cfg.icon}</span>
            <span>{cfg.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fields */}
        <div className="space-y-3">
          {db === 'sqlserver' && (
            <>
              <Field label="Server" value={ss.server} onChange={v => setSs(p => ({ ...p, server: v }))} placeholder="localhost" />
              <Field label="Port (optional)" value={ss.port} onChange={v => setSs(p => ({ ...p, port: v }))} placeholder="1433" />
              <Field label="Database" value={ss.database} onChange={v => setSs(p => ({ ...p, database: v }))} placeholder="MyDatabase" />
              <CheckField label="Windows Authentication" checked={ss.windowsAuth} onChange={v => setSs(p => ({ ...p, windowsAuth: v }))} />
              {!ss.windowsAuth && <>
                <Field label="User ID" value={ss.user} onChange={v => setSs(p => ({ ...p, user: v }))} />
                <Field label="Password" value={ss.password} onChange={v => setSs(p => ({ ...p, password: v }))} type={showPassword ? 'text' : 'password'} />
              </>}
              <div className="flex flex-wrap gap-4 pt-1">
                <CheckField label="Encrypt" checked={ss.encrypt} onChange={v => setSs(p => ({ ...p, encrypt: v }))} />
                <CheckField label="Trust Server Certificate" checked={ss.trustServerCertificate} onChange={v => setSs(p => ({ ...p, trustServerCertificate: v }))} />
                <CheckField label="MARS" checked={ss.multipleActiveResultSets} onChange={v => setSs(p => ({ ...p, multipleActiveResultSets: v }))} />
              </div>
              <Field label="Application Name" value={ss.appName} onChange={v => setSs(p => ({ ...p, appName: v }))} placeholder="MyApp" />
              <Field label="Connection Timeout (s)" value={ss.connectionTimeout} onChange={v => setSs(p => ({ ...p, connectionTimeout: v }))} placeholder="30" />
            </>
          )}

          {db === 'mysql' && (
            <>
              <Field label="Server" value={my.server} onChange={v => setMy(p => ({ ...p, server: v }))} placeholder="localhost" />
              <Field label="Port" value={my.port} onChange={v => setMy(p => ({ ...p, port: v }))} placeholder="3306" />
              <Field label="Database" value={my.database} onChange={v => setMy(p => ({ ...p, database: v }))} placeholder="mydb" />
              <Field label="User" value={my.user} onChange={v => setMy(p => ({ ...p, user: v }))} />
              <Field label="Password" value={my.password} onChange={v => setMy(p => ({ ...p, password: v }))} type={showPassword ? 'text' : 'password'} />
              <Field label="Charset" value={my.charset} onChange={v => setMy(p => ({ ...p, charset: v }))} placeholder="utf8mb4" />
              <CheckField label="SSL Required" checked={my.ssl} onChange={v => setMy(p => ({ ...p, ssl: v }))} />
            </>
          )}

          {db === 'postgresql' && (
            <>
              <Field label="Host" value={pg.host} onChange={v => setPg(p => ({ ...p, host: v }))} placeholder="localhost" />
              <Field label="Port" value={pg.port} onChange={v => setPg(p => ({ ...p, port: v }))} placeholder="5432" />
              <Field label="Database" value={pg.database} onChange={v => setPg(p => ({ ...p, database: v }))} placeholder="mydb" />
              <Field label="Username" value={pg.username} onChange={v => setPg(p => ({ ...p, username: v }))} />
              <Field label="Password" value={pg.password} onChange={v => setPg(p => ({ ...p, password: v }))} type={showPassword ? 'text' : 'password'} />
              <div>
                <label className="tool-label mb-1 block">SSL Mode</label>
                <select value={pg.sslMode} onChange={e => setPg(p => ({ ...p, sslMode: e.target.value }))}
                  className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500">
                  {['disable','allow','prefer','require','verify-ca','verify-full'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <Field label="Schema" value={pg.schema} onChange={v => setPg(p => ({ ...p, schema: v }))} placeholder="public" />
              <Field label="Application Name" value={pg.applicationName} onChange={v => setPg(p => ({ ...p, applicationName: v }))} placeholder="MyApp" />
            </>
          )}

          {db === 'sqlite' && (
            <>
              <Field label="Data Source (file path)" value={sl.dataSource} onChange={v => setSl(p => ({ ...p, dataSource: v }))} placeholder="app.db" />
              <div>
                <label className="tool-label mb-1 block">Mode</label>
                <select value={sl.mode} onChange={e => setSl(p => ({ ...p, mode: e.target.value }))}
                  className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500">
                  <option value="">Default</option>
                  <option value="ReadOnly">ReadOnly</option>
                  <option value="ReadWrite">ReadWrite</option>
                  <option value="ReadWriteCreate">ReadWriteCreate</option>
                  <option value="Memory">Memory</option>
                </select>
              </div>
              <Field label="Password" value={sl.password} onChange={v => setSl(p => ({ ...p, password: v }))} type={showPassword ? 'text' : 'password'} />
            </>
          )}

          {db === 'oracle' && (
            <>
              <Field label="Data Source (host:port/service)" value={or.dataSource} onChange={v => setOr(p => ({ ...p, dataSource: v }))} placeholder="localhost:1521/ORCL" />
              <Field label="User Id" value={or.user} onChange={v => setOr(p => ({ ...p, user: v }))} />
              <Field label="Password" value={or.password} onChange={v => setOr(p => ({ ...p, password: v }))} type={showPassword ? 'text' : 'password'} />
              <div>
                <label className="tool-label mb-1 block">DBA Privilege</label>
                <select value={or.dbaPrivilege} onChange={e => setOr(p => ({ ...p, dbaPrivilege: e.target.value }))}
                  className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500">
                  <option value="">None</option>
                  <option value="SYSDBA">SYSDBA</option>
                  <option value="SYSOPER">SYSOPER</option>
                </select>
              </div>
            </>
          )}

          {db === 'mongodb' && (
            <>
              <Field label="Host" value={mg.host} onChange={v => setMg(p => ({ ...p, host: v }))} placeholder="localhost" />
              <Field label="Port" value={mg.port} onChange={v => setMg(p => ({ ...p, port: v }))} placeholder="27017" />
              <Field label="Database" value={mg.database} onChange={v => setMg(p => ({ ...p, database: v }))} placeholder="mydb" />
              <Field label="Username (optional)" value={mg.username} onChange={v => setMg(p => ({ ...p, username: v }))} />
              {mg.username && (
                <>
                  <Field label="Password" value={mg.password} onChange={v => setMg(p => ({ ...p, password: v }))} type={showPassword ? 'text' : 'password'} />
                  <Field label="Auth Source" value={mg.authSource} onChange={v => setMg(p => ({ ...p, authSource: v }))} placeholder="admin" />
                </>
              )}
              <Field label="Replica Set (optional)" value={mg.replicaSet} onChange={v => setMg(p => ({ ...p, replicaSet: v }))} placeholder="rs0" />
            </>
          )}

          {/* Show password toggle */}
          {db !== 'sqlite' && (
            <button
              onClick={() => setShowPassword(p => !p)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
              {showPassword ? 'Hide password' : 'Show password'}
            </button>
          )}
        </div>

        {/* Output */}
        <div className="space-y-3">
          <div>
            <div className="tool-output-header">
              <label className="tool-label">Connection String</label>
              <button onClick={copy} className="btn-ghost text-xs px-2 py-1 flex items-center gap-1">
                {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <textarea
              readOnly
              value={connectionString}
              className="tool-textarea-output font-mono text-xs h-28 resize-none select-all"
            />
          </div>

          {/* appsettings.json preview */}
          <div>
            <label className="tool-label mb-1.5 block">appsettings.json</label>
            <pre className="bg-[#1e1e1e] rounded-xl font-mono text-xs h-36 overflow-auto whitespace-pre p-3">
              <JsonHighlight code={`{\n  "ConnectionStrings": {\n    "Default": "${connectionString.replace(/"/g, '\\"')}"\n  }\n}`} />
            </pre>
          </div>

          {/* Usage hint */}
          <div className="bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50 rounded-xl p-3">
            <p className="text-xs font-medium text-primary-700 dark:text-primary-400 mb-1.5">C# Usage</p>
            <pre className="bg-[#1e1e1e] rounded-lg font-mono text-[11px] whitespace-pre-wrap p-3 overflow-x-auto">
              <CsharpHighlight code={
db === 'sqlserver'  ? `var conn = builder.Configuration\n    .GetConnectionString("Default");\n\nbuilder.Services.AddDbContext<AppDbContext>(\n    o => o.UseSqlServer(conn));` :
db === 'mysql'      ? `builder.Services.AddDbContext<AppDbContext>(\n    o => o.UseMySql(conn,\n        ServerVersion.AutoDetect(conn)));` :
db === 'postgresql' ? `builder.Services.AddDbContext<AppDbContext>(\n    o => o.UseNpgsql(conn));` :
db === 'sqlite'     ? `builder.Services.AddDbContext<AppDbContext>(\n    o => o.UseSqlite(conn));` :
db === 'oracle'     ? `builder.Services.AddDbContext<AppDbContext>(\n    o => o.UseOracle(conn));` :
                      `var client = new MongoClient(conn);\nvar db = client.GetDatabase("${mg.database || 'mydb'}");`
              } />
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
