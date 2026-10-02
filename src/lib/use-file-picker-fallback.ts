'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Generoso de propósito — celular lento abrindo o app de fotos ainda conta
// como "abriu"; só quem nunca abre de verdade deve disparar o aviso.
const STUCK_TIMEOUT_MS = 5000;

/** Detecta quando o seletor nativo de arquivo parece não ter aberto (achado
 *  real, 2026-10-02: cliente clicava em "Escolher Imagem do Dispositivo" e
 *  nada acontecia — causa provável: link aberto pelo WhatsApp num Custom Tab
 *  sem permissão de Fotos/Mídia concedida pro próprio WhatsApp; abrir o
 *  mesmo link direto no Chrome resolveu).
 *
 *  Puramente aditivo: nunca troca nem desliga o `<input type="file">` em si
 *  — só observa se a aba perde o foco depois do clique (sinal de que o
 *  seletor abriu de verdade, nativo ou de app). Se isso não acontecer
 *  dentro do tempo de espera, mostra uma dica de abrir o link direto no
 *  navegador. Quem já funciona normal nunca vê isso, porque o foco muda
 *  assim que o seletor abre — o `blur`/`visibilitychange` dispara antes do
 *  timeout e cancela o aviso. */
export function useFilePickerFallback(onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void) {
  const [showStuckHint, setShowStuckHint] = useState(false);
  const [copied, setCopied] = useState(false);
  const cleanupRef = useRef<() => void>(() => {});

  useEffect(() => () => cleanupRef.current(), []);

  const handleLabelClick = useCallback(() => {
    setShowStuckHint(false);
    cleanupRef.current();

    const onPickerOpened = () => cleanupRef.current();
    const onVisibility = () => {
      if (document.hidden) onPickerOpened();
    };
    const timeoutId = setTimeout(() => {
      setShowStuckHint(true);
      cleanupRef.current();
    }, STUCK_TIMEOUT_MS);

    cleanupRef.current = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('blur', onPickerOpened);
      document.removeEventListener('visibilitychange', onVisibility);
      cleanupRef.current = () => {};
    };

    window.addEventListener('blur', onPickerOpened);
    document.addEventListener('visibilitychange', onVisibility);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      cleanupRef.current();
      setShowStuckHint(false);
      onFileUpload(e);
    },
    [onFileUpload]
  );

  const copyPageLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard indisponível nesse navegador — sem fallback automático
      // aqui, mas o botão de upload original continua funcionando normal.
    }
  }, []);

  return { showStuckHint, copied, handleLabelClick, handleChange, copyPageLink };
}
