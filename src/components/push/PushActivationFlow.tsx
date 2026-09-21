'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, HelpCircle } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface PushActivationFlowProps {
  slug: string;
  /** Classe do botão principal ("Ativar"/"Enviar teste") — cada contexto
   *  (banner rosa vs. cartão branco de Config) usa uma paleta diferente. */
  primaryButtonClassName: string;
  secondaryButtonClassName: string;
  /** Classe do texto explicativo (pergunta de confirmação, checklist de
   *  troubleshooting, status "ativo") — precisa ter contraste com o fundo
   *  de cada contexto (card branco em Config vs. banner rosa no Início). */
  textClassName?: string;
  /** Chamado quando a ativação é confirmada (a profissional respondeu "Sim,
   *  recebi", ou a permissão já vinha concedida de uma visita anterior) —
   *  o banner do Início usa isso pra se dispensar sozinho; a seção de
   *  Config ignora e continua mostrando o status permanentemente. */
  onConfirmed?: () => void;
}

type Phase = 'idle' | 'activating' | 'confirming' | 'confirmed' | 'troubleshooting';

/** Núcleo da ativação de push, reaproveitado na Central de notificações
 *  (`NotificationCenterSheet`, aberta pelo sino no cabeçalho) e na seção
 *  persistente de Config (`NotificationsSection`). Depois de ativar, manda
 *  uma notificação de
 *  teste de verdade e pergunta se chegou — a permissão do site
 *  (`Notification.permission`) pode aparecer como concedida mesmo com a
 *  notificação do Chrome desligada no nível do Android, e não tem nenhuma
 *  API de navegador pra detectar isso automaticamente. Se não chegar,
 *  mostra o checklist de troubleshooting em vez de deixar a profissional
 *  achando que está tudo certo. */
export const PushActivationFlow: React.FC<PushActivationFlowProps> = ({
  slug,
  primaryButtonClassName,
  secondaryButtonClassName,
  textClassName = 'text-ink-soft',
  onConfirmed,
}) => {
  const { permission, subscribing, subscribe, sendTest } = usePushNotifications(slug);
  const [phase, setPhase] = useState<Phase>('idle');
  const [sendingTest, setSendingTest] = useState(false);

  // `usePushNotifications` só sabe a permissão real depois de montar (lê
  // `Notification.permission` num efeito) — nesse primeiro render ela ainda
  // está no valor padrão. Sem isso, toda vez que esse componente remonta
  // (abrir a Central de notificações nesse cabeçalho de novo, entrar em
  // Config) ele "esquecia" que já tinha sido ativado antes e mostrava o
  // convite de novo, mesmo já ativo.
  useEffect(() => {
    if (permission === 'granted') {
      setPhase((prev) => (prev === 'idle' || prev === 'activating' ? 'confirmed' : prev));
    }
  }, [permission]);

  const confirm = () => {
    setPhase('confirmed');
    onConfirmed?.();
  };

  const runTest = async () => {
    setSendingTest(true);
    setPhase('confirming');
    await sendTest();
    setSendingTest(false);
  };

  const handleActivate = async () => {
    setPhase('activating');
    const ok = await subscribe();
    if (!ok) {
      setPhase('idle');
      return;
    }
    await runTest();
  };

  if (permission === 'unsupported') return null;

  if (permission === 'denied') {
    return (
      <p className={`text-[13px] leading-relaxed ${textClassName}`}>
        As notificações estão bloqueadas pro StudioMenu nesse navegador. Pra reativar: menu do navegador → Configurações do site → Notificações → mude pra "Permitir".
      </p>
    );
  }

  if (phase === 'confirming') {
    return (
      <div>
        <p className={`text-[13px] mb-2 ${textClassName}`}>{sendingTest ? 'Enviando notificação de teste...' : 'Enviamos uma notificação de teste — você recebeu?'}</p>
        {!sendingTest && (
          <div className="flex gap-2">
            <button type="button" onClick={confirm} className={primaryButtonClassName}>
              Sim, recebi
            </button>
            <button type="button" onClick={() => setPhase('troubleshooting')} className={secondaryButtonClassName}>
              Não recebi
            </button>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'troubleshooting') {
    return (
      <div className="flex flex-col gap-2">
        <div className={`flex items-start gap-2 text-[13px] leading-relaxed ${textClassName}`}>
          <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            É comum o celular ter uma permissão separada pro navegador em si. No Android: Configurações → Apps →
            Chrome → Notificações → confirme que está ativado (é diferente da permissão do site que você acabou de
            aceitar).
          </p>
        </div>
        <button type="button" onClick={runTest} disabled={sendingTest} className={secondaryButtonClassName}>
          {sendingTest ? 'Enviando...' : 'Testar de novo'}
        </button>
      </div>
    );
  }

  if (phase === 'confirmed') {
    return (
      <div className="flex flex-col gap-2">
        <div className={`flex items-center gap-2 text-[13px] ${textClassName}`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Notificações ativas nesse dispositivo.</span>
        </div>
        <button type="button" onClick={runTest} disabled={sendingTest} className={secondaryButtonClassName}>
          {sendingTest ? 'Enviando...' : 'Enviar notificação de teste'}
        </button>
      </div>
    );
  }

  return (
    <button type="button" onClick={handleActivate} disabled={subscribing || phase === 'activating'} className={primaryButtonClassName}>
      {subscribing || phase === 'activating' ? 'Ativando...' : 'Ativar notificações'}
    </button>
  );
};
