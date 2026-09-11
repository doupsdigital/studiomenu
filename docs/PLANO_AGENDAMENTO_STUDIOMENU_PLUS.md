# Plano — Agendamento Automático + StudioMenu+ (assinatura via Asaas)

> **Documento vivo.** Esse arquivo é a fonte de verdade do progresso dessa funcionalidade. Cada tarefa concluída E testada deve ser marcada aqui (`- [x]`) ao final da fase correspondente, não só no começo. Se você está retomando esse trabalho em outra sessão/estação: basta referenciar este arquivo e pedir pra continuar de onde parou — a IA deve ler este documento inteiro antes de seguir.

**Status geral:** 🟡 Planejado, implementação ainda não iniciada (última atualização: 2026-09-11).

**Legenda:** `[ ]` pendente · `[x]` feito e testado · `[~]` feito mas testado só parcialmente / com ressalva (explicada ao lado)

---

## 1. Contexto

O StudioMenu hoje vende só o catálogo: a profissional recebe 2 links (produção + edição), e o botão "agendar" de cada procedimento manda a cliente final pro WhatsApp com mensagem pronta. Isso já está pronto, funcionando, e **não muda** com esse plano.

A evolução planejada aqui tem duas partes que precisam nascer juntas:

1. **Agendamento em tempo real**: o botão "agendar" da cliente final passa a abrir um modal com dias/horários realmente disponíveis (calculados a partir da agenda da profissional), em vez de só redirecionar pro WhatsApp.
2. **StudioMenu+**: um upsell pago (R$69 ou R$79/mês, a definir) por cima da assinatura do catálogo (R$37-39/mês), com cobrança e liberação de acesso via Asaas, self-service, dentro do próprio app.

O app (PWA) é gerado **automaticamente pra todo catálogo**, não só pra quem já assina o Plus. Continuam existindo os 2 links de hoje (produção + edição), e o painel admin passa a gerar também o link do app pra cada catálogo. Quem entrega o quê pra cada lead é uma decisão comercial do usuário, não uma trava técnica: pra uma lead que ele acha que não vai querer o Plus, entrega só os 2 links de sempre; pra uma lead com mais contexto/facilidade, entrega também o link do app, onde ela já encontra os 2 links (pra copiar/compartilhar) e um cartão do StudioMenu+ bloqueado, com opção de assinar ali mesmo — mesma lógica de upgrade que o LashAgenda usa entre os planos dele.

### Modelo de negócio (contexto de produto, não técnico)

- Catálogo: SaaS de entrada, R$37-39/mês, venda manual (o dono cria o catálogo pro cliente via admin, como já funciona hoje). Substitui a tentativa anterior de vender como produto fechado por R$97-149, que não converteu.
- StudioMenu+: upsell de R$69-79/mês pra quem já é cliente do catálogo e já confia no produto. Ativado via assinatura self-service dentro do app (Asaas), ou manualmente pelo admin como via de escape.
- Um único tier pago além do catálogo — sem a segmentação "básico vs premium com relatórios" que o LashAgenda tinha. Simplicidade é o diferencial do produto.

### Referências usadas (ambas em `docs/lashmenu-vendas-feature-lashmenu-agendamento/`)

- **LashMenu** (branch `feature-agendamento`): tinha a ideia certa de app com 3 abas (Editor/Agenda/Config) mas ficou pela metade — motor de disponibilidade (`scheduling-engine.js`) e modal de agendamento (`scheduling-modal.js`) escritos mas **nunca ligados** no catálogo real; configurações da aba Config salvas sem nenhuma lógica consumindo; sem auth real (dashboard só por `?slug=` na URL). A aba Agenda do protótipo (timeline do dia, fila de pendentes, bloqueio de horário) é a parte mais sólida — boa referência de UX.
- **LashAgenda** (`.../lashagenda-v0-main/`): produto separado, completo, com agendamento + assinatura Asaas funcionando de ponta a ponta (Vite+React+Supabase Auth+Edge Functions). Fonte principal de padrões comprovados: cálculo de slots com buffer e re-checagem de corrida, resiliência de confirmação de pagamento (webhook + polling convergindo na mesma lógica), anti-fraude no checkout (não libera plano antes de confirmar pagamento), trigger anti-escalação de privilégio. Adaptado aqui pra stack Next.js + modelo de dados bem mais simples do StudioMenu (sem contas de cliente, sem multi-tenant via Supabase Auth, sem 2 planos).

