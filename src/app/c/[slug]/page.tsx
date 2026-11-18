import { Metadata } from 'next';
import { getCatalogBySlug } from '@/lib/catalog-service';
import { CatalogLayout } from '@/components/catalog/CatalogLayout';
import { PreviewCatalogClient } from '@/components/self-serve/PreviewCatalogClient';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { headers } from 'next/headers';
import { PRODUCTION_DOMAIN, usesSubdomainRouting } from '@/lib/public-url';
import { isPreviewExpired, isPreviewOrder } from '@/lib/preview';

interface CatalogPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    edit?: string;
    new?: string;
    preview?: string;
    embed?: string;
  }>;
}

// 1. Geração Dinâmica de Meta-Tags OpenGraph (SSR Previews para WhatsApp / Instagram / Social)
export async function generateMetadata({ params }: CatalogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getCatalogBySlug(slug);

  if (!catalog) {
    return {
      title: 'Catálogo Não Encontrado | StudioMenu',
      description: 'O catálogo solicitado não existe ou expirou.',
    };
  }

  const title = `${catalog.studio_name || catalog.client_name} — Catálogo Exclusivo`;
  const description = `${catalog.hero_phrase} · Procedimentos, valores e agendamento online.`;
  // Precisa ser URL absoluta (é lida por crawlers externos pra gerar o
  // preview de link do WhatsApp/Facebook, não pelo navegador da visitante —
  // path relativo não funciona aqui). Domínio antigo trocado pelo real
  // (achado investigando o bug de carregamento lento de imagens, 2026-09-23
  // — apontava pro `lashmenu.com`, que não existe mais).
  //
  // Passa pela rota `/api/og/catalog/[slug]` (recorte 1200×630) em vez da
  // capa crua — o WhatsApp usa as dimensões REAIS da imagem, não o
  // `width`/`height` declarado abaixo, e a capa quase sempre é retrato
  // (selfie); isso fazia o card do link sair alto e estreito, espremendo
  // até o texto da mensagem que vinha junto (achado real reportado em
  // produção, 2026-09-28).
  const image = `https://${PRODUCTION_DOMAIN}/api/og/catalog/${slug}`;

  return {
    title: title,
    description: description,
    // Prévias gratuitas de 24h não devem ir pro Google.
    ...(isPreviewOrder(catalog) ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: title,
      description: description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [image],
    },
  };
}

