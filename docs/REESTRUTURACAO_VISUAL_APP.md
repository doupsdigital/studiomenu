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

### Fase 6 — Fidelidade exata à Agenda do LashAgenda ✅ CONCLUÍDA (2026-09-14)

O usuário mandou o print real da tela de Agendamentos do LashAgenda e pediu fidelidade exata pra essa tela específica (a principal do sistema). Decisões confirmadas antes de mexer:
- Botão "Dia ⌄" fica só visual (sem dropdown funcional) — mantém a decisão de só visualização diária já tomada antes.
- Sem botão flutuante de "Ajuda" (funcionalidade nova, fora de escopo).
- Barra branca de título aplicada nas 3 telas (Início/Agenda/Config), sem o ícone de hambúrguer (não há menu lateral pra ele abrir).

Implementado:
- [x] `src/components/app-shell/PageTitleBar.tsx` (novo) — barra branca com título serifado centralizado + ícone da seção à direita, aplicada no topo de `inicio/page.tsx`, `agenda/page.tsx` e `config/page.tsx`.
- [x] Banner gradiente da Agenda reescrito: título "Agenda" + subtítulo de data curto (sem dia da semana, senão estourava a largura) na esquerda, navegação ◀ Hoje ▶ como um único pill segmentado na direita — mesma estrutura do original, não mais empilhado/centralizado como antes.
- [x] Barra de ações acima da fila de pendentes (antes só existia junto da grade): "+ Novo" e "🔒 Trancar" como pills sólidos rose, "Dia ⌄" alinhado à direita.
- [x] Fila "Aguardando confirmação" virou acordeão recolhido por padrão (cabeçalho com ícone de relógio + contagem + seta), expande ao tocar — antes ficava sempre aberta.
- [x] `DayTimeGrid` ganhou sua própria linha de cabeçalho (ícone de calendário + "SEGUNDA-FEIRA, 14 DE SETEMBRO"), dentro do mesmo cartão da grade — tinha ficado de fora na Fase 4.
- [x] `tsc` + `build` limpos.
- [x] Teste visual comparando print a print com a referência — resultado muito próximo. Reteste funcional do acordeão de pendentes (recolhe/expande, confirmar continua funcionando de ponta a ponta — fila esvazia, aviso de WhatsApp aparece, bloco muda de cor na grade).
- [x] Commit — `45282c7` (commitado junto com a Fase 7)

### Fase 7 — Fluxo de confirmação idêntico ao LashAgenda (modais de aprovar/recusar/sucesso) ✅ CONCLUÍDA (2026-09-14)

O usuário mandou mais prints (linha da fila expandida, modal "Confirmar agendamento" com 2 formas de confirmar, modal de sucesso) e apontou que a Fase 6 tinha ficado só parecida, não idêntica — pediu pra eu ir direto no código do LashAgenda pra essa parte específica em vez de trabalhar de memória. Fui em `Agendamentos.tsx` (arquivo de origem) ler exatamente: o toolbar (3 botões `flex-1` iguais), a linha da fila pendente, `getStatusColorStyles` (as cores exatas por status), e os 2 modais que não existiam ainda aqui (aprovar com WhatsApp/sem, recusar com motivo, e o modal de sucesso).

**Isso não era só visual — era funcionalidade nova de verdade** (um fluxo de 2 passos que não existia): confirmar/recusar deixou de ser uma ação direta e virou abrir um modal de confirmação com a opção de avisar a cliente pelo WhatsApp automaticamente (abre o WhatsApp com a mensagem pronta) ou só confirmar/recusar sem avisar, seguido por um modal de sucesso com o resumo. A rota de API (`PATCH /api/professional/appointments/[id]`) não mudou — só a camada de apresentação em cima dela ficou mais rica.

