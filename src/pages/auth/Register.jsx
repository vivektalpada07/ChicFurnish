import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const signInWithGoogle = () => supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: 'https://chic-style-website.vercel.app/shop' },
});

const DISPOSABLE_DOMAINS = [
  'mailinator.com','guerrillamail.com','tempmail.com','throwaway.email',
  'fakeinbox.com','sharklasers.com','yopmail.com','maildrop.cc','dispostable.com',
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
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const linkBtn = {
    background: 'none', border: 'none', color: 'var(--rust)',
    fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
    fontSize: '0.9rem', padding: 0, textDecoration: 'underline',
  };

  const handleSubmit = async () => {
    setError('');
    const email = form.email.trim().toLowerCase();

    if (!form.name.trim()) { setError('Please enter your full name.'); return; }
    if (!email) { setError('Please enter your email address.'); return; }
    if (!isValidEmailFormat(email)) { setError('That doesn\'t look like a valid email address.'); return; }
    if (isDisposable(email)) { setError('Please use a real email address — disposable emails are not accepted.'); return; }
    if (!form.password) { setError('Please set a password.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        data: { name: form.name.trim(), phone: form.phone.trim() },
        emailRedirectTo: 'https://chic-style-website.vercel.app/shop',
      },
    });
    setLoading(false);

    if (err) {
      if (err.message.includes('already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(err.message);
      }
      return;
    }

    setDone(true);
  };

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-panel-left">
          <div className="auth-logo">CHIC <span>FURNISH</span></div>
          <div className="auth-tagline">Luxury Staging & Furniture</div>
        </div>
        <div className="auth-panel-right" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✉️</div>
            <h1 className="auth-form-title">Check your inbox</h1>
            <p className="auth-form-sub" style={{ marginBottom: '2rem' }}>
              We sent a confirmation link to<br />
              <strong style={{ color: 'var(--ink)' }}>{form.email}</strong>
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
              Click the link in the email to activate your account.
              Check your spam folder if you don't see it within a minute.
            </p>
            <button className="btn btn-dark" style={{ padding: '0.85rem 2rem' }} onClick={() => navigate('/login')}>
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-panel-left">
        <div className="auth-logo">CHIC <span>FURNISH</span></div>
        <div className="auth-tagline">Luxury Staging & Furniture</div>
        <div style={{ marginTop: '3rem', maxWidth: 280 }}>
          <p style={{ color: 'rgba(214,232,245,0.7)', fontSize: '0.9rem', lineHeight: 1.8 }}>
            Create your account to book furniture viewings, request staging quotes, and save your favourites.
          </p>
        </div>
      </div>

      <div className="auth-panel-right">
        <h1 className="auth-form-title">Create account</h1>
        <p className="auth-form-sub">Fill in your details to get started</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              className="form-input" type="text" placeholder="Your full name"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              className="form-input" type="tel" placeholder="021 XXX XXXX"
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input
            className="form-input" type="email" placeholder="you@email.com"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              className="form-input" type="password" placeholder="Min. 6 characters"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input
              className="form-input" type="password" placeholder="Repeat password"
              value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        </div>

        <button
          className="btn btn-dark btn-full"
          style={{ padding: '1rem', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Creating account…' : 'Create Account →'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0 1rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', letterSpacing: '0.1em' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        <button
          onClick={signInWithGoogle}
          style={{ width: '100%', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', background: 'white', border: '2px solid #b8c8d8', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink)', transition: 'border-color 0.2s' }}
          onMouseOver={e => e.currentTarget.style.borderColor = '#1a3a5c'}
          onMouseOut={e => e.currentTarget.style.borderColor = '#b8c8d8'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <div className="auth-switch" style={{ marginTop: '1rem' }}>
          Already have an account?{' '}
          <button style={linkBtn} onClick={() => navigate('/login')}>Sign in</button>
        </div>
      </div>
    </div>
  );
}
