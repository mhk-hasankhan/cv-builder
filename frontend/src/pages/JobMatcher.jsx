import { useState, useRef, useCallback } from 'react'
import {
  Upload, FileText, Briefcase, ChevronDown, ChevronUp,
  CheckCircle2, AlertTriangle, Lightbulb, Loader2, RotateCcw, AlertCircle
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

function ScoreCircle({ score }) {
  const r = 64
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
  const label = score >= 70 ? 'Strong Match' : score >= 40 ? 'Moderate Match' : 'Weak Match'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative inline-flex items-center justify-center w-40 h-40">
        <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
          <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
          <circle
            cx="80" cy="80" r={r}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center select-none">
          <span className="text-4xl font-bold leading-none" style={{ color }}>{score}</span>
          <span className="text-sm text-zinc-400 mt-1">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
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

export default function JobMatcher() {
  const [cvText, setCvText] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [fileName, setFileName] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

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
    try {
      const data = await jobMatchApi.analyze(cvText, jobDesc)
      setResult(data)
    } catch (err) {
      setError(err.error || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setCvText('')
    setJobDesc('')
    setFileName(null)
    setResult(null)
    setError(null)
    setShowPreview(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const canAnalyze = !!cvText && !!jobDesc.trim() && !extracting

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

      {/* Input section — hidden once result is shown */}
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
                  <p className="text-sm text-zinc-400">Extracting text...</p>
                </>
              ) : fileName ? (
                <>
                  <FileText size={28} className="text-green-400" />
                  <p className="text-sm text-zinc-200 font-medium break-all">{fileName}</p>
                  <p className="text-xs text-zinc-500">
                    {cvText.length.toLocaleString()} characters extracted
                  </p>
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
                    <p className="text-xs text-zinc-600 mt-1">
                      Text is extracted in your browser — nothing is uploaded
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Extracted text preview toggle */}
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

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4 text-sm text-red-400">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* CTA / Reset */}
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
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 bg-surface-2 rounded-2xl" />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="animate-fade-in">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Score panel */}
            <div className="bg-surface-2 border border-white/5 rounded-2xl p-8 flex flex-col items-center shrink-0 w-full md:w-52">
              <ScoreCircle score={result.score} />
            </div>

            {/* Result cards */}
            <div className="flex-1 grid gap-4">
              <ResultCard
                icon={CheckCircle2}
                title="Strengths"
                items={result.strengths}
                iconColor="text-green-400"
              />
              <ResultCard
                icon={AlertTriangle}
                title="Gaps"
                items={result.gaps}
                iconColor="text-amber-400"
              />
              <ResultCard
                icon={Lightbulb}
                title="Suggestions"
                items={result.suggestions}
                iconColor="text-violet-400"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
