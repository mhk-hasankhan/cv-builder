import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cvsApi, coverLettersApi } from '../utils/api.js'
import { Plus, FileText, Mail, Copy, Trash2, Edit3, Clock, Sparkles, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

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

  const createCV = async () => {
    const cv = await cvsApi.create({ title: 'Untitled CV' })
    navigate(`/cv/${cv.id}`)
  }

  const createCL = async () => {
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
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-indigo-400" />
          <span className="text-xs font-medium text-indigo-400 uppercase tracking-widest">CV Builder</span>
        </div>
        <h1 className="font-display text-4xl font-bold text-white mb-2">Your Documents</h1>
        <p className="text-zinc-400">Craft professional CVs and cover letters that stand out.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <button onClick={createCV}
          className="glass-hover rounded-2xl p-6 text-left group transition-all duration-200 hover:border-indigo-500/30">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
            <FileText size={22} className="text-indigo-400" />
          </div>
          <h3 className="font-display font-semibold text-white mb-1 flex items-center gap-2">
            New CV <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-sm text-zinc-500">Build a professional curriculum vitae with multiple templates</p>
        </button>

        <button onClick={createCL}
          className="glass-hover rounded-2xl p-6 text-left group transition-all duration-200 hover:border-emerald-500/30">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
            <Mail size={22} className="text-emerald-400" />
          </div>
          <h3 className="font-display font-semibold text-white mb-1 flex items-center gap-2">
            New Cover Letter <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-sm text-zinc-500">Write a compelling cover letter tailored to your application</p>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 glass rounded-xl w-fit">
        {[['cvs', `CVs (${cvs.length})`], ['cls', `Cover Letters (${cls.length})`]].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === key ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="glass rounded-xl h-32 animate-pulse" />)}
        </div>
      ) : activeTab === 'cvs' ? (
        <CVList cvs={cvs} onDelete={deleteCV} onDuplicate={duplicateCV} onEdit={id => navigate(`/cv/${id}`)} />
      ) : (
        <CLList cls={cls} onDelete={deleteCL} onEdit={id => navigate(`/cover-letter/${id}`)} />
      )}
    </div>
  )
}

function CVList({ cvs, onDelete, onDuplicate, onEdit }) {
  if (!cvs.length) return (
    <div className="glass rounded-2xl p-12 text-center">
      <FileText size={32} className="text-zinc-600 mx-auto mb-3" />
      <p className="text-zinc-400 font-medium">No CVs yet</p>
      <p className="text-zinc-600 text-sm mt-1">Create your first CV to get started</p>
    </div>
  )
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cvs.map(cv => (
        <div key={cv.id} onClick={() => onEdit(cv.id)}
          className="glass-hover rounded-xl p-5 cursor-pointer group animate-fade-in">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: `${cv.color_theme}20`, border: `1px solid ${cv.color_theme}40` }}>
              <FileText size={18} style={{ color: cv.color_theme }} />
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={e => onDuplicate(cv.id, e)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-zinc-200 transition-colors">
                <Copy size={14} />
              </button>
              <button onClick={e => onDelete(cv.id, e)}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <h3 className="font-medium text-white mb-1 truncate">{cv.title}</h3>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Clock size={11} />
            <span>{formatDistanceToNow(new Date(cv.updated_at.replace(' ', 'T') + 'Z'), { addSuffix: true })}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <span className="tag">{cv.template}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function CLList({ cls, onDelete, onEdit }) {
  if (!cls.length) return (
    <div className="glass rounded-2xl p-12 text-center">
      <Mail size={32} className="text-zinc-600 mx-auto mb-3" />
      <p className="text-zinc-400 font-medium">No cover letters yet</p>
    </div>
  )
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cls.map(cl => (
        <div key={cl.id} onClick={() => onEdit(cl.id)}
          className="glass-hover rounded-xl p-5 cursor-pointer group animate-fade-in">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Mail size={18} className="text-emerald-400" />
            </div>
            <button onClick={e => { e.stopPropagation(); onDelete(cl.id, e) }}
              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all">
              <Trash2 size={14} />
            </button>
          </div>
          <h3 className="font-medium text-white mb-1 truncate">{cl.title}</h3>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Clock size={11} />
            <span>{formatDistanceToNow(new Date(cl.updated_at.replace(' ', 'T') + 'Z'), { addSuffix: true })}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
