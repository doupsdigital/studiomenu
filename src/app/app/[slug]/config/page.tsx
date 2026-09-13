import { Settings } from 'lucide-react';

export default function ConfigPage() {
  return (
    <main className="max-w-md mx-auto px-5 pt-8 pb-6 flex flex-col items-center text-center min-h-[calc(100vh-8rem)] justify-center">
      <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-3">
        <Settings className="w-6 h-6" />
      </div>
      <h1 className="font-serif text-xl font-bold mb-2">Configurações chegam na próxima etapa</h1>
      <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
        A grade semanal de horários de atendimento e os bloqueios/folgas estão em construção.
      </p>
    </main>
  );
}
