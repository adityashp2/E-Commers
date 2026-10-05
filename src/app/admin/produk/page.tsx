'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatRupiah } from '@/lib/utils';
import { Plus, Pencil, Trash2, Search, Package, Flower2 } from 'lucide-react';
import { useProducts, deleteStoredProduct } from '@/lib/store';
import SafeImage from '@/components/ui/SafeImage';

export default function AdminProdukPage() {
  const { products, isLoading } = useProducts();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = async (id: string) => {
    await deleteStoredProduct(id);
    setDeleteId(null);
  };

  const filtered = products.filter((p) =>
    p.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-text">
            Kelola Produk
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">
            Total {products.length} produk buket terdaftar
          </p>
        </div>
        <Link href="/admin/produk/tambah" className="btn-primary py-3 px-5 text-sm self-start sm:self-auto touch-target">
          <Plus className="w-4 h-4" />
          Tambah Produk
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input
          type="search"
          placeholder="Cari nama buket..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10 py-2.5 text-sm"
          aria-label="Cari produk"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-border/80 p-6">
          <Package className="w-12 h-12 text-pink-border mx-auto mb-3" />
          <p className="text-text-secondary text-sm">Tidak ada produk yang cocok dengan pencarian.</p>
          <Link href="/admin/produk/tambah" className="btn-primary mt-4 inline-flex text-xs py-2.5">
            <Plus className="w-4 h-4" />
            Tambah Produk Baru
          </Link>
        </div>
      ) : (
        /* Responsive Card-Grid on Mobile, Clean Table on Tablet/Desktop */
        <div className="space-y-3">
          {/* Mobile Card Layout */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-4 border border-border/80 shadow-xs flex items-center gap-3.5"
              >
                <div className="w-16 h-16 rounded-xl bg-pink/20 shrink-0 overflow-hidden border border-border/60">
                  {product.foto_url && product.foto_url.trim() !== '' ? (
                    <SafeImage
                      src={product.foto_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-mint-dark/50">
                      <Flower2 className="w-6 h-6 opacity-40" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-mint-dark bg-mint-light px-2 py-0.5 rounded-md">
                      {product.kategori?.nama || 'Buket'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        product.status === 'tersedia'
                          ? 'bg-green-100 text-green-700'
                          : product.status === 'po'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.status === 'tersedia' ? 'Tersedia' : product.status === 'po' ? 'Pre-Order (H-7)' : 'Habis'}
                    </span>
                  </div>
                  <h3 className="font-bold text-text text-sm truncate mt-1">{product.nama}</h3>
                  <p className="text-mint-dark font-extrabold text-sm">{formatRupiah(product.harga)}</p>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <Link
                    href={`/admin/produk/${product.id}/edit`}
                    className="p-2 bg-canvas hover:bg-pink/40 rounded-xl text-text transition-colors"
                    aria-label={`Edit ${product.nama}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteId(product.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-500 transition-colors"
                    aria-label={`Hapus ${product.nama}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop / Tablet Table Layout */}
          <div className="hidden sm:block bg-white rounded-3xl overflow-hidden border border-border/80 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left" role="table">
                <thead>
                  <tr className="border-b border-border/60 bg-canvas/60 text-xs font-bold uppercase tracking-wider text-text-secondary">
                    <th className="p-4 pl-6">Produk</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Harga</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {filtered.map((product) => (
                    <tr key={product.id} className="hover:bg-canvas/40 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-pink/20 shrink-0 overflow-hidden border border-border/60">
                            {product.foto_url && product.foto_url.trim() !== '' ? (
                              <SafeImage
                                src={product.foto_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-mint-dark/50">
                                <Flower2 className="w-5 h-5 opacity-40" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-text">{product.nama}</p>
                            <p className="text-xs text-text-secondary font-mono">/{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-text-secondary font-medium">
                        {product.kategori?.nama || '-'}
                      </td>
                      <td className="p-4 font-bold text-mint-dark">
                        {formatRupiah(product.harga)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            product.status === 'tersedia'
                              ? 'bg-mint-light text-mint-dark'
                              : product.status === 'po'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.status === 'tersedia' ? 'Tersedia' : product.status === 'po' ? 'Pre-Order (H-7)' : 'Habis'}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/produk/${product.id}/edit`}
                            className="p-2 hover:bg-canvas rounded-xl text-text-secondary hover:text-text transition-colors"
                            title="Edit Produk"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(product.id)}
                            className="p-2 hover:bg-red-50 rounded-xl text-red-400 hover:text-red-600 transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-xl border border-border/80">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-text text-lg">Hapus Produk?</h3>
            <p className="text-xs text-text-secondary">
              Produk yang dihapus tidak dapat dipulihkan kembali. Anda yakin?
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="btn-secondary flex-1 py-2.5 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="btn-primary flex-1 py-2.5 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
