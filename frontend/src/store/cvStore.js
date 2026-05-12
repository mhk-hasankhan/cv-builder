import { create } from 'zustand'
import { cvsApi } from '../utils/api.js'
import { DEFAULT_DATA, DEFAULT_SECTIONS } from '../../../shared/cvDefaults.json'

export const useCVStore = create((set, get) => ({
  cv: null,
  loading: false,
  saving: false,
  error: null,
  saveTimeout: null,

  load: async (id) => {
    set({ loading: true, error: null })
    try {
      const cv = await cvsApi.get(id)
      set({
        cv: {
          ...cv,
          data: { ...DEFAULT_DATA, ...cv.data },
          section_order: cv.section_order?.length ? cv.section_order : DEFAULT_SECTIONS,
          enabled_sections: cv.enabled_sections?.length ? cv.enabled_sections : DEFAULT_SECTIONS,
        },
        loading: false
      })
    } catch (e) {
      set({ error: e.message || 'Failed to load CV', loading: false })
    }
  },

  updateField: (path, value) => {
    const { cv, scheduleSave } = get()
    if (!cv) return
    const newData = { ...cv.data }
    const parts = path.split('.')
    let obj = newData
    for (let i = 0; i < parts.length - 1; i++) {
      obj[parts[i]] = { ...obj[parts[i]] }
      obj = obj[parts[i]]
    }
    obj[parts[parts.length - 1]] = value
    set({ cv: { ...cv, data: newData } })
    scheduleSave()
  },

  updateSection: (section, value) => {
    const { cv, scheduleSave } = get()
    if (!cv) return
    set({ cv: { ...cv, data: { ...cv.data, [section]: value } } })
    scheduleSave()
  },

  updateMeta: (meta) => {
    const { cv, scheduleSave } = get()
    if (!cv) return
    set({ cv: { ...cv, ...meta } })
    scheduleSave()
  },

  reorderSections: (newOrder) => {
    const { cv, scheduleSave } = get()
    if (!cv) return
    set({ cv: { ...cv, section_order: newOrder } })
    scheduleSave()
  },

  toggleSection: (section) => {
    const { cv, scheduleSave } = get()
    if (!cv) return
    const enabled = cv.enabled_sections.includes(section)
      ? cv.enabled_sections.filter(s => s !== section)
      : [...cv.enabled_sections, section]
    set({ cv: { ...cv, enabled_sections: enabled } })
    scheduleSave()
  },

  scheduleSave: () => {
    const { saveTimeout, save } = get()
    if (saveTimeout) clearTimeout(saveTimeout)
    const timeout = setTimeout(() => save(), 1200)
    set({ saveTimeout: timeout })
  },

  save: async () => {
    const { cv } = get()
    if (!cv) return
    set({ saving: true })
    try {
      await cvsApi.update(cv.id, {
        title: cv.title,
        template: cv.template,
        color_theme: cv.color_theme,
        font_family: cv.font_family,
        data: cv.data,
        section_order: cv.section_order,
        enabled_sections: cv.enabled_sections,
      })
    } catch (e) {
      console.error('Auto-save failed:', e)
    } finally {
      set({ saving: false })
    }
  },

  reset: () => {
    const { saveTimeout } = get()
    if (saveTimeout) clearTimeout(saveTimeout)
    set({ cv: null, loading: false, saving: false, error: null, saveTimeout: null })
  },
}))
