import { tools } from '../src/tools-registry'
import { writeFileSync } from 'fs'

const data = tools.map(t => ({
  id: t.id,
  name: t.name,
  description: t.description,
  icon: t.icon,
  category: t.category,
}))

writeFileSync('public/tools-data.json', JSON.stringify(data))
console.log(`Exported ${data.length} tools to public/tools-data.json`)
