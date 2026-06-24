import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// Common disposable/fake email domains to block
const DISPOSABLE_DOMAINS = [
  'mailinator.com','guerrillamail.com','tempmail.com','throwaway.email',
  'fakeinbox.com','sharklasers.com','guerrillamailblock.com','grr.la',
  'guerrillamail.info','spam4.me','yopmail.com','maildrop.cc','dispostable.com',
  'trashmail.com','temp-mail.org','getairmail.com','mailnull.com','spamgourmet.com',
  'test.com','example.com','sample.com','fake.com','noemail.com',
];

function isValidEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function isDisposable(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.includes(domain);
}

export default function Register() {
  const navigate = useNavigate();

  // Step 1: email entry, Step 2: OTP verify, Step 3: complete profile
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirm: '' });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const linkBtn = {
    background: 'none', border: 'none', color: 'var(--rust)',
    fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
    fontSize: '0.9rem', padding: 0, textDecoration: 'underline',
  };

  // ── STEP 1: Send OTP ──
  const handleSendOtp = async () => {
    setError('');
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) { setError('Please enter your email address.'); return; }
    if (!isValidEmailFormat(trimmed)) { setError('That doesn\'t look like a valid email address.'); return; }
    if (isDisposable(trimmed)) { setError('Please use a real email address — disposable or temporary emails are not accepted.'); return; }

    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { shouldCreateUser: true },
    });
    setLoading(false);

    if (err) {
      if (err.message.includes('rate')) {
        setError('Too many attempts. Please wait a minute and try again.');
      } else {
        setError('Could not send a code to that address. Please check your email and try again.');
      }
      return;
    }

    setEmail(trimmed);
    setStep(2);
    startResendCooldown();
  };

  // ── STEP 2: Verify OTP ──
  const handleVerifyOtp = async () => {
    setError('');
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) { setError('Please enter the 6-digit code from your email.'); return; }

    setLoading(true);
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });
    setLoading(false);

    if (err) {
      setError('Incorrect or expired code. Please check your email and try again.');
      return;
    }

    setStep(3);
  };

  // ── STEP 2: Resend OTP ──
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setLoading(true);
    await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    setLoading(false);
    setOtp('');
    startResendCooldown();
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ── STEP 3: Complete profile ──
  const handleComplete = async () => {
    setError('');
    if (!form.name.trim()) { setError('Please enter your full name.'); return; }
    if (!form.password) { setError('Please set a password.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({
      password: form.password,
      data: { name: form.name.trim(), phone: form.phone.trim() },
    });
    setLoading(false);

    if (err) { setError(err.message); return; }
    navigate('/shop');
  };

  return (
    <div className="auth-page">
      <div className="auth-panel-left">
        <div className="auth-logo">CHIC <span>FURNISH</span></div>
        <div className="auth-tagline">Luxury Staging & Furniture</div>

        {/* Step indicator */}
        <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { n: 1, label: 'Verify your email' },
            { n: 2, label: 'Enter the code' },
            { n: 3, label: 'Complete your profile' },
          ].map(({ n, label }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: step === n ? 1 : step > n ? 0.6 : 0.3 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: step > n ? '#f0a070' : step === n ? '#c9a96e' : 'rgba(201,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: step >= n ? '#0f1e2e' : 'rgba(250,248,244,0.4)', flexShrink: 0 }}>
                {step > n ? '✓' : n}
              </div>
              <span style={{ fontSize: '0.82rem', color: step === n ? '#f0a070' : 'rgba(250,248,244,0.5)', fontWeight: step === n ? 700 : 400, letterSpacing: '0.05em' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-panel-right">

        {/* ── STEP 1: Email ── */}
        {step === 1 && (
          <>
            <h1 className="auth-form-title">Create account</h1>
            <p className="auth-form-sub">First, let's verify your email address</p>
            {error && <div className="auth-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                autoFocus
              />
              <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: '0.4rem' }}>
                We'll send a 6-digit code to confirm this is a real address.
              </p>
            </div>
            <button className="btn btn-dark btn-full" style={{ padding: '1rem', opacity: loading ? 0.7 : 1 }} onClick={handleSendOtp} disabled={loading}>
              {loading ? 'Sending code…' : 'Send Verification Code →'}
            </button>
            <div className="auth-switch" style={{ marginTop: '1rem' }}>
              Already have an account?{' '}
              <button style={linkBtn} onClick={() => navigate('/login')}>Sign in</button>
            </div>
          </>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === 2 && (
          <>
            <h1 className="auth-form-title">Check your inbox</h1>
            <p className="auth-form-sub">We sent a 6-digit code to</p>
            <p style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>{email}</p>

            {error && <div className="auth-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Verification Code *</label>
              <input
                className="form-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                style={{ fontSize: '1.5rem', letterSpacing: '0.3em', textAlign: 'center' }}
                autoFocus
              />
              <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: '0.4rem' }}>
                Check your spam folder if it doesn't arrive within 1 minute.
              </p>
            </div>

            <button className="btn btn-dark btn-full" style={{ padding: '1rem', opacity: loading ? 0.7 : 1 }} onClick={handleVerifyOtp} disabled={loading}>
              {loading ? 'Verifying…' : 'Verify Code →'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <button style={linkBtn} onClick={() => { setStep(1); setOtp(''); setError(''); }}>← Change email</button>
              <button
                style={{ ...linkBtn, color: resendCooldown > 0 ? 'var(--ink-muted)' : 'var(--rust)', cursor: resendCooldown > 0 ? 'default' : 'pointer' }}
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </div>
          </>
        )}

        {/* ── STEP 3: Profile ── */}
        {step === 3 && (
          <>
            <h1 className="auth-form-title">Almost done!</h1>
            <p className="auth-form-sub">Email verified ✓ — now complete your profile</p>

            {error && <div className="auth-error">{error}</div>}

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" type="text" placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" type="tel" placeholder="021 XXX XXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input className="form-input" type="password" placeholder="Repeat password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleComplete()} />
              </div>
            </div>

            <button className="btn btn-dark btn-full" style={{ padding: '1rem', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }} onClick={handleComplete} disabled={loading}>
              {loading ? 'Creating account…' : 'Complete Registration'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
