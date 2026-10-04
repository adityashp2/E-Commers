'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient, withTimeout } from '@/lib/supabase/client';
import { Produk, Kategori } from '@/types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mockData';

const PRODUCTS_STORAGE_KEY = 'toko_buket_products';
const CATEGORIES_STORAGE_KEY = 'toko_buket_categories';
const SETTINGS_STORAGE_KEY = 'toko_buket_settings';

export interface StoreSettings {
  wa_number: string;
  min_hari_pesan: string;
  alamat_pengambilan: string;
  jam_operasional: string;
  instagram: string;
}

export const DEFAULT_SETTINGS: StoreSettings = {
  wa_number: '085161204930',
  min_hari_pesan: '1',
  alamat_pengambilan: 'Jl. Pemuda No. 45, Menteng, Jakarta Pusat, DKI Jakarta 10310',
  jam_operasional: 'Senin - Sabtu: 09:00 - 18:00 WIB',
  instagram: '@toko.buket',
};

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// -------------------------------------------------------------
// 1. PRODUCTS STORE
// -------------------------------------------------------------

export function getStoredProducts(): Produk[] {
  if (typeof window === 'undefined') return MOCK_PRODUCTS;
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(MOCK_PRODUCTS));
      return MOCK_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredProducts(products: Produk[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event('products-updated'));
  } catch {}
}

export async function addOrUpdateProduct(product: Partial<Produk> & { nama: string }): Promise<Produk> {
  const current = getStoredProducts();
  const id = product.id || generateUUID();
  const slug = product.slug || product.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${Date.now().toString(36)}`;
  
  // Find category object if kategori_id is given
  const categories = getStoredCategories();
  const cat = categories.find((c) => c.id === product.kategori_id);

  const fullProduct: Produk = {
    id,
    nama: product.nama,
    slug,
    kategori_id: product.kategori_id || null,
    harga: Number(product.harga) || 0,
    deskripsi: product.deskripsi || null,
    foto_url: product.foto_url || null,
    status: product.status || 'tersedia',
    created_at: product.created_at || new Date().toISOString(),
    kategori: cat,
  };

  const existingIndex = current.findIndex((p) => p.id === id);
  let updatedList: Produk[];
  if (existingIndex >= 0) {
    updatedList = [...current];
    updatedList[existingIndex] = { ...updatedList[existingIndex], ...fullProduct };
  } else {
    updatedList = [fullProduct, ...current];
  }

  // 1. Persist immediately to localStorage
  saveStoredProducts(updatedList);

  // 2. Unmark from deleted IDs if re-added
  try {
    const deletedKey = 'toko_buket_deleted_prod_ids';
    const deletedRaw = localStorage.getItem(deletedKey);
    if (deletedRaw) {
      const deletedIds: string[] = JSON.parse(deletedRaw);
      const filteredDeleted = deletedIds.filter((deletedId) => deletedId !== id);
      localStorage.setItem(deletedKey, JSON.stringify(filteredDeleted));
    }
  } catch {}

  // 3. Sync to Supabase via server API route (bypasses RLS with service role key)
  try {
    await fetch('/api/admin/produk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullProduct),
    });
  } catch {}

  return fullProduct;
}

export async function deleteStoredProduct(id: string) {
  const current = getStoredProducts();
  const filtered = current.filter((p) => p.id !== id);
  saveStoredProducts(filtered);

  // Track deleted IDs so background sync doesn't resurrect them if Supabase delete failed or timed out
  try {
    const deletedKey = 'toko_buket_deleted_prod_ids';
    const deletedRaw = localStorage.getItem(deletedKey);
    const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      localStorage.setItem(deletedKey, JSON.stringify(deletedIds));
    }
  } catch {}

  // Sync delete to database via server endpoint
  try {
    await fetch(`/api/admin/produk?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch {}
}

export function useProducts() {
  const [products, setProducts] = useState<Produk[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(() => {
    setProducts(getStoredProducts());
  }, []);

  useEffect(() => {
    reload();
    setIsLoading(false);

    // Try Supabase fetch in background
    async function syncFromDb() {
      try {
        const supabase = createClient();
        const { data } = await withTimeout<{ data: Produk[] | null }>(
          supabase
            .from('produk')
            .select('*, kategori:kategori_id(id, nama)')
            .order('created_at', { ascending: false }),
          1200
        );

        // ONLY merge if Supabase returned a valid array with items!
        // NEVER overwrite or wipe out local products if Supabase returns empty []!
        if (data && Array.isArray(data) && data.length > 0) {
          let deletedIds: string[] = [];
          try {
            const deletedRaw = localStorage.getItem('toko_buket_deleted_prod_ids');
            if (deletedRaw) deletedIds = JSON.parse(deletedRaw);
          } catch {}

          const currentLocal = getStoredProducts();
          const productMap = new Map<string, Produk>();

          // 1. Add DB products that were not deleted
          for (const p of data) {
            if (!deletedIds.includes(p.id)) {
              productMap.set(p.id, p);
            }
          }

          // 2. Add local products (local takes precedence so newly added products are NEVER lost!)
          for (const p of currentLocal) {
            if (!deletedIds.includes(p.id)) {
              productMap.set(p.id, p);
            }
          }

          const merged = Array.from(productMap.values());
          saveStoredProducts(merged);
          setProducts(merged);
        }
      } catch {}
    }

    syncFromDb();

    window.addEventListener('products-updated', reload);
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PRODUCTS_STORAGE_KEY) reload();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('products-updated', reload);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [reload]);

  return { products, isLoading, reload };
}

// -------------------------------------------------------------
// 2. CATEGORIES STORE
// -------------------------------------------------------------

export function getStoredCategories(): Kategori[] {
  if (typeof window === 'undefined') return MOCK_CATEGORIES;
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(MOCK_CATEGORIES));
      return MOCK_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredCategories(categories: Kategori[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    window.dispatchEvent(new Event('categories-updated'));
  } catch {}
}

export async function addCategory(nama: string): Promise<Kategori> {
  const current = getStoredCategories();
  const newCat: Kategori = {
    id: generateUUID(),
    nama: nama.trim(),
    created_at: new Date().toISOString(),
  };

  const updated = [...current, newCat];
  saveStoredCategories(updated);

  try {
    const deletedKey = 'toko_buket_deleted_cat_ids';
    const deletedRaw = localStorage.getItem(deletedKey);
    if (deletedRaw) {
      const deletedIds: string[] = JSON.parse(deletedRaw);
      const filtered = deletedIds.filter((dId) => dId !== newCat.id);
      localStorage.setItem(deletedKey, JSON.stringify(filtered));
    }
  } catch {}

  try {
    await fetch('/api/admin/kategori', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCat),
    });
  } catch {}

  return newCat;
}

