'use client';

import { useEffect, useState, type ComponentProps } from 'react';
import { CatalogLayout } from '@/components/catalog/CatalogLayout';
import type { LayoutModel, ThemeVariant } from '@/types/catalog';
import { useCoverToCatalogSnap } from './useCoverToCatalogSnap';

type CatalogLayoutProps = ComponentProps<typeof CatalogLayout>;

/** Prévia grátis do funil Lash com os botões de Tema (Rosé/Luxury) e Modelo
 *  (Mosaico/Clássico) do showroom (2026-11-18). A troca é na hora, na tela, e
 *  também é guardada na prévia (`/api/preview/style`, só pra quem gerou e só
 *  enquanto é prévia) — o menu já nasce ativado do jeito que ela escolheu.
 *  Se não der pra guardar (ex: outra pessoa abrindo o link), só não salva. */
function saveStyle(change: { theme?: ThemeVariant; layout?: LayoutModel }) {
  fetch('/api/preview/style', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(change),
    keepalive: true,
  }).catch(() => {});
}

export function PreviewCatalogClient({ data, previewMode }: Pick<CatalogLayoutProps, 'data' | 'previewMode'>) {
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>((data.theme_variant as ThemeVariant) || 'rose');
  const [layoutModel, setLayoutModel] = useState<LayoutModel>((data.layout_model as LayoutModel) || 'mosaico');

  // Dentro da revelação da `/lash` (iframe, 2026-11-26): avisa qual tela está
  // visível e qual tema está ativo, pras dicas animadas ("DESLIZE", "Clique
  // nos cards", "Mude as cores do tema") — mesmas mensagens do showroom
  // (`ShowcaseClient.tsx`), lidas pelo `PreviewRevealModal`.
  useEffect(() => {
    if (window.parent === window) return;
    const sections = document.querySelectorAll('[data-screen-label]');
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const label = entry.target.getAttribute('data-screen-label') || entry.target.id;
          window.parent.postMessage({ type: 'VITRINE_SCREEN_CHANGE', label }, '*');
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [layoutModel, themeVariant]);

  useEffect(() => {
    if (window.parent === window) return;
    window.parent.postMessage({ type: 'VITRINE_THEME_CHANGE', theme: themeVariant }, '*');
  }, [themeVariant]);

  // Capa → Serviços com uma deslizada (só na prévia, 2026-11-26).
  useCoverToCatalogSnap(`${layoutModel}-${themeVariant}`);

  return (
    <>
      {themeVariant === 'luxury' && <style>{`html, body { background: #0a0807; color: #f3efe9; }`}</style>}
      <CatalogLayout
        data={{ ...data, theme_variant: themeVariant, layout_model: layoutModel }}
        previewMode={previewMode}
        themeSwitcher={{
          value: themeVariant,
          onChange: (theme) => {
            setThemeVariant(theme);
            saveStyle({ theme });
          },
        }}
        layoutSwitcher={{
          value: layoutModel,
          onChange: (layout) => {
            setLayoutModel(layout);
            saveStyle({ layout });
          },
        }}
      />
    </>
  );
}
