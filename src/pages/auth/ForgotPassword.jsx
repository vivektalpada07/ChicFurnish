import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const linkBtn = {
    background: 'none', border: 'none', color: 'var(--rust)',
    fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
    fontSize: '0.9rem', padding: 0, textDecoration: 'underline',
  };

  const handleSubmit = async () => {
    setError('');
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) { setError('Please enter your email address.'); return; }

    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: 'https://chic-style-website.vercel.app/reset-password',
    });
    setLoading(false);

    if (err) { setError(err.message); return; }
    setDone(true);
  };

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-panel-left">
          <div className="auth-logo">CHIC <span>FURNISH</span></div>
          <div className="auth-tagline">Luxury Staging & Furniture</div>
        </div>
        <div className="auth-panel-right" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✉️</div>
            <h1 className="auth-form-title">Check your inbox</h1>
            <p className="auth-form-sub" style={{ marginBottom: '2rem' }}>
              We sent a password reset link to<br />
              <strong style={{ color: 'var(--ink)' }}>{email}</strong>
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
              Click the link in the email to set a new password. Check your spam folder if you don't see it.
            </p>
            <button className="btn btn-dark" style={{ padding: '0.85rem 2rem' }} onClick={() => navigate('/login')}>
              Back to Sign In
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
      </div>
      <div className="auth-panel-right">
        <h1 className="auth-form-title">Reset password</h1>
        <p className="auth-form-sub">Enter your email and we'll send you a reset link</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            className="form-input" type="email" placeholder="you@email.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
        </div>

        <button
          className="btn btn-dark btn-full"
          style={{ padding: '1rem', opacity: loading ? 0.7 : 1 }}
          onClick={handleSubmit} disabled={loading}
        >
          {loading ? 'Sending…' : 'Send Reset Link →'}
        </button>

        <div className="auth-switch" style={{ marginTop: '1rem' }}>
          <button style={linkBtn} onClick={() => navigate('/login')}>← Back to Sign In</button>
        </div>
      </div>
    </div>
  );
}
