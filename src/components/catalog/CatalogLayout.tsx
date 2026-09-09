'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { CatalogOrderData, ProcedureItem, ThemeVariant } from '@/types/catalog';
import { HeaderCover } from './HeaderCover';
import { ProcedureGrid } from './ProcedureGrid';
import { InstructionsSection } from './InstructionsSection';
import { CTASection } from './CTASection';
import { VisualEditorBottomBar } from './VisualEditorBottomBar';
import { VisualEditorModals } from './VisualEditorModals';

import '@/app/visual-editor.css';

interface CatalogLayoutProps {
  data: CatalogOrderData;
  isEditMode?: boolean;
  editToken?: string;
  onThemeChange?: (theme: ThemeVariant) => void;
}

export const CatalogLayout: React.FC<CatalogLayoutProps> = ({
  data,
  isEditMode = false,
  editToken = '',
  onThemeChange,
}) => {
  const [catalogState, setCatalogState] = useState<CatalogOrderData>(data);
  const [isSaved, setIsSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Pilha de Histórico para Undo/Redo (↩️ e ↪️)
  const [historyStack, setHistoryStack] = useState<CatalogOrderData[]>([data]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Modais Ativos
  const [activeModal, setActiveModal] = useState<'none' | 'cover' | 'procedure' | 'social' | 'category' | 'save_confirm'>('none');
  const [editingProc, setEditingProc] = useState<ProcedureItem | null>(null);
  const [editingProcIndex, setEditingProcIndex] = useState<number | null>(null);
  const [editingSocialType, setEditingSocialType] = useState<'whatsapp' | 'instagram' | 'address' | null>(null);

  // Ativar classe no body em modo edição para ajuste de padding inferior
  useEffect(() => {
    if (isEditMode) {
      document.body.classList.add('has-lm-editor');
    } else {
      document.body.classList.remove('has-lm-editor');
    }
    return () => {
      document.body.classList.remove('has-lm-editor');
    };
  }, [isEditMode]);

  // Push para pilha de histórico
  const pushState = (newState: CatalogOrderData) => {
    const updatedHistory = historyStack.slice(0, historyIndex + 1);
    updatedHistory.push(newState);
    setHistoryStack(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setCatalogState(newState);
    setIsSaved(false);
  };

  // Undo (Desfazer ↩️)
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setCatalogState(historyStack[prevIdx]);
      setIsSaved(false);
    }
  };

  // Redo (Refazer ↪️)
  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setCatalogState(historyStack[nextIdx]);
      setIsSaved(false);
    }
  };

  // Descartar alterações (Reset 🗑️)
  const handleDiscard = () => {
    if (confirm('Deseja descartar todas as alterações não salvas?')) {
      setCatalogState(data);
      setHistoryStack([data]);
      setHistoryIndex(0);
      setIsSaved(true);
    }
  };

  // Alternar Tema (🌸 / 👑)
  const handleToggleTheme = () => {
    const nextTheme: ThemeVariant = catalogState.theme_variant === 'luxury' ? 'rose' : 'luxury';
    pushState({ ...catalogState, theme_variant: nextTheme });
    if (onThemeChange) onThemeChange(nextTheme);
  };

  // Sincronizar data-theme no <body> para ativar as regras CSS do tema Luxury/Rosé
  useEffect(() => {
    const theme = catalogState.theme_variant || 'rose';
    document.body.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    return () => {
      document.body.removeAttribute('data-theme');
      document.documentElement.removeAttribute('data-theme');
    };
  }, [catalogState.theme_variant]);

  // Persistir no Supabase ao confirmar no modal de salvamento
  const handleConfirmSaveDatabase = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/catalog/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: catalogState.slug,
          edit_token: editToken,
          catalogData: catalogState,
        }),
      });

      const res = await response.json();
      if (res.success) {
        setIsSaved(true);
        setActiveModal('none');
        alert('✨ Catálogo salvo com sucesso no Supabase!');
      } else {
        alert(`❌ Erro ao salvar: ${res.message}`);
      }
    } catch (err) {
      alert('❌ Falha na conexão ao salvar catálogo.');
    } finally {
      setIsSaving(false);
    }
  };

  // Manipuladores In-Place
  const handleUpdateClientName = (newName: string) => {
    if (newName && newName !== catalogState.client_name) {
      pushState({ ...catalogState, client_name: newName });
    }
  };

  const handleUpdateHeroPhrase = (newPhrase: string) => {
    if (newPhrase !== catalogState.hero_phrase) {
      pushState({ ...catalogState, hero_phrase: newPhrase });
    }
  };

  const handleUpdateAddress = (newAddress: string) => {
    if (newAddress !== catalogState.address) {
      pushState({ ...catalogState, address: newAddress });
    }
  };

  const handleSaveCoverUrl = (url: string) => {
    pushState({ ...catalogState, cover_media_url: url });
  };

  const handleSaveSocial = (type: 'whatsapp' | 'instagram' | 'address', val: string) => {
    if (type === 'whatsapp') {
      pushState({ ...catalogState, whatsapp_number: val });
    } else if (type === 'instagram') {
      pushState({ ...catalogState, instagram_handle: val });
    } else if (type === 'address') {
      pushState({ ...catalogState, address: val });
    }
  };

  const handleSaveProcedure = (proc: ProcedureItem, index: number | null) => {
    const newProcs = [...catalogState.procedures];
    if (index !== null && index >= 0) {
      newProcs[index] = proc;
    } else {
      newProcs.push({ ...proc, id: String(Date.now()) });
    }
    pushState({ ...catalogState, procedures: newProcs });
  };

  const handleDeleteProcedure = (proc: ProcedureItem) => {
    if (!confirm(`Excluir o procedimento "${proc.title}"?`)) return;
    const newProcs = catalogState.procedures.filter((p) => p.id !== proc.id);
    pushState({ ...catalogState, procedures: newProcs });
  };

  const handleAddCategory = (categoryName: string) => {
    const newProc: ProcedureItem = {
      id: String(Date.now()),
      title: `Novo Procedimento (${categoryName})`,
      price: 'Sob Consulta',
      category: categoryName,
      description: 'Descrição do procedimento...',
    };
    pushState({ ...catalogState, procedures: [...catalogState.procedures, newProc] });
  };

  const isLuxury = catalogState.theme_variant === 'luxury';

  // Extrair categorias para os chips da Hero
  const categories = useMemo(() => {
    const set = new Set<string>();
    catalogState.procedures.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [catalogState.procedures]);

  return (
    <div className={`mosaico-wrapper ${isLuxury ? 'theme-luxury' : 'theme-rose'}`}>
      {/* 1. CONTROLES DO EDITOR VISUAL IN-PLACE (BARRA INFERIOR E TOP STATUS) */}
      {isEditMode && (
        <VisualEditorBottomBar
          catalogData={catalogState}
          isSaved={isSaved}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < historyStack.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onToggleTheme={handleToggleTheme}
          onDiscard={handleDiscard}
          onSave={() => setActiveModal('save_confirm')}
          isSaving={isSaving}
        />
      )}

      {/* 2. MODAIS DE EDIÇÃO VISUAL */}
      {isEditMode && (
        <VisualEditorModals
          catalogData={catalogState}
          editToken={editToken}
          activeModal={activeModal}
          editingProc={editingProc}
          editingProcIndex={editingProcIndex}
          editingSocialType={editingSocialType}
          onClose={() => setActiveModal('none')}
          onSaveProcedure={handleSaveProcedure}
          onSaveCoverUrl={handleSaveCoverUrl}
          onSaveSocial={handleSaveSocial}
          onAddCategory={handleAddCategory}
          onConfirmSaveDatabase={handleConfirmSaveDatabase}
          isSaving={isSaving}
        />
      )}

      {/* 3. APP MOBILE CONTAINER COM SUPORTE A EDIÇÃO IN-PLACE */}
      <div className={`mosaico-app is-visible ${isLuxury ? 'is-luxury' : ''}`}>
        {/* Hero Section (Foto da Capa, Nome da Profissional, Frase Hero) */}
        <HeaderCover
          data={catalogState}
          categories={categories}
          isEditMode={isEditMode}
          onOpenCoverModal={() => setActiveModal('cover')}
          onUpdateClientName={handleUpdateClientName}
          onUpdateHeroPhrase={handleUpdateHeroPhrase}
        />

        {/* Seção Mosaico/Clássico de Procedimentos */}
        <ProcedureGrid
          procedures={catalogState.procedures}
          whatsappNumber={catalogState.whatsapp_number}
          clientName={catalogState.client_name}
          layoutModel={catalogState.layout_model}
          isEditMode={isEditMode}
          onEditProc={(proc) => {
            const idx = catalogState.procedures.findIndex((p) => p.id === proc.id);
            setEditingProc(proc);
            setEditingProcIndex(idx >= 0 ? idx : null);
            setActiveModal('procedure');
          }}
          onDeleteProc={handleDeleteProcedure}
          onOpenAddProcModal={() => {
            setEditingProc(null);
            setEditingProcIndex(null);
            setActiveModal('procedure');
          }}
          onOpenAddCatModal={() => setActiveModal('category')}
        />

        {/* Seção Orientações */}
        <InstructionsSection instructions={catalogState.instructions} bgUrl={catalogState.instructions_bg_url} />

        {/* Seção Contato & Localização */}
        <CTASection
          data={catalogState}
          isEditMode={isEditMode}
          onOpenSocialModal={(type) => {
            setEditingSocialType(type);
            setActiveModal('social');
          }}
          onUpdateAddress={handleUpdateAddress}
        />
      </div>
    </div>
  );
};
