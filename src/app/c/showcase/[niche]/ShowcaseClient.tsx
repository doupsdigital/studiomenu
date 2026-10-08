'use client';

import { useEffect, useState } from 'react';
import { LayoutModel, ThemeVariant, NicheType, CatalogOrderData } from '@/types/catalog';
import { CatalogLayout } from '@/components/catalog/CatalogLayout';
import { nichePresetsMap } from '@/data/niche-presets';

interface ShowcaseClientProps {
  niche: NicheType;
  /** Só o Estúdio de Vídeos (admin) usa isso, via ?modo=basico na URL —
   *  simula o plano Básico (botão "Agendar" cai na simulação de WhatsApp
   *  em vez do assistente de agendamento automático). Link normal que vai
   *  pra lead nunca tem esse parâmetro, então o comportamento de sempre
   *  (demo do Plus) continua intacto. */
  forceBasico?: boolean;
  /** Capa fixa pras rotas duplicadas `lashs`/`nails` (pedido real,
   *  2026-10-07) — substitui o Hero.webp genérico do layout escolhido.
   *  `undefined` nas rotas de sempre (lash/nail/lashdesigner/naildesigner),
   *  que continuam exatamente como eram. */
  coverOverride?: string;
  /** Preset próprio pra rotas dedicadas (ex: `landingpage`, pedido real,
   *  2026-10-08) — substitui o preset padrão do nicho (`nichePresetsMap`),
   *  pra poder editar serviços/textos livremente sem afetar o showroom
   *  real do nicho nem catálogos de clientes. */
  presetOverride?: CatalogOrderData;
}

export function ShowcaseClient({ niche, forceBasico = false, coverOverride, presetOverride }: ShowcaseClientProps) {
  const basePreset = presetOverride || nichePresetsMap[niche];

  const [layoutModel, setLayoutModel] = useState<LayoutModel>(basePreset?.layout_model || 'mosaico');
  // Sempre abre no Rose, mesmo pra nichos cujo preset é Luxury por padrão
  // (ex: Nail, Estética, Studio) — pedido real, 2026-10-01: ela manda esse
  // link pra leads de anúncio como primeiro contato, e quer sempre o mesmo
  // tema de abertura (ela mesma troca pelos botões Rosé/Luxury se quiser
  // mostrar o Luxury depois). Chegou a abrir Studio direto em Luxury
  // (2026-10-08), mas testando na prática no celular não ficou legal —
  // revertido no mesmo dia. Layout (Mosaico/Clássico) continua herdando do
  // preset normalmente — só o tema foi fixado.
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>('rose');

  // Avisa o pai (mockup da landing page) qual tela está visível, pro
  // indicador de deslize/toque trocar de lado — pedido real, 2026-10-08,
  // re-port do indicador dinâmico que só existia no legado. Observa TODAS
  // as seções (não só a capa) pra sumir também fora da tela de
  // procedimentos (ex: Orientações, Contato), não só na capa.
  useEffect(() => {
    if (window.parent === window) return;
    const sections = document.querySelectorAll('[data-screen-label]');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const label = entry.target.getAttribute('data-screen-label') || entry.target.id;
            window.parent.postMessage({ type: 'VITRINE_SCREEN_CHANGE', label }, '*');
          }
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach((el) => observer.observe(el));
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
    cover_media_url: coverOverride || (layoutModel === 'classico' ? '/modelos/classico/assets/img/Hero.webp' : '/modelos/mosaico/assets/img/Hero.webp'),
    avatar_url: coverOverride || (layoutModel === 'classico' ? '/modelos/classico/assets/img/Hero.webp' : '/modelos/mosaico/assets/img/Hero.webp'),
    // Liga o botão "Agendar agora" pra mostrar a simulação de agendamento
    // automático (`demoBookingOnly` no CatalogLayout abaixo) — o preset
    // não tem `booking_enabled`/`duration_minutes` de verdade porque não
    // existe profissional real por trás; só nesse objeto em memória, não
    // mexe no preset fonte (2026-09-24).
    booking_enabled: true,
    // Modo Básico do Estúdio de Vídeos (2026-10-02): agenda_paused liga a
    // mesma simulação que um catálogo Plus real usa quando pausa a agenda
    // temporariamente — cai na simulação de WhatsApp em vez do agendamento
    // automático. Default false preserva o link normal da vitrine intacto.
    agenda_paused: forceBasico,
    procedures: basePreset.procedures.map((p) => ({ ...p, duration_minutes: p.duration_minutes ?? 60 })),
    // Endereço fictício só pra dar pra mostrar o botão de Localização
    // funcionando na vitrine (não existe profissional real por trás, então
    // não mexe no preset fonte — mesmo espírito do booking_enabled acima).
    address: 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Avenida+Paulista+1578+S%C3%A3o+Paulo',
  };

  return (
    <div className="relative min-h-screen">
      {/* Mesma correção já aplicada na página pública (`/c/[slug]/page.tsx`)
       *  — sem isso, o fundo do html/body fica no Rosé padrão do
       *  globals.css por uma fração de segundo antes do tema Luxury
       *  "pintar" por cima, um flash visível ao carregar ou recarregar a
       *  página (achado real, 2026-10-08: nunca tinha chegado no showroom,
       *  só na página real). Aqui reage a `themeVariant` (estado, pode
       *  mudar pelo seletor), não só ao nicho inicial. */}
      {themeVariant === 'luxury' && (
        <style>{`html, body { background: #0a0807; color: #f3efe9; }`}</style>
      )}
      {/* Painel flutuante "Personalizar" removido (pedido real, 2026-10-08) —
       *  Tema (Rosé/Luxury) e Modelo (Mosaico/Clássico) agora são botões
       *  inline, flanqueando o selo "Seja Bem Vinda" e a etiqueta do
       *  catálogo, respectivamente. Ver `themeSwitcher`/`layoutSwitcher`
       *  abaixo, repassados até `HeaderCover`/`ProcedureGrid`. */}
      <CatalogLayout
        data={catalog}
        demoBookingOnly
        themeSwitcher={{ value: themeVariant, onChange: setThemeVariant }}
        layoutSwitcher={{ value: layoutModel, onChange: setLayoutModel }}
      />
    </div>
  );
}