export async function updateCategory(id: string, nama: string) {
  const current = getStoredCategories();
  const updated = current.map((c) => (c.id === id ? { ...c, nama: nama.trim() } : c));
  saveStoredCategories(updated);

  try {
    await fetch('/api/admin/kategori', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, nama: nama.trim() }),
    });
  } catch {}
}

export async function deleteCategory(id: string) {
  const current = getStoredCategories();
  const updated = current.filter((c) => c.id !== id);
  saveStoredCategories(updated);

  // Track deleted IDs so background sync doesn't resurrect them
  try {
    const deletedKey = 'toko_buket_deleted_cat_ids';
    const deletedRaw = localStorage.getItem(deletedKey);
    const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      localStorage.setItem(deletedKey, JSON.stringify(deletedIds));
    }
  } catch {}

  try {
    await fetch(`/api/admin/kategori?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch {}
}

export function useCategories() {
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(() => {
    setCategories(getStoredCategories());
  }, []);

  useEffect(() => {
    reload();
    setIsLoading(false);

    // Try sync with Supabase in background
    async function syncFromDb() {
      try {
        const supabase = createClient();
        const { data } = await withTimeout<{ data: Kategori[] | null }>(
          supabase.from('kategori').select('*').order('nama'),
          1200
        );
        if (data && Array.isArray(data) && data.length > 0) {
          let deletedIds: string[] = [];
          try {
            const deletedRaw = localStorage.getItem('toko_buket_deleted_cat_ids');
            if (deletedRaw) deletedIds = JSON.parse(deletedRaw);
          } catch {}

          const currentLocal = getStoredCategories();
          const catMap = new Map<string, Kategori>();

          // 1. Add DB categories
          for (const c of data) {
            if (!deletedIds.includes(c.id)) {
              catMap.set(c.id, c);
            }
          }

          // 2. Add local categories (so newly added local categories are NEVER lost)
          for (const c of currentLocal) {
            if (!deletedIds.includes(c.id)) {
              catMap.set(c.id, c);
            }
          }

          const merged = Array.from(catMap.values());
          saveStoredCategories(merged);
          setCategories(merged);
        }
      } catch {}
    }

    syncFromDb();

    window.addEventListener('categories-updated', reload);
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CATEGORIES_STORAGE_KEY) reload();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('categories-updated', reload);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [reload]);

  return { categories, isLoading, reload };
}

// -------------------------------------------------------------
// 3. SETTINGS STORE
// -------------------------------------------------------------

export function getStoredSettings(): StoreSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: Partial<StoreSettings>) {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredSettings();
    const merged = { ...current, ...settings };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new Event('settings-updated'));
  } catch {}
}

export async function updateStoreSettings(settings: Partial<StoreSettings>) {
  saveStoredSettings(settings);

  // Try sync to Supabase
  try {
    const supabase = createClient();
    const rows = Object.entries(settings).map(([key, value]) => ({ key, value: String(value) }));
    for (const row of rows) {
      await withTimeout(supabase.from('pengaturan').upsert(row, { onConflict: 'key' }), 1000);
    }
  } catch {}
}

export function useSettings() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(() => {
    setSettings(getStoredSettings());
  }, []);

  useEffect(() => {
    reload();
    setIsLoading(false);

    async function syncFromDb() {
      try {
        const supabase = createClient();
        const { data } = await withTimeout<{ data: Array<{ key: string; value: string }> | null }>(
          supabase.from('pengaturan').select('*'),
          1000
        );
        if (data && data.length > 0) {
          const map: Partial<StoreSettings> = {};
          data.forEach((s) => {
            if (s.key === 'wa_number') map.wa_number = s.value;
            if (s.key === 'min_hari_pesan') map.min_hari_pesan = s.value;
            if (s.key === 'alamat_pengambilan') map.alamat_pengambilan = s.value;
            if (s.key === 'jam_operasional') map.jam_operasional = s.value;
            if (s.key === 'instagram') map.instagram = s.value;
          });
          saveStoredSettings(map);
          setSettings((prev) => ({ ...prev, ...map }));
        }
      } catch {}
    }

    syncFromDb();

    window.addEventListener('settings-updated', reload);
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SETTINGS_STORAGE_KEY) reload();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('settings-updated', reload);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [reload]);

  return { settings, isLoading, reload };
}
