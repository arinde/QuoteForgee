import { Router } from 'express'
import { z } from 'zod'
import { supabaseForUser } from '../lib/supabase.js'

export const quotesRouter = Router()

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unit_price: z.number().nonnegative(),
})

const quoteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  client_name: z.string().min(1, 'Client name is required'),
  client_email: z.string().email('Invalid client email'),
  currency: z.string().length(3).default('USD'),
  valid_until: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
  line_items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
})

// GET /api/quotes — list all quotes for the user
quotesRouter.get('/', async (req, res, next) => {
  try {
    const db = supabaseForUser(req.accessToken)
    const { status, search } = req.query

    let query = db
      .from('quotes')
      .select('id, title, client_name, client_email, total_amount, currency, status, created_at, valid_until')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error } = await query
    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})

// GET /api/quotes/:id — single quote with line items
quotesRouter.get('/:id', async (req, res, next) => {
  try {
    const db = supabaseForUser(req.accessToken)
    const { data, error } = await db
      .from('quotes')
      .select('*, line_items(*)')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Quote not found.' })
    res.json(data)
  } catch (err) {
    next(err)
  }
})

// POST /api/quotes — create a quote
quotesRouter.post('/', async (req, res, next) => {
  try {
    const parsed = quoteSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() })
    }

    const { line_items, ...quoteData } = parsed.data
    const total_amount = line_items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    )

    const db = supabaseForUser(req.accessToken)

    // Insert quote
    const { data: quote, error: quoteError } = await db
      .from('quotes')
      .insert({ ...quoteData, user_id: req.user.id, total_amount, status: 'draft' })
      .select()
      .single()

    if (quoteError) throw quoteError

    // Insert line items
    const { data: items, error: itemsError } = await db
      .from('line_items')
      .insert(line_items.map((item) => ({ ...item, quote_id: quote.id })))
      .select()

    if (itemsError) throw itemsError

    res.status(201).json({ ...quote, line_items: items })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/quotes/:id — update a quote
quotesRouter.patch('/:id', async (req, res, next) => {
  try {
    const db = supabaseForUser(req.accessToken)
    const allowed = ['title', 'client_name', 'client_email', 'currency', 'valid_until', 'notes', 'status']
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    )

    const { data, error } = await db
      .from('quotes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Quote not found.' })
    res.json(data)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/quotes/:id
quotesRouter.delete('/:id', async (req, res, next) => {
  try {
    const db = supabaseForUser(req.accessToken)
    const { error } = await db
      .from('quotes')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)

    if (error) throw error
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
