# BeautySalon Access — Sistema de Gestão para Salões de Beleza

**Projeto Integrado IV (2026.1)** — Faculdade CDL  
**Desenvolvido por:** Ideal Soluções Tecnológicas

[![Node](https://img.shields.io/badge/node-%3E%3D20-blue)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.9-blue)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/react-19-61dafb)](https://react.dev)
[![PWA](https://img.shields.io/badge/PWA-instal%C3%A1vel-purple)](https://web.dev/pwa)
[![Docker](https://img.shields.io/badge/docker-ready-2496ed)](https://docker.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Plataforma fullstack de gestão completa para salões de beleza com agendamento público, controle financeiro, PIX, avaliações, relatórios e acessibilidade em **Libras** para a comunidade surda.

---

## Sumário

1. [Quick Start](#quick-start)
2. [Funcionalidades](#funcionalidades)
3. [Tecnologias](#tecnologias)
4. [Setup Completo](#setup-completo)
5. [Estrutura do Projeto](#estrutura-do-projeto)
6. [Documentação](#documentação)
7. [Segurança](#segurança)
8. [Comandos](#comandos)

---

## Quick Start

### Docker (recomendado)

```bash
git clone https://github.com/GrupoIdeal/system-salon.git
cd system-salon
cp .env.example .env
docker-compose up -d --build
docker exec system-salon-app-1 sh -c "DATABASE_URL=postgres://postgres:postgres@db:5432/salon NODE_ENV=development npx tsx drizzle/seed-admin.ts"
```

Acesse **http://localhost:3000** | Login: `teste@teste.com` / `123123`

### Desenvolvimento local

```bash
git clone https://github.com/GrupoIdeal/system-salon.git
cd system-salon
pnpm install
cp .env.example .env
docker-compose up -d db   # apenas banco
pnpm db:push              # criar tabelas
pnpm db:seed              # popular dados de teste
pnpm dev                  # servidor + frontend
```

---

## Funcionalidades

### Gestão do Salão
- Dashboard com KPIs, gráficos e comparativos mensais
- CRUD completo: clientes, serviços, produtos, especialistas, usuários
- Agendamentos com calendário, slots inteligentes e múltiplas visões (dia/semana/mês)
- Agendamento público sem necessidade de login
- Controle de estoque com alerta de mínimo
- Configuração de horários de trabalho por especialista

### Financeiro
- Registro de transações (receita, despesa, estorno)
- Múltiplos métodos: dinheiro, cartão, PIX, transferência
- **QR Code PIX** no padrão EMV do Banco Central
- Carrinho de produtos no checkout do atendimento
- Comissão por especialista

### Avaliações e Fidelidade
- Token único de avaliação gerado ao concluir atendimento
- Página pública `/avaliar?token=xxx` (1-5 estrelas + comentário)
- Dashboard de avaliações com distribuição por nota
- Pontos de fidelidade acumulados por atendimento

### Acessibilidade (Libras)
- **Central de Libras** (`/ajuda-libras`) com:
  - 27 imagens reais do alfabeto manual (A-Z + Ç)
  - 10 imagens reais dos números (0-9)
  - 10 frases comuns com descrições de movimento
  - 3 vídeos de apoio no YouTube
- Modo de alto contraste (persiste em localStorage)
- Ajuste de tamanho de fonte (+A / -A)
- Navegação por teclado e atributos ARIA
- **PWA instalável** em Android e iOS

### Infraestrutura
- Autenticação JWT + bcrypt
- Trilha de auditoria completa (antes/depois em JSON)
- Rate limiting, Helmet, CORS
- Exportação de relatórios CSV
- Service Worker com 56 assets pre-cacheados (offline)
- Deploy via Docker (multi-stage build)

---

## Tecnologias

### Frontend
| Tech | Versão | Função |
|------|--------|--------|
| React | 19.1 | UI framework |
| TypeScript | 5.9 | Tipagem estática |
| Vite | 7.2 | Bundler |
| Tailwind CSS | 4.1 | Estilização |
| shadcn/ui + Radix | — | Componentes acessíveis |
| Wouter | 3.3 | Roteamento SPA |
| TanStack Query | 5.90 | Cache e estado assíncrono |
| tRPC Client | 11.6 | Chamadas API type-safe |
| Recharts | 2.15 | Gráficos |
| vite-plugin-pwa | 1.2 | Service Worker / PWA |

### Backend
| Tech | Versão | Função |
|------|--------|--------|
| Node.js | 20+ | Runtime |
| Express | 4.21 | Servidor HTTP |
| tRPC Server | 11.6 | Procedures RPC |
| Drizzle ORM | 0.44 | ORM TypeScript |
| PostgreSQL | 16 | Banco de dados |
| bcrypt | 6.0 | Hash de senhas |
| jose | 6.1 | JWT (Web Crypto) |
| Helmet | 8.1 | Headers de segurança |

### DevOps
| Tech | Função |
|------|--------|
| Docker + Compose | Containerização |
| Vitest | Testes unitários |
| Workbox | Cache offline (PWA) |
| Cloudinary | Upload de imagens |

---

## Setup Completo

### Pré-requisitos

| Ferramenta | Versão | Verificar |
|-----------|--------|-----------|
| Node.js | 20+ | `node --version` |
| pnpm | 9+ | `pnpm --version` |
| Docker | qualquer | `docker --version` |
| Git | qualquer | `git --version` |

### 1. Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas configurações. Obrigatórias:
- `DATABASE_URL` — Conexão PostgreSQL
- `JWT_SECRET` — Chave de assinatura JWT (gere com `openssl rand -base64 64`)

### 2. Banco de Dados

```bash
# Subir PostgreSQL (Docker)
docker-compose up -d db

# Criar tabelas
pnpm db:push

# Popular dados de teste
pnpm db:seed
```

### 3. Servidor

```bash
pnpm dev
# Servidor + frontend em http://localhost:3000
```

### 4. Build de Produção

```bash
pnpm build
pnpm start
```

---

## Estrutura do Projeto

```
system-salon/
├── client/                         # Frontend React
│   ├── public/image/libras/        # Imagens do alfabeto/números em Libras
│   └── src/
│       ├── App.tsx                 # Roteamento (17 rotas, lazy loading)
│       ├── main.tsx                # tRPC Client + React Query + render
│       ├── sw.ts                   # Service Worker (Workbox)
│       ├── components/             # Componentes de negócio + ui/ (shadcn)
│       │   ├── DashboardLayout.tsx # Sidebar responsiva com shadcn/ui
│       │   ├── AccessibilityBar.tsx# Fonte + alto contraste
│       │   ├── LibrasHandSigns.tsx # Ilustrações SVG de Libras
│       │   └── ui/                 # 40+ componentes shadcn
│       ├── pages/                  # 17 páginas lazy-loaded
│       │   ├── Login.tsx           # Autenticação
│       │   ├── Dashboard.tsx       # KPIs + gráficos
│       │   ├── Appointments.tsx    # Agendamentos (3 visões)
│       │   ├── AjudaLibras.tsx     # Central de Libras
│       │   ├── PublicBooking.tsx   # Agendamento público
│       │   ├── Rating.tsx          # Avaliação via token
│       │   └── ...                 # Clients, Services, Products, etc.
│       ├── hooks/                  # useAuth, useMobile
│       ├── lib/                    # trpc, auth-utils, format
│       └── contexts/               # ThemeContext (light/dark)
│
├── server/                         # Backend Node.js
│   ├── routers.ts                  # 14 routers tRPC (~100 procedures)
│   ├── db.ts                       # 95 funções de acesso ao banco
│   ├── cloudinary.ts               # Upload de imagens
│   ├── notifications.ts            # Templates de notificações
│   ├── reports.ts                  # Relatórios + exportação CSV
│   └── _core/
│       ├── index.ts                # Express + Helmet + CORS + Rate Limit
│       ├── trpc.ts                 # publicProcedure, protectedProcedure, adminProcedure
│       └── context.ts              # JWT + usuário autenticado
│
├── shared/                         # Código compartilhado
│   ├── types.ts                    # Tipos das entidades e erros
│   ├── validations.ts              # Schemas Zod
│   └── const.ts                    # Constantes
│
├── drizzle/                        # Banco de dados
│   ├── schema.ts                   # 13 tabelas
│   ├── relations.ts                # Relacionamentos
│   └── migrations/                 # Migrações SQL
│
├── docs/                           # Documentação acadêmica
│   ├── 01-processos/               # BPMN, SWOT, Plano
│   ├── 02-requisitos/              # RF (85) + RNF (30)
│   ├── 03-uml/                     # UML + Arquitetura
│   ├── 05-libras/                  # Relatório de Acessibilidade
│   └── 06-topicos-especiais/       # Docker, PIX, PWA
│
├── docker-compose.yml              # App + PostgreSQL
├── Dockerfile                      # Build multi-stage
└── package.json                    # Scripts e dependências
```

---

## Documentação

A documentação completa do projeto está na pasta `docs/`:

| Diretório | Conteúdo |
|-----------|----------|
| `docs/01-processos/` | BPMN dos fluxos, Matriz SWOT, Plano do Projeto |
| `docs/02-requisitos/` | 85 Requisitos Funcionais + 30 Requisitos Não-Funcionais |
| `docs/03-uml/` | Diagramas UML + Documento de Arquitetura |
| `docs/05-libras/` | Relatório de Acessibilidade em Libras |
| `docs/06-topicos-especiais/` | Docker, PIX, PWA |
| `docs/DOCUMENTACAO.md` | Documentação técnica completa |
| `docs/relatorio-abnt.html` | Relatório formatado ABNT |

---

## Segurança

| Camada | Tecnologia |
|--------|-----------|
| Senhas | bcrypt (10 rounds) |
| Sessão | JWT + httpOnly cookie |
| Headers | Helmet (XSS, clickjacking, MIME sniffing) |
| Rate Limit | 100 req/15min (público), 10 tentativas/15min (auth) |
| Validação | Zod em todas as entradas |
| Auditoria | auditLogs com before/after JSON |
| ORM | Drizzle (protege contra SQL injection) |

---

## Comandos

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia servidor + frontend (dev) |
| `pnpm build` | Build de produção (Vite + esbuild) |
| `pnpm start` | Executa build de produção |
| `pnpm db:push` | Gera e aplica migrações |
| `pnpm db:seed` | Popula banco com dados de teste |
| `pnpm check` | Verifica tipos TypeScript |
| `pnpm test` | Executa testes (Vitest) |
| `pnpm lint` | Lint (ESLint) |
| `pnpm format` | Formata código (Prettier) |

### Docker

| Comando | Descrição |
|---------|-----------|
| `docker-compose up -d` | Sobe tudo (app + db) |
| `docker-compose up -d db` | Sobe apenas PostgreSQL |
| `docker-compose logs -f app` | Logs do servidor |
| `docker-compose down` | Para containers |

---

## Licença

MIT

---

**Desenvolvido por Ideal Soluções Tecnológicas** — Projeto Integrado IV (2026.1)
