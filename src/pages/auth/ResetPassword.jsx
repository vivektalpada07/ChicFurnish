import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!form.password) { setError('Please enter a new password.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password: form.password });
    setLoading(false);

    if (err) { setError(err.message); return; }
    navigate('/login');
  };

  return (
    <div className="auth-page">
      <div className="auth-panel-left">
        <div className="auth-logo">CHIC <span>FURNISH</span></div>
        <div className="auth-tagline">Luxury Staging & Furniture</div>
      </div>
      <div className="auth-panel-right">
        <h1 className="auth-form-title">Set new password</h1>
        <p className="auth-form-sub">Choose a strong password for your account</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">New Password *</label>
          <input
            className="form-input" type="password" placeholder="Min. 6 characters"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm New Password *</label>
          <input
            className="form-input" type="password" placeholder="Repeat password"
            value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <button
          className="btn btn-dark btn-full"
          style={{ padding: '1rem', opacity: loading ? 0.7 : 1 }}
          onClick={handleSubmit} disabled={loading}
        >
          {loading ? 'Saving…' : 'Save New Password →'}
        </button>
      </div>
    </div>
  );
}
