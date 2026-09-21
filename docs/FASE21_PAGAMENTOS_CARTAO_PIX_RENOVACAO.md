# Fase 21 — Pagamentos: Cartão de crédito, Pix, renovação mensal e virada pra produção

> **Para o novo chat / Claude:** este é o documento de referência de **tudo** que envolve cobrança no StudioMenu depois da Fase 21 (2026-09-21). Complementa `docs/HANDOFF_2026-09-18_FASE19-20.md` (que cobre o plano Básico, o tour guiado e o histórico do dia) e `docs/TESTE_MANUAL_CARTAO.md` (roteiro de teste manual). Estado: **concluída e em produção** (`main`), com as ressalvas da seção 12.

---

## 1. Resumo executivo

| Item | Estado |
|---|---|
| Assinar por **Pix** (Básico R$39 / Plus R$69,90) | Em produção, provado com dinheiro real (R$5) |
| Assinar por **cartão de crédito** | Em produção (visível pra todos), **provado só no sandbox**; conta Asaas parece habilitada (conseguiu criar cobrança por cartão) mas nenhum pagamento real de cartão foi feito |
| Upgrade Básico → Plus (herda o método de pagamento) | Em produção, provado com dinheiro real |
| Webhook do Asaas (produção) | Funcionando (200), após corrigir URL (`www`) e token |
| Cancelamento pelo painel do Asaas → app bloqueia a agenda | Provado em produção |
| Aviso "pague sua mensalidade" no Início (Pix recorrente) | Em produção; estado "vence em" visto pela usuária no sandbox; estado "venceu" só por lógica |
| **Renovação real do mês seguinte** (Pix e cartão) | **Nunca testada em nenhum ambiente** |
| **Pix Automático** | **Não implementado** — conta é CPF (não elegível); ver seção 11 |

**Decisão de produto (dono):** cliente em atraso **mantém o acesso até o dono cancelar manualmente** (no painel do Asaas). O sistema só marca `suspenso`, não corta nada.

---

## 2. Como a cobrança funciona (visão geral)

- Cada profissional tem **uma única assinatura no Asaas** a vida toda (`orders.asaas_subscription_id`). Trocar de plano (Básico→Plus) **atualiza** essa assinatura (`PUT /subscriptions/{id}`), nunca cria uma segunda (evita cobrança dupla).
- **Nada é ativado no momento do checkout.** `plan_tier`/`subscription_status` só mudam quando o **pagamento é confirmado**, pelo webhook ou pelo polling `check-payment` (mesma função `activateSubscription`, idempotente). A única exceção deliberada é o **upgrade de quem já é assinante ativa** (não há cobrança nova pra confirmar; o novo valor vale só no próximo ciclo).
- **Pix (assinatura Asaas `billingType: PIX`) NÃO debita sozinho**: todo mês o Asaas cria uma cobrança nova e a cliente precisa pagar o QR (avisos só por e-mail do Asaas + o aviso do app, seção 7).
- **Cartão (`billingType: CREDIT_CARD` sem dados de cartão)**: o Asaas devolve o `invoiceUrl` (página hospedada onde a cliente digita o cartão — **nenhum dado de cartão passa pelo nosso servidor**); depois do primeiro pagamento o cartão fica guardado na assinatura (`creditCardToken`) e as cobranças seguintes saem **sozinhas**.

### Tiers e preços
`src/lib/pricing.ts`: `BASICO_PRICE = 39`, `PLUS_PRICE = 69.9`, `PLAN_PRICING` (label/descrição por tier).

---

## 3. Banco de dados (tabela `orders`)

Colunas de cobrança (todas em `docs/schema.sql`; migrações em `docs/migrations/`):

| Coluna | Migração | Função |
|---|---|---|
| `plan_tier` (`catalog`/`basico`/`plus`) | Fase 19 | tier atual |
| `subscription_status` (`none`/`ativo`/`suspenso`/`cancelado`) | anterior | estado da cobrança |
| `asaas_customer_id`, `asaas_subscription_id` | anterior | vínculo com o Asaas (id da assinatura é limpo ao cancelar) |
| `pending_plan_tier` (`basico`/`plus`) | `2026-09-18_fase19_plano_basico.sql` | tier que a cobrança em andamento representa; **nunca é zerado** (idempotência — zerar causava um bug real de upgrade grátis) |
| `payment_method` (`pix`/`card`) | `2026-09-21_fase21_cartao.sql` | método atual; exibido em "Minha assinatura" |
| `billing_price_override` (`NUMERIC`, ≥ 5) | `2026-09-21_fase21_preco_teste.sql` | preço reduzido **só pra teste real em produção** (seção 10) |
| `billing_email`, `billing_cpf_cnpj` | anterior | dados de cobrança |

