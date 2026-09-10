# 📁 Organização & Estrutura do Projeto — StudioMenu

> Guia visual de referência rápida sobre a estrutura de pastas, hierarquia, responsabilidades e como cada módulo do ecossistema se conecta.
>
> **Atualizado em:** 2026-09-10. Reflete a estrutura **Next.js atual**. A versão anterior deste documento descrevia o site estático antigo (`lashmenu-vendas`), que foi migrado e hoje vive só como referência histórica em `legacy/`.

---

## 🌳 1. Mapa Visual da Hierarquia do Projeto

```
📁 studiomenu/
│
├── 📁 src/                            ─── [TODO O APP NEXT.JS — CÓDIGO ATIVO]
│   ├── 📁 app/                        ─── Rotas (App Router). Cada pasta = uma URL.
│   │   ├── 📄 layout.tsx              ─── Layout raiz (envolve TODAS as páginas)
│   │   ├── 📄 page.tsx                ─── Rota "/" — landing page de marketing do StudioMenu
│   │   ├── 📄 globals.css             ─── Entrada de CSS global (importa mosaico.css + Tailwind)
│   │   ├── 📄 mosaico.css             ─── Design visual do catálogo (Hero, Grade, Orientações, Contato, Modal) — usado por TODO catálogo, de qualquer rota
│   │   ├── 📄 visual-editor.css       ─── Estilo só da "casca" do editor visual in-place
│   │   ├── 📁 c/                      ─── Renderização de catálogo
│   │   │   ├── 📁 [slug]/             ─── Catálogo real de uma cliente (`/c/nome-da-cliente`)
│   │   │   ├── 📁 demo/               ─── Catálogo de demonstração interno
│   │   │   └── 📁 showcase/[niche]/   ─── Vitrine por nicho (usada pelo Showroom do admin)
│   │   ├── 📁 admin/                  ─── Painel administrativo (senha protegida)
│   │   │   ├── 📄 page.tsx            ─── Hub — links pra todas as ferramentas abaixo
│   │   │   ├── 📁 catalogos/          ─── Gestão de catálogos/pedidos
│   │   │   ├── 📁 showroom/           ─── Vitrines por nicho + ambiente de testes
│   │   │   ├── 📁 scripts/            ─── Playbook de vendas X1 (WhatsApp)
│   │   │   ├── 📁 formularios/        ─── Links dos formulários de onboarding
│   │   │   ├── 📁 paginas-vendas/     ─── Links das páginas de vendas (LPA/LPB)
│   │   │   ├── 📁 prospeccao/         ─── CRM de prospecção/leads
│   │   │   └── 📁 estudio-videos/     ─── Simulador de gravação de vídeos/anúncios
│   │   ├── 📁 form/                   ─── Formulário de onboarding (cliente cria o catálogo dela)
│   │   ├── 📁 vendas/                 ─── Páginas de vendas (`/vendas/lpa`, `/vendas/lpb`)
│   │   └── 📁 api/                    ─── Rotas de API (salvar catálogo, upload de imagem)
│   │
│   ├── 📁 components/                 ─── Componentes React reutilizáveis
│   │   ├── 📁 catalog/                ─── Tudo que renderiza um catálogo (Hero, Grade, Modal, Editor Visual)
│   │   ├── 📁 onboarding/             ─── Motor do formulário de cadastro (`OnboardingForm`)
│   │   └── 📁 sales/                  ─── Motor das páginas de vendas (`SalesLandingPage`)
│   │
│   ├── 📁 lib/                        ─── Camada de serviço (Supabase, busca de dados do catálogo)
│   ├── 📁 types/                      ─── Tipos TypeScript compartilhados
│   ├── 📁 data/                       ─── Conteúdo estático em código (ex: scripts de vendas X1)
│   └── 📁 modelos-novos/              ─── Dados de exemplo por nicho (lash/nail/estética/studio) — usados no Demo, Showroom e formulário
│
├── 📁 public/                         ─── Arquivos estáticos servidos direto pelo Next.js
│   ├── 📁 modelos/                    ─── Imagens dos modelos de catálogo (mosaico, clássico, nail, estética, studio)
│   └── 📁 data/                       ─── `prospeccao-leads-seed.json` (dados iniciais do CRM)
│
├── 📁 legacy/                         ─── [ARQUIVO HISTÓRICO — SITE ESTÁTICO ANTIGO, NÃO USADO PELO APP]
│   ├── 📁 admin/, catalogo/, clientes/, formulario/, modelos/, vendas/, api/, prospeccao/
│   ├── 📄 index.html, server.js
│   └── (nada aqui é lido pelo Next.js — mantido só como referência/histórico, não apagar sem necessidade)
│
├── 📁 Prospecção/                     ─── [FERRAMENTA ATIVA — scraping de leads via Apify, uso manual]
├── 📁 scripts/                        ─── Scripts de automação (Meta Ads em Python) + auditoria de integridade (`check-integrity.js`, usado pelo git hook)
├── 📁 criativos/                      ─── Mídias/criativos de tráfego pago (imagens, vídeos)
├── 📁 docs/                           ─── Documentação e estratégia
│
├── 📄 middleware.ts                   ─── Roteamento de subdomínio (`cliente.studiomenu.art` → `/c/cliente`)
├── 📄 next.config / tsconfig.json / tailwind.config.js / postcss.config.js  ─── Configuração do Next.js/TypeScript/Tailwind
├── 📄 package.json                    ─── Dependências e scripts (`dev`, `build`, `start`)
└── 📄 .env                            ─── Chaves do Supabase (não versionado publicamente)
```

