# 💄 Sistema de Gestão para Salões de Beleza

**system-salon** — Plataforma completa para gestão de salão com agendamento público, controle financeiro, relatórios e automações.

> Versão do repositório: workspace local

## Visão geral

Aplicação full‑stack em TypeScript que combina:

- Frontend React + Vite (UI responsiva, componentes reutilizáveis)
- Backend Node.js com tRPC (API type-safe)
- Drizzle ORM + PostgreSQL (modelo e migrações)
- Sistema de notificações, lista de espera e geração de relatórios

O projeto foi projetado para suportar tanto uso administrativo (dashboard interno) quanto um fluxo de agendamento público (página para clientes sem login).

## Funcionalidades principais

- Autenticação (login, registro, reset de senha)
- CRUD de especialistas, serviços e clientes
- Agendamentos: criação, validação de conflitos, concluir, cancelar
- Agenda de especialistas com regras (duração do slot, buffer, folgas, dias indisponíveis)
- Agendamento público (fluxo step-by-step para clientes)
- Notificações por templates (email, SMS, WhatsApp, push) e lembretes automáticos
- Lista de espera inteligente (priorização e confirmação automática)
- Dashboard com métricas e gráficos (receita, ocupação, top services/specialists/clients)
- Relatórios exportáveis em CSV

## Principais entidades

- Salon
- User (admin / usuário)
- Specialist
- Service
- Client
- Appointment
- Transaction (receitas)
- Waitlist (lista de espera)

## Estrutura do repositório

- `client/` — frontend React (páginas, componentes, hooks, lib/trpc)
- `server/` — backend tRPC (routers, serviços, integração com DB)
- `drizzle/` — schema e migrations do banco
- `shared/` — tipos e validações compartilhadas
- Dockerfile, docker-compose.yml, scripts de suporte

## Rotas e procedures tRPC (resumo)

Principais routers (arquivo: `server/routers.ts`):

- `auth`: `login`, `register`, `logout`, `me`, `requestPasswordReset`, `resetPassword`
- `salon`: `get`, `create`, `update`
- `specialists`: `list`, `get`, `create`, `update`, `delete`
- `clients`: `list`, `get`, `create`, `update`, `delete`
- `services`: `list`, `get`, `create`, `update`, `delete`
- `appointments`: `list`, `get`, `create`, `update`, `delete`, `complete`, `cancel`, `getAvailableSlots`, `validateSlot`, `getSuggestions`
- `publicBooking` / `publicRouter`: rotas públicas para `getSalonInfo`, `getAllSpecialists`, `getSpecialistServices`, `getAvailableTimeSlots`, `createPublicAppointment`
- `waitlist`: `add`, `remove`, `list`, `confirm`, `stats`
- `schedule`: gerência de agenda de especialista e geração de slots
- `notifications`: envio e templates
- `reports`: estatísticas e export CSV
- `dashboard`: métricas e gráficos

Os procedures usam validação Zod e TRPCError para tratamento de erro e autorização.

## Setup rápido (Desenvolvimento)

### Pré-requisitos

- Node.js 18+ e pnpm
- PostgreSQL 14+
- Docker (opcional)

### Instalação local

```bash
# clonar
git clone <repo-url>
cd system-salon

# instalar dependências
pnpm install

# copiar env e ajustar
cp .env.example .env
# editar .env conforme necessário
```

### Executar migrações e seeds

```bash
pnpm db:push
pnpm db:seed
```

### Iniciar em modo desenvolvimento

```bash
pnpm dev
```

Acesso:

- Frontend: [http://localhost:5173](http://localhost:5173)

## Rodando com Docker

### Desenvolvimento com containers

```bash
docker-compose up -d
# aplicar migrações dentro do container da aplicação
docker exec -it system-salon-app-1 pnpm db:push
docker exec -it system-salon-app-1 pnpm db:seed
```

### Build e execução para produção (exemplo)

```bash
docker build -t salon-system .
docker run -p 3000:3000 --env-file .env salon-system
```

## Variáveis de ambiente

Principais variáveis (ver `.env.example`):

- `DATABASE_URL`
- `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB`
- `JWT_SECRET`
- `NODE_ENV`
- `PORT`

## Observações importantes

- Timezones: o projeto trata datas convertendo para UTC em alguns fluxos (p.ex. agendamentos públicos). Revisar exibição para usuários em diferentes fusos.
- Concurrency: validar concorrência de reservas em ambientes de carga alta — considerar bloqueios DB ou filas para evitar double-booking.
- Jobs & filas: notificações e sincronizações atualmente disparadas a partir do backend; para produção recomenda-se mover para workers (BullMQ / Redis) para maior resiliência.
- Segurança: adicionar rate-limiting em rotas públicas (agendamento/login/reset) e revisar políticas de upload em `server/storage.ts`.

## Testes

Executar testes com vitest:

```bash
pnpm test
# ou para observar
pnpm test:watch
```

## Scripts úteis (package.json)

- `pnpm dev` — inicia app em modo desenvolvimento
- `pnpm build` — build de produção
- `pnpm start` — inicia servidor em produção
- `pnpm db:push` — aplica migrações
- `pnpm db:seed` — executa seeds
- `pnpm test` — executa testes

## Próximos passos e melhorias sugeridas

- Migrar notificações e sincronização para workers/filas
- Implementar testes E2E para fluxos críticos (agendamento, lista de espera)
- Adicionar monitoramento/alertas para jobs de notificação
- Implementar política de backups automatizados para o banco
- Revisar UX do fluxo público para lidar com cancelamentos e confirmações em tempo real

---

Se desejar, posso:

- Gerar documentação OpenAPI-like dos procedimentos tRPC (lista de inputs/outputs)
- Criar um guia de contribuição com padrões de commit e lint
- Adicionar um changelog automatizado e CI para rodar testes e lint
