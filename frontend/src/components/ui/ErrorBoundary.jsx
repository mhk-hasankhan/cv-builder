import { Component } from 'react'
import { AlertCircle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 p-10 text-center bg-white min-h-[300px]">
          <AlertCircle size={28} className="text-red-400" />
          <p className="text-sm font-medium text-zinc-700">This CV could not be rendered</p>
          <p className="text-xs text-zinc-400 max-w-xs">{this.state.error?.message || 'Unexpected error in template'}</p>
        </div>
      )
    }
    return this.props.children
  }
}
