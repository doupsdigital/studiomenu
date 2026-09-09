'use client';

import React, { useState, useMemo } from 'react';

import { ProcedureItem, LayoutModel } from '@/types/catalog';
import { ProcedureCard } from './ProcedureCard';
import { ProcedureModal } from './ProcedureModal';

interface ProcedureGridProps {
  procedures: ProcedureItem[];
  whatsappNumber: string;
  clientName?: string;
  layoutModel?: LayoutModel;
  isEditMode?: boolean;
  onEditProc?: (item: ProcedureItem) => void;
  onDeleteProc?: (item: ProcedureItem) => void;
  onOpenAddProcModal?: () => void;
  onOpenAddCatModal?: () => void;
}

export const ProcedureGrid: React.FC<ProcedureGridProps> = ({
  procedures,
  whatsappNumber,
  clientName = 'Mariana',
  layoutModel = 'mosaico',
  isEditMode = false,
  onEditProc,
  onDeleteProc,
  onOpenAddProcModal,
  onOpenAddCatModal,
}) => {
  const [selectedProcedure, setSelectedProcedure] = useState<ProcedureItem | null>(null);

  // Extrair categorias únicas existentes
  const categories = useMemo(() => {
    const set = new Set<string>();
    procedures.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['Todos', ...Array.from(set)];
  }, [procedures]);

  const [activeCategory, setActiveCategory] = useState('Todos');

  const filteredProcedures = useMemo(() => {
    if (activeCategory === 'Todos') return procedures;
    return procedures.filter((p) => p.category === activeCategory);
  }, [procedures, activeCategory]);

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
          <p className="secao-catalogo__sub">Toque nos Cards para ver detalhes, tempo e valores.</p>
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

          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const count = cat === 'Todos' ? procedures.length : procedures.filter(p => p.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                className={`filtro-chip ${isActive ? 'is-ativo' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat} ({count})
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
        {isClassico ? (
          <div className="studio__lista">
            {filteredProcedures.map((item) => (
              <div
                key={item.id}
                className={`servico-card ${isEditMode ? 'lm-service-card-wrapper' : ''}`}
                onClick={() => {
                  if (!isEditMode) setSelectedProcedure(item);
                }}
              >
                {isEditMode && (
                  <div className="lm-svc-actions-bar">
                    <button
                      type="button"
                      className="lm-svc-btn-action"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        if (onEditProc) onEditProc(item);
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      type="button"
                      className="lm-svc-btn-action lm-svc-btn-danger"
                      title="Excluir"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        if (onDeleteProc) onDeleteProc(item);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                )}

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
            ))}
          </div>
        ) : (
          <div className="mosaico__grid">
            {filteredProcedures.map((item) => (
              <ProcedureCard
                key={item.id}
                item={item}
                whatsappNumber={whatsappNumber}
                isEditMode={isEditMode}
                onSelect={(proc) => setSelectedProcedure(proc)}
                onEditProc={onEditProc}
                onDeleteProc={onDeleteProc}
              />
            ))}
          </div>
        )}

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
        <ProcedureModal
          item={selectedProcedure}
          clientName={clientName}
          whatsappNumber={whatsappNumber}
          onClose={() => setSelectedProcedure(null)}
          onNext={handleNextProcedure}
        />
      )}
    </section>
  );
};