As três migrações da Fase 19/21 **já foram rodadas** no Supabase (banco compartilhado entre preview e produção).

---

## 4. Variáveis de ambiente

| Variável | Onde | Valor |
|---|---|---|
| `ASAAS_BASE_URL` | Vercel **Production** | `https://api.asaas.com/v3` |
| `ASAAS_API_KEY` | Vercel **Production** | chave de **produção** |
| `ASAAS_WEBHOOK_SECRET` | Vercel **Production** | **idêntico** ao token do webhook no Asaas (mín. 32 caracteres, sem espaço/quebra de linha) |
| as mesmas 3 | Vercel **Preview** (somente) | chaves **sandbox** (`https://api-sandbox.asaas.com/v3`) |
| `.env` local | máquina do dev | sandbox (usado nos scripts de teste) |

> Nunca deixar chave sandbox em Production nem chave de produção em Preview. **Variável nova só vale depois de um novo deploy (Redeploy).**

---

## 5. Fluxos e contratos de API

### 5.1 `POST /api/billing/checkout` (`src/app/api/billing/checkout/route.ts`)
Body: `{ slug, email, cpf_cnpj, plan: 'basico'|'plus', method?: 'pix'|'card' (padrão pix; outro valor → 400) }`. Exige sessão profissional (cookie do link mágico) e passa por rate limit (10 / 15 min por pedido).

Ordem de decisão:
1. `plan_tier === plan` e `ativo` → `{ alreadyActive: true }`.
2. **Preço**: `billing_price_override` só vale se `5 ≤ override ≤ preço de tabela`; senão preço de tabela.
3. **Upgrade** (tem assinatura + `plan_tier` diferente e ≠ `catalog`): `PUT` valor/descrição, atualiza `pending_plan_tier`, **ativa na hora** → `{ upgraded: true }`. **Herda o método** (não escolhe de novo).
4. **Assinatura já existe e ainda não paga / suspensa** (reaproveita, nunca cria outra):
   - se o método pedido difere do salvo → `PUT /subscriptions/{id}` com `billingType` + `updatePendingPayments: true`;
   - grava `payment_method` (**não** mexe em `pending_plan_tier`);
   - escolhe a **cobrança em aberto** (`getPayableSubscriptionPayment` → `pickPayablePayment`: `PENDING`/`OVERDUE`, a de vencimento **mais antigo** primeiro — nunca "a primeira da lista", que numa assinatura de vários meses pode já estar paga);
   - se não há cobrança em aberto mas a assinatura **ainda existe** no Asaas → **409** com aviso (`total > 0`) ou **202** "ainda não ficou pronta" (`total == 0`) — **nunca cai pra criar assinatura nova** (seria cobrança em dobro);
   - só se a assinatura **sumiu** do Asaas (removida no painel sem o app saber) limpa `asaas_subscription_id`/`pending_plan_tier` e segue pra criar uma nova.
5. **Assinatura nova**: `findOrCreateCustomer` (busca por e-mail) → `createSubscription({ billingType })` → grava ids/`pending_plan_tier`/`payment_method` → primeira cobrança (com retry até 4×2s).

Resposta: Pix `{ success, method:'pix', paymentId, pixQrCodeImage, pixKey, expirationDate }`; cartão `{ success, method:'card', paymentId, invoiceUrl }`.

### 5.2 `POST /api/billing/check-payment`
Body `{ slug, payment_id }`. Confirma que o pagamento pertence ao catálogo, e se `CONFIRMED`/`RECEIVED` chama `activateSubscription`. É o "polling" da tela (a cada 5 s, até 5 min) — segunda via, junto do webhook.

