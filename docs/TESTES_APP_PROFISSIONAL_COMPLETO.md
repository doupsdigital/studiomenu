# Testes manuais completos — App da profissional (`/app/[slug]`)

> Bateria nova e mais completa, depois da reestruturação visual (Fases 1 a 8 de `docs/REESTRUTURACAO_VISUAL_APP.md`). O objetivo aqui não é só "achar bug" — é confirmar que a experiência inteira das 3 abas (Início, Agenda, Config) está estável e agradável de usar, antes de partir pra Asaas real, deploy na Vercel, PWA no celular e ícone definitivo. A bateria anterior (`docs/TESTES_AGENDAMENTO_LOCAL.md`) testou a funcionalidade logo depois de implementada; esta aqui reteste tudo com o visual novo e cobre cenários que não existiam antes (modais de confirmação, fila expansível, card de destaque do catálogo, tabbar de 3 itens).

**Como usar**: siga os blocos na ordem (alguns dependem de dado criado no bloco anterior). Pode testar um bloco inteiro e me mandar o resultado de uma vez. Eu vou marcando `[x]` aqui conforme você for confirmando.

**Servidor**: `http://localhost:3000` (rodando em background nesta sessão).

**Antes de começar**: limpei a base de dados do catálogo de teste (estava com lixo de sessões de teste anteriores — 5 agendamentos todos já confirmados, sem nenhum pendente pra testar o card amarelo, e 6 bloqueios de horário duplicados). Agora está limpo: 0 agendamentos, 0 bloqueios, horário de atendimento configurado **segunda a sábado, 09h–18h** (domingo fechado, de propósito, pra você também testar o comportamento de "dia fechado").

---

## Catálogo de teste

- **Slug**: `teste-local-1`
- **Link de produção (cliente final)**: http://localhost:3000/c/teste-local-1
- **Link do app (profissional, login automático)**: http://localhost:3000/api/professional/login?slug=teste-local-1&token=ede677ef7f08c9d5ab525fb98dd2281c
- **Link de edição direto do catálogo**: http://localhost:3000/c/teste-local-1?edit=ede677ef7f08c9d5ab525fb98dd2281c
- **2 serviços**: "Volume Russo" (R$180, 2h, **com** duração configurada → agendável) e "Design de Sobrancelhas" (R$60, **sem** duração → sempre vai direto pro WhatsApp, é o teste do fallback)
- **Admin**: http://localhost:3000/admin (senha: `5669`)
- **Estado atual**: StudioMenu+ ativo, `booking_enabled` ligado (já é Plus de verdade, não precisa reativar pra testar a Agenda)

---

## Bloco 1 — Início

- [X] **1.1** Abra o link do app. Deve entrar direto em `/app/teste-local-1/inicio`, sem pedir senha.
- [X] **1.2** Confira a saudação no banner rosé — deve bater com a hora atual (Bom dia/Boa tarde/Boa noite) e mostrar a data de hoje por extenso, e o badge **PLUS** no canto.
- [X] **1.3** Os 2 cards de estatística (Agendamentos hoje / Aguardando confirmação) devem mostrar **0** nos dois, já que a base está limpa.
- [X] **1.4** O card "Compartilhe sua Agenda" — clique em "Copiar Link Público", deve confirmar "Link copiado!" por alguns segundos e voltar ao normal.
- [X] **1.5** Logo abaixo, o card rosé escuro **"Editar meu catálogo"** — esse é o novo, substituiu o link de edição que copiava. Confirme que **não tem mais** nenhuma opção de copiar link nessa tela (isso ficou só no admin agora, de propósito).
- [X] **1.6** Clique no card "Editar meu catálogo" — deve abrir o editor visual do catálogo (o mesmo de sempre), com um botão de voltar (seta) no canto superior esquerdo.
- [X] **1.7** Clique no botão de voltar — deve retornar pro Início.
- [x] **1.8** Confira o card verde "StudioMenu+ ativo" no fim da tela (já que é Plus de verdade nesse catálogo).

