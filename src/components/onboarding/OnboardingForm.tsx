'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { NicheType, LayoutModel, ThemeVariant, ProcedureItem } from '@/types/catalog';
import { nichePresetsMap } from '@/data/niche-presets';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Scissors,
  Palette,
  Layers,
  UserCheck,
  Clock,
  ClipboardList,
  Gem,
  Lightbulb,
} from 'lucide-react';
import Link from 'next/link';

interface OnboardingFormProps {
  /** Mostra a tela de boas-vindas (Etapa 0) antes do Passo 1 — ideal para clientes
   *  que acabaram de comprar. Quando false, abre direto no preenchimento (ideal
   *  para envio por WhatsApp/X1). */
  withWelcome?: boolean;
}

export function OnboardingForm({ withWelcome = false }: OnboardingFormProps) {
  // Etapa 0: Tela de Boas-vindas (opcional)
  const [showWelcome, setShowWelcome] = useState(withWelcome);
  const [showLaterNote, setShowLaterNote] = useState(false);

  // Estado das Etapas
  const [currentStep, setCurrentStep] = useState(1);

  // Estados dos Dados do Formulário
  const [clientName, setClientName] = useState('');
  const [studioName, setStudioName] = useState('');
  const [niche, setNiche] = useState<NicheType>('lash');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [address, setAddress] = useState('');

  const [layoutModel, setLayoutModel] = useState<LayoutModel>('mosaico');
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>('rose');

  const [coverMediaUrl, setCoverMediaUrl] = useState('');
  const [heroPhrase, setHeroPhrase] = useState('');

  const [procedures, setProcedures] = useState<ProcedureItem[]>(nichePresetsMap.lash.procedures);

  // Ao trocar o nicho, recarrega os procedimentos padrão do preset correspondente
  const handleNicheChange = (newNiche: NicheType) => {
    setNiche(newNiche);
    setProcedures(nichePresetsMap[newNiche].procedures);
  };

  const [tolerances, setTolerances] = useState('Tolerância máxima de 15 minutos de atraso.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSlug, setSuccessSlug] = useState<string | null>(null);
  const [successEditToken, setSuccessEditToken] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Funções de manipulação de procedimentos
  const addProcedure = () => {
    const newProc: ProcedureItem = {
      id: String(Date.now()),
      title: '',
      price: '',
      duration: '1h',
      category: niche === 'nail' ? 'Unhas' : niche === 'estetica' ? 'Facial' : 'Geral',
      description: '',
    };
    setProcedures([...procedures, newProc]);
  };

  const removeProcedure = (id: string) => {
    setProcedures(procedures.filter((p) => p.id !== id));
  };

  const updateProcedure = (id: string, field: keyof ProcedureItem, val: any) => {
    setProcedures(
      procedures.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  // Envio Final para o Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Gerar slug a partir do nome do estúdio ou cliente
      const baseSlug = (studioName || clientName || 'studio')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const finalSlug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;

      // Preset do nicho escolhido: preenche campos padrão que o formulário ainda não coleta
      const preset = nichePresetsMap[niche];

      // 1. Gravar na tabela `orders`
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .insert({
          slug: finalSlug,
          client_name: clientName,
          studio_name: studioName || `Studio ${clientName}`,
          hero_phrase: heroPhrase || preset.hero_phrase || 'A arte de transformar a sua beleza com leveza e precisão.',
          bio_description: preset.bio_description || '',
          cover_media_url: coverMediaUrl || preset.cover_media_url || 'https://lashmenu.com/modelos/mosaico/assets/img/Hero.png',
          avatar_url: coverMediaUrl || preset.avatar_url || 'https://lashmenu.com/modelos/mosaico/assets/img/Hero.png',
          instructions_bg_url: preset.instructions_bg_url || null,
          final_screen_bg_url: preset.final_screen_bg_url || null,
          cta_bg_url: preset.cta_bg_url || null,
          niche: niche,
          layout_model: layoutModel,
          theme_variant: themeVariant,
          whatsapp_number: whatsappNumber.replace(/\D/g, ''),
          instagram_handle: instagramHandle,
          address: address,
          tolerances: tolerances,
          pre_care: preset.instructions?.pre_care || [],
          post_care: preset.instructions?.post_care || [],
          categories: [],
        })
        .select()
        .single();

      if (orderErr) {
        throw new Error(orderErr.message);
      }

      // 2. Gravar serviços na tabela `order_services`
      if (orderData && procedures.length > 0) {
        const servicesPayload = procedures.map((p, index) => ({
          order_id: orderData.id,
          order_index: index,
          title: p.title || 'Procedimento sem nome',
          description: p.description || '',
          price: p.price || 'Sob Consulta',
          duration: p.duration || '',
          category: p.category || 'Geral',
          image_url: p.image_url || '',
          is_highlight: Boolean(p.is_highlight),
          badge: p.badge || '',
          specs: p.specs || [],
        }));

        const { error: servicesErr } = await supabase.from('order_services').insert(servicesPayload);
        if (servicesErr) {
          throw new Error(servicesErr.message);
        }
      }

      setSuccessSlug(finalSlug);
      setSuccessEditToken(orderData?.edit_token || null);

      // Notifica o admin no Telegram (não bloqueia o fluxo se falhar)
      fetch('/api/notify-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          whatsapp: whatsappNumber,
          instagram: instagramHandle,
          layoutModel,
          themeVariant,
          slug: finalSlug,
          editToken: orderData?.edit_token,
        }),
      }).catch((err) => console.warn('Aviso: falha ao notificar Telegram:', err));
    } catch (err: any) {
      console.error('Erro ao salvar no Supabase:', err);
      setErrorMsg(err.message || 'Erro ao criar o catálogo. Tente novamente.');
    } finally {
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
                Preparamos este assistente prático para você personalizar seu catálogo interativo com seu nome, modelo preferido, procedimentos e fotos em poucos cliques.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <Clock className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-xs text-white">Rápido & Prático</h3>
                <p className="text-[11px] text-slate-400 leading-snug">Menos de 10 minutos para preencher tudo.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <ClipboardList className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-xs text-white">4 Etapas Guiadas</h3>
                <p className="text-[11px] text-slate-400 leading-snug">Identidade, Modelo, Capa e Procedimentos.</p>
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
                <strong className="text-slate-200">Não pode preencher tudo agora?</strong> Sem problemas! Você pode fechar esta página e voltar a este mesmo link quando tiver suas fotos e tabela de preços em mãos.
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowWelcome(false)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:opacity-95 font-bold text-xs tracking-wider uppercase text-white flex items-center justify-center gap-2 shadow-lg"
              >
                <span>✨ Sim, quero personalizar meu catálogo agora!</span>
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
                  Sem problemas! Guarde este link — quando estiver pronta com fotos e tabela de preços, é só voltar aqui para personalizar seu catálogo oficial. 💖
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Se já tiver sido gerado com sucesso
  if (successSlug) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-bold">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl font-bold">Catálogo Criado!</h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Seu catálogo no **StudioMenu** foi publicado com sucesso no endereço:
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-sm text-rose-400 break-all">
            studiomenu.art/c/{successSlug}
          </div>

          {successEditToken && (
            <div className="text-left space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Link Mágico de Edição (envie para a cliente)
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 break-all">
                studiomenu.art/c/{successSlug}?edit={successEditToken}
              </div>
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/c/${successSlug}?edit=${successEditToken}`;
                  navigator.clipboard.writeText(url);
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 2000);
                }}
                className="w-full py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase transition-all"
              >
                {linkCopied ? '✓ Link Copiado!' : 'Copiar Link de Edição'}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <Link
              href={`/c/${successSlug}`}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 font-bold text-xs tracking-wider uppercase text-white shadow-lg"
            >
              VISUALIZAR CATÁLOGO AGORA
            </Link>
            <Link
              href="/admin/catalogos"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              Ir para o Painel Administrativo
            </Link>
          </div>
        </div>
      </main>
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
            Formulário Oficial de Personalização
          </p>

          {/* Barra de Progresso de Passos */}
          <div className="grid grid-cols-4 gap-2 mt-6 max-w-sm mx-auto">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentStep >= step ? 'bg-rose-500' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </header>

        {/* Formulário Interativo Multi-Passos */}
        <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          {/* PASSO 1: Identidade & Nicho */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="w-5 h-5 text-rose-400" />
                <h2 className="font-serif text-xl font-bold text-white">1. Identidade & Nicho</h2>
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Studio / Marca</label>
                <input
                  type="text"
                  placeholder="Ex: Studio Mariana Alves"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Scissors className="w-3.5 h-3.5 text-rose-400" /> Seu Nicho de Atuação *
                </label>
                <select
                  value={niche}
                  onChange={(e) => handleNicheChange(e.target.value as NicheType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-rose-500 focus:outline-none"
                >
                  <option value="lash">Lash Designer (Cílios & Sobrancelhas)</option>
                  <option value="nail">Nail Designer (Unhas de Gel & Nail Art)</option>
                  <option value="estetica">Estética / Clínica Facial & Corporal</option>
                  <option value="studio">Studio de Beleza (Multi-serviços)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp com DDD *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 62999999999"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Instagram (@handle)</label>
                  <input
                    type="text"
                    placeholder="@seu.studio"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cidade / Endereço</label>
                <input
                  type="text"
                  placeholder="Ex: São Paulo / Setor Bueno"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={!clientName || !whatsappNumber}
                className="w-full mt-4 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 font-bold text-xs tracking-wider uppercase text-white flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Avançar para Modelo & Cores</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* PASSO 2: Modelo & Tema */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-5 h-5 text-rose-400" />
                <h2 className="font-serif text-xl font-bold text-white">2. Modelo & Tema Visual</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Escolha a Estrutura do Modelo *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLayoutModel('mosaico')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      layoutModel === 'mosaico'
                        ? 'border-rose-500 bg-rose-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-rose-400" /> Mosaico
                    </div>
                    <p className="text-[11px] leading-tight">Grid interativo visual com cards sofisticados e foto em profundidade.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLayoutModel('classico')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      layoutModel === 'classico'
                        ? 'border-rose-500 bg-rose-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-rose-400" /> Clássico
                    </div>
                    <p className="text-[11px] leading-tight">Lista editorial limpa, clássica e direta com foco nos procedimentos.</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Escolha o Tema de Cor *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setThemeVariant('rose')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      themeVariant === 'rose'
                        ? 'border-rose-400 bg-rose-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1">Modo Rosé 🌸</div>
                    <p className="text-[11px] leading-tight">Rosa acetinado delicado com tons ameixa e visual romântico.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setThemeVariant('luxury')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      themeVariant === 'luxury'
                        ? 'border-amber-400 bg-amber-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1 text-amber-400">Modo Luxury 👑</div>
                    <p className="text-[11px] leading-tight">Preto obsidian com dourado reluzente e estética luxuosa.</p>
                  </button>
                </div>
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
                  <span>Avançar para Foto & Capa</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASSO 3: Foto & Frase Hero */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-rose-400" />
                <h2 className="font-serif text-xl font-bold text-white">3. Foto de Capa & Apresentação</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">URL da Foto de Capa / Foto de Perfil</label>
                <input
                  type="url"
                  placeholder="https://suafoto.com/imagem.png"
                  value={coverMediaUrl}
                  onChange={(e) => setCoverMediaUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-rose-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">Cole o link direto da sua imagem. Se deixar em branco, usaremos o padrão profissional.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Frase Principal de Apresentação (Hero)</label>
                <textarea
                  rows={2}
                  placeholder="Ex: A arte de transformar o seu olhar com leveza e precisão."
                  value={heroPhrase}
                  onChange={(e) => setHeroPhrase(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-1/3 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Volta
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="w-2/3 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 font-bold text-xs tracking-wider uppercase text-white flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Avançar para Procedimentos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASSO 4: Cadastrar Procedimentos & Publicar */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-serif text-xl font-bold text-white">4. Procedimentos ({procedures.length})</h2>
                <button
                  type="button"
                  onClick={addProcedure}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>

              {/* Lista Dinâmica de Procedimentos */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {procedures.map((proc, index) => (
                  <div key={proc.id} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                        Item #{index + 1}
                      </span>
                      {procedures.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProcedure(proc.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nome do Serviço"
                        value={proc.title}
                        onChange={(e) => updateProcedure(proc.id, 'title', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Valor (Ex: 180,00)"
                        value={proc.price}
                        onChange={(e) => updateProcedure(proc.id, 'price', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Duração (Ex: 1h30)"
                        value={proc.duration}
                        onChange={(e) => updateProcedure(proc.id, 'duration', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Categoria (Ex: Cílios, Unhas)"
                        value={proc.category}
                        onChange={(e) => updateProcedure(proc.id, 'category', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="w-1/3 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs tracking-wider uppercase"
                >
                  Volta
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 disabled:opacity-50 font-bold text-xs tracking-wider uppercase text-white shadow-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Gerando Catálogo...' : '✨ PUBLICAR MEU CATÁLOGO'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
