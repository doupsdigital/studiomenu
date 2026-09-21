# Roteiro de teste manual — Pagamento por Cartão + Pix (Fase 21)

> **RESULTADO (2026-09-21): todos os testes concluídos com sucesso** pela usuária, no celular, contra o **Asaas sandbox** (preview do branch `fase19-plano-basico`): Pix, cartão de crédito, troca de método antes de pagar, casos de borda do cartão e upgrade Básico → Plus nos dois métodos. Além disso, 23 verificações automáticas por script (cartão, Pix, troca de método, sem cobrança dupla, nada ativado sem pagar, método inválido → 400) passaram no mesmo ambiente. **Isso valida o sandbox — não substitui o teste real em produção** (ver seção "Antes de ligar o Asaas de produção" em `HANDOFF_2026-09-18_FASE19-20.md`).

Marque cada item: `[x]` deu certo, `[!]` deu errado (anote o que apareceu).

**Link de acesso (catálogo de teste, já resetado):**
`https://studiomenu-git-fase19-plano-basico-doupsdigital-s-projects.vercel.app/api/professional/login?slug=teste-manual-fase19&token=0155933ba7ac30a0b158572abc7b8822`

> Antes de começar: a "Vercel Authentication" do preview precisa estar **desligada**.
> Ambiente é **sandbox** — nenhuma cobrança é real.

**Cartão de teste do Asaas (sandbox):**
- Número: `5162 3062 1937 8829`
- Validade: `12/2030` · CVV: `318`
- Nome: qualquer · CPF: use o mesmo do formulário (ex: `249.715.637-92`) · CEP/endereço: qualquer (ex: `89223-005`, nº `277`)

Entre pelo link **de novo** sempre que eu resetar o catálogo (o reset apaga a assinatura, então volta pra tela de primeiro contato).

---

## Teste 1 — Cartão: Básico → upgrade pro Plus

1. [X] Abrir o link. Aparece a tela de primeiro contato com o card "Assine o StudioMenu Básico".
2. [X] No card há **dois botões lado a lado: Pix (com "Recomendado" em verde) e Cartão (com "Crédito")**. O **Pix vem pré-selecionado**.
3. [X] Tocar em **Cartão**: ele fica destacado e o botão principal muda pra **"Continuar pro pagamento seguro"**.
4. [X] Preencher e-mail e CPF, tocar no botão.
5. [X] Aparece a tela **"Finalize o pagamento"** com o botão **"Abrir pagamento seguro"**, o texto "Aguardando confirmação...", o botão **"Já paguei, verificar agora"** e o link **"Trocar forma de pagamento"**.
6. [X] Tocar em **Abrir pagamento seguro**: abre a página do Asaas (nova aba) com o formulário de cartão. **Só cartão** (sem boleto/Pix).
7. [X] Preencher com o cartão de teste acima e pagar.
8. [X] Voltar pra aba do app (sem recarregar): em até ~5 segundos aparece o **modal "Parabéns — Agora você tem o StudioMenu Básico"**. (Se não aparecer sozinho, tocar em "Já paguei, verificar agora" — deve aparecer na hora.)
9. [X] Tocar em "Ir para o Início": aparece a home completa com o menu embaixo.
10. [X] Config → **Minha assinatura**: "StudioMenu Básico ativo", **"Cobrança recorrente no cartão de crédito"**, mensalidade R$ 39,00.
11. [X] Na mesma tela, em "Evolua pro StudioMenu+": **não** aparece o seletor Pix/Cartão (o método atual continua valendo). Preencher/confirmar e-mail e CPF e tocar em "Assinar por R$ 69,90".
12. [X] Aparece o modal **"Agora você tem o StudioMenu+"** na hora, sem QR nem página de pagamento.
13. [X] Config → Minha assinatura: "StudioMenu+ ativo", ainda **"no cartão de crédito"**, R$ 69,90. Agenda liberada.

## Teste 2 — Pix: Básico → upgrade pro Plus (o de sempre, não pode ter quebrado)

*(Pedir pra eu resetar o catálogo antes.)*

1. [X] Abrir o link → tela de primeiro contato. Deixar o **Pix** selecionado (não tocar em Cartão).
2. [X] O botão principal diz **"Assinar por R$ 39,00"**. Preencher e-mail/CPF e tocar.
3. [X] Aparece o **QR Code Pix** + "Copiar código Pix" + "Aguardando confirmação..." + link "Trocar forma de pagamento".
4. [X] Pagar (registrar o pagamento no sandbox, como você já vinha fazendo). Aparece o modal de parabéns do Básico.
5. [X] Config → Minha assinatura: **"Cobrança recorrente via Pix"**, R$ 39,00.
6. [X] Upgrade pro Plus → modal de parabéns do Plus na hora; continua **"via Pix"**, R$ 69,90.

## Teste 3 — Trocar de método antes de pagar

*(Pedir pra eu resetar o catálogo antes.)*

1. [X] Escolher **Pix**, preencher, tocar em assinar → aparece o QR Code. **Não pagar.**
2. [X] Tocar em **"Trocar forma de pagamento"** → volta ao formulário (e-mail/CPF preenchidos).
3. [X] Escolher **Cartão** → "Continuar pro pagamento seguro" → aparece "Finalize o pagamento".
4. [X] Tocar em **"Trocar forma de pagamento"** de novo → escolher **Pix** → aparece um QR Code novamente (funcionando).
5. [X] Escolher Cartão mais uma vez e **pagar com o cartão de teste** → modal de parabéns. Em Minha assinatura: "no cartão de crédito".
6. [X] (Opcional, no painel do Asaas sandbox) conferir que existe **uma única assinatura** pra esse cliente — sem cobrança duplicada.

## Teste 4 — Casos de borda do cartão

*(Pedir pra eu resetar o catálogo antes.)*

1. [X] Escolher Cartão → assinar → **não pagar** → tocar em "Já paguei, verificar agora": aparece a mensagem **"Ainda não recebemos a confirmação..."** e nada é ativado.
2. [X] Fechar a aba do app e abrir o link de novo (sem ter pago): volta pra tela de primeiro contato, nada ativado.
3. [X] Escolher Cartão de novo e assinar: aparece a tela "Finalize o pagamento" de novo (sem erro, sem duplicar assinatura).
4. [X] Na página do Asaas, tentar um cartão inválido (ex: número `4000 0000 0000 0002`): o Asaas recusa e mostra o erro dele; no app, nada é ativado.

---

## O que anotar se algo der errado
- Em qual passo (ex: "Teste 1, item 8").
- O que apareceu na tela (print ajuda) e em qual aparelho/navegador.
- Se foi o botão "Abrir pagamento seguro" que não abriu (alguns navegadores de celular bloqueiam abas novas — me avise qual).
