import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartStep, setCartStep] = useState('cart');

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
