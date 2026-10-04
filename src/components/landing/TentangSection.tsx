'use client';

import { useEffect, useRef } from 'react';
import { Palette, Heart, Flower2 } from 'lucide-react';
import { useLandingContent } from '@/hooks/useLandingContent';
import SafeImage from '@/components/ui/SafeImage';

export default function TentangSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { content } = useLandingContent();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    const targets = section.querySelectorAll(
      '.slide-in-left, .slide-in-right, .stagger-reveal'
    );
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="tentang"
      className="py-20 sm:py-28 bg-gradient-to-b from-canvas via-pink-soft/60 to-canvas scroll-mt-20"
      aria-labelledby="tentang-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* Image side */}
          <div className="slide-in-left">
            <div className="aspect-[4/5] sm:aspect-[3/4] rounded-2xl overflow-hidden relative shadow-lg border-4 border-white bg-white">
              {content.tentang_foto && content.tentang_foto.trim() !== '' ? (
                <SafeImage
                  src={content.tentang_foto}
                  alt="Perangkai buket sedang menyusun rangkaian bunga segar"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-pink/30 to-mint/20 text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                    <Flower2 className="w-8 h-8 text-mint-dark" />
                  </div>
                  <p className="font-bold text-sm text-text">Workshop Buket Kami</p>
                  <p className="text-xs text-text-secondary mt-1 max-w-xs">
                    Setiap rangkaian buket dirangkai khusus dengan dedikasi dan cinta untuk momen istimewa Anda.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Text side */}
          <div>
            <div className="slide-in-right">
              <span className="inline-block px-3 py-1 rounded-full bg-pink/40 text-charcoal text-xs font-semibold uppercase tracking-wider mb-3">
                {content.tentang_tag}
              </span>
              <h2
                id="tentang-heading"
                className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-text mb-6"
              >
                {content.tentang_judul}
              </h2>
            </div>

            <div
              className="slide-in-right"
              style={{ '--reveal-delay': '80ms' } as React.CSSProperties}
            >
              <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-4">
                {content.tentang_p1}
              </p>
              <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-8">
                {content.tentang_p2}
              </p>
            </div>

            {/* Feature points */}
            <div className="stagger-reveal grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className="stagger-item flex items-start gap-3.5 bg-white p-4 rounded-xl shadow-xs border border-border/60"
                style={{ '--stagger-index': 0 } as React.CSSProperties}
              >
                <span className="shrink-0 w-10 h-10 bg-pink/40 rounded-lg flex items-center justify-center">
                  <Palette className="w-5 h-5 text-mint" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold text-text text-sm">
                    Kustomisasi Bebas
                  </h3>
                  <p className="text-text-secondary text-xs mt-0.5">
                    Bebas pilih tema warna, wrap, & jenis isian
                  </p>
                </div>
              </div>

              <div
                className="stagger-item flex items-start gap-3.5 bg-white p-4 rounded-xl shadow-xs border border-border/60"
                style={{ '--stagger-index': 1 } as React.CSSProperties}
              >
                <span className="shrink-0 w-10 h-10 bg-pink/40 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-mint" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold text-text text-sm">
                    Dibuat dengan Hati
                  </h3>
                  <p className="text-text-secondary text-xs mt-0.5">
                    Setiap rangkaian dirangkai rapi & penuh ketelitian
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
