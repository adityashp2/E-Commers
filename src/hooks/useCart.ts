'use client';

import { useState, useEffect, useCallback } from 'react';
import { CartItem, Produk } from '@/types';

const CART_KEY = 'buket-cart';

function getStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('cart-updated'));
  } catch (err) {
    console.error('Failed to save cart to localStorage', err);
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync state with localStorage on mount and whenever cart-updated fires anywhere
  useEffect(() => {
    const sync = () => {
      setItems(getStoredCart());
      setIsLoaded(true);
    };

    sync();

    window.addEventListener('cart-updated', sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener('cart-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const addItem = useCallback((produk: Produk, jumlah: number = 1) => {
    const current = getStoredCart();
    const existingIndex = current.findIndex((item) => item.produk.id === produk.id);

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = current.map((item, idx) =>
        idx === existingIndex
          ? { ...item, jumlah: item.jumlah + jumlah }
          : item
      );
    } else {
      updated = [...current, { produk, jumlah }];
    }

    // Save synchronously to ensure immediate 1-click persistence
    saveCart(updated);
    setItems(updated);
  }, []);

  const updateJumlah = useCallback((produkId: string, jumlah: number) => {
    if (jumlah < 1) return;
    const current = getStoredCart();
    const updated = current.map((item) =>
      item.produk.id === produkId ? { ...item, jumlah } : item
    );
    saveCart(updated);
    setItems(updated);
  }, []);

  const removeItem = useCallback((produkId: string) => {
    const current = getStoredCart();
    const updated = current.filter((item) => item.produk.id !== produkId);
    saveCart(updated);
    setItems(updated);
  }, []);

  const clearCart = useCallback(() => {
    saveCart([]);
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.jumlah, 0);
  const totalHarga = items.reduce(
    (sum, item) => sum + item.produk.harga * item.jumlah,
    0
  );

  return {
    items,
    isLoaded,
    addItem,
    updateJumlah,
    removeItem,
    clearCart,
    totalItems,
    totalHarga,
  };
}
