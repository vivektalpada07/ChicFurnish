import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CustomerNav({ cartCount = 0, onCartClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/shop'); setMenuOpen(false); };

  const linkStyle = (path) => ({
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: 'var(--font-body)', fontSize: '0.85rem',
    letterSpacing: '0.16em', textTransform: 'uppercase',
    fontWeight: location.pathname === path ? 700 : 500,
    color: location.pathname === path ? '#0f1e2e' : '#4a5e72',
    borderBottom: location.pathname === path ? '2.5px solid #c04a1a' : '2.5px solid transparent',
    paddingBottom: '3px', transition: 'all 0.2s',
  });

  const mobileLinkStyle = (path) => ({
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: 'var(--font-body)', fontSize: '1rem',
    letterSpacing: '0.16em', textTransform: 'uppercase',
    fontWeight: location.pathname === path ? 700 : 500,
    color: location.pathname === path ? '#c04a1a' : '#0f1e2e',
    padding: '1rem 0', borderBottom: '1px solid #b8c8d8',
    width: '100%', textAlign: 'left',
  });

  return (
    <>
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 1.5rem', background: '#f8f4ee',
        borderBottom: '2px solid #b8c8d8', position: 'sticky', top: 0, zIndex: 200,
      }}>
        {/* Logo */}
        <div
          style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 600, letterSpacing: '0.15em', cursor: 'pointer', color: '#0f1e2e', flexShrink: 0 }}
          onClick={() => navigate('/shop')}
        >
          CHIC <span style={{ color: '#c04a1a' }}>FURNISH</span>
        </div>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }} className="desktop-nav-links">
          <button style={linkStyle('/shop')} onClick={() => navigate('/shop')}>Buy Furniture</button>
          <button style={linkStyle('/inspiration')} onClick={() => navigate('/inspiration')}>Staging</button>
          <button style={linkStyle('/contact')} onClick={() => navigate('/contact')}>Contact</button>
        </div>

        {/* Desktop right buttons */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }} className="desktop-nav-links">
          {user ? (
            <>
              <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 600, color: '#0f1e2e' }}>Hi, {user.name.split(' ')[0]}</button>
              <button onClick={handleLogout} style={{ background: '#1a3a5c', border: 'none', color: '#f0d8c8', padding: '0.55rem 1.2rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer' }}>Sign Out</button>
            </>
          ) : (
            <button onClick={() => navigate('/login')} style={{ background: '#1a3a5c', border: 'none', color: '#f0d8c8', padding: '0.55rem 1.3rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer' }}>Sign In</button>
          )}
          <button onClick={onCartClick} style={{ background: '#c04a1a', border: 'none', color: 'white', padding: '0.55rem 1.3rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}>
            Cart{cartCount > 0 ? ` (${cartCount})` : ''}
          </button>
        </div>

        {/* Mobile right: cart + hamburger */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} className="mobile-nav-right">
          <button onClick={onCartClick} style={{ background: '#c04a1a', border: 'none', color: 'white', padding: '0.5rem 0.9rem', fontFamily: 'var(--font-body)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}>
            Cart{cartCount > 0 ? ` (${cartCount})` : ''}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: '1.5px solid #b8c8d8', color: '#0f1e2e', padding: '0.45rem 0.7rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Menu"
          >
            <span style={{ display: 'block', width: 20, height: 2, background: menuOpen ? '#c04a1a' : '#0f1e2e', transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(4px,4px)' : 'none' }} />
            <span style={{ display: 'block', width: 20, height: 2, background: menuOpen ? 'transparent' : '#0f1e2e', transition: 'all 0.2s' }} />
            <span style={{ display: 'block', width: 20, height: 2, background: menuOpen ? '#c04a1a' : '#0f1e2e', transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(4px,-4px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 60, left: 0, right: 0, bottom: 0, zIndex: 190, background: 'rgba(15,30,46,0.4)' }} onClick={() => setMenuOpen(false)}>
          <div style={{ background: '#f8f4ee', borderBottom: '2px solid #b8c8d8', padding: '0 1.5rem 1rem' }} onClick={(e) => e.stopPropagation()}>
            <button style={mobileLinkStyle('/shop')} onClick={() => { navigate('/shop'); setMenuOpen(false); }}>Buy Furniture</button>
            <button style={mobileLinkStyle('/inspiration')} onClick={() => { navigate('/inspiration'); setMenuOpen(false); }}>Staging</button>
            <button style={mobileLinkStyle('/contact')} onClick={() => { navigate('/contact'); setMenuOpen(false); }}>Contact</button>
            <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {user ? (
                <>
                  <button onClick={() => { navigate('/profile'); setMenuOpen(false); }} style={{ background: 'none', border: '1.5px solid #b8c8d8', color: '#0f1e2e', padding: '0.85rem', fontFamily: 'var(--font-body)', fontSize: '0.82rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', width: '100%' }}>My Account</button>
                  <button onClick={handleLogout} style={{ background: '#1a3a5c', border: 'none', color: '#f0d8c8', padding: '0.85rem', fontFamily: 'var(--font-body)', fontSize: '0.82rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', width: '100%' }}>Sign Out</button>
                </>
              ) : (
                <button onClick={() => { navigate('/login'); setMenuOpen(false); }} style={{ background: '#1a3a5c', border: 'none', color: '#f0d8c8', padding: '0.85rem', fontFamily: 'var(--font-body)', fontSize: '0.82rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', width: '100%' }}>Sign In</button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .desktop-nav-links { display: flex !important; }
        .mobile-nav-right { display: none !important; }
        @media (max-width: 680px) {
          .desktop-nav-links { display: none !important; }
          .mobile-nav-right { display: flex !important; }
        }
      `}</style>
    </>
  );
}
