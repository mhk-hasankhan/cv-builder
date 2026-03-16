import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCVStore } from '../store/cvStore.js'
import { exportApi, shareApi } from '../utils/api.js'
import { TEMPLATES } from '../templates/index.jsx'
import { CVRenderer } from '../templates/index.jsx'
import PersonalSection from '../components/builder/PersonalSection.jsx'
import ExperienceSection from '../components/builder/ExperienceSection.jsx'
import EducationSection from '../components/builder/EducationSection.jsx'
import SkillsSection from '../components/builder/SkillsSection.jsx'
import ProjectsSection from '../components/builder/ProjectsSection.jsx'
import { CertificationsSection, LanguagesSection, InterestsSection, CustomSectionEditor } from '../components/builder/OtherSections.jsx'
import SectionManager from '../components/builder/SectionManager.jsx'
import { ColorPicker, Select, Modal } from '../components/ui/Elements.jsx'
import {
  ArrowLeft, Download, Share2, Printer, Eye, Settings,
  ChevronDown, ChevronUp, Save, Check, Loader2, FileText,
  Columns, Palette, Type, LayoutTemplate, ZoomIn, ZoomOut, Link2
} from 'lucide-react'

const FONT_OPTIONS = [
  { value: 'inter', label: 'DM Sans (Modern)' },
  { value: 'serif', label: 'Source Serif (Elegant)' },
  { value: 'lora', label: 'Lora (Literary)' },
]

const SECTION_COMPONENTS = {
  personal: { label: 'Personal Info', component: PersonalSection },
  experience: { label: 'Work Experience', component: ExperienceSection },
  education: { label: 'Education', component: EducationSection },
  skills: { label: 'Skills', component: SkillsSection },
  projects: { label: 'Projects', component: ProjectsSection },
  certifications: { label: 'Certifications', component: CertificationsSection },
  languages: { label: 'Languages', component: LanguagesSection },
  interests: { label: 'Interests', component: InterestsSection },
}

