import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - modelos, clientes (static legacy folders)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|modelos|clientes).*)',
  ],
};

export default function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  const parts = host.split('.');

  // Roteamento de Subdomínio (ex: jessica.studiomenu.art -> /c/jessica)
  if (
    parts.length >= 3 &&
    parts[0] !== 'www' &&
    parts[0] !== 'studiomenu' &&
    parts[0] !== 'lashmenu-vendas' &&
    !parts[0].includes('localhost') &&
    !parts[0].includes('vercel')
  ) {
    const slug = parts[0].toLowerCase().trim();

    // Um subdomínio de cliente serve só o catálogo dele — nunca o painel admin.
    if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Se acessar a raiz do subdomínio, reencaminha internamente para /c/[slug]
    if (url.pathname === '/' || url.pathname === '') {
      url.pathname = `/c/${slug}`;
      return NextResponse.rewrite(url);
    }
  }

  // Roteamento legado /catalogo?slug=xyz -> /c/xyz
  if (url.pathname === '/catalogo') {
    const slugParam = url.searchParams.get('slug') || url.searchParams.get('c');
    if (slugParam) {
      url.pathname = `/c/${slugParam}`;
      return NextResponse.redirect(url, 307);
    }
  }

  return NextResponse.next();
}
