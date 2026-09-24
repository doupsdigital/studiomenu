import { Metadata } from 'next';
import { PlusLandingPage } from '@/components/sales/PlusLandingPage';

export const metadata: Metadata = {
  title: 'StudioMenu+ — Agendamento Automático para Studios de Beleza',
  description: 'Suas clientes escolhem o dia e o horário sozinhas, sem trocar mensagem no WhatsApp. Conheça o agendamento automático do StudioMenu+.',
};

export default function StudioMenuPlusLandingPage() {
  return <PlusLandingPage />;
}
