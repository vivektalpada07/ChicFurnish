import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerNav from '../../components/CustomerNav';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import { toast } from '../../components/Toast';

const CATS = [
  { key: 'all', label: 'All Furniture' },
  { key: 'sofa', label: 'Sofas & Chairs' },
  { key: 'table', label: 'Tables' },
  { key: 'rug', label: 'Rugs' },
  { key: 'cupboard', label: 'Cupboards' },
];

const TIMES = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

export default function CustomerShop() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, cart, openCart } = useCart();

  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [activeCat, setActiveCat] = useState('all');

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');


  const [viewingModal, setViewingModal] = useState(null);
  const [viewingForm, setViewingForm] = useState({ phone: '', date: '', time: '10:00 AM' });
  const [viewingDone, setViewingDone] = useState(false);
  const [viewingLoginPrompt, setViewingLoginPrompt] = useState(false);
  const [pendingViewing, setPendingViewing] = useState(null);

  useEffect(() => {
    supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setListings(data || []); setLoadingListings(false); });
  }, []);

  const filtered = listings
    .filter((item) =>
      (activeCat === 'all' || item.category === activeCat) &&
      item.status !== 'sold' &&
      (!search || item.name?.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
      if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const openViewing = (item) => {
    if (!user) { setPendingViewing(item); setViewingLoginPrompt(true); return; }
    setViewingModal(item);
    setViewingForm({ phone: user.phone || '', date: '', time: '10:00 AM' });
    setViewingDone(false);
  };

  const submitViewing = async () => {
    if (!viewingForm.date) return;
    const bookingData = {
      id: `VB-${Date.now()}`,
      listing_id: viewingModal.id,
      listing_name: viewingModal.name,
      customer_name: user.name,
      customer_email: user.email,
      customer_phone: viewingForm.phone,
      date: viewingForm.date,
      time: viewingForm.time,
      status: 'pending',
    };
    await supabase.from('viewing_bookings').insert(bookingData);
    supabase.functions.invoke('notify-admin', { body: { type: 'viewing', data: bookingData } });
    setViewingDone(true);
    toast('Viewing requested! We\'ll confirm within 24 hours.');
    setTimeout(() => setViewingModal(null), 2500);
  };

  const tabStyle = (key) => ({
    padding: '0.65rem 1.3rem',
    background: activeCat === key ? '#1a3a5c' : 'transparent',
    color: activeCat === key ? '#f0d8c8' : '#2a3d52',
    border: '2px solid ' + (activeCat === key ? '#1a3a5c' : '#b8c8d8'),
    marginRight: '-1px', cursor: 'pointer', fontFamily: 'var(--font-body)',
    fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, transition: 'all 0.2s',
  });


  return (
    <div style={{ minHeight: '100vh', background: '#f8f4ee' }}>
      <CustomerNav />

      {/* ── PAGE HEADER ── */}
      <section className="shop-header" style={{ padding: '3rem 3rem 2rem', borderBottom: '2px solid #b8c8d8', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#c04a1a', fontWeight: 700, marginBottom: '0.5rem' }}>Chic Furnish · Auckland, NZ</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 600, lineHeight: 1.1, color: '#0f1e2e' }}>
            Browse the <em style={{ color: '#2e5f8a' }}>Collection</em>
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, color: '#0f1e2e' }}>{filtered.length}</p>
          <p style={{ fontSize: '0.82rem', color: '#4a5e72', fontWeight: 600 }}>{filtered.length === 1 ? 'item available' : 'items available'}</p>
        </div>
      </section>

      {/* ── FILTER BAR ── */}
      <div className="shop-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem 3rem', borderBottom: '2px solid #b8c8d8', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="cat-tabs" style={{ display: 'flex', flexWrap: 'wrap' }}>
          {CATS.map((c) => <button key={c.key} style={tabStyle(c.key)} onClick={() => setActiveCat(c.key)}>{c.label}</button>)}
        </div>
        <div className="search-sort" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search furniture…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '0.5rem 1rem', border: '2px solid #b8c8d8', fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--ink)', outline: 'none', width: 200 }}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', border: '2px solid #b8c8d8', fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--ink)', background: 'white', cursor: 'pointer' }}
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>
      </div>

      {/* ── PRODUCTS GRID ── */}
      <div className="shop-grid" style={{ padding: '2.5rem 3rem 4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem' }}>
        {loadingListings ? (
          [1,2,3,4].map((i) => (
            <div key={i} className="product-card" style={{ pointerEvents: 'none' }}>
              <div className="product-card-img" style={{ background: 'linear-gradient(90deg,#e8e2da 25%,#f0ebe3 50%,#e8e2da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
              <div className="product-card-body">
                <div style={{ height: 16, width: '60%', background: '#e8e2da', borderRadius: 3, marginBottom: '0.5rem', animation: 'shimmer 1.4s infinite' }} />
                <div style={{ height: 14, width: '40%', background: '#e8e2da', borderRadius: 3, animation: 'shimmer 1.4s infinite' }} />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem 0' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 600, color: '#1a3a5c', marginBottom: '0.75rem' }}>{search ? `No results for "${search}"` : 'No items listed yet'}</p>
            <p style={{ fontSize: '1rem', color: '#4a5e72', fontWeight: 500 }}>{search ? 'Try a different search term or browse all categories.' : 'Check back soon — new pieces are added regularly.'}</p>
          </div>
        ) : filtered.map((item) => (
          <div key={item.id} className="product-card" onClick={() => navigate(`/shop/${item.id}`)}>
            {/* Image */}
            <div className="product-card-img">
              {item.photo_url
                ? <img src={item.photo_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} />
                : <div style={{ width: '100%', height: '100%', background: '#dde8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-display)', color: 'rgba(26,58,92,0.3)', letterSpacing: '0.3em' }}>{item.category?.toUpperCase()}</span>
                  </div>
              }
              <span className={`product-card-badge ${item.condition === 'New' ? 'badge-new' : 'badge-used'}`}>{item.condition}</span>
              {(item.photos || []).length > 0 && (
                <span className="product-card-count">+{(item.photos || []).length}</span>
              )}
            </div>
            {/* Info */}
            <div className="product-card-body">
              <h3 className="product-card-name">{item.name}</h3>
              <div className="product-card-footer">
                <span className="product-card-price">${Number(item.price).toLocaleString()} <small>NZD</small></span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    className="product-card-cta"
                    style={{ background: cart.find((c) => c.id === item.id) ? '#2e6b42' : undefined }}
                    onClick={(e) => { e.stopPropagation(); addToCart(item); openCart(); }}
                  >
                    {cart.find((c) => c.id === item.id) ? '✓ Cart' : '+ Cart'}
                  </button>
                  <button className="product-card-cta" style={{ background: '#1a3a5c' }} onClick={(e) => { e.stopPropagation(); openViewing(item); }}>View</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#1a3a5c', padding: '4rem 3rem 3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', paddingBottom: '3rem', borderBottom: '1px solid rgba(214,232,245,0.2)' }}>
          <div>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#f0a070', marginBottom: '0.75rem', fontWeight: 700 }}>New Pieces</p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, color: '#f8f4ee', marginBottom: '0.75rem' }}>Sourced fresh</h3>
            <p style={{ fontSize: '0.92rem', color: 'rgba(214,232,245,0.75)', lineHeight: 1.9, fontWeight: 400 }}>Brand new items sourced directly from our suppliers — never staged, never used. First in, first served.</p>
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#f0a070', marginBottom: '0.75rem', fontWeight: 700 }}>Second Hand</p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, color: '#f8f4ee', marginBottom: '0.75rem' }}>Pre-loved, post-staged</h3>
            <p style={{ fontSize: '0.92rem', color: 'rgba(214,232,245,0.75)', lineHeight: 1.9, fontWeight: 400 }}>Professionally staged items from sold properties. Each piece inspected, cleaned, and priced well below retail.</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, color: '#f8f4ee', letterSpacing: '0.15em' }}>CHIC <span style={{ color: '#f0a070' }}>FURNISH</span></span>
          <span style={{ fontSize: '0.82rem', color: 'rgba(214,232,245,0.5)' }}>© 2026 Chic Furnish · Auckland, New Zealand</span>
        </div>
      </footer>



      {/* ── VIEWING LOGIN PROMPT ── */}
      {viewingLoginPrompt && (
        <div className="modal-overlay" onClick={() => setViewingLoginPrompt(false)}>
          <div className="modal" style={{ maxWidth: 420, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#c04a1a', marginBottom: '1rem' }}>◈</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, color: '#0f1e2e', marginBottom: '0.75rem' }}>Sign in to book a viewing</h2>
            <p style={{ color: '#2a3d52', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '2rem', fontWeight: 400 }}>
              Create a free account or sign in to book a viewing for <strong>{pendingViewing?.name}</strong>.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button style={{ background: '#1a3a5c', color: '#f0d8c8', border: 'none', padding: '0.95rem', width: '100%', fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setViewingLoginPrompt(false); navigate('/login'); }}>Sign In</button>
              <button style={{ background: 'transparent', color: '#c04a1a', border: '2.5px solid #c04a1a', padding: '0.95rem', fontFamily: 'var(--font-body)', fontSize: '0.82rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }} onClick={() => { setViewingLoginPrompt(false); navigate('/register'); }}>Create Account</button>
              <button style={{ background: 'none', border: '1.5px solid #b8c8d8', color: '#4a5e72', padding: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => setViewingLoginPrompt(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEWING BOOKING MODAL ── */}
      {viewingModal && (
        <div className="modal-overlay" onClick={() => setViewingModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {viewingDone ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: '#c04a1a', marginBottom: '1rem' }}>✓</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, color: '#0f1e2e', marginBottom: '0.75rem' }}>Viewing Requested</h2>
                <p style={{ color: '#2a3d52', fontSize: '0.95rem', lineHeight: 1.9 }}>We'll confirm your viewing of <strong>{viewingModal.name}</strong> within 24 hours.</p>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 600, color: '#0f1e2e', marginBottom: '1.5rem' }}>Book a Viewing</h2>
                <div style={{ background: '#d6e8f5', padding: '1rem', marginBottom: '1.5rem', borderLeft: '3px solid #1a3a5c' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#0f1e2e', fontWeight: 600 }}>{viewingModal.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#2a3d52', fontWeight: 500 }}>${Number(viewingModal.price).toLocaleString()} · {viewingModal.condition}</div>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={user.name} disabled style={{ opacity: 0.7 }} /></div>
                  <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={user.email} disabled style={{ opacity: 0.7 }} /></div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={viewingForm.phone} onChange={(e) => setViewingForm({ ...viewingForm, phone: e.target.value })} placeholder="021 XXX XXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Preferred Date *</label>
                    <input className="form-input" type="date" value={viewingForm.date} onChange={(e) => setViewingForm({ ...viewingForm, date: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Time</label>
                  <select className="form-select" value={viewingForm.time} onChange={(e) => setViewingForm({ ...viewingForm, time: e.target.value })}>
                    {TIMES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button style={{ background: 'none', border: '2px solid #b8c8d8', color: '#2a3d52', padding: '0.7rem 1.3rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }} onClick={() => setViewingModal(null)}>Cancel</button>
                  <button style={{ background: '#1a3a5c', color: '#f0d8c8', border: 'none', padding: '0.7rem 1.2rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer' }} onClick={submitViewing}>Request Viewing →</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
