import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CustomerNav({ cartCount = 0, onCartClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => { logout(); navigate('/shop'); };

  const linkStyle = (path) => ({
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: '0.82rem',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    fontWeight: location.pathname === path ? 700 : 500,
    color: location.pathname === path ? '#1a1714' : '#4a4038',
    borderBottom: location.pathname === path ? '2px solid #7a5c10' : '2px solid transparent',
    paddingBottom: '3px',
    transition: 'all 0.2s',
  });

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.2rem 3rem',
      background: '#f0ebe0',
      borderBottom: '1.5px solid #c8a860',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div
        style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, letterSpacing: '0.15em', cursor: 'pointer', color: '#1a1714' }}
        onClick={() => navigate('/shop')}
      >
        CHIC <span style={{ color: '#7a5c10' }}>FURNISH</span>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        <button style={linkStyle('/shop')} onClick={() => navigate('/shop')}>Buy Furniture</button>
        <button style={linkStyle('/inspiration')} onClick={() => navigate('/inspiration')}>Staging</button>
      </div>

      {/* Auth + Cart */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ fontSize: '0.82rem', color: '#3a3028', fontWeight: 600, letterSpacing: '0.04em' }}>
              Hi, {user.name.split(' ')[0]}
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: '#3a3028',
                border: 'none',
                color: '#e8d5a0',
                padding: '0.55rem 1.1rem',
                fontFamily: 'var(--font-body)',
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            style={{
              background: '#3a3028',
              border: 'none',
              color: '#e8d5a0',
              padding: '0.55rem 1.3rem',
              fontFamily: 'var(--font-body)',
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
        )}

        {/* Cart button — dark gold, high contrast */}
        <button
          onClick={onCartClick}
          style={{
            background: '#7a5c10',
            border: 'none',
            color: '#f8efd8',
            padding: '0.55rem 1.3rem',
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: 700,
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          Cart{cartCount > 0 ? ` (${cartCount})` : ''}
        </button>
      </div>
    </nav>
  );
}
