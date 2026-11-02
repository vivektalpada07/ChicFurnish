import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';


const darkBtn = {
  background: '#1a3a5c', color: '#f0d8c8', border: 'none', padding: '0.7rem 1.2rem',
  fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.15em',
  textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer',
};

function RadioRow({ label, sublabel, value, field, checkout, setCheckout }) {
  return (
    <label style={{
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
}

export default function CartDrawer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, removeFromCart, clearCart, cartOpen, closeCart, cartStep, setCartStep, cartTotal } = useCart();

  const [checkout, setCheckout] = useState({
    name: '', email: '', phone: '',
    street: '', suburb: '', city: 'Auckland', postcode: '',
    shippingOption: 'arrange',
    paymentMethod: 'bank',
    notes: '',
  });
  const [checkoutError, setCheckoutError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // When the cart opens, drop any items that have been sold or removed since they were added
  useEffect(() => {
    if (!cartOpen || cart.length === 0) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('id, status, stock')
        .in('id', cart.map((c) => c.id));
      if (cancelled || error || !data) return;

      const stillAvailable = new Set(
        data
          .filter((l) =>
            String(l.status || '').toLowerCase() === 'available' &&
            !(l.stock != null && Number(l.stock) <= 0)
          )
          .map((l) => l.id)
      );
      const gone = cart.filter((c) => !stillAvailable.has(c.id));
      if (gone.length === 0) return;

      gone.forEach((c) => removeFromCart(c.id));
      setCheckoutError(
        gone.length === 1
          ? `Sorry, "${gone[0].name}" has been sold and was removed from your cart.`
          : `Sorry, ${gone.length} items in your cart have been sold and were removed.`
      );
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartOpen]);

  if (!cartOpen) return null;

  const fieldStyle = (v) => (showErrors && !String(v || '').trim() ? { borderColor: '#c04a1a', background: '#fff5f2' } : undefined);

  const handleProceedToCheckout = () => {
    if (!user) { setCartStep('login-prompt'); return; }
    setCheckoutError('');
    setCheckout((prev) => ({ ...prev, name: user.name || '', email: user.email || '', phone: user.phone || '' }));
    setCartStep('checkout');
  };

  const handleConfirmOrder = async () => {
    if (placing) return;
    setCheckoutError('');
    const needsAddress = checkout.shippingOption === 'arrange';
    const missing =
      !checkout.name.trim() || !checkout.phone.trim() || !checkout.email.trim() ||
      (needsAddress && (!checkout.street.trim() || !checkout.suburb.trim() || !checkout.postcode.trim()));
    if (missing) {
      setShowErrors(true);
      setCheckoutError('Please enter all required details (marked *) before confirming your order.');
      return;
    }
    if (checkout.phone.replace(/\D/g, '').length < 7) {
      setShowErrors(true);
      setCheckoutError('Please enter a valid phone number.');
      return;
    }
    setShowErrors(false);

    setPlacing(true);
    try {
      const orderData = {
        id: `ORD-${Date.now()}`,
        customer_name: checkout.name,
        customer_email: checkout.email,
        customer_phone: checkout.phone,
        items: cart.map((c) => ({ id: c.id, name: c.name, price: c.price, condition: c.condition })),
        total: cartTotal,
        shipping_option: checkout.shippingOption,
        street: checkout.street,
        suburb: checkout.suburb,
        city: checkout.city,
        postcode: checkout.postcode,
        payment_method: checkout.paymentMethod,
        notes: checkout.notes,
        status: 'pending',
      };

      // Reserve the items AND save the order in one database transaction.
      // If anything fails, the reservation is rolled back automatically,
      // so an item can never be left marked Sold without an order.
      const { error: orderError } = await supabase.rpc('place_order', {
        p_ids: cart.map((c) => c.id),
        p_order: orderData,
      });

      if (orderError) {
        const match = /ITEM_SOLD:([0-9a-f-]{36})/i.exec(orderError.message || '');
        if (match) {
          const soldItem = cart.find((c) => c.id === match[1]);
          const lastItem = cart.length <= 1;
          removeFromCart(match[1]);
          setCheckoutError(`Sorry, "${soldItem?.name || 'an item'}" has just been sold and was removed from your cart.`);
          if (lastItem) setCartStep('cart');
        } else if (String(orderError.message || '').includes('NOT_SIGNED_IN')) {
          setCheckoutError('Please sign in again to place your order.');
        } else {
          console.error('PLACE ORDER ERROR:', orderError);
          setCheckoutError('We could not save your order. Please contact us before trying again.');
        }
        return;
      }

      // Emails are sent only after the order has been saved
      supabase.functions.invoke('notify-admin', { body: { type: 'order', data: orderData } });

      setCartStep('confirmed');
      clearCart();
    } catch (err) {
      console.error('PLACE ORDER EXCEPTION:', err);
      setCheckoutError('Something went wrong placing your order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 2000 }} onClick={closeCart}>
      <div
        style={{ background: '#f8f4ee', border: '2px solid #b8c8d8', padding: 'clamp(1.25rem, 5vw, 2.5rem)', width: '100%', maxWidth: 540, marginLeft: 'auto', height: '100vh', maxHeight: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── CART STEP ── */}
        {cartStep === 'cart' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 600, color: '#0f1e2e' }}>Your Cart</h2>
              <button style={{ background: 'none', border: '2px solid #b8c8d8', color: '#2a3d52', padding: '0.4rem 0.9rem', fontSize: '0.75rem', fontFamily: 'var(--font-body)', fontWeight: 700, cursor: 'pointer' }} onClick={closeCart}>✕ Close</button>
            </div>
            {checkoutError && <div style={{ background: '#fde8e8', border: '1.5px solid #c04a1a', color: '#7a1a00', padding: '0.8rem 1rem', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>{checkoutError}</div>}
            <div style={{ flex: 1 }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
                  <p style={{ color: '#4a5e72', fontSize: '1rem', fontWeight: 500, marginBottom: '1.5rem' }}>Your cart is empty.</p>
                  <button style={{ ...darkBtn, padding: '0.85rem 2rem' }} onClick={() => { closeCart(); navigate('/shop'); }}>Browse Furniture →</button>
                </div>
              ) : cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1.5px solid #b8c8d8' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {item.photo_url && <img src={item.photo_url} alt={item.name} style={{ width: 52, height: 44, objectFit: 'cover', border: '1px solid #b8c8d8', flexShrink: 0 }} />}
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#0f1e2e', fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#4a5e72', fontWeight: 500 }}>{item.condition}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#0f1e2e', fontWeight: 600 }}>${Number(item.price).toLocaleString()}</span>
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

        {/* ── LOGIN PROMPT STEP ── */}
        {cartStep === 'login-prompt' && (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: '#c04a1a', marginBottom: '1rem' }}>◈</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 600, color: '#0f1e2e', marginBottom: '0.75rem' }}>Sign in to checkout</h2>
            <p style={{ color: '#2a3d52', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2rem' }}>Please sign in so we can fill your details automatically and save your order.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button style={{ ...darkBtn, padding: '0.95rem', width: '100%' }} onClick={() => { closeCart(); navigate('/login'); }}>Sign In</button>
              <button style={{ background: 'transparent', color: '#c04a1a', border: '2.5px solid #c04a1a', padding: '0.95rem', fontFamily: 'var(--font-body)', fontSize: '0.82rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }} onClick={() => { closeCart(); navigate('/register'); }}>Create Account</button>
              <button style={{ background: 'none', border: '1.5px solid #b8c8d8', color: '#4a5e72', padding: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' }} onClick={() => setCartStep('cart')}>← Back to Cart</button>
            </div>
          </div>
        )}

        {/* ── CHECKOUT STEP ── */}
        {cartStep === 'checkout' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 600, color: '#0f1e2e' }}>Checkout</h2>
              <button style={{ background: 'none', border: '2px solid #b8c8d8', color: '#2a3d52', padding: '0.4rem 0.9rem', fontSize: '0.75rem', fontFamily: 'var(--font-body)', fontWeight: 700, cursor: 'pointer' }} onClick={() => setCartStep('cart')}>← Back</button>
            </div>

            {checkoutError && <div style={{ background: '#fde8e8', border: '1.5px solid #c04a1a', color: '#7a1a00', padding: '0.8rem 1rem', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>{checkoutError}</div>}

            {/* Order Summary */}
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

            {/* Your Details */}
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1a3a5c', fontWeight: 700, marginBottom: '0.75rem', borderBottom: '1.5px solid #b8c8d8', paddingBottom: '0.5rem' }}>Your Details</p>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" style={fieldStyle(checkout.name)} value={checkout.name} onChange={(e) => setCheckout({ ...checkout, name: e.target.value })} placeholder="Your name" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-input" style={fieldStyle(checkout.phone)} value={checkout.phone} onChange={(e) => setCheckout({ ...checkout, phone: e.target.value })} placeholder="021 XXX XXX" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" style={fieldStyle(checkout.email)} value={checkout.email} onChange={(e) => setCheckout({ ...checkout, email: e.target.value })} placeholder="you@email.com" />
            </div>

            {/* Shipping */}
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1a3a5c', fontWeight: 700, margin: '1.25rem 0 0.75rem', borderBottom: '1.5px solid #b8c8d8', paddingBottom: '0.5rem' }}>Shipping</p>
            <RadioRow label="Deliver to my address" sublabel="Enter your delivery address below" value="arrange" field="shippingOption" checkout={checkout} setCheckout={setCheckout} />
            <RadioRow label="Click & Collect" sublabel="Collect from our Auckland warehouse — free" value="pickup" field="shippingOption" checkout={checkout} setCheckout={setCheckout} />

            {checkout.shippingOption === 'arrange' && (
              <div style={{ background: '#eef5fb', border: '1.5px solid #b8c8d8', padding: '1rem', marginBottom: '0.5rem' }}>
                <p style={{ fontSize: '0.78rem', color: '#1a3a5c', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.08em' }}>Delivery Address</p>
                <div className="form-group">
                  <label className="form-label">Street Address *</label>
                  <input className="form-input" style={fieldStyle(checkout.street)} value={checkout.street} onChange={(e) => setCheckout({ ...checkout, street: e.target.value })} placeholder="14 Example Street" />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Suburb *</label>
                    <input className="form-input" style={fieldStyle(checkout.suburb)} value={checkout.suburb} onChange={(e) => setCheckout({ ...checkout, suburb: e.target.value })} placeholder="Ponsonby" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" value={checkout.city} onChange={(e) => setCheckout({ ...checkout, city: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Postcode *</label>
                  <input className="form-input" style={fieldStyle(checkout.postcode)} value={checkout.postcode} onChange={(e) => setCheckout({ ...checkout, postcode: e.target.value })} placeholder="1011" />
                </div>
                <div style={{ background: '#fff3cd', border: '1.5px solid #c8960a', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#664d00', fontWeight: 600 }}>
                  Shipping cost will be confirmed by our team after order placement.
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

            {/* Payment — Bank Transfer and Cash only */}
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1a3a5c', fontWeight: 700, margin: '1.25rem 0 0.75rem', borderBottom: '1.5px solid #b8c8d8', paddingBottom: '0.5rem' }}>Payment Method</p>
            <RadioRow label="Bank Transfer" sublabel="Our account details will be emailed to you after confirmation" value="bank" field="paymentMethod" checkout={checkout} setCheckout={setCheckout} />
            <RadioRow label="Cash on Pickup / Delivery" sublabel="Pay cash when your item arrives or you collect" value="cash" field="paymentMethod" checkout={checkout} setCheckout={setCheckout} />

            {/* Total box */}
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
                <span style={{ color: '#f0a070' }}>${cartTotal.toLocaleString()} NZD{checkout.shippingOption === 'arrange' ? ' + shipping' : ''}</span>
              </div>
            </div>

            {checkoutError && <div style={{ background: '#fde8e8', border: '1.5px solid #c04a1a', color: '#7a1a00', padding: '0.8rem 1rem', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>{checkoutError}</div>}
            <button
              style={{ ...darkBtn, width: '100%', padding: '1.1rem', fontSize: '0.88rem', opacity: placing ? 0.7 : 1, cursor: placing ? 'not-allowed' : 'pointer' }}
              onClick={handleConfirmOrder}
              disabled={placing}
            >
              {placing ? 'Placing order…' : 'Confirm Order →'}
            </button>
          </>
        )}

        {/* ── CONFIRMED STEP ── */}
        {cartStep === 'confirmed' && (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: '#1a8840', marginBottom: '1rem' }}>✓</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, color: '#0f1e2e', marginBottom: '0.75rem' }}>Order Placed!</h2>
            <p style={{ color: '#2a3d52', fontSize: '1rem', lineHeight: 1.9, marginBottom: '0.75rem', maxWidth: 320 }}>
              Thank you, <strong>{checkout.name.split(' ')[0]}</strong>! A confirmation will be sent to <strong>{checkout.email}</strong>.
            </p>
            <p style={{ color: '#4a5e72', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '2rem', maxWidth: 320 }}>
              {checkout.shippingOption === 'arrange'
                ? 'Our team will contact you within 24 hours to confirm shipping and payment details.'
                : 'Our team will contact you within 24 hours with collection details.'}
            </p>
            <div style={{ background: '#d6e8f5', border: '1.5px solid #2e5f8a', padding: '1rem', marginBottom: '2rem', width: '100%', maxWidth: 320, textAlign: 'left' }}>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1a3a5c', fontWeight: 700, marginBottom: '0.4rem' }}>Payment</p>
              <p style={{ fontSize: '0.92rem', color: '#0f1e2e', fontWeight: 600 }}>
                {checkout.paymentMethod === 'bank' ? 'Bank Transfer — our account details coming via email' : 'Cash on delivery / collection'}
              </p>
            </div>
            <button style={darkBtn} onClick={() => { closeCart(); setCartStep('cart'); }}>Continue Browsing</button>
          </div>
        )}
      </div>
    </div>
  );
}