export default function CVBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cv, loading, saving, error, load, updateMeta, updateSection, reset } = useCVStore()
  const [activeSection, setActiveSection] = useState('personal')
  const [activeTab, setActiveTab] = useState('content') // content | design | sections
  const [zoom, setZoom] = useState(0.62)
  const [shareModal, setShareModal] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [exportModal, setExportModal] = useState(false)
  const previewRef = useRef()

  useEffect(() => {
    load(id)
    return () => reset()
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

  const handleShare = async () => {
    const res = await shareApi.generate(id)
    setShareUrl(res.url)
    setShareModal(true)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    const printWin = window.open('', '_blank')
    const previewHtml = previewRef.current?.innerHTML || ''
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${cv.title}</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Outfit:wght@400;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          @page { margin: 0; size: A4; }
        </style>
      </head>
      <body>${previewHtml}</body>
      </html>
    `)
    printWin.document.close()
    printWin.focus()
    setTimeout(() => { printWin.print(); printWin.close() }, 500)
  }

  const customSections = cv.data?.customSections || []
  const allSections = [
    ...Object.entries(SECTION_COMPONENTS),
    ...customSections.map(cs => [cs.id, { label: cs.title, isCustom: true, data: cs }])
  ]

  const orderedSections = cv.section_order
    ?.map(id => allSections.find(([sid]) => sid === id))
    .filter(Boolean) || allSections

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* ── LEFT PANEL: Editor ── */}
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
          {[
            ['content', <FileText size={13} />, 'Content'],
            ['design', <Palette size={13} />, 'Design'],
            ['sections', <Columns size={13} />, 'Sections'],
          ].map(([key, icon, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px
                ${activeTab === key ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">

          {activeTab === 'content' && (
            <div className="space-y-2">
              {orderedSections.map(([sectionId, sectionDef]) => {
                if (!sectionDef) return null
                const isEnabled = cv.enabled_sections?.includes(sectionId)
                if (!isEnabled) return null

                const isExpanded = activeSection === sectionId
                const label = sectionDef.label || sectionDef.title || sectionId

                return (
                  <div key={sectionId} className="glass rounded-xl overflow-hidden">
                    <button
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                      onClick={() => setActiveSection(isExpanded ? null : sectionId)}>
                      <span className="flex-1 text-sm font-medium text-zinc-200">{label}</span>
                      {isExpanded ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-white/5 pt-4 animate-fade-in">
                        {sectionDef.isCustom ? (
                          <CustomSectionEditor
                            section={sectionDef.data}
                            onChange={(updated) => {
                              const customs = (cv.data.customSections || []).map(cs => cs.id === updated.id ? updated : cs)
                              updateSection('customSections', customs)
                            }}
                            onDelete={() => {
                              const customs = (cv.data.customSections || []).filter(cs => cs.id !== sectionId)
                              updateSection('customSections', customs)
                            }}
                          />
                        ) : (
                          (() => { const Comp = sectionDef.component; return <Comp /> })()
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'design' && (
            <div className="space-y-5">
              {/* Template picker */}
              <div>
                <label className="label flex items-center gap-1.5"><LayoutTemplate size={12} /> Template</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(TEMPLATES).map(t => (
                    <button key={t.id} onClick={() => updateMeta({ template: t.id })}
                      className={`p-2 rounded-lg border text-center transition-all ${cv.template === t.id
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                        : 'border-white/10 hover:border-white/20 text-zinc-400 hover:text-zinc-200'}`}>
                      <div className="text-xs font-medium">{t.name}</div>
                      {t.ats && <div className="text-[9px] text-emerald-400 mt-0.5">ATS-friendly</div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <ColorPicker label="Accent Color" value={cv.color_theme} onChange={c => updateMeta({ color_theme: c })} />

              {/* Font */}
              <Select label="Font Family" value={cv.font_family} options={FONT_OPTIONS}
                onChange={e => updateMeta({ font_family: e.target.value })} />
            </div>
          )}

          {activeTab === 'sections' && <SectionManager />}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/5 flex gap-2">
          <button onClick={() => setExportModal(true)} className="btn-primary flex-1 justify-center">
            <Download size={14} /> Export
          </button>
          <button onClick={handleShare} className="btn-secondary px-3">
            <Share2 size={14} />
          </button>
          <button onClick={handlePrint} className="btn-secondary px-3">
            <Printer size={14} />
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL: Preview ── */}
      <div className="flex-1 flex flex-col bg-surface overflow-hidden">
        {/* Preview toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-surface-1">
          <span className="text-xs text-zinc-500">Live Preview — A4</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.max(0.3, z - 0.08))} className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-zinc-200 transition-colors">
              <ZoomOut size={14} />
            </button>
            <span className="text-xs text-zinc-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(1.2, z + 0.08))} className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-zinc-200 transition-colors">
              <ZoomIn size={14} />
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-auto p-6 flex justify-center">
          <div
            style={{ width: `${794 * zoom}px`, height: `${1123 * zoom}px`, flexShrink: 0 }}
            className="shadow-2xl shadow-black/50 rounded overflow-hidden"
          >
            <div ref={previewRef} style={{ width: 794, height: 1123, transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
              <CVRenderer cv={cv} />
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <Modal open={exportModal} onClose={() => setExportModal(false)} title="Export CV">
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">Choose your export format:</p>
          <div className="grid grid-cols-2 gap-3">
            <a href={exportApi.pdf(id)} download className="btn-primary justify-center py-3">
              <Download size={14} /> PDF
            </a>
            <a href={exportApi.docx(id)} download className="btn-secondary justify-center py-3">
              <Download size={14} /> Word (.docx)
            </a>
          </div>
          <div className="glass rounded-lg p-3 mt-2">
            <p className="text-xs text-zinc-400">
              <span className="text-emerald-400 font-medium">ATS Tip:</span> Use the PDF format for online applications.
              Use DOCX if the employer requests a Word document.
            </p>
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal open={shareModal} onClose={() => setShareModal(false)} title="Share CV">
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">Share a read-only link to your CV:</p>
          <div className="flex gap-2">
            <input className="input-field flex-1 text-xs" value={shareUrl} readOnly />
            <button onClick={handleCopy} className={`btn-secondary px-3 ${copied ? 'text-emerald-400' : ''}`}>
              {copied ? <Check size={14} /> : <Link2 size={14} />}
            </button>
          </div>
          <p className="text-xs text-zinc-500">Anyone with this link can view your CV.</p>
        </div>
      </Modal>
    </div>
  )
}