---

## Bloco 2 — Navegação (tabbar de 3 itens)

- [X] **2.1** Na parte de baixo, confirme que agora são só **3 posições**: Início (esquerda), botão redondo elevado no meio (Agenda), Config (direita) — sem mais o item "Catálogo" na barra.
- [X] **2.2** Repare no espaçamento — Início e Config devem estar relativamente próximos do botão central, sem um vão vazio grande nas laterais.
- [X] **2.3** Clique no botão central (Agenda) — deve ir pra aba Agenda e o ícone ficar destacado (cor rosé mais escura).
- [X] **2.4** Clique em Config — mesma coisa, item ativo destacado.
- [X] **2.5** Volte pro Início pela tabbar.
- [X] **2.6** Entre de novo na aba Catálogo (pelo card do Início) — confirme que a tabbar **some** enquanto o editor está aberto (ela colidiria com a barra própria do editor lá embaixo).

---

## Bloco 3 — Configurações (Config)

- [X] **3.1** Vá em Config. Deve mostrar 3 cartões fechados por padrão: "Horários de atendimento", "Bloqueios e folgas", "Minha assinatura".
- [X] **3.2** Clique em "Horários de atendimento" — deve expandir e mostrar segunda a sábado marcados como abertos (09:00–18:00) e domingo fechado (acabei de configurar assim).
- [X] **3.3** Clique de novo no cabeçalho — deve recolher.
- [X] **3.4** Abra "Bloqueios e folgas" — deve estar vazio (limpei antes de começar).
- [X] **3.5** Crie um bloqueio de **dia inteiro** pra amanhã, motivo "Folga teste". Deve aparecer na lista.
- [X] **3.6** Crie um segundo bloqueio, dessa vez **parcial** (não dia inteiro), pra hoje, das 12h às 13h, motivo "Almoço". Deve aparecer também.
- [X] **3.7** Apague o bloqueio "Folga teste" (ícone de lixeira) — deve sumir, o de "Almoço" continua.
- [X] **3.8** Abra "Minha assinatura" — deve mostrar o status Plus ativo (já que o catálogo já está assinante) com a opção de cancelar.
- [X] **3.9** **Não cancele ainda** — isso é testado no Bloco 8, por último, já que desliga o agendamento.

---

## Bloco 4 — Agendamento pelo cliente final (gera os dados que os próximos blocos usam)

- [X] **4.1** Abra o link de produção numa aba anônima/outra janela (simulando a cliente).
- [X] **4.2** Clique em "Design de Sobrancelhas" → "Agendar" deve ir direto pro WhatsApp (sem duração configurada, comportamento de sempre).
- [X] **4.3** Clique em "Volume Russo" → "Agendar" deve abrir o wizard (dia → horário → nome/WhatsApp → confirmação).
- [X] **4.4** Tente escolher o dia de **domingo** mais próximo no calendário do wizard — não deve oferecer nenhum horário (expediente fechado nesse dia).
- [X] **4.5** Escolha **hoje**, um horário **fora** do intervalo 12h–13h (o bloqueio de almoço que você criou no 3.6). Confirme que 12h e 12h30 **não aparecem** na lista de horários livres.
- [X] **4.6** Complete o agendamento com o nome "Cliente Um" e um WhatsApp de teste (ex: `11999990001`).
- [X] **4.7** Deve aparecer a tela de confirmação com o resumo e um link "Avisar no WhatsApp →" — não precisa clicar, só confirmar que o link parece certo.
- [X] **4.8** Repita o processo (feche e abra o wizard de novo) e crie um **segundo** agendamento, "Cliente Dois", pra **amanhã** num horário qualquer da manhã.
- [X] **4.9** No fim, você deve ter 2 agendamentos pendentes no sistema (Cliente Um hoje, Cliente Dois amanhã) — isso alimenta os blocos seguintes.

---

## Bloco 5 — A fila "Aguardando confirmação" (card amarelo expansível)

