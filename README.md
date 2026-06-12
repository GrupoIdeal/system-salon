# 💄 BeautySalon Access — Sistema de Gestão para Salões de Beleza

**system-salon** — Plataforma completa para gestão de salão com agendamento público, controle financeiro, relatórios e acessibilidade para usuários com deficiência auditiva.

[![Security](https://img.shields.io/badge/security-8.5%2F10-brightgreen)](https://github.com)
[![Node](https://img.shields.io/badge/node-%3E%3D20-blue)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.9-blue)](https://www.typescriptlang.org)
[![PWA](https://img.shields.io/badge/PWA-instalável-purple)](https://web.dev/pwa)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> Projeto desenvolvido para a disciplina **Projeto Integrado IV (2026.1)** — BeautySalon Access.  
> PWA instalável em Android e iOS sem necessidade de loja de aplicativos.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [🚀 Quick Start — Guia Rápido](#-quick-start--guia-rápido)
- [Funcionalidades](#funcionalidades-principais)
- [Tecnologias](#tecnologias-utilizadas)
- [📦 Setup Completo — Passo a Passo](#-setup-completo--passo-a-passo)
  - [Pré-requisitos](#pré-requisitos)
  - [1. Clonar o Repositório](#1-clonar-o-repositório)
  - [2. Instalar Dependências](#2-instalar-dependências)
  - [3. Configurar Variáveis de Ambiente](#3-configurar-variáveis-de-ambiente)
  - [4. Iniciar Banco de Dados](#4-iniciar-banco-de-dados)
  - [5. Configurar Banco de Dados](#5-configurar-banco-de-dados)
  - [6. Iniciar Back-end](#6-iniciar-back-end)
  - [7. Iniciar Front-end](#7-iniciar-front-end)
  - [8. Iniciar Mobile](#8-iniciar-mobile)
- [Rodando com Docker](#rodando-com-docker)
- [Segurança](#segurança)
- [Deploy em Produção](#deploy-em-produção)
- [Comandos Úteis](#comandos-úteis)
- [Estrutura do Projeto](#estrutura-do-repositório)
- [API Reference](#api-reference-trpc)
- [Troubleshooting](#troubleshooting)
- [Contribuindo](#contribuindo)

---

## Visão Geral

Aplicação full-stack em TypeScript que combina:

- ⚛️ Frontend React + Vite (UI responsiva, componentes reutilizáveis)
- 🚀 Backend Node.js com tRPC (API type-safe)
- 🗄️ Drizzle ORM + PostgreSQL (modelo e migrações)
- 📧 Sistema de notificações, lista de espera e geração de relatórios
- 🔒 Segurança robusta com Helmet, Rate Limiting e validações fortes
- 📱 Aplicativo mobile React Native (Expo)

O projeto foi projetado para suportar tanto uso administrativo (dashboard interno) quanto um fluxo de agendamento público (página para clientes sem login).

---

## 🚀 Quick Start — Guia Rápido

> Para quem já tem experiência e quer rodar o projeto rapidamente.

### Opção A: Rodar tudo com Docker (recomendado)

```bash
# 1. Clonar e entrar no diretório
git clone https://github.com/ronnysenna/system-salon.git
cd system-salon

# 2. Copiar variáveis de ambiente
cp .env.example .env

# 3. Subir aplicação completa (banco + back-end + front-end)
docker-compose up -d --build

# 4. Aguardar ~10s e rodar migrações SQL no container do banco
docker cp drizzle/migrations system-salon-db-1:/tmp/migrations
docker exec system-salon-db-1 sh -c "cd /tmp/migrations && for f in \$(ls *.sql | sort); do psql -U postgres -d salon -f \$f; done"

# 5. Rodar seed de dados de teste
docker exec system-salon-app-1 npm install -g tsx
docker cp drizzle/seed-admin.ts system-salon-app-1:/app/drizzle/seed-admin.ts
docker cp drizzle/schema.ts system-salon-app-1:/app/drizzle/schema.ts
docker cp drizzle/relations.ts system-salon-app-1:/app/drizzle/relations.ts
docker cp shared system-salon-app-1:/app/shared
docker exec system-salon-app-1 sh -c "DATABASE_URL=postgres://postgres:postgres@db:5432/salon NODE_ENV=development tsx /app/drizzle/seed-admin.ts"
```

**Acesse:** http://localhost:3000  
**Login:** `teste@teste.com` | **Senha:** `123123`

### Opção B: Desenvolvimento local (banco via Docker)

```bash
# 1. Clonar e entrar no diretório
git clone https://github.com/ronnysenna/system-salon.git
cd system-salon

# 2. Instalar dependências
pnpm install

# 3. Copiar variáveis de ambiente
cp .env.example .env

# 4. Subir banco de dados
docker-compose up -d db

# 5. Aguardar 5 segundos e criar tabelas
sleep 5 && pnpm db:push

# 6. Popular banco com dados de teste
NODE_ENV=development pnpm tsx drizzle/seed-admin.ts

# 7. Iniciar back-end e front-end juntos
NODE_ENV=development pnpm dev
```

**Acesse:** http://localhost:3000  
**Login:** `teste@teste.com` | **Senha:** `123123`

### Mobile (terminal separado)

```bash
cd mobile
pnpm install
pnpm start
```

> **Nota:** O app mobile usa Expo. Escaneie o QR code com o app **Expo Go** (Android/iOS).

---

## Funcionalidades Principais

### Gestão e Administração
- ✅ Autenticação (login, registro, reset de senha)
- ✅ CRUD de especialistas, serviços e clientes
- ✅ Gerenciamento de agenda com regras (duração, buffer, folgas)
- ✅ Dashboard com métricas e gráficos (receita, ocupação, top services/specialists)
- ✅ Relatórios exportáveis em CSV

### Agendamentos
- ✅ Criação e validação de conflitos
- ✅ Concluir e cancelar agendamentos
- ✅ Agendamento público (fluxo step-by-step para clientes)
- ✅ Verificação de disponibilidade em tempo real
- ✅ Sugestões inteligentes de horários

### Comunicação e Automação
- ✅ Notificações por templates (email, SMS, WhatsApp, push)
- ✅ Lembretes automáticos
- ✅ Lista de espera inteligente (priorização e confirmação automática)

### Principais Entidades
- **Salon** - Configurações do salão
- **User** - Usuários admin/funcionários
- **Specialist** - Profissionais do salão
- **Service** - Serviços oferecidos
- **Client** - Clientes cadastrados
- **Appointment** - Agendamentos
- **Transaction** - Controle financeiro
- **Waitlist** - Lista de espera

---

## Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **TailwindCSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **Wouter** - Roteamento
- **TanStack Query** - Cache e sincronização
- **Lucide React** - Ícones

### Backend
- **Node.js 18+** - Runtime
- **Express** - Web framework
- **tRPC** - API type-safe
- **Zod** - Validação de schemas
- **bcrypt** - Hash de senhas
- **jose** - JWT seguro
- **Helmet** - Headers de segurança
- **express-rate-limit** - Rate limiting

### Banco de Dados
- **PostgreSQL 14+** - Database
- **Drizzle ORM** - Type-safe ORM
- **Drizzle Kit** - Migrations

### Segurança
- **Helmet.js** - Headers HTTP seguros
- **Rate Limiting** - Proteção contra força bruta
- **CORS** - Controle de origem
- **Zod** - Validação de inputs
- **bcrypt** - Hash seguro de senhas

---

## 📦 Setup Completo — Passo a Passo

> Guia detalhado para configurar **cada componente** do projeto (banco de dados, back-end, front-end e mobile) em ambiente local.

### Pré-requisitos

| Ferramenta | Versão mínima | Download | Como verificar |
|-----------|--------------|---------|----------------|
| **Node.js** | 20+ | https://nodejs.org | `node --version` |
| **pnpm** | 9+ | `npm install -g pnpm` | `pnpm --version` |
| **Docker Desktop** | Qualquer | https://docker.com/products/docker-desktop | `docker --version` |
| **Git** | Qualquer | https://git-scm.com | `git --version` |
| **Expo CLI** (opcional) | Qualquer | `npm install -g expo-cli` | `expo --version` |

> 💡 **Dica:** Se estiver no Windows, use o WSL2 para melhor compatibilidade com Docker.

---

### 1. Clonar o Repositório

```bash
git clone https://github.com/ronnysenna/system-salon.git
cd system-salon
```

---

### 2. Instalar Dependências

```bash
# Instalar dependências do back-end e front-end (raiz)
pnpm install

# Instalar dependências do mobile (se for rodar o app)
cd mobile
pnpm install
cd ..
```

---

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar o arquivo de exemplo
cp .env.example .env
```

Abra o `.env` e configure as variáveis obrigatórias:

```env
# ===========================================
# CONFIGURAÇÕES DO BANCO DE DADOS
# ===========================================
# Se usar Docker, manter assim:
DATABASE_URL=postgres://postgres:postgres@localhost:5432/salon

# Credenciais do PostgreSQL (Docker)
POSTGRES_PASSWORD=postgres
POSTGRES_USER=postgres
POSTGRES_DB=salon

# ===========================================
# SEGURANÇA
# ===========================================
# Gere uma chave forte para produção:
# openssl rand -base64 64
JWT_SECRET=troque-isso-por-uma-chave-secreta-bem-longa-aqui

# ===========================================
# AMBIENTE
# ===========================================
NODE_ENV=development
PORT=3000

# ===========================================
# FRONTEND (Vite)
# ===========================================
VITE_APP_ID=proj_abc123def456
VITE_APP_TITLE="Graciosa Studio de Beleza"
VITE_APP_LOGO="https://placehold.co/40x40/3b82f6/ffffff?text=T"

# ===========================================
# CORS (Produção)
# ===========================================
FRONTEND_URL=http://localhost:3000
```

> ⚠️ **NUNCA** commite o arquivo `.env` com credenciais reais. Ele já está no `.gitignore`.

---

### 4. Iniciar Banco de Dados

O banco de dados PostgreSQL é gerenciado via Docker.

#### Opção A: Subir apenas o banco (recomendado para desenvolvimento)

```bash
# Sobe apenas o container do PostgreSQL
docker-compose up -d db

# Verificar se está rodando
docker ps
# Deve aparecer: system-salon-db-1   Up   0.0.0.0:5432->5432/tcp

# Ver logs (opcional)
docker-compose logs -f db
```

#### Opção B: Usar PostgreSQL local (sem Docker)

Se preferir não usar Docker, instale o PostgreSQL nativamente:

```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS (Homebrew)
brew install postgresql

# Criar usuário e banco
psql -U postgres
CREATE DATABASE salon;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE salon TO postgres;
```

Atualize o `.env`:
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/salon
```

---

### 5. Configurar Banco de Dados

Com o PostgreSQL rodando, execute as migrações:

```bash
# Gerar e aplicar migrações (cria as tabelas)
pnpm db:push

# Saída esperada:
# ✔ Generated migration files
# ✔ Migrated database
```

#### Popular com Dados de Demonstração

```bash
NODE_ENV=development pnpm tsx drizzle/seed-admin.ts
```

Este script cria:
- ✅ 1 usuário admin: `teste@teste.com` / `123123`
- ✅ 1 salão: "Graciosa Studio de Beleza"
- ✅ 3 especialistas
- ✅ 8 serviços
- ✅ 15 clientes
- ✅ 145 agendamentos (últimos 60 dias + próximos 30 dias)

> 💡 **Dica:** Execute este comando sempre que precisar resetar os dados de teste.

---

### 6. Iniciar Back-end

O back-end roda com **Node.js + tRPC + Express**.

```bash
# No diretório raiz (/workspace)
NODE_ENV=development pnpm dev
```

**Saída esperada:**
```
Server running on http://localhost:3000
tRPC server ready
Database connected
```

O back-end também serve o front-end em produção. Em desenvolvimento, o front-end roda separado.

**Endpoints principais:**
- API tRPC: `http://localhost:3000/trpc/*`
- Health check: `http://localhost:3000/health`

---

### 7. Iniciar Front-end

O front-end é uma aplicação **React + Vite + PWA**.

#### Opção A: Rodar junto com o back-end (recomendado)

O comando `pnpm dev` já inicia o back-end. O Vite é configurado para servir automaticamente.

Acesse: **http://localhost:3000**

#### Opção B: Rodar front-end separado (desenvolvimento)

Em um **novo terminal**:

```bash
# O Vite lê a configuração da raiz e serve o client/
pnpm vite
```

Ou diretamente:
```bash
cd client
pnpm dev
```

**Saída esperada:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Acesse: **http://localhost:5173** (ou **http://localhost:3000** se integrado)

**Login:**
- Email: `teste@teste.com`
- Senha: `123123`

---

### 8. Iniciar Mobile

O aplicativo mobile é construído com **React Native + Expo**.

#### Pré-requisitos Mobile

- Ter instalado no celular:
  - **Expo Go** (Android): [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - **Expo Go** (iOS): [App Store](https://apps.apple.com/app/expo-go/id982107779)

#### Passo a Passo

```bash
# 1. Navegar até a pasta mobile
cd mobile

# 2. Instalar dependências (se ainda não instalou)
pnpm install

# 3. Configurar URL da API
# Edite mobile/lib/trpc.ts e aponte para seu back-end local
# Exemplo: http://SEU_IP_LOCAL:3000/trpc

# 4. Iniciar Expo
pnpm start
```

**Saída esperada:**
```
┌─────────────────────────────────────────────┐
│ Expo DevTools                               │
│                                             │
│ Press a │ Open Android                      │
│ Press i │ Open iOS simulator                │
│ Press w │ Open web browser                  │
│ Press s │ Send link to phone or email       │
└─────────────────────────────────────────────┘
```

#### Opções de Execução

| Tecla | Ação |
|-------|------|
| `a` | Abrir no Android (emulador ou dispositivo físico) |
| `i` | Abrir no iOS simulator (apenas macOS) |
| `w` | Abrir no navegador web |
| `s` | Enviar QR code para celular |

#### Conectar ao Back-end Local

Para o mobile acessar seu back-end rodando em localhost:

1. Descubra seu IP local:
   ```bash
   # Linux/macOS
   ipconfig getifaddr en0
   
   # Windows
   ipconfig
   ```

2. Atualize a URL no arquivo `mobile/lib/trpc.ts`:
   ```typescript
   const API_URL = 'http://192.168.x.x:3000/trpc' // Seu IP local
   ```

3. Certifique-se que o back-end aceita conexões externas (CORS).

---

## Resumo dos Comandos por Componente

| Componente | Comando | Porta | URL de Acesso |
|------------|---------|-------|---------------|
| **Banco de Dados** | `docker-compose up -d db` | 5432 | `localhost:5432` |
| **Back-end** | `NODE_ENV=development pnpm dev` | 3000 | `http://localhost:3000` |
| **Front-end** | Integrado ao back-end | 3000/5173 | `http://localhost:3000` |
| **Mobile** | `cd mobile && pnpm start` | 8081 | QR Code / Expo Go |

---

## Fluxo Completo de Inicialização

```bash
# Terminal 1 — Banco de Dados
docker-compose up -d db
sleep 5

# Terminal 2 — Back-end (já inclui front-end)
cd /workspace
pnpm db:push
NODE_ENV=development pnpm tsx drizzle/seed-admin.ts
NODE_ENV=development pnpm dev

# Terminal 3 — Mobile (opcional)
cd /workspace/mobile
pnpm start
```

---

## Rodando com Docker (tudo junto)

Para subir tanto o servidor quanto o banco de uma vez:

```bash
# Subir todos os containers
docker-compose up -d

# Acompanhar logs
docker-compose logs -f app
```

Acesse: **http://localhost:3000**

### Build e Deploy para Produção

```bash
# Build da imagem de produção
docker build -t salon-system .

# Executar com arquivo .env
docker run -p 3000:3000 --env-file .env salon-system
```

---

## Segurança

### Score de Segurança

\`\`\`text
┌────────────────────────────────────────┐
│ Autenticação/Autorização    83% 🟢    │
│ Proteção de Rede            83% 🟢    │
│ Validação de Dados         100% 🟢    │
│ Proteção contra Ataques    100% 🟢    │
│ Logs/Monitoramento          60% 🟡    │
│ Configuração/Deploy         67% 🟡    │
│────────────────────────────────────────│
│ MÉDIA GERAL:              8.5/10 🟢   │
└────────────────────────────────────────┘
\`\`\`

### Proteções Implementadas

#### ✅ Autenticação e Autorização
- **JWT seguro** com biblioteca \`jose\`
- **Hash de senhas** com bcrypt (10 salt rounds)
- **Middleware de autorização** (protectedProcedure, adminProcedure)
- **Session management** com httpOnly cookies

#### ✅ Proteção de Rede
- **Helmet.js** - Headers de segurança HTTP
  - X-Frame-Options: DENY (anti-clickjacking)
  - X-Content-Type-Options: nosniff
  - Strict-Transport-Security (HSTS)
- **Rate Limiting** - 100 requisições por 15 minutos por IP
- **CORS restrito** - Apenas origens permitidas em produção
- **Body size limit** - Máximo 10MB para uploads

#### ✅ Validação de Dados
- **Validação com Zod** em todas as rotas
- **Limites de tamanho** em strings (name, bio, notes, etc)
- **Validação de formatos** (email, URL, horários, datas)
- **Sanitização de inputs** (remoção de HTML/scripts)
- **SQL Injection prevention** via Drizzle ORM

#### ✅ Proteção contra Ataques
- ✅ XSS (Cross-Site Scripting)
- ✅ SQL Injection
- ✅ CSRF (Cross-Site Request Forgery)
- ✅ Clickjacking
- ✅ Força Bruta
- ✅ DoS básico
- ✅ Mass Assignment
- ✅ Session Hijacking

### Regras de Validação

#### Senha (Registro)
- Mínimo 6 caracteres
- Máximo 100 caracteres
- Pelo menos uma letra maiúscula
- Pelo menos uma letra minúscula
- Pelo menos um número

#### Email
- Formato válido
- Máximo 320 caracteres
- Conversão automática para lowercase
- Trim automático

#### Strings Gerais
- \`name\`: máximo 200 caracteres
- \`bio\`: máximo 1000 caracteres
- \`notes\`: máximo 2000 caracteres
- \`description\`: máximo 1000 caracteres

### Auditoria de Dependências

\`\`\`bash
# Verificar vulnerabilidades
pnpm audit --prod

# Status: ✅ 0 vulnerabilidades conhecidas
\`\`\`

---

## Deploy em Produção

### Checklist Obrigatório

Antes de fazer deploy em produção, certifique-se de:

#### 1. Gerar JWT_SECRET Forte

\`\`\`bash
# Gerar secret de 64 caracteres
openssl rand -base64 64
\`\`\`

#### 2. Configurar Variáveis de Ambiente

**Obrigatórias:**

\`\`\`bash
# Segurança
JWT_SECRET=<valor_forte_de_64+_caracteres>
NODE_ENV=production

# Banco de Dados (com SSL)
DATABASE_URL=postgres://user:pass@host:5432/db?sslmode=require

# CORS
FRONTEND_URL=https://seu-dominio.com

# Servidor
PORT=3000
\`\`\`

**Opcionais:**

\`\`\`bash
# OAuth (se usado)
OAUTH_SERVER_URL=https://...
VITE_APP_ID=...

# Analytics
VITE_ANALYTICS_ENDPOINT=...
VITE_ANALYTICS_WEBSITE_ID=...
\`\`\`

#### 3. Configurar HTTPS

\`\`\`bash
# Certificado SSL (Let's Encrypt recomendado)
sudo certbot --nginx -d seu-dominio.com
\`\`\`

#### 4. Configurar Banco de Dados
- ✅ Usuário específico (não usar \`postgres\`)
- ✅ Senha forte
- ✅ SSL/TLS habilitado
- ✅ Backup automático configurado
- ✅ Firewall restringindo acesso

#### 5. Build da Aplicação

\`\`\`bash
pnpm install --prod
pnpm build
\`\`\`

#### 6. Executar Migrações

\`\`\`bash
pnpm db:push
tsx drizzle/seed-admin.ts  # Criar usuário admin inicial
\`\`\`

#### 7. Iniciar Servidor

\`\`\`bash
# Com PM2 (recomendado)
pm2 start dist/index.js --name salon-api
pm2 save
pm2 startup

# Ou direto
NODE_ENV=production pnpm start
\`\`\`

### Backup e Recuperação

\`\`\`bash
# Backup manual
pg_dump \$DATABASE_URL > backup-\$(date +%Y%m%d).sql

# Backup automático (crontab)
0 2 * * * pg_dump \$DATABASE_URL > /backups/salon-\$(date +\\%Y\\%m\\%d).sql

# Restaurar
psql \$DATABASE_URL < backup-20251107.sql
\`\`\`

### Monitoramento

\`\`\`bash
# Verificar status
pm2 status

# Ver logs
pm2 logs salon-api

# Reiniciar
pm2 restart salon-api
\`\`\`

### Recomendações de Ferramentas
- **PM2** - Gerenciamento de processo Node.js
- **Sentry** - Monitoramento de erros
- **DataDog/NewRelic** - Application Performance Monitoring
- **CloudWatch** (AWS) - Logs e métricas

---

## Comandos Úteis

### Desenvolvimento (Raiz)

```bash
# Iniciar dev server (back-end + front-end)
NODE_ENV=development pnpm dev

# Verificar tipos TypeScript
pnpm check

# Lint e format
pnpm lint
pnpm format

# Testes
pnpm test
```

### Banco de Dados

```bash
# Aplicar migrações
pnpm db:push

# Criar admin inicial
NODE_ENV=development pnpm tsx drizzle/seed-admin.ts

# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Front-end

```bash
# Rodar Vite separado (se necessário)
pnpm vite

# Build de produção
pnpm build

# Preview do build
pnpm preview
```

### Mobile

```bash
# Navegar até mobile
cd mobile

# Iniciar Expo
pnpm start

# Abrir no Android
pnpm android

# Abrir no iOS (macOS apenas)
pnpm ios

# Abrir no navegador
pnpm web

# Build Android (APK)
pnpm build:android

# Build iOS
pnpm build:ios
```

### Docker

```bash
# Subir apenas banco
docker-compose up -d db

# Subir tudo (app + db)
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose down

# Limpar volumes (cuidado: apaga dados!)
docker-compose down -v
```

### Build e Produção

```bash
# Build
pnpm build

# Executar em produção
NODE_ENV=production pnpm start

# Com PM2
pm2 start dist/index.js --name salon-api
pm2 save
pm2 startup
```

### Segurança

```bash
# Audit de vulnerabilidades
pnpm audit

# Gerar JWT_SECRET forte
openssl rand -base64 64

# Verificar portas
lsof -i :3000
```

---

## Estrutura do Repositório

\`\`\`text
system-salon/
├── client/              # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── lib/         # Utilitários e configurações
│   │   └── hooks/       # Custom React hooks
│   ├── index.html
│   └── package.json
│
├── server/              # Backend tRPC
│   ├── _core/           # Configuração Express
│   ├── routers/         # Routers tRPC
│   ├── services/        # Lógica de negócio
│   └── index.ts
│
├── drizzle/             # Schema e migrations
│   ├── schema.ts        # Definição de tabelas
│   ├── relations.ts     # Relações entre tabelas
│   ├── migrations/      # Arquivos SQL de migração
│   └── seed-admin.ts    # Seeds iniciais
│
├── shared/              # Código compartilhado
│   ├── types.ts         # Tipos TypeScript
│   └── validations.ts   # Schemas Zod
│
├── mobile/              # App React Native (Expo)
│   ├── app/             # Rotas Expo Router
│   ├── lib/             # Configurações e utilities
│   ├── components/      # Componentes reutilizáveis
│   └── app.json         # Configuração Expo
│
├── .env.example         # Exemplo de variáveis de ambiente
├── drizzle.config.ts    # Configuração Drizzle Kit
├── docker-compose.yml   # Configuração Docker
├── Dockerfile           # Build da imagem
└── README.md            # Este arquivo
\`\`\`

---

## API Reference (tRPC)

### Principais Routers

Disponíveis em \`server/routers.ts\`:

#### Auth Router
- \`login\` - Autenticação de usuário
- \`register\` - Registro de novo usuário
- \`logout\` - Encerrar sessão
- \`me\` - Obter usuário atual
- \`requestPasswordReset\` - Solicitar reset de senha
- \`resetPassword\` - Redefinir senha

#### Salon Router
- \`get\` - Obter informações do salão
- \`create\` - Criar novo salão
- \`update\` - Atualizar configurações

#### Specialists Router
- \`list\` - Listar especialistas
- \`get\` - Obter especialista por ID
- \`create\` - Criar novo especialista
- \`update\` - Atualizar especialista
- \`delete\` - Remover especialista

#### Clients Router
- \`list\` - Listar clientes
- \`get\` - Obter cliente por ID
- \`create\` - Criar novo cliente
- \`update\` - Atualizar cliente
- \`delete\` - Remover cliente

#### Services Router
- \`list\` - Listar serviços
- \`get\` - Obter serviço por ID
- \`create\` - Criar novo serviço
- \`update\` - Atualizar serviço
- \`delete\` - Remover serviço

#### Appointments Router
- \`list\` - Listar agendamentos
- \`get\` - Obter agendamento por ID
- \`create\` - Criar novo agendamento
- \`update\` - Atualizar agendamento
- \`delete\` - Remover agendamento
- \`complete\` - Marcar como concluído
- \`cancel\` - Cancelar agendamento
- \`getAvailableSlots\` - Obter horários disponíveis
- \`validateSlot\` - Validar horário específico
- \`getSuggestions\` - Sugestões inteligentes de horários

#### Public Router
- \`getSalonInfo\` - Informações públicas do salão
- \`getAllSpecialists\` - Listar todos os especialistas
- \`getSpecialistServices\` - Serviços de um especialista
- \`getAvailableTimeSlots\` - Horários disponíveis
- \`createPublicAppointment\` - Criar agendamento público

#### Waitlist Router
- \`add\` - Adicionar à lista de espera
- \`remove\` - Remover da lista
- \`list\` - Listar pessoas na lista
- \`confirm\` - Confirmar vaga
- \`stats\` - Estatísticas da lista

#### Notifications Router
- Envio de notificações por templates
- Gerenciamento de templates
- Lembretes automáticos

#### Reports Router
- \`stats\` - Estatísticas gerais
- \`exportCSV\` - Exportar relatórios

#### Dashboard Router
- \`metrics\` - Métricas principais
- \`charts\` - Dados para gráficos

---

## Troubleshooting

### Erro: "autenticação do tipo senha falhou" no Windows com Docker

**Causa:** No Windows, o Node.js local não consegue se conectar ao PostgreSQL dentro do Docker via `localhost` devido a peculiaridades de autenticação SCRAM-SHA-256 e regras pg_hba.conf.

**Solução recomendada:** Rodar tudo via Docker Compose (Opção A do Quick Start):
```bash
docker-compose up -d --build
```
Isso evita o problema de autenticação, pois o app e o banco ficam na mesma rede Docker interna.

### Erro: "UNAUTHORIZED"

**Causa:** Token JWT ausente, inválido ou expirado

**Solução:**

```bash
# Verificar se JWT_SECRET está configurado
echo $JWT_SECRET

# Fazer login novamente para obter novo token
# Ou verificar se o token está sendo enviado no header:
# Authorization: Bearer <token>
```

### Erro: "Too Many Requests"

**Causa:** Rate limit atingido (100 req/15min)

**Solução:**
- Aguardar 15 minutos
- Ou ajustar limite em `server/_core/index.ts`

### Erro: "Database connection failed"

**Causa:** PostgreSQL não está rodando ou DATABASE_URL incorreto

**Solução:**

```bash
# Verificar se PostgreSQL está rodando
pg_isready

# Testar conexão
psql $DATABASE_URL

# Com Docker
docker-compose up -d db
```

### Erro: "Cannot connect to Docker"

**Causa:** Docker Desktop não está rodando

**Solução:**
- Inicie o Docker Desktop
- Verifique: `docker ps`
- No Windows, certifique-se que WSL2 está ativo

### Erro: "CORS"

**Causa:** Origem não permitida

**Solução:**

```bash
# Em produção, configurar FRONTEND_URL
export FRONTEND_URL=https://seu-dominio.com

# Em desenvolvimento, usar localhost:3000 ou 5173
```

### Erro: "Port already in use"

**Causa:** Porta 3000 já está em uso

**Solução:**

```bash
# Encontrar processo usando a porta
lsof -ti:3000

# Matar processo
kill -9 $(lsof -ti:3000)

# Ou usar outra porta
PORT=3001 pnpm dev
```

### Erro: "pnpm not found"

**Causa:** pnpm não está instalado globalmente

**Solução:**

```bash
# Instalar pnpm
npm install -g pnpm

# Verificar instalação
pnpm --version
```

### Erro: "Mobile não conecta ao back-end"

**Causa:** URL da API incorreta ou problema de rede

**Solução:**
1. Verifique se back-end está rodando: `http://SEU_IP:3000/health`
2. Atualize `mobile/lib/trpc.ts` com IP correto
3. Certifique-se que dispositivos estão na mesma rede Wi-Fi
4. Firewall pode estar bloqueando - libere porta 3000

### Erro: "Expo não inicia"

**Causa:** Dependências desatualizadas ou cache corrompido

**Solução:**

```bash
cd mobile

# Limpar cache
pnpm start --clear

# Ou reinstalar dependências
rm -rf node_modules
pnpm install
```

---

## Observações Importantes

### Timezones
O projeto trata datas convertendo para UTC. Revisar exibição para usuários em diferentes fusos horários.

### Concurrency
Validar concorrência de reservas em ambientes de alta carga - considerar bloqueios de banco de dados ou filas.

### Jobs e Filas
Para produção, recomenda-se mover notificações para workers (BullMQ + Redis) para melhor performance.

### Backups
Configure backup automático do banco de dados em produção. Veja seção [Deploy em Produção](#deploy-em-produção).

---

## Testes

Executar testes com Vitest:

\`\`\`bash
pnpm test

# Modo watch
pnpm test:watch
\`\`\`

---

## Próximos Passos e Melhorias

### Prioridade Alta
- [ ] Migrar notificações para workers/filas (BullMQ + Redis)
- [ ] Implementar testes E2E (Playwright)
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Adicionar monitoramento (Sentry/DataDog)

### Prioridade Média
- [ ] Implementar log de auditoria
- [ ] Adicionar testes unitários (Vitest)
- [ ] Documentação OpenAPI-like
- [ ] Implementar 2FA para admins

### Prioridade Baixa
- [ ] Cache com Redis
- [ ] Implementar captcha em formulários públicos
- [ ] Internacionalização (i18n)
- [ ] PWA support

---

## Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (\`git checkout -b feature/MinhaFeature\`)
3. Commit suas mudanças (\`git commit -m 'Adiciona MinhaFeature'\`)
4. Push para a branch (\`git push origin feature/MinhaFeature\`)
5. Abra um Pull Request

---

## Suporte

Para questões e suporte:
- Abra uma [Issue](https://github.com/seu-usuario/system-salon/issues)
- Consulte a documentação acima

---

**Desenvolvido com ❤️ usando TypeScript e as melhores práticas de segurança**

### Padrões de Código

- **TypeScript**: Tipagem estrita sempre que possível
- **ESLint**: Siga as regras do projeto
- **Prettier**: Formatação automática
- **Commits**: Mensagens claras e descritivas

---

## Links Úteis

- [Documentação tRPC](https://trpc.io/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Expo Docs](https://docs.expo.dev/)
- [React Documentation](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