- [x] `src/components/agenda/ApproveModal.tsx` (novo) — "Confirmar agendamento", cabeçalho gradiente, cartão cliente/serviço, 2 formas de confirmar + voltar
- [x] `src/components/agenda/RejectModal.tsx` (novo) — "Recusar agendamento", mesmo padrão + campo de motivo opcional (só usado na mensagem do WhatsApp, nunca salvo no banco — mesmo comportamento do LashAgenda)
- [x] `src/components/agenda/SuccessModal.tsx` (novo) — resumo do agendamento confirmado/recusado, reaproveitado pros dois casos com título diferente
- [x] `src/components/agenda/AppointmentRow.tsx` reescrito — linha compacta da fila (nome+hora à esquerda, Aprovar/Recusar à direita), abre os modais em vez de agir direto
- [x] `src/components/agenda/AppointmentDetailSheet.tsx` — Confirmar/Recusar (pendente) agora também abrem os mesmos modais; Cancelar (já confirmado) continua ação direta, sem modal — a referência não mostrou um fluxo diferente pra esse caso
- [x] `src/components/agenda/DayTimeGrid.tsx` — cores dos blocos trocadas pras exatas do `getStatusColorStyles` (amber/green/blue/red/gray, não mais o âmbar/emerald/sky/rose que eu tinha usado de memória), com o badge de status e "X min" no rodapé do bloco
- [x] `src/components/agenda/AgendaClient.tsx` — reescrito pra orquestrar os modais novos; removida a barra dispensável "Avise pelo WhatsApp" (virou redundante, o aviso agora é automático dentro do fluxo de confirmação); toolbar com os 3 botões `flex-1` idênticos ao original
- [x] `window.open()` do link do WhatsApp chamado **antes** do `await` da chamada de API, mesmo cuidado do LashAgenda (necessário pro Safari iOS não bloquear o popup)
- [x] `tsc` + `build` limpos
- [x] Teste visual + funcional completo (Playwright): toolbar e linha da fila comparados print a print — idênticos. Fluxo de aprovar testado de ponta a ponta (abre modal → "Confirmar sem enviar" → modal de sucesso "Agendamento Confirmado!" → fecha → bloco vira verde "Confirmado" na grade). Fluxo de recusar testado separadamente (abre modal → preenche motivo → "Recusar sem notificar" → modal de sucesso "Agendamento Recusado"). Dados de teste removidos depois de cada teste.
- [x] Commit — `45282c7`

### Fase 8 — Tabbar de 3 itens + card de destaque pro catálogo ✅ CONCLUÍDA (2026-09-14)

O usuário apontou que a tabbar com 4 itens (Início/Catálogo/Agenda/Config) tinha ficado apertada, com tamanhos desproporcionais. Decisão: tirar "Catálogo" da tabbar; o acesso ao editor passa a ser por um card de destaque na tela de Início (que antes só mostrava o link de edição pra copiar — essa função de copiar sai daqui, o usuário vai deixar isso disponível no painel admin).

- [x] `src/components/app-shell/EditCatalogCard.tsx` (novo) — card cheio, gradiente rose-600→rose-700, ícone + título "Editar meu catálogo" + subtítulo + chevron, link direto pra `/app/[slug]/catalogo`. Substitui o antigo `CopyLinkRow` na tela de Início (arquivo removido, só era usado ali).
- [x] `src/components/app-shell/BottomNav.tsx` — tabbar volta a 3 posições (Início | espaço do botão central | Config), cada uma com `flex-1` — como sobrou mais espaço por item, ícones e texto ficaram um pouco maiores (`w-5 h-5`→`w-6 h-6`, `text-[11px]`→`text-xs`) pra preencher bem o espaço.
- [x] Botão de voltar da aba Catálogo (`catalogo/page.tsx`) já apontava pra `/app/[slug]/inicio` desde a Fase 5 — não precisou mudar nada aí.
- [x] **Ajuste após feedback**: a primeira versão da tabbar reservava uma 3ª coluna vazia só pro espaço do botão central (Início/espaço/Config em 3 partes iguais), o que empurrava os 2 ícones pras bordas e deixava um vão vazio grande — ficou desproporcional. Corrigido tirando essa coluna (o botão central já é posicionado de forma absoluta por cima, não precisa de espaço reservado); agora Início/Config dividem a largura em metades, ficando bem mais perto do botão.
- [x] **Ajuste após feedback**: as estrelinhas decorativas "✦" do `GradientHeader` (usadas no banner do Início) ficavam coladas na pill de navegação "◀ Hoje ▶" no cabeçalho da Agenda — `GradientHeader` ganhou a prop `showSparkles` (default `true`), desligada só na Agenda.
- [x] `tsc` + `build` limpos
- [x] Teste visual (Playwright): tabbar de 3 itens bem proporcionada e balanceada no Início/Config; clique no card novo abre o editor do catálogo com o botão de voltar funcionando; cabeçalho da Agenda sem as estrelinhas, Início mantém elas; nenhuma regressão na barra flutuante própria do editor (continua escondendo a tabbar, como antes).
- [x] Commit — `<preenchido no commit>`

## Como retomar em outra sessão

Leia este arquivo + a seção "Resumo do plano" acima antes de continuar. Siga a mesma disciplina de teste + commit por fase usada no resto do projeto.