---

## 🧭 2. Dicionário de Responsabilidades das Pastas

| Pasta | Para que serve? | Pode mexer com frequência? |
| :--- | :--- | :--- |
| **`src/app/`** | Todas as rotas do site (Next.js App Router). Cada subpasta com `page.tsx` é uma URL. | ✅ Normal, é onde o trabalho do dia a dia acontece. |
| **`src/app/mosaico.css`** | O design visual (layout, espaçamento, cor) de todo catálogo — Hero, Grade, Orientações, Contato, Modal. Vale pra qualquer rota que renderize um catálogo. | ⚠️ Mudanças afetam **todos** os catálogos, de todos os clientes. Testar sempre em Rose e Luxury. |
| **`src/components/catalog/`** | Componentes React que desenham o catálogo (`CatalogLayout`, `HeaderCover`, `ProcedureGrid`, etc.) + o editor visual in-place. | ⚠️ Área crítica — mudanças afetam catálogos em produção. |
| **`src/components/onboarding/`** | O formulário onde a profissional cadastra o catálogo dela pela primeira vez. | ✅ Livre pra melhorias no fluxo. |
| **`src/components/sales/`** | Páginas de vendas usadas em tráfego pago (LPA/LPB). | ✅ Livre pra evoluções de marketing/design. |
| **`src/app/admin/`** | Painel administrativo interno (senha `5669`) — gestão de catálogos, CRM de prospecção, scripts de vendas, showroom. | ✅ Livre, é ferramenta interna, não afeta clientes. |
| **`src/lib/`** | Conexão com Supabase e busca/montagem dos dados do catálogo. | ⚠️ Área crítica — qualquer catálogo depende disso. |
| **`src/modelos-novos/`** | Dados de exemplo (nome fictício, procedimentos, frases) usados no Demo/Showroom/formulário — não é o catálogo real de nenhuma cliente. | ✅ Livre pra ajustar textos de exemplo. |
| **`public/modelos/`** | Imagens usadas nos catálogos (fotos de capa/procedimentos dos modelos oficiais). | ✅ Livre pra adicionar/trocar imagens. |
| **`legacy/`** | Site estático antigo (pré-Next.js). Não é lido pelo app em nenhuma hipótese — arquivo histórico. | 🗄️ Só consultar se precisar recuperar algo antigo. Não é pra editar. |
| **`Prospecção/`** | Scripts Python de scraping de leads (Apify), rodados manualmente por fora do app. | ✅ Livre, é ferramenta externa de apoio. |
| **`scripts/`** | Automação de anúncios (Python) + `check-integrity.js`, que roda automaticamente em todo `git commit`. | ⚠️ Não remover `check-integrity.js`/`create_test_client.js` sem entender o hook do git. |
| **`criativos/`** | Repositório de imagens/vídeos pra tráfego pago. Só armazenamento, não é código. | ✅ Livre. |
| **`docs/`** | Memória do projeto — regras, estratégia, este guia. | ✅ Livre, manter atualizado conforme o projeto evolui. |

