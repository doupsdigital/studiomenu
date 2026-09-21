import 'server-only';

/** Wrapper fino sobre a API do Asaas — contrato confirmado direto na
 *  documentação oficial (docs.asaas.com) em 2026-09, não só de memória:
 *  autenticação via header `access_token` (não é Bearer), base URL por env
 *  var (sandbox `https://api-sandbox.asaas.com/v3`, produção
 *  `https://api.asaas.com/v3`). Padrão de retry pro primeiro pagamento de
 *  uma assinatura recém-criada inspirado no LashAgenda (o pagamento pode
 *  demorar a aparecer). */

/** Mensagem genérica pro cliente — o detalhe técnico (qual env var falta)
 *  fica só no log do servidor, nunca exposto na UI da profissional. */
export class AsaasConfigError extends Error {
  constructor() {
    super('Pagamentos ainda não configurados. Tente novamente mais tarde.');
    this.name = 'AsaasConfigError';
  }
}

export class AsaasApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'AsaasApiError';
  }
}

function getConfig(): { apiKey: string; baseUrl: string } {
  const apiKey = process.env.ASAAS_API_KEY;
  const baseUrl = process.env.ASAAS_BASE_URL;
  if (!apiKey || !baseUrl) {
    console.error(
      `[Asaas] Configuração ausente: ${!apiKey ? 'ASAAS_API_KEY ' : ''}${!baseUrl ? 'ASAAS_BASE_URL' : ''}`.trim()
    );
    throw new AsaasConfigError();
  }
  return { apiKey, baseUrl };
}

async function asaasRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const { apiKey, baseUrl } = getConfig();

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      access_token: apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = json?.errors?.[0]?.description || `Erro na API do Asaas (${res.status}).`;
    throw new AsaasApiError(res.status, message);
  }

  return json as T;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface AsaasCustomer {
  id: string;
}

export interface AsaasSubscription {
  id: string;
  status: string;
}

export interface AsaasPayment {
  id: string;
  status: string;
  value: number;
  customer: string;
  subscription?: string;
  /** Página de pagamento hospedada pelo Asaas — onde o cartão é digitado
   *  (nunca passa pelo nosso servidor). */
  invoiceUrl?: string;
}

export type AsaasBillingType = 'PIX' | 'CREDIT_CARD';

export interface AsaasPixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

/** Busca um customer existente por e-mail; cria um novo se não achar —
 *  evita duplicar customer no Asaas se a profissional tentar assinar de
 *  novo (ex: recarregou a página). */
export async function findOrCreateCustomer(input: { name: string; email: string; cpfCnpj: string }): Promise<AsaasCustomer> {
  const existing = await asaasRequest<{ data: AsaasCustomer[] }>('GET', `/customers?email=${encodeURIComponent(input.email)}`);
  if (existing.data && existing.data.length > 0) {
    return existing.data[0];
  }
  return asaasRequest<AsaasCustomer>('POST', '/customers', {
    name: input.name,
    email: input.email,
    cpfCnpj: input.cpfCnpj,
  });
}

/** `CREDIT_CARD` sem dados de cartão (confirmado no sandbox, Fase 21): o
 *  primeiro pagamento vem com `invoiceUrl` (página do Asaas onde a cliente
 *  digita o cartão), e depois de pago o cartão fica guardado na assinatura
 *  — as cobranças seguintes saem sozinhas. */
export async function createSubscription(input: {
  customerId: string;
  value: number;
  description: string;
  billingType?: AsaasBillingType;
}): Promise<AsaasSubscription> {
  const nextDueDate = new Date().toISOString().slice(0, 10);
  return asaasRequest<AsaasSubscription>('POST', '/subscriptions', {
    customer: input.customerId,
    billingType: input.billingType ?? 'PIX',
    value: input.value,
    nextDueDate,
    cycle: 'MONTHLY',
    description: input.description,
  });
}

/** O primeiro pagamento de uma assinatura recém-criada pode demorar alguns
 *  segundos pra aparecer — retry com backoff simples (mesmo padrão do
 *  LashAgenda: até 4 tentativas, 2s de intervalo). */
export async function getFirstSubscriptionPayment(subscriptionId: string): Promise<AsaasPayment | null> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const res = await asaasRequest<{ data: AsaasPayment[] }>('GET', `/payments?subscription=${subscriptionId}&limit=1`);
    if (res.data && res.data.length > 0) {
      return res.data[0];
    }
    await sleep(2000);
  }
  return null;
}

export async function getPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
  return asaasRequest<AsaasPixQrCode>('GET', `/payments/${paymentId}/pixQrCode`);
}

export async function getPayment(paymentId: string): Promise<AsaasPayment> {
  return asaasRequest<AsaasPayment>('GET', `/payments/${paymentId}`);
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await asaasRequest('DELETE', `/subscriptions/${subscriptionId}`);
}

/** Troca a forma de pagamento de uma assinatura AINDA NÃO PAGA (a cliente
 *  escolheu Pix, mudou de ideia e quer cartão, ou o contrário) — inclui a
 *  cobrança pendente (`updatePendingPayments`), senão o primeiro pagamento
 *  continuaria no método antigo. */
export async function updateSubscriptionBillingType(input: { subscriptionId: string; billingType: AsaasBillingType }): Promise<AsaasSubscription> {
  return asaasRequest<AsaasSubscription>('PUT', `/subscriptions/${input.subscriptionId}`, {
    billingType: input.billingType,
    updatePendingPayments: true,
  });
}

/** Atualiza valor/descrição de uma assinatura existente EM VEZ de criar uma
 *  nova — usado na troca de tier (ex: Básico → Plus), pra manter um único
 *  `asaas_subscription_id` por profissional a vida toda (evita cobrança
 *  duplicada e mantém o webhook, que resolve pedidos por esse id, sem
 *  precisar de nenhum caso especial). */
export async function updateSubscription(input: { subscriptionId: string; value: number; description: string }): Promise<AsaasSubscription> {
  return asaasRequest<AsaasSubscription>('PUT', `/subscriptions/${input.subscriptionId}`, {
    value: input.value,
    description: input.description,
  });
}
