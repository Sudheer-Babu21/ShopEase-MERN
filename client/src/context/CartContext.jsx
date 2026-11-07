import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    totalAmount: 0,
    itemCount: 0,
    lineItemCount: 0,
  });
  const [loading, setLoading] = useState(false);

  // Load cart whenever authenticated user changes
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart({
        items: [],
        totalAmount: 0,
        itemCount: 0,
        lineItemCount: 0,
      });
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartAPI.get();
      if (res.data.success && res.data.cart) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Failed to fetch persistent cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    const res = await cartAPI.addItem(productId, quantity);
    if (res.data.success && res.data.cart) {
      setCart(res.data.cart);
    }
    return res.data;
  };

  const updateQuantity = async (productId, quantity) => {
    const res = await cartAPI.updateItem(productId, quantity);
    if (res.data.success && res.data.cart) {
      setCart(res.data.cart);
    }
    return res.data;
  };

  const removeFromCart = async (productId) => {
    const res = await cartAPI.removeItem(productId);
    if (res.data.success && res.data.cart) {
      setCart(res.data.cart);
    }
    return res.data;
  };

  const clearCart = async () => {
    const res = await cartAPI.clear();
    if (res.data.success) {
      setCart({
        items: [],
        totalAmount: 0,
        itemCount: 0,
        lineItemCount: 0,
      });
    }
    return res.data;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: cart.itemCount || 0,
        cartTotal: cart.totalAmount || 0,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
