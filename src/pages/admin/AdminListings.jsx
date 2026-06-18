import { useState, useEffect, useRef } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { supabase } from '../../lib/supabase';

const CATEGORIES = ['All', 'sofa', 'table', 'rug', 'cupboard'];
const EMPTY_FORM = { name: '', category: 'sofa', price: '', condition: 'New', status: 'available', description: '' };
const BUCKET = 'listing-photos';

export default function AdminListings() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
    setItems(data || []);
  }

  const filtered = filter === 'All' ? items : items.filter((i) => i.category === filter);

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, category: item.category, price: item.price, condition: item.condition, status: item.status, description: item.description || '' });
    setPhotoFile(null);
    setPhotoPreview(item.photo_url || null);
    setShowModal(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const uploadPhoto = async (file) => {
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
    if (error) { console.error(error); return null; }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return;
    setSaving(true);

    let photo_url = editItem?.photo_url || null;
    if (photoFile) {
      const uploaded = await uploadPhoto(photoFile);
      if (uploaded) photo_url = uploaded;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      condition: form.condition,
      status: form.status,
      description: form.description,
      photo_url,
    };

    if (editItem) {
      await supabase.from('listings').update(payload).eq('id', editItem.id);
    } else {
      await supabase.from('listings').insert(payload);
    }

    setSaving(false);
    setShowModal(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this listing?')) return;
    await supabase.from('listings').delete().eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const tabStyle = (cat) => ({
    padding: '0.6rem 1.2rem',
    background: filter === cat ? 'var(--blue)' : 'transparent',
    color: filter === cat ? '#f0d8c8' : 'var(--ink-muted)',
    border: '1.5px solid var(--border)',
    marginRight: '-1px',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: '0.72rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    transition: 'all 0.2s',
    fontWeight: 600,
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
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--ink-muted)', marginBottom: '1rem' }}>
                No listings yet
              </p>
              <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Add your first furniture item to get started.</p>
              <button className="btn btn-dark" onClick={openAdd}>+ Add First Listing</button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Photo</th>
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
                    <td style={{ width: 64 }}>
                      {item.photo_url
                        ? <img src={item.photo_url} alt={item.name} style={{ width: 56, height: 48, objectFit: 'cover', border: '1.5px solid var(--border)' }} />
                        : <div style={{ width: 56, height: 48, background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--ink-muted)', letterSpacing: '0.1em' }}>NO IMG</div>}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      {item.description && <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '0.2rem' }}>{item.description}</div>}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{item.category}</td>
                    <td style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--rust)' }}>
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
            <div className="modal" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">{editItem ? 'Edit Listing' : 'Add New Listing'}</h2>

              {/* Photo upload */}
              <div className="form-group">
                <label className="form-label">Product Photo</label>
                <div
                  onClick={() => fileRef.current.click()}
                  style={{
                    border: '2px dashed var(--border)', padding: '1rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    background: photoPreview ? 'transparent' : 'var(--blue-pale)',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {photoPreview
                    ? <img src={photoPreview} alt="preview" style={{ width: 80, height: 64, objectFit: 'cover' }} />
                    : <div style={{ width: 80, height: 64, background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--blue-mid)' }}>＋</div>}
                  <div>
                    <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink-mid)' }}>
                      {photoPreview ? 'Click to change photo' : 'Click to upload photo'}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: '0.2rem' }}>JPG, PNG, WEBP — max 5 MB</p>
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
              </div>

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
                <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Fabric, dimensions, colour, any details…" />
              </div>
              <div className="flex-gap" style={{ justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-dark" onClick={handleSave} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Listing'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
