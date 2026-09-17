'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { ProcedureItem, LayoutModel } from '@/types/catalog';
import { ProcedureCard } from './ProcedureCard';
import { ProcedureDetailModal } from './ProcedureDetailModal';

interface ProcedureGridProps {
  procedures: ProcedureItem[];
  allCategories?: string[];
  whatsappNumber: string;
  clientName?: string;
  layoutModel?: LayoutModel;
  isEditMode?: boolean;
  onEditProc?: (item: ProcedureItem) => void;
  onDeleteProc?: (item: ProcedureItem) => void;
  onReorderProcedures?: (newProcedures: ProcedureItem[]) => void;
  onOpenAddProcModal?: () => void;
  onOpenAddCatModal?: () => void;
  onDeleteCategory?: (categoryName: string, count: number) => void;
  onMoveCategory?: (categoryName: string, direction: 'left' | 'right') => void;
  bookingEnabled?: boolean;
  onRequestBooking?: (item: ProcedureItem) => void;
}

/** Envolve um card de procedimento (mosaico OU clássico) pra deixar arrastar
 *  pra reordenar, e concentra a barra de ações (arrastar + editar + excluir)
 *  num único bloco — antes eram dois elementos flutuantes separados (a alça
 *  sozinha e o par Editar/Excluir), que ficavam espremidos um em cima do
 *  outro nos cards mais estreitos do grid mosaico. A alça vem primeiro,
 *  com uma cor própria (rosa sólido) pra se diferenciar visualmente de
 *  Editar/Excluir — é uma ação diferente (arrastar, não tocar). Só a alça
 *  tem `touch-action: none`/os listeners de arraste; o resto do card
 *  continua rolando a página normalmente. */
const SortableProcCard: React.FC<{
  id: string;
  isEditMode: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  children: React.ReactNode;
}> = ({ id, isEditMode, onEdit, onDelete, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: !isEditMode });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="lm-sortable-proc">
      {isEditMode && (
        <div className="lm-svc-actions-bar">
          <span className="lm-proc-drag-handle" aria-hidden="true" {...attributes} {...listeners}>
            <GripVertical className="w-3.5 h-3.5" />
          </span>
          <button type="button" className="lm-svc-btn-action" onClick={onEdit}>
            ✏️ Editar
          </button>
          <button type="button" className="lm-svc-btn-action lm-svc-btn-danger" title="Excluir" onClick={onDelete}>
            🗑️
          </button>
        </div>
      )}
      {children}
    </div>
  );
};

