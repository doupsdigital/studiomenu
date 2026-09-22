# Fase 23 — "Desligar Agenda" (pausar o agendamento automático)

> **Para o novo chat / Claude:** Fase 23 (2026-09-22), implementada sobre a Fase 19+ (agendamento automático). Estado: **implementado, `tsc` limpo, aguardando o usuário rodar a migração no Supabase antes de testar.**

## O que é

Card novo na Config, logo abaixo de "Bloqueios e folgas", só pra quem tem o agendamento automático ligado (Plus ativo, ou toggle manual do admin). Um toggle único: "Agenda automática: Ativa / Pausada". Pausada, o catálogo público volta a se comportar como o Básico (toca no serviço → cai no WhatsApp), sem mexer na assinatura.

## A decisão de design que importa

`orders.agenda_paused` é um campo **separado** de `booking_enabled`. `booking_enabled` continua sendo "ela tem o StudioMenu+ de fato" — controla o acesso dela à própria Agenda/Horários/Bloqueios dentro do app. `agenda_paused` só afeta o que a **cliente final** vê no catálogo público. Se fosse o mesmo campo, pausar a agenda também tiraria dela o acesso à própria Agenda (ficaria "cega" pros agendamentos já marcados) — exatamente o contrário do que a funcionalidade deveria fazer.

## Onde `agenda_paused` é checado

- **Catálogo público** (`CatalogLayout.tsx`): `bookingEnabled` do `ProcedureGrid` e o `onRequestBooking` passam a exigir `booking_enabled && !agenda_paused`.
- **`POST /api/scheduling/book`** e **`POST /api/scheduling/availability`**: mesma checagem, defesa em profundidade (não dependem só da UI).
- **Nada mais muda** — Início, Agenda (dela), Config (Horários/Bloqueios/Notificações) continuam olhando só `booking_enabled`, como sempre.

## Como ela liga/desliga

`PUT /api/professional/agenda-pause` (`{ slug, paused }`), autenticado pela sessão dela (mesmo padrão do `business-hours`). Recusa com 400 se `booking_enabled` for falso (pausar sem ter o Plus ligado não faz sentido, e evitaria um estado órfão).

## Arquivos

```
docs/migrations/2026-09-22_fase23_pausar_agenda.sql   a migração
docs/schema.sql                                        atualizado

src/lib/professional-app-service.ts                    ProfessionalOrderSummary.agenda_paused
src/lib/catalog-service.ts                              CatalogOrderData.agenda_paused (getCatalogBySlug)
src/types/catalog.ts                                    campo agenda_paused
src/app/api/professional/agenda-pause/route.ts          PUT — liga/desliga
src/app/api/scheduling/book/route.ts                    checa agenda_paused
src/app/api/scheduling/availability/route.ts            checa agenda_paused
src/components/config/AgendaPauseSection.tsx            o toggle (UI otimista)
src/components/config/ConfigAccordion.tsx               novo card "Desligar Agenda" + passo do tour
src/app/app/[slug]/config/page.tsx                      passa agendaPaused
src/components/catalog/CatalogLayout.tsx                gate no catálogo público
```

## Pendências

1. **Usuário roda a migração** no Supabase:
   ```sql
   ALTER TABLE public.orders
     ADD COLUMN IF NOT EXISTS agenda_paused BOOLEAN NOT NULL DEFAULT false;
   ```
2. **Não testado ainda de ponta a ponta** — falta: ligar o toggle num catálogo Plus ativo, confirmar que o catálogo público cai no WhatsApp, confirmar que a Agenda dela continua acessível normalmente, desligar de novo e confirmar que volta a agendar.
