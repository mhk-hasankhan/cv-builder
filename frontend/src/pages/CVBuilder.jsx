import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCVStore } from '../store/cvStore.js'
import { ArrowLeft, Download, Share2, Printer, Check, Loader2, FileText, Palette, Columns } from 'lucide-react'
import { ContentTab } from '../components/builder/ContentTab.jsx'
import { DesignTab } from '../components/builder/DesignTab.jsx'
import { CVPreview } from '../components/builder/CVPreview.jsx'
import { ExportModal } from '../components/builder/ExportModal.jsx'
import { ShareModal } from '../components/builder/ShareModal.jsx'
import { ConflictModal } from '../components/builder/ConflictModal.jsx'
import SectionManager from '../components/builder/SectionManager.jsx'
import { printCVFromRef } from '../utils/printCV.js'

const TABS = [
  ['content',  <FileText size={13} />,  'Content'],
  ['design',   <Palette size={13} />,   'Design'],
  ['sections', <Columns size={13} />,   'Sections'],
]

export default function CVBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cv, loading, saving, error, conflict, load, updateMeta, updateSection, reset, resolveConflict } = useCVStore()
  const [activeTab, setActiveTab] = useState('content')
  const [shareModal, setShareModal] = useState(false)
  const [exportModal, setExportModal] = useState(false)
  const previewRef = useRef()

  useEffect(() => {
    load(id)
    return () => {
      const state = useCVStore.getState()
      if (state.saveTimeout) state.save()
      reset()
    }
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={28} className="text-indigo-400 animate-spin" />
        <p className="text-zinc-400 text-sm">Loading your CV...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-red-400 mb-3">{error}</p>
        <button onClick={() => navigate('/')} className="btn-secondary">Back to Dashboard</button>
      </div>
    </div>
  )

  if (!cv) return null

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* LEFT PANEL: Editor */}
      <div className="w-[420px] shrink-0 flex flex-col border-r border-white/5 bg-surface-1">

        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
          <Link to="/" className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-200 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <input
            className="flex-1 bg-transparent text-sm font-medium text-white outline-none placeholder:text-zinc-500 min-w-0"
            value={cv.title}
            onChange={e => updateMeta({ title: e.target.value })}
            placeholder="CV Title"
          />
          <div className="flex items-center gap-1">
            {saving ? (
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <Loader2 size={12} className="animate-spin" /> Saving
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-emerald-500">
                <Check size={12} /> Saved
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-4">
          {TABS.map(([key, icon, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px
                ${activeTab === key ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === 'content'  && <ContentTab cv={cv} updateSection={updateSection} />}
          {activeTab === 'design'   && <DesignTab cv={cv} updateMeta={updateMeta} />}
          {activeTab === 'sections' && <SectionManager />}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/5 flex gap-2">
          <button onClick={() => setExportModal(true)} className="btn-primary flex-1 justify-center">
            <Download size={14} /> Export
          </button>
          <button onClick={() => setShareModal(true)} className="btn-secondary px-3">
            <Share2 size={14} />
          </button>
          <button onClick={() => printCVFromRef(previewRef, cv.title)} className="btn-secondary px-3">
            <Printer size={14} />
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: Preview */}
      <CVPreview cv={cv} previewRef={previewRef} />

      <ExportModal id={id} open={exportModal} onClose={() => setExportModal(false)} />
      <ShareModal cvId={id} open={shareModal} onClose={() => setShareModal(false)} />
      <ConflictModal conflict={conflict} resolveConflict={resolveConflict} />
    </div>
  )
}
