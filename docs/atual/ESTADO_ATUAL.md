# Estado Atual do Projeto — StudioMenu (`studiomenu.art`)

> **Leitura obrigatória pra qualquer chat/agente novo que for trabalhar neste repositório.**
> Este documento é a fonte da verdade sobre o que o StudioMenu **é hoje**. Tudo em
> `docs/historico/` é registro de como chegamos até aqui — útil pra investigar uma decisão
> antiga, mas **não** é instrução válida sobre o estado atual sem cruzar com o código.
>
> Atualizado em: 2026-09-22.

---

## 1. O produto

StudioMenu é um SaaS de catálogo digital para profissionais de beleza (lash designer, nail
designer, estética, studios multi-serviço), com agendamento automático opcional. Nasceu como
"LashMenu" (site estático, só lash designers) e migrou pra Next.js virando StudioMenu — todo
código do LashMenu estático vive isolado em `legacy/` (não é lido pelo app) e a documentação
dessa fase antiga está em `docs/historico/`.

Dois planos pagos (cobrança recorrente via Asaas), mais um catálogo estático gratuito de base:

| Plano | Preço | O que dá |
|---|---|---|
| **Catálogo** (gratuito) | — | Catálogo público, sem agendamento automático — cliente final fala com a profissional pelo WhatsApp. |
| **StudioMenu Básico** | R$ 39/mês | Igual ao gratuito hoje em termos de agendamento (WhatsApp), mas assinado — é o "degrau" pro Plus. |
| **StudioMenu+** | R$ 69,90/mês | Agendamento automático de verdade: wizard de horário no catálogo público + Agenda/Horários/Bloqueios liberados no app da profissional. |

Preços/labels centralizados em [`src/lib/pricing.ts`](../../src/lib/pricing.ts) — nunca
hardcoded em outro lugar.

A tela de primeiro contato (antes de assinar) pode vender o Plus em destaque ou o Básico em
destaque, configurável por catálogo (`orders.first_offer_tier`) — ver `docs/historico/FASE22_OFERTA_PLUS_DIRETA.md`.

A profissional Plus pode pausar o agendamento automático temporariamente sem perder acesso à
própria Agenda/Config (`orders.agenda_paused`, diferente de `booking_enabled`) — ver
`docs/historico/FASE23_PAUSAR_AGENDA.md`.

---

## 2. Stack técnica

- **Next.js 16** (App Router, TypeScript, React 19) — hospedado na **Vercel**.
- **Supabase** (Postgres via `supabaseAdmin`, service-role — nunca a chave anônima em
  escrita; RLS sem policies abertas). Storage: bucket `catalog-assets`.
- **Asaas** — cobrança recorrente (Pix e cartão de crédito), webhook em
  `src/app/api/billing/webhook/route.ts`.
- Domínio de produção: `studiomenu.art`, roteamento por subdomínio (`cliente.studiomenu.art`
  → `/c/cliente`) via `src/middleware.ts`.
- PWA: app da profissional (`/app/[slug]`) é instalável, com push notifications (Web Push API)
  pra novo agendamento.

---

## 3. Estrutura de pastas (código ativo)

