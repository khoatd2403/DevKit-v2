// Shared SQL syntax highlighter — used by SqlFormatter, SqlToLinq, SqlSyntax, etc.

const SQL_KEYWORDS = new Set([
  'SELECT','FROM','WHERE','JOIN','INNER','LEFT','RIGHT','FULL','OUTER','CROSS',
  'ON','AS','AND','OR','NOT','IN','EXISTS','BETWEEN','LIKE','IS','NULL','DISTINCT',
  'ORDER','BY','GROUP','HAVING','LIMIT','TOP','OFFSET','FETCH','NEXT','ROWS','ONLY',
  'INSERT','INTO','VALUES','UPDATE','SET','DELETE','MERGE','USING','MATCHED','TARGET','SOURCE',
  'CREATE','ALTER','DROP','TRUNCATE','TABLE','VIEW','INDEX','PROCEDURE','FUNCTION','TRIGGER',
  'BEGIN','END','IF','ELSE','WHILE','RETURN','THROW','TRY','CATCH',
  'DECLARE','EXEC','EXECUTE','PRINT','GO',
  'PRIMARY','KEY','FOREIGN','REFERENCES','UNIQUE','CHECK','DEFAULT','CONSTRAINT',
  'IDENTITY','COALESCE','NULLIF','ISNULL',
  'COMMIT','ROLLBACK','TRANSACTION','SAVEPOINT','START',
  'WITH','RECURSIVE','UNION','ALL','INTERSECT','EXCEPT','CASE','WHEN','THEN','ELSE','END',
  'OVER','PARTITION','UNBOUNDED','PRECEDING','FOLLOWING','CURRENT','ROW',
  'PIVOT','UNPIVOT','FOR','OPTION','MAXDOP','RECOMPILE','NOLOCK','UPDLOCK','ROWLOCK',
  'NOEXPAND','HASH','FORCE',
  'AFTER','INSTEAD','OF','NOCOUNT',
  'RANGE','SCHEME','RETURNS','LANGUAGE',
  'CAST','CONVERT','TRY_CAST','TRY_CONVERT',
  'ASC','DESC','NULLS','FIRST','LAST',
  'ADD','COLUMN','MODIFY','RENAME','CHANGE','ENGINE','CHARSET',
  'SCHEMA','DATABASE','SHOW','DESCRIBE','EXPLAIN','ANALYZE',
  'AUTO_INCREMENT','SEQUENCE',
])

const SQL_TYPES = new Set([
  'INT','INTEGER','BIGINT','SMALLINT','TINYINT','BIT',
  'DECIMAL','NUMERIC','FLOAT','REAL','MONEY','SMALLMONEY',
  'CHAR','VARCHAR','NCHAR','NVARCHAR','TEXT','NTEXT','CLOB',
  'DATE','TIME','DATETIME','DATETIME2','SMALLDATETIME','TIMESTAMP','DATETIMEOFFSET',
  'BINARY','VARBINARY','IMAGE','BLOB',
  'UNIQUEIDENTIFIER','XML','JSON','BOOLEAN','BOOL','BYTEA','UUID',
  'SERIAL','BIGSERIAL','SMALLSERIAL',
])

const SQL_FUNCTIONS = new Set([
  'COUNT','SUM','AVG','MIN','MAX','STDEV','VARIANCE',
  'ROW_NUMBER','RANK','DENSE_RANK','NTILE','PERCENT_RANK','CUME_DIST',
  'LAG','LEAD','FIRST_VALUE','LAST_VALUE','NTH_VALUE',
  'GETDATE','GETUTCDATE','SYSDATETIME','SYSDATETIMEOFFSET','NOW','SYSDATE',
  'DATEADD','DATEDIFF','DATENAME','DATEPART','DATEFROMPARTS','EOMONTH',
  'YEAR','MONTH','DAY','HOUR','MINUTE','SECOND',
  'FORMAT','CONVERT','CAST','COALESCE','NULLIF','ISNULL','IIF','CHOOSE',
  'LEN','LENGTH','UPPER','LOWER','TRIM','LTRIM','RTRIM','SUBSTRING','SUBSTR',
  'LEFT','RIGHT','CHARINDEX','PATINDEX','REPLACE','REPLICATE','STUFF','CONCAT','STRING_AGG',
  'SPACE','STR','UNICODE','CHAR','ASCII','REVERSE',
  'ABS','CEILING','FLOOR','ROUND','SQRT','POWER','LOG','LOG10','EXP','PI','RAND','SIGN',
  'SCOPE_IDENTITY','NEWID','NEWSEQUENTIALID',
  'JSON_VALUE','JSON_QUERY','JSON_MODIFY','OPENJSON','ISJSON',
  'STRING_SPLIT','OBJECT_ID','QUOTENAME','PARSENAME','DB_NAME','USER_NAME','SCHEMA_NAME',
])

