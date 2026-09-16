import type { Metadata } from 'next';
import { ProfessionalLoginForm } from '@/components/auth/ProfessionalLoginForm';

export const metadata: Metadata = {
  title: 'Entrar — StudioMenu',
};

export default function EntrarPage() {
  return <ProfessionalLoginForm />;
}