### 5.3 `POST /api/billing/webhook` (`src/app/api/billing/webhook/route.ts`)
Header obrigatório `asaas-access-token` = `ASAAS_WEBHOOK_SECRET` (senão 401). Resolve o pedido por `subscription`/`customer`:
- **Eventos `PAYMENT_*` trazem o objeto `payment`; eventos `SUBSCRIPTION_*` trazem `subscription`** (o webhook lê os dois — bug corrigido em produção: antes ignorava `SUBSCRIPTION_*`).
- `PAYMENT_CONFIRMED`/`PAYMENT_RECEIVED` → `activateSubscription`.
- `PAYMENT_OVERDUE` → `suspenso` (**não** corta acesso nem `booking_enabled`).
- `PAYMENT_DELETED`/`SUBSCRIPTION_DELETED`/`SUBSCRIPTION_INACTIVATED` → `cancelado` + `booking_enabled=false` + limpa `asaas_subscription_id`/`pending_plan_tier`.
- Sempre responde 200 para eventos que não são nossos (evita o Asaas insistir/penalizar).

### 5.4 `POST /api/billing/open-charge` (`src/app/api/billing/open-charge/route.ts`)
Body `{ slug, withQr? }`. **Só lê** do Asaas (nunca ativa nada). Devolve `{ open: false }` se não há assinatura/cobrança em aberto **ou em qualquer erro** (aviso que não aparece > Início quebrado). Se há: `{ open:true, paymentId, value, dueDate, overdue, billingType:'pix'|'card', invoiceUrl }` e, com `withQr` num Pix, `pixQrCodeImage` + `pixKey`. `overdue = dueDate < hoje (America/Sao_Paulo)`. Rate limit 30 / 5 min.

### 5.5 `POST /api/billing/cancel`
Botão "Cancelar assinatura" do app (cancela no Asaas e atualiza o pedido). Cancelar **direto no painel do Asaas** também funciona (webhook `SUBSCRIPTION_DELETED`).

### 5.6 `src/lib/asaas.ts` (wrapper)
`createSubscription({customerId,value,description,billingType?})`, `updateSubscription`, `updateSubscriptionBillingType`, `getFirstSubscriptionPayment` (com retry, uso na criação), `getPayableSubscriptionPayment`, `getOpenSubscriptionCharge`, `pickPayablePayment` (pura), `getSubscription` (404 → `null`), `getPixQrCode`, `getPayment`, `cancelSubscription`. Autenticação por header `access_token`.

---

## 6. Interface

### 6.1 `src/components/billing/PlanSubscribeCard.tsx`
- Formulário: **CPF/CNPJ primeiro** (máscara), depois e-mail (o e-mail serve pros avisos do Asaas e pra deduplicar o cliente).
- **Seletor Pix / Cartão**: Pix pré-selecionado com selo verde "Recomendado"; selecionado = fundo rosa sólido + check branco. Prop `showMethodChoice` (`false` no upgrade de assinante ativa).
- **Pix**: QR + "Copiar código Pix" + polling → modal de sucesso.
- **Cartão**: tela "Finalize o pagamento" com **"Abrir pagamento seguro"** (link `target=_blank` pro `invoiceUrl` — evita bloqueio de pop-up no celular), polling, botão **"Já paguei, verificar agora"** e **"Trocar forma de pagamento"** (volta ao formulário; reenviar com outro método atualiza a mesma assinatura).
- Limitação conhecida: **não há retorno automático** do Asaas pro app após pagar no cartão (o `callback.successUrl` exige um domínio cadastrado na conta Asaas — não usado). Por isso o polling + botão manual.
- **Modal de sucesso** (Básico/Plus): benefícios em fonte 16px. `router.refresh()` só no clique de "Ir para o Início" (chamar antes desmonta o modal — bug já visto).

### 6.2 `src/components/billing/OpenChargeBanner.tsx` (no Início)
Consulta `open-charge` ao abrir. **Pix**: card "Sua mensalidade vence em DD/MM" (rosa) ou "venceu" (âmbar) + valor + "Pagar agora com Pix" (QR, copia e cola, polling `check-payment`, vira "Pagamento confirmado" e dá `router.refresh()`). **Cartão**: só aparece se **vencida** ("Não conseguimos cobrar seu cartão" + "Abrir cobrança"); em dia, o Asaas cobra sozinho. Sem cobrança em aberto ou erro → não renderiza nada.

### 6.3 Outros
- `SubscriptionSection.tsx`: "Cobrança recorrente via Pix" / "no cartão de crédito" (lê `payment_method`); 3 estados (Plus ativo, Básico ativo + oferta de upgrade, sem plano).
- `inicio/page.tsx`: quem está `suspenso` **não** vê o card "Assinar o Plus".
- `PlusUpsellCard`: benefícios em fonte 16px.

---

## 7. Renovação mensal — o que acontece

