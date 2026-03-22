import { useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'
import { SqlCodeBlock } from '../lib/sqlHighlight'

const KEYWORDS = ['SELECT','FROM','WHERE','JOIN','LEFT JOIN','RIGHT JOIN','INNER JOIN','OUTER JOIN','ON','AND','OR','NOT','IN','EXISTS','BETWEEN','LIKE','IS NULL','IS NOT NULL','ORDER BY','GROUP BY','HAVING','LIMIT','OFFSET','INSERT INTO','VALUES','UPDATE','SET','DELETE FROM','CREATE TABLE','ALTER TABLE','DROP TABLE','INDEX','PRIMARY KEY','FOREIGN KEY','REFERENCES','AS','DISTINCT','UNION','INTERSECT','EXCEPT','CASE','WHEN','THEN','ELSE','END','WITH']

function formatSql(sql: string): string {
  let result = sql.trim()
  // Normalize whitespace
  result = result.replace(/\s+/g, ' ')
  // Add newlines before major keywords
  const majors = ['SELECT','FROM','WHERE','JOIN','LEFT JOIN','RIGHT JOIN','INNER JOIN','ORDER BY','GROUP BY','HAVING','LIMIT','UNION','INSERT INTO','UPDATE','DELETE FROM','SET','VALUES','WITH']
  for (const kw of majors) {
    result = result.replace(new RegExp(`\\b${kw}\\b`, 'gi'), `\n${kw}`)
  }
  result = result.replace(/,(?!\s*\n)/g, ',\n  ')
  result = result.replace(/\n\s*\n/g, '\n').trim()
  // Uppercase keywords
  for (const kw of KEYWORDS) {
    result = result.replace(new RegExp(`\\b${kw}\\b`, 'gi'), kw)
  }
  return result
}

const SAMPLE = `select u.id, u.name, u.email, count(o.id) as order_count from users u left join orders o on u.id = o.user_id where u.active = 1 and u.created_at > '2024-01-01' group by u.id, u.name, u.email having count(o.id) > 0 order by order_count desc limit 10`

export default function SqlFormatter() {
  const [input, setInput] = usePersistentState('tool-sql-input', 'SELECT u.id,u.name,u.email,o.total FROM users u INNER JOIN orders o ON u.id=o.user_id WHERE u.active=1 AND o.total>100 ORDER BY o.total DESC LIMIT 10')
  const [output, setOutput] = useState('')

  const format = () => setOutput(formatSql(input))
  const minify = () => setOutput(input.replace(/\s+/g, ' ').trim())

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setInput(SAMPLE)} className="btn-ghost text-xs">Load Example</button>
        <div className="flex gap-2 ml-auto">
          <button onClick={minify} className="btn-secondary">Minify</button>
          <button onClick={format} className="btn-primary">Format SQL</button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Input SQL</label>
          <FileDropTextarea className="h-72" placeholder="SELECT * FROM users WHERE id = 1" value={input} onChange={setInput} accept=".sql,text/plain,text/*" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Formatted Output</label>
            <CopyButton text={output} />
          </div>
          <SqlCodeBlock code={output} className="h-72" placeholder="Formatted SQL will appear here..." />
        </div>
      </div>
    </div>
  )
}
