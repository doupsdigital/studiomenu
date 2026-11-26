'use client';

import React, { useEffect, useRef } from 'react';
import { trackFunnel } from './funnel';

const VIDEO_SRC = '/landing/lash-edicao.mp4';
const POSTER_SRC = '/landing/lash-edicao-poster.webp';
const PROGRESS_MARKS = [25, 50, 95] as const;

interface SelfServeEditDemoProps {
  /** Primeiro nome dela (quando já tem prévia) pra personalizar o título. */
  firstName: string | null;
  onContinue: () => void;
}

/** "Veja como você edita" (2026-11-26) — a ponte entre o "uau" da prévia e
 *  o preço. As gravações do PostHog mostravam: cria o menu → "Ativar" → vê
 *  o preço → sai. A dúvida que o X1 respondia ("vou conseguir editar
 *  sozinha?") ficava sem resposta; o vídeo (30s, sem áudio) mostra a edição
 *  pelo celular e o menu pronto. Só existe na página depois do "Ativar". */
export const SelfServeEditDemo: React.FC<SelfServeEditDemoProps> = ({ firstName, onContinue }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const marksSent = useRef(new Set<number>());

  // `demo_view` uma vez + só toca o vídeo enquanto estiver na tela.
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    // O React não garante o `muted` como PROPRIEDADE do elemento, e o
    // navegador só deixa tocar sozinho vídeo mudo — força aqui.
    video.muted = true;
    video.defaultMuted = true;

    let viewed = false;
    let visible = false;
    let retry: number | undefined;

    // Bug real (2026-11-26): o vídeo às vezes ficava parado. Ao liberar a
    // página, a seção nasce fora da tela e a rolagem a traz — o `play()` era
    // interrompido por um `pause()` no meio do caminho e ninguém tentava de
    // novo. Agora tenta de novo enquanto ela estiver na tela.
    const tryPlay = () => {
      window.clearTimeout(retry);
      if (!visible || !video.paused) return;
      video.play().catch(() => {
        retry = window.setTimeout(tryPlay, 400);
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          if (!viewed) {
            viewed = true;
            trackFunnel('demo_view');
          }
          tryPlay();
        } else {
          window.clearTimeout(retry);
          video.pause();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(section);

    // Rede de segurança do loop: se por algum motivo terminar, recomeça.
    const onEnded = () => {
      video.currentTime = 0;
      tryPlay();
    };
    video.addEventListener('ended', onEnded);
    video.addEventListener('canplay', tryPlay);
    return () => {
      window.clearTimeout(retry);
      observer.disconnect();
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('canplay', tryPlay);
    };
  }, []);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    for (const mark of PROGRESS_MARKS) {
      if (pct >= mark && !marksSent.current.has(mark)) {
        marksSent.current.add(mark);
        trackFunnel('demo_video_progress', { percent: mark === 95 ? 100 : mark });
      }
    }
  };

  return (
    <section id="como-editar" className="lp-ss-demo" ref={sectionRef}>
      <div className="lp-container">
        <div className="lp-ss-demo-inner">
          <p className="lp-ss-demo-kicker">Leva poucos minutos</p>
          <h2 className="lp-section-title lp-ss-demo-title">
            {firstName ? (
              <>
                {firstName}, veja no vídeo abaixo como é fácil <em>editar os serviços</em>
              </>
            ) : (
              <>
                Veja no vídeo abaixo como é fácil <em>editar os serviços</em>
              </>
            )}
          </h2>

          <div className="lp-ss-demo-phone">
            <video
              ref={videoRef}
              className="lp-ss-demo-video"
              src={VIDEO_SRC}
              poster={POSTER_SRC}
              muted
              loop
              playsInline
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              aria-label="Vídeo mostrando a edição do menu pelo celular: trocar serviço, preço e foto, e o menu pronto"
            />
          </div>

          {/* Pílulas curtas (2026-11-26): tudo — título, vídeo, pontos e
              botão — precisa caber numa tela de celular, sem rolar. */}
          <ul className="lp-ss-demo-points">
            <li>Troque nome e preço</li>
            <li>Coloque suas fotos</li>
            <li>Salve e pronto</li>
          </ul>

          <button
            type="button"
            className="lp-btn lp-btn--primary lp-ss-btn-block lp-ss-demo-cta lp-tier-cta-pulse"
            onClick={onContinue}
          >
            Quero ativar o meu menu
          </button>
        </div>
      </div>
    </section>
  );
};
