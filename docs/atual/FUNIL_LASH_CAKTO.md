# Funil de autosserviço Lash (prévia grátis + Cakto)

> Leia isto antes de mexer em `/lash`, `/?nicho=lash`, Cakto, prévia, `/ativando`,
> "Primeiros passos" ou no e-mail de acesso.
>
> **No ar em produção desde 2026-11-18.** Promovido nos PRs #181, #182 e #183.
> Validado com uma compra real: Pix + reembolso.

---

## 1. O que é e por quê

Até 2026-11-17, o StudioMenu Lash era vendido por **X1**. O passo a passo era:

1. criar o catálogo pelo nome no admin;
2. mandar o link;
3. explicar preço e edição no WhatsApp.

Dava muito trabalho, pouca gente pagava e o catálogo grátis nunca travava.

O funil novo **vende sozinho**:

```
Anúncio → /?nicho=lash (ou /lash) → digita só o NOME → prévia Capa+Catálogo (24h, sem edição)
  → "Ativar" → Cakto (R$ 22,90/mês cartão | R$ 127/ano Pix)
  → /ativando (loga sozinha) → /app/<slug>/primeiros-passos
  (+ e-mail de acesso pelo Resend, de reserva)
```

- **Por que Cakto e não Asaas:** a Cakto alimenta o pixel da Meta com o Purchase.
- **Asaas continua intocado**, porque há assinantes ativas nele. Tudo do funil novo é separado
  por `orders.billing_provider = 'cakto'`. O padrão de todas as linhas antigas é `'asaas'`.
- **Escopo:** só o nicho Lash. A `/` sem `?nicho` continua sendo a landing de sempre.

---

## 2. URLs públicas

| URL | O que mostra |
|---|---|
| `/?nicho=lash` | **Página de autosserviço.** É o link do anúncio que já está rodando. Qualquer `v=` diferente de `antiga` também cai aqui. |
| `/lash` | A mesma página. |
| `/?nicho=lash&v=antiga` | Landing antiga de Lash (X1/WhatsApp), guardada caso precise voltar. |
| `/lp` | Redireciona 307 para `/?nicho=lash`, mantendo UTMs e fbclid. |
| `/` (sem nicho) | Landing de sempre, sem mudança. |
| `/ativando` | Página de obrigado da Cakto. Loga sozinha no app. |
| `/a/<código>` | Link curto do app, usado no e-mail. Se o código for inválido ou for de uma prévia, vai para `/?nicho=lash`. |

⚠️ **Sempre use `www.studiomenu.art`** em integrações externas. O domínio sem `www` responde
**308** para o `www`, e um webhook pode não seguir esse redirecionamento.

---

## 3. Configuração externa (já feita)

### Cakto

**Produtos:**

| Produto | Preço / pagamento | ID | Checkout |
|---|---|---|---|
| StudioMenu Mensal | R$ 22,90/mês, assinatura, só cartão | `8f8da661-dffa-4cf4-bffb-93bd0f3136fb` | `https://pay.cakto.com.br/h2p6djs_1336617` |
| StudioMenu Anual | R$ 127, pagamento único no Pix (1 ano de acesso) | `0914892a-e344-438a-83c0-e6d4cd22985f` | `https://pay.cakto.com.br/ts7e24e_1336652` |

- **Página de obrigado (os 2 produtos):** `https://www.studiomenu.art/ativando`.
- **Webhook "studio-menu":** `https://www.studiomenu.art/api/billing/cakto-webhook`, só para os 2
  produtos.
  - **Eventos marcados:** Compra aprovada, Assinatura renovada, Reembolso, Chargeback,
    Assinatura cancelada e "Renovação de assinatura recusada".
  - A Cakto **não tem** um evento "renovação recusada" com esse nome exato. É o item
    "Renovação de assinatura…" da lista.
- **Pixel da Meta (os 2 produtos):** `1170978082151966`, com Purchase só na aprovação.
- **Cupom:** no máximo 80% de desconto. O campo aparece no checkout com a chave
  "Exibir Campo de Cupom" (Produto → Configurações → Checkout). Também dá para aplicar pela URL
  com `&coupon=NOME`.
- **Cancelamento pela própria assinante:** portal `https://assinatura.cakto.com.br/`, com login
  pelo e-mail da compra. O suporte pelo WhatsApp fica como alternativa.

### Variáveis na Vercel (Production + Preview)

