import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { getListings, saveListings } from '../../context/AuthContext';

const CATEGORIES = ['All', 'sofa', 'table', 'rug', 'cupboard'];
const EMPTY_FORM = { name: '', category: 'sofa', price: '', condition: 'New', status: 'available', desc: '' };

export default function AdminListings() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => { setItems(getListings()); }, []);

  const filtered = filter === 'All' ? items : items.filter((i) => i.category === filter);

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, category: item.category, price: item.price, condition: item.condition, status: item.status, desc: item.desc });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.price) return;
    let updated;
    if (editItem) {
      updated = items.map((i) => i.id === editItem.id ? { ...i, ...form, price: Number(form.price) } : i);
    } else {
      updated = [...items, { ...form, id: Date.now().toString(), price: Number(form.price) }];
    }
    setItems(updated);
    saveListings(updated);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Remove this listing?')) return;
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    saveListings(updated);
  };

  const tabStyle = (cat) => ({
    padding: '0.6rem 1.2rem',
    background: filter === cat ? 'var(--dark)' : 'transparent',
    color: filter === cat ? 'var(--gold)' : 'var(--warm-gray)',
    border: '0.5px solid var(--border)',
    marginRight: '-0.5px',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: '0.72rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    transition: 'all 0.2s',
  });

  return (
    <div className="page-layout">
      <AdminSidebar />
      <main className="main-content">
        <div className="page-header flex-between">
          <div>
            <p className="page-eyebrow">Furniture</p>
            <h1 className="page-title">Manage <em>Listings</em></h1>
          </div>
          <button className="btn btn-dark" onClick={openAdd}>+ Add Listing</button>
        </div>

        <div style={{ display: 'flex', marginBottom: '1.5rem' }}>
          {CATEGORIES.map((cat) => (
            <button key={cat} style={tabStyle(cat)} onClick={() => setFilter(cat)}>{cat}</button>
          ))}
        </div>

        <div className="card">
          {filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 300, color: 'var(--warm-gray)', marginBottom: '1rem' }}>
                No listings yet
              </p>
              <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Add your first furniture item to get started.</p>
              <button className="btn btn-dark" onClick={openAdd}>+ Add First Listing</button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name & Description</th>
                  <th>Category</th>
                  <th>Price (NZD)</th>
                  <th>Condition</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 400 }}>{item.name}</div>
                      {item.desc && <div style={{ fontSize: '0.75rem', color: 'var(--warm-gray)', marginTop: '0.2rem' }}>{item.desc}</div>}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{item.category}</td>
                    <td style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--gold-dark)' }}>
                      ${Number(item.price).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${item.condition === 'New' ? 'badge-confirmed' : 'badge-pending'}`}>
                        {item.condition}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${item.status}`}>{item.status}</span>
                    </td>
                    <td>
                      <div className="flex-gap" style={{ gap: '0.5rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">{editItem ? 'Edit Listing' : 'Add New Listing'}</h2>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Maison L-Shaped Sofa" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="sofa">Sofa / Chair</option>
                    <option value="table">Table</option>
                    <option value="rug">Rug</option>
                    <option value="cupboard">Cupboard</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (NZD) *</label>
                  <input className="form-input" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select className="form-select" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                    <option value="New">New</option>
                    <option value="Second Hand">Second Hand</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Fabric, dimensions, colour, any details..." />
              </div>
              <div className="flex-gap" style={{ justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-dark" onClick={handleSave}>
                  {editItem ? 'Save Changes' : 'Add Listing'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
