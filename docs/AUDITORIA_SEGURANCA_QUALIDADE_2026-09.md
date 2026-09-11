# Auditoria de Segurança e Qualidade — StudioMenu (Setembro/2026)

**Quando:** 2026-09-11, sessão única.
**Por quê:** o produto evoluiu rápido (migração LashMenu → StudioMenu + várias features novas). Antes de começar a próxima funcionalidade grande (agendamento automático + PWA da cliente), foi feita uma auditoria completa do projeto pra pegar bugs, quebras de regra de negócio, código morto e problemas de segurança acumulados.

**Como usar este documento:** se um bug aparecer no futuro e você suspeitar que pode ter relação com alguma dessas mudanças, procure o item correspondente abaixo (por área ou por arquivo) — cada um tem o commit exato, o que foi mudado e como foi testado. A branch é `main`, todos os commits abaixo já estão nela.

---

## Metodologia

A auditoria inicial foi feita por 5 agentes em paralelo, cada um cobrindo uma área do projeto (segurança/API, consistência de dados entre fluxos de criação de catálogo, código morto/duplicação, UX do editor/presets de nicho, middleware/infra/env vars). Os achados foram consolidados, deduplicados e priorizados em 4 níveis: **Crítico**, **Alto**, **Médio**, **Baixo**.

A correção foi feita de forma iterativa: um item (ou um lote de itens de baixo risco) por vez, sempre com `npx tsc --noEmit` + `npx next build` antes de cada commit, teste funcional real (criação/edição/exclusão de catálogos de teste via curl, sempre limpos depois — local e em produção), e só commit/push mediante aprovação explícita a cada passo.

---

## Índice rápido por severidade

| ID | Título | Status |
|---|---|---|
| C1 | RLS totalmente aberta em `orders`/`order_services`/storage | ✅ Corrigido |
| C2 | `edit_token` vazado pra qualquer visitante do catálogo | ✅ Corrigido |
| C3 | Senha do admin hardcoded no client, sem sessão real | ✅ Corrigido |
| C4 | `/admin` acessível via qualquer subdomínio de cliente | ✅ Corrigido |
| C5 | Sem rate limiting em rotas sensíveis/custosas | ✅ Corrigido |
| A1 | `finalize-catalog` não grava `hero_phrase`/`bio_description` | ✅ Corrigido |
| A2 | Campos Manutenção/Efeito Visual descartados ao salvar | ✅ Corrigido |
| A3 | `cat_label` vs `category` no fallback legado de `order_services` | ✅ Corrigido |
| A4 | `status: 44` inválido (deveria ser 404) | ✅ Corrigido |
| A5 | Falha de upload mascarada com `blob:` URL local | ✅ Corrigido |
| A6 | `confirm()` nativo em `admin/catalogos` | ✅ Corrigido |
| A7 | Botão do WhatsApp sobre o CTA no Passo 3 do onboarding | ✅ Corrigido |
| A8 | Sem função central pros payloads de `orders`/`order_services` | ✅ Corrigido |
| A9 | Duas fontes de verdade pros procedimentos | ✅ Corrigido |
| M1 | `specs` do procedimento não persistia/lia | ✅ Corrigido (junto do A2) |
| M2 | Imagens de fundo ausentes do UPDATE do editor | ✅ Corrigido (junto do A8) |
| M3 | `studio_name` nunca gravado | ✅ Corrigido (junto do A8) |
| M4 | WhatsApp sem código de país | ✅ Corrigido |
| M5 | Slug sem checagem de colisão | ✅ Corrigido |
| M6 | Nomenclatura de imagem de fundo inconsistente entre presets | ✅ Corrigido |
| M7 | Preset Lash dependia de domínio externo (`lashmenu.com`) | ✅ Corrigido |
| M8 | Barra do editor sem media query (telas pequenas) | ✅ Corrigido |
| M9 | Upload de imagem aceitava SVG | ✅ Corrigido |
| M10 | Upload bufferizado antes de checar tamanho | ⚠️ Não resolvido (ver nota) |
| M11 | Erros do Supabase vazando pro client | ✅ Corrigido |
| M12 | `notify-telegram` sem auth nem rate limit | 🟡 Parcial (rate limit sim, auth não) |
| M13 | Fallback hardcoded de URL/chave do Supabase | ✅ Corrigido (arquivo removido) |
| M14 | Sem `next.config.ts`/headers de segurança | ✅ Corrigido |
| M15 | Middleware com substring em vez de igualdade exata | ✅ Corrigido |
| M16 | Lista de palavras reservadas de subdomínio incompleta | ✅ Corrigido |
| M17 | Erros de query silenciados em `admin/catalogos` | ✅ Corrigido |
| M18 | Lista de nichos duplicada em 3 lugares | ✅ Corrigido |
| M19 | Dependências não usadas no `package.json` | ✅ Corrigido |
| M20 | `handleNicheChange` duplicado | ✅ Corrigido |
| M21 | Heurística mágica "hero.png" | ✅ Corrigido |
| M22 | `edit_token` em texto puro na URL, sem expiração | ⚠️ Não resolvido (risco arquitetural aceito) |
| B1 | Dois componentes `ProcedureModal` com nome idêntico | ✅ Corrigido |
| B2-B4 | Imports mortos (React/ícones/tipos) | ✅ Corrigido |
| B5 | Sem `robots.txt` | ✅ Corrigido |
| B6 | Padrão de validação MIME inconsistente | ✅ Corrigido (junto do M9) |
| B7 | `APIFY_API_TOKEN` órfã no `.env` do Next | ✅ Documentado (comentário no `.env`) |

