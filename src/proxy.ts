import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RESERVED_SLUGS } from '@/lib/reserved-slugs';

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

  // Checagem pelo host inteiro (não pelo primeiro label) — evita falso
  // positivo com slug de cliente que contenha "vercel"/"localhost" no nome
  // (ex: "vercelli-studio"), que antes era incorretamente tratado como se
  // fosse o próprio domínio da Vercel/ambiente local.
  const isVercelHost = host.endsWith('.vercel.app') || host === 'vercel.app';
  const isLocalHost = host.includes('localhost');

  // Roteamento de Subdomínio (ex: jessica.studiomenu.art -> /c/jessica)
  if (
    parts.length >= 3 &&
    !RESERVED_SLUGS.includes(parts[0]) &&
    !isLocalHost &&
    !isVercelHost
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
