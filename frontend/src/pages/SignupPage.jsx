import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Zap, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p) => /\d/.test(p) },
]

export default function SignupPage() {
  const navigate = useNavigate()
  const { signUp } = useAuthStore()
  const [form, setForm] = useState({
    fullName: '',
    companyName: '',
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const passwordStrength = PASSWORD_RULES.filter((r) => r.test(form.password)).length

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.password)
      return toast.error('Please fill in all required fields.')
    if (passwordStrength < PASSWORD_RULES.length)
      return toast.error('Password doesn\'t meet requirements.')

    setLoading(true)
    const { error } = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      companyName: form.companyName,
    })
    setLoading(false)

    if (error) {
      toast.error(error.message ?? 'Sign up failed. Please try again.')
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-forge-50 flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-forge-100 border-2 border-forge-300 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-forge-600" />
          </div>
          <h1 className="font-display text-3xl font-bold text-ink-900 mb-3">Check your inbox</h1>
          <p className="font-body text-sm text-ink-500 mb-6 leading-relaxed">
            We sent a confirmation link to <span className="font-medium text-ink-800">{form.email}</span>.
            Click it to activate your account and start building proposals.
          </p>
          <Link
            to="/login"
            className="inline-block font-body text-sm font-medium text-forge-600 hover:text-forge-700 transition-colors"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-forge-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink-950 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #d9ac3a 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <Zap className="w-5 h-5 text-forge-400" strokeWidth={2.5} />
            <span className="font-display text-forge-300 text-lg font-semibold tracking-tight">QuoteForge</span>
          </div>
          <div className="space-y-6">
            {[
              { emoji: '⚡', text: 'Build professional quotes in minutes, not hours' },
              { emoji: '📬', text: 'Send branded proposals clients can sign online' },
              { emoji: '📈', text: 'Track views, follows-up, and conversions in one place' },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">{item.emoji}</span>
                <p className="font-body text-sm text-ink-300 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <p className="font-body text-xs text-ink-500 uppercase tracking-widest mb-3">Free plan includes</p>
          <ul className="space-y-1.5">
            {['5 active quotes', 'PDF export', 'Email delivery', 'Client view tracking'].map((f) => (
              <li key={f} className="flex items-center gap-2 font-body text-sm text-ink-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-forge-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <Zap className="w-5 h-5 text-forge-500" strokeWidth={2.5} />
            <span className="font-display text-forge-900 text-lg font-semibold">QuoteForge</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-ink-900 mb-2">
              Create your account
            </h1>
            <p className="font-body text-sm text-ink-500">
              Already have one?{' '}
              <Link to="/login" className="text-forge-600 hover:text-forge-700 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-body text-xs font-medium text-ink-700 mb-1.5 uppercase tracking-wide">
                  Full name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Ada Lovelace"
                  className="auth-input"
                  autoComplete="name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block font-body text-xs font-medium text-ink-700 mb-1.5 uppercase tracking-wide">
                  Company
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="Acme Inc."
                  className="auth-input"
                  autoComplete="organization"
                />
              </div>
            </div>

            <div>
              <label className="block font-body text-xs font-medium text-ink-700 mb-1.5 uppercase tracking-wide">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="auth-input"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block font-body text-xs font-medium text-ink-700 mb-1.5 uppercase tracking-wide">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="auth-input pr-11"
                  autoComplete="new-password"
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
              {/* Password strength */}
              {form.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i < passwordStrength
                            ? passwordStrength === 1
                              ? 'bg-red-400'
                              : passwordStrength === 2
                              ? 'bg-amber-400'
                              : 'bg-green-500'
                            : 'bg-ink-200'
                        }`}
                      />
                    ))}
                  </div>
                  <ul className="space-y-0.5">
                    {PASSWORD_RULES.map((rule) => (
                      <li
                        key={rule.label}
                        className={`flex items-center gap-1.5 font-body text-xs transition-colors ${
                          rule.test(form.password) ? 'text-green-600' : 'text-ink-400'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-forge-300 border-t-transparent rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create free account'
              )}
            </button>
          </form>

          <p className="mt-6 font-body text-xs text-ink-400 text-center">
            By signing up, you agree to our{' '}
            <a href="#" className="text-ink-600 hover:text-ink-900 underline underline-offset-2">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-ink-600 hover:text-ink-900 underline underline-offset-2">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
