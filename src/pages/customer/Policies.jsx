import { useNavigate } from 'react-router-dom';
import CustomerNav from '../../components/CustomerNav';

export default function Policies() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#f8f4ee' }}>
      <CustomerNav />

      {/* ── PAGE HEADER ── */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 6vw, 5rem) 2.5rem', borderBottom: '2px solid #b8c8d8' }}>
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#c04a1a', fontWeight: 700, marginBottom: '0.75rem' }}>
          Chic Furnish · Auckland, NZ
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, lineHeight: 1.1, color: '#0f1e2e' }}>
          Delivery &amp; <em style={{ color: '#2e5f8a' }}>Returns</em>
        </h1>
      </section>

      {/* ── ABOUT ── */}
      <section style={{ padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 6vw, 5rem)', maxWidth: 900 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, color: '#0f1e2e', marginBottom: '1rem' }}>
          About our furniture
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#2a3d52', lineHeight: 1.9 }}>
          We sell furniture sourced from professionally staged Auckland properties, along with quality
          pre-owned pieces. Every listing includes full details in the description — condition, dimensions,
          and any visible wear — so please read it carefully before purchasing. If you have any questions,
          message us directly from any listing and we'll get back to you within one business day.
        </p>
      </section>

      {/* ── DELIVERY ── */}
      <section style={{ padding: '0 clamp(1.5rem, 6vw, 5rem) clamp(2.5rem, 5vw, 4rem)', maxWidth: 900 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: 40, height: 3, background: '#c04a1a' }} />
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c04a1a', fontWeight: 700 }}>
            Delivery
          </p>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, color: '#0f1e2e', marginBottom: '1rem' }}>
          Delivery across Auckland &amp; beyond
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#2a3d52', lineHeight: 1.9, marginBottom: '1.25rem' }}>
          Delivery is available across Auckland from <strong>$60–$150</strong>, depending on item size and
          your location. Delivery to nearby regions — such as Hamilton — can also be arranged. Get in touch
          for a quote before or after your purchase.
        </p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            'Delivery cost depends on item size and distance',
            'Auckland delivery: approx. $60–$150',
            'Outer regions (e.g. Hamilton) available on request',
            'Local pickup also available at no extra cost',
          ].map((item) => (
            <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem', fontSize: '0.9rem', color: '#2a3d52' }}>
              <span style={{ color: '#c04a1a', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>✓</span>{item}
            </li>
          ))}
        </ul>
      </section>

      {/* ── RETURNS ── */}
      <section style={{ padding: '0 clamp(1.5rem, 6vw, 5rem) clamp(2.5rem, 5vw, 4rem)', maxWidth: 900 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: 40, height: 3, background: '#c04a1a' }} />
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c04a1a', fontWeight: 700 }}>
            Returns &amp; Condition
          </p>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, color: '#0f1e2e', marginBottom: '1rem' }}>
          All items sold as-is
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#2a3d52', lineHeight: 1.9, marginBottom: '1.25rem' }}>
          All items are sold as-is. We do our best to disclose any damage or wear in each listing's
          description and photos, but we strongly recommend inspecting the item in person before purchasing —
          viewings can be arranged directly from any listing. As items are pre-owned or second-hand, we do
          not offer returns once a sale is complete.
        </p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            'Items are sold as-is, in the condition described',
            'We disclose known damage or wear wherever possible',
            'In-person inspection is encouraged before purchase',
            'No returns once a sale is complete',
          ].map((item) => (
            <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem', fontSize: '0.9rem', color: '#2a3d52' }}>
              <span style={{ color: '#c04a1a', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>✓</span>{item}
            </li>
          ))}
        </ul>
      </section>

      {/* ── TRADE ME BANNER ── */}
      <section style={{ background: '#1a3a5c', padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 6vw, 5rem)', textAlign: 'center' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c9a96e', fontWeight: 700, marginBottom: '0.6rem' }}>
          Also Available On
        </p>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, color: '#f8f4ee', marginBottom: '0.5rem' }}>
          We're on Trade Me too
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'rgba(240,216,200,0.7)' }}>
          Some of our listings are also available via our Trade Me store.
        </p>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 6vw, 5rem)', textAlign: 'center' }}>
        <p style={{ fontSize: '0.95rem', color: '#4a5e72', marginBottom: '1.5rem' }}>
          Still have questions about delivery, returns, or a specific item?
        </p>
        <button
          onClick={() => navigate('/contact')}
          style={{ background: '#1a3a5c', border: 'none', color: '#f0d8c8', padding: '0.95rem 2.2rem', fontFamily: 'var(--font-body)', fontSize: '0.8rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}
        >
          Contact Us
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#1a3a5c', padding: '3rem 3rem 2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, color: '#f8f4ee', letterSpacing: '0.15em' }}>
            CHIC <span style={{ color: '#f0a070' }}>FURNISH</span>
          </span>
          <span style={{ fontSize: '0.82rem', color: 'rgba(214,232,245,0.5)' }}>
            © {new Date().getFullYear()} Chic Furnish · Auckland, New Zealand
          </span>
        </div>
      </footer>
    </div>
  );
}