# Plano — StudioMenu+ pronto pra produção (deploy, login real, push, testes reais)

> Documento vivo de acompanhamento, mesmo padrão do `docs/REESTRUTURACAO_VISUAL_APP.md`. Plano completo (contexto, decisões, pesquisa sobre o LashAgenda) foi feito em modo plano em 2026-09-15 — resumo abaixo. Cada fase só avança pra próxima depois de testada e aprovada.

**Status geral:** 🟡 Fase 16 em andamento.

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

## Como retomar em outra sessão

Leia este arquivo + a seção "Resumo do plano" acima, e o plano completo salvo em modo plano (2026-09-15) antes de continuar.
