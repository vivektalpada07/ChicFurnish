import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerNav from '../../components/CustomerNav';
import { useAuth } from '../../context/AuthContext';
import { getListings, getViewingBookings, saveViewingBookings } from '../../context/AuthContext';

const CATS = [
  { key: 'all', label: 'All Furniture' },
  { key: 'sofa', label: 'Sofas & Chairs' },
  { key: 'table', label: 'Tables' },
  { key: 'rug', label: 'Rugs' },
  { key: 'cupboard', label: 'Cupboards' },
];

const TIMES = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
const EMPTY_DELIVERY = { street: '', suburb: '', city: '', postcode: '', notes: '' };

export default function CustomerShop() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listings, setListings] = useState([]);
  const [activeCat, setActiveCat] = useState('all');
  const [condFilter, setCondFilter] = useState('All');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartStep, setCartStep] = useState('cart');
  const [delivery, setDelivery] = useState(EMPTY_DELIVERY);
  const [deliveryError, setDeliveryError] = useState('');
  const [viewingModal, setViewingModal] = useState(null);
  const [viewingForm, setViewingForm] = useState({ phone: '', date: '', time: '10:00 AM' });
  const [viewingDone, setViewingDone] = useState(false);
  const [viewingLoginPrompt, setViewingLoginPrompt] = useState(false);
  const [pendingViewing, setPendingViewing] = useState(null);

  useEffect(() => { setListings(getListings()); }, []);

  const filtered = listings.filter((item) => {
    const catMatch = activeCat === 'all' || item.category === activeCat;
    const condMatch = condFilter === 'All' || item.condition === condFilter;
    return catMatch && condMatch && item.status !== 'sold';
  });

  const addToCart = (item) => {
    if (!cart.find((c) => c.id === item.id)) setCart([...cart, item]);
  };
  const removeFromCart = (id) => setCart(cart.filter((c) => c.id !== id));
  const cartTotal = cart.reduce((sum, c) => sum + Number(c.price), 0);

  const openCart = () => { setCartStep('cart'); setCartOpen(true); };

  const handleProceedToCheckout = () => {
    if (!user) setCartStep('login-prompt');
    else setCartStep('checkout');
  };

  const handleCheckoutSubmit = () => {
    setDeliveryError('');
    if (!delivery.street || !delivery.suburb || !delivery.city || !delivery.postcode) {
      setDeliveryError('Please fill in all address fields.');
      return;
    }
    setCartStep('confirmed');
    setCart([]);
  };

  const openViewing = (item) => {
    if (!user) { setPendingViewing(item); setViewingLoginPrompt(true); return; }
    setViewingModal(item);
    setViewingForm({ phone: '', date: '', time: '10:00 AM' });
    setViewingDone(false);
  };

  const submitViewing = () => {
    if (!viewingForm.date) return;
    const bookings = getViewingBookings();
    saveViewingBookings([...bookings, {
      id: `VB-${Date.now()}`,
      listingId: viewingModal.id,
      listingName: viewingModal.name,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: viewingForm.phone,
      date: viewingForm.date,
      time: viewingForm.time,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }]);
    setViewingDone(true);
    setTimeout(() => setViewingModal(null), 2500);
  };

  const tabStyle = (key) => ({
    padding: '0.65rem 1.3rem',
    background: activeCat === key ? '#1a1714' : 'transparent',
    color: activeCat === key ? '#e8d5a0' : '#3a3028',
    border: '1.5px solid ' + (activeCat === key ? '#1a1714' : '#b8a070'),
    marginRight: '-1px',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: '0.78rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontWeight: 600,
    transition: 'all 0.2s',
  });

  /* ─── shared dark button style for nav-area buttons ─── */
  const darkBtn = {
    background: '#1a1714',
    color: '#e8d5a0',
    border: 'none',
    padding: '0.6rem 1.4rem',
    fontFamily: 'var(--font-body)',
    fontSize: '0.78rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    fontWeight: 600,
    cursor: 'pointer',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0ebe0' }}>
      <CustomerNav cartCount={cart.length} onCartClick={openCart} />

      {/* ── PAGE HEADER ── */}
      <section style={{
        padding: '3.5rem 3rem 2rem',
        borderBottom: '1.5px solid #c8a860',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        background: '#f0ebe0',
      }}>
        <div>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#7a5c10', fontWeight: 700, marginBottom: '0.5rem' }}>
            Chic Furnish · Auckland, NZ
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 400, lineHeight: 1.1, color: '#1a1714' }}>
            Browse the <em style={{ color: '#7a5c10' }}>Collection</em>
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 400, color: '#1a1714' }}>
            {filtered.length}
          </p>
          <p style={{ fontSize: '0.78rem', color: '#5a5048', fontWeight: 500, letterSpacing: '0.08em' }}>
            {filtered.length === 1 ? 'item available' : 'items available'}
          </p>
        </div>
      </section>

      {/* ── FILTER BAR ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.2rem 3rem',
        borderBottom: '1.5px solid #c8a860',
        background: '#f0ebe0',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        {/* Category tabs */}
        <div style={{ display: 'flex' }}>
          {CATS.map((c) => (
            <button key={c.key} style={tabStyle(c.key)} onClick={() => setActiveCat(c.key)}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Condition filter + cart button */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {['All', 'New', 'Second Hand'].map((c) => (
            <button key={c} onClick={() => setCondFilter(c)} style={{
              padding: '0.5rem 1rem',
              background: condFilter === c ? '#3a3028' : 'transparent',
              color: condFilter === c ? '#e8d5a0' : '#3a3028',
              border: '1.5px solid ' + (condFilter === c ? '#3a3028' : '#b8a070'),
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}>{c}</button>
          ))}
          {cart.length > 0 && (
            <button style={{ ...darkBtn, marginLeft: '0.5rem', background: '#7a5c10' }} onClick={openCart}>
              Cart ({cart.length}) · ${cartTotal.toLocaleString()}
            </button>
          )}
        </div>
      </div>

      {/* ── PRODUCTS GRID ── */}
      <div style={{
        padding: '2.5rem 3rem 4rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
        background: '#f0ebe0',
      }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 0' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 400, color: '#3a3028', marginBottom: '0.75rem' }}>
              No items listed yet
            </p>
            <p style={{ fontSize: '0.9rem', color: '#5a5048', fontWeight: 400 }}>
              The admin is adding pieces — check back soon.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'white',
                border: '1.5px solid #c8a860',
                overflow: 'hidden',
                transition: 'transform 0.25s, box-shadow 0.25s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(120,90,40,0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Image placeholder */}
              <div style={{
                height: 230,
                background: 'linear-gradient(135deg, #e8e0d0, #d0c8b8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'rgba(26,23,20,0.3)', letterSpacing: '0.18em', fontWeight: 400 }}>
                  {item.category.toUpperCase()}
                </span>
                {/* Condition badge */}
                <span style={{
                  position: 'absolute', top: '0.75rem', left: '0.75rem',
                  background: item.condition === 'New' ? '#1a4a28' : '#4a3000',
                  color: item.condition === 'New' ? '#a8e8b8' : '#f8d878',
                  fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                  padding: '0.35rem 0.75rem', fontWeight: 700,
                }}>
                  {item.condition}
                </span>
              </div>

              {/* Product info */}
              <div style={{ padding: '1.4rem 1.5rem 1.6rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 400, marginBottom: '0.4rem', color: '#1a1714' }}>
                  {item.name}
                </h3>
                {item.desc && (
                  <p style={{ fontSize: '0.85rem', color: '#4a4038', marginBottom: '1rem', lineHeight: 1.75, fontWeight: 400 }}>
                    {item.desc}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.2rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 400, color: '#1a1714' }}>
                    ${Number(item.price).toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#5a5048', fontWeight: 600, letterSpacing: '0.08em' }}>NZD</span>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    style={{ ...darkBtn, flex: 1, padding: '0.7rem 0.5rem', fontSize: '0.72rem' }}
                    onClick={() => openViewing(item)}
                  >
                    Book Viewing
                  </button>
                  <button
                    style={{
                      flex: 1, padding: '0.7rem 0.5rem',
                      background: cart.find((c) => c.id === item.id) ? '#e8e0d0' : 'transparent',
                      color: cart.find((c) => c.id === item.id) ? '#5a5048' : '#7a5c10',
                      border: '1.5px solid ' + (cart.find((c) => c.id === item.id) ? '#c8a860' : '#7a5c10'),
                      fontFamily: 'var(--font-body)', fontSize: '0.72rem',
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onClick={() => addToCart(item)}
                  >
                    {cart.find((c) => c.id === item.id) ? '✓ In Cart' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── FOOTER INFO ── */}
      <footer style={{ background: '#1a1714', padding: '4rem 3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderTop: '1px solid rgba(200,168,96,0.3)', paddingTop: '3rem' }}>
          <div style={{ padding: '0 3rem 0 0', borderRight: '1px solid rgba(200,168,96,0.2)' }}>
            <p style={{ fontSize: '0.68rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#c8a860', marginBottom: '0.75rem', fontWeight: 700 }}>
              New Pieces
            </p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, color: '#f0ebe0', marginBottom: '0.75rem' }}>
              Sourced fresh
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'rgba(240,235,224,0.65)', lineHeight: 1.9, fontWeight: 400 }}>
              Brand new items sourced directly from our suppliers — never staged, never used. First in, first served.
            </p>
          </div>
          <div style={{ padding: '0 0 0 3rem' }}>
            <p style={{ fontSize: '0.68rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#c8a860', marginBottom: '0.75rem', fontWeight: 700 }}>
              Second Hand
            </p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, color: '#f0ebe0', marginBottom: '0.75rem' }}>
              Pre-loved, post-staged
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'rgba(240,235,224,0.65)', lineHeight: 1.9, fontWeight: 400 }}>
              Professionally staged items from sold properties. Each piece inspected, cleaned, and priced well below retail. A smarter way to buy luxury.
            </p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(200,168,96,0.2)', marginTop: '3rem', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 300, color: '#f0ebe0', letterSpacing: '0.15em' }}>
            CHIC <span style={{ color: '#c8a860' }}>FURNISH</span>
          </span>
          <span style={{ fontSize: '0.78rem', color: 'rgba(240,235,224,0.4)', letterSpacing: '0.08em' }}>
            © 2025 Chic Furnish · Auckland, New Zealand
          </span>
        </div>
      </footer>

      {/* ── CART PANEL ── */}
      {cartOpen && (
        <div className="modal-overlay" onClick={() => setCartOpen(false)}>
          <div style={{
            background: '#f0ebe0', border: '1.5px solid #c8a860',
            padding: '2.5rem', width: '100%', maxWidth: 500,
            marginLeft: 'auto', height: '100vh', maxHeight: '100vh',
            overflowY: 'auto', display: 'flex', flexDirection: 'column',
          }} onClick={(e) => e.stopPropagation()}>

            {/* Cart items */}
            {cartStep === 'cart' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 400, color: '#1a1714' }}>Your Cart</h2>
                  <button style={{ background: 'none', border: '1.5px solid #b8a070', color: '#3a3028', padding: '0.4rem 0.9rem', fontSize: '0.72rem', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.1em' }} onClick={() => setCartOpen(false)}>✕ Close</button>
                </div>
                <div style={{ flex: 1 }}>
                  {cart.length === 0 ? (
                    <p style={{ color: '#5a5048', fontSize: '0.95rem', fontWeight: 400 }}>Your cart is empty.</p>
                  ) : cart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #c8a860' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: '#1a1714', marginBottom: '0.2rem' }}>{item.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#5a5048', fontWeight: 500 }}>{item.condition}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#1a1714' }}>${Number(item.price).toLocaleString()}</span>
                        <button style={{ background: 'none', border: '1px solid #b8a070', color: '#5a5048', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }} onClick={() => removeFromCart(item.id)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                {cart.length > 0 && (
                  <div style={{ borderTop: '2px solid #7a5c10', paddingTop: '1.5rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#1a1714' }}>Total</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#7a5c10', fontWeight: 400 }}>${cartTotal.toLocaleString()} NZD</span>
                    </div>
                    <button style={{ ...darkBtn, width: '100%', padding: '1rem', fontSize: '0.82rem' }} onClick={handleProceedToCheckout}>
                      Proceed to Checkout →
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Login prompt */}
            {cartStep === 'login-prompt' && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#7a5c10', marginBottom: '1rem' }}>◈</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 400, color: '#1a1714', marginBottom: '0.75rem' }}>Sign in to checkout</h2>
                <p style={{ color: '#4a4038', fontSize: '0.92rem', lineHeight: 1.8, marginBottom: '2rem', fontWeight: 400 }}>
                  Please sign in or create a free account to complete your purchase.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button style={{ ...darkBtn, padding: '0.95rem' }} onClick={() => { setCartOpen(false); navigate('/login'); }}>Sign In</button>
                  <button style={{ background: 'transparent', color: '#7a5c10', border: '2px solid #7a5c10', padding: '0.95rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }} onClick={() => { setCartOpen(false); navigate('/register'); }}>Create Account</button>
                  <button style={{ background: 'none', border: '1px solid #b8a070', color: '#5a5048', padding: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' }} onClick={() => setCartStep('cart')}>← Back to Cart</button>
                </div>
              </div>
            )}

            {/* Checkout */}
            {cartStep === 'checkout' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 400, color: '#1a1714' }}>Delivery Details</h2>
                  <button style={{ background: 'none', border: '1.5px solid #b8a070', color: '#3a3028', padding: '0.4rem 0.9rem', fontSize: '0.72rem', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setCartStep('cart')}>← Back</button>
                </div>
                {/* Order summary */}
                <div style={{ background: '#e5ddd0', padding: '1rem', marginBottom: '1.5rem', borderLeft: '3px solid #7a5c10' }}>
                  <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5a5048', marginBottom: '0.5rem', fontWeight: 700 }}>Order Summary</p>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#1a1714', marginBottom: '0.25rem', fontWeight: 400 }}>
                      <span>{item.name}</span>
                      <span style={{ color: '#7a5c10', fontWeight: 600 }}>${Number(item.price).toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #c8a860', fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#1a1714' }}>
                    <span>Total</span><span>${cartTotal.toLocaleString()} NZD</span>
                  </div>
                </div>
                {deliveryError && <div style={{ background: '#f8d7da', border: '1px solid #c0392b', color: '#7a1010', padding: '0.75rem 1rem', fontSize: '0.88rem', fontWeight: 600, marginBottom: '1rem' }}>{deliveryError}</div>}
                <div className="form-group"><label className="form-label">Street Address *</label><input className="form-input" value={delivery.street} onChange={(e) => setDelivery({ ...delivery, street: e.target.value })} placeholder="14 Example Street" /></div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Suburb *</label><input className="form-input" value={delivery.suburb} onChange={(e) => setDelivery({ ...delivery, suburb: e.target.value })} placeholder="Ponsonby" /></div>
                  <div className="form-group"><label className="form-label">City *</label><input className="form-input" value={delivery.city} onChange={(e) => setDelivery({ ...delivery, city: e.target.value })} placeholder="Auckland" /></div>
                </div>
                <div className="form-group"><label className="form-label">Postcode *</label><input className="form-input" value={delivery.postcode} onChange={(e) => setDelivery({ ...delivery, postcode: e.target.value })} placeholder="1011" /></div>
                <div className="form-group"><label className="form-label">Delivery Notes</label><textarea className="form-textarea" style={{ minHeight: 70 }} value={delivery.notes} onChange={(e) => setDelivery({ ...delivery, notes: e.target.value })} placeholder="Gate code, access instructions..." /></div>
                <button style={{ ...darkBtn, width: '100%', padding: '1rem', fontSize: '0.82rem', marginTop: '0.5rem' }} onClick={handleCheckoutSubmit}>Confirm Order →</button>
              </>
            )}

            {/* Confirmed */}
            {cartStep === 'confirmed' && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: '#7a5c10', marginBottom: '1rem' }}>✓</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 400, color: '#1a1714', marginBottom: '0.75rem' }}>Order Received</h2>
                <p style={{ color: '#4a4038', fontSize: '0.92rem', lineHeight: 1.9, marginBottom: '2rem', maxWidth: 300, fontWeight: 400 }}>
                  Thank you, {user?.name?.split(' ')[0]}! Our team will be in touch within 24 hours to arrange delivery.
                </p>
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
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#7a5c10', marginBottom: '1rem' }}>◈</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, color: '#1a1714', marginBottom: '0.75rem' }}>Sign in to book a viewing</h2>
            <p style={{ color: '#4a4038', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '2rem', fontWeight: 400 }}>
              Create a free account or sign in to book a viewing for <strong>{pendingViewing?.name}</strong>.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button style={{ ...darkBtn, padding: '0.95rem' }} onClick={() => { setViewingLoginPrompt(false); navigate('/login'); }}>Sign In</button>
              <button style={{ background: 'transparent', color: '#7a5c10', border: '2px solid #7a5c10', padding: '0.95rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }} onClick={() => { setViewingLoginPrompt(false); navigate('/register'); }}>Create Account</button>
              <button style={{ background: 'none', border: '1px solid #b8a070', color: '#5a5048', padding: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => setViewingLoginPrompt(false)}>Cancel</button>
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
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: '#7a5c10', marginBottom: '1rem' }}>✓</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, color: '#1a1714', marginBottom: '0.75rem' }}>Viewing Requested</h2>
                <p style={{ color: '#4a4038', fontSize: '0.9rem', lineHeight: 1.9, fontWeight: 400 }}>
                  We'll confirm your viewing of <strong>{viewingModal.name}</strong> within 24 hours.
                </p>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 400, color: '#1a1714', marginBottom: '1.5rem' }}>Book a Viewing</h2>
                <div style={{ background: '#e5ddd0', padding: '1rem', marginBottom: '1.5rem', borderLeft: '3px solid #7a5c10' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#1a1714' }}>{viewingModal.name}</div>
                  <div style={{ fontSize: '0.82rem', color: '#5a5048', fontWeight: 500 }}>${Number(viewingModal.price).toLocaleString()} · {viewingModal.condition}</div>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={user.name} disabled style={{ opacity: 0.7 }} /></div>
                  <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={user.email} disabled style={{ opacity: 0.7 }} /></div>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={viewingForm.phone} onChange={(e) => setViewingForm({ ...viewingForm, phone: e.target.value })} placeholder="021 XXX XXX" /></div>
                  <div className="form-group"><label className="form-label">Preferred Date *</label><input className="form-input" type="date" value={viewingForm.date} onChange={(e) => setViewingForm({ ...viewingForm, date: e.target.value })} /></div>
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Time</label>
                  <select className="form-select" value={viewingForm.time} onChange={(e) => setViewingForm({ ...viewingForm, time: e.target.value })}>
                    {TIMES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button style={{ background: 'none', border: '1.5px solid #b8a070', color: '#5a5048', padding: '0.65rem 1.4rem', fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }} onClick={() => setViewingModal(null)}>Cancel</button>
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