**Achados extras** (não estavam na lista original, descobertos durante a implementação):
- Roteamento por subdomínio nunca funcionou de verdade (arquivo no lugar/nome errado pro Next 16) — corrigido junto do C4.
- 4 presets de nicho usavam imagens hospedadas em `lashmenu.com` quando equivalentes locais já existiam no projeto — corrigido junto do M6/M7.

---

## 🔴 Crítico

### C1 — RLS totalmente aberta em `orders`/`order_services`/storage
**Problema:** as políticas do Supabase eram `USING (true)`/`WITH CHECK (true)` em tudo. Qualquer pessoa com a chave pública (anon, embutida no bundle) podia ler, editar ou apagar qualquer catálogo direto pela REST API do Supabase, ignorando completamente o modelo de "link mágico" (`edit_token`).

**Correção:**
- Criado `src/lib/supabase-admin.ts` — client privilegiado (service_role key), server-only, marcado com o pacote `server-only` pra nunca poder ser importado num arquivo client.
- Todas as escritas em `orders`/`order_services`/storage migradas desse client (nunca mais usam a chave anônima): `src/app/api/onboarding/create-catalog/route.ts` (nova rota — antes o `OnboardingForm.tsx` inserção direta do navegador), `src/app/api/admin/finalize-catalog/route.ts`, `src/app/api/catalog/save/route.ts`, `src/app/api/catalog/upload/route.ts`, `src/app/api/admin/catalog-actions/route.ts` (nova, PATCH/DELETE), `src/app/api/admin/catalogs-list/route.ts` (nova, GET).
- SQL rodado diretamente no Supabase (documentado em `docs/schema.sql`): `REVOKE ALL ON public.orders/order_services FROM anon;` + `DROP POLICY` em todas as policies antigas + policy de upload no bucket removida (leitura pública do bucket mantida).
- Variáveis novas: `SUPABASE_SERVICE_ROLE_KEY` (`.env` local + Vercel).

**Commit:** `0700e06`
**Se algo quebrar:** se uma escrita nova (INSERT/UPDATE) em `orders`/`order_services` parar de funcionar, confirme que a rota está usando `supabaseAdmin` (não um client anônimo) e que `SUPABASE_SERVICE_ROLE_KEY` está setada no ambiente (local e Vercel).

---

### C2 — `edit_token` vazado pra qualquer visitante do catálogo
**Problema:** `src/app/c/[slug]/page.tsx` passava o objeto `catalog` inteiro (incluindo `edit_token` real) pro client component `CatalogLayout`, mesmo pra visitantes sem o link de edição.

**Correção:** o objeto passado ao client agora tem o `edit_token` removido antes de ir pro componente; a checagem de autorização continua só no server.

**Commit:** `be23f9b`
**Se algo quebrar:** se o modo de edição parar de reconhecer o token da URL, verifique `src/app/c/[slug]/page.tsx` — `isEditAuthorized` é calculado ANTES da desestruturação que remove `edit_token`, então isso não deveria quebrar, mas é o ponto certo pra olhar.

