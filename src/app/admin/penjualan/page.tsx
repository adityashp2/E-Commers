'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  TrendingUp, ShoppingBag, CheckCircle2, Clock, AlertCircle,
  Plus, Search, Filter, ChevronDown, Trash2, Edit3, Eye,
  BarChart2, X, Package,
} from 'lucide-react';
import {
  usePesanan, addPesanan, updatePesanan, deletePesanan,
  getDailyStats, getProductStats, getSummary,
  Pesanan, StatusPesanan, ItemPesanan,
} from '@/lib/salesStore';
import { useProducts } from '@/lib/store';
import { formatRupiah, cn } from '@/lib/utils';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<StatusPesanan, { label: string; color: string; bg: string }> = {
  menunggu:   { label: 'Menunggu',   color: 'text-amber-700',   bg: 'bg-amber-100' },
  diproses:   { label: 'Diproses',   color: 'text-blue-700',    bg: 'bg-blue-100' },
  selesai:    { label: 'Selesai',    color: 'text-emerald-700', bg: 'bg-emerald-100' },
  dibatalkan: { label: 'Dibatalkan', color: 'text-red-700',     bg: 'bg-red-100' },
};

const PIE_COLORS = ['#f59e0b', '#06b6d4', '#10b981', '#ef4444'];

// ─── Tooltips ─────────────────────────────────────────────────────────────────

function OmzetTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl px-3 py-2 shadow-lg text-sm">
      <p className="font-bold text-text mb-1">{label}</p>
      <p className="text-text-secondary">{formatRupiah(payload[0].value)}</p>
    </div>
  );
}

function CountTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl px-3 py-2 shadow-lg text-sm">
      <p className="font-bold text-text mb-1">{label}</p>
      <p className="text-text-secondary">{payload[0].value} pesanan</p>
    </div>
  );
}

// ─── Order Form Modal ─────────────────────────────────────────────────────────

interface OrderFormProps {
  existing?: Pesanan | null;
  products: { id: string; nama: string; harga: number }[];
  onClose: () => void;
  onSave: () => void;
}

