'use client';

import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  maxOpacity: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.floor(Math.random() * 90) + 5,
    size: Math.floor(Math.random() * 8) + 6,
    duration: Number((Math.random() * 4 + 4.5).toFixed(1)),
    delay: Number((Math.random() * 2.5).toFixed(1)),
    maxOpacity: Number((Math.random() * 0.4 + 0.4).toFixed(2)),
  }));
}

/**
 * Partículas flutuantes iluminadas na capa (bolhas rosé no tema Rose,
 * douradas no Luxury). Geradas só no cliente (useEffect) pra não causar
 * mismatch de hidratação -- SSR e o primeiro paint do client sempre
 * renderizam vazio, as partículas aparecem logo em seguida, exatamente
 * como no site estático original.
 */
export const HeroParticles: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(generateParticles(14));
  }, []);

  return (
    <div className="hero__particles" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="hero__particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            ['--duration' as any]: `${p.duration}s`,
            ['--delay' as any]: `${p.delay}s`,
            ['--max-opacity' as any]: p.maxOpacity,
          }}
        />
      ))}
    </div>
  );
};