**Decisões de escopo confirmadas com o usuário antes de iniciar:**
- ✅ Asaas entra nesse mesmo plano (não fica pra depois).
- ✅ Cliente final continua sem conta — só nome + WhatsApp por agendamento, confirmação por WhatsApp, sem tela de "meus agendamentos".
- ✅ App (PWA) gerado pra todo catálogo, não só quem já paga o Plus; distribuição dos links é decisão comercial do usuário.
- ✅ Sem migração de dados do banco do LashAgenda — só a estrutura (schema) serviu de referência.

---

## 2. Decisões de arquitetura (fechadas)

- **Sem conta de cliente final** — sem Supabase Auth, sem sessão anônima. Todo acesso a disponibilidade/criação de agendamento passa por rotas de servidor (`supabaseAdmin`), nunca Supabase direto do browser — mantém a postura de segurança já estabelecida no projeto (RLS nega tudo por padrão, service_role só no servidor via `src/lib/supabase-admin.ts`).
- **Login da profissional é gerado pra todo catálogo, independente do plano.** Os 2 links de hoje (`/c/[slug]` produção + `/c/[slug]?edit=token`) continuam existindo exatamente como são, sem regressão. O link do app (`/app/[slug]`) é uma superfície nova e adicional, criada automaticamente pra todo catálogo — o mesmo `edit_token` que ela já tem vira a credencial de entrada: visita `/app/[slug]?token=...` uma vez, o servidor valida e grava um cookie de sessão assinado (HMAC), como o `src/lib/admin-session.ts` já faz. Isso resolve de quebra o item **M22 da auditoria de segurança** (token estático na URL, ver `docs/AUDITORIA_SEGURANCA_QUALIDADE_2026-09.md`) pra quem usa o app, sem tocar no fluxo antigo de quem continua só com os 2 links.
- **Um único tier pago (Plus)** — `orders.plan_tier`: `'catalog' | 'plus'`.
- **Tela inicial do app (`Início`)** mostra os 2 links de sempre (pra copiar/compartilhar) + um cartão do StudioMenu+ (desbloqueado com atalhos se já assina, ou bloqueado com CTA "assinar" se não). **A aba Agenda** fica sempre visível no menu, mas mostra a mesma tela de upsell/checkout quando `plan_tier != 'plus'` ou a assinatura não está ativa — duas portas de entrada pro mesmo fluxo de assinatura (mesmo padrão do LashAgenda: cartão de upsell na sidebar + rota bloqueada, ambos convergindo pra `/assinatura`).
- **IDs de serviço instáveis — corrigido na largada.** Hoje `/api/catalog/save` apaga e reinsere todos os `order_services` a cada salvamento do editor, então o `id` de um procedimento muda a cada save. Isso quebraria qualquer agendamento vinculado a um serviço específico. Corrigido na Fase 0: a rota passa a fazer upsert (atualiza quem já tem id, insere quem é novo, apaga só o que foi removido). Mesmo assim, cada agendamento grava uma cópia (snapshot) do título/preço/duração do serviço no momento da marcação, então renomear/apagar um serviço depois não corrompe o histórico.
- **Duração vira campo numérico** (`order_services.duration_minutes`), além do texto livre que já existe (`duration`, ex. "1h30min", só pra exibição). O texto livre continua existindo sem mudança pra não quebrar a exibição atual.
- **Sem plano trial automático no Plus** (é upsell de quem já paga o catálogo, não porta de entrada fria) — pode ser ligado depois trocando uma constante.
- **Threshold de valor pra decidir o plano no webhook — não replicado.** O LashAgenda usa "valor pago ≥ R$85 → premium" pra adivinhar qual plano foi comprado (só funciona porque lá tem 2 planos correndo pelo mesmo endpoint). Aqui só existe uma assinatura possível (Plus), então o webhook só precisa confirmar "esse `subscription_id` específico foi pago" — mais simples e sem essa fragilidade.
- **Preço do Plus como constante única** (`src/lib/pricing.ts`), não hardcoded em vários arquivos.
- **Rotas novas seguem os padrões já estabelecidos no projeto**: `checkRateLimit`/`getClientIp` (`src/lib/rate-limit.ts`), erro genérico pro cliente + `console.error` com detalhe real (mesmo padrão de `admin/catalog-actions`), `supabaseAdmin` só no servidor.

---

## 3. Modelo de dados

Todas as tabelas novas seguem a mesma postura de RLS já em uso no projeto: RLS ligado, zero policies pra `anon`, acesso só via `supabaseAdmin` no servidor.