type TokenType = 'keyword' | 'type' | 'function' | 'string' | 'number' | 'comment' | 'operator' | 'variable' | 'plain'

interface Token { type: TokenType; text: string }

export function tokenizeSql(sql: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < sql.length) {
    // Single-line comment
    if (sql[i] === '-' && sql[i + 1] === '-') {
      let end = sql.indexOf('\n', i)
      if (end === -1) end = sql.length
      tokens.push({ type: 'comment', text: sql.slice(i, end) })
      i = end
      continue
    }
    // Block comment
    if (sql[i] === '/' && sql[i + 1] === '*') {
      let end = sql.indexOf('*/', i + 2)
      if (end === -1) end = sql.length - 2
      tokens.push({ type: 'comment', text: sql.slice(i, end + 2) })
      i = end + 2
      continue
    }
    // Single-quoted string
    if (sql[i] === "'") {
      let j = i + 1
      while (j < sql.length) {
        if (sql[j] === "'" && sql[j + 1] === "'") { j += 2; continue }
        if (sql[j] === "'") break
        j++
      }
      tokens.push({ type: 'string', text: sql.slice(i, j + 1) })
      i = j + 1
      continue
    }
    // Variable / parameter: @name or @@name
    if (sql[i] === '@') {
      let j = i + 1
      if (sql[j] === '@') j++
      while (j < sql.length && /[\w$]/.test(sql[j])) j++
      tokens.push({ type: 'variable', text: sql.slice(i, j) })
      i = j
      continue
    }
    // Bracketed identifier [name]
    if (sql[i] === '[') {
      let j = sql.indexOf(']', i)
      if (j === -1) j = sql.length - 1
      tokens.push({ type: 'plain', text: sql.slice(i, j + 1) })
      i = j + 1
      continue
    }
    // Number
    if (/[0-9]/.test(sql[i])) {
      let j = i
      while (j < sql.length && /[0-9.]/.test(sql[j])) j++
      tokens.push({ type: 'number', text: sql.slice(i, j) })
      i = j
      continue
    }
    // Word — keyword / type / function / identifier
    if (/[a-zA-Z_$]/.test(sql[i])) {
      let j = i
      while (j < sql.length && /[\w$]/.test(sql[j])) j++
      const word = sql.slice(i, j)
      const upper = word.toUpperCase()
      let type: TokenType = 'plain'
      if (SQL_KEYWORDS.has(upper)) type = 'keyword'
      else if (SQL_TYPES.has(upper)) type = 'type'
      else if (SQL_FUNCTIONS.has(upper) && sql[j] === '(') type = 'function'
      tokens.push({ type, text: word })
      i = j
      continue
    }
    // Everything else (whitespace, newlines, operators, punctuation)
    if (/[=<>!+\-*/%|&^~,;().[\]]/.test(sql[i])) {
      tokens.push({ type: 'operator', text: sql[i] })
    } else {
      tokens.push({ type: 'plain', text: sql[i] })
    }
    i++
  }
  return tokens
}

const TOKEN_COLORS: Record<TokenType, string> = {
  keyword:  'text-[#569cd6]',
  type:     'text-[#4ec9b0]',
  function: 'text-[#dcdcaa]',
  string:   'text-[#ce9178]',
  number:   'text-[#b5cea8]',
  comment:  'text-[#6a9955] italic',
  operator: 'text-[#d4d4d4]',
  variable: 'text-[#9cdcfe]',
  plain:    'text-[#d4d4d4]',
}

export function SqlHighlight({ code }: { code: string }) {
  const tokens = tokenizeSql(code)
  return (
    <code>
      {tokens.map((t, i) => (
        <span key={i} className={TOKEN_COLORS[t.type]}>{t.text}</span>
      ))}
    </code>
  )
}

/** Drop-in replacement for a readonly textarea showing highlighted SQL */
export function SqlCodeBlock({
  code,
  className = '',
  placeholder = '',
}: {
  code: string
  className?: string
  placeholder?: string
}) {
  return (
    <pre
      className={`bg-[#1e1e1e] rounded-xl p-3 font-mono text-xs overflow-auto whitespace-pre ${className}`}
    >
      {code ? <SqlHighlight code={code} /> : <span className="text-gray-500">{placeholder}</span>}
    </pre>
  )
}
