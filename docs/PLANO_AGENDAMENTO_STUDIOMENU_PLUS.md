# Plano — Agendamento Automático + StudioMenu+ (assinatura via Asaas)

> **Documento vivo.** Esse arquivo é a fonte de verdade do progresso dessa funcionalidade. Cada tarefa concluída E testada deve ser marcada aqui (`- [x]`) ao final da fase correspondente, não só no começo. Se você está retomando esse trabalho em outra sessão/estação: basta referenciar este arquivo e pedir pra continuar de onde parou — a IA deve ler este documento inteiro antes de seguir.

**Status geral:** 🟢 Todas as fases do plano original (0-7) implementadas e testadas. Fase 7 aguardando aprovação pra commit. Duas pendências registradas: teste de ponta a ponta contra a API real do Asaas (falta a chave de sandbox do usuário, Fase 5) e push web/VAPID (adiado por decisão do usuário, Fase 7) (última atualização: 2026-09-13).

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

- [x] **`orders`** — colunas novas: `booking_enabled BOOLEAN DEFAULT false`, `plan_tier TEXT DEFAULT 'catalog' CHECK (plan_tier IN ('catalog','plus'))`, `subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('none','ativo','suspenso','cancelado'))`, `asaas_customer_id TEXT`, `asaas_subscription_id TEXT`, `billing_email TEXT`, `billing_cpf_cnpj TEXT`, `cancellation_notice_hours INTEGER DEFAULT 24`.
- [x] **`order_services`** — colunas novas: `duration_minutes INTEGER`, `bookable BOOLEAN DEFAULT true`.
- [x] **`business_hours`** (nova tabela) — `id, order_id FK orders ON DELETE CASCADE, weekday INTEGER CHECK (0-6), start_time TIME, end_time TIME`, único por `(order_id, weekday)`.
- [x] **`schedule_blocks`** (nova tabela) — `id, order_id FK ON DELETE CASCADE, start_date DATE, end_date DATE, all_day BOOLEAN DEFAULT true, start_time TIME, end_time TIME, reason TEXT`.
- [x] **`appointments`** (nova tabela) — `id, order_id FK ON DELETE CASCADE, service_id FK order_services ON DELETE SET NULL, service_title TEXT, duration_minutes INTEGER NOT NULL, price_snapshot TEXT, client_name TEXT NOT NULL, client_whatsapp TEXT NOT NULL, client_notes TEXT, starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL, status TEXT CHECK (status IN ('pending','confirmed','cancelled','completed','no_show')) DEFAULT 'pending', origin TEXT CHECK (origin IN ('catalog','professional')) DEFAULT 'catalog', created_at, updated_at`. **Ajuste feito durante a aplicação**: `ends_at` virou uma coluna normal (calculada pela aplicação no insert), não uma expressão dentro do índice — `timestamptz + interval` não é `IMMUTABLE` no Postgres, então não pode aparecer na expressão de uma exclusion constraint. A Fase 1 (rota de booking) precisa gravar `ends_at = starts_at + duration_minutes` explicitamente.
- [x] Extensão `CREATE EXTENSION IF NOT EXISTS btree_gist;` + `EXCLUDE USING gist (order_id WITH =, tstzrange(starts_at, ends_at) WITH &&) WHERE (status <> 'cancelled')` na tabela `appointments` — trava de banco contra choque de horário, não só checagem de aplicação. (Nota: `tstzrange`, não `tsrange` — `starts_at`/`ends_at` são `TIMESTAMPTZ`.)
- [x] RLS habilitado em `business_hours`, `schedule_blocks`, `appointments`, zero policies pra `anon`.
- [ ] `rate_limits` — sem mudança de schema, só novos usos: `book-appointment:${ip}`, `professional-login:${ip}`, `billing-checkout:${orderId}` (usos específicos ficam pras fases que criam essas rotas).
- [x] Aplicar tudo no Supabase real — rodado em `docs/migrations/2026-09-11_fase0_agendamento.sql`, verificado via REST API (colunas/tabelas novas respondendo corretamente).
- [x] Atualizar `docs/schema.sql` com tudo isso.

### Variáveis de ambiente novas (`.env` local + depois Vercel)

