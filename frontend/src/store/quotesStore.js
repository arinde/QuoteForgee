import { create } from 'zustand'
import { api } from '../lib/api'

export const useQuotesStore = create((set, get) => ({
  quotes: [],
  loading: false,
  error: null,

  fetchQuotes: async (filters = {}) => {
    set({ loading: true, error: null })
    try {
      const params = new URLSearchParams(filters).toString()
      const data = await api.get(`/api/quotes${params ? `?${params}` : ''}`)
      set({ quotes: data, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  createQuote: async (payload) => {
    const data = await api.post('/api/quotes', payload)
    set((s) => ({ quotes: [data, ...s.quotes] }))
    return data
  },

  updateQuote: async (id, payload) => {
    const data = await api.patch(`/api/quotes/${id}`, payload)
    set((s) => ({
      quotes: s.quotes.map((q) => (q.id === id ? { ...q, ...data } : q)),
    }))
    return data
  },

  deleteQuote: async (id) => {
    await api.delete(`/api/quotes/${id}`)
    set((s) => ({ quotes: s.quotes.filter((q) => q.id !== id) }))
  },

  sendQuote: async (quoteId, message) => {
    return api.post('/api/email/send-quote', { quote_id: quoteId, message })
  },
}))
