import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { quotesRouter } from './routes/quotes.js'
import { emailRouter } from './routes/email.js'
import { profilesRouter } from './routes/profiles.js'
import { errorHandler } from './middleware/errorHandler.js'
import { requireAuth } from './middleware/requireAuth.js'

const app = express()
const PORT = process.env.PORT || 4000

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'quoteforge-api', timestamp: new Date().toISOString() })
})

// ── Routes ──────────────────────────────────────────────────
app.use('/api/profiles', requireAuth, profilesRouter)
app.use('/api/quotes',   requireAuth, quotesRouter)
app.use('/api/email',    requireAuth, emailRouter)

// ── Error handler (must be last) ────────────────────────────
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🔥 QuoteForge API running on http://localhost:${PORT}`)
})
