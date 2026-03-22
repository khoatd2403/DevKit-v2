import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  toolName?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ToolErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ToolErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center px-4">
          <p className="text-4xl mb-4">⚠️</p>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            {this.props.toolName ? `${this.props.toolName} failed to load` : 'Something went wrong'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn-secondary text-sm"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
