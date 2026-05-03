export default function QuoteDetailPage() {
    return (
        <div className="p-6">
            <h1 className="font-display text-2xl text-ink-900 mb-4">Quote Detail</h1>
            <p className="font-body text-ink-500">This is where the quote details will be displayed.</p>
        </div>
    )
}import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuotesStore } from '../store/quotesStore'
import { api } from '../lib/api'
import { StatusBadge } from '../components/ui/StatusBadge'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { formatCurrency, formatDate } from '../lib/utils'
import { toast } from 'react-hot-toast'
import {
  ArrowLeft, Edit3, Send, Trash2,
  Mail, Calendar, User, FileText, Clock
} from 'lucide-react'

export default function QuoteDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { deleteQuote, sendQuote } = useQuotesStore()

  const [quote, setQuote]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [sendOpen, setSendOpen]     = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [sending, setSending]       = useState(false)
  const [message, setMessage]       = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get(`/api/quotes/${id}`)
        setQuote(data)
        // Auto-open send dialog if navigated from builder with ?send=true
        if (searchParams.get('send') === 'true') setSendOpen(true)
      } catch (e) {
        toast.error('Quote not found.')
        navigate('/quotes')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate, searchParams])

  const handleSend = async () => {
    setSending(true)
    try {
      await sendQuote(id, message)
      setQuote(q => ({ ...q, status: 'sent' }))
      toast.success('Quote sent to client!')
    } catch (e) {
      toast.error(e.message)
    }
    setSending(false)
    setSendOpen(false)
  }

  const handleDelete = async () => {
    try {
      await deleteQuote(id)
      toast.success('Quote deleted.')
      navigate('/quotes')
    } catch (e) {
      toast.error(e.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!quote) return null

  const subtotal = quote.line_items?.reduce((s, i) => s + i.quantity * i.unit_price, 0) ?? 0

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/quotes')}
            className="p-2 rounded-lg hover:bg-ink-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-ink-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-ink-900">{quote.title}</h1>
              <StatusBadge status={quote.status} />
            </div>
            <p className="font-body text-sm text-ink-400 mt-0.5">
              Created {formatDate(quote.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate(`/quotes/${id}/edit`)}
            className="flex items-center gap-2 px-3 py-2 border border-ink-200 bg-white text-ink-700 font-body text-sm font-medium rounded-lg hover:bg-ink-50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          {quote.status === 'draft' && (
            <button
              onClick={() => setSendOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-ink-900 text-forge-100 font-body text-sm font-medium rounded-lg hover:bg-ink-800 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          )}
          <button
            onClick={() => setDeleteOpen(true)}
            className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Client info */}
          <div className="bg-white border border-ink-100 rounded-xl p-6">
            <h2 className="font-display text-sm font-semibold text-ink-500 uppercase tracking-wide mb-4">Client</h2>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-forge-100 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-forge-600" />
              </div>
              <div>
                <p className="font-body text-base font-semibold text-ink-900">{quote.client_name}</p>
                <a
                  href={`mailto:${quote.client_email}`}
                  className="font-body text-sm text-forge-600 hover:text-forge-700 transition-colors flex items-center gap-1.5 mt-0.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {quote.client_email}
                </a>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="bg-white border border-ink-100 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-ink-100">
              <h2 className="font-display text-sm font-semibold text-ink-500 uppercase tracking-wide">Line Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink-50">
                    <th className="px-6 py-3 text-left font-body text-xs font-medium text-ink-400 uppercase tracking-wide">Description</th>
                    <th className="px-4 py-3 text-center font-body text-xs font-medium text-ink-400 uppercase tracking-wide">Qty</th>
                    <th className="px-4 py-3 text-right font-body text-xs font-medium text-ink-400 uppercase tracking-wide">Unit Price</th>
                    <th className="px-6 py-3 text-right font-body text-xs font-medium text-ink-400 uppercase tracking-wide">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {quote.line_items?.map((item, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 font-body text-sm text-ink-800">{item.description}</td>
                      <td className="px-4 py-4 text-center font-body text-sm text-ink-600">{item.quantity}</td>
                      <td className="px-4 py-4 text-right font-mono text-sm text-ink-600">
                        {formatCurrency(item.unit_price, quote.currency)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm font-medium text-ink-900">
                        {formatCurrency(item.quantity * item.unit_price, quote.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-ink-100 bg-forge-50/50">
                    <td colSpan={3} className="px-6 py-4 text-right font-body text-sm font-semibold text-ink-700">
                      Total
                    </td>
                    <td className="px-6 py-4 text-right font-display text-lg font-bold text-ink-900">
                      {formatCurrency(subtotal, quote.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="bg-white border border-ink-100 rounded-xl p-6">
              <h2 className="font-display text-sm font-semibold text-ink-500 uppercase tracking-wide mb-3">Notes</h2>
              <p className="font-body text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quote meta */}
          <div className="bg-white border border-ink-100 rounded-xl p-5">
            <h2 className="font-display text-sm font-semibold text-ink-500 uppercase tracking-wide mb-4">Details</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-ink-400 shrink-0" />
                <div>
                  <p className="font-body text-xs text-ink-400">Status</p>
                  <StatusBadge status={quote.status} />
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-ink-400 shrink-0" />
                <div>
                  <p className="font-body text-xs text-ink-400">Created</p>
                  <p className="font-body text-sm text-ink-800">{formatDate(quote.created_at)}</p>
                </div>
              </div>
              {quote.valid_until && (
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-ink-400 shrink-0" />
                  <div>
                    <p className="font-body text-xs text-ink-400">Valid Until</p>
                    <p className="font-body text-sm text-ink-800">{formatDate(quote.valid_until)}</p>
                  </div>
                </div>
              )}
              {quote.sent_at && (
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4 text-ink-400 shrink-0" />
                  <div>
                    <p className="font-body text-xs text-ink-400">Sent</p>
                    <p className="font-body text-sm text-ink-800">{formatDate(quote.sent_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Total card */}
          <div className="bg-ink-900 rounded-xl p-5">
            <p className="font-body text-xs text-ink-400 uppercase tracking-wide mb-1">Quote Total</p>
            <p className="font-display text-3xl font-bold text-forge-100">
              {formatCurrency(subtotal, quote.currency)}
            </p>
            <p className="font-body text-xs text-ink-400 mt-1">{quote.currency}</p>
          </div>

          {/* Actions */}
          {quote.status === 'draft' && (
            <button
              onClick={() => setSendOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-forge-500 text-white font-body text-sm font-medium rounded-xl hover:bg-forge-600 transition-colors"
            >
              <Send className="w-4 h-4" />
              Send to Client
            </button>
          )}
        </div>
      </div>

      {/* Send dialog */}
      {sendOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={() => setSendOpen(false)} />
          <div className="relative bg-white rounded-xl border border-ink-200 shadow-xl w-full max-w-md p-6 animate-fade-up">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-1">Send Quote</h2>
            <p className="font-body text-sm text-ink-500 mb-4">
              This will email the quote to <strong>{quote.client_email}</strong>.
            </p>
            <div className="mb-4">
              <label className="block font-body text-xs font-medium text-ink-700 mb-1.5 uppercase tracking-wide">
                Personal message (optional)
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Hi, please find your quote attached…"
                rows={3}
                className="auth-input resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSendOpen(false)}
                className="flex-1 py-2.5 border border-ink-200 rounded-lg font-body text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 py-2.5 bg-ink-900 text-forge-100 rounded-lg font-body text-sm font-medium hover:bg-ink-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <><span className="w-4 h-4 border-2 border-forge-300 border-t-transparent rounded-full animate-spin" /> Sending…</>
                ) : (
                  <><Send className="w-4 h-4" /> Send Quote</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this quote?"
        description="This cannot be undone. The quote and all line items will be permanently removed."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  )
}