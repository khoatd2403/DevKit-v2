import { useState } from 'react'
import CopyButton from '../components/CopyButton'

export default function MetaTagGenerator() {
  const [form, setForm] = useState({
    title: 'My Awesome Website',
    description: 'A fast, free developer toolkit.',
    keywords: '',
    author: '',
    url: '',
    image: '',
    type: 'website',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const tags = [
    `<meta charset="UTF-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
    form.title && `<title>${form.title}</title>`,
    form.description && `<meta name="description" content="${form.description}">`,
    form.keywords && `<meta name="keywords" content="${form.keywords}">`,
    form.author && `<meta name="author" content="${form.author}">`,
    form.robots && `<meta name="robots" content="${form.robots}">`,
    '',
    '<!-- Open Graph / Facebook -->',
    form.type && `<meta property="og:type" content="${form.type}">`,
    form.url && `<meta property="og:url" content="${form.url}">`,
    form.title && `<meta property="og:title" content="${form.title}">`,
    form.description && `<meta property="og:description" content="${form.description}">`,
    form.image && `<meta property="og:image" content="${form.image}">`,
    '',
    '<!-- Twitter -->',
    form.twitterCard && `<meta name="twitter:card" content="${form.twitterCard}">`,
    form.url && `<meta name="twitter:url" content="${form.url}">`,
    form.title && `<meta name="twitter:title" content="${form.title}">`,
    form.description && `<meta name="twitter:description" content="${form.description}">`,
    form.image && `<meta name="twitter:image" content="${form.image}">`,
  ].filter(Boolean).join('\n')

  const inputCls = 'tool-textarea h-auto py-2 text-sm'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {[
            { label: 'Page Title', key: 'title', placeholder: 'My Awesome Website' },
            { label: 'Description', key: 'description', placeholder: 'A short description of your page (150-160 chars)' },
            { label: 'Keywords', key: 'keywords', placeholder: 'react, typescript, web' },
            { label: 'Author', key: 'author', placeholder: 'John Doe' },
            { label: 'Canonical URL', key: 'url', placeholder: 'https://example.com' },
            { label: 'OG Image URL', key: 'image', placeholder: 'https://example.com/og.png' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">{label}</label>
              <input type="text" className={inputCls} placeholder={placeholder} value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)} />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Robots</label>
              <select value={form.robots} onChange={e => set('robots', e.target.value)} className="tool-textarea h-auto py-2 text-sm">
                {['index, follow', 'noindex, nofollow', 'index, nofollow', 'noindex, follow'].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Twitter Card</label>
              <select value={form.twitterCard} onChange={e => set('twitterCard', e.target.value)} className="tool-textarea h-auto py-2 text-sm">
                {['summary', 'summary_large_image', 'app', 'player'].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Generated Meta Tags</label>
            <CopyButton text={tags} />
          </div>
          <textarea className="tool-textarea h-[500px] text-xs" readOnly value={tags} />
        </div>
      </div>
    </div>
  )
}
