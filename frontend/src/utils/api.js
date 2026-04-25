import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000
});

<<<<<<< HEAD
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

=======
>>>>>>> 1e0424acaade213ab31886d5ec68cede14bf7c9d
api.interceptors.response.use(
  r => r.data,
  e => Promise.reject(e.response?.data || e)
)

<<<<<<< HEAD
export const authApi = {
  googleSignIn: credential => api.post('/auth/google', { credential }),
}

=======
>>>>>>> 1e0424acaade213ab31886d5ec68cede14bf7c9d
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
  pdf: id => `${API_URL}/export/pdf/${id}`,
  docx: id => `${API_URL}/export/docx/${id}`,
  clPdf: id => `${API_URL}/export/cover-letter/pdf/${id}`,
  clDocx: id => `${API_URL}/export/cover-letter/docx/${id}`,
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