- [x] `PROFESSIONAL_SESSION_SECRET` — HMAC do cookie de sessão do app da profissional (Fase 3). Gerado localmente no `.env`; falta gerar um valor de produção separado quando for pra Vercel.
- [ ] `ASAAS_API_KEY` — **ainda vazia**, pendente da chave de sandbox do usuário.
- [x] `ASAAS_BASE_URL` — setada no `.env` local pra sandbox (`https://api-sandbox.asaas.com/v3`).
- [x] `ASAAS_WEBHOOK_SECRET` — gerado localmente no `.env` (o LashAgenda não tinha essa proteção implementada de verdade, apesar de documentada; aqui já está implementada e testada desde o início).

---

## 4. Fases de implementação

Cada fase termina em algo testável de verdade (curl e/ou navegador com catálogo de teste descartável, sempre limpo depois) e só avança pra próxima com confirmação explícita do usuário — mesmo ritmo usado na auditoria de segurança (`docs/AUDITORIA_SEGURANCA_QUALIDADE_2026-09.md`). Commit só acontece com aprovação explícita a cada vez, nunca em lote silencioso.

### Fase 0 — Schema + correção do save instável ✅ CONCLUÍDA (2026-09-11)

- [x] Escrever e aplicar a migração SQL (tabelas/colunas da seção 3) — `docs/migrations/2026-09-11_fase0_agendamento.sql` (rodado manualmente pelo usuário no SQL Editor do Supabase, já que não há credencial de conexão direta ao Postgres neste projeto, só a service_role key via REST).
- [x] Corrigir `src/app/api/catalog/save/route.ts`: trocar delete-and-reinsert de `order_services` por upsert (update quem já tem id, insert quem é novo, delete só quem foi removido no editor). Removido de quebra o fallback de "esquema legado" (nomes de coluna `desc`/`preco`/`duracao`/`img`) que não fazia mais sentido com o schema V2 atual.
- [x] Adicionar `duration_minutes` ao formulário de procedimento (`src/components/catalog/modals/ProcedureModal.tsx`), mantendo o campo de texto livre `duration` existente. Campo `bookable` só no schema/tipos por enquanto (default `true`), sem UI ainda — não há o que configurar até o agendamento estar ativo de verdade.
- [x] Atualizar `src/types/catalog.ts` (`ProcedureItem`) e `src/lib/order-payload.ts` (`buildServicesPayload`, mais a nova `isValidServiceId`) pra incluir `duration_minutes`/`bookable` e a lógica de upsert.
- [x] Teste: editar e salvar um catálogo de teste 3x seguidas (curl direto na rota local) — confirmado que ids de itens mantidos ficam estáveis, itens novos recebem id novo, itens removidos são apagados e só eles. Catálogo de teste limpo depois (`DELETE` em `orders`, cascade cuidou de `order_services`).
- [x] `npx tsc --noEmit` + `npx next build` limpos.
- [x] Ajuste extra descoberto durante o teste: `tsconfig.json` e `scripts/check-integrity.js` precisaram excluir `docs/lashmenu-vendas-feature-lashmenu-agendamento/` (pasta de referência colada no repo), que não é parte do app e travava o `tsc`/hook de commit.
- [x] Commit — `8e49fc1`.

### Fase 1 — Motor de disponibilidade + API de agendamento ✅ CONCLUÍDA (2026-09-11)

- [x] `src/lib/scheduling/availability.ts` — função pura: dado `business_hours` + `schedule_blocks` + `appointments` existentes + duração do serviço + data, devolve slots livres a cada 30min, com buffer de 30min se a data for hoje. Fuso horário fixo em `America/Sao_Paulo` (decisão documentada no próprio arquivo — simplificação deliberada pro v1, público 100% BR).
- [x] `src/lib/scheduling/appointment-payload.ts` — mesmo padrão de "fonte única de verdade" do `order-payload.ts`, já calcula `ends_at` a partir de `starts_at`+`duration_minutes` (necessário por causa do ajuste de schema da Fase 0).
- [x] Rota `src/app/api/scheduling/availability/route.ts` (GET, pública, rate-limited `scheduling-availability:${ip}`).
- [x] Rota `src/app/api/scheduling/book/route.ts` (POST, rate-limited `scheduling-book:${ip}`, revalida o slot antes de inserir, trata erro `23P01` da exclusion constraint com mensagem amigável).
- [x] Teste via curl num catálogo descartável (`booking_enabled=true`, grade sexta 09-18 / sábado 09-13, serviço de 60min): disponibilidade correta (7 slots sexta, 7 sábado), domingo sem grade retorna vazio.
- [x] Teste via curl: agendamento das 09h criado, slot some da disponibilidade em seguida (09:00 e 09:30 somem, já que 09:30+60min invade o horário ocupado).
- [x] Teste de conflito: reservar o mesmo horário de novo devolve 409 pela revalidação da aplicação; insert direto via REST sobrepondo o horário (bypassando a aplicação) é rejeitado pela exclusion constraint do banco (`23P01`) — as duas camadas de proteção confirmadas.
- [x] Teste de bloqueio de dia inteiro: disponibilidade fica vazia no dia bloqueado.
- [x] Teste do buffer de hoje: com o horário local em 15:19, o primeiro slot livre veio corretamente às 16:00 (15:30 ficou de fora por cair dentro do buffer de 30min).
- [x] Catálogo de teste limpo depois (cascade removeu `order_services`/`business_hours`/`schedule_blocks`/`appointments` junto).
- [x] `tsc` + `build` limpos, rotas novas aparecem no build.
- [x] Commit — `3ed15f4`.

