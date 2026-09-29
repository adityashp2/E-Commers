'use client';

import { useEffect, useRef } from 'react';
import { MapPin, Clock, Navigation, ExternalLink } from 'lucide-react';
import { useLandingContent } from '@/hooks/useLandingContent';
import { WhatsAppIcon, InstagramIcon } from '@/components/ui/BrandIcons';

export default function KontakSection() {
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
      { threshold: 0.15 }
    );

    const targets = section.querySelectorAll(
      '.slide-in-left, .slide-in-right, .stagger-reveal, .reveal'
    );
    targets?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const cleanWaNumber = content.kontak_wa.replace(/\D/g, '');
  const waUrl = cleanWaNumber.startsWith('62')
    ? `https://wa.me/${cleanWaNumber}`
    : cleanWaNumber.startsWith('0')
    ? `https://wa.me/62${cleanWaNumber.substring(1)}`
    : `https://wa.me/62${cleanWaNumber}`;

  const igHandle = content.kontak_instagram.replace(/^@/, '');
  const igUrl = `https://instagram.com/${igHandle}`;

  const mapsDirectUrl =
    content.kontak_maps_url ||
    `https://maps.google.com/?q=${encodeURIComponent(content.kontak_alamat || 'Aysflower Florist Lampung')}`;

  return (
    <section
      ref={sectionRef}
      id="kontak"
      className="py-16 sm:py-24 bg-gradient-to-b from-white via-canvas to-pink/20 scroll-mt-20"
      aria-labelledby="kontak-heading"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-12 reveal">
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-pink/40 border border-pink-border/40 text-text text-xs font-semibold uppercase tracking-wider mb-3">
            {content.kontak_tag || 'Ada Pertanyaan?'}
          </span>
          <h2 id="kontak-heading" className="section-title">
            {content.kontak_judul || 'Hubungi & Kunjungi Kami'}
          </h2>
          <p className="section-subtitle mx-auto">
            {content.kontak_deskripsi ||
              'Konsultasi buket impian atau ambil langsung pesanan Anda di workshop kami.'}
          </p>
        </div>

        {/* Info Cards Grid Tanpa Iframe Maps */}
        <div className="space-y-5 slide-in-left">
          {/* Main Info Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-9 shadow-[0_8px_30px_rgba(30,30,36,0.05)] border border-border/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Lokasi Workshop */}
              <div className="flex items-start gap-4">
                <span className="shrink-0 w-12 h-12 bg-pink/40 rounded-2xl flex items-center justify-center text-text shadow-xs">
                  <MapPin className="w-5 h-5 text-mint-dark" aria-hidden="true" />
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text text-base mb-1">
                    Lokasi Workshop & Toko
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed mb-4">
                    {content.kontak_alamat}
                  </p>
                  <a
                    href={mapsDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-mint-light hover:bg-mint/40 text-mint-dark text-xs font-bold transition-all border border-mint/40 shadow-xs"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Buka Rute di Google Maps</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </div>
              </div>

              {/* Jam Operasional */}
              <div className="flex items-start gap-4 border-t md:border-t-0 md:border-l border-border/60 pt-6 md:pt-0 md:pl-8">
                <span className="shrink-0 w-12 h-12 bg-mint-light rounded-2xl flex items-center justify-center text-mint-dark shadow-xs">
                  <Clock className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-bold text-text text-base mb-1">
                    Jam Operasional
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed mb-2">
                    {content.kontak_jam}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs text-mint-dark font-semibold">
                    <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                    Buka untuk Pesanan Custom & Siap Kirim
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Direct WhatsApp & Instagram Quick Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-2xl p-5 flex items-center gap-4 transition-all group shadow-xs"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <WhatsAppIcon className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-secondary font-medium">Chat Customer Service</p>
                <p className="text-base font-bold text-text truncate">{content.kontak_wa}</p>
              </div>
            </a>

            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-pink/30 hover:bg-pink/50 border border-pink-border/40 rounded-2xl p-5 flex items-center gap-4 transition-all group shadow-xs"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <InstagramIcon className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-secondary font-medium">Instagram Resmi</p>
                <p className="text-base font-bold text-text truncate">{content.kontak_instagram}</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
