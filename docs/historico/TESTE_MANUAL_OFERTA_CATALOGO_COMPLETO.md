# Teste manual — Oferta automática de upsell "Catálogo Completo"

> Testar no **Preview da `desenv`** (não localhost — o Asaas sandbox precisa de uma URL pública
> pra mandar os webhooks de confirmação de pagamento, localhost não funciona pra isso).
>
> **Link base de tudo:** `https://studiomenu-git-desenv-doupsdigital-s-projects.vercel.app`
>
> Esse ambiente já usa o Supabase de **dev** (migração já rodada, 2026-10-28) e o Asaas
> **sandbox**. Marque `[x]` em cada passo conforme for fazendo.
>
> Sempre que um passo disser "peça no chat", é literal: cole a frase sugerida (ou algo parecido)
> aqui na conversa, eu crio/configuro o catálogo de teste e te devolvo o link da profissional +
> o slug.

---

## Parte 0 — Preparação

- [ ] Abra `https://studiomenu-git-desenv-doupsdigital-s-projects.vercel.app/admin/catalogos` —
      na 1ª vez pode pedir login da Vercel (autentica com sua conta de sempre); depois pede a
      senha do admin do StudioMenu.
- [ ] Abra https://sandbox.asaas.com numa aba separada e faça login — vai usar em quase todo
      cenário abaixo pra confirmar pagamentos.

---

## Parte 1 — Cenários

### 1.1 — Oferta ANTES de pagar, ela ACEITA (paga R$139 direto)

1. [ ] No chat, peça: *"cria um catálogo de teste 'Catálogo apenas', com a oferta de Catálogo
       Completo já ligada"* — eu crio um pedido novo (Capa/Orientações/Contato escondidos,
       nunca pago) já com a oferta ativada no admin, e te devolvo o **link da profissional** e o
       **slug**.
2. [ ] Abra o link numa aba anônima/privada.
3. [ ] Confirme que a tela de primeiro contato mostra só: saudação, cards de Ver/Editar
       catálogo, e o card de pagamento. **Role até o final** — logo abaixo do card de pagamento
       tem que aparecer um 2º card, **"Catálogo Completo"**, com um botão **"Ver como ficaria
       →"**.
4. [ ] Confira o card de pagamento de cima: o preço ainda tem que ser **R$79,00** (padrão) nesse
       momento — a oferta ainda não foi decidida.
5. [ ] Clique em **"Ver como ficaria →"** — abre uma aba nova com o catálogo completo. Confirme
       que agora aparecem as telas de **Capa**, grade de procedimentos, **Orientações** e
       **Contato** (as 3 que o modo "Catálogo apenas" esconde).
6. [ ] Repare na URL dessa aba nova — tem que terminar em **`?preview=completo`**.
7. [ ] Numa aba anônima **nova** (separada), abra o mesmo link `/c/{slug}` **sem** esse
       parâmetro (edite a URL e apague o `?preview=completo`). Confirme que continua mostrando
       **só a grade de procedimentos** (sem Capa/Orientações/Contato) — isso prova que o preview
       é isolado e não mudou o catálogo público de verdade.
8. [ ] Volte pra aba da profissional (passo 2). Agora, embaixo do card de pagamento, tem que
       aparecer o preço **R$139,00** e 2 botões: **"Quero o Catálogo Completo"** e **"Prefiro
       ficar no Catálogo simples"**.
9. [ ] Clique em **"Quero o Catálogo Completo"**.
10. [ ] A página atualiza sozinha. Confirme: o card de oferta **sumiu**, e o card de pagamento
        no topo agora mostra **"Pagar R$139,00 e garantir meu Catálogo"** (não mais R$79,00).
11. [ ] Preencha CPF/CNPJ (qualquer um válido), deixe **Pix** marcado, clique pra pagar. Aparece
        um QR code.
12. [ ] No Asaas sandbox → **Cobranças**, ache a cobrança de **R$139,00** mais recente, abra e
        clique em **"Confirmar recebimento"**.
