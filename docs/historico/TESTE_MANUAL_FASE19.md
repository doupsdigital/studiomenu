# Teste manual — Fase 19 (tier Básico + funil de primeiro contato)

Catálogo de teste: `teste-manual-fase19` (descartável, apagar no final)
Ambiente: **Preview** (sandbox do Asaas, sem dinheiro real)

**Link do app (magic link):**
`https://studiomenu-git-fase19-plano-basico-doupsdigital-s-projects.vercel.app/api/professional/login?slug=teste-manual-fase19&token=0155933ba7ac30a0b158572abc7b8822`

Abra esse link no celular (ou no navegador mesmo) — ele já loga automaticamente e te leva pra tela inicial.

---

## A. Primeiro contato (antes de assinar qualquer coisa)

- [ ] Ao abrir o link, aparece uma tela **simples**: saudação, card "Visualizar catálogo", card "Editar meu catálogo" e o card de assinar por R$39/mês — **sem** menu de navegação embaixo (Início/Agenda/Catálogo/Config)
- [ ] O card "Visualizar catálogo" abre o catálogo público normalmente
- [ ] O card "Editar meu catálogo" abre o editor visual normalmente
- [ ] Nada na tela dá a entender que é preciso "logar" ou criar conta nesse momento

## B. Assinando o Básico (R$39/mês)

- [ ] Preencher e-mail + CPF no card e apertar "Assinar por R$ 39/mês" gera um QR code Pix na tela
- [ ] O QR code aparece nítido e o botão "Copiar código Pix" funciona
- [ ] **Pra confirmar o pagamento** (sandbox, sem dinheiro real): abra o link da cobrança que aparece no painel do Asaas sandbox (Cobranças → a mais recente) e use o botão "Confirmar recebimento" por lá — **ou me avise aqui que eu confirmo via API** pra você só ver o resultado na tela
- [ ] Depois de confirmado, em até ~10s a tela troca sozinha (é o polling) pra tela inicial normal, **agora com o menu embaixo** (Início/Agenda/Catálogo/Config)
- [ ] Aparece um card pedindo pra "Criar um acesso com senha" (dá pra dispensar com o X)

## C. Config → Minha assinatura (com Básico ativo)

- [ ] Ir em Config → Minha assinatura mostra "StudioMenu Básico ativo", valor R$39/mês, botão de cancelar
- [ ] Logo abaixo aparece um card "Evolua pro StudioMenu+" com formulário pra assinar

## D. Upgrade pra Plus

- [ ] Preencher e-mail/CPF de novo (ou os mesmos) e assinar o Plus — **não deve aparecer QR code nenhum dessa vez**, a tela já deve atualizar direto pra "Plus ativo"
- [ ] O badge "PLUS" aparece no topo da tela inicial
- [ ] Aparecem os cards de próximo passo: "Defina seus horários de atendimento" e "Conheça sua agenda"
- [ ] Ir em Config → Horários de atendimento não está mais bloqueado (antes do Plus ficava travado)

## E. Cards de onboarding

- [ ] Clicar no X de um card de onboarding faz ele sumir
- [ ] Recarregar a página confirma que o card dispensado **não volta** (fica lembrado no navegador)

## F. Cancelamento

- [ ] Config → Minha assinatura → Cancelar assinatura → confirmar
- [ ] Depois de cancelar, o agendamento (Horários/Bloqueios) volta a ficar bloqueado
- [ ] A tela de "Minha assinatura" volta a oferecer assinar de novo (não trava em nenhum estado estranho)

## G. Conferência final (eu faço, só avisa quando terminar o resto)

- [ ] Apagar o catálogo de teste (`teste-manual-fase19`) do banco
- [ ] Religar a proteção de deployment no Vercel (estava desligada só pra esse teste)

---

**Se algo der errado em qualquer etapa**, me conta o que apareceu na tela (ou print) que eu já investigo.
