import { useState } from 'react'
import { Copy, Check, FileKey } from 'lucide-react'

const SAMPLE_CERT = `-----BEGIN CERTIFICATE-----
MIIBkTCB+wIJAJAGOVzHQJU8MA0GCSqGSIb3DQEBCwUAMCMxITAfBgNVBAMT
GGV4YW1wbGUuc2VsZnNpZ25lZC5jb20wHhcNMjQwMTAxMDAwMDAwWhcNMjUw
MTAxMDAwMDAwWjAjMSEwHwYDVQQDExhleGFtcGxlLnNlbGZzaWduZWQuY29t
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBANLskvFGqXlEwUyBBFQbXv8bBkxN
lKmf7gvEf/bM3W3TfhL1VkOvPlMkQ6f6gOjbJKOcAlDZBEAcmS4bX0ECAQM
wDQYJKoZIhvcNAQELBQADQQCKhU0F5gL5e5oTrCHRe2Z4HFu4eNLYb4EWJF
T/dLnCzRhWMQJ/I8sXLYNklM2QIcPDzKaHn1KqeBMv4c7KlC
-----END CERTIFICATE-----`

interface CertField { label: string; value: string; mono?: boolean; multiline?: boolean }

// Minimal base64 decoder / DER parser — for display purposes only
// We parse the PEM cert to display common fields using pattern matching on known DER structures

function b64decode(str: string): Uint8Array {
  const bstr = atob(str)
  const bytes = new Uint8Array(bstr.length)
  for (let i = 0; i < bstr.length; i++) bytes[i] = bstr.charCodeAt(i)
  return bytes
}

function hexStr(bytes: Uint8Array, limit = 32): string {
  const parts = Array.from(bytes.slice(0, limit)).map(b => b.toString(16).padStart(2, '0'))
  if (bytes.length > limit) parts.push('...')
  return parts.join(':').toUpperCase()
}

// Read DER length
function readLength(buf: Uint8Array, pos: number): { len: number; advance: number } {
  const first = buf[pos]
  if (first < 0x80) return { len: first, advance: 1 }
  const numBytes = first & 0x7f
  let len = 0
  for (let i = 0; i < numBytes; i++) len = (len << 8) | buf[pos + 1 + i]
  return { len, advance: 1 + numBytes }
}

// Read OID bytes to dotted notation
function readOid(bytes: Uint8Array): string {
  if (bytes.length === 0) return ''
  const first = bytes[0]
  const components: number[] = [Math.floor(first / 40), first % 40]
  let val = 0
  for (let i = 1; i < bytes.length; i++) {
    val = (val << 7) | (bytes[i] & 0x7f)
    if ((bytes[i] & 0x80) === 0) {
      components.push(val)
      val = 0
    }
  }
  return components.join('.')
}

const KNOWN_OIDS: Record<string, string> = {
  '2.5.4.3': 'CN (Common Name)',
  '2.5.4.6': 'C (Country)',
  '2.5.4.7': 'L (Locality)',
  '2.5.4.8': 'ST (State)',
  '2.5.4.10': 'O (Organization)',
  '2.5.4.11': 'OU (Org Unit)',
  '1.2.840.113549.1.1.1': 'RSA Encryption',
  '1.2.840.113549.1.1.11': 'SHA256withRSA',
  '1.2.840.113549.1.1.5': 'SHA1withRSA',
  '1.2.840.10045.4.3.2': 'SHA256withECDSA',
  '2.5.29.17': 'Subject Alt Names',
  '2.5.29.19': 'Basic Constraints',
  '2.5.29.15': 'Key Usage',
  '2.5.29.37': 'Extended Key Usage',
  '2.5.29.14': 'Subject Key ID',
  '2.5.29.35': 'Authority Key ID',
  '2.5.29.31': 'CRL Distribution Points',
  '1.3.6.1.5.5.7.1.1': 'Authority Info Access',
}

