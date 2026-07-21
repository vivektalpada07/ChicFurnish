import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerNav from '../../components/CustomerNav';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const TIMES = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

export default function CustomerProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(null);
  const [lightbox, setLightbox] = useState(false);

  const [slideIndex, setSlideIndex] = useState(0);
  const sliderRef = useRef(null);

  const [viewingOpen, setViewingOpen] = useState(false);
  const [viewingForm, setViewingForm] = useState({ phone: '', date: '', time: '10:00 AM' });
  const [viewingDone, setViewingDone] = useState(false);

  useEffect(() => {
    supabase.from('listings').select('*').eq('id', id).single()
      .then(({ data }) => {
        setItem(data);
        setActivePhoto(data?.photo_url || null);
        setLoading(false);
      });
  }, [id]);

  const openViewing = () => {
    if (!user) { navigate('/login'); return; }
    setViewingForm({ phone: user.phone || '', date: '', time: '10:00 AM' });
    setViewingDone(false);
    setViewingOpen(true);
  };

  const submitViewing = async () => {
    if (!viewingForm.date) return;
    const bookingData = {
      id: `VB-${Date.now()}`,
      listing_id: item.id,
      listing_name: item.name,
      customer_name: user.name,
      customer_email: user.email,
      customer_phone: viewingForm.phone,
      date: viewingForm.date,
      time: viewingForm.time,
      status: 'pending',
    };
    await supabase.from('viewing_bookings').insert(bookingData);
    supabase.functions.invoke('notify-admin', { body: { type: 'viewing', data: bookingData } });
    setViewingDone(true);
    setTimeout(() => setViewingOpen(false), 2500);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8f4ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: '#1a3a5c', letterSpacing: '0.2em' }}>Loading…</p>
    </div>
  );

  if (!item) return (
    <div style={{ minHeight: '100vh', background: '#f8f4ee' }}>
      <CustomerNav />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#0f1e2e' }}>Item not found</p>
        <button onClick={() => navigate('/shop')} style={backBtnStyle}>← Back to Shop</button>
      </div>
    </div>
  );

  const allPhotos = [item.photo_url, ...(item.photos || [])].filter(Boolean);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f4ee' }}>
      <CustomerNav />

      {/* Lightbox — swipe slider */}
      {lightbox && allPhotos.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column' }}>
          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', flexShrink: 0 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>{slideIndex + 1} / {allPhotos.length}</span>
            <button onClick={() => setLightbox(false)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>

          {/* Swipeable image strip */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <div
              style={{ display: 'flex', height: '100%', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
              ref={(el) => { if (el) el.scrollLeft = slideIndex * el.offsetWidth; }}
              onScroll={(e) => {
                const idx = Math.round(e.target.scrollLeft / e.target.offsetWidth);
                if (idx !== slideIndex) { setSlideIndex(idx); setActivePhoto(allPhotos[idx]); }
              }}
            >
              {allPhotos.map((photo, i) => (
                <div key={i} style={{ minWidth: '100%', height: '100%', scrollSnapAlign: 'start', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}>
                  <img src={photo} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', userSelect: 'none' }} />
                </div>
              ))}
            </div>

            {/* Prev / Next arrows */}
            {slideIndex > 0 && (
              <button onClick={() => { const i = slideIndex - 1; setSlideIndex(i); setActivePhoto(allPhotos[i]); sliderRef.current?.scrollTo({ left: i * sliderRef.current.offsetWidth, behavior: 'smooth' }); }}
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            )}
            {slideIndex < allPhotos.length - 1 && (
              <button onClick={() => { const i = slideIndex + 1; setSlideIndex(i); setActivePhoto(allPhotos[i]); sliderRef.current?.scrollTo({ left: i * sliderRef.current.offsetWidth, behavior: 'smooth' }); }}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
            )}
          </div>

          {/* Dot indicators */}
          {allPhotos.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', padding: '0.75rem', flexShrink: 0 }}>
              {allPhotos.map((_, i) => (
                <div key={i} style={{ width: slideIndex === i ? 20 : 8, height: 8, borderRadius: 4, background: slideIndex === i ? 'white' : 'rgba(255,255,255,0.35)', transition: 'all 0.2s', cursor: 'pointer' }} onClick={() => { setSlideIndex(i); setActivePhoto(allPhotos[i]); }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="pdp-breadcrumb">
        <button onClick={() => navigate('/shop')} style={{ background: 'none', border: 'none', color: '#c04a1a', fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.08em' }}>← Back to Shop</button>
        <span style={{ color: '#b8c8d8', margin: '0 0.5rem' }}>/</span>
        <span style={{ fontSize: '0.78rem', color: '#4a5e72', fontWeight: 500 }}>{item.name}</span>
      </div>

      {/* Main layout */}
      <div className="pdp-layout">

        {/* ── LEFT: IMAGE GALLERY ── */}
        <div className="pdp-gallery">

          {/* Swipe slider (mobile) / main image (desktop) */}
          <div style={{ position: 'relative', background: '#dde8f0', overflow: 'hidden' }} className="pdp-main-img">
            {allPhotos.length > 0 ? (
              <>
                {/* Scrollable slider strip */}
                <div
                  ref={sliderRef}
                  onScroll={(e) => {
                    const idx = Math.round(e.target.scrollLeft / e.target.offsetWidth);
                    setSlideIndex(idx);
                    setActivePhoto(allPhotos[idx]);
                  }}
                  style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', height: '100%', scrollbarWidth: 'none' }}
                >
                  {allPhotos.map((photo, i) => (
                    <div key={i} style={{ minWidth: '100%', height: '100%', scrollSnapAlign: 'start', flexShrink: 0, cursor: 'zoom-in' }} onClick={() => setLightbox(true)}>
                      <img src={photo} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  ))}
                </div>

                {/* Dot indicators */}
                {allPhotos.length > 1 && (
                  <div style={{ position: 'absolute', bottom: '0.7rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.4rem' }}>
                    {allPhotos.map((_, i) => (
                      <button key={i} onClick={() => {
                        sliderRef.current?.scrollTo({ left: i * sliderRef.current.offsetWidth, behavior: 'smooth' });
                        setSlideIndex(i); setActivePhoto(allPhotos[i]);
                      }} style={{ width: slideIndex === i ? 20 : 8, height: 8, borderRadius: 4, border: 'none', background: slideIndex === i ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0, transition: 'all 0.2s' }} />
                    ))}
                  </div>
                )}

                {/* Zoom hint */}
                <span style={{ position: 'absolute', top: '0.7rem', right: '0.7rem', background: 'rgba(0,0,0,0.4)', color: 'white', fontSize: '0.65rem', padding: '0.25rem 0.55rem', fontWeight: 600, pointerEvents: 'none' }}>⤢ Tap to zoom</span>
              </>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', color: 'rgba(26,58,92,0.3)', fontSize: '1.2rem', letterSpacing: '0.3em' }}>{item.category?.toUpperCase()}</span>
              </div>
            )}
            <span style={{ position: 'absolute', top: '0.7rem', left: '0.7rem', background: item.condition === 'New' ? '#1a3a5c' : '#c04a1a', color: 'white', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '0.28rem 0.75rem', fontWeight: 700 }}>{item.condition}</span>
          </div>

          {/* Thumbnail row — desktop only */}
          {allPhotos.length > 1 && (
            <div className="pdp-thumbs">
              {allPhotos.map((photo, i) => (
                <div key={i} onClick={() => {
                  setActivePhoto(photo); setSlideIndex(i);
                  sliderRef.current?.scrollTo({ left: i * sliderRef.current.offsetWidth, behavior: 'smooth' });
                }} className="pdp-thumb" style={{ outline: slideIndex === i ? '2.5px solid #1a3a5c' : '2px solid #ccc', outlineOffset: slideIndex === i ? 2 : 0 }}>
                  <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: PRODUCT INFO ── */}
        <div className="pdp-info" style={{ padding: '1.25rem 1rem 1rem' }}>

          {/* Category tag */}
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c04a1a', fontWeight: 700, marginBottom: '0.5rem' }}>
            {item.category}
          </p>

          {/* Name */}
          <h1 className="pdp-title">{item.name}</h1>

          {/* Price */}
          <div className="pdp-price-row">
            <span className="pdp-price">${Number(item.price).toLocaleString()}</span>
            <span style={{ fontSize: '0.88rem', color: '#4a5e72', fontWeight: 700 }}>NZD</span>
          </div>

          <div style={{ height: '1px', background: '#dde3e8', margin: '1.25rem 0' }} />

          {/* Description */}
          {item.description && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1a3a5c', fontWeight: 700, marginBottom: '0.6rem' }}>About this item</p>
              <p style={{ fontSize: '0.95rem', color: '#2a3d52', lineHeight: 1.85, fontWeight: 400, whiteSpace: 'pre-wrap' }}>{item.description}</p>
            </div>
          )}

          {/* Details table */}
          <div style={{ background: '#eef5fb', border: '1px solid #d6e8f5', padding: '1rem 1.25rem', marginBottom: '1.75rem' }}>
            <p style={{ fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1a3a5c', fontWeight: 700, marginBottom: '0.75rem' }}>Item Details</p>
            {[
              ['Condition', item.condition],
              ['Category', item.category],
              ['Location', 'Auckland, New Zealand'],
              ['Availability', item.status === 'available' ? 'In Stock' : 'Sold'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid #d6e8f5', fontSize: '0.88rem' }}>
                <span style={{ color: '#4a5e72', fontWeight: 600 }}>{k}</span>
                <span style={{ color: '#0f1e2e', fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="pdp-actions">
            <button className="pdp-btn-primary" onClick={openViewing}>
              Book a Viewing
            </button>
            <button className="pdp-btn-secondary" onClick={() => navigate('/shop')}>
              Browse More
            </button>
          </div>

          {/* Trust signals */}
          <div className="pdp-trust">
            {['✓  Free viewing — no obligation', '✓  Professional inspection done', '✓  Auckland pickup & delivery available'].map((t) => (
              <p key={t} style={{ fontSize: '0.82rem', color: '#4a5e72', fontWeight: 500, padding: '0.3rem 0' }}>{t}</p>
            ))}
          </div>
        </div>
      </div>

      {/* ── VIEWING BOOKING MODAL ── */}
      {viewingOpen && (
        <div className="modal-overlay" onClick={() => setViewingOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            {viewingDone ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontSize: '3rem', color: '#c04a1a', marginBottom: '1rem' }}>✓</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, color: '#0f1e2e', marginBottom: '0.75rem' }}>Viewing Requested!</h2>
                <p style={{ color: '#2a3d52', fontSize: '0.95rem', lineHeight: 1.9 }}>We'll confirm your viewing for <strong>{item.name}</strong> within 24 hours.</p>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 600, color: '#0f1e2e', marginBottom: '1.25rem' }}>Book a Viewing</h2>
                <div style={{ background: '#eef5fb', border: '1px solid #d6e8f5', borderLeft: '4px solid #1a3a5c', padding: '0.9rem 1.1rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, color: '#0f1e2e' }}>{item.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#4a5e72', marginTop: '0.2rem' }}>${Number(item.price).toLocaleString()} NZD · {item.condition}</div>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={user?.name || ''} disabled style={{ opacity: 0.65 }} /></div>
                  <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.65 }} /></div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={viewingForm.phone} onChange={(e) => setViewingForm({ ...viewingForm, phone: e.target.value })} placeholder="021 XXX XXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Preferred Date *</label>
                    <input className="form-input" type="date" value={viewingForm.date} onChange={(e) => setViewingForm({ ...viewingForm, date: e.target.value })} min={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Time</label>
                  <select className="form-select" value={viewingForm.time} onChange={(e) => setViewingForm({ ...viewingForm, time: e.target.value })}>
                    {TIMES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button onClick={() => setViewingOpen(false)} style={{ background: 'none', border: '2px solid #b8c8d8', color: '#4a5e72', padding: '0.7rem 1.3rem', fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Cancel</button>
                  <button onClick={submitViewing} disabled={!viewingForm.date} style={{ background: viewingForm.date ? '#1a3a5c' : '#b8c8d8', color: '#f0d8c8', border: 'none', padding: '0.7rem 1.5rem', fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 700, cursor: viewingForm.date ? 'pointer' : 'not-allowed', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    Request Viewing →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const backBtnStyle = { background: 'none', border: '2px solid #b8c8d8', color: '#1a3a5c', padding: '0.6rem 1.2rem', fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' };
