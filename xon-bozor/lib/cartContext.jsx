"use client";
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";

const CartContext = createContext(null);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://full-nbal.onrender.com";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=400&h=400&fit=crop";

export const resolveImage = (img) => {
  if (!img || typeof img !== "string") return null;
  const trimmed = img.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  if (trimmed.startsWith("/uploads/")) {
    return `${API_BASE}${trimmed}`;
  }
  if (trimmed.startsWith("uploads/")) {
    return `${API_BASE}/${trimmed}`;
  }
  return trimmed;
};

export const mapCartItem = (raw) => {
  if (!raw) return null;
  const pid = raw.id || raw._id;
  const rawImg = (raw.images && raw.images[0]) || raw.image;
  const mainImage = resolveImage(rawImg) || DEFAULT_IMAGE;
  const normalizedImages = (raw.images || []).map(resolveImage).filter(Boolean);

  return {
    ...raw,
    id: pid,
    _id: pid,
    name: raw.name || "Mahsulot",
    image: mainImage,
    images: normalizedImages.length > 0 ? normalizedImages : [mainImage],
    quantity: Math.max(1, Number(raw.quantity) || 1),
    price: Number(raw.price) || 0,
    oldPrice: Number(raw.oldPrice) || 0,
    monthly: raw.monthly || Math.round((Number(raw.price) || 0) / 12),
  };
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("xon_cart");
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed)) {
          const mapped = parsed.map(mapCartItem).filter(Boolean);
          setCart(mapped);
          try {
            localStorage.setItem("xon_cart", JSON.stringify(mapped));
          } catch (e) {}
        }
      }

      const storedWishlist = localStorage.getItem("xon_wishlist");
      if (storedWishlist) {
        const parsedW = JSON.parse(storedWishlist);
        if (Array.isArray(parsedW)) {
          const mappedW = parsedW.map(mapCartItem).filter(Boolean);
          setWishlist(mappedW);
          try {
            localStorage.setItem("xon_wishlist", JSON.stringify(mappedW));
          } catch (e) {}
        }
      }
    } catch (e) {
      console.error("Cart storage error", e);
    }
    setHydrated(true);
  }, []);

  const saveCartSync = (newCart) => {
    try {
      localStorage.setItem("xon_cart", JSON.stringify(newCart));
    } catch (e) {}
  };

  const saveWishlistSync = (newWishlist) => {
    try {
      localStorage.setItem("xon_wishlist", JSON.stringify(newWishlist));
    } catch (e) {}
  };

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
    const rawImg = (product.images && product.images[0]) || product.image;
    const mainImage = resolveImage(rawImg) || DEFAULT_IMAGE;
    const normalizedImages = (product.images || []).map(resolveImage).filter(Boolean);

    setCart((prev) => {
      const idx = prev.findIndex((item) => (item.id || item._id) === pid);
      let next;
      if (idx > -1) {
        next = [...prev];
        next[idx] = {
          ...next[idx],
          image: mainImage || next[idx].image,
          quantity: Math.max(1, (next[idx].quantity || 1) + qty),
          ...options,
        };
      } else {
        const item = {
          id: pid,
          _id: pid,
          name: product.name,
          price: Math.round(Number(product.price) || 0),
          oldPrice: Math.round(Number(product.oldPrice) || 0),
          image: mainImage,
          images: normalizedImages.length > 0 ? normalizedImages : [mainImage],
          monthly: product.monthly || Math.round((Number(product.price) || 0) / 12),
          quantity: Math.max(1, qty),
          color: options.color || "Standart",
          storage: options.storage || "256GB",
        };
        next = [...prev, item];
      }
      saveCartSync(next);
      return next;
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => {
      const next = prev.filter((item) => (item.id || item._id) !== id);
      saveCartSync(next);
      return next;
    });
  }, []);

  const updateQuantity = useCallback((id, delta) => {
    setCart((prev) => {
      const next = prev
        .map((item) => {
          if ((item.id || item._id) === id) {
            const newQty = typeof delta === "function" ? delta(item.quantity) : item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
      saveCartSync(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    saveCartSync([]);
  }, []);

  const toggleWishlist = useCallback((product) => {
    if (!checkAuth()) return;
    if (!product) return;
    const pid = product.id || product._id;
    const rawImg = (product.images && product.images[0]) || product.image;
    const mainImage = resolveImage(rawImg) || DEFAULT_IMAGE;

    setWishlist((prev) => {
      const exists = prev.some((p) => (p.id || p._id) === pid);
      let next;
      if (exists) {
        next = prev.filter((p) => (p.id || p._id) !== pid);
      } else {
        next = [
          ...prev,
          {
            id: pid,
            _id: pid,
            name: product.name,
            price: Number(product.price) || 0,
            oldPrice: Number(product.oldPrice) || 0,
            image: mainImage,
            rating: product.rating,
            reviews: product.reviews || product.reviewsCount,
            monthly: product.monthly,
            used: product.used,
            grade: product.grade,
            battery: product.battery,
          },
        ];
      }
      saveWishlistSync(next);
      return next;
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
    () => Math.round(cart.reduce((acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 1), 0)),
    [cart]
  );

  const cartOldTotal = useMemo(
    () =>
      Math.round(
        cart.reduce(
          (acc, item) =>
            acc +
            ((Number(item.oldPrice) && Number(item.oldPrice) > Number(item.price) ? Number(item.oldPrice) : Number(item.price)) || 0) *
              (item.quantity || 1),
          0
        )
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
