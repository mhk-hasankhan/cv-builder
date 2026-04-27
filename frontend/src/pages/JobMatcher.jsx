import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Upload, FileText, Briefcase, ChevronDown, ChevronUp,
  CheckCircle2, AlertTriangle, Lightbulb, Loader2, RotateCcw,
  AlertCircle, Trash2, Clock, ChevronRight, X
} from 'lucide-react'
import { jobMatchApi } from '../utils/api'
import * as pdfjs from 'pdfjs-dist'

pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

async function extractPdfText(file) {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buffer }).promise
  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    pages.push(content.items.map(item => item.str).join(' '))
  }
  return pages.join('\n')
}

function scoreColor(score) {
  return score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
}

function scoreLabel(score) {
  return score >= 70 ? 'Strong Match' : score >= 40 ? 'Moderate Match' : 'Weak Match'
}

function ScoreCircle({ score, size = 160 }) {
  const r = size === 160 ? 64 : 28
  const sw = size === 160 ? 12 : 6
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const color = scoreColor(score)
  const cx = size / 2
  const cy = size / 2

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center select-none">
          {size === 160 ? (
            <>
              <span className="text-4xl font-bold leading-none" style={{ color }}>{score}</span>
              <span className="text-sm text-zinc-400 mt-1">/ 100</span>
            </>
          ) : (
            <span className="text-sm font-bold leading-none" style={{ color }}>{score}</span>
          )}
        </div>
      </div>
      {size === 160 && (
        <span className="text-sm font-semibold" style={{ color }}>{scoreLabel(score)}</span>
      )}
    </div>
  )
}

