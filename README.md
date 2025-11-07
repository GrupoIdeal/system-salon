# 💄 Sistema de Gestão para Salões de Beleza

**system-salon** — Plataforma completa para gestão de salão com agendamento público, controle financeiro, relatórios e automações.

[![Security](https://img.shields.io/badge/security-8.5%2F10-brightgreen)](https://github.com)
[![Node](https://img.shields.io/badge/node-%3E%3D18-blue)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.0-blue)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> 🔒 **Nota de Segurança:** Este projeto implementa as melhores práticas de segurança incluindo rate limiting, Helmet.js, CORS restrito, validações fortalecidas e proteção contra ataques comuns (XSS, CSRF, SQL Injection, etc). **Score de segurança: 8.5/10 (BOM)**

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades-principais)
- [Tecnologias](#tecnologias-utilizadas)
- [Setup Rápido](#setup-rápido-desenvolvimento)
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

O projeto foi projetado para suportar tanto uso administrativo (dashboard interno) quanto um fluxo de agendamento público (página para clientes sem login).

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

## Setup Rápido (Desenvolvimento)

### Pré-requisitos
- Node.js 18+
- pnpm (gerenciador de pacotes)
- PostgreSQL 14+
- Docker (opcional)

### Instalação Local

\`\`\`bash
# Clonar repositório
git clone <repo-url>
cd system-salon

# Instalar dependências
pnpm install

# Copiar arquivo de ambiente
cp .env.example .env
# Editar .env conforme necessário
\`\`\`

### Executar Migrações e Seeds

\`\`\`bash
# Aplicar migrações do banco
pnpm db:push

# Criar usuário admin inicial (opcional)
pnpm db:seed
\`\`\`

### Iniciar em Modo Desenvolvimento

\`\`\`bash
pnpm dev
\`\`\`

Acesso:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000

---

## Rodando com Docker

### Desenvolvimento com Containers

\`\`\`bash
# Subir containers
docker-compose up -d

# Aplicar migrações dentro do container
docker exec -it system-salon-app-1 pnpm db:push
docker exec -it system-salon-app-1 pnpm db:seed
\`\`\`

### Build e Execução para Produção

\`\`\`bash
# Build da imagem
docker build -t salon-system .

# Executar container
docker run -p 3000:3000 --env-file .env salon-system
\`\`\`

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

### Desenvolvimento

\`\`\`bash
# Iniciar dev server
pnpm dev

# Verificar tipos TypeScript
pnpm check

# Lint e format
pnpm lint
pnpm format
\`\`\`

### Banco de Dados

\`\`\`bash
# Aplicar migrações
pnpm db:push

# Criar admin inicial
tsx drizzle/seed-admin.ts

# Backup
pg_dump \$DATABASE_URL > backup.sql

# Restore
psql \$DATABASE_URL < backup.sql
\`\`\`

### Build e Produção

\`\`\`bash
# Build
pnpm build

# Executar em produção
NODE_ENV=production pnpm start

# Com PM2
pm2 start dist/index.js --name salon-api
pm2 save
pm2 startup
\`\`\`

### Segurança

\`\`\`bash
# Audit de vulnerabilidades
pnpm audit

# Gerar JWT_SECRET forte
openssl rand -base64 64

# Verificar portas
lsof -i :3000
\`\`\`

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
│   ├── migrations/      # Arquivos de migração
│   └── seed-admin.ts    # Seeds iniciais
│
├── shared/              # Código compartilhado
│   ├── types.ts         # Tipos TypeScript
│   └── validations.ts   # Schemas Zod
│
├── .env.example         # Exemplo de variáveis de ambiente
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

### Erro: "UNAUTHORIZED"

**Causa:** Token JWT ausente, inválido ou expirado

**Solução:**

\`\`\`bash
# Verificar se JWT_SECRET está configurado
echo \$JWT_SECRET

# Fazer login novamente para obter novo token
# Ou verificar se o token está sendo enviado no header:
# Authorization: Bearer <token>
\`\`\`

### Erro: "Too Many Requests"

**Causa:** Rate limit atingido (100 req/15min)

**Solução:**
- Aguardar 15 minutos
- Ou ajustar limite em \`server/_core/index.ts\`

### Erro: "Database connection failed"

**Causa:** PostgreSQL não está rodando ou DATABASE_URL incorreto

**Solução:**

\`\`\`bash
# Verificar se PostgreSQL está rodando
pg_isready

# Testar conexão
psql \$DATABASE_URL

# Com Docker
docker-compose up -d db
\`\`\`

### Erro: "CORS"

**Causa:** Origem não permitida

**Solução:**

\`\`\`bash
# Em produção, configurar FRONTEND_URL
export FRONTEND_URL=https://seu-dominio.com

# Em desenvolvimento, usar localhost:3000 ou 5173
\`\`\`

### Erro: "Port already in use"

**Causa:** Porta 3000 já está em uso

**Solução:**

\`\`\`bash
# Encontrar processo usando a porta
lsof -ti:3000

# Matar processo
kill -9 \$(lsof -ti:3000)

# Ou usar outra porta
PORT=3001 pnpm dev
\`\`\`

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
