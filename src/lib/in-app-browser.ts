/** Detecta navegadores internos de apps (Instagram, Facebook, TikTok,
 *  LinkedIn) que costumam bloquear o seletor nativo de arquivo — cada um
 *  deixa uma marca própria no user-agent. Não cobre todo caso possível (ex:
 *  Custom Tab do WhatsApp não se identifica no user-agent, se apresenta
 *  como Chrome normal), só os mais comuns e detectáveis. */
export function isKnownInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Instagram|FBAN|FBAV|FB_IAB|TikTok|musical_ly|LinkedInApp/i.test(ua);
}
