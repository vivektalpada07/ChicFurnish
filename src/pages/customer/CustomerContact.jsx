import { useState } from 'react';
import CustomerNav from '../../components/CustomerNav';
import { supabase } from '../../lib/supabase';

export default function CustomerContact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!form.name.trim()) { setError('Please enter your name.'); return; }
    if (!form.email.trim()) { setError('Please enter your email.'); return; }
    if (!form.message.trim()) { setError('Please enter a message.'); return; }

    setLoading(true);
    const { error: err } = await supabase.from('enquiries').insert({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    });
    setLoading(false);

    if (err) { setError('Something went wrong. Please try again.'); return; }
    supabase.functions.invoke('notify-admin', { body: { type: 'enquiry', data: form } });
    setDone(true);
  };

  return (
    <>
      <CustomerNav />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '4rem 1.5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--rust)', fontWeight: 700, marginBottom: '0.75rem' }}>Get in Touch</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '1rem' }}>Contact Us</h1>
          <p style={{ fontSize: '1rem', color: 'var(--ink-muted)', lineHeight: 1.8, maxWidth: 500, margin: '0 auto' }}>
            Have a question about a piece of furniture, a staging project, or anything else? We'd love to hear from you.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem', alignItems: 'start' }}>

          {/* Contact Info */}
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>Location</p>
              <p style={{ color: 'var(--ink)', lineHeight: 1.7 }}>Auckland, New Zealand</p>
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>Email</p>
              <p style={{ color: 'var(--rust)', fontWeight: 600 }}>Chicfurnishliving@gmail.com</p>
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>Hours</p>
              <p style={{ color: 'var(--ink)', lineHeight: 1.7 }}>Mon – Fri: 9am – 5pm<br />Sat: 10am – 3pm</p>
            </div>
            <div>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>Response Time</p>
              <p style={{ color: 'var(--ink)', lineHeight: 1.7 }}>We reply within 1 business day.</p>
            </div>
          </div>

          {/* Form */}
          {done ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', border: '1.5px solid var(--border)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--ink)' }}>Message sent!</h2>
              <p style={{ color: 'var(--ink-muted)', lineHeight: 1.7 }}>Thanks for reaching out. We'll get back to you within 1 business day.</p>
            </div>
          ) : (
            <div style={{ background: 'white', border: '1.5px solid var(--border)', padding: '2rem' }}>
              {error && <div className="auth-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" type="text" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" type="tel" placeholder="021 XXX XXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <select className="form-select" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                  <option value="">Select a topic…</option>
                  <option value="Furniture Enquiry">Furniture Enquiry</option>
                  <option value="Staging Services">Staging Services</option>
                  <option value="Viewing Request">Viewing Request</option>
                  <option value="General Question">General Question</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea className="form-textarea" placeholder="Tell us what you're looking for…" rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
              </div>

              <button
                className="btn btn-dark btn-full"
                style={{ padding: '1rem', opacity: loading ? 0.7 : 1 }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Sending…' : 'Send Message →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
