# Playbook de Comportamento — Leitura obrigatória pra qualquer IA/agente novo

> Este documento não é sobre o StudioMenu. É sobre **como trabalhar** neste repositório — pra
> qualquer sessão de IA nova, em qualquer ferramenta (Claude, Antigravity, Cursor, etc.) e em
> qualquer estação, se comportar do mesmo jeito que já foi validado como funcionando bem.
>
> Se você é uma IA lendo isto: siga as regras abaixo **ao pé da letra**, desde a primeira
> mensagem da conversa, mesmo que a usuária não repita nada disso. Não pergunte se deve seguir —
> siga.

---

## 0. Ordem de leitura, antes de fazer qualquer coisa

1. **Este documento, inteiro.**
2. **`docs/atual/ESTADO_ATUAL.md`**, inteiro — é a fonte única de verdade sobre o que o produto
   **é hoje** (stack, estrutura, preços, pendências reais). Releia se a conversa for longa e você
   não tiver certeza de algo.
3. Se a ferramenta usada for Claude Code: `CLAUDE.md` já aponta pra esses dois documentos
   automaticamente — mesmo assim, trate as regras deste arquivo como válidas e obrigatórias.

**Nunca comece a editar código, responder dúvida técnica, ou sugerir qualquer coisa antes de
completar os passos 1 e 2.**

---

## 1. Regra de ouro: nunca alucine dado antigo

Este projeto já migrou de nome e de modelo de negócio (era "LashMenu", site estático, só lash
designer; virou "StudioMenu", SaaS multi-nicho com agendamento automático). O histórico de como
isso aconteceu fica em `docs/historico/` — **esse diretório é só rastreabilidade, nunca
instrução sobre o estado atual.**

**Incidente real que não pode se repetir:** uma sessão de IA anterior, em outra ferramenta, leu
dados antigos (preços do LashMenu como R$89/R$149, já mortos) e os usou pra escrever mensagens de
venda novas, como se fossem o preço atual. O preço atual do StudioMenu está **só** em
`src/lib/pricing.ts` — nunca hardcoded em nenhum outro lugar, nunca copiado de um documento de
`docs/historico/`, nunca "lembrado" de uma conversa anterior sem conferir o arquivo de novo.

**Regra prática:** qualquer informação que pareça "fato do produto" (preço, nome de feature,
estrutura de pastas, fluxo de um botão) — confira contra o código ou contra
`docs/atual/ESTADO_ATUAL.md` antes de usar. Se a única fonte for `docs/historico/` ou uma
lembrança de conversa passada, **não confie sem checar o código primeiro**.

---

## 2. Regra de ouro: fluxo de Git — nunca pule etapa

Todo trabalho novo acontece na branch `desenv`. O ciclo completo de qualquer mudança, sem
exceção:

1. **Implementa localmente.** Não comita nada ainda.
2. **A usuária testa** (`localhost:3000`, ou o preview da Vercel). Espera o teste dela — nunca
   assume que "deve estar bom" e já sobe.
3. **Só comita/dá push na `desenv` quando ela disser explicitamente** algo como "pode subir pra
   desenv". Antes de comitar, rode **sempre**:
   - `npx tsc --noEmit` — tem que sair limpo.
   - `node scripts/check-integrity.js` — já roda sozinho no pre-commit hook; nunca pule com
     `--no-verify`.
4. **Nunca promove pra `main` sozinho.** Só abre caminho pra produção quando ela disser,
   separadamente e pra aquela mudança específica, algo como "pode subir pra main" — uma aprovação
   anterior (de outra mudança, ou "em geral") **não vale** pra essa. Pergunte de novo toda vez.
5. **Mecânica da promoção pra `main`** (nunca faz merge direto de `desenv` inteira):
   ```
   git fetch origin
   git checkout -b <nome-da-branch> origin/main
   git cherry-pick <só o(s) commit(s) novo(s) desde a última promoção>
   # resolver conflito óbvio de docs/historico/ vs docs/migrations/ se aparecer
   rm -rf .next && npx tsc --noEmit   # limpa cache de build às vezes corrompido ao trocar de branch
   git push -u origin <nome-da-branch>
   git checkout desenv
   ```
   Depois, **entrega só o link pra abrir o PR** (`https://github.com/<owner>/<repo>/pull/new/<branch>`).
   **Nunca clica em "Merge" — isso é sempre manual, feito pela usuária.** O motivo não é
   burocracia: o repositório é privado no plano gratuito do GitHub, que não bloqueia push direto
   na `main` (já aconteceu, sem querer, numa sessão anterior) — essa disciplina é a **única**
   coisa que protege produção (`studiomenu.art`, clientes reais).
6. Leva pra `main` só código/produto (e `docs/atual/`, se mudou) — nunca `docs/historico/`, que
   só existe na `desenv`.

**Nunca:** `git push --force` em qualquer branch compartilhada, `git reset --hard` sem checar
`git status` antes, pular o hook de integridade, mexer em `main` sem pedido explícito e recente.

---

## 3. Regra de ouro: faça só o que foi pedido

- Implemente exatamente o que a usuária pediu. Nada de refatoração "de bônus", abstração
  especulativa, ou "já que estou aqui, vou melhorar isso também" sem perguntar antes.
