"use client";
import { createContext, useContext, useEffect, useState, useMemo } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("xon_cart");
      if (storedCart) setCart(JSON.parse(storedCart));

      const storedWishlist = localStorage.getItem("xon_wishlist");
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
    } catch (e) {
      console.error("Cart storage error", e);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("xon_cart", JSON.stringify(cart));
    } catch (e) {}
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("xon_wishlist", JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist, hydrated]);

  const checkAuth = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/register";
        return false;
      }
    }
    return true;
  };

  const addToCart = useCallback((product, qty = 1, options = {}) => {
    if (!checkAuth()) return;
    if (!product) return;
    const pid = product.id || product._id;
    setCart((prev) => {
      const idx = prev.findIndex((item) => (item.id || item._id) === pid);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: Math.max(1, (next[idx].quantity || 1) + qty),
          ...options,
        };
        return next;
      }
      const item = {
        id: pid,
        _id: pid,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        image: (product.images && product.images[0]) || product.image || null,
        images: product.images || [],
        monthly: product.monthly,
        quantity: Math.max(1, qty),
        color: options.color || "Standart",
        storage: options.storage || "256GB",
      };
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((item) => (item.id || item._id) !== id));
  }, []);

  const updateQuantity = useCallback((id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if ((item.id || item._id) === id) {
            const newQty = typeof delta === "function" ? delta(item.quantity) : item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((product) => {
    if (!checkAuth()) return;
    if (!product) return;
    const pid = product.id || product._id;
    setWishlist((prev) => {
      const exists = prev.some((p) => (p.id || p._id) === pid);
      if (exists) {
        return prev.filter((p) => (p.id || p._id) !== pid);
      }
      return [
        ...prev,
        {
          id: pid,
          _id: pid,
          name: product.name,
          price: product.price,
          oldPrice: product.oldPrice,
          image: (product.images && product.images[0]) || product.image || null,
          rating: product.rating,
          reviews: product.reviews || product.reviewsCount,
          monthly: product.monthly,
          used: product.used,
          grade: product.grade,
          battery: product.battery,
        },
      ];
    });
  }, []);

  const isInWishlist = useCallback(
    (id) => wishlist.some((p) => (p.id || p._id) === id),
    [wishlist]
  );

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + (item.quantity || 1), 0),
    [cart]
  );

  const cartTotal = useMemo(
    () => cart.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0),
    [cart]
  );

  const cartOldTotal = useMemo(
    () =>
      cart.reduce(
        (acc, item) =>
          acc +
          ((item.oldPrice && item.oldPrice > item.price ? item.oldPrice : item.price) || 0) *
            (item.quantity || 1),
        0
      ),
    [cart]
  );

  const wishlistCount = wishlist.length;

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      cartCount,
      wishlistCount,
      cartTotal,
      cartOldTotal,
      hydrated,
    }),
    [
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      cartCount,
      wishlistCount,
      cartTotal,
      cartOldTotal,
      hydrated,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    return {
      cart: [],
      wishlist: [],
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      toggleWishlist: () => {},
      isInWishlist: () => false,
      cartCount: 0,
      wishlistCount: 0,
      cartTotal: 0,
      cartOldTotal: 0,
      hydrated: false,
    };
  }
  return ctx;
}

