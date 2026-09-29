import { createBrowserClient } from '@supabase/ssr';

// Helper with timeout to prevent DNS lookup hang when offline/invalid URL
export function withTimeout<T>(promise: Promise<T> | PromiseLike<T>, ms = 1200): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Fetch timeout')), ms)
  );
  return Promise.race([Promise.resolve(promise), timeout]);
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