### Fase 2 — Modal de agendamento no catálogo (cliente final) ✅ CONCLUÍDA (2026-09-13)

- [x] Novo componente `src/components/catalog/modals/BookingModal.tsx`, reaproveitando o esqueleto visual de `ProcedureDetailModal.tsx` (classes `.modal-detalhe*`/`.modal__*` do `catalog-theme.css`) + `src/styles/scheduling-wizard.css` novo (variáveis de tema próprias, rose em `:root` e luxury em `[data-theme="luxury"]`, seguindo o precedente de `visual-editor.css` de CSS separado por feature).
- [x] Passo 1: seleção de dia (próximos 14 dias, chips) + grade de horários (`GET /api/scheduling/availability`).
- [x] Passo 2: nome + WhatsApp (sem conta, sem senha), com máscara de telefone.
- [x] Passo 3: confirmação com resumo (serviço, dia/hora, preço) + botão de avisar por WhatsApp (padrão híbrido: `POST /api/scheduling/book` registra o agendamento no banco antes desse passo; o WhatsApp é só o aviso informal em cima do registro já estruturado).
- [x] **Ajuste de escopo decidido com o usuário durante o design** (documentado no plano de implementação da sessão): o wizard segue os 3 passos exatos, sem passo de "escolher serviço" — por isso só é plugado em `ProcedureDetailModal.tsx` (que já tem o item/serviço específico no contexto). `CTASection.tsx` (botão genérico "Agendar pelo WhatsApp", sem serviço associado) e `HeaderCover.tsx` (botão flutuante de suporte/dúvida, não é uma ação de agendar) **não foram alterados** — continuam sempre indo pro WhatsApp, independente de `booking_enabled`. `ProcedureCard.tsx` também não foi tocado: seu fallback `wa.me` interno já era código morto (o `onSelect` sempre é passado por `ProcedureGrid`), então o ponto real de entrada continua sendo o CTA "Agendar" dentro do modal de detalhe. Fica pra um incremento futuro adicionar um passo de escolha de serviço, se um dia quiserem plugar o CTASection também.
- [x] Corrigido de quebra um gap de dados encontrado durante o levantamento (não estava listado originalmente nesta fase): `src/lib/catalog-service.ts` fazia `select('*')` em `orders`/`order_services` mas não repassava `booking_enabled`, `duration_minutes` nem `bookable` pro componente client. Adicionado o mapeamento desses três campos + `booking_enabled?: boolean` em `CatalogOrderData` (`src/types/catalog.ts`).
- [x] `ProcedureDetailModal.tsx`: CTA principal vira `<button>` que abre o wizard quando `bookingEnabled && item.bookable !== false && duration_minutes > 0`; nos demais casos (booking desligado, serviço não-bookable, ou sem duração configurada) continua sendo o link `<a>` direto pro WhatsApp, idêntico ao comportamento anterior.
- [x] `ProcedureGrid.tsx`/`CatalogLayout.tsx`: novo estado `bookingItem` em `CatalogLayout` (independente do `activeModal` do editor, que é exclusivo de `isEditMode`), repassado como `onRequestBooking` só quando `!isEditMode && booking_enabled` — em modo edição ou catálogo sem agendamento, a prop nem existe, então o comportamento antigo fica intocado por construção.
- [x] Teste ponta a ponta num catálogo de teste descartável (`fase2-teste-booking`, criado/limpo via Supabase REST com service role key): navegador headless (Playwright, instalado só no scratchpad da sessão) — fluxo completo (dia → horário → nome/whats → confirmação → link de WhatsApp correto), nos dois temas (rose e luxury). Regressão confirmada: serviço com `bookable=false` manteve o CTA como link direto pro WhatsApp (não abriu o wizard). Teste de conflito via curl: reservar o mesmo horário duas vezes devolve `200` na 1ª e `409` na 2ª ("Esse horário não está mais disponível"). Página com `?edit=token` carrega normalmente (200) — wizard não tem como abrir em modo edição por construção. Zero erros no console do navegador. Catálogo de teste removido depois (cascade cuidou do resto).
- [x] `npx tsc --noEmit` + `npx next build` limpos (30 rotas geradas, incluindo `/c/[slug]` e as duas rotas de scheduling).
- [x] Commit — `f30ebd1`.

