'use client';

import { useState, useEffect } from 'react';
import { createClient, withTimeout } from '@/lib/supabase/client';
import { DEFAULT_LANDING_CONTENT, LandingContent } from '@/lib/landingData';
import ImageUploadWithCompress from '@/components/admin/ImageUploadWithCompress';
import {
  Save,
  Loader2,
  Check,
  Sparkles,
  Layout,
  Info,
  MapPin,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';

export default function AdminLandingPage() {
  const [values, setValues] = useState<LandingContent>(DEFAULT_LANDING_CONTENT);
  const [activeTab, setActiveTab] = useState<'hero' | 'tentang' | 'galeri' | 'katalog' | 'kontak'>('hero');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchContent() {
      try {
        const cached = localStorage.getItem('toko_buket_landing_content');
        if (cached) {
          setValues({ ...DEFAULT_LANDING_CONTENT, ...JSON.parse(cached) });
        }

        const supabase = createClient();
        const fetchPromise = supabase.from('konten_landing').select('*');
        const { data } = await withTimeout(
          fetchPromise as unknown as Promise<{ data: Array<{ key: string; value: string }> | null }>,
          1000
        );

        if (data && data.length > 0) {
          const map: Partial<LandingContent> = {};
          data.forEach((row) => {
            (map as Record<string, string>)[row.key] = row.value;
          });
          const merged = { ...DEFAULT_LANDING_CONTENT, ...map };
          setValues(merged);
          localStorage.setItem('toko_buket_landing_content', JSON.stringify(merged));
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, []);

  const handleChange = (key: keyof LandingContent, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleUploadCompressedImage = async (
    key: keyof LandingContent,
    file: File | null,
    dataUrl?: string
  ) => {
    // If file null (user klik hapus), kosongkan foto
    if (!file) {
      handleChange(key, '');
      return;
    }

    // Jika base64 dataUrl sudah siap, langsung set ke state seketika
    if (dataUrl) {
      handleChange(key, dataUrl);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          handleChange(key, e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }

    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop() || 'webp';
      const fileName = `landing-${key}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('produk-images')
        .upload(fileName, file, {
          cacheControl: '31536000',
          contentType: file.type,
          upsert: true,
        });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('produk-images')
          .getPublicUrl(fileName);

        if (urlData?.publicUrl) {
          handleChange(key, urlData.publicUrl);
        }
      }
    } catch {}
  };

  const handleClearHeroSlide = (idx: number) => {
    const imgKey = `hero_slide${idx}_image` as keyof LandingContent;
    const badgeKey = `hero_slide${idx}_badge` as keyof LandingContent;
    const subKey = `hero_slide${idx}_sub` as keyof LandingContent;
    setValues((prev) => ({
      ...prev,
      [imgKey]: '',
      [badgeKey]: '',
      [subKey]: '',
    }));
  };

  const handleClearGalleryItem = (idx: number) => {
    const imgKey = `galeri_item${idx}_img` as keyof LandingContent;
    const labelKey = `galeri_item${idx}_label` as keyof LandingContent;
    const tagKey = `galeri_item${idx}_tag` as keyof LandingContent;
    setValues((prev) => ({
      ...prev,
      [imgKey]: '',
      [labelKey]: '',
      [tagKey]: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Save locally first for instant availability
      localStorage.setItem('toko_buket_landing_content', JSON.stringify(values));
      window.dispatchEvent(new Event('landing-content-updated'));

      const supabase = createClient();
      const entries = Object.entries(values).map(([key, value]) => ({
        key,
        value: value || '',
        updated_at: new Date().toISOString(),
      }));

      // Try bulk upsert
      await withTimeout(
        supabase.from('konten_landing').upsert(entries, { onConflict: 'key' }) as unknown as Promise<unknown>,
        1500
      );
    } catch {
      // Still preserved in localStorage
    } finally {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="skeleton h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-text">
            Kelola Konten & Tampilan Landing
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Ubah teks, foto slide, galeri, dan maps lokasi langsung dari sini.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className={`btn-primary self-start sm:self-auto py-3 px-6 ${
            saved ? 'bg-green-500 hover:bg-green-600' : ''
          }`}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...
            </>
          ) : saved ? (
            <>
              <Check className="w-5 h-5" /> Tersimpan!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" /> Simpan Semua Perubahan
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 mb-8 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'hero'
              ? 'bg-mint text-text'
              : 'text-text-secondary hover:text-text hover:bg-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Hero & Slider
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tentang')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'tentang'
              ? 'bg-mint text-text'
              : 'text-text-secondary hover:text-text hover:bg-white'
          }`}
        >
          <Info className="w-4 h-4" />
          Tentang Toko
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('galeri')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'galeri'
              ? 'bg-mint text-text'
              : 'text-text-secondary hover:text-text hover:bg-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Foto Galeri
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('katalog')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'katalog'
              ? 'bg-mint text-text'
              : 'text-text-secondary hover:text-text hover:bg-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Header Katalog
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('kontak')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'kontak'
              ? 'bg-mint text-text'
              : 'text-text-secondary hover:text-text hover:bg-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Kontak & Maps
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* TAB 1: HERO & SLIDER */}
        {activeTab === 'hero' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-border/80 space-y-6">
            <h2 className="font-bold text-lg text-text border-b border-border/60 pb-3 flex items-center gap-2">
              <Layout className="w-5 h-5 text-mint-dark" />
              Teks Utama Banner Hero
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-text mb-1">
                  Tagline Kecil (Pill)
                </label>
                <input
                  type="text"
                  value={values.hero_tag}
                  onChange={(e) => handleChange('hero_tag', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-text mb-1">
                  Judul Bagian 1
                </label>
                <input
                  type="text"
                  value={values.hero_judul}
                  onChange={(e) => handleChange('hero_judul', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-text mb-1">
                Kata Yang Disorot (Warna Mint)
              </label>
              <input
                type="text"
                value={values.hero_highlight}
                onChange={(e) => handleChange('hero_highlight', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-text mb-1">
                Deskripsi Hero
              </label>
              <textarea
                value={values.hero_deskripsi}
                onChange={(e) => handleChange('hero_deskripsi', e.target.value)}
                rows={3}
                className="input-field resize-none"
              />
            </div>

            {/* Hero 4 Slides */}
            <h3 className="font-bold text-base text-text pt-4 border-t border-border/60">
              4 Foto Slider Hero (Auto Slide)
            </h3>

            {[1, 2, 3, 4].map((idx) => {
              const imgKey = `hero_slide${idx}_image` as keyof LandingContent;
              const badgeKey = `hero_slide${idx}_badge` as keyof LandingContent;
              const subKey = `hero_slide${idx}_sub` as keyof LandingContent;

              return (
                <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-canvas border border-border/70 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-text">Slide #{idx}</p>
                    {values[imgKey] && (
                      <button
                        type="button"
                        onClick={() => handleClearHeroSlide(idx)}
                        className="text-[11px] text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus Slide Ini
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-text mb-1">
                        Judul Badge Slide
                      </label>
                      <input
                        type="text"
                        value={values[badgeKey]}
                        onChange={(e) => handleChange(badgeKey, e.target.value)}
                        className="input-field py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text mb-1">
                        Subteks Badge Slide
                      </label>
                      <input
                        type="text"
                        value={values[subKey]}
                        onChange={(e) => handleChange(subKey, e.target.value)}
                        className="input-field py-2 text-sm"
                      />
                    </div>
                  </div>

                  <ImageUploadWithCompress
                    label={`Unggah Foto Slide #${idx}`}
                    initialUrl={values[imgKey]}
                    onImageSelected={(file, dataUrl) => handleUploadCompressedImage(imgKey, file, dataUrl)}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: TENTANG TOKO */}
        {activeTab === 'tentang' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-border/80 space-y-6">
            <h2 className="font-bold text-lg text-text border-b border-border/60 pb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-mint-dark" />
              Cerita & Tentang Toko
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-text mb-1">
                  Tagline Kecil
                </label>
                <input
                  type="text"
                  value={values.tentang_tag}
                  onChange={(e) => handleChange('tentang_tag', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-text mb-1">
                  Judul Section
                </label>
                <input
                  type="text"
                  value={values.tentang_judul}
                  onChange={(e) => handleChange('tentang_judul', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-text mb-1">
                Paragraf Pertama
              </label>
              <textarea
                value={values.tentang_p1}
                onChange={(e) => handleChange('tentang_p1', e.target.value)}
                rows={3}
                className="input-field resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-text mb-1">
                Paragraf Kedua
              </label>
              <textarea
                value={values.tentang_p2}
                onChange={(e) => handleChange('tentang_p2', e.target.value)}
                rows={3}
                className="input-field resize-none"
              />
            </div>

            <ImageUploadWithCompress
              label="Foto Owner / Workshop Merangkai"
              initialUrl={values.tentang_foto}
              onImageSelected={(file, dataUrl) => handleUploadCompressedImage('tentang_foto', file, dataUrl)}
            />
          </div>
        )}

        {/* TAB 3: GALERI */}
        {activeTab === 'galeri' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-border/80 space-y-6">
            <h2 className="font-bold text-lg text-text border-b border-border/60 pb-3 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-mint-dark" />
              Kelola 6 Foto Galeri Portfolio
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-text mb-1">Tag Galeri</label>
                <input
                  type="text"
                  value={values.galeri_tag}
                  onChange={(e) => handleChange('galeri_tag', e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-text mb-1">Judul Galeri</label>
                <input
                  type="text"
                  value={values.galeri_judul}
                  onChange={(e) => handleChange('galeri_judul', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((idx) => {
                const imgKey = `galeri_item${idx}_img` as keyof LandingContent;
                const labelKey = `galeri_item${idx}_label` as keyof LandingContent;
                const tagKey = `galeri_item${idx}_tag` as keyof LandingContent;

                return (
                  <div key={idx} className="p-4 rounded-2xl bg-canvas border border-border/70 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-text">Foto Galeri #{idx}</p>
                      {(values[imgKey] || values[labelKey]) && (
                        <button
                          type="button"
                          onClick={() => handleClearGalleryItem(idx)}
                          className="text-[11px] text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus dari Galeri
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nama Buket"
                        value={values[labelKey]}
                        onChange={(e) => handleChange(labelKey, e.target.value)}
                        className="input-field py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Tag (e.g. Bestseller)"
                        value={values[tagKey]}
                        onChange={(e) => handleChange(tagKey, e.target.value)}
                        className="input-field py-1.5 text-xs"
                      />
                    </div>
                    <ImageUploadWithCompress
                      label={`Ganti Foto #${idx}`}
                      initialUrl={values[imgKey]}
                      onImageSelected={(file, dataUrl) => handleUploadCompressedImage(imgKey, file, dataUrl)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: HEADER KATALOG */}
        {activeTab === 'katalog' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-border/80 space-y-6">
            <h2 className="font-bold text-lg text-text border-b border-border/60 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-mint-dark" />
              Banner & Header Halaman Katalog
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-text mb-1">
                  Tagline Kecil (Pill)
                </label>
                <input
                  type="text"
                  value={values.katalog_tag || 'Koleksi Rangkaian'}
                  onChange={(e) => handleChange('katalog_tag', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-text mb-1">
                  Judul Header Katalog
                </label>
                <input
                  type="text"
                  value={values.katalog_judul || 'Katalog Toko Buket'}
                  onChange={(e) => handleChange('katalog_judul', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-text mb-1">
                Deskripsi Header Katalog
              </label>
              <textarea
                value={values.katalog_deskripsi || ''}
                onChange={(e) => handleChange('katalog_deskripsi', e.target.value)}
                rows={2}
                className="input-field resize-none"
              />
            </div>

            <ImageUploadWithCompress
              label="Foto Banner Latar Header Katalog"
              initialUrl={values.katalog_banner_bg}
              helperText="Rekomendasi rasio lebar 16:9 atau panorama (misal 1600x600 px)"
              onImageSelected={(file, dataUrl) => handleUploadCompressedImage('katalog_banner_bg', file, dataUrl)}
            />
          </div>
        )}

        {/* TAB 5: KONTAK & MAPS */}
        {activeTab === 'kontak' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-border/80 space-y-6">
            <h2 className="font-bold text-lg text-text border-b border-border/60 pb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-mint-dark" />
              Alamat, WhatsApp, & Google Maps
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-text mb-1">
                  Nomor WhatsApp CS
                </label>
                <input
                  type="text"
                  value={values.kontak_wa}
                  onChange={(e) => handleChange('kontak_wa', e.target.value)}
                  placeholder="081234567890"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-text mb-1">
                  Akun Instagram
                </label>
                <input
                  type="text"
                  value={values.kontak_instagram}
                  onChange={(e) => handleChange('kontak_instagram', e.target.value)}
                  placeholder="@toko.buket"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-text mb-1">
                Alamat Lengkap Workshop / Toko
              </label>
              <textarea
                value={values.kontak_alamat}
                onChange={(e) => handleChange('kontak_alamat', e.target.value)}
                rows={2}
                className="input-field resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-text mb-1">
                Jam Operasional
              </label>
              <input
                type="text"
                value={values.kontak_jam}
                onChange={(e) => handleChange('kontak_jam', e.target.value)}
                placeholder="Senin – Sabtu: 09:00 – 18:00 WIB"
                className="input-field"
              />
            </div>

            <div className="p-5 rounded-2xl bg-canvas border border-border/80 space-y-4">
              <h3 className="font-bold text-sm text-text">Pengaturan Google Maps Lokasi</h3>
              
              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Link Google Maps Embed (iframe src)
                </label>
                <input
                  type="text"
                  value={values.kontak_maps_embed}
                  onChange={(e) => handleChange('kontak_maps_embed', e.target.value)}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="input-field text-xs"
                />
                <p className="text-[11px] text-text-secondary mt-1">
                  Salin dari Google Maps: Bagikan &rarr; Sematkan peta (salin isi <code>src="..."</code>).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Link Langsung Google Maps (Petunjuk Arah)
                </label>
                <input
                  type="text"
                  value={values.kontak_maps_url}
                  onChange={(e) => handleChange('kontak_maps_url', e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="input-field text-xs"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary py-4 px-8 text-base shadow-lg"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Menyimpan Semua Data...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" /> Simpan Semua Perubahan
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
