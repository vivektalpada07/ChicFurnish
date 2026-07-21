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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchBookings();
  }, [user, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBookings = async () => {
    setLoading(true);
    const [v, s] = await Promise.all([
      supabase.from('viewing_bookings').select('*').eq('customer_email', user.email).order('created_at', { ascending: false }),
      supabase.from('staging_bookings').select('*').eq('email', user.email).order('created_at', { ascending: false }),
    ]);
    setViewings(v.data || []);
    setStagings(s.data || []);
    setLoading(false);
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

        {loading ? (
          <p style={{ color: '#4a5e72' }}>Loading your bookings…</p>
        ) : (
          <>
            {/* Viewing Bookings */}
            <section style={{ marginBottom: '2.5rem' }}>
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
            </section>

            {/* Staging Bookings */}
            <section>
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
            </section>
          </>
        )}
      </div>
    </>
  );
}
