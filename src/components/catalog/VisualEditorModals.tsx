'use client';

import React, { useState } from 'react';
import { CatalogOrderData, ProcedureItem } from '@/types/catalog';
import { CoverModal } from './modals/CoverModal';
import { ProcedureModal } from './modals/ProcedureModal';
import { SocialModal } from './modals/SocialModal';
import { CategoryModal } from './modals/CategoryModal';
import { ConfirmModals } from './modals/ConfirmModals';

interface VisualEditorModalsProps {
  catalogData: CatalogOrderData;
  initialCatalogData?: CatalogOrderData;
  editToken: string;
  categories: string[];
  activeModal:
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
    | 'discard_confirm';
  errorMessage?: string;
  editingProc: ProcedureItem | null;
  editingProcIndex: number | null;
  editingSocialType: 'whatsapp' | 'instagram' | 'address' | null;
  categoryToDelete?: { name: string; count: number } | null;
  procToDelete?: ProcedureItem | null;
  onClose: () => void;
  onSaveProcedure: (proc: ProcedureItem, index: number | null) => void;
  onSaveCoverUrl: (url: string) => void;
  onSaveSocial: (type: 'whatsapp' | 'instagram' | 'address', value: string) => void;
  onAddCategory: (categoryName: string) => void;
  onConfirmDeleteCategory?: () => void;
  onConfirmDeleteProc?: () => void;
  onConfirmDiscard?: () => void;
  onOpenAddCatModal?: () => void;
  onConfirmSaveDatabase: () => void;
  isSaving: boolean;
}

