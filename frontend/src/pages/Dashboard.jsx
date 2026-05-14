import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cvsApi, coverLettersApi } from '../utils/api.js'
import { FileText, Mail, Copy, Trash2, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import './GetStarted.css'

const LIMIT = 3

export default function Dashboard() {
  const [cvs, setCvs] = useState([])
  const [cls, setCls] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('cvs')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([cvsApi.list(), coverLettersApi.list()])
      .then(([c, cl]) => { setCvs(c); setCls(cl) })
      .finally(() => setLoading(false))
  }, [])

  const atCvLimit = cvs.length >= LIMIT
  const atClLimit = cls.length >= LIMIT

  const createCV = async () => {
    if (atCvLimit) return
    const cv = await cvsApi.create({ title: 'Untitled CV' })
    navigate(`/cv/${cv.id}`)
  }

  const createCL = async () => {
    if (atClLimit) return
    const cl = await coverLettersApi.create({ title: 'Untitled Cover Letter' })
    navigate(`/cover-letter/${cl.id}`)
  }

  const deleteCV = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this CV?')) return
    await cvsApi.delete(id)
    setCvs(cvs.filter(c => c.id !== id))
  }

  const duplicateCV = async (id, e) => {
    e.stopPropagation()
    if (atCvLimit) return
    const newCV = await cvsApi.duplicate(id)
    setCvs([newCV, ...cvs])
  }

  const deleteCL = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this cover letter?')) return
    await coverLettersApi.delete(id)
    setCls(cls.filter(c => c.id !== id))
  }

  return (
    <div className="gs-dash">
      <div className="gs-dash-shell">
        {/* Hero */}
        <section className="gs-dash-hero">
          <div className="gs-eyebrow">
            <span className="gs-dot" />
            <span>Your library</span>
          </div>
          <h1 className="gs-dash-title">
            <span className="gs-line">Your documents,</span>
            <span className="gs-line">always <span className="gs-serif">in progress.</span></span>
          </h1>
          <p className="gs-dash-sub">
            Craft polished CVs and cover letters that stand out — every draft saved, every version yours.
          </p>
        </section>

        {/* Quick actions */}
        <div className="gs-action-grid">
          <button
            type="button"
            onClick={createCV}
            disabled={atCvLimit}
            className="gs-action-card"
            aria-label="Create a new CV"
          >
            <span className="gs-num"><FileText size={20} /></span>
            <span className="gs-label">
              <span className="gs-t">
                New CV
                {atCvLimit && <span className="gs-limit">{LIMIT}/{LIMIT} used</span>}
              </span>
              <span className="gs-s">
                {atCvLimit ? 'Delete an existing CV to create a new one.' : 'Build a professional CV with multiple templates'}
              </span>
            </span>
            <span className="gs-time">~8 min</span>
          </button>

          <button
            type="button"
            onClick={createCL}
            disabled={atClLimit}
            className="gs-action-card"
            aria-label="Create a new cover letter"
          >
            <span className="gs-num"><Mail size={20} /></span>
            <span className="gs-label">
              <span className="gs-t">
                New cover letter
                {atClLimit && <span className="gs-limit">{LIMIT}/{LIMIT} used</span>}
              </span>
              <span className="gs-s">
                {atClLimit ? 'Delete an existing cover letter to create a new one.' : 'Pair a tailored letter to your application'}
              </span>
            </span>
            <span className="gs-time">~4 min</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="gs-tabs" role="tablist">
          {[['cvs', `CVs (${cvs.length})`], ['cls', `Cover letters (${cls.length})`]].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setActiveTab(key)}
              className={`gs-tab${activeTab === key ? ' gs-active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="gs-doc-grid">
            {[1, 2, 3].map(i => <div key={i} className="gs-skeleton" />)}
          </div>
        ) : activeTab === 'cvs' ? (
          <CVList cvs={cvs} atLimit={atCvLimit} onDelete={deleteCV} onDuplicate={duplicateCV} onEdit={id => navigate(`/cv/${id}`)} />
        ) : (
          <CLList cls={cls} onDelete={deleteCL} onEdit={id => navigate(`/cover-letter/${id}`)} />
        )}
      </div>
    </div>
  )
}

function CVList({ cvs, atLimit, onDelete, onDuplicate, onEdit }) {
  if (!cvs.length) return (
    <div className="gs-empty">
      <div className="gs-empty-icon"><FileText size={20} /></div>
      <p className="gs-empty-title">No CVs yet</p>
      <p className="gs-empty-sub">Create your first CV to get started.</p>
    </div>
  )
  return (
    <div className="gs-doc-grid">
      {cvs.map(cv => (
        <div key={cv.id} onClick={() => onEdit(cv.id)} className="gs-doc-card" role="button" tabIndex={0}>
          <div
            className="gs-doc-icon"
            style={{
              background: `${cv.color_theme}1f`,
              border: `1px solid ${cv.color_theme}55`,
            }}
          >
            <FileText size={18} style={{ color: cv.color_theme }} />
          </div>

          <h3 className="gs-doc-title">{cv.title}</h3>
          <div className="gs-doc-meta">
            <Clock size={11} />
            <span>{formatDistanceToNow(new Date(cv.updated_at.replace(' ', 'T') + 'Z'), { addSuffix: true })}</span>
          </div>
          <div className="gs-doc-tags">
            <span className="gs-doc-tag">{cv.template}</span>
          </div>

          <div className="gs-doc-actions">
            {!atLimit && (
              <button
                type="button"
                onClick={e => onDuplicate(cv.id, e)}
                className="gs-icon-btn"
                aria-label="Duplicate CV"
              >
                <Copy size={13} />
              </button>
            )}
            <button
              type="button"
              onClick={e => onDelete(cv.id, e)}
              className="gs-icon-btn gs-danger"
              aria-label="Delete CV"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function CLList({ cls, onDelete, onEdit }) {
  if (!cls.length) return (
    <div className="gs-empty">
      <div className="gs-empty-icon"><Mail size={20} /></div>
      <p className="gs-empty-title">No cover letters yet</p>
      <p className="gs-empty-sub">Pair a tailored letter to your next application.</p>
    </div>
  )
  return (
    <div className="gs-doc-grid">
      {cls.map(cl => (
        <div key={cl.id} onClick={() => onEdit(cl.id)} className="gs-doc-card" role="button" tabIndex={0}>
          <div
            className="gs-doc-icon"
            style={{
              background: 'rgba(217,170,120,0.12)',
              border: '1px solid rgba(217,170,120,0.30)',
            }}
          >
            <Mail size={18} style={{ color: 'oklch(0.78 0.09 70)' }} />
          </div>

          <h3 className="gs-doc-title">{cl.title}</h3>
          <div className="gs-doc-meta">
            <Clock size={11} />
            <span>{formatDistanceToNow(new Date(cl.updated_at.replace(' ', 'T') + 'Z'), { addSuffix: true })}</span>
          </div>

          <div className="gs-doc-actions">
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onDelete(cl.id, e) }}
              className="gs-icon-btn gs-danger"
              aria-label="Delete cover letter"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
