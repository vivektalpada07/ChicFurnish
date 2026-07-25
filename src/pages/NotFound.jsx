import { useNavigate } from 'react-router-dom';
import CustomerNav from '../components/CustomerNav';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: '#f8f4ee' }}>
      <CustomerNav />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '75vh', padding: '2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.72rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#c04a1a', fontWeight: 700, marginBottom: '1rem' }}>404 — Page Not Found</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 600, color: '#0f1e2e', lineHeight: 1.1, marginBottom: '1rem' }}>
          This page doesn't<br /><em style={{ color: '#2e5f8a' }}>exist</em>
        </h1>
        <p style={{ fontSize: '1rem', color: '#4a5e72', maxWidth: 420, lineHeight: 1.8, marginBottom: '2.5rem' }}>
          The page you're looking for may have moved or been removed. Head back to the shop to continue browsing.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => navigate('/shop')} style={{ background: '#1a3a5c', color: '#f0d8c8', border: 'none', padding: '0.9rem 2rem', fontFamily: 'var(--font-body)', fontSize: '0.85rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}>
            Browse Furniture
          </button>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', color: '#1a3a5c', border: '2px solid #1a3a5c', padding: '0.9rem 2rem', fontFamily: 'var(--font-body)', fontSize: '0.85rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