- [X] **5.1** Volte pro app da profissional, vá na aba **Agenda**.
- [X] **5.2** Confirme que o card amarelo "Aguardando confirmação" aparece **recolhido** por padrão, mostrando só o cabeçalho com um contador **"2"**.
- [X] **5.3** Clique no cabeçalho do card — deve **expandir** e mostrar as 2 linhas (Cliente Um e Cliente Dois), cada uma com botões "Aprovar" (verde) e "Recusar" (vermelho/contorno).
- [X] **5.4** Clique de novo no cabeçalho — deve **recolher** de volta.
- [X] **5.5** Expanda de novo e deixe aberto pros próximos passos.

---

## Bloco 6 — Fluxo de aprovar/recusar (modais novos)

- [X] **6.1** Clique em "Aprovar" na linha do **Cliente Um**. Deve abrir um modal "Confirmar agendamento" com um cabeçalho gradiente, os dados do cliente/serviço, e 3 botões: **"Confirmar e enviar pelo WhatsApp"** (verde), **"Confirmar sem enviar"** (rosé), e "Voltar".
- [X] **6.2** Clique em **"Voltar"** — o modal deve fechar sem confirmar nada (o Cliente Um continua pendente).
- [X] **6.3** Clique em "Aprovar" de novo no Cliente Um, agora clique em **"Confirmar sem enviar"**. Deve fechar o modal e abrir um modal de **sucesso** (círculo verde, "Agendamento Confirmado!", resumo com cliente/serviço/data/horário) com um botão "Concluir e Fechar".
- [X] **6.4** Feche o modal de sucesso — o Cliente Um deve ter **sumido** da fila de pendentes (agora só 1 pendente).
- [X] **6.5** Clique em "Recusar" no **Cliente Dois**. Deve abrir o modal "Recusar agendamento", com um campo opcional de **"Motivo"** e 3 botões: "Recusar e notificar pelo WhatsApp" (vermelho), "Recusar sem notificar" (rosé), "Voltar".
- [X] **6.6** Digite um motivo qualquer (ex: "Sem disponibilidade") e clique em **"Recusar e notificar pelo WhatsApp"**. Deve abrir uma nova aba/janela do WhatsApp com uma mensagem pronta mencionando o motivo — confira que o texto faz sentido (pode fechar a aba do WhatsApp depois, sem precisar enviar de verdade).
- [X] **6.7** De volta ao app, deve aparecer o modal de sucesso "Agendamento Recusado". Feche.
- [X] **6.8** A fila de pendentes deve estar **vazia** agora (os 2 foram tratados). ✅ **Testado e corrigido**: você reportou que o card amarelo **sumia inteiro** quando zerava — conferi no código-fonte do LashAgenda e esse era, na verdade, o comportamento exato de lá também (`pendingAppts.length > 0 &&` no `Agendamentos.tsx` original). Ainda assim, você preferiu divergir da referência aqui: agora o card **sempre fica visível**, com o contador mostrando "0" e uma mensagem "Nenhum agendamento aguardando confirmação no momento." ao expandir vazio. Implementado em `AgendaClient.tsx`.

---

## Bloco 7 — A grade de horário do dia

