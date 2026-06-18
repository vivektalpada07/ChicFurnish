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

  const stats = [
    { label: 'Total Listings', value: listings.length },
    { label: 'Available Items', value: listings.filter((l) => l.status === 'available').length },
    { label: 'Pending Viewings', value: viewings.filter((v) => v.status === 'pending').length },
    { label: 'Staging Requests', value: staging.filter((s) => s.status === 'pending').length },
  ];

  return (
    <div className="page-layout">
      <AdminSidebar />
      <main className="main-content">
        <div className="page-header">
          <p className="page-eyebrow">Welcome back</p>
          <h1 className="page-title">Dashboard <em>Overview</em></h1>
        </div>

        <div className="stat-grid">
          {stats.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="card mb-2">
          <div className="flex-between mb-1">
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.2rem' }}>Recent Viewing Requests</h2>
          </div>
          {viewings.length === 0 ? (
            <p className="text-muted" style={{ padding: '1rem 0' }}>No viewing requests yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Customer</th><th>Item</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {viewings.slice(0, 5).map((v) => (
                  <tr key={v.id}>
                    <td>{v.customer_name}</td>
                    <td>{v.listing_name}</td>
                    <td>{v.date}</td>
                    <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="flex-between mb-1">
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.2rem' }}>Recent Staging Bookings</h2>
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
                    <td>{s.name}</td>
                    <td>{s.service}</td>
                    <td>{s.date}</td>
                    <td>{s.quote_amount ? `$${Number(s.quote_amount).toLocaleString()}` : '—'}</td>
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
