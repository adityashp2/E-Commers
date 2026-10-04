'use client';

import { useState, useEffect } from 'react';
import { Flower2 } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const FALLBACK_BOUQUET_IMG = '';

export default function SafeImage({
  src,
  alt = 'Buket Bunga',
  fallbackSrc,
  className = '',
  ...props
}: SafeImageProps) {
  const cleanSrc = typeof src === 'string' && src.trim() !== '' ? src.trim() : '';
  const [imgSrc, setImgSrc] = useState<string>(cleanSrc);
  const [hasError, setHasError] = useState(false);

  // Sync state if src prop changes (e.g. from admin updates)
  useEffect(() => {
    const valid = typeof src === 'string' && src.trim() !== '' ? src.trim() : '';
    setImgSrc(valid);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (fallbackSrc && fallbackSrc.trim() !== '') {
        setImgSrc(fallbackSrc.trim());
      } else {
        setImgSrc('');
      }
    }
  };

  if (!imgSrc || hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-pink/20 text-mint-dark/50 ${className}`}>
        <Flower2 className="w-8 h-8 opacity-40" />
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={className}
      {...props}
    />
  );
}