- [X] **7.1** Ainda na Agenda, olhando o dia de **hoje**: o agendamento do Cliente Um (confirmado no bloco 6) deve aparecer como um **bloco verde** na grade, na hora certa, com "Confirmado" escrito nele.
- [X] **7.2** O horário de almoço (12h–13h, bloqueado no Bloco 3) deve aparecer **cinza/travado** na grade, sem deixar clicar.
- [X] **7.3** Clique num horário **livre** qualquer da grade (fora do bloco do Cliente Um e fora do almoço) — deve abrir o formulário de "+ Novo agendamento" já **pré-preenchido** com aquele horário. ✅ **Corrigido**: você reportou que ele aparecia como um card fixo empurrando o conteúdo da tela, em vez de modal/bottom sheet. Agora `ManualBookingForm` e `BlockSlotForm` (mesmo problema) abrem como bottom sheet de verdade, com fundo escurecido atrás e X pra fechar, igual ao resto dos modais do app.
- [X] **7.4** Cancele esse formulário sem salvar (feche).
- [X] **7.5** Clique **no bloco verde do Cliente Um** — deve abrir um painel de detalhe (sheet de baixo pra cima) com os dados do agendamento e um botão "Cancelar agendamento". ✅ **Corrigido**: o botão parecia desabilitado (fundo neutro claro). Troquei pro mesmo estilo do "Recusar" usado no resto do app (contorno vermelho, texto vermelho) — mais claramente uma ação destrutiva e clicável. Nessa investigação achei e corrigi um **bug maior por trás**: um CSS antigo do catálogo público (`catalog-theme.css`) zera a borda de *todo* `<button>` da aplicação de forma global, o que estava apagando silenciosamente a borda de vários outros botões do app da profissional também (ex: "Recusar" na fila de pendentes, "Voltar" nos modais de aprovar/recusar) — ninguém tinha notado ainda porque o efeito é sutil. Corrigido com uma regra CSS escopada só ao app da profissional, sem tocar no catálogo.
- [X] **7.6** Feche esse painel sem cancelar.
- [X] **7.7** Use as setas ◀ ▶ no topo pra navegar até **amanhã** — o dia do Cliente Dois. **Mudou depois do seu teste do 6.8**: agendamentos recusados/cancelados agora aparecem na grade em **cinza**, com "Recusado"/"Cancelado" escrito, como rastro histórico (igual ao LashAgenda — antes eles simplesmente desapareciam). O horário continua livre pra qualquer outro agendamento normalmente. Confirme que o card do Cliente Dois aparece cinza nesse dia, não mais sumido.
- [X] **7.8** Navegue até o dia que você bloqueou como "Folga teste" no Bloco 3 — espera: você já apagou esse bloqueio no passo 3.7, então esse dia deve estar **normal**, não bloqueado. Se ainda aparecer bloqueado, é bug.
- [X] **7.9** Clique em "Hoje" na navegação pra voltar pro dia atual.

---

## Bloco 8 — Ações rápidas da Agenda (toolbar)

- [X] **8.1** Confirme que os 3 botões do topo (**"+ Novo"**, **"🔒 Trancar"**, **"Dia ⌄"**) têm o mesmo tamanho, mesma cor (rosé), alinhados lado a lado, ocupando a largura toda igualmente.
- [X] **8.2** Clique em "+ Novo" — abre o formulário de agendamento manual. Crie um agendamento pra depois de amanhã, qualquer serviço/horário livre, nome "Manual Teste". Deve criar **direto como confirmado** (sem passar pela fila de pendentes, diferente do agendamento feito pela cliente). ✅ **Melhorado**: você notou que não aparecia nenhuma confirmação visual depois de criar — agora mostra o mesmo modal de sucesso ("Agendamento Criado!") usado no resto do app, com o resumo (cliente/serviço/data/horário).
- [X] **8.3** Clique em "🔒 Trancar" — abre o formulário de bloqueio de horário. Bloqueie amanhã à tarde (ex: 14h–16h), motivo "Compromisso". Confirme que aparece bloqueado na grade daquele dia. ✅ **Melhorado**: (a) ganhou o mesmo modal de sucesso ("Horário Bloqueado!", com Data/Período/Motivo); (b) a célula bloqueada na grade agora mostra um ícone de cadeado (só na marca da hora cheia, igual ao LashAgenda) em vez de só ficar cinza sem explicação.
- [X] **8.4** ✅ **Implementado** (deixou de ser só visual): o botão agora é um seletor de verdade com 2 opções — **Dia** (grade de horário, como já era) e **Mês** (calendário do mês inteiro, com cadeado nos dias fechados e chips coloridos por status pra cada agendamento — até 2 por dia, "+N mais" se tiver mais). Clicar num dia do calendário mensal leva direto pra visão diária daquele dia. Navegação ◀ Hoje ▶ passa a mover por mês inteiro quando está na visão Mês.
  - [ ] **8.4.1** Toque em "Dia" → escolha "Mês" no menu — deve trocar pra um calendário de 6 semanas (domingo a sábado), com o dia de hoje destacado em círculo rosé.
  - [ ] **8.4.2** Domingos devem aparecer com um cadeado pequeno (fechado, sem horário de atendimento configurado).
  - [ ] **8.4.3** Navegue ◀ ▶ pra ver o mês anterior/seguinte — o cabeçalho deve trocar pra "Mês de Ano" (ex: "Outubro de 2026"), sem mostrar dia nenhum.
  - [ ] **8.4.4** Crie 2-3 agendamentos de teste em dias diferentes do mês (pode usar "+ Novo") e confirme que aparecem como chips coloridos nas células certas do calendário.
  - [ ] **8.4.5** Toque num dia qualquer do calendário — deve navegar direto pra visão **Dia** daquela data, com o seletor voltando pra "Dia" sozinho.
  - [ ] **8.4.6** Toque em "Hoje" estando na visão Mês — deve voltar pro mês atual (não muda pra visão Dia sozinho).

