import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { useToast } from './ToastContext';
import { useCart } from './CartContext';

const WISHLIST_STORAGE_KEY = 'inbox_wishlist_items_v1';

interface WishlistContextType {
  wishlist: Product[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  moveToCart: (product: Product) => void;
  moveAllToCart: () => void;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const { addToCart } = useCart();

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        showToast('Removed from wishlist', {
          message: `${product.name} was removed.`,
          type: 'info',
        });
        return prev.filter((item) => item.id !== product.id);
      } else {
        showToast('Saved to wishlist', {
          message: `${product.name} is in your saved list.`,
          type: 'success',
        });
        return [...prev, product];
      }
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
    showToast('Removed from wishlist', { type: 'info' });
  };

  const moveToCart = (product: Product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  const moveAllToCart = () => {
    wishlist.forEach((item) => {
      addToCart(item);
    });
    setWishlist([]);
    showToast('All items moved to cart', { type: 'success' });
  };

  const clearWishlist = () => {
    setWishlist([]);
    showToast('Wishlist cleared', { type: 'info' });
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        moveToCart,
        moveAllToCart,
        clearWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