```
studiomenu/
├── src/
│   ├── app/
│   │   ├── page.tsx, vendas/            — landing/vendas de marketing
│   │   ├── form/                        — onboarding (cliente nova cria o catálogo dela)
│   │   ├── c/[slug]/                    — catálogo público (SSR) + editor visual in-place
│   │   ├── entrar/                      — login real da profissional (Supabase Auth)
│   │   ├── app/[slug]/                  — APP DA PROFISSIONAL (PWA):
│   │   │   ├── inicio/                  — checklist de onboarding, avisos de cobrança
│   │   │   ├── agenda/                  — visão Dia (timeline) e Mês
│   │   │   ├── config/                  — horários, bloqueios, pausar agenda, assinatura, conta, notificações
│   │   │   └── catalogo/                — atalho pro editor do catálogo dela
│   │   ├── admin/                       — painel interno (senha), gestão de catálogos, criar-com-IA, showroom, CRM de prospecção
│   │   └── api/                         — rotas de API (catálogo, agendamento, billing/Asaas, push, admin)
│   ├── components/                      — organizados por área: catalog/, agenda/, config/, app-shell/, billing/, admin/, auth/, push/, tour/, onboarding/, sales/
│   ├── lib/                             — camada de serviço: supabase-admin, catalog-service, professional-app-service, asaas, billing-service, pricing, scheduling/, push-notifications, image-optimize, etc.
│   └── types/                           — tipos TypeScript compartilhados (`catalog.ts`, etc.)
├── public/                              — estáticos (ícones do PWA, modelos de imagem, `sw.js`)
├── docs/
│   ├── atual/                           — ESTE documento + o que for permanentemente atual
│   ├── historico/                       — registro por Fase (rastreabilidade — não é instrução)
│   ├── estrategia/, marketing/          — visão de negócio e planos comerciais (não técnicos)
│   └── schema.sql                       — schema atual do banco (fonte de verdade da estrutura de dados)
├── referencias-externas/                — projetos de terceiros usados só como referência de design/UX (ex: LashAgenda) — não fazem parte do StudioMenu, nunca são importados pelo app
├── legacy/                               — site estático LashMenu pré-Next.js — arquivo histórico, não é lido pelo app em nenhuma hipótese, não editar
├── scripts/                              — `check-integrity.js` (roda no pre-commit), scripts de automação de marketing
└── middleware.ts                         — roteamento por subdomínio
```

**Áreas críticas** (mudanças afetam catálogos/assinaturas reais — sempre testar antes de
promover pra `main`): `src/lib/catalog-service.ts`, `src/lib/professional-app-service.ts`,
`src/lib/asaas.ts`, `src/lib/billing-service.ts`, `src/components/catalog/`,
`src/app/api/billing/`, `src/app/api/scheduling/`.

---

## 4. Fluxos principais

**Catálogo público** — `middleware.ts` reescreve subdomínio → `src/app/c/[slug]/page.tsx` →
`catalog-service.ts` busca o pedido no Supabase (`orders` + `order_services`) → `CatalogLayout`
monta a página. Se `booking_enabled && !agenda_paused`, o botão de agendar abre o wizard de
horário real em vez de ir direto pro WhatsApp.

**Agendamento automático** — motor de disponibilidade em `src/lib/scheduling/`, API em
`src/app/api/scheduling/` (availability, book). Confirma, envia push pra profissional, bloqueia
o horário.

**App da profissional** (`/app/[slug]`) — autenticação via link mágico (HMAC) ou login real
(Supabase Auth, criado depois via "Minha conta"). Dados vêm de
`professional-app-service.ts` (`ProfessionalOrderSummary`) — inclui plano, status de assinatura,
`booking_enabled`, `agenda_paused`, `first_offer_tier`.

**Cobrança** — Asaas cria assinatura Pix ou cartão; `check-payment`/webhook ativam
`plan_tier`/`subscription_status` só depois de confirmação real (nunca no momento do checkout).
Upgrade Básico→Plus usa `PUT` na assinatura existente (não cria cobrança nova, só muda o valor a
partir do próximo ciclo).

**Criação de catálogo** — pela profissional (`/form`, onboarding) ou pelo admin
(`/admin/criar-com-ia`, extração por IA de foto+lista de preços).

---

## 5. Workflow de Git e deploy

- **`main`** — produção (`studiomenu.art`, chaves reais do Asaas). Protegida por ruleset no
  GitHub: **nenhum push direto é aceito**, nem de admin — toda mudança entra por Pull Request
  vindo de `desenv`.
- **`desenv`** — branch de trabalho, o padrão pra qualquer tarefa nova (não precisa pedir pra
  "mudar de branch" — é sempre aqui, a não ser que a usuária diga o contrário). Deploy automático
  na Vercel como Preview, com chaves **sandbox** do Asaas.
- Banco de dados de desenvolvimento (Supabase separado do de produção) — **ainda não existe,
  é o próximo passo** (ver pendências abaixo). Até lá, testes de banco rodam no Supabase de
  produção, só em catálogos de teste (sempre resetados depois).

