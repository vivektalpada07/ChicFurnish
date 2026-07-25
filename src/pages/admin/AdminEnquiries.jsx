import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { supabase } from '../../lib/supabase';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase
      .from('item_enquiries')
      .select('*')
      .order('created_at', { ascending: false });
    setEnquiries(data || []);
  }

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    const patch = { reply: reply.trim(), replied_at: new Date().toISOString(), status: 'replied' };
    await supabase.from('item_enquiries').update(patch).eq('id', selected.id);
    supabase.functions.invoke('notify-admin', {
      body: {
        type: 'enquiry-reply',
        data: { ...selected, reply: reply.trim(), listing_name: selected.listing_name },
      },
    });
    setEnquiries((prev) => prev.map((e) => e.id === selected.id ? { ...e, ...patch } : e));
    setSelected((prev) => ({ ...prev, ...patch }));
    setReply('');
    setSending(false);
  };

  const filtered = filterStatus === 'all' ? enquiries : enquiries.filter((e) => e.status === filterStatus);

  const counts = {
    all: enquiries.length,
    open: enquiries.filter((e) => e.status === 'open').length,
    replied: enquiries.filter((e) => e.status === 'replied').length,
  };

  const tabStyle = (key) => ({
    padding: '0.55rem 1.2rem', background: filterStatus === key ? 'var(--blue)' : 'transparent',
    color: filterStatus === key ? '#f0d8c8' : 'var(--ink-muted)', border: '1.5px solid var(--border)',
    marginRight: '-1px', cursor: 'pointer', fontFamily: 'var(--font-body)',
    fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600,
  });

  return (
    <div className="page-layout">
      <AdminSidebar />
      <main className="main-content">
        <div className="page-header">
          <p className="page-eyebrow">Customer Messages</p>
          <h1 className="page-title">Item <em>Enquiries</em></h1>
        </div>

        <div className="stat-grid">
          {[
            { label: 'Total', value: counts.all },
            { label: 'Open', value: counts.open },
            { label: 'Replied', value: counts.replied },
          ].map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.label === 'Open' && s.value > 0 ? 'var(--rust)' : undefined }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', marginBottom: '1.5rem' }}>
          {[['all', `All (${counts.all})`], ['open', `Open (${counts.open})`], ['replied', `Replied (${counts.replied})`]].map(([key, label]) => (
            <button key={key} style={tabStyle(key)} onClick={() => setFilterStatus(key)}>{label}</button>
          ))}
        </div>

        <div className="card">
          {filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--ink-muted)' }}>
                {filterStatus === 'open' ? 'No open enquiries' : 'No enquiries yet'}
              </p>
              <p className="text-muted" style={{ marginTop: '0.5rem' }}>Customer questions about items will appear here.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Customer</th><th>Item</th><th>Message</th><th>Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} style={{ background: e.status === 'open' ? '#fffdf9' : 'white' }}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{e.customer_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{e.customer_email}</div>
                    </td>
                    <td style={{ fontSize: '0.88rem', fontWeight: 500 }}>{e.listing_name || '—'}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.message}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(e.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <span className={`badge badge-${e.status === 'open' ? 'pending' : 'confirmed'}`}>{e.status}</span>
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => { setSelected(e); setReply(e.reply || ''); }}>
                        {e.status === 'open' ? 'Reply' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Reply modal */}
        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Customer Enquiry</h2>

              {/* Item context */}
              {selected.listing_name && (
                <div style={{ background: 'var(--blue-pale)', borderLeft: '3px solid var(--blue)', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--ink-muted)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>About: </span>
                  <strong>{selected.listing_name}</strong>
                  {selected.listing_price && <span style={{ color: 'var(--rust)', fontWeight: 700, marginLeft: '0.5rem' }}>${Number(selected.listing_price).toLocaleString()} NZD</span>}
                </div>
              )}

              {/* Customer message */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="form-label" style={{ marginBottom: '0.5rem' }}>From {selected.customer_name} ({selected.customer_email})</div>
                <div style={{ background: '#f0f5f8', border: '1px solid var(--border)', padding: '1rem', fontSize: '0.95rem', color: 'var(--ink)', lineHeight: 1.75, borderRadius: 2 }}>
                  {selected.message}
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', marginTop: '0.4rem' }}>
                  {new Date(selected.created_at).toLocaleString('en-NZ')}
                </p>
              </div>

              {/* Existing reply */}
              {selected.status === 'replied' && selected.reply && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div className="form-label" style={{ marginBottom: '0.5rem' }}>Your reply</div>
                  <div style={{ background: '#d4edda', border: '1px solid #1e8840', padding: '1rem', fontSize: '0.92rem', color: '#0f4020', lineHeight: 1.75, borderRadius: 2 }}>
                    {selected.reply}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', marginTop: '0.4rem' }}>
                    Replied {new Date(selected.replied_at).toLocaleString('en-NZ')}
                  </p>
                </div>
              )}

              {/* Reply form */}
              <div className="form-group">
                <label className="form-label">{selected.status === 'replied' ? 'Update Reply' : 'Your Reply *'}</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: 120 }}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your response to the customer…"
                />
              </div>

              <div className="flex-gap" style={{ justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
                <button className="btn btn-dark" onClick={sendReply} disabled={sending || !reply.trim()} style={{ opacity: sending ? 0.7 : 1 }}>
                  {sending ? 'Sending…' : 'Send Reply →'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
