import { useState, useEffect, useCallback } from 'react';

let toastFn = null;

export function toast(message, type = 'success') {
  if (toastFn) toastFn(message, type);
}

export function ToastProvider() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  useEffect(() => { toastFn = addToast; return () => { toastFn = null; }; }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', bottom: '5rem', right: '1rem', zIndex: 9998, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 320 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          background: t.type === 'error' ? '#7a1a00' : t.type === 'info' ? '#1a3a5c' : '#1a5c2a',
          color: 'white', padding: '0.85rem 1.25rem',
          fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 500, lineHeight: 1.5,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          animation: 'slideUp 0.25s ease',
          borderLeft: `4px solid ${t.type === 'error' ? '#c04a1a' : t.type === 'info' ? '#4a9fd4' : '#2db550'}`,
        }}>
          {t.message}
        </div>
      ))}
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