export const VisualEditorModals: React.FC<VisualEditorModalsProps> = ({
  catalogData,
  initialCatalogData,
  editToken,
  categories = [],
  activeModal,
  errorMessage = '',
  editingProc,
  editingProcIndex,
  categoryToDelete,
  procToDelete,
  onClose,
  onSaveProcedure,
  onSaveCoverUrl,
  onSaveSocial,
  onAddCategory,
  onConfirmDeleteCategory,
  onConfirmDeleteProc,
  onConfirmDiscard,
  onOpenAddCatModal,
  onConfirmSaveDatabase,
  isSaving,
}) => {
  const safeCategories = React.useMemo(() => {
    const list = categories && categories.length > 0 ? [...categories] : ['Extensão de Cílios', 'Lash Lifting', 'Sobrancelhas'];
    if (editingProc?.category && !list.includes(editingProc.category)) {
      list.push(editingProc.category);
    }
    return list;
  }, [categories, editingProc]);

  const [isUploading, setIsUploading] = useState(false);

  // Gerar resumo de alterações da sessão de edição
  const getChangesSummary = (): string[] => {
    const initial = initialCatalogData || catalogData;
    const current = catalogData;
    const changes: string[] = [];

    if (initial.client_name !== current.client_name) {
      changes.push(`✏️ Nome do Catálogo: ${current.client_name}`);
    }
    if (initial.hero_phrase !== current.hero_phrase) {
      changes.push(`💬 Frase de Destaque: Alterada`);
    }
    if (initial.whatsapp_number !== current.whatsapp_number) {
      changes.push(`📱 WhatsApp: ${current.whatsapp_number}`);
    }
    if (initial.instagram_handle !== current.instagram_handle) {
      changes.push(`📸 Instagram: @${(current.instagram_handle || '').replace(/^@/, '')}`);
    }
    if (initial.address !== current.address) {
      changes.push(`📍 Localização: ${current.address}`);
    }
    if (initial.cover_media_url !== current.cover_media_url) {
      changes.push(`📷 Foto de Capa: Nova imagem selecionada`);
    }

    const initialProcs = initial.procedures || [];
    const currentProcs = current.procedures || [];

    if (currentProcs.length < initialProcs.length) {
      changes.push(`🗑️ Procedimentos removidos: ${initialProcs.length - currentProcs.length} item(ns)`);
    } else if (currentProcs.length > initialProcs.length) {
      changes.push(`✨ Novos procedimentos: ${currentProcs.length - initialProcs.length} item(ns)`);
    }

    let modifiedCount = 0;
    currentProcs.forEach((proc, idx) => {
      const orig = initialProcs[idx];
      if (
        orig &&
        (proc.title !== orig.title ||
          proc.price !== orig.price ||
          proc.duration !== orig.duration ||
          proc.image_url !== orig.image_url ||
          proc.category !== orig.category ||
          proc.description !== orig.description)
      ) {
        modifiedCount++;
      }
    });

    if (modifiedCount > 0) {
      changes.push(`✏️ Procedimentos alterados: ${modifiedCount} item(ns)`);
    }

    if (changes.length === 0) {
      changes.push('Nenhuma alteração pendente');
    }

    return changes;
  };

  // Proc Form State
  const [procForm, setProcForm] = useState<ProcedureItem & { maintenance?: string; visualEffect?: string }>(
    editingProc
      ? {
          ...editingProc,
          maintenance: editingProc.specs?.find(([k]) => k === 'Manutenção')?.[1] || '',
          visualEffect: editingProc.specs?.find(([k]) => k === 'Efeito Visual')?.[1] || '',
        }
      : {
          id: '',
          title: '',
          price: '',
          duration: '',
          category: safeCategories[0] || 'Extensão de Cílios',
          description: '',
          image_url: '',
          badge: '',
          is_highlight: false,
          maintenance: '',
          visualEffect: '',
        }
  );

  // Social Form State
  const [socialForm, setSocialForm] = useState({
    whatsapp: catalogData.whatsapp_number || '',
    instagram: catalogData.instagram_handle || '',
    address: catalogData.address || '',
  });

  // Category State
  const [newCatName, setNewCatName] = useState('');

  // Form Error State
  const [procFormError, setProcFormError] = useState('');

  // Sincronizar form proc se prop mudar
  React.useEffect(() => {
    if (editingProc) {
      setProcForm({
        ...editingProc,
        maintenance: editingProc.specs?.find(([k]) => k === 'Manutenção')?.[1] || '',
        visualEffect: editingProc.specs?.find(([k]) => k === 'Efeito Visual')?.[1] || '',
      });
    } else {
      setProcForm({
        id: '',
        title: '',
        price: '',
        duration: '',
        category: safeCategories[0] || 'Extensão de Cílios',
        description: '',
        image_url: '',
        badge: '',
        is_highlight: false,
        maintenance: '',
        visualEffect: '',
      });
    }
  }, [editingProc, activeModal]);

  // Sincronizar form social se props mudarem
  React.useEffect(() => {
    setSocialForm({
      whatsapp: catalogData.whatsapp_number || '',
      instagram: catalogData.instagram_handle || '',
      address: catalogData.address || '',
    });
  }, [catalogData]);

  // Upload de Imagem para Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'cover' | 'proc') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', catalogData.slug);
      formData.append('edit_token', editToken);

      const res = await fetch('/api/catalog/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (result.success && result.url) {
        if (target === 'cover') {
          onSaveCoverUrl(result.url);
          onClose();
        } else if (target === 'proc') {
          setProcForm((prev) => ({ ...prev, image_url: result.url }));
        }
      } else {
        // Fallback local se upload der algum aviso
        const localUrl = URL.createObjectURL(file);
        if (target === 'cover') {
          onSaveCoverUrl(localUrl);
          onClose();
        } else {
          setProcForm((prev) => ({ ...prev, image_url: localUrl }));
        }
      }
    } catch (err) {
      const localUrl = URL.createObjectURL(file);
      if (target === 'cover') {
        onSaveCoverUrl(localUrl);
        onClose();
      } else {
        setProcForm((prev) => ({ ...prev, image_url: localUrl }));
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (activeModal === 'none') return null;

  return (
    <div className="lm-modal-overlay is-open">
      {activeModal === 'cover' && (
        <CoverModal isUploading={isUploading} onFileUpload={(e) => handleFileUpload(e, 'cover')} onClose={onClose} />
      )}

      {activeModal === 'procedure' && (
        <ProcedureModal
          procForm={procForm}
          setProcForm={setProcForm}
          editingProcIndex={editingProcIndex}
          safeCategories={safeCategories}
          procFormError={procFormError}
          setProcFormError={setProcFormError}
          onOpenAddCatModal={onOpenAddCatModal}
          onFileUpload={(e) => handleFileUpload(e, 'proc')}
          onSaveProcedure={onSaveProcedure}
          onClose={onClose}
        />
      )}

      {activeModal === 'social' && (
        <SocialModal socialForm={socialForm} setSocialForm={setSocialForm} onSaveSocial={onSaveSocial} onClose={onClose} />
      )}

      {activeModal === 'category' && (
        <CategoryModal newCatName={newCatName} setNewCatName={setNewCatName} onAddCategory={onAddCategory} onClose={onClose} />
      )}

      {activeModal !== 'cover' &&
        activeModal !== 'procedure' &&
        activeModal !== 'social' &&
        activeModal !== 'category' && (
          <ConfirmModals
            activeModal={activeModal}
            changesSummary={getChangesSummary()}
            isSaving={isSaving}
            errorMessage={errorMessage}
            categoryToDelete={categoryToDelete}
            procToDelete={procToDelete}
            onClose={onClose}
            onConfirmSaveDatabase={onConfirmSaveDatabase}
            onConfirmDeleteCategory={onConfirmDeleteCategory}
            onConfirmDeleteProc={onConfirmDeleteProc}
            onConfirmDiscard={onConfirmDiscard}
          />
        )}
    </div>
  );
};
