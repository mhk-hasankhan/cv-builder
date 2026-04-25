import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { shareApi, exportApi } from '../utils/api.js'
import { CVRenderer } from '../templates/index.jsx'
import { Download, Loader2, AlertCircle, Sparkles } from 'lucide-react'

export default function SharedCV() {
  const { token } = useParams()
  const [cv, setCv] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    shareApi.get(token)
      .then(setCv)
      .catch(() => setError('CV not found or link has expired.'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <Loader2 size={28} className="text-indigo-400 animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center glass rounded-2xl p-10">
        <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
        <p className="text-zinc-300 font-medium">{error}</p>
        <a href="/" className="btn-primary mt-4 inline-flex">Go to CV Builder</a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="border-b border-white/5 bg-surface-1 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-sm font-medium text-zinc-300">{cv?.title || 'Shared CV'}</span>
        </div>
        <a href={exportApi.pdf(cv?.id)} download className="btn-primary text-xs py-1.5">
          <Download size={13} /> Download PDF
        </a>
      </div>

      {/* CV */}
      <div className="flex justify-center py-10 px-4">
        <div className="w-[794px] shadow-2xl shadow-black/50 rounded overflow-hidden">
          <CVRenderer cv={cv} />
        </div>
      </div>

      <div className="text-center pb-10">
        <p className="text-xs text-zinc-600">
          Created with <a href="/" className="text-indigo-400 hover:underline">CV Builder</a>
        </p>
      </div>
    </div>
  )
}
