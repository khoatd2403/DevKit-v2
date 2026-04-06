import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useLang } from '../context/LanguageContext'

const STORAGE_KEY = 'devkit-onboarded'

export default function OnboardingTour() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  const STEPS = t.onboarding.steps

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === null) {
      const timer = setTimeout(() => {
        setOpen(true)
      }, 1500)
      return () => clearTimeout(timer)
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
  // Predefined emojis for steps
  const emojis = ['👋', '⌨️', '📁', '⭐']
  const currentEmoji = emojis[step] || '✨'
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
            {t.onboarding.step(step + 1, STEPS.length)}
          </span>
          <button
            onClick={finish}
            className="btn-ghost p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title={t.onboarding.skip}
            aria-label={t.onboarding.skip}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pt-6 pb-4 text-center">
          <div className="text-6xl mb-5 select-none" role="img" aria-label={current.title}>
            {currentEmoji}
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
              className={`w-2 h-2 rounded-full transition-all ${i === step
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
            {t.onboarding.prev}
          </button>

          <button
            onClick={finish}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {t.onboarding.skip}
          </button>

          <button
            onClick={handleNext}
            className="btn-primary text-sm px-5"
          >
            {isLast ? t.onboarding.done : t.onboarding.next}
          </button>
        </div>
      </div>
    </div>
  )
}
