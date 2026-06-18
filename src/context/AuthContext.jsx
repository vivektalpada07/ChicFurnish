import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

const ADMIN_EMAIL = 'vivektalpada769@gmail.com';

function buildUser(sbUser) {
  return {
    id: sbUser.id,
    email: sbUser.email,
    name: sbUser.user_metadata?.name || sbUser.email.split('@')[0],
    phone: sbUser.user_metadata?.phone || '',
    role: sbUser.email === ADMIN_EMAIL ? 'admin' : 'customer',
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? buildUser(session.user) : null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? buildUser(session.user) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const register = async (name, email, password, phone) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone: phone || '' } },
    });
    if (error) return { error: error.message };
    return { success: true };
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Supabase login error:', error.message);
      if (error.message.includes('Email not confirmed')) {
        return { error: 'Please confirm your email first, or disable email confirmation in Supabase.' };
      }
      return { error: 'Incorrect email or password.' };
    }
    const role = data.user.email === ADMIN_EMAIL ? 'admin' : 'customer';
    return { success: true, role };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f4ee' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: '#1a3a5c', letterSpacing: '0.2em' }}>Loading…</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }

/* ── Data helpers ──────────────────────────────────────── */

export async function getListings() {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data;
}

export async function getViewingBookings() {
  const { data, error } = await supabase
    .from('viewing_bookings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data;
}

export async function getStagingBookings() {
  const { data, error } = await supabase
    .from('staging_bookings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data;
}
