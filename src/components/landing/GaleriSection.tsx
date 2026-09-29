'use client';

import { useEffect, useRef } from 'react';
import { useLandingContent } from '@/hooks/useLandingContent';
import SafeImage from '@/components/ui/SafeImage';

export default function GaleriSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { content } = useLandingContent();

  const allItems = [
    {
      src: content.galeri_item1_img,
      alt: content.galeri_item1_label,
      label: content.galeri_item1_label,
      tag: content.galeri_item1_tag,
    },
    {
      src: content.galeri_item2_img,
      alt: content.galeri_item2_label,
      label: content.galeri_item2_label,
      tag: content.galeri_item2_tag,
    },
    {
      src: content.galeri_item3_img,
      alt: content.galeri_item3_label,
      label: content.galeri_item3_label,
      tag: content.galeri_item3_tag,
    },
    {
      src: content.galeri_item4_img,
      alt: content.galeri_item4_label,
      label: content.galeri_item4_label,
      tag: content.galeri_item4_tag,
    },
    {
      src: content.galeri_item5_img,
      alt: content.galeri_item5_label,
      label: content.galeri_item5_label,
      tag: content.galeri_item5_tag,
    },
    {
      src: content.galeri_item6_img,
      alt: content.galeri_item6_label,
      label: content.galeri_item6_label,
      tag: content.galeri_item6_tag,
    },
  ];

  // Only display items that have an active photo and title (excludes items deleted by admin)
  const galleryItems = allItems.filter(
    (item) => item.src && item.src.trim() !== '' && item.label && item.label.trim() !== ''
  );

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
      { threshold: 0.15 }
    );

    const revealTargets = section.querySelectorAll('.reveal, .stagger-reveal');
    revealTargets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [galleryItems.length]);

  if (galleryItems.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="galeri"
      className="py-16 sm:py-24 bg-canvas"
      aria-labelledby="galeri-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14 reveal">
          <span className="text-xs font-bold uppercase tracking-wider text-mint-dark">
            {content.galeri_tag}
          </span>
          <h2 id="galeri-heading" className="section-title mt-1.5">
            {content.galeri_judul}
          </h2>
          <p className="text-text-secondary text-base leading-relaxed">
            {content.galeri_deskripsi}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5 stagger-reveal">
          {galleryItems.map((item, index) => (
            <div
              key={item.label + index}
              className={`stagger-item group relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer bg-pink/20 border border-white/60 shadow-[0_4px_20px_rgba(30,30,36,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(0,196,159,0.25)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                index === 0 && galleryItems.length >= 3
                  ? 'row-span-1 aspect-[3/4] md:row-span-2 md:aspect-auto'
                  : 'aspect-square'
              }`}
              style={{ '--stagger-index': index } as React.CSSProperties}
            >
              <SafeImage
                src={item.src}
                alt={item.alt}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-108"
              />

              {/* Dynamic ambient hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-40 group-hover:opacity-80 transition-opacity duration-300" />

              {/* Tag pill at top right */}
              {item.tag && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                  <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] sm:text-xs font-bold text-text shadow-sm opacity-90 group-hover:opacity-100 transition-opacity">
                    {item.tag}
                  </span>
                </div>
              )}

              {/* Slide-up caption label */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-sm sm:text-base font-bold tracking-tight">
                  {item.label}
                </p>
                <p className="text-white/80 text-[11px] sm:text-xs mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Lihat detail produk &rarr;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
