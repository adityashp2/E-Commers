'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Info, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/katalog', label: 'Katalog' },
  { href: '/#tentang', label: 'Tentang Kami' },
  { href: '/#kontak', label: 'Kontak' },
];

const bottomNavItems = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/katalog', label: 'Katalog', icon: LayoutGrid },
  { href: '/#tentang', label: 'Tentang', icon: Info },
  { href: '/keranjang', label: 'Keranjang', icon: ShoppingBag },
];

function CartBadge({ count, size = 'normal' }: { count: number; size?: 'normal' | 'small' }) {
  if (count <= 0) return null;
  const display = count > 99 ? '99+' : count;

  if (size === 'small') {
    return (
      <span className="absolute -top-1.5 -right-2.5 bg-mint text-white text-[10px] font-bold min-w-4 h-4 px-0.5 rounded-full flex items-center justify-center leading-none">
        {display}
      </span>
    );
  }

  return (
    <span className="absolute -top-1 -right-1 bg-mint text-white text-xs font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center leading-none">
      {display}
    </span>
  );
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('buket-cart') || '[]');
        const count = cart.reduce((sum: number, item: { jumlah: number }) => sum + item.jumlah, 0);
        setCartCount(count);
        setIsBouncing(true);
        setTimeout(() => setIsBouncing(false), 700);
      } catch {
        setCartCount(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('cart-updated', updateCartCount);
    updateCartCount();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, []);

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/#')) return false;
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Top header bar */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_8px_rgba(58,42,48,0.08)]'
            : 'bg-white/90 backdrop-blur-md md:bg-transparent shadow-xs md:shadow-none'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo — brand name only, no emoji */}
            <Link href="/" className="group">
              <span className="font-[family-name:var(--font-heading)] text-xl md:text-2xl font-bold text-text group-hover:text-mint transition-colors">
                Toko Buket
              </span>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-8" aria-label="Navigasi utama">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'font-medium text-[0.9375rem] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-mint after:transition-all',
                    isActive(link.href)
                      ? 'text-mint after:w-full'
                      : 'text-text-secondary hover:text-mint after:w-0 hover:after:w-full'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop cart icon */}
            <Link
              id="desktop-cart-btn"
              data-cart-icon="true"
              href="/keranjang"
              className={cn(
                "hidden md:flex relative p-2 rounded-full hover:bg-pink/30 transition-transform",
                isBouncing && "animate-cart-bounce"
              )}
              aria-label={`Keranjang belanja, ${cartCount} item`}
            >
              <ShoppingBag className="w-6 h-6 text-text" strokeWidth={1.8} />
              <CartBadge count={cartCount} />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border pb-[env(safe-area-inset-bottom)]"
        aria-label="Navigasi mobile"
      >
        <div className="flex items-stretch justify-around">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const isCart = item.href === '/keranjang';

            return (
              <Link
                key={item.href}
                href={item.href}
                id={isCart ? 'mobile-cart-btn' : undefined}
                data-cart-icon={isCart ? 'true' : undefined}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[48px] py-2 px-1 transition-colors',
                  active ? 'text-mint' : 'text-text-secondary',
                  isCart && isBouncing && 'animate-cart-bounce'
                )}
                aria-label={isCart && cartCount > 0 ? `${item.label}, ${cartCount} item` : item.label}
              >
                <span className="relative">
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.8} />
                  {isCart && <CartBadge count={cartCount} size="small" />}
                </span>
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
