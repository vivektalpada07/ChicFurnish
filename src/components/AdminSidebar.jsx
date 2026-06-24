import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { group: 'Overview', items: [{ label: 'Dashboard', path: '/admin' }] },
  { group: 'Furniture', items: [{ label: 'Listings', path: '/admin/listings' }] },
  { group: 'Staging', items: [{ label: 'Inspiration Gallery', path: '/admin/inspiration' }] },
  {
    group: 'Bookings',
    items: [
      { label: 'Viewing Requests', path: '/admin/bookings' },
      { label: 'Staging Bookings', path: '/admin/quotes' },
    ],
  },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleNav = (path) => { navigate(path); setMobileOpen(false); };

  const currentLabel = NAV.flatMap((g) => g.items).find((i) => i.path === location.pathname)?.label || 'Admin';

  return (
    <>
      {/* ── MOBILE TOP BAR ── */}
      <div className="admin-mobile-bar">
        <div className="sidebar-logo" style={{ fontSize: '1rem', padding: 0, border: 'none', background: 'none' }}>
          CHIC <span>FURNISH</span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'rgba(250,248,244,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{currentLabel}</span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'none', border: '1px solid rgba(201,169,110,0.3)', color: '#faf8f4', padding: '0.4rem 0.6rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px' }}
          aria-label="Menu"
        >
          <span style={{ display: 'block', width: 18, height: 2, background: '#c9a96e', transition: 'all 0.2s', transform: mobileOpen ? 'rotate(45deg) translate(4px,4px)' : 'none' }} />
          <span style={{ display: 'block', width: 18, height: 2, background: mobileOpen ? 'transparent' : '#c9a96e', transition: 'all 0.2s' }} />
          <span style={{ display: 'block', width: 18, height: 2, background: '#c9a96e', transition: 'all 0.2s', transform: mobileOpen ? 'rotate(-45deg) translate(4px,-4px)' : 'none' }} />
        </button>
      </div>

      {/* ── MOBILE OVERLAY ── */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 299, background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── SIDEBAR (desktop always visible, mobile slides in) ── */}
      <div className={`sidebar ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sidebar-logo">
          CHIC <span>FURNISH</span>
          <div className="sidebar-sub">ADMIN PORTAL</div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((group) => (
            <div key={group.group}>
              <div className="sidebar-section-label">{group.group}</div>
              {group.items.map((item) => (
                <button
                  key={item.path}
                  className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => handleNav(item.path)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '0.5px solid rgba(201,169,110,0.15)' }}>
          {user && (
            <p style={{ fontSize: '0.72rem', color: 'rgba(250,248,244,0.3)', marginBottom: '1rem', letterSpacing: '0.05em' }}>
              {user.name}
            </p>
          )}
          <button className="nav-item" onClick={() => { navigate('/inspiration'); setMobileOpen(false); }} style={{ marginBottom: '0.25rem' }}>
            ↗ Customer Site
          </button>
          <button className="nav-item" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>

      <style>{`
        .admin-mobile-bar {
          display: none;
          justify-content: space-between;
          align-items: center;
          background: #1a3a5c;
          padding: 0.85rem 1.25rem;
          position: sticky;
          top: 0;
          z-index: 300;
          border-bottom: 1px solid rgba(201,169,110,0.2);
        }
        @media (max-width: 768px) {
          .admin-mobile-bar { display: flex !important; }
          .sidebar {
            position: fixed !important;
            left: -260px !important;
            top: 0 !important;
            height: 100vh !important;
            z-index: 300 !important;
            transition: left 0.28s ease !important;
            overflow-y: auto !important;
          }
          .sidebar-mobile-open {
            left: 0 !important;
          }
          .page-layout {
            flex-direction: column !important;
          }
          .main-content {
            margin-left: 0 !important;
            width: 100% !important;
            padding: 1.25rem !important;
          }
        }
      `}</style>
    </>
  );
}
