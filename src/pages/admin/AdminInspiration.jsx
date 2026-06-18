import { useState, useEffect, useRef } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { supabase } from '../../lib/supabase';

const TAGS = ['Living Room', 'Dining', 'Bedroom', 'Study', 'Kitchen'];
const BUCKET = 'listing-photos';
const EMPTY_FORM = { title: '', tag: 'Living Room', description: '' };

export default function AdminInspiration() {
  const [items, setItems] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [filterTag, setFilterTag] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedListingIds, setSelectedListingIds] = useState([]);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [additionalPhotos, setAdditionalPhotos] = useState([]);
  const mainPhotoRef = useRef();
  const additionalRef = useRef();
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); loadListings(); }, []);

  async function load() {
    const { data } = await supabase.from('staging_inspiration').select('*').order('created_at', { ascending: false });
    setItems(data || []);
  }

  async function loadListings() {
    const { data } = await supabase.from('listings').select('id,name,price,photo_url,condition,category').order('name');
    setAllListings(data || []);
  }

  const displayed = filterTag === 'All' ? items : items.filter((i) => i.tag === filterTag);

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setPhotoFile(null);
    setPhotoPreview(null);
    setAdditionalPhotos([]);
    setSelectedListingIds([]);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ title: item.title, tag: item.tag, description: item.description || '' });
    setPhotoFile(null);
    setPhotoPreview(item.photo_url || null);
    setAdditionalPhotos((item.photos || []).map((url) => ({ file: null, preview: url, existingUrl: url })));
    setSelectedListingIds(item.listing_ids || []);
    setShowModal(true);
  };

  const toggleListing = (id) => {
    setSelectedListingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleMainPhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleAdditionalPhotos = (e) => {
    const files = Array.from(e.target.files);
    setAdditionalPhotos((prev) => [...prev, ...files.map((f) => ({ file: f, preview: URL.createObjectURL(f), existingUrl: null }))]);
  };

  const removeAdditional = (i) => setAdditionalPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const uploadPhoto = async (file) => {
    const ext = file.name.split('.').pop();
    const path = `inspiration/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
    if (error) { alert(`Upload failed: ${error.message}`); return null; }
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);

    let photo_url = editItem?.photo_url || null;
    if (photoFile) {
      const url = await uploadPhoto(photoFile);
      if (url) photo_url = url;
    }

    const additionalUrls = [];
    for (const ap of additionalPhotos) {
      if (ap.existingUrl) additionalUrls.push(ap.existingUrl);
      else if (ap.file) {
        const url = await uploadPhoto(ap.file);
        if (url) additionalUrls.push(url);
      }
    }

    const payload = {
      title: form.title.trim(),
      tag: form.tag,
      description: form.description,
      photo_url,
      photos: additionalUrls,
      listing_ids: selectedListingIds,
    };

    if (editItem) {
      await supabase.from('staging_inspiration').update(payload).eq('id', editItem.id);
    } else {
      await supabase.from('staging_inspiration').insert(payload);
    }

    setSaving(false);
    setShowModal(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    await supabase.from('staging_inspiration').delete().eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const tabStyle = (t) => ({
    padding: '0.55rem 1.1rem', background: filterTag === t ? 'var(--blue)' : 'transparent',
    color: filterTag === t ? '#f0d8c8' : 'var(--ink-muted)', border: '1.5px solid var(--border)',
    marginRight: '-1px', cursor: 'pointer', fontFamily: 'var(--font-body)',
    fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, transition: 'all 0.2s',
  });

  return (
    <div className="page-layout">
      <AdminSidebar />
      <main className="main-content">
        <div className="page-header flex-between">
          <div>
            <p className="page-eyebrow">Staging Page</p>
            <h1 className="page-title">Room <em>Ideas</em></h1>
          </div>
          <button className="btn btn-dark" onClick={openAdd}>+ Add Room</button>
        </div>

        <div style={{ background: 'var(--blue-pale)', border: '1.5px solid var(--border)', borderLeft: '3px solid var(--blue-mid)', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--ink-mid)', lineHeight: 1.7 }}>
          <strong>How it works:</strong> Upload a room photo, then tick which furniture from your shop is featured in it. Customers will see the room and can shop those exact pieces directly.
        </div>

        <div style={{ display: 'flex', marginBottom: '1.5rem' }}>
          {['All', ...TAGS].map((t) => <button key={t} style={tabStyle(t)} onClick={() => setFilterTag(t)}>{t}</button>)}
        </div>

        {displayed.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--ink-muted)', marginBottom: '1rem' }}>No room ideas yet</p>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Add a styled room photo and tag the furniture in it — customers can then shop the look.</p>
            <button className="btn btn-dark" onClick={openAdd}>+ Add First Room</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.25rem' }}>
            {displayed.map((item) => {
              const featuredProducts = allListings.filter((l) => (item.listing_ids || []).includes(l.id));
              const allPhotos = [item.photo_url, ...(item.photos || [])].filter(Boolean);
              return (
                <div key={item.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ height: 180, background: 'var(--blue-light)', position: 'relative', overflow: 'hidden' }}>
                    {allPhotos.length > 0
                      ? <img src={allPhotos[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--ink-muted)', letterSpacing: '0.15em' }}>NO PHOTO</span>
                        </div>
                    }
                    <span style={{ position: 'absolute', top: '0.6rem', left: '0.6rem', background: 'var(--blue)', color: '#f0d8c8', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.25rem 0.6rem', fontWeight: 700 }}>{item.tag}</span>
                    <span style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', background: featuredProducts.length > 0 ? 'var(--rust)' : 'rgba(15,30,46,0.6)', color: 'white', fontSize: '0.62rem', padding: '0.25rem 0.6rem', fontWeight: 700 }}>
                      {featuredProducts.length} {featuredProducts.length === 1 ? 'product' : 'products'}
                    </span>
                  </div>

                  <div style={{ padding: '1rem 1.25rem 1.25rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.4rem' }}>{item.title}</h3>
                    {item.description && <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.75rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>}

                    {/* Product thumbnails */}
                    {featuredProducts.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        {featuredProducts.slice(0, 4).map((p) => (
                          <div key={p.id} title={p.name} style={{ width: 40, height: 34, border: '1.5px solid var(--border)', overflow: 'hidden', background: 'var(--blue-pale)' }}>
                            {p.photo_url
                              ? <img src={p.photo_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: 'var(--ink-muted)' }}>IMG</div>
                            }
                          </div>
                        ))}
                        {featuredProducts.length > 4 && <div style={{ width: 40, height: 34, border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', color: 'var(--blue-mid)', fontWeight: 700, background: 'var(--blue-pale)' }}>+{featuredProducts.length - 4}</div>}
                      </div>
                    )}

                    <div className="flex-gap" style={{ gap: '0.5rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── MODAL ── */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">{editItem ? 'Edit Room Idea' : 'Add Room Idea'}</h2>

              {/* Room photo */}
              <div className="form-group">
                <label className="form-label">Room Photo</label>
                <div onClick={() => mainPhotoRef.current.click()} style={{ border: '2px dashed var(--border)', padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--blue-pale)' }}>
                  {photoPreview
                    ? <img src={photoPreview} alt="room" style={{ width: 96, height: 72, objectFit: 'cover' }} />
                    : <div style={{ width: 96, height: 72, background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--blue-mid)' }}>＋</div>}
                  <div>
                    <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink-mid)' }}>{photoPreview ? 'Click to change room photo' : 'Upload a photo of the styled room'}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: '0.2rem' }}>JPG, PNG — the hero image customers see first</p>
                  </div>
                </div>
                <input ref={mainPhotoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleMainPhoto} />
              </div>

              {/* Additional photos */}
              <div className="form-group">
                <label className="form-label">More Room Photos <span style={{ color: 'var(--ink-muted)', fontWeight: 400, textTransform: 'none', fontSize: '0.75rem' }}>(optional — different angles)</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                  {additionalPhotos.map((ap, i) => (
                    <div key={i} style={{ position: 'relative', width: 72, height: 60 }}>
                      <img src={ap.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', border: '1.5px solid var(--border)' }} />
                      <button onClick={() => removeAdditional(i)} style={{ position: 'absolute', top: 2, right: 2, background: '#c04a1a', color: 'white', border: 'none', width: 18, height: 18, fontSize: '10px', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))}
                  <div onClick={() => additionalRef.current.click()} style={{ width: 72, height: 60, border: '2px dashed var(--border)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.1rem', background: 'var(--blue-pale)', color: 'var(--blue-mid)' }}>
                    <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>＋</span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700 }}>ADD</span>
                  </div>
                </div>
                <input ref={additionalRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleAdditionalPhotos} />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Room Name *</label>
                  <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Coastal Living Room" />
                </div>
                <div className="form-group">
                  <label className="form-label">Room Type *</label>
                  <select className="form-select" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}>
                    {TAGS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" style={{ minHeight: 68 }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the room style, feel, or property it was staged for…" />
              </div>

              {/* ── PRODUCT PICKER ── */}
              <div className="form-group">
                <label className="form-label">
                  Furniture in this room
                  <span style={{ color: 'var(--ink-muted)', fontWeight: 400, textTransform: 'none', fontSize: '0.75rem', marginLeft: '0.5rem' }}>— tick items shown in the photo so customers can shop the look</span>
                </label>

                {allListings.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', padding: '1rem', background: 'var(--blue-pale)', border: '1.5px solid var(--border)' }}>No listings yet — add some from the Listings page first.</p>
                ) : (
                  <div style={{ border: '1.5px solid var(--border)', maxHeight: 260, overflowY: 'auto' }}>
                    {allListings.map((listing) => {
                      const checked = selectedListingIds.includes(listing.id);
                      return (
                        <label key={listing.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.9rem', cursor: 'pointer', background: checked ? 'var(--blue-pale)' : 'white', borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}>
                          <input type="checkbox" checked={checked} onChange={() => toggleListing(listing.id)} style={{ width: 16, height: 16, accentColor: 'var(--blue)', flexShrink: 0 }} />
                          {listing.photo_url
                            ? <img src={listing.photo_url} alt={listing.name} style={{ width: 44, height: 36, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }} />
                            : <div style={{ width: 44, height: 36, background: 'var(--blue-light)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: 'var(--ink-muted)' }}>IMG</div>
                          }
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{listing.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', textTransform: 'capitalize' }}>{listing.category} · {listing.condition}</div>
                          </div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--rust)', fontWeight: 600, flexShrink: 0 }}>${Number(listing.price).toLocaleString()}</div>
                        </label>
                      );
                    })}
                  </div>
                )}
                {selectedListingIds.length > 0 && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--blue-mid)', fontWeight: 700, marginTop: '0.4rem' }}>
                    {selectedListingIds.length} {selectedListingIds.length === 1 ? 'product' : 'products'} tagged in this room
                  </p>
                )}
              </div>

              <div className="flex-gap" style={{ justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-dark" onClick={handleSave} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Room'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
