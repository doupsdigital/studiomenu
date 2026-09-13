'use client';

import React, { useEffect, useState } from 'react';
import { ProcedureItem } from '@/types/catalog';
import type { AvailabilitySlot } from '@/lib/scheduling/availability';
import { formatPhoneBR } from '@/lib/format';
import '@/styles/scheduling-wizard.css';

interface BookingModalProps {
  service: ProcedureItem;
  slug: string;
  whatsappNumber: string;
  professionalName: string;
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
  whatsappNumber,
  professionalName,
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
  const [clientNotes, setClientNotes] = useState('');

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
          client_notes: clientNotes.trim() || undefined,
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

  const whatsappMessage = booked
    ? encodeURIComponent(
        `Olá, ${professionalName.split(' ')[0]}! Acabei de agendar *${service.title}* pra ${booked.dateLabel} às ${booked.time} pelo catálogo.`
      )
    : '';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const fallbackImage = 'https://images.unsplash.com/photo-1583001809873-a1284d563391?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="modal-detalhe" role="dialog" aria-modal="true" aria-label={`Agendar ${service.title}`}>
      <div className="modal-detalhe__backdrop" onClick={onClose} />
      <div className="modal-detalhe__sheet">
        <div className="modal__foto-wrap">
          <img src={service.image_url || fallbackImage} alt={service.title} className="modal__foto" />
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
            <div
              className={`wizard__step-dot ${step === 'contact' ? 'is-active' : step === 'confirm' ? 'is-done' : ''}`}
            />
            <div className={`wizard__step-dot ${step === 'confirm' ? 'is-active' : ''}`} />
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
                <p className="wizard__vazio">Carregando horários...</p>
              ) : slotsError ? (
                <p className="wizard__vazio">{slotsError}</p>
              ) : slots.length === 0 ? (
                <p className="wizard__vazio">Sem horários livres nesse dia. Escolha outra data.</p>
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

              <div className="wizard__campo">
                <span className="wizard__label">Observação (opcional)</span>
                <textarea
                  className="wizard__input"
                  placeholder="Alguma preferência ou detalhe?"
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
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

          {step === 'confirm' && booked && (
            <>
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

              <p className="wizard__label" style={{ marginBottom: 14 }}>
                Seu horário foi reservado. Avise a profissional pelo WhatsApp pra confirmar.
              </p>

              <div className="modal__acoes">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="modal__cta">
                  Avisar no WhatsApp →
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
