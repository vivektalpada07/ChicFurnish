import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { getStagingBookings, saveStagingBookings } from '../../context/AuthContext';

export default function AdminQuotes() {
  const [bookings, setBookings] = useState([]);
  const [quoteModal, setQuoteModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ amount: '', breakdown: '', message: '' });

  useEffect(() => { setBookings(getStagingBookings()); }, []);

  const updateStatus = (id, status) => {
    const updated = bookings.map((b) => b.id === id ? { ...b, status } : b);
    setBookings(updated);
    saveStagingBookings(updated);
  };

  const openQuoteModal = (booking) => {
    setQuoteModal(booking);
    setQuoteForm({
      amount: '',
      breakdown: '',
      message: `Dear ${booking.name},\n\nThank you for your enquiry about our ${booking.service} service for ${booking.address}.\n\nPlease find your personalised pricing quote below.\n\nWarm regards,\nChic Furnish Team`,
    });
  };

  const sendQuote = () => {
    if (!quoteForm.amount) return;
    const updated = bookings.map((b) =>
      b.id === quoteModal.id
        ? { ...b, quoteSent: true, quoteAmount: Number(quoteForm.amount), quoteBreakdown: quoteForm.breakdown, status: 'confirmed' }
        : b
    );
    setBookings(updated);
    saveStagingBookings(updated);
    setQuoteModal(null);
  };

  return (
    <div className="page-layout">
      <AdminSidebar />
      <main className="main-content">
        <div className="page-header">
          <p className="page-eyebrow">Staging Services</p>
          <h1 className="page-title">Staging <em>Bookings & Quotes</em></h1>
        </div>

        <div className="card">
          {bookings.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 300, color: 'var(--warm-gray)' }}>
                No staging bookings yet
              </p>
              <p className="text-muted" style={{ marginTop: '0.5rem' }}>Bookings from the Inspiration page will appear here.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Customer</th><th>Service</th><th>Property</th><th>Date</th><th>Quote</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div>{b.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--warm-gray)' }}>{b.email}</div>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{b.service}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--warm-gray)', maxWidth: 160 }}>{b.address}</td>
                    <td>{b.date}</td>
                    <td>
                      {b.quoteSent
                        ? <span style={{ color: 'var(--gold-dark)', fontFamily: 'var(--font-display)', fontSize: '1rem' }}>${Number(b.quoteAmount).toLocaleString()}</span>
                        : <span className="badge badge-new">Not sent</span>}
                    </td>
                    <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                    <td>
                      <div className="flex-gap" style={{ gap: '0.4rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => setDetailModal(b)}>View</button>
                        {!b.quoteSent && (
                          <button className="btn btn-gold btn-sm" onClick={() => openQuoteModal(b)}>Send Quote</button>
                        )}
                        {b.status === 'pending' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(b.id, 'confirmed')}>Confirm</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quote modal */}
        {quoteModal && (
          <div className="modal-overlay" onClick={() => setQuoteModal(null)}>
            <div className="modal" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Send Pricing Quote</h2>
              <div style={{ background: 'var(--cream-deep)', padding: '1rem', marginBottom: '1.5rem', borderLeft: '2px solid var(--gold)', fontSize: '0.85rem' }}>
                <strong>{quoteModal.name}</strong> — {quoteModal.service} · {quoteModal.address}
              </div>
              <div className="form-group">
                <label className="form-label">Quote Amount (NZD) *</label>
                <input className="form-input" type="number" value={quoteForm.amount} onChange={(e) => setQuoteForm({ ...quoteForm, amount: e.target.value })} placeholder="e.g. 3500" />
              </div>
              <div className="form-group">
                <label className="form-label">Price Breakdown</label>
                <textarea className="form-textarea" style={{ minHeight: 80 }} value={quoteForm.breakdown} onChange={(e) => setQuoteForm({ ...quoteForm, breakdown: e.target.value })} placeholder="e.g. Furniture hire: $2,000 · Delivery & setup: $800 · Styling: $700" />
              </div>
              <div className="form-group">
                <label className="form-label">Message to Customer</label>
                <textarea className="form-textarea" style={{ minHeight: 140 }} value={quoteForm.message} onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })} />
              </div>
              <div className="flex-gap" style={{ justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setQuoteModal(null)}>Cancel</button>
                <button className="btn btn-dark" onClick={sendQuote}>Send Quote →</button>
              </div>
            </div>
          </div>
        )}

        {/* Detail modal */}
        {detailModal && (
          <div className="modal-overlay" onClick={() => setDetailModal(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Booking Details</h2>
              <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                {[
                  { label: 'Customer', value: detailModal.name },
                  { label: 'Email', value: detailModal.email },
                  { label: 'Phone', value: detailModal.phone || '—' },
                  { label: 'Service', value: detailModal.service },
                  { label: 'Property', value: detailModal.address },
                  { label: 'Date', value: detailModal.date },
                  { label: 'Status', value: detailModal.status },
                  { label: 'Quote', value: detailModal.quoteSent ? `$${Number(detailModal.quoteAmount).toLocaleString()}` : 'Not sent' },
                ].map((f) => (
                  <div key={f.label}>
                    <div className="form-label">{f.label}</div>
                    <div style={{ fontSize: '0.88rem' }}>{f.value}</div>
                  </div>
                ))}
              </div>
              {detailModal.notes && (
                <div className="form-group">
                  <div className="form-label">Notes</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--warm-gray)', lineHeight: 1.7 }}>{detailModal.notes}</div>
                </div>
              )}
              {detailModal.quoteBreakdown && (
                <div className="form-group">
                  <div className="form-label">Quote Breakdown</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--warm-gray)', lineHeight: 1.7 }}>{detailModal.quoteBreakdown}</div>
                </div>
              )}
              <div className="flex-gap" style={{ justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setDetailModal(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
