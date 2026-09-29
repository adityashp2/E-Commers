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
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setItems(getStoredCart());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveCart(items);
      window.dispatchEvent(new Event('cart-updated'));
    }
  }, [items, isLoaded]);

  const addItem = useCallback((produk: Produk, jumlah: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.produk.id === produk.id);
      if (existing) {
        return prev.map((item) =>
          item.produk.id === produk.id
            ? { ...item, jumlah: item.jumlah + jumlah }
            : item
        );
      }
      return [...prev, { produk, jumlah }];
    });
  }, []);

  const updateJumlah = useCallback((produkId: string, jumlah: number) => {
    if (jumlah < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.produk.id === produkId ? { ...item, jumlah } : item
      )
    );
  }, []);

  const removeItem = useCallback((produkId: string) => {
    setItems((prev) => prev.filter((item) => item.produk.id !== produkId));
  }, []);

  const clearCart = useCallback(() => {
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