| Variável | Para quê |
|---|---|
| `CAKTO_WEBHOOK_SECRET` | Tem que ser igual à "Chave secreta do webhook" da Cakto. |
| `CAKTO_WEBHOOK_SECRET_OLD` | Opcional. Aceita a chave antiga durante uma troca de chave, sem ficar fora do ar. |
| `CAKTO_PRODUCT_MAP` | `idProduto:mensal,idProduto:anual`. Produto fora do mapa é **ignorado**, porque a conta Cakto tem outros produtos (Manual da Lash, etc.). |
| `RESEND_API_KEY` | Chave só de envio, da conta Resend "doupsdigital". |

Localmente, as chaves da Cakto ficam em `.env.development.local` e a do Resend em `.env.local`.

### Resend (e-mail)

- O domínio `studiomenu.art` está verificado na conta Resend "doupsdigital", que também envia os
  e-mails do LashBox e do Manual da Lash.
- **O DNS do domínio fica na Vercel**, com nameservers `ns1/ns2.vercel-dns.com`. O painel DNS da
  Hostinger aparece "Inativo" e não deve ser usado.
- Registros na Vercel:
  - `resend._domainkey` (TXT)
  - `send` (CNAME para `send.forge.rmta.net`)
  - `rsend` (CNAME para `rsend-sae1.forge.rmta.net`)
  - `_dmarc` (TXT `v=DMARC1; p=none;`)
- Remetente: `StudioMenu <acesso@studiomenu.art>`.
- Os slugs `send` e `rsend` estão em `RESERVED_SLUGS`. O CNAME fixo ganharia do `*` e o menu com
  esse nome nunca abriria.

### Meta (pixels)

| Pixel | Onde é usado |
|---|---|
| `1170978082151966` | **Exclusivo do StudioMenu**, criado em 2026-11-17. Usado na página de autosserviço (`LASH_FUNNEL_PIXEL_ID` em `src/lib/cakto-checkout.ts`) e nos 2 produtos da Cakto. |
| `1042165951490026` | Pixel antigo, de outro produto. Continua na `/` sem nicho, na `?v=antiga` e no CAPI do Asaas (`src/lib/meta-capi.ts`). Não foi mexido de propósito. |
| `1015955554886103` | Também de outro produto. Não é mais usado. |

**Eventos do pixel na página de autosserviço:**
- `PageView`;
- `Lead`, quando a prévia é gerada;
- `AddToCart`, ao clicar em ativar.

`InitiateCheckout` e `Purchase` ficam com a Cakto. O webhook da Cakto **não** manda CAPI, para
não duplicar o Purchase.

---

## 4. Banco de dados

A migração [`docs/migrations/20261117_cakto_autosservico.sql`](../migrations/20261117_cakto_autosservico.sql)
foi rodada no `studiomenu-dev` e em **produção** (2026-11-18). Ela é aditiva e pode rodar de novo
sem problema.

**Colunas novas em `orders`:**

| Coluna | Uso |
|---|---|
| `billing_provider` | `'asaas'` (padrão) ou `'cakto'`. |
| `preview_expires_at` | Preenchida enquanto é prévia (24h). Vira `NULL` ao pagar. |
| `preview_code` | Código curto (único). Vai no `sck` do checkout e continua no pedido depois de ativar. |
| `cakto_order_id`, `cakto_subscription_ref`, `cakto_plan` (`mensal`/`anual`) | Dados da compra na Cakto. |
| `paid_until` | **Decide o acesso da Cakto.** |
| `acquisition_source` | `lp_preview`, `cakto_sem_previa`, `cakto_previa_nao_encontrada`. |
| `onboarding_steps` (jsonb) | Progresso do "Primeiros passos". |

**Tabela nova `cakto_events`:** log de **todo** webhook recebido, com o payload sem o segredo.
Também registra o que o sistema fez com cada um: `processed`, `ignored`, `rejected` ou `error`.

`docs/schema.sql` já tem tudo isso.

**O que é "prévia":** `plan_tier = 'catalog'` e `preview_expires_at` preenchido. A prévia:
- não edita, porque o salvamento é recusado no servidor;
- `?edit=` é ignorado;
- `/a/` e `/e/` não resolvem;
- não tem app;
- **tem os botões de Tema (Rosé/Luxury) e Modelo (Mosaico/Clássico)** do showroom. A troca
  aparece na hora e fica guardada na prévia (`POST /api/preview/style`), mas só para o navegador
  que gerou a prévia (cookie `sm_preview`) e só enquanto ainda é prévia. Assim o menu já nasce
  ativado do jeito que ela escolheu. Menu pago não mostra esses botões.

