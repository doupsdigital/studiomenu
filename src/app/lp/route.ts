import { NextResponse } from 'next/server';

/** GET /lp — atalho por garantia (2026-11-18): leva pra página de Lash do
 *  anúncio (`/?nicho=lash`), repassando UTMs/fbclid da URL original. */
export function GET(request: Request) {
  const url = new URL(request.url);
  const target = new URL('/', url);
  url.searchParams.forEach((value, key) => target.searchParams.set(key, value));
  target.searchParams.set('nicho', 'lash');
  return NextResponse.redirect(target, 307);
}
