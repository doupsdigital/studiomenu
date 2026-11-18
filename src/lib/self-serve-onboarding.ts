/** Checklist "Primeiros passos" de quem comprou pelo funil `/lash` (Cakto,
 *  2026-11-18). Fonte única dos passos — usada pela tela
 *  `/app/[slug]/primeiros-passos` e pelo card "Continue de onde parou" do
 *  Início. O progresso fica em `orders.onboarding_steps` (jsonb), pra valer
 *  em qualquer aparelho.
 *
 *  "Criar acesso" não é marcado aqui: vem de `auth_user_id` (ela vinculou
 *  um login de verdade). */
export type SelfServeStepId = 'whatsapp' | 'menu' | 'acesso' | 'compartilhar';

/** Passos marcados por ação dela (gravados no jsonb). */
export const MARKABLE_STEPS: SelfServeStepId[] = ['whatsapp', 'menu', 'compartilhar'];

export const SELF_SERVE_STEP_ORDER: SelfServeStepId[] = ['whatsapp', 'menu', 'acesso', 'compartilhar'];

/** Vídeo curto de cada passo (a dona grava depois). URL vazia = o espaço do
 *  vídeo simplesmente não aparece. Aceita link do YouTube (normal ou
 *  /shorts) ou arquivo .mp4. */
export const SELF_SERVE_STEP_VIDEOS: Record<SelfServeStepId, string> = {
  whatsapp: '',
  menu: '',
  acesso: '',
  compartilhar: '',
};

export type OnboardingSteps = Partial<Record<SelfServeStepId, string>>;

export function parseOnboardingSteps(raw: unknown): OnboardingSteps {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: OnboardingSteps = {};
  for (const id of MARKABLE_STEPS) {
    const v = (raw as Record<string, unknown>)[id];
    if (typeof v === 'string' && v) out[id] = v;
  }
  return out;
}

export function getSelfServeStepsDone(steps: OnboardingSteps, hasAccount: boolean): Record<SelfServeStepId, boolean> {
  return {
    whatsapp: Boolean(steps.whatsapp),
    menu: Boolean(steps.menu),
    acesso: hasAccount,
    compartilhar: Boolean(steps.compartilhar),
  };
}

export function countSelfServeStepsDone(steps: OnboardingSteps, hasAccount: boolean): number {
  return Object.values(getSelfServeStepsDone(steps, hasAccount)).filter(Boolean).length;
}

/** Converte link do YouTube (watch, youtu.be, shorts) em URL de embed.
 *  Devolve null pra qualquer outra coisa (aí é tratado como arquivo de vídeo). */
export function toYoutubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}?rel=0&playsinline=1` : null;
}