---

### C3 — Senha do admin hardcoded no client, sem sessão real
**Problema:** `/admin` era protegido só por uma flag em `localStorage` (bypassável no devtools) comparando com uma senha de 4 dígitos hardcoded no bundle JS. A mesma senha era reenviada como header `x-admin-secret` pras rotas `/api/admin/*`.

**Correção:**
- `src/lib/admin-session.ts` — sessão via cookie httpOnly assinado com HMAC (`ADMIN_SESSION_SECRET`), TTL de 30 dias.
- `src/app/api/admin/login/route.ts` e `.../logout/route.ts` — novas rotas.
- `src/app/admin/layout.tsx` virou Server Component, checa o cookie via `next/headers`.
- `src/app/admin/AdminLoginForm.tsx` — novo componente cliente só do formulário.
- Todas as rotas `/api/admin/*` trocaram a checagem de header por `isAdminRequestAuthorized()` (mesmo arquivo `admin-session.ts`).
- Removido o segredo hardcoded de `criar-com-ia/page.tsx` e `admin/catalogos/page.tsx` (cookie vai sozinho em toda `fetch` same-origin).
- Variáveis novas: `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (`.env` local + Vercel). `ADMIN_API_SECRET` (antiga) foi removida do `.env` no lote final por já estar morta.

**Commit:** `58e1a33`
**Se algo quebrar:** se o login parar de funcionar, confira `ADMIN_SESSION_SECRET` está setada (o app lança erro alto/visível se não estiver, de propósito). Se um admin ficar "deslogado" sem motivo, o cookie expira em 30 dias — pode ser isso.

---

### C4 — `/admin` acessível via qualquer subdomínio de cliente
**Problema:** o middleware só reescrevia o path `/` em subdomínios de cliente; qualquer outro path (incluindo `/admin`) passava direto, servindo o painel normalmente em `qualquercliente.studiomenu.art/admin`.

**Achado extra descoberto durante a correção:** o roteamento por subdomínio **nunca funcionou de verdade**. O arquivo `middleware.ts` usava a convenção antiga do Next (deprecada na v16, renomeada pra `proxy.ts`) **e** estava na raiz do projeto em vez de dentro de `src/` (onde fica o `app/`) — as duas coisas juntas faziam ele nunca ser carregado.

**Correção:**
- Arquivo movido/renomeado: `middleware.ts` (raiz) → `src/proxy.ts`.
- Adicionado bloqueio: em qualquer subdomínio de cliente, `/admin` e `/admin/*` retornam 404 (nunca serve o painel).

**Commit:** `bc57f9a`
**Se algo quebrar:** se o roteamento por subdomínio (`cliente.studiomenu.art` → catálogo) parar de funcionar de novo no futuro, o primeiro lugar a checar é se `src/proxy.ts` ainda existe nesse caminho exato e exporta `middleware`/`proxy` como default. **Nota:** isso só é testável de verdade em produção depois que o domínio `studiomenu.art` for conectado na Vercel (com wildcard `*.studiomenu.art`) — antes disso a Vercel rejeita qualquer Host desconhecido no nível da própria plataforma (`DEPLOYMENT_NOT_FOUND`), antes mesmo do código rodar.

---

### C5 — Sem rate limiting em rotas sensíveis/custosas
**Problema:** `admin/login` (força bruta), `extract-catalog` (custa dinheiro, chama a API da Anthropic), `notify-telegram` (spam) e `onboarding/create-catalog` (criação pública em massa) não tinham nenhum limite de taxa.

**Correção:**
- `src/lib/rate-limit.ts` — `checkRateLimit(key, maxHits, windowSeconds)`, chama a função Postgres `check_rate_limit` (nova, documentada em `docs/schema.sql`) via `supabaseAdmin`. Falha "aberta" (permite) se a própria checagem der erro, pra não derrubar o site por uma falha secundária.
- Nova tabela `rate_limits` (key/count/window_start) + função `check_rate_limit` no Supabase (SQL em `docs/schema.sql`).
- Aplicado: login (10/15min por IP), `extract-catalog` (20/hora), `notify-telegram` (10/10min), `onboarding/create-catalog` (5/hora).

**Commit:** `34ead11`
**Se algo quebrar:** se um usuário legítimo disser "não consigo criar catálogo, diz que criei demais", é o limite de 5/hora do `onboarding/create-catalog` — pode ser ajustado em `src/app/api/onboarding/create-catalog/route.ts`. Pra desbloquear manualmente: `DELETE FROM rate_limits WHERE key LIKE 'onboarding-create:%'` no Supabase.

---

## 🟠 Alto

### A1 — `finalize-catalog` não grava `hero_phrase`/`bio_description`
**Problema:** o insert do fluxo "Criar Catálogo com IA" não setava esses dois campos, mesmo o preview de criação já usando os valores corretos do preset — o catálogo real nascia com a frase genérica de fallback (tom de Lash) pra qualquer nicho.

**Correção:** adicionado `hero_phrase`/`bio_description` (vindos do preset) no insert. Depois substituído pela função central (ver A8).

**Commit:** `1d44355` (depois absorvido por A8, commit `8026577`)

---

### A2 — Campos Manutenção/Efeito Visual descartados ao salvar
**Problema:** o formulário de edição de procedimento tinha campos "Manutenção" e "Efeito Visual", mas eles nunca viravam parte do `ProcedureItem` salvo — eram descartados silenciosamente. O campo `specs` (que os representaria) também não era gravado nem lido de volta em lugar nenhum (isso também resolveu o M1).

**Correção:**
- `src/components/catalog/CatalogLayout.tsx` — `handleSaveProcedure` agora monta o array de `specs` (Investimento/Duração/Manutenção/Efeito Visual) a partir do formulário.
- `src/app/api/catalog/save/route.ts` — `specs` incluído no insert de `order_services`.
- `src/lib/catalog-service.ts` — `specs` incluído na leitura de `order_services`.
- `src/components/catalog/VisualEditorModals.tsx` — ao reabrir um procedimento existente pra editar, os campos Manutenção/Efeito Visual voltam a ser populados a partir do `specs` já salvo (antes sempre vinham em branco).

**Commit:** `95c7ef0`

---

### A3 — `cat_label` vs `category` no fallback legado
**Problema:** o fallback de `catalog/save` (só acionado se o insert "moderno" falhar) gravava o campo como `cat_label`, mas a leitura em `catalog-service.ts` procura por `category`/`catLabel`/`cat` — a categoria seria perdida nesse caminho.

**Correção:** campo renomeado pra `category` no fallback, batendo com a leitura.

**Commit:** `7deb09f`
**Nota:** esse fallback só é acionado se o insert principal falhar contra o schema atual — não foi possível testar de ponta a ponta sem forçar uma falha artificial (decidiu-se não fazer isso por risco desnecessário). Corrigido por inspeção direta do código.

---

### A4 — `status: 44` inválido
**Problema:** `catalog/save/route.ts` retornava `{ status: 44 }` num caso de "catálogo não encontrado" — não é um código HTTP válido, risco de erro de runtime.

**Correção:** trocado para `404`.

**Commit:** `d9c308b`

---

### A5 — Falha de upload mascarada com `blob:` URL local
**Problema:** quando o upload de imagem falhava, o código caía num fallback que criava uma URL local (`URL.createObjectURL`) e salvava como se fosse sucesso — essa URL só existe na aba de quem fez upload; a imagem quebrava pra qualquer outra pessoa, sem nenhum aviso.

**Correção:** `src/components/catalog/VisualEditorModals.tsx` — removido o fallback; agora chama `onUploadError` (novo prop), que o `CatalogLayout.tsx` conecta a um toast de erro visível. Nenhuma imagem quebrada é mais aplicada.

**Commit:** `91c450d`

---

### A6 — `confirm()` nativo em `admin/catalogos`
**Problema:** último uso de diálogo nativo do navegador no projeto (todo o resto já usava modais customizados).

**Correção:** modal de confirmação customizado (mesmo padrão visual do `ResetConfirmModal` do Painel de Prospecção) antes de excluir um catálogo.

**Commit:** `2bdc0a6`

---

### A7 — Botão do WhatsApp sobre o CTA no Passo 3 do onboarding
**Problema:** o botão flutuante do WhatsApp (`z-index: 9999`) sobrepunha o CTA fixo "Criar meu catálogo com esse estilo" no preview ao vivo do Passo 3 — mesmo bug já corrigido antes no "Criar com IA", mas nunca replicado aqui.

**Correção:** a classe CSS que esconde o botão nesse cenário foi generalizada (`.criar-ia-review` → `.lm-preview-no-wsp-float`) e aplicada também no wrapper do Passo 3 (`src/components/onboarding/OnboardingForm.tsx`).

**Commit:** `9e4efe9`

---

### A8 — Sem função central pros payloads de `orders`/`order_services`
**Problema:** a causa raiz de vários bugs já corrigidos (A1, M2, M3 entre outros): cada um dos 3 pontos de escrita (onboarding, criar-com-ia, editor) remontava manualmente a lista de campos, então era fácil esquecer um campo num lugar e não no outro.

**Correção:** criado `src/lib/order-payload.ts` com `buildOrderInsertPayload`, `buildOrderUpdatePayload`, `buildServicesPayload` e (depois, no M5) `generateUniqueSlug`. As 3 rotas de escrita (`onboarding/create-catalog`, `admin/finalize-catalog`, `catalog/save`) passaram a usar essas funções. Como efeito colateral, corrigiu também o `studio_name` (M3), que nunca era gravado em nenhum dos 2 fluxos de criação.

**Commit:** `8026577`
**Se algo quebrar:** **este é o arquivo mais importante pra olhar** se um catálogo nascer ou for salvo com um campo errado/faltando. Qualquer campo novo da tabela `orders` que precise ser setado na criação/edição deve ser adicionado em `buildOrderInsertPayload`/`buildOrderUpdatePayload`, não direto nas rotas.

---

### A9 — Duas fontes de verdade pros procedimentos
**Problema:** a tabela `orders` tem uma coluna JSONB `procedures` que era gravada só pelo UPDATE do editor (nunca pelos 2 fluxos de criação), enquanto `order_services` (tabela separada, mais rica — tem `specs`, `badge`, etc.) é a fonte realmente usada na leitura. As duas ficavam fora de sincronia.

**Correção:** `buildOrderUpdatePayload` (em `order-payload.ts`) não inclui mais `procedures` — `order_services` é a única fonte de verdade em todos os fluxos agora. Também foi limpo (via SQL direto, não commitado — é dado de produção) o dado obsoleto de 3 catálogos reais que carregavam essa coluna preenchida (`suzana-souza-242`, `vanessa-camargo`, `ana-beatriz-539`).

**Commit:** `99302e6`
**Nota:** a coluna `orders.procedures` continua existindo no schema (não foi removida, só parou de ser escrita) — `catalog-service.ts` ainda tem um fallback de leitura pra ela caso `order_services` esteja vazio, como rede de segurança. Não foi confirmado nenhum catálogo real que dependa desse fallback.

---

## 🟡 Médio

> M1, M2 e M3 foram resolvidos como efeito colateral do A2 e A8 (ver acima) — não têm commit próprio.

### M4 — WhatsApp sem código de país
**Problema:** o número era salvo só com DDD+número (10-11 dígitos), mas os links `wa.me`/`api.whatsapp.com` esperam o código do país (55) — podia falhar em alguns dispositivos/contextos.

**Correção:** `normalizeWhatsappBR()` em `src/lib/format.ts`, aplicada tanto na escrita (`order-payload.ts`) quanto na leitura (`catalog-service.ts`) e no link de entrega do admin (`admin/catalogos/page.tsx`) — funciona pra dado novo e pra dado antigo já salvo sem o prefixo.

**Commit:** `560a935`

---

### M5 — Slug sem checagem de colisão
**Problema:** o slug era gerado com um sufixo aleatório de 3 dígitos (900 combinações) sem checar no banco se já existia.

**Correção:** `generateUniqueSlug()` em `src/lib/order-payload.ts` — consulta o Supabase antes de aceitar um slug, até 10 tentativas + fallback por timestamp. Usada pelas 2 rotas de criação.

**Commit:** `560a935`

---

### M6 — Nomenclatura de imagem de fundo inconsistente entre presets
**Problema:** o preset Lash só preenchia `final_screen_bg_url`; os outros 3 nichos só preenchiam `cta_bg_url` — a tela final dependia de uma cadeia de fallback frágil em `CTASection.tsx`.

**Correção:** todos os 4 presets (`src/data/niche-presets/*/index.ts`) agora preenchem os dois campos.

**Commit:** `560a935`

---

### M7 — Preset Lash dependia de domínio externo (`lashmenu.com`)
**Problema:** `cover_media_url`, `avatar_url`, `instructions_bg_url` e `final_screen_bg_url` do preset Lash apontavam pra `https://lashmenu.com/...` — ponto único de falha fora do controle do projeto.

