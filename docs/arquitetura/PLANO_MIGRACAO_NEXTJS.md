# 🚀 Plano de Migração Arquitetural — Next.js, React & Tailwind CSS

> **Documento de Engenharia de Software — StudioMenu (`studiomenu.art`)**  
> Este documento detalha o plano de migração progressivo do código legado (Vanilla HTML/CSS/JS) para a nova stack moderna baseada em **Next.js 14+ (App Router), React, Tailwind CSS e Supabase**.

---

## 🎯 1. Objetivos da Migração

1. **Robustez & Manutenibilidade:** Eliminar a manipulação manual do DOM e injeção de HTML por strings em Vanilla JS, substituindo por componentes React modulares e fortemente tipados.
2. **Desempenho Visual & SEO Social:** Implementar Server-Side Rendering (SSR) nativo com `generateMetadata` para garantir previews perfeitos de link no WhatsApp e Instagram (foto de capa + nome da profissional) para cada slug.
3. **Escalabilidade Multinicho:** Permitir que presets de novos nichos (Nail, Estética, Studio Multi-serviços) sejam aplicados reusando 100% dos modelos visuais **Mosaico** e **Clássico** (Temas *Rosé* e *Luxury*).
4. **Zero Regressão Visual:** Manter a mesma estética premium (glassmorphism, animações suaves e paleta de cores) sem alterar a experiência do cliente final.

---

## 🏗️ 2. Estrutura de Pastas Alvo (Next.js App Router)

```
studiomenu/
├── src/
│   ├── app/                          # Rotas do Next.js (App Router)
│   │   ├── (sales)/                  # Landing Pages de vendas do StudioMenu
│   │   │   └── page.tsx
│   │   ├── c/[slug]/                 # Rota dinâmica SSR do Catálogo do Cliente
│   │   │   └── page.tsx
│   │   ├── form/                     # Form de Onboarding & Personalização
│   │   │   └── page.tsx
│   │   ├── admin/                    # Painel Administrativo do Estúdio
│   │   │   └── page.tsx
│   │   ├── layout.tsx                # Layout raiz com fontes e provedores
│   │   └── globals.css               # Estilos globais e utilitários do Tailwind
│   │
│   ├── components/                   # Componentes React Modulares
│   │   ├── catalog/                  # Componentes específicos do Catálogo
│   │   │   ├── HeaderCover.tsx       # Capa / Avatar / Bio da Profissional
│   │   │   ├── ProcedureCard.tsx     # Cards de procedimentos
│   │   │   ├── ProcedureGrid.tsx     # Grid / Lista de procedimentos
│   │   │   ├── Instructions.tsx      # Orientações pré/pós e políticas
│   │   │   ├── CTASection.tsx        # Botões de conversão (WhatsApp, IG, GPS)
│   │   │   └── CatalogLayout.tsx     # Mosaico vs Clássico (Rosé / Luxury)
│   │   ├── form/                     # Componentes do Formulário de Onboarding
│   │   ├── admin/                    # Componentes do Painel Admin
│   │   └── ui/                       # Componentes base reutilizáveis (botões, modais)
│   │
│   ├── lib/                          # Infraestrutura & Utilitários
│   │   ├── supabase.ts               # Cliente Supabase (SSR & Browser)
│   │   └── utils.ts                  # Helpers de formatação e ordenação
│   │
│   └── types/                        # Definições de Tipos TypeScript
│       └── catalog.ts                # Interfaces de Cliente, Procedimento e Pedido
│
├── public/                           # Assets estáticos (imagens base, favicons, fontes)
├── middleware.ts                     # Routing de subdomínios (slug.studiomenu.art)
├── tailwind.config.js                # Design tokens (Rosé, Luxury, Glassmorphism)
├── next.config.js                    # Configurações do Next.js & Vercel
└── docs/                             # Documentação do Projeto
```

---

## 🚦 3. Etapas de Execução Fasedas & Bloco de Testes

