import { normalizeWhatsappBR } from '../format';

/** Fonte única de verdade pro payload de INSERT em `appointments` — mesmo
 *  espírito do order-payload.ts (evita campo esquecido em algum fluxo). */
export interface BookAppointmentInput {
  orderId: string;
  serviceId?: string | null;
  serviceTitle: string;
  durationMinutes: number;
  priceSnapshot?: string | null;
  clientName: string;
  clientWhatsapp: string;
  clientNotes?: string | null;
  /** ISO 8601 (UTC). */
  startsAt: string;
  origin?: 'catalog' | 'professional';
  status?: 'pending' | 'confirmed';
}

export function buildAppointmentInsertPayload(input: BookAppointmentInput) {
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(startsAt.getTime() + input.durationMinutes * 60000);

  return {
    order_id: input.orderId,
    service_id: input.serviceId || null,
    service_title: input.serviceTitle,
    duration_minutes: input.durationMinutes,
    price_snapshot: input.priceSnapshot || null,
    client_name: input.clientName.trim(),
    client_whatsapp: normalizeWhatsappBR(input.clientWhatsapp),
    client_notes: input.clientNotes?.trim() || null,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    status: input.status || 'pending',
    origin: input.origin || 'catalog',
  };
}
