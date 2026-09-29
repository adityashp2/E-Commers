export interface Kategori {
  id: string;
  nama: string;
  created_at: string;
}

export interface Produk {
  id: string;
  nama: string;
  slug: string;
  kategori_id: string | null;
  harga: number;
  deskripsi: string | null;
  foto_url: string | null;
  status: 'tersedia' | 'habis';
  created_at: string;
  kategori?: Kategori;
}

export interface KontenLanding {
  key: string;
  value: string;
  updated_at: string;
}

export interface Pengaturan {
  key: string;
  value: string;
}

export interface CartItem {
  produk: Produk;
  jumlah: number;
}

export interface CheckoutData {
  nama: string;
  tanggal: string;
  catatan: string;
  items: CartItem[];
}
