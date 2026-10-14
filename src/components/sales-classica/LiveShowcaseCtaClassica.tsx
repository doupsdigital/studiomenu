'use client';

import Link from 'next/link';

/** Cópia de segurança de `LiveShowcaseCta.tsx` — ver `SalesLandingPageClassica.tsx`. */
export function LiveShowcaseCtaClassica() {
  return (
    <section className="lpc-live-cta-section">
      <div className="lpc-container">
        <div className="lpc-live-cta-box">
          <div className="lpc-live-cta-badge">
            <span className="lpc-live-cta-badge-icon">✨</span>
            <span>TESTE AO VIVO EM 1 CLIQUE</span>
          </div>

          <h2 className="lpc-live-cta-title">
            Ainda com dúvidas? Veja na prática como fica o seu catálogo!
          </h2>

          <div className="lpc-live-cta-actions">
            <Link
              href="/c/showcase/studiodesigner"
              target="_blank"
              rel="noopener noreferrer"
              className="lpc-live-cta-btn"
            >
              <span>VER MODELO NA PRÁTICA</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
