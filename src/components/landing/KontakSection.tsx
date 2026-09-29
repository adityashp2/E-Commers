'use client';

import { useEffect, useRef } from 'react';
import { MapPin, Clock, Navigation, ExternalLink } from 'lucide-react';
import { useLandingContent } from '@/hooks/useLandingContent';
import { WhatsAppIcon, InstagramIcon } from '@/components/ui/BrandIcons';

export default function KontakSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { content } = useLandingContent();

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

  // Safe Google Maps Embed URL parser
  const normalizeMapsEmbed = (input?: string) => {
    const defaultAysflowerEmbed = 'https://maps.google.com/maps?q=Aysflower+Florist+Toko+Bunga+Lampung&t=&z=16&ie=UTF8&iwloc=&output=embed';

    if (!input || !input.trim()) {
      return defaultAysflowerEmbed;
    }

    let str = input.trim();

    // 1. Jika user paste tag lengkap <iframe src="...">
    const srcMatch = str.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      str = srcMatch[1];
    }

    // 2. Jika link bawaan lama Jakarta yang rusak/default
    if (str.includes('4v1700000000000') || str.includes('0x2e69f3e800000001%3A0x6b402804b4d6')) {
      return defaultAysflowerEmbed;
    }

    // 3. Jika sudah link embed resmi
    if (str.includes('google.com/maps/embed') || str.includes('output=embed')) {
      return str;
    }

    // 4. Jika user memasukkan link maps biasa (maps.google.com atau goo.gl / place)
    try {
      if (str.startsWith('http')) {
        const url = new URL(str);
        const q = url.searchParams.get('q');
        if (q) {
          return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
        }

        const placeMatch = url.pathname.match(/\/place\/([^/@]+)/);
        if (placeMatch && placeMatch[1]) {
          const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
          return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
        }
      }
    } catch {}

    // 5. Fallback jika user memasukkan teks nama tempat / alamat biasa
    return `https://maps.google.com/maps?q=${encodeURIComponent(str)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  };

  const mapsEmbedSrc = normalizeMapsEmbed(content.kontak_maps_embed || content.kontak_alamat);

  const mapsDirectUrl = content.kontak_maps_url || 'https://maps.google.com/?q=Jakarta';

  return (
    <section
      ref={sectionRef}
      id="kontak"
      className="py-16 sm:py-24 bg-gradient-to-b from-white via-canvas to-pink/20 scroll-mt-20"
      aria-labelledby="kontak-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-14 reveal">
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-pink/40 border border-pink-border/40 text-text text-xs font-semibold uppercase tracking-wider mb-3">
            {content.kontak_tag}
          </span>
          <h2 id="kontak-heading" className="section-title">
            {content.kontak_judul}
          </h2>
          <p className="section-subtitle mx-auto">
            {content.kontak_deskripsi}
          </p>
        </div>

        {/* 2 Column Layout: Details on Left (Col 5), Interactive Google Maps on Right (Col 7) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Info cards (Col 5) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4 slide-in-left">
            
            {/* Address Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(30,30,36,0.04)] border border-border/80 flex-1">
              <div className="flex items-start gap-4">
                <span className="shrink-0 w-12 h-12 bg-pink/40 rounded-2xl flex items-center justify-center text-text">
                  <MapPin className="w-5 h-5 text-mint-dark" aria-hidden="true" />
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text text-base mb-1">
                    Lokasi Workshop & Toko
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed mb-3">
                    {content.kontak_alamat}
                  </p>
                  <a
                    href={mapsDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-mint-dark hover:text-mint transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Petunjuk Arah (Google Maps)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="my-5 border-t border-border/60" />

              {/* Operational Hours */}
              <div className="flex items-start gap-4">
                <span className="shrink-0 w-12 h-12 bg-mint-light rounded-2xl flex items-center justify-center text-mint-dark">
                  <Clock className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-bold text-text text-base mb-1">
                    Jam Operasional
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {content.kontak_jam}
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/25 rounded-2xl p-4 flex items-center gap-3 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <WhatsAppIcon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-text-secondary font-medium">Chat WhatsApp</p>
                  <p className="text-sm font-bold text-text truncate">{content.kontak_wa}</p>
                </div>
              </a>

              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pink/30 hover:bg-pink/50 border border-pink-border/40 rounded-2xl p-4 flex items-center gap-3 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <InstagramIcon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-text-secondary font-medium">Instagram</p>
                  <p className="text-sm font-bold text-text truncate">{content.kontak_instagram}</p>
                </div>
              </a>
            </div>

          </div>

          {/* Interactive Google Maps Frame (Col 7) */}
          <div className="lg:col-span-7 slide-in-right">
            <div className="relative rounded-3xl overflow-hidden bg-white border border-border/80 shadow-[0_10px_30px_rgba(30,30,36,0.06)] min-h-[380px] h-full w-full">
              <iframe
                title="Peta Lokasi Toko Buket"
                src={mapsEmbedSrc}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '380px' }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full absolute inset-0"
              />

              {/* Floating map address overlay badge (di pojok kanan bawah agar tidak bertumpuk kontrol iframe Google Maps) */}
              <a
                href={mapsDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 bg-white/95 hover:bg-white backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-border/80 flex items-center gap-2.5 z-10 transition-transform hover:scale-105 active:scale-95 group"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-mint animate-pulse shrink-0" />
                <span className="text-xs font-bold text-text group-hover:text-mint-dark transition-colors">
                  Buka di Google Maps
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-text-secondary group-hover:text-mint-dark" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
