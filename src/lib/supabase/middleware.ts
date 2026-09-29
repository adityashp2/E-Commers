import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const adminCookie = request.cookies.get('admin_session')?.value;
  const isLocalAdmin = adminCookie === 'active';

  const hasSbCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));

  const isAuthenticated = isLocalAdmin || hasSbCookie;

  // Proteksi rute admin (kecuali /admin/login yang di-redirect ke /xmin/login)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (request.nextUrl.pathname === '/admin/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/xmin/login';
      return NextResponse.redirect(url);
    }

    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/xmin/login';
      return NextResponse.redirect(url);
    }
  }

  // Jika sudah login dan buka /xmin/login, arahkan ke dashboard
  if (request.nextUrl.pathname === '/xmin/login' && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/produk';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
