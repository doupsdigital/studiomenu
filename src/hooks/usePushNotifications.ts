'use client';

import { useCallback, useEffect, useState } from 'react';

export type PushPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

/** Converte a VAPID public key (base64url) pro formato `Uint8Array` que a
 *  Push API pede em `applicationServerKey`. */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

/** Gerencia a inscrição de push notifications do navegador atual pro
 *  catálogo. Não decide UI nenhuma — só expõe `permission` e `subscribe()`
 *  pro `PushActivationFlow` usar. */
export function usePushNotifications(slug: string) {
  const [permission, setPermission] = useState<PushPermissionState>('default');
  // `Notification.permission` só pode ser lido no client, depois de montar —
  // `ready` distingue "ainda não sei" de "sei e é 'default'", pra quem
  // decide mostrar/esconder UI com base nisso não piscar (mostrar e sumir
  // em seguida) enquanto essa checagem inicial não termina.
  const [ready, setReady] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  // Existe mesmo uma inscrição de push neste aparelho? `null` = ainda não sei
  // (ou o service worker ainda não registrou). Só `Notification.permission`
  // não basta: o botão "Cancelar inscrição" que o Chrome do Android põe nas
  // notificações remove a inscrição sem avisar o app (achado testando).
  const [subscribed, setSubscribed] = useState<boolean | null>(null);

  // Relê permissão + inscrição — no mount e toda vez que o app volta pro
  // primeiro plano (a mudança acontece fora do app, na barra de notificações).
  const refresh = useCallback(async () => {
    const supported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setPermission(supported ? Notification.permission : 'unsupported');
    setReady(true);
    if (!supported || Notification.permission !== 'granted') {
      setSubscribed(false);
      return;
    }
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setSubscribed(null);
        return;
      }
      setSubscribed(Boolean(await registration.pushManager.getSubscription()));
    } catch {
      setSubscribed(null);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', refresh);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey || permission === 'unsupported') return false;

    setSubscribing(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') return false;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const res = await fetch('/api/professional/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, subscription: subscription.toJSON() }),
      });
      const json = await res.json();
      if (json.success) setSubscribed(true);
      return Boolean(json.success);
    } catch (error) {
      console.error('[usePushNotifications] Falha ao assinar:', error);
      return false;
    } finally {
      setSubscribing(false);
    }
  }, [slug, permission]);

  const sendTest = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/professional/push-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const json = await res.json();
      return Boolean(json.success);
    } catch (error) {
      console.error('[usePushNotifications] Falha ao enviar teste:', error);
      return false;
    }
  }, [slug]);

  return { permission, ready, subscribed, subscribing, subscribe, sendTest };
}