**Correção:** descoberto que os arquivos equivalentes já existiam localmente em `public/modelos/mosaico/assets/img/` (mesmo nome de arquivo) — trocado pra caminho local em `src/data/niche-presets/lash/index.ts`. Os outros 3 presets também tinham `cover_media_url`/`avatar_url` apontando pra `lashmenu.com` (não fazia parte do achado original) — corrigidos junto.

**Commit:** `560a935`

---

### M8 — Barra do editor sem media query
**Problema:** em telas ≤375px (iPhone SE, Android compacto), os 6 botões de ícone + o botão Salvar não cabiam com folga nos ~280px úteis da barra flutuante inferior.

**Correção:** `@media (max-width: 380px)` em `src/styles/visual-editor.css` reduzindo tamanho/gap dos botões e padding do botão Salvar.

**Commit:** `83d4ce5`
**Nota:** ajuste só de CSS, não foi possível confirmar visualmente num navegador real — a conta de espaço foi feita manualmente (ver commit).

---

### M9 — Upload de imagem aceitava SVG
**Problema:** a validação era `file.type.startsWith('image/')`, o que aceita `image/svg+xml` — SVG pode conter script embutido e é servido publicamente pelo bucket.

**Correção:** `src/lib/file-validation.ts` — allowlist explícita (`ALLOWED_IMAGE_TYPES` = JPG/PNG/WEBP/GIF), usada em `catalog/upload/route.ts` e `admin/finalize-catalog/route.ts`. `extract-catalog/route.ts` (que também aceita PDF) passou a reusar essa mesma constante (resolve também o B6).

