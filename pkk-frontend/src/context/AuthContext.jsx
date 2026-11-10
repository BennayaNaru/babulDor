import { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // pulihkan sesi dari token yang tersimpan
  useEffect(() => {
    const token = localStorage.getItem('pkk_token')
    if (!token) {
      setLoading(false)
      return
    }
    api.get('/me')
      .then((res) => setUser(res.data.data))
      .catch(() => localStorage.removeItem('pkk_token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(form) {
    const res = await api.post('/login', form)
    localStorage.setItem('pkk_token', res.data.data.token)
    setUser(res.data.data.user)
    return res.data.data.user
  }

  async function logout() {
    try {
      await api.post('/logout')
    } catch {
      // token sudah tidak valid, abaikan
    }
    localStorage.removeItem('pkk_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)