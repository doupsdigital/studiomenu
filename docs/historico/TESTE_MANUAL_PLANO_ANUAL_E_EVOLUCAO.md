# Teste manual — Plano Anual (Catálogo + Agenda) e evolução/regressão entre ciclos

> Testar em `desenv` local (`next dev`, `http://localhost:3000`), contra o banco de **dev**
> (`studiomenu-dev`) e o Asaas **sandbox**. Migração já rodada em dev (confirmado). Marque `[x]`
> em cada passo conforme for fazendo — os passos são literais (tela, botão, campo), não resumos.

---

## Parte 0 — Preparação

- [ ] Confirme que `next dev` está rodando (`http://localhost:3000` abre).
- [ ] Abra `http://localhost:3000/admin/catalogos` — se aparecer uma tela com um campo de senha
      (placeholder `••••`), digite a senha do admin e clique em **"Acessar Painel"**. Se já tiver
      sessão, cai direto na lista de catálogos.

---

## Parte 1 — Mecânica padrão: criar um catálogo de teste novo

Repita esta parte pra cada cenário que precisar de um catálogo "limpo" (ainda não pago). Dá pra
reaproveisar nomes tipo `teste-anual-1`, `teste-anual-2` etc pra não se perder.

1. [ ] No admin, clique no botão/link que leva pra **"Criar com IA"** (ou abra direto
       `http://localhost:3000/admin/criar-com-ia`).
2. [ ] Preencha **"Nome da Profissional *"** (ex: `Teste Anual 1`) e **"WhatsApp *"** (qualquer
       número com 10+ dígitos, ex: `62999999999`). Não precisa preencher Instagram.
3. [ ] **Não** envie print/PDF de serviços — assim o botão mostra **"➕ Criar com serviços
       padrão"** em vez de "🤖 Extrair com IA" (mais rápido, já cria 4 serviços de exemplo).
       Clique nesse botão.
4. [ ] Na tela de revisão ("Confira o que a IA entendeu"), clique em **"✨ Criar Catálogo"**.
5. [ ] Anota o `slug` do catálogo (aparece na URL pra onde foi redirecionado,
       `/c/[slug]?edit=...`) — vai precisar dele.

---

## Parte 2 — Mecânica padrão: configurar o modo de cobrança no admin (ANTES de pagar)

1. [ ] Volte pra `http://localhost:3000/admin/catalogos`.
2. [ ] Ache o card do catálogo de teste (busca pelo nome/slug se a lista estiver grande) e abra
       (clique no card pra expandir, se estiver retrátil).
