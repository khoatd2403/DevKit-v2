import { useState } from 'react'
import CopyButton from '../components/CopyButton'
import { Plus, Trash2 } from 'lucide-react'

type Role = 'system' | 'user' | 'assistant'

interface Message {
  id: number
  role: Role
  content: string
}

const ROLE_COLORS: Record<Role, string> = {
  system: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  user: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  assistant: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
}

let nextId = 3

export default function AiPromptBuilder() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'system', content: 'You are a helpful assistant.' },
    { id: 2, role: 'user', content: 'Hello! How can you help me?' },
  ])
  const [format, setFormat] = useState<'json' | 'text'>('json')

  const addMessage = (role: Role) => {
    setMessages(prev => [...prev, { id: nextId++, role, content: '' }])
  }

  const updateMessage = (id: number, field: keyof Message, value: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  const removeMessage = (id: number) => {
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  const output = format === 'json'
    ? JSON.stringify(messages.map(({ role, content }) => ({ role, content })), null, 2)
    : messages.map(m => `[${m.role.toUpperCase()}]\n${m.content}`).join('\n\n')

  return (
    <div className="space-y-4">
      {/* Messages */}
      <div className="space-y-3">
        {messages.map((msg, idx) => (
          <div key={msg.id} className={`border rounded-xl p-3 ${ROLE_COLORS[msg.role]}`}>
            <div className="flex items-center gap-2 mb-2">
              <select
                className="text-xs font-semibold bg-transparent border-0 outline-none cursor-pointer capitalize"
                value={msg.role}
                onChange={e => updateMessage(msg.id, 'role', e.target.value)}
              >
                <option value="system">system</option>
                <option value="user">user</option>
                <option value="assistant">assistant</option>
              </select>
              <span className="text-xs opacity-50">#{idx + 1}</span>
              <button
                onClick={() => removeMessage(msg.id)}
                className="ml-auto opacity-50 hover:opacity-100 transition-opacity"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <textarea
              className="w-full bg-transparent text-sm resize-none outline-none placeholder-current placeholder-opacity-40 min-h-[60px]"
              placeholder={`Enter ${msg.role} message...`}
              value={msg.content}
              onChange={e => updateMessage(msg.id, 'content', e.target.value)}
              rows={3}
            />
          </div>
        ))}
      </div>

      {/* Add message buttons */}
      <div className="flex gap-2 flex-wrap">
        {(['system', 'user', 'assistant'] as Role[]).map(role => (
          <button
            key={role}
            onClick={() => addMessage(role)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <Plus size={12} /> {role}
          </button>
        ))}
      </div>

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
            {(['json', 'text'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`px-3 py-1.5 font-medium transition-colors ${format === f ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                {f === 'json' ? 'OpenAI JSON' : 'Plain Text'}
              </button>
            ))}
          </div>
          <CopyButton text={output} toast="Prompt copied" />
        </div>
        <textarea
          className="tool-textarea h-48 font-mono text-xs"
          readOnly
          value={output}
        />
      </div>
    </div>
  )
}
