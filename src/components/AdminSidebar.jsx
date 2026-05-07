import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { group: 'Overview', items: [{ label: 'Dashboard', path: '/admin' }] },
  { group: 'Furniture', items: [{ label: 'Listings', path: '/admin/listings' }] },
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
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
                onClick={() => navigate(item.path)}
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
        <button className="nav-item" onClick={() => navigate('/inspiration')} style={{ marginBottom: '0.25rem' }}>
          ↗ Customer Site
        </button>
        <button className="nav-item" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
