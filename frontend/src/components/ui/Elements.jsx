import { X, ChevronDown } from 'lucide-react'

export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose ?? undefined}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`relative w-full ${sizes[size]} glass rounded-2xl shadow-2xl animate-slide-up`}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="font-display font-semibold text-zinc-100">{title}</h2>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-200 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function Input({ label, error, ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <input className={`input-field ${error ? 'border-red-500/50' : ''}`} {...props} />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

export function Select({ label, options, value, onChange, ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <select value={value} onChange={onChange}
          className="input-field appearance-none pr-8 cursor-pointer" {...props}>
          {options.map(o => (
            <option key={o.value || o} value={o.value || o} className="bg-zinc-800">
              {o.label || o}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
      </div>
    </div>
  )
}

export function Textarea({ label, error, ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <textarea className={`input-field resize-none ${error ? 'border-red-500/50' : ''}`} rows={3} {...props} />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

export function ColorPicker({ label, value, onChange }) {
  const presets = ['#2563eb','#7c3aed','#db2777','#dc2626','#d97706','#059669','#0891b2','#1a1a2e']
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="flex items-center gap-2 flex-wrap">
        {presets.map(c => (
          <button key={c} type="button" onClick={() => onChange(c)}
            className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${value === c ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110' : ''}`}
            style={{ backgroundColor: c }} />
        ))}
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent" title="Custom color" />
      </div>
    </div>
  )
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div className={`relative w-9 h-5 rounded-full transition-colors`}
        style={{ backgroundColor: checked ? 'var(--accent)' : 'var(--input-bg)' }}
        onClick={() => onChange(!checked)}>
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
      {label && <span className="text-sm text-zinc-300">{label}</span>}
    </label>
  )
}

export function Badge({ children, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    zinc: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  )
}
