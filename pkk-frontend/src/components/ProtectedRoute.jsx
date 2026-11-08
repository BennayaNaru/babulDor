import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { homeByRole } from '../lib/roles'

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-secondary">Memuat...</div>
  }
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeByRole[user.role]} replace />
  }
  return <Outlet />
}   