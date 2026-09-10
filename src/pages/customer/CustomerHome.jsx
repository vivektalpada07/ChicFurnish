import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerNav from '../../components/CustomerNav';
import { supabase } from '../../lib/supabase';

export default function CustomerHome() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    supabase
      .from('listings')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => {
        setFeatured(data || []);
      });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f4ee' }}>
      <CustomerNav />

      {/* ── HERO ── */}
      <section className="hero-section">
        {/* Illustrated line-art pattern overlay */}
        <svg className="hero-pattern" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" aria-hidden="true">
          {/* Sofa outline */}
          <g stroke="#b5a48a" strokeWidth="1" fill="none" opacity="0.45">
            <rect x="60" y="310" width="180" height="80" rx="8"/>
            <rect x="60" y="280" width="180" height="35" rx="6"/>
            <rect x="55" y="310" width="25" height="65" rx="4"/>
            <rect x="215" y="310" width="25" height="65" rx="4"/>
            <rect x="75" y="390" width="15" height="20" rx="3"/>
            <rect x="205" y="390" width="15" height="20" rx="3"/>
          </g>
          {/* Floor lamp */}
          <g stroke="#b5a48a" strokeWidth="1" fill="none" opacity="0.4">
            <line x1="620" y1="180" x2="620" y2="420"/>
            <ellipse cx="620" cy="420" rx="25" ry="6"/>
            <path d="M590 180 Q620 140 650 180 Z"/>
            <line x1="605" y1="170" x2="635" y2="170"/>
          </g>
          {/* Plant / leaves */}
          <g stroke="#b5a48a" strokeWidth="1" fill="none" opacity="0.38">
            <ellipse cx="700" cy="380" rx="12" ry="22" transform="rotate(-25 700 380)"/>
            <ellipse cx="720" cy="370" rx="12" ry="22" transform="rotate(15 720 370)"/>
            <ellipse cx="710" cy="360" rx="10" ry="20" transform="rotate(-5 710 360)"/>
            <line x1="710" y1="400" x2="710" y2="440"/>
            <ellipse cx="710" cy="445" rx="18" ry="6"/>
          </g>
          {/* Side table */}
          <g stroke="#b5a48a" strokeWidth="1" fill="none" opacity="0.35">
            <ellipse cx="130" cy="170" rx="40" ry="12"/>
            <line x1="100" y1="172" x2="95" y2="260"/>
            <line x1="160" y1="172" x2="165" y2="260"/>
            <line x1="130" y1="182" x2="130" y2="260"/>
            <line x1="95" y1="240" x2="165" y2="240"/>
          </g>
          {/* Decorative circular lines */}
          <circle cx="400" cy="300" r="260" stroke="#c9a96e" strokeWidth="0.5" opacity="0.12"/>
          <circle cx="400" cy="300" r="200" stroke="#c9a96e" strokeWidth="0.5" opacity="0.1"/>
          {/* Picture frame */}
          <g stroke="#b5a48a" strokeWidth="1" fill="none" opacity="0.3">
            <rect x="520" y="100" width="100" height="130" rx="2"/>
            <rect x="528" y="108" width="84" height="114" rx="1"/>
            <line x1="528" y1="108" x2="612" y2="222"/>
            <line x1="612" y1="108" x2="528" y2="222"/>
          </g>
          {/* Rug outline */}
          <g stroke="#b5a48a" strokeWidth="1" fill="none" opacity="0.28">
            <ellipse cx="250" cy="480" rx="160" ry="55"/>
            <ellipse cx="250" cy="480" rx="140" ry="45"/>
            <ellipse cx="250" cy="480" rx="100" ry="30"/>
          </g>
        </svg>

        {/* Hero content */}
        <div className="hero-content">
          <p className="hero-eyebrow">Luxury Home Staging · Auckland, NZ</p>
          <h1 className="hero-headline">
            Spaces that make<br />
            <em className="hero-headline-em">people feel something</em>
          </h1>
          <p className="hero-sub">
            We transform New Zealand properties into aspirational homes — curated luxury furniture, expert styling, unforgettable first impressions.
          </p>
          <div className="hero-ctas">
            <button onClick={() => navigate('/contact')} className="btn-hero-dark">Book a Staging</button>
            <button onClick={() => navigate('/shop')} className="btn-hero-ghost">Browse Furniture →</button>
          </div>
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
          position: relative;
          min-height: 88vh;
          background: #faf7f2;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: clamp(4rem, 8vw, 8rem) clamp(1.5rem, 8vw, 6rem);
          text-align: center;
        }
        .hero-pattern {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }
        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 780px;
          margin: 0 auto;
        }
        .hero-eyebrow {
          font-size: 0.68rem;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: #9e8b6e;
          font-weight: 700;
          margin-bottom: 1.5rem;
          font-family: var(--font-body);
        }
        .hero-headline {
          font-family: var(--font-display);
          font-size: clamp(2.8rem, 6vw, 5.2rem);
          font-weight: 600;
          line-height: 1.12;
          color: #1a2b3c;
          margin-bottom: 1.75rem;
        }
        .hero-headline-em {
          font-style: italic;
          color: #b07d3a;
        }
        .hero-sub {
          font-size: clamp(0.95rem, 1.5vw, 1.1rem);
          color: #5a6e7f;
          line-height: 1.85;
          max-width: 560px;
          margin: 0 auto 2.75rem;
          font-family: var(--font-body);
        }
        .hero-ctas {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-hero-dark {
          background: #1a2b3c; border: none; color: #f8f4ee;
          padding: 1rem 2.25rem; font-family: var(--font-body);
          font-size: 0.78rem; letter-spacing: 0.22em; text-transform: uppercase;
          font-weight: 700; cursor: pointer; white-space: nowrap;
          transition: background 0.2s;
        }
        .btn-hero-dark:hover { background: #0f1e2e; }
        .btn-hero-ghost {
          background: transparent; border: 2px solid #1a2b3c;
          color: #1a2b3c; padding: 1rem 2.25rem; font-family: var(--font-body);
          font-size: 0.78rem; letter-spacing: 0.22em; text-transform: uppercase;
          font-weight: 700; cursor: pointer; white-space: nowrap;
          transition: background 0.2s, color 0.2s;
        }
        .btn-hero-ghost:hover { background: #1a2b3c; color: #f8f4ee; }

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
          .hero-section { min-height: 75vh; padding: 3rem 1.5rem; }
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
