# 💄 Sistema de Gestão para Salões de Beleza

**Sistema completo e profissional para gestão de salões de beleza** com recursos avançados de agendamento, controle financeiro, relatórios e automação.

## 🚀 Funcionalidades Principais

### 📅 **Gestão de Agendamentos**
- Sistema de agendamentos com status (pendente, confirmado, concluído, cancelado)
- Calendário interativo com visualização por dia/semana/mês
- Validação automática de conflitos de horários
- Configuração flexível de horários por especialista
- Ações rápidas para concluir/cancelar agendamentos

### 💰 **Sistema Financeiro Integrado**
- **Registro automático de receitas** ao concluir agendamentos
- Cálculo automático de comissões (60% especialista, 40% salão)
- Controle de métodos de pagamento (dinheiro, cartão, PIX)
- Dashboard com métricas financeiras em tempo real
- Histórico completo de transações

### 📊 **Relatórios Avançados**
- **Dashboard executivo** com métricas de negócio
- Relatórios de performance de especialistas
- Análise de serviços mais lucrativos
- Identificação de clientes mais valiosos
- Gráficos de evolução da receita
- Exportação de dados em CSV

### 🔔 **Sistema de Notificações**
- Templates profissionais para WhatsApp, SMS e Email
- Lembretes automáticos 24h antes dos agendamentos
- Confirmações de agendamento em tempo real
- Notificações de cancelamento

### ⏳ **Lista de Espera Inteligente**
- Sistema de prioridades baseado em tempo de espera
- Notificações automáticas quando horários se tornam disponíveis
- Conversão automática de lista de espera em agendamentos

### 👥 **Gestão Completa**
- Cadastro de clientes com histórico completo
- Gestão de especialistas com horários personalizados
- Catálogo de serviços com preços e durações
- Configurações flexíveis de horário de funcionamento

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **TailwindCSS** para estilização
- **Shadcn/ui** para componentes
- **Recharts** para gráficos
- **React Hook Form** para formulários
- **Date-fns** para manipulação de datas

### **Backend**
- **Node.js** com TypeScript
- **tRPC** para API type-safe
- **Drizzle ORM** para banco de dados
- **PostgreSQL** como banco de dados
- **JWT** para autenticação
- **Bcrypt** para hash de senhas

### **DevOps & Deploy**
- **Docker** para containerização
- **EasyPanel** ready para deploy
- **Vite** para build otimizado
- **ESLint** e **Prettier** para qualidade de código

## 🏗️ Estrutura do Projeto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilitários e configurações
├── server/                # Backend Node.js
│   ├── _core/            # Configurações centrais
│   ├── db.ts             # Funções do banco de dados
│   ├── routers.ts        # Rotas tRPC
│   └── *.ts              # Módulos especializados
├── drizzle/              # Migrações e schema do banco
└── shared/               # Tipos e validações compartilhadas
```

## 📊 Dashboard & Métricas

O sistema oferece um **dashboard executivo completo** com:

- 💰 **Receita mensal e semanal** em tempo real
- 📈 **Gráfico de evolução** dos últimos 30 dias  
- 🏆 **Rankings de performance** (especialistas, serviços, clientes)
- 📅 **Agendamentos do dia** com status
- 🎯 **Taxa de ocupação** atual
- 👥 **Clientes mais valiosos** por receita
- ⏰ **Próximos agendamentos** organizados

## 🛠️ Setup e Configuração

### **Pré-requisitos**

- Node.js 18+ e pnpm
- PostgreSQL 14+
- Docker (para desenvolvimento com containers)

### **Instalação para Desenvolvimento**

1. **Clone o repositório**
```bash
git clone <repo-url>
cd system-salon
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Configure as variáveis conforme necessário
```

4. **Configure o banco de dados**
```bash
# Execute as migrações
pnpm db:push

# (Opcional) Popule com dados iniciais
pnpm db:seed
```

5. **Inicie o servidor de desenvolvimento**
```bash
pnpm dev
```

A aplicação estará disponível em `http://localhost:5173`

### **Configuração com Docker**

1. **Para desenvolvimento local**
```bash
# Inicie os containers
docker-compose up -d

# Execute as migrações
docker exec -it system-salon-app-1 pnpm db:push

# (Opcional) Popule com dados de teste
docker exec -it system-salon-app-1 pnpm db:seed
```

2. **Para build de produção**
```bash
docker build -t salon-system .
docker run -p 3000:3000 salon-system
```

### **Variáveis de Ambiente**

Crie um arquivo `.env` baseado no `.env.example`:

```bash
# Banco de dados
DATABASE_URL=postgresql://postgres:password@localhost:5432/salon
POSTGRES_PASSWORD=sua_senha_segura
POSTGRES_USER=postgres  
POSTGRES_DB=salon

# Autenticação
JWT_SECRET=seu_jwt_secret_super_seguro_aqui

# Aplicação
NODE_ENV=development
PORT=3000

# Frontend (opcional)
VITE_APP_ID=salon-system
```

## 🚀 Deploy em Produção

### **Deploy no EasyPanel**

1. **Configuração inicial**
   - Acesse o painel do EasyPanel
   - Crie um novo projeto
   - Selecione "Deploy from Git Repository"
   - Configure o repositório Git

2. **Configuração das variáveis de ambiente**
   - Configure todas as variáveis do `.env.example`
   - Use senhas seguras para produção
   - Configure `NODE_ENV=production`

3. **Configuração do banco de dados**
   - Configure um banco PostgreSQL
   - Execute as migrações após o primeiro deploy

4. **Primeiro deploy**
   - Faça o deploy inicial
   - Execute as migrações:
   ```bash
   docker exec -it <container_id> pnpm db:push
   ```

### **Deploy Manual**

1. **Build da aplicação**
```bash
pnpm build
```

2. **Configuração do servidor**
   - Configure um servidor com Node.js 18+
   - Configure PostgreSQL
   - Configure proxy reverso (nginx/apache)

3. **Deploy**
```bash
# No servidor
git clone <repo-url>
cd system-salon
pnpm install --prod
pnpm build
pnpm db:push
pnpm start
```

### **Monitoramento**

- **Logs**: Monitore os logs da aplicação
- **Banco de dados**: Configure backups regulares
- **Performance**: Monitore métricas de CPU/memória
- **SSL**: Configure certificados SSL para HTTPS

### **Atualizações**

1. **Com EasyPanel**:
   - Push para o repositório Git
   - EasyPanel fará redeploy automático

2. **Manual**:
   ```bash
   git pull origin main
   pnpm install
   pnpm build
   pnpm db:push  # Se houver novas migrações
   pm2 restart app  # ou seu gerenciador de processo
   ```

## 🗄️ Estrutura do Banco de Dados

### **Tabelas Principais**

- **users**: Usuários do sistema (administradores)
- **clients**: Clientes do salão
- **specialists**: Especialistas/funcionários
- **services**: Catálogo de serviços
- **appointments**: Agendamentos
- **transactions**: Transações financeiras
- **waiting_list**: Lista de espera

### **Relacionamentos**

- Appointments → Clients, Specialists, Services
- Transactions → Appointments (automático ao concluir)
- Waiting_list → Clients, Specialists, Services

### **Migrações**

O sistema usa Drizzle ORM para migrações:

```bash
# Gerar nova migração
pnpm db:generate

# Aplicar migrações
pnpm db:push

# Reset do banco (cuidado!)
pnpm db:reset
```
