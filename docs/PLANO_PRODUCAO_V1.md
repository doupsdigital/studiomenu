# Plano — StudioMenu+ pronto pra produção (deploy, login real, push, testes reais)

> Documento vivo de acompanhamento, mesmo padrão do `docs/REESTRUTURACAO_VISUAL_APP.md`. Plano completo (contexto, decisões, pesquisa sobre o LashAgenda) foi feito em modo plano em 2026-09-15 — resumo abaixo. Cada fase só avança pra próxima depois de testada e aprovada.

**Status geral:** ✅ Fases 17 e 18 concluídas e validadas em produção. 🟡 Fase 19 (central de instalação/notificações + lembrete 1h antes) em andamento — plano completo salvo em modo plano (2026-09-16).

**Legenda:** `[ ]` pendente · `[x]` feito e testado

---

## Resumo do plano

Depois da bateria de testes local (Playwright + guiada pelo usuário) confirmar que a Agenda/StudioMenu+ funciona bem, a etapa agora é validar em condições reais antes de vender: deploy em produção na Vercel (sem domínio próprio ainda), PWA num celular de verdade, multi-tenant com vários catálogos, concorrência de agendamentos, e 2 funcionalidades novas — **login real da profissional** (Supabase Auth: e-mail/senha + Google, "igual era no LashAgenda") e **push notifications** (avisar a profissional na hora de um agendamento novo).

**Fora de escopo de propósito**: integração real do Asaas (chave de produção, cobrança de verdade) — fica pra a última fase do projeto.

**Pesquisa sobre o LashAgenda** (código em `legacy/lashmenu-vendas-feature-lashmenu-agendamento/lashmenu-vendas-feature-lashmenu-agendamento/lashagenda-v0-main/`):
- Login: tabela `usuarios` (1 linha por `auth.users.id`, a PK é o próprio UID) + `estabelecimentos` (tenant). Google OAuth via `supabase.auth.signInWithOAuth`, configurado no Google Cloud Console + Supabase Dashboard.
- Push: trigger Postgres (`pg_net`) → Supabase Edge Function (Deno, lib `web-push`) → tabela `push_subscriptions` → service worker (`push`/`notificationclick`) → hook `usePushNotifications`.
- **Decisão (aprovada com o usuário)**: simplificar o push no StudioMenu — chamar o envio direto da rota `/api/scheduling/book`, sem trigger nem Edge Function, mesmo padrão non-blocking do aviso do Telegram (`src/lib/telegram.ts`). Resultado idêntico pra profissional, menos infra.

**Modelo de login adaptado pro StudioMenu** (diferente do self-serve do LashAgenda — aqui o admin já provisiona o catálogo manualmente): `orders.auth_user_id` (nullable, 1:1) em vez de uma tabela `usuarios` separada; a profissional "reivindica" o login de dentro do app (já autenticada pelo link mágico de sempre), numa seção nova em Config. O link mágico continua funcionando em paralelo, como via de recuperação de acesso.

## Fases

### Fase 16 — Deploy no Vercel (produção, sem domínio) ✅ CONCLUÍDA (2026-09-15)

- [x] `tsc` + `build` confirmados limpos antes de preparar o deploy
- [x] Projeto já estava criado e conectado na Vercel pelo usuário (`doupsdigital-s-projects/studiomenu`, deploy automático a cada push na `main`), URL de produção `https://studiomenu.vercel.app`
- [x] **Achado crítico**: comparando as env vars configuradas na Vercel com o que o código realmente lê, faltava `PROFESSIONAL_SESSION_SECRET` — sem ela, a rota de login mágico (`createProfessionalSessionValue`) e qualquer sessão autenticada de profissional quebravam com erro 500. Essa variável nunca tinha sido adicionada desde que a funcionalidade de agendamento foi criada (as outras vars datam de antes disso). Gerei um valor novo (`crypto.randomBytes(48)`) e o usuário adicionou em Production + Preview, depois fez o redeploy.
- [x] **Achado não-crítico**: `ADMIN_API_SECRET` está configurada na Vercel mas não é lida em nenhum lugar do código atual (var legada, sem efeito) — não precisa de ação. `ASAAS_BASE_URL`/`ASAAS_WEBHOOK_SECRET` também faltam, mas sem urgência (Asaas fora de escopo agora; o código já trata a ausência delas com erro amigável, não quebra nada).
- [x] Smoke test (curl, contornando a interceptação de TLS do sandbox com `-k`) confirmou 200 em: `/`, `/admin`, `/c/teste-local-1`, `/app/teste-local-1` (Início e Agenda, com sessão autenticada de verdade — não só a tela de "link inválido"), `/manifest.webmanifest`, ícones do PWA, `/sw.js`.
- [x] Confirmado que produção e ambiente local **compartilham o mesmo projeto Supabase** — o catálogo de teste `teste-local-1` já existe em produção, o que facilitou (e vai facilitar) os testes seguintes, mas também significa que dados de teste feitos localmente aparecem em produção e vice-versa.
- [x] Nenhuma mudança de código foi necessária nessa fase (só configuração de ambiente) — nada pra commitar.

