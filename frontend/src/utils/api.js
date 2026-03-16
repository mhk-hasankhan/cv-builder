import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000
})

api.interceptors.response.use(
  r => r.data,
  e => Promise.reject(e.response?.data || e)
)

export const cvsApi = {
  list: () => api.get('/cvs'),
  get: id => api.get(`/cvs/${id}`),
  create: data => api.post('/cvs', data),
  update: (id, data) => api.put(`/cvs/${id}`, data),
  delete: id => api.delete(`/cvs/${id}`),
  duplicate: id => api.post(`/cvs/${id}/duplicate`),
}

export const coverLettersApi = {
  list: () => api.get('/cover-letters'),
  get: id => api.get(`/cover-letters/${id}`),
  create: data => api.post('/cover-letters', data),
  update: (id, data) => api.put(`/cover-letters/${id}`, data),
  delete: id => api.delete(`/cover-letters/${id}`),
}

export const exportApi = {
  pdf: id => `${import.meta.env.VITE_API_URL}/export/pdf/${id}`,
  docx: id => `${import.meta.env.VITE_API_URL}/export/docx/${id}`,
  clPdf: id => `${import.meta.env.VITE_API_URL}/export/cover-letter/pdf/${id}`,
  clDocx: id => `${import.meta.env.VITE_API_URL}/export/cover-letter/docx/${id}`,
}

export const uploadApi = {
  photo: file => {
    const form = new FormData()
    form.append('photo', file)
    return api.post('/upload/photo', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  }
}

export const shareApi = {
  generate: id => api.post(`/share/generate/${id}`),
  get: token => api.get(`/share/${token}`),
}

export default api
