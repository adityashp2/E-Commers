'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { formatRupiah, formatTanggal } from '@/lib/utils';
import { buildWhatsAppMessage, getWhatsAppUrl } from '@/lib/whatsapp';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import ReviewModal from '@/components/ui/ReviewModal';
import {
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  ShoppingBag,
  ArrowLeft,
  Calendar,
  User,
  FileText,
  ShieldCheck,
  Sparkles,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/lib/store';

export default function KeranjangPage() {
  const { items, removeItem, updateJumlah, totalHarga } = useCart();
  const { settings } = useSettings();

  const [nama, setNama] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [catatan, setCatatan] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isClient, setIsClient] = useState(false);

  const waNumber = settings.wa_number || '085161204930';
  const defaultMinDays = parseInt(settings.min_hari_pesan) || 1;
  const hasPoItem = items.some((item) => item.produk.status === 'po');
  const minDays = hasPoItem ? Math.max(defaultMinDays, 7) : defaultMinDays;

  // Popup Modal State after checkout
  const [showReviewModal, setShowReviewModal] = useState(false);

  const getMinDate = useCallback((days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  useEffect(() => {
    setIsClient(true);
    // Auto-fill initial valid date if empty
    setTanggal((prev) => (prev ? prev : getMinDate(minDays)));
  }, [minDays, getMinDate]);

  // Keep selected date valid if cart contents change to require PO minimum days
  useEffect(() => {
    if (tanggal) {
      const minDate = getMinDate(minDays);
      if (tanggal < minDate) {
        setTanggal(minDate);
      }
    }
  }, [minDays, tanggal, getMinDate]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!nama.trim()) {
      errs.nama = 'Nama lengkap pemesan wajib diisi';
      setTimeout(() => {
        const el = document.getElementById('nama');
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }

    const minDate = getMinDate(minDays);
    const effectiveTanggal = tanggal || minDate;

    if (!tanggal) {
      setTanggal(minDate);
    } else if (effectiveTanggal < minDate) {
      errs.tanggal = hasPoItem
        ? `Pesanan Pre-Order minimal H-7 hari (mulai ${formatTanggal(minDate)})`
        : `Pemesanan minimal H+${minDays} (${formatTanggal(minDate)})`;
      setTimeout(() => {
        const el = document.getElementById('tanggal');
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }

    if (items.length === 0) {
      errs.cart = 'Keranjang Anda masih kosong. Silakan pilih buket terlebih dahulu.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCheckout = () => {
    if (!validate()) return;

    const effectiveTanggal = tanggal || getMinDate(minDays);

    const message = buildWhatsAppMessage({
      items,
      nama: nama.trim(),
      tanggal: effectiveTanggal,
      catatan: catatan.trim(),
    });

    const url = getWhatsAppUrl(waNumber, message);

    // Reliable opening mechanism: anchor click bypasses browser popup blockers
    try {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // Direct navigation fallback if element click fails
      window.location.href = url;
    }

    // Trigger review pop-up modal
    setTimeout(() => {
      setShowReviewModal(true);
    }, 1000);
  };

  const buketName = items.length > 0 ? items[0].produk.nama : 'Buket Bunga Segar';

  if (!isClient) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="skeleton h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="skeleton h-28 w-full rounded-2xl" />
                ))}
              </div>
              <div className="lg:col-span-5">
                <div className="skeleton h-96 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-20 sm:pt-24 pb-20 bg-canvas min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          
          {/* Breadcrumb & Title */}
          <div className="mb-8">
            <Link
              href="/katalog"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-mint-dark transition-colors mb-3 text-sm font-semibold group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Lanjut Pilih Buket Lain
            </Link>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-4xl font-extrabold text-text">
                  Keranjang Belanja
                </h1>
                <p className="text-text-secondary text-sm mt-1">
                  Periksa pilihan buket Anda dan lengkapi detail pesanan untuk checkout WhatsApp
                </p>
              </div>
              {items.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-mint-light text-mint-dark text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  {items.reduce((acc, it) => acc + it.jumlah, 0)} Buket Terpilih
                </span>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            /* Empty cart state */
            <div className="text-center py-20 bg-white rounded-3xl border border-border/80 shadow-[0_4px_24px_rgba(30,30,36,0.04)] max-w-2xl mx-auto px-6">
              <div className="w-20 h-20 rounded-3xl bg-pink/30 flex items-center justify-center mx-auto mb-5">
                <ShoppingBag className="w-10 h-10 text-text" strokeWidth={1.5} />
              </div>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-text mb-2">
                Keranjang Anda Masih Kosong
              </h2>
              <p className="text-text-secondary text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
                Temukan rangkaian buket bunga segar, snack, atau uang impian Anda di katalog sekarang juga!
              </p>
              <Link href="/katalog" className="btn-primary py-3.5 px-8 text-base shadow-lg">
                Jelajahi Katalog Buket
              </Link>
            </div>
          ) : (
            /* Desktop 12-Column Grid: Left list 7 cols, Sticky Checkout 5 cols */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              
              {/* CART ITEMS LIST (Col 7 on Desktop) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Pre-Order Banner if cart contains PO product */}
                {hasPoItem && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 text-amber-950 flex items-start gap-3 shadow-xs">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="text-xs sm:text-sm">
                      <h4 className="font-bold text-amber-900">Pesanan Memuat Produk Pre-Order (PO)</h4>
                      <p className="text-amber-800/90 mt-0.5 leading-relaxed">
                        Terdapat buket Pre-Order di keranjang Anda. Tanggal pengambilan/pengiriman otomatis disesuaikan <strong>minimal H-7 hari</strong> (paling cepat {formatTanggal(getMinDate(minDays))}) agar buket dapat dirangkai sempurna.
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-white/80 rounded-2xl px-5 py-3 border border-border/70 flex justify-between items-center text-xs font-bold text-text-secondary uppercase tracking-wider">
                  <span>Daftar Buket ({items.length})</span>
                  <span>Subtotal</span>
                </div>

                {items.map((item) => {
                  const subtotal = item.produk.harga * item.jumlah;
                  return (
                    <div
                      key={item.produk.id}
                      className="bg-white rounded-2xl p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(30,30,36,0.04)] border border-border/80 hover:border-pink-border/60 transition-all flex flex-row items-start gap-3 sm:gap-5"
                    >
                      {/* Product image */}
                      <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden bg-pink/20 shrink-0 border border-border/60 relative">
                        {item.produk.foto_url ? (
                          <img
                            src={item.produk.foto_url}
                            alt={item.produk.nama}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                            🌸
                          </div>
                        )}
                      </div>

                      {/* Info & Quantity */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-bold text-mint-dark uppercase tracking-wider">
                                {item.produk.kategori?.nama || 'Buket'}
                              </span>
                              {item.produk.status === 'po' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                  PO (Min. H-7)
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-text text-base leading-snug line-clamp-1 mt-0.5">
                              {item.produk.nama}
                            </h3>
                          </div>
                          <button
                            onClick={() => removeItem(item.produk.id)}
                            className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Hapus produk"
                            aria-label={`Hapus ${item.produk.nama}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-text-secondary text-xs mt-1">
                          Harga satuan: <span className="font-semibold text-text">{formatRupiah(item.produk.harga)}</span>
                        </p>

                        {/* Counter and Subtotal Row */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60">
                          {/* Stepper buttons */}
                          <div className="flex items-center bg-canvas rounded-xl p-1 border border-border/80">
                            <button
                              onClick={() => updateJumlah(item.produk.id, item.jumlah - 1)}
                              className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-text hover:bg-pink/40 hover:text-text transition-colors disabled:opacity-40"
                              disabled={item.jumlah <= 1}
                              aria-label="Kurangi jumlah"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-sm font-bold min-w-[2.5rem] text-center text-text">
                              {item.jumlah}
                            </span>
                            <button
                              onClick={() => updateJumlah(item.produk.id, item.jumlah + 1)}
                              className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-text hover:bg-mint hover:text-white transition-colors"
                              aria-label="Tambah jumlah"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Subtotal */}
                          <div className="text-right">
                            <span className="text-[11px] text-text-secondary block">Total Item</span>
                            <span className="text-base sm:text-lg font-extrabold text-mint-dark">
                              {formatRupiah(subtotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CHECKOUT SIDEBAR CARD (Col 5 on Desktop — Sticky) */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_10px_35px_rgba(30,30,36,0.06)] border border-border/80 lg:sticky lg:top-24 space-y-6">
                  
                  <div>
                    <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-text">
                      Detail Pemesanan
                    </h2>
                    <p className="text-xs text-text-secondary mt-1">
                      Data ini otomatis dirangkum ke format pesanan WhatsApp
                    </p>
                  </div>

                  {/* Price breakdown block */}
                  <div className="bg-canvas rounded-2xl p-4 space-y-2.5 border border-border/60">
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>Total Item ({items.reduce((acc, it) => acc + it.jumlah, 0)})</span>
                      <span className="font-semibold text-text">{formatRupiah(totalHarga)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>Biaya Konsultasi & Kartu</span>
                      <span className="font-bold text-mint-dark">GRATIS</span>
                    </div>
                    <div className="pt-3 border-t border-border/80 flex justify-between items-baseline">
                      <span className="font-bold text-text text-base">Total Bayar</span>
                      <span className="font-extrabold text-2xl text-mint-dark">
                        {formatRupiah(totalHarga)}
                      </span>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="nama" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text mb-1.5">
                        <User className="w-3.5 h-3.5 text-mint-dark" />
                        Nama Pemesan <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="nama"
                        type="text"
                        value={nama}
                        onChange={(e) => {
                          setNama(e.target.value);
                          setErrors((prev) => ({ ...prev, nama: '' }));
                        }}
                        placeholder="Contoh: Salsabila Putri"
                        className={cn('input-field py-3', errors.nama && 'border-red-400 bg-red-50/20')}
                        required
                      />
                      {errors.nama && (
                        <p className="text-red-500 text-xs mt-1 font-medium">{errors.nama}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="tanggal" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text mb-1.5">
                        <Calendar className="w-3.5 h-3.5 text-mint-dark" />
                        Tanggal Pengambilan / Kirim <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="tanggal"
                        type="date"
                        value={tanggal}
                        onChange={(e) => {
                          setTanggal(e.target.value);
                          setErrors((prev) => ({ ...prev, tanggal: '' }));
                        }}
                        min={getMinDate(minDays)}
                        className={cn('input-field py-3', errors.tanggal && 'border-red-400 bg-red-50/20')}
                        required
                      />
                      {errors.tanggal && (
                        <p className="text-red-500 text-xs mt-1 font-medium">{errors.tanggal}</p>
                      )}
                      <p className="text-[11px] mt-1">
                        {hasPoItem ? (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 shrink-0" />
                            Minimal H-7 hari (mulai {formatTanggal(getMinDate(minDays))}) karena memuat buket Pre-Order
                          </span>
                        ) : (
                          <span className="text-text-secondary">
                            *Minimal pemesanan H+{minDays} agar rangkaian bunga tertata sempurna
                          </span>
                        )}
                      </p>
                    </div>

                    <div>
                      <label htmlFor="catatan" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text mb-1.5">
                        <FileText className="w-3.5 h-3.5 text-mint-dark" />
                        Pesan Kartu Ucapan / Catatan Khusus
                      </label>
                      <textarea
                        id="catatan"
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        placeholder="Contoh: Happy Graduation Sarah! Sukses selalu ya. (Nuansa pita pink muda)"
                        rows={3}
                        className="input-field resize-none py-3 text-sm"
                      />
                    </div>
                  </div>

                  {errors.nama && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 animate-pulse">
                      <span>⚠️ Mohon lengkapi Nama Pemesan di atas sebelum checkout</span>
                    </div>
                  )}

                  {errors.cart && (
                    <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2.5 rounded-xl">
                      {errors.cart}
                    </p>
                  )}

                  {/* WhatsApp CTA with spring click */}
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="btn-whatsapp w-full py-4 text-base font-bold shadow-lg cursor-pointer hover:shadow-xl transition-all"
                    disabled={items.length === 0}
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    Checkout Pesanan via WhatsApp
                  </button>

                  <div className="flex items-center justify-center gap-2 text-xs text-text-secondary pt-1">
                    <ShieldCheck className="w-4 h-4 text-mint-dark" />
                    <span>Konfirmasi ketersediaan & pembayaran aman langsung via CS WhatsApp</span>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* POP-UP MODAL ULASAN PASCA CHECKOUT */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        defaultNama={nama}
        defaultBuket={buketName}
      />

      <Footer />
    </>
  );
}