- Se perceber que o pedido tem uma interpretação ambígua (ex: "coloca essa mensagem no final dos
  funis" — quais funis? qual arquivo?), **pergunte antes de fazer uma edição grande e
  abrangente**. Não adivinhe um escopo amplo.
- Se, pra atender o pedido direito, for preciso ir um pouco além do que foi dito literalmente
  (ex: mudar uma frase adjacente pra manter consistência), **sinalize isso claramente** no
  relatório final, em vez de simplesmente incluir a mudança sem avisar.
- Não adicione tratamento de erro, validação ou fallback pra cenário que não pode acontecer. Não
  crie feature flag nem compatibilidade retroativa sem necessidade real.

---

## 4. Regra de ouro: verifique antes de dizer que terminou

Antes de reportar qualquer mudança como pronta, ou de perguntar "pode subir pra desenv?":

- `npx tsc --noEmit` limpo.
- `node scripts/check-integrity.js` limpo (ou deixa o pre-commit hook rodar — ele já faz isso).
- Se a mudança for visual/front-end e houver como testar (servidor local rodando), confira o
  resultado real antes de reportar — não baseie sucesso só no fato de o build ter passado.
- **Nunca valide UI com automação de navegador** (Puppeteer/Playwright) — a usuária testa
  manualmente; a IA valida por código, compilador e servidor.
- **Nunca introduza `alert()`/`confirm()` nativos do navegador** — todo confirm/alerta usa o
  sistema de modal React já existente (`src/components/catalog/VisualEditorModals.tsx` é a
  referência de padrão).

---

## 5. Regra de ouro: investigue de verdade, não adivinhe

Quando a usuária reportar um bug ("fala que salva mas não salva", "o card ficou com borda
preta"):

- Leia o código real do caminho envolvido (não assuma como "deveria" funcionar).
- Formule uma hipótese concreta de causa raiz e **confirme antes de declarar resolvido** — por
  exemplo, rodando uma query direta no banco, um script isolado de teste, ou lendo o estado
  exato que o código produz. Apague scripts de teste temporários depois de usar.
- Se uma correção já aplicada não funcionar na prática (ex: ela testou em produção e não
  resolveu), **não insista na mesma hipótese** — reverta rápido se já estiver em produção, admita
  o diagnóstico errado, e investigue de novo com a informação nova.
- Prefira a causa raiz real à solução mais fácil de implementar. Um band-aid em cima de um
  diagnóstico errado tende a piorar (já aconteceu neste projeto: tentativa de CSS pra "disfarçar"
  uma borda preta que na verdade já estava gravada nos pixels da foto — a correção certa foi
  cortar a borda no processamento da imagem, não o CSS).

---

## 6. Como se comunicar

- **Sempre em português.**
- Direto e conciso — sem floreio, sem narrar o processo de pensamento, sem repetir o pedido da
  usuária antes de responder.
- Pra pergunta exploratória/de opinião ("o que você acha", "como você resolveria"), dê uma
  recomendação curta (poucas frases) com o principal trade-off — **não implemente nada até ela
  confirmar.**
- Pra pedido direto de implementação, implemente, verifique (seção 4) e relate o resultado de
  forma objetiva: o que mudou, qual comando rodou, qual o resultado.
- Ao final de cada entrega: diga claramente se está esperando teste local dela, ou se já pode
  subir — nunca assuma a próxima etapa sozinho.

---

## 7. Fatos do ambiente que evitam repetir pergunta

- Repositório: `doupsdigital/studiomenu`. Branch de trabalho: `desenv`. Produção: `main` →
  `studiomenu.art`.
- **Testes locais (`next dev`) e a branch `desenv` usam o banco de DESENVOLVIMENTO, nunca o de
  produção.** As 3 chaves que fazem isso (`NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) ficam em
  `.env.development.local` (fora do Git), sobrescrevendo só essas 3 do `.env` normal — **o nome
  do arquivo e o nome das variáveis têm que ser exatamente esses**; qualquer outro nome (ex:
  `.env.dev.local`) é silenciosamente ignorado pelo Next.js, e isso já causou um bug real:
  dias de `next dev` local rodando contra produção sem ninguém perceber (corrigido em
  2026-10-02 — ver `docs/atual/ESTADO_ATUAL.md`, seção 5). Antes de rodar qualquer script ou
  query que leia/escreva no banco a partir do ambiente local, confirme qual projeto Supabase está
  configurado — nunca assuma.
- Conflito recorrente no cherry-pick pra `main`: caminho de migração em
  `docs/historico/migrations/` (só existe na `desenv`) vs `docs/migrations/` — resolver mantendo
  o de `docs/migrations/`.
- Cache de build (`.next/dev/types`) pode ficar corrompido ao trocar de branch com o servidor de
  dev rodando em paralelo — gera erro falso no `tsc`. Resolve com `rm -rf .next` antes de rodar o
  typecheck de novo.
- Preços e labels de plano: **só** `src/lib/pricing.ts` — nunca hardcoded em outro lugar, nunca
  copiado de script de venda antigo.

---

## 8. Quando estiver em dúvida

Pare e pergunte à usuária — com uma pergunta objetiva, se possível já com opções — em vez de
adivinhar um caminho amplo. Isso vale especialmente para: escopo de uma edição que toca vários
arquivos, decisão de produto (preço, texto de venda, comportamento visível pro cliente final) e
qualquer coisa que mexa em dado real de cliente.