---

## 5. Regras de negócio no código

- **Acesso Cakto** = `paid_until` + **3 dias de folga** (`CAKTO_GRACE_MS`). Não depende de
  `subscription_status`.
  - `isCaktoAccessLapsed()` em `src/lib/cakto.ts`.
  - É usado no cálculo de catálogo vencido (`catalog-service.ts`).
- **`computePaidUntil`** soma +1 mês ou +1 ano a partir do **maior** entre agora e o `paid_until`
  atual.

**O que cada evento do webhook faz:**

| Evento | Efeito |
|---|---|
| `purchase_approved`, `subscription_renewed` | Ativa ou renova. Na **primeira** ativação: aviso no Telegram e **e-mail de acesso**. |
| `subscription_canceled` | `subscription_status = 'cancelado'`, mas **mantém `paid_until`**. Ela usa até o fim do período pago. |
| `subscription_renewal_refused` | `suspenso`. O `paid_until` decide quando o menu sai do ar. |
| `refund`, `chargeback` | Corta na hora: `paid_until` vai para antes da folga, `cancelado` e aviso no Telegram. |

**Como o webhook acha o catálogo da compra:**
1. `data.sck` = `preview_code` (**confirmado com compra real**);
2. se não achar, `cakto_subscription_ref` (`data.subscription.id`);
3. se não achar, `cakto_order_id`;
4. se nada bater, **cria o catálogo pelo nome da compradora**. A venda nunca se perde, e o
   Telegram avisa para conferir.

**Proteções do webhook:**
- **Idempotência:** `dedupe_key = event:orderId:paidAt`.
- Uma aprovação atrasada de um pedido já reembolsado **não** devolve o acesso.
- **Responde 200 sempre que o segredo é válido,** porque a Cakto não reenvia evento com erro. O
  resultado real fica em `cakto_events`.

**Formato real do payload** (confirmado em 2026-11-18): `{ event, secret, data }`, onde `data`
tem:
- `id`, `paidAt`, `sck`, `amount`, `paymentMethod` (`pix`/`credit_card`);
- `product.{id, short_id, type}`;
- `customer.{name, email, phone}`;
- `subscription.{id, …}`, que vem `null` no Anual, porque ele é pagamento único.

**Limpeza diária** (`/api/cron/cleanup-previews`, 03:30 UTC, em `vercel.json`):
- apaga prévias vencidas;
- marca como `suspenso` quem é da Cakto e passou do `paid_until`.

---

## 6. Telas e arquivos principais

**Página e prévia:**
- **Página:** `src/components/self-serve/LashSelfServeEntry.tsx`, que junta os trackers com o
  pixel novo e a `SelfServeLandingPage`. É usada por `src/app/lash/page.tsx` e por
  `src/app/page.tsx` quando `nicho=lash`.
- **Prévia:** `src/app/api/preview/create/route.ts`.
  - Limite de tentativas por IP.
  - Reaproveita a prévia do próprio navegador com o mesmo nome.
  - Cookie `sm_preview` assinado (`slug.previewCode.exp.hmac`), em `src/lib/preview-session.ts`.
- **Criação do catálogo:** `src/lib/self-serve-catalog.ts`. É usada pela prévia e pelo webhook.
  - Serviços de exemplo: 4 extensões de cílios + 2 sobrancelhas (`PREVIEW_PROCEDURE_IDS`), para
    a capa mostrar as duas "cápsulas" de categoria.
  - `studio_name` nasce "Studio <nome>". Para falar com ela pelo nome, use `client_name`, nunca
    a primeira palavra do `studio_name` (esse erro já fez aparecer "Studio" na tela).
- **Prévia em tela cheia:** `PreviewRevealModal.tsx` (o "X" fica na lateral, no alto da moldura,
  para não ser cortado pela barra do navegador no Android) e `PreviewCatalogClient.tsx` (botões de
  Tema/Modelo).

**Pós-pagamento:**
- **`/ativando`:** `src/components/self-serve/ActivationScreen.tsx`.
  - Consulta `GET /api/preview/activation-status` a cada 2,5s, por até 2 minutos.
  - Quando ativa, grava `sm_pro_session` e leva para `/app/<slug>/primeiros-passos`.
