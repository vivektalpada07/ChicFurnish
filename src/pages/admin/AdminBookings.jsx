import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { supabase } from '../../lib/supabase';
import { getListings } from '../../context/AuthContext';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [listings, setListings] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    load();
    getListings().then(setListings);
  }, []);

  async function load() {
    const { data } = await supabase
      .from('viewing_bookings')
      .select('*')
      .order('created_at', { ascending: false });
    setBookings(data || []);
  }

  const updateStatus = async (id, status) => {
    await supabase.from('viewing_bookings').update({ status }).eq('id', id);
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));

    // Send customer email notification
    const booking = bookings.find((b) => b.id === id);
    if (booking && (status === 'confirmed' || status === 'declined')) {
      const listing = listings.find((l) => l.id === booking.listing_id);
      supabase.functions.invoke('notify-admin', {
        body: {
          type: status === 'confirmed' ? 'viewing-confirmed' : 'viewing-declined',
          data: {
            ...booking,
            listing_price: listing?.price,
            listing_description: listing?.description,
            listing_condition: listing?.condition,
          },
        },
      });
    }

    setSelected(null);
  };

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    declined: bookings.filter((b) => b.status === 'declined').length,
  };

  return (
    <div className="page-layout">
      <AdminSidebar />
      <main className="main-content">
        <div className="page-header">
          <p className="page-eyebrow">Furniture Sales</p>
          <h1 className="page-title">Viewing <em>Requests</em></h1>
        </div>

        <div className="stat-grid">
          {[
            { label: 'Total', value: counts.all },
            { label: 'Pending', value: counts.pending },
            { label: 'Confirmed', value: counts.confirmed },
            { label: 'Declined', value: counts.declined },
          ].map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="card">
          {bookings.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--ink-muted)' }}>
                No viewing requests yet
              </p>
              <p className="text-muted" style={{ marginTop: '0.5rem' }}>Requests from customers will appear here.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Customer</th><th>Item</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td style={{ color: 'var(--rust)', fontSize: '0.78rem' }}>{b.id}</td>
                    <td>
                      <div>{b.customer_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{b.customer_email}</div>
                    </td>
                    <td>{b.listing_name}</td>
                    <td>{b.date}</td>
                    <td>{b.time}</td>
                    <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                    <td>
                      <div className="flex-gap" style={{ gap: '0.4rem' }}>
                        {b.status === 'pending' && (
                          <>
                            <button className="btn btn-gold btn-sm" onClick={() => updateStatus(b.id, 'confirmed')}>Confirm</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(b.id, 'declined')}>Decline</button>
                          </>
                        )}
                        {b.status === 'confirmed' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(b.id, 'declined')}>Cancel</button>
                        )}
                        <button className="btn btn-outline btn-sm" onClick={() => setSelected(b)}>Details</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Viewing Request Details</h2>
              <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                {[
                  { label: 'Booking ID', value: selected.id },
                  { label: 'Status', value: selected.status },
                  { label: 'Customer Name', value: selected.customer_name },
                  { label: 'Email', value: selected.customer_email },
                  { label: 'Phone', value: selected.customer_phone || '—' },
                  { label: 'Item', value: selected.listing_name },
                  { label: 'Preferred Date', value: selected.date },
                  { label: 'Preferred Time', value: selected.time },
                ].map((f) => (
                  <div key={f.label}>
                    <div className="form-label">{f.label}</div>
                    <div style={{ fontSize: '0.9rem' }}>{f.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex-gap" style={{ justifyContent: 'flex-end' }}>
                {selected.status === 'pending' && (
                  <>
                    <button className="btn btn-gold" onClick={() => updateStatus(selected.id, 'confirmed')}>Confirm Viewing</button>
                    <button className="btn btn-ghost" onClick={() => updateStatus(selected.id, 'declined')}>Decline</button>
                  </>
                )}
                <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
