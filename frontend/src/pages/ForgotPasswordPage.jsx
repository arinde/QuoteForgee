import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Zap, ArrowLeft, Mail } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuthStore()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Please enter your email.')
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) {
      toast.error(error.message ?? 'Something went wrong.')
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-forge-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="flex items-center gap-2 mb-12">
          <Zap className="w-5 h-5 text-forge-500" strokeWidth={2.5} />
          <span className="font-display text-forge-900 text-lg font-semibold">QuoteForge</span>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-forge-100 border-2 border-forge-300 flex items-center justify-center mx-auto mb-5">
              <Mail className="w-6 h-6 text-forge-600" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink-900 mb-2">Check your email</h1>
            <p className="font-body text-sm text-ink-500 mb-6 leading-relaxed">
              We sent a reset link to <span className="font-medium text-ink-800">{email}</span>.
              It expires in 1 hour.
            </p>
            <Link to="/login" className="btn-ghost inline-flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-ink-900 mb-2">Reset password</h1>
              <p className="font-body text-sm text-ink-500">
                Enter your email and we'll send you a reset link.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-body text-xs font-medium text-ink-700 mb-1.5 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="auth-input"
                  autoFocus
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-forge-300 border-t-transparent rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>
            <div className="mt-6 text-center">
              <Link to="/login" className="btn-ghost inline-flex items-center gap-1.5 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