1. **Pix**: o Asaas gera a cobrança do mês (alguns dias antes do vencimento; **não sei quantos em produção**) e avisa a cliente por e-mail (**conferir quais notificações estão ligadas na conta Asaas**). O app mostra o aviso no Início. Pagou → `PAYMENT_RECEIVED` → `ativo`. Não pagou → vence → `PAYMENT_OVERDUE` → `suspenso` (mantém acesso; Início mostra aviso âmbar e esconde o upsell do Plus).
2. **Cartão**: o Asaas cobra sozinho na data. Se falhar → cobrança vencida → aviso âmbar no app com link da cobrança.
3. Enquanto ela não pagar, **os meses vão acumulando cobranças vencidas** (o Asaas não cancela sozinho). O dono cancela no painel do Asaas → `cancelado`, agenda bloqueada.

**Nunca testado em nenhum ambiente:** uma renovação real (Pix ou cartão), o estado "venceu" em tela, e a escolha da cobrança com **várias cobranças de meses diferentes**. O sandbox **não** gera o ciclo seguinte na hora e **não** deixa forçar "vencida" (`Esta cobrança não pode ser alterada para vencida`); mudar `nextDueDate` via API funciona mas o Asaas só cria a cobrança seguinte mais perto do vencimento. Validar **acompanhando o primeiro cliente real** (ou um teste real de 1–2 dias: assinar por R$5, mudar o próximo vencimento pra amanhã no painel, esperar a cobrança nascer/vencer).

---

## 8. Achados do Asaas (confirmados empiricamente)

- `PUT /subscriptions/{id}` (valor) **não** gera cobrança nova nem altera a do ciclo atual → por isso o upgrade ativa na hora.
- `billingType: CREDIT_CARD` sem cartão → primeira cobrança vem com `invoiceUrl`; pagando com cartão de teste vira `CONFIRMED` e a assinatura guarda `creditCardToken`.
- `PUT` com `billingType` + `updatePendingPayments: true` troca Pix↔cartão numa assinatura não paga.
- `callback: {successUrl}` na assinatura exige **domínio cadastrado** na conta ("Minha Conta → Informações").
- `POST /payments/{id}/payWithCreditCard` e `POST /sandbox/payment/{id}/confirm` existem **só no sandbox** (usados nos testes automáticos).
- Taxas (conta da usuária): **cartão 2,99% + R$0,49 à vista** (≈ R$1,66 em R$39; ≈ R$2,58 em R$69,90); **Pix ≈ R$1,99 fixo** (visto no teste de R$5: líquido R$3,01).

---

## 9. Virada pra produção — armadilhas (não aparecem no sandbox)

1. **URL do webhook sem `www`**: `studiomenu.art` responde **308** → `www.studiomenu.art`; o Asaas **não segue redirect**, falha toda entrega, **penaliza** e pausa a fila. **Usar `https://www.studiomenu.art/api/billing/webhook`.**
2. **Token do webhook ≠ `ASAAS_WEBHOOK_SECRET`** → log do Asaas com `401 Unauthorized`. Definir o **mesmo** valor nos dois lados e fazer **Redeploy**.
3. **Fila pausada/penalizada** → o botão "Reenviar" fica bloqueado; caminho seguro = **remover e recriar o webhook** (hoje `studiomenu2`; o antigo `studiomenu` penalizado deve ser removido).
4. **Eventos a cadastrar no webhook:** `PAYMENT_CONFIRMED`, `PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`, `PAYMENT_DELETED`, `SUBSCRIPTION_DELETED`, `SUBSCRIPTION_INACTIVATED`; API v3, ativo, fila sincronizada.
5. **Como validar o webhook sem gastar**: criar uma cobrança avulsa no painel do Asaas e **excluir** → dispara `PAYMENT_DELETED`; em "Logs de Webhooks" deve aparecer **200** (a cobrança não pertence a nenhum catálogo, o app só responde "ok").
6. Produção **nunca** teve chaves sandbox e o preview **nunca** deve ter as de produção.

---

## 10. Teste real em produção com preço reduzido (procedimento)

O catálogo de teste é `teste-manual-fase19` (link mágico: `https://www.studiomenu.art/api/professional/login?slug=teste-manual-fase19&token=0155933ba7ac30a0b158572abc7b8822`, funciona em produção e no preview).

