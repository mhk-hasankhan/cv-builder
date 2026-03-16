import { useCVStore } from '../../store/cvStore.js'
import { Input } from '../ui/Elements.jsx'
import { uploadApi } from '../../utils/api.js'
import { Camera, Plus, X } from 'lucide-react'

export default function PersonalSection() {
  const { cv, updateField, updateSection } = useCVStore()
  const p = cv?.data?.personal || {}

  const set = (key, val) => updateField(`personal.${key}`, val)

  const handlePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const res = await uploadApi.photo(file)
      set('photo', res.url)
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }

  const addLink = () => {
    const links = [...(p.otherLinks || []), { label: '', url: '' }]
    set('otherLinks', links)
  }

  const updateLink = (i, key, val) => {
    const links = (p.otherLinks || []).map((l, idx) => idx === i ? { ...l, [key]: val } : l)
    set('otherLinks', links)
  }

  const removeLink = (i) => {
    set('otherLinks', (p.otherLinks || []).filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-4">
      {/* Photo upload */}
      <div className="flex items-center gap-4">
        <label className="cursor-pointer group">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-white/5 border-2 border-dashed border-white/20
            hover:border-indigo-500/50 transition-colors flex items-center justify-center">
            {p.photo ? (
              <img src={p.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Camera size={20} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            )}
          </div>
          <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
        </label>
        <div>
          <p className="text-sm font-medium text-zinc-300">Profile Photo</p>
          <p className="text-xs text-zinc-500 mt-0.5">JPG, PNG or WebP, max 5MB</p>
          {p.photo && (
            <button onClick={() => set('photo', '')} className="text-xs text-red-400 mt-1 hover:text-red-300 transition-colors">
              Remove photo
            </button>
          )}
        </div>
      </div>

      <Input label="Full Name *" value={p.name || ''} onChange={e => set('name', e.target.value)} placeholder="John Doe" />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Email" value={p.email || ''} onChange={e => set('email', e.target.value)} placeholder="john@example.com" type="email" />
        <Input label="Phone" value={p.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+1 234 567 8900" />
      </div>

      <Input label="Address" value={p.address || ''} onChange={e => set('address', e.target.value)} placeholder="City, Country" />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Website" value={p.website || ''} onChange={e => set('website', e.target.value)} placeholder="https://yoursite.com" />
        <Input label="LinkedIn" value={p.linkedin || ''} onChange={e => set('linkedin', e.target.value)} placeholder="linkedin.com/in/you" />
      </div>

      <Input label="GitHub" value={p.github || ''} onChange={e => set('github', e.target.value)} placeholder="github.com/username" />

      {/* Other links */}
      <div>
        <label className="label">Other Links</label>
        <div className="space-y-2">
          {(p.otherLinks || []).map((link, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className="input-field flex-1" placeholder="Label" value={link.label}
                onChange={e => updateLink(i, 'label', e.target.value)} />
              <input className="input-field flex-2" placeholder="URL" value={link.url}
                onChange={e => updateLink(i, 'url', e.target.value)} />
              <button onClick={() => removeLink(i)} className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors">
                <X size={14} />
              </button>
            </div>
          ))}
          <button onClick={addLink} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            <Plus size={12} /> Add link
          </button>
        </div>
      </div>
    </div>
  )
}
