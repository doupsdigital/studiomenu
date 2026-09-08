'use client';

import React, { useState, useMemo } from 'react';

import { ProcedureItem } from '@/types/catalog';
import { ProcedureCard } from './ProcedureCard';
import { ProcedureModal } from './ProcedureModal';

interface ProcedureGridProps {
  procedures: ProcedureItem[];
  whatsappNumber: string;
  clientName?: string;
}

export const ProcedureGrid: React.FC<ProcedureGridProps> = ({
  procedures,
  whatsappNumber,
  clientName = 'Mariana',
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

  return (
    <section className="secao-catalogo is-visible" id="catalogo" data-screen-label="Mosaico">
      <div className="container">

        <header className="secao-catalogo__header anim-fade-up delay-1">
          <span className="etiqueta">Catálogo de Procedimentos</span>
          <h2 className="secao-catalogo__titulo">Escolha o seu <em>estilo</em></h2>
          <p className="secao-catalogo__sub">Toque nos Cards para ver detalhes, tempo e valores.</p>
        </header>

        {/* Filtros em Chips Horizontais */}
        {categories.length > 1 && (
          <nav className="mosaico__filtros anim-fade-up delay-2" aria-label="Filtrar procedimentos">
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
        )}

        <div className="mosaico__status anim-fade-up delay-3">
          <span className="mosaico__contador">
            {filteredProcedures.length} {filteredProcedures.length === 1 ? 'procedimento' : 'procedimentos'}
          </span>
        </div>

        {/* Grid Mosaico de Cards */}
        <div className="mosaico__grid">
          {filteredProcedures.map((item) => (
            <ProcedureCard
              key={item.id}
              item={item}
              whatsappNumber={whatsappNumber}
              onSelect={(proc) => setSelectedProcedure(proc)}
            />
          ))}
        </div>
      </div>

      {/* Modal de Detalhes do Procedimento */}
      {selectedProcedure && (
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
