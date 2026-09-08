import React from 'react';
import { CatalogOrderData } from '@/types/catalog';

interface HeaderCoverProps {
  data: CatalogOrderData;
  categories: string[];
}

export const HeaderCover: React.FC<HeaderCoverProps> = ({ data, categories }) => {
  const wspText = encodeURIComponent(`Olá! Vim pelo seu catálogo digital e gostaria de tirar uma dúvida.`);
  const wspUrl = `https://wa.me/${data.whatsapp_number}?text=${wspText}`;

  // Se não houver foto de capa especificada, usamos o asset original do modelo
  const heroImage = data.cover_media_url || data.avatar_url || 'https://lashmenu.com/modelos/mosaico/assets/img/Hero.png';

  return (
    <section className="hero is-visible" id="hero" data-screen-label="Capa">
      {/* 1. Foto de Fundo Ken Burns */}

      <div className="hero__foto-wrap">
        <img
          src={heroImage}
          alt={data.studio_name || data.client_name}
          className="hero__foto"
          fetchPriority="high"
        />
      </div>

      {/* 2. Scrim (Gradiente Esfumaçado) */}
      <div className="hero__scrim"></div>

      {/* 3. Conteúdo Sobreposto */}
      <div className="hero__conteudo">
        {/* Selo Seja Bem Vinda */}
        <div className="hero__selo anim-fade-up delay-1">
          <span>Seja Bem Vinda</span>
        </div>

        {/* Título & Nome */}
        <div className="hero__titulo">
          <div className="hero__studio-line anim-fade-up delay-2">
            <span className="hero__studio-label">STUDIO</span>
            <span className="hero__studio-divider"></span>
          </div>
          <h1 className="anim-fade-up delay-2">{data.client_name}</h1>
          <div className="hero__filete anim-fade-up delay-3"></div>
          <p className="hero__frase-cilios anim-fade-up delay-4">
            {data.hero_phrase || data.bio_description || (
              <>A arte de transformar o <em>seu olhar</em> — leveza incomparável, precisão e elegância.</>
            )}
          </p>
        </div>

        {/* Chips de Categorias Sobre a Foto */}
        {categories.length > 0 && (
          <div className="hero__chips anim-fade-up delay-5" id="hero-chips">
            {categories.map((cat) => (
              <span className="hero__chip" key={cat}>
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Botão de Rolagem Ver Catálogo */}
        <a href="#catalogo" className="hero__scroll-cue anim-fade-up delay-6" aria-label="Deslize para ver o catálogo">
          <span>Ver Catálogo</span>
          <div className="hero__scroll-linha"></div>
        </a>
      </div>

      {/* Botão Flutuante de WhatsApp (Canto Inferior Direito) */}
      <a
        href={wspUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="wsp-float-btn"
        id="wsp-float-btn"
        aria-label="Falar comigo no WhatsApp"
      >
        <div className="wsp-float-btn__icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"
              fill="#FFFFFF"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.477 2 12c0 2.15.68 4.14 1.839 5.776L2.5 21.5l3.876-1.309A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.298-1.246l-.308-.184-2.296.775.775-2.253-.2-.317A7.957 7.957 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
      </a>
    </section>
  );
};
