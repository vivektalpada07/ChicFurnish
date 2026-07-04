import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerNav from '../../components/CustomerNav';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

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

  const statusBadge = (s) => {
    const map = { pending: 'badge-pending', confirmed: 'badge-confirmed', declined: 'badge-declined' };
    return <span className={`badge ${map[s] || 'badge-pending'}`}>{s}</span>;
  };

  if (!user) return null;

  return (
    <>
      <CustomerNav />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Profile Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1.5px solid var(--border)' }}>
          <div>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--rust)', fontWeight: 700, marginBottom: '0.5rem' }}>My Account</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.25rem' }}>{user.name}</h1>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem' }}>{user.email}</p>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { logout(); navigate('/shop'); }}
          >
            Sign Out
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--ink-muted)' }}>Loading your bookings…</p>
        ) : (
          <>
            {/* Viewing Bookings */}
            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--ink)' }}>
                Furniture Viewing Requests
              </h2>
              {viewings.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--ink-muted)' }}>
                  <p>No viewing requests yet.</p>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={() => navigate('/shop')}>Browse Furniture →</button>
                </div>
              ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewings.map((v) => (
                        <tr key={v.id}>
                          <td style={{ fontWeight: 600 }}>{v.listing_name}</td>
                          <td>{v.date}</td>
                          <td>{v.time}</td>
                          <td>{statusBadge(v.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Staging Bookings */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--ink)' }}>
                Staging Requests
              </h2>
              {stagings.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--ink-muted)' }}>
                  <p>No staging requests yet.</p>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={() => navigate('/inspiration')}>Explore Staging →</button>
                </div>
              ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Date</th>
                        <th>Address</th>
                        <th>Status</th>
                        <th>Quote</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stagings.map((s) => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: 600 }}>{s.service}</td>
                          <td>{s.date}</td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>{s.address}</td>
                          <td>{statusBadge(s.status)}</td>
                          <td>
                            {s.quote_amount
                              ? <span style={{ fontWeight: 700, color: 'var(--rust)' }}>${s.quote_amount}</span>
                              : <span style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>Pending</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
