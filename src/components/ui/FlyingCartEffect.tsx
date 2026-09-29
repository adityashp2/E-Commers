'use client';

import { useEffect, useState } from 'react';

interface FlyingParticle {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  icon: string;
}

const ICONS = ['🌸', '💐', '🌹', '✨', '🌷'];

export default function FlyingCartEffect() {
  const [particles, setParticles] = useState<FlyingParticle[]>([]);

  useEffect(() => {
    const handleCartFly = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number }>;
      const startX = customEvent.detail?.x || window.innerWidth / 2;
      const startY = customEvent.detail?.y || window.innerHeight / 2;

      // Cari posisi cart icon (bisa di desktop navbar atau mobile bottom nav)
      const isMobile = window.innerWidth < 768;
      const cartTarget = isMobile
        ? document.getElementById('mobile-cart-btn') || document.querySelector('[data-cart-icon]')
        : document.getElementById('desktop-cart-btn') || document.querySelector('[data-cart-icon]');

      let targetX = window.innerWidth - 60;
      let targetY = 30;

      if (cartTarget) {
        const rect = cartTarget.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
      } else if (isMobile) {
        targetX = window.innerWidth * 0.85;
        targetY = window.innerHeight - 30;
      }

      const randomIcon = ICONS[Math.floor(Math.random() * ICONS.length)];
      const id = Date.now() + Math.random();

      setParticles((prev) => [
        ...prev,
        { id, startX, startY, targetX, targetY, icon: randomIcon },
      ]);

      // Bersihkan particle setelah selesai animasi
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== id));
      }, 950);
    };

    window.addEventListener('fly-to-cart', handleCartFly);
    return () => window.removeEventListener('fly-to-cart', handleCartFly);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {particles.map((p) => {
        // Hitung jarak & lintasan parabola
        const dx = p.targetX - p.startX;
        const dy = p.targetY - p.startY;

        return (
          <div
            key={p.id}
            className="absolute text-2xl filter drop-shadow-md select-none animate-cart-fly"
            style={
              {
                left: `${p.startX}px`,
                top: `${p.startY}px`,
                '--fly-dx': `${dx}px`,
                '--fly-dy': `${dy}px`,
              } as React.CSSProperties
            }
          >
            <div className="animate-spin-wiggle">{p.icon}</div>
          </div>
        );
      })}
    </div>
  );
}
