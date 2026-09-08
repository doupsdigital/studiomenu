# 🎨 Visão Geral, Posicionamento e Roadmap — StudioMenu (`studiomenu.art`)

> **Documento Oficial de Diretrizes e Evolução do Projeto**  
> Este documento serve como bússola de desenvolvimento para a transição do ecossistema LashMenu para o **StudioMenu**.

---

## 📌 1. Origem e Diagnóstico do Negócio

### 1.1 Contexto de Origem (LashMenu)
O projeto nasceu originalmente como **LashMenu**, um catálogo digital e interativo focado exclusivamente em Lash Designers, oferecendo apresentações elegantes de procedimentos, instruções de atendimento e integração de botões CTA para WhatsApp e redes sociais.

### 1.2 O Diagnóstico de Mercado e a Oportunidade
Durante os testes de validação comercial e campanhas de tráfego pago para o LashMenu, foi identificada uma demanda clara:
* A grande maioria das profissionais que entravam no funil de vendas não realizava apenas procedimentos de Lash (cílios/sobrancelhas).
* Muitas possuem **estúdios próprios** ou atuam como profissionais multi-disciplinares oferecendo serviços de **Nail Design (unhas), Estética Facial/Corporal, Depilação, Cabelo**, entre outros.
* Ao limitar o posicionamento apenas para Lash, perdia-se uma grande fatia do mercado de beleza.

### 1.3 A Solução: StudioMenu
A evolução para o **StudioMenu** (`studiomenu.art`) transforma a plataforma em uma solução abrangente e escalável, capaz de atender desde profissionais especialistas até clínicas e estúdios de beleza completos.

---

## 🎯 2. Arquitetura de Produto & Segmentação por Nichos

### 2.1 Funil de Aquisição com Identificação de Nicho
O fluxo de entrada do cliente/lead iniciará perguntando/identificando o nicho específico do estúdio ou profissional:

| Nicho | Estrutura de Modelo Utilizada | Foco dos Conteúdos & Mídias de Exemplo |
| :--- | :--- | :--- |
| **Lash Designer** | **Mosaico** ou **Clássico** (Temas *Rosé* ou *Luxury*) | Cílios, Lash Lifting, Sobrancelhas, Micropigmentação |
| **Nail Designer** | **Mosaico** ou **Clássico** (Temas *Rosé* ou *Luxury*) | Manicure, Gel, Banho de Gel, Nail Art, Pedicure |
| **Estética / Clínica** | **Mosaico** ou **Clássico** (Temas *Rosé* ou *Luxury*) | Limpeza de pele, Massagens, Depilação, Procedimentos faciais |
| **Studio de Beleza (Multi-serviços)** | **Mosaico** ou **Clássico** (Temas *Rosé* ou *Luxury*) | Procedimentos organizados por abas/categorias combinadas |

---

## 📐 3. Estrutura Padrão dos Catálogos (Espinha Dorsal)

Independentemente do nicho ou modelo escolhido, **TODOS os catálogos do StudioMenu utilizam EXATAMENTE os mesmos modelos base**: **Mosaico** e **Clássico** (disponíveis nos temas **Rosé 🌸** e **Luxury 👑**).

### 3.1 Padronização Total Visual para Escalabilidade
Para maximizar a velocidade de desenvolvimento, facilitar a manutenção e garantir alta performance:
* **NÃO mudamos tipografia, fontes, layout CSS ou aspecto visual entre os nichos.**
* O design system visual é **único e padronizado** para todos os tipos de estúdio.

