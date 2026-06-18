import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminListings from './pages/admin/AdminListings';
import AdminBookings from './pages/admin/AdminBookings';
import AdminQuotes from './pages/admin/AdminQuotes';
import AdminInspiration from './pages/admin/AdminInspiration';
import CustomerInspiration from './pages/customer/CustomerInspiration';
import CustomerShop from './pages/customer/CustomerShop';

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/shop" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin - protected */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/listings" element={<AdminRoute><AdminListings /></AdminRoute>} />
          <Route path="/admin/bookings" element={<AdminRoute><AdminBookings /></AdminRoute>} />
          <Route path="/admin/quotes" element={<AdminRoute><AdminQuotes /></AdminRoute>} />
          <Route path="/admin/inspiration" element={<AdminRoute><AdminInspiration /></AdminRoute>} />

          {/* Customer - both fully public, no login required to browse */}
          <Route path="/shop" element={<CustomerShop />} />
          <Route path="/inspiration" element={<CustomerInspiration />} />

          {/* Default landing page = shop */}
          <Route path="*" element={<Navigate to="/shop" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
