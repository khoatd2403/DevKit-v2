import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface MimeEntry {
  ext: string
  mime: string
  description: string
  category: string
}

const MIME_TYPES: MimeEntry[] = [
  // Application
  { ext: '.json', mime: 'application/json', description: 'JSON data format', category: 'Application' },
  { ext: '.pdf', mime: 'application/pdf', description: 'Adobe PDF document', category: 'Application' },
  { ext: '.zip', mime: 'application/zip', description: 'ZIP archive', category: 'Application' },
  { ext: '.gz', mime: 'application/gzip', description: 'Gzip compressed archive', category: 'Application' },
  { ext: '.tar', mime: 'application/x-tar', description: 'TAR archive', category: 'Application' },
  { ext: '.7z', mime: 'application/x-7z-compressed', description: '7-Zip archive', category: 'Application' },
  { ext: '.rar', mime: 'application/vnd.rar', description: 'RAR archive', category: 'Application' },
  { ext: '.xml', mime: 'application/xml', description: 'XML data', category: 'Application' },
  { ext: '.js', mime: 'application/javascript', description: 'JavaScript source file', category: 'Application' },
  { ext: '.mjs', mime: 'application/javascript', description: 'JavaScript ES module', category: 'Application' },
  { ext: '.wasm', mime: 'application/wasm', description: 'WebAssembly binary', category: 'Application' },
  { ext: '.bin', mime: 'application/octet-stream', description: 'Binary data', category: 'Application' },
  { ext: '.exe', mime: 'application/vnd.microsoft.portable-executable', description: 'Windows executable', category: 'Application' },
  { ext: '.dmg', mime: 'application/x-apple-diskimage', description: 'Apple disk image', category: 'Application' },
  { ext: '.deb', mime: 'application/vnd.debian.binary-package', description: 'Debian package', category: 'Application' },
  { ext: '.rpm', mime: 'application/x-rpm', description: 'RPM package', category: 'Application' },
  { ext: '.apk', mime: 'application/vnd.android.package-archive', description: 'Android application package', category: 'Application' },
  { ext: '.swf', mime: 'application/x-shockwave-flash', description: 'Adobe Flash (deprecated)', category: 'Application' },
  { ext: '.xhtml', mime: 'application/xhtml+xml', description: 'XHTML document', category: 'Application' },
  { ext: '.atom', mime: 'application/atom+xml', description: 'Atom feed', category: 'Application' },
  { ext: '.rss', mime: 'application/rss+xml', description: 'RSS feed', category: 'Application' },
  { ext: '.rtf', mime: 'application/rtf', description: 'Rich Text Format document', category: 'Application' },
  { ext: '.doc', mime: 'application/msword', description: 'Microsoft Word document (legacy)', category: 'Application' },
  { ext: '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', description: 'Microsoft Word document', category: 'Application' },
  { ext: '.xls', mime: 'application/vnd.ms-excel', description: 'Microsoft Excel spreadsheet (legacy)', category: 'Application' },
  { ext: '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', description: 'Microsoft Excel spreadsheet', category: 'Application' },
  { ext: '.ppt', mime: 'application/vnd.ms-powerpoint', description: 'Microsoft PowerPoint (legacy)', category: 'Application' },
  { ext: '.pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', description: 'Microsoft PowerPoint presentation', category: 'Application' },
  { ext: '.odt', mime: 'application/vnd.oasis.opendocument.text', description: 'OpenDocument text', category: 'Application' },
  { ext: '.ods', mime: 'application/vnd.oasis.opendocument.spreadsheet', description: 'OpenDocument spreadsheet', category: 'Application' },
  { ext: '.odp', mime: 'application/vnd.oasis.opendocument.presentation', description: 'OpenDocument presentation', category: 'Application' },
  { ext: '.epub', mime: 'application/epub+zip', description: 'Electronic publication (e-book)', category: 'Application' },
  { ext: '.jar', mime: 'application/java-archive', description: 'Java Archive', category: 'Application' },
  { ext: '.war', mime: 'application/java-archive', description: 'Web Application Archive', category: 'Application' },
  { ext: '.graphql', mime: 'application/graphql', description: 'GraphQL query', category: 'Application' },
  { ext: '.woff', mime: 'font/woff', description: 'Web Open Font Format', category: 'Font' },
  // Audio
  { ext: '.mp3', mime: 'audio/mpeg', description: 'MP3 audio', category: 'Audio' },
  { ext: '.ogg', mime: 'audio/ogg', description: 'Ogg Vorbis audio', category: 'Audio' },
  { ext: '.wav', mime: 'audio/wav', description: 'Waveform audio', category: 'Audio' },
  { ext: '.aac', mime: 'audio/aac', description: 'Advanced Audio Codec', category: 'Audio' },
  { ext: '.flac', mime: 'audio/flac', description: 'Free Lossless Audio Codec', category: 'Audio' },
  { ext: '.m4a', mime: 'audio/mp4', description: 'MPEG-4 audio', category: 'Audio' },
  { ext: '.opus', mime: 'audio/opus', description: 'Opus audio codec', category: 'Audio' },
  { ext: '.weba', mime: 'audio/webm', description: 'WebM audio', category: 'Audio' },
  { ext: '.mid', mime: 'audio/midi', description: 'MIDI audio', category: 'Audio' },
  { ext: '.midi', mime: 'audio/midi', description: 'MIDI audio', category: 'Audio' },
  { ext: '.aiff', mime: 'audio/aiff', description: 'Audio Interchange File Format', category: 'Audio' },
  { ext: '.wma', mime: 'audio/x-ms-wma', description: 'Windows Media Audio', category: 'Audio' },
  // Font
  { ext: '.woff2', mime: 'font/woff2', description: 'Web Open Font Format 2', category: 'Font' },
  { ext: '.ttf', mime: 'font/ttf', description: 'TrueType Font', category: 'Font' },
  { ext: '.otf', mime: 'font/otf', description: 'OpenType Font', category: 'Font' },
  { ext: '.eot', mime: 'application/vnd.ms-fontobject', description: 'Embedded OpenType font', category: 'Font' },
  { ext: '.sfnt', mime: 'font/sfnt', description: 'SFNT font format', category: 'Font' },
  // Image
  { ext: '.jpg', mime: 'image/jpeg', description: 'JPEG image', category: 'Image' },
  { ext: '.jpeg', mime: 'image/jpeg', description: 'JPEG image', category: 'Image' },
  { ext: '.png', mime: 'image/png', description: 'PNG image', category: 'Image' },
  { ext: '.gif', mime: 'image/gif', description: 'GIF image', category: 'Image' },
  { ext: '.webp', mime: 'image/webp', description: 'WebP image', category: 'Image' },
  { ext: '.svg', mime: 'image/svg+xml', description: 'Scalable Vector Graphics', category: 'Image' },
  { ext: '.ico', mime: 'image/x-icon', description: 'ICO icon format', category: 'Image' },
  { ext: '.bmp', mime: 'image/bmp', description: 'Bitmap image', category: 'Image' },
  { ext: '.tiff', mime: 'image/tiff', description: 'TIFF image', category: 'Image' },
  { ext: '.tif', mime: 'image/tiff', description: 'TIFF image', category: 'Image' },
  { ext: '.avif', mime: 'image/avif', description: 'AV1 Image File Format', category: 'Image' },
  { ext: '.heic', mime: 'image/heic', description: 'High Efficiency Image Container', category: 'Image' },
  { ext: '.heif', mime: 'image/heif', description: 'High Efficiency Image File Format', category: 'Image' },
  { ext: '.raw', mime: 'image/x-raw', description: 'Raw image format', category: 'Image' },
  { ext: '.psd', mime: 'image/vnd.adobe.photoshop', description: 'Adobe Photoshop document', category: 'Image' },
  { ext: '.ai', mime: 'application/postscript', description: 'Adobe Illustrator document', category: 'Image' },
  { ext: '.eps', mime: 'application/postscript', description: 'Encapsulated PostScript', category: 'Image' },
  // Model
  { ext: '.gltf', mime: 'model/gltf+json', description: 'GL Transmission Format (JSON)', category: 'Model' },
  { ext: '.glb', mime: 'model/gltf-binary', description: 'GL Transmission Format (binary)', category: 'Model' },
  { ext: '.obj', mime: 'model/obj', description: 'Wavefront OBJ 3D model', category: 'Model' },
  { ext: '.stl', mime: 'model/stl', description: 'Stereolithography 3D model', category: 'Model' },
  { ext: '.usd', mime: 'model/vnd.usdz+zip', description: 'Universal Scene Description', category: 'Model' },
  { ext: '.usdz', mime: 'model/vnd.usdz+zip', description: 'Universal Scene Description (zip)', category: 'Model' },
  { ext: '.fbx', mime: 'model/vnd.fbx', description: 'Autodesk FBX 3D model', category: 'Model' },
  { ext: '.3ds', mime: 'image/x-3ds', description: '3D Studio model', category: 'Model' },
  // Text
  { ext: '.html', mime: 'text/html', description: 'HTML document', category: 'Text' },
  { ext: '.htm', mime: 'text/html', description: 'HTML document', category: 'Text' },
  { ext: '.css', mime: 'text/css', description: 'Cascading Style Sheet', category: 'Text' },
  { ext: '.txt', mime: 'text/plain', description: 'Plain text file', category: 'Text' },
  { ext: '.csv', mime: 'text/csv', description: 'Comma-separated values', category: 'Text' },
  { ext: '.tsv', mime: 'text/tab-separated-values', description: 'Tab-separated values', category: 'Text' },
  { ext: '.md', mime: 'text/markdown', description: 'Markdown document', category: 'Text' },
  { ext: '.yaml', mime: 'text/yaml', description: 'YAML data format', category: 'Text' },
  { ext: '.yml', mime: 'text/yaml', description: 'YAML data format', category: 'Text' },
  { ext: '.ics', mime: 'text/calendar', description: 'iCalendar format', category: 'Text' },
  { ext: '.vcard', mime: 'text/vcard', description: 'vCard contact format', category: 'Text' },
  { ext: '.vcf', mime: 'text/vcard', description: 'vCard contact format', category: 'Text' },
  { ext: '.sh', mime: 'text/x-shellscript', description: 'Shell script', category: 'Text' },
  { ext: '.py', mime: 'text/x-python', description: 'Python source code', category: 'Text' },
  { ext: '.java', mime: 'text/x-java-source', description: 'Java source code', category: 'Text' },
  { ext: '.ts', mime: 'text/typescript', description: 'TypeScript source code', category: 'Text' },
  { ext: '.tsx', mime: 'text/typescript', description: 'TypeScript JSX source code', category: 'Text' },
  { ext: '.jsx', mime: 'text/jsx', description: 'JavaScript JSX source code', category: 'Text' },
  { ext: '.log', mime: 'text/plain', description: 'Log file', category: 'Text' },
  { ext: '.ini', mime: 'text/plain', description: 'INI configuration file', category: 'Text' },
  { ext: '.toml', mime: 'application/toml', description: 'TOML configuration format', category: 'Text' },
  { ext: '.sql', mime: 'application/sql', description: 'SQL script', category: 'Text' },
  { ext: '.conf', mime: 'text/plain', description: 'Configuration file', category: 'Text' },
  // Video
  { ext: '.mp4', mime: 'video/mp4', description: 'MPEG-4 video', category: 'Video' },
  { ext: '.webm', mime: 'video/webm', description: 'WebM video', category: 'Video' },
  { ext: '.ogg', mime: 'video/ogg', description: 'Ogg video', category: 'Video' },
  { ext: '.mov', mime: 'video/quicktime', description: 'Apple QuickTime video', category: 'Video' },
  { ext: '.avi', mime: 'video/x-msvideo', description: 'Audio Video Interleave', category: 'Video' },
  { ext: '.mkv', mime: 'video/x-matroska', description: 'Matroska video', category: 'Video' },
  { ext: '.flv', mime: 'video/x-flv', description: 'Flash video (legacy)', category: 'Video' },
  { ext: '.wmv', mime: 'video/x-ms-wmv', description: 'Windows Media Video', category: 'Video' },
  { ext: '.3gp', mime: 'video/3gpp', description: '3GPP video (mobile)', category: 'Video' },
  { ext: '.m4v', mime: 'video/mp4', description: 'iTunes video format', category: 'Video' },
  { ext: '.ts', mime: 'video/mp2t', description: 'MPEG-2 Transport Stream', category: 'Video' },
  { ext: '.hevc', mime: 'video/hevc', description: 'High Efficiency Video Coding', category: 'Video' },
]

