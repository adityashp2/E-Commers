'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Loader2, Tag } from 'lucide-react';
import { useCategories, addCategory, updateCategory, deleteCategory } from '@/lib/store';

export default function AdminKategoriPage() {
  const { categories, isLoading } = useCategories();
  const [newNama, setNewNama] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNama, setEditNama] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim()) return;
    setIsSaving(true);
    await addCategory(newNama.trim());
    setNewNama('');
    setIsSaving(false);
  };

  const handleUpdate = async (id: string) => {
    if (!editNama.trim()) return;
    await updateCategory(id, editNama.trim());
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
    setDeleteId(null);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-text">
          Kelola Kategori
        </h1>
        <p className="text-text-secondary text-xs sm:text-sm mt-1">
          Atur pengelompokan buket untuk memudahkan pembeli menjelajahi katalog
        </p>
      </div>

      {/* Add category form */}
      <form onSubmit={handleAdd} className="bg-white rounded-3xl p-5 sm:p-6 border border-border/80 shadow-xs">
        <label htmlFor="new-category" className="block text-xs font-bold uppercase tracking-wider text-text mb-2">
          Tambah Kategori Baru
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="new-category"
            type="text"
            value={newNama}
            onChange={(e) => setNewNama(e.target.value)}
            placeholder="Contoh: Buket Wisuda"
            className="input-field py-2.5 text-sm flex-1"
          />
          <button
            type="submit"
            disabled={isSaving || !newNama.trim()}
            className="btn-primary py-2.5 px-5 text-sm font-semibold shrink-0"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Tambah
          </button>
        </div>
      </form>

      {/* Categories list */}
      <div className="bg-white rounded-3xl border border-border/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border/60 bg-canvas/60">
          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Daftar Kategori ({categories.length})
          </p>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-canvas/40 transition-colors"
              >
                {editingId === c.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editNama}
                      onChange={(e) => setEditNama(e.target.value)}
                      className="input-field py-1.5 text-sm flex-1"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdate(c.id)}
                      className="p-2 bg-mint text-text rounded-xl hover:bg-mint-dark transition-colors"
                      aria-label="Simpan nama kategori"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 bg-canvas rounded-xl text-text-secondary hover:text-text transition-colors"
                      aria-label="Batal edit"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-pink/30 flex items-center justify-center shrink-0">
                      <Tag className="w-4 h-4 text-text" />
                    </div>
                    <span className="font-semibold text-text text-sm">{c.nama}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      setEditingId(c.id);
                      setEditNama(c.nama);
                    }}
                    className="p-2 hover:bg-canvas rounded-xl text-text-secondary hover:text-text transition-colors"
                    aria-label={`Edit ${c.nama}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(c.id)}
                    className="p-2 hover:bg-red-50 rounded-xl text-red-400 hover:text-red-600 transition-colors"
                    aria-label={`Hapus ${c.nama}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-xl border border-border/80">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-text text-lg">Hapus Kategori?</h3>
            <p className="text-xs text-text-secondary">
              Produk dalam kategori ini tidak akan terhapus, namun tidak lagi memiliki kategori.
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
