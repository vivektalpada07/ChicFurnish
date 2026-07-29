import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import ScrollToTop from './components/ScrollToTop';
import { ToastProvider } from './components/Toast';
import NotFound from './pages/NotFound';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminListings from './pages/admin/AdminListings';
import AdminBookings from './pages/admin/AdminBookings';
import AdminQuotes from './pages/admin/AdminQuotes';
import AdminInspiration from './pages/admin/AdminInspiration';
import AdminEnquiries from './pages/admin/AdminEnquiries';
import AdminOrders from './pages/admin/AdminOrders';
import CustomerHome from './pages/customer/CustomerHome';
import CustomerInspiration from './pages/customer/CustomerInspiration';
import CustomerShop from './pages/customer/CustomerShop';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerContact from './pages/customer/CustomerContact';
import CustomerProductDetail from './pages/customer/CustomerProductDetail';

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/shop" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <ToastProvider />
          <CartDrawer />
          <Routes>
            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Admin - protected */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/listings" element={<AdminRoute><AdminListings /></AdminRoute>} />
            <Route path="/admin/bookings" element={<AdminRoute><AdminBookings /></AdminRoute>} />
            <Route path="/admin/quotes" element={<AdminRoute><AdminQuotes /></AdminRoute>} />
            <Route path="/admin/inspiration" element={<AdminRoute><AdminInspiration /></AdminRoute>} />
            <Route path="/admin/enquiries" element={<AdminRoute><AdminEnquiries /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />

            {/* Customer - fully public, no login required to browse */}
            <Route path="/" element={<CustomerHome />} />
            <Route path="/shop" element={<CustomerShop />} />
            <Route path="/shop/:id" element={<CustomerProductDetail />} />
            <Route path="/inspiration" element={<CustomerInspiration />} />
            <Route path="/profile" element={<CustomerProfile />} />
            <Route path="/contact" element={<CustomerContact />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
