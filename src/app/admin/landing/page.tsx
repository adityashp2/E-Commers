'use client';

import { useState, useEffect } from 'react';
import { useLandingContent } from '@/hooks/useLandingContent';
import { LandingContent } from '@/lib/landingData';
import { createClient, withTimeout } from '@/lib/supabase/client';
import ImageUploadWithCompress from '@/components/admin/ImageUploadWithCompress';
import {
  Save,
  Loader2,
  Check,
  ImageIcon,
  Sparkles,
  Info,
  MapPin,
  Trash2,
  Plus,
  Layout,
  ExternalLink,
} from 'lucide-react';

export interface DynamicGalleryItem {
  id: string;
  img: string;
  label: string;
  tag: string;
}

export default function AdminLandingPage() {
  const { content, isLoading } = useLandingContent();
  const [values, setValues] = useState<LandingContent>(content);
  const [galleryList, setGalleryList] = useState<DynamicGalleryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'hero' | 'tentang' | 'galeri' | 'katalog' | 'kontak'>('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setValues(content);

      // Parse dynamic gallery items from JSON if available, or initialize from 6 legacy items
      let items: DynamicGalleryItem[] = [];
      if (content.galeri_items_json) {
        try {
          const parsed = JSON.parse(content.galeri_items_json);
          if (Array.isArray(parsed) && parsed.length > 0) {
            items = parsed;
          }
        } catch {}
      }

      if (items.length === 0) {
        const legacy = [
          { id: '1', img: content.galeri_item1_img, label: content.galeri_item1_label, tag: content.galeri_item1_tag },
          { id: '2', img: content.galeri_item2_img, label: content.galeri_item2_label, tag: content.galeri_item2_tag },
          { id: '3', img: content.galeri_item3_img, label: content.galeri_item3_label, tag: content.galeri_item3_tag },
          { id: '4', img: content.galeri_item4_img, label: content.galeri_item4_label, tag: content.galeri_item4_tag },
          { id: '5', img: content.galeri_item5_img, label: content.galeri_item5_label, tag: content.galeri_item5_tag },
          { id: '6', img: content.galeri_item6_img, label: content.galeri_item6_label, tag: content.galeri_item6_tag },
        ].filter((x) => x.img || x.label);

        items = legacy.length > 0 ? legacy : [
          { id: 'item-' + Date.now(), img: '', label: '', tag: '' }
        ];
      }

      setGalleryList(items);
    }
  }, [content, isLoading]);

  const handleChange = (field: keyof LandingContent, val: string) => {
    setValues((prev) => ({ ...prev, [field]: val }));
    setSaved(false);
  };

  const handleUploadCompressedImage = async (
    key: keyof LandingContent,
    file: File | null,
    dataUrl?: string
  ) => {
    if (dataUrl) handleChange(key, dataUrl);
    if (!file) return;

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

  // Gallery dynamic functions
  const handleAddGalleryItem = () => {
    const newItem: DynamicGalleryItem = {
      id: 'galeri-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      img: '',
      label: '',
      tag: '',
    };
    setGalleryList((prev) => [...prev, newItem]);
    setSaved(false);
  };

  const handleRemoveGalleryItem = (id: string) => {
    setGalleryList((prev) => prev.filter((item) => item.id !== id));
    setSaved(false);
  };

  const handleUpdateGalleryItem = (id: string, field: 'img' | 'label' | 'tag', value: string) => {
    setGalleryList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
    setSaved(false);
  };

  const handleUploadGalleryImage = async (id: string, file: File | null, dataUrl?: string) => {
    if (dataUrl) handleUpdateGalleryItem(id, 'img', dataUrl);
    if (!file) return;

    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop() || 'webp';
      const fileName = `galeri-${id}-${Date.now()}.${fileExt}`;

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
          handleUpdateGalleryItem(id, 'img', urlData.publicUrl);
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
    setSaved(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    const validGallery = galleryList.filter((item) => item.img.trim() !== '' || item.label.trim() !== '');
    const updatedValues: LandingContent = {
      ...values,
      galeri_items_json: JSON.stringify(validGallery),
      // Sync legacy 1-6 slots for backward compatibility
      galeri_item1_img: validGallery[0]?.img || '',
      galeri_item1_label: validGallery[0]?.label || '',
      galeri_item1_tag: validGallery[0]?.tag || '',
      galeri_item2_img: validGallery[1]?.img || '',
      galeri_item2_label: validGallery[1]?.label || '',
      galeri_item2_tag: validGallery[1]?.tag || '',
      galeri_item3_img: validGallery[2]?.img || '',
      galeri_item3_label: validGallery[2]?.label || '',
      galeri_item3_tag: validGallery[2]?.tag || '',
      galeri_item4_img: validGallery[3]?.img || '',
      galeri_item4_label: validGallery[3]?.label || '',
      galeri_item4_tag: validGallery[3]?.tag || '',
      galeri_item5_img: validGallery[4]?.img || '',
      galeri_item5_label: validGallery[4]?.label || '',
      galeri_item5_tag: validGallery[4]?.tag || '',
      galeri_item6_img: validGallery[5]?.img || '',
      galeri_item6_label: validGallery[5]?.label || '',
      galeri_item6_tag: validGallery[5]?.tag || '',
    };

    try {
      localStorage.setItem('toko_buket_landing_content', JSON.stringify(updatedValues));
      window.dispatchEvent(new Event('landing-content-updated'));

      const supabase = createClient();
      const entries = Object.entries(updatedValues).map(([key, value]) => ({
        key,
        value: value || '',
        updated_at: new Date().toISOString(),
      }));

      await withTimeout(
        supabase.from('konten_landing').upsert(entries, { onConflict: 'key' }) as unknown as Promise<unknown>,
        2000
      );
    } catch {
      // Preserved in localStorage
    } finally {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header bar dengan status badge (bukan tombol dobel) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-text">
            Kelola Konten & Tampilan Landing
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Ubah teks, foto slide hero, galeri tak terbatas, dan maps lokasi.
          </p>
        </div>

        {/* Status Indicator Bar */}
        <div className="flex items-center gap-2">
          {saved ? (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200 shadow-xs animate-in fade-in">
              <Check className="w-4 h-4 text-green-600" />
              Perubahan Berhasil Tersimpan!
            </span>
          ) : isSaving ? (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-mint-light text-mint-dark text-xs font-bold border border-mint/40">
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyimpan perubahan...
            </span>
          ) : (
            <span className="text-xs text-text-secondary">
              Klik tombol simpan di bawah setelah selesai mengedit
            </span>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 mb-6 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'hero' ? 'bg-mint text-text' : 'text-text-secondary hover:text-text hover:bg-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Hero & Slider
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tentang')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'tentang' ? 'bg-mint text-text' : 'text-text-secondary hover:text-text hover:bg-white'
          }`}
        >
          <Info className="w-4 h-4" />
          Tentang Toko
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('galeri')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'galeri' ? 'bg-mint text-text' : 'text-text-secondary hover:text-text hover:bg-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Foto Galeri ({galleryList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('katalog')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'katalog' ? 'bg-mint text-text' : 'text-text-secondary hover:text-text hover:bg-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Header Katalog
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('kontak')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'kontak' ? 'bg-mint text-text' : 'text-text-secondary hover:text-text hover:bg-white'
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
                <label className="block text-xs font-bold uppercase text-text mb-1">Tagline Kecil (Pill)</label>
                <input
                  type="text"
                  value={values.hero_tag}
                  onChange={(e) => handleChange('hero_tag', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-text mb-1">Judul Bagian 1</label>
                <input
                  type="text"
                  value={values.hero_judul}
                  onChange={(e) => handleChange('hero_judul', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-text mb-1">Kata Yang Disorot (Warna Mint)</label>
              <input
                type="text"
                value={values.hero_highlight}
                onChange={(e) => handleChange('hero_highlight', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-text mb-1">Deskripsi Hero</label>
              <textarea
                value={values.hero_deskripsi}
                onChange={(e) => handleChange('hero_deskripsi', e.target.value)}
                rows={3}
                className="input-field resize-none"
              />
            </div>

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
                        className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus Slide Ini
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-text mb-1">Badge Tag</label>
                      <input
                        type="text"
                        value={values[badgeKey]}
                        onChange={(e) => handleChange(badgeKey, e.target.value)}
                        placeholder="Contoh: 100% Bunga Segar"
                        className="input-field text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text mb-1">Sub Keterangan</label>
                      <input
                        type="text"
                        value={values[subKey]}
                        onChange={(e) => handleChange(subKey, e.target.value)}
                        placeholder="Contoh: Rangkaian mawar pastel"
                        className="input-field text-xs"
                      />
                    </div>
                  </div>
                  <ImageUploadWithCompress
                    label={`Foto Slide #${idx}`}
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
              Cerita & Profil Singkat Toko
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-text mb-1">Tagline</label>
                <input
                  type="text"
                  value={values.tentang_tag}
                  onChange={(e) => handleChange('tentang_tag', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-text mb-1">Judul Bagian</label>
                <input
                  type="text"
                  value={values.tentang_judul}
                  onChange={(e) => handleChange('tentang_judul', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-text mb-1">Paragraf Pertama</label>
              <textarea
                value={values.tentang_p1}
                onChange={(e) => handleChange('tentang_p1', e.target.value)}
                rows={3}
                className="input-field resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-text mb-1">Paragraf Kedua</label>
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

        {/* TAB 3: GALERI DINAMIS (BISA TAMBAH BERAPAPUN) */}
        {activeTab === 'galeri' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-border/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div>
                <h2 className="font-bold text-lg text-text flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-mint-dark" />
                  Galeri Portfolio ({galleryList.length} Foto Aktif)
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Tambahkan foto karya buket sebanyak yang Anda inginkan tanpa batas maksimal.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddGalleryItem}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-mint hover:bg-mint-dark hover:text-white text-text font-bold text-xs shadow-sm transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                Tambah Foto Galeri Baru
              </button>
            </div>

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

            {/* List Galeri Dinamis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {galleryList.map((item, idx) => (
                <div key={item.id} className="p-4 rounded-2xl bg-canvas border border-border/70 space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-text bg-white px-2.5 py-1 rounded-lg border border-border">
                      Foto #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryItem(item.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus Foto
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-text mb-1">Nama Buket</label>
                      <input
                        type="text"
                        placeholder="Contoh: Buket Mawar Merah"
                        value={item.label}
                        onChange={(e) => handleUpdateGalleryItem(item.id, 'label', e.target.value)}
                        className="input-field py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-text mb-1">Tag Kategori</label>
                      <input
                        type="text"
                        placeholder="Contoh: Bestseller / Wisuda"
                        value={item.tag}
                        onChange={(e) => handleUpdateGalleryItem(item.id, 'tag', e.target.value)}
                        className="input-field py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  <ImageUploadWithCompress
                    label={`Unggah / Ganti Foto #${idx + 1}`}
                    initialUrl={item.img}
                    onImageSelected={(file, dataUrl) => handleUploadGalleryImage(item.id, file, dataUrl)}
                  />
                </div>
              ))}
            </div>

            {/* Tombol Tambah di Bawah Grid */}
            <button
              type="button"
              onClick={handleAddGalleryItem}
              className="w-full py-3.5 border-2 border-dashed border-mint/60 hover:border-mint-dark rounded-2xl text-xs font-bold text-mint-dark hover:bg-mint-light/40 flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Foto Galeri Lagi (+1)
            </button>
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
                <label className="block text-xs font-bold uppercase text-text mb-1">Tagline Kecil (Pill)</label>
                <input
                  type="text"
                  value={values.katalog_tag || 'Koleksi Rangkaian'}
                  onChange={(e) => handleChange('katalog_tag', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-text mb-1">Judul Header Katalog</label>
                <input
                  type="text"
                  value={values.katalog_judul || 'Katalog Toko Buket'}
                  onChange={(e) => handleChange('katalog_judul', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-text mb-1">Deskripsi Header Katalog</label>
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
                <label className="block text-xs font-bold uppercase text-text mb-1">Nomor WhatsApp CS</label>
                <input
                  type="text"
                  value={values.kontak_wa}
                  onChange={(e) => handleChange('kontak_wa', e.target.value)}
                  placeholder="081234567890"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-text mb-1">Akun Instagram</label>
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
              <label className="block text-xs font-bold uppercase text-text mb-1">Alamat Lengkap Workshop / Toko</label>
              <textarea
                value={values.kontak_alamat}
                onChange={(e) => handleChange('kontak_alamat', e.target.value)}
                rows={2}
                className="input-field resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-text mb-1">Jam Operasional</label>
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

        {/* SATU TOMBOL SIMPAN DI BAGIAN BAWAH */}
        <div className="flex justify-end pt-4 border-t border-border/60">
          <button
            type="submit"
            className="btn-primary py-4 px-8 text-sm font-bold shadow-lg flex items-center gap-2"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Menyimpan Semua Data...
              </>
            ) : saved ? (
              <>
                <Check className="w-5 h-5" /> Data Berhasil Disimpan!
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
