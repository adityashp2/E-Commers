'use client';

import Link from 'next/link';
import { MapPin, Clock, ArrowUpRight, Heart } from 'lucide-react';
import { useSettings } from '@/lib/store';
import { WhatsAppIcon, InstagramIcon } from '@/components/ui/BrandIcons';

const links = [
  { href: '/', label: 'Beranda' },
  { href: '/katalog', label: 'Katalog' },
  { href: '/#tentang', label: 'Tentang' },
  { href: '/#galeri', label: 'Galeri' },
  { href: '/#kontak', label: 'Kontak' },
] as const;

export default function Footer() {
  const { settings } = useSettings();

  const cleanWaNumber = settings.wa_number.replace(/\D/g, '');
  const waUrl = cleanWaNumber.startsWith('62')
    ? `https://wa.me/${cleanWaNumber}`
    : cleanWaNumber.startsWith('0')
    ? `https://wa.me/62${cleanWaNumber.substring(1)}`
    : `https://wa.me/62${cleanWaNumber}`;

  const igHandle = (settings.instagram || '@toko.buket').replace(/^@/, '');
  const igUrl = `https://instagram.com/${igHandle}`;

  return (
    <footer className="bg-text text-white mt-auto pb-24 md:pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-4">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand & Bio */}
          <div className="md:col-span-5 space-y-3.5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-white hover:text-mint transition-colors"
            >
              <span>Toko Buket</span>
              <span className="w-2 h-2 rounded-full bg-mint" />
            </Link>
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed max-w-sm">
              Rangkaian buket bunga segar & kado wisuda/ulang tahun custom berkualitas premium dengan pengerjaan rapi dan pengiriman aman.
            </p>
            
            {/* Quick Action Badges for Mobile */}
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#25D366]/20 hover:bg-[#25D366] text-white hover:text-white transition-all text-xs font-semibold border border-[#25D366]/40"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366] group-hover:text-white" />
                WhatsApp CS
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-pink/20 hover:bg-pink text-white hover:text-text transition-all text-xs font-semibold border border-pink/40"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-pink-light group-hover:text-text" />
                @{igHandle}
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>

          {/* Navigasi Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-mint-light">
              Navigasi Halaman
            </h4>
            <ul className="grid grid-cols-2 md:grid-cols-1 gap-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-mint transition-colors text-xs sm:text-sm inline-flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Operasional & Lokasi */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink">
              Workshop & Jam Buka
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-white/75">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-mint shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {settings.alamat_pengambilan || 'Jl. Pemuda No. 45, Menteng, Jakarta Pusat'}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-pink shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {settings.jam_operasional || 'Senin – Sabtu, 09:00 – 18:00'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-white/50 text-[11px] sm:text-xs">
            &copy; {new Date().getFullYear()} Toko Buket. Rangkaian bunga penuh cinta.
          </p>
          <p className="text-white/40 text-[11px] flex items-center justify-center gap-1">
            Made with <Heart className="w-3 h-3 text-pink fill-pink" /> for your special moments
          </p>
        </div>
      </div>
    </footer>
  );
}
