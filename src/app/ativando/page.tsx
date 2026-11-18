import type { Metadata } from 'next';
import { ActivationScreen } from '@/components/self-serve/ActivationScreen';

export const metadata: Metadata = {
  title: 'Ativando seu menu — StudioMenu',
  robots: { index: false, follow: false },
};

/** Página de obrigado da Cakto (configurada nos 2 produtos, 2026-11-18):
 *  espera o webhook confirmar o pagamento e leva ela direto pro app. */
export default function AtivandoPage() {
  return <ActivationScreen />;
}