13. [ ] Volte pra aba da profissional (fica checando sozinha a cada 5s) — em pouco tempo aparece
        **"Pagamento confirmado! ✅"**.
14. [ ] No Supabase (projeto **`studiomenu-dev`**) → **Table Editor** → tabela **`orders`** →
        ache a linha pelo `slug`. Confira:
        - `plan_tier` = **`basico`**, `subscription_status` = **`ativo`**
        - `show_cover`, `show_instructions`, `show_contact_cta` = **`true`** (os 3)
        - `full_catalog_offer_enabled` = **`false`** (a oferta se desliga sozinha depois de paga)
15. [ ] Abra `/c/{slug}` de novo, **sem** nenhum parâmetro — confirme que agora mostra
        Capa/Orientações/Contato **de verdade**, sem precisar de `?preview=completo`.

---

### 1.2 — Oferta ANTES de pagar, ela RECUSA (fica no simples R$79)

1. [ ] No chat, peça: *"cria outro catálogo de teste 'Catálogo apenas', com a oferta de Catálogo
       Completo já ligada"*.
2. [ ] Abra o link, role até o card de oferta, clique em **"Ver como ficaria →"** (confirma que
       preview funciona, mesmo não indo usar).
3. [ ] Clique em **"Prefiro ficar no Catálogo simples"**.
4. [ ] Confirme: o card de oferta **sumiu**, e o card de pagamento continua mostrando
       **"Pagar R$79,00..."** (não mudou).
5. [ ] Pague normalmente (CPF/CNPJ, Pix, confirmar no Asaas sandbox).
6. [ ] No Supabase, confira: `show_cover`/`show_instructions`/`show_contact_cta` continuam
       **`false`** (ela recusou, nada mudou) e `full_catalog_offer_decision` = **`declined`**.

---

### 1.3 — Oferta DEPOIS de já ter pago, ela ACEITA (paga só a diferença, R$60)

1. [ ] No chat, peça: *"cria um catálogo de teste 'Catálogo apenas' (sem a oferta ligada ainda)"*.
2. [ ] Pague o Catálogo normalmente por R$79 (CPF/CNPJ, Pix, confirmar no Asaas sandbox) —
       confirme que chega em "Pagamento confirmado! ✅".
3. [ ] No admin (`/admin/catalogos`), ache esse catálogo (pelo nome ou slug), abra a seção
       **"Experiência entregue"** e clique no botão **"Oferta Catálogo Completo: Desligada"**
       pra ligar.
