import { Shield, Wifi } from 'lucide-react'

interface PrivacyBadgeProps {
  privacy?: 'local' | 'network'
  networkNote?: string
  /** 'badge' = inline pill only, 'banner' = full warning banner for network tools */
  variant?: 'badge' | 'banner'
}

export default function PrivacyBadge({ privacy = 'local', networkNote, variant = 'badge' }: PrivacyBadgeProps) {
  if (privacy === 'local') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-500">
        <Shield size={11} className="shrink-0" />
        <span className="hidden sm:inline">No data sent to server</span>
      </span>
    )
  }

  // network
  if (variant === 'banner') {
    return (
      <div className="tool-msg tool-msg--warning flex items-start gap-2 mb-4">
        <Wifi size={14} className="shrink-0 mt-0.5" />
        <span>
          <strong>Network request:</strong>{' '}
          {networkNote ?? 'This tool sends data to an external service to function.'}
        </span>
      </div>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-500">
      <Wifi size={11} className="shrink-0" />
      <span className="hidden sm:inline">Uses network</span>
    </span>
  )
}