**Commit:** `d91fcb9`

---

### M10 — Upload bufferizado antes de checar tamanho ⚠️ **Não resolvido**
**Problema:** o corpo da requisição é todo lido (`request.formData()`) antes de qualquer checagem de `file.size` rejeitar — risco de DoS por upload deliberadamente enorme.
**Por que não foi resolvido:** a Vercel já impõe um limite de tamanho de corpo no nível da plataforma (tipicamente ~4.5MB em planos Hobby, mais alto em planos pagos) antes da função sequer rodar — o que mitiga parcialmente o risco independente do código. Corrigir isso de forma robusta exigiria streaming/parsing manual do corpo da requisição, mudança mais invasiva nas rotas de upload. **Fica como item em aberto**, recomendado revisitar se o plano de hospedagem mudar ou se um caso real de abuso aparecer.

---

### M11 — Erros do Supabase vazando pro client
**Problema:** várias rotas retornavam `error.message` (do Postgres/Supabase) direto na resposta HTTP — vazamento de detalhes internos.

**Correção:** todas as respostas de erro trocadas por mensagens genéricas fixas; o erro real continua sendo logado no servidor (`console.error`).

**Commit:** `d91fcb9`

---

### M12 — `notify-telegram` sem auth nem rate limit 🟡 **Parcial**
**Problema:** endpoint público, sem autenticação, que dispara mensagem no Telegram do dono a partir de texto livre controlado pelo chamador.
**O que foi feito:** rate limit de 10/10min por IP (parte do C5, commit `34ead11`) — reduz bastante o risco de spam em massa.
**O que falta:** ainda não exige nenhuma prova de que o `slug` informado corresponde a uma criação real recente. Risco residual baixo (rate limit já limita o dano), mas não zerado.

