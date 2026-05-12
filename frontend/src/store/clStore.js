import { create } from 'zustand'
import { coverLettersApi } from '../utils/api.js'

const DEFAULT_DATA = {
  recipientName: '', recipientTitle: '', companyName: '', companyAddress: '',
  date: new Date().toISOString().split('T')[0],
  subject: '', salutation: 'Dear Hiring Manager,',
  body: '', closing: 'Sincerely,',
  senderName: '', senderEmail: '', senderPhone: ''
}

export const useCLStore = create((set, get) => ({
  cl: null,
  loading: false,
  saving: false,
  error: null,
  saveTimeout: null,

  load: async (id) => {
    set({ loading: true, error: null })
    try {
      const cl = await coverLettersApi.get(id)
      set({ cl: { ...cl, data: { ...DEFAULT_DATA, ...cl.data } }, loading: false })
    } catch (e) {
      set({ error: e.message || 'Failed to load', loading: false })
    }
  },

  updateField: (key, value) => {
    const { cl, scheduleSave } = get()
    if (!cl) return
    set({ cl: { ...cl, data: { ...cl.data, [key]: value } } })
    scheduleSave()
  },

  updateMeta: (meta) => {
    const { cl, scheduleSave } = get()
    if (!cl) return
    set({ cl: { ...cl, ...meta } })
    scheduleSave()
  },

  scheduleSave: () => {
    const { saveTimeout, save } = get()
    if (saveTimeout) clearTimeout(saveTimeout)
    const timeout = setTimeout(() => save(), 1200)
    set({ saveTimeout: timeout })
  },

  save: async () => {
    const { cl } = get()
    if (!cl) return
    set({ saving: true })
    try {
      await coverLettersApi.update(cl.id, { title: cl.title, data: cl.data })
    } catch (e) {
      console.error('Auto-save failed:', e)
    } finally {
      set({ saving: false })
    }
  },

  reset: () => {
    const { saveTimeout } = get()
    if (saveTimeout) clearTimeout(saveTimeout)
    set({ cl: null, loading: false, saving: false, error: null, saveTimeout: null })
  },
}))