- [ ] **`orders`** — colunas novas: `booking_enabled BOOLEAN DEFAULT false`, `plan_tier TEXT DEFAULT 'catalog' CHECK (plan_tier IN ('catalog','plus'))`, `subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('none','ativo','suspenso','cancelado'))`, `asaas_customer_id TEXT`, `asaas_subscription_id TEXT`, `billing_email TEXT`, `billing_cpf_cnpj TEXT`, `cancellation_notice_hours INTEGER DEFAULT 24`.
- [ ] **`order_services`** — colunas novas: `duration_minutes INTEGER`, `bookable BOOLEAN DEFAULT true`.
- [ ] **`business_hours`** (nova tabela) — `id, order_id FK orders ON DELETE CASCADE, weekday INTEGER CHECK (0-6), start_time TIME, end_time TIME`, único por `(order_id, weekday)`.
- [ ] **`schedule_blocks`** (nova tabela) — `id, order_id FK ON DELETE CASCADE, start_date DATE, end_date DATE, all_day BOOLEAN DEFAULT true, start_time TIME, end_time TIME, reason TEXT`.
- [ ] **`appointments`** (nova tabela) — `id, order_id FK ON DELETE CASCADE, service_id FK order_services ON DELETE SET NULL, service_title TEXT, duration_minutes INTEGER NOT NULL, price_snapshot TEXT, client_name TEXT NOT NULL, client_whatsapp TEXT NOT NULL, client_notes TEXT, starts_at TIMESTAMPTZ NOT NULL, status TEXT CHECK (status IN ('pending','confirmed','cancelled','completed','no_show')) DEFAULT 'pending', origin TEXT CHECK (origin IN ('catalog','professional')) DEFAULT 'catalog', created_at, updated_at`.
- [ ] Extensão `CREATE EXTENSION IF NOT EXISTS btree_gist;` + `EXCLUDE USING gist (order_id WITH =, tsrange(starts_at, starts_at + duration_minutes * interval '1 minute') WITH &&) WHERE (status <> 'cancelled')` na tabela `appointments` — trava de banco contra choque de horário, não só checagem de aplicação.
- [ ] RLS habilitado em `business_hours`, `schedule_blocks`, `appointments`, zero policies pra `anon`.
- [ ] `rate_limits` — sem mudança de schema, só novos usos: `book-appointment:${ip}`, `professional-login:${ip}`, `billing-checkout:${orderId}`.
- [ ] Aplicar tudo no Supabase real (não há staging separado — mesma prática já usada no projeto).
- [ ] Atualizar `docs/schema.sql` com tudo isso.

### Variáveis de ambiente novas (`.env` local + depois Vercel)

- [ ] `PROFESSIONAL_SESSION_SECRET` — HMAC do cookie de sessão do app da profissional (Fase 3).
- [ ] `ASAAS_API_KEY` — chave da API do Asaas (sandbox primeiro, produção depois).
- [ ] `ASAAS_BASE_URL` — endpoint sandbox vs. produção do Asaas.
- [ ] `ASAAS_WEBHOOK_SECRET` — segredo compartilhado pra validar o webhook (o LashAgenda não tinha essa proteção; aqui terá desde o início).

---

## 4. Fases de implementação

Cada fase termina em algo testável de verdade (curl e/ou navegador com catálogo de teste descartável, sempre limpo depois) e só avança pra próxima com confirmação explícita do usuário — mesmo ritmo usado na auditoria de segurança (`docs/AUDITORIA_SEGURANCA_QUALIDADE_2026-09.md`). Commit só acontece com aprovação explícita a cada vez, nunca em lote silencioso.

### Fase 0 — Schema + correção do save instável

- [ ] Escrever e aplicar a migração SQL (tabelas/colunas da seção 3).
- [ ] Corrigir `src/app/api/catalog/save/route.ts`: trocar delete-and-reinsert de `order_services` por upsert (update quem já tem id, insert quem é novo, delete só quem foi removido no editor).
- [ ] Adicionar `duration_minutes` ao formulário de procedimento (`src/components/catalog/VisualEditorModals.tsx` / `modals/ProcedureModal.tsx`), mantendo o campo de texto livre `duration` existente.
- [ ] Atualizar `src/types/catalog.ts` (`ProcedureItem`) e `src/lib/order-payload.ts` (`buildServicesPayload`) pra incluir `duration_minutes`/`bookable`.
- [ ] Teste: editar e salvar um catálogo de teste 3x seguidas, confirmar (via curl/SQL direto) que os ids de `order_services` não mudam entre saves.
- [ ] `npx tsc --noEmit` + `npx next build` limpos.
- [ ] Commit (aprovação explícita).

