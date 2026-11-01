import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'chic-furnish-cart';

function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartStep, setCartStep] = useState('cart');

  // Save the cart every time it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // storage full or blocked, cart still works for this visit
    }
  }, [cart]);

  const addToCart = useCallback((item) => {
    setCart((prev) => prev.find((c) => c.id === item.id) ? prev : [...prev, item]);
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const openCart = useCallback(() => { setCartStep('cart'); setCartOpen(true); }, []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const cartTotal = cart.reduce((sum, c) => sum + Number(c.price), 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, clearCart,
      cartOpen, setCartOpen, cartStep, setCartStep,
      openCart, closeCart, cartTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() { return useContext(CartContext); }