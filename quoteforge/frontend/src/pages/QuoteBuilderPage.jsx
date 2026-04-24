import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuotesStore } from '../store/quotesStore'
import { api } from '../lib/api'
import { formatCurrency, cn } from '../lib/utils'
import { toast } from 'react-hot-toast'
import {
  Plus, Trash2, ArrowLeft, Save, Send,
  ChevronDown, GripVertical
} from 'lucide-react'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'CAD', 'AUD']

const EMPTY_LINE_ITEM = { description: '', quantity: 1, unit_price: 0 }

export default function QuoteBuilderPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { createQuote, updateQuote } = useQuotesStore()

  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [form, setForm] = useState({
    title: '',
    client_name: '',
    client_email: '',
    currency: 'USD',
    valid_until: '',
    notes: '',
  })
  const [lineItems, setLineItems] = useState([{ ...EMPTY_LINE_ITEM }])

  // Load existing quote if editing
  useEffect(() => {
    if (!isEdit) return
    const load = async () => {
      try {
        const data = await api.get(`/api/quotes/${id}`)
        setForm({
          title: data.title,
          client_name: data.client_name,
          client_email: data.client_email,
          currency: data.currency,
          valid_until: data.valid_until ? data.valid_until.split('T')[0] : '',
          notes: data.notes || '',
        })
        setLineItems(data.line_items?.length ? data.line_items : [{ ...EMPTY_LINE_ITEM }])
      } catch (e) {
        toast.error('Failed to load quote.')
        navigate('/quotes')
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [id, isEdit, navigate])

  const handleFormChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleLineItemChange = (index, field, value) => {
    setLineItems(items =>
      items.map((item, i) =>
        i === index ? { ...item, [field]: field === 'description' ? value : Number(value) } : item
      )
    )
  }

  const addLineItem = () => setLineItems(items => [...items, { ...EMPTY_LINE_ITEM }])

  const removeLineItem = (index) => {
    if (lineItems.length === 1) return toast.error('At least one line item is required.')
    setLineItems(items => items.filter((_, i) => i !== index))
  }

  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)

  const validate = () => {
    if (!form.title.trim()) return 'Quote title is required.'
    if (!form.client_name.trim()) return 'Client name is required.'
    if (!form.client_email.trim()) return 'Client email is required.'
    if (!/\S+@\S+\.\S+/.test(form.client_email)) return 'Client email is invalid.'
    if (lineItems.some(i => !i.description.trim())) return 'All line items need a description.'
    if (lineItems.some(i => i.quantity <= 0)) return 'Quantity must be greater than 0.'
    return null
  }

  const handleSave = async (andSend = false) => {
    const err = validate()
    if (err) return toast.error(err)

    setLoading(true)
    try {
      const payload = {
        ...form,
        valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
        line_items: lineItems.map(({ description, quantity, unit_price }) => ({
          description, quantity: Number(quantity), unit_price: Number(unit_price)
        })),
      }

      let quote
      if (isEdit) {
        quote = await updateQuote(id, payload)
      } else {
        quote = await createQuote(payload)
      }

      toast.success(isEdit ? 'Quote updated!' : 'Quote created!')

      if (andSend) {
        navigate(`/quotes/${quote.id}?send=true`)
      } else {
        navigate(`/quotes/${quote.id}`)
      }
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/quotes')}
            className="p-2 rounded-lg hover:bg-ink-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-ink-600" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900">
              {isEdit ? 'Edit Quote' : 'New Quote'}
            </h1>
            <p className="font-body text-sm text-ink-400 mt-0.5">
              {isEdit ? 'Update quote details below.' : 'Fill in the details to create a quote.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 border border-ink-200 bg-white text-ink-700 font-body text-sm font-medium rounded-lg hover:bg-ink-50 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save Draft</span>
          </button>
          {!isEdit && (
            <button
              onClick={() => handleSave(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-ink-900 text-forge-100 font-body text-sm font-medium rounded-lg hover:bg-ink-800 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Save & Send</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">

          {/* Quote details */}
          <div className="bg-white border border-ink-100 rounded-xl p-6">
            <h2 className="font-display text-base font-semibold text-ink-900 mb-4">Quote Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-body text-xs font-medium text-ink-700 mb-1.5 uppercase tracking-wide">
                  Quote Title <span className="text-red-400">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Website Redesign Project"
                  className="auth-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-xs font-medium text-ink-700 mb-1.5 uppercase tracking-wide">
                    Currency
                  </label>
                  <div className="relative">
                    <select
                      name="currency"
                      value={form.currency}
                      onChange={handleFormChange}
                      className="auth-input appearance-none pr-8"
                    >
                      {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block font-body text-xs font-medium text-ink-700 mb-1.5 uppercase tracking-wide">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    name="valid_until"
                    value={form.valid_until}
                    onChange={handleFormChange}
                    className="auth-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Client details */}
          <div className="bg-white border border-ink-100 rounded-xl p-6">
            <h2 className="font-display text-base font-semibold text-ink-900 mb-4">Client Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-body text-xs font-medium text-ink-700 mb-1.5 uppercase tracking-wide">
                  Client Name <span className="text-red-400">*</span>
                </label>
                <input
                  name="client_name"
                  value={form.client_name}
                  onChange={handleFormChange}
                  placeholder="e.g. Acme Corp"
                  className="auth-input"
                />
              </div>
              <div>
                <label className="block font-body text-xs font-medium text-ink-700 mb-1.5 uppercase tracking-wide">
                  Client Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="client_email"
                  value={form.client_email}
                  onChange={handleFormChange}
                  placeholder="client@company.com"
                  className="auth-input"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white border border-ink-100 rounded-xl p-6">
            <h2 className="font-display text-base font-semibold text-ink-900 mb-4">Line Items</h2>

            {/* Header row */}
            <div className="hidden sm:grid grid-cols-12 gap-3 mb-2 px-1">
              <div className="col-span-6 font-body text-xs font-medium text-ink-400 uppercase tracking-wide">Description</div>
              <div className="col-span-2 font-body text-xs font-medium text-ink-400 uppercase tracking-wide">Qty</div>
              <div className="col-span-3 font-body text-xs font-medium text-ink-400 uppercase tracking-wide">Unit Price</div>
              <div className="col-span-1" />
            </div>

            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-center group">
                  <div className="col-span-12 sm:col-span-6">
                    <input
                      value={item.description}
                      onChange={e => handleLineItemChange(index, 'description', e.target.value)}
                      placeholder="Item description…"
                      className="auth-input text-sm"
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={e => handleLineItemChange(index, 'quantity', e.target.value)}
                      min="0.01"
                      step="0.01"
                      className="auth-input text-sm"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={e => handleLineItemChange(index, 'unit_price', e.target.value)}
                      min="0"
                      step="0.01"
                      className="auth-input text-sm"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => removeLineItem(index)}
                      className="p-1.5 rounded-lg text-ink-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* Row total */}
                  <div className="col-span-12 sm:hidden -mt-2 mb-1 px-1">
                    <span className="font-body text-xs text-ink-400">
                      Subtotal: {formatCurrency(item.quantity * item.unit_price, form.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addLineItem}
              className="mt-4 flex items-center gap-2 font-body text-sm text-forge-600 hover:text-forge-700 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add line item
            </button>
          </div>

          {/* Notes */}
          <div className="bg-white border border-ink-100 rounded-xl p-6">
            <h2 className="font-display text-base font-semibold text-ink-900 mb-4">Notes</h2>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleFormChange}
              placeholder="Add any notes, terms, or payment details for the client…"
              rows={4}
              className="auth-input resize-none"
            />
          </div>
        </div>

        {/* Sidebar — summary */}
        <div className="space-y-4">
          <div className="bg-white border border-ink-100 rounded-xl p-5 sticky top-6">
            <h2 className="font-display text-base font-semibold text-ink-900 mb-4">Summary</h2>

            <div className="space-y-2 mb-4">
              {lineItems.map((item, i) => (
                item.description && (
                  <div key={i} className="flex items-start justify-between gap-2">
                    <span className="font-body text-sm text-ink-600 truncate flex-1">{item.description}</span>
                    <span className="font-mono text-sm text-ink-800 shrink-0">
                      {formatCurrency(item.quantity * item.unit_price, form.currency)}
                    </span>
                  </div>
                )
              ))}
            </div>

            <div className="border-t border-ink-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm font-medium text-ink-700">Total</span>
                <span className="font-display text-xl font-bold text-ink-900">
                  {formatCurrency(subtotal, form.currency)}
                </span>
              </div>
              {form.currency !== 'USD' && (
                <p className="font-body text-xs text-ink-400 mt-1 text-right">{form.currency}</p>
              )}
            </div>

            <div className="mt-6 space-y-2">
              <button
                onClick={() => handleSave(false)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-ink-200 bg-white text-ink-700 font-body text-sm font-medium rounded-lg hover:bg-ink-50 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving…' : 'Save Draft'}
              </button>
              {!isEdit && (
                <button
                  onClick={() => handleSave(true)}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-ink-900 text-forge-100 font-body text-sm font-medium rounded-lg hover:bg-ink-800 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Save & Send
                </button>
              )}
            </div>

            {form.client_name && (
              <div className="mt-4 pt-4 border-t border-ink-100">
                <p className="font-body text-xs text-ink-400 mb-1">Sending to</p>
                <p className="font-body text-sm font-medium text-ink-800">{form.client_name}</p>
                {form.client_email && (
                  <p className="font-body text-xs text-ink-400 truncate">{form.client_email}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}