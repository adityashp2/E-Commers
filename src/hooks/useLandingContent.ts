'use client';

import { useState, useEffect } from 'react';
import { createClient, withTimeout } from '@/lib/supabase/client';
import { DEFAULT_LANDING_CONTENT, LandingContent } from '@/lib/landingData';

const LOCAL_STORAGE_KEY = 'toko_buket_landing_content';

export function useLandingContent() {
  const [content, setContent] = useState<LandingContent>(DEFAULT_LANDING_CONTENT);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    function loadLocal() {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          setContent({ ...DEFAULT_LANDING_CONTENT, ...JSON.parse(cached) });
        }
      } catch {}
    }

    async function syncFromDb() {
      try {
        const supabase = createClient();
        const fetchPromise = supabase.from('konten_landing').select('*');
        const { data } = await withTimeout(
          fetchPromise as unknown as Promise<{ data: Array<{ key: string; value: string }> | null }>,
          1200
        );

        if (data && data.length > 0) {
          const map: Partial<LandingContent> = {};
          data.forEach((row) => {
            if (row.key in DEFAULT_LANDING_CONTENT) {
              (map as Record<string, string>)[row.key] = row.value;
            }
          });
          // Read local cache to retain explicitly cleared fields
          let localCached: Partial<LandingContent> = {};
          try {
            const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (raw) localCached = JSON.parse(raw);
          } catch {}

          const merged = { ...DEFAULT_LANDING_CONTENT, ...map, ...localCached };
          setContent(merged);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
          } catch {}
        }
      } catch {} finally {
        setIsLoading(false);
      }
    }

    // 1. Prioritaskan data local terkini
    loadLocal();
    setIsLoading(false);

    // 2. Sync cloud latar belakang
    syncFromDb();

    // Event listener tab yang sama & tab lain (storage event)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY) {
        loadLocal();
      }
    };

    window.addEventListener('landing-content-updated', loadLocal);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('landing-content-updated', loadLocal);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { content, isLoading };
}
