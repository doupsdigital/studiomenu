'use client';

import { useEffect, useState } from 'react';
import { LayoutModel, ThemeVariant, NicheType } from '@/types/catalog';
import { CatalogLayout } from '@/components/catalog/CatalogLayout';
import { StylePickerPanel } from '@/components/catalog/StylePickerPanel';
import { nichePresetsMap } from '@/data/niche-presets';

interface ShowcaseClientProps {
  niche: NicheType;
}

export function ShowcaseClient({ niche }: ShowcaseClientProps) {
  const basePreset = nichePresetsMap[niche];

  const [layoutModel, setLayoutModel] = useState<LayoutModel>(basePreset?.layout_model || 'mosaico');
  // Sempre abre no Rose, mesmo pra nichos cujo preset é Luxury por padrão
  // (ex: Nail, Estética, Studio) — pedido real, 2026-10-01: ela manda esse
  // link pra leads de anúncio como primeiro contato, e quer sempre o mesmo
  // tema de abertura (ela mesma troca pelo painel Personalizar se quiser
  // mostrar o Luxury depois). Layout (Mosaico/Clássico) continua herdando
  // do preset normalmente — só o tema foi fixado.
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>('rose');
  // Na capa (#hero) faz mais sentido mostrar o seletor de Tema; a partir da tela
  // de procedimentos (#catalogo) em diante, o que se destaca é o Modelo (grid vs lista).
  const [onCoverScreen, setOnCoverScreen] = useState(true);

  useEffect(() => {
    const heroEl = document.getElementById('hero');
    if (!heroEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => setOnCoverScreen(entry.isIntersecting),
      { threshold: 0.5 }
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, [niche, layoutModel, themeVariant]);

  if (!basePreset) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white text-center">
        <div className="max-w-sm w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          <h1 className="font-serif text-2xl font-bold mb-2">Modelo Não Encontrado</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Não existe um modelo de vitrine para o nicho <code className="text-rose-400 font-mono">{niche}</code>.
          </p>
        </div>
      </main>
    );
  }

  const catalog = {
    ...basePreset,
    layout_model: layoutModel,
    theme_variant: themeVariant,
    cover_media_url: layoutModel === 'classico' ? '/modelos/classico/assets/img/Hero.webp' : '/modelos/mosaico/assets/img/Hero.webp',
    avatar_url: layoutModel === 'classico' ? '/modelos/classico/assets/img/Hero.webp' : '/modelos/mosaico/assets/img/Hero.webp',
    // Liga o botão "Agendar agora" pra mostrar a simulação de agendamento
    // automático (`demoBookingOnly` no CatalogLayout abaixo) — o preset
    // não tem `booking_enabled`/`duration_minutes` de verdade porque não
    // existe profissional real por trás; só nesse objeto em memória, não
    // mexe no preset fonte (2026-09-24).
    booking_enabled: true,
    procedures: basePreset.procedures.map((p) => ({ ...p, duration_minutes: p.duration_minutes ?? 60 })),
    // Endereço fictício só pra dar pra mostrar o botão de Localização
    // funcionando na vitrine (não existe profissional real por trás, então
    // não mexe no preset fonte — mesmo espírito do booking_enabled acima).
    address: 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Avenida+Paulista+1578+S%C3%A3o+Paulo',
  };

  return (
    <div className="relative min-h-screen">
      <StylePickerPanel
        layoutModel={layoutModel}
        themeVariant={themeVariant}
        onChangeLayout={setLayoutModel}
        onChangeTheme={setThemeVariant}
        onCoverScreen={onCoverScreen}
        // Começa aberto de propósito (pedido, 2026-09-23) — é o link que
        // ela manda pra cliente testar os modelos, então o controle de
        // tema/layout precisa já estar visível de cara, não escondido
        // atrás de um toque. Mesmo comportamento também usado no mockup
        // de celular da home (`SalesLandingPage.tsx`).
        defaultOpen
      />

      {/* Renderização do Catálogo Real — mesmo componente usado nos catálogos de clientes.
          CatalogLayout re-sincroniza sozinho ao trocar modelo/tema, preservando o scroll. */}
      <CatalogLayout data={catalog} demoBookingOnly />
    </div>
  );
}