---

### M13 — Fallback hardcoded de URL/chave do Supabase
**Problema:** `src/lib/supabase.ts` tinha a URL e a anon key do Supabase hardcoded como fallback caso as env vars não existissem.

**Correção:** o arquivo inteiro foi **deletado** — depois da migração pro client privilegiado (C1), nada mais no projeto importava esse client anônimo.

**Commit:** `d91fcb9`

---

### M14 — Sem `next.config.ts`/headers de segurança
**Problema:** nenhuma configuração de headers HTTP de segurança.

**Correção:** `next.config.ts` novo — `X-Frame-Options: DENY` em `/admin/*` (proteção contra clickjacking do login), `X-Content-Type-Options: nosniff` e `Referrer-Policy` em todo o site.

**Commit:** `83d4ce5`
**Nota:** não foi implementada uma Content-Security-Policy completa — o app usa bastante estilo inline e fontes externas do Google, e uma CSP mal calibrada quebraria coisas silenciosamente. Fica como possível trabalho futuro se quiser essa camada extra.

---

### M15 — Middleware com substring em vez de igualdade exata
**Problema:** `!parts[0].includes('vercel')`/`!parts[0].includes('localhost')` comparava substring no primeiro label do host (candidato a slug de cliente) em vez de checar se o host era de fato um domínio da Vercel/local — um cliente com slug contendo "vercel" ou "localhost" no nome (ex: "vercelli-studio") era incorretamente excluído do roteamento por subdomínio.

