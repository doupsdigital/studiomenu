@AGENTS.md

# Leitura obrigatória antes de qualquer tarefa

Leia **`docs/atual/ESTADO_ATUAL.md`** primeiro — é o único documento com garantia de refletir o
estado atual do projeto (produto, stack, estrutura de pastas, pendências reais).

**`docs/historico/`** é só rastreabilidade (registro Fase por Fase de como cada funcionalidade
foi construída) — **nunca** trate algo de lá como descrição do estado atual sem confirmar contra
o código. Muita coisa registrada ali foi revertida ou evoluiu depois.

# Regra crítica: `main` não tem trava técnica

Todo trabalho acontece na branch `desenv`. **NUNCA dê `git push`/merge na branch `main` sem
autorização explícita da usuária pra aquela mudança específica** — mesmo que pareça trivial (um
typo, um README). O GitHub **não bloqueia** push direto na `main` (o repositório é privado no
plano gratuito, que não tem proteção de branch); a única coisa que impede uma mudança não
revisada de chegar em produção (`studiomenu.art`, clientes reais) é esta regra. Já aconteceu de
um push de teste ir parar na `main` sem querer — não repita. Detalhes em
`docs/atual/ESTADO_ATUAL.md`, seção 5.