**Pendências levadas pra frente**: 4 agendamentos pendentes de teste (`Cliente Teste`/variações, criados manualmente pelo usuário durante os testes locais) continuam no catálogo compartilhado, de propósito (usuário pediu pra deixar quieto por enquanto) — revisitar antes dos testes de multi-tenant (Fase 20).

**Ícone do PWA (resolvido no mesmo momento, fora de ordem — Fase 19 antecipada)**: usuário já tinha a arte final pronta. Redimensionada com `sharp` (já estava instalado no projeto) a partir do arquivo original (1254×1254, com transparência) pros 2 tamanhos que o manifest pede: `public/icon-192.png` e `public/icon-512.png`, substituindo os anteriores (que já tinham conteúdo real, mas eram só placeholder). Arquivo original movido pra `public/logo-source.png` (fora de `src/`, guardado como referência pra qualquer redimensionamento futuro — ex: ícone de loja de apps). `tsc` + `build` confirmados limpos depois da troca.

**Bug achado pelo usuário testando no celular (instalação do PWA abria a landing de vendas)**: o `manifest.ts` da raiz (convenção de arquivo do Next — só existe UM por projeto, não dá pra ter um por segmento de rota) tem `start_url: '/'`. Instalar o PWA a partir de qualquer tela de `/app/[slug]/**` usava esse mesmo manifest, então o ícone instalado sempre abria a home de vendas, não o app da profissional.

Corrigido com um manifest dinâmico só pra essa árvore de rotas: `src/app/app/[slug]/manifest.webmanifest/route.ts` (Route Handler, não a convenção de arquivo — essa só funciona na raiz) devolve um manifest com `start_url: /app/[slug]` e `scope: /app/[slug]/`; `src/app/app/[slug]/layout.tsx` ganhou um `generateMetadata` que aponta o campo `manifest` pra essa URL, sobrescrevendo o manifest herdado da raiz só dentro dessa árvore (o resto do site — home, `/c/[slug]` — continua usando o `/manifest.webmanifest` normal, confirmado com teste local). **Usuário precisa desinstalar e reinstalar o PWA** depois desse deploy — o ícone que já foi instalado com o manifest antigo não se autocorrige.
- [x] `tsc` + `build` limpos
- [x] Testado local: `curl /app/teste-local-1/manifest.webmanifest` devolve o manifest certo; a tag `<link rel="manifest">` na página autenticada aponta pra ele; home e `/c/[slug]` continuam com `/manifest.webmanifest` normal.

### Fase 17 — Login real da profissional (Supabase Auth) ✅ CONCLUÍDA (2026-09-16)

Modelo implementado: `orders.auth_user_id` (nullable, 1:1 com `auth.users`) — a profissional continua entrando pelo link mágico até "reivindicar" o login numa seção nova em Config; dali em diante pode entrar direto por `/entrar` (e-mail/senha ou Google). O login real só troca o cookie de sempre (`sm_pro_session`) — nenhuma outra parte do app precisou mudar.

