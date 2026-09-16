'use client';

import React, { useState } from 'react';
import { CheckCircle2, HelpCircle } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface PushActivationFlowProps {
  slug: string;
  /** Classe do botão principal ("Ativar"/"Enviar teste") — cada contexto
   *  (banner rosa vs. cartão branco de Config) usa uma paleta diferente. */
  primaryButtonClassName: string;
  secondaryButtonClassName: string;
  /** Chamado quando a ativação é confirmada (a profissional respondeu "Sim,
   *  recebi", ou a permissão já vinha concedida de uma visita anterior) —
   *  o banner do Início usa isso pra se dispensar sozinho; a seção de
   *  Config ignora e continua mostrando o status permanentemente. */
  onConfirmed?: () => void;
}

type Phase = 'idle' | 'activating' | 'confirming' | 'confirmed' | 'troubleshooting';

/** Núcleo da ativação de push, reaproveitado no banner do Início
 *  (`PushPermissionBanner`) e na seção persistente de Config
 *  (`NotificationsSection`). Depois de ativar, manda uma notificação de
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
  onConfirmed,
}) => {
  const { permission, subscribing, subscribe, sendTest } = usePushNotifications(slug);
  const [phase, setPhase] = useState<Phase>(permission === 'granted' ? 'confirmed' : 'idle');
  const [sendingTest, setSendingTest] = useState(false);

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
      <p className="text-xs text-ink-soft leading-relaxed">
        As notificações estão bloqueadas pro StudioMenu nesse navegador. Pra reativar: menu do navegador → Configurações do site → Notificações → mude pra "Permitir".
      </p>
    );
  }

  if (phase === 'confirming') {
    return (
      <div>
        <p className="text-xs text-ink-soft mb-2">{sendingTest ? 'Enviando notificação de teste...' : 'Enviamos uma notificação de teste — você recebeu?'}</p>
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
        <div className="flex items-start gap-2 text-xs text-ink-soft leading-relaxed">
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
        <div className="flex items-center gap-2 text-xs">
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
