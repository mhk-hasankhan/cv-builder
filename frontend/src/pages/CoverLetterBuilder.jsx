import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCLStore } from '../store/clStore.js'
import { exportApi } from '../utils/api.js'
import { Input, Select, Modal } from '../components/ui/Elements.jsx'
import RichTextEditor from '../components/ui/RichTextEditor.jsx'
import { ArrowLeft, Download, Printer, Check, Loader2, Mail, FileText } from 'lucide-react'

export default function CoverLetterBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cl, loading, saving, error, load, updateField, updateMeta, reset } = useCLStore()
  const [exportModal, setExportModal] = useState(false)

  useEffect(() => {
    load(id)
    return () => reset()
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 size={28} className="text-indigo-400 animate-spin" />
    </div>
  )
  if (error) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-red-400 mb-3">{error}</p>
        <button onClick={() => navigate('/')} className="btn-secondary">Back</button>
      </div>
    </div>
  )
  if (!cl) return null

  const d = cl.data

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Left Panel */}
      <div className="w-[420px] shrink-0 flex flex-col border-r border-white/5 bg-surface-1">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
          <Link to="/" className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-200 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <input
            className="flex-1 bg-transparent text-sm font-medium text-white outline-none placeholder:text-zinc-500"
            value={cl.title}
            onChange={e => updateMeta({ title: e.target.value })}
            placeholder="Cover Letter Title"
          />
          <span className="text-xs text-emerald-500 flex items-center gap-1">
            {saving ? <Loader2 size={12} className="animate-spin text-zinc-500" /> : <><Check size={12} /> Saved</>}
          </span>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">

          {/* Sender */}
          <div className="glass rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Your Information</h3>
            <Input label="Your Name" value={d.senderName || ''} onChange={e => updateField('senderName', e.target.value)} placeholder="Jane Doe" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Email" value={d.senderEmail || ''} onChange={e => updateField('senderEmail', e.target.value)} placeholder="jane@email.com" />
              <Input label="Phone" value={d.senderPhone || ''} onChange={e => updateField('senderPhone', e.target.value)} placeholder="+1 234 567" />
            </div>
          </div>

          {/* Recipient */}
          <div className="glass rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Recipient</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Recipient Name" value={d.recipientName || ''} onChange={e => updateField('recipientName', e.target.value)} placeholder="Mr. Smith" />
              <Input label="Title" value={d.recipientTitle || ''} onChange={e => updateField('recipientTitle', e.target.value)} placeholder="Hiring Manager" />
            </div>
            <Input label="Company" value={d.companyName || ''} onChange={e => updateField('companyName', e.target.value)} placeholder="Acme Corporation" />
            <Input label="Company Address" value={d.companyAddress || ''} onChange={e => updateField('companyAddress', e.target.value)} placeholder="123 Business St, New York" />
          </div>

          {/* Letter */}
          <div className="glass rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Letter Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Date" type="date" value={d.date || ''} onChange={e => updateField('date', e.target.value)} />
              <Input label="Subject / Position" value={d.subject || ''} onChange={e => updateField('subject', e.target.value)} placeholder="Senior Developer" />
            </div>
            <Input label="Salutation" value={d.salutation || ''} onChange={e => updateField('salutation', e.target.value)} placeholder="Dear Hiring Manager," />
            <div>
              <label className="label">Body</label>
              <RichTextEditor
                value={d.body || ''}
                onChange={val => updateField('body', val)}
                placeholder="I am writing to express my interest in the position of..."
              />
            </div>
            <Input label="Closing" value={d.closing || ''} onChange={e => updateField('closing', e.target.value)} placeholder="Sincerely," />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 flex gap-2">
          <button onClick={() => setExportModal(true)} className="btn-primary flex-1 justify-center">
            <Download size={14} /> Export
          </button>
          <button onClick={handlePrint} className="btn-secondary px-3">
            <Printer size={14} />
          </button>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-surface-1">
          <span className="text-xs text-zinc-500">Live Preview</span>
          <Mail size={14} className="text-zinc-500" />
        </div>
        <div className="flex-1 overflow-auto p-8 flex justify-center">
          <div className="w-[680px] bg-white shadow-2xl shadow-black/40 rounded p-14 no-print"
            style={{ fontFamily: "'Source Serif 4', serif", fontSize: '12px', lineHeight: '1.8', color: '#222', minHeight: 900 }}>
            {/* Sender block */}
            <div className="text-right mb-8 text-gray-600 text-[11px]">
              {d.senderName && <div className="font-semibold text-gray-800">{d.senderName}</div>}
              {d.senderEmail && <div>{d.senderEmail}</div>}
              {d.senderPhone && <div>{d.senderPhone}</div>}
            </div>

            {d.date && <div className="mb-6 text-[11px] text-gray-600">{new Date(d.date).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</div>}

            {/* Recipient */}
            <div className="mb-6 text-[11px]">
              {d.recipientName && <div className="font-semibold">{d.recipientName}</div>}
              {d.recipientTitle && <div className="text-gray-600">{d.recipientTitle}</div>}
              {d.companyName && <div className="font-medium">{d.companyName}</div>}
              {d.companyAddress && <div className="text-gray-600">{d.companyAddress}</div>}
            </div>

            {d.subject && (
              <div className="mb-6 font-semibold text-[12px]">Re: {d.subject}</div>
            )}

            {d.salutation && <div className="mb-4">{d.salutation}</div>}

            {d.body ? (
              <div className="mb-6 text-[11px] leading-relaxed text-gray-700"
                dangerouslySetInnerHTML={{ __html: d.body }} />
            ) : (
              <div className="mb-6 text-gray-300 italic text-[11px]">Your letter content will appear here...</div>
            )}

            {d.closing && <div className="mb-8">{d.closing}</div>}

            <div className="mt-6">
              {d.senderName && <div className="font-semibold">{d.senderName}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <Modal open={exportModal} onClose={() => setExportModal(false)} title="Export Cover Letter">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <a href={exportApi.clPdf(id)} download className="btn-primary justify-center py-3">
              <Download size={14} /> PDF
            </a>
            <a href={exportApi.clDocx(id)} download className="btn-secondary justify-center py-3">
              <Download size={14} /> Word (.docx)
            </a>
          </div>
        </div>
      </Modal>
    </div>
  )
}
