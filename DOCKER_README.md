# System Salon - Sistema de Agendamento para Salões de Beleza

## Preparação para Deploy no EasyPanel

Este repositório contém um sistema de agendamento para salões de beleza com front-end React e back-end Node.js.

### Estrutura do Projeto

- **Client**: Front-end React/TypeScript com Vite
- **Server**: Back-end Node.js com Express
- **Banco de dados**: PostgreSQL com Drizzle ORM

### Instruções para Deploy

#### 1. Configuração no EasyPanel

1. Acesse o painel do EasyPanel
2. Crie um novo projeto
3. Selecione a opção "Deploy from Git Repository"
4. Configure o repositório e as variáveis de ambiente conforme o arquivo `.env.example`

#### 2. Configuração de Variáveis de Ambiente

As seguintes variáveis de ambiente são necessárias:

```bash
DATABASE_URL=postgres://postgres:postgres@db:5432/salon
POSTGRES_PASSWORD=sua_senha_segura
POSTGRES_USER=postgres
POSTGRES_DB=salon
JWT_SECRET=seu_jwt_secret_seguro
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=seu_oauth_server
NODE_ENV=production
PORT=3000
```

#### 3. Executando Migrações do Banco de Dados

Depois que a aplicação estiver em execução, você precisará executar as migrações do banco de dados:

```bash
docker exec -it <container_id> pnpm db:push
```

### Desenvolvimento Local

Para executar o projeto localmente com Docker:

```bash
# Construir e iniciar os containers
docker-compose up -d

# Executar migrações
docker exec -it system-salon-app-1 pnpm db:push
```

### Produção

Para produção, o Dockerfile utiliza um processo de build em multi-stage para criar uma imagem otimizada:

1. Estágio de build: compila o código TypeScript
2. Estágio de produção: apenas com as dependências necessárias

### Serviços

O docker-compose.yml configura:

1. Aplicação Node.js
2. Banco de dados PostgreSQL

### Atualizações

Para atualizar a aplicação em produção:

1. Push das alterações para o repositório
2. Redeploy no EasyPanel