### 🔷 ETAPA 1 — Infraestrutura Base & Configuração Next.js + Tailwind
- [ ] Inicialização do projeto Next.js com TypeScript e Tailwind CSS.
- [ ] Configuração do `tailwind.config.js` com tokens de cor (Rosé 🌸 & Luxury 👑), sombras e utilitários glassmorphism.
- [ ] Definição das interfaces TypeScript (`types/catalog.ts`) para os pedidos e procedimentos do Supabase.
- [ ] Configuração do cliente Supabase (`src/lib/supabase.ts`).
- **Validação Técnica:** Compilação limpa (`npm run build`) e servidor local operacional (`npm run dev`).
- **Validação Visual (Usuário):** O usuário valida a página inicial inicializada.

---

### 🔷 ETAPA 2 — Componentização dos Catálogos (Mosaico & Clássico)
- [ ] Construção do componente `<HeaderCover />` (Foto, bio, avatar do estúdio).
- [ ] Construção dos componentes `<ProcedureCard />` e `<ProcedureGrid />` com ordenação e categorias.
- [ ] Construção do componente `<InstructionsSection />` (Cuidados, regras, tolerâncias).
- [ ] Construção do componente `<CTASection />` (WhatsApp, Instagram, Mapa).
- [ ] Criação do orchestrador `<CatalogLayout />` suportando as variações Mosaico e Clássico nos temas Rosé e Luxury.
- **Validação Técnica:** Verificação de sintaxe e renderização com dados mockados.
- **Validação Visual (Usuário):** O usuário testa no navegador em `localhost:3000/c/demo` e aprova a fidelidade visual perante os modelos antigos.

---

### 🔷 ETAPA 3 — Motor SSR & Roteamento Dinâmico de Subdomínios (`/c/[slug]`)
- [ ] Implementação da página `src/app/c/[slug]/page.tsx` com busca SSR dos dados no Supabase.
- [ ] Implementação da função `generateMetadata` para inclusão automática das tags OpenGraph do WhatsApp por cliente.
- [ ] Migração e adaptação do `middleware.ts` para capturar subdomínios (`jessica.studiomenu.art`).
- **Validação Técnica:** Verificação de resposta HTTP 200 e montagem correta das meta tags sociais no HTML SSR.
- **Validação Visual (Usuário):** O usuário testa slugs reais no navegador (ex: `localhost:3000/c/amanda-carvalho`) e aprova a injeção dinâmica.

---

### 🔷 ETAPA 4 — Formulário de Onboarding (`/form`) & Painel Admin (`/admin`)
- [ ] Componentização do formulário de cadastro de procedimentos e escolha de tema (`/form`).
- [ ] Componentização do painel administrativo e editor rápido de procedimentos (`/admin`).
- [ ] Integração com o Supabase para gravação de novos catálogos e edição de dados.
- **Validação Técnica:** Testes de requisições de gravação/leitura no Supabase.
- **Validação Visual (Usuário):** O usuário faz um teste completo de preenchimento e edição de um catálogo teste.

---

### 🔷 ETAPA 5 — Landing Page Principal (`/`) & Limpeza do Código Legado
- [ ] Migração da Landing Page principal de vendas para `src/app/(sales)/page.tsx`.
- [ ] Auditoria final de integridade e remoção de arquivos estáticos legados substituídos.
- **Validação Técnica:** Build final de produção sem avisos nem erros.
- **Validação Visual (Usuário):** O usuário aprova a versão final completa.

---

## ⚠️ Regra de Ouro para Testes Visuais

> 🚫 **REGRA RIGOROSA:** O agente autônomo **NÃO realizará testes visuais interativos pelo navegador por conta própria**.  
> Sempre que uma etapa demandar validação visual ou estética, o agente solicitará explicitamente que o **USUÁRIO** abra o endereço local e dê o seu aceite (aprovação/reprovação).
