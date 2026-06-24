import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { email } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Generate 6-digit OTP
    const code = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min

    // Store OTP in Supabase (service role bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Delete any old OTPs for this email
    await supabase.from('otp_verifications').delete().eq('email', email.toLowerCase())

    const { error: insertError } = await supabase.from('otp_verifications').insert({
      email: email.toLowerCase(),
      code,
      expires_at: expiresAt,
    })

    if (insertError) throw insertError

    // Send email via Resend
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Verify your email – Chic Furnish</title>
</head>
<body style="margin:0;padding:0;background:#f0ebe3;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ebe3;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td align="center" style="background:#1a3a5c;padding:36px 40px 28px;">
              <p style="margin:0;font-size:22px;letter-spacing:0.25em;color:#f8f4ee;font-weight:300;text-transform:uppercase;">
                CHIC <span style="color:#f0a070;font-weight:600;">FURNISH</span>
              </p>
              <p style="margin:8px 0 0;font-size:11px;letter-spacing:0.3em;color:rgba(214,232,245,0.6);text-transform:uppercase;">
                Luxury Staging &amp; Furniture
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:48px 48px 40px;">
              <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#c04a1a;font-weight:600;">
                Email Verification
              </p>
              <h1 style="margin:0 0 20px;font-size:28px;color:#0f1e2e;font-weight:300;line-height:1.3;">
                Your verification code
              </h1>
              <p style="margin:0 0 32px;font-size:15px;color:#4a5e72;line-height:1.7;">
                Use the code below to verify your email address and create your Chic Furnish account.
                This code expires in <strong>10 minutes</strong>.
              </p>

              <!-- OTP Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center" style="background:#f8f4ee;border:2px solid #d6e8f5;border-left:4px solid #1a3a5c;padding:28px;">
                    <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#4a5e72;font-weight:600;">
                      Verification Code
                    </p>
                    <p style="margin:0;font-size:42px;letter-spacing:0.35em;color:#0f1e2e;font-weight:700;font-family:'Courier New',monospace;">
                      ${code}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 12px;font-size:14px;color:#4a5e72;line-height:1.7;">
                If you didn't request this, you can safely ignore this email — no account will be created.
              </p>
              <p style="margin:0;font-size:14px;color:#4a5e72;line-height:1.7;">
                For security, never share this code with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f4ee;border-top:1px solid #d6e8f5;padding:24px 48px;">
              <p style="margin:0;font-size:12px;color:#8aabb8;text-align:center;line-height:1.6;">
                This email was sent to <strong>${email}</strong>
                <br>Chic Furnish · Auckland, New Zealand
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Chic Furnish <onboarding@resend.dev>',
        to: [email],
        subject: `${code} is your Chic Furnish verification code`,
        html: emailHtml,
      }),
    })

    if (!resendRes.ok) {
      const err = await resendRes.json()
      console.error('Resend error:', err)
      throw new Error('Failed to send email')
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
