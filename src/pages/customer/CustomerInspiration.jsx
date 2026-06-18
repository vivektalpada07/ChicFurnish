import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerNav from '../../components/CustomerNav';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

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
const SERVICES = ['Full Home Staging', 'Partial Staging', 'Vacant Property', 'Photography Prep', 'Short-Term Hire'];
const EMPTY_FORM = { name: '', email: '', phone: '', address: '', service: 'Full Home Staging', date: '', notes: '' };

const ToilePattern = () => (
  <svg
    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <pattern id="toileHero" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
        <rect width="200" height="200" fill="#eef5fb"/>
        {/* Urn with flowers */}
        <path d="M24 38 Q26 26 34 28 Q42 26 44 38 L42 56 Q34 62 26 56 Z" fill="none" stroke="#2e5f8a" strokeWidth="0.9"/>
        <path d="M34 28 L34 14" stroke="#2e5f8a" strokeWidth="0.9" fill="none"/>
        <path d="M34 14 Q28 6 22 8" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <path d="M34 14 Q40 6 46 8" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <path d="M34 14 Q32 4 34 1" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <path d="M34 14 Q38 5 42 3" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <path d="M34 14 Q30 5 26 3" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <circle cx="22" cy="8" r="3.5" fill="none" stroke="#2e5f8a" strokeWidth="0.8"/>
        <circle cx="46" cy="8" r="3.5" fill="none" stroke="#2e5f8a" strokeWidth="0.8"/>
        <circle cx="34" cy="1" r="3" fill="none" stroke="#2e5f8a" strokeWidth="0.8"/>
        <circle cx="42" cy="3" r="2.5" fill="none" stroke="#2e5f8a" strokeWidth="0.7"/>
        <circle cx="26" cy="3" r="2.5" fill="none" stroke="#2e5f8a" strokeWidth="0.7"/>
        <path d="M26 56 Q20 66 18 74 Q24 70 28 74" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <path d="M42 56 Q48 66 50 74 Q44 70 40 74" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <path d="M18 74 L50 74" stroke="#2e5f8a" strokeWidth="0.8"/>
        {/* Bird on branch */}
        <path d="M110 74 Q125 68 138 72 Q144 77 140 84 Q130 90 118 85 Q108 80 110 74Z" fill="none" stroke="#2e5f8a" strokeWidth="0.9"/>
        <circle cx="141" cy="70" r="5" fill="none" stroke="#2e5f8a" strokeWidth="0.9"/>
        <path d="M146 67 L153 64 L149 70Z" fill="#2e5f8a"/>
        <path d="M110 84 L104 93 L113 89Z" fill="none" stroke="#2e5f8a" strokeWidth="0.8"/>
        <path d="M96 98 Q116 95 138 98 Q144 103 138 106 Q116 104 96 104Z" fill="none" stroke="#2e5f8a" strokeWidth="0.8"/>
        <path d="M102 106 L102 120 M114 104 L114 120 M126 106 L126 120 M138 106 L138 120" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <path d="M92 120 L146 120" stroke="#2e5f8a" strokeWidth="1.4"/>
        <path d="M92 120 Q88 128 86 134 M146 120 Q152 128 154 134" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        {/* Deer / fawn */}
        <ellipse cx="158" cy="158" rx="16" ry="10" fill="none" stroke="#2e5f8a" strokeWidth="0.9"/>
        <circle cx="173" cy="148" r="7" fill="none" stroke="#2e5f8a" strokeWidth="0.9"/>
        <path d="M175 141 Q178 132 175 129 M178 141 Q182 132 181 128" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <path d="M144 168 L141 184 M150 168 L148 184 M166 168 L167 184 M172 167 L175 184" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <path d="M168 150 Q172 145 176 148" stroke="#2e5f8a" strokeWidth="0.7" fill="none"/>
        <circle cx="155" cy="155" r="1.2" fill="#2e5f8a"/>
        <circle cx="162" cy="153" r="1.2" fill="#2e5f8a"/>
        <circle cx="160" cy="159" r="1.2" fill="#2e5f8a"/>
        {/* Butterfly */}
        <path d="M54 148 Q64 138 74 145 Q68 155 60 154 Q54 154 54 148Z" fill="none" stroke="#2e5f8a" strokeWidth="0.8"/>
        <path d="M54 148 Q44 138 38 145 Q44 155 52 154 Q54 154 54 148Z" fill="none" stroke="#2e5f8a" strokeWidth="0.8"/>
        <path d="M54 154 Q62 162 64 157 Q60 168 54 162Z" fill="none" stroke="#2e5f8a" strokeWidth="0.8"/>
        <path d="M54 154 Q46 162 44 157 Q48 168 54 162Z" fill="none" stroke="#2e5f8a" strokeWidth="0.8"/>
        <line x1="54" y1="145" x2="54" y2="164" stroke="#2e5f8a" strokeWidth="0.9"/>
        <path d="M54 145 Q49 137 46 134 M54 145 Q59 137 62 134" stroke="#2e5f8a" strokeWidth="0.7" fill="none"/>
        {/* Floral spray bottom-left */}
        <path d="M18 148 Q22 136 30 142 Q26 134 34 134 Q42 134 38 142 Q46 136 50 148 Q42 142 34 146 Q26 142 18 148Z" fill="none" stroke="#2e5f8a" strokeWidth="0.8"/>
        <path d="M34 146 L34 172" stroke="#2e5f8a" strokeWidth="0.9"/>
        <path d="M34 156 Q24 151 18 156 M34 162 Q44 157 50 162" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <ellipse cx="26" cy="182" rx="8" ry="13" fill="none" stroke="#2e5f8a" strokeWidth="0.8" transform="rotate(-20,26,182)"/>
        <ellipse cx="42" cy="182" rx="8" ry="13" fill="none" stroke="#2e5f8a" strokeWidth="0.8" transform="rotate(20,42,182)"/>
        {/* Small scattered flowers */}
        <circle cx="76" cy="46" r="4" fill="none" stroke="#2e5f8a" strokeWidth="0.7"/>
        <path d="M76 42 L76 38 M80 43 L84 41 M80 49 L84 51 M72 49 L68 51 M72 43 L68 41" stroke="#2e5f8a" strokeWidth="0.7" fill="none"/>
        <circle cx="182" cy="108" r="4" fill="none" stroke="#2e5f8a" strokeWidth="0.7"/>
        <path d="M182 104 L182 100 M186 105 L190 103 M186 111 L190 113 M178 111 L174 113 M178 105 L174 103" stroke="#2e5f8a" strokeWidth="0.7" fill="none"/>
        <circle cx="80" cy="192" r="3.5" fill="none" stroke="#2e5f8a" strokeWidth="0.7"/>
        <path d="M80 188 L80 185 M83 189 L86 187 M83 195 L86 197 M77 195 L74 197 M77 189 L74 187" stroke="#2e5f8a" strokeWidth="0.7" fill="none"/>
        <circle cx="170" cy="36" r="3.5" fill="none" stroke="#2e5f8a" strokeWidth="0.7"/>
        <path d="M170 32 L170 29 M173 33 L176 31 M173 39 L176 41 M167 39 L164 41 M167 33 L164 31" stroke="#2e5f8a" strokeWidth="0.7" fill="none"/>
        {/* Vine connectors */}
        <path d="M50 56 Q70 62 90 80" stroke="#2e5f8a" strokeWidth="0.6" fill="none" strokeDasharray="2,4"/>
        <path d="M50 148 Q70 136 92 120" stroke="#2e5f8a" strokeWidth="0.6" fill="none" strokeDasharray="2,4"/>
        <path d="M158 148 Q148 136 142 120" stroke="#2e5f8a" strokeWidth="0.6" fill="none" strokeDasharray="2,4"/>
        <path d="M76 50 Q100 58 108 74" stroke="#2e5f8a" strokeWidth="0.6" fill="none" strokeDasharray="2,4"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#toileHero)"/>
  </svg>
);

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
    setForm({ ...EMPTY_FORM, name: user.name, email: user.email, phone: user.phone || '' });
    setStagingModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.address) return;
    await supabase.from('staging_bookings').insert({
      id: `SB-${Date.now()}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      service: form.service,
      date: form.date,
      notes: form.notes,
      status: 'pending',
      quote_sent: false,
    });
    setSubmitted(true);
    setTimeout(() => { setStagingModal(false); setSubmitted(false); setForm(EMPTY_FORM); }, 3000);
  };

  const darkBtn = {
    background: '#1a3a5c', color: '#f0d8c8', border: 'none',
    padding: '0.85rem 2rem', fontFamily: 'var(--font-body)', fontSize: '0.82rem',
    letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer',
  };

  const rustOutlineBtn = {
    background: 'transparent', color: '#c04a1a', border: '2px solid #c04a1a',
    padding: '0.85rem 2rem', fontFamily: 'var(--font-body)', fontSize: '0.82rem',
    letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f4ee' }}>
      <CustomerNav onCartClick={() => navigate('/shop')} />

      {/* ── TOILE HERO — full pattern background ── */}
      <section style={{ position: 'relative', minHeight: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <ToilePattern />
        {/* Dark overlay so text is readable */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(238,245,251,0.55)' }} />
        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '5rem 2rem', maxWidth: 680 }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.38em', textTransform: 'uppercase', color: '#c04a1a', fontWeight: 700, marginBottom: '1.25rem' }}>
            Luxury Home Staging · Auckland, NZ
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem,7vw,5.5rem)', fontWeight: 600, lineHeight: 1.05, marginBottom: '1.5rem', color: '#0f1e2e' }}>
            Spaces that make<br />
            <em style={{ color: '#2e5f8a', fontWeight: 400 }}>people feel something</em>
          </h1>
          <p style={{ fontSize: '1rem', color: '#2a3d52', maxWidth: 480, margin: '0 auto 2.5rem', lineHeight: 1.9, fontWeight: 400 }}>
            We transform New Zealand properties into aspirational homes — curated luxury furniture, expert styling, unforgettable first impressions.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={darkBtn} onClick={openStaging}>Book a Staging</button>
            <button style={rustOutlineBtn} onClick={() => navigate('/shop')}>Browse Furniture →</button>
          </div>
        </div>
        {/* Bottom fade into cream */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, #f8f4ee)' }} />
      </section>

      {/* ── FILTER TAGS ── */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem 0 0', flexWrap: 'wrap', gap: 0, borderBottom: '2px solid #b8c8d8' }}>
        {TAGS.map((tag) => (
          <button key={tag} onClick={() => setActiveTag(tag)} style={{
            padding: '0.7rem 1.5rem',
            background: activeTag === tag ? '#1a3a5c' : 'transparent',
            color: activeTag === tag ? '#f0d8c8' : '#2a3d52',
            border: '2px solid ' + (activeTag === tag ? '#1a3a5c' : '#b8c8d8'),
            marginRight: '-1px', cursor: 'pointer', fontFamily: 'var(--font-body)',
            fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase',
            fontWeight: 600, transition: 'all 0.2s',
          }}>
            {tag}
          </button>
        ))}
      </div>

      {/* ── GALLERY ── */}
      <section style={{ padding: '2.5rem 2.5rem 5rem', columns: '3 280px', columnGap: '1rem' }}>
        {filtered.map((room, i) => (
          <div key={room.id} style={{ breakInside: 'avoid', marginBottom: '1rem', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
            <div style={{
              width: '100%', height: i % 3 === 0 ? 340 : i % 3 === 1 ? 260 : 300,
              background: room.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', transition: 'transform 0.5s',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'rgba(26,58,92,0.3)', letterSpacing: '0.18em', fontWeight: 600 }}>
                {room.tag.toUpperCase()}
              </span>
            </div>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,30,46,0.85) 0%, transparent 55%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.25rem' }}>
              <span style={{ fontSize: '0.68rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#f0a070', marginBottom: '0.35rem', fontWeight: 700 }}>{room.tag}</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: '#f8f4ee', marginBottom: '0.25rem' }}>{room.title}</h3>
              <p style={{ fontSize: '0.78rem', color: 'rgba(214,232,245,0.7)', fontWeight: 400 }}>{room.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── SERVICES STRIP ── */}
      <section style={{ background: '#1a3a5c', padding: '5rem 3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#f0a070', marginBottom: '1rem', fontWeight: 700 }}>Our Services</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 600, color: '#f8f4ee' }}>
            Staging <em style={{ color: '#d6e8f5', fontWeight: 400 }}>for every need</em>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1px', background: 'rgba(214,232,245,0.15)' }}>
          {SERVICES.map((s) => (
            <div key={s} style={{ background: '#1a3a5c', padding: '2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, color: '#f0a070', marginBottom: '0.5rem' }}>{s}</h3>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button style={{ ...darkBtn, background: '#c04a1a', color: 'white', padding: '1rem 2.5rem' }} onClick={openStaging}>
            Request a Quote
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#1a3a5c', padding: '3rem 3rem 2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, color: '#f8f4ee', letterSpacing: '0.15em' }}>
              CHIC <span style={{ color: '#f0a070' }}>FURNISH</span>
            </span>
            <button onClick={() => navigate('/shop')} style={{ background: 'none', border: 'none', color: 'rgba(214,232,245,0.65)', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--font-body)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
              Buy Furniture
            </button>
            <button onClick={() => navigate('/inspiration')} style={{ background: 'none', border: 'none', color: '#f0a070', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--font-body)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
              Staging
            </button>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'rgba(214,232,245,0.45)' }}>© 2026 Chic Furnish · Auckland, New Zealand</span>
        </div>
      </footer>

      {/* ── REQUIRE LOGIN MODAL ── */}
      {requireLogin && (
        <div className="modal-overlay" onClick={() => setRequireLogin(false)}>
          <div className="modal" style={{ maxWidth: 420, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title" style={{ textAlign: 'center' }}>Sign in to continue</h2>
            <p style={{ color: '#4a5e72', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '2rem', fontWeight: 400 }}>
              Please create an account or sign in to book a staging service.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button style={darkBtn} onClick={() => navigate('/login')}>Sign In</button>
              <button style={rustOutlineBtn} onClick={() => navigate('/register')}>Create Account</button>
            </div>
          </div>
        </div>
      )}

      {/* ── STAGING BOOKING MODAL ── */}
      {stagingModal && (
        <div className="modal-overlay" onClick={() => setStagingModal(false)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: '#c04a1a', marginBottom: '1rem' }}>✓</div>
                <h2 className="modal-title" style={{ textAlign: 'center' }}>Booking Received</h2>
                <p style={{ color: '#4a5e72', fontSize: '0.95rem', lineHeight: 1.9, fontWeight: 400 }}>
                  Thank you! Our team will be in touch within 24 hours with your personalised quote.
                </p>
              </div>
            ) : (
              <>
                <h2 className="modal-title">Book a Staging</h2>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></div>
                  <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" /></div>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="021 XXX XXX" /></div>
                  <div className="form-group"><label className="form-label">Preferred Date</label><input className="form-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                </div>
                <div className="form-group"><label className="form-label">Property Address *</label><input className="form-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street address, Auckland" /></div>
                <div className="form-group">
                  <label className="form-label">Service Required</label>
                  <select className="form-select" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
                    {SERVICES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Number of rooms, any special requirements..." /></div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button style={{ background: 'none', border: '2px solid #b8c8d8', color: '#4a5e72', padding: '0.7rem 1.3rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }} onClick={() => setStagingModal(false)}>Cancel</button>
                  <button style={darkBtn} onClick={handleSubmit}>Submit Booking →</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
