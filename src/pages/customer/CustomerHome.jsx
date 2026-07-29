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
      .limit(3)
      .then(({ data }) => setFeatured(data || []));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f4ee' }}>
      <CustomerNav />

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f1e2e 0%, #1a3a5c 50%, #2e5f8a 100%)',
        padding: 'clamp(4rem, 10vw, 8rem) clamp(1.5rem, 6vw, 6rem)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '3rem', flexWrap: 'wrap', minHeight: '80vh', position: 'relative', overflow: 'hidden',
      }}>
        {/* Background texture */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(ellipse at 70% 50%, rgba(201,169,110,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 620, position: 'relative', zIndex: 1 }}>
          <p style={{
            fontSize: '0.72rem', letterSpacing: '0.4em', textTransform: 'uppercase',
            color: '#c9a96e', fontWeight: 700, marginBottom: '1.5rem',
            fontFamily: 'var(--font-body)',
          }}>
            Auckland, New Zealand
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            fontWeight: 600, lineHeight: 1.05, color: '#f8f4ee', marginBottom: '1.75rem',
          }}>
            Furniture that<br />
            <em style={{ color: '#c9a96e' }}>sells homes.</em>
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'rgba(240,216,200,0.85)',
            lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: 480,
            fontFamily: 'var(--font-body)',
          }}>
            Premium pre-loved furniture for Auckland buyers — and professional home staging that gets properties sold faster.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/shop')}
              style={{
                background: '#c04a1a', border: 'none', color: 'white',
                padding: '1rem 2.2rem', fontFamily: 'var(--font-body)',
                fontSize: '0.85rem', letterSpacing: '0.18em', textTransform: 'uppercase',
                fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.target.style.background = '#a03a10'}
              onMouseOut={(e) => e.target.style.background = '#c04a1a'}
            >
              Browse Furniture →
            </button>
            <button
              onClick={() => navigate('/inspiration')}
              style={{
                background: 'transparent', border: '2px solid rgba(240,216,200,0.4)',
                color: '#f0d8c8', padding: '1rem 2.2rem', fontFamily: 'var(--font-body)',
                fontSize: '0.85rem', letterSpacing: '0.18em', textTransform: 'uppercase',
                fontWeight: 600, cursor: 'pointer', transition: 'border-color 0.2s',
              }}
              onMouseOver={(e) => e.target.style.borderColor = 'rgba(240,216,200,0.8)'}
              onMouseOut={(e) => e.target.style.borderColor = 'rgba(240,216,200,0.4)'}
            >
              View Staging Work
            </button>
          </div>
        </div>

        {/* Hero stats */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '2rem',
          position: 'relative', zIndex: 1,
        }} className="hero-stats">
          {[
            { num: '200+', label: 'Properties Staged' },
            { num: '48hr', label: 'Average Staging Time' },
            { num: '100%', label: 'Auckland-Based' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 600, color: '#c9a96e', lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(240,216,200,0.6)', marginTop: '0.3rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES SPLIT ── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="services-grid">
        {/* Buy Furniture */}
        <div style={{
          padding: 'clamp(2.5rem, 5vw, 5rem) clamp(1.5rem, 5vw, 4rem)',
          background: '#f8f4ee', borderRight: '1px solid #b8c8d8',
        }}>
          <div style={{
            width: 48, height: 3, background: '#c04a1a', marginBottom: '2rem',
          }} />
          <p style={{ fontSize: '0.68rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c04a1a', fontWeight: 700, marginBottom: '0.75rem', fontFamily: 'var(--font-body)' }}>Buy Furniture</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 600, lineHeight: 1.15, color: '#0f1e2e', marginBottom: '1.25rem' }}>
            Pre-loved pieces,<br /><em>luxury quality</em>
          </h2>
          <p style={{ color: '#4a5e72', lineHeight: 1.8, marginBottom: '2rem', fontSize: '0.95rem' }}>
            Our furniture comes directly from staged properties — well-maintained, photographed professionally, and priced fairly. No auction chaos. Just quality pieces you can view in person before buying.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2.5rem' }}>
            {['View any item in person before buying', 'Bank transfer, cash, or card accepted', 'Delivery available across Auckland'].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.88rem', color: '#2a3d52' }}>
                <span style={{ color: '#c04a1a', fontWeight: 700, flexShrink: 0 }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate('/shop')}
            style={{ background: '#1a3a5c', border: 'none', color: '#f0d8c8', padding: '0.85rem 2rem', fontFamily: 'var(--font-body)', fontSize: '0.8rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}
          >
            Shop Now →
          </button>
        </div>

        {/* Staging */}
        <div style={{
          padding: 'clamp(2.5rem, 5vw, 5rem) clamp(1.5rem, 5vw, 4rem)',
          background: '#1a3a5c',
        }}>
          <div style={{ width: 48, height: 3, background: '#c9a96e', marginBottom: '2rem' }} />
          <p style={{ fontSize: '0.68rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c9a96e', fontWeight: 700, marginBottom: '0.75rem', fontFamily: 'var(--font-body)' }}>Home Staging</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 600, lineHeight: 1.15, color: '#f8f4ee', marginBottom: '1.25rem' }}>
            Stage to sell,<br /><em style={{ color: '#c9a96e' }}>faster & higher</em>
          </h2>
          <p style={{ color: 'rgba(240,216,200,0.75)', lineHeight: 1.8, marginBottom: '2rem', fontSize: '0.95rem' }}>
            We transform empty properties into aspirational homes that photograph beautifully and attract serious buyers. Trusted by Auckland real estate agents and private sellers alike.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2.5rem' }}>
            {['Full property styling — lounge to bedroom', 'Furniture delivered & installed by our team', 'Available across greater Auckland'].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.88rem', color: 'rgba(240,216,200,0.85)' }}>
                <span style={{ color: '#c9a96e', fontWeight: 700, flexShrink: 0 }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate('/contact')}
            style={{ background: 'transparent', border: '2px solid #c9a96e', color: '#c9a96e', padding: '0.85rem 2rem', fontFamily: 'var(--font-body)', fontSize: '0.8rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}
          >
            Get a Quote →
          </button>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: 'clamp(3rem, 6vw, 6rem) clamp(1.5rem, 6vw, 5rem)', background: '#ede7dc', borderTop: '2px solid #b8c8d8', borderBottom: '2px solid #b8c8d8' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p style={{ fontSize: '0.68rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c04a1a', fontWeight: 700, marginBottom: '0.75rem', fontFamily: 'var(--font-body)' }}>Simple Process</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, color: '#0f1e2e' }}>
            How it <em style={{ color: '#2e5f8a' }}>works</em>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', maxWidth: 960, margin: '0 auto' }}>
          {[
            { step: '01', title: 'Browse the collection', desc: 'Filter by category, view photos, and read item details from your phone or laptop.' },
            { step: '02', title: 'Book a viewing', desc: 'Reserve a time to see any piece in person at our Auckland location before committing.' },
            { step: '03', title: 'Buy with confidence', desc: 'Pay by bank transfer, cash, or card. Arrange pickup or delivery across Auckland.' },
            { step: '04', title: 'Ask us anything', desc: 'Message us directly from any product page — we reply within one business day.' },
          ].map((s) => (
            <div key={s.step} style={{ position: 'relative', paddingTop: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 600, color: 'rgba(26,58,92,0.1)', lineHeight: 1, marginBottom: '0.5rem' }}>{s.step}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#0f1e2e', marginBottom: '0.6rem' }}>{s.title}</h3>
              <p style={{ fontSize: '0.88rem', color: '#4a5e72', lineHeight: 1.75 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED LISTINGS ── */}
      {featured.length > 0 && (
        <section style={{ padding: 'clamp(3rem, 6vw, 6rem) clamp(1.5rem, 6vw, 5rem)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.68rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c04a1a', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-body)' }}>New In</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 600, color: '#0f1e2e' }}>
                Latest <em style={{ color: '#2e5f8a' }}>arrivals</em>
              </h2>
            </div>
            <button
              onClick={() => navigate('/shop')}
              style={{ background: 'none', border: '2px solid #1a3a5c', color: '#1a3a5c', padding: '0.65rem 1.5rem', fontFamily: 'var(--font-body)', fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}
            >
              View All →
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {featured.map((item) => {
              const imgs = Array.isArray(item.images) ? item.images : (item.images ? [item.images] : []);
              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/shop/${item.id}`)}
                  style={{ cursor: 'pointer', background: 'white', border: '1px solid #b8c8d8', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,30,46,0.12)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ height: 220, overflow: 'hidden', background: '#ede7dc' }}>
                    {imgs[0] ? (
                      <img src={imgs[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-display)', color: 'rgba(26,58,92,0.25)', letterSpacing: '0.2em', fontSize: '0.8rem' }}>{item.category?.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    {item.condition && (
                      <span style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c04a1a', fontWeight: 700, fontFamily: 'var(--font-body)' }}>{item.condition}</span>
                    )}
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, color: '#0f1e2e', margin: '0.35rem 0 0.75rem' }}>{item.name}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, color: '#c04a1a' }}>${Number(item.price).toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#4a5e72', fontFamily: 'var(--font-body)', fontWeight: 400 }}>NZD</span></span>
                      <span style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4a5e72', fontFamily: 'var(--font-body)' }}>View →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── TRUST BANNER ── */}
      <section style={{ background: '#1a3a5c', padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 6vw, 5rem)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
          {[
            { icon: '📍', title: 'Auckland Based', desc: 'We operate entirely within the Auckland region' },
            { icon: '🪑', title: 'View Before You Buy', desc: 'Every item can be seen in person before purchase' },
            { icon: '🚚', title: 'Delivery Available', desc: 'We deliver across greater Auckland' },
            { icon: '💬', title: 'Direct Communication', desc: 'Message us from any listing — no middlemen' },
          ].map((t) => (
            <div key={t.title}>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>{t.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: '#f8f4ee', marginBottom: '0.4rem' }}>{t.title}</h3>
              <p style={{ fontSize: '0.82rem', color: 'rgba(240,216,200,0.65)', lineHeight: 1.6 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 6vw, 5rem)', textAlign: 'center', borderTop: '2px solid #b8c8d8' }}>
        <p style={{ fontSize: '0.68rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c04a1a', fontWeight: 700, marginBottom: '0.75rem', fontFamily: 'var(--font-body)' }}>Ready to get started?</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, color: '#0f1e2e', marginBottom: '1rem' }}>
          Find your next favourite <em style={{ color: '#2e5f8a' }}>piece</em>
        </h2>
        <p style={{ color: '#4a5e72', marginBottom: '2.5rem', maxWidth: 480, margin: '0 auto 2.5rem', fontSize: '0.95rem', lineHeight: 1.75 }}>
          Browse our current collection of pre-loved luxury furniture — each piece viewable in person before you commit.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/shop')} style={{ background: '#1a3a5c', border: 'none', color: '#f0d8c8', padding: '1rem 2.5rem', fontFamily: 'var(--font-body)', fontSize: '0.85rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}>
            Browse the Collection
          </button>
          <button onClick={() => navigate('/contact')} style={{ background: 'transparent', border: '2px solid #1a3a5c', color: '#1a3a5c', padding: '1rem 2.5rem', fontFamily: 'var(--font-body)', fontSize: '0.85rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}>
            Contact Us
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0f1e2e', padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 6vw, 5rem) 2rem', borderTop: '1px solid rgba(201,169,110,0.15)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>

          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, letterSpacing: '0.15em', color: '#f8f4ee', marginBottom: '0.75rem' }}>
              CHIC <span style={{ color: '#c04a1a' }}>FURNISH</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(240,216,200,0.55)', lineHeight: 1.75 }}>
              Premium pre-loved furniture and professional home staging, Auckland NZ.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c9a96e', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'var(--font-body)' }}>Browse</p>
            {[['Buy Furniture', '/shop'], ['Home Staging', '/inspiration'], ['Contact', '/contact']].map(([label, path]) => (
              <button key={path} onClick={() => navigate(path)} style={{ display: 'block', background: 'none', border: 'none', color: 'rgba(240,216,200,0.65)', fontFamily: 'var(--font-body)', fontSize: '0.88rem', padding: '0.3rem 0', cursor: 'pointer', textAlign: 'left', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Contact */}
          <div>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c9a96e', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'var(--font-body)' }}>Contact</p>
            <p style={{ fontSize: '0.88rem', color: 'rgba(240,216,200,0.65)', lineHeight: 1.9 }}>
              Auckland, New Zealand<br />
              <a href="mailto:hello@chicfurnish.co.nz" style={{ color: 'rgba(240,216,200,0.65)', textDecoration: 'none' }}>hello@chicfurnish.co.nz</a>
            </p>
          </div>

          {/* Account */}
          <div>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c9a96e', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'var(--font-body)' }}>Account</p>
            {[['Sign In', '/login'], ['Create Account', '/register']].map(([label, path]) => (
              <button key={path} onClick={() => navigate(path)} style={{ display: 'block', background: 'none', border: 'none', color: 'rgba(240,216,200,0.65)', fontFamily: 'var(--font-body)', fontSize: '0.88rem', padding: '0.3rem 0', cursor: 'pointer', textAlign: 'left', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(201,169,110,0.1)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'rgba(240,216,200,0.3)', fontFamily: 'var(--font-body)' }}>
            © {new Date().getFullYear()} Chic Furnish Ltd. All rights reserved.
          </p>
          <p style={{ fontSize: '0.75rem', color: 'rgba(240,216,200,0.3)', fontFamily: 'var(--font-body)' }}>
            Auckland, New Zealand
          </p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 680px) {
          .services-grid { grid-template-columns: 1fr !important; }
          .hero-stats { flex-direction: row !important; gap: 1.5rem !important; flex-wrap: wrap; }
          .hero-stats > div { text-align: left !important; }
        }
      `}</style>
    </div>
  );
}