### Fase 3 — Login da profissional (`/app/[slug]`) ✅ CONCLUÍDA (2026-09-13)

- [x] `src/lib/professional-session.ts` — mesmo padrão HMAC do `admin-session.ts` (cookie assinado, TTL de 90 dias, `timingSafeEqual`), secret novo `PROFESSIONAL_SESSION_SECRET`, cookie `sm_pro_session`. **Diferença deliberada em relação ao admin**: como o recurso aqui é por catálogo (não único/global), a assinatura cobre `slug + expiresAt`, não só `expiresAt` — o cookie vira `${slug}.${expiresAt}.${assinatura}` e a validação exige o `slug` esperado como parâmetro. Sem isso, um cookie válido de um catálogo poderia ser reaproveitado manualmente (requisição forjada, não pelo navegador) pra autenticar em `/app/[outro-slug]`. O cookie também é gravado com `path: /app/${slug}`, então navegadores reais nem chegam a enviá-lo entre catálogos diferentes — a amarração no payload é a segunda camada, contra requisições forjadas.
- [x] `src/app/api/professional/login/route.ts` (GET `?slug=&token=`) — valida o `edit_token` do catálogo via `timingSafeEqual` (era `===` simples em `/c/[slug]/page.tsx`; mesmo padrão que `checkAdminPassword` já usa), grava o cookie e redireciona pra `/app/[slug]` (a página em si só existe na Fase 4 — por ora dá 404 depois do redirect, esperado). Slug inexistente e token errado devolvem a mesma resposta genérica (401, "Link inválido ou expirado.") pra não vazar se o catálogo existe.
- [x] Rate limit `professional-login:${ip}` (10 tentativas / 15 min, mesmo limite do `admin-login`).
- [x] `PROFESSIONAL_SESSION_SECRET` gerado e adicionado ao `.env` local.
- [x] Teste via curl num catálogo de teste descartável (`fase3-teste-login`): token correto → `307` + `Set-Cookie` (`Path=/app/<slug>`, `HttpOnly`, `SameSite=lax`, `Max-Age=90 dias`) + `Location` correto; token errado e slug inexistente → `401` com corpo idêntico; faltando `slug`/`token` → `400`; mais de 10 tentativas → `429`. Assinatura do cookie gerado pela rota real conferida byte a byte contra o HMAC esperado.
- [x] Teste direto da função pura `isValidProfessionalSession` (script isolado, mesma lógica do arquivo real): cookie válido → `true`; expirado → `false`; assinado pra outro slug e validado contra este → `false` (confirma a amarração slug↔cookie); assinatura adulterada → `false`; cookie ausente → `false`.
- [x] Catálogo de teste removido depois.
- [x] `npx tsc --noEmit` + `npx next build` limpos (`/api/professional/login` aparece nas rotas geradas).
- [x] Commit — `24aed90`.

### Fase 4 — Shell do app (4 seções) + PWA

**Dividida em sub-etapas com o usuário, por ser a fase maior do plano.**

#### Fase 4a — Layout autenticado + navegação + PWA + abas Início/Catálogo ✅ CONCLUÍDA (2026-09-13)