**Código:**
- [x] `docs/migrations/2026-09-16_fase17_login_real.sql` (novo) + `docs/schema.sql` atualizado — coluna `orders.auth_user_id UUID UNIQUE REFERENCES auth.users(id)`. Rodado pelo usuário no SQL Editor.
- [x] `src/lib/supabase-browser.ts` (novo) — client Supabase só de Auth (chave anon), usado nos componentes `'use client'`.
- [x] `src/app/api/professional/session-from-auth/route.ts` (novo) — recebe um `access_token` de sessão do Supabase Auth, confirma no servidor (`supabaseAdmin.auth.getUser`), acha o catálogo por `auth_user_id` e grava o mesmo cookie `sm_pro_session` do link mágico.
- [x] `src/app/api/professional/claim-account/route.ts` (novo) — vincula a conta logada ao catálogo atual; só funciona pra quem já está autenticada nesse catálogo (cookie do link mágico) e só se o catálogo ainda não tiver login vinculado.
- [x] `src/app/api/professional/logout/route.ts` (novo, adicionado durante o teste guiado — faltava qualquer forma de sair do app) — apaga o cookie `sm_pro_session`.
- [x] `src/app/entrar/page.tsx` + `src/components/auth/ProfessionalLoginForm.tsx` (novos) — tela de login (e-mail/senha + Google, com o ícone oficial do Google no botão via `src/components/auth/GoogleIcon.tsx`).
- [x] `src/app/entrar/callback/page.tsx` (novo) — retorno único do Google OAuth, tanto pro login quanto pra vinculação feita em Config (`?claim=1&slug=X`); usa Suspense por causa do `useSearchParams` (build de produção exige).
- [x] `src/components/config/AccountSection.tsx` (novo) + `ConfigAccordion`/`config/page.tsx` atualizados — 4ª seção "Minha conta": cria acesso com senha (lida com projeto exigindo ou não confirmação de e-mail) ou vincula com Google; mostra "Login ativo" depois de vinculado; botão "Sair desse dispositivo".
- [x] `tsc` + `build` limpos.

**Configuração feita pelo usuário nos dashboards:**
- [x] Migração rodada no SQL Editor do Supabase.
- [x] Provider Google configurado no Supabase (Authentication → Providers → Google) + OAuth Client criado no Google Cloud Console, redirecionando pra `https://orrfslursoielebvdhbf.supabase.co/auth/v1/callback`.
- [x] "Confirm email" desativado em Authentication → Providers → Email (decisão do usuário — sem essa etapa a conta já fica ativa na hora do cadastro, sem precisar confirmar por e-mail).
- [x] Authentication → URL Configuration: Site URL = `https://studiomenu.vercel.app`; Redirect URLs com padrão curinga `http://localhost:3000/**` e `https://studiomenu.vercel.app/**` (trocado de URLs exatas pra curinga depois de um teste que caiu na home de vendas com o token na URL — o `redirect_to` de `/entrar/callback` não batia exatamente com a URL cadastrada, então o Supabase caiu no fallback pra Site URL).

**Testado e validado em `teste-local-1` (local, via script automatizado + guiado pelo usuário na interface):**
- [x] Script automatizado (12 verificações): criação de conta, vínculo via cookie do link mágico, recusa de vínculo sem cookie (401), recusa de vínculo duplicado (409), troca de sessão por access_token, recusa de token inválido (401).
- [x] Criar acesso com e-mail/senha pela interface → "Login ativo" automático (sem confirmação de e-mail).
- [x] Sair → entrar de novo por `/entrar` com e-mail/senha → funcionou.
- [x] Vincular com Google pela interface (depois de resetar o `auth_user_id` pra testar do zero) → "Login ativo — Conta Google vinculada com sucesso".
- [x] Sair → entrar de novo por `/entrar` com Google → funcionou.

**Commit:** `dc5a613` — `git push` feito.

**Deploy em produção**: o push não disparou o auto-deploy da Vercel dessa vez (bug pontual — confirmado via API do GitHub que o commit `dc5a613` não recebeu nenhum status/check da Vercel, diferente do `1a23c80` anterior que tinha `"Vercel: Deployment has completed"`). Resolvido criando um deployment manual pela Vercel Dashboard ("Create Deployment" → branch `main`). Depois disso, `https://studiomenu.vercel.app/entrar` e `/entrar/callback` responderam 200, e o usuário testou e confirmou os dois logins (senha e Google) funcionando em produção de verdade.

### Fase 18 — Push notifications 🟡 EM ANDAMENTO (2026-09-16)

Simplificado do LashAgenda como já decidido no planejamento: chamada direta em `/api/scheduling/book` (mesmo padrão non-blocking do `telegram.ts`), sem trigger de banco nem Edge Function.

