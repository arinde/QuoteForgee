import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import DashboardPage from './pages/DashboardPage'
import QuotesPage from './pages/QuotesPage'
import QuoteBuilderPage from './pages/QuoteBuilderPage'
import QuoteDetailPage from './pages/QuoteDetailPage'
import ClientsPage from './pages/ClientsPage'
import SettingsPage from './pages/SettingsPage'
import { useAuth } from './hooks/useAuth'

export default function App() {
  useAuth()

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard"       element={<DashboardPage />} />
          <Route path="/quotes"          element={<QuotesPage />} />
          <Route path="/quotes/new"      element={<QuoteBuilderPage />} />
          <Route path="/quotes/:id"      element={<QuoteDetailPage />} />
          <Route path="/quotes/:id/edit" element={<QuoteBuilderPage />} />
          <Route path="/clients"         element={<ClientsPage />} />
          <Route path="/settings"        element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}