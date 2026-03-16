# System Salon — Documentação Técnica Completa

**Versão:** 1.0  
**Última atualização:** Março de 2026  
**Autor do projeto:** Ronny Senna  
**Desenvolvido por:** Ideal Soluções Tecnológicas  

---

## Sumário

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Tecnologias Utilizadas](#2-tecnologias-utilizadas)
3. [Arquitetura do Sistema](#3-arquitetura-do-sistema)
4. [Estrutura de Pastas](#4-estrutura-de-pastas)
5. [Banco de Dados — Modelo de Dados](#5-banco-de-dados--modelo-de-dados)
6. [Backend — Servidor e API](#6-backend--servidor-e-api)
7. [Frontend — Interface do Usuário](#7-frontend--interface-do-usuário)
8. [Camada Compartilhada (shared/)](#8-camada-compartilhada-shared)
9. [Autenticação e Segurança](#9-autenticação-e-segurança)
10. [Implantação e Infraestrutura](#10-implantação-e-infraestrutura)
11. [Configuração do Ambiente](#11-configuração-do-ambiente)
12. [Scripts e Comandos](#12-scripts-e-comandos)
13. [Funcionalidades do Sistema](#13-funcionalidades-do-sistema)
14. [Fluxo de Dados (Diagrama Lógico)](#14-fluxo-de-dados-diagrama-lógico)

---

## 1. Visão Geral do Projeto

O **System Salon** é um sistema web de gestão completa para salões de beleza e estúdios estéticos. Ele permite que donos de salão gerenciem todos os aspectos do seu negócio a partir de uma interface moderna e intuitiva.

### Funcionalidades Principais

| Módulo | Descrição |
|--------|-----------|
| **Agendamentos** | Criar, editar, cancelar e concluir agendamentos com controle de horários |
| **Clientes** | Cadastro e histórico completo de clientes |
| **Especialistas** | Gerenciamento de profissionais, horários e especialidades |
| **Serviços** | Catálogo de serviços com preços e durações |
| **Financeiro** | Registro de transações e relatórios de receita |
| **Dashboard** | Painel com métricas e gráficos em tempo real |
| **Agendamento Público** | Página para clientes se agendarem sem conta |
| **Usuários** | Controle de acesso com papéis e permissões |
| **Auditoria** | Log completo de todas as ações realizadas no sistema |
| **PWA** | Funciona como aplicativo instalável em celulares |

### Tipo de Aplicação

- **Monolito Fullstack** — frontend e backend no mesmo repositório e processo Node.js
- **SPA (Single Page Application)** — navegação sem recarregamento de página
- **PWA (Progressive Web App)** — instalável como app nativo

---

## 2. Tecnologias Utilizadas

### Frontend

| Tecnologia | Versão | Função |
|-----------|--------|--------|
| **React** | 19.1.1 | Framework de interface de usuário |
| **TypeScript** | 5.9.3 | Tipagem estática para JavaScript |
| **Vite** | 7.2.2 | Build tool e bundler de alta performance |
| **Tailwind CSS** | 4.1.14 | Framework CSS utilitário para estilização |
| **shadcn/ui + Radix UI** | — | Biblioteca de componentes acessíveis |
| **Wouter** | 3.3.5 | Roteamento leve para React (SPA) |
| **TanStack Query** | 5.90.2 | Gerenciamento de estado assíncrono e cache |
| **tRPC (client)** | 11.6.0 | Chamadas RPC tipadas sem geração de código |
| **React Hook Form** | 7.64.0 | Gerenciamento de formulários performático |
| **Zod** | 4.1.12 | Validação e parsing de dados com tipos |
| **Recharts** | 2.15.2 | Gráficos e visualizações de dados |
| **Framer Motion** | 12.23.22 | Animações fluidas |
| **date-fns** | 4.1.0 | Manipulação e formatação de datas |
| **vite-plugin-pwa** | 1.2.0 | Suporte a PWA (Service Worker, offline) |

### Backend

| Tecnologia | Versão | Função |
|-----------|--------|--------|
| **Node.js** | 20 | Ambiente de execução JavaScript |
| **Express** | 4.21.2 | Framework HTTP para o servidor |
| **tRPC (server)** | 11.6.0 | Definição de procedures RPC com tipos |
| **Drizzle ORM** | 0.44.5 | ORM TypeScript com migrações automáticas |
| **PostgreSQL** | 16 | Banco de dados relacional principal |
| **bcrypt** | 6.0.0 | Hash seguro de senhas |
| **jose** | 6.1.0 | Criação e validação de tokens JWT |
| **Helmet** | 8.1.0 | Headers de segurança HTTP |
| **express-rate-limit** | 8.2.1 | Rate limiting para proteção contra spam |
| **Cloudinary** | 2.8.0 | Upload e armazenamento de imagens em nuvem |
| **superjson** | 1.13.3 | Serialização JSON com suporte a tipos complexos (Date, Decimal) |
| **tsx** | — | Execução de TypeScript diretamente no Node |

### Banco de Dados e ORM

| Tecnologia | Função |
|-----------|--------|
| **PostgreSQL 16** | Banco de dados relacional com suporte a JSON (jsonb) |
| **Drizzle ORM** | Mapeamento objeto-relacional, migrations, e queries tipadas |
| **drizzle-kit** | CLI para geração de migrations e inspeção do schema |

---

## 3. Arquitetura do Sistema

### Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                      NAVEGADOR (Browser)                     │
│                                                             │
│  React SPA (Vite)                                           │
│  ┌─────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │   Páginas   │  │  Componentes  │  │    Contextos     │  │
│  │  (lazy      │  │  (negócio +   │  │  (Auth, Theme)   │  │
│  │   loaded)   │  │   shadcn/ui)  │  │                  │  │
│  └──────┬──────┘  └───────┬───────┘  └──────────────────┘  │
│         │                 │                                  │
│  ┌──────▼─────────────────▼────────────────────────────┐    │
│  │         tRPC Client + React Query (cache 5min)       │    │
│  └─────────────────────────┬────────────────────────────┘    │
└────────────────────────────│────────────────────────────────┘
                             │ HTTP (JSON/superjson)
                             │ POST /api/trpc/{procedure}?batch=1
┌────────────────────────────▼────────────────────────────────┐
│                    SERVIDOR (Node.js + Express)               │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   tRPC Router                        │   │
│  │  auth | salon | specialists | clients | services     │   │
│  │  appointments | users | reports | schedule | audit   │   │
│  │  notifications | waitlist | images | dashboard       │   │
│  └─────────────────────────┬────────────────────────────┘   │
│                            │                                  │
│  ┌─────────────────────────▼────────────────────────────┐   │
│  │              server/db.ts (Drizzle ORM)              │   │
│  │  getUser | getSalon | createAppointment |             │   │
│  │  getDashboardMetrics | getAvailableTimeSlots | ...    │   │
│  └─────────────────────────┬────────────────────────────┘   │
└────────────────────────────│────────────────────────────────┘
                             │ SQL
┌────────────────────────────▼────────────────────────────────┐
│                    PostgreSQL 16                              │
│                                                             │
│  users | salons | specialists | clients | services          │
│  appointments | transactions | specialistSchedules          │
│  passwordResets | auditLogs                                  │
└─────────────────────────────────────────────────────────────┘
```

### Padrão de Comunicação: tRPC

O projeto utiliza **tRPC (TypeScript Remote Procedure Call)**, que elimina a necessidade de uma API REST tradicional. Em vez de definir endpoints como `POST /api/clientes`, define-se *procedures* TypeScript que são chamadas diretamente pelo cliente com total segurança de tipos.

**Como funciona:**

1. O servidor define procedures em `server/routers.ts`
2. O cliente importa o tipo `AppRouter` de `server/routers.ts`
3. O tRPC gera automaticamente um cliente tipado
4. O cliente chama `trpc.clients.create.useMutation(...)` como se fosse uma função local
5. Internamente, o tRPC serializa e envia via HTTP POST para `/api/trpc/clients.create?batch=1`

**Vantagem principal:** Se você mudar o tipo de retorno de uma procedure no servidor, o TypeScript imediatamente indica o erro no cliente — sem geração de código adicional.

---

## 4. Estrutura de Pastas

```
system-salon/
│
├── client/                     # Frontend React
│   ├── index.html              # Entry point HTML
│   └── src/
│       ├── main.tsx            # Inicialização React + QueryClient + tRPC
│       ├── App.tsx             # Roteamento principal (lazy loading)
│       ├── index.css           # Estilos globais (Tailwind + variáveis CSS)
│       ├── const.ts            # Constantes globais do cliente
│       ├── sw.ts               # Service Worker (PWA - cache offline)
│       ├── _core/
│       │   └── hooks/
│       │       └── useAuth.tsx # Hook de autenticação global
│       ├── components/         # Componentes de negócio reutilizáveis
│       │   ├── AppointmentModal.tsx
│       │   ├── AppointmentStats.tsx
│       │   ├── CalendarPicker.tsx
│       │   ├── CompleteAppointmentModal.tsx
│       │   ├── DashboardLayout.tsx
│       │   ├── ErrorBoundary.tsx
│       │   ├── Footer.tsx
│       │   ├── SpecialistScheduleManagement.tsx
│       │   ├── TimeSlotPicker.tsx
│       │   └── ui/             # Componentes shadcn/ui (Button, Input, etc.)
│       ├── contexts/
│       │   └── ThemeContext.tsx # Provider de tema light/dark
│       ├── hooks/
│       │   ├── useComposition.ts
│       │   └── useMobile.tsx
│       ├── lib/                # Utilitários de cliente
│       └── pages/              # Páginas da aplicação
│           ├── Login.tsx
│           ├── RecuperarSenha.tsx
│           ├── RedefinirSenha.tsx
│           ├── PublicBooking.tsx
│           ├── Dashboard.tsx
│           ├── Clients.tsx
│           ├── Services.tsx
│           ├── Appointments.tsx
│           ├── Specialists.tsx
│           ├── Empresa.tsx
│           ├── Usuarios.tsx
│           ├── Logs.tsx
│           └── NotFound.tsx
│
├── server/                     # Backend Node.js
│   ├── routers.ts              # TODOS os endpoints tRPC (arquivo principal)
│   ├── db.ts                   # Todas as funções de acesso ao banco
│   ├── cloudinary.ts           # Upload de imagens para Cloudinary
│   ├── notifications.ts        # Sistema de notificações (templates, agendamento)
│   ├── public-booking.ts       # Funções para agendamento público
│   ├── reports.ts              # Geração de relatórios avançados
│   ├── specialist-schedule.ts  # Lógica de agendas de especialistas
│   ├── storage.ts              # Interface de armazenamento (S3/local)
│   ├── sync-schedules.ts       # Sincronização de horários
│   ├── waitlist.ts             # Sistema de lista de espera
│   └── _core/                  # Infraestrutura do servidor
│       ├── index.ts            # Entry point — inicia Express + tRPC
│       ├── trpc.ts             # Configuração do tRPC (procedures, middlewares)
│       ├── context.ts          # Criação do contexto de cada request
│       ├── env.ts              # Carregamento e validação de variáveis de ambiente
│       ├── cookies.ts          # Utilitários de cookies de sessão
│       ├── oauth.ts            # Integração OAuth (login social)
│       ├── sdk.ts              # SDK de autenticação (verificar JWT)
│       ├── systemRouter.ts     # Router do sistema (health check, etc.)
│       ├── notification.ts     # Envio real de notificações
│       └── vite.ts             # Integração Vite (serve frontend em dev)
│
├── shared/                     # Código compartilhado entre cliente e servidor
│   ├── types.ts                # Re-exporta tipos do schema + errors
│   ├── validations.ts          # Schemas Zod compartilhados
│   └── const.ts                # Constantes compartilhadas
│
├── drizzle/                    # Banco de dados
│   ├── schema.ts               # Definição completa das tabelas
│   ├── relations.ts            # Relacionamentos Drizzle (joins)
│   ├── seed-admin.ts           # Script para popular o banco com dados de teste
│   └── migrations/             # Migrações SQL geradas automaticamente
│
├── docs/                       # Documentação
│   └── DOCUMENTACAO.md         # Este arquivo
│
├── backups/                    # Backups do banco de dados
│
├── Dockerfile                  # Imagem Docker de produção (multi-stage)
├── docker-compose.yml          # Orquestração local (app + postgres)
├── drizzle.config.ts           # Configuração do drizzle-kit
├── vite.config.ts              # Configuração do Vite e PWA
├── vitest.config.ts            # Configuração dos testes unitários
├── tsconfig.json               # Configuração TypeScript
├── package.json                # Dependências e scripts
└── .env                        # Variáveis de ambiente (NÃO comitar)
```

---

## 5. Banco de Dados — Modelo de Dados

O banco utiliza **PostgreSQL 16** como SGBD. O schema é definido em TypeScript via Drizzle ORM (`drizzle/schema.ts`) e as migrações são geradas automaticamente com `drizzle-kit`.

### Diagrama Entidade-Relacionamento (simplificado)

```
users ──────────────── salons
  │                      │
  │                      ├──── specialists ──── specialistSchedules
  │                      │          │
  │                      ├──── clients          │
  │                      │                      │
  │                      ├──── services ─────── │
  │                      │                      │
  │                      └──── appointments ────┤
  │                               │
  │                               └──── transactions
  │
  └──── passwordResets
  └──── auditLogs (+ salonId)
```

### Tabela: `users` — Usuários do Sistema

Armazena todos os usuários que acessam o painel administrativo.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | varchar(64) PK | ID único gerado com nanoid |
| `salonId` | varchar(64) FK | Salão ao qual o usuário pertence |
| `email` | varchar(320) UNIQUE | E-mail de login |
| `password` | text | Senha hasheada com bcrypt |
| `name` | text | Nome completo |
| `role` | enum('user','admin') | Papel no sistema |
| `permissions` | jsonb | Permissões granulares: `{manage_clients: true}` |
| `photoUrl` | text | URL da foto de perfil |
| `phone` | varchar(20) | Telefone de contato |
| `lastSignedIn` | timestamp | Última vez que fez login |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data da última atualização |

---

### Tabela: `salons` — Dados do Salão

Contém as informações comerciais do salão. Um usuário admin pode ter/gerenciar um salão.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | varchar(64) PK | ID único |
| `userId` | varchar(64) FK → users | Dono do salão (cascade delete) |
| `name` | text | Nome do salão |
| `cnpj` | varchar(20) | CNPJ da empresa |
| `address` | text | Endereço completo |
| `phone` | varchar(20) | Telefone comercial |
| `email` | varchar(320) | E-mail comercial |
| `logo` | text | URL do logotipo |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data da última atualização |

**Índices:** `salonId_idx` em `userId`

---

### Tabela: `specialists` — Especialistas/Profissionais

Profissionais que trabalham no salão e atendem os clientes.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | varchar(64) PK | ID único |
| `salonId` | varchar(64) FK → salons | Salão ao qual pertence (cascade delete) |
| `name` | text | Nome completo |
| `specialty` | varchar(255) | Especialidade (ex: Cabeleireira) |
| `photo` | text | URL da foto |
| `email` | varchar(320) | E-mail de contato |
| `phone` | varchar(20) | Telefone |
| `bio` | text | Biografia/apresentação |
| `workingDays` | jsonb | Horários por dia (legado, ver specialistSchedules) |
| `status` | enum('active','inactive') | Se está ativo |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data da última atualização |

**Índices:** `salonId_idx` em `salonId`

---

### Tabela: `specialistSchedules` — Agendas dos Especialistas

Configurações detalhadas de disponibilidade de cada especialista.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `specialistId` | varchar(64) PK | Especialista (relação 1:1) |
| `timeSlotDuration` | integer | Duração de cada slot em minutos (padrão: 30) |
| `bufferTime` | integer | Tempo entre atendimentos em minutos (padrão: 0) |
| `allowBookingDaysInAdvance` | integer | Quantos dias à frente é possível agendar (padrão: 30) |
| `minimumNoticeHours` | integer | Antecedência mínima em horas (padrão: 2) |
| `autoConfirmBookings` | boolean | Confirmar automaticamente novos agendamentos |
| `allowOnlineBooking` | boolean | Aceitar agendamentos públicos online |
| `workingHours` | jsonb | Array de 7 objetos (um por dia da semana): `{dayOfWeek, isWorking, startTime, endTime, breakStartTime, breakEndTime}` |
| `customUnavailableDates` | jsonb | Array de datas ISO indisponíveis (ex: feriados, folgas) |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data da última atualização |

---

### Tabela: `clients` — Clientes

Clientes cadastrados no salão.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | varchar(64) PK | ID único |
| `salonId` | varchar(64) FK → salons | Salão ao qual pertence (cascade delete) |
| `name` | text | Nome completo |
| `email` | varchar(320) | E-mail |
| `phone` | varchar(20) | Telefone |
| `notes` | text | Observações sobre o cliente |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data da última atualização |

**Índices:** `salonId_idx`, `email_idx`

---

### Tabela: `services` — Serviços

Catálogo de serviços oferecidos pelo salão.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | varchar(64) PK | ID único |
| `salonId` | varchar(64) FK → salons | Salão ao qual pertence (cascade delete) |
| `specialistId` | varchar(64) FK → specialists | Especialista que realiza (opcional, set null) |
| `name` | text | Nome do serviço |
| `description` | text | Descrição detalhada |
| `duration` | integer | Duração em minutos |
| `price` | decimal(10,2) | Preço base |
| `priceFrom` | boolean | Se `true`, o preço exibido é "a partir de R$ X" |
| `status` | enum('active','inactive') | Se está sendo oferecido |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data da última atualização |

**Índices:** `salonId_idx`, `specialistId_idx`

---

### Tabela: `appointments` — Agendamentos

Registro de todos os agendamentos do salão.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | varchar(64) PK | ID único |
| `salonId` | varchar(64) FK → salons | Salão (cascade delete) |
| `clientId` | varchar(64) FK → clients | Cliente (cascade delete) |
| `serviceId` | varchar(64) FK → services | Serviço (cascade delete) |
| `specialistId` | varchar(64) FK → specialists | Especialista (cascade delete) |
| `appointmentDate` | timestamp | Data do agendamento |
| `appointmentTime` | varchar(10) | Hora no formato "HH:MM" |
| `status` | enum | `pending` / `confirmed` / `completed` / `cancelled` |
| `notes` | text | Observações |
| `isPublic` | boolean | Se foi criado via agendamento público |
| `paidAmount` | decimal(10,2) | Valor efetivamente pago (preenchido ao concluir) |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data da última atualização |

**Índices simples:** `salonId`, `clientId`, `serviceId`, `specialistId`, `appointmentDate`  
**Índices compostos (performance):**
- `appointments_salonId_date_idx` em `(salonId, appointmentDate)` — acelera listagem por período
- `appointments_specialistId_date_idx` em `(specialistId, appointmentDate)` — acelera verificação de disponibilidade

---

### Tabela: `transactions` — Transações Financeiras

Registro financeiro vinculado aos agendamentos concluídos e despesas avulsas.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | varchar(64) PK | ID único |
| `salonId` | varchar(64) FK → salons | Salão |
| `appointmentId` | varchar(64) FK → appointments | Agendamento relacionado (opcional) |
| `clientId` | varchar(64) FK → clients | Cliente (opcional) |
| `serviceId` | varchar(64) FK → services | Serviço (opcional) |
| `specialistId` | varchar(64) FK → specialists | Especialista (opcional) |
| `type` | enum | `income` (receita) / `expense` (despesa) / `refund` (estorno) |
| `status` | enum | `pending` / `completed` / `cancelled` |
| `paymentMethod` | enum | `cash` / `credit_card` / `debit_card` / `pix` / `bank_transfer` / `other` |
| `amount` | decimal(10,2) | Valor total da transação |
| `serviceFee` | decimal(10,2) | Taxa do serviço (opcional) |
| `specialistCommission` | decimal(10,2) | Comissão do especialista (opcional) |
| `description` | text | Descrição da transação |
| `notes` | text | Observações adicionais |
| `transactionDate` | timestamp | Data e hora da transação |
| `createdAt` / `updatedAt` | timestamp | Metadados de auditoria |

**Índice composto (performance):**
- `transactions_salonId_date_idx` em `(salonId, transactionDate)` — acelera as 6 queries de agregação do dashboard

---

### Tabela: `passwordResets` — Tokens de Reset de Senha

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | varchar(64) PK | ID único |
| `userId` | varchar(64) FK → users | Usuário que solicitou |
| `token` | varchar(255) UNIQUE | Token seguro de 1 uso |
| `expiresAt` | timestamp | Validade de 1 hora |
| `used` | boolean | Se já foi utilizado |
| `createdAt` | timestamp | Data de criação |

---

### Tabela: `auditLogs` — Trilha de Auditoria

Registra TODAS as ações realizadas no sistema para rastreabilidade.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | varchar(64) PK | ID único |
| `userId` | varchar(64) | Usuário que realizou a ação (nullable) |
| `salonId` | varchar(64) | Salão afetado (nullable) |
| `action` | varchar(64) | Ação: `create`, `update`, `delete`, `login`, etc. |
| `entity` | varchar(128) | Entidade: `clients`, `appointments`, `users`, etc. |
| `entityId` | varchar(128) | ID do registro afetado |
| `before` | jsonb | Estado antes da alteração |
| `after` | jsonb | Estado após a alteração |
| `metadata` | jsonb | IP, User-Agent, motivo |
| `createdAt` | timestamp | Data e hora da ação |

**Índices:** `userId`, `(entity, entityId)`, `salonId`, `createdAt`

---

## 6. Backend — Servidor e API

### 6.1 Entry Point (`server/_core/index.ts`)

O arquivo de entrada do servidor configura e inicializa toda a aplicação:

1. Carrega variáveis de ambiente
2. Cria instância do Express
3. Aplica middlewares de segurança:
   - **Helmet** — headers HTTP de segurança (XSS, CSRF, etc.)
   - **CORS** — controle de origens permitidas
   - **Rate Limiter** — máximo de 100 requests/15min por IP em `/api/`
   - **JSON Parser** — limite de 5MB para uploads
4. Monta o tRPC em `/api/trpc`
5. Serve o frontend React em todas as outras rotas (SPA)
6. Inicia o servidor na porta 3000

### 6.2 Contexto tRPC (`server/_core/context.ts`)

Cada request ao tRPC passa pela função `createContext()` que:

1. Extrai o token JWT do cookie de sessão
2. Valida o token e busca o usuário no banco
3. Retorna `{ req, res, user: User | null }`

O `user` fica disponível em todas as procedures via `ctx.user`.

### 6.3 Procedures tRPC (`server/_core/trpc.ts`)

Define três níveis de acesso:

| Procedure | Autenticação | Descrição |
|-----------|-------------|-----------|
| `publicProcedure` | Nenhuma | Qualquer usuário pode acessar |
| `protectedProcedure` | JWT válido | Apenas usuários logados |
| `adminProcedure` | JWT + role=admin | Apenas administradores |

### 6.4 Routers tRPC (`server/routers.ts`)

Arquivo central com TODOS os endpoints da API. Organizado em namespaces:

#### `auth` — Autenticação

| Procedure | Tipo | Acesso | Descrição |
|-----------|------|--------|-----------|
| `auth.me` | query | público | Retorna o usuário autenticado + salonId |
| `auth.login` | mutation | público | Autentica por email/senha, define cookie de sessão |
| `auth.logout` | mutation | público | Remove cookie de sessão |
| `auth.register` | mutation | público | Cria novo usuário e associa ao salão padrão |
| `auth.requestPasswordReset` | mutation | público | Gera token de reset (sem revelar se email existe) |
| `auth.resetPassword` | mutation | público | Valida token e redefine senha |

#### `salon` — Salão

| Procedure | Tipo | Acesso | Descrição |
|-----------|------|--------|-----------|
| `salon.get` | query | protegido | Retorna dados do salão do usuário logado |
| `salon.update` | mutation | admin | Atualiza dados do salão |
| `salon.create` | mutation | protegido | Cria salão se não existir para este usuário |

#### `specialists` — Especialistas

| Procedure | Tipo | Acesso | Descrição |
|-----------|------|--------|-----------|
| `specialists.list` | query | protegido | Lista especialistas do salão |
| `specialists.get` | query | protegido | Busca especialista por ID |
| `specialists.create` | mutation | protegido | Cria especialista + schedule inicial (com rollback em erro) |
| `specialists.update` | mutation | protegido | Atualiza dados do especialista |
| `specialists.delete` | mutation | protegido | Remove especialista (cascade) |

#### `clients` — Clientes

| Procedure | Tipo | Acesso | Descrição |
|-----------|------|--------|-----------|
| `clients.list` | query | protegido | Lista com busca por texto, limit/offset |
| `clients.get` | query | protegido | Busca por ID |
| `clients.create` | mutation | protegido | Cria cliente |
| `clients.update` | mutation | protegido | Atualiza cliente |
| `clients.delete` | mutation | protegido | Remove cliente |

#### `services` — Serviços

| Procedure | Tipo | Acesso | Descrição |
|-----------|------|--------|-----------|
| `services.list` | query | protegido | Lista serviços do salão |
| `services.get` | query | protegido | Busca por ID |
| `services.create` | mutation | protegido | Cria serviço |
| `services.update` | mutation | protegido | Atualiza serviço |
| `services.delete` | mutation | protegido | Remove (proíbe se tiver agendamentos futuros) |

#### `appointments` — Agendamentos

| Procedure | Tipo | Acesso | Descrição |
|-----------|------|--------|-----------|
| `appointments.list` | query | protegido | Lista com filtros de data |
| `appointments.get` | query | protegido | Busca por ID |
| `appointments.create` | mutation | protegido | Cria agendamento + notificações + verifica waitlist |
| `appointments.update` | mutation | protegido | Atualiza (revalida horário) |
| `appointments.delete` | mutation | protegido | Remove agendamento |
| `appointments.getAvailableSlots` | query | protegido | Horários livres para especialista/serviço/data |
| `appointments.validateSlot` | query | protegido | Valida se horário específico está disponível |
| `appointments.getSuggestions` | query | protegido | Sugere horários próximos ao preferido |
| `appointments.complete` | mutation | protegido | Conclui agendamento + registra transação de receita |
| `appointments.cancel` | mutation | protegido | Cancela com motivo nas notas |
| `appointments.confirm` | mutation | protegido | Confirma agendamento pendente |

#### `schedule` — Agenda dos Especialistas

| Procedure | Tipo | Acesso | Descrição |
|-----------|------|--------|-----------|
| `schedule.getSpecialistSchedule` | query | protegido | Retorna configuração completa da agenda |
| `schedule.updateSpecialistSchedule` | mutation | protegido | Atualiza configurações gerais |
| `schedule.updateWorkingHours` | mutation | protegido | Atualiza horários de um dia específico |
| `schedule.addUnavailableDate` | mutation | protegido | Adiciona data indisponível |
| `schedule.removeUnavailableDate` | mutation | protegido | Remove data indisponível |
| `schedule.getAvailableSlots` | query | protegido | Horários livres de um especialista em uma data |

#### `users` — Usuários (apenas admin)

| Procedure | Tipo | Acesso | Descrição |
|-----------|------|--------|-----------|
| `users.list` | query | admin | Lista usuários do salão |
| `users.create` | mutation | admin | Cria novo usuário associado ao salão |
| `users.edit` | mutation | protegido | Admin edita qualquer usuário / usuário edita a si mesmo |
| `users.resetPassword` | mutation | protegido | Admin ou próprio usuário redefine senha |
| `users.delete` | mutation | admin | Remove usuário (sem auto-delete) |

#### `audit` — Auditoria

| Procedure | Tipo | Acesso | Descrição |
|-----------|------|--------|-----------|
| `audit.list` | query | admin | Lista audit logs paginados (limit/offset) |

#### `dashboard` — Dashboard

| Procedure | Tipo | Acesso | Descrição |
|-----------|------|--------|-----------|
| `dashboard.all` | query | protegido | Todos os dados do dashboard em uma chamada |
| `dashboard.metrics` | query | protegido | KPIs (receita, agendamentos, etc.) |
| `dashboard.revenueChart` | query | protegido | Dados do gráfico de receita |
| `dashboard.monthlyComparison` | query | protegido | Comparativo mês atual vs anterior |
| `dashboard.upcomingAppointments` | query | protegido | Próximos 10 agendamentos |

#### `reports` — Relatórios

| Procedure | Tipo | Acesso | Descrição |
|-----------|------|--------|-----------|
| `reports.appointmentStats` | query | protegido | Estatísticas de agendamentos com filtros |
| `reports.specialistPerformance` | query | protegido | Performance individual de cada especialista |
| `reports.servicePopularity` | query | protegido | Quais serviços mais vendidos |
| `reports.clientAnalytics` | query | protegido | Análise de clientes (risco de abandono) |
| `reports.dailyReport` | query | protegido | Relatório de um dia específico |
| `reports.exportCSV` | mutation | protegido | Exporta dados para CSV |

#### `notifications` — Notificações

| Procedure | Tipo | Acesso | Descrição |
|-----------|------|--------|-----------|
| `notifications.sendAppointmentNotification` | mutation | protegido | Envia notificação por canal escolhido |
| `notifications.getTemplates` | query | protegido | Lista templates de notificação disponíveis |

#### `waitlist` — Lista de Espera

| Procedure | Tipo | Acesso | Descrição |
|-----------|------|--------|-----------|
| `waitlist.add` | mutation | protegido | Adiciona cliente à lista de espera |
| `waitlist.remove` | mutation | protegido | Remove da lista |
| `waitlist.list` | query | protegido | Lista entradas ativas |
| `waitlist.confirm` | mutation | protegido | Confirma slot para cliente em espera |
| `waitlist.stats` | query | protegido | Estatísticas da lista de espera |

#### `images` — Upload

| Procedure | Tipo | Acesso | Descrição |
|-----------|------|--------|-----------|
| `images.upload` | mutation | protegido | Upload de imagem base64 para Cloudinary |

#### `publicBooking` — Agendamento Público

| Procedure | Tipo | Acesso | Descrição |
|-----------|------|--------|-----------|
| `publicBooking.getSalonBySlug` | query | público | Busca salão por slug para exibição pública |
| `publicBooking.getAvailableSlots` | query | público | Horários livres sem autenticação |
| `publicBooking.createPublicAppointment` | mutation | público | Cria agendamento sem login |

---

### 6.5 Camada de Acesso ao Banco (`server/db.ts`)

Arquivo com todas as funções que executam queries no PostgreSQL via Drizzle ORM. Principais grupos:

**Gestão do banco:**
- `getDb()` — Retorna instância singleton do Drizzle

**Usuários:** `getUser`, `getUserByEmail`, `upsertUser`, `listUsers`

**Salões:** `getSalonByUserId`, `getSalonById`

**Especialistas:** `getSpecialistById`, `getSpecialistsBySalonId`, `createSpecialist`, `updateSpecialist`, `deleteSpecialist`

**Clientes:** `getClientById`, `getClientsBySalonId`, `createClient`, `updateClient`, `deleteClient`

**Serviços:** `getServiceById`, `getServicesBySalonId`, `createService`, `updateService`, `deleteService`

**Agendamentos:**
- `getAppointmentById`
- `getAppointmentsWithDetailsBySalonId` — Retorna com `JOIN` em client, service e specialist
- `createAppointment`, `updateAppointment`, `deleteAppointment`
- `getAvailableTimeSlots(specialistId, serviceId, date)` — Algoritmo que calcula slots livres considerando duração do serviço, buffer time, horários de trabalho e agendamentos existentes
- `validateAppointmentSlot(...)` — Valida se um slot específico está disponível
- `recordAppointmentRevenue(...)` — Cria transação de receita ao concluir agendamento

**Dashboard:**
- `getDashboardMetrics(salonId)` — KPIs com **cache de 10 minutos** em memória para evitar recálculos constantes
- `getRevenueChart`, `getMonthlyComparison`, `getAllDashboardData`

**Password Reset:** `createPasswordReset`, `getPasswordResetByToken`, `markPasswordResetAsUsed`

**Auditoria:** `createAuditLog`, `listAuditLogs`

---

### 6.6 Módulos Auxiliares do Servidor

| Arquivo | Função |
|---------|--------|
| `server/cloudinary.ts` | Função `uploadBase64Image()` que envia imagens para Cloudinary na pasta "specialists" |
| `server/notifications.ts` | Templates de notificação (confirmação, lembrete, cancelamento, waitlist) e agendamento de envios (24h e 2h antes do agendamento) |
| `server/reports.ts` | Funções de análise avançada: `generateSpecialistPerformance`, `generateClientAnalytics` (com cálculo de risco de churn), `exportToCSV` |
| `server/waitlist.ts` | Gerenciamento de lista de espera em memória: adicionar, remover, verificar disponibilidade de slots, confirmar |
| `server/public-booking.ts` | Funções para a página pública de agendamento (sem autenticação) |
| `server/specialist-schedule.ts` | Lógica de cálculo de disponibilidade e slots livres |
| `server/sync-schedules.ts` | Sincronização de horários entre `specialists.workingDays` e `specialistSchedules` |
| `server/storage.ts` | Interface para armazenamento de arquivos (S3/local) |

---

## 7. Frontend — Interface do Usuário

### 7.1 Inicialização (`client/src/main.tsx`)

Configura o aplicativo com:

1. **QueryClient** (React Query) com configurações de cache:
   - `staleTime: 5 minutos` — dados são considerados frescos por 5 min
   - `gcTime: 10 minutos` — cache mantido 10 min após desmontagem
   - `retry: 1` — tenta só uma vez em caso de erro
   - `refetchOnWindowFocus: false` — não rebusca ao voltar à aba
2. **tRPC Client** com `httpBatchLink` — agrupa múltiplas chamadas em um único request HTTP
3. Renderiza `<App />` dentro dos providers

### 7.2 Roteamento (`client/src/App.tsx`)

Usa **Wouter** (roteamento leve, ~2KB vs 47KB do React Router) com **lazy loading** em todas as páginas:

| Rota | Página | Acesso |
|------|--------|--------|
| `/` | Redireciona para `/login` | Pública |
| `/login` | `Login.tsx` | Pública |
| `/recuperar-senha` | `RecuperarSenha.tsx` | Pública |
| `/redefinir-senha` | `RedefinirSenha.tsx` | Pública |
| `/agendar` | `PublicBooking.tsx` | Pública |
| `/dashboard` | `Dashboard.tsx` | Protegida |
| `/clientes` | `Clients.tsx` | Protegida |
| `/servicos` | `Services.tsx` | Protegida |
| `/agendamentos` | `Appointments.tsx` | Protegida |
| `/especialistas` | `Specialists.tsx` | Protegida |
| `/empresa` | `Empresa.tsx` | Admin |
| `/usuarios` | `Usuarios.tsx` | Admin |
| `/logs` | `Logs.tsx` | Admin |
| `/404` | `NotFound.tsx` | Pública |

**Lazy loading** significa que o JavaScript de cada página só é baixado quando o usuário navega para ela, reduzindo em ~40% o tamanho do bundle inicial.

### 7.3 Páginas

#### `Login.tsx`
Formulário de autenticação com e-mail e senha. Ao fazer login com sucesso, armazena o token JWT e redireciona para `/dashboard`. Permite toggle de visibilidade da senha.

#### `RecuperarSenha.tsx`
Formulário que solicita o e-mail do usuário. Internamente, cria um token de recuperação e envia (futuramente) um e-mail com link. Por segurança, **não informa se o e-mail existe no sistema** — sempre exibe mensagem de sucesso.

#### `RedefinirSenha.tsx`
Recebe o token da URL (`?token=...`), valida com o servidor e permite definir nova senha. Exige mínimo 6 caracteres.

#### `PublicBooking.tsx`
Página pública (sem login) que permite a clientes externos agendarem serviços. Fluxo em 5 etapas:
1. Escolher especialista
2. Escolher serviço
3. Escolher data e horário
4. Informar nome, telefone e e-mail
5. Confirmar o agendamento

#### `Dashboard.tsx`
Painel principal do sistema exibindo:
- **Cards de KPIs**: Receita total do mês, agendamentos do dia, agendamentos pendentes, novos clientes no mês
- **Gráfico de receita**: Linha dos últimos 30 dias (Recharts)
- **Lista de próximos agendamentos**: Horário, cliente, especialista, serviço e status

#### `Clients.tsx`
CRUD completo de clientes com:
- Busca em tempo real por nome/e-mail
- Modal de criação/edição com campos: nome, e-mail, telefone, observações
- Diálogo de confirmação para exclusão
- Feedback visual (toast) em todas as operações

#### `Services.tsx`
CRUD de serviços com:
- Listagem com status (ativo/inativo)
- Campos: nome, descrição, duração, preço, indicador "a partir de", especialista responsável
- Toggle de status ativo/inativo
- Proteção contra exclusão se houver agendamentos futuros

#### `Appointments.tsx`
Módulo mais complexo do sistema. Funcionalidades:
- **3 visões**: Diária / Semanal / Mensal
- **Filtros**: Por status (pendente, confirmado, concluído, cancelado) e busca por texto
- **Paginação**: 20 itens por página
- **Ações rápidas**: Confirmar, Concluir (com registro de pagamento), Cancelar
- **Estatísticas**: Cards com taxa de conclusão e cancelamento (memoizados)
- **Integração com CalendarPicker** para navegação de datas

#### `Specialists.tsx`
Gerenciamento de especialistas:
- Cards com foto, nome, especialidade e status
- CRUD via modais
- Botão de configuração de horários que abre `SpecialistScheduleManagement`

#### `Empresa.tsx`
Configurações do salão (apenas admin):
- Visualização e edição dos dados: nome, CNPJ, endereço, telefone, e-mail, logo

#### `Usuarios.tsx`
Gestão de usuários (apenas admin):
- Criar usuários com papel `admin` (acesso total) ou `user` (permissões individuais)
- Permissões disponíveis para `user`: manage_clients, manage_services, manage_specialists, manage_appointments, manage_users
- Reset de senha via prompt
- Exclusão com confirmação (admin não pode excluir a si mesmo)

#### `Logs.tsx`
Trilha de auditoria (apenas admin):
- Exibe todas as ações: quem fez, quando, o que mudou (antes/depois em JSON)
- Paginação de 50 itens por página
- Copy para clipboard dos detalhes JSON

---

### 7.4 Componentes de Negócio

#### `DashboardLayout.tsx`
Layout base com sidebar retrátil para todas as páginas protegidas:
- Menu com ícones e rótulos para cada seção
- Itens do menu visíveis conforme o papel do usuário
- Sidebar redimensionável (largura salva em localStorage)
- Em mobile: sidebar colapsada por padrão

#### `AppointmentModal.tsx`
Modal em 4 passos para criar/editar agendamentos:
1. Selecionar data (CalendarPicker)
2. Selecionar cliente, serviço e especialista
3. Selecionar horário (TimeSlotPicker)
4. Confirmar e salvar

#### `CompleteAppointmentModal.tsx`
Modal para registrar conclusão de serviço: valor pago e método de pagamento. Ao salvar, cria automaticamente uma transação financeira de receita.

#### `CalendarPicker.tsx`
Calendário mensal com:
- Navegação entre meses
- Destaque de hoje e data selecionada
- Badge mostrando quantidade de agendamentos por dia
- Datas desabilitadas (domingos, datas sem disponibilidade)

#### `TimeSlotPicker.tsx`
Seletor de horário inteligente:
- Busca slots livres via `appointments.getAvailableSlots`
- Agrupa por período: Manhã (até 12h), Tarde (12h-18h), Noite (após 18h)
- Se horário preferido estiver ocupado, exibe sugestões próximas

#### `AppointmentStats.tsx`
Cards de estatísticas dos agendamentos visíveis. Usa `React.memo` e `useMemo` para evitar recálculos desnecessários ao re-render da página.

#### `SpecialistScheduleManagement.tsx`
Modal completo de configuração de agenda:
- Editar perfil do especialista
- Configurar horários por dia da semana (com intervalo de almoço)
- Definir datas de indisponibilidade personalizadas
- Configurar parâmetros de agendamento (duração de slots, antecedência mínima)

#### `ErrorBoundary.tsx`
Componente de classe que captura erros de renderização React e exibe uma tela de fallback com mensagem de erro e botão para recarregar a página.

---

### 7.5 Contextos React

#### `ThemeContext.tsx`
Provider global de tema light/dark:
- Armazena preferência em `localStorage`
- Aplica classe `dark` no `<html>`
- Exporta hook `useTheme()` com `theme` e `toggleTheme()`

---

### 7.6 Hooks Customizados

#### `useAuth()` (`client/src/_core/hooks/useAuth.tsx`)
Hook central de autenticação. Disponível em toda a aplicação:
- `user` — objeto do usuário logado (ou null)
- `isAuthenticated` — boolean
- `loading` — enquanto verifica sessão com o servidor
- `logout()` — chama `auth.logout` e redireciona para login

#### `useMobile()` (`client/src/hooks/useMobile.tsx`)
Detecta se o viewport é menor que 768px. Usa `matchMedia` com listener de resize.

#### `useComposition()` (`client/src/hooks/useComposition.ts`)
Trata corretamente eventos de teclado durante composição de caracteres (IME). Necessário para compatibilidade com Safari em idiomas como japonês/chinês.

---

## 8. Camada Compartilhada (`shared/`)

Código TypeScript que é importado tanto pelo frontend (`client/`) quanto pelo backend (`server/`).

### `shared/types.ts`

Re-exporta todos os tipos inferidos do schema Drizzle:

```typescript
export type { User, InsertUser } from "../drizzle/schema";
export type { Salon, InsertSalon } from "../drizzle/schema";
export type { Specialist, InsertSpecialist } from "../drizzle/schema";
// ... todos os tipos das tabelas
```

Isso garante que o mesmo tipo `Appointment` é usado tanto no servidor (ao criar) quanto no cliente (ao exibir).

### `shared/validations.ts`

Schemas Zod compartilhados. O mesmo schema que valida no cliente (formulário) valida no servidor (procedure input):

| Schema | Campos validados |
|--------|-----------------|
| `loginSchema` | email (válido, lowercase), password (6-100 chars) |
| `registerSchema` | email, password (8+ chars, maiúscula/número/especial), name (2-100) |
| `passwordResetRequestSchema` | email válido |
| `passwordResetSchema` | token (10-128), nova password |
| `salonSchema` | name, cnpj, address, phone, email, logo (URL), workingHours |
| `specialistSchema` | name, specialty, photo, email, phone, bio, workingDays, status |
| `scheduleSchema` | timeSlotDuration, bufferTime, workingHours (array de 7 dias obrigatório) |
| `clientSchema` | name, email, phone, birthDate?, notes |
| `serviceSchema` | name, description, duration, price, priceFrom, status, specialistId |
| `appointmentSchema` | clientId, serviceId, specialistId, date, time, status, notes |
| `appointmentPublicSchema` | serviceId, specialistId?, date, time, clientName, clientEmail, clientPhone |

**Proteção contra injeção:** Todos os campos de texto passam pela função `sanitizeString()` que remove tags HTML e scripts (prevenção de XSS).

### `shared/const.ts`

Constantes globais como nomes de cookies, valores padrão e configurações fixas do sistema.

---

## 9. Autenticação e Segurança

### Fluxo de Autenticação

```
1. Usuário envia email + senha para auth.login
2. Servidor verifica hash bcrypt da senha
3. Se válido, gera JWT assinado com JWT_SECRET
4. JWT é armazenado em cookie httpOnly (não acessível por JavaScript)
5. Em cada request, context.ts verifica o cookie e decodifica o JWT
6. Usuário autenticado fica disponível em ctx.user
```

### Medidas de Segurança Implementadas

| Medida | Implementação |
|--------|---------------|
| **Hash de senhas** | bcrypt com salt rounds 10 |
| **Autenticação stateless** | JWT no cookie httpOnly com SameSite=Strict |
| **HTTPS** | Cookie com flag `secure` em produção |
| **Headers de segurança** | Helmet (X-Frame-Options, CSP, HSTS, etc.) |
| **Rate limiting** | 100 requests/15min por IP em `/api/` |
| **Proteção XSS** | `sanitizeString()` em todos os campos de texto |
| **Validação de entrada** | Zod em todas as procedure inputs |
| **Acesso por role** | `protectedProcedure` e `adminProcedure` |
| **Isolamento multi-tenant** | Toda query filtra por `salonId` do usuário logado |
| **Auditoria** | Toda ação CRUD é registrada em `auditLogs` |
| **Sem exposição de senha** | Hash nunca é retornado em nenhuma query |
| **Reset de senha seguro** | Token de uso único com expiração de 1h |

### Controle de Acesso por Papel

```typescript
// Exemplo de isolamento: usuário só vê dados do seu salão
const salon = await getSalonByUserId(ctx.user.id);
const clients = await getClientsBySalonId(salon.id);
// → Impossível acessar dados de outro salão
```

---

## 10. Implantação e Infraestrutura

### Dockerfile (Multi-stage Build)

O processo de build é dividido em duas etapas para minimizar o tamanho da imagem final:

**Estágio 1 — builder:**
1. Usa `node:20-alpine`
2. Instala pnpm via `corepack`
3. Instala todas as dependências (incluindo devDeps)
4. Executa `pnpm build` que:
   - Compila o frontend React (Vite) → `dist/public/`
   - Compila o servidor TypeScript (esbuild) → `dist/index.js`

**Estágio 2 — runner:**
1. Nova imagem limpa `node:20-alpine`
2. Copia apenas: `dist/`, `drizzle/`, arquivos de configuração
3. Instala apenas dependências de produção
4. Expõe porta 3000
5. Executa `node dist/index.js`

**Resultado:** Imagem final ~3x menor por não incluir TypeScript, Vite, devDependencies.

### docker-compose.yml

Orquestra dois serviços:

| Serviço | Imagem | Descrição |
|---------|--------|-----------|
| `app` | Build local | Aplicação Node.js na porta 3000 |
| `db` | postgres:16-alpine | Banco de dados PostgreSQL com volume persistente |

Ambos compartilham a rede interna `app-network`. As variáveis de ambiente são lidas do arquivo `.env`.

---

## 11. Configuração do Ambiente

### Variáveis de Ambiente (`.env`)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | ✅ Sim | String de conexão PostgreSQL: `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | ✅ Sim | Chave secreta para assinar tokens JWT (mínimo 32 chars) |
| `NODE_ENV` | Não | `development` ou `production` (padrão: `development`) |
| `VITE_APP_ID` | Não | ID da aplicação (OAuth) |
| `OAUTH_SERVER_URL` | Não | URL do servidor OAuth para login social |
| `OWNER_OPEN_ID` | Não | ID do usuário proprietário padrão |
| `CLOUDINARY_CLOUD_NAME` | Não | Nome da conta Cloudinary (upload de imagens) |
| `CLOUDINARY_API_KEY` | Não | API Key do Cloudinary |
| `CLOUDINARY_API_SECRET` | Não | API Secret do Cloudinary |

### `drizzle.config.ts`

Configura o **drizzle-kit** (ferramenta de CLI) para:
- Ler o schema de `./drizzle/schema.ts`
- Gerar migrations em `./drizzle/migrations/`
- Conectar ao banco via `DATABASE_URL` ou variáveis `PGHOST`, `PGUSER`, etc.
- Suporte a SSL configurável por variável de ambiente

---

## 12. Scripts e Comandos

```bash
# Desenvolvimento
NODE_ENV=development pnpm dev          # Inicia servidor com hot-reload

# Build de produção
pnpm build                             # Compila frontend + backend

# Produção
pnpm start                             # Inicia servidor compilado

# Banco de dados
pnpm db:push                           # Gera e aplica migrations

# Seed (popular banco com dados de teste)
NODE_ENV=development pnpm tsx drizzle/seed-admin.ts

# Verificação de código
pnpm check                             # Verifica tipos TypeScript
pnpm lint                              # Verifica regras ESLint
pnpm lint:fix                          # Corrige automaticamente
pnpm format                            # Formata com Prettier

# Testes
pnpm test                              # Executa testes com Vitest
```

---

## 13. Funcionalidades do Sistema

### Módulo de Agendamentos

O algoritmo de disponibilidade de horários (`getAvailableTimeSlots`) funciona da seguinte forma:

1. Busca a configuração de agenda do especialista (`specialistSchedules`)
2. Obtém os agendamentos existentes do dia
3. Gera todos os slots possíveis a partir do horário de início até o fim
4. Para cada slot, verifica:
   - Está dentro do horário de trabalho do dia?
   - Está durante o intervalo de almoço?
   - O especialista tem algum agendamento que ocupa esse horário (considerando a duração do serviço + buffer)?
   - Está dentro do período permitido (antecedência mínima / máximo de dias à frente)?
5. Retorna apenas os slots livres

### Dashboard com Cache

A função `getDashboardMetrics()` implementa um **cache em memória** de 10 minutos:
- Se os dados do salão já estão em cache e foram calculados há menos de 10 minutos, retorna imediatamente sem consultar o banco
- Isso reduz drasticamente a carga no banco para o item mais consultado do sistema
- O cache é invalidado automaticamente após 10 minutos ou ao forçar refresh

### Sistema de Auditoria

Toda operação CRUD registra automaticamente um `auditLog` com:
- Quem fez (`userId`)
- Quando (`createdAt`)
- O que mudou (`before` e `after` em JSON)
- IP e User-Agent (`metadata`)
- Salão afetado (`salonId`)

Isso garante rastreabilidade completa para fins de compliance e resolução de conflitos.

### Progressive Web App (PWA)

O sistema é configurado como PWA via `vite-plugin-pwa`:
- Pode ser instalado como app nativo em Android/iOS/Desktop
- Service Worker (`client/src/sw.ts`) faz cache de assets para funcionamento offline
- Manifest com nome, ícones e cores definidos

---

## 14. Fluxo de Dados (Diagrama Lógico)

### Fluxo: Criar Agendamento

```
[Usuário clica em "Novo Agendamento"]
        │
        ▼
[AppointmentModal abre — Passo 1: Data]
        │ CalendarPicker exibe dias com contagem de agendamentos
        ▼
[Passo 2: Cliente + Serviço + Especialista]
        │ Lists carregadas do cache React Query
        ▼
[Passo 3: Horário]
        │ TimeSlotPicker chama appointments.getAvailableSlots
        │ ← Servidor: getAvailableTimeSlots() calcula slots livres
        ▼
[Passo 4: Confirmação]
        │ appointments.create.useMutation()
        │ → Servidor: createAppointment() valida slot, insere no banco
        │ → Servidor: scheduleAppointmentNotifications() agenda notificações
        │ → Servidor: checkWaitlistForSlot() notifica clientes em espera
        │ → Servidor: createAuditLog() registra ação
        │ ← { success: true, appointmentId }
        ▼
[React Query invalida cache de appointments]
        │ Página de agendamentos re-busca a lista atualizada
        ▼
[Toast de sucesso exibido ao usuário]
```

### Fluxo: Conclusão de Agendamento

```
[Usuário clica em "Concluir"]
        │
        ▼
[CompleteAppointmentModal]
        │ Valor pago (R$) + Método de pagamento
        ▼
[appointments.complete.useMutation({ id, paymentMethod, amountPaid })]
        │
        ▼
[Servidor — appointments.complete procedure]
        │ 1. updateAppointment({ status: "completed", paidAmount })
        │ 2. recordAppointmentRevenue() → INSERT em transactions
        │    (type: "income", status: "completed", paymentMethod)
        │ 3. createAuditLog() para o agendamento
        │ 4. createAuditLog() para a transação
        │
        ▼
[Dashboard Cache invalidado na próxima requisição]
[KPIs atualizados na próxima visita ao dashboard]
```

---

*Documentação gerada em Março de 2026 para o projeto System Salon.*  
*Desenvolvido com React, TypeScript, tRPC, Drizzle ORM e PostgreSQL.*
