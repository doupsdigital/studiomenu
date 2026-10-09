'use client';

import React from 'react';
import { ArrowLeft, Phone, Video, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { ProcedureItem } from '@/types/catalog';

interface FakeWhatsappScreenProps {
  /** Mensagem de um procedimento específico (botão "Agendar" do card). Omitir
   *  junto com usar `message` pro botão genérico de Contato (tela final). */
  item?: ProcedureItem;
  /** Mensagem pronta pro botão de Contato (tela final, sem procedimento
   *  específico) — bug real, 2026-10-09: esse botão linkava pro WhatsApp
   *  real mesmo no showroom, sem essa simulação. */
  message?: string;
  onClose: () => void;
}

interface FakeMessage {
  from: 'client' | 'pro';
  text: string;
  time: string;
  read?: boolean;
}

interface FakeDay {
  dateLabel: string;
  messages: FakeMessage[];
}

const CLIENT_NAME = 'Cliente Fernanda';

function formatPrice(val: string): string {
  if (!val) return 'Sob Consulta';
  const lower = val.toLowerCase();
  if (lower.includes('r$') || lower.includes('incluso') || lower.includes('guia') || lower.includes('consulta')) {
    return val;
  }
  return `R$ ${val}`;
}

function currentTimeLabel(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

// Histórico fictício de agendamentos anteriores, pra dar a sensação de
// cliente recorrente de verdade — pedido real, 2026-10-02.
const HISTORY: FakeDay[] = [
  {
    dateLabel: '12/09',
    messages: [
      { from: 'client', text: 'Olá! Gostaria de agendar o procedimento: *Volume Egípcio* (R$ 160).', time: '10:32' },
      { from: 'pro', text: 'Oi, Fernanda! Consigo sim 😊 Fica melhor terça ou quinta?', time: '11:05', read: true },
      { from: 'client', text: 'Pode ser terça, obrigada!', time: '11:08' },
    ],
  },
  {
    dateLabel: '25/09',
    messages: [
      { from: 'client', text: 'Olá! Gostaria de agendar o procedimento: *Design de Sobrancelha* (R$ 60).', time: '09:14' },
      { from: 'pro', text: 'Combinado! Te espero às 14h 💕', time: '09:20', read: true },
    ],
  },
];

/** Simula a tela do WhatsApp da PROFISSIONAL recebendo a mensagem de uma
 *  cliente que clicou em "Agendar" num catálogo sem agendamento automático
 *  (plano Básico) — par do `FakeBookingModal`/`AgendaDemoScreen` (plano
 *  Plus) pro showroom (`demoBookingOnly`). Puramente visual, nenhum
 *  WhatsApp real é aberto e nenhum número de verdade é usado — pedido
 *  explícito, 2026-10-02: gravar vídeo de anúncio do plano Básico sem
 *  expor o WhatsApp real da profissional na gravação. Um pequeno histórico
 *  fictício de agendamentos anteriores (2026-10-02) dá a sensação de
 *  cliente recorrente de verdade, em vez de uma conversa vazia. */
export const FakeWhatsappScreen: React.FC<FakeWhatsappScreenProps> = ({ item, message: messageProp, onClose }) => {
  const message = messageProp || `Olá! Gostaria de agendar o procedimento: *${item?.title}* (${formatPrice(item?.price || '')}).`;

  const renderBubble = (msg: FakeMessage, key: string, highlight = false) => {
    const isClient = msg.from === 'client';
    return (
      <div key={key} className={`flex ${isClient ? 'justify-start' : 'justify-end'}`}>
        <div
          className={`max-w-[80%] rounded-lg px-3 py-2 shadow-sm ${isClient ? 'rounded-tl-none' : 'rounded-tr-none'} ${
            highlight ? 'fake-wa-new-msg' : ''
          }`}
          style={{ background: isClient ? '#202c33' : '#005c4b' }}
        >
          <p className="text-[14.5px] leading-snug" style={{ color: '#e9edef' }}>
            {msg.text}
          </p>
          <div className="flex items-center justify-end gap-1 mt-1">
            <p className="text-[11px]" style={{ color: '#8696a0' }}>
              {msg.time}
            </p>
            {!isClient &&
              (msg.read ? (
                <CheckCheck className="w-3.5 h-3.5" style={{ color: '#53bdeb' }} />
              ) : (
                <Check className="w-3.5 h-3.5" style={{ color: '#8696a0' }} />
              ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#0b141a' }}
      role="dialog"
      aria-modal="true"
      aria-label="Simulação do WhatsApp"
    >
      {/* Destaque de entrada só na mensagem de hoje — pedido real, 2026-10-02:
       *  dar a sensação de que ela acabou de chegar agora, do clique no
       *  "Agendar" do catálogo. */}
      <style>{`
        @keyframes fakeWaMsgIn {
          0% { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fakeWaMsgGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
          15% { box-shadow: 0 0 0 6px rgba(37, 211, 102, 0.35); }
          85% { box-shadow: 0 0 0 6px rgba(37, 211, 102, 0.35); }
        }
        .fake-wa-new-msg {
          animation: fakeWaMsgIn 0.35s ease-out, fakeWaMsgGlow 4s ease-out;
        }
      `}</style>

      {/* Cabeçalho estilo WhatsApp (modo escuro) */}
      <div className="flex items-center gap-3 px-3 py-2.5 shrink-0" style={{ background: '#1f2c34' }}>
        <button type="button" onClick={onClose} aria-label="Voltar">
          <ArrowLeft className="w-5 h-5" style={{ color: '#e9edef' }} />
        </button>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: '#6b7780', color: '#0b141a' }}
        >
          F
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold truncate" style={{ color: '#e9edef' }}>
            {CLIENT_NAME}
          </p>
          <p className="text-[12px]" style={{ color: '#8696a0' }}>
            online
          </p>
        </div>
        <Video className="w-5 h-5" style={{ color: '#aebac1' }} />
        <Phone className="w-[18px] h-[18px]" style={{ color: '#aebac1' }} />
        <MoreVertical className="w-5 h-5" style={{ color: '#aebac1' }} />
      </div>

      {/* Corpo da conversa */}
      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-2" style={{ background: '#0b141a' }}>
        {HISTORY.map((day) => (
          <React.Fragment key={day.dateLabel}>
            <div className="flex justify-center my-2">
              <span className="text-[11.5px] px-2.5 py-1 rounded-md" style={{ background: '#182229', color: '#8696a0' }}>
                {day.dateLabel}
              </span>
            </div>
            {day.messages.map((msg, i) => renderBubble(msg, `${day.dateLabel}-${i}`))}
          </React.Fragment>
        ))}

        <div className="flex justify-center my-2">
          <span className="text-[11.5px] px-2.5 py-1 rounded-md" style={{ background: '#182229', color: '#8696a0' }}>
            Hoje
          </span>
        </div>
        {renderBubble({ from: 'client', text: message, time: currentTimeLabel() }, 'today', true)}
      </div>

      <div className="p-4 shrink-0" style={{ background: '#0b141a' }}>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 rounded-xl text-white text-[15px] font-bold shadow-sm transition-colors"
          style={{ background: '#00a884' }}
        >
          Voltar pro catálogo →
        </button>
      </div>
    </div>
  );
};