function OrderFormModal({ existing, products, onClose, onSave }: OrderFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [namaPelanggan, setNamaPelanggan] = useState(existing?.nama_pelanggan ?? '');
  const [tanggalPesan, setTanggalPesan] = useState(existing?.tanggal_pesan?.slice(0, 10) ?? today);
  const [tanggalAmbil, setTanggalAmbil] = useState(existing?.tanggal_pengambilan?.slice(0, 10) ?? '');
  const [catatan, setCatatan] = useState(existing?.catatan ?? '');
  const [status, setStatus] = useState<StatusPesanan>(existing?.status ?? 'menunggu');
  const [items, setItems] = useState<ItemPesanan[]>(existing?.items ?? []);
  const [saving, setSaving] = useState(false);

  const addItem = () => {
    const first = products[0];
    if (!first) return;
    setItems(prev => [...prev, { produk_id: first.id, nama_produk: first.nama, jumlah: 1, harga_satuan: first.harga, subtotal: first.harga }]);
  };

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const updateItem = (idx: number, field: keyof ItemPesanan, val: string | number) => {
    setItems(prev => prev.map((it, i) => {
      if (i !== idx) return it;
      const u = { ...it, [field]: val };
      if (field === 'produk_id') {
        const p = products.find(p => p.id === val);
        if (p) { u.nama_produk = p.nama; u.harga_satuan = p.harga; u.subtotal = p.harga * u.jumlah; }
      }
      if (field === 'jumlah') u.subtotal = u.harga_satuan * Number(val);
      return u;
    }));
  };

  const total = items.reduce((s, i) => s + i.subtotal, 0);

  const handleSave = async () => {
    if (!namaPelanggan.trim() || !tanggalPesan || !tanggalAmbil || items.length === 0) {
      alert('Lengkapi semua field dan minimal 1 produk!');
      return;
    }
    setSaving(true);
    const payload = {
      nama_pelanggan: namaPelanggan.trim(),
      tanggal_pesan: tanggalPesan,
      tanggal_pengambilan: tanggalAmbil,
      catatan: catatan.trim() || null,
      status,
      items,
    };
    if (existing) await updatePesanan(existing.id, payload);
    else await addPesanan(payload);
    setSaving(false);
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-text">
            {existing ? 'Edit Pesanan' : 'Tambah Pesanan'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-canvas text-text-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-text mb-1.5">Nama Pelanggan *</label>
              <input
                value={namaPelanggan}
                onChange={e => setNamaPelanggan(e.target.value)}
                placeholder="Nama lengkap pelanggan"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Tanggal Pesan *</label>
              <input
                type="date" value={tanggalPesan}
                onChange={e => setTanggalPesan(e.target.value)}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Tanggal Pengambilan *</label>
              <input
                type="date" value={tanggalAmbil}
                onChange={e => setTanggalAmbil(e.target.value)}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as StatusPesanan)}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint bg-white"
              >
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Catatan</label>
              <input
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                placeholder="Catatan opsional..."
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-text">Produk *</label>
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 text-xs font-bold text-mint-dark bg-mint-light px-3 py-1.5 rounded-xl hover:opacity-80"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Produk
              </button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-6 bg-canvas rounded-2xl text-sm text-text-secondary">
                Belum ada produk. Klik &quot;Tambah Produk&quot;.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="bg-canvas rounded-2xl p-3 flex items-center gap-3">
                    <select
                      value={item.produk_id}
                      onChange={e => updateItem(idx, 'produk_id', e.target.value)}
                      className="flex-1 bg-white border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint"
                    >
                      {products.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                    </select>
                    <input
                      type="number" min={1} value={item.jumlah}
                      onChange={e => updateItem(idx, 'jumlah', parseInt(e.target.value) || 1)}
                      className="w-16 bg-white border border-border rounded-xl px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-mint"
                    />
                    <span className="text-xs font-semibold text-text-secondary w-28 text-right shrink-0">
                      {formatRupiah(item.subtotal)}
                    </span>
                    <button onClick={() => removeItem(idx)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="flex justify-end mt-3">
                <div className="bg-gradient-to-r from-mint-light to-purple-50 rounded-2xl px-4 py-2.5">
                  <span className="text-sm font-semibold text-text-secondary mr-3">Total</span>
                  <span className="text-lg font-bold text-text">{formatRupiah(total)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-border px-6 py-4 flex gap-3 rounded-b-3xl">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl border border-border text-sm font-bold text-text-secondary hover:bg-canvas">
            Batal
          </button>
          <button
            onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Menyimpan...' : existing ? 'Simpan Perubahan' : 'Simpan Pesanan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function OrderDetailModal({ order, onClose, onEdit }: { order: Pesanan; onClose: () => void; onEdit: () => void }) {
  const cfg = STATUS_CONFIG[order.status];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-text">Detail Pesanan</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-canvas text-text-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">#{order.id.slice(-8).toUpperCase()}</span>
            <span className={cn('text-xs font-bold px-3 py-1 rounded-full', cfg.bg, cfg.color)}>{cfg.label}</span>
          </div>
          <div className="bg-canvas rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Pelanggan</span>
              <span className="font-semibold">{order.nama_pelanggan}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Tanggal Pesan</span>
              <span className="font-semibold">{new Date(order.tanggal_pesan).toLocaleDateString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Ambil</span>
              <span className="font-semibold">{new Date(order.tanggal_pengambilan).toLocaleDateString('id-ID')}</span>
            </div>
            {order.catatan && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Catatan</span>
                <span className="font-semibold text-right max-w-[60%]">{order.catatan}</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-text mb-2">Item Pesanan</p>
            <div className="space-y-2">
              {order.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between bg-canvas rounded-xl px-4 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-text">{it.nama_produk}</p>
                    <p className="text-xs text-text-secondary">{it.jumlah}x · {formatRupiah(it.harga_satuan)}</p>
                  </div>
                  <span className="text-sm font-bold">{formatRupiah(it.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between bg-gradient-to-r from-mint-light to-purple-50 rounded-2xl px-4 py-3">
            <span className="font-bold text-text">Total</span>
            <span className="text-lg font-bold text-mint-dark">{formatRupiah(order.total)}</span>
          </div>
          <button
            onClick={onEdit}
            className="w-full py-2.5 rounded-2xl border border-border text-sm font-bold text-text hover:bg-canvas flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" /> Edit Pesanan
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function PenjualanPage() {
  const { orders, isLoading, reload } = usePesanan();
  const { products } = useProducts();

  const [range, setRange] = useState<7 | 14 | 30>(30);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusPesanan | 'semua'>('semua');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pesanan'>('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editOrder, setEditOrder] = useState<Pesanan | null>(null);
  const [detailOrder, setDetailOrder] = useState<Pesanan | null>(null);

  const dailyStats = useMemo(() => getDailyStats(orders, range), [orders, range]);
  const productStats = useMemo(() => getProductStats(orders), [orders]);
  const summary = useMemo(() => getSummary(orders), [orders]);

  const filteredOrders = useMemo(() => orders.filter(o => {
    const matchS = o.nama_pelanggan.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search.toLowerCase());
    const matchF = statusFilter === 'semua' || o.status === statusFilter;
    return matchS && matchF;
  }), [orders, search, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin hapus pesanan ini?')) return;
    await deletePesanan(id);
    reload();
  };

  const handleStatusChange = async (id: string, s: StatusPesanan) => {
    await updatePesanan(id, { status: s });
    reload();
  };

  const productOptions = products.map(p => ({ id: p.id, nama: p.nama, harga: p.harga }));

  const summaryCards = [
    { label: 'Total Omzet', value: formatRupiah(summary.totalOmzet), sub: `dari ${summary.pesananSelesai} selesai`, icon: TrendingUp, gradient: 'from-violet-500 to-purple-600' },
    { label: 'Total Pesanan', value: String(summary.totalPesanan), sub: `${summary.pending} menunggu · ${summary.diproses} diproses`, icon: ShoppingBag, gradient: 'from-cyan-500 to-blue-600' },
    { label: 'Rata-rata Order', value: formatRupiah(summary.avgOrder), sub: 'per pesanan selesai', icon: BarChart2, gradient: 'from-emerald-500 to-teal-600' },
    { label: 'Selesai', value: String(summary.pesananSelesai), sub: `dari ${summary.totalPesanan} total`, icon: CheckCircle2, gradient: 'from-amber-500 to-orange-600' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-mint border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-text">Penjualan</h1>
          <p className="text-sm text-text-secondary mt-0.5">Kelola pesanan dan pantau performa toko</p>
        </div>
        <button
          onClick={() => { setEditOrder(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Tambah Pesanan
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-canvas rounded-2xl w-fit">
        {[
          { key: 'dashboard', label: 'Dashboard & Grafik', icon: BarChart2 },
          { key: 'pesanan', label: 'Manajemen Pesanan', icon: ShoppingBag },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'dashboard' | 'pesanan')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all',
              activeTab === tab.key ? 'bg-white text-text shadow-sm' : 'text-text-secondary hover:text-text'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD TAB ── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map(card => (
              <div key={card.label} className={cn('rounded-3xl p-5 text-white bg-gradient-to-br shadow-lg', card.gradient)}>
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-white/70 text-xs font-semibold mb-1">{card.label}</p>
                <p className="text-xl font-bold leading-tight">{card.value}</p>
                <p className="text-white/60 text-xs mt-1">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Range selector */}
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-heading)] text-base font-bold text-text">Grafik Penjualan</h2>
            <div className="flex gap-1 p-1 bg-canvas rounded-xl">
              {([7, 14, 30] as const).map(d => (
                <button key={d} onClick={() => setRange(d)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                    range === d ? 'bg-white text-text shadow-sm' : 'text-text-secondary hover:text-text')}>
                  {d} Hari
                </button>
              ))}
            </div>
          </div>

          {/* Omzet chart */}
          <div className="bg-white rounded-3xl border border-border/60 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text mb-1">Omzet Harian</h3>
            <p className="text-xs text-text-secondary mb-5">Berdasarkan pesanan berstatus Selesai</p>
            {orders.filter(o => o.status === 'selesai').length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-text-secondary">
                <BarChart2 className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Belum ada data penjualan selesai</p>
                <p className="text-xs mt-1">Tambah pesanan dan ubah status ke Selesai</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dailyStats} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gOmzet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<OmzetTooltip />} />
                  <Area type="monotone" dataKey="omzet" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gOmzet)" dot={false} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Row: Jumlah + Produk terlaris */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-border/60 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-text mb-1">Jumlah Pesanan Harian</h3>
              <p className="text-xs text-text-secondary mb-5">{range} hari terakhir</p>
              {orders.filter(o => o.status === 'selesai').length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-text-secondary">
                  <ShoppingBag className="w-8 h-8 mb-3 opacity-30" />
                  <p className="text-sm">Belum ada pesanan selesai</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={dailyStats} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CountTooltip />} />
                    <Bar dataKey="jumlah" fill="#06b6d4" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-border/60 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-text mb-1">Produk Terlaris</h3>
              <p className="text-xs text-text-secondary mb-5">Berdasarkan unit terjual</p>
              {productStats.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-text-secondary">
                  <Package className="w-8 h-8 mb-3 opacity-30" />
                  <p className="text-sm">Belum ada data produk terjual</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {productStats.slice(0, 5).map((p, i) => (
                    <div key={p.nama} className="flex items-center gap-3">
                      <span className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                        i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-400 text-white' : i === 2 ? 'bg-amber-600 text-white' : 'bg-canvas text-text-secondary'
                      )}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text truncate">{p.nama}</p>
                        <div className="mt-1 h-1.5 bg-canvas rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
                            style={{ width: `${(p.terjual / productStats[0].terjual) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-text">{p.terjual} pcs</p>
                        <p className="text-xs text-text-secondary">{formatRupiah(p.omzet)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row: Pie status + Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-border/60 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-text mb-1">Distribusi Status</h3>
              <p className="text-xs text-text-secondary mb-5">Semua pesanan</p>
              {orders.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-text-secondary">
                  <AlertCircle className="w-8 h-8 mb-3 opacity-30" />
                  <p className="text-sm">Belum ada pesanan</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={Object.entries(STATUS_CONFIG)
                        .map(([k, v]) => ({ name: v.label, value: orders.filter(o => o.status === k).length }))
                        .filter(d => d.value > 0)}
                      cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value"
                    >
                      {PIE_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <Tooltip formatter={v => [`${v} pesanan`]} />
                    <Legend iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-border/60 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-text mb-4">Pesanan Terbaru</h3>
              {orders.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-text-secondary">
                  <Clock className="w-8 h-8 mb-3 opacity-30" />
                  <p className="text-sm">Belum ada pesanan</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {orders.slice(0, 5).map(o => {
                    const cfg = STATUS_CONFIG[o.status];
                    return (
                      <div key={o.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-canvas cursor-pointer" onClick={() => setDetailOrder(o)}>
                        <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-4 h-4 text-violet-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text truncate">{o.nama_pelanggan}</p>
                          <p className="text-xs text-text-secondary">{new Date(o.tanggal_pesan).toLocaleDateString('id-ID')}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-text">{formatRupiah(o.total)}</p>
                          <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', cfg.bg, cfg.color)}>{cfg.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PESANAN TAB ── */}
      {activeTab === 'pesanan' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama pelanggan atau ID..."
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-mint"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <select
                value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusPesanan | 'semua')}
                className="pl-10 pr-8 py-2.5 border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-mint bg-white appearance-none cursor-pointer"
              >
                <option value="semua">Semua Status</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            </div>
          </div>

          <p className="text-sm text-text-secondary">
            Menampilkan <span className="font-bold text-text">{filteredOrders.length}</span> pesanan
          </p>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-border/60 p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-text-secondary mx-auto mb-3 opacity-30" />
              <p className="text-text-secondary font-semibold">Belum ada pesanan</p>
              <p className="text-sm text-text-secondary mt-1">Klik &quot;Tambah Pesanan&quot; untuk mencatat pesanan dari WA</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map(order => {
                const cfg = STATUS_CONFIG[order.status];
                return (
                  <div key={order.id} className="bg-white rounded-3xl border border-border/60 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-5 h-5 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-text">{order.nama_pelanggan}</p>
                          <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', cfg.bg, cfg.color)}>{cfg.label}</span>
                        </div>
                        <p className="text-xs text-text-secondary mb-2">
                          #{order.id.slice(-8).toUpperCase()} · Pesan: {new Date(order.tanggal_pesan).toLocaleDateString('id-ID')} · Ambil: {new Date(order.tanggal_pengambilan).toLocaleDateString('id-ID')}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {order.items.map((it, i) => (
                            <span key={i} className="text-xs bg-canvas px-2.5 py-1 rounded-full text-text-secondary font-medium">
                              {it.nama_produk} x{it.jumlah}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="text-base font-bold text-text">{formatRupiah(order.total)}</p>
                          <div className="flex items-center gap-2">
                            <select
                              value={order.status}
                              onChange={e => handleStatusChange(order.id, e.target.value as StatusPesanan)}
                              className={cn('text-xs font-bold px-2.5 py-1 rounded-xl border-0 cursor-pointer focus:outline-none', cfg.bg, cfg.color)}
                            >
                              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                              ))}
                            </select>
                            <button onClick={() => setDetailOrder(order)} className="p-2 rounded-xl hover:bg-canvas text-text-secondary">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => { setEditOrder(order); setShowForm(true); }} className="p-2 rounded-xl hover:bg-canvas text-text-secondary">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(order.id)} className="p-2 rounded-xl hover:bg-red-50 text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <OrderFormModal
          existing={editOrder}
          products={productOptions}
          onClose={() => { setShowForm(false); setEditOrder(null); }}
          onSave={reload}
        />
      )}
      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          onEdit={() => { setEditOrder(detailOrder); setDetailOrder(null); setShowForm(true); }}
        />
      )}
    </div>
  );
}

