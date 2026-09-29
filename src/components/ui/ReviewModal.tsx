'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, CheckCircle2, User, Sparkles, X, Check } from 'lucide-react';
import { Ulasan } from '@/lib/mockReviews';

const STORAGE_KEY = 'toko_buket_customer_reviews';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultNama?: string;
  defaultBuket?: string;
  onReviewSubmitted?: (newReview: Ulasan) => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  defaultNama = '',
  defaultBuket = 'Buket Bunga Segar',
  onReviewSubmitted,
}: ReviewModalProps) {
  const [nama, setNama] = useState(defaultNama);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [komentar, setKomentar] = useState('');
  const [buket, setBuket] = useState(defaultBuket);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Sinkronisasi otomatis nama dan buket dari cart saat modal dibuka
  useEffect(() => {
    if (defaultNama) setNama(defaultNama);
    if (defaultBuket) setBuket(defaultBuket);
  }, [defaultNama, defaultBuket, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNama = nama.trim() || defaultNama.trim() || 'Pelanggan Setia';
    if (!komentar.trim()) {
      setError('Mohon tulis ulasan atau pengalaman Anda');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const newReview: Ulasan = {
      id: `rev-${Date.now()}`,
      nama: finalNama,
      rating,
      komentar: komentar.trim(),
      tanggal: 'Baru saja',
      buket_terpilih: buket.trim() || defaultBuket,
      is_approved: true,
    };

    setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const existing = saved ? JSON.parse(saved) : [];
        const updated = [newReview, ...existing];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('reviews-updated'));
        if (onReviewSubmitted) onReviewSubmitted(newReview);
      } catch {}

      setIsSubmitting(false);
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        setKomentar('');
        onClose();
      }, 1800);
    }, 400);
  };

  const hasPresetName = Boolean(defaultNama && defaultNama.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-border/80 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-canvas flex items-center justify-center text-text-secondary hover:text-text hover:bg-pink/30 transition-colors"
          aria-label="Tutup popup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-5">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-mint-dark uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Beri Penilaian
          </span>
          <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-text">
            Bagikan Pengalaman Anda
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            Pesanan dialihkan ke WhatsApp. Sambil menunggu respons, yuk beri ulasan!
          </p>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-mint-light text-mint-dark flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-lg text-text">Ulasan Berhasil Terkirim!</h4>
            <p className="text-xs text-text-secondary">
              Terima kasih {defaultNama || nama}! Ulasan Anda langsung tampil di website.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            {/* Nama Pembeli (Otomatis dari Checkout) */}
            {hasPresetName ? (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-mint-light/40 border border-mint/40 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-mint text-text flex items-center justify-center font-bold text-xs">
                    {defaultNama.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[11px] text-text-secondary">Mengulas sebagai:</p>
                    <p className="font-bold text-text text-sm">{defaultNama}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-mint-dark bg-white px-2 py-1 rounded-full shadow-xs">
                  <Check className="w-3 h-3" /> Terverifikasi
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text mb-1.5">
                    <User className="w-3.5 h-3.5 text-mint-dark" />
                    Nama Anda <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Sarah Anindya"
                    className="input-field py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text mb-1.5">
                    Pilihan Buket
                  </label>
                  <input
                    type="text"
                    value={buket}
                    onChange={(e) => setBuket(e.target.value)}
                    placeholder="Buket pesanan Anda"
                    className="input-field py-2 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Star Rating Selector */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-canvas border border-border/80">
              <span className="text-xs font-semibold text-text-secondary mb-1">
                Berapa bintang untuk toko kami?
              </span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-125"
                    aria-label={`Pilih rating ${star} bintang`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'text-amber-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-text mt-1">
                {hoverRating || rating} dari 5 Bintang
              </span>
            </div>

            {/* Komentar */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text mb-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-mint-dark" />
                Komentar / Pengalaman <span className="text-red-500">*</span>
              </label>
              <textarea
                value={komentar}
                onChange={(e) => setKomentar(e.target.value)}
                placeholder="Ceritakan kepuasan Anda terhadap bunga dan pelayanan kami..."
                rows={3}
                className="input-field resize-none py-2.5 text-sm"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex-1 py-3.5 text-sm font-bold shadow-md flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="animate-spin text-sm">&bull;</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Kirim Ulasan Sekarang
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
