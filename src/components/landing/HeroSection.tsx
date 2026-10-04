'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { Gift, Flower2, MessageCircle, Sparkles, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useLandingContent } from '@/hooks/useLandingContent';
import SafeImage, { FALLBACK_BOUQUET_IMG } from '@/components/ui/SafeImage';

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { content } = useLandingContent();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);

  // Buat list slides dinamis
  const displaySlides = useMemo(() => {
    const raw = [
      {
        image: content.hero_slide1_image,
        alt: content.hero_slide1_badge || 'Buket Bunga Segar',
        badge: content.hero_slide1_badge || '100% Bunga & Bahan Segar',
        subtitle: content.hero_slide1_sub || 'Rangkaian pastel mawar & aster',
      },
      {
        image: content.hero_slide2_image,
        alt: content.hero_slide2_badge || 'Koleksi Romantis',
        badge: content.hero_slide2_badge || 'Koleksi Romantis & Anniversary',
        subtitle: content.hero_slide2_sub || 'Sentuhan elegan peony import',
      },
      {
        image: content.hero_slide3_image,
        alt: content.hero_slide3_badge || 'Spesial Wisuda',
        badge: content.hero_slide3_badge || 'Spesial Momen Wisuda',
        subtitle: content.hero_slide3_sub || 'Lengkap boneka toga & kartu ucapan',
      },
      {
        image: content.hero_slide4_image,
        alt: content.hero_slide4_badge || 'Buket Hadiah Manis',
        badge: content.hero_slide4_badge || 'Buket Snack & Hadiah Manis',
        subtitle: content.hero_slide4_sub || 'Kombinasi Ferrero & cokelat favorit',
      },
    ];

    const valid = raw.filter((s) => s.image && s.image.trim() !== '');
    return valid;
  }, [
    content.hero_slide1_image,
    content.hero_slide1_badge,
    content.hero_slide1_sub,
    content.hero_slide2_image,
    content.hero_slide2_badge,
    content.hero_slide2_sub,
    content.hero_slide3_image,
    content.hero_slide3_badge,
    content.hero_slide3_sub,
    content.hero_slide4_image,
    content.hero_slide4_badge,
    content.hero_slide4_sub,
  ]);

  // Robust Auto Slide Timer (berjalan otomatis setiap 3.5 detik)
  useEffect(() => {
    if (displaySlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [displaySlides.length]);

  // Modern Intersection Observer
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
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const targets = section.querySelectorAll('.reveal, .slide-in-left');
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 40) nextSlide();
    if (diff < -40) prevSlide();
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-20 lg:pb-24"
      aria-label="Hero"
    >
      {/* Dynamic ambient background blobs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-pink/20 rounded-full blur-3xl pointer-events-none -z-10 animate-[pulse_6s_ease-in-out_infinite]" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-mint/15 rounded-full blur-3xl pointer-events-none -z-10 animate-[pulse_8s_ease-in-out_infinite]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Text content (Col 7 on desktop) */}
          <div className="order-2 lg:order-1 lg:col-span-7">
            
            {/* Pill tag */}
            <div className="reveal">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink/40 border border-pink-border/40 text-text text-xs font-semibold tracking-wide mb-6">
                <Sparkles className="w-3.5 h-3.5 text-mint animate-[spin_8s_linear_infinite]" />
                {content.hero_tag}
              </span>
            </div>

            {/* Headline with modern responsive typography */}
            <h1 className="slide-in-left font-[family-name:var(--font-heading)] text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-text leading-[1.15] mb-6 tracking-tight">
              {content.hero_judul}{' '}
              <span className="relative inline-block text-mint-dark">
                {content.hero_highlight}
                <svg
                  className="absolute left-0 -bottom-2 w-full h-3 text-mint opacity-40"
                  viewBox="0 0 100 12"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path d="M0 8 Q 50 0, 100 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="slide-in-left text-text-secondary text-sm sm:text-base lg:text-lg leading-relaxed mb-8 max-w-xl">
              {content.hero_deskripsi}
            </p>

            {/* CTA Group with modern magnetic feel */}
            <div className="reveal flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10">
              <Link
                href="/katalog"
                className="btn-primary text-center group py-3.5 sm:py-4 px-6 sm:px-8 text-sm sm:text-base touch-target w-full sm:w-auto"
              >
                <span>Lihat Katalog Produk</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/#tentang"
                className="btn-secondary text-center py-3.5 sm:py-4 px-6 sm:px-8 text-sm sm:text-base touch-target w-full sm:w-auto"
              >
                Kenali Toko Kami
              </Link>
            </div>

            {/* Trust points */}
            <div className="reveal flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-6 lg:gap-8 pt-4 border-t border-border/80 text-text-secondary text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <Flower2 className="w-4 h-4 sm:w-5 sm:h-5 text-mint-dark shrink-0" />
                <span>Bunga & Bahan Segar Pilihan</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-pink shrink-0" />
                <span>Bisa Custom Desain & Pesan</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-mint shrink-0" />
                <span>Konsultasi Cepat via WhatsApp</span>
              </div>
            </div>

          </div>

          {/* Interactive Cinema Carousel (Col 5 on desktop) */}
          <div className="order-1 lg:order-2 lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
            <div
              className="relative group"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Layered ambient glow backdrop */}
              <div className="absolute -inset-3 bg-gradient-to-tr from-pink via-mint/30 to-pink/40 rounded-[2rem] sm:rounded-[2.5rem] blur-2xl opacity-40 transition-opacity duration-700 group-hover:opacity-60 -z-10" />

              {/* Main frame container */}
              <div className="relative overflow-hidden rounded-3xl sm:rounded-[2rem] bg-white border border-white/80 shadow-[0_20px_50px_-15px_rgba(30,30,36,0.15)] aspect-[3/3.5] sm:aspect-[4/3.2]">
                {displaySlides.length === 0 ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-pink/30 via-canvas to-mint/20 p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                      <Flower2 className="w-8 h-8 text-mint-dark" />
                    </div>
                    <p className="font-bold text-sm text-text">Slide Hero Toko Buket</p>
                    <p className="text-xs text-text-secondary mt-1 max-w-xs">
                      Foto slide hero belum ditambahkan atau telah dihapus di Admin Panel.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Cross-fade cinema slides */}
                    {displaySlides.map((slide, index) => {
                      const isActive = index === currentSlide;
                      return (
                        <div
                          key={slide.badge + index}
                          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                            isActive
                              ? 'opacity-100 z-10'
                              : 'opacity-0 pointer-events-none z-0'
                          }`}
                        >
                          <SafeImage
                            src={slide.image}
                            alt={slide.alt}
                            className={`w-full h-full object-cover object-center transition-transform duration-[4000ms] ease-out ${
                              isActive ? 'scale-105' : 'scale-100'
                            }`}
                            loading={index === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                          />

                          {/* Vignette depth gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                          {/* Animated Floating Glass Card on Slide */}
                          <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 z-20">
                            <div className="glass-card px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl flex items-center justify-between gap-3 shadow-lg border border-white/60">
                              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-mint-dark" />
                                </span>
                                <div className="min-w-0">
                                  <p className="text-xs sm:text-sm font-bold text-text truncate">{slide.badge}</p>
                                  <p className="text-[10px] sm:text-[11px] text-text-secondary truncate">{slide.subtitle}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Next / Prev Floating Arrow Controls */}
                    {displaySlides.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={prevSlide}
                          aria-label="Slide sebelumnya"
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-md text-text shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-mint hover:text-white hover:scale-110 active:scale-95"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={nextSlide}
                          aria-label="Slide selanjutnya"
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-md text-text shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-mint hover:text-white hover:scale-110 active:scale-95"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Progress bar pagination indicator at top */}
                        <div className="absolute top-3 inset-x-3 sm:top-4 sm:inset-x-4 z-30 flex gap-1.5">
                          {displaySlides.map((_, dotIdx) => (
                            <button
                              type="button"
                              key={dotIdx}
                              onClick={() => setCurrentSlide(dotIdx)}
                              aria-label={`Ke slide ${dotIdx + 1}`}
                              className="h-1 sm:h-1.5 flex-1 rounded-full bg-white/40 overflow-hidden cursor-pointer backdrop-blur-sm p-0 border-0"
                            >
                              <div
                                className={`h-full bg-mint transition-all duration-500 rounded-full ${
                                  dotIdx === currentSlide ? 'w-full' : dotIdx < currentSlide ? 'w-full bg-white/80' : 'w-0'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
