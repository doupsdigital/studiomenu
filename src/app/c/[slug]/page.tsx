import { Metadata } from 'next';
import { getCatalogBySlug } from '@/lib/catalog-service';
import { CatalogLayout } from '@/components/catalog/CatalogLayout';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface CatalogPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    edit?: string;
    new?: string;
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
  const image = catalog.cover_media_url || catalog.avatar_url || 'https://studiomenu.art/modelos/mosaico/assets/img/Hero.webp';

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [
        {
          url: image,
          width: 800,
          height: 600,
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
  const { edit, new: isNew } = await searchParams;
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

  const isEditAuthorized = Boolean(edit && catalog.edit_token && edit === catalog.edit_token);

  // Nunca repassar o edit_token real pro client component — ele nunca é lido no
  // client (que usa o token vindo da própria URL), e enviá-lo exporia a credencial
  // de edição de todo catálogo a qualquer visitante, não só a quem tem o link mágico.
  const { edit_token: _editToken, ...publicCatalog } = catalog;

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
      />
    </>
  );
}
