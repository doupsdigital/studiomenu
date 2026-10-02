'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Video, X } from 'lucide-react';
import { NicheType } from '@/types/catalog';
import { NICHE_OPTIONS } from '@/data/niche-options';

const NICHE_EMOJI: Record<NicheType, string> = { lash: '💕', nail: '💅', estetica: '🌿', studio: '👑' };

// Só Lash e Nail aqui (pedido real, 2026-10-02: muitos botões atrapalhavam
// a gravação no celular, prioridade é o mockup ocupar a tela) — não filtra
// NICHE_OPTIONS na fonte, que outras telas usam com os 4 nichos completos.
const RECORDABLE_NICHES: NicheType[] = ['lash', 'nail'];
const NICHE_TABS: { key: NicheType; label: string; emoji: string }[] = NICHE_OPTIONS.filter((o) =>
  RECORDABLE_NICHES.includes(o.value)
).map((o) => ({
  key: o.value,
  label: o.label,
  emoji: NICHE_EMOJI[o.value],
}));

type BgMode = 'light' | 'dark' | 'black' | 'green';
type BookingMode = 'plus' | 'basico';

const BG_STYLES: Record<BgMode, { background: string; color: string; label: string }> = {
  light: { background: 'linear-gradient(135deg, #faf6f0 0%, #f4ede4 100%)', color: '#1a1412', label: 'Claro Nude/Rosé (Página de Vendas)' },
  dark: { background: '#0d0b0a', color: '#f3efe9', label: 'Studio Escuro' },
  black: { background: '#000000', color: '#ffffff', label: 'Preto Puro (100% Black)' },
  green: { background: '#00ff00', color: '#000000', label: 'Chroma Key (Verde)' },
};

const PHONE_W = 390;
const PHONE_H = 844;

export default function EstudioVideosPage() {
  const [activeNiche, setActiveNiche] = useState<NicheType>('lash');
  const [bookingMode, setBookingMode] = useState<BookingMode>('plus');
  // Fixo em "light" (pedido real, 2026-10-02: seletor de fundo removido da
  // tela pra ficar mais compacta) — BG_STYLES/BgMode continuam existindo
  // caso essa escolha volte a ser necessária no futuro.
  const bgMode: BgMode = 'light';
  const [recordingMode, setRecordingMode] = useState(false);
  const [scale, setScale] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      const maxW = Math.min(window.innerWidth * 0.9, PHONE_W);
      setScale(maxW / PHONE_W);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setRecordingMode(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const bg = BG_STYLES[bgMode];

  return (
    <div
      className="min-h-screen flex flex-col items-center pt-4 px-4 transition-colors duration-300"
      style={{ background: bg.background, color: bg.color }}
    >
      {/* Cabeçalho + Controles — bem compacto de propósito (pedido real,
       *  2026-10-02): prioridade é o mockup ocupar o máximo de tela
       *  possível, principalmente gravando pelo celular. */}
      <div
        className={`w-full max-w-3xl flex flex-col items-center gap-1.5 mb-2 text-center transition-opacity duration-300 ${
          recordingMode ? 'opacity-0 pointer-events-none h-0 overflow-hidden mb-0' : 'opacity-100'
        }`}
      >
        <div className="w-full flex items-center justify-between gap-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-[10px] font-semibold opacity-60 hover:opacity-100 transition-all"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Voltar</span>
          </Link>
          <h1 className="text-sm font-serif font-semibold opacity-80">Estúdio de Vídeos</h1>
          <span className="w-[38px]" aria-hidden="true" />
        </div>

        {/* Nicho + Modo de agendamento na mesma linha — ambos com só 2
         *  opções, cabem lado a lado mesmo em tela de celular. */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 bg-black/5 border border-rose-500/20 p-1 rounded-full">
            {NICHE_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveNiche(tab.key)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                  activeNiche === tab.key
                    ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Modo de Agendamento — qual experiência o botão "Agendar" simula
           *  (pedido real, 2026-10-02: gravar o vídeo do plano Básico sem
           *  usar um WhatsApp real na tela). */}
          <div className="flex items-center gap-1 bg-black/5 border border-rose-500/20 p-1 rounded-full">
            <button
              onClick={() => setBookingMode('plus')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                bookingMode === 'plus'
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <span>📅</span>
              <span>Plus</span>
            </button>
            <button
              onClick={() => setBookingMode('basico')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                bookingMode === 'basico'
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <span>💬</span>
              <span>Básico</span>
            </button>
          </div>

          <button
            onClick={() => setRecordingMode(true)}
            className="px-3.5 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-lg"
            style={{ background: '#e65073', color: '#fff' }}
          >
            <Video className="w-3 h-3" />
            Modo Gravação
          </button>
        </div>
      </div>

      {/* Botão Sair do Modo Gravação */}
      {recordingMode && (
        <button
          onClick={() => setRecordingMode(false)}
          className="fixed top-3.5 right-3.5 z-[9999] px-4 py-2 rounded-full text-xs font-extrabold bg-black/85 border-[1.5px] border-rose-500 text-white shadow-2xl flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          Sair do Modo Gravação (ESC)
        </button>
      )}

      {/* Palco com o Mockup de iPhone */}
      <div ref={stageRef} className="relative flex items-center justify-center w-full">
        <div
          className="relative bg-black overflow-hidden mx-auto"
          style={{
            width: PHONE_W * scale,
            height: PHONE_H * scale,
            border: '5px solid #000',
            borderRadius: 46,
            boxShadow: '0 25px 70px rgba(0,0,0,0.35)',
          }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 bg-black rounded-b-xl z-10 pointer-events-none"
            style={{ width: 90 * scale, height: 16 * scale }}
          />
          <div
            className="absolute top-0 left-0 overflow-hidden rounded-[34px]"
            style={{ width: PHONE_W, height: PHONE_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}
          >
            <iframe
              key={`${activeNiche}-${bookingMode}`}
              src={`/c/showcase/${activeNiche}${bookingMode === 'basico' ? 'designer' : ''}`}
              title="Prévia StudioMenu"
              className="border-0 block bg-slate-950"
              style={{ width: PHONE_W, height: PHONE_H }}
              allow="autoplay"
            />
          </div>
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