**Correção:** `src/proxy.ts` — agora checa `host.endsWith('.vercel.app')` e `host.includes('localhost')` no host inteiro, não no primeiro label.

**Commit:** `83d4ce5`

---

### M16 — Lista de palavras reservadas de subdomínio incompleta
**Problema:** só excluía `www`, `studiomenu`, `lashmenu-vendas` — não incluía `admin`, `api`, `form`, `vendas`, `c`, que são rotas reais do app.

**Correção:** `src/lib/reserved-slugs.ts` — lista centralizada e completa, usada em `src/proxy.ts`.

**Commit:** `83d4ce5`

---

### M17 — Erros de query silenciados em `admin/catalogos`
**Problema:** falhas ao listar/aprovar catálogos só iam pro `console.error`, sem nenhum feedback visível pro admin.

**Correção:** toast de erro adicionado nos 3 pontos (`fetchCatalogs`, `approveAndDeliver`).

**Commit:** `d91fcb9`

---

### M18 — Lista de nichos duplicada em 3 lugares
**Problema:** `NICHE_OPTIONS` (fonte "oficial"), `NICHE_TABS` (estúdio de vídeos) e `NICHE_CARDS` (showroom) — 3 arrays com os mesmos 4 nichos, mantidos manualmente em sincronia.

**Correção:** `src/data/niche-options.ts` (`NICHE_OPTIONS`) virou a fonte única de `value`/`label`; as outras duas telas derivam dela via `.map()`, só decorando com seu próprio ícone/emoji.

**Commit:** `bf82371`

---

### M19 — Dependências não usadas no `package.json`
**Problema:** `@supabase/ssr`, `tailwind-merge`, `clsx` sem nenhum uso em `src/` ou `scripts/`.

**Correção:** removidas via `npm uninstall`.

**Commit:** `bf82371`

---

### M20 — `handleNicheChange` duplicado
**Problema:** função idêntica (reseta modelo/tema ao trocar de nicho) copiada entre `OnboardingForm.tsx` e `criar-com-ia/page.tsx`.

**Correção:** `src/lib/use-niche-selection.ts` — hook `useNicheSelection()` compartilhado, encapsula `niche`/`layoutModel`/`themeVariant` + o handler.

**Commit:** `bf82371`

---

### M21 — Heurística mágica "hero.png"
**Problema:** `InstructionsSection.tsx` descartava qualquer `instructions_bg_url` cujo caminho terminasse em "hero.png" (case-insensitive), assumindo (por nome de arquivo) que seria igual à foto de capa.

**Correção:** comparação trocada por igualdade direta com a URL real da capa (`coverUrl`, novo prop, vindo de `catalogState.cover_media_url` em `CatalogLayout.tsx`), não mais por nome de arquivo.

**Commit:** `560a935`

---

### M22 — `edit_token` em texto puro na URL, sem expiração ⚠️ **Não resolvido (risco arquitetural aceito)**
**Problema:** a única credencial de edição é um token estático na query string, sem expiração/rotação. Fica no histórico do navegador, pode vazar em prints/conversas.
**Por que não foi resolvido:** seria uma mudança de arquitetura de autenticação bem maior (sessão via cookie assinado gerado após o primeiro clique no link mágico, em vez de token permanente na URL) — fora do escopo desta auditoria de correções pontuais. Registrado aqui como referência pra uma eventual reformulação futura do modelo de acesso da cliente ao próprio catálogo.

---

## 🟢 Baixo

### B1 — Dois componentes `ProcedureModal` com nome idêntico
**Correção:** o modal público de detalhe (`src/components/catalog/ProcedureModal.tsx`) foi renomeado pra `ProcedureDetailModal.tsx` — o outro (`modals/ProcedureModal.tsx`, de edição) manteve o nome.
**Commit:** `d91fcb9`

