import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
          <p style={{ fontSize: '0.75rem', color: 'rgba(201,169,110,0.5)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Admin demo login</p>
          <p style={{ fontSize: '0.8rem', color: 'rgba(250,248,244,0.4)', fontWeight: 300 }}>admin@chicfurnish.co.nz</p>
          <p style={{ fontSize: '0.8rem', color: 'rgba(250,248,244,0.4)', fontWeight: 300 }}>admin123</p>
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
