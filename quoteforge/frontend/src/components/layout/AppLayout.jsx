import { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { toast } from 'react-hot-toast'
import {
  Zap, LayoutDashboard, FileText, Users, Settings,
  LogOut, Menu, X, ChevronDown
} from 'lucide-react'
import { cn, getInitials } from '../../lib/utils'

const NAV = [
  { to: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/quotes',          icon: FileText,         label: 'Quotes'    },
  { to: '/clients',         icon: Users,            label: 'Clients'   },
  { to: '/settings',        icon: Settings,         label: 'Settings'  },
  { to: '/invoice', icon: Settings, label: 'Invoice'}
]

export default function AppLayout() {
  const { user, profile, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0]
  const companyName = profile?.company_name || ''

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out.')
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-ink-100">
        <div className="w-7 h-7 bg-ink-900 rounded-lg flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-forge-400" strokeWidth={2.5} />
        </div>
        <span className="font-display text-ink-900 font-semibold text-base tracking-tight">QuoteForge</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-ink-900 text-forge-100'
                  : 'text-ink-500 hover:bg-ink-100 hover:text-ink-900'
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 pb-4 border-t border-ink-100 pt-3">
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ink-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-forge-200 flex items-center justify-center font-display font-bold text-forge-800 text-xs shrink-0">
              {getInitials(displayName)}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-body text-sm font-medium text-ink-900 truncate">{displayName}</p>
              {companyName && <p className="font-body text-xs text-ink-400 truncate">{companyName}</p>}
            </div>
            <ChevronDown className={cn('w-3.5 h-3.5 text-ink-400 transition-transform', userMenuOpen && 'rotate-180')} />
          </button>

          {userMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-ink-200 rounded-lg shadow-lg overflow-hidden z-10">
              <NavLink
                to="/settings"
                onClick={() => { setUserMenuOpen(false); setSidebarOpen(false) }}
                className="flex items-center gap-2.5 px-4 py-2.5 font-body text-sm text-ink-700 hover:bg-ink-50 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </NavLink>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 font-body text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-forge-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-56 lg:flex-col bg-white border-r border-ink-100 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-white border-r border-ink-100 z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-ink-100">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-ink-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-ink-700" />
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-forge-500" strokeWidth={2.5} />
            <span className="font-display text-ink-900 font-semibold">QuoteForge</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
