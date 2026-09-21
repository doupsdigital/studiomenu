export interface OnboardingChecklistItem {
  id: string;
  label: string;
  href: string;
  /** Já feito, segundo o que o servidor sabe (banco). */
  done: boolean;
  /** Não existe dado no banco pra saber se foi feito — o "feito" é uma marca
   *  guardada no aparelho (`localStorage`), resolvida no cliente. */
  clientTracked?: boolean;
}

interface OnboardingChecklistInput {
  slug: string;
  planTier: 'catalog' | 'basico' | 'plus';
  subscriptionStatus: 'none' | 'ativo' | 'suspenso' | 'cancelado';
  hasAccount: boolean;
  /** Ela já salvou horários de atendimento (`business_hours` tem alguma linha). */
  hoursDone: boolean;
}

/** Chave da marca "já conheceu a agenda" (escrita por `MarkAgendaVisited`,
 *  lida pelo checklist do Início). */
export const agendaVisitedKey = (slug: string) => `sm_agenda_visited_${slug}`;

/** Itens do checklist "Deixe seu studio pronto" do Início — fonte única de
 *  verdade, usada tanto por `OnboardingCardStack` (renderiza o card) quanto
 *  pelo tour guiado do Início (`InicioTour`), que precisa saber se o card vai
 *  existir pra apontar um balão nele. O item "Catálogo publicado" (sempre
 *  marcado, só pra ela já começar com algo pronto) é adicionado pelo card, não
 *  entra aqui. Ordem: horários → agenda → acesso com senha. */
export function getOnboardingChecklistItems({ slug, planTier, subscriptionStatus, hasAccount, hoursDone }: OnboardingChecklistInput): OnboardingChecklistItem[] {
  const items: OnboardingChecklistItem[] = [];

  // Plus ativo — passos pra agendamento funcionar de verdade.
  if (planTier === 'plus' && subscriptionStatus === 'ativo') {
    items.push({ id: 'horarios', label: 'Definir horários de atendimento', href: `/app/${slug}/config#horarios`, done: hoursDone });
    items.push({ id: 'ver-agenda', label: 'Conhecer sua agenda', href: `/app/${slug}/agenda`, done: false, clientTracked: true });
  }

  // Já pagou algo (Básico ou Plus): criar login real.
  if (planTier !== 'catalog') {
    items.push({ id: 'criar-conta', label: 'Criar acesso com senha', href: `/app/${slug}/config#conta`, done: hasAccount });
  }

  return items;
}