---

## Bloco 9 — Cabeçalho da Agenda

- [ ] **9.1** Confira o cabeçalho gradiente: título "Agenda" + data por extenso à esquerda, navegação **◀ Hoje ▶** como uma pílula única à direita.
- [ ] **9.2** Confirme que **não tem** as estrelinhas decorativas "✦" nesse cabeçalho (elas ficavam coladas na pílula de navegação — removidas só aqui).
- [ ] **9.3** Volte pro Início e confirme que lá o banner de saudação **continua** com as estrelinhas (elas só saíram do cabeçalho da Agenda, não do resto do app).

---

## Bloco 10 — Cancelando um agendamento já confirmado

- [ ] **10.1** Na Agenda de hoje, clique no bloco verde do Cliente Um de novo (o painel de detalhe do passo 7.5).
- [ ] **10.2** Clique em "Cancelar agendamento" — deve cancelar direto, **sem** abrir nenhum modal de WhatsApp (esse fluxo de 2 passos é só pra aprovar/recusar pendente, não pra cancelar algo já confirmado).
- [ ] **10.3** Confirme que o bloco sumiu (ou virou cinza "Cancelado", dependendo do que a grade mostrar) e os cards de estatística do Início refletem isso ao recarregar.

---

## Bloco 11 — Cancelando a assinatura (por último, porque desliga o agendamento)

- [ ] **11.1** Vá em Config → "Minha assinatura" → "Cancelar assinatura". Deve aparecer uma confirmação **inline no próprio card** (não um popup nativo do navegador).
- [ ] **11.2** Confirme o cancelamento.
- [ ] **11.3** Vá na aba Agenda — deve voltar a mostrar a tela de "assine o StudioMenu+" bloqueada (mesmo com os agendamentos que já existem no banco).
- [ ] **11.4** No Início, o card verde deve sumir e voltar o card de upsell do StudioMenu+.

**Depois desse bloco, me avise que eu reativo o Plus de novo** (webhook simulado) caso você queira deixar o catálogo de teste num estado "ativo" pra qualquer teste extra que surgir, ou podemos já partir pra apagar o catálogo de teste.

---

## Bloco 12 — PWA (só conferência visual, sem instalar)

- [ ] **12.1** F12 → aba "Application"/"Aplicativo" → confirme que existe um "Manifest" carregado (nome "StudioMenu") e um "Service Worker" ativo. Instalar de verdade no celular fica pra depois do deploy.

---

## Ao final

Me manda os resultados bloco a bloco (pode ser "1 a 5 ok, no 6.8 aconteceu isso..."). Qualquer coisa que travar, dar erro, ou simplesmente parecer estranha na experiência (não precisa ser um erro técnico) — anota e me fala, é exatamente esse tipo de coisa que essa bateria quer pegar antes de ir pra produção. No final a gente decide junto se o catálogo de teste (`teste-local-1`) fica ou é apagado.