- [x] `src/app/app/[slug]/layout.tsx` — valida sessão via `isProfessionalRequestAuthorized(slug)` (Fase 3); sem sessão válida, mostra tela "Link inválido ou expirado — peça um novo link de acesso". Com sessão, monta `<ServiceWorkerRegister />` + filhos + `<BottomNav>`.
- [x] `src/components/app-shell/BottomNav.tsx` — navegação inferior fixa (Início/Catálogo/Agenda/Config, `lucide-react`, aba ativa via `usePathname`). **Ajuste encontrado durante o teste**: a aba Catálogo reaproveita `CatalogLayout` em modo edição, que já tem sua própria barra flutuante fixa na base (`#lm-editor-bottom-bar`) — as duas barras fixas colidiam visualmente, então `BottomNav` fica escondida especificamente na rota `catalogo`, e essa página ganhou um botão simples de voltar (topo esquerdo) como única forma de navegação enquanto o editor está aberto.
- [x] `src/lib/professional-app-service.ts` (novo) — `getOrderForProfessionalApp(slug)`, recorte de `orders` com `edit_token`, `plan_tier`, `subscription_status` pro app (diferente do shape público de `getCatalogBySlug`).
- [x] Rota `inicio` — os 2 links de produção/edição com botão de copiar (`src/components/app-shell/CopyLinkRow.tsx`) + cartão do StudioMenu+ (`src/components/app-shell/PlusUpsellCard.tsx`, desbloqueado com atalho pra Agenda se `plan_tier==='plus' && subscription_status==='ativo'`, bloqueado com CTA "Assinar (em breve)" senão — checkout de verdade é Fase 5).
- [x] Rota `catalogo` — reaproveita `CatalogLayout` em modo edição, buscando `edit_token` no servidor (`getCatalogBySlug`, já traz o campo) em vez de vir da URL como em `/c/[slug]?edit=`; confirmado que `/api/catalog/save` só valida o token do **body**, então nenhuma mudança foi necessária na rota de save nem no `CatalogLayout`.
- [x] Rota `agenda` (placeholder por enquanto) — mostra `PlusUpsellCard` (tela cheia) se não for Plus ativo; se for, "Agenda chega na próxima etapa" — o conteúdo real (timeline do dia, fila de pendentes, agendamento manual, bloqueio de horário) é a Fase 4b.
- [x] Rota `config` (placeholder por enquanto) — "Configurações chegam na próxima etapa"; grade de `business_hours`/`schedule_blocks` é a Fase 4c.
- [x] `src/app/manifest.ts` (convenção nativa do Next 16, confirmada em `node_modules/next/dist/docs/.../manifest.md` — arquivo único na raiz de `app`, sem suporte a manifest por rota).
- [x] `public/sw.js` — service worker básico (`install`/`activate`/`fetch` passthrough, sem cache offline — o guia oficial do Next 16 não cobre isso nesta versão, só cita a lib de terceiros Serwist, fora do escopo de "básico"). Registrado só dentro do layout de `/app/[slug]` (`ServiceWorkerRegister.tsx`), então só essas páginas ficam de fato instaláveis. Headers dedicados (`Content-Type`, `Cache-Control`, CSP) adicionados em `next.config.ts`.
- [x] Ícones do manifest (192x192, 512x512) — gerados como placeholder (monograma "SM" na cor rose do tema); fácil de trocar quando houver uma marca definitiva.
- [x] Teste com dois catálogos de teste descartáveis (`fase4-teste-catalog` e `fase4-teste-plus`, via Supabase REST): navegador headless (Playwright) — login via `/api/professional/login`, depois as 4 abas em cada catálogo. Confirmado: Início mostra o cartão certo em cada caso (bloqueado vs. "ativo"); Catálogo abre o editor de verdade sem a barra de navegação (evitando a colisão); Agenda mostra upsell no catálogo `catalog` e o placeholder no `plus`; Config mostra o placeholder nos dois. Sem sessão, cai na tela de link inválido. Zero erros de console/página.
- [x] `manifest.webmanifest` e `sw.js` testados via curl — JSON correto e headers de cache/CSP corretos.
- [x] Regressão: `/c/[slug]` com e sem `?edit=` continua respondendo `200` normalmente.
- [x] Catálogos de teste removidos depois.
- [x] `npx tsc --noEmit` + `npx next build` limpos (32 rotas, incluindo as 5 novas de `/app/[slug]` e `/manifest.webmanifest`).
- [x] Commit — `eb85f29`.
- [ ] Teste de instalação como PWA de verdade num celular (Android e, se possível, iOS) — não verificável em navegador headless; fica pendente de teste manual do usuário.

#### Fase 4b — Aba Agenda (conteúdo real) ✅ CONCLUÍDA (2026-09-13)

