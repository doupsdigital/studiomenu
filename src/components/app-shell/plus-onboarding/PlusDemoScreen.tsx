'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { CatalogOrderData, ProcedureItem } from '@/types/catalog';
import { ProcedureDetailModal } from '@/components/catalog/ProcedureDetailModal';
import { FakeBookingModal } from '@/components/catalog/modals/FakeBookingModal';
import '@/styles/scheduling-wizard.css';

interface PlusDemoScreenProps {
  catalog: CatalogOrderData;
  onNext: () => void;
}

const AUTO_OPEN_DELAY_MS = 1600;
const AUTO_BOOK_TRIGGER_DELAY_MS = 1600;
const AUTO_SLOT_DELAY_MS = 1600;
const AUTO_RESET_DELAY_MS = 2600;

function formatPrice(val: string): string {
  if (!val) return 'Sob Consulta';
  const lower = val.toLowerCase();
  if (lower.includes('r$') || lower.includes('incluso') || lower.includes('guia') || lower.includes('consulta')) {
    return val;
  }
  return `R$ ${val}`;
}

/** Tela 2 do onboarding do StudioMenu+: demonstra o agendamento automático
 *  funcionando com o catálogo REAL da profissional (não um preset genérico
 *  de exemplo) — mesmo mecanismo de simulação local do showroom público
 *  (`FakeBookingModal`), só que aqui embutido dentro do app, pra quem já é
 *  cliente Básico. Começa se explicando sozinha (autoplay com legenda), mas
 *  para assim que a profissional tocar em qualquer coisa de verdade —
 *  decisão dela, 2026-09-24: "ela ainda não conhece como funciona, deixar
 *  pra ela tocar precisa ter orientação". */
export const PlusDemoScreen: React.FC<PlusDemoScreenProps> = ({ catalog, onNext }) => {
  // Fallback local (nunca grava no banco) — igual ao usado no showroom
  // público (`/c/showcase/[niche]/page.tsx`): sem isso, uma cliente Básico
  // real quase sempre tem `booking_enabled = false` e/ou procedimentos sem
  // `duration_minutes`, o que travaria o botão "Agendar agora" na demo.
  const demoProcedures = useMemo<ProcedureItem[]>(
    () =>
      catalog.procedures.slice(0, 3).map((p) => ({
        ...p,
        duration_minutes: p.duration_minutes ?? 60,
        bookable: p.bookable !== false,
      })),
    [catalog.procedures]
  );

  const [demoIndex, setDemoIndex] = useState(0);
  const [selectedProcedure, setSelectedProcedure] = useState<ProcedureItem | null>(null);
  const [bookingItem, setBookingItem] = useState<ProcedureItem | null>(null);
  const [userTookControl, setUserTookControl] = useState(false);
  const userTookControlRef = useRef(false);

  const takeControl = () => {
    if (userTookControlRef.current) return;
    userTookControlRef.current = true;
    setUserTookControl(true);
  };

  // Autoplay passo 1: abre sozinha o detalhe de um serviço quando a tela
  // está "parada" na grade.
  useEffect(() => {
    if (userTookControl || selectedProcedure || bookingItem || demoProcedures.length === 0) return;
    const t = setTimeout(() => setSelectedProcedure(demoProcedures[demoIndex % demoProcedures.length]), AUTO_OPEN_DELAY_MS);
    return () => clearTimeout(t);
  }, [userTookControl, selectedProcedure, bookingItem, demoProcedures, demoIndex]);

  // Autoplay passo 2: com o detalhe aberto, toca sozinha em "Agendar agora".
  useEffect(() => {
    if (userTookControl || !selectedProcedure || bookingItem) return;
    const t = setTimeout(() => {
      setBookingItem(selectedProcedure);
      setSelectedProcedure(null);
    }, AUTO_BOOK_TRIGGER_DELAY_MS);
    return () => clearTimeout(t);
  }, [userTookControl, selectedProcedure, bookingItem]);

  // Autoplay passo 3 (escolher horário) mora dentro do próprio
  // `FakeBookingModal` (`autopilotDelayMs`) — aqui só tratamos o "depois":
  // espera a confirmação ficar visível e reinicia o ciclo com o próximo
  // serviço, enquanto a profissional não tiver assumido o controle.
  const handleAutoBooked = () => {
    window.setTimeout(() => {
      if (userTookControlRef.current) return;
      setBookingItem(null);
      setDemoIndex((i) => (i + 1) % Math.max(demoProcedures.length, 1));
    }, AUTO_RESET_DELAY_MS);
  };

  const hint = (() => {
    if (bookingItem) {
      return userTookControl ? 'Escolha o dia e o horário' : '👉 Agora ela escolhe um horário...';
    }
    if (selectedProcedure) {
      return userTookControl ? "Toque em 'Agendar agora'" : "👉 Agora ela toca em 'Agendar agora'...";
    }
    return userTookControl ? 'Toque num serviço pra agendar' : '👉 Toque num serviço pra ver o agendamento automático';
  })();

  return (
    <div className="flex flex-col items-center text-center px-6 pt-6 pb-8 max-w-sm mx-auto w-full">
      <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
        <CalendarClock className="w-7 h-7" />
      </div>
      <h2 className="font-serif-pro font-bold text-xl text-ink leading-snug mb-1.5">
        Veja funcionando no seu próprio catálogo
      </h2>

      {demoProcedures.length === 0 ? (
        <p className="text-sm text-ink-soft leading-snug mb-6">
          Cadastre pelo menos um serviço no seu catálogo pra ver essa demonstração com os seus
          próprios preços e fotos.
        </p>
      ) : (
        <>
          <p className="text-sm text-ink-soft leading-snug mb-5">{hint}</p>

          <div className="w-full flex flex-col gap-3 mb-6">
            {demoProcedures.map((proc) => (
              <button
                key={proc.id}
                type="button"
                onClick={() => {
                  takeControl();
                  setSelectedProcedure(proc);
                }}
                className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-surface px-3 py-2.5 text-left hover:border-rose-300 transition-colors"
              >
                {proc.image_url && (
                  <img src={proc.image_url} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-ink truncate">{proc.title}</p>
                  <p className="text-sm text-ink-faint">{formatPrice(proc.price)}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onNext}
        className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-bold shadow-sm transition-colors"
      >
        Continuar →
      </button>

      {selectedProcedure && (
        <ProcedureDetailModal
          item={selectedProcedure}
          clientName={catalog.client_name}
          whatsappNumber={catalog.whatsapp_number}
          bookingEnabled
          onClose={() => {
            takeControl();
            setSelectedProcedure(null);
          }}
          onBook={(item) => {
            takeControl();
            setSelectedProcedure(null);
            setBookingItem(item);
          }}
        />
      )}

      {bookingItem && (
        <FakeBookingModal
          service={bookingItem}
          onClose={() => {
            takeControl();
            setBookingItem(null);
          }}
          autopilotDelayMs={userTookControl ? undefined : AUTO_SLOT_DELAY_MS}
          onAutoBooked={handleAutoBooked}
          onUserInteract={takeControl}
        />
      )}
    </div>
  );
};
