import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerNav from '../../components/CustomerNav';
import { supabase } from '../../lib/supabase';

export default function CustomerHome() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [heroImg, setHeroImg] = useState(null);

  useEffect(() => {
    supabase
      .from('listings')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => {
        const items = data || [];
        setFeatured(items);
        const withImg = items.find((i) => Array.isArray(i.images) ? i.images[0] : i.images);
        if (withImg) {
          setHeroImg(Array.isArray(withImg.images) ? withImg.images[0] : withImg.images);
        }
      });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f4ee' }}>
      <CustomerNav />

      {/* ── HERO ── */}
      <section className="hero-section">
        {/* Left: text */}
        <div className="hero-text">
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#c9a96e', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'var(--font-body)' }}>
            Auckland, New Zealand
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.2rem, 5.5vw, 6rem)', fontWeight: 600, lineHeight: 1.0, color: '#f8f4ee', marginBottom: '1.5rem' }}>
            Furniture<br />that <em style={{ color: '#c9a96e' }}>sells<br />homes.</em>
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(240,216,200,0.8)', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: 440, fontFamily: 'var(--font-body)' }}>
            Premium pre-loved furniture for Auckland buyers
            and Professional home staging that gets properties sold faster.
          </p>
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <button onClick={() => navigate('/shop')} className="btn-hero-primary">Browse Furniture →</button>
            <button onClick={() => navigate('/inspiration')} className="btn-hero-outline">View Staging Work</button>
          </div>
          {/* Stats inline */}
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', borderTop: '1px solid rgba(201,169,110,0.2)', paddingTop: '2rem' }}>
            {[ ['48hr', 'Avg Staging Time'], ['100%', 'Auckland-Based']].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, color: '#c9a96e', lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,216,200,0.5)', marginTop: '0.3rem', fontFamily: 'var(--font-body)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: image panel */}
        <div className="hero-image-panel">
          {heroImg ? (
            <img src={heroImg} alt="Featured furniture" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '3rem' }}>
              {/* Decorative room SVG when no image */}
              <svg viewBox="0 0 300 260" width="80%" style={{ opacity: 0.18 }} fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="180" width="260" height="4" fill="#f0d8c8"/>
                <rect x="20" y="40" width="4" height="144" fill="#f0d8c8"/>
                <rect x="276" y="40" width="4" height="144" fill="#f0d8c8"/>
                <rect x="24" y="40" width="252" height="4" fill="#f0d8c8"/>
                <rect x="60" y="140" width="180" height="40" rx="4" fill="#f0d8c8"/>
                <rect x="80" y="120" width="60" height="20" rx="2" fill="#f0d8c8"/>
                <rect x="165" y="120" width="60" height="20" rx="2" fill="#f0d8c8"/>
                <rect x="110" y="80" width="80" height="60" rx="2" fill="#c9a96e" fillOpacity="0.4"/>
                <rect x="55" y="155" width="14" height="25" fill="#c9a96e" fillOpacity="0.5"/>
                <rect x="231" y="155" width="14" height="25" fill="#c9a96e" fillOpacity="0.5"/>
                <circle cx="185" cy="65" r="18" stroke="#f0d8c8" strokeWidth="2"/>
                <line x1="185" y1="47" x2="185" y2="40" stroke="#f0d8c8" strokeWidth="2"/>
              </svg>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'rgba(240,216,200,0.35)', letterSpacing: '0.1em', textAlign: 'center' }}>
                Luxury furniture<br />coming soon
              </p>
            </div>
          )}
          {/* Overlay badge */}
          {heroImg && (
            <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', background: 'rgba(15,30,46,0.85)', backdropFilter: 'blur(8px)', padding: '0.75rem 1.1rem', borderLeft: '3px solid #c9a96e' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a96e', fontFamily: 'var(--font-body)', fontWeight: 700 }}>Now Available</p>
              <p style={{ fontSize: '0.88rem', color: '#f8f4ee', fontFamily: 'var(--font-display)', marginTop: '0.2rem' }}>{featured[0]?.name}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── SERVICES SPLIT ── */}
      <section className="services-grid">
        <div className="service-panel service-panel-light">
          <div style={{ width: 40, height: 3, background: '#c04a1a', marginBottom: '1.75rem' }} />
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c04a1a', fontWeight: 700, marginBottom: '0.6rem', fontFamily: 'var(--font-body)' }}>Buy Furniture</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 2.5vw, 2.6rem)', fontWeight: 600, lineHeight: 1.15, color: '#0f1e2e', marginBottom: '1.1rem' }}>
            Pre-loved pieces,<br /><em>luxury quality</em>
          </h2>
          <p style={{ color: '#4a5e72', lineHeight: 1.8, marginBottom: '1.75rem', fontSize: '0.93rem' }}>
           Discover quality pre-owned and used furniture at affordable prices. We carefully select pieces that are well-maintained and ready to be enjoyed again or looking to sell your property? My professional home staging service helps present your home at its best and make a strong impression on buyers.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '2.25rem' }}>
            {['View any item in person before buying', 'Bank transfer upon delivery, cash accepted', 'Delivery available across Auckland'].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem', fontSize: '0.87rem', color: '#2a3d52' }}>
                <span style={{ color: '#c04a1a', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>✓</span>{item}
              </li>
            ))}
          </ul>
          <button onClick={() => navigate('/shop')} style={{ background: '#1a3a5c', border: 'none', color: '#f0d8c8', padding: '0.9rem 2rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Shop Now →
          </button>
        </div>

        <div className="service-panel service-panel-dark">
          <div style={{ width: 40, height: 3, background: '#c9a96e', marginBottom: '1.75rem' }} />
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c9a96e', fontWeight: 700, marginBottom: '0.6rem', fontFamily: 'var(--font-body)' }}>Home Staging</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 2.5vw, 2.6rem)', fontWeight: 600, lineHeight: 1.15, color: '#f8f4ee', marginBottom: '1.1rem' }}>
            Stage to sell,<br /><em style={{ color: '#c9a96e' }}>faster & higher</em>
          </h2>
          <p style={{ color: 'rgba(240,216,200,0.72)', lineHeight: 1.8, marginBottom: '1.75rem', fontSize: '0.93rem' }}>
            We transform empty properties into aspirational homes that photograph beautifully and attract serious buyers. Trusted by Auckland real estate agents and private sellers alike.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '2.25rem' }}>
            {['Full property styling — lounge to bedroom', 'Furniture delivered & installed ', 'Available across greater Auckland'].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem', fontSize: '0.87rem', color: 'rgba(240,216,200,0.82)' }}>
                <span style={{ color: '#c9a96e', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>✓</span>{item}
              </li>
            ))}
          </ul>
          <button onClick={() => navigate('/contact')} style={{ background: 'transparent', border: '2px solid #c9a96e', color: '#c9a96e', padding: '0.9rem 2rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Get a Quote →
          </button>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: 'clamp(3rem, 6vw, 6rem) clamp(1.5rem, 6vw, 5rem)', background: '#ede7dc', borderTop: '2px solid #b8c8d8', borderBottom: '2px solid #b8c8d8' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c04a1a', fontWeight: 700, marginBottom: '0.6rem', fontFamily: 'var(--font-body)' }}>Simple Process</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, color: '#0f1e2e' }}>
            How it <em style={{ color: '#2e5f8a' }}>works</em>
          </h2>
        </div>
        <div className="steps-grid">
          {[
            { step: '01', icon: (
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="2" y="4" width="24" height="18" rx="2" stroke="#1a3a5c" strokeWidth="2"/><path d="M8 14h12M8 10h8" stroke="#c04a1a" strokeWidth="2" strokeLinecap="round"/></svg>
            ), title: 'Browse the collection', desc: 'Filter by category, view photos, and read item details from your phone or laptop.' },
            { step: '02', icon: (
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="11" stroke="#1a3a5c" strokeWidth="2"/><path d="M14 8v6l4 2" stroke="#c04a1a" strokeWidth="2" strokeLinecap="round"/></svg>
            ), title: 'Book a viewing', desc: 'Reserve a time to see any piece in person at our Auckland location before committing.' },
            { step: '03', icon: (
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="8" width="20" height="14" rx="2" stroke="#1a3a5c" strokeWidth="2"/><path d="M9 8V6a5 5 0 0110 0v2" stroke="#1a3a5c" strokeWidth="2"/><path d="M10 15l3 3 5-5" stroke="#c04a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ), title: 'Buy with confidence', desc: 'Pay by bank transfer, cash. Arrange pickup or delivery across Auckland.' },
            { step: '04', icon: (
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 6h20v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" stroke="#1a3a5c" strokeWidth="2"/><path d="M4 6l10 9 10-9" stroke="#c04a1a" strokeWidth="2" strokeLinecap="round"/></svg>
            ), title: 'Ask us anything', desc: 'Message us directly from any product page — we reply within one business day.' },
          ].map((s) => (
            <div key={s.step} className="step-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'rgba(26,58,92,0.18)', lineHeight: 1 }}>{s.step}</span>
                {s.icon}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, color: '#0f1e2e', marginBottom: '0.5rem' }}>{s.title}</h3>
              <p style={{ fontSize: '0.87rem', color: '#4a5e72', lineHeight: 1.75 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED LISTINGS — only show items with images ── */}
      {featured.filter(i => Array.isArray(i.images) ? i.images[0] : i.images).length > 0 && (
        <section style={{ padding: 'clamp(3rem, 6vw, 6rem) clamp(1.5rem, 6vw, 5rem)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c04a1a', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-body)' }}>New In</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 600, color: '#0f1e2e' }}>
                Latest <em style={{ color: '#2e5f8a' }}>arrivals</em>
              </h2>
            </div>
            <button onClick={() => navigate('/shop')} style={{ background: 'none', border: '2px solid #1a3a5c', color: '#1a3a5c', padding: '0.65rem 1.5rem', fontFamily: 'var(--font-body)', fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              View All →
            </button>
          </div>
          <div className="featured-grid">
            {featured
              .filter(item => Array.isArray(item.images) ? item.images[0] : item.images)
              .map((item) => {
                const img = Array.isArray(item.images) ? item.images[0] : item.images;
                return (
                  <div key={item.id} className="featured-card" onClick={() => navigate(`/shop/${item.id}`)}>
                    <div style={{ height: 240, overflow: 'hidden', background: '#ede7dc' }}>
                      <img src={img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.04)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                      />
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      {item.condition && <span style={{ fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c04a1a', fontWeight: 700, fontFamily: 'var(--font-body)' }}>{item.condition}</span>}
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, color: '#0f1e2e', margin: '0.35rem 0 0.75rem' }}>{item.name}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, color: '#c04a1a' }}>
                          ${Number(item.price).toLocaleString()} <span style={{ fontSize: '0.72rem', color: '#4a5e72', fontFamily: 'var(--font-body)', fontWeight: 400 }}>NZD</span>
                        </span>
                        <span style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1a3a5c', fontFamily: 'var(--font-body)', fontWeight: 600 }}>View →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* ── TRUST BANNER ── */}
      <section style={{ background: '#1a3a5c', padding: 'clamp(2.5rem, 5vw, 4.5rem) clamp(1.5rem, 6vw, 5rem)' }}>
        <div className="trust-grid">
          {[
            { icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 3C10.48 3 6 7.48 6 13c0 7.5 10 16 10 16s10-8.5 10-16c0-5.52-4.48-10-10-10z" stroke="#c9a96e" strokeWidth="2"/><circle cx="16" cy="13" r="3" stroke="#c9a96e" strokeWidth="2"/></svg>, title: 'Auckland Based', desc: 'We operate entirely within the Auckland region' },
            { icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="8" width="24" height="18" rx="2" stroke="#c9a96e" strokeWidth="2"/><path d="M11 8V6a5 5 0 0110 0v2" stroke="#c9a96e" strokeWidth="2"/><path d="M12 18l3 3 5-5" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, title: 'View Before You Buy', desc: 'Every item can be seen in person before purchase' },
            { icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="2" y="14" width="22" height="12" rx="2" stroke="#c9a96e" strokeWidth="2"/><path d="M24 18h4l2 4H24v-4z" stroke="#c9a96e" strokeWidth="2" strokeLinejoin="round"/><circle cx="8" cy="28" r="2" stroke="#c9a96e" strokeWidth="2"/><circle cx="20" cy="28" r="2" stroke="#c9a96e" strokeWidth="2"/><path d="M6 14V8a2 2 0 012-2h8l4 4v4" stroke="#c9a96e" strokeWidth="2" strokeLinejoin="round"/></svg>, title: 'Delivery Available', desc: 'We deliver across greater Auckland' },
            { icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M28 8H4a2 2 0 00-2 2v12a2 2 0 002 2h24a2 2 0 002-2V10a2 2 0 00-2-2z" stroke="#c9a96e" strokeWidth="2"/><path d="M2 12l14 9 14-9" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round"/></svg>, title: 'Direct Communication', desc: 'Message us from any listing — no middlemen' },
          ].map((t) => (
            <div key={t.title} style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>{t.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, color: '#f8f4ee', marginBottom: '0.4rem' }}>{t.title}</h3>
              <p style={{ fontSize: '0.82rem', color: 'rgba(240,216,200,0.6)', lineHeight: 1.65 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5.5rem) clamp(1.5rem, 6vw, 5rem)', textAlign: 'center', borderTop: '2px solid #b8c8d8' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c04a1a', fontWeight: 700, marginBottom: '0.75rem', fontFamily: 'var(--font-body)' }}>Ready to get started?</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, color: '#0f1e2e', marginBottom: '1rem' }}>
          Find your next favourite <em style={{ color: '#2e5f8a' }}>piece</em>
        </h2>
        <p style={{ color: '#4a5e72', maxWidth: 460, margin: '0 auto 2.5rem', fontSize: '0.93rem', lineHeight: 1.8 }}>
          Browse our current collection of pre-loved luxury furniture — each piece viewable in person before you commit.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/shop')} style={{ background: '#1a3a5c', border: 'none', color: '#f0d8c8', padding: '1rem 2.5rem', fontFamily: 'var(--font-body)', fontSize: '0.83rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}>
            Browse the Collection
          </button>
          <button onClick={() => navigate('/contact')} style={{ background: 'transparent', border: '2px solid #1a3a5c', color: '#1a3a5c', padding: '1rem 2.5rem', fontFamily: 'var(--font-body)', fontSize: '0.83rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}>
            Contact Us
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0f1e2e', padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 6vw, 5rem) 2rem', borderTop: '1px solid rgba(201,169,110,0.15)' }}>
        <div className="footer-grid">
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, letterSpacing: '0.15em', color: '#f8f4ee', marginBottom: '0.75rem' }}>
              CHIC <span style={{ color: '#c04a1a' }}>FURNISH</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'rgba(240,216,200,0.5)', lineHeight: 1.8 }}>
              Premium pre-loved furniture and professional home staging, Auckland NZ.
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.62rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c9a96e', fontWeight: 700, marginBottom: '1.1rem', fontFamily: 'var(--font-body)' }}>Browse</p>
            {[['Buy Furniture', '/shop'], ['Home Staging', '/inspiration'], ['Contact', '/contact']].map(([label, path]) => (
              <button key={path} onClick={() => navigate(path)} style={{ display: 'block', background: 'none', border: 'none', color: 'rgba(240,216,200,0.6)', fontFamily: 'var(--font-body)', fontSize: '0.87rem', padding: '0.28rem 0', cursor: 'pointer', textAlign: 'left' }}>
                {label}
              </button>
            ))}
          </div>
          <div>
            <p style={{ fontSize: '0.62rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c9a96e', fontWeight: 700, marginBottom: '1.1rem', fontFamily: 'var(--font-body)' }}>Contact</p>
            <p style={{ fontSize: '0.87rem', color: 'rgba(240,216,200,0.6)', lineHeight: 2 }}>
              Auckland, New Zealand<br />
              <a href="mailto:info@chicfurnish.co.nz" style={{ color: 'rgba(240,216,200,0.6)', textDecoration: 'none' }}>info@chicfurnish.co.nz</a>
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.62rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c9a96e', fontWeight: 700, marginBottom: '1.1rem', fontFamily: 'var(--font-body)' }}>Account</p>
            {[['Sign In', '/login'], ['Create Account', '/register']].map(([label, path]) => (
              <button key={path} onClick={() => navigate(path)} style={{ display: 'block', background: 'none', border: 'none', color: 'rgba(240,216,200,0.6)', fontFamily: 'var(--font-body)', fontSize: '0.87rem', padding: '0.28rem 0', cursor: 'pointer', textAlign: 'left' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(201,169,110,0.1)', paddingTop: '1.5rem', marginTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <p style={{ fontSize: '0.73rem', color: 'rgba(240,216,200,0.28)', fontFamily: 'var(--font-body)' }}>
            © {new Date().getFullYear()} Chic Furnish. All rights reserved.
          </p>
          <p style={{ fontSize: '0.73rem', color: 'rgba(240,216,200,0.28)', fontFamily: 'var(--font-body)' }}>
            chicfurnish.co.nz
          </p>
        </div>
      </footer>

      <style>{`
        /* ── HERO ── */
        .hero-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 90vh;
          background: linear-gradient(135deg, #0f1e2e 0%, #1a3a5c 60%, #2e5f8a 100%);
        }
        .hero-text {
          padding: clamp(3rem, 6vw, 7rem) clamp(1.5rem, 5vw, 5rem);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .hero-image-panel {
          position: relative;
          overflow: hidden;
          background: rgba(0,0,0,0.2);
          min-height: 400px;
        }
        .btn-hero-primary {
          background: #c04a1a; border: none; color: white;
          padding: 1rem 2rem; font-family: var(--font-body);
          font-size: 0.83rem; letter-spacing: 0.18em; text-transform: uppercase;
          font-weight: 700; cursor: pointer; white-space: nowrap;
        }
        .btn-hero-primary:hover { background: #a03a10; }
        .btn-hero-outline {
          background: transparent; border: 2px solid rgba(240,216,200,0.35);
          color: #f0d8c8; padding: 1rem 2rem; font-family: var(--font-body);
          font-size: 0.83rem; letter-spacing: 0.18em; text-transform: uppercase;
          font-weight: 600; cursor: pointer; white-space: nowrap;
        }
        .btn-hero-outline:hover { border-color: rgba(240,216,200,0.75); }

        /* ── SERVICES ── */
        .services-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .service-panel { padding: clamp(2.5rem, 4vw, 5rem) clamp(1.5rem, 4vw, 4rem); }
        .service-panel-light { background: #f8f4ee; border-right: 1px solid #b8c8d8; }
        .service-panel-dark { background: #1a3a5c; }

        /* ── HOW IT WORKS ── */
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }
        .step-card {
          padding: 1.5rem;
          background: rgba(255,255,255,0.5);
          border: 1px solid rgba(184,200,216,0.5);
        }

        /* ── FEATURED ── */
        .featured-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .featured-card {
          cursor: pointer;
          background: white;
          border: 1px solid #b8c8d8;
          transition: transform 0.2s, box-shadow 0.2s;
          overflow: hidden;
        }
        .featured-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 28px rgba(15,30,46,0.12);
        }

        /* ── TRUST ── */
        .trust-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        /* ── FOOTER ── */
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 2.5rem;
          margin-bottom: 0;
        }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .hero-section {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          .hero-image-panel {
            min-height: 280px;
            order: -1;
          }
          .hero-text { padding: 2.5rem 1.5rem; }
          .services-grid { grid-template-columns: 1fr; }
          .service-panel-light { border-right: none; border-bottom: 2px solid #b8c8d8; }
          .steps-grid { grid-template-columns: 1fr 1fr; gap: 1rem; }
          .step-card { padding: 1.1rem; }
          .trust-grid { grid-template-columns: 1fr 1fr; gap: 1.75rem; }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
        }
        @media (max-width: 480px) {
          .steps-grid { grid-template-columns: 1fr; }
          .trust-grid { grid-template-columns: 1fr 1fr; }
          .footer-grid { grid-template-columns: 1fr; gap: 1.75rem; }
        }
      `}</style>
    </div>
  );
}
