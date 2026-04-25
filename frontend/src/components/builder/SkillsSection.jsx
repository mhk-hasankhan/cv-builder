import { useCVStore } from '../../store/cvStore.js'
import { Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function SkillsSection() {
  const { cv, updateSection } = useCVStore()
  const items = cv?.data?.skills || []
  const [newItem, setNewItem] = useState({})

  const set = v => updateSection('skills', v)
  const addCategory = () => set([...items, { id: uuidv4(), category: 'New Category', items: [] }])
  const removeCategory = id => set(items.filter(i => i.id !== id))
  const updateCategory = (id, key, val) => set(items.map(i => i.id === id ? { ...i, [key]: val } : i))

  const addSkill = (catId, skill) => {
    if (!skill.trim()) return
    set(items.map(i => i.id === catId ? { ...i, items: [...(i.items || []), skill.trim()] } : i))
    setNewItem(p => ({ ...p, [catId]: '' }))
  }

  const removeSkill = (catId, idx) => {
    set(items.map(i => i.id === catId ? { ...i, items: i.items.filter((_, j) => j !== idx) } : i))
  }

  return (
    <div className="space-y-3">
      {items.map(cat => (
        <div key={cat.id} className="glass rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              className="input-field flex-1 text-sm font-medium"
              value={cat.category}
              onChange={e => updateCategory(cat.id, 'category', e.target.value)}
              placeholder="Category name"
            />
            <button onClick={() => removeCategory(cat.id)}
              className="p-1.5 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(cat.items || []).map((skill, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs
                bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {skill}
                <button onClick={() => removeSkill(cat.id, i)} className="hover:text-white transition-colors">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              className="input-field flex-1 text-sm"
              value={newItem[cat.id] || ''}
              onChange={e => setNewItem(p => ({ ...p, [cat.id]: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addSkill(cat.id, newItem[cat.id] || '')}
              placeholder="Add skill, press Enter"
            />
            <button onClick={() => addSkill(cat.id, newItem[cat.id] || '')}
              className="px-3 py-2 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 transition-colors text-sm">
              <Plus size={14} />
            </button>
          </div>
        </div>
      ))}
      <button onClick={addCategory} className="w-full py-2.5 rounded-xl border border-dashed border-white/15
        hover:border-indigo-500/40 text-zinc-500 hover:text-indigo-400 text-sm flex items-center justify-center gap-2 transition-all">
        <Plus size={14} /> Add Category
      </button>
    </div>
  )
}
