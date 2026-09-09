# 🚀 Documento de Transição e Handoff — StudioMenu (`studiomenu.art`)

> **ATENÇÃO PARA O NOVO CHAT / CLAUDE:**  
> Este documento contém o resumo completo do projeto **StudioMenu**, a visão de produto, a arquitetura técnica, tudo o que foi implementado e testado até o momento, o status atual do sistema e o roadmap das próximas etapas a serem desenvolvidas.

---

## 📌 1. Visão Geral e Proposta do Produto

### 1.1 Do LashMenu ao StudioMenu
- **Origem (LashMenu)**: Nascido como um catálogo digital e interativo focado exclusivamente em Lash Designers (extensão de cílios).
- **Pivot e Expansão (StudioMenu)**: Identificou-se que a grande maioria das profissionais e estúdios oferecem múltiplos serviços (**Nail Design / Unhas**, **Estética Facial/Corporal**, **Depilação**, **Micropigmentação** e **Studios Completos**).
- **Proposta do StudioMenu (`studiomenu.art`)**: Uma plataforma SaaS de catálogos digitais interativos de alta conversão para todo o ecossistema de beleza. Oferece visualização pública e um **Editor Visual In-Place (em tempo real)** acessível via link mágico com token de edição (`/c/[slug]?edit=TOKEN`).

### 1.2 Modelos e Temas (Design System)
- **Modelos Base**: **Mosaico** (grid dinâmico de cards) e **Clássico** (layout sequencial estático).
- **Variantes de Tema**:
  - **Rosé 🌸**: Paleta em tons de rosa, nude e champagne com alta sofisticação.
  - **Luxury 👑**: Paleta dark em tons de preto, dourado e vinho para estúdios premium.
- **Alternância Dinâmica**: O tema pode ser alternado em tempo real pelo botão 🌸/👑 na barra de ferramentas inferior do Editor Visual.

---

## 🛠️ 2. Stack Tecnológica e Arquitetura

- **Framework**: Next.js (App Router - TypeScript & React 19).
- **Estilização**: Vanilla CSS modular (`src/app/mosaico.css`, `src/app/visual-editor.css`) com variáveis de tema ativadas via atributos HTML (`data-theme="rose" | "luxury"`).
- **Banco de Dados & Backend**: **Supabase (PostgreSQL)**.
- **Estrutura de Tabelas no Supabase**:
  1. `orders`: Tabela de catálogos dos clientes.
     - Campos principais: `id`, `slug`, `client_name`, `studio_name`, `hero_phrase`, `bio_description`, `niche`, `layout_model`, `theme_variant`, `avatar_url`, `cover_media_url`, `instructions_bg_url`, `final_screen_bg_url`, `whatsapp_number`, `instagram_handle`, `address`, `maps_url`, `categories` (Array de strings), `procedures` (JSONB fallback), `edit_token`, `status`.
  2. `order_services`: Tabela de procedimentos vinculados por `order_id`.
     - Campos: `id`, `order_id`, `order_index`, `title`, `description`, `price`, `duration`, `category`, `image_url`, `badge`, `is_highlight`.
- **Rotas Principais no Next.js**:
  - `src/app/c/[slug]/page.tsx`: Rota SSR pública e editável do catálogo.
  - `src/app/c/demo/page.tsx`: Rota de demonstração dinâmica por nicho (`?niche=lash|nail|estetica|studio`).
  - `src/app/form/page.tsx`: Formulário de onboarding de novos estúdios.
  - `src/app/api/catalog/save/route.ts`: API Endpoint POST para persistência no Supabase.
  - `src/lib/catalog-service.ts`: Serviço de busca SSR e conversão de dados do Supabase.

---

## ✅ 3. O Que Já Foi Executado e Concluído

### 3.1 Fidelidade Visual e Layout Hero
- Restauração completa do layout original do Hero no modo de edição em tempo real.
- Alinhamento de padding (`padding-bottom: 85px` no `.hero__conteudo` e `gap: 14px` no `.hero__titulo`).
- Posicionamento harmonioso dos botões `VER CATÁLOGO` e do botão flutuante do WhatsApp (`.wsp-float-btn`).

### 3.2 Gestão Autônoma de Categorias
- **Categorias Independentes**: Agora é possível criar categorias pelo botão `➕ Criar Nova Categoria` sem a obrigatoriedade de vincular um procedimento na hora.
- **Exibição de Categorias Vazia**: Categorias com 0 procedimentos vinculados continuam existindo e sendo renderizadas na barra de filtros como `CATEGORIA (0) ✕`.
- **Regras Estritas de Exclusão**:
  - Se a categoria possuir procedimentos vinculados (>0), o sistema bloqueia a exclusão e exibe um modal explicativo.
  - Se a categoria estiver vazia (0 procedimentos), o sistema exibe um modal de confirmação elegante e permite a exclusão.
- **Exclusão de Procedimentos**: A exclusão de um procedimento **NÃO** remove a categoria pertencente. A categoria é mantida.

### 3.3 Varredura e Eliminação de Modais Nativos do Navegador
- **Zero `alert()` e Zero `confirm()`**: Todos os modais nativos do navegador foram completamente removidos e substituídos por modais React com o design system do StudioMenu (`src/components/catalog/VisualEditorModals.tsx`).
- **Modais de Sistema Criados**:
  - `save_confirm` / `save_success` / `save_error` (Fluxo de publicação/salvamento no banco).
  - `proc_delete_confirm` (Confirmação de exclusão de procedimentos).
  - `category_delete_confirm` / `category_delete_blocked` (Confirmação e bloqueio de exclusão de categorias).
  - `discard_confirm` (Confirmação para descartar rascunho não salvo).

