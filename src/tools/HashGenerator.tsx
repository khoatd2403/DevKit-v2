import { useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

// Simple pure-JS implementations
function md5(input: string): string {
  // Use SubtleCrypto is async; provide a simple lookup via encoder
  // We'll use a basic implementation
  const str2bin = (str: string) => {
    const bin: number[] = []
    for (let i = 0; i < str.length * 8; i += 8) bin[i >> 5] = (bin[i >> 5] || 0) | ((str.charCodeAt(i / 8) & 0xFF) << (i % 32))
    return bin
  }
  const bin2hex = (bin: number[]) => {
    let hex = ''
    for (let i = 0; i < bin.length * 4; i++) {
      hex += '0123456789abcdef'.charAt((bin[i >> 2]! >> ((i % 4) * 8 + 4)) & 0xF)
      hex += '0123456789abcdef'.charAt((bin[i >> 2]! >> ((i % 4) * 8)) & 0xF)
    }
    return hex
  }
  const add32 = (a: number, b: number) => (a + b) & 0xFFFFFFFF
  const cmn = (q: number, a: number, b: number, x: number, s: number, t: number) => add32(((v => (v << s) | (v >>> (32 - s)))(add32(add32(a, q), add32(x, t)))), b)
  const ff = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn((b & c) | (~b & d), a, b, x, s, t)
  const gg = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn((b & d) | (c & ~d), a, b, x, s, t)
  const hh = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn(b ^ c ^ d, a, b, x, s, t)
  const ii = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn(c ^ (b | ~d), a, b, x, s, t)

  const x = str2bin(input)
  x[input.length >> 2] = (x[input.length >> 2] || 0) | (0x80 << ((input.length % 4) * 8))
  x[((input.length + 64 >>> 9) << 4) + 14] = input.length * 8

  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878

  for (let i = 0; i < x.length; i += 16) {
    const [oa, ob, oc, od] = [a, b, c, d]
    const g = (n: number) => x[i + n] || 0
    a=ff(a,b,c,d,g(0),7,-680876936);d=ff(d,a,b,c,g(1),12,-389564586);c=ff(c,d,a,b,g(2),17,606105819);b=ff(b,c,d,a,g(3),22,-1044525330)
    a=ff(a,b,c,d,g(4),7,-176418897);d=ff(d,a,b,c,g(5),12,1200080426);c=ff(c,d,a,b,g(6),17,-1473231341);b=ff(b,c,d,a,g(7),22,-45705983)
    a=ff(a,b,c,d,g(8),7,1770035416);d=ff(d,a,b,c,g(9),12,-1958414417);c=ff(c,d,a,b,g(10),17,-42063);b=ff(b,c,d,a,g(11),22,-1990404162)
    a=ff(a,b,c,d,g(12),7,1804603682);d=ff(d,a,b,c,g(13),12,-40341101);c=ff(c,d,a,b,g(14),17,-1502002290);b=ff(b,c,d,a,g(15),22,1236535329)
    a=gg(a,b,c,d,g(1),5,-165796510);d=gg(d,a,b,c,g(6),9,-1069501632);c=gg(c,d,a,b,g(11),14,643717713);b=gg(b,c,d,a,g(0),20,-373897302)
    a=gg(a,b,c,d,g(5),5,-701558691);d=gg(d,a,b,c,g(10),9,38016083);c=gg(c,d,a,b,g(15),14,-660478335);b=gg(b,c,d,a,g(4),20,-405537848)
    a=gg(a,b,c,d,g(9),5,568446438);d=gg(d,a,b,c,g(14),9,-1019803690);c=gg(c,d,a,b,g(3),14,-187363961);b=gg(b,c,d,a,g(8),20,1163531501)
    a=gg(a,b,c,d,g(13),5,-1444681467);d=gg(d,a,b,c,g(2),9,-51403784);c=gg(c,d,a,b,g(7),14,1735328473);b=gg(b,c,d,a,g(12),20,-1926607734)
    a=hh(a,b,c,d,g(5),4,-378558);d=hh(d,a,b,c,g(8),11,-2022574463);c=hh(c,d,a,b,g(11),16,1839030562);b=hh(b,c,d,a,g(14),23,-35309556)
    a=hh(a,b,c,d,g(1),4,-1530992060);d=hh(d,a,b,c,g(4),11,1272893353);c=hh(c,d,a,b,g(7),16,-155497632);b=hh(b,c,d,a,g(10),23,-1094730640)
    a=hh(a,b,c,d,g(13),4,681279174);d=hh(d,a,b,c,g(0),11,-358537222);c=hh(c,d,a,b,g(3),16,-722521979);b=hh(b,c,d,a,g(6),23,76029189)
    a=hh(a,b,c,d,g(9),4,-640364487);d=hh(d,a,b,c,g(12),11,-421815835);c=hh(c,d,a,b,g(15),16,530742520);b=hh(b,c,d,a,g(2),23,-995338651)
    a=ii(a,b,c,d,g(0),6,-198630844);d=ii(d,a,b,c,g(7),10,1126891415);c=ii(c,d,a,b,g(14),15,-1416354905);b=ii(b,c,d,a,g(5),21,-57434055)
    a=ii(a,b,c,d,g(12),6,1700485571);d=ii(d,a,b,c,g(3),10,-1894986606);c=ii(c,d,a,b,g(10),15,-1051523);b=ii(b,c,d,a,g(1),21,-2054922799)
    a=ii(a,b,c,d,g(8),6,1873313359);d=ii(d,a,b,c,g(15),10,-30611744);c=ii(c,d,a,b,g(6),15,-1560198380);b=ii(b,c,d,a,g(13),21,1309151649)
    a=ii(a,b,c,d,g(4),6,-145523070);d=ii(d,a,b,c,g(11),10,-1120210379);c=ii(c,d,a,b,g(2),15,718787259);b=ii(b,c,d,a,g(9),21,-343485551)
    a=add32(a,oa);b=add32(b,ob);c=add32(c,oc);d=add32(d,od)
  }
  return bin2hex([a, b, c, d])
}

async function sha(input: string, algo: string) {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(input))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function HashGenerator() {
  const [input, setInput] = usePersistentState('tool-hash-input', 'Hello, World!')
  const [hashes, setHashes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!input) return
    setLoading(true)
    const [sha1, sha256, sha512] = await Promise.all([
      sha(input, 'SHA-1'),
      sha(input, 'SHA-256'),
      sha(input, 'SHA-512'),
    ])
    setHashes({ MD5: md5(input), SHA1: sha1, SHA256: sha256, SHA512: sha512 })
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Input Text</label>
        <FileDropTextarea className="h-32" placeholder="Enter text to hash..." value={input} onChange={setInput} accept="text/*" />
      </div>
      <button onClick={generate} disabled={loading} className="btn-primary">
        {loading ? 'Generating...' : 'Generate Hashes'}
      </button>
      {Object.keys(hashes).length > 0 && (
        <div className="space-y-3">
          {Object.entries(hashes).map(([algo, hash]) => (
            <div key={algo} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">{algo}</span>
                <CopyButton text={hash} />
              </div>
              <p className="font-mono text-xs text-gray-700 dark:text-gray-300 break-all">{hash}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
