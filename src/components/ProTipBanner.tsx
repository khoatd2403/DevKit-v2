import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useProTip } from '../hooks/useProTip'

export default function ProTipBanner({ toolId, tip, tipId }: { toolId: string; tip: string; tipId: string }) {
  const { isSeen, markSeen } = useProTip(toolId)
  const [visible, setVisible] = useState(!isSeen(tipId))

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => { setVisible(false); markSeen(tipId) }, 10000)
    return () => clearTimeout(t)
  }, [visible])

  if (!visible) return null

  return (
    <div className="flex items-start gap-2 mb-4 px-3 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-sm">
      <span className="text-amber-500 mt-0.5 shrink-0">💡</span>
      <p className="flex-1 text-amber-800 dark:text-amber-300 text-xs">{tip}</p>
      <button
        onClick={() => { setVisible(false); markSeen(tipId) }}
        className="text-amber-400 hover:text-amber-600 dark:hover:text-amber-200 shrink-0"
      >
        <X size={13} />
      </button>
    </div>
  )
}