---

## 🎛️ 3. O Que São os Arquivos na Raiz?

1. **`middleware.ts`** — Roteamento de subdomínio: se alguém acessa `nomedacliente.studiomenu.art`, redireciona internamente pra `/c/nomedacliente`. Também tem uma rota legada `/catalogo?slug=x` → `/c/x`.
2. **`package.json`** — Scripts do projeto: `npm run dev` (desenvolvimento), `npm run build` (build de produção), `npm run start`.
3. **`tailwind.config.js` / `postcss.config.js`** — Configuração do Tailwind CSS (usado nas telas do `/admin` e páginas de marketing; os catálogos em si usam CSS próprio em `mosaico.css`).
4. **`.env`** — Chaves do Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). As mesmas chaves devem estar configuradas nas Environment Variables da Vercel.
5. **`README.md`** — Vitrine do repositório no GitHub.

**Não existe mais `vercel.json`** — foi removido por ser uma configuração do site estático antigo que estava, na verdade, quebrando rotas do Next.js (redirecionava `/c/:slug` e outras pra arquivos `.html` que não existem mais). O Next.js/Vercel hoje funciona com zero-config, detectando o framework automaticamente.

---

## 🔄 4. Como as Pastas Conversam Entre Si (Fluxo de Dados)

```
                    [ CLIENTE ACESSA O LINK ]
                              │
                              ▼
         nomedacliente.studiomenu.art  OU  studiomenu.art/c/nomedacliente
                              │
                              ▼
                   middleware.ts (se for subdomínio, reescreve pra /c/[slug])
                              │
                              ▼
                src/app/c/[slug]/page.tsx
                              │
                              ▼
           src/lib/catalog-service.ts  (busca o pedido no Supabase)
                              │
                              ▼
      src/components/catalog/CatalogLayout.tsx + mosaico.css
        (monta o catálogo com os dados reais da cliente)
                              │
                              ▼
                [ CATÁLOGO CARREGADO ]
```

Pro **onboarding** (cliente nova cadastrando o catálogo dela):

```
   /form  →  src/components/onboarding/OnboardingForm.tsx
              │
              ▼
   src/app/api/catalog/save/route.ts  →  grava no Supabase (tabelas `orders` + `order_services`)
```

---

## 🛡️ 5. Regra de Ouro para Novas Tarefas

Sempre que formos iniciar um novo pedido ou evolução:
- **Se for Catálogo/Visual (Hero, Grade, cores, tema):** trabalhamos em `src/components/catalog/` e `src/app/mosaico.css` — sempre testar Rose **e** Luxury antes de considerar pronto.
- **Se for Painel Admin:** trabalhamos dentro de `src/app/admin/`.
- **Se for Vendas/Marketing:** trabalhamos em `src/app/vendas/` ou `src/components/sales/`.
- **Se for Onboarding:** trabalhamos em `src/app/form/` ou `src/components/onboarding/`.
- **Se for Documentação:** salvamos dentro de `docs/` e mantemos este arquivo atualizado quando a estrutura mudar.
- **Nunca editar nada dentro de `legacy/`** — é referência histórica, não faz parte do app rodando hoje.
