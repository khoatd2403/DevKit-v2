import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useToast } from '../context/ToastContext'

const icons = {
  success: <CheckCircle size={15} className="text-green-500 shrink-0" />,
  error: <AlertCircle size={15} className="text-red-500 shrink-0" />,
  info: <Info size={15} className="text-blue-500 shrink-0" />,
}

const bg = {
  success: 'bg-white dark:bg-gray-900 border-green-200 dark:border-green-800',
  error: 'bg-white dark:bg-gray-900 border-red-200 dark:border-red-800',
  info: 'bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800',
}

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg max-w-xs text-sm text-gray-800 dark:text-gray-200 animate-slide-up ${bg[toast.type]}`}
        >
          {icons[toast.type]}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-1"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}
