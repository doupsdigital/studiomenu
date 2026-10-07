'use client';

import React, { useEffect, useMemo, useState } from 'react';

const COLORS = ['#e11d48', '#fb7185', '#fbbf24', '#34d399', '#f3e8e1'];
const PIECE_COUNT = 70;

interface Piece {
  left: number;
  color: string;
  width: number;
  height: number;
  duration: number;
  delay: number;
  rotation: number;
  drift: number;
}

/** Confete de 1 disparo só — pedido real, 2026-10-07: primeira tela que a
 *  profissional vê ao abrir o link do app, antes de pagar o Catálogo, pra
 *  dar um ar mais festivo logo de cara. Puramente decorativo
 *  (`pointer-events-none`, nunca atrapalha nenhum toque) e se desmonta
 *  sozinho depois que a última peça termina de cair — não fica pesando a
 *  tela pra sempre. Sem biblioteca externa de propósito (efeito simples,
 *  não vale a pena puxar dependência nova só pra isso). */
export const ConfettiBurst: React.FC = () => {
  const [visible, setVisible] = useState(true);

  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: PIECE_COUNT }, () => ({
        left: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        width: 6 + Math.random() * 5,
        height: 10 + Math.random() * 6,
        duration: 2.6 + Math.random() * 1.6,
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
        drift: (Math.random() - 0.5) * 140,
      })),
    []
  );

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(false), 4500);
    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden pointer-events-none" aria-hidden="true">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) translateX(var(--confetti-drift)) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pieces.map((p, i) => (
        <span
          key={i}
          style={
            {
              position: 'absolute',
              left: `${p.left}%`,
              top: 0,
              width: p.width,
              height: p.height,
              backgroundColor: p.color,
              borderRadius: 2,
              '--confetti-drift': `${p.drift}px`,
              animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
              transform: `rotate(${p.rotation}deg)`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
