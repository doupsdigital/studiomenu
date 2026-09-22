# Fase 22 — Oferta do Plus direto (venda focada em agendamento)

> **Para o novo chat / Claude:** este documento cobre a Fase 22 (2026-09-22), implementada sobre a Fase 21 (`docs/FASE21_PAGAMENTOS_CARTAO_PIX_RENOVACAO.md`, que continua valendo pra tudo de cobrança/Pix/cartão). Estado: **implementado, testado de ponta a ponta no sandbox (os 2 cenários) pela usuária, e concluído.**

---

## 1. Motivação (decisão de produto)

Até aqui, toda profissional criada no sistema via primeiro **obrigatoriamente** pelo StudioMenu Básico (R$39/mês, só catálogo): a tela de primeiro contato (`FirstContactScreen`) sempre oferecia `plan="basico"`, sem alternativa. Virar Plus (R$69,90/mês, agendamento automático) só acontecia depois, manualmente, dentro do app já pago.

O usuário quer rodar anúncios cujo gancho é **agendamento automático**, não "catálogo bonito", pra um público cuja dor é perder tempo confirmando horário pelo WhatsApp. Fazer essa lead pagar primeiro um plano sem agendamento (Básico) e só depois descobrir que precisa trocar de novo é atrito e contradiz a promessa do anúncio.

**Achado técnico que abriu caminho pra isso:** não existia nenhuma trava de cobrança obrigando o Básico primeiro — o checkout (`/api/billing/checkout`) já aceitava `plan: 'plus'` numa assinatura nova sem nenhuma diferença de tratamento. A única razão de sempre começar no Básico era a tela estar hardcoded assim. Por isso essa fase foi só de **roteamento de tela + uma flag no catálogo**, nunca mexeu em Asaas/webhook/ativação.

**Decisão tomada com o usuário:** quem chega pela oferta do Plus vê o Plus em destaque, mas com uma saída visível pro Básico ("prefiro começar só com o catálogo") — nunca fica presa numa única opção. E o Básico, nesse contexto, é explicado como "agendamento continua pelo WhatsApp" (que é literalmente o que ele já fazia antes de qualquer StudioMenu+ existir — a cliente toca no serviço e cai no WhatsApp), não como "sem agendamento".

---

## 2. Como funciona

### 2.1 O campo `orders.first_offer_tier`
`'basico'` (padrão, comportamento de sempre) ou `'plus'`. Decide **só** qual plano aparece em destaque na tela de primeiro contato — não ativa nada, não muda cobrança, não pula a confirmação de pagamento. Só tem efeito enquanto `plan_tier === 'catalog'` (ela nunca assinou nada ainda); depois que ela paga qualquer coisa, esse campo vira irrelevante pra sempre (a tela de primeiro contato nem existe mais pro link dela).

### 2.2 Tela de primeiro contato (`FirstContactScreen.tsx`)
Virou **Client Component** (antes era Server puro) — precisa de `useState` pro toggle entre os dois planos.

- **`first_offer_tier = 'basico'`** (padrão, quase todo mundo): tela idêntica a antes, zero mudança visual, sem nenhum link extra.
- **`first_offer_tier = 'plus'`**:
  - Texto acima do card: "Suas clientes agendam sozinhas, sem trocar mensagem no WhatsApp — assine o StudioMenu+ e libere o agendamento automático."
  - `PlanSubscribeCard` abre com `plan="plus"` (R$69,90) — o card em si não mudou nada, só recebe outro valor de prop (já suportava os dois tiers desde a Fase 19/21).
  - Link abaixo: "Prefiro começar só com o catálogo (R$39/mês) — o agendamento continua pelo WhatsApp" → troca o card pro Básico (client-side, sem reload). Ao trocar, aparece o link inverso ("← Prefiro o agendamento automático").
  - O 3º passo do tour guiado (`fc-subscribe`) muda de texto junto, conforme o plano em destaque no momento.

### 2.3 Como marcar um catálogo pra essa oferta
Dois jeitos, ambos via admin, nenhum código extra pro usuário mexer:

1. **Na criação** (`admin/criar-com-ia`): toggle "Vender o Plus direto" no Passo 1 (mesmo estilo visual do toggle "Adaptar formato com IA" que já existia ali). Manda `firstOfferTier` no FormData pro `/api/admin/finalize-catalog`, que passa pra `buildOrderInsertPayload`.
2. **Depois de criado** (`admin/catalogos`): botão "Oferta inicial: Básico (padrão)" / "Oferta inicial: Plus direto" em cada card — só aparece enquanto o catálogo ainda está em `plan_tier = 'catalog'` (some depois que ela assina, porque nesse ponto não faz mais diferença). Usa a mesma rota `PATCH /api/admin/catalog-actions` que já fazia o toggle de `booking_enabled`.

### 2.4 Mensagem de entrega por WhatsApp
`buildDeliveryWhatsappUrl` (botão "Aprovar & Entregar" do admin) tem uma segunda versão do texto pra quando `first_offer_tier === 'plus'` — fala de agendamento automático em vez de "catálogo pronto". A mensagem separada "Enviar app por WhatsApp" (Fase 21) não mudou.

---

## 3. Banco de dados

Migração: `docs/migrations/2026-09-22_fase22_oferta_plus.sql`

```sql
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS first_offer_tier TEXT NOT NULL DEFAULT 'basico'
    CHECK (first_offer_tier IN ('basico', 'plus'));
```

**Rodada em produção** (banco compartilhado entre preview e produção, mesmo padrão de todas as fases anteriores). `docs/schema.sql` já está atualizado.

---

## 4. Arquivos tocados

```
docs/migrations/2026-09-22_fase22_oferta_plus.sql   a migração
docs/schema.sql                                      atualizado

src/lib/order-payload.ts                             OrderInsertInput.firstOfferTier -> first_offer_tier
src/lib/professional-app-service.ts                  ProfessionalOrderSummary.first_offer_tier
src/app/api/admin/finalize-catalog/route.ts           lê 'firstOfferTier' do FormData
src/app/api/admin/catalog-actions/route.ts            PATCH aceita first_offer_tier
src/app/admin/criar-com-ia/page.tsx                   toggle "Vender o Plus direto" (Passo 1) + lembrete (Passo 2)
src/app/admin/catalogos/page.tsx                       toggle pós-criação + mensagem de entrega variante
src/components/app-shell/FirstContactScreen.tsx        vira Client Component; toggle Plus/Básico
```

Nada mudou em: `src/app/api/billing/checkout/route.ts`, `src/lib/asaas.ts`, webhook, `PlanSubscribeCard.tsx` — o checkout já suportava `plan: 'plus'` numa assinatura nova, sem gate nenhum.

---

## 5. Estado atual e como foi testado

**Migração rodada em produção** (Supabase compartilhado entre preview e produção). **Testado de ponta a ponta pela usuária, no sandbox (preview), nos 2 cenários — confirmado funcionando:**

Dois catálogos de teste novos (não reaproveitei o `teste-manual-fase19`, que já estava em Plus ativo há várias fases): `teste-oferta-plus` (`first_offer_tier = 'plus'`) e `teste-oferta-basico` (`first_offer_tier = 'basico'`), cada um com 3 serviços agendáveis (`duration_minutes` preenchido) e expediente seg-sáb 08h-18h, pra também dar pra testar o agendamento automático, não só a assinatura.

- **Cenário Plus direto:** tela abriu com o Plus em destaque; o link "Prefiro começar só com o catálogo" trocou o card pro Básico sem reload, e o link de volta funcionou; assinar o Plus direto ativou como Plus de verdade, sem nenhuma passagem por Básico; agendamento automático funcionando no catálogo público.
- **Cenário Básico primeiro:** tela idêntica ao comportamento de sempre (sem nenhum link de trocar de plano) — confirmada a ausência de regressão pra quem não está nessa campanha.
- **Toggle "Oferta inicial" na lista do admin:** confirmado que só aparece enquanto o catálogo está em `plan_tier = 'catalog'` (some depois que ela assina; reaparece se a assinatura for removida/resetada).

Depois do teste, as duas assinaturas de sandbox foram canceladas de verdade no Asaas e os dois catálogos voltaram pro estado "nunca assinou nada" (mesmo script de reset da Fase 19/20, `HANDOFF_2026-09-18_FASE19-20.md` seção 7) — ficam guardados pra reaproveitar em testes futuros, mesmo padrão do `teste-manual-fase19`.

**Decisão pendente, fora de código:** quanto cobrar pela criação do catálogo (o serviço de montagem, via WhatsApp/Kiwify) pra esse público — é independente da assinatura mensal dentro do app e não foi mexido aqui.
