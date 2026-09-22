# Testes manuais — Agendamento + StudioMenu+ (local)

> Documento de acompanhamento dos testes manuais da funcionalidade de agendamento, feita em outra sessão/estação (fases 2 a 7 do `docs/PLANO_AGENDAMENTO_STUDIOMENU_PLUS.md`). Eu já revisei o código de tudo com atenção; este documento é pra **você** validar na prática, no navegador, rodando local (`localhost:3000`). Vou marcando aqui (`[x]`) cada item conforme você me disser que passou, e anotando o que precisar de ajuste.

**Como usar**: siga as etapas na ordem (elas dependem umas das outras). Pode testar um bloco inteiro e me mandar o resultado de uma vez ("1 a 5 ok, no 6 deu isso aqui..."), não precisa ser item por item.

**Servidor**: já está rodando em `http://localhost:3000` (processo em background nesta sessão).

---

## Resumo da revisão de código (antes de qualquer teste)

Li o código de tudo que foi implementado na outra sessão (não só o que o documento do plano relatava — o código de verdade). Achados:

✅ **Bem feito, consistente com os padrões do projeto**: autenticação sempre resolve o dono real do recurso no banco antes de checar a sessão (nunca confia em slug vindo do cliente), rate limiting em todas as rotas nunca antes protegidas, erros genéricos pro cliente + log detalhado no servidor, antifraude na cobrança (só libera o Plus depois de confirmar pagamento de verdade), validação do webhook do Asaas por segredo compartilhado (mais rigoroso que a própria referência LashAgenda, que nunca implementou isso de verdade), deduplicação de aviso no Telegram.

🔧 **Corrigido agora por mim, antes dos testes**: `src/components/config/SubscriptionSection.tsx` usava `confirm()` nativo do navegador no botão de cancelar assinatura — isso quebra uma regra explícita do projeto (sem alert/confirm nativo, só modais próprios) que inclusive já tinha sido corrigida em outro lugar do sistema durante a auditoria de segurança. Troquei por uma confirmação inline no próprio card, sem popup nativo.

⚠️ **Dois pontos que quero que você teste com atenção, porque encontrei uma inconsistência de design** (não é bug de código quebrado, é uma decisão que ficou capenga):

1. A aba **Agenda** do app só libera o conteúdo de verdade quando `plan_tier='plus'` **e** `subscription_status='ativo'`. Só que o toggle manual "Agendamento automático" que você liga no admin (`booking_enabled`) é **independente** disso — é possível ligar o agendamento pro cliente final sem a profissional estar no Plus. Resultado: se você ligar `booking_enabled` manualmente num catálogo que não é Plus, clientes conseguem agendar de verdade (isso funciona), mas a profissional **não consegue ver nem gerenciar** esses agendamentos na Agenda (fica bloqueada com a tela de upsell). Ou seja, os agendamentos ficam "presos" sem ninguém conseguir confirmá-los pela aba Agenda. Isso é testável no passo 8 abaixo.
2. Quando o pagamento do Plus é confirmado (`activateSubscription`), o código liga `plan_tier`/`subscription_status`, mas **não liga o `booking_enabled` automaticamente**. Ou seja: hoje, mesmo pagando o Plus, o agendamento automático pro cliente final só funciona se **você também** ligar manualmente o toggle no admin depois. Isso é testável no passo 13.

**✅ Resolvidos** (2026-09-14, depois dos testes manuais): você confirmou os dois comportamentos na prática (item 6.1 e o toggle do admin continuando "Ligado" depois do webhook simulado) e escolheu a correção. Implementado:

1. A Agenda (e o card do Início) agora libera o conteúdo real com base em `booking_enabled`, não em `plan_tier`/`subscription_status` diretamente — é essa flag que de fato diz se o agendamento está ligado pro cliente final, seja via Plus ou via toggle manual do admin. Quando liberado sem ser Plus de verdade, o Início mostra "Agendamento automático ativo" em vez de "StudioMenu+ ativo" (pra não mentir sobre o plano).
2. `activateSubscription` (ativação real via Asaas) agora liga `booking_enabled` junto — pagar o Plus já libera o agendamento pro cliente final sem precisar de um passo manual extra no admin. Cancelamento definitivo (`subscription_status='cancelado'`) desliga `booking_enabled` junto; suspensão por atraso (`'suspenso'`) não mexe nisso de propósito, pra não cortar agendamentos já em andamento por um atraso pontual — o toggle do admin continua disponível como via de escape se for preciso agir antes.

