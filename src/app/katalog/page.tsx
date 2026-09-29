'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import ProductCard from '@/components/katalog/ProductCard';
import { Search, X, ArrowUpDown, Filter } from 'lucide-react';
import { useProducts, useCategories } from '@/lib/store';
import { useLandingContent } from '@/hooks/useLandingContent';

export default function KatalogPage() {
  const { products, isLoading: isProductsLoading } = useProducts();
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const { content } = useLandingContent();
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'termurah' | 'termahal'>('default');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'tersedia'>('semua');

  const isLoading = isProductsLoading || isCategoriesLoading;

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchCategory =
        selectedCategory === 'semua' || p.kategori_id === selectedCategory;
      const matchSearch =
        searchQuery === '' ||
        p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'semua' || p.status === 'tersedia';
      return matchCategory && matchSearch && matchStatus;
    });

    if (sortBy === 'termurah') {
      result = [...result].sort((a, b) => a.harga - b.harga);
    } else if (sortBy === 'termahal') {
      result = [...result].sort((a, b) => b.harga - a.harga);
    }

    return result;
  }, [products, selectedCategory, searchQuery, statusFilter, sortBy]);

  return (
    <>
      <Header />
      <main className="flex-1 pt-20 sm:pt-24 pb-16">
        {/* Page header dengan background gambar estetik bernuansa Rose Pink */}
        <div className="relative overflow-hidden py-12 sm:py-20 border-b border-pink-border/50 bg-[#2b1820]">
          {/* Background image & pink gradient overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-45 transform scale-105 filter blur-[0.5px]"
            style={{
              backgroundImage: `url(${
                content.katalog_banner_bg ||
                'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=85'
              })`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#26131b]/95 via-[#3b1a29]/80 to-[#5a233b]/60" />

          {/* Ambient soft glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-pink/30 backdrop-blur-md border border-pink/50 text-pink-light text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
              {content.katalog_tag || 'Koleksi Rangkaian'}
            </span>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-3 tracking-tight drop-shadow-sm">
              {content.katalog_judul || 'Katalog Toko Buket'}
            </h1>
            <p className="text-white/90 text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
              {content.katalog_deskripsi ||
                'Buket bunga segar, snack, uang, dan kado wisuda custom pilihan terbaik untuk hari spesial Anda.'}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {/* Controls: Search Bar + 2 Dropdown Selectors (Kategori & Urutan) */}
          <div className="space-y-3.5 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari buket (misal: mawar, wisuda, cokelat)..."
                  className="input-field pl-10 pr-10 text-sm py-2.5 rounded-full bg-white shadow-xs border-border/90"
                  aria-label="Cari produk"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 2 Dropdown Selectors persis model pill */}
              <div className="flex items-center gap-2.5">
                {/* 1. DROPDOWN PILIHAN KATEGORI */}
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full sm:w-auto appearance-none bg-white border-2 border-mint hover:border-mint-dark rounded-full px-4 py-2.5 pr-9 text-xs sm:text-sm font-bold text-text focus:outline-none shadow-xs cursor-pointer transition-colors"
                  >
                    <option value="semua">Semua Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nama}
                      </option>
                    ))}
                  </select>
                  <Filter className="w-3.5 h-3.5 text-mint-dark absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* 2. DROPDOWN URUTKAN HARGA */}
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'default' | 'termurah' | 'termahal')}
                    className="w-full sm:w-auto appearance-none bg-white border-2 border-mint hover:border-mint-dark rounded-full px-4 py-2.5 pr-9 text-xs sm:text-sm font-bold text-text focus:outline-none shadow-xs cursor-pointer transition-colors"
                  >
                    <option value="default">Urutkan: Rekomendasi</option>
                    <option value="termurah">Harga: Termurah</option>
                    <option value="termahal">Harga: Termahal</option>
                  </select>
                  <ArrowUpDown className="w-3.5 h-3.5 text-mint-dark absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Status toggle & reset */}
            <div className="flex items-center justify-between text-xs text-text-secondary pt-1 px-1">
              <div className="flex items-center gap-2">
                <span>
                  Menampilkan <strong className="text-text font-bold">{filteredProducts.length}</strong> produk
                </span>
                <button
                  type="button"
                  onClick={() => setStatusFilter((prev) => (prev === 'tersedia' ? 'semua' : 'tersedia'))}
                  className={`px-3 py-1 rounded-full font-bold border transition-colors ${
                    statusFilter === 'tersedia'
                      ? 'bg-mint text-text border-mint'
                      : 'bg-white text-text-secondary border-border hover:border-mint'
                  }`}
                >
                  {statusFilter === 'tersedia' ? '✓ Hanya Tersedia' : 'Semua Status'}
                </button>
              </div>

              {(selectedCategory !== 'semua' || searchQuery !== '' || statusFilter !== 'semua' || sortBy !== 'default') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('semua');
                    setSearchQuery('');
                    setStatusFilter('semua');
                    setSortBy('default');
                  }}
                  className="text-mint-dark hover:underline font-semibold flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Product grid / empty states */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="card p-3 sm:p-4">
                  <div className="skeleton aspect-square mb-3 rounded-xl" />
                  <div className="skeleton h-4 w-3/4 mb-2 rounded-md" />
                  <div className="skeleton h-4 w-1/2 rounded-md" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-border/70 my-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-pink/30 text-pink-border flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-text text-base mb-1">Buket tidak ditemukan</h3>
              <p className="text-text-secondary text-xs sm:text-sm max-w-sm mx-auto mb-4">
                Coba gunakan kata kunci lain atau pilih kategori berbeda.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('semua');
                  setSearchQuery('');
                  setStatusFilter('semua');
                  setSortBy('default');
                }}
                className="btn-primary py-2.5 px-5 text-xs font-bold"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
