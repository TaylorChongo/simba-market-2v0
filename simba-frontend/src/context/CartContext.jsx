import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('simba_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch { return []; }
  });

  const [savedItems, setSavedItems] = useState(() => {
    try {
      const saved = localStorage.getItem('simba_saved');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('simba_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('simba_saved', JSON.stringify(savedItems));
  }, [savedItems]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const increaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === id);
      if (existingItem && existingItem.quantity === 1) {
        return prevCart.filter((item) => item.id !== id);
      }
      return prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('simba_cart');
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const saveForLater = (id) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    setCart(prev => prev.filter(i => i.id !== id));
    setSavedItems(prev => prev.some(i => i.id === id) ? prev : [...prev, { ...item, quantity: 1 }]);
  };

  const moveToCart = (id) => {
    const item = savedItems.find(i => i.id === id);
    if (!item) return;
    setSavedItems(prev => prev.filter(i => i.id !== id));
    addToCart(item);
  };

  const removeFromSaved = (id) => setSavedItems(prev => prev.filter(i => i.id !== id));

  const value = {
    cart,
    savedItems,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    getTotalPrice,
    getCartCount,
    clearCart,
    saveForLater,
    moveToCart,
    removeFromSaved,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
