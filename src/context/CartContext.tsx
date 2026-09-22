import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, SavedItem, Coupon } from '../types';
import { DEMO_COUPONS } from '../data/coupons';
import { useToast } from './ToastContext';

const CART_STORAGE_KEY = 'inbox_cart_items_v1';
const SAVED_STORAGE_KEY = 'inbox_saved_items_v1';
const APPLIED_COUPON_KEY = 'inbox_applied_coupon_v1';

interface CartContextType {
  cart: CartItem[];
  items: CartItem[];
  savedItems: SavedItem[];
  savedForLater: SavedItem[];
  appliedCoupon: Coupon | null;
  addToCart: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string) => void;
  updateQuantity: (productId: string, quantity: number, color?: string, size?: string) => void;
  removeFromCart: (productId: string, color?: string, size?: string) => void;
  saveForLater: (productId: string, color?: string, size?: string) => void;
  moveToCartFromSaved: (savedItem: SavedItem) => void;
  moveToCart: (id: string) => void;
  removeSavedItem: (productId: string) => void;
  removeSavedForLater: (id: string) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  discountAmount: number;
  discount: number;
  deliveryFee: number;
  shipping: number;
  taxAmount: number;
  tax: number;
  finalTotal: number;
  total: number;
  deliveryMethod: 'Standard' | 'Express';
  setDeliveryMethod: (method: 'Standard' | 'Express') => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const stored = localStorage.getItem(APPLIED_COUPON_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  const [deliveryMethod, setDeliveryMethod] = useState<'Standard' | 'Express'>('Standard');

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedItems));
  }, [savedItems]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(APPLIED_COUPON_KEY, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(APPLIED_COUPON_KEY);
    }
  }, [appliedCoupon]);

  const addToCart = (product: Product, quantity = 1, selectedColor?: string, selectedSize?: string) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = Math.min(updated[existingIndex].quantity + quantity, product.stock);
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            id: `${product.id}-${selectedColor || 'default'}-${selectedSize || 'default'}`,
            product,
            quantity: Math.min(quantity, product.stock),
            selectedColor: selectedColor || (product.colors ? product.colors[0] : undefined),
            selectedSize: selectedSize || (product.sizes ? product.sizes[0] : undefined),
          },
        ];
      }
    });

    showToast(`Added to cart`, {
      message: `${product.name} is now in your cart.`,
      type: 'success',
    });
  };

  const updateQuantity = (productId: string, quantity: number, color?: string, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, color, size);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (
          (item.id === productId || item.product.id === productId) &&
          (color ? item.selectedColor === color : true) &&
          (size ? item.selectedSize === size : true)
        ) {
          const clampedQty = Math.min(quantity, item.product.stock);
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, color?: string, size?: string) => {
    setCart((prev) => {
      const itemToRemove = prev.find(
        (item) =>
          (item.id === productId || item.product.id === productId) &&
          (color ? item.selectedColor === color : true) &&
          (size ? item.selectedSize === size : true)
      );
      if (itemToRemove) {
        showToast(`Item removed`, {
          message: `${itemToRemove.product.name} removed from cart.`,
          type: 'info',
        });
      }
      return prev.filter(
        (item) =>
          !(
            (item.id === productId || item.product.id === productId) &&
            (color ? item.selectedColor === color : true) &&
            (size ? item.selectedSize === size : true)
          )
      );
    });
  };

  const saveForLater = (productId: string, color?: string, size?: string) => {
    const item = cart.find(
      (i) =>
        (i.id === productId || i.product.id === productId) &&
        (color ? i.selectedColor === color : true) &&
        (size ? i.selectedSize === size : true)
    );

    if (item) {
      removeFromCart(item.product.id, color, size);
      setSavedItems((prev) => [
        ...prev,
        {
          id: `${item.product.id}-${item.selectedColor || 'default'}-${item.selectedSize || 'default'}`,
          product: item.product,
          savedAt: new Date().toISOString(),
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
        },
      ]);
      showToast('Saved for later', {
        message: `${item.product.name} moved to saved items.`,
        type: 'info',
      });
    }
  };

  const moveToCartFromSaved = (savedItem: SavedItem) => {
    addToCart(savedItem.product, 1, savedItem.selectedColor, savedItem.selectedSize);
    setSavedItems((prev) => prev.filter((i) => i.product.id !== savedItem.product.id));
  };

  const moveToCart = (id: string) => {
    const found = savedItems.find((i) => i.id === id || i.product.id === id);
    if (found) {
      moveToCartFromSaved(found);
    }
  };

  const removeSavedItem = (productId: string) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== productId && i.product.id !== productId));
    showToast('Removed from saved list', { type: 'info' });
  };

  const removeSavedForLater = (id: string) => {
    removeSavedItem(id);
  };

  const applyCoupon = (code: string) => {
    const found = DEMO_COUPONS.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!found) {
      return { success: false, message: 'Invalid coupon code. Try SAVE10 or SAVE20!' };
    }

    if (subtotal < found.minSpend) {
      return {
        success: false,
        message: `Coupon requires minimum spend of $${found.minSpend.toFixed(2)}. Current subtotal is $${subtotal.toFixed(2)}.`,
      };
    }

    setAppliedCoupon(found);
    showToast(`Coupon applied!`, {
      message: `${found.code}: ${found.description}`,
      type: 'success',
    });
    return { success: true, message: `Coupon ${found.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', { type: 'info' });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Calculations
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = Number(
    cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)
  );

  let discountAmount = 0;
  if (appliedCoupon) {
    const pct = appliedCoupon.discountPercentage ?? appliedCoupon.discountPercent ?? 0;
    if (pct > 0) {
      discountAmount = (subtotal * pct) / 100;
      if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount;
      }
    } else if (appliedCoupon.discountAmount) {
      discountAmount = appliedCoupon.discountAmount;
    }
  }
  discountAmount = Number(discountAmount.toFixed(2));

  // Delivery fee logic
  let baseDelivery = deliveryMethod === 'Express' ? 12.99 : 4.99;
  if (subtotal >= 75 || appliedCoupon?.freeShipping) {
    baseDelivery = deliveryMethod === 'Express' ? 4.99 : 0.0;
  }
  const deliveryFee = cart.length === 0 ? 0 : Number(baseDelivery.toFixed(2));

  // Tax calculation (8%)
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = cart.length === 0 ? 0 : Number((taxableAmount * 0.08).toFixed(2));

  // Final Total
  const finalTotal = cart.length === 0 ? 0 : Number((taxableAmount + deliveryFee + taxAmount).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart,
        savedItems,
        savedForLater: savedItems,
        appliedCoupon,
        addToCart,
        updateQuantity,
        removeFromCart,
        saveForLater,
        moveToCartFromSaved,
        moveToCart,
        removeSavedItem,
        removeSavedForLater,
        applyCoupon,
        removeCoupon,
        clearCart,
        totalItemsCount,
        subtotal,
        discountAmount,
        discount: discountAmount,
        deliveryFee,
        shipping: deliveryFee,
        taxAmount,
        tax: taxAmount,
        finalTotal,
        total: finalTotal,
        deliveryMethod,
        setDeliveryMethod,
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
