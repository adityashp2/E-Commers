'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Mail, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleBypassLocal = () => {
    // Set developer admin cookie for offline/local development
    document.cookie = 'admin_session=active; path=/; max-age=86400';
    router.push('/admin/produk');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 1. Direct Local Admin Credentials Check
    if (
      (email === 'admin@toko.com' || email === 'admin@buket.com' || email === 'admin') &&
      password === 'admin123'
    ) {
      document.cookie = 'admin_session=active; path=/; max-age=86400';
      router.push('/admin/produk');
      return;
    }

    // 2. Supabase Auth Check
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Provide hint if failed
        setError('Email atau password salah. Jika belum setting akun Supabase, gunakan akun lokal di bawah.');
        return;
      }

      document.cookie = 'admin_session=active; path=/; max-age=86400';
      router.push('/admin/produk');
      router.refresh();
    } catch {
      setError('Terjadi kendala koneksi ke Supabase Auth.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink/30 via-canvas to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">🌸</span>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-text">
            Admin Panel
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Masuk untuk mengelola produk & konten toko Anda
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-xl border border-border/80 space-y-5">
          {error && (
            <div className="flex items-start gap-3 bg-red-50 text-red-600 p-3.5 rounded-xl text-xs font-medium" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="email" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text mb-1.5">
              <Mail className="w-3.5 h-3.5 text-mint-dark" />
              Email / Akun
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@toko.com"
              className="input-field py-2.5 text-sm"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text mb-1.5">
              <Lock className="w-3.5 h-3.5 text-mint-dark" />
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
              className="input-field py-2.5 text-sm"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3.5 text-sm font-bold shadow-md"
            disabled={isLoading}
          >
            {isLoading ? 'Memeriksa Akun...' : 'Masuk ke Admin Panel'}
          </button>

          {/* Quick Access Card Info */}
          <div className="mt-6 pt-5 border-t border-border/80 rounded-2xl bg-canvas p-4 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-text">
              <KeyRound className="w-3.5 h-3.5 text-mint-dark" />
              <span>Akun Default Admin Panel:</span>
            </div>
            <p className="text-text-secondary">
              Email: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-border text-text font-bold">admin@toko.com</code>
            </p>
            <p className="text-text-secondary">
              Password: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-border text-text font-bold">admin123</code>
            </p>
            
            <button
              type="button"
              onClick={handleBypassLocal}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-mint-light hover:bg-mint/30 text-mint-dark font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-mint/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Masuk Langsung (1-Klik Tanpa Password)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
