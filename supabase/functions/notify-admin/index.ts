import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FROM = 'Chic Furnish <onboarding@resend.dev>'
const ADMIN_EMAIL = 'vivektalpada769@gmail.com'

async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  const body: Record<string, unknown> = { from: FROM, to: [to], subject, html }
  if (replyTo) body.reply_to = replyTo
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) console.error('Resend error:', await res.json())
}

const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0ebe3;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <!-- Header -->
        <tr>
          <td align="center" style="background:#1a3a5c;padding:32px 40px 24px;">
            <p style="margin:0;font-size:20px;letter-spacing:0.25em;color:#f8f4ee;font-weight:300;text-transform:uppercase;">
              CHIC <span style="color:#f0a070;font-weight:600;">FURNISH</span>
            </p>
            <p style="margin:6px 0 0;font-size:10px;letter-spacing:0.3em;color:rgba(214,232,245,0.6);text-transform:uppercase;">
              Luxury Staging &amp; Furniture · Auckland, NZ
            </p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px 48px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8f4ee;border-top:1px solid #d6e8f5;padding:20px 48px;">
            <p style="margin:0;font-size:11px;color:#8aabb8;text-align:center;line-height:1.6;">
              Chic Furnish · Auckland, New Zealand<br>
              <a href="https://chic-style-website.vercel.app" style="color:#c04a1a;text-decoration:none;">chic-style-website.vercel.app</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { type, data } = await req.json()

    // ── ADMIN NOTIFICATIONS ──────────────────────────────────
    if (type === 'viewing') {
      await sendEmail(ADMIN_EMAIL, `New Viewing Request — ${data.listing_name}`, emailWrapper(`
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c04a1a;font-weight:700;">New Request</p>
        <h1 style="margin:0 0 24px;font-size:26px;color:#0f1e2e;font-weight:300;">Viewing Request</h1>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${[
            ['Item', data.listing_name],
            ['Customer', data.customer_name],
            ['Email', data.customer_email],
            ['Phone', data.customer_phone || '—'],
            ['Date', data.date],
            ['Time', data.time],
          ].map(([k,v]) => `
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #eef5fb;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#4a5e72;font-weight:700;width:40%;">${k}</td>
              <td style="padding:8px 0;border-bottom:1px solid #eef5fb;font-size:14px;color:#0f1e2e;font-weight:500;">${v}</td>
            </tr>`).join('')}
        </table>
        <div style="margin-top:28px;">
          <a href="https://chic-style-website.vercel.app/admin/bookings" style="background:#1a3a5c;color:#f0d8c8;padding:12px 28px;text-decoration:none;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;">
            View in Dashboard →
          </a>
        </div>
      `))
    }

    else if (type === 'staging') {
      await sendEmail(ADMIN_EMAIL, `New Staging Request — ${data.service}`, emailWrapper(`
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c04a1a;font-weight:700;">New Request</p>
        <h1 style="margin:0 0 24px;font-size:26px;color:#0f1e2e;font-weight:300;">Staging Booking</h1>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${[
            ['Service', data.service],
            ['Customer', data.name],
            ['Email', data.email],
            ['Phone', data.phone || '—'],
            ['Address', data.address],
            ['Preferred Date', data.date],
            ['Notes', data.notes || '—'],
          ].map(([k,v]) => `
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #eef5fb;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#4a5e72;font-weight:700;width:40%;">${k}</td>
              <td style="padding:8px 0;border-bottom:1px solid #eef5fb;font-size:14px;color:#0f1e2e;font-weight:500;">${v}</td>
            </tr>`).join('')}
        </table>
        <div style="margin-top:28px;">
          <a href="https://chic-style-website.vercel.app/admin/quotes" style="background:#1a3a5c;color:#f0d8c8;padding:12px 28px;text-decoration:none;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;">
            View in Dashboard →
          </a>
        </div>
      `))
    }

    else if (type === 'enquiry') {
      const customerEmail = data.customer_email || data.email
      const customerName = data.customer_name || data.name
      const itemName = data.listing_name || 'item'

      // 1. Notify admin — reply-to customer so admin can reply directly from inbox
      await sendEmail(ADMIN_EMAIL, `New Enquiry: ${itemName} — from ${customerName}`, emailWrapper(`
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c04a1a;font-weight:700;">New Item Enquiry</p>
        <h1 style="margin:0 0 8px;font-size:26px;color:#0f1e2e;font-weight:300;">Customer Question</h1>
        <p style="margin:0 0 24px;font-size:14px;color:#4a5e72;line-height:1.7;">
          Hit <strong>Reply</strong> in your email app to respond directly to ${customerName}.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          ${[
            ['From', customerName],
            ['Email', customerEmail],
            ['About', itemName],
            ['Price', data.listing_price ? `$${Number(data.listing_price).toLocaleString()} NZD` : '—'],
          ].map(([k,v]) => `
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #eef5fb;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#4a5e72;font-weight:700;width:40%;">${k}</td>
              <td style="padding:8px 0;border-bottom:1px solid #eef5fb;font-size:14px;color:#0f1e2e;font-weight:500;">${v}</td>
            </tr>`).join('')}
        </table>
        <div style="background:#f8f4ee;border-left:4px solid #1a3a5c;padding:16px 20px;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#4a5e72;font-weight:700;">Message</p>
          <p style="margin:0;font-size:14px;color:#0f1e2e;line-height:1.7;">${data.message}</p>
        </div>
      `), customerEmail)

      // 2. Confirm to customer — reply-to admin so customer can reply directly from inbox
      await sendEmail(customerEmail, `We received your question about ${itemName}`, emailWrapper(`
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c04a1a;font-weight:700;">Question Received</p>
        <h1 style="margin:0 0 8px;font-size:26px;color:#0f1e2e;font-weight:300;">Thanks, ${customerName}!</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#4a5e72;line-height:1.7;">
          We've received your question about <strong>${itemName}</strong> and will reply within 24 hours.<br>
          You can also <strong>reply directly to this email</strong> if you have anything to add.
        </p>
        <div style="background:#f8f4ee;border-left:4px solid #1a3a5c;padding:16px 20px;margin-bottom:28px;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#4a5e72;font-weight:700;">Your question</p>
          <p style="margin:0;font-size:14px;color:#0f1e2e;line-height:1.7;font-style:italic;">"${data.message}"</p>
        </div>
        ${data.listing_price ? `
        <div style="background:#eef5fb;border:1.5px solid #d6e8f5;padding:16px 20px;margin-bottom:28px;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#4a5e72;font-weight:700;">${itemName}</p>
          <p style="margin:0;font-size:18px;color:#c04a1a;font-weight:700;">$${Number(data.listing_price).toLocaleString()} NZD</p>
        </div>` : ''}
        <a href="https://chic-style-website.vercel.app/shop" style="background:#1a3a5c;color:#f0d8c8;padding:12px 28px;text-decoration:none;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;display:inline-block;">
          Browse More Furniture →
        </a>
      `), ADMIN_EMAIL)
    }

    else if (type === 'enquiry-reply') {
      // Admin replied — email the customer, reply-to goes back to admin inbox
      await sendEmail(data.customer_email, `Re: Your question about ${data.listing_name}`, emailWrapper(`
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c04a1a;font-weight:700;">Reply from Chic Furnish</p>
        <h1 style="margin:0 0 8px;font-size:26px;color:#0f1e2e;font-weight:300;">We've answered your question</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#4a5e72;line-height:1.7;">Hi ${data.customer_name}, here's our reply to your enquiry about <strong>${data.listing_name}</strong>.</p>

        <div style="background:#f8f4ee;border:1.5px solid #d6e8f5;border-left:4px solid #1a3a5c;padding:20px 24px;margin-bottom:20px;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#4a5e72;font-weight:700;">Your question</p>
          <p style="margin:0;font-size:14px;color:#4a5e72;line-height:1.7;font-style:italic;">"${data.message}"</p>
        </div>

        <div style="background:#eef5fb;border:1.5px solid #b8d8f0;border-left:4px solid #c04a1a;padding:20px 24px;margin-bottom:28px;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#c04a1a;font-weight:700;">Our reply</p>
          <p style="margin:0;font-size:15px;color:#0f1e2e;line-height:1.8;">${data.reply}</p>
        </div>

        ${data.listing_price ? `
        <div style="background:#f8f4ee;border:1.5px solid #d6e8f5;padding:16px 20px;margin-bottom:28px;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#4a5e72;font-weight:700;">${data.listing_name}</p>
          <p style="margin:0;font-size:18px;color:#c04a1a;font-weight:700;">$${Number(data.listing_price).toLocaleString()} NZD</p>
        </div>` : ''}

        <p style="margin:0 0 24px;font-size:13px;color:#4a5e72;line-height:1.7;">
          Have more questions? Simply reply to this email and we'll get back to you.
        </p>
        <a href="https://chic-style-website.vercel.app/shop" style="background:#1a3a5c;color:#f0d8c8;padding:12px 28px;text-decoration:none;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;display:inline-block;">
          View Item in Shop →
        </a>
      `), ADMIN_EMAIL)
    }

    // ── CUSTOMER CONFIRMATION EMAILS ─────────────────────────
    else if (type === 'viewing-confirmed') {
      await sendEmail(data.customer_email, `Your viewing is confirmed — ${data.listing_name}`, emailWrapper(`
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c04a1a;font-weight:700;">Booking Confirmed</p>
        <h1 style="margin:0 0 8px;font-size:26px;color:#0f1e2e;font-weight:300;">Your Viewing is Confirmed</h1>
        <p style="margin:0 0 28px;font-size:15px;color:#4a5e72;line-height:1.7;">Hi ${data.customer_name}, we're looking forward to seeing you. Here are your booking details:</p>

        <!-- Product Box -->
        <div style="background:#f8f4ee;border:1.5px solid #d6e8f5;border-left:4px solid #1a3a5c;padding:20px 24px;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#4a5e72;font-weight:700;">Furniture Item</p>
          <p style="margin:0;font-size:20px;color:#0f1e2e;font-weight:600;">${data.listing_name}</p>
          ${data.listing_price ? `<p style="margin:4px 0 0;font-size:15px;color:#c04a1a;font-weight:700;">$${Number(data.listing_price).toLocaleString()}</p>` : ''}
          ${data.listing_description ? `<p style="margin:8px 0 0;font-size:13px;color:#4a5e72;line-height:1.6;">${data.listing_description}</p>` : ''}
        </div>

        <!-- Booking Details -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          ${[
            ['Date', data.date],
            ['Time', data.time],
            ['Location', 'Auckland, New Zealand'],
            ['Booking ID', data.id],
          ].map(([k,v]) => `
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #eef5fb;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#4a5e72;font-weight:700;width:40%;">${k}</td>
              <td style="padding:10px 0;border-bottom:1px solid #eef5fb;font-size:14px;color:#0f1e2e;font-weight:500;">${v}</td>
            </tr>`).join('')}
        </table>

        <p style="margin:0 0 24px;font-size:13px;color:#4a5e72;line-height:1.7;">
          Please arrive a few minutes early. If you need to reschedule, reply to this email or contact us directly.
        </p>

        <a href="https://chic-style-website.vercel.app/shop" style="background:#1a3a5c;color:#f0d8c8;padding:12px 28px;text-decoration:none;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;display:inline-block;">
          Browse More Furniture →
        </a>
      `))
    }

    else if (type === 'viewing-declined') {
      await sendEmail(data.customer_email, `Update on your viewing request — ${data.listing_name}`, emailWrapper(`
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c04a1a;font-weight:700;">Booking Update</p>
        <h1 style="margin:0 0 8px;font-size:26px;color:#0f1e2e;font-weight:300;">Viewing Request Update</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#4a5e72;line-height:1.7;">
          Hi ${data.customer_name}, unfortunately we're unable to accommodate your viewing request for <strong>${data.listing_name}</strong> on ${data.date} at ${data.time}.
        </p>
        <p style="margin:0 0 28px;font-size:15px;color:#4a5e72;line-height:1.7;">
          Please feel free to browse our other available pieces or contact us to arrange an alternative time.
        </p>
        <a href="https://chic-style-website.vercel.app/shop" style="background:#1a3a5c;color:#f0d8c8;padding:12px 28px;text-decoration:none;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;display:inline-block;">
          Browse Furniture →
        </a>
      `))
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
