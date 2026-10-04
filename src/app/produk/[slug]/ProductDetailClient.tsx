'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { Produk } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useProducts } from '@/lib/store';
import {
  ShoppingBag,
  ArrowLeft,
  Share2,
  Check,
  Truck,
  ShieldCheck,
  Heart,
  Plus,
  Minus,
  Package,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import SafeImage, { FALLBACK_BOUQUET_IMG } from '@/components/ui/SafeImage';
import { useSettings } from '@/lib/store';

interface ProductDetailClientProps {
  slug: string;
  initialProduct?: Produk | null;
}

export default function ProductDetailClient({ slug, initialProduct }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { products, isLoading } = useProducts();
  const { settings } = useSettings();
  const [jumlah, setJumlah] = useState(1);
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);

  // Prioritize live store product (edited in admin) over static initialProduct
  const storeProduct = products.find((p) => p.slug === slug);
  const product: Produk | undefined = storeProduct || initialProduct || undefined;

  if (!product && isLoading) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="skeleton aspect-square rounded-3xl" />
            <div className="space-y-4">
              <div className="skeleton h-8 w-3/4 rounded-xl" />
              <div className="skeleton h-6 w-1/3 rounded-xl" />
              <div className="skeleton h-32 w-full rounded-2xl" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-28 pb-20 max-w-xl mx-auto px-4 text-center">
          <Package className="w-16 h-16 text-pink-border mx-auto mb-4" />
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-text mb-2">
            Produk Tidak Ditemukan
          </h1>
          <p className="text-text-secondary text-sm mb-6">
            Buket yang Anda cari mungkin telah dihapus atau tautan tidak sesuai.
          </p>
          <Link href="/katalog" className="btn-primary inline-flex py-3 px-6 text-sm">
            Kembali ke Katalog
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const isAvailable = product.status === 'tersedia';

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (!isAvailable) return;
    if (e) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      window.dispatchEvent(
        new CustomEvent('fly-to-cart', {
          detail: {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          },
        })
      );
    }
    addItem(product, jumlah);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleDirectOrder = () => {
    if (!isAvailable) return;
    addItem(product, jumlah);
    router.push('/keranjang');
  };

  const handlePreOrder = () => {
    const waNumber = settings.wa_number || '085161204930';
    const cleanNumber = waNumber.replace(/\D/g, '');
    const formattedNumber = cleanNumber.startsWith('0')
      ? '62' + cleanNumber.slice(1)
      : cleanNumber;
    const message = `Halo Kak, saya tertarik untuk *Pre-Order* produk ini:\n\n*${product.nama}*\nHarga: ${formatRupiah(product.harga)}\nLink: ${typeof window !== 'undefined' ? window.location.href : ''}\n\nApakah bisa dibuatkan? Mohon info estimasi waktu dan ketersediaan ya Kak. Terima kasih!`;
    window.open(`https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.nama,
          text: `Lihat ${product.nama} di Toko Buket!`,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 pt-20 sm:pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          
          {/* Breadcrumb */}
          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-mint-dark transition-colors mb-6 text-sm font-semibold group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Katalog
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            
            {/* Product Image */}
            <div className="relative rounded-3xl overflow-hidden bg-pink/20 border border-border/80 shadow-[0_10px_35px_rgba(30,30,36,0.06)] aspect-square">
              <SafeImage
                src={product.foto_url || FALLBACK_BOUQUET_IMG}
                alt={product.nama}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />

              {!isAvailable && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="badge-habis text-base px-5 py-2.5 shadow-lg">Stok Habis</span>
                </div>
              )}

              {product.kategori && (
                <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-text text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-white/60">
                  {product.kategori.nama}
                </span>
              )}

              <button
                onClick={handleShare}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-text shadow-sm hover:bg-mint hover:text-white transition-colors"
                aria-label="Bagikan produk"
                title="Bagikan produk"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-mint-dark mb-1 block">
                  {product.kategori?.nama || 'Koleksi Buket'}
                </span>
                <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-4xl font-extrabold text-text leading-tight mb-3">
                  {product.nama}
                </h1>
                <p className="text-2xl sm:text-3xl font-extrabold text-mint-dark tracking-tight">
                  {formatRupiah(product.harga)}
                </p>
              </div>

              {/* Description */}
              <div className="border-t border-b border-border/80 py-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                  Deskripsi Rangkaian
                </h2>
                <p className="text-text leading-relaxed text-sm sm:text-base whitespace-pre-line">
                  {product.deskripsi || 'Rangkaian buket eksklusif yang dirangkai teliti dengan bahan pilihan terbaik, kartu ucapan gratis, dan packaging rapi.'}
                </p>
              </div>

              {/* Quantity Stepper */}
              {isAvailable && (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-text">Jumlah:</span>
                  <div className="flex items-center bg-canvas rounded-2xl p-1.5 border border-border/80">
                    <button
                      onClick={() => setJumlah((prev) => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center text-text hover:bg-pink/40 transition-colors disabled:opacity-40"
                      disabled={jumlah <= 1}
                      aria-label="Kurangi jumlah"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 text-sm font-bold text-center min-w-[2.5rem]">
                      {jumlah}
                    </span>
                    <button
                      onClick={() => setJumlah((prev) => prev + 1)}
                      className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center text-text hover:bg-mint hover:text-white transition-colors"
                      aria-label="Tambah jumlah"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {isAvailable ? (
                  <>
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e)}
                      className="btn-secondary flex-1 py-4 text-base font-bold touch-target"
                    >
                      <ShoppingBag className="w-5 h-5 text-mint-dark" />
                      <span>{added ? 'Ditambahkan ke Keranjang!' : 'Tambah ke Keranjang'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDirectOrder}
                      className="btn-primary flex-1 py-4 text-base font-bold shadow-lg touch-target"
                    >
                      <span>Pesan Sekarang</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 py-4 text-center rounded-2xl bg-red-50 border border-red-200 text-red-600 font-bold text-sm">
                      Stok Habis — Tidak Bisa Dipesan Langsung
                    </div>
                    <button
                      onClick={handlePreOrder}
                      className="flex-1 py-4 text-base font-bold shadow-lg touch-target rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#075E54] text-white flex items-center justify-center gap-2.5 transition-all active:scale-95"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Pre-Order via WhatsApp</span>
                    </button>
                  </>
                )}
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-border/70 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-mint-dark shrink-0" />
                  <span>100% Produk Berkualitas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-mint-dark shrink-0" />
                  <span>Ambil / Kirim Tepat Waktu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-mint-dark shrink-0" />
                  <span>Gratis Kartu Ucapan</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
