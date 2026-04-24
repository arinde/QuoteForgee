import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { toast } from 'react-hot-toast'
import { Zap } from 'lucide-react'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        toast.error('Verification failed. Please try again.')
        navigate('/login')
        return
      }

      if (session) {
        toast.success('Email confirmed! Welcome to QuoteForge.')
        navigate('/dashboard')
      } else {
        navigate('/login')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-forge-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-forge-500" strokeWidth={2.5} />
          <span className="font-display text-forge-900 text-lg font-semibold">QuoteForge</span>
        </div>
        <div className="w-8 h-8 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
        <p className="font-body text-sm text-ink-500">Verifying your account…</p>
      </div>
    </div>
  )
}