- **Primeiros passos:** `src/app/app/[slug]/primeiros-passos/page.tsx` e `SelfServeChecklist.tsx`.
  - Passos: WhatsApp → menu (serviços e preços) → acesso (Google ou senha) → compartilhar.
  - Os vídeos ficam em `SELF_SERVE_STEP_VIDEOS` (`src/lib/self-serve-onboarding.ts`), **ainda
    vazios**.
- **Início do app:**
  - card "Continue de onde parou";
  - `CaktoPlanCard` com plano, vencimento, "Como cancelar" (que leva ao portal da Cakto) e botões
    para reativar quando o menu está fora do ar.

**E-mail e admin:**
- **E-mail:** `src/lib/email.ts`, com `sendEmail` (fetch no Resend, nunca lança erro) e
  `buildAccessEmail`.
  - É enviado **só na primeira ativação**.
  - Se falhar, a falha aparece no log do evento e no Telegram.
- **Admin:**
  - `/admin/catalogos` tem os filtros Clientes (padrão, sem prévias) / Cakto / Prévias /lash /
    Todos, e etiquetas de prévia e Cakto.
  - O bloco Cakto tem "+1 mês / +1 ano" (ativação manual, com 2 toques).
  - `/admin/cakto` lista os eventos com o payload.
  - A API fica em `src/app/api/admin/cakto/route.ts`. Ela **recusa** passar um catálogo pago do
    Asaas para a Cakto.

**Analytics (PostHog `trackFunnel`):**
- `preview_submit`, `preview_created`, `preview_error`;
- `preview_reveal_open`, `checkout_click`, `activate_click`;
- `activation_success`, `activation_slow`, `activation_no_session`.

---

## 7. Validação feita

- **Local, banco dev:** scripts de teste para:
  - webhook: aprovação com e sem `sck`, repetição, renovação, cancelamento, reembolso;
  - `/ativando`, admin e plano;
  - e-mail (recebido na caixa de entrada, bom no celular).
- **Produção, 2026-11-18:**
  - **Teste do webhook pelo painel da Cakto:** produto de teste ignorado e chave aceita.
  - **Compra real:** Anual no Pix com cupom de 80% (R$ 26,39) no menu `testedoni`. O `sck` chegou,
    o menu foi ativado, a `/ativando` abriu o app sozinha e o e-mail chegou.
  - **Reembolso:** `refund` foi processado e o menu saiu do ar.
  - O menu **`testedoni`** fica em produção como exemplo, fora do ar, a pedido da usuária.
- **Regressão do Asaas:** testada em cada fase, sem mudança.

---

## 8. Pendências

**Para a usuária fazer:**
1. **Token da API de Conversões da Meta na Cakto.** Fazer na máquina que tem acesso ao Gerenciador
   de Negócios.
   - No **Gerenciador de Eventos** da Meta, abra o pixel `1170978082151966` → **Configurações** →
     **API de Conversões** → **Gerar token de acesso**. Copie o token, que só aparece uma vez.
   - Na **Cakto**, abra **StudioMenu Mensal** → Configurações Avançadas → **Pixels** → pixel do
     Facebook. Cole o token no campo de **token da API de Conversões** e salve. Repita no
     **StudioMenu Anual**.
   - **Para quê:** o Purchase passa a ir também pelo servidor, não só pelo navegador. A Meta conta
     mais compras (bloqueador de anúncio, iOS) e a campanha otimiza melhor.
   - **Para conferir:** depois da próxima venda, o Gerenciador de Eventos deve mostrar o Purchase
     com a origem "Servidor" além de "Navegador".
2. **Conferir a campanha no Gerenciador.** Os anúncios de Lash apontam para
   `studiomenu.art/?nicho=lash` e já recebem a página nova. Vale confirmar que o conjunto de
   anúncios otimiza com o **pixel novo** (`1170978082151966`), não com um dos antigos.
3. **Gravar os vídeos dos "Primeiros passos"** e mandar os links (YouTube ou .mp4) para preencher
   `SELF_SERVE_STEP_VIDEOS`.

**Técnicas, quando houver dados reais:**
- Ver numa assinatura mensal real os nomes exatos de `subscription_renewed`,
  `subscription_canceled` e da renovação recusada. Os nomes no código seguem o padrão da Cakto,
  mas só a aprovação e o reembolso foram vistos de verdade. Confira em `/admin/cakto`: um evento
  "Ignorado" com nome desconhecido indica um nome diferente do esperado.
- Acompanhar o funil no PostHog: prévia → clique em ativar → ativação.
