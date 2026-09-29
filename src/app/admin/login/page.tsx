'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError || !data?.session) {
        setError('Email atau password salah. Pastikan kredensial admin Anda valid.');
        return;
      }

      // Tandai cookie sesi aktif setelah sukses autentikasi Supabase
      document.cookie = 'admin_session=active; path=/; max-age=86400; SameSite=Lax';
      router.push('/admin/produk');
      router.refresh();
    } catch {
      setError('Terjadi kendala saat menghubungi server autentikasi.');
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
              Email Admin
            </label>
            <input
              id="email"
              type="email"
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
              placeholder="••••••••"
              className="input-field py-2.5 text-sm"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3.5 text-sm font-bold shadow-md flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Memeriksa Akun...
              </>
            ) : (
              'Masuk ke Admin Panel'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
