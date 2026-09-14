# Reestruturação visual do app da profissional (`/app/[slug]`)

> Documento vivo de acompanhamento. Cada fase só avança pra próxima depois de testada e aprovada. Plano completo (contexto, decisões, arquivos) em `docs/PLANO_AGENDAMENTO_STUDIOMENU_PLUS.md` não cobre isso — este documento é auto-contido, mas a decisão original foi feita em modo plano em 2026-09-14 (ver resumo abaixo).

**Status geral:** 🟡 Fase 1 em andamento (última atualização: 2026-09-14).

**Legenda:** `[ ]` pendente · `[x]` feito e testado

---

## Resumo do plano

Reestruturação **só da camada visual** do app da profissional — cores, tipografia, composição de tela, e a Agenda virando uma grade de horário real (clicável) em vez de lista. Nenhuma rota de API, tabela, ou regra de negócio muda; acabamos de terminar uma bateria completa de testes funcionais (`docs/TESTES_AGENDAMENTO_LOCAL.md`) e a régua é não quebrar nada disso.

Referência visual: LashAgenda (`legacy/lashmenu-vendas-feature-lashmenu-agendamento/.../lashagenda-v0-main/`). Decisões fechadas:
- Identidade visual: marca que o StudioMenu já tem (Fraunces/Italiana/Jost, rose já no `tailwind.config.js`) — não importa as fontes/paleta exatas do LashAgenda, só a estrutura (cards, grade, gradientes, navegação com botão central).
- Agenda: só visualização diária vira grade real (sem semana/mês).
- Fora de escopo: `/c/[slug]`, editor do catálogo, todas as rotas de API, KPI de faturamento (preço é texto livre, não dá pra somar com confiança).

## Fases

### Fase 1 — Fundação ✅ CONCLUÍDA (2026-09-14)
- [x] `tailwind.config.js`: extensão aditiva com paleta neutra clara (`cream`, `surface`, `linen`, `ink`/`ink-soft`/`ink-faint`)
- [x] `.font-serif-pro`/`.font-body-pro` em `globals.css` (Fraunces/Jost, já carregadas no projeto — evita as classes `font-serif`/`font-sans` do Tailwind, que apontam pra fontes nunca carregadas)
- [x] `src/components/app-shell/SectionCard.tsx` (acordeão)
- [x] `src/components/app-shell/StatCard.tsx`
- [x] `src/components/app-shell/GradientHeader.tsx`
- [x] `src/components/app-shell/BottomNav.tsx` reescrito (3 abas laterais + botão central elevado pra Agenda)
- [x] `src/app/app/[slug]/layout.tsx`: tela de "link inválido" e fundo geral restyled
- [x] **Achado à parte**: a cópia de referência do LashMenu/LashAgenda que o usuário colou em `legacy/` (além da que já existia em `docs/`) voltou a poluir o `tsc`/integridade — generalizei a exclusão em `tsconfig.json` (glob `**/lashmenu-vendas-feature-lashmenu-agendamento/**`), `.gitignore` e `scripts/check-integrity.js` pra cobrir qualquer cópia dessa pasta, não só a de `docs/`.
- [x] `tsc` + `build` limpos
- [x] Teste visual no navegador (Playwright): tela de "link inválido" com o novo visual claro confirmada; barra de navegação com botão central elevado confirmada. Conteúdo do Início ainda no visual antigo (esperado — é a Fase 2).
- [ ] Commit (aguardando aprovação)

### Fase 2 — Início ✅ CONCLUÍDA (2026-09-14)
- [x] Redesign completo de `src/app/app/[slug]/inicio/page.tsx`: `GradientHeader` com saudação (Bom dia/Boa tarde/Boa noite calculado no fuso America/Sao_Paulo, não no fuso do servidor) + badge PLUS, 2 `StatCard`s (Agendamentos hoje / Aguardando confirmação, contagens reais via `getAppointmentsForDay`/`getPendingAppointments`, já existentes), cartão gradiente "Compartilhe sua Agenda" (novo `ShareLinkButton.tsx`), `CopyLinkRow`/`PlusUpsellCard` restyled pro tema claro.
- [x] `tsc` + `build` limpos
- [x] Teste visual (Playwright, catálogo de teste): saudação/data corretas, contagens batendo com os dados reais (2 agendamentos hoje, 0 aguardando), badge PLUS aparecendo.
- [ ] Commit (aguardando aprovação)

