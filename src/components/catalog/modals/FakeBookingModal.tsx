'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { ProcedureItem } from '@/types/catalog';
import '@/styles/scheduling-wizard.css';

interface FakeBookingModalProps {
  service: ProcedureItem;
  onClose: () => void;
  /** Onboarding do StudioMenu+ dentro do app (Fase 2026-09-24): quando
   *  definido, escolhe o primeiro horário sozinha depois desse tempo (ms),
   *  pra "se explicar sozinha" antes da profissional tocar em algo. Sem
   *  esse prop (showroom público, mockups das landing pages), comportamento
   *  idêntico a hoje — nenhum dos 3 usos atuais passa isso. */
  autopilotDelayMs?: number;
  onAutoBooked?: () => void;
  /** Avisa quem chamou que a profissional tocou em algo de verdade (dia ou
   *  horário), pra cancelar o autoplay do onboarding imediatamente. */
  onUserInteract?: () => void;
}

/** Simulação 100% local do agendamento automático — usada no showroom
 *  (`/c/showcase/[niche]`, sem catálogo real por trás), no mockup de
 *  celular da home e no onboarding do StudioMenu+ dentro do app (aqui com
 *  catálogo real, mas ainda sem gravar nada — só demonstração). Visual
 *  idêntico ao `BookingModal.tsx` de verdade (mesmas classes de
 *  scheduling-wizard.css), mas sem nenhuma chamada de rede: os horários são
 *  fixos/fictícios e, ao escolher um, pula direto pra tela de confirmação
 *  (sem pedir nome/WhatsApp — pedido explícito, 2026-09-24, é só pra
 *  mostrar a experiência, não coletar dado nenhum). Nunca grava em pedido
 *  real — ver `CatalogLayout.tsx`, prop `demoBookingOnly`. */
const FAKE_TIMES = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'];
const DAYS_AHEAD = 6;

interface BookedFake {
  time: string;
  dateLabel: string;
}

function toDateKey(d: Date): string {
  return d.toLocaleDateString('en-CA');
}

function buildNextDays(count: number): { key: string; weekday: string; day: string }[] {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      key: toDateKey(d),
      weekday: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      day: d.toLocaleDateString('pt-BR', { day: '2-digit' }),
    });
  }
  return days;
}

function formatDateLabel(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00`);
  const label = d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatPrice(val: string): string {
  if (!val) return 'Sob Consulta';
  const lower = val.toLowerCase();
  if (lower.includes('r$') || lower.includes('incluso') || lower.includes('guia') || lower.includes('consulta')) {
    return val;
  }
  return `R$ ${val}`;
}

export const FakeBookingModal: React.FC<FakeBookingModalProps> = ({
  service,
  onClose,
  autopilotDelayMs,
  onAutoBooked,
  onUserInteract,
}) => {
  const days = useState(() => buildNextDays(DAYS_AHEAD))[0];
  const [selectedDate, setSelectedDate] = useState<string>(days[0].key);
  const [booked, setBooked] = useState<BookedFake | null>(null);
  const onAutoBookedRef = useRef(onAutoBooked);
  onAutoBookedRef.current = onAutoBooked;

  useEffect(() => {
    if (!autopilotDelayMs) return;
    const timer = setTimeout(() => {
      setBooked({ time: FAKE_TIMES[0], dateLabel: formatDateLabel(selectedDate) });
      onAutoBookedRef.current?.();
    }, autopilotDelayMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autopilotDelayMs]);

  const fallbackImage = 'https://images.unsplash.com/photo-1583001809873-a1284d563391?auto=format&fit=crop&w=400&q=80';

  if (booked) {
    return (
      <div className="wizard-success" role="dialog" aria-modal="true" aria-label="Agendamento reservado">
        <div className="wizard-success__backdrop" onClick={onClose} />
        <div className="wizard-success__card">
          <button type="button" className="modal__fechar" aria-label="Fechar" onClick={onClose} style={{ position: 'absolute', top: 14, right: 14 }}>
            ✕
          </button>

          <div className="wizard-success__icon">
            <CheckCircle className="w-8 h-8" />
          </div>
          <p className="wizard-success__titulo">Agendamento reservado!</p>
          <p className="wizard-success__subtitulo">A profissional vai confirmar seu horário em breve.</p>

          <div className="wizard__resumo">
            <div className="wizard__resumo-linha">
              <span className="wizard__resumo-k">Procedimento</span>
              <span className="wizard__resumo-v">{service.title}</span>
            </div>
            <div className="wizard__resumo-linha">
              <span className="wizard__resumo-k">Quando</span>
              <span className="wizard__resumo-v">
                {booked.dateLabel} às {booked.time}
              </span>
            </div>
            <div className="wizard__resumo-linha">
              <span className="wizard__resumo-k">Investimento</span>
              <span className="wizard__resumo-v">{formatPrice(service.price)}</span>
            </div>
          </div>

          <div className="modal__acoes">
            <button type="button" className="modal__cta" onClick={onClose}>
              Ok, entendido
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-detalhe" role="dialog" aria-modal="true" aria-label={`Agendar ${service.title}`}>
      <div className="modal-detalhe__backdrop" onClick={onClose} />
      <div className="modal-detalhe__sheet">
        <div className="modal__foto-wrap">
          <img src={service.image_url || fallbackImage} alt={service.title} className="modal__foto" loading="lazy" />
          <div className="modal__scrim" />
          <button type="button" className="modal__fechar" aria-label="Fechar" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal__corpo">
          <span className="modal__cat">Agendamento</span>
          <h3 className="modal__titulo">{service.title}</h3>

          <span className="wizard__label">Escolha o dia</span>
          <div className="wizard__dias">
            {days.map((d) => (
              <button
                key={d.key}
                type="button"
                className={`wizard__dia-chip ${selectedDate === d.key ? 'is-ativo' : ''}`}
                onClick={() => {
                  onUserInteract?.();
                  setSelectedDate(d.key);
                }}
              >
                <span>{d.weekday}</span>
                <strong>{d.day}</strong>
              </button>
            ))}
          </div>

          <span className="wizard__label">Horários disponíveis</span>
          <div className="wizard__slots">
            {FAKE_TIMES.map((time) => (
              <button
                key={time}
                type="button"
                className="wizard__slot"
                onClick={() => {
                  onUserInteract?.();
                  setBooked({ time, dateLabel: formatDateLabel(selectedDate) });
                }}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
