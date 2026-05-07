import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerNav from '../../components/CustomerNav';
import { useAuth } from '../../context/AuthContext';
import { getStagingBookings, saveStagingBookings } from '../../context/AuthContext';

const ROOMS = [
  { id: 1, title: 'Coastal Calm Living', tag: 'Living Room', desc: 'Staged for a waterfront Takapuna property', color: '#d4c9b8' },
  { id: 2, title: 'Moody Dining Room', tag: 'Dining', desc: 'Dramatic dark tones with brass accents', color: '#b8b0a4' },
  { id: 3, title: 'Boudoir Master Suite', tag: 'Bedroom', desc: 'Soft linen layers for a Grey Lynn villa', color: '#ccc0b4' },
  { id: 4, title: 'Minimalist Study Nook', tag: 'Study', desc: 'Curated shelf styling and natural light', color: '#c4beb4' },
  { id: 5, title: 'Golden Hour Lounge', tag: 'Living Room', desc: 'Warm tones for an inner-city apartment', color: '#d0c4a8' },
  { id: 6, title: 'Travertine Kitchen', tag: 'Kitchen', desc: 'Stone and rattan styling', color: '#beb4a8' },
  { id: 7, title: 'Japandi Reading Corner', tag: 'Living Room', desc: 'Curated calm for a Mt Eden bungalow', color: '#c8c0b0' },
  { id: 8, title: 'Velvet & Oak Bedroom', tag: 'Bedroom', desc: 'Rich textures for a Remuera townhouse', color: '#c0b4a4' },
];

const TAGS = ['All', 'Living Room', 'Dining', 'Bedroom', 'Study', 'Kitchen'];
const SERVICES = ['Full Home Staging', 'Partial Staging', 'Vacant Property', 'Photography Prep', 'Short-Term Hire', 'Styling Consultation'];
const EMPTY_FORM = { name: '', email: '', phone: '', address: '', service: 'Full Home Staging', date: '', notes: '' };

