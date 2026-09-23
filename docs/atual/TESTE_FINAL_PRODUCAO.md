# Teste Final em Produção — antes de começar a vender

> Última rodada de testes antes de abrir pra clientes reais. Testado direto em **produção**
> (`studiomenu.art`, banco real) — decisão deliberada da usuária, não um erro de ambiente. Se
> algum bug aparecer aqui ou na Parte 2, volta pra `desenv`, corrige, promove de novo via PR.
>
> Criado em: 2026-09-22.

---

## Como os 4 catálogos de exemplo foram criados

Apaguei antes os 12 catálogos de teste que existiam em produção (todos sem dono real, confirmado
com a usuária; a única assinatura Asaas de produção real entre eles — `teste-manual-fase19` — foi
cancelada por ela no painel do Asaas antes da exclusão).

Os 4 novos foram criados usando o **mesmo caminho real do Agente Criador de Catálogos**
(`POST /api/admin/finalize-catalog`, autenticado com login de admin de verdade — não foi um
INSERT direto no banco), um por nicho, com todos os serviços padrão do preset de cada um:

| Slug | Nicho | Layout | Tema | Catálogo público | App da profissional |
|---|---|---|---|---|---|
| `exemplolash` | Lash | Mosaico | Rosé | [studiomenu.art/c/exemplolash](https://www.studiomenu.art/c/exemplolash) | [entrar](https://www.studiomenu.art/api/professional/login?slug=exemplolash&token=f599e8f282158575bc8cc8eb77d73f67) |
| `exemplonail` | Nail | Clássico | Luxury | [studiomenu.art/c/exemplonail](https://www.studiomenu.art/c/exemplonail) | [entrar](https://www.studiomenu.art/api/professional/login?slug=exemplonail&token=232d8f24dc620e0723b3b01e07de88f9) |
| `exemploestetica` | Estética | Mosaico | Luxury | [studiomenu.art/c/exemploestetica](https://www.studiomenu.art/c/exemploestetica) | [entrar](https://www.studiomenu.art/api/professional/login?slug=exemploestetica&token=fc59b882adf183b6c005b6807e37077f) |
| `exemplostudio` | Studio | Clássico | Luxury | [studiomenu.art/c/exemplostudio](https://www.studiomenu.art/c/exemplostudio) | [entrar](https://www.studiomenu.art/api/professional/login?slug=exemplostudio&token=081474746345c7335c5ef1172e8725f8) |

Todos com **StudioMenu+ ativo** (`booking_enabled=true`, agenda configurada seg-sex 9h-18h). Uma
ressalva importante: o plano foi ativado por escrita direta no banco (`plan_tier=plus`,
`subscription_status=ativo`), **não** passou por uma cobrança real no Asaas — isso já foi
validado separadamente com dinheiro real (ver `docs/atual/ESTADO_ATUAL.md`, seção 6), então essa
rodada focou em catálogo/agenda/regras de negócio, não em reprovar o pagamento de novo.

### Casos de borda semeados (distribuídos entre os 4, sem repetir tudo em todos)

- **Todos os 5 status de agendamento**: `pending`, `confirmed`, `cancelled`, `completed`, `no_show`.
- **`origin` misto**: `catalog` (cliente se agendou) e `professional` (ela marcou manualmente).
- **Bordas de horário**: agendamento começando exatamente na abertura (Lash, 09:00) e terminando
  exatamente no fechamento (Nail, 18:00); dois agendamentos colados sem intervalo (Nail); dois
  agendamentos com espaço grande entre eles no mesmo dia (Studio); um dia inteiro quase lotado com
  um intervalo pequeno no meio (Estética); um bem no passado (concluído/falta) e um bem no futuro
  — mês que vem (Nail, testa navegação do calendário).
- **Bloqueios de agenda**: um de dia inteiro — folga (Lash) e um parcial — almoço (Nail).
- **Um agendamento cancelado sobrepondo o horário de um confirmado** (Nail) — prova que cancelado
  não trava o horário (é regra do banco, testada diretamente).
- **Um serviço marcado não-agendável** ("Alongamento em Gel + Esmaltação" → Sob Consulta, Studio).
- **Capa vazia de propósito** (Studio) — testa em produção o fallback novo (capa herda a foto da
  tela final quando a profissional não manda foto de capa).

---

## Parte 1 — Bateria de testes "por baixo dos panos" (minha, já executada)

Tudo testado via chamadas reais às rotas de API de produção (nunca INSERT direto simulando uma
ação que devia passar pela rota) ou, quando fazia sentido validar a garantia do próprio banco,
direto contra o Postgres.

| # | Teste | Resultado |
|---|---|---|
| 1 | RLS: chave anônima não consegue ler `orders` direto | ✅ `permission denied for table orders` |
| 2 | Catálogo público renderiza (200 + nome certo) — os 4 nichos | ✅ Todos OK |
| 3 | Fallback de capa (Studio, sem foto própria) usa a foto da tela final | ✅ Confirmado no HTML renderizado |
| 4 | Serviço marcado `bookable=false` fica gravado corretamente | ✅ |
| 5 | Disponibilidade (`GET /api/scheduling/availability`) não sugere horário ocupado, e devolve lista vazia quando nenhum intervalo livre do dia é grande o suficiente pro serviço (2h30 pedido, maiores janelas livres eram só 1h/1h30/2h) | ✅ Comportamento matematicamente correto, não é bug |
| 6 | Banco recusa 2 agendamentos **confirmados** sobrepostos (`EXCLUDE USING gist`) | ✅ `conflicting key value violates exclusion constraint` |
| 7 | `POST /api/scheduling/book` cria agendamento de verdade (fluxo público completo, incluindo o envio de push pra profissional sem travar a resposta) | ✅ Criado com `status: pending` |
| 8 | `POST /api/scheduling/book` recusa (409) tentativa de agendar em cima de horário já ocupado | ✅ "Esse horário não está mais disponível" |
| 9 | Login da profissional via link mágico (`GET /api/professional/login`) | ✅ Sessão criada |
| 10 | Pausar/reativar a Agenda via API real (`PUT /api/professional/agenda-pause`), autenticado com sessão de verdade | ✅ `agenda_paused` liga e desliga corretamente no banco |

**Resultado: 10/10 confirmados corretos.** Dois deles (5 e 7) precisaram de uma segunda tentativa
porque o formato dos parâmetros que eu chutei inicialmente estava errado (não é bug do produto,
era erro meu no teste) — corrigido conferindo o código da rota antes de repetir.

### O que eu NÃO testei aqui (fora do escopo desta parte)

- Cobrança real via Asaas (já provado com dinheiro real antes, não repetido agora).
- Envio de push de verdade pro celular (preciso de um dispositivo inscrito — isso é a Parte 2).
- Qualquer coisa visual/layout — de propósito, é a sua parte.

---

## Parte 2 — Seu roteiro de teste (visual, UX, "sentir" o produto)

**Concluída em 2026-09-23** — rodada inteira testada pela usuária, no celular de verdade (iPhone
e Android), direto em produção. Vários bugs reais apareceram (lista completa na seção
"Bugs encontrados" abaixo) — todos investigados, corrigidos, promovidos pra `main` via PR e
reconfirmados em produção depois do fix. Esse round está oficialmente fechado; qualquer coisa
nova a partir daqui é tratada como ajuste pontual avulso, não mais parte desta rodada.

### Em cada um dos 4 catálogos públicos (link da tabela acima)
- [X] Capa, cores do tema (Rosé/Luxury), tipografia — Mosaico e Clássico representados (2 de cada)
- [X] Grade de procedimentos, filtro por categoria, modal de detalhes de cada serviço
- [X] O serviço "Sob Consulta" do Studio (Alongamento em Gel + Esmaltação) — não deve abrir o
      wizard de agendamento, só o contato normal
- [X] Tela de Orientações (antes/depois) e tela final de Contato — **no Studio, a foto da capa
      deve ser a mesma da tela final** (é o fallback novo, veja se ficou bom visualmente)
- [X] Botão de agendar (wizard) — tente marcar um horário de verdade em cada um dos 4, em dias/
      horários diferentes dos já ocupados
- [X] No Nail, tente agendar bem perto de um horário já bloqueado (almoço 28/09, 12h-13h) e no dia
      todo bloqueado do Lash (25/09) — confirme que o sistema recusa/não oferece esses horários

### No app da profissional (link "entrar" da tabela acima), em cada um dos 4
- [X] **Início**: checklist de onboarding, avisos
- [X] **Agenda (visão Dia)**: os cards de diferentes status (confirmado, pendente, concluído,
      falta, cancelado) — confira se as cores/ícones batem com o que cada status deveria mostrar
- [X] **Agenda (visão Mês)**: navegue até o mês que vem (tem 1 agendamento pendente no Nail lá)
- [X] **Agenda**: confira o dia lotado da Estética (quase o expediente inteiro ocupado) e o dia do
      Studio com um intervalo grande no meio — os horários livres aparecem certos?
- [X] **Config → Horários/Bloqueios**: os bloqueios semeados aparecem certos (folga do Lash,
      almoço do Nail)?
- [X] **Config → Desligar Agenda**: teste ligar e desligar você mesma (eu já testei via API, mas
      vale testar pela tela de verdade)
- [X] **Config → Notificações**: ative push num desses catálogos e confirme que chega no celular
      quando alguém agenda pelo catálogo público (esse eu não consigo testar sozinho)
- [X] **Config → Minha assinatura / Minha conta**: aparência geral, mesmo sem uma assinatura Asaas
      real por trás desses 4 catálogos de exemplo

### Geral
- [X] Testar em pelo menos um catálogo pelo celular de verdade (não só navegador desktop)
- [X] Qualquer coisa que parecer estranha, mesmo sem certeza se é bug — anota aqui embaixo

---

## Bugs encontrados (todos corrigidos e reconfirmados em produção)

Achados pela usuária testando no celular (iPhone e Android), investigados e corrigidos um a um,
cada um promovido pra `main` via PR própria e reconfirmado em produção depois do fix.

**App da profissional / iOS:**
- Tabbar (Início/Agenda/Config) flutuando sobre o conteúdo ao rolar a tela na Safari — falha
  conhecida do WebKit com `position: fixed`, corrigida forçando a barra pra própria camada gráfica.
- Card de agendamento pendente estourava o padding direito com nome de serviço longo (texto não
  truncava, empurrava o botão "Aceitar" pra fora da tela).
- Splash screen ao abrir o app instalado: não existia (Safari não lê o manifest pra isso, exige
  tags próprias) — implementada, e mais 2 rodadas de fix até ficar 100% (não aparecia no Modo
  Escuro; depois, viewport duplicado + tag de compatibilidade antiga faltando).
- Botão "Instalar" só existia pro Chrome/Android (dependia de um evento exclusivo dele) — agora
  aparece também no iPhone, abrindo um passo a passo manual em vez do diálogo nativo (que o iOS
  não tem).

**Carregamento de imagens:**
- Catálogos demorando pra carregar / tela preta antes das fotos aparecerem: as fotos **padrão**
  de todo catálogo novo (capa, grade, orientações) nunca tinham sido comprimidas — convertidas
  pra WebP, 94% menores (39MB → 2,3MB no total).
- Consequência direta do fix acima: capa da Estética sumindo (404) — o Windows não diferencia
  maiúscula de minúscula em nome de arquivo, e `Hero.webp`/`hero.webp` colidiram na conversão.
  Corrigido recuperando o arquivo certo e dando nomes definitivamente distintos.
- Outra consequência: foto do layout Clássico (Nail) deslocada pra esquerda — regressão ao
  corrigir o bug acima, uma segunda rodada trocou pelo valor de recorte errado. Corrigido de vez.

**Visual dos catálogos:**
- Flash do tema Rosé aparecendo por uma fração de segundo em catálogos Luxury antes de trocar pro
  tema certo — 2 rodadas até eliminar de vez (conteúdo do catálogo primeiro, depois o resíduo no
  fundo do `<html>`/`<body>`).
- Modal de detalhes de procedimento sem Investimento/Duração em Nail/Estética/Studio (só campos
  customizados) — não era decisão documentada, era uma regra que só o preset do Lash seguia.
  Padronizado nos 4 nichos.
- Botão "Agendar [nome do serviço]" quebrando linha em nomes compridos — texto fixo agora
  ("Agendar agora"), nome do serviço já aparece no título do modal.

**Showroom (`/c/showcase/[niche]`):**
- Painel "Personalizar" começava fechado — agora abre já expandido.

**Config:**
- Texto de "Desligar Agenda" reescrito (tinha ficado um parágrafo só, sem hierarquia visual).
- Texto de "Minha conta" (depois de configurar acesso) reescrito mais claro, com
  `studiomenu.art/entrar` virando link de verdade, clicável.
- Novo card "Suporte e dúvidas" (não é bug — funcionalidade nova pedida durante os testes):
  WhatsApp direto com a StudioMenu, último item do acordeão, colapsado por padrão.
