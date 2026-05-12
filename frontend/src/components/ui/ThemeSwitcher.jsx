import { Sun, Moon, Palette } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore.js'

const ACCENT_PRESETS = [
  '#6366f1', // indigo
  '#7c3aed', // violet
  '#db2777', // pink
  '#dc2626', // red
  '#d97706', // amber
  '#059669', // emerald
  '#0891b2', // cyan
  '#0ea5e9', // sky
]

export default function ThemeSwitcher() {
  const { mode, accentColor, setMode, setAccentColor } = useThemeStore()

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={() => setMode('dark')}
        title="Dark theme"
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
          mode === 'dark' ? 'bg-[var(--accent)] text-[white]' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
        }`}
      >
        <Moon size={15} />
      </button>

      <button
        onClick={() => setMode('light')}
        title="Light theme"
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
          mode === 'light' ? 'bg-[var(--accent)] text-[white]' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
        }`}
      >
        <Sun size={15} />
      </button>

      <div className="relative group">
        <button
          title="Custom accent color"
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
            mode === 'custom' ? 'bg-[var(--accent)] text-[white]' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          <Palette size={15} />
        </button>

        {/* Color picker popup */}
        <div className="absolute left-full ml-2 bottom-0 hidden group-hover:flex flex-col gap-2 p-3 glass rounded-xl shadow-xl z-50 w-[148px]">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1">Accent Color</p>
          <div className="grid grid-cols-4 gap-1.5">
            {ACCENT_PRESETS.map(color => (
              <button
                key={color}
                onClick={() => setAccentColor(color)}
                className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                  mode === 'custom' && accentColor === color ? 'ring-2 ring-white ring-offset-1 ring-offset-transparent scale-110' : ''
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-1 pt-2 border-t border-[var(--border)]">
            <span className="text-[10px] text-zinc-500">Custom</span>
            <input
              type="color"
              value={mode === 'custom' ? accentColor : '#6366f1'}
              onChange={e => setAccentColor(e.target.value)}
              className="flex-1 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
