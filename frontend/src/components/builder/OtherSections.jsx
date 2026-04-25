import { useCVStore } from '../../store/cvStore.js'
import { Input, Select } from '../ui/Elements.jsx'
import { Plus, Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

// ─── CERTIFICATIONS ───────────────────────────────────────────────────────────
export function CertificationsSection() {
  const { cv, updateSection } = useCVStore()
  const items = cv?.data?.certifications || []
  const set = v => updateSection('certifications', v)
  const add = () => set([...items, { id: uuidv4(), name: '', issuer: '', date: '' }])
  const remove = id => set(items.filter(i => i.id !== id))
  const update = (id, key, val) => set(items.map(i => i.id === id ? { ...i, [key]: val } : i))

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={item.id} className="glass rounded-xl p-3 space-y-2">
          <div className="flex gap-2">
            <Input placeholder="Certification / Achievement name" value={item.name}
              onChange={e => update(item.id, 'name', e.target.value)} />
            <button onClick={() => remove(item.id)} className="p-2 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors shrink-0">
              <Trash2 size={13} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Issuing organization" value={item.issuer}
              onChange={e => update(item.id, 'issuer', e.target.value)} />
            <Input placeholder="Date (e.g. Mar 2023)" value={item.date}
              onChange={e => update(item.id, 'date', e.target.value)} />
          </div>
        </div>
      ))}
      <button onClick={add} className="w-full py-2.5 rounded-xl border border-dashed border-white/15 hover:border-indigo-500/40
        text-zinc-500 hover:text-indigo-400 text-sm flex items-center justify-center gap-2 transition-all">
        <Plus size={14} /> Add Certification
      </button>
    </div>
  )
}

// ─── LANGUAGES ────────────────────────────────────────────────────────────────
const PROFICIENCY = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Beginner']

export function LanguagesSection() {
  const { cv, updateSection } = useCVStore()
  const items = cv?.data?.languages || []
  const set = v => updateSection('languages', v)
  const add = () => set([...items, { id: uuidv4(), language: '', proficiency: 'Intermediate' }])
  const remove = id => set(items.filter(i => i.id !== id))
  const update = (id, key, val) => set(items.map(i => i.id === id ? { ...i, [key]: val } : i))

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} className="flex gap-2 items-center">
          <Input placeholder="Language" value={item.language}
            onChange={e => update(item.id, 'language', e.target.value)} />
          <Select value={item.proficiency} options={PROFICIENCY}
            onChange={e => update(item.id, 'proficiency', e.target.value)} />
          <button onClick={() => remove(item.id)} className="p-2 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors shrink-0">
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button onClick={add} className="w-full py-2.5 rounded-xl border border-dashed border-white/15 hover:border-indigo-500/40
        text-zinc-500 hover:text-indigo-400 text-sm flex items-center justify-center gap-2 transition-all">
        <Plus size={14} /> Add Language
      </button>
    </div>
  )
}

// ─── INTERESTS ────────────────────────────────────────────────────────────────
export function InterestsSection() {
  const { cv, updateSection } = useCVStore()
  const items = cv?.data?.interests || []
  const set = v => updateSection('interests', v)
  const add = () => set([...items, { id: uuidv4(), name: '' }])
  const remove = id => set(items.filter(i => i.id !== id))
  const update = (id, val) => set(items.map(i => i.id === id ? { ...i, name: val } : i))

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-1 px-3 py-1.5 glass rounded-full">
            <input className="bg-transparent text-sm text-zinc-200 outline-none w-24" value={item.name}
              onChange={e => update(item.id, e.target.value)} placeholder="Interest" />
            <button onClick={() => remove(item.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={add} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
        <Plus size={12} /> Add Interest
      </button>
    </div>
  )
}

// ─── CUSTOM SECTION ───────────────────────────────────────────────────────────
import RichTextEditor from '../ui/RichTextEditor.jsx'

export function CustomSectionEditor({ section, onChange, onDelete }) {
  const addEntry = () => onChange({ ...section, entries: [...(section.entries || []), { id: uuidv4(), title: '', content: '' }] })
  const removeEntry = id => onChange({ ...section, entries: section.entries.filter(e => e.id !== id) })
  const updateEntry = (id, key, val) => onChange({ ...section, entries: section.entries.map(e => e.id === id ? { ...e, [key]: val } : e) })

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input className="input-field flex-1 font-medium" value={section.title}
          onChange={e => onChange({ ...section, title: e.target.value })} placeholder="Section title" />
        <button onClick={onDelete} className="p-2 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
      {(section.entries || []).map(entry => (
        <div key={entry.id} className="glass rounded-xl p-3 space-y-2">
          <div className="flex gap-2">
            <Input placeholder="Entry title" value={entry.title} onChange={e => updateEntry(entry.id, 'title', e.target.value)} />
            <button onClick={() => removeEntry(entry.id)} className="p-2 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors shrink-0">
              <Trash2 size={13} />
            </button>
          </div>
          <RichTextEditor value={entry.content} onChange={val => updateEntry(entry.id, 'content', val)} placeholder="Content..." />
        </div>
      ))}
      <button onClick={addEntry} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
        <Plus size={12} /> Add Entry
      </button>
    </div>
  )
}
