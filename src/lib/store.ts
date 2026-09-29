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

// -------------------------------------------------------------
// 1. PRODUCTS STORE
// -------------------------------------------------------------

export function getStoredProducts(): Produk[] {
  if (typeof window === 'undefined') return MOCK_PRODUCTS;
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(MOCK_PRODUCTS));
      return MOCK_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_PRODUCTS;
  } catch {
    return MOCK_PRODUCTS;
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
  const id = product.id || `prod-${Date.now()}`;
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

  saveStoredProducts(updatedList);

  // Try sync to Supabase asynchronously
  try {
    const supabase = createClient();
    await withTimeout(
      supabase.from('produk').upsert({
        id: fullProduct.id,
        nama: fullProduct.nama,
        slug: fullProduct.slug,
        kategori_id: fullProduct.kategori_id,
        harga: fullProduct.harga,
        deskripsi: fullProduct.deskripsi,
        foto_url: fullProduct.foto_url,
        status: fullProduct.status,
      }),
      1500
    );
  } catch {}

  return fullProduct;
}

export async function deleteStoredProduct(id: string) {
  const current = getStoredProducts();
  const filtered = current.filter((p) => p.id !== id);
  saveStoredProducts(filtered);

  // Try sync to Supabase
  try {
    const supabase = createClient();
    await withTimeout(supabase.from('produk').delete().eq('id', id), 1500);
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
          1000
        );
        if (data && data.length > 0) {
          saveStoredProducts(data);
          setProducts(data);
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
    if (!raw) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(MOCK_CATEGORIES));
      return MOCK_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_CATEGORIES;
  } catch {
    return MOCK_CATEGORIES;
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
    id: `cat-${Date.now()}`,
    nama: nama.trim(),
    created_at: new Date().toISOString(),
  };

  const updated = [...current, newCat];
  saveStoredCategories(updated);

  try {
    const supabase = createClient();
    await withTimeout(supabase.from('kategori').insert({ nama: newCat.nama }), 1500);
  } catch {}

  return newCat;
}

export async function updateCategory(id: string, nama: string) {
  const current = getStoredCategories();
  const updated = current.map((c) => (c.id === id ? { ...c, nama: nama.trim() } : c));
  saveStoredCategories(updated);

  try {
    const supabase = createClient();
    await withTimeout(supabase.from('kategori').update({ nama: nama.trim() }).eq('id', id), 1500);
  } catch {}
}

export async function deleteCategory(id: string) {
  const current = getStoredCategories();
  const updated = current.filter((c) => c.id !== id);
  saveStoredCategories(updated);

  try {
    const supabase = createClient();
    await withTimeout(supabase.from('kategori').delete().eq('id', id), 1500);
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
          1000
        );
        if (data && data.length > 0) {
          saveStoredCategories(data);
          setCategories(data);
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
