'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatPhoneBR } from '@/lib/format';
import { NicheType, LayoutModel, ThemeVariant } from '@/types/catalog';
import { nichePresetsMap } from '@/data/niche-presets';
import { NICHE_OPTIONS } from '@/data/niche-options';
import { CatalogLayout } from '@/components/catalog/CatalogLayout';
import { StylePickerPanel } from '@/components/catalog/StylePickerPanel';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Clock,
  ClipboardList,
  Gem,
  Lightbulb,
  Scissors,
} from 'lucide-react';
import Link from 'next/link';

interface OnboardingFormProps {
  /** Mostra a tela de boas-vindas (Etapa 0) antes do Passo 1 — ideal para clientes
   *  que acabaram de comprar. Quando false, abre direto no preenchimento (ideal
   *  para envio por WhatsApp/X1). */
  withWelcome?: boolean;
}

export function OnboardingForm({ withWelcome = false }: OnboardingFormProps) {
  const router = useRouter();

  // Etapa 0: Tela de Boas-vindas (opcional)
  const [showWelcome, setShowWelcome] = useState(withWelcome);
  const [showLaterNote, setShowLaterNote] = useState(false);

  // Estado das Etapas (1: Identidade, 2: Nicho, 3: Estilo ao vivo)
  const [currentStep, setCurrentStep] = useState(1);

  const [clientName, setClientName] = useState('');
  const [whatsappDisplay, setWhatsappDisplay] = useState('');
  const [niche, setNiche] = useState<NicheType>('lash');

  const preset = nichePresetsMap[niche];
  const [layoutModel, setLayoutModel] = useState<LayoutModel>(preset.layout_model);
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>(preset.theme_variant);
  const [onCoverScreen, setOnCoverScreen] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const whatsappDigits = whatsappDisplay.replace(/\D/g, '');

  // No Passo 3 (preview ao vivo): na capa destaca o Tema; a partir da tela de
  // procedimentos em diante, destaca o Modelo. Mesmo comportamento do Showroom.
  useEffect(() => {
    if (currentStep !== 3) return;
    const heroEl = document.getElementById('hero');
    if (!heroEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => setOnCoverScreen(entry.isIntersecting),
      { threshold: 0.5 }
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, [currentStep, niche, layoutModel, themeVariant]);

  // Ao trocar o nicho, reseta modelo/tema pro padrão do preset correspondente
  const handleNicheChange = (newNiche: NicheType) => {
    setNiche(newNiche);
    setLayoutModel(nichePresetsMap[newNiche].layout_model);
    setThemeVariant(nichePresetsMap[newNiche].theme_variant);
  };

  // Publicação Final no Supabase — cria o pedido e já redireciona pro catálogo real,
  // em modo edição, com os dados do preset do nicho + estilo escolhidos ao vivo
  const handleCreateCatalog = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/onboarding/create-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, whatsappDigits, niche, layoutModel, themeVariant }),
      });
      const result = await res.json();

      if (!result.success) {
        throw new Error(result.message || 'Erro ao criar o catálogo. Tente novamente.');
      }

      const { slug: finalSlug, editToken } = result;

      // Notifica o admin no Telegram (não bloqueia o fluxo se falhar)
      fetch('/api/notify-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          whatsapp: whatsappDigits,
          layoutModel,
          themeVariant,
          slug: finalSlug,
          editToken,
        }),
      }).catch((err) => console.warn('Aviso: falha ao notificar Telegram:', err));

      // Cai direto no catálogo real, já em modo edição, com o overlay de boas-vindas
      router.push(`/c/${finalSlug}?edit=${editToken}&new=1`);
    } catch (err: any) {
      console.error('Erro ao criar catálogo:', err);
      setErrorMsg(err.message || 'Erro ao criar o catálogo. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  // Etapa 0: Tela de Boas-vindas (só quando withWelcome=true, para clientes pós-compra)
  if (showWelcome) {
    return (
      <main className="min-h-screen bg-slate-950 text-white py-10 px-4">
        <div className="max-w-xl mx-auto">
          <header className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-1.5 font-serif text-2xl font-bold tracking-tight mb-1 text-white">
              Studio<span className="text-rose-400 font-normal italic">Menu</span>
            </Link>
          </header>

          <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Boas-vindas ao StudioMenu</span>
            </div>

            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-white leading-tight">
                Parabéns pela sua compra!{' '}
                <span className="text-rose-400 italic">Seu catálogo oficial está a poucos minutos de ir ao ar.</span>
              </h1>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Você vai criar seu catálogo já vendo como ele fica de verdade, ao vivo — nada de preencher formulário às cegas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <Clock className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-xs text-white">Rápido & Prático</h3>
                <p className="text-[11px] text-slate-400 leading-snug">Menos de 2 minutos até ver seu catálogo no ar.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <ClipboardList className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-xs text-white">Feedback Visual</h3>
                <p className="text-[11px] text-slate-400 leading-snug">Você escolhe o estilo já vendo o resultado real.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <Gem className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-xs text-white">Ativação VIP</h3>
                <p className="text-[11px] text-slate-400 leading-snug">Revisamos e ativamos seu link exclusivo.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/[0.03] border border-slate-800">
              <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-slate-200">Não pode preencher tudo agora?</strong> Sem problemas! Depois de criado,
                você pode fechar e voltar ao catálogo quando quiser usando o link mágico de edição.
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowWelcome(false)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:opacity-95 font-bold text-xs tracking-wider uppercase text-white flex items-center justify-center gap-2 shadow-lg"
              >
                <span>✨ Sim, quero criar meu catálogo agora!</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowLaterNote((v) => !v)}
                className="w-full py-2 text-[11px] font-semibold text-slate-400 hover:text-slate-300 text-center"
              >
                Estou apenas espiando (posso preencher depois)
              </button>

              {showLaterNote && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed text-center">
                  Sem problemas! Guarde este link — quando estiver pronta, é só voltar aqui pra criar seu catálogo oficial. 💖
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // PASSO 3: Estilo ao Vivo — preview real em tela cheia do catálogo, com o painel
  // flutuante de Personalizar (Tema/Modelo) e um CTA fixo pra confirmar a criação.
  if (currentStep === 3) {
    const previewCatalog = {
      ...preset,
      client_name: clientName || preset.client_name,
      whatsapp_number: whatsappDigits || preset.whatsapp_number,
      layout_model: layoutModel,
      theme_variant: themeVariant,
      cover_media_url:
        layoutModel === 'classico' ? '/modelos/classico/assets/img/Hero.png' : '/modelos/mosaico/assets/img/Hero.png',
      avatar_url:
        layoutModel === 'classico' ? '/modelos/classico/assets/img/Hero.png' : '/modelos/mosaico/assets/img/Hero.png',
    };

    return (
      <div className="relative min-h-screen pb-24 lm-preview-no-wsp-float">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="fixed top-4 right-4 z-50 w-9 h-9 rounded-full bg-slate-950/90 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center shadow-2xl"
          title="Voltar"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <StylePickerPanel
          layoutModel={layoutModel}
          themeVariant={themeVariant}
          onChangeLayout={setLayoutModel}
          onChangeTheme={setThemeVariant}
          onCoverScreen={onCoverScreen}
          defaultOpen
        />

        <CatalogLayout data={previewCatalog} />

        {errorMsg && (
          <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto p-3 rounded-xl bg-rose-500/95 backdrop-blur text-white text-xs text-center font-medium shadow-2xl">
            {errorMsg}
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
          <button
            type="button"
            onClick={handleCreateCatalog}
            disabled={isSubmitting}
            className="w-full max-w-md mx-auto flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 disabled:opacity-60 font-bold text-xs tracking-wider uppercase text-white shadow-2xl"
          >
            {isSubmitting ? 'Criando seu catálogo...' : '✨ Criar meu catálogo com esse estilo'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header do Form */}
        <header className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 font-serif text-2xl font-bold tracking-tight mb-1 text-white">
            Studio<span className="text-rose-400 font-normal italic">Menu</span>
          </Link>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Criação Rápida do Catálogo
          </p>

          {/* Barra de Progresso de Passos */}
          <div className="grid grid-cols-3 gap-2 mt-6 max-w-xs mx-auto">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentStep >= step ? 'bg-rose-500' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </header>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          {/* PASSO 1: Identidade */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="w-5 h-5 text-rose-400" />
                <h2 className="font-serif text-xl font-bold text-white">1. Identidade</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Seu Nome Profissional *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mariana Alves"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-rose-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">Esse será o nome do seu catálogo e do seu studio.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp com DDD *</label>
                <input
                  type="tel"
                  required
                  placeholder="(11) 99999-9999"
                  value={whatsappDisplay}
                  onChange={(e) => setWhatsappDisplay(formatPhoneBR(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={!clientName || whatsappDigits.length < 10}
                className="w-full mt-4 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 font-bold text-xs tracking-wider uppercase text-white flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Avançar para Nicho</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* PASSO 2: Nicho */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Scissors className="w-5 h-5 text-rose-400" />
                <h2 className="font-serif text-xl font-bold text-white">2. Seu Nicho de Atuação</h2>
              </div>
              <p className="text-[11px] text-slate-400 -mt-2">
                Vamos usar isso pra sugerir procedimentos de exemplo, editáveis depois.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {NICHE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleNicheChange(opt.value)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      niche === opt.value
                        ? 'border-rose-500 bg-rose-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1 flex items-center gap-1.5 text-rose-400">
                      {opt.icon}
                    </div>
                    <div className="font-bold text-sm text-white">{opt.label}</div>
                    <p className="text-[11px] leading-tight mt-0.5">{opt.sublabel}</p>
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-1/3 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Volta
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="w-2/3 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 font-bold text-xs tracking-wider uppercase text-white flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Ver Meu Catálogo ao Vivo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
