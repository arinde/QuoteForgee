import { Router } from 'express'
import { supabaseForUser } from '../lib/supabase.js'

export const profilesRouter = Router()

// GET /api/profiles/me
profilesRouter.get('/me', async (req, res, next) => {
  try {
    const db = supabaseForUser(req.accessToken)
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})

// PATCH /api/profiles/me
profilesRouter.patch('/me', async (req, res, next) => {
  try {
    const { full_name, company_name, avatar_url } = req.body
    const db = supabaseForUser(req.accessToken)

    const { data, error } = await db
      .from('profiles')
      .update({ full_name, company_name, avatar_url, updated_at: new Date().toISOString() })
      .eq('id', req.user.id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})
