import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pkk_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // token kedaluwarsa / tidak valid → kembali ke login
    if (err.response?.status === 401 && !err.config.url.includes('/login')) {
      localStorage.removeItem('pkk_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api