'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Flower2, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/katalog/ProductCard';
import { useLandingContent } from '@/hooks/useLandingContent';
import { useProducts } from '@/lib/store';

export default function ProdukUnggulanSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { content } = useLandingContent();
  const { products, isLoading } = useProducts();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const targets = sectionRef.current?.querySelectorAll(
      '.reveal, .stagger-reveal'
    );
    targets?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isLoading, products]);

  // Take top 4 available products
  const featured = products.filter((p) => p.status === 'tersedia').slice(0, 4);

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-24 bg-white/60 border-y border-border/60"
      aria-labelledby="unggulan-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with dynamic text from admin */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 reveal">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-mint-dark">
              {content.unggulan_tag}
            </span>
            <h2 id="unggulan-heading" className="section-title mt-1.5">
              {content.unggulan_judul}
            </h2>
            <p className="text-text-secondary text-base leading-relaxed">
              {content.unggulan_deskripsi}
            </p>
          </div>
          <Link
            href="/katalog"
            className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-mint-dark hover:text-mint transition-colors group"
          >
            <span>Lihat Semua Katalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Dynamic staggered product grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-3 sm:p-4">
                <div className="skeleton aspect-square mb-3" />
                <div className="skeleton h-5 w-3/4 mb-2" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 stagger-reveal">
            {featured.map((product, index) => (
              <div
                key={product.id}
                className="stagger-item"
                style={{ '--stagger-index': index } as React.CSSProperties}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 reveal">
            <Flower2
              className="w-14 h-14 text-mint/30 mx-auto mb-4"
              strokeWidth={1.2}
            />
            <p className="text-text-secondary">
              Produk akan segera hadir. Nantikan ya!
            </p>
          </div>
        )}

        <div className="mt-10 text-center md:hidden reveal">
          <Link href="/katalog" className="btn-secondary w-full py-3.5">
            Lihat Semua Produk
          </Link>
        </div>
      </div>
    </section>
  );
}
