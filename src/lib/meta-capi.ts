import crypto from 'crypto';

const DEFAULT_PIXEL_ID = process.env.META_PIXEL_ID || '1042165951490026';
const DEFAULT_ACCESS_TOKEN =
  process.env.META_CAPI_ACCESS_TOKEN ||
  'EAAWMnrVYZAnsBSiMQZCvYvp7e55Lhtaf2S7ByAMZA2a4e7ZChHfTaAtEXVq10a8YehZBtB39HDVe7INU3zyPpPeO8AsBisTZAa9ZBXB73KiP4otU5AW1nqGhN6Ae5D2KjQteoVCwEoKAGBhZBoaFZBQu2MdSeVHxAn069HS0tStsYI99hiYLEpx68JzEj5kHcozHWNhrIBZBqUAXO6KYZBIqBKXFaahbUS4xHxip29KzZC3Tgl4OvlhaVZAa08DmZCTwQf5WPAC2cgVhHeXvUgZCrUNHh4ss1jm7RSPysPlOp4e8QZDZD';

export function hashSha256(value: string): string {
  const clean = value.trim().toLowerCase();
  return crypto.createHash('sha256').update(clean).digest('hex');
}

export function formatWhatsAppNumberForMeta(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (!digits.startsWith('55') && (digits.length === 10 || digits.length === 11)) {
    digits = '55' + digits;
  }
  return digits;
}

export interface MetaCapiEventParams {
  eventName: 'Purchase' | 'Lead' | 'PageView' | 'InitiateCheckout';
  value?: number;
  currency?: string;
  phone?: string;
  email?: string;
  fbclid?: string;
  fbc?: string;
  fbp?: string;
  eventSourceUrl?: string;
  contentName?: string;
}

/** Dispara evento Server-Side para a API de Conversões do Meta (CAPI) */
export async function sendMetaCapiEvent(params: MetaCapiEventParams): Promise<boolean> {
  try {
    const pixelId = process.env.META_PIXEL_ID || DEFAULT_PIXEL_ID;
    const token = process.env.META_CAPI_ACCESS_TOKEN || DEFAULT_ACCESS_TOKEN;

    if (!pixelId || !token) {
      console.warn('[Meta CAPI] Pixel ID ou Access Token ausente.');
      return false;
    }

    const userData: Record<string, any> = {
      country: [hashSha256('br')],
    };

    if (params.phone) {
      const cleanPhone = formatWhatsAppNumberForMeta(params.phone);
      if (cleanPhone) {
        userData.ph = [hashSha256(cleanPhone)];
      }
    }

    if (params.email) {
      userData.em = [hashSha256(params.email)];
    }

    if (params.fbclid) {
      userData.fbc = params.fbc || `fb.1.${Date.now()}.${params.fbclid}`;
    } else if (params.fbc) {
      userData.fbc = params.fbc;
    }

    if (params.fbp) {
      userData.fbp = params.fbp;
    }

    const payload = {
      data: [
        {
          event_name: params.eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: params.eventSourceUrl || 'https://www.studiomenu.art',
          user_data: userData,
          custom_data: {
            currency: params.currency || 'BRL',
            value: params.value ?? 0,
            content_name: params.contentName || 'StudioMenu Catálogo Digital',
            status: 'completed',
          },
        },
      ],
      access_token: token,
    };

    const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.events_received && result.events_received > 0) {
      console.log(`[Meta CAPI] Evento ${params.eventName} de R$ ${params.value || 0} enviado com sucesso! TraceId: ${result.fbtrace_id}`);
      return true;
    } else {
      console.error('[Meta CAPI Error]:', result);
      return false;
    }
  } catch (error) {
    console.error('[Meta CAPI Exception]:', error);
    return false;
  }
}