function ResultCard({ icon: Icon, title, items, iconColor }) {
  return (
    <div className="bg-surface-2 border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={15} className={iconColor} />
        <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-zinc-400 leading-relaxed">
            <span className={`mt-0.5 shrink-0 ${iconColor}`}>•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ResultPanel({ match, onClose }) {
  return (
    <div className="animate-fade-in">
      {onClose && (
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors mb-5"
        >
          <X size={14} />
          Close
        </button>
      )}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="bg-surface-2 border border-white/5 rounded-2xl p-8 flex flex-col items-center shrink-0 w-full md:w-52">
          <ScoreCircle score={match.score} />
        </div>
        <div className="flex-1 grid gap-4">
          <ResultCard icon={CheckCircle2} title="Strengths" items={match.strengths} iconColor="text-green-400" />
          <ResultCard icon={AlertTriangle} title="Gaps" items={match.gaps} iconColor="text-amber-400" />
          <ResultCard icon={Lightbulb} title="Suggestions" items={match.suggestions} iconColor="text-violet-400" />
        </div>
      </div>
    </div>
  )
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function HistoryItem({ match, onView, onDelete, isViewing }) {
  const color = scoreColor(match.score)
  return (
    <div className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer
      ${isViewing ? 'bg-surface-3 border-white/10' : 'bg-surface-2 border-white/5 hover:border-white/10 hover:bg-surface-3'}`}
    >
      {/* Mini score */}
      <ScoreCircle score={match.score} size={72} />

      {/* Info */}
      <div className="flex-1 min-w-0" onClick={onView}>
        <p className="text-sm font-semibold text-zinc-200 truncate">{match.jobTitle}</p>
        {match.cvFilename && (
          <p className="text-xs text-zinc-500 truncate mt-0.5">{match.cvFilename}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-medium" style={{ color }}>{scoreLabel(match.score)}</span>
          <span className="text-zinc-700">·</span>
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <Clock size={10} />
            {timeAgo(match.createdAt)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onView}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all"
          title="View results"
        >
          <ChevronRight size={16} className={isViewing ? 'rotate-90 text-zinc-200' : ''} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(match.id) }}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export default function JobMatcher() {
  const [cvText, setCvText] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [fileName, setFileName] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)        // current analysis result
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [viewingMatch, setViewingMatch] = useState(null) // history item being viewed
  const inputRef = useRef(null)

  useEffect(() => {
    jobMatchApi.list()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setHistoryLoading(false))
  }, [])

  const handleFile = useCallback(async (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.')
      return
    }
    setFileName(file.name)
    setExtracting(true)
    setError(null)
    setResult(null)
    try {
      const text = await extractPdfText(file)
      if (!text.trim()) {
        setError('Could not extract text. This PDF may be image-based or scanned.')
        setFileName(null)
      } else {
        setCvText(text)
      }
    } catch {
      setError('Failed to read PDF. Please try another file.')
      setFileName(null)
    } finally {
      setExtracting(false)
    }
  }, [])

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  async function handleAnalyze() {
    if (!cvText || !jobDesc.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setViewingMatch(null)
    try {
      const data = await jobMatchApi.analyze(cvText, jobDesc, fileName)
      setResult(data)
      // Prepend to history
      setHistory(prev => [{
        id: data.id,
        jobTitle: data.jobTitle,
        cvFilename: fileName,
        score: data.score,
        strengths: data.strengths,
        gaps: data.gaps,
        suggestions: data.suggestions,
        jobDescription: jobDesc,
        createdAt: new Date().toISOString(),
      }, ...prev])
    } catch (err) {
      setError(err.error || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    try {
      await jobMatchApi.delete(id)
      setHistory(prev => prev.filter(m => m.id !== id))
      if (viewingMatch?.id === id) setViewingMatch(null)
    } catch {
      // silent — item stays in list
    }
  }

  function handleReset() {
    setCvText('')
    setJobDesc('')
    setFileName(null)
    setResult(null)
    setError(null)
    setShowPreview(false)
    setViewingMatch(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const canAnalyze = !!cvText && !!jobDesc.trim() && !extracting
  const activeResult = result || viewingMatch

  return (
    <div className="min-h-full p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
            <Briefcase size={18} className="text-violet-400" />
          </div>
          <h1 className="text-xl font-bold text-zinc-100">Job Match Analyzer</h1>
        </div>
        <p className="text-sm text-zinc-500 ml-12">
          Upload your CV and paste a job description to get an AI-powered match score and gap analysis.
        </p>
      </div>

      {/* Input section */}
      {!result && (
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* PDF Upload */}
          <div>
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">
              Your CV (PDF)
            </label>
            <div
              onClick={() => !extracting && inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              className={[
                'min-h-[200px] rounded-2xl border-2 border-dashed transition-all duration-200',
                'flex flex-col items-center justify-center gap-3 text-center p-6',
                dragOver
                  ? 'border-violet-500 bg-violet-500/10 cursor-copy'
                  : fileName
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-white/10 bg-surface-2 hover:border-white/20 hover:bg-surface-3 cursor-pointer',
              ].join(' ')}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={e => handleFile(e.target.files[0])}
              />
              {extracting ? (
                <>
                  <Loader2 size={28} className="text-violet-400 animate-spin" />
                  <p className="text-sm text-zinc-400">Extracting text…</p>
                </>
              ) : fileName ? (
                <>
                  <FileText size={28} className="text-green-400" />
                  <p className="text-sm text-zinc-200 font-medium break-all">{fileName}</p>
                  <p className="text-xs text-zinc-500">{cvText.length.toLocaleString()} characters extracted</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                    className="text-xs text-violet-400 hover:text-violet-300 underline"
                  >
                    Replace PDF
                  </button>
                </>
              ) : (
                <>
                  <Upload size={28} className="text-zinc-600" />
                  <div>
                    <p className="text-sm text-zinc-300">Drop PDF here or click to upload</p>
                    <p className="text-xs text-zinc-600 mt-1">Text is extracted in your browser — nothing is uploaded</p>
                  </div>
                </>
              )}
            </div>

            {cvText && (
              <button
                onClick={() => setShowPreview(v => !v)}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 mt-2 transition-colors"
              >
                {showPreview ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {showPreview ? 'Hide' : 'Preview'} extracted text
              </button>
            )}
            {showPreview && cvText && (
              <pre className="mt-2 p-3 bg-surface-3 rounded-xl text-xs text-zinc-400 max-h-40 overflow-auto whitespace-pre-wrap font-mono border border-white/5 leading-relaxed">
                {cvText.slice(0, 1000)}{cvText.length > 1000 ? '\n…' : ''}
              </pre>
            )}
          </div>

          {/* Job Description */}
          <div>
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">
              Job Description
            </label>
            <textarea
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              placeholder="Paste the full job description here…"
              className="w-full min-h-[200px] bg-surface-2 border border-white/5 rounded-2xl p-4 text-sm text-zinc-200 placeholder-zinc-600 resize-none outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
            <p className="text-xs text-zinc-600 mt-1 text-right">{jobDesc.length} chars</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4 text-sm text-red-400">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Actions */}
      {!result ? (
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze || loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Briefcase size={15} />}
          {loading ? 'Analyzing…' : 'Analyze Match'}
        </button>
      ) : (
        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors mb-6"
        >
          <RotateCcw size={14} />
          Analyze another
        </button>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="mt-6 animate-pulse space-y-4">
          <div className="h-3 bg-surface-3 rounded-full w-48" />
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-44 bg-surface-2 rounded-2xl" />)}
          </div>
        </div>
      )}

      {/* Current result */}
      {result && !viewingMatch && (
        <ResultPanel match={result} />
      )}

      {/* History item view */}
      {viewingMatch && (
        <ResultPanel match={viewingMatch} onClose={() => setViewingMatch(null)} />
      )}

      {/* History section */}
      {(history.length > 0 || historyLoading) && (
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={14} className="text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-400">Past Analyses</h2>
            {history.length > 0 && (
              <span className="text-xs text-zinc-600 bg-surface-3 px-2 py-0.5 rounded-full">
                {history.length}
              </span>
            )}
          </div>

          {historyLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-20 bg-surface-2 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {history.map(match => (
                <HistoryItem
                  key={match.id}
                  match={match}
                  isViewing={viewingMatch?.id === match.id}
                  onView={() => {
                    setResult(null)
                    setViewingMatch(prev => prev?.id === match.id ? null : match)
                  }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
