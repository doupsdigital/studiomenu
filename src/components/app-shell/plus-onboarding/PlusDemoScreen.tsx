'use client';

import React, { useMemo, useState } from 'react';
import { MousePointerClick } from 'lucide-react';
import { CatalogOrderData, ProcedureItem } from '@/types/catalog';
import { ProcedureCard } from '@/components/catalog/ProcedureCard';
import { ProcedureDetailModal } from '@/components/catalog/ProcedureDetailModal';
import { FakeBookingModal } from '@/components/catalog/modals/FakeBookingModal';
import '@/styles/scheduling-wizard.css';

interface PlusDemoScreenProps {
  catalog: CatalogOrderData;
  onNext: () => void;
}

/** Tela 2 do onboarding do StudioMenu+: demonstra o agendamento automático
 *  funcionando com o catálogo REAL da profissional (não um preset genérico
 *  de exemplo) — mesmo mecanismo de simulação local do showroom público
 *  (`FakeBookingModal`), só que aqui embutido dentro do app, pra quem já é
 *  cliente Básico. Guiada por ela mesma (sem autoplay — tentamos isso e não
 *  ficou bom, 2026-09-24: "a experiência de ficar mostrando o agendamento
 *  sozinho não ficou muito boa"), com um convite bem visível pra ela tocar
 *  e explorar por conta própria. Cartões no mesmo estilo `.tile` do mosaico
 *  de verdade (`ProcedureCard`), não uma lista simplificada — é o visual
 *  que ela já conhece do próprio catálogo. */
export const PlusDemoScreen: React.FC<PlusDemoScreenProps> = ({ catalog, onNext }) => {
  // Fallback local (nunca grava no banco) — igual ao usado no showroom
  // público (`/c/showcase/[niche]/page.tsx`): sem isso, uma cliente Básico
  // real quase sempre tem `booking_enabled = false` e/ou procedimentos sem
  // `duration_minutes`, o que travaria o botão "Agendar agora" na demo.
  const demoProcedures = useMemo<ProcedureItem[]>(
    () =>
      // Só 2 (não a lista toda) — pra não poluir a tela, pedido explícito
      // (2026-09-24). São sempre os serviços reais dela, nunca exemplo.
      catalog.procedures.slice(0, 2).map((p) => ({
        ...p,
        duration_minutes: p.duration_minutes ?? 60,
        bookable: p.bookable !== false,
      })),
    [catalog.procedures]
  );

  const [selectedProcedure, setSelectedProcedure] = useState<ProcedureItem | null>(null);
  const [bookingItem, setBookingItem] = useState<ProcedureItem | null>(null);

  return (
    <div className="flex flex-col items-center px-6 pt-6 pb-8 max-w-sm mx-auto w-full">
      <h2 className="font-serif-pro font-bold text-xl text-ink leading-snug mb-4 text-center">
        Veja funcionando no seu próprio catálogo
      </h2>

      {demoProcedures.length === 0 ? (
        <p className="text-sm text-ink-soft leading-snug text-center mb-6">
          Cadastre pelo menos um serviço no seu catálogo pra ver essa demonstração com os seus
          próprios preços e fotos.
        </p>
      ) : (
        <>
          <div className="w-full rounded-2xl bg-gradient-to-br from-rose-600 to-rose-500 text-white px-5 py-4 mb-5 shadow-lg shadow-rose-600/20 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <MousePointerClick className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-[15px] leading-snug">Toque num serviço abaixo</p>
              <p className="text-[13px] text-white/85 leading-snug mt-0.5">
                Veja o agendamento automático funcionando do jeito que suas clientes vão ver.
              </p>
            </div>
          </div>

          <div className="mosaico__grid w-full mb-6">
            {demoProcedures.map((proc) => (
              <ProcedureCard key={proc.id} item={proc} whatsappNumber={catalog.whatsapp_number} onSelect={setSelectedProcedure} />
            ))}
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onNext}
        className="w-full py-3.5 rounded-xl border-2 border-rose-200 bg-surface text-rose-700 text-[15px] font-bold transition-colors hover:bg-rose-50"
      >
        Já testei, continuar →
      </button>

      {selectedProcedure && (
        <ProcedureDetailModal
          item={selectedProcedure}
          clientName={catalog.client_name}
          whatsappNumber={catalog.whatsapp_number}
          bookingEnabled
          onClose={() => setSelectedProcedure(null)}
          onBook={(item) => {
            setSelectedProcedure(null);
            setBookingItem(item);
          }}
        />
      )}

      {bookingItem && <FakeBookingModal service={bookingItem} onClose={() => setBookingItem(null)} />}
    </div>
  );
};
