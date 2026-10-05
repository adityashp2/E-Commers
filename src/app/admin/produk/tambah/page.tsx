'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, withTimeout } from '@/lib/supabase/client';
import { generateSlug } from '@/lib/utils';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import ImageUploadWithCompress from '@/components/admin/ImageUploadWithCompress';
import { useCategories, addOrUpdateProduct } from '@/lib/store';

export default function TambahProdukPage() {
  const router = useRouter();
  const { categories } = useCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [nama, setNama] = useState('');
  const [kategoriId, setKategoriId] = useState('');
  const [harga, setHarga] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [status, setStatus] = useState<'tersedia' | 'po' | 'habis'>('tersedia');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoDataUrl, setFotoDataUrl] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !harga) {
      setError('Nama dan harga produk wajib diisi');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let finalFotoUrl = fotoDataUrl || '';

      // Try uploading to Supabase Storage if file exists
      if (fotoFile) {
        try {
          const supabase = createClient();
          const fileExt = fotoFile.name.split('.').pop() || 'webp';
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

          const uploadPromise = supabase.storage
            .from('produk-images')
            .upload(fileName, fotoFile, {
              cacheControl: '31536000',
              contentType: fotoFile.type,
              upsert: false,
            });

          const { data: uploadData, error: uploadError } = await withTimeout(
            uploadPromise as unknown as Promise<{ data: { path: string } | null; error: Error | null }>,
            3000
          );

          if (!uploadError && uploadData) {
            const { data: urlData } = supabase.storage
              .from('produk-images')
              .getPublicUrl(fileName);
            if (urlData?.publicUrl) {
              finalFotoUrl = urlData.publicUrl;
            }
          }
        } catch {
          // If storage fails or times out, finalFotoUrl retains the compressed base64 dataUrl
        }
      }

      const slug = generateSlug(nama) + '-' + Date.now().toString(36);

      // Save to centralized store (persists to localStorage + tries Supabase)
      await addOrUpdateProduct({
        nama: nama.trim(),
        slug,
        kategori_id: kategoriId || null,
        harga: parseInt(harga) || 0,
        deskripsi: deskripsi.trim() || null,
        foto_url: finalFotoUrl || null,
        status,
      });

      router.push('/admin/produk');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan menyimpan produk';
      setError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/admin/produk"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-mint transition-colors text-sm font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Kelola Produk
      </Link>

      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-text">
          Tambah Produk Baru
        </h1>
        <p className="text-text-secondary text-xs sm:text-sm mt-1">
          Lengkapi detail rangkaian buket baru untuk ditampilkan di katalog website
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-border/80 shadow-xs space-y-5">
        <div>
          <label htmlFor="nama" className="block text-xs font-bold uppercase tracking-wider text-text mb-1.5">
            Nama Produk <span className="text-red-500">*</span>
          </label>
          <input
            id="nama"
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Buket Mawar Merah Velvet"
            className="input-field py-2.5 text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="kategori" className="block text-xs font-bold uppercase tracking-wider text-text mb-1.5">
              Kategori
            </label>
            <select
              id="kategori"
              value={kategoriId}
              onChange={(e) => setKategoriId(e.target.value)}
              className="input-field py-2.5 text-sm bg-white"
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="harga" className="block text-xs font-bold uppercase tracking-wider text-text mb-1.5">
              Harga (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              id="harga"
              type="number"
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              placeholder="150000"
              className="input-field py-2.5 text-sm"
              min="0"
              step="1000"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="deskripsi" className="block text-xs font-bold uppercase tracking-wider text-text mb-1.5">
            Deskripsi
          </label>
          <textarea
            id="deskripsi"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            rows={3}
            placeholder="Jelaskan isian buket, jenis bunga, bonus kartu ucapan, dll..."
            className="input-field resize-none py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text mb-1.5">
            Foto Buket
          </label>
          <ImageUploadWithCompress
            label="Upload Foto Buket"
            helperText="Otomatis dikompres ke WebP di bawah 200 KB"
            onImageSelected={(file, dataUrl) => {
              setFotoFile(file);
              setFotoDataUrl(dataUrl || '');
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text mb-2.5">
            Status Ketersediaan Produk
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Opsi 1: Tersedia (Hijau / Mint) */}
            <label
              className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                status === 'tersedia'
                  ? 'border-mint bg-mint-light/40 text-mint-dark shadow-xs'
                  : 'border-border/80 bg-white text-text-secondary hover:border-mint/50'
              }`}
            >
              <input
                type="radio"
                name="status"
                value="tersedia"
                checked={status === 'tersedia'}
                onChange={() => setStatus('tersedia')}
                className="w-4 h-4 mt-0.5 accent-mint-dark cursor-pointer"
              />
              <div>
                <span className="block text-xs font-bold text-text">Tersedia (Ready)</span>
                <span className="block text-[11px] text-text-secondary mt-0.5">Produk ready, bisa langsung dipesan</span>
              </div>
            </label>

            {/* Opsi 2: Pre-Order (Amber / Emas) */}
            <label
              className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                status === 'po'
                  ? 'border-amber-400 bg-amber-50/80 text-amber-800 shadow-xs'
                  : 'border-border/80 bg-white text-text-secondary hover:border-amber-300'
              }`}
            >
              <input
                type="radio"
                name="status"
                value="po"
                checked={status === 'po'}
                onChange={() => setStatus('po')}
                className="w-4 h-4 mt-0.5 accent-amber-600 cursor-pointer"
              />
              <div>
                <span className="block text-xs font-bold text-amber-700">Pre-Order (PO)</span>
                <span className="block text-[11px] text-text-secondary mt-0.5">Tetap bisa dipesan, min. tanggal H-7 hari</span>
              </div>
            </label>

            {/* Opsi 3: Habis (Merah / Rose) */}
            <label
              className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                status === 'habis'
                  ? 'border-red-400 bg-red-50 text-red-700 shadow-xs'
                  : 'border-border/80 bg-white text-text-secondary hover:border-red-300'
              }`}
            >
              <input
                type="radio"
                name="status"
                value="habis"
                checked={status === 'habis'}
                onChange={() => setStatus('habis')}
                className="w-4 h-4 mt-0.5 accent-red-600 cursor-pointer"
              />
              <div>
                <span className="block text-xs font-bold text-red-600">Habis (Kosong)</span>
                <span className="block text-[11px] text-text-secondary mt-0.5">Muncul badge habis, tidak bisa dipesan</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-border/60">
          <Link
            href="/admin/produk"
            className="btn-secondary py-3 px-5 text-sm font-semibold"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary py-3 px-6 text-sm font-bold flex-1 sm:flex-none shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" /> Simpan & Publikasikan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
