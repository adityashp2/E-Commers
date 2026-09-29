'use client';

import { useState, useEffect, useRef } from 'react';
import { Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Ulasan, MOCK_ULASAN } from '@/lib/mockReviews';

const STORAGE_KEY = 'toko_buket_customer_reviews';

export default function ReviewSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [reviews, setReviews] = useState<Ulasan[]>(MOCK_ULASAN);
  const [isPaused, setIsPaused] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Load reviews from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviews([...parsed, ...MOCK_ULASAN]);
        }
      }
    } catch {}
  }, []);

  // Intersection observer for animation
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
      '.reveal, .stagger-reveal, .slide-in-left, .slide-in-right'
    );
    targets?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [reviews]);

  // Robust Auto-Slideshow timer using functional state
  useEffect(() => {
    if (isPaused || reviews.length <= 1) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % reviews.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused, reviews.length]);

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const avgRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  return (
    <section
      ref={sectionRef}
      id="ulasan"
      className="py-16 sm:py-20 bg-white/70 border-t border-border/60 scroll-mt-20 overflow-hidden"
      aria-labelledby="ulasan-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title & Average Rating */}
        <div className="text-center max-w-2xl mx-auto mb-10 reveal">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-pink/40 border border-pink-border/40 text-text text-xs font-bold uppercase tracking-wider mb-3">
            <Heart className="w-3.5 h-3.5 text-mint-dark fill-current" />
            Kepuasan Pelanggan
          </span>
          <h2 id="ulasan-heading" className="section-title">
            Rating & Komentar Pembeli
          </h2>
          <p className="section-subtitle mx-auto mb-5">
            Cerita asli dari mereka yang telah mempercayakan momen berharganya bersama Toko Buket.
          </p>

          {/* Average rating summary badge */}
          <div className="inline-flex items-center gap-3 bg-canvas px-5 py-2 rounded-2xl border border-border/80 shadow-xs">
            <div className="flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ))}
            </div>
            <span className="font-extrabold text-base sm:text-lg text-text">{avgRating} / 5.0</span>
            <span className="text-xs text-text-secondary font-medium">
              ({reviews.length} Ulasan Terverifikasi)
            </span>
          </div>
        </div>

        {/* SINGLE ROW AUTOMATIC SLIDESHOW CAROUSEL */}
        <div
          className="reveal"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-mint animate-pulse" />
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Ulasan Pelanggan Terverifikasi (Slide Otomatis)
              </span>
            </div>

            {/* Slider Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Ulasan sebelumnya"
                className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center text-text hover:bg-mint hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Ulasan selanjutnya"
                className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center text-text hover:bg-mint hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Carousel Viewport (Single Row) */}
          <div className="relative overflow-hidden rounded-3xl">
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform: `translateX(-${activeSlide * 100}%)`,
              }}
            >
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="w-full shrink-0 px-1 sm:px-2"
                >
                  <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(30,30,36,0.04)] border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-pink/40 border border-pink-border/50 flex items-center justify-center font-bold text-text text-base shrink-0">
                          {rev.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-text leading-tight">{rev.nama}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {rev.buket_terpilih && (
                              <span className="text-[11px] font-bold text-mint-dark bg-mint-light px-2.5 py-0.5 rounded-full">
                                {rev.buket_terpilih}
                              </span>
                            )}
                            <span className="text-[11px] text-text-secondary">• {rev.tanggal}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-text-secondary text-sm sm:text-base leading-relaxed italic">
                        &ldquo;{rev.komentar}&rdquo;
                      </p>
                    </div>

                    {/* Star Badge */}
                    <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-border/60 pt-3 md:pt-0 md:pl-6 gap-2">
                      <div className="flex items-center text-amber-400 gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= rev.rating ? 'fill-current text-amber-400' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-text bg-canvas px-2.5 py-1 rounded-lg border border-border/60">
                        {rev.rating}.0 / 5.0 Bintang
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlide(idx)}
                aria-label={`Slide ulasan ke-${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeSlide ? 'w-6 bg-mint' : 'w-2 bg-border hover:bg-text-secondary'
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
