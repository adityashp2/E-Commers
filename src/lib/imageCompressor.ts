/**
 * Client-side browser image compression using HTML5 Canvas.
 * Compresses any image to WebP/JPEG under target size (default < 200 KB).
 */

export interface CompressionResult {
  file: File;
  previewUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
}

export async function compressImageToUnder200KB(
  file: File,
  maxSizeKB = 200,
  maxDimension = 1400
): Promise<CompressionResult> {
  const originalSizeKb = Math.round(file.size / 1024);

  // If already under 200KB and in acceptable web format, still create valid preview
  if (originalSizeKb <= maxSizeKB && ['image/webp', 'image/jpeg'].includes(file.type)) {
    return {
      file,
      previewUrl: URL.createObjectURL(file),
      originalSizeKb,
      compressedSizeKb: originalSizeKb,
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('File bukan gambar yang valid'));
      img.onload = async () => {
        try {
          // Calculate scale keeping aspect ratio
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context tidak tersedia'));
            return;
          }

          // Fill white background in case of transparent PNGs converted to JPEG/WebP
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Binary search / step-down quality compression to get under maxSizeKB
          let quality = 0.88;
          let blob: Blob | null = null;
          const outputType = 'image/webp'; // modern highly compressed format

          for (let attempt = 0; attempt < 6; attempt++) {
            blob = await new Promise<Blob | null>((res) =>
              canvas.toBlob((b) => res(b), outputType, quality)
            );

            if (blob && blob.size <= maxSizeKB * 1024) {
              break;
            }

            // Reduce quality gradually
            quality -= 0.14;
            if (quality < 0.3) {
              // Also scale down canvas dimensions if quality is already low
              canvas.width = Math.round(canvas.width * 0.85);
              canvas.height = Math.round(canvas.height * 0.85);
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              quality = 0.65;
            }
          }

          if (!blob) {
            reject(new Error('Gagal mengompres gambar'));
            return;
          }

          // Create new File with .webp extension
          const cleanName = file.name.replace(/\.[^/.]+$/, '');
          const compressedFile = new File([blob], `${cleanName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          const compressedSizeKb = Math.round(compressedFile.size / 1024);
          const previewUrl = URL.createObjectURL(compressedFile);

          resolve({
            file: compressedFile,
            previewUrl,
            originalSizeKb,
            compressedSizeKb,
          });
        } catch (err) {
          reject(err);
        }
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
