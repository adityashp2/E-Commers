'use client';

import { useState, useEffect } from 'react';
import { Phone, Calendar, MapPin, Clock, Loader2, Check, Save, AtSign } from 'lucide-react';
import { useSettings, updateStoreSettings } from '@/lib/store';

export default function AdminPengaturanPage() {
  const { settings, isLoading } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [waNumber, setWaNumber] = useState('');
  const [minHari, setMinHari] = useState('');
  const [alamat, setAlamat] = useState('');
  const [jamOperasional, setJamOperasional] = useState('');
  const [instagram, setInstagram] = useState('');

  useEffect(() => {
    if (!isLoading) {
      setWaNumber(settings.wa_number);
      setMinHari(settings.min_hari_pesan);
      setAlamat(settings.alamat_pengambilan);
      setJamOperasional(settings.jam_operasional);
      setInstagram(settings.instagram || '@toko.buket');
    }
  }, [isLoading, settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    await updateStoreSettings({
      wa_number: waNumber.trim(),
      min_hari_pesan: minHari.trim(),
      alamat_pengambilan: alamat.trim(),
      jam_operasional: jamOperasional.trim(),
      instagram: instagram.trim(),
    });

    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="skeleton h-96 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-text">
          Pengaturan Toko
        </h1>
        <p className="text-text-secondary text-xs sm:text-sm mt-1">
          Konfigurasi nomor kontak checkout WhatsApp, alamat workshop, dan waktu persiapan buket
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-border/80 shadow-xs space-y-5">
        <div>
          <label htmlFor="wa" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text mb-1.5">
            <Phone className="w-3.5 h-3.5 text-mint-dark" />
            Nomor WhatsApp CS (Tujuan Checkout)
          </label>
          <input
            id="wa"
            type="tel"
            value={waNumber}
            onChange={(e) => setWaNumber(e.target.value)}
            placeholder="081234567890"
            className="input-field py-2.5 text-sm"
            required
          />
          <p className="text-[11px] text-text-secondary mt-1">
            Nomor ini yang akan menerima rangkuman rincian pesanan pelanggan dari keranjang.
          </p>
        </div>

        <div>
          <label htmlFor="minHari" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-mint-dark" />
            Minimal Hari Pemesanan (H+N)
          </label>
          <input
            id="minHari"
            type="number"
            value={minHari}
            onChange={(e) => setMinHari(e.target.value)}
            min="0"
            max="14"
            className="input-field py-2.5 text-sm"
            required
          />
          <p className="text-[11px] text-text-secondary mt-1">
            Contoh: diisi 1 = pembeli hanya bisa memilih tanggal pengambilan mulai H+1 dari hari ini.
          </p>
        </div>

        <div>
          <label htmlFor="alamat" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-mint-dark" />
            Alamat Workshop / Titik Temu
          </label>
          <textarea
            id="alamat"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            rows={3}
            className="input-field resize-none py-2.5 text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="jam" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text mb-1.5">
            <Clock className="w-3.5 h-3.5 text-mint-dark" />
            Jam Operasional
          </label>
          <input
            id="jam"
            type="text"
            value={jamOperasional}
            onChange={(e) => setJamOperasional(e.target.value)}
            className="input-field py-2.5 text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="instagram" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text mb-1.5">
            <AtSign className="w-3.5 h-3.5 text-mint-dark" />
            Instagram Toko
          </label>
          <input
            id="instagram"
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@toko.buket"
            className="input-field py-2.5 text-sm"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className={`btn-primary w-full sm:w-auto py-3.5 px-8 text-sm font-bold shadow-md transition-all ${
              saved ? 'bg-green-600 hover:bg-green-700' : ''
            }`}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" /> Pengaturan Berhasil Disimpan!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Simpan Pengaturan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