- [x] **Bug corrigido, herdado da Fase 3**: o cookie de sessão da profissional era gravado com `path: /app/[slug]`, o que impedia o navegador de enviá-lo pras rotas de API em `/api/professional/**` (prefixo de path diferente) — quebrava silenciosamente qualquer ação autenticada chamada via fetch de dentro do app. Corrigido em `src/app/api/professional/login/route.ts`: o cookie agora usa `path: '/'`; a amarração ao catálogo continua garantida pelo payload assinado (`${slug}.${expiresAt}.${assinatura}`), conferido a cada request contra o slug real do recurso — o path nunca foi a camada de segurança de verdade. **Efeito colateral aceito**: se a mesma profissional logar em dois catálogos diferentes no mesmo navegador, o segundo login sobrescreve o cookie do primeiro (mesmo nome+path agora) — cenário raro (uma profissional normalmente só tem um catálogo) e não é um problema de segurança, só de conveniência.
- [x] `src/lib/scheduling/agenda-service.ts` (novo) — `getAppointmentsForDay`, `getPendingAppointments`, `getManualBookingServices`, reaproveitando `localDateTimeToUTC` (Fase 1) pros limites do dia no fuso certo.
- [x] `src/app/api/professional/appointments/route.ts` (POST, agendamento manual) — reaproveita `buildAppointmentInsertPayload` (Fase 1) com `origin: 'professional', status: 'confirmed'`; mesma trava de conflito de horário (`23P01`) da rota pública.
- [x] `src/app/api/professional/appointments/[id]/route.ts` (PATCH, confirmar/cancelar) — a autorização nunca confia no `slug` do cliente: resolve o `order_id`/slug a partir do próprio agendamento no banco antes de checar a sessão.
- [x] `src/app/api/professional/schedule-blocks/route.ts` (POST, bloqueio rápido) — cria um `schedule_blocks` pontual (dia inteiro ou horário parcial); gestão completa (listar/editar/apagar) continua sendo a Fase 4c.
- [x] `src/components/agenda/` (novo: `AppointmentRow`, `AgendaClient`, `ManualBookingForm`, `BlockSlotForm`) + `src/app/app/[slug]/agenda/page.tsx` reescrito — fila de pendentes, navegação de dia por `?date=`, lista do dia, os dois formulários inline.
- [x] Teste com dois catálogos de teste Plus-ativos descartáveis (pra testar isolamento entre catálogos) + um catálogo não-Plus: via curl, confirmado que uma sessão só mexe no próprio catálogo (tentativa cross-catálogo em ambas as rotas de mutação devolve `401`), conflito de horário devolve `409`, bloqueio criado via API reduz a disponibilidade pública de verdade (`/api/scheduling/availability`, conferido antes/depois). Via navegador headless (Playwright): fila de pendentes aparece e some ao confirmar, agendamento manual criado pelo formulário aparece na lista do dia, zero erros de console. Catálogo não-Plus continua vendo o upsell na Agenda (regressão).
- [x] Catálogos de teste removidos depois.
- [x] `npx tsc --noEmit` + `npx next build` limpos (3 rotas novas de API).
- [x] Commit — `2e038a5`.

#### Fase 4c — Aba Config (conteúdo real) ✅ CONCLUÍDA (2026-09-13)

- [x] `src/lib/scheduling/config-service.ts` (novo) — `getBusinessHours`/`getScheduleBlocks`.
- [x] `src/app/api/professional/business-hours/route.ts` (PUT) — substitui a grade semanal inteira (delete-all + insert); valida `weekday` 0-6 sem duplicata e `start_time < end_time` por linha antes de tocar o banco (uma tentativa inválida não corrompe a grade já salva — testado).
- [x] `src/app/api/professional/schedule-blocks/[id]/route.ts` (DELETE) — reaproveita o `POST` já existente da Fase 4b pra criar (já aceitava `start_date`/`end_date` distintos); mesmo padrão de autorização da Fase 4b (resolve o dono real do bloqueio no banco antes de checar a sessão).
- [x] `src/components/config/BusinessHoursEditor.tsx` + `ScheduleBlocksManager.tsx` (novos) + `src/app/app/[slug]/config/page.tsx` reescrito. Sem gate de plano (config é do catálogo, não é feature paga).
- [x] Teste com dois catálogos de teste Plus-ativos: via curl — grade salva com sucesso, tentativa inválida (`start_time >= end_time`) rejeitada sem alterar o que já estava salvo, tentativa cross-catálogo em ambas as rotas novas devolve `401`, bloqueio de 2 dias criado reduz a disponibilidade pública a zero slots naquele dia e apagar o bloqueio devolve os slots. Via navegador headless: horário marcado como aberto persiste depois de recarregar a página, bloqueio criado pela UI aparece na lista e some ao apagar, zero erros de console.
- [x] Regressão: `/c/[slug]` continua respondendo `200` normalmente.
- [x] Catálogos de teste removidos depois.
- [x] `npx tsc --noEmit` + `npx next build` limpos (2 rotas novas de API).
- [x] Commit — `38a680b`.