type Category = 'All' | 'Application' | 'Audio' | 'Font' | 'Image' | 'Model' | 'Text' | 'Video'

function CopyCell({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={copy}
      className="group flex items-center gap-1.5 font-mono text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors text-left"
      title="Click to copy"
    >
      <span className="break-all">{text}</span>
      <span className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {copied ? <Check size={11} /> : <Copy size={11} />}
      </span>
    </button>
  )
}

export default function MimeTypes() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category>('All')

  const categories: Category[] = ['All', 'Application', 'Audio', 'Font', 'Image', 'Model', 'Text', 'Video']

  const filtered = MIME_TYPES.filter(m => {
    const q = search.toLowerCase()
    const matchSearch = !q || m.ext.toLowerCase().includes(q) || m.mime.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
    const matchCat = category === 'All' || m.category === category
    return matchSearch && matchCat
  })

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="text"
        placeholder="Search by extension or MIME type..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="tool-textarea h-auto py-2"
      />

      {/* Category filter */}
      <div className="flex flex-wrap gap-1">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${category === c ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-gray-500 dark:text-gray-400">{filtered.length} MIME type{filtered.length !== 1 ? 's' : ''}</p>

      {/* Table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/70 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-24">Extension</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">MIME Type</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell">Description</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-24 hidden md:table-cell">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((m, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded">
                      {m.ext}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <CopyCell text={m.mime} />
                  </td>
                  <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400 text-xs hidden sm:table-cell">{m.description}</td>
                  <td className="px-4 py-2.5 hidden md:table-cell">
                    <span className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full">
                      {m.category}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">No MIME types match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
