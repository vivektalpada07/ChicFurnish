import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setSubmitting(true);
    const result = await login(form.email, form.password);
    setSubmitting(false);
    if (result.error) { setError(result.error); return; }
    if (result.role === 'admin') navigate('/admin');
    else navigate('/shop');
  };

  const linkBtn = {
    background: 'none',
    border: 'none',
    color: 'var(--rust)',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: '0.82rem',
    padding: 0,
    textDecoration: 'underline',
  };

  return (
    <div className="auth-page">
      <div className="auth-panel-left">
        <div className="auth-logo">CHIC <span>FURNISH</span></div>
        <div className="auth-tagline">Luxury Staging & Furniture</div>
        <div style={{ marginTop: '3rem', borderTop: '0.5px solid rgba(201,169,110,0.2)', paddingTop: '2rem', width: '100%' }}>
          <p style={{ fontSize: '0.75rem', color: 'rgba(201,169,110,0.5)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Admin login</p>
          <p style={{ fontSize: '0.8rem', color: 'rgba(250,248,244,0.4)', fontWeight: 300 }}>vivektalpada769@gmail.com</p>
        </div>
      </div>

      <div className="auth-panel-right">
        <h1 className="auth-form-title">Welcome back</h1>
        <p className="auth-form-sub">Sign in to your Chic Furnish account</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            className="form-input"
            type="email"
            placeholder="you@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            placeholder="Your password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <button className="btn btn-dark btn-full" style={{ padding: '1rem', marginTop: '0.5rem', opacity: submitting ? 0.7 : 1 }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', letterSpacing: '0.1em' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        <button
          onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'https://chic-style-website.vercel.app/shop' } })}
          style={{ width: '100%', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', background: 'white', border: '2px solid #b8c8d8', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink)', transition: 'border-color 0.2s' }}
          onMouseOver={e => e.currentTarget.style.borderColor = '#1a3a5c'}
          onMouseOut={e => e.currentTarget.style.borderColor = '#b8c8d8'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <div className="auth-switch">
          Don't have an account?{' '}
          <button style={linkBtn} onClick={() => navigate('/register')}>Create one</button>
        </div>

        <div className="auth-switch" style={{ marginTop: '0.75rem' }}>
          <button style={{ ...linkBtn, fontWeight: 300 }} onClick={() => navigate('/shop')}>
            Continue browsing as guest →
          </button>
        </div>
      </div>
    </div>
  );
}