Testado via webhook simulado nos 3 cenários (ativação, cancelamento, suspensão) + conferido o HTML renderido da Agenda/Início nos casos "Plus real" e "admin ligou manualmente sem ser Plus". Arquivos: `src/lib/billing-service.ts`, `src/lib/professional-app-service.ts`, `src/app/app/[slug]/agenda/page.tsx`, `src/app/app/[slug]/inicio/page.tsx`. `tsc` + `build` limpos.

---

## Catálogo de teste já preparado

- **Slug**: `teste-local-1`
- **Nome**: Ana Beauty Teste
- **Link de produção**: http://localhost:3000/c/teste-local-1
- **Link de edição (antigo, os 2 links de sempre)**: http://localhost:3000/c/teste-local-1?edit=ede677ef7f08c9d5ab525fb98dd2281c
- **Link do app (novo)**: http://localhost:3000/api/professional/login?slug=teste-local-1&token=ede677ef7f08c9d5ab525fb98dd2281c
- **2 serviços já cadastrados**: "Volume Russo" (R$180, 2h, **com** duração em minutos configurada → agendável automaticamente) e "Design de Sobrancelhas" (R$60, **sem** duração configurada → deve continuar indo direto pro WhatsApp mesmo com agendamento ligado, é o teste do fallback).
- **Admin**: http://localhost:3000/admin (senha: `5669`)

Catálogo será apagado ao final de todos os testes (ou antes, se você preferir).

---

## Bloco 1 — Regressão: nada do que já existia pode ter quebrado

- [X] **1.1** Abra o link de produção (`/c/teste-local-1`). O catálogo carrega normal, mostra os 2 serviços.
- [X] **1.2** Clique no serviço "Design de Sobrancelhas" → abre o modal de detalhe → botão "Agendar" deve ser um link que abre o WhatsApp direto (comportamento de sempre, `booking_enabled` ainda está desligado nesse catálogo).
- [X] **1.3** Abra o link de edição antigo (`?edit=...`). O editor visual abre normal, dá pra editar textos/fotos como sempre.
- [X] **1.4** No editor, abra "editar" o serviço "Volume Russo" — deve aparecer um campo novo **"Duração em minutos (para agendamento automático)"**, preenchido com `120`, além do campo de texto livre de duração de sempre ("2h"). Só confira que aparece, não precisa mudar nada (ou mude e salve, se quiser testar o salvamento).
- [X] **1.5** Salve o catálogo (botão de salvar de sempre) — confirma que salva sem erro.

---

## Bloco 2 — Painel Admin

- [X] **2.1** Entre em `/admin` com a senha, vá em "Catálogos".
- [X] **2.2** Encontre o card "Ana Beauty Teste". Deve ter um badge novo **"Catálogo"** (cinza, ao lado do badge Pendente/Aprovado de sempre) e um botão **"Agendamento automático: Desligado"**.
- [X] **2.3** Deve aparecer uma caixinha **"Link do App"** com botão de copiar.
- [X] **2.4** Clique no botão de agendamento automático pra ligar. Deve mudar pra "Ligado" e o texto ficar destacado.

---

## Bloco 3 — Entrando no app da profissional

- [X] **3.1** Abra o **link do app** (`/api/professional/login?slug=...`). Deve te redirecionar pra `/app/teste-local-1/inicio` já logada (sem pedir senha).
- [X] **3.2** Tela **Início**: deve mostrar "Olá, Ana", os 2 links de sempre (produção e edição) com botão de copiar cada um, e um cartão do **StudioMenu+ bloqueado** (já que não é Plus ainda) com botão "Assinar por R$ 69,90/mês".
- [X] **3.3** Confira a barra de navegação inferior: 4 abas (Início, Catálogo, Agenda, Config).
- [X] **3.4** Clique na aba **Catálogo** — deve abrir o mesmo editor visual de sempre, com um botão de voltar no canto superior esquerdo (a barra de abas some aqui de propósito, porque colidiria com a barra do editor).
- [X] **3.5** Volte (botão de voltar) e confira que retorna pro Início.

---

## Bloco 4 — Configurações (Config)

