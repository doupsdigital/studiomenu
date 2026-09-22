# 🌸 StudioMenu — Catálogo digital + agendamento para profissionais de beleza

> SaaS (`studiomenu.art`) de catálogo digital interativo para lash designers, nail designers,
> esteticistas e studios multi-serviço, com agendamento automático opcional
> (**StudioMenu Básico** R$ 39/mês, **StudioMenu+** R$ 69,90/mês).

**Novo por aqui? Leia primeiro [`docs/atual/ESTADO_ATUAL.md`](docs/atual/ESTADO_ATUAL.md)** — é
o documento com garantia de refletir o estado atual do produto, da stack e da estrutura de
pastas. Este README é só a vitrine do repositório.

---

## Stack

Next.js 16 (App Router, TypeScript) na Vercel · Supabase (Postgres + Storage) · Asaas (cobrança
recorrente via Pix/cartão) · PWA com push notifications.

## Estrutura (resumo)

```
studiomenu/
├── src/
│   ├── app/            # rotas: catálogo público (c/[slug]), app da profissional (app/[slug]),
│   │                   #   admin, form de onboarding, api/
│   ├── components/     # catalog/, agenda/, config/, app-shell/, billing/, admin/, ...
│   └── lib/            # supabase-admin, catalog-service, asaas, billing-service, scheduling/, ...
├── docs/atual/          # estado atual do projeto (ler primeiro)
├── docs/historico/       # registro por Fase — rastreabilidade, não é fonte de verdade do presente
└── legacy/               # site estático LashMenu pré-Next.js — arquivo histórico, não editar
```

Detalhes completos (fluxos, workflow de git/deploy, pendências reais) em
[`docs/atual/ESTADO_ATUAL.md`](docs/atual/ESTADO_ATUAL.md).

## Workflow

Trabalho sempre em `desenv` (deploy de Preview com chaves sandbox do Asaas). `main` é produção
(`studiomenu.art`), protegida — só recebe mudanças via Pull Request depois de aprovadas.
