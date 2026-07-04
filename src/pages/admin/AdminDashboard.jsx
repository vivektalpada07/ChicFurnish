import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { getListings, getViewingBookings, getStagingBookings } from '../../context/AuthContext';

export default function AdminDashboard() {
  const [listings, setListings] = useState([]);
  const [viewings, setViewings] = useState([]);
  const [staging, setStaging] = useState([]);

  useEffect(() => {
    async function load() {
      const [l, v, s] = await Promise.all([getListings(), getViewingBookings(), getStagingBookings()]);
      setListings(l);
      setViewings(v);
      setStaging(s);
    }
    load();
  }, []);

  const totalRevenue = listings.filter(l => l.status === 'sold').reduce((sum, l) => sum + Number(l.price || 0), 0);

  const stats = [
    { label: 'Total Listings', value: listings.length, sub: `${listings.filter(l => l.status === 'available').length} available` },
    { label: 'Items Sold', value: listings.filter(l => l.status === 'sold').length, sub: `$${totalRevenue.toLocaleString()} revenue` },
    { label: 'Pending Viewings', value: viewings.filter(v => v.status === 'pending').length, sub: `${viewings.length} total` },
    { label: 'Staging Requests', value: staging.filter(s => s.status === 'pending').length, sub: `${staging.length} total` },
  ];

  const recentActivity = [
    ...viewings.slice(0, 3).map(v => ({ type: 'Viewing', name: v.customer_name, detail: v.listing_name, date: v.date, status: v.status })),
    ...staging.slice(0, 3).map(s => ({ type: 'Staging', name: s.name, detail: s.service, date: s.date, status: s.status })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  return (
    <div className="page-layout">
      <AdminSidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <p className="page-eyebrow">Welcome back</p>
            <h1 className="page-title">Dashboard <em>Overview</em></h1>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
            {new Date().toLocaleDateString('en-NZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="stat-grid">
          {stats.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: '0.5rem' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

          {/* Recent Activity */}
          <div className="card">
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.3rem', marginBottom: '1.25rem', color: 'var(--ink)' }}>Recent Activity</h2>
            {recentActivity.length === 0 ? (
              <p className="text-muted">No activity yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentActivity.map((a, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--cream)', borderLeft: '3px solid var(--rust)' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ink)' }}>{a.name}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{a.type} · {a.detail}</p>
                    </div>
                    <span className={`badge badge-${a.status}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inventory Summary */}
          <div className="card">
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.3rem', marginBottom: '1.25rem', color: 'var(--ink)' }}>Inventory Summary</h2>
            {listings.length === 0 ? (
              <p className="text-muted">No listings yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {['sofa', 'table', 'rug', 'cupboard'].map(cat => {
                  const count = listings.filter(l => l.category === cat).length;
                  const available = listings.filter(l => l.category === cat && l.status === 'available').length;
                  if (count === 0) return null;
                  return (
                    <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ textTransform: 'capitalize', fontSize: '0.88rem', fontWeight: 500, color: 'var(--ink)' }}>{cat}s</span>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{available} available</span>
                        <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{count} total</span>
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '2px solid var(--border)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--ink)' }}>Total</span>
                  <span style={{ fontWeight: 700, color: 'var(--rust)' }}>{listings.length} items</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Viewing Requests */}
        <div className="card mb-2">
          <div className="flex-between mb-1">
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.3rem', color: 'var(--ink)' }}>Recent Viewing Requests</h2>
          </div>
          {viewings.length === 0 ? (
            <p className="text-muted" style={{ padding: '1rem 0' }}>No viewing requests yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Customer</th><th>Item</th><th>Date</th><th>Time</th><th>Status</th></tr>
              </thead>
              <tbody>
                {viewings.slice(0, 5).map((v) => (
                  <tr key={v.id}>
                    <td><strong>{v.customer_name}</strong><br /><span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{v.customer_email}</span></td>
                    <td>{v.listing_name}</td>
                    <td>{v.date}</td>
                    <td>{v.time}</td>
                    <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Staging Bookings */}
        <div className="card">
          <div className="flex-between mb-1">
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.3rem', color: 'var(--ink)' }}>Recent Staging Bookings</h2>
          </div>
          {staging.length === 0 ? (
            <p className="text-muted" style={{ padding: '1rem 0' }}>No staging bookings yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Customer</th><th>Service</th><th>Date</th><th>Quote</th><th>Status</th></tr>
              </thead>
              <tbody>
                {staging.slice(0, 5).map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong><br /><span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{s.email}</span></td>
                    <td>{s.service}</td>
                    <td>{s.date}</td>
                    <td>{s.quote_amount ? <span style={{ fontWeight: 700, color: 'var(--rust)' }}>${Number(s.quote_amount).toLocaleString()}</span> : '—'}</td>
                    <td><span className={`badge badge-${s.status}`}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
