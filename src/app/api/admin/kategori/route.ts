import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

function isValidUUID(id?: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = getAdminClient();

    const payload: Record<string, unknown> = {
      nama: body.nama,
    };
    let result;
    if (isValidUUID(body.id)) {
      payload.id = body.id;
      result = await supabase.from('kategori').upsert(payload, { onConflict: 'id' }).select();
    } else {
      result = await supabase.from('kategori').insert(payload).select();
    }

    const { data, error } = result;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data: data?.[0] || body });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const supabase = getAdminClient();
    if (isValidUUID(id)) {
      const { error } = await supabase.from('kategori').delete().eq('id', id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
