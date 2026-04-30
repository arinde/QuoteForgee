import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const { user, session, profile, loading, initialize, signIn, signUp, signOut, resetPassword } =
    useAuthStore()

  useEffect(() => {
    initialize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { user, session, profile, loading, signIn, signUp, signOut, resetPassword }
}
