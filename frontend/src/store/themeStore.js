import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function darken(hex, amount = 0.15) {
  const { r, g, b } = hexToRgb(hex)
  const f = 1 - amount
  return `rgb(${Math.round(r * f)}, ${Math.round(g * f)}, ${Math.round(b * f)})`
}

export function applyTheme(mode, accentColor) {
  const root = document.documentElement
  root.setAttribute('data-theme', mode)

  if (mode === 'custom') {
    const { r, g, b } = hexToRgb(accentColor)
    root.style.setProperty('--accent', accentColor)
    root.style.setProperty('--accent-hover', darken(accentColor, 0.15))
    root.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.3)`)
    root.style.setProperty('--accent-soft', `rgba(${r}, ${g}, ${b}, 0.1)`)
    root.style.setProperty('--accent-border', `rgba(${r}, ${g}, ${b}, 0.25)`)
    root.style.setProperty('--accent-text', accentColor)
  } else {
    for (const v of ['--accent', '--accent-hover', '--accent-glow', '--accent-soft', '--accent-border', '--accent-text']) {
      root.style.removeProperty(v)
    }
  }
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      mode: 'dark',
      accentColor: '#6366f1',

      setMode: (mode) => {
        set({ mode })
        applyTheme(mode, get().accentColor)
      },

      setAccentColor: (color) => {
        set({ mode: 'custom', accentColor: color })
        applyTheme('custom', color)
      },
    }),
    { name: 'cv-builder-theme' }
  )
)
