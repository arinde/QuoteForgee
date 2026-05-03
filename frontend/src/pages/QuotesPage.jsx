import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuotesStore } from '../store/quotesStore'
import { StatusBadge } from '../components/ui/StatusBadge'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { formatCurrency, formatDate } from '../lib/utils'
import { cn } from '../lib/utils'
import { toast } from 'react-hot-toast'
import {
  Plus, FileText, Search, Send,
  Trash2, Edit3, MoreHorizontal, Eye
} from 'lucide-react'

const STATUSES = ['all', 'draft', 'sent', 'viewed', 'accepted', 'declined']

export default function QuotesPage() {
  const navigate = useNavigate()
  const { quotes, loading, fetchQuotes, deleteQuote, sendQuote } = useQuotesStore()

  const [search, setSearch]             = useState('')
  const [statusFilter, setStatus]       = useState('all')
  const [menuOpen, setMenuOpen]         = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [sendTarget, setSendTarget]     = useState(null)
  const [sending, setSending]           = useState(false)

  useEffect(() => { fetchQuotes() }, [fetchQuotes])

  const filtered = quotes.filter(q => {
    const matchStatus = statusFilter === 'all' || q.status === statusFilter
    const matchSearch = !search ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.client_name.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const handleDelete = async () => {
    try { await deleteQuote(deleteTarget); toast.success('Quote deleted.') }
    catch (e) { toast.error(e.message) }
    setDeleteTarget(null)
  }

  const handleSend = async () => {
    setSending(true)
    try { await sendQuote(sendTarget); toast.success('Quote sent!') }
    catch (e) { toast.error(e.message) }
    setSending(false)
    setSendTarget(null)
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Quotes</h1>
          <p className="font-body text-sm text-ink-400 mt-0.5">{quotes.length} total quotes</p>
        </div>
        <button
          onClick={() => navigate('/quotes/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-ink-900 text-forge-100 font-body text-sm font-medium rounded-lg hover:bg-ink-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Quote
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white border border-ink-100 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-ink-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or client…"
              className="w-full pl-9 pr-4 py-2 bg-forge-50 border border-ink-200 rounded-lg font-body text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-forge-400 focus:ring-1 focus:ring-forge-200 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg font-body text-xs font-medium capitalize transition-colors',
                  statusFilter === s ? 'bg-ink-900 text-forge-100' : 'text-ink-500 hover:bg-ink-100'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
            <p className="font-body text-sm text-ink-400">Loading…</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={search || statusFilter !== 'all' ? 'No quotes match' : 'No quotes yet'}
            description={
              search || statusFilter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Hit "New Quote" to create your first one.'
            }
            action={
              !search && statusFilter === 'all' && (
                <button
                  onClick={() => navigate('/quotes/new')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink-900 text-forge-100 font-body text-sm font-medium rounded-lg hover:bg-ink-800 transition-colors"
                >
                  <Plus className="w-4 h-4" /> New Quote
                </button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-100">
                  {['Title', 'Client', 'Amount', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-body text-xs font-medium text-ink-400 uppercase tracking-wide first:pl-5 last:pr-5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.map(quote => (
                  <tr key={quote.id} className="hover:bg-forge-50/60 transition-colors group">
                    <td className="px-4 py-3.5 pl-5">
                      <button
                        onClick={() => navigate(`/quotes/${quote.id}`)}
                        className="font-body text-sm font-medium text-ink-900 hover:text-forge-700 transition-colors text-left"
                      >
                        {quote.title}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 font-body text-sm text-ink-600">{quote.client_name}</td>
                    <td className="px-4 py-3.5 font-mono text-sm text-ink-900 font-medium">
                      {formatCurrency(quote.total_amount, quote.currency)}
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={quote.status} /></td>
                    <td className="px-4 py-3.5 font-body text-sm text-ink-400">{formatDate(quote.created_at)}</td>
                    <td className="px-4 py-3.5 pr-5 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setMenuOpen(menuOpen === quote.id ? null : quote.id)}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-ink-100 transition-all"
                        >
                          <MoreHorizontal className="w-4 h-4 text-ink-500" />
                        </button>
                        {menuOpen === quote.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                            <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-ink-200 rounded-lg shadow-lg overflow-hidden w-44">
                              <button
                                onClick={() => { navigate(`/quotes/${quote.id}`); setMenuOpen(null) }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 font-body text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" /> View
                              </button>
                              <button
                                onClick={() => { navigate(`/quotes/${quote.id}/edit`); setMenuOpen(null) }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 font-body text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                              </button>
                              {quote.status === 'draft' && (
                                <button
                                  onClick={() => { setSendTarget(quote.id); setMenuOpen(null) }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 font-body text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                  <Send className="w-3.5 h-3.5" /> Send
                                </button>
                              )}
                              <button
                                onClick={() => { setDeleteTarget(quote.id); setMenuOpen(null) }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 font-body text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this quote?"
        description="This cannot be undone. The quote and all line items will be permanently removed."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!sendTarget}
        title="Send this quote?"
        description="The quote will be emailed to your client and its status will update to 'Sent'."
        confirmLabel={sending ? 'Sending…' : 'Send Quote'}
        onConfirm={handleSend}
        onCancel={() => setSendTarget(null)}
      />
    </div>
  )
}