function formatDate(dateStr: string): string {
  // UTCTime: YYMMDDHHMMSSZ or GeneralizedTime: YYYYMMDDHHMMSSZ
  if (dateStr.length === 13) {
    const yy = parseInt(dateStr.slice(0, 2))
    const year = yy >= 50 ? 1900 + yy : 2000 + yy
    return `${year}-${dateStr.slice(2, 4)}-${dateStr.slice(4, 6)} ${dateStr.slice(6, 8)}:${dateStr.slice(8, 10)}:${dateStr.slice(10, 12)} UTC`
  }
  if (dateStr.length === 15) {
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)} ${dateStr.slice(8, 10)}:${dateStr.slice(10, 12)}:${dateStr.slice(12, 14)} UTC`
  }
  return dateStr
}

interface ParsedCert {
  version?: string
  serial?: string
  subject?: string
  issuer?: string
  notBefore?: string
  notAfter?: string
  sigAlg?: string
  publicKeyAlg?: string
  publicKeyBits?: string
  extensions: string[]
  fingerprint?: string
  raw: Uint8Array
}

function parseCert(pem: string): ParsedCert {
  const lines = pem.trim().split('\n')
  const b64 = lines.filter(l => !l.startsWith('-----')).join('')
  const der = b64decode(b64)

  const result: ParsedCert = { extensions: [], raw: der }
  result.fingerprint = '' // will compute below

  // Compute SHA-256 fingerprint via SubtleCrypto if available
  // For now, just show hex dump
  result.fingerprint = hexStr(der.slice(0, 20)) + '...'

  // Basic DER traversal — walk the outer SEQUENCE
  let pos = 0
  function readTag(): number { return der[pos++] }
  function readLen(): number {
    const { len, advance } = readLength(der, pos)
    pos += advance
    return len
  }
  function readBytes(len: number): Uint8Array { const b = der.slice(pos, pos + len); pos += len; return b }

  try {
    readTag(); const totalLen = readLen() // outer SEQUENCE
    const end = pos + totalLen

    // tbsCertificate SEQUENCE
    readTag(); const tbsLen = readLen()
    const tbsEnd = pos + tbsLen

    // Version [0] EXPLICIT (optional)
    if (der[pos] === 0xa0) {
      pos++ // tag
      readLen()
      readTag(); readLen()
      const v = der[pos++]
      result.version = `v${v + 1}`
    } else {
      result.version = 'v1'
    }

    // Serial number INTEGER
    readTag(); const serialLen = readLen()
    result.serial = hexStr(readBytes(serialLen))

    // Signature algorithm SEQUENCE
    readTag(); const algLen = readLen()
    const algEnd = pos + algLen
    readTag(); const oidLen = readLen()
    const sigOid = readOid(readBytes(oidLen))
    result.sigAlg = KNOWN_OIDS[sigOid] ?? sigOid
    pos = algEnd

    // Issuer SEQUENCE
    readTag(); const issuerLen = readLen()
    const issuerEnd = pos + issuerLen
    const issuerParts: string[] = []
    while (pos < issuerEnd) {
      readTag(); readLen() // SET
      readTag(); readLen() // SEQUENCE
      readTag(); const oidL = readLen(); const oid = readOid(readBytes(oidL))
      const name = KNOWN_OIDS[oid] ?? oid
      const valTag = readTag()
      const valLen = readLen()
      const valBytes = readBytes(valLen)
      const val = new TextDecoder().decode(valBytes)
      issuerParts.push(`${name}=${val}`)
    }
    result.issuer = issuerParts.join(', ')
    pos = issuerEnd

    // Validity SEQUENCE
    readTag(); readLen()
    const notBeforeTag = readTag(); const nbLen = readLen()
    const nbBytes = readBytes(nbLen)
    result.notBefore = formatDate(new TextDecoder().decode(nbBytes))
    const notAfterTag = readTag(); const naLen = readLen()
    const naBytes = readBytes(naLen)
    result.notAfter = formatDate(new TextDecoder().decode(naBytes))
    void notBeforeTag; void notAfterTag

    // Subject SEQUENCE
    readTag(); const subjectLen = readLen()
    const subjectEnd = pos + subjectLen
    const subjectParts: string[] = []
    while (pos < subjectEnd) {
      readTag(); readLen()
      readTag(); readLen()
      readTag(); const oidL2 = readLen(); const oid2 = readOid(readBytes(oidL2))
      const name2 = KNOWN_OIDS[oid2] ?? oid2
      readTag(); const valLen2 = readLen()
      const val2 = new TextDecoder().decode(readBytes(valLen2))
      subjectParts.push(`${name2}=${val2}`)
    }
    result.subject = subjectParts.join(', ')
    pos = subjectEnd

    // SubjectPublicKeyInfo
    readTag(); const spkiLen = readLen()
    const spkiEnd = pos + spkiLen
    readTag(); const pkAlgLen = readLen()
    const pkAlgEnd = pos + pkAlgLen
    readTag(); const pkOidLen = readLen()
    const pkOid = readOid(readBytes(pkOidLen))
    result.publicKeyAlg = KNOWN_OIDS[pkOid] ?? pkOid
    pos = pkAlgEnd
    readTag(); const bsLen = readLen()
    result.publicKeyBits = String((bsLen - 1) * 8) + ' bits'
    pos = spkiEnd

    // Extensions [3] EXPLICIT
    if (pos < tbsEnd && der[pos] === 0xa3) {
      pos++ // [3]
      readLen()
      readTag(); readLen() // SEQUENCE of extensions
      // Just read OIDs
      while (pos < tbsEnd - 4) {
        if (der[pos] !== 0x30) break
        readTag(); const extLen = readLen(); const extEnd = pos + extLen
        readTag(); const extOidLen = readLen()
        const extOid = readOid(readBytes(extOidLen))
        result.extensions.push(KNOWN_OIDS[extOid] ?? extOid)
        pos = extEnd
      }
    }

    pos = tbsEnd
  } catch {
    // partial parse is fine, show what we got
  }

  return result
}

export default function CertDecoder() {
  const [pem, setPem] = useState(SAMPLE_CERT)
  const [cert, setCert] = useState<ParsedCert | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const decode = () => {
    setError('')
    setCert(null)
    try {
      if (!pem.includes('-----BEGIN')) throw new Error('Input must be a PEM-encoded certificate starting with -----BEGIN CERTIFICATE-----')
      const parsed = parseCert(pem)
      setCert(parsed)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const fields: CertField[] = cert ? [
    { label: 'Version', value: cert.version ?? '-' },
    { label: 'Serial Number', value: cert.serial ?? '-', mono: true },
    { label: 'Subject', value: cert.subject ?? '-', mono: true },
    { label: 'Issuer', value: cert.issuer ?? '-', mono: true },
    { label: 'Not Before', value: cert.notBefore ?? '-', mono: true },
    { label: 'Not After', value: cert.notAfter ?? '-', mono: true },
    { label: 'Signature Algorithm', value: cert.sigAlg ?? '-' },
    { label: 'Public Key Algorithm', value: cert.publicKeyAlg ?? '-' },
    { label: 'Public Key Size', value: cert.publicKeyBits ?? '-' },
    { label: 'Extensions', value: cert.extensions.join('\n') || 'None', mono: true, multiline: cert.extensions.length > 1 },
    { label: 'Fingerprint (hex)', value: cert.fingerprint ?? '-', mono: true },
  ] : []

  const isExpired = cert?.notAfter
    ? new Date(cert.notAfter.replace(' UTC', 'Z')) < new Date()
    : false

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">PEM Certificate</span>
          <button onClick={() => { setPem(SAMPLE_CERT); setCert(null) }}
            className="text-[10px] text-gray-400 hover:text-primary-600">Load sample</button>
        </div>
        <textarea
          value={pem}
          onChange={e => setPem(e.target.value)}
          rows={10}
          placeholder="Paste -----BEGIN CERTIFICATE----- here..."
          className="tool-textarea font-mono text-xs"
        />
      </div>

      <button onClick={decode} className="btn-primary px-5 flex items-center gap-2">
        <FileKey size={14} /> Decode Certificate
      </button>

      {error && (
        <p className="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl">{error}</p>
      )}

      {cert && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Certificate Details</h3>
              {isExpired
                ? <span className="text-[10px] bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">Expired</span>
                : <span className="text-[10px] bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">Valid Period</span>
              }
            </div>
            <button onClick={() => copy(fields.map(f => `${f.label}: ${f.value}`).join('\n'))}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600">
              {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
              Copy all
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {fields.map(f => (
              <div key={f.label} className="flex items-start gap-3 px-4 py-2.5">
                <span className="text-xs text-gray-400 w-36 shrink-0 pt-0.5">{f.label}</span>
                <span className={`text-xs break-all flex-1 ${f.mono ? 'font-mono text-gray-800 dark:text-gray-200' : 'text-gray-700 dark:text-gray-300'} ${f.multiline ? 'whitespace-pre' : ''}`}>
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[11px] text-gray-400">Decodes X.509 PEM certificates client-side — no data is sent to any server</p>
    </div>
  )
}
