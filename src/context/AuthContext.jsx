import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cf_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('cf_users') || '[]');
    const adminExists = users.find((u) => u.role === 'admin');
    if (!adminExists) {
      users.push({ id: 'admin-1', name: 'Admin', email: 'admin@chicfurnish.co.nz', password: 'admin123', role: 'admin' });
      localStorage.setItem('cf_users', JSON.stringify(users));
    }
  }, []);

  const register = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem('cf_users') || '[]');
    if (users.find((u) => u.email === email)) return { error: 'Email already registered.' };
    const newUser = { id: Date.now().toString(), name, email, password, role: 'customer' };
    users.push(newUser);
    localStorage.setItem('cf_users', JSON.stringify(users));
    const { password: _, ...safe } = newUser;
    setUser(safe);
    localStorage.setItem('cf_user', JSON.stringify(safe));
    return { success: true };
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('cf_users') || '[]');
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return { error: 'Incorrect email or password.' };
    const { password: _, ...safe } = found;
    setUser(safe);
    localStorage.setItem('cf_user', JSON.stringify(safe));
    return { success: true, role: found.role };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cf_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function getListings() {
  return JSON.parse(localStorage.getItem('cf_listings') || '[]');
}
export function saveListings(l) {
  localStorage.setItem('cf_listings', JSON.stringify(l));
}
export function getViewingBookings() {
  return JSON.parse(localStorage.getItem('cf_viewings') || '[]');
}
export function saveViewingBookings(b) {
  localStorage.setItem('cf_viewings', JSON.stringify(b));
}
export function getStagingBookings() {
  return JSON.parse(localStorage.getItem('cf_staging') || '[]');
}
export function saveStagingBookings(b) {
  localStorage.setItem('cf_staging', JSON.stringify(b));
}
