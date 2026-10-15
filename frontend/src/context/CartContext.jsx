import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartActionLoading, setCartActionLoading] = useState(false);
  const [wishlistActionLoading, setWishlistActionLoading] = useState({});

  // Fetch Cart from Backend
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data && res.data.cart) {
        setCartItems(res.data.cart);
      }
    } catch (err) {
      console.warn('Error fetching cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch Wishlist from Backend
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    try {
      const res = await api.get('/wishlist');
      if (res.data && res.data.wishlist) {
        setWishlist(res.data.wishlist);
      }
    } catch (err) {
      console.warn('Error fetching wishlist:', err.message);
    }
  }, [isAuthenticated]);

  // Sync cart & wishlist whenever authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    } else {
      setCartItems([]);
      setWishlist([]);
    }
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  // Derived state: Total quantity of all items in cart (for Navbar badge)
  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  }, [cartItems]);

  // Derived state: Cart subtotal
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = item.product?.price || 0;
      return acc + price * (item.quantity || 0);
    }, 0);
  }, [cartItems]);

  // Derived state: Wishlist count
  const wishlistCount = useMemo(() => {
    return wishlist.length;
  }, [wishlist]);

  // Check if product is in wishlist
  const isWishlisted = useCallback(
    (productId) => {
      return wishlist.some((item) => {
        const id = item._id || item;
        return id.toString() === productId.toString();
      });
    },
    [wishlist]
  );

  // Add to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to add products to your cart');
    }
    setCartActionLoading(true);
    try {
      const res = await api.post(`/cart/${productId}`, { quantity });
      if (res.data?.cart) {
        setCartItems(res.data.cart);
      } else {
        await fetchCart();
      }
      return res.data;
    } catch (err) {
      throw err;
    } finally {
      setCartActionLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    if (!isAuthenticated) return;
    try {
      const res = await api.patch(`/cart/${productId}`, { quantity });
      if (res.data?.cart) {
        setCartItems(res.data.cart);
      } else {
        await fetchCart();
      }
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return;
    try {
      const res = await api.delete(`/cart/${productId}`);
      if (res.data?.cart) {
        setCartItems(res.data.cart);
      } else {
        await fetchCart();
      }
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  // Add to wishlist
  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to manage your wishlist');
    }
    setWishlistActionLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await api.post(`/wishlist/${productId}`);
      if (res.data?.wishlist) {
        setWishlist(res.data.wishlist);
      } else {
        await fetchWishlist();
      }
      return res.data;
    } catch (err) {
      throw err;
    } finally {
      setWishlistActionLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return;
    setWishlistActionLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await api.delete(`/wishlist/${productId}`);
      if (res.data?.wishlist) {
        setWishlist(res.data.wishlist);
      } else {
        await fetchWishlist();
      }
      return res.data;
    } catch (err) {
      throw err;
    } finally {
      setWishlistActionLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // Toggle wishlist
  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to manage your wishlist');
    }
    setWishlistActionLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await api.patch(`/wishlist/${productId}/toggle`);
      if (res.data?.wishlist) {
        setWishlist(res.data.wishlist);
      } else {
        await fetchWishlist();
      }
      return res.data;
    } catch (err) {
      throw err;
    } finally {
      setWishlistActionLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // Reset cart state after order completion
  const clearCartState = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        loading,
        cartActionLoading,
        wishlist,
        wishlistCount,
        wishlistActionLoading,
        isWishlisted,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearCartState,
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

export default CartContext;