1. **Ligar R$5** (SQL no Supabase; só nesse catálogo, e só se ele estiver limpo):
   ```sql
   UPDATE public.orders SET billing_price_override = 5 WHERE slug = 'teste-manual-fase19';
   ```
   O card ainda mostra R$39/R$69,90, mas a cobrança sai de **R$5** (confira o valor no app do banco antes de pagar).
2. Assinar (Pix ou cartão), pagar, fazer o upgrade, conferir os logs de webhook (200).
3. **Cancelar no painel do Asaas** (Cobranças → Assinaturas → lixeira) e **estornar** os R$5 (Cobranças → Todas → Estornar).
4. **Limpar** o catálogo e **desligar o preço de teste** (script da seção 13 ou SQL: `billing_price_override = NULL`, `plan_tier='catalog'`, `subscription_status='none'`, ids/`payment_method` nulos).

> Cuidado ao testar **cartão com o mesmo CPF do titular da conta Asaas** (a usuária optou por não testar por medo de o Asaas tratar como autopagamento/antifraude). Preferir outro CPF/cartão.

---

## 11. Pix Automático — investigação (NÃO implementado)

Documentação oficial: <https://docs.asaas.com/docs/pix-automatico>. Resumo:
- Não é a assinatura Pix comum: usa **autorização** (`POST /v3/pix/automatic/authorizations`); o primeiro QR paga o 1º mês **e** autoriza os seguintes (Jornada 3). Depois o banco debita sozinho.
- Modos: `SUBSCRIPTION` (o Asaas gera as cobranças; **valor fixo** → upgrade exigiria nova autorização) ou `MANUAL` (nós criamos cada cobrança 2–10 dias úteis antes do vencimento; valor variável, exige rotina/cron nossa).
- Retentativas: intradia (banco) + extradia (até 3 em 7 dias, `retryPolicy: ALLOW_THREE_IN_SEVEN_DAYS`). Falhou tudo → cobrança `OVERDUE`, autorização segue ativa.
- Webhooks novos: `PIX_AUTOMATIC_RECURRING_AUTHORIZATION_{CREATED,ACTIVATED,CANCELLED,EXPIRED,REFUSED}`, `..._PAYMENT_INSTRUCTION_{CREATED,SCHEDULED,REFUSED,CANCELLED}`, `..._ELIGIBILITY_UPDATED`; pagamentos ainda geram `PAYMENT_CONFIRMED`/`PAYMENT_RECEIVED`.
- **Bloqueios encontrados:** (1) elegibilidade exige **conta Pessoa Jurídica, aprovada, com CNPJ ativo há ≥ 6 meses** (a conta da usuária é CPF); (2) o **sandbox respondeu 403** ("Você não possui permissão para utilizar este recurso…") → não dá pra testar sem liberação do Asaas.
- **Quando abrir CNPJ:** o Asaas permite **converter a mesma conta** de CPF pra CNPJ (Minha conta → Informações → Dados comerciais; titular do CPF precisa ser sócio administrador; sem subcontas; análise ≤ 2 dias úteis; as cobranças existentes são mantidas; **não há volta** PJ→PF nem troca de CNPJ). Conta convertida = mesma chave de API/webhook/env (validar com uma cobrança de R$5); conta **nova** = trocar chave, recriar webhook (com `www`) e as assinaturas antigas ficariam na conta velha.
- **Escopo se um dia for feito:** coluna pro id da autorização; 3ª opção no card ("Pix Automático"); checkout que cria a autorização e confirma pelo **status da autorização**; webhook tratando os eventos novos (payloads em `authorization`/`paymentInstruction`); cancelar autorização no botão "Cancelar"; decidir `SUBSCRIPTION` vs `MANUAL` pro upgrade; rever o `OpenChargeBanner`. Perguntar ao Asaas: elegibilidade via API (Jornada 3), sandbox liberado e **tarifa** (não achada na doc).

---

## 12. Estado atual, ressalvas e pendências

**Em produção e provado (dinheiro real):** Pix Básico, upgrade pro Plus, webhook (200), cancelamento pelo painel → agenda bloqueada.
**Em produção, não provado em real:** cartão; renovação (Pix/cartão); estado "venceu"; escolha da cobrança com várias cobranças; recusa de cartão na renovação.

