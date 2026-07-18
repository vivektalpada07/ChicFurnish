import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { type, data } = await req.json()

    let subject = ''
    let html = ''

    if (type === 'viewing') {
      subject = `New Viewing Request — ${data.listing_name}`
      html = `
        <h2>New Viewing Request</h2>
        <p><strong>Item:</strong> ${data.listing_name}</p>
        <p><strong>Customer:</strong> ${data.customer_name}</p>
        <p><strong>Email:</strong> ${data.customer_email}</p>
        <p><strong>Phone:</strong> ${data.customer_phone || '—'}</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Time:</strong> ${data.time}</p>
        <br>
        <p><a href="https://chic-style-website.vercel.app/admin/bookings">View in Admin Dashboard →</a></p>
      `
    } else if (type === 'staging') {
      subject = `New Staging Request — ${data.service}`
      html = `
        <h2>New Staging Booking Request</h2>
        <p><strong>Service:</strong> ${data.service}</p>
        <p><strong>Customer:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || '—'}</p>
        <p><strong>Address:</strong> ${data.address}</p>
        <p><strong>Preferred Date:</strong> ${data.date}</p>
        <p><strong>Notes:</strong> ${data.notes || '—'}</p>
        <br>
        <p><a href="https://chic-style-website.vercel.app/admin/quotes">View in Admin Dashboard →</a></p>
      `
    } else if (type === 'enquiry') {
      subject = `New Enquiry — ${data.subject || 'General'}`
      html = `
        <h2>New Customer Enquiry</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || '—'}</p>
        <p><strong>Subject:</strong> ${data.subject || '—'}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message}</p>
      `
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Chic Furnish <onboarding@resend.dev>',
        to: ['vivektalpada769@gmail.com'],
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      console.error('Resend error:', err)
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
