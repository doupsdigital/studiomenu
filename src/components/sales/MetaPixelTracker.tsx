'use client';

import Script from 'next/script';

/** ID do Pixel oficial da Meta do StudioMenu */
const DEFAULT_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '1042165951490026';

/** Meta Pixel Tracker para a landing page pública de vendas.
 *  Carrega o script oficial do Meta Pixel (fbevents.js) e dispara PageView.
 *  Gera os cookies _fbp e _fbc automaticamente no navegador do visitante
 *  para garantir atribuição precisa no Meta Ads e na API de Conversões (CAPI).
 */
export function MetaPixelTracker({ pixelId }: { pixelId?: string } = {}) {
  // `pixelId` explícito (2026-11-17): a página `/lash` usa outro pixel
  // (ver `LASH_FUNNEL_PIXEL_ID`); sem a prop, o comportamento de sempre.
  const PIXEL_ID = pixelId || DEFAULT_PIXEL_ID;
  return (
    <>
      <Script
        id="meta-pixel-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