4. [ ] Volte pra aba da profissional, vá em `/app/{slug}/inicio` (ou clique em "Ir para o
       Início" se ainda estiver na tela de sucesso) e recarregue a página (F5).
5. [ ] Role a tela — deve aparecer o card **"Catálogo Completo"** (perto do card de
       compartilhar/upsell do Plus).
6. [ ] Clique em **"Ver como ficaria →"** — confirme que abre o preview completo numa aba nova
       (mesma checagem do teste 1.1, passos 5-6).
7. [ ] Volte, confirme que o preço mostrado agora é **"+ R$60,00"** (não R$139,00 — ela já pagou
       os R$79).
8. [ ] Clique em **"Quero o Catálogo Completo"** — em vez de recarregar a página, revela um
       mini-checkout **ali mesmo**, já com o preço R$60,00, **sem pedir CPF/e-mail de novo**.
9. [ ] Clique pra pagar (Pix). Aparece o QR code.
10. [ ] No Asaas sandbox, ache a cobrança de **R$60,00**, confirme o recebimento.
11. [ ] Confirme que aparece a tela de sucesso **"Catálogo Completo liberado! ✅"**.
12. [ ] No Supabase, confira: `show_cover`/`show_instructions`/`show_contact_cta` = **`true`**,
        `full_catalog_offer_enabled` = **`false`**, `pending_full_catalog_payment_id` = **vazio**.
13. [ ] Abra `/c/{slug}` — confirme Capa/Orientações/Contato aparecendo de verdade.

---

### 1.4 — Oferta DEPOIS de já ter pago, ela RECUSA

1. [ ] Repita os passos 1-5 do teste 1.3 (catálogo pago + oferta ligada depois + card aparecendo
       em `/inicio`).
2. [ ] Clique em **"Prefiro ficar como está"**.
3. [ ] Confirme que o card **sumiu**, nenhuma cobrança foi criada no Asaas sandbox, e no Supabase
       `full_catalog_offer_decision` = **`declined`**, `show_*` continuam **`false`**.

---

### 1.5 — Resetar a oferta pelo admin (reversibilidade)

1. [ ] Use um catálogo onde ela já **recusou** (do teste 1.2 ou 1.4).
2. [ ] No admin, abra a seção "Experiência entregue" desse catálogo — confirme que aparece
       **"Decisão dela: Recusou 🙅"**.
3. [ ] Clique no botão pra **desligar** a oferta, depois clique de novo pra **ligar**.
4. [ ] Confirme que o texto volta pra **"Decisão dela: Pendente ⏳"**.
5. [ ] Volte na tela da profissional correspondente (primeiro contato ou `/inicio`, dependendo
       do teste usado) e recarregue — confirme que o card de oferta **reaparece do zero**
       (teaser, sem preço ainda).

---

### 1.6 — Preços customizados pelo admin

1. [ ] Use um catálogo com a oferta ligada e **ainda pendente** (ex: recém-criado no teste 1.1,
       antes de decidir — ou use o reset do teste 1.5).
2. [ ] No admin, no campo **"Antes de pagar"**, digite `99` e clique **Salvar**.
3. [ ] No campo **"Já pagou (diferença)"**, digite `40` e clique **Salvar**.
4. [ ] Na tela da profissional (primeiro contato, se ela ainda não pagou nada), clique em "Ver
       como ficaria" e confirme que o preço mostrado agora é **R$99,00** (não R$139,00).
5. [ ] Se quiser, repita num catálogo já pago (`/inicio`) pra conferir que o preço de diferença
       mostrado é **R$40,00** (não R$60,00).

---

### 1.7 — Escopo: nunca aparece quando a oferta inicial é o Plano Agenda

1. [ ] No chat, peça: *"cria um catálogo de teste com Agenda ofertada direto (sem passar pelo
       Catálogo), com a oferta de Catálogo Completo também ligada"*.
2. [ ] Abra o link da profissional — a tela de primeiro contato deve mostrar a oferta do
       **Plano Agenda** normalmente (preço R$34,90/mês).
3. [ ] Confirme que o card **"Catálogo Completo" NUNCA aparece** nessa tela, mesmo com a oferta
       ligada no admin — essa oferta é só pra quem está no caminho do Catálogo.

---

### 1.8 — Regressão: catálogo comum, sem a oferta ligada

1. [ ] Pegue (ou peça) um catálogo "Catálogo apenas" comum, **sem nunca ter ligado** a oferta no
       admin.
2. [ ] Confirme que nenhum card novo aparece em nenhuma tela (primeiro contato ou `/inicio`),
       nenhum preço muda, e o comportamento é idêntico ao que já existia antes dessa entrega.

---

### 1.9 — Caso de borda: reaproveitar cobrança pendente

1. [ ] Repita os passos 1-9 do teste 1.3 (até gerar o QR Pix de R$60,00), mas **não pague**.
2. [ ] Recarregue a página (F5) e clique em "Quero o Catálogo Completo" de novo.
3. [ ] No Asaas sandbox, confirme que existe **só 1 cobrança de R$60,00** em aberto pra essa
       profissional (não 2) — a segunda tentativa reaproveitou a cobrança pendente em vez de
       criar outra.

---

## Resultado final

- [ ] Todos os itens acima passaram.
- [ ] Algum item falhou — anota qual (número do cenário + o que exatamente não bateu) e me avisa
      antes de pedir pra promover pra `main`.
