import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CustomerNav({ cartCount = 0, onCartClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => { logout(); navigate('/shop'); };

  const linkStyle = (path) => ({
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: 'var(--font-body)', fontSize: '0.85rem',
    letterSpacing: '0.16em', textTransform: 'uppercase',
    fontWeight: location.pathname === path ? 700 : 500,
    color: location.pathname === path ? '#0f1e2e' : '#4a5e72',
    borderBottom: location.pathname === path ? '2.5px solid #c04a1a' : '2.5px solid transparent',
    paddingBottom: '3px', transition: 'all 0.2s',
  });

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1.1rem 3rem', background: '#f8f4ee',
      borderBottom: '2px solid #b8c8d8', position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div
        style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, letterSpacing: '0.15em', cursor: 'pointer', color: '#0f1e2e' }}
        onClick={() => navigate('/shop')}
      >
        CHIC <span style={{ color: '#c04a1a' }}>FURNISH</span>
      </div>

      <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        <button style={linkStyle('/shop')} onClick={() => navigate('/shop')}>Buy Furniture</button>
        <button style={linkStyle('/inspiration')} onClick={() => navigate('/inspiration')}>Staging</button>
      </div>

      <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ fontSize: '0.88rem', color: '#0f1e2e', fontWeight: 600 }}>
              Hi, {user.name.split(' ')[0]}
            </span>
            <button onClick={handleLogout} style={{
              background: '#1a3a5c', border: 'none', color: '#f0d8c8',
              padding: '0.55rem 1.2rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem',
              letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer',
            }}>Sign Out</button>
          </>
        ) : (
          <button onClick={() => navigate('/login')} style={{
            background: '#1a3a5c', border: 'none', color: '#f0d8c8',
            padding: '0.55rem 1.3rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem',
            letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer',
          }}>Sign In</button>
        )}
        <button onClick={onCartClick} style={{
          background: '#c04a1a', border: 'none', color: 'white',
          padding: '0.55rem 1.3rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem',
          letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer',
        }}>
          Cart{cartCount > 0 ? ` (${cartCount})` : ''}
        </button>
      </div>
    </nav>
  );
}