### 3.4 Persistência e Sincronização no Supabase (`/api/catalog/save`)
- Endpoint configurado para persistir alterações síncronas tanto na tabela `orders` quanto na tabela `order_services`.
- Suporte a nomes legados no Supabase (`cat_label`, `preco`, `duracao`, `img`, `desc`) garantindo compatibilidade retroativa.

### 3.5 Correção de Assets e Imagem de Fundo
- Diagnóstico e correção do fundo da seção **"Orientações para o seu dia"** (`InstructionsSection.tsx`).
- Garantido o fallback e vinculo com a imagem oficial `/modelos/mosaico/assets/img/hero.jpg` caso `instructions_bg_url` não esteja definido ou esteja apontando para a capa (`Hero.png`).

### 3.6 Cliente Fictício de Testes (Vanessa Camargo)
- Script `scripts/create_test_client.js` pronto e rodado para restaurar a cliente de testes:
  - **URL Pública**: `http://localhost:3000/c/vanessa-camargo`
  - **URL de Edição**: `http://localhost:3000/c/vanessa-camargo?edit=token_vanessa_test_12345`

---

## 🟢 4. Status Atual do Projeto

- **Servidor Dev local**: Rodando sem erros em `http://localhost:3000`.
- **Compilação Next.js**: Zero erros de TypeScript / JSX / Linting.
- **Regras Estritas de Desenvolvimento em Vigor**:
  - **NÃO rodar `git commit` ou `git push`** sem autorização explícita do usuário.
  - **NÃO utilizar automação de navegador (puppeteer/playwright)** a pedido do usuário (todas as validações devem ser feitas via código/servidor).
  - **NÃO usar alertas nativos do navegador** (`alert`, `confirm`).

---

## 🎯 5. Próximas Etapas (Roadmap Pendente)

As seguintes tarefas estão mapeadas para desenvolvimento no novo chat:

### 1. Upload Real de Imagens no Supabase Storage
- **Situação Atual**: No Editor Visual, alterar foto de capa ou foto de procedimentos utiliza URLs temporárias de preview (`URL.createObjectURL(file)`).
- **Objetivo**: Criar endpoint de API (`/api/catalog/upload`) integrado ao Supabase Storage (bucket `catalog-images`) para fazer o upload definitivo dos arquivos de imagem e salvar as URLs permanentes no banco.

### 2. Conectar Onboarding / Formulário (`/form`) ao Supabase
- **Situação Atual**: A página `/form` possui a interface UI para cadastrar estúdio, escolher nicho (Lash, Nail, Estética, Studio) e criar o catálogo.
- **Objetivo**: Conectar a submissão do formulário à criação de um novo registro na tabela `orders` e preencher os procedimentos padrão baseados nos presets em `src/modelos-novos/[nicho]/index.ts`.

### 3. Configuração de Domínio e Produção (`studiomenu.art`)
- Configurar o projeto na Vercel apontando para o domínio definitivo `studiomenu.art`.
- Garantir roteamento de slugs dinâmicos (`studiomenu.art/c/nome-do-estudio`).

### 4. Agendamento Direto nos Cards de Procedimento (Fase 2)
- Adicionar opção de clique no card do procedimento para abrir modal de pré-agendamento com seleção de data e horário livre, disparando mensagem estruturada para o WhatsApp da profissional.

---

## 📂 6. Estrutura de Arquivos Relevantes do Projeto

```
studiomenu/
├── docs/
│   ├── estrategia/
│   │   └── VISAO_E_ROADMAP_STUDIOMENU.md   # Documento com a visão de negócio do StudioMenu
│   ├── arquitetura/
│   │   └── PLANO_MIGRACAO_NEXTJS.md         # Documento da migração Next.js
│   └── HANDOFF_PASSAGEM_DE_BASTAO.md      # Este documento de transição
├── scripts/
│   └── create_test_client.js                # Script para popular o cliente de testes Vanessa Camargo no Supabase
├── src/
│   ├── app/
│   │   ├── api/catalog/save/route.ts        # Endpoint POST de salvamento no Supabase
│   │   ├── c/[slug]/page.tsx                # Rota pública / editável do catálogo
│   │   ├── c/demo/page.tsx                  # Rota de demo por nicho
│   │   ├── mosaico.css                      # Estilos do modelo Mosaico e temas Rosé/Luxury
│   │   └── visual-editor.css                # Estilos da barra de ferramentas e modais do editor
│   ├── components/catalog/
│   │   ├── CatalogLayout.tsx                # Layout principal e estado global do editor visual
│   │   ├── HeaderCover.tsx                  # Seção de capa / Hero do estúdio
│   │   ├── ProcedureGrid.tsx                # Grid de procedimentos e barra de filtros de categorias
│   │   ├── InstructionsSection.tsx          # Seção de orientações "Antes de Vir"
│   │   ├── CTASection.tsx                   # Seção de contato, redes sociais e localização
│   │   ├── VisualEditorBottomBar.tsx        # Barra flutuante inferior do editor
│   │   └── VisualEditorModals.tsx           # Modais de edição, confirmação e alertas de sistema
│   ├── lib/
│   │   ├── catalog-service.ts               # Serviço de busca do catálogo no Supabase
│   │   └── supabase.ts                      # Cliente inicializado do Supabase
│   ├── modelos-novos/                       # Presets por nicho (lash, nail, estetica, studio)
│   └── types/catalog.ts                     # Interfaces TypeScript do catálogo e procedimentos
```

---

*Documento gerado com sucesso para continuidade no Claude.* 🚀
