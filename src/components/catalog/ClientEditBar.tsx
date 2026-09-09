'use client';

import React, { useState } from 'react';
import { CatalogOrderData, ProcedureItem } from '@/types/catalog';
import {
  Sparkles,
  Save,
  Plus,
  Settings,
  Eye,
  Trash2,
  Edit2,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
} from 'lucide-react';

interface ClientEditBarProps {
  catalogData: CatalogOrderData;
  editToken: string;
  onUpdateCatalog: (newCatalog: CatalogOrderData) => void;
}

export const ClientEditBar: React.FC<ClientEditBarProps> = ({
  catalogData,
  editToken,
  onUpdateCatalog,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'none' | 'procedures' | 'studio' | 'edit_proc'>('none');
  const [editingProc, setEditingProc] = useState<ProcedureItem | null>(null);
  const [editingProcIndex, setEditingProcIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form states for Studio Settings
  const [studioForm, setStudioForm] = useState({
    studio_name: catalogData.studio_name || '',
    client_name: catalogData.client_name || '',
    hero_phrase: catalogData.hero_phrase || '',
    bio_description: catalogData.bio_description || '',
    whatsapp_number: catalogData.whatsapp_number || '',
    instagram_handle: catalogData.instagram_handle || '',
    address: catalogData.address || '',
    cover_media_url: catalogData.cover_media_url || '',
    avatar_url: catalogData.avatar_url || '',
    pre_care: catalogData.instructions?.pre_care?.join('\n') || '',
    post_care: catalogData.instructions?.post_care?.join('\n') || '',
    tolerances: catalogData.instructions?.tolerances || '',
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Salvar no Banco de Dados Supabase via API
  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/catalog/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: catalogData.slug,
          edit_token: editToken,
          catalogData: catalogData,
        }),
      });

      const res = await response.json();

      if (res.success) {
        showToast('✨ Catálogo salvo com sucesso!', 'success');
      } else {
        showToast(`❌ ${res.message || 'Erro ao salvar.'}`, 'error');
      }
    } catch (err: any) {
      showToast('❌ Erro de conexão ao salvar alterações.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Upload de Imagem para Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'cover' | 'avatar' | 'proc_img') => {
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
        if (targetField === 'cover') {
          setStudioForm((prev) => ({ ...prev, cover_media_url: result.url }));
          onUpdateCatalog({ ...catalogData, cover_media_url: result.url });
        } else if (targetField === 'avatar') {
          setStudioForm((prev) => ({ ...prev, avatar_url: result.url }));
          onUpdateCatalog({ ...catalogData, avatar_url: result.url });
        } else if (targetField === 'proc_img' && editingProc) {
          setEditingProc({ ...editingProc, image_url: result.url });
        }
        showToast('📸 Imagem enviada com sucesso!', 'success');
      } else {
        showToast(`❌ ${result.message || 'Erro no upload.'}`, 'error');
      }
    } catch (err) {
      showToast('❌ Falha ao enviar imagem.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Salvar alterações de Studio Settings
  const handleSaveStudioSettings = () => {
    const updated: CatalogOrderData = {
      ...catalogData,
      studio_name: studioForm.studio_name,
      client_name: studioForm.client_name,
      hero_phrase: studioForm.hero_phrase,
      bio_description: studioForm.bio_description,
      whatsapp_number: studioForm.whatsapp_number,
      instagram_handle: studioForm.instagram_handle,
      address: studioForm.address,
      cover_media_url: studioForm.cover_media_url,
      avatar_url: studioForm.avatar_url,
      instructions: {
        pre_care: studioForm.pre_care.split('\n').filter((line) => line.trim().length > 0),
        post_care: studioForm.post_care.split('\n').filter((line) => line.trim().length > 0),
        tolerances: studioForm.tolerances,
      },
    };

    onUpdateCatalog(updated);
    setActiveTab('none');
    showToast('Dados do studio atualizados no catálogo!', 'success');
  };

  // Salvar/Adicionar procedimento
  const handleSaveProcedure = () => {
    if (!editingProc) return;

    let newProcedures = [...catalogData.procedures];
    if (editingProcIndex !== null && editingProcIndex >= 0) {
      newProcedures[editingProcIndex] = editingProc;
    } else {
      newProcedures.push({ ...editingProc, id: String(Date.now()) });
    }

    onUpdateCatalog({ ...catalogData, procedures: newProcedures });
    setEditingProc(null);
    setEditingProcIndex(null);
    setActiveTab('procedures');
    showToast('Procedimento atualizado!', 'success');
  };

  // Remover procedimento
  const handleDeleteProcedure = (index: number) => {
    const newProcedures = catalogData.procedures.filter((_, i) => i !== index);
    onUpdateCatalog({ ...catalogData, procedures: newProcedures });
    showToast('Procedimento removido.', 'success');
  };

  // Mover procedimento para cima/baixo
  const handleMoveProcedure = (index: number, direction: 'up' | 'down') => {
    const newProcedures = [...catalogData.procedures];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newProcedures.length) return;

    const temp = newProcedures[index];
    newProcedures[index] = newProcedures[targetIdx];
    newProcedures[targetIdx] = temp;

    onUpdateCatalog({ ...catalogData, procedures: newProcedures });
  };

  return (
    <>
      {/* 1. TOAST ALERTS */}
      {toastMessage && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2 transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-slate-900 text-emerald-400 border-emerald-500/30'
              : 'bg-slate-900 text-rose-400 border-rose-500/30'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 2. TOP TOOLBAR FLUTUANTE DE EDIÇÃO DA CLIENTE */}
      <div className="fixed top-0 left-0 right-0 z-[90] bg-slate-950/95 backdrop-blur-md border-b border-rose-500/30 text-white shadow-2xl px-3 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 border border-rose-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Modo Edição</span>
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline truncate max-w-[150px]">
              /c/{catalogData.slug}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTab('procedures')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-rose-400" />
              <span>Procedimentos ({catalogData.procedures.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('studio')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <Settings className="w-3.5 h-3.5 text-rose-400" />
              <span>Dados do Studio</span>
            </button>

            <button
              onClick={handleSaveToDatabase}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Salvando...' : 'Salvar no Banco'}</span>
            </button>

            <a
              href={`/c/${catalogData.slug}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
              title="Ver Catálogo Público (Modo Leitura)"
            >
              <Eye className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Espaçador superior para compensar a toolbar fixa */}
      <div className="h-14"></div>

      {/* 3. MODAL GERENCIAR PROCEDIMENTOS */}
      {activeTab === 'procedures' && (
        <div className="fixed inset-0 z-[95] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-400" />
                <span>Procedimentos e Serviços</span>
              </h3>
              <button
                onClick={() => setActiveTab('none')}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => {
                setEditingProc({
                  id: '',
                  title: '',
                  price: '',
                  duration: '',
                  category: 'Geral',
                  description: '',
                  image_url: '',
                  is_highlight: false,
                });
                setEditingProcIndex(null);
                setActiveTab('edit_proc');
              }}
              className="w-full py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Novo Procedimento</span>
            </button>

            <div className="space-y-2">
              {catalogData.procedures.map((proc, idx) => (
                <div
                  key={proc.id || idx}
                  className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-700">
                      {proc.image_url ? (
                        <img src={proc.image_url} alt={proc.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{proc.title}</h4>
                      <p className="text-[11px] text-rose-400 font-semibold">{proc.price} {proc.duration ? `· ${proc.duration}` : ''}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleMoveProcedure(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 disabled:opacity-30"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveProcedure(idx, 'down')}
                      disabled={idx === catalogData.procedures.length - 1}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 disabled:opacity-30"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setEditingProc({ ...proc });
                        setEditingProcIndex(idx);
                        setActiveTab('edit_proc');
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteProcedure(idx)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL ADICIONAR / EDITAR PROCEDIMENTO */}
      {activeTab === 'edit_proc' && editingProc && (
        <div className="fixed inset-0 z-[96] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-serif text-lg font-bold">
                {editingProcIndex !== null ? 'Editar Procedimento' : 'Novo Procedimento'}
              </h3>
              <button onClick={() => setActiveTab('procedures')} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Título do Procedimento *</label>
                <input
                  type="text"
                  value={editingProc.title}
                  onChange={(e) => setEditingProc({ ...editingProc, title: e.target.value })}
                  placeholder="Ex: Volume Brasileiro"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Preço *</label>
                  <input
                    type="text"
                    value={editingProc.price}
                    onChange={(e) => setEditingProc({ ...editingProc, price: e.target.value })}
                    placeholder="Ex: R$ 150,00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Duração</label>
                  <input
                    type="text"
                    value={editingProc.duration || ''}
                    onChange={(e) => setEditingProc({ ...editingProc, duration: e.target.value })}
                    placeholder="Ex: 2h00min"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Categoria</label>
                  <input
                    type="text"
                    value={editingProc.category || ''}
                    onChange={(e) => setEditingProc({ ...editingProc, category: e.target.value })}
                    placeholder="Ex: Extensões"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Selo / Badge</label>
                  <input
                    type="text"
                    value={editingProc.badge || ''}
                    onChange={(e) => setEditingProc({ ...editingProc, badge: e.target.value })}
                    placeholder="Ex: Mais Vendido"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Imagem do Procedimento</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingProc.image_url || ''}
                    onChange={(e) => setEditingProc({ ...editingProc, image_url: e.target.value })}
                    placeholder="URL da imagem (ou envie um arquivo)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-rose-500 focus:outline-none"
                  />
                  <label className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer flex items-center gap-1 flex-shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'proc_img')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Descrição Detalhada</label>
                <textarea
                  rows={3}
                  value={editingProc.description || ''}
                  onChange={(e) => setEditingProc({ ...editingProc, description: e.target.value })}
                  placeholder="Explicação do procedimento, diferenciais e manutenção..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="proc_highlight"
                  checked={Boolean(editingProc.is_highlight)}
                  onChange={(e) => setEditingProc({ ...editingProc, is_highlight: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 bg-slate-950 border-slate-800"
                />
                <label htmlFor="proc_highlight" className="text-slate-300 font-semibold cursor-pointer">
                  Destacar este procedimento no topo (Destaque Principal)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                onClick={() => setActiveTab('procedures')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProcedure}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg"
              >
                Salvar Procedimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL CONFIGURAÇÕES DO STUDIO & PROFISSIONAL */}
      {activeTab === 'studio' && (
        <div className="fixed inset-0 z-[95] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                <Settings className="w-5 h-5 text-rose-400" />
                <span>Dados Gerais do Studio</span>
              </h3>
              <button onClick={() => setActiveTab('none')} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nome do Studio</label>
                  <input
                    type="text"
                    value={studioForm.studio_name}
                    onChange={(e) => setStudioForm({ ...studioForm, studio_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nome da Profissional</label>
                  <input
                    type="text"
                    value={studioForm.client_name}
                    onChange={(e) => setStudioForm({ ...studioForm, client_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Frase Hero (Destaque do Topo)</label>
                <input
                  type="text"
                  value={studioForm.hero_phrase}
                  onChange={(e) => setStudioForm({ ...studioForm, hero_phrase: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Bio / Apresentação</label>
                <textarea
                  rows={2}
                  value={studioForm.bio_description}
                  onChange={(e) => setStudioForm({ ...studioForm, bio_description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">WhatsApp (ex: 5511999999999)</label>
                  <input
                    type="text"
                    value={studioForm.whatsapp_number}
                    onChange={(e) => setStudioForm({ ...studioForm, whatsapp_number: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Instagram (ex: studio.exemplo)</label>
                  <input
                    type="text"
                    value={studioForm.instagram_handle}
                    onChange={(e) => setStudioForm({ ...studioForm, instagram_handle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Foto de Capa</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={studioForm.cover_media_url}
                    onChange={(e) => setStudioForm({ ...studioForm, cover_media_url: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-rose-500 focus:outline-none"
                  />
                  <label className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer flex items-center gap-1 flex-shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'cover')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Cuidados Pré (1 por linha)</label>
                  <textarea
                    rows={3}
                    value={studioForm.pre_care}
                    onChange={(e) => setStudioForm({ ...studioForm, pre_care: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Cuidados Pós (1 por linha)</label>
                  <textarea
                    rows={3}
                    value={studioForm.post_care}
                    onChange={(e) => setStudioForm({ ...studioForm, post_care: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                onClick={() => setActiveTab('none')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveStudioSettings}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg"
              >
                Atualizar Dados
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