3. [ ] Ache a seção **"Cobrança do Catálogo"** — 3 botões num grupo: **"Único"**, **"Mensal"**,
       **"Anual"**. Clique no modo que o cenário pede. Aparece um toast confirmando (ex: "🗓️
       Catálogo vai virar assinatura anual.").
4. [ ] Logo abaixo, campo **"Preço"** (com prefixo "R$") — se o cenário pedir um preço
       customizado, digite e clique em **"Salvar"**. Se não, deixa em branco (usa o padrão:
       R$89,90 avulso / R$22,90 mensal / R$139,90 anual).
5. [ ] Se o cenário também envolver o Agenda: mais abaixo tem a seção **"Cobrança do Agenda"** —
       2 botões: **"Mensal"**, **"Anual"**. Clique no modo certo (esse bloco só aparece enquanto
       `plan_tier` não é `plus` — ou seja, só antes dela pagar o Agenda).

---

## Parte 3 — Mecânica padrão: entrar como a profissional e pagar (Pix sandbox)

1. [ ] Ainda no card do catálogo em `/admin/catalogos`, ache a seção **"Links"** (subtítulo
       "Link oficial, link do app e preço do vitalício").
2. [ ] No bloco **"Link do App"**, clique em **"Copiar Link"** (toast "📱 Link do App copiado!").
       O link copiado é no formato
       `http://localhost:3000/api/professional/login?slug={slug}&token={edit_token}`.
3. [ ] Cole esse link numa aba nova (ideal: aba anônima/privada, pra não misturar com a sessão
       do admin) e pressione Enter. Isso loga como a profissional e cai em `/app/{slug}`.
4. [ ] Como o catálogo ainda não foi pago, a tela que abre é a de **primeiro contato** — card
       de assinar no final da página.
5. [ ] Preencha **CPF ou CNPJ** (qualquer válido, ex: gere um CPF de teste qualquer formatado
       `000.000.000-00` com dígitos verificadores corretos — ou reaproveite um que já usou antes
       nesse ambiente de dev). E-mail é opcional, pode deixar em branco.
6. [ ] Método de pagamento: deixe **"Pix"** selecionado (vem marcado por padrão, "Recomendado").
7. [ ] Clique no botão de assinar — o texto muda conforme o modo: **"Assinar por R$X,XX/mês"**
       (ou "/ano"), ou **"Pagar R$X,XX e garantir meu Catálogo"** se for avulso.
8. [ ] Aparece um QR code Pix na tela. **Não precisa escanear** — vamos confirmar pelo painel do
       Asaas sandbox.
9. [ ] Abra `https://sandbox.asaas.com` (painel sandbox), faça login, vá em **Cobranças**, ache a
       cobrança mais recente (nome da profissional/valor batendo), abra ela e clique em
       **"Confirmar recebimento"**.
10. [ ] Volte pra aba do app da profissional — ou espera o polling automático (a cada 5s) ou
        clique em **"Já paguei, verificar agora"** (esse botão só aparece na tela de cartão; no
        Pix é só esperar o polling). Em poucos segundos aparece a tela "Parabéns" /
        "Pagamento confirmado! ✅".

---

## Parte 4 — Mecânica padrão: conferir no Supabase

1. [ ] Abra o projeto `studiomenu-dev` no Supabase → **Table Editor** → tabela **`orders`**.
2. [ ] Filtre/ache a linha pelo `slug` do catálogo de teste.
3. [ ] Confira as colunas: `plan_tier`, `subscription_status`, `asaas_subscription_id`,
       `catalog_billing_mode`, `agenda_billing_mode`, `booking_enabled`, `plan_switch_lock_at`
       (essa última sempre deve estar `NULL` fora de uma troca em andamento).

---

## Parte 5 — Mecânica padrão: evoluir ou regredir de plano dentro do app

1. [ ] Com a profissional já logada (aba de antes), navegue pra
       `http://localhost:3000/app/{slug}/config#assinatura` (ou clique na aba inferior
       **"Config"** e role até o card **"Plano"**).
2. [ ] Se ela é **Básico ativo** (Catálogo pago): dentro do card "Plano" tem o bloco **"Evolua
       pro Plano Agenda"** com o formulário de assinar embutido — preencha CPF/e-mail se pedir
       (deve vir pré-preenchido) e clique no botão de assinar (**"Assinar por R$X,XX/mês"** ou
       "/ano", conforme o que o admin configurou no Agenda).
3. [ ] Se ela é **Plus ativo** (Agenda pago) e quer regredir: clique em **"Cancelar assinatura"**
       → no mini-modal que abre, se ela tiver Catálogo recorrente/anual por trás, aparece o botão
       **"Voltar pro Plano Catálogo (R$X,XX/mês ou /ano)"** — clique nele (não em "Cancelar
       tudo", que cancela tudo de vez).
4. [ ] Pra uma troca de **ciclo diferente** (ex: anual→mensal), isso NÃO mostra QR code nenhum —
       é instantâneo (o pagamento antigo já cobre o crédito). Confirme pela tela de sucesso:
       **"A partir de [data], o valor passa a ser R$X,XX"**.

---

## Parte 6 — Cenários

Pra cada cenário: Parte 1 (criar catálogo) → Parte 2 (configurar modo) → Parte 3 (pagar o 1º
plano) → Parte 4 (conferir Supabase) → Parte 5 (evoluir/regredir) → Parte 4 de novo (conferir o
resultado) + os itens extras listados.

### 6.1 — Regressão: Catálogo sozinho, sem evolução (não deve ter mudado nada)

- [ ] Catálogo **avulso** (Parte 2, botão "Único"): pagar (Parte 3) e confirmar no Supabase
      (Parte 4) que `plan_tier='basico'`, **sem** `asaas_subscription_id` (pagamento único, não
      assinatura).
- [ ] Catálogo **mensal** (Parte 2, botão "Mensal"): antes de pagar, confirme que o preço
      mostrado na tela de primeiro contato termina em **"/mês"**. Pague e confirme
      `asaas_subscription_id` preenchido.
- [ ] Catálogo **anual** (Parte 2, botão "Anual"): confirme **"/ano"** no preço antes de pagar.
      Pague. No painel do Asaas sandbox, abra a assinatura criada e confirme **Ciclo: Anual**.

### 6.2 — Agenda anual (produto novo)

- [ ] Crie um catálogo de teste (Parte 1). **Antes de pagar nada**, vá em "Cobrança do Agenda"
      (Parte 2, passo 5) e marque **"Anual"**. Opcionalmente, mude o preço pra R$199,90 e salve.
- [ ] Pra ofertar o Agenda direto (sem passar pelo Catálogo primeiro): no card do catálogo em
      `/admin/catalogos`, ache o toggle de oferta inicial e marque pra oferecer o Plus/Agenda
      direto (mesmo toggle usado na criação, "Vender o Plus direto" — se não achar essa opção
      pós-criação, pule este item e teste o Agenda via evolução no cenário 6.3 em vez do
      primeiro contato).
- [ ] Entre como a profissional (Parte 3, passos 1-3). Confirme que o preço mostrado na tela
      **já é "R$199,90/ano"** (ou R$249,90/ano se não customizou) — nunca R$34,90/mês.
- [ ] Pague (Parte 3, passos 5-10). No Asaas sandbox, confirme **Ciclo: Anual**, valor certo.
- [ ] Supabase (Parte 4): `plan_tier='plus'`, `booking_enabled=true`.

### 6.3 — Troca de MESMO ciclo (continua sendo o caminho de sempre, sem crédito)

- [ ] Catálogo **mensal** → pague (6.1) → evolua pro Agenda **mensal** (Parte 2 passo 5 marcando
      "Mensal" ANTES de pagar o catálogo, ou a qualquer momento antes de evoluir) → Parte 5.
      **No Asaas sandbox**: confirme que é a **MESMA assinatura** (mesmo ID), só o valor mudou —
      não deve aparecer uma assinatura nova nem uma cancelada.
- [ ] Catálogo **anual** → pague → marque Agenda como **Anual** → evolua. Mesma confirmação: UMA
      assinatura só, mesmo ID, valor atualizado.

### 6.4 — Troca de CICLO DIFERENTE (o mecanismo novo — crédito + assinatura nova)

- [ ] **Catálogo anual (R$139,90) → Agenda mensal (R$34,90):** crie catálogo, marque Catálogo
      "Anual" e Agenda "Mensal" (Parte 2), pague o Catálogo anual (Parte 3), **anote o ID da
      assinatura** mostrado no Asaas sandbox (vai precisar depois). Evolua pro Agenda (Parte 5).
  - [ ] No Asaas sandbox: confirme que existe uma assinatura **NOVA** (ID diferente do anotado),
        **Ciclo: Mensal**, com **próxima cobrança numa data futura** (não hoje).
  - [ ] Confirme que a assinatura **antiga** (anual) aparece **cancelada/excluída** no painel.
  - [ ] No Supabase (Parte 4): `asaas_subscription_id` da order agora é o ID da assinatura NOVA;
        `plan_tier='plus'`; `booking_enabled=true` — tudo isso **na hora**, sem precisar esperar
        nenhum pagamento novo.
  - [ ] Na tela de sucesso do app: confirme que a data em "A partir de [data], o valor passa a
        ser R$34,90" bate com a próxima cobrança que você viu no Asaas.
  - [ ] **Confira a conta** usando a fórmula da Parte 8 — ela deve bater (±1 dia) com a data real.
- [ ] **Catálogo mensal (R$22,90) → Agenda anual (R$249,90):** mesmo roteiro, invertido. Como o
      Catálogo mensal "vale pouco" comparado ao Agenda anual, a próxima cobrança da assinatura
      nova deve ficar **bem próxima de hoje** (poucos dias de crédito, não meses).

### 6.5 — CRÍTICO: confirmar que cancelar a assinatura antiga não derruba a nova

Esse é o bug que o fix do webhook resolve — só dá pra testar de verdade com o Asaas conseguindo
chamar o seu servidor de volta, o que **não funciona com `next dev` em localhost** (o Asaas não
alcança `localhost`). Duas formas de testar:

**Opção A — mais simples, usando o Preview do Vercel (recomendado):**
- [ ] Faça o mesmo teste do cenário 6.4, mas acessando pelo link de Preview da `desenv`
      (`https://studiomenu-git-desenv-doupsdigital-s-projects.vercel.app`) em vez de localhost —
      esse ambiente já tem uma URL pública que o Asaas sandbox consegue chamar.
- [ ] Depois da evolução, espere ~10-30 segundos (o Asaas manda o webhook de forma assíncrona) e
      **recarregue a tela "Plano"** da profissional.
- [ ] Confirme que continua mostrando o Agenda ativo — **se sumir o plano ou voltar pra "nenhum
      plano ativo", o fix não funcionou, é bug crítico, me avisa na hora.**

**Opção B — simular o webhook manualmente, direto no localhost (se não quiser usar o Preview):**
- [ ] Depois de fazer a evolução do cenário 6.4 localmente, pegue no seu `.env.development.local`
      (ou `.env`) o valor de `ASAAS_WEBHOOK_SECRET`.
- [ ] No PowerShell, rode (trocando os valores entre `<>` pelos reais — o ID da assinatura
      ANTIGA que você anotou no 6.4, e o `asaas_customer_id` dessa mesma order, visto no
      Supabase):
  ```powershell
  $body = @{ event = "SUBSCRIPTION_DELETED"; subscription = @{ id = "<ID_DA_ASSINATURA_ANTIGA>"; customer = "<ASAAS_CUSTOMER_ID>" } } | ConvertTo-Json
  Invoke-RestMethod -Uri "http://localhost:3000/api/billing/webhook" -Method Post -Headers @{ "asaas-access-token" = "<ASAAS_WEBHOOK_SECRET>" } -Body $body -ContentType "application/json"
  ```
- [ ] Depois de rodar, recarregue a tela "Plano" da profissional (ou olhe direto no Supabase) e
      confirme que **`asaas_subscription_id` continua sendo o da assinatura NOVA** e
      `plan_tier`/`subscription_status` continuam corretos — **não pode ter voltado pra
      cancelado/vazio.**

### 6.6 — Regressão (downgrade) com troca de ciclo

- [ ] **Agenda anual → Catálogo mensal:** a partir de uma profissional já em Agenda anual
      (cenário 6.4 ou 6.2), vá em "Plano" → **"Cancelar assinatura"** → **"Voltar pro Plano
      Catálogo (R$22,90/mês)"** (Parte 5, passo 3). Confirme assinatura nova mensal criada, a
      anual cancelada, crédito grande (muitos dias de Catálogo grátis, já que o valor anual não
      gasto é alto comparado ao mensal).
- [ ] **Agenda mensal → Catálogo anual:** mesmo roteiro invertido — crédito pequeno (poucos dias).

---

## Parte 7 — Casos de borda

- [ ] **Duplo clique**: num cenário de troca de ciclo diferente (6.4), clique **2 vezes rápido**
      no botão de evoluir. No Asaas sandbox, confirme que só existe **1** assinatura nova criada
      — não 2. Se a trava funcionar, o 2º clique deve falhar silenciosamente ou mostrar erro
      ("Troca de plano já em andamento...").
- [ ] **Preço customizado pelo admin**: repita o cenário 6.4, mas antes de evoluir, mude o preço
      do Agenda no admin (Parte 2, passo 4) pra um valor diferente do padrão (ex: R$39,90).
      Confirme que a assinatura nova no Asaas sai com **esse** valor, não o padrão.
- [ ] **Trava liberada**: depois de qualquer troca de ciclo (com sucesso ou mesmo se der erro no
      meio), confirme no Supabase que `plan_switch_lock_at` voltou pra `NULL` — se ficar preso
      com uma data, a profissional fica impedida de trocar de plano de novo (bug).

---

## Parte 8 — Fórmula do crédito (pra conferir as contas na mão)

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
      antes de pedir pra subir pra `desenv`.
