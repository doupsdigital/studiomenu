import React from 'react';

interface CatalogReadyPreviewProps {
  slug: string;
}

// Mesma técnica do mockup de celular da home (`landing-lpb.css`,
// `.lp-testdrive-phone`/`.lp-testdrive-screen-scaler`, já validada com ela
// nesta sessão) — moldura de iPhone com um iframe real escalado (X/Y
// separados) pra preencher a tela recortada, mesmo a proporção não batendo
// 100% com a base 390×844. Recriada aqui como estilo local (não importa
// `landing-lpb.css`, que é específico de landing page de marketing).
const PHONE_W = 220;
const BEZEL = 6;
const BASE_W = 390;
const BASE_H = 844;
const PHONE_H = Math.round(PHONE_W * (BASE_H / BASE_W));
const SCREEN_W = PHONE_W - BEZEL * 2;
const SCREEN_H = PHONE_H - BEZEL * 2;
const SCALE_X = SCREEN_W / BASE_W;
const SCALE_Y = SCREEN_H / BASE_H;

/** Prévia ao vivo do catálogo dela mesma (não uma reconstrução ilustrativa
 *  — é o `/c/[slug]` real, já populado) na tela de primeiro contato,
 *  logo antes dela ver os links de ver/editar. Pedido dela, 2026-09-24:
 *  esse é o momento de maior impacto no funil comercial (o catálogo acabou
 *  de ser criado de graça, é a primeira coisa que a prospect vê) — um
 *  destaque visual real vale mais aqui do que outro carrossel de
 *  onboarding, que só atrapalharia a conversão logo no topo.
 *
 *  `pointer-events: none` — é só vitrine; navegar de verdade continua
 *  sendo o `ViewCatalogCard` logo abaixo. */
export const CatalogReadyPreview: React.FC<CatalogReadyPreviewProps> = ({ slug }) => {
  return (
    <div className="flex flex-col items-center gap-3 py-1">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-[13px] font-bold">
        ✨ Seu catálogo já está no ar
      </span>
      <div
        style={{
          position: 'relative',
          width: PHONE_W,
          height: PHONE_H,
          background: 'linear-gradient(155deg, #2e2729 0%, #110e10 55%)',
          borderRadius: 34,
          boxShadow: '0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1) inset',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: BEZEL,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 56,
            height: 9,
            background: '#000',
            borderRadius: 6,
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: BEZEL,
            left: BEZEL,
            width: SCREEN_W,
            height: SCREEN_H,
            borderRadius: 29,
            overflow: 'hidden',
            background: '#f2cad5',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.4) inset',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: BASE_W,
              height: BASE_H,
              transformOrigin: '0 0',
              transform: `scale(${SCALE_X}, ${SCALE_Y})`,
            }}
          >
            <iframe
              src={`/c/${slug}`}
              title="Prévia do seu catálogo"
              tabIndex={-1}
              style={{ width: BASE_W, height: BASE_H, border: 0, display: 'block', pointerEvents: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
