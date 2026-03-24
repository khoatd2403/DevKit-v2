import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync, mkdirSync, writeFileSync } from 'fs'
import process from 'node:process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { tools } from '../src/tools-registry'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../public/og')
mkdirSync(outDir, { recursive: true })

// Load Inter font
const fontPath = join(__dirname, '../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff')
const fontData = readFileSync(fontPath)

const CATEGORY_COLORS: Record<string, string> = {
  json: '#f59e0b',
  encoding: '#3b82f6',
  crypto: '#ef4444',
  string: '#22c55e',
  number: '#a855f7',
  datetime: '#f97316',
  web: '#06b6d4',
  color: '#ec4899',
  generator: '#6366f1',
  formatter: '#14b8a6',
  misc: '#64748b',
  converter: '#8b5cf6',
  dotnet: '#a855f7',
  ai: '#10b981',
}

const CATEGORY_LABEL: Record<string, string> = {
  json: 'JSON',
  encoding: 'ENC',
  crypto: 'SEC',
  string: 'STR',
  number: 'NUM',
  datetime: 'DATE',
  web: 'WEB',
  color: 'CLR',
  generator: 'GEN',
  formatter: 'FMT',
  misc: 'MISC',
  converter: 'CVT',
  dotnet: '.NET',
  ai: 'AI',
}

async function generateOG(id: string, name: string, description: string, icon: string, category: string) {
  const accentColor = CATEGORY_COLORS[category] ?? '#3b82f6'

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: '#0f172a',
          padding: '60px',
          fontFamily: 'Inter',
          position: 'relative',
        },
        children: [
          // Top accent bar
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '6px',
                background: accentColor,
              },
            },
          },
          // Logo row
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '60px',
              },
              children: [
                // Terminal icon
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '44px',
                      height: '44px',
                      background: '#111827',
                      borderRadius: '10px',
                      border: '1.5px solid #374151',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                    },
                    children: [
                      // Traffic lights row
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', gap: '4px', alignItems: 'center' },
                          children: [
                            { type: 'div', props: { style: { width: '7px', height: '7px', borderRadius: '50%', background: '#ff5f57' } } },
                            { type: 'div', props: { style: { width: '7px', height: '7px', borderRadius: '50%', background: '#febc2e' } } },
                            { type: 'div', props: { style: { width: '7px', height: '7px', borderRadius: '50%', background: '#28c840' } } },
                          ],
                        },
                      },
                      // Prompt
                      {
                        type: 'span',
                        props: {
                          style: { fontSize: '13px', fontWeight: 700, color: '#4ade80' },
                          children: '>_',
                        },
                      },
                    ],
                  },
                },
                // Brand text
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'baseline', gap: '0' },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: { fontSize: '22px', color: '#f1f5f9', fontWeight: 700 },
                          children: 'DevTools ',
                        },
                      },
                      {
                        type: 'span',
                        props: {
                          style: { fontSize: '22px', color: '#4ade80', fontWeight: 700 },
                          children: 'Online',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          // Icon + Title
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', gap: '28px', marginBottom: '28px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '88px',
                      height: '88px',
                      background: accentColor + '22',
                      border: `3px solid ${accentColor}66`,
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '38px',
                      fontWeight: 800,
                      color: accentColor,
                      flexShrink: 0,
                    },
                    children: CATEGORY_LABEL[category] ?? category.slice(0, 3).toUpperCase(),
                  },
                },
                {
                  type: 'h1',
                  props: {
                    style: {
                      fontSize: '58px',
                      fontWeight: 700,
                      color: '#f1f5f9',
                      margin: '0',
                      lineHeight: '1.15',
                    },
                    children: name,
                  },
                },
              ],
            },
          },
          // Description
          {
            type: 'p',
            props: {
              style: {
                fontSize: '28px',
                color: '#94a3b8',
                margin: '0',
                lineHeight: '1.5',
                maxWidth: '900px',
              },
              children: description,
            },
          },
          // Bottom badge
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '50px',
                right: '60px',
                background: accentColor + '22',
                border: `2px solid ${accentColor}44`,
                borderRadius: '8px',
                padding: '8px 18px',
                color: accentColor,
                fontSize: '18px',
                fontWeight: 600,
              },
              children: 'Free • No sign-up',
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Inter', data: fontData, weight: 600, style: 'normal' }],
    }
  )

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
  const png = resvg.render().asPng()
  writeFileSync(join(outDir, `${id}.png`), png)
}

async function main() {
  console.log(`Generating OG images for ${tools.length} tools...`)
  for (const tool of tools) {
    await generateOG(tool.id, tool.name, tool.description, tool.icon, tool.category)
    process.stdout.write('.')
  }
  console.log(`\nDone! Images saved to public/og/`)
}

main()
