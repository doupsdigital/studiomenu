import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getCatalogBySlug } from '@/lib/catalog-service';
import { CatalogLayout } from '@/components/catalog/CatalogLayout';

interface CatalogoPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CatalogoPage({ params }: CatalogoPageProps) {
  const { slug } = await params;
  const catalog = await getCatalogBySlug(slug);

  if (!catalog || !catalog.edit_token) notFound();

  return (
    <>
      {/* A navegação de abas fica escondida nesta rota (ver BottomNav) porque
          colide com a barra flutuante do próprio editor — este é o único
          jeito de voltar pro resto do app enquanto o editor está aberto. */}
      <Link
        href={`/app/${slug}/inicio`}
        aria-label="Voltar pro app"
        className="fixed top-3 left-3 z-[999995] w-9 h-9 rounded-full bg-rose-950/70 backdrop-blur border border-white/15 text-white flex items-center justify-center"
      >
        <ArrowLeft className="w-4 h-4" />
      </Link>
      <CatalogLayout data={catalog} isEditMode={true} editToken={catalog.edit_token} />
    </>
  );
}