**Ciclo de uma mudança, do começo ao fim:**
1. Trabalha e testa (`tsc`/`check-integrity.js`) na `desenv`, push.
2. Passa o link de Preview da `desenv` pra usuária testar (inclusive no celular).
3. Só depois da aprovação explícita dela, abre PR `desenv → main` e mescla.
4. Vira produção de verdade em `studiomenu.art` a partir daí.

**O link de Preview é sempre este** (muda só se a branch `desenv` for renomeada de novo):
`https://studiomenu-git-desenv-doupsdigital-s-projects.vercel.app` — formato padrão da Vercel
pra qualquer branch sem domínio próprio (`<projeto>-git-<branch>-<conta>.vercel.app`), diferente
de `studiomenu.art`, que é o domínio customizado plugado especificamente na Produção. Pode pedir
login da Vercel na primeira vez (Vercel Authentication ativa nesse ambiente, de propósito).

**Ressalva importante:** `docs/historico/` existe só na `desenv`, nunca na `main` (decisão
deliberada de limpeza). Por isso, promover uma mudança pra `main` **não é um merge automático de
tudo** — é preciso levar só o que é código/produto (e `docs/atual/`, se tiver mudado), deixando
`docs/historico/` de fora. Na prática isso não pesa porque commits de código (`feat:`/`fix:`) já
ficam separados de commits de documentação (`docs:`) por hábito.

---

## 6. Pendências reais conhecidas (não resolvidas, não são só ideia)

**Do lado do produto/negócio (ação da usuária, não é código):**
1. Reativar a Vercel Authentication do ambiente de Preview (foi desligada pra facilitar testes).
2. Remover o webhook antigo `studiomenu` (penalizado) no Asaas — manter só `studiomenu2`.
3. Conferir as notificações do Asaas (e-mail/antecedência de cobrança do Pix).
4. Definir regras de cancelamento/reembolso (inclui direito de arrependimento de 7 dias), nota
   fiscal e taxas na margem.
5. Ao abrir CNPJ: converter a conta Asaas, testar com valor baixo, só então reavaliar Pix Automático.
6. Construir o banco de dados de desenvolvimento no Supabase (planejado, ainda não feito).

**Testado com dinheiro real:** Pix Básico, upgrade pro Plus, webhook, cancelamento pelo painel
Asaas → agenda bloqueada.
**Em produção mas ainda não provado com dinheiro real:** pagamento por cartão, renovação mensal
(Pix e cartão), estado "venceu" (mensalidade atrasada), recusa de cartão na renovação.

**Limitações de arquitetura aceitas (não são bugs a corrigir agora):**
- `edit_token` do catálogo trafega em texto puro na URL, sem expiração (risco aceito).
- Trocar forma de pagamento (Pix↔cartão) depois de já ser assinante ativa não está implementado.
- Upload de imagem é bufferizado inteiro antes de checar o tamanho (`M10` da auditoria de
  set/2026 — ver `docs/historico/AUDITORIA_SEGURANCA_QUALIDADE_2026-09.md`).

---

## 7. Onde procurar mais detalhes

- **Como uma feature específica foi construída, testada e quais bugs apareceram no caminho:**
  `docs/historico/` — cada Fase tem seu próprio documento (ex: `FASE21_...md`, `FASE22_...md`,
  `FASE23_...md`) ou está registrada no handoff geral (`HANDOFF_2026-09-18_FASE19-20.md`).
- **Schema do banco:** `docs/schema.sql` (sempre a versão atual; migrações individuais ficam em
  `docs/historico/migrations/` só como log).
- **Visão de negócio, posicionamento, nichos:** `docs/estrategia/VISAO_E_ROADMAP_STUDIOMENU.md`.
- **Marketing/tráfego pago:** `docs/marketing/`.

**Regra pra qualquer chat/agente:** nunca tratar um documento de `docs/historico/` como
descrição do estado atual sem verificar contra o código real — várias decisões registradas lá
foram revertidas ou evoluídas depois. Em caso de dúvida, o código manda, não o documento.
