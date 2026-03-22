import type { Context } from 'https://edge.netlify.com'

const BASE_URL = 'https://alldevtool.netlify.app'

export default async function handler(request: Request, context: Context) {
  const url = new URL(request.url)
  const match = url.pathname.match(/^\/tool\/([^/]+)$/)
  if (!match) return context.next()

  const toolId = match[1]

  // Fetch tools data
  const dataUrl = `${BASE_URL}/tools-data.json`
  let tool: { id: string; name: string; description: string; icon: string } | undefined
  try {
    const res = await fetch(dataUrl)
    const tools: Array<{ id: string; name: string; description: string; icon: string }> = await res.json()
    tool = tools.find(t => t.id === toolId)
  } catch {
    return context.next()
  }

  if (!tool) return context.next()

  // Get the original HTML response
  const response = await context.next()
  const html = await response.text()

  const pageTitle = `${tool.name} — DevKit`
  const pageDesc = `${tool.description}. Free online tool, no sign-up required.`
  const pageUrl = `${BASE_URL}/tool/${toolId}`
  const ogImage = `${BASE_URL}/og/${toolId}.png`

  const injected = html
    .replace(/<title>[^<]*<\/title>/, `<title>${pageTitle}</title>`)
    .replace(
      '</head>',
      `<meta name="description" content="${pageDesc}" />
<link rel="canonical" href="${pageUrl}" />
<meta property="og:title" content="${pageTitle}" />
<meta property="og:description" content="${pageDesc}" />
<meta property="og:url" content="${pageUrl}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${pageTitle}" />
<meta name="twitter:description" content="${pageDesc}" />
<meta name="twitter:image" content="${ogImage}" />
</head>`
    )

  return new Response(injected, {
    headers: { ...Object.fromEntries(response.headers), 'content-type': 'text/html; charset=utf-8' },
    status: response.status,
  })
}

export const config = { path: '/tool/*' }
