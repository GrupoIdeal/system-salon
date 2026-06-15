# Documento de Arquitetura — BeautySalon Access

**Projeto:** Projeto Integrado IV (2026.1)  
**Sistema:** BeautySalon Access — Sistema de Gestão para Salão de Beleza  
**Versão:** 2.0  
**Data:** 15 de junho de 2026

---

## 1. Visão Arquitetural

### 1.1 Tipo de Arquitetura

O BeautySalon Access adota uma arquitetura **monolito fullstack** com separação lógica em camadas. O mesmo processo Node.js serve tanto a API quanto o frontend, simplificando o deploy e eliminando a complexidade de CORS e comunicação entre serviços separados.

```
┌─────────────────────────────────────────────────────────────┐
│                    NAVEGADOR (Browser)                       │
│                                                             │
│  React SPA (Vite) + PWA (Service Worker)                    │
│  ┌─────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │   Páginas   │  │  Componentes  │  │    Contextos     │  │
│  │  (lazy      │  │  (negócio +   │  │  (Auth, Theme)   │  │
│  │   loaded)   │  │   shadcn/ui)  │  │                  │  │
│  └──────┬──────┘  └───────┬───────┘  └──────────────────┘  │
│         │                 │                                  │
│  ┌──────▼─────────────────▼────────────────────────────┐    │
│  │   tRPC Client + React Query (cache 5min, retry 1)   │    │
│  │   Service Worker (Workbox, precache 56 assets)      │    │
│  └─────────────────────────┬────────────────────────────┘    │
└────────────────────────────│────────────────────────────────┘
                             │ HTTP POST (JSON/superjson)
                             │ /api/trpc/{procedure}?batch=1
┌────────────────────────────▼────────────────────────────────┐
│                SERVIDOR (Node.js + Express)                   │
│                                                             │
│  Middlewares: Helmet → CORS → Rate Limiter → JSON Parser    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                 tRPC Router (14 namespaces)           │   │
│  │  auth | salon | specialists | clients | services     │   │
│  │  appointments | products | ratings | users | audit   │   │
│  │  dashboard | reports | schedule | notifications     │   │
│  └─────────────────────────┬────────────────────────────┘   │
│                            │                                  │
│  ┌─────────────────────────▼────────────────────────────┐   │
│  │         server/db.ts (Drizzle ORM + PostgreSQL)       │   │
│  │  95 funções de acesso a dados tipadas                 │   │
│  │  Índices compostos para queries de alta frequência    │   │
│  └─────────────────────────┬────────────────────────────┘   │
└────────────────────────────│────────────────────────────────┘
                             │ SQL (TCP)
┌────────────────────────────▼────────────────────────────────┐
│                    PostgreSQL 16                              │
│                                                             │
│  users | salons | specialists | clients | services          │
│  appointments | transactions | products | appointmentProducts│
│  specialistSchedules | ratings | passwordResets | auditLogs │
│                                                             │
│  Índices compostos em: appointments(salonId, date),         │
│  transactions(salonId, date)                                │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Padrão de Comunicação: tRPC

Em vez de API REST tradicional, o projeto utiliza **tRPC (TypeScript Remote Procedure Call)**, que elimina a necessidade de definir contratos manualmente:

1. Servidor define procedures TypeScript em `server/routers.ts`
2. Cliente importa o tipo `AppRouter` diretamente do servidor
3. tRPC gera automaticamente um cliente totalmente tipado
4. Chamadas são serializadas via HTTP POST para `/api/trpc/{procedure}`

**Vantagem:** Alterar o tipo de retorno no servidor gera erro de compilação imediato no cliente — segurança de tipos ponta a ponta.

---

## 2. Stack Tecnológica

### 2.1 Frontend

| Tecnologia | Versão | Função |
|-----------|--------|--------|
| React | 19.1 | Framework UI com Server Components |
| TypeScript | 5.9 | Tipagem estática |
| Vite | 7.2 | Bundler com HMR instantâneo |
| Tailwind CSS | 4.1 | CSS utilitário com JIT |
| shadcn/ui + Radix UI | — | Componentes acessíveis e headless |
| Wouter | 3.3 | Roteamento SPA (2KB vs 47KB do React Router) |
| TanStack Query | 5.90 | Cache e estado assíncrono com staleTime 5min |
| tRPC Client | 11.6 | Chamadas RPC tipadas |
| Recharts | 2.15 | Gráficos interativos |
| Framer Motion | 12.23 | Animações fluidas |
| date-fns | 4.1 | Manipulação de datas (tree-shakeable) |
| vite-plugin-pwa | 1.2 | Service Worker, cache offline, PWA manifesto |

### 2.2 Backend

| Tecnologia | Versão | Função |
|-----------|--------|--------|
| Node.js | 20+ | Runtime JavaScript |
| Express | 4.21 | Servidor HTTP |
| tRPC Server | 11.6 | Procedures RPC com middlewares |
| Drizzle ORM | 0.44 | ORM TypeScript-first com migrations |
| PostgreSQL | 16 | Banco relacional com suporte JSONB |
| bcrypt | 6.0 | Hash de senhas (10 rounds) |
| jose | 6.1 | JWT criação/validação (Web Crypto API) |
| Helmet | 8.1 | Headers de segurança HTTP |
| express-rate-limit | 8.2 | Proteção contra abuso |
| Cloudinary | 2.8 | Upload de imagens na nuvem |
| superjson | 1.13 | Serialização de Date, Decimal, Map |

### 2.3 Infraestrutura

| Tecnologia | Função |
|-----------|--------|
| Docker | Containerização multi-stage (build + runtime) |
| docker-compose | Orquestração local (app + PostgreSQL) |
| pnpm | Gerenciador de pacotes com workspace |
| Vitest | Testes unitários |
| Workbox | Precaching e estratégias de cache offline |

---

## 3. Estrutura do Projeto

```
system-salon/
├── client/                     # Frontend React
│   ├── index.html              # Entry point HTML com meta tags PWA
│   ├── public/image/           # Assets estáticos (logo, favicon, libras/)
│   └── src/
│       ├── main.tsx            # Inicialização: QueryClient + tRPC + render
│       ├── App.tsx             # Roteamento com lazy loading (17 rotas)
│       ├── sw.ts               # Service Worker (Workbox + precaching)
│       ├── _core/hooks/        # useAuth (autenticação global)
│       ├── components/         # Componentes de negócio + ui/ (shadcn)
│       ├── contexts/           # ThemeContext (light/dark)
│       ├── hooks/              # useMobile, usePushNotifications
│       ├── lib/                # trpc client, auth-utils, capacitor, format
│       └── pages/              # 17 páginas com lazy loading
│
├── server/                     # Backend Node.js
│   ├── routers.ts              # 14 routers tRPC (~100 procedures)
│   ├── db.ts                   # 95 funções de acesso ao banco
│   ├── schema.ts               # 13 tabelas + índices
│   ├── cloudinary.ts           # Upload de imagens
│   ├── notifications.ts        # Templates e envio de notificações
│   ├── reports.ts              # Relatórios avançados + CSV
│   ├── waitlist.ts             # Lista de espera em memória
│   └── _core/                  # Infraestrutura do servidor
│       ├── index.ts            # Express + tRPC + Helmet + CORS
│       ├── trpc.ts             # publicProcedure, protectedProcedure, adminProcedure
│       ├── context.ts          # Extrai JWT, busca usuário
│       ├── oauth.ts            # Integração OAuth
│       └── vite.ts             # Serve frontend em dev + SPA fallback
│
├── shared/                     # Código compartilhado
│   ├── types.ts                # Tipos de entidades, erros, enums
│   ├── validations.ts          # Schemas Zod (login, cliente, agendamento...)
│   └── const.ts                # Constantes (cookie names, mensagens de erro)
│
├── drizzle/                    # Banco de dados
│   ├── schema.ts               # Definição das 13 tabelas
│   ├── relations.ts            # Relacionamentos (JOINs)
│   ├── seed-admin.ts           # Popula dados de teste
│   └── migrations/             # Migrações SQL geradas automaticamente
│
├── docs/                       # Documentação acadêmica
├── docker-compose.yml          # PostgreSQL + app
├── Dockerfile                  # Build multi-stage
├── vite.config.ts              # Vite + PWA + aliases + proxy
└── package.json                # Scripts, dependências
```

---

## 4. Modelo de Dados

### 4.1 Diagrama Entidade-Relacionamento

```
users ──────────────── salons
  │                      │
  │                      ├──── specialists ──── specialistSchedules
  │                      │          │
  │                      ├──── clients          │
  │                      │                      │
  │                      ├──── services ─────── │
  │                      │                      │
  │                      ├──── products ─────── │
  │                      │          │           │
  │                      │    appointmentProducts
  │                      │          │
  │                      └──── appointments ────┤
  │                               │
  │                               ├──── transactions
  │                               └──── ratings
  │
  └──── passwordResets
  └──── auditLogs (+ salonId)
