import type { AgendaAppointment } from '@/lib/scheduling/agenda-service';

/** Mesmas cores exatas do `getStatusColorStyles` do LashAgenda (nomes de
 *  status em inglês aqui, mas o mapeamento de cor é o mesmo: pendente=amber,
 *  confirmado=green, concluído=blue, falta=red, cancelado=gray).
 *  Compartilhado entre `DayTimeGrid` (grade do dia) e `MonthCalendar`
 *  (visão mensal, Fase 11). */
export const STATUS_STYLES: Record<AgendaAppointment['status'], { bg: string; border: string; badge: string; text: string; accent: string }> = {
  pending: { bg: 'bg-amber-50 hover:bg-amber-100', border: 'border-amber-300', badge: 'bg-amber-200 text-amber-900', text: 'text-amber-800', accent: 'border-l-amber-500' },
  confirmed: { bg: 'bg-green-50 hover:bg-green-100', border: 'border-green-300', badge: 'bg-green-200 text-green-900', text: 'text-green-800', accent: 'border-l-green-500' },
  completed: { bg: 'bg-blue-50 hover:bg-blue-100', border: 'border-blue-300', badge: 'bg-blue-200 text-blue-950', text: 'text-blue-800', accent: 'border-l-blue-500' },
  no_show: { bg: 'bg-red-50 hover:bg-red-100 opacity-70', border: 'border-red-400', badge: 'bg-red-200 text-red-900', text: 'text-red-800', accent: 'border-l-red-500' },
  cancelled: { bg: 'bg-gray-100 hover:bg-gray-200 opacity-50', border: 'border-gray-200', badge: 'bg-gray-200 text-gray-600', text: 'text-gray-400', accent: 'border-l-gray-400' },
};

export const STATUS_LABEL: Record<AgendaAppointment['status'], string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  no_show: 'Falta',
  cancelled: 'Cancelado',
};
