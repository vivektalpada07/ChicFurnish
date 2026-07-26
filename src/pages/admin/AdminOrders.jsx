import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { supabase } from '../../lib/supabase';

const STATUS_COLORS = {
  pending:    { bg: '#fff3cd', color: '#664d00', border: '#c8960a' },
  confirmed:  { bg: '#d4edda', color: '#0f4020', border: '#1e8840' },
  completed:  { bg: '#d6e8f5', color: '#0f1e2e', border: '#1a3a5c' },
  cancelled:  { bg: '#fde8e8', color: '#7a1a00', border: '#c04a1a' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders(data || []);
  }

  const updateStatus = async (id, status) => {
    setUpdating(true);
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    if (selected?.id === id) setSelected((prev) => ({ ...prev, status }));
    setUpdating(false);
  };

  const filtered = filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus);

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    completed: orders.filter((o) => o.status === 'completed').length,
  };

  const tabStyle = (key) => ({
    padding: '0.55rem 1.2rem', background: filterStatus === key ? 'var(--blue)' : 'transparent',
    color: filterStatus === key ? '#f0d8c8' : 'var(--ink-muted)', border: '1.5px solid var(--border)',
    marginRight: '-1px', cursor: 'pointer', fontFamily: 'var(--font-body)',
    fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600,
  });

  const paymentLabel = (m) => m === 'bank' ? 'Bank Transfer' : m === 'cash' ? 'Cash' : 'Card';
  const shippingLabel = (s) => s === 'pickup' ? 'Click & Collect' : 'Delivery';

  return (
    <div className="page-layout">
      <AdminSidebar />
      <main className="main-content">
        <div className="page-header">
          <p className="page-eyebrow">Sales</p>
          <h1 className="page-title">Customer <em>Orders</em></h1>
        </div>

        <div className="stat-grid">
          {[
            { label: 'Total Orders', value: counts.all },
            { label: 'Pending', value: counts.pending, highlight: counts.pending > 0 },
            { label: 'Confirmed', value: counts.confirmed },
            { label: 'Completed', value: counts.completed },
          ].map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.highlight ? 'var(--rust)' : undefined }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', marginBottom: '1.5rem' }}>
          {[['all', `All (${counts.all})`], ['pending', `Pending (${counts.pending})`], ['confirmed', `Confirmed (${counts.confirmed})`], ['completed', `Completed (${counts.completed})`]].map(([key, label]) => (
            <button key={key} style={tabStyle(key)} onClick={() => setFilterStatus(key)}>{label}</button>
          ))}
        </div>

        <div className="card">
          {filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--ink-muted)' }}>No orders yet</p>
              <p className="text-muted" style={{ marginTop: '0.5rem' }}>Customer orders from the shop will appear here.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Shipping</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const sc = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
                  return (
                    <tr key={o.id}>
                      <td>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-muted)', letterSpacing: '0.05em' }}>{o.id}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>{new Date(o.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{o.customer_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{o.customer_email}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {Array.isArray(o.items) ? o.items.map((i) => i.name).join(', ') : '—'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--rust)', fontSize: '1rem', whiteSpace: 'nowrap' }}>
                        ${Number(o.total).toLocaleString()} NZD
                      </td>
                      <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>{paymentLabel(o.payment_method)}</td>
                      <td style={{ fontSize: '0.82rem' }}>{shippingLabel(o.shipping_option)}</td>
                      <td>
                        <span style={{ background: sc.bg, color: sc.color, border: `1.5px solid ${sc.border}`, padding: '0.25rem 0.7rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => setSelected(o)}>View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Order detail modal */}
        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h2 className="modal-title" style={{ marginBottom: '0.25rem' }}>Order Details</h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-body)', letterSpacing: '0.05em' }}>{selected.id}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {['pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      disabled={updating || selected.status === s}
                      style={{
                        padding: '0.4rem 0.9rem', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                        fontWeight: 700, cursor: selected.status === s ? 'default' : 'pointer', border: '1.5px solid',
                        fontFamily: 'var(--font-body)',
                        ...(selected.status === s
                          ? { background: STATUS_COLORS[s]?.bg, color: STATUS_COLORS[s]?.color, borderColor: STATUS_COLORS[s]?.border }
                          : { background: 'transparent', color: 'var(--ink-muted)', borderColor: 'var(--border)' }),
                        opacity: updating ? 0.6 : 1,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer */}
              <div style={{ background: 'var(--blue-pale)', borderLeft: '3px solid var(--blue)', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>Customer</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{selected.customer_name}</p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.88rem', color: 'var(--rust)' }}>{selected.customer_email}</p>
                {selected.customer_phone && <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>{selected.customer_phone}</p>}
              </div>

              {/* Items */}
              <p style={{ fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 700, marginBottom: '0.75rem' }}>Items Ordered</p>
              {Array.isArray(selected.items) && selected.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.92rem' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{item.name}</span>
                    {item.condition && <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginLeft: '0.5rem' }}>({item.condition})</span>}
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--rust)' }}>${Number(item.price).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600 }}>
                <span>Total</span>
                <span style={{ color: 'var(--rust)' }}>${Number(selected.total).toLocaleString()} NZD</span>
              </div>

              {/* Shipping & Payment */}
              <div className="grid-2" style={{ marginTop: '1.25rem', gap: '1rem' }}>
                <div style={{ background: '#f8f4ee', border: '1px solid var(--border)', padding: '1rem' }}>
                  <p style={{ fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>Shipping</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{shippingLabel(selected.shipping_option)}</p>
                  {selected.shipping_option === 'arrange' && selected.street && (
                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: 'var(--ink-muted)', lineHeight: 1.6 }}>
                      {selected.street}<br />{selected.suburb}, {selected.city} {selected.postcode}
                    </p>
                  )}
                </div>
                <div style={{ background: '#f8f4ee', border: '1px solid var(--border)', padding: '1rem' }}>
                  <p style={{ fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>Payment</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{paymentLabel(selected.payment_method)}</p>
                </div>
              </div>

              {selected.notes && (
                <div style={{ marginTop: '1rem', background: '#fff3cd', border: '1px solid #c8960a', padding: '0.75rem 1rem' }}>
                  <p style={{ fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#664d00', fontWeight: 700, marginBottom: '0.3rem' }}>Delivery Notes</p>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#664d00' }}>{selected.notes}</p>
                </div>
              )}

              <div className="flex-gap" style={{ justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
