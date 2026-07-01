import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

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

        <div className="auth-switch" style={{ marginTop: '1rem' }}>
          Already have an account?{' '}
          <button style={linkBtn} onClick={() => navigate('/login')}>Sign in</button>
        </div>
      </div>
    </div>
  );
}
