import { useCVStore } from '../../store/cvStore.js'
import { Input } from '../ui/Elements.jsx'
import RichTextEditor from '../ui/RichTextEditor.jsx'
import { Plus, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const newEntry = () => ({ id: uuidv4(), name: '', description: '', technologies: [], github: '', liveUrl: '' })

export default function ProjectsSection() {
  const { cv, updateSection } = useCVStore()
  const items = cv?.data?.projects || []
  const [expanded, setExpanded] = useState(null)
  const [techInput, setTechInput] = useState({})

  const set = v => updateSection('projects', v)
  const add = () => { const e = newEntry(); set([...items, e]); setExpanded(e.id) }
  const remove = id => set(items.filter(i => i.id !== id))
  const update = (id, key, val) => set(items.map(i => i.id === id ? { ...i, [key]: val } : i))

  const addTech = (id) => {
    const val = (techInput[id] || '').trim()
    if (!val) return
    const item = items.find(i => i.id === id)
    update(id, 'technologies', [...(item.technologies || []), val])
    setTechInput(p => ({ ...p, [id]: '' }))
  }

  const removeTech = (id, idx) => {
    const item = items.find(i => i.id === id)
    update(id, 'technologies', item.technologies.filter((_, j) => j !== idx))
  }

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={item.id} className="glass rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">{item.name || `Project ${idx + 1}`}</p>
            </div>
            <button onClick={e => { e.stopPropagation(); remove(item.id) }}
              className="p-1 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors">
              <Trash2 size={13} />
            </button>
            {expanded === item.id ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
          </div>

          {expanded === item.id && (
            <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3 animate-fade-in">
              <Input label="Project Name *" value={item.name} onChange={e => update(item.id, 'name', e.target.value)} placeholder="My Awesome Project" />
              <div>
                <label className="label">Description</label>
                <RichTextEditor value={item.description} onChange={val => update(item.id, 'description', val)} placeholder="What did you build and why?" />
              </div>
              <div>
                <label className="label">Technologies</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(item.technologies || []).map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {t}<button onClick={() => removeTech(item.id, i)}><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input className="input-field flex-1 text-sm" placeholder="React, Node.js... press Enter"
                    value={techInput[item.id] || ''}
                    onChange={e => setTechInput(p => ({ ...p, [item.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addTech(item.id)} />
                  <button onClick={() => addTech(item.id)} className="px-3 py-2 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="GitHub URL" value={item.github} onChange={e => update(item.id, 'github', e.target.value)} placeholder="github.com/..." />
                <Input label="Live URL" value={item.liveUrl} onChange={e => update(item.id, 'liveUrl', e.target.value)} placeholder="https://..." />
              </div>
            </div>
          )}
        </div>
      ))}
      <button onClick={add} className="w-full py-2.5 rounded-xl border border-dashed border-white/15 hover:border-indigo-500/40
        text-zinc-500 hover:text-indigo-400 text-sm flex items-center justify-center gap-2 transition-all">
        <Plus size={14} /> Add Project
      </button>
    </div>
  )
}