```
┌─────────────────────────────────────────────────────────┐
│ 1. CAPA / HERO                                          │
│    - Foto da profissional / Avatar do Studio            │
│    - Nome do Studio / Lash/Nail/Esteticista             │
│    - Bio e Mensagem de Boas-vindas                      │
├─────────────────────────────────────────────────────────┤
│ 2. PROCEDIMENTOS / SERVIÇOS                             │
│    - Cards de serviços com fotos, descrição, preço e    │
│      tempo estimado                                     │
├─────────────────────────────────────────────────────────┤
│ 3. INSTRUÇÕES & ORIENTAÇÕES                             │
│    - Cuidados pré e pós procedimento                    │
│    - Políticas do estúdio (atrasos, tolerâncias)        │
│    - Endereço / Localização                             │
├─────────────────────────────────────────────────────────┤
│ 4. TELA FINAL / CTA (CONVERSÃO)                         │
│    - Botão WhatsApp para agendamento direto             │
│    - Redes Sociais (Instagram, TikTok)                  │
│    - GPS / Mapa de Localização                          │
└─────────────────────────────────────────────────────────┘
```

### 3.2 O que Permanece Fixo vs. O que Varia Entre os Catálogos
* **Fixo para todos os nichos (Lash, Nail, Estética, Studio):**
  1. Estrutura visual e código-fonte dos modelos **Mosaico** e **Clássico**.
  2. Temas visuais base (*Rosé* e *Luxury*).
  3. Tipografia, fontes, efeitos CSS, animações e layout das telas.
  4. Estrutura lógica de 4 telas (Capa -> Procedimentos -> Instruções -> CTA Final).

* **Variável exclusivamente por nicho / cliente:**
  1. A lista de **procedimentos e categorias** (conteúdo cadastrado).
  2. As **imagens de fundo** das telas de instruções e da tela final (CTA).


---

## 🚀 4. Roadmap de Evolução Técnica e Funcional

### 🔴 Fase 1 — Reestruturação da Marca & Arquitetura Base (Fase Atual)
- [x] Definição e documentação da visão estratégica do **StudioMenu**.
- [ ] Configuração do domínio principal `studiomenu.art`.
- [ ] Provisionamento do novo banco de dados no **Supabase** exclusivo do StudioMenu.
- [ ] Limpeza, refatoração e organização do código-fonte herdado do LashMenu.
- [ ] Adaptação dos fluxos de Onboarding / Formulário para seleção do nicho.
- [ ] Criação e validação dos presets de procedimentos e imagens de fundo predefinidas por nicho (Lash, Nail, Estética e Studio Multi-serviços) aplicados aos modelos Mosaico e Clássico.

### 🟡 Fase 2 — Agendamento Automático & App PWA (Fase Futura)
- [ ] **Agendamento Direto nos Cards:** A cliente final seleciona o procedimento e escolhe data/horário livre diretamente pelo card no catálogo.
- [ ] **App PWA do StudioMenu para a Profissional:**
  - Painel de controle de agenda em tempo real.
  - Gestão de clientes, confirmação de agendamentos e históricos.
  - Notificações de novos agendamentos e lembretes automáticos.

---

## 🛠️ 5. Infraestrutura & Stack Tecnológico

* **Hospedagem:** Vercel (com rotas dinâmicas configuradas via `vercel.json`).
* **Banco de Dados:** Supabase (Projeto dedicado para `studiomenu.art`).
* **Frontend:** HTML5, CSS3 Vanilla com variáveis de tema, JavaScript Modular Vanilla.
* **Serverless / API:** Vercel Serverless Functions (`/api`).
* **Estratégia de Repositório:** Evolução iterativa a partir da cópia do LashMenu, preservando funcionalidades estáveis e refatorando o ecossistema com foco em clareza, performance e baixa manutenção.

---

## 🛡️ 6. Diretrizes para Agentes e Desenvolvedores

1. **Leitura Obrigatória:** Antes de executar qualquer tarefa de alteração estrutural, consulte este documento para garantir alinhamento com a visão do **StudioMenu**.
2. **Modularidade:** Mantenha o código limpo, bem documentado e devidamente isolado entre as camadas (`/vendas`, `/formulario`, `/admin`, `/catalogo`, `/modelos`).
3. **Não-regressão:** Teste interações e garanta que modelos existentes continuem funcionando perfeitamente enquanto novos modelos de nicho são adicionados.