```

### 4.2 Tabelas (13 no total)

| Tabela | Linhas (dev) | Descrição |
|--------|-------------|-----------|
| users | ~5 | Usuários do sistema (admin/user) |
| salons | 1 | Dados do salão |
| specialists | ~5 | Profissionais com especialidades |
| specialistSchedules | ~5 | Horários de trabalho por dia |
| clients | ~20 | Clientes cadastrados |
| services | ~8 | Catálogo de serviços |
| products | ~10 | Estoque com alerta de mínimo |
| appointments | ~50 | Agendamentos (4 status) |
| appointmentProducts | — | Produtos vendidos por atendimento |
| transactions | ~30 | Financeiro (income/expense/refund) |
| ratings | — | Avaliações pós-atendimento (token único) |
| passwordResets | — | Tokens de reset de senha |
| auditLogs | ~200 | Trilha de auditoria completa |

---

## 5. Fluxos Principais

### 5.1 Fluxo de Agendamento

```
Admin/Cliente → Seleciona data → Seleciona serviço + especialista
  → Sistema calcula slots livres (duração + buffer + horários de trabalho)
  → Exibe apenas horários disponíveis → Confirma agendamento
  → Cria registro + notificações (24h/2h antes) + verifica waitlist
```

### 5.2 Fluxo de Checkout (Conclusão de Atendimento)

```
Atendimento concluído → Modal de checkout:
  1. Valor do serviço (pré-preenchido)
  2. Busca e adiciona produtos (decrementa estoque)
  3. Seleciona método de pagamento
  4. Se PIX → gera QR Code EMV
  5. Confirma pagamento →
     - Cria transação (income)
     - Decrementa estoque dos produtos
     - Acumula pontos de fidelidade
     - Gera token de avaliação único
     - Exibe link para compartilhar
