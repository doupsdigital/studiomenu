'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, HelpCircle, X, MessageCircle, Eye } from 'lucide-react';

interface UrgencyTimerBannerProps {
  createdAt?: string;
  slug: string;
  isAdmin?: boolean;
}

const SUPPORT_WHATSAPP = '5562991083435';
const EXPIRE_HOURS = 2;
const EXPIRE_MS = EXPIRE_HOURS * 60 * 60 * 1000;

export const UrgencyTimerBanner: React.FC<UrgencyTimerBannerProps> = ({ slug, isAdmin = false }) => {
  const [timeLeftMs, setTimeLeftMs] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [adminSimulateClient, setAdminSimulateClient] = useState(false);

  useEffect(() => {
    const storageKey = `studiomenu_first_access_${slug}`;
    const savedTime = localStorage.getItem(storageKey);

    let firstAccessTimestamp: number;

    if (isAdmin && !adminSimulateClient) {
      if (savedTime) {
        firstAccessTimestamp = Number(savedTime);
      } else {
        // Admin visualizando um link que o cliente ainda não abriu
        setTimeLeftMs(null);
        return;
      }
    } else {
      // Acesso do Cliente (ou Admin testando como cliente)
      if (savedTime) {
        firstAccessTimestamp = Number(savedTime);
      } else {
        firstAccessTimestamp = Date.now();
        localStorage.setItem(storageKey, String(firstAccessTimestamp));
      }
    }

    const targetTime = firstAccessTimestamp + EXPIRE_MS;

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetTime - now;
      setTimeLeftMs(Math.max(0, diff));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [slug, isAdmin, adminSimulateClient]);

  const reativarText = encodeURIComponent(
    `Olá! Meu tempo de teste no catálogo (${slug}) esgotou. Gostaria de reativar o prazo para fazer o pagamento.`
  );
  const whatsappUrl = `https://wa.me/${SUPPORT_WHATSAPP}?text=${reativarText}`;

  // Se for o Admin vendo um catálogo que o cliente ainda não abriu
  if (isAdmin && timeLeftMs === null) {
    return (
      <>
        <div className="mt-4 rounded-2xl p-4 bg-slate-900 border border-slate-700 shadow-md text-white">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-amber-400 text-xs font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>Modo Admin (Visualização)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="text-rose-300 hover:text-white text-xs underline"
              >
                Ver mensagem do modal
              </button>
            </div>
            <p className="text-[13px] text-slate-300 leading-relaxed">
              A cliente ainda não abriu este link. O cronômetro de <strong>2 horas</strong> começará no 1º clique dela.
            </p>
            <div className="mt-1">
              <button
                type="button"
                onClick={() => setAdminSimulateClient(true)}
                className="text-xs px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-semibold transition-colors"
              >
                Simular primeiro clique da cliente (Testar contador de 2h)
              </button>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 relative text-ink">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-ink-soft hover:text-ink transition-colors p-1 rounded-full hover:bg-rose-50"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 text-rose-700 mb-3">
                <Clock className="w-6 h-6 shrink-0" />
                <h3 className="font-serif-pro font-bold text-xl leading-tight">Por que o link tem tempo limite?</h3>
              </div>

              <div className="text-sm text-ink-soft space-y-3 leading-relaxed">
                <p>
                  Disponibilizamos esta prévia para você ver na prática como o seu Catálogo fica incrível no celular 📲 e testar todas as funções, como link e edição. ✨
                </p>
                <p>
                  Essa demonstração fica garantida por <strong>2 horas</strong>. ⏱️ Confirmando o pagamento, o link definitivo é ativado para você colocar na bio, mandar pras clientes 💖 e adicionar todos os seus serviços no seu ritmo! 🚀
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="mt-6 w-full h-11 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-sm font-bold transition-colors shadow-sm"
              >
                Entendi!
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (timeLeftMs === null) {
    return null;
  }

  const isExpired = timeLeftMs <= 0;

  // Formata HH:MM:SS
  const totalSeconds = Math.floor(timeLeftMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return (
    <>
      <div className="mt-4">
        {!isExpired ? (
          /* Banner Contagem Regressiva (2 horas do primeiro acesso) */
          <div className="rounded-2xl p-4 bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 border border-rose-800/80 shadow-md text-white relative overflow-hidden">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-rose-200 text-xs font-semibold uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span>Link de teste temporário</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-1 text-xs text-rose-300 hover:text-white underline underline-offset-2 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Entenda por quê</span>
                </button>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-rose-100">Expira em:</span>
                <span className="font-mono text-2xl font-bold tracking-widest text-rose-200 bg-rose-950/80 px-3 py-1 rounded-xl border border-rose-800/70 shadow-inner">
                  {formattedHours}:{formattedMinutes}:{formattedSeconds}
                </span>
              </div>

              <p className="text-[13px] text-rose-200/90 leading-snug">
                Realize o pagamento para garantir o seu Catálogo no ar 24h por dia.
              </p>
            </div>
          </div>
        ) : (
          /* Banner Tempo Esgotado */
          <div className="rounded-2xl p-4 bg-gradient-to-r from-red-950 via-rose-950 to-red-950 border border-red-700/90 shadow-lg text-white relative overflow-hidden">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-red-200 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span>Tempo limite esgotado</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-1 text-xs text-rose-300 hover:text-white underline underline-offset-2 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Entenda</span>
                </button>
              </div>

              <h4 className="font-serif-pro font-bold text-lg text-rose-100">
                Seu link vai expirar em breve!
              </h4>

              <p className="text-[13px] text-rose-200/90 leading-relaxed">
                Realize o pagamento para manter seu catálogo ativo ou nos chame no WhatsApp para solicitar a reativação do seu prazo.
              </p>

              <div className="mt-1 flex flex-col sm:flex-row gap-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Reativar no WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Explicativo */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 relative text-ink">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-ink-soft hover:text-ink transition-colors p-1 rounded-full hover:bg-rose-50"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-rose-700 mb-3">
              <Clock className="w-6 h-6 shrink-0" />
              <h3 className="font-serif-pro font-bold text-xl leading-tight">Por que o link tem tempo limite?</h3>
            </div>

            <div className="text-sm text-ink-soft space-y-3 leading-relaxed">
              <p>
                Disponibilizamos esta prévia para você ver na prática como o seu Catálogo fica incrível no celular 📲 e testar todas as funções, como link e edição. ✨
              </p>
              <p>
                Essa demonstração fica garantida por <strong>2 horas</strong>. ⏱️ Confirmando o pagamento, o link definitivo é ativado para você colocar na bio, mandar pras clientes 💖 e adicionar todos os seus serviços no seu ritmo! 🚀
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="mt-6 w-full h-11 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-sm font-bold transition-colors shadow-sm"
            >
              Entendi!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