### Fase 1 — Motor de disponibilidade + API de agendamento

- [ ] `src/lib/scheduling/availability.ts` — função pura: dado `business_hours` + `schedule_blocks` + `appointments` existentes + duração do serviço + data, devolve slots livres a cada 30min, com buffer de 30min se a data for hoje (inspirado em `scheduling-engine.js` do LashMenu, reescrito como código de servidor).
- [ ] `src/lib/scheduling/appointment-payload.ts` — mesmo padrão de "fonte única de verdade" do `order-payload.ts`.
- [ ] Rota `src/app/api/scheduling/availability/route.ts` (GET, pública, rate-limited).
- [ ] Rota `src/app/api/scheduling/book/route.ts` (POST, rate-limited, revalida o slot antes de inserir, trata erro `23P01` da exclusion constraint com mensagem amigável).
- [ ] Teste via curl: disponibilidade de um catálogo de teste com horários configurados manualmente via SQL — confirmar slots corretos (dia fechado, bloqueio parcial, bloqueio total, horários já ocupados).
- [ ] Teste via curl: criar agendamento, confirmar que o slot some da disponibilidade em seguida.
- [ ] Teste de corrida: 2 requisições simultâneas pro mesmo slot — confirmar que só uma vence e a outra recebe erro tratado.
- [ ] `tsc` + `build`.
- [ ] Commit.

### Fase 2 — Modal de agendamento no catálogo (cliente final)

- [ ] Novo componente de modal reaproveitando o padrão visual dos modais existentes (`ProcedureDetailModal.tsx` como referência de estilo).
- [ ] Passo 1: seleção de dia (próximos 14 dias) + horário.
- [ ] Passo 2: nome + WhatsApp (sem conta, sem senha).
- [ ] Passo 3: confirmação com resumo + botão de avisar por WhatsApp (padrão híbrido: registro estruturado no banco + aviso informal por WhatsApp, como no LashAgenda).
- [ ] Trocar a ação dos botões "agendar" (`CTASection.tsx`, `HeaderCover.tsx`, `ProcedureCard.tsx`, `ProcedureDetailModal.tsx`) pra abrir esse modal quando `orders.booking_enabled = true`.
- [ ] Manter o comportamento atual (redirecionar pro WhatsApp) idêntico quando `booking_enabled = false` — zero regressão pros catálogos que não usam agendamento.
- [ ] Teste num catálogo de teste com `booking_enabled` ligado manualmente no banco, fluxo completo ponta a ponta no navegador.
- [ ] `tsc` + `build`.
- [ ] Commit.

### Fase 3 — Login da profissional (`/app/[slug]`)

- [ ] `src/lib/professional-session.ts` — mesmo padrão HMAC do `admin-session.ts` (cookie assinado, TTL, `timingSafeEqual`), secret novo `PROFESSIONAL_SESSION_SECRET`, cookie `sm_pro_session`.
- [ ] Rota que valida `?token=` contra `orders.edit_token` (o mesmo token de qualquer catálogo, com ou sem Plus) e grava o cookie, redirecionando pra URL limpa.
- [ ] Rate limit no endpoint de validação de token (`professional-login:${ip}`).
- [ ] Teste via curl (token válido/inválido/expirado) + navegador (persistência do cookie entre visitas).
- [ ] `tsc` + `build`.
- [ ] Commit.

### Fase 4 — Shell do app (4 seções) + PWA

- [ ] `src/app/app/[slug]/layout.tsx` — valida sessão (redireciona pra tela de "peça o link de novo" se inválida), barra de navegação inferior.
- [ ] Rota `inicio` — os 2 links de produção/edição prontos pra copiar + cartão do StudioMenu+ (desbloqueado ou bloqueado conforme `plan_tier`/`subscription_status`).
- [ ] Rota `catalogo` — reaproveita `CatalogLayout` em modo edição, sem duplicar o editor.
- [ ] Rota `agenda` — visão do dia com timeline, fila "aguardando confirmação", criar agendamento manual, trancar horário (inspirado na aba Agenda do protótipo do LashMenu). Mostra tela de upsell em vez da agenda real se o plano não for Plus ativo.
- [ ] Rota `config` — grade semanal de horários (`business_hours`), bloqueios/folgas (`schedule_blocks`), e a seção "Minha Assinatura" (preenchida na Fase 5).
- [ ] `src/app/manifest.ts` (convenção nativa do Next 16, confirmada em `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/manifest.md`).
- [ ] `public/sw.js` — service worker básico (registro manual, sem `next-pwa`, seguindo o guia oficial em `node_modules/next/dist/docs/01-app/02-guides/progressive-web-apps.md`).
- [ ] Ícones do manifest (192x192, 512x512).
- [ ] Teste no navegador com um catálogo de teste catalog-only e outro plus, conferindo os dois estados da aba Agenda e do cartão do Início.
- [ ] Teste de instalação como PWA no celular (Android e, se possível, iOS).
- [ ] `tsc` + `build`.
- [ ] Commit.