- [X] **4.1** Vá na aba **Config**. Deve mostrar "Horários de atendimento" (os 7 dias da semana, todos fechados por padrão) e "Bloqueios e folgas" (vazio).
- [X] **4.2** Marque pelo menos **hoje e amanhã** como abertos (ex: 09:00 às 18:00) e clique em "Salvar horários". Deve confirmar salvo.
- [X] **4.3** Recarregue a página — os horários salvos devem continuar marcados (não voltar pro padrão).
- [X] **4.4** Em "Bloqueios e folgas", crie um bloqueio de teste (ex: daqui a 3 dias, dia inteiro, motivo "Teste"). Deve aparecer na lista.
- [X] **4.5** Apague esse bloqueio de teste (ícone de lixeira). Deve sumir da lista.

---

## Bloco 5 — Agendamento pelo cliente final (o catálogo público)

- [X] **5.1** Abra de novo o link de produção (`/c/teste-local-1`, aba anônima ou outra janela).
- [X] **5.2** Clique em "Volume Russo" → o botão "Agendar" agora deve abrir um **wizard** (dia → horário → nome/WhatsApp → confirmação), não ir mais pro WhatsApp direto.
- [X] **5.3** Clique em "Design de Sobrancelhas" → o botão "Agendar" **continua indo direto pro WhatsApp** (esse serviço não tem duração configurada — é o teste do fallback).
- [X] **5.4** No wizard do Volume Russo: escolha um dia (deve mostrar horários livres de 09:00 até 16:00, já que o serviço dura 2h e o expediente vai até 18:00), escolha um horário, preencha nome e WhatsApp, confirme.
- [X] **5.5** Deve aparecer a tela de confirmação com o resumo (serviço, dia/hora, preço) e um botão "Avisar no WhatsApp →". Não precisa clicar nele de verdade, só confirmar que o link parece correto (passe o mouse ou copie o link — deve conter o número da Ana e a mensagem certa).
- [X] **5.6** Feche o wizard, abra nele de novo pro mesmo dia — o horário que você acabou de reservar não deve mais aparecer na lista.

---

## Bloco 6 — Verificando o ponto de atenção #1 (Agenda sem ser Plus)

- [X] **6.1** Volte no app da profissional, vá na aba **Agenda**. Como o catálogo não é Plus, deve mostrar a tela de upsell bloqueada — **mesmo o agendamento do passo 5.4 tendo sido criado de verdade no banco**. Confirma que é isso que aparece (essa é a inconsistência que te expliquei acima).

---

## Bloco 7 — Tentando assinar sem chave real do Asaas

- [X] **7.1** No Início ou na Agenda, clique em "Assinar por R$ 69,90/mês" — deve te levar pra Config, seção "Minha assinatura".
- [X] **7.2** Preencha um e-mail e CPF de teste (ex: `teste@teste.com` / `123.456.789-00`) e clique em assinar.
- [X] **7.3** Como não tem a chave do Asaas configurada ainda, espera-se um erro amigável tipo "Pagamentos ainda não configurados. Tente novamente mais tarde." (não um erro feio/quebrado).

---

## Bloco 8 — Simulando um pagamento aprovado (eu faço essa parte)

Quando você chegar aqui, me avisa que eu disparo um webhook fabricado (do jeito que a outra sessão testou a Fase 5, sem precisar da chave real) simulando `PAYMENT_CONFIRMED` pra esse catálogo, e a gente confere junto:

**✅ Webhook disparado** (2026-09-14): setei `asaas_subscription_id`/`asaas_customer_id` fake no pedido de teste e chamei `POST /api/billing/webhook` com o evento `PAYMENT_CONFIRMED` e o token correto. Resposta `200 {"success":true}`, confirmado no banco: `plan_tier` virou `"plus"`, `subscription_status` virou `"ativo"`. Isso também disparou uma notificação real no seu Telegram (esperado). Agora é só conferir na tela.

- [X] **8.1** Depois do webhook simulado, recarregue o Início — o cartão do StudioMenu+ deve aparecer **desbloqueado**.
- [X] **8.2** Vá na aba **Agenda** — agora deve mostrar de verdade: o agendamento pendente criado no passo 5.4 deve aparecer na fila "Aguardando confirmação".
- [X] **8.3** **Ponto de atenção #2**: confira no admin (`/admin/catalogos`) se o toggle "Agendamento automático" continua do jeito que você deixou no passo 2.4, ou se mudou sozinho — isso confirma se ativar o Plus liga o `booking_enabled` automaticamente ou não (hoje, pelo código, **não deveria ligar sozinho** — é o ponto que te falei).

