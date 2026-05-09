import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

export interface BlogPostMeta {
  title: string
  slug: string
  description: string
  date: string
  author: string
  keywords: string[]
  tags: string[]
  cover?: string
  excerpt: string
}

export interface BlogPost extends BlogPostMeta {
  body: string
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const BLOG_DIR = join(__dirname, '../src/content/blog')

function stripQuotes(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1)
  }
  return s
}

function parseFrontmatter(raw: string): { meta: Record<string, unknown>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw)
  if (!match) return { meta: {}, body: raw }

  const fmText = match[1]
  const body = match[2]
  const meta: Record<string, unknown> = {}

  let listKey: string | null = null
  const lines = fmText.split(/\r?\n/)
  for (const line of lines) {
    if (!line.trim()) continue
    const listItem = /^\s+-\s+(.+)$/.exec(line)
    if (listItem && listKey) {
      const arr = (meta[listKey] as string[]) || []
      arr.push(stripQuotes(listItem[1].trim()))
      meta[listKey] = arr
      continue
    }
    const kv = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line)
    if (kv) {
      const key = kv[1]
      const value = kv[2].trim()
      if (value === '') {
        meta[key] = []
        listKey = key
      } else {
        meta[key] = stripQuotes(value)
        listKey = null
      }
    }
  }

  return { meta, body }
}

export function loadAllPosts(): BlogPost[] {
  const files = readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))
  const posts: BlogPost[] = files.map(file => {
    const raw = readFileSync(join(BLOG_DIR, file), 'utf-8')
    const { meta, body } = parseFrontmatter(raw)
    const slug = (meta.slug as string) || file.replace(/\.md$/, '')
    return {
      title: (meta.title as string) || slug,
      slug,
      description: (meta.description as string) || '',
      date: (meta.date as string) || '',
      author: (meta.author as string) || 'DevTools Online Team',
      keywords: (meta.keywords as string[]) || [],
      tags: (meta.tags as string[]) || [],
      cover: meta.cover as string | undefined,
      excerpt: (meta.excerpt as string) || (meta.description as string) || '',
      body,
    }
  })
  posts.sort((a, b) => (a.date < b.date ? 1 : -1))
  return posts
}

export function getAllTags(posts: BlogPost[]): string[] {
  const set = new Set<string>()
  for (const p of posts) for (const t of p.tags) set.add(t)
  return [...set].sort()
}

export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
