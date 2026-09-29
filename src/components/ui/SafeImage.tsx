'use client';

import { useState, useEffect } from 'react';
import { Flower2 } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const FALLBACK_BOUQUET_IMG =
  'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&q=80';

export default function SafeImage({
  src,
  alt = 'Buket Bunga',
  fallbackSrc = FALLBACK_BOUQUET_IMG,
  className = '',
  ...props
}: SafeImageProps) {
  const initialSrc = typeof src === 'string' && src ? src : fallbackSrc;
  const [imgSrc, setImgSrc] = useState<string>(initialSrc);
  const [hasError, setHasError] = useState(false);

  // Sync state if src prop changes (e.g. from admin updates)
  useEffect(() => {
    if (src && typeof src === 'string' && src.trim() !== '') {
      setImgSrc(src);
      setHasError(false);
    } else {
      setImgSrc(fallbackSrc);
    }
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  if (!imgSrc && hasError) {
    return (
      <div className={`flex items-center justify-center bg-pink/20 ${className}`}>
        <Flower2 className="w-8 h-8 text-mint-dark/50" />
      </div>
    );
  }

  return (
    <img
      src={imgSrc || fallbackSrc}
      alt={alt}
      onError={handleError}
      className={className}
      {...props}
    />
  );
}
