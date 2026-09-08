import React from 'react';
import { CatalogInstructions } from '@/types/catalog';

interface InstructionsSectionProps {
  instructions?: CatalogInstructions;
  bgUrl?: string;
}

export const InstructionsSection: React.FC<InstructionsSectionProps> = ({
  instructions,
  bgUrl,
}) => {
  const bgImage = bgUrl || 'https://lashmenu.com/modelos/mosaico/assets/img/hero.jpg';

  const defaultItems = [
    {
      title: 'Confirmação',
      desc: 'Até um dia antes do seu horário marcado.',
    },
    {
      title: 'Pontualidade',
      desc: instructions?.tolerances || 'Tolerância máxima de 15 minutos de atraso.',
    },
    {
      title: 'Preparação',
      desc: (instructions?.pre_care && instructions.pre_care[0]) || 'Venha com a região dos olhos sem maquiagem.',
    },
    {
      title: 'Pagamento',
      desc: 'Dinheiro, Pix, cartão de débito ou crédito.',
    },
  ];

  return (
    <section className="secao-orientacoes is-visible" id="orientacoes" data-screen-label="Orientações">
      <div className="secao-orientacoes__foto-wrap">

        <img
          src={bgImage}
          alt="Orientações"
          className="secao-orientacoes__foto"
        />
      </div>
      <div className="secao-orientacoes__scrim"></div>

      <div className="secao-orientacoes__conteudo">
        <div className="secao-orientacoes__topo">
          <span className="etiqueta anim-fade-up delay-1">Antes de vir</span>
        </div>

        <div className="secao-orientacoes__corpo">
          <h2 className="secao-orientacoes__titulo anim-fade-up delay-2">
            Orientações para o <em>seu dia</em>.
          </h2>

          <div className="orientacoes__card anim-fade-up delay-3">
            {defaultItems.map((item, index) => {
              const isLast = index === defaultItems.length - 1;
              return (
                <div
                  key={index}
                  className={`orientacao__item ${isLast ? 'orientacao__item--ultimo' : ''}`}
                >
                  <div className="orientacao__icon-box">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div className="orientacao__info">
                    <strong>{item.title}</strong>
                    <p>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="secao-orientacoes__scroll-cue anim-fade-up delay-4">
          <span>Deslize</span>
          <div className="hero__scroll-linha"></div>
        </div>
      </div>
    </section>
  );
};
