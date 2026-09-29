-- =============================================
-- Supabase SQL Setup for Toko Buket
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create tables
CREATE TABLE IF NOT EXISTS kategori (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS produk (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  kategori_id UUID REFERENCES kategori(id) ON DELETE SET NULL,
  harga INTEGER NOT NULL CHECK (harga >= 0),
  deskripsi TEXT,
  foto_url TEXT,
  status VARCHAR(20) DEFAULT 'tersedia' CHECK (status IN ('tersedia', 'habis')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS konten_landing (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pengaturan (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_produk_slug ON produk(slug);
CREATE INDEX IF NOT EXISTS idx_produk_kategori ON produk(kategori_id);
CREATE INDEX IF NOT EXISTS idx_produk_status ON produk(status);

-- 3. Seed default categories
INSERT INTO kategori (nama) VALUES
  ('Buket Bunga'),
  ('Buket Snack'),
  ('Buket Uang'),
  ('Buket Boneka')
ON CONFLICT DO NOTHING;

-- 4. Seed default settings
INSERT INTO pengaturan (key, value) VALUES
  ('wa_number', '08123456789'),
  ('min_hari_pesan', '1'),
  ('alamat_pengambilan', 'Jl. Contoh No. 123, Kota Anda'),
  ('jam_operasional', 'Senin - Sabtu, 09:00 - 18:00')
ON CONFLICT (key) DO NOTHING;

-- 5. Row Level Security (RLS)
ALTER TABLE kategori ENABLE ROW LEVEL SECURITY;
ALTER TABLE produk ENABLE ROW LEVEL SECURITY;
ALTER TABLE konten_landing ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengaturan ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public read kategori" ON kategori
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read produk" ON produk
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read konten" ON konten_landing
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read pengaturan" ON pengaturan
  FOR SELECT TO anon, authenticated USING (true);

-- Admin write access (authenticated users only)
CREATE POLICY "Admin insert kategori" ON kategori
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin update kategori" ON kategori
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admin delete kategori" ON kategori
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admin insert produk" ON produk
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin update produk" ON produk
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admin delete produk" ON produk
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admin insert konten" ON konten_landing
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin update konten" ON konten_landing
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admin insert pengaturan" ON pengaturan
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin update pengaturan" ON pengaturan
  FOR UPDATE TO authenticated USING (true);

-- 6. Create storage bucket for product images
-- (Run this separately in Supabase Dashboard > Storage)
-- Create a bucket called "produk-images" with public access

-- 7. Seed sample products (optional)
INSERT INTO produk (nama, slug, kategori_id, harga, deskripsi, status) VALUES
  (
    'Buket Mawar Pink Premium',
    'buket-mawar-pink-premium',
    (SELECT id FROM kategori WHERE nama = 'Buket Bunga' LIMIT 1),
    250000,
    'Rangkaian buket mawar pink segar dengan baby breath dan eucalyptus. Cocok untuk hadiah ulang tahun, anniversary, atau momen romantis lainnya.',
    'tersedia'
  ),
  (
    'Buket Snack Favorit',
    'buket-snack-favorit',
    (SELECT id FROM kategori WHERE nama = 'Buket Snack' LIMIT 1),
    150000,
    'Buket berisi pilihan snack favorit: coklat, wafer, permen, dan biskuit. Dibungkus cantik dengan pita dan kertas tissue premium.',
    'tersedia'
  ),
  (
    'Buket Uang 500 Ribu',
    'buket-uang-500-ribu',
    (SELECT id FROM kategori WHERE nama = 'Buket Uang' LIMIT 1),
    575000,
    'Buket uang senilai Rp500.000 dengan hiasan bunga artifisial. Harga sudah termasuk nominal uang di dalam buket.',
    'tersedia'
  ),
  (
    'Buket Boneka Teddy Bear',
    'buket-boneka-teddy-bear',
    (SELECT id FROM kategori WHERE nama = 'Buket Boneka' LIMIT 1),
    200000,
    'Buket berisi boneka teddy bear lembut berukuran 30cm dengan bunga artifisial dan pita satin. Cocok untuk wisuda atau hadiah anak.',
    'tersedia'
  ),
  (
    'Buket Mawar Merah Romantis',
    'buket-mawar-merah-romantis',
    (SELECT id FROM kategori WHERE nama = 'Buket Bunga' LIMIT 1),
    300000,
    'Setangkai keindahan dalam 12 batang mawar merah segar. Simbol cinta dan kasih sayang yang sempurna.',
    'tersedia'
  ),
  (
    'Buket Snack Jumbo',
    'buket-snack-jumbo',
    (SELECT id FROM kategori WHERE nama = 'Buket Snack' LIMIT 1),
    200000,
    'Buket jumbo berisi aneka snack premium: Cadbury, KitKat, Oreo, Lays, dan banyak lagi. Cocok untuk yang suka ngemil!',
    'tersedia'
  )
ON CONFLICT (slug) DO NOTHING;
