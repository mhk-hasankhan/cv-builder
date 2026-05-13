import { LayoutTemplate } from 'lucide-react'
import { ColorPicker, Select } from '../ui/Elements.jsx'
import { TEMPLATES } from '../../templates/index.jsx'

const FONT_OPTIONS = [
  { value: 'inter', label: 'DM Sans (Modern)' },
  { value: 'serif', label: 'Source Serif (Elegant)' },
  { value: 'lora', label: 'Lora (Literary)' },
]

export function DesignTab({ cv, updateMeta }) {
  return (
    <div className="space-y-5">
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
      <ColorPicker label="Accent Color" value={cv.color_theme} onChange={c => updateMeta({ color_theme: c })} />
      <Select label="Font Family" value={cv.font_family} options={FONT_OPTIONS}
        onChange={e => updateMeta({ font_family: e.target.value })} />
    </div>
  )
}
