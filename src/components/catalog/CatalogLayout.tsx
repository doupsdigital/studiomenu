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
  const [activeModal, setActiveModal] = useState<
    | 'none'
    | 'cover'
    | 'procedure'
    | 'social'
    | 'category'
    | 'save_confirm'
    | 'save_success'
    | 'save_error'
    | 'category_delete_confirm'
    | 'category_delete_blocked'
    | 'proc_delete_confirm'
    | 'discard_confirm'
  >('none');
  const [editingProc, setEditingProc] = useState<ProcedureItem | null>(null);
  const [editingProcIndex, setEditingProcIndex] = useState<number | null>(null);
  const [editingSocialType, setEditingSocialType] = useState<'whatsapp' | 'instagram' | 'address' | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{ name: string; count: number } | null>(null);
  const [procToDelete, setProcToDelete] = useState<ProcedureItem | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string>('');

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

  // Alerta ao tentar recarregar a página sem salvar alterações
  useEffect(() => {
    if (!isSaved && isEditMode) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'Você possui alterações não salvas. Lembre-se de clicar em SALVAR no rodapé para publicar!';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [isSaved, isEditMode]);

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
    setActiveModal('discard_confirm');
  };

  const handleConfirmDiscard = () => {
    setCatalogState(data);
    setHistoryStack([data]);
    setHistoryIndex(0);
    setIsSaved(true);
    setActiveModal('none');
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

  // Persistir ao confirmar no modal de salvamento (sem alerts nativos de navegador)
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
        setActiveModal('save_success');
      } else {
        setSaveErrorMessage(res.message || 'Erro ao salvar as alterações no catálogo.');
        setActiveModal('save_error');
      }
    } catch (err) {
      setSaveErrorMessage('Falha na conexão de rede ao salvar o catálogo.');
      setActiveModal('save_error');
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
    setProcToDelete(proc);
    setActiveModal('proc_delete_confirm');
  };

  const handleConfirmDeleteProcedure = () => {
    if (!procToDelete) return;
    const currentCats = Array.isArray(catalogState.categories) ? catalogState.categories : categories;
    const newProcs = catalogState.procedures.filter((p) => p.id !== procToDelete.id);
    // Garante que as categorias existentes permaneçam salvas mesmo se ficarem com 0 procedimentos
    pushState({ ...catalogState, categories: currentCats, procedures: newProcs });
    setProcToDelete(null);
    setActiveModal('none');
  };

  const handleAddCategory = (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    const currentCats = Array.isArray(catalogState.categories) ? catalogState.categories : categories;
    if (!currentCats.includes(trimmed)) {
      const updatedCategories = [...currentCats, trimmed];
      pushState({ ...catalogState, categories: updatedCategories });
    }
    setActiveModal('none');
  };

  const handleAttemptDeleteCategory = (categoryName: string, count: number) => {
    setCategoryToDelete({ name: categoryName, count });
    if (count > 0) {
      setActiveModal('category_delete_blocked');
    } else {
      setActiveModal('category_delete_confirm');
    }
  };

  const handleConfirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    const catName = categoryToDelete.name;
    const currentCats = Array.isArray(catalogState.categories) ? catalogState.categories : categories;
    const newCategories = currentCats.filter((c) => c !== catName);
    const newProcs = catalogState.procedures.filter((p) => p.category !== catName);
    pushState({ ...catalogState, categories: newCategories, procedures: newProcs });
    setCategoryToDelete(null);
    setActiveModal('none');
  };

  const isLuxury = catalogState.theme_variant === 'luxury';

  // Extrair categorias para os chips da Hero e Filtros
  const categories = useMemo(() => {
    const set = new Set<string>();
    if (Array.isArray(catalogState.categories)) {
      catalogState.categories.forEach((cat) => {
        if (cat) set.add(cat);
      });
    }
    catalogState.procedures.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [catalogState.categories, catalogState.procedures]);

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
          initialCatalogData={data}
          editToken={editToken}
          categories={categories}
          activeModal={activeModal}
          errorMessage={saveErrorMessage}
          editingProc={editingProc}
          editingProcIndex={editingProcIndex}
          editingSocialType={editingSocialType}
          categoryToDelete={categoryToDelete}
          procToDelete={procToDelete}
          onClose={() => setActiveModal('none')}
          onSaveProcedure={handleSaveProcedure}
          onSaveCoverUrl={handleSaveCoverUrl}
          onSaveSocial={handleSaveSocial}
          onAddCategory={handleAddCategory}
          onConfirmDeleteCategory={handleConfirmDeleteCategory}
          onConfirmDeleteProc={handleConfirmDeleteProcedure}
          onConfirmDiscard={handleConfirmDiscard}
          onOpenAddCatModal={() => setActiveModal('category')}
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
          onSaveCoverUrl={handleSaveCoverUrl}
          onUpdateClientName={handleUpdateClientName}
          onUpdateHeroPhrase={handleUpdateHeroPhrase}
        />

        {/* Seção Mosaico/Clássico de Procedimentos */}
        <ProcedureGrid
          procedures={catalogState.procedures}
          allCategories={categories}
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
          onDeleteCategory={handleAttemptDeleteCategory}
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
