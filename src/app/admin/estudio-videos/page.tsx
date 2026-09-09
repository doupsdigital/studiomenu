'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clapperboard, Video, X } from 'lucide-react';
import { NicheType } from '@/types/catalog';

const NICHE_TABS: { key: NicheType; label: string; emoji: string }[] = [
  { key: 'lash', label: 'Lash Designer', emoji: '💕' },
  { key: 'nail', label: 'Nail Designer', emoji: '💅' },
  { key: 'estetica', label: 'Estética', emoji: '🌿' },
  { key: 'studio', label: 'Studio de Beleza', emoji: '👑' },
];

type BgMode = 'light' | 'dark' | 'black' | 'green';

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
  const [bgMode, setBgMode] = useState<BgMode>('light');
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
      {/* Cabeçalho */}
      <div
        className={`w-full max-w-3xl flex flex-col items-center gap-3 mb-4 text-center transition-opacity duration-300 ${
          recordingMode ? 'opacity-0 pointer-events-none h-0 overflow-hidden mb-0' : 'opacity-100'
        }`}
      >
        <Link
          href="/admin"
          className="self-start inline-flex items-center gap-1 text-[10px] font-semibold opacity-60 hover:opacity-100 transition-all"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Voltar ao Painel</span>
        </Link>

        <h1 className="text-2xl md:text-3xl font-serif font-semibold">
          Estúdio de <em className="italic text-rose-500">Gravação de Vídeos</em>
        </h1>
        <p className="text-xs opacity-70 max-w-lg">
          Simule o uso real do StudioMenu no mockup de iPhone para gravar seus vídeos de anúncio diretamente pelo celular ou computador.
        </p>

        {/* Tabs de Nicho */}
        <div className="flex items-center justify-center gap-1.5 bg-black/5 border border-rose-500/20 p-1.5 rounded-full flex-wrap">
          {NICHE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveNiche(tab.key)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
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
      </div>

      {/* Controles */}
      <div
        className={`flex items-center justify-center gap-2.5 mb-4 flex-wrap transition-opacity duration-300 ${
          recordingMode ? 'opacity-0 pointer-events-none h-0 overflow-hidden mb-0' : 'opacity-100'
        }`}
      >
        <button
          onClick={() => setRecordingMode(true)}
          className="px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg"
          style={{ background: '#e65073', color: '#fff' }}
        >
          <Video className="w-3.5 h-3.5" />
          Modo Gravação (Tela Cheia)
        </button>

        <select
          value={bgMode}
          onChange={(e) => setBgMode(e.target.value as BgMode)}
          className="px-3 py-2 rounded-full text-xs font-semibold outline-none border"
          style={{
            background: bgMode === 'dark' || bgMode === 'black' ? '#14100e' : '#ffffff',
            color: bgMode === 'dark' || bgMode === 'black' ? '#fff' : '#1a1412',
            borderColor: 'rgba(0,0,0,0.15)',
          }}
        >
          {(Object.keys(BG_STYLES) as BgMode[]).map((mode) => (
            <option key={mode} value={mode}>
              Fundo: {BG_STYLES[mode].label}
            </option>
          ))}
        </select>
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
              key={activeNiche}
              src={`/c/showcase/${activeNiche}`}
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
