# 🌸 Web Itan — Toko Buket Online

Platform e-commerce modern untuk toko buket bunga berbasis Next.js 16 + Supabase. Customer bisa browse produk, masukkan ke keranjang, dan order langsung via WhatsApp. Admin punya dashboard lengkap untuk manage produk, kategori, konten landing page, dan pantau penjualan dengan grafik interaktif.

---

## ✨ Fitur Utama

### 🛍️ Sisi Customer
- **Landing Page** — Hero section, galeri produk unggulan, section tentang toko, kontak
- **Katalog Produk** — Browse semua produk, filter per kategori
- **Detail Produk** — Foto, deskripsi, harga, tombol tambah ke keranjang
- **Keranjang Belanja** — Tambah/kurang/hapus item, lihat total
- **Checkout via WhatsApp** — Isi nama & tanggal pengambilan, langsung kirim pesan WA ke admin

### 🔧 Sisi Admin (`/admin`)
- **Dashboard Penjualan** — Grafik omzet harian, jumlah pesanan, produk terlaris, distribusi status
- **Manajemen Pesanan** — Catat pesanan dari WA, edit status, filter, search
- **Manajemen Produk** — Tambah, edit, hapus produk + upload foto
- **Manajemen Kategori** — CRUD kategori produk
- **Landing Page Editor** — Edit konten hero, tentang, dan info toko langsung dari admin
- **Pengaturan Toko** — Nomor WA, alamat, jam operasional, Instagram

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| Database & Auth | [Supabase](https://supabase.com/) (PostgreSQL) |
| Icons | [Lucide React](https://lucide.dev/) |
| Grafik | [Recharts](https://recharts.org/) |
| Font | Playfair Display + Poppins (Google Fonts) |
| Language | TypeScript 5 |

---

## 📁 Struktur Project

```
web-itan/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing page
│   │   ├── katalog/                  # Halaman katalog produk
│   │   ├── produk/[slug]/            # Detail produk
│   │   ├── keranjang/                # Keranjang belanja
│   │   ├── admin/                    # Admin panel
│   │   │   ├── layout.tsx            # Sidebar & layout admin
│   │   │   ├── penjualan/            # Dashboard penjualan & grafik
│   │   │   ├── produk/               # Manajemen produk
│   │   │   ├── kategori/             # Manajemen kategori
│   │   │   ├── landing/              # Editor landing page
│   │   │   └── pengaturan/           # Pengaturan toko
│   │   └── xmin/login/               # Halaman login admin
│   ├── components/
│   │   ├── landing/                  # Komponen landing page
│   │   ├── katalog/                  # Komponen katalog
│   │   ├── admin/                    # Komponen admin
│   │   └── ui/                       # Komponen UI reusable
│   ├── lib/
│   │   ├── store.ts                  # State management produk & kategori
│   │   ├── salesStore.ts             # State management pesanan & penjualan
│   │   ├── whatsapp.ts               # Builder pesan WhatsApp
│   │   ├── utils.ts                  # Helper functions
│   │   ├── landingData.ts            # Data konten landing page
│   │   └── supabase/                 # Supabase client config
│   └── types/
│       └── index.ts                  # TypeScript type definitions
├── .env.local                        # Environment variables (tidak di-commit)
└── package.json
```

---

## 🚀 Cara Jalankan Lokal

### 1. Clone repo

```bash
git clone https://github.com/adityashp2/E-Commers.git
cd E-Commers
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

> Dapetin nilai ini dari [Supabase Dashboard](https://app.supabase.com/) → Project Settings → API

### 4. Setup database Supabase

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Tabel kategori
CREATE TABLE kategori (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel produk
CREATE TABLE produk (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  kategori_id UUID REFERENCES kategori(id) ON DELETE SET NULL,
  harga INTEGER NOT NULL DEFAULT 0,
  deskripsi TEXT,
  foto_url TEXT,
  status TEXT NOT NULL DEFAULT 'tersedia' CHECK (status IN ('tersedia', 'habis')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel pengaturan toko
CREATE TABLE pengaturan (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Tabel pesanan
CREATE TABLE pesanan (
  id TEXT PRIMARY KEY,
  nama_pelanggan TEXT NOT NULL,
  tanggal_pesan DATE NOT NULL,
  tanggal_pengambilan DATE NOT NULL,
  catatan TEXT,
  status TEXT NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'diproses', 'selesai', 'dibatalkan')),
  items JSONB NOT NULL DEFAULT '[]',
  total INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. Jalankan dev server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 📊 Fitur Dashboard Penjualan

Dashboard penjualan di `/admin/penjualan` menyediakan:

- **4 Summary Cards** — Total omzet, total pesanan, rata-rata order, jumlah selesai
- **Grafik Omzet Harian** — Area chart 7/14/30 hari terakhir
- **Grafik Jumlah Pesanan** — Bar chart per hari
- **Produk Terlaris** — Top 5 produk berdasarkan unit terjual
- **Distribusi Status** — Pie chart status pesanan
- **Pesanan Terbaru** — List 5 pesanan terbaru

> **Cara input pesanan:** Karena order masuk via WhatsApp, admin input manual pesanan di tab "Manajemen Pesanan" → ubah status ke "Selesai" untuk masuk ke kalkulasi omzet.

---

## 🔐 Akses Admin

URL admin: `/admin/produk` (redirect otomatis ke login jika belum login)  
Login page: `/xmin/login`

Autentikasi menggunakan Supabase Auth. Setup user admin di Supabase Dashboard → Authentication → Users.

---

## 📦 Scripts

```bash
npm run dev      # Jalankan development server
npm run build    # Build untuk production
npm run start    # Jalankan production server
npm run lint     # Cek linting
```

---

## 🎨 Design System

Warna utama yang dipakai:

| Variabel | Warna | Keterangan |
|----------|-------|------------|
| `--color-mint` | `#00C49F` | Warna aksen utama |
| `--color-mint-dark` | `#00A882` | Hover state mint |
| `--color-pink` | `#ffb6c9` | Aksen sekunder |
| `--color-text` | `#1E1E24` | Teks utama |
| `--color-canvas` | `#F9F9FB` | Background |

Font: **Playfair Display** (heading) + **Poppins** (body)

---

## 📝 Data Persistence

Project ini menggunakan **hybrid storage**:
- **localStorage** — Sebagai cache lokal, data langsung tersedia tanpa loading
- **Supabase** — Sebagai database utama, disync di background

Jika Supabase tidak tersedia (timeout), app tetap bisa jalan menggunakan data localStorage.

---

## 🤝 Kontribusi

Pull request dan issue welcome. Untuk perubahan besar, buka issue dulu untuk diskusi.

---

Made with ❤️ by [@adityashp2](https://github.com/adityashp2)