**Fase 4 completa** (4a + 4b + 4c) — as 4 abas do app da profissional (Início, Catálogo, Agenda, Config) têm conteúdo real, exceto a seção "Minha Assinatura" (Config), que depende do Asaas (Fase 5).

### Fase 5 — Asaas + paywall do Plus ✅ IMPLEMENTADA (2026-09-13) — ⚠️ pendente de teste real (sem chave de sandbox ainda)

- [x] `src/lib/asaas.ts` — wrapper server-only (criar/achar customer, criar assinatura mensal, buscar primeiro pagamento com retry, gerar QR Pix, consultar pagamento, cancelar). Contrato conferido agora direto na documentação oficial do Asaas (não só de memória): auth via header `access_token`, `POST /customers`, `POST /subscriptions`, `GET /payments?subscription=`, `GET /payments/{id}/pixQrCode`, `GET /payments/{id}`, `DELETE /subscriptions/{id}`. Lança `AsaasConfigError` (mensagem genérica ao cliente, detalhe técnico só no log) se `ASAAS_API_KEY`/`ASAAS_BASE_URL` não estiverem definidas.
- [x] `src/lib/pricing.ts` — `PLUS_PRICE = 69.9` (R$69,90/mês, confirmado com o usuário).
- [x] `src/lib/billing-service.ts` (novo, não previsto originalmente por nome mas necessário pra cumprir o requisito de "mesma lógica" webhook+polling de verdade) — `activateSubscription`/`setSubscriptionStatus`, únicas funções que tocam `plan_tier`/`subscription_status`, chamadas tanto pelo webhook quanto pelo check-payment.
- [x] `src/app/api/billing/checkout/route.ts` — autenticada, não escreve `plan_tier`/`subscription_status` até confirmação real (mesma prevenção antifraude do LashAgenda); reaproveita assinatura já criada em vez de duplicar se a profissional recarregar a página no meio do Pix.
- [x] `src/app/api/billing/webhook/route.ts` — validada pelo header `asaas-access-token` contra `ASAAS_WEBHOOK_SECRET` (`timingSafeEqual`). **Achado durante o levantamento do LashAgenda**: essa validação existe na doc oficial do Asaas mas o LashAgenda (a referência que o plano manda seguir) nunca chegou a implementá-la de verdade — aqui foi implementada desde o início, como o plano principal já exigia.
- [x] `src/app/api/billing/check-payment/route.ts` — polling de fallback, reusa `activateSubscription` de verdade (função compartilhada, não duplicada como no LashAgenda) e confere que o pagamento pertence ao catálogo autenticado antes de ativar.
- [x] `src/app/api/billing/cancel/route.ts`.
- [x] `src/components/config/SubscriptionSection.tsx` — tela "Minha Assinatura" na aba Config: coleta email+CPF/CNPJ (pré-preenchido se já salvo), mostra QR Pix + código copia-e-cola com polling automático após gerar, status atual (ativo/suspenso/cancelado), botão de cancelar.
- [x] `PlusUpsellCard.tsx` atualizado — os cartões do Início e da Agenda (Fase 4a) agora linkam de verdade pra `/app/[slug]/config#assinatura` em vez do botão "em breve" desabilitado.
- [x] **Decisão de design registrada**: sem trigger de banco anti-escalação de privilégio (o LashAgenda tem um porque expõe Supabase direto pro browser do cliente final; este projeto nunca faz isso — toda escrita passa por rota Next.js com `supabaseAdmin` e autorização própria, então o vetor que o trigger resolve não existe aqui).
- [x] Testado sem a chave real (usuário optou por seguir assim por enquanto): autorização de todas as rotas (`401` sem sessão), guard de configuração ausente (`503` com mensagem amigável, detalhe técnico só no log do servidor), validação do webhook (`401` sem token/token errado), e o fluxo completo de ativação/suspensão via webhook fabricado manualmente (`PAYMENT_CONFIRMED`/`PAYMENT_OVERDUE` apontando pro `asaas_subscription_id` de um catálogo de teste) — confirmado que `plan_tier`/`subscription_status` mudam corretamente. Navegador headless: upsell do Início e da Agenda levam pra Config, formulário de assinatura mostra o erro amigável ao tentar assinar sem chave configurada.
- [ ] **Pendente**: teste de ponta a ponta contra a API real do Asaas (checkout gerando Pix de verdade, webhook recebido de verdade, cancelamento de verdade) — falta a chave de sandbox. Assim que o usuário trouxer, é só rodar o fluxo completo.
- [x] `npx tsc --noEmit` + `npx next build` limpos (4 rotas novas de billing).
- [x] Commit — `580cfc9`.

