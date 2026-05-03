import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { api } from '../lib/api'
import { getInitials } from '../lib/utils'
import { toast } from 'react-hot-toast'
import { User, Building2, Mail, Lock, Save } from 'lucide-react'

export default function SettingsPage() {
  const { user, profile, fetchProfile } = useAuthStore()
  const [saving, setSaving]   = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    company_name: '',
  })
  const [pwForm, setPwForm] = useState({
    password: '',
    confirm: '',
  })
  const [savingPw, setSavingPw] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        company_name: profile.company_name || '',
      })
    }
  }, [profile])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/api/profiles/me', form)
      await fetchProfile(user.id)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!pwForm.password) return toast.error('Enter a new password.')
    if (pwForm.password.length < 8) return toast.error('Password must be at least 8 characters.')
    if (pwForm.password !== pwForm.confirm) return toast.error('Passwords do not match.')

    setSavingPw(true)
    try {
      const { supabase } = await import('../lib/supabase')
      const { error } = await supabase.auth.updateUser({ password: pwForm.password })
      if (error) throw error
      toast.success('Password updated!')
      setPwForm({ password: '', confirm: '' })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingPw(false)
    }
  }

  const displayName = form.full_name || user?.email?.split('@')[0] || '?'

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink-900">Settings</h1>
        <p className="font-body text-sm text-ink-400 mt-0.5">Manage your profile and account.</p>
      </div>

      <div className="space-y-6">
        {/* Avatar */}
        <div className="bg-white border border-ink-100 rounded-xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-forge-200 flex items-center justify-center font-display font-bold text-forge-800 text-xl shrink-0">
            {getInitials(displayName)}
          </div>
          <div>
            <p className="font-body text-base font-semibold text-ink-900">{displayName}</p>
            <p className="font-body text-sm text-ink-400">{user?.email}</p>
          </div>
        </div>

        {/* Profile form */}
        <form onSubmit={handleSaveProfile} className="bg-white border border-ink-100 rounded-xl p-6">
          <h2 className="font-display text-base font-semibold text-ink-900 mb-5 flex items-center gap-2">
            <User className="w-4 h-4 text-ink-400" />
            Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block font-body text-xs font-medium text-ink-700 mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              <input
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                placeholder="Your full name"
                className="auth-input"
              />
            </div>
            <div>
              <label className="block font-body text-xs font-medium text-ink-700 mb-1.5 uppercase tracking-wide">
                Company Name
              </label>
              <input
                value={form.company_name}
                onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                placeholder="Your company or business name"
                className="auth-input"
              />
            </div>
            <div>
              <label className="block font-body text-xs font-medium text-ink-700 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                value={user?.email || ''}
                disabled
                className="auth-input opacity-50 cursor-not-allowed bg-ink-50"
              />
              <p className="font-body text-xs text-ink-400 mt-1">Email cannot be changed here.</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-ink-900 text-forge-100 font-body text-sm font-medium rounded-lg hover:bg-ink-800 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </form>

        {/* Password form */}
        <form onSubmit={handleChangePassword} className="bg-white border border-ink-100 rounded-xl p-6">
          <h2 className="font-display text-base font-semibold text-ink-900 mb-5 flex items-center gap-2">
            <Lock className="w-4 h-4 text-ink-400" />
            Change Password
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block font-body text-xs font-medium text-ink-700 mb-1.5 uppercase tracking-wide">
                New Password
              </label>
              <input
                type="password"
                value={pwForm.password}
                onChange={e => setPwForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="auth-input"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block font-body text-xs font-medium text-ink-700 mb-1.5 uppercase tracking-wide">
                Confirm Password
              </label>
              <input
                type="password"
                value={pwForm.confirm}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                placeholder="••••••••"
                className="auth-input"
                autoComplete="new-password"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={savingPw}
              className="flex items-center gap-2 px-5 py-2.5 bg-ink-900 text-forge-100 font-body text-sm font-medium rounded-lg hover:bg-ink-800 transition-colors disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              {savingPw ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>

        {/* Account info */}
        <div className="bg-white border border-ink-100 rounded-xl p-6">
          <h2 className="font-display text-base font-semibold text-ink-900 mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-ink-400" />
            Account
          </h2>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-body text-sm font-medium text-ink-800">Account ID</p>
              <p className="font-mono text-xs text-ink-400 mt-0.5">{user?.id}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-ink-50 mt-2">
            <div>
              <p className="font-body text-sm font-medium text-ink-800">Member since</p>
              <p className="font-body text-xs text-ink-400 mt-0.5">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}