Pendências da usuária (não são de código):
1. Reativar a **Vercel Authentication** do preview (foi desligada pra testes).
2. Remover o webhook antigo **`studiomenu`** (penalizado) no Asaas; manter só `studiomenu2`.
3. Conferir as **notificações do Asaas** (e-mails/dias de antecedência da cobrança do Pix).
4. Definir regras de **cancelamento/reembolso** (inclui direito de arrependimento de 7 dias), nota fiscal e taxas na margem.
5. Ao abrir o CNPJ: converter a conta Asaas, testar R$5, e só então reavaliar o Pix Automático.

Comportamentos conhecidos / decisões:
- Cliente em atraso **mantém acesso** até o dono cancelar (decisão do dono).
- Trocar de cartão pra Pix (ou inverso) **depois de já ser assinante ativa** não foi implementado.
- Sem retorno automático do Asaas após pagar no cartão (depende de domínio cadastrado na conta).

---

## 13. Testes e scripts

- **Roteiro manual:** `docs/TESTE_MANUAL_CARTAO.md` (4 testes; resultado registrado: todos passaram no sandbox).
- **Testes automáticos** (scripts descartáveis contra o preview/sandbox, já executados — não ficam no repositório): 23 verificações (cartão, Pix, troca de método, assinatura única, nada ativado sem pagar, método inválido), 7 do checkout em assinatura existente/suspensa/sumida, 8 do `open-charge`, 7 de webhook simulado (incl. `SUBSCRIPTION_DELETED`, token errado → 401).
- **Como escrever esses scripts nesta máquina:** rodar **dentro da pasta do projeto** (o `require` resolve o `node_modules`), ler o `.env` na mão (sem `dotenv`) e definir `global.WebSocket = class {}` antes de `require('@supabase/supabase-js')` (Node 20). Criar o arquivo com a ferramenta de escrita e **apagar depois** (heredocs longos no bash já falharam por aspas). Só chamar o Asaas se `ASAAS_BASE_URL` contiver `sandbox`.
- **Reset do catálogo de teste** (zera plano, cancela assinatura no Asaas **sandbox**, apaga usuário Auth, limpa e-mail/CPF/`payment_method`/`billing_price_override`): script completo em `HANDOFF_2026-09-18_FASE19-20.md` (seção 7). **Nunca** rodar o cancelamento do Asaas contra chaves de produção a partir do `.env` local.
- **Verificar deploy:** `curl --ssl-no-revoke https://api.github.com/repos/doupsdigital/studiomenu/commits/<sha>/status` até `"state": "success"` (a flag `--ssl-no-revoke` é necessária nesta máquina). Depois de um merge em `main`, o alias de produção pode levar ~20–40 s a mais; conferir `https://www.studiomenu.art` (o domínio sem `www` redireciona).

---

## 14. Mapa de arquivos

```
docs/migrations/2026-09-21_fase21_cartao.sql            payment_method
docs/migrations/2026-09-21_fase21_preco_teste.sql       billing_price_override
docs/schema.sql                                          (atualizado)
docs/TESTE_MANUAL_CARTAO.md                              roteiro manual
docs/HANDOFF_2026-09-18_FASE19-20.md                     handoff geral (seções 9, 9.1, 9.2, 10)

src/lib/asaas.ts                                         wrapper Asaas (ver 5.6)
src/lib/billing-service.ts                               activateSubscription / setSubscriptionStatus / findOrderIdByAsaasIds
src/lib/professional-app-service.ts                      lê payment_method
src/app/api/billing/checkout/route.ts                    checkout (5.1)
src/app/api/billing/check-payment/route.ts               polling (5.2)
src/app/api/billing/webhook/route.ts                     webhook (5.3)
src/app/api/billing/open-charge/route.ts                 cobrança em aberto (5.4)
src/app/api/billing/cancel/route.ts                      cancelamento pelo app
src/components/billing/PlanSubscribeCard.tsx             seletor Pix/Cartão + fluxos (6.1)
src/components/billing/OpenChargeBanner.tsx              aviso de mensalidade (6.2)
src/components/config/SubscriptionSection.tsx            "Minha assinatura"
src/components/app-shell/PlusUpsellCard.tsx              upsell do Plus
src/app/app/[slug]/inicio/page.tsx                       Início (banner, upsell condicional)
```

Commits-chave (em `main`): `66dfdc7` (cartão), `e4b73c2` (seleção visível), `7b4a903` (preço de teste), `98cbb8c` (webhook `SUBSCRIPTION_*`), `8b0c4b4` (cobrança em aberto no checkout), `601be80` (aviso de mensalidade + doc), mais os ajustes de UI (CPF primeiro, fonte dos benefícios).
