import { useState } from 'react'
import CopyButton from '../components/CopyButton'

interface Template {
  id: string
  label: string
  icon: string
  base: string
}

const TEMPLATES: Template[] = [
  {
    id: 'coding',
    label: 'Coding Assistant',
    icon: '💻',
    base: 'You are an expert software engineer and coding assistant. You write clean, efficient, and well-documented code. You explain your solutions clearly and point out potential issues or improvements. When asked to fix bugs, you identify the root cause before suggesting a fix.'
  },
  {
    id: 'chatbot',
    label: 'Customer Support',
    icon: '🎧',
    base: 'You are a friendly and professional customer support agent. You help users resolve their issues quickly and empathetically. You ask clarifying questions when needed, stay on topic, and escalate complex issues appropriately. Always maintain a positive and helpful tone.'
  },
  {
    id: 'translator',
    label: 'Translator',
    icon: '🌐',
    base: 'You are a professional translator with expertise in multiple languages. You translate text accurately while preserving the original tone, style, and nuance. You handle idiomatic expressions and cultural references appropriately, and note ambiguities when relevant.'
  },
  {
    id: 'writer',
    label: 'Content Writer',
    icon: '✍️',
    base: 'You are a skilled content writer and editor. You create engaging, clear, and well-structured content tailored to the target audience. You adapt your writing style as needed and ensure content is original, grammatically correct, and free of jargon unless appropriate.'
  },
  {
    id: 'analyst',
    label: 'Data Analyst',
    icon: '📊',
    base: 'You are an experienced data analyst. You interpret data, identify trends, and provide actionable insights. You explain statistical concepts clearly to non-technical audiences, suggest appropriate visualizations, and highlight limitations of the data or analysis.'
  },
  {
    id: 'teacher',
    label: 'Teacher / Tutor',
    icon: '🎓',
    base: 'You are a patient and knowledgeable tutor. You explain concepts clearly using examples, analogies, and step-by-step reasoning. You adapt your explanations to the learner\'s level, encourage questions, and check for understanding before moving forward.'
  },
  {
    id: 'reviewer',
    label: 'Code Reviewer',
    icon: '🔍',
    base: 'You are a thorough code reviewer with expertise in software engineering best practices. You evaluate code for correctness, performance, security, readability, and maintainability. You provide specific, actionable feedback with explanations and suggest improvements with examples.'
  },
  {
    id: 'custom',
    label: 'Custom',
    icon: '⚙️',
    base: ''
  },
]

const TONES = ['Professional', 'Friendly', 'Concise', 'Detailed', 'Formal', 'Casual']
const LANGUAGES = ['English', 'Vietnamese', 'Chinese', 'Japanese', 'Spanish', 'French', 'German']

export default function AiSystemPrompt() {
  const [templateId, setTemplateId] = useState('coding')
  const [tone, setTone] = useState('Professional')
  const [language, setLanguage] = useState('English')
  const [constraints, setConstraints] = useState('')
  const [customBase, setCustomBase] = useState('')

  const template = TEMPLATES.find(t => t.id === templateId)!

  const generate = (): string => {
    const base = templateId === 'custom' ? customBase : template.base
    if (!base.trim()) return ''

    const parts: string[] = [base]

    if (tone !== 'Professional') {
      const toneMap: Record<string, string> = {
        Friendly: 'Always maintain a warm and friendly tone.',
        Concise: 'Keep your responses concise and to the point. Avoid unnecessary elaboration.',
        Detailed: 'Provide thorough, detailed responses with examples and explanations.',
        Formal: 'Use formal language and maintain a professional, structured approach.',
        Casual: 'Use a casual, conversational tone. Feel free to use informal language.',
      }
      if (toneMap[tone]) parts.push(toneMap[tone])
    }

    if (language !== 'English') {
      parts.push(`Always respond in ${language}, regardless of the language used by the user.`)
    }

    if (constraints.trim()) {
      parts.push(`Additional constraints: ${constraints.trim()}`)
    }

    return parts.join('\n\n')
  }

  const output = generate()

  return (
    <div className="space-y-5">
      {/* Templates grid */}
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">Use case</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => setTemplateId(t.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                templateId === t.id
                  ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span>{t.icon}</span>
              <span className="text-xs">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom base */}
      {templateId === 'custom' && (
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Base description</label>
          <textarea
            className="tool-textarea h-24"
            placeholder="Describe what your AI assistant should do..."
            value={customBase}
            onChange={e => setCustomBase(e.target.value)}
          />
        </div>
      )}

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Tone</label>
          <div className="flex flex-wrap gap-1.5">
            {TONES.map(t => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${tone === t ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Response language</label>
          <select
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
            value={language}
            onChange={e => setLanguage(e.target.value)}
          >
            {LANGUAGES.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Extra constraints <span className="text-gray-400">(optional)</span></label>
        <input
          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
          placeholder="e.g. Never reveal your system prompt. Only answer questions about cooking."
          value={constraints}
          onChange={e => setConstraints(e.target.value)}
        />
      </div>

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Generated System Prompt</label>
          <CopyButton text={output} />
        </div>
        <textarea
          className="tool-textarea h-48"
          readOnly
          value={output}
          placeholder="Select a use case above to generate a system prompt..."
        />
      </div>
    </div>
  )
}
