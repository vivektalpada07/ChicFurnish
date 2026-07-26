import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FROM = 'Chic Furnish <noreply@chicfurnish.resend.dev>'
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

      const mailtoReply = `mailto:${customerEmail}?subject=Re%3A%20Your%20question%20about%20${encodeURIComponent(itemName)}`
      const priceTag = data.listing_price ? `$${Number(data.listing_price).toLocaleString()} NZD` : null

      // 1. Notify admin — attractive email with Reply button, reply-to set to customer
      await sendEmail(ADMIN_EMAIL, `💬 New Enquiry: ${itemName} — ${customerName}`, emailWrapper(`
        <!-- Alert banner -->
        <div style="background:#c04a1a;margin:-40px -48px 32px;padding:16px 48px;display:flex;align-items:center;gap:12px;">
          <span style="font-size:22px;">💬</span>
          <div>
            <p style="margin:0;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.7);font-weight:700;">New Item Enquiry</p>
            <p style="margin:2px 0 0;font-size:15px;color:#fff;font-weight:600;">${customerName} asked about ${itemName}</p>
          </div>
        </div>

        <!-- Customer card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#f8f4ee;border:1.5px solid #d6e8f5;">
          <tr>
            <td style="padding:20px 24px;">
              <p style="margin:0 0 2px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#4a5e72;font-weight:700;">From</p>
              <p style="margin:0;font-size:18px;color:#0f1e2e;font-weight:600;">${customerName}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#c04a1a;font-weight:500;">${customerEmail}</p>
            </td>
            ${priceTag ? `<td style="padding:20px 24px;border-left:1px solid #d6e8f5;text-align:right;">
              <p style="margin:0 0 2px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#4a5e72;font-weight:700;">Item Price</p>
              <p style="margin:0;font-size:22px;color:#1a3a5c;font-weight:700;">${priceTag}</p>
              <p style="margin:4px 0 0;font-size:12px;color:#4a5e72;">${itemName}</p>
            </td>` : ''}
          </tr>
        </table>

        <!-- Message bubble -->
        <div style="background:#fff;border:1.5px solid #d6e8f5;border-left:5px solid #1a3a5c;padding:20px 24px;margin-bottom:28px;border-radius:0 4px 4px 0;">
          <p style="margin:0 0 10px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#4a5e72;font-weight:700;">Their Message</p>
          <p style="margin:0;font-size:16px;color:#0f1e2e;line-height:1.8;font-style:italic;">"${data.message}"</p>
        </div>

        <!-- CTA buttons -->
        <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td style="padding-right:12px;">
              <a href="${mailtoReply}" style="background:#c04a1a;color:#fff;padding:14px 32px;text-decoration:none;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;display:inline-block;">
                ↩ Reply to Customer
              </a>
            </td>
            <td>
              <a href="https://chic-style-website.vercel.app/admin/enquiries" style="background:#1a3a5c;color:#f0d8c8;padding:14px 32px;text-decoration:none;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;display:inline-block;">
                View Dashboard →
              </a>
            </td>
          </tr>
        </table>
        <p style="margin:0;font-size:12px;color:#8aabb8;line-height:1.6;">
          Tip: You can also just hit <strong>Reply</strong> in your email app — it goes straight to ${customerName}.
        </p>
      `), customerEmail)

      // 2. Confirm to customer — reply-to admin so customer can reply directly from inbox
      await sendEmail(customerEmail, `We received your question about ${itemName}`, emailWrapper(`
        <!-- Success banner -->
        <div style="background:#1a3a5c;margin:-40px -48px 32px;padding:20px 48px;text-align:center;">
          <p style="margin:0;font-size:32px;">✉️</p>
          <p style="margin:8px 0 0;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(214,232,245,0.7);font-weight:700;">Question Received</p>
        </div>

        <h1 style="margin:0 0 8px;font-size:28px;color:#0f1e2e;font-weight:300;">Thanks, ${customerName}!</h1>
        <p style="margin:0 0 28px;font-size:15px;color:#4a5e72;line-height:1.8;">
          We've received your question about <strong style="color:#0f1e2e;">${itemName}</strong> and will get back to you within 24 hours.<br><br>
          Simply <strong>reply to this email</strong> if you have anything to add — it comes straight to our team.
        </p>

        <!-- Item card -->
        ${priceTag ? `<div style="background:#f8f4ee;border:1.5px solid #d6e8f5;border-left:5px solid #c04a1a;padding:20px 24px;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#4a5e72;font-weight:700;">Item You Asked About</p>
          <p style="margin:0;font-size:18px;color:#0f1e2e;font-weight:600;">${itemName}</p>
          <p style="margin:6px 0 0;font-size:20px;color:#c04a1a;font-weight:700;">${priceTag}</p>
        </div>` : ''}

        <!-- Their message -->
        <div style="background:#fff;border:1.5px solid #d6e8f5;padding:20px 24px;margin-bottom:28px;">
          <p style="margin:0 0 10px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#4a5e72;font-weight:700;">Your Question</p>
          <p style="margin:0;font-size:15px;color:#0f1e2e;line-height:1.8;font-style:italic;">"${data.message}"</p>
        </div>

        <a href="https://chic-style-website.vercel.app/shop" style="background:#1a3a5c;color:#f0d8c8;padding:14px 32px;text-decoration:none;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;display:inline-block;">
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

    else if (type === 'order') {
      const itemRows = (data.items || []).map((i: {name:string,condition?:string,price:number}) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eef5fb;font-size:14px;color:#0f1e2e;font-weight:500;">${i.name}${i.condition ? ` <span style="color:#4a5e72;font-size:12px;">(${i.condition})</span>` : ''}</td>
          <td style="padding:10px 0;border-bottom:1px solid #eef5fb;font-size:14px;color:#c04a1a;font-weight:700;text-align:right;">$${Number(i.price).toLocaleString()}</td>
        </tr>`).join('')

      const shippingLabel = data.shipping_option === 'pickup' ? 'Click & Collect — Auckland warehouse' : `Deliver to: ${data.street || ''}, ${data.suburb || ''}, ${data.city || ''} ${data.postcode || ''}`
      const paymentLabel = data.payment_method === 'bank' ? 'Bank Transfer — details to follow via email' : data.payment_method === 'cash' ? 'Cash on pickup / delivery' : 'Card — our team will contact you'

      // 1. Admin notification
      await sendEmail(ADMIN_EMAIL, `🛒 New Order ${data.id} — ${data.customer_name}`, emailWrapper(`
        <div style="background:#1a3a5c;margin:-40px -48px 32px;padding:20px 48px;display:flex;align-items:center;gap:16px;">
          <span style="font-size:28px;">🛒</span>
          <div>
            <p style="margin:0;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(214,232,245,0.7);font-weight:700;">New Order Received</p>
            <p style="margin:4px 0 0;font-size:16px;color:#f8f4ee;font-weight:600;">${data.customer_name} · $${Number(data.total).toLocaleString()} NZD</p>
          </div>
        </div>

        <!-- Customer card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#f8f4ee;border:1.5px solid #d6e8f5;">
          <tr>
            <td style="padding:18px 24px;">
              <p style="margin:0 0 2px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#4a5e72;font-weight:700;">Customer</p>
              <p style="margin:0;font-size:18px;color:#0f1e2e;font-weight:600;">${data.customer_name}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#c04a1a;">${data.customer_email}</p>
              ${data.customer_phone ? `<p style="margin:2px 0 0;font-size:13px;color:#4a5e72;">${data.customer_phone}</p>` : ''}
            </td>
            <td style="padding:18px 24px;border-left:1px solid #d6e8f5;text-align:right;vertical-align:top;">
              <p style="margin:0 0 2px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#4a5e72;font-weight:700;">Order Total</p>
              <p style="margin:0;font-size:26px;color:#c04a1a;font-weight:700;">$${Number(data.total).toLocaleString()}</p>
              <p style="margin:2px 0 0;font-size:11px;color:#4a5e72;font-weight:600;">NZD</p>
            </td>
          </tr>
        </table>

        <!-- Items -->
        <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#4a5e72;font-weight:700;">Items Ordered</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          ${itemRows}
          <tr>
            <td style="padding:12px 0;font-family:'Georgia',serif;font-size:16px;color:#0f1e2e;font-weight:600;">Total</td>
            <td style="padding:12px 0;font-family:'Georgia',serif;font-size:20px;color:#c04a1a;font-weight:700;text-align:right;">$${Number(data.total).toLocaleString()} NZD</td>
          </tr>
        </table>

        <!-- Shipping & Payment -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <td style="width:50%;padding:16px;background:#eef5fb;border:1.5px solid #d6e8f5;vertical-align:top;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#4a5e72;font-weight:700;">Shipping</p>
              <p style="margin:0;font-size:13px;color:#0f1e2e;font-weight:600;line-height:1.6;">${shippingLabel}</p>
              ${data.notes ? `<p style="margin:6px 0 0;font-size:12px;color:#4a5e72;font-style:italic;">"${data.notes}"</p>` : ''}
            </td>
            <td style="width:8px;"></td>
            <td style="width:50%;padding:16px;background:#eef5fb;border:1.5px solid #d6e8f5;vertical-align:top;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#4a5e72;font-weight:700;">Payment</p>
              <p style="margin:0;font-size:13px;color:#0f1e2e;font-weight:600;line-height:1.6;">${paymentLabel}</p>
            </td>
          </tr>
        </table>

        <a href="https://chic-style-website.vercel.app/admin/orders" style="background:#c04a1a;color:#fff;padding:14px 32px;text-decoration:none;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;display:inline-block;">
          View Order in Dashboard →
        </a>
      `))

      // 2. Customer confirmation
      await sendEmail(data.customer_email, `Order Confirmed — ${data.id}`, emailWrapper(`
        <div style="background:#1a3a5c;margin:-40px -48px 32px;padding:24px 48px;text-align:center;">
          <p style="margin:0;font-size:36px;">✓</p>
          <p style="margin:8px 0 0;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(214,232,245,0.7);font-weight:700;">Order Placed Successfully</p>
        </div>

        <h1 style="margin:0 0 8px;font-size:28px;color:#0f1e2e;font-weight:300;">Thanks, ${(data.customer_name || '').split(' ')[0]}!</h1>
        <p style="margin:0 0 28px;font-size:15px;color:#4a5e72;line-height:1.8;">
          Your order <strong style="color:#0f1e2e;">${data.id}</strong> has been received. We'll be in touch within 24 hours to confirm everything.
        </p>

        <!-- Items -->
        <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#4a5e72;font-weight:700;">Your Items</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          ${itemRows}
          <tr>
            <td style="padding:12px 0;font-family:'Georgia',serif;font-size:16px;color:#0f1e2e;font-weight:600;">Total</td>
            <td style="padding:12px 0;font-family:'Georgia',serif;font-size:20px;color:#c04a1a;font-weight:700;text-align:right;">$${Number(data.total).toLocaleString()} NZD</td>
          </tr>
        </table>

        <!-- Shipping & Payment boxes -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <td style="width:50%;padding:16px;background:#f8f4ee;border:1.5px solid #d6e8f5;border-left:4px solid #1a3a5c;vertical-align:top;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#4a5e72;font-weight:700;">Shipping</p>
              <p style="margin:0;font-size:13px;color:#0f1e2e;font-weight:600;line-height:1.6;">${shippingLabel}</p>
            </td>
            <td style="width:8px;"></td>
            <td style="width:50%;padding:16px;background:#f8f4ee;border:1.5px solid #d6e8f5;border-left:4px solid #c04a1a;vertical-align:top;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#4a5e72;font-weight:700;">Payment</p>
              <p style="margin:0;font-size:13px;color:#0f1e2e;font-weight:600;line-height:1.6;">${paymentLabel}</p>
            </td>
          </tr>
        </table>

        <p style="margin:0 0 24px;font-size:13px;color:#4a5e72;line-height:1.7;">
          Questions about your order? Reply to this email and our team will get back to you.
        </p>
        <a href="https://chic-style-website.vercel.app/shop" style="background:#1a3a5c;color:#f0d8c8;padding:14px 32px;text-decoration:none;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;display:inline-block;">
          Continue Shopping →
        </a>
      `), ADMIN_EMAIL)
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
