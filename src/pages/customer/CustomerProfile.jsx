import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerNav from '../../components/CustomerNav';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const statusColor = { pending: '#c04a1a', confirmed: '#1a8840', declined: '#7a1a00' };
const statusBg = { pending: '#fdf0eb', confirmed: '#d4edda', declined: '#fde8e8' };

function StatusBadge({ s }) {
  return (
    <span style={{ background: statusBg[s] || statusBg.pending, color: statusColor[s] || statusColor.pending, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.28rem 0.65rem', fontFamily: 'var(--font-body)' }}>
      {s}
    </span>
  );
}

function BookingCard({ fields }) {
  return (
    <div style={{ background: 'white', border: '1px solid #dde3e8', padding: '1rem 1.1rem', borderRadius: 2, marginBottom: '0.75rem' }}>
      {fields.map(([label, value]) => value ? (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0', borderBottom: '1px solid #f0ebe3', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#4a5e72', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>{label}</span>
          <span style={{ fontSize: '0.88rem', color: '#0f1e2e', fontWeight: 500, textAlign: 'right' }}>{value}</span>
        </div>
      ) : null)}
    </div>
  );
}

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [viewings, setViewings] = useState([]);
  const [stagings, setStagings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('viewings');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchAll();
  }, [user, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAll = async () => {
    setLoading(true);
    const [v, s, w] = await Promise.all([
      supabase.from('viewing_bookings').select('*').eq('customer_email', user.email).order('created_at', { ascending: false }),
      supabase.from('staging_bookings').select('*').eq('email', user.email).order('created_at', { ascending: false }),
      supabase.from('wishlists').select('*, listings(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    setViewings(v.data || []);
    setStagings(s.data || []);
    setWishlist(w.data || []);
    setLoading(false);
  };

  const removeWishlist = async (listingId) => {
    await supabase.from('wishlists').delete().eq('user_id', user.id).eq('listing_id', listingId);
    setWishlist((prev) => prev.filter((w) => w.listing_id !== listingId));
  };

  if (!user) return null;

  return (
    <>
      <CustomerNav />
      <div className="profile-page" style={{ maxWidth: 860, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1.5px solid #dde3e8' }}>
          <div>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c04a1a', fontWeight: 700, marginBottom: '0.4rem' }}>My Account</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', fontWeight: 600, color: '#0f1e2e', marginBottom: '0.2rem' }}>{user.name}</h1>
            <p style={{ color: '#4a5e72', fontSize: '0.9rem', wordBreak: 'break-all' }}>{user.email}</p>
          </div>
          <button onClick={() => { logout(); navigate('/shop'); }} style={{ background: 'none', border: '2px solid #dde3e8', color: '#4a5e72', padding: '0.5rem 0.9rem', fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>
            Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: '2rem', borderBottom: '2px solid #dde3e8' }}>
          {[['viewings', 'Viewings'], ['stagings', 'Staging'], ['wishlist', `Wishlist (${wishlist.length})`]].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{ background: 'none', border: 'none', borderBottom: activeTab === key ? '3px solid #c04a1a' : '3px solid transparent', color: activeTab === key ? '#c04a1a' : '#4a5e72', fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.75rem 1.25rem', cursor: 'pointer', marginBottom: '-2px' }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: '#4a5e72' }}>Loading…</p>
        ) : (
          <>
            {/* Viewing Bookings */}
            {activeTab === 'viewings' && <section style={{ marginBottom: '2.5rem' }}>

              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#0f1e2e' }}>
                Furniture Viewing Requests
              </h2>
              {viewings.length === 0 ? (
                <div style={{ background: 'white', border: '1px solid #dde3e8', padding: '2rem', textAlign: 'center' }}>
                  <p style={{ color: '#4a5e72', marginBottom: '1rem' }}>No viewing requests yet.</p>
                  <button onClick={() => navigate('/shop')} style={{ background: '#1a3a5c', color: '#f0d8c8', border: 'none', padding: '0.65rem 1.25rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>Browse Furniture →</button>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="profile-table-wrap">
                    <table className="data-table">
                      <thead><tr><th>Item</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
                      <tbody>
                        {viewings.map((v) => (
                          <tr key={v.id}>
                            <td style={{ fontWeight: 600 }}>{v.listing_name}</td>
                            <td>{v.date}</td>
                            <td>{v.time}</td>
                            <td><StatusBadge s={v.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile cards */}
                  <div className="profile-cards-wrap">
                    {viewings.map((v) => (
                      <BookingCard key={v.id} fields={[
                        ['Item', v.listing_name],
                        ['Date', v.date],
                        ['Time', v.time],
                        ['Status', <StatusBadge s={v.status} />],
                      ]} />
                    ))}
                  </div>
                </>
              )}
            </section>}

            {/* Staging Bookings */}
            {activeTab === 'stagings' && <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#0f1e2e' }}>
                Staging Requests
              </h2>
              {stagings.length === 0 ? (
                <div style={{ background: 'white', border: '1px solid #dde3e8', padding: '2rem', textAlign: 'center' }}>
                  <p style={{ color: '#4a5e72', marginBottom: '1rem' }}>No staging requests yet.</p>
                  <button onClick={() => navigate('/inspiration')} style={{ background: 'none', border: '2px solid #c04a1a', color: '#c04a1a', padding: '0.65rem 1.25rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>Explore Staging →</button>
                </div>
              ) : (
                <>
                  <div className="profile-table-wrap">
                    <table className="data-table">
                      <thead><tr><th>Service</th><th>Date</th><th>Address</th><th>Status</th><th>Quote</th></tr></thead>
                      <tbody>
                        {stagings.map((s) => (
                          <tr key={s.id}>
                            <td style={{ fontWeight: 600 }}>{s.service}</td>
                            <td>{s.date}</td>
                            <td style={{ fontSize: '0.85rem', color: '#4a5e72' }}>{s.address}</td>
                            <td><StatusBadge s={s.status} /></td>
                            <td>{s.quote_amount ? <span style={{ fontWeight: 700, color: '#c04a1a' }}>${s.quote_amount}</span> : <span style={{ color: '#4a5e72', fontSize: '0.85rem' }}>Pending</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="profile-cards-wrap">
                    {stagings.map((s) => (
                      <BookingCard key={s.id} fields={[
                        ['Service', s.service],
                        ['Date', s.date],
                        ['Address', s.address],
                        ['Status', <StatusBadge s={s.status} />],
                        ['Quote', s.quote_amount ? `$${s.quote_amount}` : 'Pending'],
                      ]} />
                    ))}
                  </div>
                </>
              )}
            </section>}

            {/* Wishlist */}
            {activeTab === 'wishlist' && <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#0f1e2e' }}>
                Saved Items
              </h2>
              {wishlist.length === 0 ? (
                <div style={{ background: 'white', border: '1px solid #dde3e8', padding: '2rem', textAlign: 'center' }}>
                  <p style={{ color: '#4a5e72', marginBottom: '1rem' }}>No saved items yet.</p>
                  <button onClick={() => navigate('/shop')} style={{ background: '#1a3a5c', color: '#f0d8c8', border: 'none', padding: '0.65rem 1.25rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>Browse Furniture →</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
                  {wishlist.map((w) => {
                    const listing = w.listings;
                    if (!listing) return null;
                    return (
                      <div key={w.id} style={{ background: 'white', border: '1px solid #dde3e8', overflow: 'hidden' }}>
                        <div style={{ height: 160, background: '#dde8f0', position: 'relative', cursor: 'pointer' }} onClick={() => navigate(`/shop/${listing.id}`)}>
                          {listing.photo_url
                            ? <img src={listing.photo_url} alt={listing.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'rgba(26,58,92,0.3)', fontFamily: 'var(--font-display)' }}>{listing.category}</span></div>
                          }
                          {listing.stock === 0 && <span style={{ position: 'absolute', top: 8, left: 8, background: '#7a1a00', color: 'white', fontSize: '0.62rem', fontWeight: 700, padding: '0.2rem 0.5rem', letterSpacing: '0.1em' }}>SOLD</span>}
                        </div>
                        <div style={{ padding: '0.9rem' }}>
                          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f1e2e', marginBottom: '0.25rem', cursor: 'pointer' }} onClick={() => navigate(`/shop/${listing.id}`)}>{listing.name}</p>
                          <p style={{ fontFamily: 'var(--font-display)', color: '#c04a1a', fontWeight: 600, marginBottom: '0.75rem' }}>${Number(listing.price).toLocaleString()} NZD</p>
                          <button onClick={() => removeWishlist(listing.id)} style={{ background: 'none', border: '1px solid #dde3e8', color: '#4a5e72', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.4rem 0.75rem', cursor: 'pointer', width: '100%' }}>Remove</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>}
          </>
        )}
      </div>
    </>
  );
}