export const ProcedureGrid: React.FC<ProcedureGridProps> = ({
  procedures,
  allCategories,
  whatsappNumber,
  clientName = 'Mariana',
  layoutModel = 'mosaico',
  isEditMode = false,
  onEditProc,
  onDeleteProc,
  onReorderProcedures,
  onOpenAddProcModal,
  onOpenAddCatModal,
  onDeleteCategory,
  onMoveCategory,
  bookingEnabled = false,
  onRequestBooking,
}) => {
  const [selectedProcedure, setSelectedProcedure] = useState<ProcedureItem | null>(null);

  // Extrair categorias únicas existentes (incluindo categorias vazias recém-criadas)
  const categories = useMemo(() => {
    const set = new Set<string>();
    if (Array.isArray(allCategories)) {
      allCategories.forEach((cat) => {
        if (cat) set.add(cat);
      });
    }
    procedures.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['Todos', ...Array.from(set)];
  }, [allCategories, procedures]);

  const [activeCategory, setActiveCategory] = useState('Todos');

  const filteredProcedures = useMemo(() => {
    if (activeCategory === 'Todos') return procedures;
    return procedures.filter((p) => p.category === activeCategory);
  }, [procedures, activeCategory]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // O arraste já só começa a partir do ícone de alça (não do card
      // inteiro), então não precisa de atraso pra distinguir de scroll —
      // só uma tolerância mínima de movimento pra não iniciar num toque
      // parado sem intenção de arrastar.
      activationConstraint: { distance: 4 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorderProcedures) return;

    const oldIndex = filteredProcedures.findIndex((p) => p.id === active.id);
    const newIndex = filteredProcedures.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedFiltered = arrayMove(filteredProcedures, oldIndex, newIndex);

    // Se o filtro ativo é "Todos", a lista filtrada já É a lista completa.
    // Se é uma categoria específica, recoloca os itens reordenados nas
    // mesmas posições que ocupavam na lista completa, sem mexer na posição
    // relativa dos itens de outras categorias.
    if (activeCategory === 'Todos') {
      onReorderProcedures(reorderedFiltered);
      return;
    }
    const filteredIds = new Set(filteredProcedures.map((p) => p.id));
    const queue = [...reorderedFiltered];
    const newFullList = procedures.map((item) => (filteredIds.has(item.id) ? queue.shift()! : item));
    onReorderProcedures(newFullList);
  };

  const handleNextProcedure = () => {
    if (!selectedProcedure) return;
    const currentIndex = filteredProcedures.findIndex((p) => p.id === selectedProcedure.id);
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % filteredProcedures.length;
      setSelectedProcedure(filteredProcedures[nextIndex]);
    }
  };

  const formatPrice = (val: string) => {
    if (!val) return 'Sob Consulta';
    const lower = val.toLowerCase();
    if (lower.includes('r$') || lower.includes('incluso') || lower.includes('guia') || lower.includes('consulta')) {
      return val;
    }
    return `R$ ${val}`;
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1583001809873-a1284d563391?auto=format&fit=crop&w=400&q=80';

  const isClassico = layoutModel === 'classico';

  return (
    <section className="secao-catalogo is-visible" id="catalogo" data-screen-label={isClassico ? 'Serviços' : 'Mosaico'}>
      <div className="container">

        <header className="secao-catalogo__header anim-fade-up delay-1">
          <span className="etiqueta">{isClassico ? 'Menu de Serviços' : 'Catálogo de Procedimentos'}</span>
          <h2 className="secao-catalogo__titulo">
            {isClassico ? <>Procedimentos &amp; <em>Valores</em></> : <>Escolha o seu <em>estilo</em></>}
          </h2>
          <p className="secao-catalogo__sub">
            {isEditMode ? 'Segure e arraste um card pra reordenar.' : 'Toque nos Cards para ver detalhes, tempo e valores.'}
          </p>
        </header>

        {/* Filtros em Chips Horizontais */}
        <nav className="mosaico__filtros anim-fade-up delay-2" aria-label="Filtrar procedimentos">
          {isEditMode && (
            <button
              type="button"
              className="lm-btn-add-category-chip"
              onClick={onOpenAddCatModal}
            >
              + Nova Categoria
            </button>
          )}

          {categories.map((cat, idx) => {
            const isActive = activeCategory === cat;
            const count = cat === 'Todos' ? procedures.length : procedures.filter(p => p.category === cat).length;
            // idx 0 é sempre "Todos" (não reordenável), então a primeira
            // categoria de verdade é idx 1.
            const isFirstReal = idx <= 1;
            const isLastReal = idx === categories.length - 1;
            return (
              <button
                key={cat}
                type="button"
                className={`filtro-chip ${isActive ? 'is-ativo' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {isEditMode && cat !== 'Todos' && (
                  <span
                    className={`lm-chip-move-icon ${isFirstReal ? 'is-disabled' : ''}`}
                    title="Mover pra esquerda"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isFirstReal && onMoveCategory) onMoveCategory(cat, 'left');
                    }}
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </span>
                )}
                <span>{cat} ({count})</span>
                {isEditMode && cat !== 'Todos' && (
                  <>
                    <span
                      className={`lm-chip-move-icon ${isLastReal ? 'is-disabled' : ''}`}
                      title="Mover pra direita"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isLastReal && onMoveCategory) onMoveCategory(cat, 'right');
                      }}
                    >
                      <ChevronRight className="w-3 h-3" />
                    </span>
                    <span
                      className="lm-chip-trash-icon"
                      title={`Excluir Categoria ${cat}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDeleteCategory) onDeleteCategory(cat, count);
                      }}
                    >
                      ✕
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mosaico__status anim-fade-up delay-3">
          <span className="mosaico__contador">
            MOSTRANDO {filteredProcedures.length} {filteredProcedures.length === 1 ? 'PROCEDIMENTO' : 'PROCEDIMENTOS'}
          </span>
        </div>

        {/* Renderização condicional por modelo (Clássico = Lista / Mosaico = Grid) */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={filteredProcedures.map((p) => p.id)}
            strategy={isClassico ? verticalListSortingStrategy : rectSortingStrategy}
          >
            {isClassico ? (
              <div className="studio__lista">
                {filteredProcedures.map((item) => (
                  <SortableProcCard
                    key={item.id}
                    id={item.id}
                    isEditMode={isEditMode}
                    onEdit={() => onEditProc?.(item)}
                    onDelete={() => onDeleteProc?.(item)}
                  >
                    <div
                      className={`servico-card ${isEditMode ? 'lm-service-card-wrapper' : ''}`}
                      onClick={() => {
                        if (!isEditMode) setSelectedProcedure(item);
                      }}
                    >
                      <div className="servico-card__foto-box">
                        <img
                          src={item.image_url || fallbackImage}
                          alt={item.title}
                          className="servico-card__foto"
                          loading="lazy"
                        />
                      </div>
                      <div className="servico-card__conteudo">
                        {item.category && <span className="servico-card__cat">{item.category}</span>}
                        <h3 className="servico-card__titulo">{item.title}</h3>
                        {item.description && <p className="servico-card__desc">{item.description}</p>}
                      </div>
                      <div className="servico-card__lado-dir">
                        <span className="servico-card__preco">{formatPrice(item.price)}</span>
                        {item.duration && <span className="servico-card__duracao">{item.duration}</span>}
                        <span className="servico-card__seta">→</span>
                      </div>
                    </div>
                  </SortableProcCard>
                ))}
              </div>
            ) : (
              <div className="mosaico__grid">
                {filteredProcedures.map((item) => (
                  <SortableProcCard
                    key={item.id}
                    id={item.id}
                    isEditMode={isEditMode}
                    onEdit={() => onEditProc?.(item)}
                    onDelete={() => onDeleteProc?.(item)}
                  >
                    <ProcedureCard
                      item={item}
                      whatsappNumber={whatsappNumber}
                      isEditMode={isEditMode}
                      onSelect={(proc) => setSelectedProcedure(proc)}
                    />
                  </SortableProcCard>
                ))}
              </div>
            )}
          </SortableContext>
        </DndContext>

        {/* BOTÃO ADICIONAR NOVO PROCEDIMENTO DENTRO DO GRID */}
        {isEditMode && (
          <div className="lm-add-service-container">
            <button
              type="button"
              className="lm-btn-add-service"
              onClick={onOpenAddProcModal}
            >
              ➕ Adicionar Novo Procedimento
            </button>
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Procedimento */}
      {selectedProcedure && !isEditMode && (
        <ProcedureDetailModal
          item={selectedProcedure}
          clientName={clientName}
          whatsappNumber={whatsappNumber}
          onClose={() => setSelectedProcedure(null)}
          onNext={handleNextProcedure}
          bookingEnabled={bookingEnabled}
          onBook={
            onRequestBooking
              ? (proc) => {
                  setSelectedProcedure(null);
                  onRequestBooking(proc);
                }
              : undefined
          }
        />
      )}
    </section>
  );
};
