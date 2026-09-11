'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPhoneBR } from '@/lib/format';
import { NICHE_OPTIONS } from '@/data/niche-options';
import { NicheType, LayoutModel, ThemeVariant, ProcedureItem, CatalogOrderData } from '@/types/catalog';
import { nichePresetsMap } from '@/data/niche-presets';
import { CatalogLayout } from '@/components/catalog/CatalogLayout';
import { StylePickerPanel } from '@/components/catalog/StylePickerPanel';
import { ArrowLeft, Upload, Sparkles, Trash2, Plus, ImageIcon, FileText, Check } from 'lucide-react';

// Mesmo valor de src/app/admin/layout.tsx — segredo simples compartilhado com as
// rotas /api/admin/*, no mesmo nível de segurança já praticado no painel admin.
const ADMIN_SECRET = '5669';

type Step = 'form' | 'reviewing';

export default function CriarComIAPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('form');
  const [clientName, setClientName] = useState('');
  const [whatsappDisplay, setWhatsappDisplay] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [niche, setNiche] = useState<NicheType>('lash');

  const preset = nichePresetsMap[niche];
  const [layoutModel, setLayoutModel] = useState<LayoutModel>(preset.layout_model);
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>(preset.theme_variant);
  const [onCoverScreen, setOnCoverScreen] = useState(true);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [menuFiles, setMenuFiles] = useState<File[]>([]);
  const [procedures, setProcedures] = useState<ProcedureItem[]>([]);

  const [isExtracting, setIsExtracting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const whatsappDigits = whatsappDisplay.replace(/\D/g, '');
  const instagramFull = instagramHandle ? `@${instagramHandle}` : '';
  const coverPreviewUrl = useMemo(() => (coverFile ? URL.createObjectURL(coverFile) : ''), [coverFile]);

  // No preview ao vivo: na capa destaca o Tema; da tela de procedimentos em
  // diante, destaca o Modelo. Mesmo comportamento do Showroom/Onboarding.
  useEffect(() => {
    if (step !== 'reviewing') return;
    const heroEl = document.getElementById('hero');
    if (!heroEl) return;

    const observer = new IntersectionObserver(([entry]) => setOnCoverScreen(entry.isIntersecting), { threshold: 0.5 });
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, [step, layoutModel, themeVariant]);

  const handleNicheChange = (newNiche: NicheType) => {
    setNiche(newNiche);
    setLayoutModel(nichePresetsMap[newNiche].layout_model);
    setThemeVariant(nichePresetsMap[newNiche].theme_variant);
  };

  const handleExtract = async () => {
    if (!menuFiles.length) {
      setErrorMsg('Envie ao menos um print ou PDF da tabela de preços.');
      return;
    }
    setIsExtracting(true);
    setErrorMsg('');

    try {
      const fd = new FormData();
      menuFiles.forEach((f) => fd.append('files', f));
      fd.append('niche', niche);

      const res = await fetch('/api/admin/extract-catalog', {
        method: 'POST',
        headers: { 'x-admin-secret': ADMIN_SECRET },
        body: fd,
      });
      const json = await res.json();

      if (!json.success) {
        setErrorMsg(json.message || 'Não foi possível extrair os procedimentos.');
        return;
      }

      setProcedures(json.procedures);
      setStep('reviewing');
    } catch (err: any) {
      setErrorMsg('Falha de conexão ao extrair os procedimentos.');
    } finally {
      setIsExtracting(false);
    }
  };

  const updateProcedure = (id: string, field: keyof ProcedureItem, value: any) => {
    setProcedures((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const removeProcedure = (id: string) => {
    setProcedures((prev) => prev.filter((p) => p.id !== id));
  };

  const addProcedure = () => {
    setProcedures((prev) => [
      ...prev,
      { id: `manual-${Date.now()}`, title: '', price: '', duration: '', category: 'Geral', description: '' },
    ]);
  };

  const handleCreateCatalog = async () => {
    setIsCreating(true);
    setErrorMsg('');

    try {
      const fd = new FormData();
      fd.append('clientName', clientName);
      fd.append('whatsappNumber', whatsappDigits);
      fd.append('instagramHandle', instagramFull);
      fd.append('niche', niche);
      fd.append('layoutModel', layoutModel);
      fd.append('themeVariant', themeVariant);
      fd.append('procedures', JSON.stringify(procedures));
      if (coverFile) fd.append('coverFile', coverFile);

      const res = await fetch('/api/admin/finalize-catalog', {
        method: 'POST',
        headers: { 'x-admin-secret': ADMIN_SECRET },
        body: fd,
      });
      const json = await res.json();

      if (!json.success) {
        setErrorMsg(json.message || 'Erro ao criar o catálogo.');
        setIsCreating(false);
        return;
      }

      fetch('/api/notify-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          whatsapp: whatsappDigits,
          instagram: instagramFull,
          layoutModel,
          themeVariant,
          slug: json.slug,
          editToken: json.editToken,
        }),
      }).catch(() => {});

      router.push(`/c/${json.slug}?edit=${json.editToken}&new=1`);
    } catch (err: any) {
      setErrorMsg('Falha de conexão ao criar o catálogo.');
      setIsCreating(false);
    }
  };

  // PASSO 2: Revisão — lista editável + preview ao vivo real (mesmo padrão do Passo 3 do onboarding)
  if (step === 'reviewing') {
    const previewCatalog: CatalogOrderData = {
      ...preset,
      client_name: clientName || preset.client_name,
      whatsapp_number: whatsappDigits || preset.whatsapp_number,
      instagram_handle: instagramFull,
      layout_model: layoutModel,
      theme_variant: themeVariant,
      cover_media_url: coverPreviewUrl || preset.cover_media_url,
      avatar_url: coverPreviewUrl || preset.avatar_url,
      procedures,
    };

    return (
      <div className="criar-ia-review relative min-h-screen pb-[62vh] bg-slate-950">
        <button
          type="button"
          onClick={() => setStep('form')}
          className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-slate-950/90 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center shadow-2xl"
          title="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
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

        {/* Véu escuro sobre o catálogo ao fundo, pra destacar que o painel abaixo é a área ativa */}
        <div className="fixed inset-0 z-40 bg-slate-950/45 pointer-events-none" />

        {/* Painel de Revisão dos Procedimentos Extraídos */}
        <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[62vh] overflow-y-auto bg-slate-950 border-t border-slate-700 rounded-t-3xl shadow-[0_-20px_60px_rgba(0,0,0,0.7)] p-5">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-400 flex-shrink-0" /> Confira o que a IA entendeu
              </h2>
              <button
                type="button"
                onClick={addProcedure}
                className="px-3.5 py-2.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 text-sm font-bold flex items-center gap-1.5 flex-shrink-0"
              >
                <Plus className="w-4 h-4" /> Item
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm text-center font-medium">
                {errorMsg}
              </div>
            )}

            <div className="space-y-3">
              {procedures.map((proc) => (
                <div key={proc.id} className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nome do serviço"
                      value={proc.title}
                      onChange={(e) => updateProcedure(proc.id, 'title', e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-base text-white focus:border-rose-500 focus:outline-none"
                    />
                    <button type="button" onClick={() => removeProcedure(proc.id)} className="text-slate-500 hover:text-rose-400 p-2 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Preço"
                      value={proc.price}
                      onChange={(e) => updateProcedure(proc.id, 'price', e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Duração"
                      value={proc.duration}
                      onChange={(e) => updateProcedure(proc.id, 'duration', e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Categoria"
                      value={proc.category}
                      onChange={(e) => updateProcedure(proc.id, 'category', e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
              {procedures.length === 0 && (
                <p className="text-center text-sm text-slate-500 py-4">Nenhum procedimento — adicione manualmente ou volte e tente outro arquivo.</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleCreateCatalog}
              disabled={isCreating || !clientName || whatsappDigits.length < 10}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 disabled:opacity-60 font-bold text-sm tracking-wider uppercase text-white shadow-2xl"
            >
              {isCreating ? 'Criando catálogo...' : '✨ Criar Catálogo'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PASSO 1: Dados & Arquivos
  return (
    <main className="min-h-screen bg-slate-950 text-white py-10 px-5">
      <div className="max-w-xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 mb-5 transition-all">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Painel</span>
        </Link>

        <header className="mb-7">
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-2.5">
            🤖 Criar Catálogo com IA
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Envie a foto de capa e um print (ou PDF) da tabela de preços — a IA lê e monta os procedimentos pra você revisar antes de criar.
          </p>
        </header>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-7 shadow-2xl backdrop-blur-xl space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm text-center font-medium">{errorMsg}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Nome da Profissional *</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Mariana Alves"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-base text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">WhatsApp *</label>
              <input
                type="tel"
                value={whatsappDisplay}
                onChange={(e) => setWhatsappDisplay(formatPhoneBR(e.target.value))}
                placeholder="(11) 99999-9999"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-base text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Instagram</label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl focus-within:border-rose-500 transition-all">
              <span className="pl-3.5 pr-1 text-base text-slate-500 select-none">@</span>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value.replace(/^@+/, '').replace(/\s/g, ''))}
                placeholder="studio.dela"
                className="w-full bg-transparent py-3.5 pr-3.5 text-base text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2.5">Nicho</label>
            <div className="grid grid-cols-2 gap-2.5">
              {NICHE_OPTIONS.map((opt) => {
                const isSelected = niche === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleNicheChange(opt.value)}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-rose-500 bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                        : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white/25 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </span>
                    )}
                    <div className="font-bold text-base pr-6">{opt.label}</div>
                    <p className={`text-sm leading-tight mt-0.5 ${isSelected ? 'text-white/85' : 'text-slate-400'}`}>{opt.sublabel}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Foto de Capa</label>
            <label className="flex items-center justify-center gap-2.5 w-full bg-slate-950 border-2 border-dashed border-slate-800 hover:border-rose-500 rounded-xl p-5 text-sm text-slate-400 cursor-pointer transition-all">
              <ImageIcon className="w-5 h-5" />
              <span>{coverFile ? coverFile.name : 'Escolher foto do dispositivo'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Print ou PDF de Serviços e Valores *</label>
            <label className="flex items-center justify-center gap-2.5 w-full bg-slate-950 border-2 border-dashed border-slate-800 hover:border-rose-500 rounded-xl p-5 text-sm text-slate-400 cursor-pointer transition-all">
              <FileText className="w-5 h-5" />
              <span>{menuFiles.length ? `${menuFiles.length} arquivo(s) selecionado(s)` : 'Escolher imagem(ns) ou PDF'}</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                multiple
                className="hidden"
                onChange={(e) => setMenuFiles(Array.from(e.target.files || []))}
              />
            </label>
            <p className="text-xs text-slate-500 mt-1.5">Pode enviar mais de uma foto se a tabela ocupar várias páginas/prints.</p>
          </div>

          <button
            type="button"
            onClick={handleExtract}
            disabled={isExtracting || !clientName || whatsappDigits.length < 10 || !menuFiles.length}
            className="w-full mt-2 py-4 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:opacity-95 disabled:opacity-50 font-bold text-sm tracking-wider uppercase text-white flex items-center justify-center gap-2.5 shadow-lg"
          >
            <Upload className="w-5 h-5" />
            <span>{isExtracting ? 'Lendo com IA...' : '🤖 Extrair com IA'}</span>
          </button>
        </div>
      </div>
    </main>
  );
}
