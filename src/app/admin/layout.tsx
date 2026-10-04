'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Package, LayoutDashboard, Settings, LogOut, Image, Menu, X, Tag, TrendingUp } from 'lucide-react';

const navItems = [
  { href: '/admin/penjualan', label: 'Penjualan', icon: TrendingUp },
  { href: '/admin/produk', label: 'Produk', icon: Package },
  { href: '/admin/kategori', label: 'Kategori', icon: Tag },
  { href: '/admin/landing', label: 'Landing Page', icon: Image },
  { href: '/admin/pengaturan', label: 'Pengaturan', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Don't show admin layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    if (!window.confirm('Apakah Anda yakin ingin keluar dari Admin Panel?')) {
      return;
    }

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}

    // Clear local admin session
    document.cookie = 'admin_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    // Clear all Supabase auth cookies
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
      if (name.startsWith('sb-') || name.includes('auth-token') || name.includes('admin')) {
        document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        if (typeof window !== 'undefined') {
          document.cookie = `${name}=; path=/; domain=${window.location.hostname}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
      }
    });

    window.location.href = '/xmin/login';
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-canvas flex flex-col lg:flex-row">
      {/* Mobile sidebar backdrop overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar: Fixed height, pinned header & footer, only middle nav scrolls */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen h-[100dvh] max-h-screen max-h-[100dvh] w-72 max-w-[85vw] bg-white border-r border-border/80 z-50 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col shrink-0 overflow-hidden shadow-xl lg:shadow-none',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header - Stays pinned at top */}
        <div className="p-5 sm:p-6 border-b border-border/60 flex items-center justify-between shrink-0 bg-white">
          <Link href="/admin/produk" className="flex items-center gap-2.5">
            <span className="text-2xl">🌸</span>
            <div>
              <span className="font-[family-name:var(--font-heading)] text-lg font-bold text-text block leading-tight">
                Admin Panel
              </span>
              <span className="text-[11px] text-text-secondary">Toko Buket Management</span>
            </div>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-xl hover:bg-canvas text-text-secondary"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation - Only this area scrolls independently if items overflow */}
        <nav className="flex-1 min-h-0 p-3 sm:p-4 space-y-1.5 overflow-y-auto overscroll-contain" aria-label="Admin navigation">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all',
                  isActive
                    ? 'bg-mint text-text shadow-sm'
                    : 'text-text-secondary hover:bg-canvas hover:text-text'
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions - Stays pinned rock-solid at bottom */}
        <div className="p-4 border-t border-border/60 space-y-1 shrink-0 mt-auto bg-white">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-canvas hover:text-text transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 text-mint-dark" />
            <span>Lihat Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors w-full text-left"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top App Bar */}
        <header className="lg:hidden bg-white/95 backdrop-blur-md border-b border-border/80 px-4 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-1 rounded-xl hover:bg-canvas text-text touch-target flex items-center justify-center"
            aria-label="Buka menu navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1.5">
            <span>🌸</span>
            <span className="font-[family-name:var(--font-heading)] font-bold text-text text-base">
              Admin Panel
            </span>
          </div>

          <Link
            href="/"
            target="_blank"
            className="text-xs font-bold text-mint-dark bg-mint-light px-2.5 py-1.5 rounded-xl flex items-center gap-1"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Web</span>
          </Link>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