### Fase 3 — Config ✅ CONCLUÍDA (2026-09-14)
- [x] Novo `src/components/config/ConfigAccordion.tsx` — envolve as 3 seções existentes em `SectionCard`, controla abrir/fechar, e abre "Minha assinatura" sozinho quando a URL chega com `#assinatura` (link do cartão de upsell)
- [x] `BusinessHoursEditor`/`ScheduleBlocksManager`/`SubscriptionSection` restyled pro tema claro, sem o cabeçalho próprio (o `SectionCard` já cobre isso) — nenhum comportamento/chamada de API mudou
- [x] `config/page.tsx` simplificado pra só buscar dado e passar pro `ConfigAccordion`
- [x] `tsc` + `build` limpos
- [x] Teste visual (Playwright): acordeão fechado por padrão, abre/fecha ao clicar, formulário de horários com o visual novo. Testado o link `#assinatura` numa navegação nova de verdade — abre a seção certa sozinho, mostrando "StudioMenu+ ativo" (bate com o estado real do catálogo de teste).
- [ ] Commit (aguardando aprovação)

### Fase 4 — Agenda (a maior) ✅ CONCLUÍDA (2026-09-14)
- [x] `agenda/page.tsx` busca `business_hours`+`schedule_blocks` também, cabeçalho vira `GradientHeader` (título em cima, navegação ◀ HOJE ▶ como pill embaixo — o layout original com tudo numa linha só cortava a data, corrigido)
- [x] `src/components/agenda/DayTimeGrid.tsx` (novo) — grade real: coluna de hora + slots de 30min clicáveis (abre agendamento manual pré-preenchido) + agendamentos como blocos posicionados por cima, coloridos por status. Célula livre = dentro do expediente do dia da semana e sem bloqueio — não confere agendamentos (isso os blocos cobrem visualmente, mesma mecânica do LashAgenda). **Ajuste em relação ao plano original**: não reaproveitei `isInstantAvailable` pra isso — essa função também exige que a duração inteira do serviço caiba antes do fechamento, o que não faz sentido pra "esse meia-hora está dentro do expediente?". Escrita uma checagem local mais simples, só expediente+bloqueio.
- [x] `src/components/agenda/AppointmentDetailSheet.tsx` (novo) — bottom sheet aberto ao clicar num agendamento na grade, mesmos dados/ações que a fila de pendentes já tinha
- [x] `ManualBookingForm` ganha prop `defaultTime` (preenchido pelo clique na grade)
- [x] `AppointmentRow`, `ManualBookingForm`, `BlockSlotForm` restyled pro tema claro
- [x] Pendentes voltaram a aparecer também na grade (bloco âmbar), não só na fila — decisão revista em relação à correção anterior: antes era duplicação de exibição real (2 listas idênticas lado a lado); agora fila (lista de ação) e grade (visão do dia) são representações diferentes do mesmo agendamento, como o próprio LashAgenda faz — não é mais confuso, é informação útil nos dois lugares.
- [x] `tsc` + `build` limpos
- [x] Reteste manual (Playwright) de tudo do Bloco 9 com a grade nova: clique em horário livre abre o formulário com a hora certa pré-preenchida; clique num agendamento abre o painel de detalhe com os dados corretos; confirmar um pendente funciona de ponta a ponta (fila esvazia, aviso de WhatsApp aparece, bloco muda de âmbar pra verde na grade automaticamente). Dados de teste criados especificamente pra esse reteste foram removidos depois.
- [ ] Commit (aguardando aprovação)

### Fase 5 — Polish ✅ CONCLUÍDA (2026-09-14)
- [x] Botão de voltar da aba Catálogo (`catalogo/page.tsx`) — tom rose escuro translúcido em vez de preto, continua legível sobre qualquer tema de catálogo (Rose ou Luxury)
- [x] Cores do `manifest.ts` (splash screen do PWA) atualizadas pro fundo creme, condizente com o app agora sendo claro (antes ainda apontava pro slate escuro antigo)
- [x] Varredura final por qualquer classe `slate-*`/`bg-black` esquecida em toda a árvore `/app/[slug]` — nada encontrado além de usos intencionais (ícone branco sobre botão rose, scrim de modal)
- [x] `tsc` + `build` limpos
- [x] Teste visual: editor do catálogo (aba Catálogo) continua 100% intocado, botão de voltar com a nova identidade, sem regressão
- [ ] Commit (aguardando aprovação)

## Reestruturação concluída (2026-09-14)

Todas as 5 fases prontas, testadas e commitadas localmente (push pendente, a pedido do usuário). Início, Config e Agenda com o visual novo; Catálogo e `/c/[slug]` intocados; nenhuma rota de API ou lógica de negócio mudou em nenhuma fase.

## Como retomar em outra sessão

Leia este arquivo + a seção "Resumo do plano" acima antes de continuar. Siga a mesma disciplina de teste + commit por fase usada no resto do projeto.
