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

### Fase 4 — Agenda (a maior)
- [ ] `agenda/page.tsx` busca `business_hours`+`schedule_blocks` também
- [ ] `src/components/agenda/DayTimeGrid.tsx` (novo, grade real)
- [ ] `src/components/agenda/AppointmentDetailSheet.tsx` (novo)
- [ ] `ManualBookingForm` ganha prop `defaultTime`
- [ ] `tsc` + `build` limpos
- [ ] Reteste manual de **todo o Bloco 9** de `docs/TESTES_AGENDAMENTO_LOCAL.md` (confirmar, recusar, criar manual, bloquear horário) com a grade nova
- [ ] Commit

### Fase 5 — Polish
- [ ] Botão de voltar da aba Catálogo
- [ ] Ajustes soltos
- [ ] Commit

## Como retomar em outra sessão

Leia este arquivo + a seção "Resumo do plano" acima antes de continuar. Siga a mesma disciplina de teste + commit por fase usada no resto do projeto.