```

### 5.3 Fluxo de Avaliação

```
Atendimento concluído → Token gerado (UUID único) →
  Link /avaliar?token=xxx compartilhado com cliente →
  Cliente acessa → Sistema valida token (não usado, existe) →
  Cliente seleciona 1-5 estrelas + comentário opcional →
  Sistema marca token como usado, salva nota e data
```

---

## 6. Decisões de Arquitetura

### 6.1 Por que tRPC em vez de REST?

| Critério | REST | tRPC |
|---------|------|------|
| Type safety ponta a ponta | ❌ Manual | ✅ Automático |
| Geração de código | ❌ Necessária | ✅ Desnecessária |
| Documentação de API | ❌ Swagger/OpenAPI | ✅ Tipos = documentação |
| Validação de entrada | ❌ Separada | ✅ Zod integrado |
| Performance (batching) | ❌ Múltiplos requests | ✅ Batch automático |

### 6.2 Por que Drizzle em vez de Prisma?

| Critério | Prisma | Drizzle |
|---------|--------|---------|
| Peso do cliente | ~6MB | ~300KB |
| Performance (cold start) | Lento (engine binária) | Rápido (SQL direto) |
| SQL-like queries | Própria sintaxe | SQL familiar |
| Migrations | Prisma Migrate | drizzle-kit |
| Bundle serverless | ❌ Pesado | ✅ Leve |

### 6.3 Por que PWA em vez de App Nativo?

- **Código único** para web + mobile (sem duplicação)
- Instalável como app nativo (Add to Home Screen)
- **Offline-first** com Service Worker (56 assets pre-cacheados)
- Sem necessidade de aprovação em lojas (Google Play/App Store)
- Atualizações instantâneas (sem deploy na loja)
- Stack simplificada (React + Vite + Workbox)

### 6.4 Por que Monolito em vez de Microsserviços?

- Projeto de escopo acadêmico — complexidade de microsserviços não se justifica
- Deploy simplificado (um container Docker)
- Comunicação interna sem latência de rede
- TypeScript garante consistência entre camadas
- Se necessário escalar, migrar para microsserviços é possível no futuro

---

## 7. Segurança

### 7.1 Camadas de Proteção

| Camada | Tecnologia | O que protege |
|--------|-----------|---------------|
| Senhas | bcrypt (10 rounds) | Vazamento de banco de dados |
| Sessão | JWT + httpOnly cookie | Roubo de token via XSS |
| Headers | Helmet | XSS, clickjacking, MIME sniffing |
| Rate Limiting | express-rate-limit | Força bruta, DDoS básico |
| Entrada | Zod + sanitização | SQL injection, XSS |
| Transporte | HTTPS (produção) | Interceptação de rede |
| Auditoria | auditLogs (before/after JSON) | Rastreabilidade de ações |

### 7.2 Tratamento de Erros

- Erros de autenticação: mensagem genérica "Credenciais inválidas" (sem revelar se email existe)
- Erros de recuperação de senha: sempre exibe "Email enviado" (não revela existência)
- Tokens expirados: redirecionamento automático para login
- Erros inesperados: ErrorBoundary com fallback UI e opção de reload

---

## 8. Infraestrutura de Deploy

### 8.1 Docker

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment: DATABASE_URL, JWT_SECRET, etc.
    depends_on: [db]

  db:
    image: postgres:16
    volumes: [pgdata:/var/lib/postgresql/data]
```

### 8.2 Dockerfile (multi-stage)

```
Stage 1 (build): pnpm install → vite build → esbuild server
Stage 2 (runtime): node:20-alpine → copia dist/ → node dist/index.js
```

---

## 9. Métricas do Sistema

| Métrica | Valor |
|---------|-------|
| Tabelas no banco | 13 |
| Procedures tRPC | ~100 |
| Funções de acesso ao banco | 95 |
| Páginas React (lazy loaded) | 17 |
| Assets pre-cacheados (PWA) | 56 |
| Tamanho do bundle principal (gzip) | 186 KB |
| Tempo de build (Vite) | ~16s |
| Índices compostos | 2 (appointments, transactions) |
| Cache de dashboard | 10 min (em memória) |
| Cache React Query | 5 min (staleTime) |
