import { useCVStore } from '../../store/cvStore.js'
import { Input } from '../ui/Elements.jsx'
import RichTextEditor from '../ui/RichTextEditor.jsx'
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const newEntry = () => ({
  id: uuidv4(), institution: '', degree: '', fieldOfStudy: '',
  startDate: '', endDate: '', description: ''
})

export default function EducationSection() {
  const { cv, updateSection } = useCVStore()
  const items = cv?.data?.education || []
  const [expanded, setExpanded] = useState(items[0]?.id || null)

  const set = (v) => updateSection('education', v)
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
                {item.degree || item.institution || `Education ${idx + 1}`}
              </p>
              {item.institution && <p className="text-xs text-zinc-500 truncate">{item.institution}</p>}
            </div>
            <button onClick={e => { e.stopPropagation(); remove(item.id) }}
              className="p-1 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors">
              <Trash2 size={13} />
            </button>
            {expanded === item.id ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
          </div>

          {expanded === item.id && (
            <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3 animate-fade-in">
              <Input label="Institution *" value={item.institution} onChange={e => update(item.id, 'institution', e.target.value)} placeholder="MIT" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Degree" value={item.degree} onChange={e => update(item.id, 'degree', e.target.value)} placeholder="Bachelor's" />
                <Input label="Field of Study" value={item.fieldOfStudy} onChange={e => update(item.id, 'fieldOfStudy', e.target.value)} placeholder="Computer Science" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Start Date" value={item.startDate} onChange={e => update(item.id, 'startDate', e.target.value)} placeholder="Sep 2018" />
                <Input label="End Date" value={item.endDate} onChange={e => update(item.id, 'endDate', e.target.value)} placeholder="Jun 2022" />
              </div>
              <div>
                <label className="label">Notes / Description</label>
                <RichTextEditor value={item.description} onChange={val => update(item.id, 'description', val)} placeholder="GPA, honors, relevant coursework..." />
              </div>
            </div>
          )}
        </div>
      ))}
      <button onClick={add} className="w-full py-2.5 rounded-xl border border-dashed border-white/15 hover:border-indigo-500/40
        text-zinc-500 hover:text-indigo-400 text-sm flex items-center justify-center gap-2 transition-all duration-150">
        <Plus size={14} /> Add Education
      </button>
    </div>
  )
}
