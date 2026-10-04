'use client';

import Link from 'next/link';
import { Produk } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { Plus, Flower2 } from 'lucide-react';
import SafeImage from '@/components/ui/SafeImage';

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
      {/* Image container */}
      <div className="aspect-square relative overflow-hidden bg-pink/20">
        {product.foto_url && product.foto_url.trim() !== '' ? (
          <SafeImage
            src={product.foto_url}
            alt={product.nama}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-pink/20 text-mint-dark/50">
            <Flower2 className="w-8 h-8 opacity-40 mb-1" />
            <span className="text-[10px] font-semibold text-text-secondary">Foto belum ada</span>
          </div>
        )}

        {/* Status badge */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="badge-habis text-xs px-3 py-1.5 shadow">Habis</span>
          </div>
        )}

        {/* Floating Category Pill */}
        {product.kategori && (
          <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-white/95 backdrop-blur-md text-text text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs border border-white/60 max-w-[calc(100%-16px)] truncate pointer-events-none">
            {product.kategori.nama}
          </span>
        )}

        {/* Quick add button with spring hover feedback */}
        {isAvailable && (
          <button
            type="button"
            onClick={handleAddToCart}
            className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 bg-white text-text shadow-md hover:bg-mint hover:text-white rounded-xl p-2 sm:p-2.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 active:scale-95 flex items-center justify-center z-10"
            aria-label={`Tambah ${product.nama} ke keranjang`}
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Product Information */}
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-text text-xs sm:text-[0.9375rem] mb-1 group-hover:text-mint-dark transition-colors line-clamp-2 leading-snug">
          {product.nama}
        </h3>
        <p className="text-mint-dark font-extrabold text-sm sm:text-lg tracking-tight">
          {formatRupiah(product.harga)}
        </p>
      </div>
    </Link>
  );
}