### Fase 6 — Integração no admin ✅ CONCLUÍDA (2026-09-13)

- [x] `admin/catalogos/page.tsx` — cada catálogo passa a ter os 3 links pra copiar (produção, edição, e agora **app**: `/api/professional/login?slug=&token=`, o próprio link mágico de entrada da Fase 3 — não existe uma rota separada `/app/[slug]?token=`).
- [x] Badge mostrando `plan_tier`/`subscription_status` por catálogo (Catálogo / Plus Ativo / Plus Suspenso / Plus Cancelado), ao lado do badge de Pendente/Aprovado que já existia.
- [x] Toggle manual de `booking_enabled` como via de escape — chip clicável no card, chama `PATCH /api/admin/catalog-actions` (estendida pra aceitar `{id, booking_enabled}` além do `{id, status}` que já existia).
- [x] Teste via curl: sem sessão de admin → `403`; com sessão, liga `booking_enabled` sem tocar `status` (conferido no banco); corpo sem `status` nem `booking_enabled` → `400`.
- [x] Teste no navegador (login real no `/admin` com senha, headless): os 3 links aparecem em todo catálogo (inclusive nos catálogos reais já existentes, que não têm `plan_tier` ainda — mostram "Catálogo"/"Desligado" por padrão, sem quebrar), badges corretos pro catálogo de teste (`Plus Suspenso`), toggle liga/desliga de verdade e atualiza a tela, botão de copiar do link do app copia a URL certa. Zero erros de console.
- [x] Catálogo de teste removido depois.
- [x] `npx tsc --noEmit` + `npx next build` limpos.
- [x] Commit — `248ee3d`.

**Nota de ambiente**: `ADMIN_PASSWORD`/`ADMIN_SESSION_SECRET` estavam vazios no `.env` local (o login do admin não funcionava de jeito nenhum sem eles) — defini valores de teste locais pra conseguir testar esta fase. Value atual: `ADMIN_PASSWORD=teste-admin-local`. Troque se quiser outra senha.

### Fase 7 — Notificações ✅ CONCLUÍDA (2026-09-13, sem push web — adiado)

- [x] **Aviso por WhatsApp pra profissional quando um agendamento é criado — já entregue na Fase 2**, achado ao revisitar esta fase: o passo de confirmação do wizard (`BookingModal.tsx`, Fase 2) já monta um link `wa.me` endereçado ao número da profissional com o resumo do agendamento, botão "Avisar no WhatsApp →". Nada novo a fazer aqui, só corrigindo a numeração retroativamente.
- [x] Aviso por WhatsApp pra cliente quando confirmado/recusado — `src/components/agenda/AgendaClient.tsx` (Fase 4b) agora monta um link `wa.me` (mensagem diferente pra confirmado/recusado) pro número da cliente depois que a profissional confirma/recusa na Agenda, com uma notificação inline dispensável "Avise {nome} pelo WhatsApp". `AppointmentRow.tsx` passou a repassar o agendamento inteiro (não só o id) pro callback, pra ter os dados da mensagem disponíveis.
- [x] Extensão do Telegram pra avisar de novas assinaturas Plus — `src/lib/telegram.ts` (novo, `sendTelegramMessage`, nunca lança) + `activateSubscription` (`billing-service.ts`) passa a ler o estado anterior do pedido e só notifica na transição de verdade pra `ativo` — evita aviso duplicado quando webhook e `check-payment` confirmam o mesmo pagamento quase ao mesmo tempo (testado: dois disparos seguidos do webhook geraram só uma tentativa de notificação). A rota `notify-telegram` existente (usada na criação de catálogo) não foi tocada.
- [ ] **Push web (VAPID) — adiado por decisão do usuário**, fica pendente pro futuro (item já era marcado como opcional no plano original).
- [x] Teste no navegador headless: confirmar/recusar um agendamento pendente mostra o link de aviso certo pra cliente (número e mensagem corretos pra cada caso), dispensável. Teste de deduplicação: webhook do Asaas disparado duas vezes seguidas pro mesmo pedido só tenta notificar o Telegram uma vez. Regressão: rota `notify-telegram` e catálogo público continuam respondendo normalmente.
- [x] Catálogo de teste removido depois.
- [x] `npx tsc --noEmit` + `npx next build` limpos.
- [x] Commit — `412f396`.

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
