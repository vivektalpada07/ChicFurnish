import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!form.name || !form.email || !form.password || !form.confirm) { setError('Please fill in all required fields.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setSubmitting(true);
    const result = await register(form.name, form.email, form.password, form.phone);
    setSubmitting(false);
    if (result.error) { setError(result.error); return; }
    navigate('/shop');
  };

  const linkBtn = {
    background: 'none', border: 'none', color: 'var(--rust)',
    fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
    fontSize: '0.9rem', padding: 0, textDecoration: 'underline',
  };

  return (
    <div className="auth-page">
      <div className="auth-panel-left">
        <div className="auth-logo">CHIC <span>FURNISH</span></div>
        <div className="auth-tagline">Luxury Staging & Furniture</div>
        <div style={{ marginTop: '3rem', maxWidth: 280 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'rgba(214,232,245,0.6)', lineHeight: 1.9, fontWeight: 400, fontStyle: 'italic' }}>
            "Transforming spaces into stories worth telling."
          </p>
        </div>
      </div>

      <div className="auth-panel-right">
        <h1 className="auth-form-title">Create account</h1>
        <p className="auth-form-sub">Join Chic Furnish to book viewings and shop our collection</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" type="text" placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" type="tel" placeholder="021 XXX XXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input className="form-input" type="email" placeholder="you@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input className="form-input" type="password" placeholder="Repeat password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
          </div>
        </div>

        <button className="btn btn-dark btn-full" style={{ padding: '1rem', marginTop: '0.5rem', opacity: submitting ? 0.7 : 1 }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create Account'}
        </button>

        <div className="auth-switch">
          Already have an account?{' '}
          <button style={linkBtn} onClick={() => navigate('/login')}>Sign in</button>
        </div>
      </div>
    </div>
  );
}