### B2-B4 — Imports mortos (React/ícones/tipos)
**Correção:** removidos imports não usados de `React` (JSX automático não precisa mais dele), ícones (`Clapperboard`, `Palette`, `Layers`, `Scissors` em alguns arquivos) e o tipo `ThemeVariant` em `VisualEditorBottomBar.tsx`, em 15 arquivos.
**Commit:** `d91fcb9`

### B5 — Sem `robots.txt`
**Correção:** `src/app/robots.ts` novo, bloqueando `/admin` e `/api` da indexação.
**Commit:** `83d4ce5`

### B6 — Padrão de validação MIME inconsistente
**Correção:** resolvido junto do M9 — `extract-catalog/route.ts` passou a reusar `ALLOWED_IMAGE_TYPES` de `src/lib/file-validation.ts`.
**Commit:** `d91fcb9`

### B7 — `APIFY_API_TOKEN` órfã no `.env` do Next
**Correção:** não é código versionado (`.env` é gitignorado) — foi adicionado um comentário no `.env` local explicando que essa chave é usada só por `scripts/create_test_client.js` e `Prospecção/apify_service.py`, fora do runtime do app Next. Aproveitado pra remover do mesmo arquivo o `ADMIN_API_SECRET`, que ficou órfão desde o C3.
**Sem commit** (arquivo não versionado).

---

## Novos módulos criados durante a auditoria

| Arquivo | Propósito |
|---|---|
| `src/lib/supabase-admin.ts` | Client Supabase privilegiado (service_role), server-only |
| `src/lib/admin-session.ts` | Sessão do admin (cookie httpOnly assinado) |
| `src/lib/rate-limit.ts` | Limitador de taxa via Postgres |
| `src/lib/order-payload.ts` | Fonte única dos payloads de `orders`/`order_services` + geração de slug único |
| `src/lib/file-validation.ts` | Allowlist de tipos de imagem aceitos em upload |
| `src/lib/reserved-slugs.ts` | Palavras reservadas de subdomínio |
| `src/lib/use-niche-selection.ts` | Hook compartilhado de seleção de nicho/modelo/tema |
| `src/app/api/onboarding/create-catalog/route.ts` | Criação de catálogo (onboarding) movida pro server |
| `src/app/api/admin/login/route.ts`, `.../logout/route.ts` | Login/logout do admin |
| `src/app/api/admin/catalog-actions/route.ts` | Aprovar/excluir catálogo (server-side) |
| `src/app/api/admin/catalogs-list/route.ts` | Listagem de catálogos (server-side) |
| `src/app/admin/AdminLoginForm.tsx` | Formulário de login do admin |
| `src/proxy.ts` | Roteamento por subdomínio (era `middleware.ts` na raiz) |
| `next.config.ts` | Headers de segurança |
| `src/app/robots.ts` | `robots.txt` dinâmico |

## Variáveis de ambiente novas (`.env` local + Vercel)

- `SUPABASE_SERVICE_ROLE_KEY` — client privilegiado (C1)
- `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` — sessão do admin (C3)
- `ADMIN_API_SECRET` foi **removida** (ficou órfã depois do C3)

## Mudanças de schema no Supabase (fora do git — SQL rodado direto, documentado em `docs/schema.sql`)

1. RLS de `orders`/`order_services` fechada pra `anon` (C1).
2. Policy de upload anônimo removida do bucket `catalog-assets`, leitura pública mantida (C1).
3. Tabela `rate_limits` + função `check_rate_limit` criadas (C5).
4. Limpeza pontual de dado obsoleto em 3 catálogos reais (coluna `orders.procedures`, A9).

---

## Itens conhecidos que ficaram em aberto

- **M10** — upload sem checagem de tamanho antes de bufferizar (mitigado parcialmente pelo limite de plataforma da Vercel).
- **M12** — `notify-telegram` sem autenticação própria (mitigado por rate limit).
- **M22** — modelo de acesso da cliente via `edit_token` estático na URL, sem expiração (risco arquitetural conhecido e aceito por ora).

Se decidir atacar algum desses no futuro, comece por este documento pra entender o contexto e o porquê de terem ficado de fora dessa rodada.
