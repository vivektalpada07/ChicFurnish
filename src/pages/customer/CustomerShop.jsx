import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerNav from '../../components/CustomerNav';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

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

  const [listings, setListings] = useState([]);
  const [activeCat, setActiveCat] = useState('all');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartStep, setCartStep] = useState('cart');

  const [checkout, setCheckout] = useState({
    name: '', email: '', phone: '',
    street: '', suburb: '', city: 'Auckland', postcode: '',
    shippingOption: 'arrange',
    paymentMethod: 'bank',
    notes: '',
  });
  const [checkoutError, setCheckoutError] = useState('');

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
      .then(({ data }) => setListings(data || []));
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

  const removeFromCart = (id) => setCart(cart.filter((c) => c.id !== id));
  const cartTotal = cart.reduce((sum, c) => sum + Number(c.price), 0);
  const openCart = () => { setCartStep('cart'); setCartOpen(true); };

  const handleProceedToCheckout = () => {
    if (!user) { setCartStep('login-prompt'); return; }
    setCheckout((prev) => ({ ...prev, name: user.name || '', email: user.email || '', phone: user.phone || '' }));
    setCartStep('checkout');
  };

  const handleConfirmOrder = () => {
    setCheckoutError('');
    if (!checkout.name || !checkout.email) { setCheckoutError('Name and email are required.'); return; }
    if (checkout.shippingOption === 'arrange' && (!checkout.street || !checkout.suburb || !checkout.postcode)) {
      setCheckoutError('Please fill in your delivery address.'); return;
    }
    setCartStep('confirmed');
    setCart([]);
  };

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

  const darkBtn = {
    background: '#1a3a5c', color: '#f0d8c8', border: 'none', padding: '0.7rem 1.2rem',
    fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.15em',
    textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer',
  };

  const radioRow = (label, sublabel, value, field) => (
    <label key={value} style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      padding: '1rem', border: '2px solid ' + (checkout[field] === value ? '#1a3a5c' : '#b8c8d8'),
      background: checkout[field] === value ? '#eef5fb' : 'white',
      cursor: 'pointer', marginBottom: '0.6rem', transition: 'all 0.2s',
    }}>
      <input
        type="radio" name={field} value={value}
        checked={checkout[field] === value}
        onChange={() => setCheckout({ ...checkout, [field]: value })}
        style={{ marginTop: '3px', accentColor: '#1a3a5c', width: 18, height: 18 }}
      />
      <div>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f1e2e' }}>{label}</div>
        {sublabel && <div style={{ fontSize: '0.82rem', color: '#4a5e72', marginTop: '0.2rem', fontWeight: 400 }}>{sublabel}</div>}
      </div>
    </label>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8f4ee' }}>
      <CustomerNav cartCount={cart.length} onCartClick={openCart} />

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
        {filtered.length === 0 ? (
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
                <button className="product-card-cta" onClick={(e) => { e.stopPropagation(); openViewing(item); }}>Book Viewing</button>
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


      {/* ── CART / CHECKOUT PANEL ── */}
      {cartOpen && (
        <div className="modal-overlay" onClick={() => setCartOpen(false)}>
          <div style={{ background: '#f8f4ee', border: '2px solid #b8c8d8', padding: '2.5rem', width: '100%', maxWidth: 540, marginLeft: 'auto', height: '100vh', maxHeight: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>

            {cartStep === 'cart' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 600, color: '#0f1e2e' }}>Your Cart</h2>
                  <button style={{ background: 'none', border: '2px solid #b8c8d8', color: '#2a3d52', padding: '0.4rem 0.9rem', fontSize: '0.75rem', fontFamily: 'var(--font-body)', fontWeight: 700, cursor: 'pointer' }} onClick={() => setCartOpen(false)}>✕ Close</button>
                </div>
                <div style={{ flex: 1 }}>
                  {cart.length === 0 ? (
                    <p style={{ color: '#4a5e72', fontSize: '1rem', fontWeight: 500 }}>Your cart is empty.</p>
                  ) : cart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1.5px solid #b8c8d8' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#0f1e2e', fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: '0.82rem', color: '#4a5e72', fontWeight: 500 }}>{item.condition}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: '#0f1e2e', fontWeight: 600 }}>${Number(item.price).toLocaleString()}</span>
                        <button style={{ background: 'none', border: '1.5px solid #b8c8d8', color: '#4a5e72', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }} onClick={() => removeFromCart(item.id)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                {cart.length > 0 && (
                  <div style={{ borderTop: '2.5px solid #c04a1a', paddingTop: '1.5rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: '#0f1e2e', fontWeight: 600 }}>Subtotal</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#c04a1a', fontWeight: 600 }}>${cartTotal.toLocaleString()} NZD</span>
                    </div>
                    <button style={{ ...darkBtn, width: '100%', padding: '1rem', fontSize: '0.85rem' }} onClick={handleProceedToCheckout}>Proceed to Checkout →</button>
                  </div>
                )}
              </>
            )}

            {cartStep === 'login-prompt' && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: '#c04a1a', marginBottom: '1rem' }}>◈</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 600, color: '#0f1e2e', marginBottom: '0.75rem' }}>Sign in to checkout</h2>
                <p style={{ color: '#2a3d52', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2rem' }}>Please sign in so we can fill your details automatically and save your order.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button style={{ ...darkBtn, padding: '0.95rem', width: '100%' }} onClick={() => { setCartOpen(false); navigate('/login'); }}>Sign In</button>
                  <button style={{ background: 'transparent', color: '#c04a1a', border: '2.5px solid #c04a1a', padding: '0.95rem', fontFamily: 'var(--font-body)', fontSize: '0.82rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }} onClick={() => { setCartOpen(false); navigate('/register'); }}>Create Account</button>
                  <button style={{ background: 'none', border: '1.5px solid #b8c8d8', color: '#4a5e72', padding: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' }} onClick={() => setCartStep('cart')}>← Back to Cart</button>
                </div>
              </div>
            )}

            {cartStep === 'checkout' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 600, color: '#0f1e2e' }}>Checkout</h2>
                  <button style={{ background: 'none', border: '2px solid #b8c8d8', color: '#2a3d52', padding: '0.4rem 0.9rem', fontSize: '0.75rem', fontFamily: 'var(--font-body)', fontWeight: 700, cursor: 'pointer' }} onClick={() => setCartStep('cart')}>← Back</button>
                </div>

                {checkoutError && <div style={{ background: '#fde8e8', border: '1.5px solid #c04a1a', color: '#7a1a00', padding: '0.8rem 1rem', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>{checkoutError}</div>}

                <div style={{ background: '#d6e8f5', padding: '1.1rem', marginBottom: '1.5rem', borderLeft: '3px solid #1a3a5c' }}>
                  <p style={{ fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1a3a5c', marginBottom: '0.6rem', fontWeight: 700 }}>Order Summary</p>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: '#0f1e2e', marginBottom: '0.3rem', fontWeight: 500 }}>
                      <span>{item.name} <span style={{ color: '#4a5e72', fontSize: '0.8rem' }}>({item.condition})</span></span>
                      <span style={{ color: '#c04a1a', fontWeight: 700 }}>${Number(item.price).toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1.5px solid #b8c8d8', fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#0f1e2e', fontWeight: 600 }}>
                    <span>Items Total</span><span>${cartTotal.toLocaleString()} NZD</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1a3a5c', fontWeight: 700, marginBottom: '0.75rem', borderBottom: '1.5px solid #b8c8d8', paddingBottom: '0.5rem' }}>Your Details</p>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" value={checkout.name} onChange={(e) => setCheckout({ ...checkout, name: e.target.value })} placeholder="Your name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" value={checkout.phone} onChange={(e) => setCheckout({ ...checkout, phone: e.target.value })} placeholder="021 XXX XXX" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" value={checkout.email} onChange={(e) => setCheckout({ ...checkout, email: e.target.value })} placeholder="you@email.com" />
                </div>

                <p style={{ fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1a3a5c', fontWeight: 700, margin: '1.25rem 0 0.75rem', borderBottom: '1.5px solid #b8c8d8', paddingBottom: '0.5rem' }}>Arrange Shipping</p>

                {radioRow('Deliver to my address', 'Enter your delivery address below', 'arrange', 'shippingOption')}
                {radioRow('Click & Collect', 'Collect from our Auckland warehouse — free', 'pickup', 'shippingOption')}

                {checkout.shippingOption === 'arrange' && (
                  <div style={{ background: '#eef5fb', border: '1.5px solid #b8c8d8', padding: '1rem', marginBottom: '0.5rem' }}>
                    <p style={{ fontSize: '0.78rem', color: '#1a3a5c', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.08em' }}>Delivery Address</p>
                    <div className="form-group">
                      <label className="form-label">Street Address *</label>
                      <input className="form-input" value={checkout.street} onChange={(e) => setCheckout({ ...checkout, street: e.target.value })} placeholder="14 Example Street" />
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Suburb *</label>
                        <input className="form-input" value={checkout.suburb} onChange={(e) => setCheckout({ ...checkout, suburb: e.target.value })} placeholder="Ponsonby" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input className="form-input" value={checkout.city} onChange={(e) => setCheckout({ ...checkout, city: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Postcode *</label>
                      <input className="form-input" value={checkout.postcode} onChange={(e) => setCheckout({ ...checkout, postcode: e.target.value })} placeholder="1011" />
                    </div>
                    <div style={{ background: '#fff3cd', border: '1.5px solid #c8960a', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#664d00', fontWeight: 600 }}>
                      Shipping cost will be arranged with the seller after your order is confirmed.
                    </div>
                  </div>
                )}

                {checkout.shippingOption === 'pickup' && (
                  <div style={{ background: '#d4edda', border: '1.5px solid #1e8840', padding: '0.75rem 1rem', fontSize: '0.88rem', color: '#0f4020', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Our team will contact you with collection details within 24 hours.
                  </div>
                )}

                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label className="form-label">Delivery Notes</label>
                  <textarea className="form-textarea" style={{ minHeight: 65 }} value={checkout.notes} onChange={(e) => setCheckout({ ...checkout, notes: e.target.value })} placeholder="Gate code, access instructions, preferred time…" />
                </div>

                <p style={{ fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1a3a5c', fontWeight: 700, margin: '1.25rem 0 0.75rem', borderBottom: '1.5px solid #b8c8d8', paddingBottom: '0.5rem' }}>How Would You Like to Pay?</p>

                {radioRow('Bank Transfer', 'Our account details will be emailed to you', 'bank', 'paymentMethod')}
                {radioRow('Cash on Delivery / Pickup', 'Pay cash when your item is delivered or collected', 'cash', 'paymentMethod')}
                {radioRow('Card Payment', 'We will arrange payment upon pickup or delivery', 'card', 'paymentMethod')}

                <div style={{ background: '#1a3a5c', padding: '1.25rem', margin: '1.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'rgba(214,232,245,0.8)', fontWeight: 500 }}>
                    <span>Items</span><span>${cartTotal.toLocaleString()} NZD</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'rgba(214,232,245,0.8)', fontWeight: 500 }}>
                    <span>Shipping</span>
                    <span style={{ color: '#f0a070' }}>{checkout.shippingOption === 'pickup' ? 'Free (Collection)' : 'To be confirmed'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid rgba(214,232,245,0.25)', fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: '#f8f4ee', fontWeight: 600 }}>
                    <span>Total</span>
                    <span style={{ color: '#f0a070' }}>${cartTotal.toLocaleString()} NZD {checkout.shippingOption === 'arrange' ? '+ shipping' : ''}</span>
                  </div>
                </div>

                <button style={{ ...darkBtn, width: '100%', padding: '1.1rem', fontSize: '0.88rem' }} onClick={handleConfirmOrder}>
                  Confirm Order →
                </button>
              </>
            )}

            {cartStep === 'confirmed' && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: '#c04a1a', marginBottom: '1rem' }}>✓</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, color: '#0f1e2e', marginBottom: '0.75rem' }}>Order Confirmed!</h2>
                <p style={{ color: '#2a3d52', fontSize: '1rem', lineHeight: 1.9, marginBottom: '0.75rem', maxWidth: 320, fontWeight: 400 }}>
                  Thank you, <strong>{checkout.name.split(' ')[0]}</strong>! A confirmation has been sent to <strong>{checkout.email}</strong>.
                </p>
                <p style={{ color: '#4a5e72', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '2rem', maxWidth: 320 }}>
                  {checkout.shippingOption === 'arrange'
                    ? 'Our team will contact you within 24 hours to confirm shipping costs and arrange delivery.'
                    : 'Our team will contact you within 24 hours with collection details.'}
                </p>
                <div style={{ background: '#d6e8f5', border: '1.5px solid #2e5f8a', padding: '1rem', marginBottom: '2rem', width: '100%', maxWidth: 320, textAlign: 'left' }}>
                  <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1a3a5c', fontWeight: 700, marginBottom: '0.5rem' }}>Payment Method</p>
                  <p style={{ fontSize: '0.92rem', color: '#0f1e2e', fontWeight: 600 }}>
                    {checkout.paymentMethod === 'bank' ? 'Bank Transfer — details sent to your email' : checkout.paymentMethod === 'cash' ? 'Cash on delivery / collection' : 'Card — our team will call you'}
                  </p>
                </div>
                <button style={darkBtn} onClick={() => { setCartOpen(false); setCartStep('cart'); }}>Continue Browsing</button>
              </div>
            )}
          </div>
        </div>
      )}

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
              <button style={{ ...darkBtn, padding: '0.95rem', width: '100%' }} onClick={() => { setViewingLoginPrompt(false); navigate('/login'); }}>Sign In</button>
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
                  <button style={darkBtn} onClick={submitViewing}>Request Viewing →</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
