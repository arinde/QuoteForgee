import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Zap } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill in all fields.')
    setLoading(true)
    const { error } = await signIn({ email: form.email, password: form.password })
    setLoading(false)
    if (error) {
      toast.error(error.message ?? 'Login failed. Please try again.')
    } else {
      toast.success('Welcome back!')
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-forge-50 flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink-950 relative overflow-hidden flex-col justify-between p-12">
        {/* Texture overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #d9ac3a 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />
        {/* Decorative quote */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <Zap className="w-5 h-5 text-forge-400" strokeWidth={2.5} />
            <span className="font-display text-forge-300 text-lg font-semibold tracking-tight">QuoteForge</span>
          </div>
          <blockquote className="mt-auto">
            <p className="font-display text-3xl text-forge-100 italic leading-relaxed mb-6">
              "The proposal that wins is the one that gets sent."
            </p>
            <footer className="font-body text-sm text-ink-400">
              — Every deal you've ever closed
            </footer>
          </blockquote>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 border border-ink-700 rounded-xl p-4 bg-ink-900/50 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-full bg-forge-600 flex items-center justify-center font-display font-bold text-forge-100 text-sm shrink-0">
              AV
            </div>
            <div>
              <p className="font-body text-sm font-medium text-forge-100">Arin Victor</p>
              <p className="font-body text-xs text-ink-400">Closed 3 deals this week with QuoteForge</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <Zap className="w-5 h-5 text-forge-500" strokeWidth={2.5} />
            <span className="font-display text-forge-900 text-lg font-semibold">QuoteForge</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-ink-900 mb-2">
              Sign in
            </h1>
            <p className="font-body text-sm text-ink-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-forge-600 hover:text-forge-700 font-medium transition-colors">
                Create one free
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-body text-xs font-medium text-ink-700 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="auth-input"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-body text-xs font-medium text-ink-700 uppercase tracking-wide">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="font-body text-xs text-forge-600 hover:text-forge-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="auth-input pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-forge-300 border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in to QuoteForge'
              )}
            </button>
          </form>

          <p className="mt-8 font-body text-xs text-ink-400 text-center">
            By signing in, you agree to our{' '}
            <a href="#" className="text-ink-600 hover:text-ink-900 underline underline-offset-2">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-ink-600 hover:text-ink-900 underline underline-offset-2">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
