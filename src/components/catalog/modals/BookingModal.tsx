'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, CalendarX } from 'lucide-react';
import { ProcedureItem } from '@/types/catalog';
import type { AvailabilitySlot } from '@/lib/scheduling/availability';
import { formatPhoneBR } from '@/lib/format';
import '@/styles/scheduling-wizard.css';

interface BookingModalProps {
  service: ProcedureItem;
  slug: string;
  onClose: () => void;
}

type WizardStep = 'datetime' | 'contact' | 'confirm';

interface BookedAppointment {
  time: string;
  dateLabel: string;
}

const DAYS_AHEAD = 14;

function toDateKey(d: Date): string {
  return d.toLocaleDateString('en-CA'); // YYYY-MM-DD
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

export const BookingModal: React.FC<BookingModalProps> = ({
  service,
  slug,
  onClose,
}) => {
  const days = useState(() => buildNextDays(DAYS_AHEAD))[0];

  const [step, setStep] = useState<WizardStep>('datetime');
  const [selectedDate, setSelectedDate] = useState<string>(days[0].key);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);

  const [clientName, setClientName] = useState('');
  const [clientWhatsapp, setClientWhatsapp] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [booked, setBooked] = useState<BookedAppointment | null>(null);

  // Trava scroll do body e fecha no Esc (mesmo padrão de ProcedureDetailModal)
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const fetchSlots = async (dateKey: string) => {
    setLoadingSlots(true);
    setSlotsError(null);
    setSelectedSlot(null);
    try {
      const params = new URLSearchParams({ slug, service_id: service.id, date: dateKey });
      const res = await fetch(`/api/scheduling/availability?${params.toString()}`);
      const json = await res.json();
      if (!json.success) {
        setSlots([]);
        setSlotsError(json.message || 'Não foi possível carregar os horários.');
        return;
      }
      setSlots(json.slots || []);
    } catch {
      setSlots([]);
      setSlotsError('Falha na conexão ao buscar horários.');
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchSlots(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handleSubmitContact = async () => {
    if (!selectedSlot || !clientName.trim() || !clientWhatsapp.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/scheduling/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          service_id: service.id,
          starts_at: selectedSlot.startsAt,
          client_name: clientName.trim(),
          client_whatsapp: clientWhatsapp.trim(),
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setSubmitError(json.message || 'Não foi possível confirmar o agendamento.');
        if (res.status === 409) {
          // Horário deixou de estar disponível — volta e recarrega a grade.
          setStep('datetime');
          fetchSlots(selectedDate);
        }
        return;
      }
      setBooked({ time: selectedSlot.time, dateLabel: formatDateLabel(selectedDate) });
      setStep('confirm');
    } catch {
      setSubmitError('Falha na conexão ao confirmar o agendamento.');
    } finally {
      setSubmitting(false);
    }
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1583001809873-a1284d563391?auto=format&fit=crop&w=400&q=80';

  // Passo 3 (confirmado) não é mais parte do bottom sheet do wizard — é um
  // evento concluído, não um passo do formulário, por isso vira um modal
  // centralizado próprio (ver comentário em scheduling-wizard.css). Sem
  // botão de avisar a profissional pelo WhatsApp de propósito — isso era um
  // paliativo enquanto não existe push notification pra ela (que vem numa
  // fase futura); pedir isso da cliente não é a experiência final desejada,
  // só confirma que o agendamento foi reservado.
  if (step === 'confirm' && booked) {
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

          <div className="wizard__steps" aria-hidden="true">
            <div className={`wizard__step-dot ${step === 'datetime' ? 'is-active' : 'is-done'}`} />
            <div className={`wizard__step-dot ${step === 'contact' ? 'is-active' : ''}`} />
          </div>

          {step === 'datetime' && (
            <>
              <span className="wizard__label">Escolha o dia</span>
              <div className="wizard__dias">
                {days.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    className={`wizard__dia-chip ${selectedDate === d.key ? 'is-ativo' : ''}`}
                    onClick={() => setSelectedDate(d.key)}
                  >
                    <span>{d.weekday}</span>
                    <strong>{d.day}</strong>
                  </button>
                ))}
              </div>

              <span className="wizard__label">Horários disponíveis</span>
              {loadingSlots ? (
                <div className="wizard__vazio">Carregando horários...</div>
              ) : slotsError ? (
                <div className="wizard__vazio">{slotsError}</div>
              ) : slots.length === 0 ? (
                <div className="wizard__vazio">
                  <CalendarX className="w-6 h-6" />
                  Sem horários livres nesse dia.
                  <br />
                  Escolha outra data acima.
                </div>
              ) : (
                <div className="wizard__slots">
                  {slots.map((slot) => (
                    <button
                      key={slot.startsAt}
                      type="button"
                      className={`wizard__slot ${selectedSlot?.startsAt === slot.startsAt ? 'is-ativo' : ''}`}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setStep('contact');
                      }}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 'contact' && selectedSlot && (
            <>
              <button type="button" className="wizard__voltar" onClick={() => setStep('datetime')}>
                ← Trocar horário
              </button>

              <div className="wizard__resumo">
                <div className="wizard__resumo-linha">
                  <span className="wizard__resumo-k">Horário escolhido</span>
                  <span className="wizard__resumo-v">
                    {formatDateLabel(selectedDate)} às {selectedSlot.time}
                  </span>
                </div>
              </div>

              <div className="wizard__campo">
                <span className="wizard__label">Seu nome</span>
                <input
                  type="text"
                  className="wizard__input"
                  placeholder="Nome completo"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  autoComplete="name"
                />
              </div>

              <div className="wizard__campo">
                <span className="wizard__label">Seu WhatsApp</span>
                <input
                  type="tel"
                  className="wizard__input"
                  placeholder="(11) 99999-9999"
                  value={clientWhatsapp}
                  onChange={(e) => setClientWhatsapp(formatPhoneBR(e.target.value))}
                  autoComplete="tel"
                />
              </div>

              {submitError && <p className="wizard__erro">{submitError}</p>}

              <div className="modal__acoes">
                <button
                  type="button"
                  className="modal__cta wizard__cta"
                  disabled={submitting || !clientName.trim() || !clientWhatsapp.trim()}
                  onClick={handleSubmitContact}
                >
                  {submitting ? 'Confirmando...' : 'Confirmar agendamento'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