### Fase 5 — Asaas + paywall do Plus

- [ ] `src/lib/asaas.ts` — wrapper server-only (criar/achar customer, criar assinatura mensal, checar pagamento, gerar QR Pix, cancelar).
- [ ] `src/lib/pricing.ts` — constante única do preço do Plus.
- [ ] Rota `src/app/api/billing/checkout/route.ts` — não escreve `plan_tier`/`subscription_status` até confirmação real de pagamento (mesma prevenção antifraude do LashAgenda).
- [ ] Rota `src/app/api/billing/webhook/route.ts` — validada por `ASAAS_WEBHOOK_SECRET`; ao confirmar pagamento, seta `subscription_status='ativo'` e `plan_tier='plus'`.
- [ ] Rota `src/app/api/billing/check-payment/route.ts` — polling de fallback (mesma lógica do webhook, resiliência dupla como no LashAgenda).
- [ ] Rota `src/app/api/billing/cancel/route.ts`.
- [ ] Tela "Minha Assinatura" na aba Config — coleta email+CPF/CNPJ uma vez, mostra Pix/cartão, status atual, botão de cancelar.
- [ ] Paywall na aba Agenda (bloqueada até `subscription_status='ativo'`) e cartão no Início, ambos levando pra essa tela.
- [ ] Teste com a sandbox do Asaas — **pedir a chave de sandbox ao usuário nesse ponto, não antes**.
- [ ] `tsc` + `build`.
- [ ] Commit.

### Fase 6 — Integração no admin

- [ ] `admin/catalogos/page.tsx` — cada catálogo passa a ter os 3 links pra copiar (produção, edição, app).
- [ ] Badge mostrando `plan_tier`/`subscription_status` por catálogo.
- [ ] Toggle manual de `booking_enabled` como via de escape (ativar agendamento sem depender do Asaas, ex. teste com uma cliente específica).
- [ ] `tsc` + `build`.
- [ ] Commit.

### Fase 7 — Notificações

- [ ] Aviso por WhatsApp (link `wa.me`, mesmo padrão de `CTASection.tsx`) pra profissional quando um agendamento é criado.
- [ ] Aviso por WhatsApp pra cliente quando confirmado/recusado.
- [ ] Extensão do `notify-telegram` existente pra avisar o dono do produto de novas assinaturas Plus.
- [ ] Push web (VAPID) — melhoria opcional, não bloqueia as fases anteriores.
- [ ] `tsc` + `build`.
- [ ] Commit.

---

## 5. Verificação (vale pra todas as fases)

- `npx tsc --noEmit` + `npx next build` antes de qualquer commit.
- Teste funcional real por fase (curl local/produção + navegador quando envolver UI), sempre com catálogo de teste descartável, limpo depois.
- Fase 5 precisa da chave de sandbox do Asaas — pedida só quando chegar nessa fase.
- Nenhuma mudança nas Fases 0-4 pode afetar o fluxo antigo de 2 links (`/c/[slug]?edit=token`), que precisa continuar funcionando igual mesmo depois do app existir — checar regressão explicitamente em cada fase que toca arquivo compartilhado (`CatalogLayout.tsx`, `/api/catalog/save`).

---

## 6. Como retomar este trabalho em outra sessão

1. Leia este arquivo inteiro antes de qualquer coisa.
2. Confira o "Status geral" no topo e quais checkboxes já estão marcados — isso diz exatamente onde parou.
3. Se a fase atual estiver parcialmente marcada (`[~]`), leia a ressalva antes de continuar.
4. Continue a partir da primeira tarefa não marcada, seguindo a mesma disciplina de teste + confirmação + commit por etapa descrita na seção 4.
5. Ao concluir e testar algo, marque aqui (`[x]`) antes de seguir — não deixe pra atualizar depois.
