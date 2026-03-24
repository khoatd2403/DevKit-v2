import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { useToast } from '../context/ToastContext'

export default function CopyButton({ text, label, toast, className = '' }: { text: string; label?: string; toast?: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()

  const copy = async () => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    showToast(toast ?? 'Copied to clipboard', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={copy} className={`btn-ghost text-xs flex items-center gap-1 ${className}`} title="Copy to clipboard (Ctrl+Shift+C)">
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
      {copied ? 'Copied!' : (label ?? 'Copy')}
    </button>
  )
}
