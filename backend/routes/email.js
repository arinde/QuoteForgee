import { Router } from 'express'
import { z } from 'zod'
import { resend, FROM_EMAIL } from '../lib/resend.js'
import { supabaseForUser } from '../lib/supabase.js'

export const emailRouter = Router()

const sendQuoteSchema = z.object({
  quote_id: z.string().uuid(),
  message: z.string().optional(),
})

// POST /api/email/send-quote
emailRouter.post('/send-quote', async (req, res, next) => {
  try {
    const parsed = sendQuoteSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() })
    }

    const db = supabaseForUser(req.accessToken)

    // Fetch the quote
    const { data: quote, error: quoteError } = await db
      .from('quotes')
      .select('*, line_items(*), profiles(full_name, company_name)')
      .eq('id', parsed.data.quote_id)
      .eq('user_id', req.user.id)
      .single()

    if (quoteError || !quote) {
      return res.status(404).json({ error: 'Quote not found.' })
    }

    const senderName = quote.profiles?.full_name || 'Your contact'
    const companyName = quote.profiles?.company_name || 'QuoteForge'
    const quoteUrl = `${process.env.FRONTEND_URL}/quotes/${quote.id}/view`

    const html = buildQuoteEmail({ quote, senderName, companyName, quoteUrl, message: parsed.data.message })

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: quote.client_email,
      subject: `Quote from ${companyName}: ${quote.title}`,
      html,
      reply_to: req.user.email,
    })

    if (emailError) throw new Error(emailError.message)

    // Update quote status to 'sent'
    await db
      .from('quotes')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', quote.id)

    res.json({ success: true, email_id: emailData.id })
  } catch (err) {
    next(err)
  }
})

function buildQuoteEmail({ quote, senderName, companyName, quoteUrl, message }) {
  const rows = quote.line_items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e8e8de;font-size:14px;color:#3c3c34">${item.description}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e8e8de;font-size:14px;color:#3c3c34;text-align:center">${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e8e8de;font-size:14px;color:#3c3c34;text-align:right">$${item.unit_price.toFixed(2)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e8e8de;font-size:14px;color:#3c3c34;text-align:right">$${(item.quantity * item.unit_price).toFixed(2)}</td>
      </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fdfaf4;font-family:'DM Sans',Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border:1px solid #e8e8de;border-radius:12px;overflow:hidden">
    <div style="background:#1e1e18;padding:28px 32px;display:flex;align-items:center;gap:8px">
      <span style="font-size:18px;font-weight:600;color:#f9f0dc;letter-spacing:-0.3px">⚡ QuoteForge</span>
    </div>
    <div style="padding:32px">
      <p style="font-size:15px;color:#3c3c34;margin:0 0 8px">Hi ${quote.client_name},</p>
      <p style="font-size:15px;color:#3c3c34;margin:0 0 24px">
        ${message || `${senderName} from ${companyName} has sent you a quote.`}
      </p>
      <div style="background:#f9f0dc;border-radius:8px;padding:16px 20px;margin-bottom:24px">
        <p style="font-size:13px;color:#82826a;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.05em">Quote</p>
        <p style="font-size:20px;font-weight:700;color:#1e1e18;margin:0">${quote.title}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <thead>
          <tr>
            <th style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#82826a;text-align:left;padding-bottom:8px;border-bottom:2px solid #e8e8de">Item</th>
            <th style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#82826a;text-align:center;padding-bottom:8px;border-bottom:2px solid #e8e8de">Qty</th>
            <th style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#82826a;text-align:right;padding-bottom:8px;border-bottom:2px solid #e8e8de">Unit</th>
            <th style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#82826a;text-align:right;padding-bottom:8px;border-bottom:2px solid #e8e8de">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding-top:12px;font-size:14px;font-weight:600;color:#1e1e18;text-align:right">Total</td>
            <td style="padding-top:12px;font-size:16px;font-weight:700;color:#1e1e18;text-align:right">$${quote.total_amount.toFixed(2)} ${quote.currency}</td>
          </tr>
        </tfoot>
      </table>
      <a href="${quoteUrl}" style="display:inline-block;background:#1e1e18;color:#f9f0dc;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">
        View Full Quote →
      </a>
      ${quote.valid_until ? `<p style="font-size:12px;color:#82826a;margin-top:16px">This quote is valid until ${new Date(quote.valid_until).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.</p>` : ''}
    </div>
    <div style="padding:16px 32px;border-top:1px solid #e8e8de;background:#f9f0dc">
      <p style="font-size:12px;color:#82826a;margin:0">Sent via <strong>QuoteForge</strong> · <a href="${process.env.FRONTEND_URL}" style="color:#a87518;text-decoration:none">quoteforge.co</a></p>
    </div>
  </div>
</body>
</html>`
}