// 2. Renderização SSR Principal da Página do Catálogo do Cliente
export default async function CatalogPage({ params, searchParams }: CatalogPageProps) {
  const { slug } = await params;
  const { edit, new: isNew, preview, embed } = await searchParams;
  const catalog = await getCatalogBySlug(slug);

  if (!catalog) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white text-center">
        <div className="max-w-sm w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl font-bold mb-2">Catálogo Não Encontrado</h1>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Não encontramos nenhum catálogo ativo para o endereço <code className="text-rose-400 font-mono">/c/{slug}</code>.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a Página Inicial</span>
          </Link>
        </div>
      </main>
    );
  }

  // Bloqueia tanto o link público quanto o link mágico de edição — a
  // profissional e a cliente dela veem a mesma mensagem amigável, sem
  // distinção (Fase 24). O acesso ao app (/app/slug) não passa por aqui,
  // continua normal de propósito. `catalog_payment_lapsed` (Fase 27) é o
  // equivalente automático disso pra Catálogo recorrente com cobrança
  // atrasada/cancelada — mesma tela, mesmo motivo de fundo (sem pagar, sem
  // catálogo no ar), só que sem precisar a admin desativar na mão.
  if (catalog.catalog_disabled || catalog.catalog_payment_lapsed) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-rose-50 text-center">
        <div className="max-w-sm w-full p-8 rounded-3xl bg-white border border-rose-100 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl font-bold mb-2 text-rose-900">Catálogo Temporariamente Indisponível</h1>
          <p className="text-sm text-rose-900/70 leading-relaxed">Volte em breve! 🌸</p>
        </div>
      </main>
    );
  }

  // Prévia gratuita do funil `/lash` (2026-11-17, ver `src/lib/preview.ts`).
  // Links relativos não funcionam no subdomínio dela (o proxy reescreve tudo
  // pra `/c/<slug>`), então no domínio oficial o funil vai com URL absoluta.
  const isPreview = isPreviewOrder(catalog);
  const hostname = ((await headers()).get('host') || '').split(':')[0];
  const funnelUrl = usesSubdomainRouting(hostname) ? `https://${PRODUCTION_DOMAIN}/lash` : '/lash';

  if (isPreview && isPreviewExpired(catalog)) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-rose-50 text-center">
        <div className="max-w-sm w-full p-8 rounded-3xl bg-white border border-rose-100 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl font-bold mb-2 text-rose-900">Essa prévia expirou</h1>
          <p className="text-sm text-rose-900/70 leading-relaxed mb-6">
            A prévia gratuita do menu fica disponível por 24 horas. Crie a sua de novo, leva só alguns segundos.
          </p>
          <a
            href={funnelUrl}
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Criar meu menu grátis</span>
          </a>
        </div>
      </main>
    );
  }

  // Prévia nunca entra em modo edição, nem com o token certo na URL.
  const isEditAuthorized = !isPreview && Boolean(edit && catalog.edit_token && edit === catalog.edit_token);
  // Preview isolado da oferta "Catálogo Completo" (2026-10-28) — só decide o
  // que o CatalogLayout mostra NESTA requisição; nunca grava nada em
  // `publicCatalog`/`orders`. Mesmo padrão de `hideCoverSection` (showroom),
  // só que forçando mostrar em vez de esconder.
  const forcePreviewFull = preview === 'completo';

  // Nunca repassar o edit_token real pro client component — ele nunca é lido no
  // client (que usa o token vindo da própria URL), e enviá-lo exporia a credencial
  // de edição de todo catálogo a qualquer visitante, não só a quem tem o link mágico.
  const { edit_token: _editToken, ...publicCatalog } = catalog;

  // Prévia grátis (2026-11-18): ganha os botões de Tema/Modelo do showroom,
  // que só trocam a aparência na tela — nada vai pro banco.
  if (isPreview && catalog.preview_expires_at) {
    return (
      <PreviewCatalogClient
        data={publicCatalog}
        previewMode={{ expiresAt: catalog.preview_expires_at, activateUrl: `${funnelUrl}#oferta`, showBanner: embed !== '1' }}
      />
    );
  }

  return (
    <>
      {/* Resíduo do flash de tema Luxury→Rosé (bug real, 2026-09-23 — o fix
       *  anterior em CatalogLayout.tsx resolveu o conteúdo do catálogo em
       *  si, mas o fundo do próprio <html>/<body> — por trás/ao redor do
       *  catálogo — continuava dependendo do useEffect lá, então ainda
       *  piscava por uma fração de segundo antes do JS rodar). Esse
       *  componente É Server Component (sabe `catalog.theme_variant` no
       *  servidor), então um <style> aqui sai pronto no HTML, sem
       *  depender de JavaScript nenhum — zero espaço pra flash. Só
       *  precisa existir pro Luxury: o Rosé já é o fundo padrão do body
       *  em globals.css, não tem nada pra sobrescrever. */}
      {catalog.theme_variant === 'luxury' && (
        <style>{`html, body { background: #0a0807; color: #f3efe9; }`}</style>
      )}
      <CatalogLayout
        data={publicCatalog}
        isEditMode={isEditAuthorized}
        editToken={edit || ''}
        isNewCatalog={isEditAuthorized && isNew === '1'}
        forcePreviewFull={forcePreviewFull}
        previewMode={
          isPreview && catalog.preview_expires_at
            ? { expiresAt: catalog.preview_expires_at, activateUrl: `${funnelUrl}#oferta`, showBanner: embed !== '1' }
            : undefined
        }
      />
    </>
  );
}
