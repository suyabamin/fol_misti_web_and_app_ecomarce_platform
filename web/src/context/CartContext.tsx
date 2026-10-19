import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Coupon } from '../models';
import { couponRepository } from '../repositories/couponRepository';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  setDeliveryFee: (fee: number) => void;
  total: number;
  appliedCoupon: Coupon | null;
  couponError: string | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'folmishti_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [deliveryFee, setDeliveryFee] = useState<number>(60); // standard default
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponError(null);
  };

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const applyCoupon = async (code: string): Promise<boolean> => {
    setCouponError(null);
    const result = await couponRepository.validateCoupon(code, subtotal);
    if (result.isValid && result.coupon) {
      setAppliedCoupon(result.coupon);
      setDiscount(result.discount);
      return true;
    } else {
      setCouponError(result.message);
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponError(null);
  };

  // Recalculate discount if cart changes and coupon is applied
  useEffect(() => {
    if (appliedCoupon) {
      if (appliedCoupon.minOrderAmount && subtotal < appliedCoupon.minOrderAmount) {
        removeCoupon();
        setCouponError(`কার্ট মোট ৳${appliedCoupon.minOrderAmount}-এর কম হওয়ায় কুপন বাদ দেওয়া হয়েছে।`);
      } else {
        if (appliedCoupon.type === 'percentage') {
          let disc = Math.round((subtotal * appliedCoupon.value) / 100);
          if (appliedCoupon.maxDiscount && disc > appliedCoupon.maxDiscount) {
            disc = appliedCoupon.maxDiscount;
          }
          setDiscount(disc);
        } else {
          setDiscount(Math.min(subtotal, Math.round(appliedCoupon.value)));
        }
      }
    }
  }, [subtotal, appliedCoupon]);

  const total = Math.max(0, subtotal - discount + (cart.length > 0 ? deliveryFee : 0));

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        discount,
        deliveryFee,
        setDeliveryFee,
        total,
        appliedCoupon,
        couponError,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