**🐛 Bug encontrado no 8.2 e corrigido**: o agendamento pendente do Volume Russo apareceu **duas vezes** na tela da Agenda — uma na fila "Aguardando confirmação", outra logo abaixo em "Agendamentos do dia". Conferi no banco: existe só 1 linha em `appointments`, não é duplicação de dado. É a página buscando duas listas separadas (fila de pendentes + lista do dia) sem excluir da segunda o que já aparece na primeira — quando o pendente cai no dia visualizado, ele conta nas duas. Corrigido em `src/app/app/[slug]/agenda/page.tsx` (a lista do dia agora exclui quem já está na fila de pendentes). `tsc` limpo, hot-reload do `next dev` já deve ter aplicado — só recarregar a página pra confirmar que sumiu a duplicata antes de seguir pro Bloco 9.

---

## Bloco 9 — Usando a Agenda de verdade

- [X] **9.1** Na fila "Aguardando confirmação", clique em "Confirmar" no agendamento do Volume Russo. Deve sumir da fila e aparecer um aviso "Avise [nome] pelo WhatsApp" com link.
- [X] **9.2** Navegue pros dias com as setas (◀ ▶) até achar o dia em que você marcou o agendamento — ele deve aparecer na lista "Agendamentos do dia", já como "Confirmado".
- [X] **9.3** Clique em "+ Agendamento" e crie um agendamento manual (escolha o serviço, data, horário, nome, WhatsApp) — deve criar direto como "Confirmado" (diferente do agendamento do cliente, que nasce "Aguardando").
- [x] **9.4** Clique em "🔒 Bloquear" e bloqueie um horário específico (ex: hoje, 12h às 13h, motivo "Almoço") — depois confira no catálogo público que esse horário sumiu da disponibilidade daquele dia.

**🐛 Bug real encontrado e corrigido**: você testou com bloqueio de dia inteiro e ainda conseguiu criar um agendamento manual nesse dia pela Agenda. Investiguei: o agendamento do **cliente final** respeitava o bloqueio corretamente (confirmei via API direta — zero horários disponíveis nos dias bloqueados). O problema era só no agendamento **manual da profissional** (`+ Agendamento`), que não conferia horário de atendimento nem bloqueios, só evitava bater em cima de outro agendamento já existente.

Te perguntei o que fazer e você escolheu a opção recomendada: o agendamento manual agora respeita expediente e bloqueios, igual ao do cliente (sem o buffer de 30min de "hoje", já que faz sentido ela poder marcar alguém que está na frente dela agora mesmo). Implementado em `src/lib/scheduling/availability.ts` (nova função `isInstantAvailable`, pra checar um horário exato digitado à mão, não só os horários de 30 em 30 que o wizard do cliente oferece) + `src/lib/scheduling/slot-lookup.ts` (centralizei a busca no banco, que estava duplicada em duas rotas, agora usada em três) + `src/app/api/professional/appointments/route.ts`.

Testei via curl: tentativa de agendamento manual num dia com bloqueio de dia inteiro → `409` rejeitado corretamente. Tentativa num horário livre mas fora da grade de 30min (09:15) → funcionou normal. `tsc` + `build` limpos. Recarregue a página e teste de novo o bloqueio + tentativa de agendamento manual no mesmo dia — agora deve ser recusado com a mensagem "Esse horário está fora do expediente ou bloqueado."

---

## Bloco 10 — Cancelando a assinatura

- [X] **10.1** Vá em Config → Minha assinatura → "Cancelar assinatura". Deve aparecer a confirmação inline que acabei de corrigir (**não** deve abrir nenhum popup nativo do navegador).
- [X] **10.2** Confirme o cancelamento — deve voltar pro estado "não assinante".
- [X] **10.3** Confira a aba Agenda de novo — deve voltar a mostrar a tela de upsell bloqueada.

---

## Bloco 11 — PWA (só visual, sem instalar ainda)

- [X] **11.1** Abra as ferramentas de desenvolvedor do navegador (F12) → aba "Application"/"Aplicativo" → confira que existe um "Manifest" carregado (nome "StudioMenu", ícones) e um "Service Worker" registrado como ativo — só olhando, não precisa instalar de verdade agora (isso fica pra quando formos testar no celular, depois do deploy).

---

## Ao final

Depois de tudo testado (e eu já ter marcado aqui), a gente decide junto o que fazer com os 2 pontos de atenção e aí sim parte pros 4 itens que faltavam (Asaas de verdade, deploy, PWA no celular, ícone). O catálogo de teste (`teste-local-1`) é apagado no final.
