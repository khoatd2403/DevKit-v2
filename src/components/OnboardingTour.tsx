import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const STEPS = [
  {
    title: 'Welcome to DevTools Online! 🔧',
    description: '87+ free developer tools — JSON formatter, Base64, regex tester, hash generator and more. All running in your browser. No sign-up needed.',
    emoji: '👋',
  },
  {
    title: 'Search everything with Ctrl+K',
    description: 'Press Ctrl+K anytime to open the command palette and instantly find any tool by name or keyword.',
    emoji: '⌨️',
  },
  {
    title: 'Drag & drop files into any input',
    description: 'Every text input supports drag & drop file import. Just drop a .json, .csv, .txt or any text file directly onto the input area.',
    emoji: '📁',
  },
  {
    title: 'Save your favorites & snippets',
    description: 'Click ★ on any tool to bookmark it. Use the Snippets drawer to save text you use often. Your data is auto-saved across sessions.',
    emoji: '⭐',
  },
]

const STORAGE_KEY = 'devkit-onboarded'

export default function OnboardingTour() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === null) {
      setOpen(true)
    }
  }, [])

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setOpen(false)
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      finish()
    }
  }

  const handlePrev = () => {
    setStep(s => Math.max(0, s - 1))
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') finish()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, step])

  if (!open) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        {/* Skip button */}
        <div className="flex items-center justify-between px-5 pt-4 pb-0">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Step {step + 1} of {STEPS.length}
          </span>
          <button
            onClick={finish}
            className="btn-ghost p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Skip tour"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pt-6 pb-4 text-center">
          <div className="text-6xl mb-5 select-none" role="img" aria-label={current.title}>
            {current.emoji}
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-snug">
            {current.title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 py-4">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step
                  ? 'bg-primary-500 w-5'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3 px-6 pb-6">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className="btn-ghost text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Prev
          </button>

          <button
            onClick={finish}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Skip tour
          </button>

          <button
            onClick={handleNext}
            className="btn-primary text-sm px-5"
          >
            {isLast ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
