# Teste manual — Plano Anual (Catálogo + Agenda) e evolução/regressão entre ciclos

> Testar no **Preview da `desenv`** (não localhost — o Asaas sandbox precisa de uma URL pública
> pra mandar os webhooks de confirmação de pagamento, localhost não funciona pra isso).
>
> **Link base de tudo:** `https://studiomenu-git-desenv-doupsdigital-s-projects.vercel.app`
>
> Esse ambiente já usa o Supabase de **dev** (migração já rodada) e o Asaas **sandbox**. Marque
> `[x]` em cada passo conforme for fazendo.

---

## Parte 0 — Preparação

- [X] Abra https://studiomenu-git-desenv-doupsdigital-s-projects.vercel.app/admin/catalogos —
      na 1ª vez pode pedir login da Vercel (Vercel Authentication, autentica com sua conta de
      sempre); depois pede a senha do admin do StudioMenu (campo único, botão **"Acessar
      Painel"**).

---

## Parte 1 — Cenários

Cada cenário abaixo é **completo em si** — nenhum passo pressupõe que você lembra de uma
"mecânica padrão" lá de cima. Sempre que um passo disser "peça no chat", é literal: cole a frase
sugerida (ou algo parecido) aqui na conversa, eu crio/configuro e te devolvo o link.

---

### 1.1 — Catálogo sozinho, sem evolução nenhuma (3 testes)

#### 1.1.A — Catálogo avulso (pagamento único)

1. [X] No chat, peça: *"cria um catálogo de teste com Catálogo avulso (pagamento único)"*.
2. [X] Eu te devolvo um **link da profissional** (começa com
       `https://studiomenu-git-desenv-doupsdigital-s-projects.vercel.app/api/professional/login?...`)
       e o **slug** do catálogo. Anota o slug, vai usar no passo 9.
3. [X] Abra esse link numa aba anônima/privada do navegador.
4. [X] A página que abre é a tela de "primeiro contato" — role até o card de pagamento no final.
5. [X] Preencha o campo **CPF ou CNPJ** (qualquer número válido, ex: gere um CPF de teste qualquer com dígitos verificadores corretos). O campo de e-mail pode ficar em branco.
6. [X] Confira que **"Pix"** está selecionado (vem marcado por padrão).
7. [X] **Antes de clicar**, confira o texto do botão: tem que ser **"Pagar R$89,90 e garantir meu Catálogo"** (não "Assinar por...", já que avulso é pagamento único). Se estiver diferente, já é um problema — anota e me avisa.
8. [X] Clique no botão. Aparece um QR code Pix na tela — não precisa escanear.
9. [X] Abra https://sandbox.asaas.com numa aba nova, faça login, vá no menu **Cobranças**, ache a cobrança mais recente (confere o nome da profissional ou o valor R$89,90), abra ela e clique no botão **"Confirmar recebimento"**.
10. [X] Volte pra aba da profissional (não precisa fazer nada, o app fica checando sozinho a cada 5 segundos). Em pouco tempo aparece a tela **"Pagamento confirmado! ✅"**.
11. [X] Abra o Supabase, projeto **`studiomenu-dev`** → menu **Table Editor** → tabela **`orders`** → ache a linha com o `slug` do passo 2.
12. [X] Confira essas colunas nessa linha:
        - `plan_tier` tem que ser **`basico`**
        - `subscription_status` tem que ser **`ativo`**
        - `asaas_subscription_id` tem que estar **vazio/null** (pagamento único não vira assinatura — se tiver preenchido, é bug)
        - `catalog_billing_mode` tem que ser **`avulso`**

#### 1.1.B — Catálogo mensal (assinatura recorrente)

1. [X] No chat, peça: *"cria um catálogo de teste com Catálogo mensal"*.
2. [X] Anota o link da profissional e o slug que eu te mandar.
3. [X] Abra o link numa aba anônima, preencha CPF/CNPJ, deixe Pix marcado (mesmos passos 3-6 do teste 1.1.A acima).
4. [X] **Antes de clicar** no botão de pagar, confira o texto: tem que ser **"Assinar por R$22,90/mês"** (repara no **"/mês"** no final — se não tiver, ou mostrar outro valor, já anota como problema).
5. [X] Clique, aparece o QR Pix. Confirme o pagamento no Asaas sandbox (mesmos passos 9-10 do teste 1.1.A).
6. [X] No Supabase, tabela `orders`, ache a linha pelo slug. Confira:
       - `plan_tier` = **`basico`**
       - `asaas_subscription_id` **preenchido** (tem que ter um valor, diferente do avulso — confirma que virou assinatura de verdade)
       - `catalog_billing_mode` = **`recorrente`**

#### 1.1.C — Catálogo anual

1. [X] No chat, peça: *"cria um catálogo de teste com Catálogo anual"*.
2. [X] Anota o link da profissional e o slug.
3. [X] Abra o link, preencha CPF/CNPJ, deixe Pix marcado.
4. [X] **Antes de clicar**, confira o texto do botão: tem que ser **"Assinar por R$139,90/ano"** (repara no **"/ano"** — esse é o item que já falhou uma vez nessa sessão de testes, então presta atenção especial aqui).
5. [X] Clique, aparece o QR Pix. Confirme o pagamento no Asaas sandbox.
6. [X] Ainda no painel do Asaas sandbox, abra a assinatura que acabou de ser criada (mesma tela de "Cobranças", ou "Assinaturas" no menu) e confira que o campo **Ciclo** está como **Anual** (não Mensal).
7. [X] No Supabase, confira: `plan_tier='basico'`,`asaas_subscription_id` preenchido,`catalog_billing_mode='anual'`.

---

### 1.2 — Agenda anual (produto novo, ofertado direto sem passar pelo Catálogo)

1. [X] No chat, peça: *"cria um catálogo de teste com Agenda anual, ofertando o Agenda direto (sem passar pelo Catálogo)"* — eu vou configurar o catálogo pra já nascer oferecendo o Plano Agenda na primeira tela, em vez do Catálogo.
2. [X] Anota o link da profissional e o slug que eu te mandar.
3. [X] Abra o link numa aba anônima. A tela de primeiro contato que abre já deve estar falando do **Plano Agenda** (agendamento automático), não do Catálogo.
4. [X] **Antes de pagar**, confira o preço mostrado na tela: tem que ser **"R$249,90/ano"** (ou o valor que eu tiver customizado, se você pedir um preço específico) — **nunca** "R$34,90/mês", que seria o preço do Agenda mensal (errado nesse cenário).
5. [X] Preencha CPF/CNPJ, deixe Pix marcado, clique no botão de assinar. Aparece o QR Pix.
6. [X] Confirme o pagamento no Asaas sandbox (mesmo processo: Cobranças → achar a cobrança → "Confirmar recebimento").
7. [X] No painel do Asaas sandbox, abra a assinatura criada e confira **Ciclo: Anual**.
8. [X] No Supabase, tabela `orders`, ache pelo slug e confira: `plan_tier='plus'`, `booking_enabled=true` (o agendamento automático já tem que estar ligado),`agenda_billing_mode='anual'`.

---

### 1.3 — Troca de MESMO ciclo (continua sendo o caminho de sempre, sem crédito nenhum)

Esse teste confirma que, quando o ciclo NÃO muda, o sistema continua fazendo a troca simples de sempre (sem criar assinatura nova nem crédito) — ou seja, confirma que a mudança de hoje não quebrou o que já funcionava.

#### 1.3.A — Catálogo mensal → Agenda mensal

1. [X] No chat, peça: *"cria um catálogo de teste com Catálogo mensal"*.
2. [X] Pague esse Catálogo mensal seguindo os mesmos passos do teste 1.1.B acima (preencher CPF/CNPJ, Pix, confirmar no Asaas sandbox).
3. [X] No painel do Asaas sandbox, **anota o ID da assinatura** que acabou de pagar (aparece no topo da tela da assinatura, algo como `sub_xxxxxxxxxxxx`).
4. [X] Com a profissional ainda logada (mesma aba), acesse `https://studiomenu-git-desenv-doupsdigital-s-projects.vercel.app/app/{slug}/config#assinatura` (troque `{slug}` pelo slug do catálogo) — ou clique na aba de baixo **"Config"** e role até o card **"Plano"**.
5. [X] Dentro do card "Plano", ache o bloco **"Evolua pro Plano Agenda"** e clique no botão de assinar (texto tipo "Assinar por R$34,90/mês").
6. [X] Em alguns segundos aparece a tela de sucesso — **sem QR code nenhum** (é instantâneo, diferente de um pagamento novo).
7. [X] No Asaas sandbox, abra a MESMA assinatura de novo (usando o ID que você anotou no passo 3). Confirme que é a **mesma assinatura** (mesmo ID) — só que agora com o valor R$34,90 em vez de R$22,90. **Não pode ter sido criada uma assinatura nova.**
8. [X] No Supabase, confira que `asaas_subscription_id` da order continua **o mesmo ID** de antes (não mudou), e `plan_tier` agora é `plus`.

#### 1.3.B — Catálogo anual → Agenda anual

1. [X] No chat, peça: *"cria um catálogo de teste com Catálogo anual e Agenda anual já configurada"* (preciso configurar os dois modos desde já, porque o Agenda anual só pode ser configurado ANTES dela virar assinante do Agenda).
2. [X] Pague o Catálogo anual (mesmos passos do teste 1.1.C).
3. [X] Anote o ID dessa assinatura anual no Asaas sandbox.
4. [X] Vá em "Plano" (mesmo caminho do passo 4 do teste 1.3.A) e clique em **"Evolua pro Plano Agenda"** — o texto do botão agora deve ser **"Assinar por R$249,90/ano"**.
5. [X] Confirme instantâneo (sem QR). No Asaas sandbox, confirme que é a **mesma assinatura** (mesmo ID anotado no passo 3), só que valor e descrição atualizados — nada novo criado.

---

### 1.4 — Troca de CICLO DIFERENTE (o mecanismo novo — crédito + assinatura nova)

Esse é o teste mais importante dessa entrega — é o cenário que não funcionava antes.

#### 1.4.A — Catálogo anual (R$139,90) → Agenda mensal (R$34,90)

1. [X] No chat, peça: *"cria um catálogo de teste com Catálogo anual e Agenda mensal"*.
2. [X] Pague o Catálogo anual seguindo os passos do teste 1.1.C (CPF/CNPJ, Pix, confirmar no Asaas sandbox).
3. [X] No painel do Asaas sandbox, **anote o ID dessa assinatura anual** (vai precisar comparar depois) e **anote também a data de "próxima cobrança"** que aparece nela (vai usar na conta da Parte 2).
4. [X] Vá em "Plano" (`.../app/{slug}/config#assinatura`) e clique em **"Evolua pro Plano Agenda"** → botão **"Assinar por R$34,90/mês"**.
5. [X] Depois de clicar, NÃO aparece QR code — aparece direto uma tela de sucesso dizendo algo como **"A partir de [uma data], o valor passa a ser R$34,90"**. Anota essa data.
6. [X] No painel do Asaas sandbox, procure por uma assinatura **NOVA** (com um ID diferente do que você anotou no passo 3). Confira:
       - **Ciclo: Mensal** (não anual)
       - **Valor: R$34,90**
       - **Próxima cobrança:** numa data **futura** (não hoje) — compare com a data que apareceu na tela de sucesso no passo 5, tem que bater.
7. [X] Ainda no Asaas sandbox, abra a assinatura **antiga** (a anual, pelo ID anotado no passo 3) — ela tem que aparecer como **cancelada/excluída**.
8. [X] No Supabase, tabela `orders`, ache pelo slug e confira:
       - `asaas_subscription_id` agora é o ID da assinatura **NOVA** (não o da antiga)
       - `plan_tier` = **`plus`**
       - `booking_enabled` = **`true`**
       - tudo isso já preenchido **na hora**, sem precisar esperar nenhum pagamento novo
9. [X] **Confira a conta do crédito** usando a fórmula da Parte 2 lá embaixo — o valor que você calcular na mão tem que bater (1 dia de diferença no máximo) com a "próxima cobrança" que você viu no passo 6.
10. [X] **Teste do cancelamento tardio** (importante): espere uns 10 a 30 segundos sem fazer nada (o Asaas avisa o cancelamento da assinatura antiga de forma atrasada). Depois, **recarregue a página** (F5) na tela "Plano" da profissional.
11. [X] Confirme que a tela continua mostrando **"Plano Agenda ativo"** normalmente. **Se a tela voltar a mostrar "nenhum plano ativo", ou sumir alguma informação, é um bug crítico —  me avisa na hora, antes de continuar os outros testes.**

#### 1.4.B — Catálogo mensal (R$22,90) → Agenda anual (R$249,90)

Mesmo roteiro do 1.4.A, só invertendo os modos:

1. [X] No chat, peça: *"cria um catálogo de teste com Catálogo mensal e Agenda anual"*.
2. [X] Pague o Catálogo mensal (teste 1.1.B). Anote o ID da assinatura e a data de próxima cobrança no Asaas sandbox.
3. [X] Vá em "Plano" → **"Evolua pro Plano Agenda"** → botão **"Assinar por R$249,90/ano"**.
4. [X] Repita as conferências 6-11 do teste 1.4.A — a diferença esperada aqui é que o **crédito vai ser pequeno**: como o Catálogo mensal "vale pouco" por dia perto do Agenda anual, a próxima cobrança da assinatura nova deve ficar **bem próxima de hoje** (poucos dias de diferença), não meses à frente.

---

### 1.5 — Casos de borda

#### 1.5.A — Duplo clique (testar a trava contra duplicidade)

1. [X] Repita os passos 1-4 do teste 1.4.A (criar catálogo com Catálogo anual + Agenda mensal,
       pagar o Catálogo anual, ir na tela "Plano").
2. [X] No botão **"Assinar por R$34,90/mês"** (dentro de "Evolua pro Plano Agenda"), clique
       **2 vezes bem rápido**, uma em seguida da outra.
3. [X] No painel do Asaas sandbox, confira quantas assinaturas novas foram criadas pra essa profissional — tem que ser **só 1**, nunca 2. Se a trava funcionou, o 2º clique deve ter falhado silenciosamente ou mostrado uma mensagem de erro tipo "Troca de plano já em andamento...".

#### 1.5.B — Preço customizado pelo admin refletindo certinho

> **Importante (achado real, 2026-10-15):** o preço customizado do Agenda só pode ser um
> **desconto** — nunca um valor ACIMA do preço de tabela (R$34,90 mensal / R$249,90 anual).
> Isso é regra de negócio de propósito (admin não pode "cobrar mais" no Agenda, só oferecer
> desconto), não um bug. Por isso o valor de exemplo abaixo é **menor** que o padrão, não maior.

1. [ ] No chat, peça: *"cria um catálogo de teste com Catálogo anual e Agenda mensal, com o preço do Agenda customizado pra R$29,90 em vez do padrão"*.
2. [ ] Pague o Catálogo anual (teste 1.1.C).
3. [ ] Vá em "Plano" → "Evolua pro Plano Agenda" — confira que o botão já mostra **"Assinar por R$29,90/mês"** (o valor customizado, não o R$34,90 padrão).
4. [ ] Clique, confirme a troca. No Asaas sandbox, confira que a assinatura nova foi criada com
       **R$29,90**, não R$34,90.

#### 1.5.C — Trava sempre libera no final

1. [ ] Depois de qualquer um dos testes de evolução acima (1.3 ou 1.4), abra o Supabase, tabela
       `orders`, ache a linha do catálogo usado.
2. [ ] Confira a coluna `plan_switch_lock_at` — tem que estar **vazia/null**. Se tiver alguma
       data/hora preenchida ali, a trava ficou presa (bug) — isso impediria a profissional de
       trocar de plano de novo no futuro.

---

### 1.6 — Regressão (downgrade) com troca de ciclo

#### 1.6.A — Agenda anual → Catálogo mensal

1. [ ] No chat, peça: *"cria um catálogo de teste com Catálogo mensal e Agenda anual, e já deixa
       o Agenda anual pago/ativo"* — nesse caso preciso simular que ela já é assinante ativa do
       Agenda anual (vou fazer isso diretamente, sem você precisar pagar de novo).
2. [ ] Anote o ID da assinatura anual do Agenda que eu te informar, e a data de próxima cobrança
       (olhando no Asaas sandbox).
3. [ ] Entre com o link da profissional, vá em "Plano" (`.../app/{slug}/config#assinatura`).
4. [ ] A tela deve mostrar **"Plano Agenda ativo"**. Clique em **"Cancelar assinatura"**.
5. [ ] No mini-modal que abre, **não** clique em "Cancelar tudo" — clique no botão **"Voltar
       pro Plano Catálogo (R$22,90/mês)"**.
6. [ ] Confirme instantâneo (sem QR). No Asaas sandbox: assinatura nova **mensal** criada, a
       anual antiga cancelada. Como o valor anual não gasto é grande, o crédito deve ser
       **grande** (muitos dias de Catálogo mensal de graça — a próxima cobrança fica bem
       distante no calendário).
7. [ ] Repita a conferência do cancelamento tardio (espera 10-30s, recarrega "Plano", confirma
       que continua mostrando o Catálogo ativo certinho).

#### 1.6.B — Agenda mensal → Catálogo anual

Mesmo roteiro do 1.6.A invertido (Agenda mensal paga, Catálogo configurado como anual) — a
diferença esperada é um **crédito pequeno** (próxima cobrança do Catálogo anual fica próxima de
hoje, já que o Agenda mensal "vale pouco" acumulado).

---

## Parte 2 — Fórmula do crédito (pra conferir as contas na mão)

```
diasRestantes   = dias entre hoje e a "próxima cobrança" (nextDueDate) da assinatura ANTIGA
                  (visto no painel do Asaas sandbox, na assinatura antes de cancelar)
diasCicloAntigo = 365 se a assinatura antiga era anual, 30 se era mensal
valorNaoGasto   = valorDaAssinaturaAntiga × (diasRestantes / diasCicloAntigo)

diasCicloNovo   = 365 se o plano novo é anual, 30 se é mensal
taxaDiariaNova  = valorDoPlanoNovo / diasCicloNovo

diasDeCredito   = valorNaoGasto / taxaDiariaNova   (arredondado)
nextDueDate nova = hoje + diasDeCredito
```

Exemplo prático (Catálogo anual R$139,90 com ~300 dias restantes, evoluindo pro Agenda mensal
R$34,90): `139,90 × (300/365) ≈ R$114,99` não gasto → `114,99 ÷ (34,90/30) ≈ 98 dias` de
crédito → a assinatura nova do Agenda só cobra pela 1ª vez daqui a ~98 dias.

---

## Resultado final

- [ ] Todos os itens acima passaram.
- [ ] Algum item falhou — anota qual (número do cenário + o que exatamente não bateu) e me avisa
      antes de pedir pra subir pra `main`.
