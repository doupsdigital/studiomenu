'use client';

import React from 'react';
import { ChevronDown, Copy } from 'lucide-react';

const META_SCRIPTS: Record<number, { title: string; variations: string[] }> = {
  1: {
    title: '💬 1. Boas-Vindas & Qualificação',
    variations: [
      'Oii! Seja muito bem-vinda! 💕 Fico super feliz pelo seu interesse no StudioMenu! ✨ Qual o seu nome e de qual cidade é o seu estúdio? 😍',
      'Oii, tudo bem? 🥰 Seja bem-vinda! Que incrível ter você por aqui. Me conta, você já trabalha com procedimentos de beleza no seu estúdio atualmente? ✨',
      'Olá! Que ótimo ter você por aqui! 🌸 Fico feliz que tenha visto nosso anúncio. Você sofre hoje tendo que mandar foto por foto de tabela no Whats pra cada cliente? 📲',
    ],
  },
  2: {
    title: '✅ 2. Apresentação & Oferta Vídeo Demo',
    variations: [
      'Que maravilhosa! 😍 O StudioMenu transforma aquela tabela de preços solta num catálogo digital interativo lindo pro link da sua bio do Instagram e conversas no Whats! 🌸✨ Gravei um vídeo curtinho de 15 segundos mostrando como ele funciona na prática. Posso te mandar aqui? 💕',
      'Perfeito! 🥰 O StudioMenu deixa o atendimento do seu estúdio muito mais profissional e elegante! Temos modelos prontos incríveis pra cada nicho. Quer dar uma olhadinha neles ou prefere que eu te mande um vídeo de demonstração rápida? ✨',
      'Incrível! 💕 O StudioMenu foi feito sob medida pra profissionais de beleza valorizarem o trabalho e não perderem tempo explicando técnica por técnica. O catálogo organiza fotos, valores e botão de agendamento num só link! 🚀 Posso te enviar um modelo de demonstração bem rapidinho pra você ver como fica? 👁️✨',
    ],
  },
  3: {
    title: '💰 3. Fechamento & Oferta Pix',
    variations: [
      'O que achou? Lindo né? 😍✨ O valor de criação completa do StudioMenu com hospedagem e suporte é R$ 197 no cartão. Mas fechando hoje por aqui no Pix, temos o desconto especial por apenas *R$ 167 à vista (pagamento único sem mensalidades!)*. 🚀💎 Quer que eu já garanta a sua chave Pix para ativarmos o seu catálogo hoje? 💕',
      'Viu como fica elegante? 🥰 Se quiser, você já pode me mandar aqui a foto da sua tabela de preços que eu crio a versão personalizada com a marca do seu estúdio! E fechando hoje via Pix, de R$ 197 fica por apenas *R$ 167 à vista (sem mensalidade)*. 🌸📲 Posso gerar o Pix para você?',
      'Dá um destaque surreal pro estúdio! ✨🌸 Conseguimos liberar para você a condição especial por Pix: apenas *R$ 167 à vista* (taxa única de configuração, sem cobrança mensal). 🎉💎 Posso te passar a chave Pix para finalizar e já começarmos a montagem do seu link? 🚀💕',
    ],
  },
};

interface ScriptsPanelProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  activeVariations: Record<number, number>;
  onSelectVariation: (step: number, varIdx: number) => void;
  onCopy: (text: string) => void;
}

export const ScriptsPanel: React.FC<ScriptsPanelProps> = ({
  isOpen,
  onToggleOpen,
  activeVariations,
  onSelectVariation,
  onCopy,
}) => {
  return (
    <div className="rounded-2xl bg-slate-900 border border-rose-500/30 overflow-hidden">
      <button
        onClick={onToggleOpen}
        className="w-full p-5 flex items-center justify-between gap-3 bg-gradient-to-r from-rose-500/10 to-amber-500/5 hover:from-rose-500/15 transition-all"
      >
        <div className="flex items-center gap-2.5 flex-wrap text-left">
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-rose-500 to-amber-500 text-white">
            📢 Meta Ads / Inbound
          </span>
          <span className="font-bold text-base">Scripts de Atendimento Rápido (Leads dos Anúncios)</span>
        </div>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="p-5 pt-2.5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((step) => {
            const script = META_SCRIPTS[step];
            const varIdx = activeVariations[step] || 0;
            const text = script.variations[varIdx];
            return (
              <div key={step} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-sm font-bold text-rose-300">{script.title}</span>
                  <button
                    onClick={() => onCopy(text)}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar
                  </button>
                </div>
                <div className="flex gap-1.5">
                  {script.variations.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => onSelectVariation(step, i)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                        varIdx === i
                          ? 'bg-rose-500/20 border-rose-500/60 text-rose-200'
                          : 'bg-white/5 border-slate-700 text-slate-500'
                      }`}
                    >
                      Var {i + 1}
                    </button>
                  ))}
                </div>
                <div className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed bg-black/30 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {text}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
