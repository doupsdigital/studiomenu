'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ProcedureImagePlaceholder } from './ProcedureImagePlaceholder';

interface ProcedureImageProps {
  src?: string;
  alt: string;
  className: string;
  variant: 'tile' | 'thumb' | 'detail';
  clientName?: string;
}

/** Imagem de procedimento com fallback pro placeholder (pedido real,
 *  2026-10-09) — cobre tanto "sem foto" (campo vazio) quanto "URL
 *  quebrada" (404, storage apagado etc.).
 *
 *  O `onError` sozinho não é suficiente: a página é renderizada no
 *  servidor (SSR), então o navegador já começa a carregar a imagem a
 *  partir do HTML puro, ANTES do React hidratar e anexar o `onError`. Se
 *  a imagem falhar rápido (ex: 404 local), o erro acontece nessa janela
 *  sem listener nenhum — e como a `src` não muda de novo, o evento nunca
 *  mais dispara (bug real encontrado, 2026-10-09: funcionava pra "sem
 *  foto", mas não pra "URL quebrada"). Por isso o `useEffect` abaixo
 *  também checa, assim que o componente aparece na tela,
 *  `img.complete && img.naturalWidth === 0` — sinal de que ela já tinha
 *  falhado antes da hidratação. */
export const ProcedureImage: React.FC<ProcedureImageProps> = ({ src, alt, className, variant, clientName }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setFailed(true);
    }
  }, [src]);

  if (!src || failed) {
    return <ProcedureImagePlaceholder variant={variant} clientName={clientName} />;
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};
