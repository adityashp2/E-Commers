'use client';

import Link from 'next/link';
import { Produk } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { Plus } from 'lucide-react';
import SafeImage, { FALLBACK_BOUQUET_IMG } from '@/components/ui/SafeImage';

interface ProductCardProps {
  product: Produk;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const isAvailable = product.status === 'tersedia';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAvailable) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      window.dispatchEvent(
        new CustomEvent('fly-to-cart', {
          detail: {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          },
        })
      );
      addItem(product, 1);
    }
  };

  return (
    <Link
      href={`/produk/${product.slug}`}
      className="group block rounded-2xl overflow-hidden bg-white border border-border/80 shadow-[0_2px_10px_rgba(30,30,36,0.03)] hover:border-pink-border/60 hover:shadow-[0_16px_36px_-8px_rgba(255,182,201,0.35)] hover:-translate-y-1.5 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
    >
      {/* Image container with SafeImage fallback */}
      <div className="aspect-square relative overflow-hidden bg-pink/20">
        <SafeImage
          src={product.foto_url || FALLBACK_BOUQUET_IMG}
          alt={product.nama}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          loading="lazy"
          decoding="async"
        />

        {/* Status badge */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="badge-habis text-xs px-3 py-1.5 shadow">Habis</span>
          </div>
        )}

        {/* Floating Category Pill */}
        {product.kategori && (
          <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md text-text text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-white/50">
            {product.kategori.nama}
          </span>
        )}

        {/* Quick add button with spring hover feedback */}
        {isAvailable && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2.5 right-2.5 bg-white text-text shadow-md hover:bg-mint hover:text-white rounded-xl p-2.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 active:scale-95 flex items-center justify-center"
            aria-label={`Tambah ${product.nama} ke keranjang`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Product Information */}
      <div className="p-3.5 sm:p-4">
        <h3 className="font-semibold text-text text-sm sm:text-[0.9375rem] mb-1.5 group-hover:text-mint-dark transition-colors line-clamp-2 leading-snug">
          {product.nama}
        </h3>
        <p className="text-mint-dark font-extrabold text-base sm:text-lg tracking-tight">
          {formatRupiah(product.harga)}
        </p>
      </div>
    </Link>
  );
}
