import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  // 1. Cek sesi cookie admin (local atau Supabase)
  const adminCookie = request.cookies.get('admin_session')?.value;
  const isLocalAdmin = adminCookie === 'active';

  // Cek token Supabase auth cookie jika ada
  const hasSbCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));

  const isAuthenticated = isLocalAdmin || hasSbCookie;

  // 2. Proteksi rute admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/xmin/login';
      return NextResponse.redirect(url);
    }
  }

  // 3. Redirect /admin/login ke /xmin/login
  if (request.nextUrl.pathname === '/admin/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/xmin/login';
    return NextResponse.redirect(url);
  }

  // 4. Jika sudah login dan buka /xmin/login, arahkan ke dashboard produk
  if (request.nextUrl.pathname === '/xmin/login' && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/produk';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
