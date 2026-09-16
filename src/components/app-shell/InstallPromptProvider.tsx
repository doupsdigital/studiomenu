'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

/** Evento não-padrão do Chrome/Android — a lib DOM do TS não declara ele. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptContextValue {
  /** Já dá pra instalar (o navegador ofereceu o evento e ainda não instalou). */
  canInstall: boolean;
  /** Já está rodando como app instalado (`display-mode: standalone`). */
  isInstalled: boolean;
  /** Dispara o diálogo nativo do Chrome — só funciona quando `canInstall`. */
  promptInstall: () => Promise<void>;
}

const InstallPromptContext = createContext<InstallPromptContextValue>({
  canInstall: false,
  isInstalled: false,
  promptInstall: async () => {},
});

export const useInstallPrompt = () => useContext(InstallPromptContext);

/** Captura o `beforeinstallprompt` do Chrome (chamando `preventDefault` pra
 *  impedir o mini-banner automático dele) e guarda o evento pra disparar sob
 *  demanda via `promptInstall()` — o botão "Instalar" do `PageTitleBar` é
 *  quem decide a hora, não o navegador sozinho. Monta uma vez em
 *  `/app/[slug]/layout.tsx`, ao lado do `ServiceWorkerRegister`. */
export const InstallPromptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    // O Chrome só deixa usar um mesmo evento uma vez — descarta pra próxima
    // visita gerar um novo `beforeinstallprompt` (se ela cancelou, por ex).
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  return (
    <InstallPromptContext.Provider value={{ canInstall: Boolean(deferredPrompt), isInstalled, promptInstall }}>
      {children}
    </InstallPromptContext.Provider>
  );
};
