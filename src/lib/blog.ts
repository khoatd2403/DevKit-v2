import { parse as parseMarkdown } from 'marked'

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

const rawPosts = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function parseFrontmatter(raw: string): { meta: Record<string, unknown>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw)
  if (!match) return { meta: {}, body: raw }

  const fmText = match[1]
  const body = match[2]
  const meta: Record<string, unknown> = {}

  let key: string | null = null
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
      key = kv[1]
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

function stripQuotes(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1)
  }
  return s
}

function deriveSlugFromPath(path: string): string {
  const file = path.split('/').pop() ?? ''
  return file.replace(/\.md$/, '')
}

const posts: BlogPost[] = Object.entries(rawPosts).map(([path, raw]) => {
  const { meta, body } = parseFrontmatter(raw)
  const slug = (meta.slug as string) || deriveSlugFromPath(path)
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

export function getAllPosts(): BlogPost[] {
  return posts
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find(p => p.slug === slug)
}

export function renderMarkdown(md: string): string {
  return parseMarkdown(md, { async: false }) as string
}

export function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function readingTimeMinutes(body: string): number {
  const words = body.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 220))
}

export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getAllTags(): string[] {
  const set = new Set<string>()
  for (const p of posts) for (const t of p.tags) set.add(t)
  return [...set].sort()
}

export function getPostsByTag(slug: string): BlogPost[] {
  return posts.filter(p => p.tags.some(t => tagSlug(t) === slug))
}
