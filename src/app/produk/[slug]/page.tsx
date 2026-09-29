import { createClient, withTimeout } from '@/lib/supabase/client';
import { Produk } from '@/types';
import { MOCK_PRODUCTS } from '@/lib/mockData';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  let product: Produk | null = null;

  try {
    const supabase = createClient();
    const fetchPromise = supabase
      .from('produk')
      .select('*, kategori:kategori_id(id, nama)')
      .eq('slug', slug)
      .single();

    const { data } = await withTimeout(
      fetchPromise as unknown as Promise<{ data: Produk | null }>,
      1000
    );

    if (data) {
      product = data;
    }
  } catch {}

  // Fallback to mock data if match found
  if (!product) {
    product = MOCK_PRODUCTS.find((p) => p.slug === slug) || null;
  }

  return <ProductDetailClient slug={slug} initialProduct={product} />;
}
