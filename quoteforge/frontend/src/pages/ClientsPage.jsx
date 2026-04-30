import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuotesStore } from '../store/quotesStore'
import { EmptyState } from '../components/ui/EmptyState'
import { formatCurrency, getInitials } from '../lib/utils'
import { Users, Plus, FileText, TrendingUp } from 'lucide-react'

export default function ClientsPage() {
  const navigate = useNavigate()
  const { quotes, loading, fetchQuotes } = useQuotesStore()

  useEffect(() => { fetchQuotes() }, [fetchQuotes])

  // Derive unique clients from quotes
  const clients = useMemo(() => {
    const map = {}
    quotes.forEach(q => {
      if (!map[q.client_email]) {
        map[q.client_email] = {
          name: q.client_name,
          email: q.client_email,
          quotes: [],
          totalValue: 0,
        }
      }
      map[q.client_email].quotes.push(q)
      map[q.client_email].totalValue += Number(q.total_amount || 0)
    })
    return Object.values(map).sort((a, b) => b.totalValue - a.totalValue)
  }, [quotes])

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Clients</h1>
          <p className="font-body text-sm text-ink-400 mt-0.5">
            {clients.length} {clients.length === 1 ? 'client' : 'clients'} from your quotes
          </p>
        </div>
        <button
          onClick={() => navigate('/quotes/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-ink-900 text-forge-100 font-body text-sm font-medium rounded-lg hover:bg-ink-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Quote
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-sm text-ink-400">Loading clients…</p>
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Clients are automatically added when you create quotes for them."
          action={
            <button
              onClick={() => navigate('/quotes/new')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink-900 text-forge-100 font-body text-sm font-medium rounded-lg hover:bg-ink-800 transition-colors"
            >
              <Plus className="w-4 h-4" /> Create First Quote
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(client => {
            const accepted = client.quotes.filter(q => q.status === 'accepted').length
            const pending  = client.quotes.filter(q => ['sent', 'viewed'].includes(q.status)).length

            return (
              <div
                key={client.email}
                className="bg-white border border-ink-100 rounded-xl p-5 hover:border-ink-200 hover:shadow-sm transition-all"
              >
                {/* Avatar + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-forge-100 flex items-center justify-center font-display font-bold text-forge-700 text-sm shrink-0">
                    {getInitials(client.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-body text-sm font-semibold text-ink-900 truncate">{client.name}</p>
                    <p className="font-body text-xs text-ink-400 truncate">{client.email}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center">
                    <p className="font-display text-lg font-bold text-ink-900">{client.quotes.length}</p>
                    <p className="font-body text-xs text-ink-400">Quotes</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-lg font-bold text-green-600">{accepted}</p>
                    <p className="font-body text-xs text-ink-400">Won</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-lg font-bold text-amber-500">{pending}</p>
                    <p className="font-body text-xs text-ink-400">Pending</p>
                  </div>
                </div>

                {/* Total value */}
                <div className="border-t border-ink-50 pt-4 flex items-center justify-between">
                  <span className="font-body text-xs text-ink-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Total value
                  </span>
                  <span className="font-mono text-sm font-semibold text-ink-900">
                    {formatCurrency(client.totalValue)}
                  </span>
                </div>

                {/* Recent quotes */}
                <div className="mt-3 space-y-1.5">
                  {client.quotes.slice(0, 2).map(q => (
                    <button
                      key={q.id}
                      onClick={() => navigate(`/quotes/${q.id}`)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-forge-50 transition-colors text-left"
                    >
                      <FileText className="w-3.5 h-3.5 text-ink-300 shrink-0" />
                      <span className="font-body text-xs text-ink-600 truncate flex-1">{q.title}</span>
                      <span className="font-mono text-xs text-ink-400 shrink-0">
                        {formatCurrency(q.total_amount, q.currency)}
                      </span>
                    </button>
                  ))}
                  {client.quotes.length > 2 && (
                    <p className="font-body text-xs text-ink-400 text-center pt-1">
                      +{client.quotes.length - 2} more quotes
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}