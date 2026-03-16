import { useCVStore } from '../../store/cvStore.js'
import { Input } from '../ui/Elements.jsx'
import RichTextEditor from '../ui/RichTextEditor.jsx'
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const newEntry = () => ({
  id: uuidv4(), company: '', jobTitle: '', location: '',
  startDate: '', endDate: '', current: false, description: ''
})

export default function ExperienceSection() {
  const { cv, updateSection } = useCVStore()
  const items = cv?.data?.experience || []
  const [expanded, setExpanded] = useState(items[0]?.id || null)

  const set = (v) => updateSection('experience', v)
  const add = () => { const e = newEntry(); set([...items, e]); setExpanded(e.id) }
  const remove = (id) => set(items.filter(i => i.id !== id))
  const update = (id, key, val) => set(items.map(i => i.id === id ? { ...i, [key]: val } : i))

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={item.id} className="glass rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
            <GripVertical size={14} className="text-zinc-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">
                {item.jobTitle || item.company || `Experience ${idx + 1}`}
              </p>
              {item.company && <p className="text-xs text-zinc-500 truncate">{item.company}</p>}
            </div>
            <button onClick={e => { e.stopPropagation(); remove(item.id) }}
              className="p-1 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors">
              <Trash2 size={13} />
            </button>
            {expanded === item.id ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
          </div>

          {expanded === item.id && (
            <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Job Title *" value={item.jobTitle} onChange={e => update(item.id, 'jobTitle', e.target.value)} placeholder="Software Engineer" />
                <Input label="Company *" value={item.company} onChange={e => update(item.id, 'company', e.target.value)} placeholder="Acme Corp" />
              </div>
              <Input label="Location" value={item.location} onChange={e => update(item.id, 'location', e.target.value)} placeholder="New York, NY" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Start Date" value={item.startDate} onChange={e => update(item.id, 'startDate', e.target.value)} placeholder="Jan 2022" />
                <div>
                  <Input label="End Date" value={item.endDate} onChange={e => update(item.id, 'endDate', e.target.value)}
                    placeholder="Present" disabled={item.current} />
                  <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer">
                    <input type="checkbox" checked={item.current} onChange={e => update(item.id, 'current', e.target.checked)}
                      className="rounded" />
                    <span className="text-xs text-zinc-400">Currently here</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <RichTextEditor value={item.description}
                  onChange={val => update(item.id, 'description', val)}
                  placeholder="Describe your responsibilities and achievements..." />
              </div>
            </div>
          )}
        </div>
      ))}

      <button onClick={add} className="w-full py-2.5 rounded-xl border border-dashed border-white/15 hover:border-indigo-500/40
        text-zinc-500 hover:text-indigo-400 text-sm flex items-center justify-center gap-2 transition-all duration-150">
        <Plus size={14} /> Add Experience
      </button>
    </div>
  )
}
