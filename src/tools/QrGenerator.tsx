import { useState, useEffect, useRef, useCallback } from 'react'
import QRCode from 'qrcode'

// ─── Types ────────────────────────────────────────────────────────────────────

type ContentType = 'text' | 'wifi' | 'email' | 'phone' | 'sms' | 'vcard'
type EccLevel = 'L' | 'M' | 'Q' | 'H'
type WifiEncryption = 'WPA' | 'WEP' | 'nopass'

interface WifiData {
  ssid: string
  password: string
  encryption: WifiEncryption
  hidden: boolean
}

interface EmailData {
  to: string
  subject: string
  body: string
}

interface SmsData {
  phone: string
  message: string
}

interface VCardData {
  name: string
  phone: string
  email: string
  org: string
  url: string
}

// ─── Content builders ─────────────────────────────────────────────────────────

function buildWifi(d: WifiData): string {
  const enc = d.encryption === 'nopass' ? 'nopass' : d.encryption
  const hidden = d.hidden ? 'H:true;' : ''
  return `WIFI:T:${enc};S:${escapeWifi(d.ssid)};P:${escapeWifi(d.password)};${hidden};`
}

function escapeWifi(s: string): string {
  return s.replace(/([\\;,":'])/g, '\\$1')
}

function buildEmail(d: EmailData): string {
  const params: string[] = []
  if (d.subject) params.push(`subject=${encodeURIComponent(d.subject)}`)
  if (d.body) params.push(`body=${encodeURIComponent(d.body)}`)
  return `mailto:${d.to}${params.length ? '?' + params.join('&') : ''}`
}

function buildPhone(phone: string): string {
  return `tel:${phone}`
}

function buildSms(d: SmsData): string {
  return `smsto:${d.phone}:${d.message}`
}

function buildVCard(d: VCardData): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    d.name ? `FN:${d.name}` : '',
    d.phone ? `TEL:${d.phone}` : '',
    d.email ? `EMAIL:${d.email}` : '',
    d.org ? `ORG:${d.org}` : '',
    d.url ? `URL:${d.url}` : '',
    'END:VCARD',
  ]
  return lines.filter(Boolean).join('\n')
}

// ─── Component ────────────────────────────────────────────────────────────────

const TABS: { id: ContentType; label: string }[] = [
  { id: 'text', label: 'Text / URL' },
  { id: 'wifi', label: 'WiFi' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'sms', label: 'SMS' },
  { id: 'vcard', label: 'vCard' },
]

export default function QrGenerator() {
  // Content type
  const [activeTab, setActiveTab] = useState<ContentType>('text')

  // Text / URL
  const [text, setText] = useState('https://example.com')

  // WiFi
  const [wifi, setWifi] = useState<WifiData>({ ssid: '', password: '', encryption: 'WPA', hidden: false })

  // Email
  const [emailData, setEmailData] = useState<EmailData>({ to: '', subject: '', body: '' })

  // Phone
  const [phone, setPhone] = useState('')

  // SMS
  const [smsData, setSmsData] = useState<SmsData>({ phone: '', message: '' })

  // vCard
  const [vcard, setVcard] = useState<VCardData>({ name: '', phone: '', email: '', org: '', url: '' })

  // QR options
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [ecc, setEcc] = useState<EccLevel>('M')
  const [size, setSize] = useState(256)
  const [margin, setMargin] = useState(2)

  // Logo
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Error state
  const [qrError, setQrError] = useState<string | null>(null)

  // ─── Build raw content string ──────────────────────────────────────────────

  const getRawContent = useCallback((): string => {
    switch (activeTab) {
      case 'text':   return text
      case 'wifi':   return buildWifi(wifi)
      case 'email':  return buildEmail(emailData)
      case 'phone':  return buildPhone(phone)
      case 'sms':    return buildSms(smsData)
      case 'vcard':  return buildVCard(vcard)
      default:       return ''
    }
  }, [activeTab, text, wifi, emailData, phone, smsData, vcard])

  // ─── QR generation ────────────────────────────────────────────────────────

  useEffect(() => {
    const timer = setTimeout(async () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const data = getRawContent()
      if (!data.trim()) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
        setQrError(null)
        return
      }

      try {
        await QRCode.toCanvas(canvas, data, {
          width: size,
          margin,
          color: { dark: fgColor, light: bgColor },
          errorCorrectionLevel: ecc,
        })
        setQrError(null)

        // Draw logo if set
        if (logoUrl) {
          const img = new Image()
          img.onload = () => {
            const ctx = canvas.getContext('2d')
            if (!ctx) return
            const logoSize = size * 0.2
            const x = (size - logoSize) / 2
            const y = (size - logoSize) / 2
            // White background pad for logo
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8)
            ctx.drawImage(img, x, y, logoSize, logoSize)
          }
          img.src = logoUrl
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        setQrError(msg)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [getRawContent, fgColor, bgColor, ecc, size, margin, logoUrl])

  // ─── Logo handling ────────────────────────────────────────────────────────

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setLogoUrl(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoUrl(null)
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  // ─── Export helpers ───────────────────────────────────────────────────────

  const downloadPng = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'qrcode.png'
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  const downloadSvg = async () => {
    const data = getRawContent()
    if (!data.trim()) return
    try {
      const svg = await QRCode.toString(data, {
        type: 'svg',
        margin,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: ecc,
        width: size,
      })
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'qrcode.svg'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // ignore
    }
  }

  const copyToClipboard = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(async blob => {
      if (!blob) return
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      } catch {
        // Clipboard API not available
      }
    })
  }

  // ─── Content preview ──────────────────────────────────────────────────────

  const rawContent = getRawContent()
  const preview = rawContent.length > 80 ? rawContent.slice(0, 80) + '…' : rawContent

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Tab selector */}
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">
          Content Type
        </label>
        <div className="flex flex-wrap gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-100 dark:bg-primary-900 border-primary-400 text-primary-700 dark:text-primary-300 font-medium'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content inputs */}
      <div className="space-y-3">
        {activeTab === 'text' && (
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
              Text or URL
            </label>
            <textarea
              className="tool-textarea h-24"
              placeholder="Enter URL, text, or any data..."
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </div>
        )}

        {activeTab === 'wifi' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">SSID (Network Name)</label>
              <input
                type="text"
                className="tool-textarea py-1.5"
                placeholder="MyNetwork"
                value={wifi.ssid}
                onChange={e => setWifi(w => ({ ...w, ssid: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Password</label>
              <input
                type="text"
                className="tool-textarea py-1.5"
                placeholder="Password"
                value={wifi.password}
                onChange={e => setWifi(w => ({ ...w, password: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Encryption</label>
              <div className="flex gap-1">
                {(['WPA', 'WEP', 'nopass'] as WifiEncryption[]).map(enc => (
                  <button
                    key={enc}
                    onClick={() => setWifi(w => ({ ...w, encryption: enc }))}
                    className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                      wifi.encryption === enc
                        ? 'bg-primary-100 dark:bg-primary-900 border-primary-400 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {enc === 'nopass' ? 'None' : enc}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="wifi-hidden"
                checked={wifi.hidden}
                onChange={e => setWifi(w => ({ ...w, hidden: e.target.checked }))}
                className="w-4 h-4 accent-primary-600"
              />
              <label htmlFor="wifi-hidden" className="text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer">
                Hidden network
              </label>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">To</label>
              <input
                type="email"
                className="tool-textarea py-1.5"
                placeholder="recipient@example.com"
                value={emailData.to}
                onChange={e => setEmailData(d => ({ ...d, to: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Subject</label>
              <input
                type="text"
                className="tool-textarea py-1.5"
                placeholder="Subject line"
                value={emailData.subject}
                onChange={e => setEmailData(d => ({ ...d, subject: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Body</label>
              <textarea
                className="tool-textarea h-20"
                placeholder="Email body..."
                value={emailData.body}
                onChange={e => setEmailData(d => ({ ...d, body: e.target.value }))}
              />
            </div>
          </div>
        )}

        {activeTab === 'phone' && (
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Phone Number</label>
            <input
              type="tel"
              className="tool-textarea py-1.5"
              placeholder="+1 555 123 4567"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
        )}

        {activeTab === 'sms' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Phone Number</label>
              <input
                type="tel"
                className="tool-textarea py-1.5"
                placeholder="+1 555 123 4567"
                value={smsData.phone}
                onChange={e => setSmsData(d => ({ ...d, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Message</label>
              <textarea
                className="tool-textarea h-20"
                placeholder="Message text..."
                value={smsData.message}
                onChange={e => setSmsData(d => ({ ...d, message: e.target.value }))}
              />
            </div>
          </div>
        )}

        {activeTab === 'vcard' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Full Name</label>
              <input
                type="text"
                className="tool-textarea py-1.5"
                placeholder="Jane Doe"
                value={vcard.name}
                onChange={e => setVcard(v => ({ ...v, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Phone</label>
              <input
                type="tel"
                className="tool-textarea py-1.5"
                placeholder="+1 555 123 4567"
                value={vcard.phone}
                onChange={e => setVcard(v => ({ ...v, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Email</label>
              <input
                type="email"
                className="tool-textarea py-1.5"
                placeholder="jane@example.com"
                value={vcard.email}
                onChange={e => setVcard(v => ({ ...v, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Organization</label>
              <input
                type="text"
                className="tool-textarea py-1.5"
                placeholder="Acme Corp"
                value={vcard.org}
                onChange={e => setVcard(v => ({ ...v, org: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Website URL</label>
              <input
                type="url"
                className="tool-textarea py-1.5"
                placeholder="https://example.com"
                value={vcard.url}
                onChange={e => setVcard(v => ({ ...v, url: e.target.value }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content preview */}
      {rawContent.trim() && (
        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all leading-relaxed">
          Encodes: {preview}
        </p>
      )}

      {/* Customization options */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Customization</p>

        <div className="flex flex-wrap gap-x-6 gap-y-3 items-end">
          {/* Colors */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Foreground</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor}
                onChange={e => setFgColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-gray-200 dark:border-gray-700"
              />
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{fgColor}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Background</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={e => setBgColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-gray-200 dark:border-gray-700"
              />
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{bgColor}</span>
            </div>
          </div>

          {/* Error correction */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Error Correction</label>
            <div className="flex gap-1">
              {(['L', 'M', 'Q', 'H'] as EccLevel[]).map(level => (
                <button
                  key={level}
                  onClick={() => setEcc(level)}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                    ecc === level
                      ? 'bg-primary-100 dark:bg-primary-900 border-primary-400 text-primary-700 dark:text-primary-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-3 items-end">
          {/* Size slider */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
              Size: {size} × {size} px
            </label>
            <input
              type="range"
              min={128}
              max={512}
              step={32}
              value={size}
              onChange={e => setSize(+e.target.value)}
              className="w-40 accent-primary-600"
            />
          </div>

          {/* Margin */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
              Margin: {margin}
            </label>
            <input
              type="range"
              min={0}
              max={4}
              step={1}
              value={margin}
              onChange={e => setMargin(+e.target.value)}
              className="w-32 accent-primary-600"
            />
          </div>
        </div>
      </div>

      {/* Logo section */}
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Logo / Icon (optional)</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => logoInputRef.current?.click()}
              className="btn-ghost text-xs px-3 py-1.5"
            >
              {logoUrl ? 'Change Logo' : 'Add Logo'}
            </button>
            {logoUrl && (
              <>
                <img src={logoUrl} alt="Logo preview" className="w-8 h-8 rounded object-cover border border-gray-200 dark:border-gray-700" />
                <button onClick={removeLogo} className="btn-ghost text-xs px-3 py-1.5 text-red-500 dark:text-red-400">
                  Remove
                </button>
              </>
            )}
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoChange}
          />
        </div>
      </div>

      {/* Error message */}
      {qrError && (
        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
          QR generation failed: {qrError}
        </div>
      )}

      {/* QR Canvas output */}
      {rawContent.trim() && !qrError && (
        <div className="flex flex-col items-center gap-4">
          <div className="inline-block bg-white p-3 rounded-xl border border-gray-200 dark:border-gray-700">
            <canvas ref={canvasRef} />
          </div>

          {/* Export buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button onClick={downloadPng} className="btn-primary text-sm">
              Download PNG
            </button>
            <button onClick={downloadSvg} className="btn-secondary text-sm">
              Download SVG
            </button>
            <button onClick={copyToClipboard} className="btn-ghost text-sm">
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}

      {/* Empty state canvas (hidden, needed for ref) */}
      {(!rawContent.trim() || qrError) && (
        <canvas ref={canvasRef} className="hidden" />
      )}
    </div>
  )
}