**Código:**
- [x] `web-push` + `@types/web-push` instalados.
- [x] Par de chaves VAPID gerado (`npx web-push generate-vapid-keys`) e salvo no `.env` local: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.
- [x] `docs/migrations/2026-09-16_fase18_push_notifications.sql` (novo) + `docs/schema.sql` atualizado — tabela `push_subscriptions` (`order_id`, `endpoint`, `p256dh`, `auth`, `UNIQUE(order_id, endpoint)`), RLS ligado, `REVOKE ALL FROM anon` (mesmo padrão das outras tabelas de agendamento).
- [x] `src/lib/push-notifications.ts` (novo) — `sendPushToOrder(orderId, payload)`, non-blocking, limpa do banco inscrições expiradas (404/410 do serviço de push).
- [x] `src/app/api/scheduling/book/route.ts` — chama `sendPushToOrder` depois de inserir o agendamento (só essa rota é usada pra reservas da cliente; as manuais da profissional passam por outra rota, então não dão eco nela mesma).
- [x] `public/sw.js` — handlers `push` (mostra a notificação) e `notificationclick` (foca aba existente ou abre uma nova).
- [x] `src/hooks/usePushNotifications.ts` (novo) — pede permissão, assina via `PushManager`, salva a inscrição.
- [x] `src/app/api/professional/push-subscribe/route.ts` + `push-unsubscribe/route.ts` (novos).
- [x] `src/components/app-shell/PushPermissionBanner.tsx` (novo) + `inicio/page.tsx` — banner dispensável (localStorage), só some quando `booking_enabled` está ligado.
- [x] `tsc` + `build` limpos. Rota `push-subscribe` testada via script (recusa sem cookie válido, 401).

**Pendente antes de testar de ponta a ponta (ações do usuário):**
- [ ] Rodar `docs/migrations/2026-09-16_fase18_push_notifications.sql` no SQL Editor do Supabase.
- [ ] Adicionar na Vercel (Production **e** Preview) as 3 variáveis com os **mesmos valores** do `.env` local (o banco de `push_subscriptions` é compartilhado entre local e produção — usar chaves VAPID diferentes quebraria as inscrições feitas num ambiente quando o outro tentar enviar): `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`. Redeploy depois.
- [ ] Teste guiado: no app (local ou produção), banner "Ative as notificações" no Início → Ativar → aceitar a permissão do navegador → fazer uma reserva como cliente em `/c/teste-local-1` → confirmar que a notificação chega.

### Fase 19 — Central de instalação/notificações + lembrete 1h antes 🟡 EM ANDAMENTO (2026-09-16)

Achado testando push em produção no celular: o banner nativo de instalação do Chrome aparecia antes do login (bug), e a ativação de notificações estava pouco descobrível (só um banner dispensável). Usuário trouxe a referência de um app concorrente (botão "Instalar" no cabeçalho que vira "sino" depois de instalado, abrindo uma central de notificações) e pediu pra also planejar um lembrete novo (1h antes do atendimento, pra profissional). Plano completo salvo em modo plano.

**Fase A — corrige o banner prematuro:**
- [x] `src/app/app/[slug]/layout.tsx`: `generateMetadata` só devolve o manifest escopado quando a sessão é válida.

**Fase B — botão de instalar controlado + sino:**
- [x] `src/components/app-shell/InstallPromptProvider.tsx` (novo) — Context/hook `useInstallPrompt()`, captura `beforeinstallprompt` (com `preventDefault`) e `appinstalled`.
- [x] `PageTitleBar.tsx` — vira client component, ganha `slug` e o controle novo (pílula "Instalar" ou sino, ao lado do ícone decorativo de sempre).
- [x] `src/components/push/NotificationCenterSheet.tsx` (novo, bottom sheet) — por enquanto só a seção "Novo agendamento" (reaproveita `PushActivationFlow`).
- [x] `PushPermissionBanner` removido (do Início e do projeto) — redundante com o sino novo.
- [x] `tsc` + `build` limpos.

**Fase C — lembrete 1h antes do atendimento**: ainda não iniciada (schema novo, rota de cron, GitHub Actions agendado — ver plano completo).

**Pendente:** teste guiado do usuário no celular (Fases A+B) antes de commitar e seguir pra Fase C.

## Como retomar em outra sessão

Leia este arquivo + a seção "Resumo do plano" acima, e o plano completo salvo em modo plano (2026-09-15) antes de continuar.
