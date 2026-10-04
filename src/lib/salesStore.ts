'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient, withTimeout } from '@/lib/supabase/client';
import { Produk } from '@/types';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type StatusPesanan = 'menunggu' | 'diproses' | 'selesai' | 'dibatalkan';

export interface ItemPesanan {
  produk_id: string;
  nama_produk: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
}

export interface Pesanan {
  id: string;
  nama_pelanggan: string;
  tanggal_pesan: string;      // ISO date string — when order was placed
  tanggal_pengambilan: string; // ISO date string — pickup date
  catatan: string | null;
  status: StatusPesanan;
  items: ItemPesanan[];
  total: number;
  created_at: string;
}

// ─────────────────────────────────────────────
// LOCAL-STORAGE PERSISTENCE KEY
// ─────────────────────────────────────────────

const ORDERS_KEY = 'toko_buket_pesanan';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

export function getStoredOrders(): Pesanan[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredOrders(orders: Pesanan[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event('orders-updated'));
  } catch {}
}

// ─────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────

export async function addPesanan(
  data: Omit<Pesanan, 'id' | 'created_at' | 'total'>
): Promise<Pesanan> {
  const total = data.items.reduce((s, i) => s + i.subtotal, 0);
  const newOrder: Pesanan = {
    ...data,
    id: `ord-${Date.now()}`,
    total,
    created_at: new Date().toISOString(),
  };

  const current = getStoredOrders();
  saveStoredOrders([newOrder, ...current]);

  // Try sync to Supabase
  try {
    const supabase = createClient();
    await withTimeout(
      supabase.from('pesanan').insert({
        id: newOrder.id,
        nama_pelanggan: newOrder.nama_pelanggan,
        tanggal_pesan: newOrder.tanggal_pesan,
        tanggal_pengambilan: newOrder.tanggal_pengambilan,
        catatan: newOrder.catatan,
        status: newOrder.status,
        items: newOrder.items,
        total: newOrder.total,
      }),
      2000
    );
  } catch {}

  return newOrder;
}

export async function updatePesanan(id: string, data: Partial<Pesanan>) {
  const current = getStoredOrders();
  const updated = current.map((o) =>
    o.id === id ? { ...o, ...data, total: data.items ? data.items.reduce((s, i) => s + i.subtotal, 0) : o.total } : o
  );
  saveStoredOrders(updated);

  // Try sync to Supabase
  try {
    const supabase = createClient();
    const payload: Record<string, unknown> = { ...data };
    if (data.items) payload.total = data.items.reduce((s, i) => s + i.subtotal, 0);
    await withTimeout(supabase.from('pesanan').update(payload).eq('id', id), 2000);
  } catch {}
}

export async function deletePesanan(id: string) {
  const current = getStoredOrders();
  saveStoredOrders(current.filter((o) => o.id !== id));

  try {
    const supabase = createClient();
    await withTimeout(supabase.from('pesanan').delete().eq('id', id), 2000);
  } catch {}
}

// ─────────────────────────────────────────────
// REACT HOOK
// ─────────────────────────────────────────────

export function usePesanan() {
  const [orders, setOrders] = useState<Pesanan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(() => {
    setOrders(getStoredOrders());
  }, []);

  useEffect(() => {
    reload();
    setIsLoading(false);

    // Try sync from Supabase
    async function syncFromDb() {
      try {
        const supabase = createClient();
        const { data } = await withTimeout<{ data: Pesanan[] | null }>(
          supabase
            .from('pesanan')
            .select('*')
            .order('created_at', { ascending: false }),
          2000
        );
        if (data && data.length > 0) {
          saveStoredOrders(data);
          setOrders(data);
        }
      } catch {}
    }

    syncFromDb();

    window.addEventListener('orders-updated', reload);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === ORDERS_KEY) reload();
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('orders-updated', reload);
      window.removeEventListener('storage', handleStorage);
    };
  }, [reload]);

  return { orders, isLoading, reload };
}

// ─────────────────────────────────────────────
// ANALYTICS HELPERS
// ─────────────────────────────────────────────

export interface DailyStat {
  date: string;       // 'YYYY-MM-DD'
  label: string;      // 'DD MMM'
  omzet: number;
  jumlah: number;
}

export interface ProductStat {
  nama: string;
  terjual: number;
  omzet: number;
}

export interface KategoriStat {
  nama: string;
  terjual: number;
}

/** Returns last N days stats (only from 'selesai' orders) */
export function getDailyStats(orders: Pesanan[], days = 30): DailyStat[] {
  const map: Record<string, DailyStat> = {};
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    map[key] = { date: key, label, omzet: 0, jumlah: 0 };
  }

  orders
    .filter((o) => o.status === 'selesai')
    .forEach((o) => {
      const key = o.tanggal_pesan.slice(0, 10);
      if (map[key]) {
        map[key].omzet += o.total;
        map[key].jumlah += 1;
      }
    });

  return Object.values(map);
}

export function getProductStats(orders: Pesanan[]): ProductStat[] {
  const map: Record<string, ProductStat> = {};

  orders
    .filter((o) => o.status === 'selesai')
    .forEach((o) => {
      o.items.forEach((item) => {
        if (!map[item.nama_produk]) {
          map[item.nama_produk] = { nama: item.nama_produk, terjual: 0, omzet: 0 };
        }
        map[item.nama_produk].terjual += item.jumlah;
        map[item.nama_produk].omzet += item.subtotal;
      });
    });

  return Object.values(map).sort((a, b) => b.terjual - a.terjual).slice(0, 10);
}

export function getSummary(orders: Pesanan[]) {
  const selesai = orders.filter((o) => o.status === 'selesai');
  const totalOmzet = selesai.reduce((s, o) => s + o.total, 0);
  const totalPesanan = orders.length;
  const pesananSelesai = selesai.length;
  const avgOrder = pesananSelesai > 0 ? totalOmzet / pesananSelesai : 0;
  const pending = orders.filter((o) => o.status === 'menunggu').length;
  const diproses = orders.filter((o) => o.status === 'diproses').length;

  return { totalOmzet, totalPesanan, pesananSelesai, avgOrder, pending, diproses };
}