export default function CustomerInspiration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTag, setActiveTag] = useState('All');
  const [stagingModal, setStagingModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [requireLogin, setRequireLogin] = useState(false);

  const filtered = activeTag === 'All' ? ROOMS : ROOMS.filter((r) => r.tag === activeTag);

  const openStaging = () => {
    if (!user) { setRequireLogin(true); return; }
    setForm({ ...EMPTY_FORM, name: user.name, email: user.email });
    setStagingModal(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.address) return;
    const bookings = getStagingBookings();
    const newBooking = {
      id: `SB-${Date.now()}`,
      ...form,
      status: 'pending',
      quoteSent: false,
      quoteAmount: null,
      createdAt: new Date().toISOString(),
    };
    saveStagingBookings([...bookings, newBooking]);
    setSubmitted(true);
    setTimeout(() => { setStagingModal(false); setSubmitted(false); setForm(EMPTY_FORM); }, 3000);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <CustomerNav onCartClick={() => navigate('/shop')} />

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '6rem 2rem 4rem', borderBottom: '0.5px solid var(--border)' }}>
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>
          Luxury Home Staging · Auckland, NZ
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem, 6vw, 5rem)', fontWeight: 300, lineHeight: 1.05, marginBottom: '1.5rem' }}>
          Spaces that make people<br /><em style={{ color: 'var(--gold-dark)' }}>feel something</em>
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--warm-gray)', maxWidth: 460, margin: '0 auto 2.5rem', lineHeight: 1.9, fontWeight: 300 }}>
          We transform New Zealand properties into aspirational homes — curated luxury furniture, expert styling, unforgettable first impressions.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-dark" onClick={openStaging}>Book a Staging</button>
          <button className="btn btn-outline" onClick={() => navigate('/shop')}>Browse Furniture →</button>
        </div>
      </section>

      {/* Filter tags */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem 0 0', flexWrap: 'wrap', gap: 0 }}>
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            style={{
              padding: '0.6rem 1.4rem',
              background: activeTag === tag ? 'var(--dark)' : 'transparent',
              color: activeTag === tag ? 'var(--gold)' : 'var(--warm-gray)',
              border: '0.5px solid var(--border)',
              marginRight: '-0.5px',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '0.72rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      <section style={{ padding: '2.5rem 2.5rem 5rem', columns: '3 280px', columnGap: '1rem' }}>
        {filtered.map((room, i) => (
          <div
            key={room.id}
            style={{ breakInside: 'avoid', marginBottom: '1rem', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
          >
            {/* Placeholder image block */}
            <div style={{
              width: '100%',
              height: i % 3 === 0 ? 340 : i % 3 === 1 ? 260 : 300,
              background: room.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'transform 0.5s',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'rgba(26,23,20,0.3)', letterSpacing: '0.15em' }}>
                {room.tag.toUpperCase()}
              </span>
            </div>
            {/* Overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(26,23,20,0.8) 0%, transparent 55%)',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              padding: '1.25rem',
            }}>
              <span style={{ fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.35rem' }}>
                {room.tag}
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 300, color: 'var(--cream)', marginBottom: '0.25rem' }}>
                {room.title}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'rgba(250,248,244,0.55)', fontWeight: 300 }}>{room.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Services strip */}
      <section style={{ background: 'var(--dark)', padding: '5rem 3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>Our Services</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 300, color: 'var(--cream)' }}>
            Staging <em style={{ color: 'var(--gold)' }}>for every need</em>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1px', background: 'rgba(201,169,110,0.15)' }}>
          {SERVICES.map((s) => (
            <div key={s} style={{ background: 'var(--dark)', padding: '2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 300, color: 'var(--gold)', marginBottom: '0.5rem' }}>{s}</h3>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button className="btn btn-gold" style={{ padding: '1rem 2.5rem' }} onClick={openStaging}>
            Request a Quote
          </button>
        </div>
      </section>

      {/* Require login modal */}
      {requireLogin && (
        <div className="modal-overlay" onClick={() => setRequireLogin(false)}>
          <div className="modal" style={{ maxWidth: 420, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title" style={{ textAlign: 'center' }}>Sign in to continue</h2>
            <p style={{ color: 'var(--warm-gray)', fontSize: '0.88rem', lineHeight: 1.8, marginBottom: '2rem' }}>
              Please create an account or sign in to book a staging service.
            </p>
            <div className="flex-gap" style={{ justifyContent: 'center' }}>
              <button className="btn btn-dark" onClick={() => navigate('/login')}>Sign In</button>
              <button className="btn btn-outline" onClick={() => navigate('/register')}>Create Account</button>
            </div>
          </div>
        </div>
      )}

      {/* Staging booking modal */}
      {stagingModal && (
        <div className="modal-overlay" onClick={() => setStagingModal(false)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--gold)', marginBottom: '1rem' }}>✓</div>
                <h2 className="modal-title" style={{ textAlign: 'center' }}>Booking Received</h2>
                <p style={{ color: 'var(--warm-gray)', fontSize: '0.88rem', lineHeight: 1.9 }}>
                  Thank you! Our team will be in touch within 24 hours with your personalised quote.
                </p>
              </div>
            ) : (
              <>
                <h2 className="modal-title">Book a Staging</h2>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="021 XXX XXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Preferred Date</label>
                    <input className="form-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Property Address *</label>
                  <input className="form-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street address, Auckland" />
                </div>
                <div className="form-group">
                  <label className="form-label">Service Required</label>
                  <select className="form-select" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
                    {SERVICES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Number of rooms, any special requirements..." />
                </div>
                <div className="flex-gap" style={{ justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost" onClick={() => setStagingModal(false)}>Cancel</button>
                  <button className="btn btn-dark" onClick={handleSubmit}>Submit Booking →</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
