'use client';

import { useState } from 'react';
import { Upload, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { compressImageToUnder200KB } from '@/lib/imageCompressor';

interface ImageUploadWithCompressProps {
  label: string;
  helperText?: string;
  initialUrl?: string;
  onImageSelected: (file: File | null, compressedUrl?: string) => void;
}

export default function ImageUploadWithCompress({
  label,
  helperText = 'Gambar otomatis dikompres ke WebP di bawah 200 KB',
  initialUrl = '',
  onImageSelected,
}: ImageUploadWithCompressProps) {
  const [preview, setPreview] = useState<string>(initialUrl);
  const [isCompressing, setIsCompressing] = useState(false);
  const [fileStats, setFileStats] = useState<{ orig: number; comp: number } | null>(null);
  const [error, setError] = useState('');

  // Synchronize when initialUrl prop updates from outside
  const [prevInitialUrl, setPrevInitialUrl] = useState(initialUrl);
  if (initialUrl !== prevInitialUrl) {
    setPrevInitialUrl(initialUrl);
    setPreview(initialUrl || '');
    if (!initialUrl) {
      setFileStats(null);
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('File harus berformat gambar (JPG, PNG, WebP)');
      return;
    }

    setError('');
    setIsCompressing(true);

    try {
      // Compress under 200 KB
      const result = await compressImageToUnder200KB(file, 195);
      
      // Convert to persistent base64 data URL for local storage / immediate use
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        setFileStats({
          orig: result.originalSizeKb,
          comp: result.compressedSizeKb,
        });
        onImageSelected(result.file, dataUrl);
      };
      reader.readAsDataURL(result.file);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses gambar';
      setError(msg);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    setFileStats(null);
    setError('');
    onImageSelected(null, '');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-text">{label}</label>
        {fileStats && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-mint-dark bg-mint-light px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            {fileStats.orig}KB &rarr; {fileStats.comp}KB (&lt;200KB)
          </span>
        )}
      </div>

      <div className="relative border-2 border-dashed border-border/80 hover:border-mint/50 rounded-2xl p-4 sm:p-5 text-center bg-canvas/40 transition-colors">
        {isCompressing ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-mint animate-spin" />
            <p className="text-sm font-medium text-text">Mengompresi gambar otomatis...</p>
            <p className="text-xs text-text-secondary">Target: &lt; 200 KB</p>
          </div>
        ) : preview ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden shadow-sm border border-border bg-white shrink-0">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text truncate">Foto siap diunggah</p>
              <p className="text-xs text-text-secondary mt-1">
                Format modern WebP dengan kompresi hemat bandwidth.
              </p>
              <div className="flex gap-2 mt-3">
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-text bg-white px-3 py-1.5 rounded-lg border border-border hover:border-mint transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Ganti
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer block py-6">
            <Upload className="w-8 h-8 text-mint-dark/50 mx-auto mb-2" />
            <p className="text-sm font-semibold text-text">Pilih atau Seret Foto ke Sini</p>
            <p className="text-xs text-text-secondary mt-1">{helperText}</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
