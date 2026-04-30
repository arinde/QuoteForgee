import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export function ProtectedRoute() {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-forge-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-sm text-ink-500">Loading QuoteForge…</p>
        </div>
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}

export function PublicRoute() {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-forge-50">
        <div className="w-8 h-8 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return !user ? <Outlet /> : <Navigate to="/dashboard" replace />
}
