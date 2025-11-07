# 🚀 Quick Reference - Desenvolvedor

## 📦 Pacotes de Segurança Instalados

```json
{
  "helmet": "^8.1.0",           // Headers de segurança
  "express-rate-limit": "^8.2.1", // Rate limiting
  "express-validator": "^7.3.0",  // Validação extra
  "bcrypt": "^6.0.0",             // Hash de senhas
  "jose": "^latest"               // JWT seguro
}
```

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
# Iniciar desenvolvimento
pnpm dev

# Verificar tipos
pnpm check

# Verificar segurança
pnpm audit

# Corrigir vulnerabilidades
pnpm audit fix
```

### Produção
```bash
# Build
pnpm build

# Executar
NODE_ENV=production pnpm start

# Gerar secret forte
openssl rand -base64 64
```

### Banco de Dados
```bash
# Migrations
pnpm db:push

# Seed admin
tsx drizzle/seed-admin.ts

# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

## 🔒 Variáveis de Ambiente Obrigatórias

### Produção
```bash
# CRÍTICO
JWT_SECRET=<64+ caracteres aleatórios>
DATABASE_URL=postgres://user:pass@host:5432/db?sslmode=require
FRONTEND_URL=https://seu-dominio.com
NODE_ENV=production

# OPCIONAL
PORT=3000
```

### Desenvolvimento
```bash
# Mínimo necessário
DATABASE_URL=postgres://postgres:postgres@localhost:5432/salon
JWT_SECRET=dev-secret-change-in-production
NODE_ENV=development
```

## 🛡️ Validações Implementadas

### Senha (Registro)
- Mínimo 6 caracteres
- Máximo 100 caracteres
- Letra maiúscula obrigatória
- Letra minúscula obrigatória
- Número obrigatório

### Email
- Formato válido
- Máximo 320 caracteres
- Lowercase automático
- Trim automático

### Strings Gerais
- `name`: max 200 chars
- `bio`: max 1000 chars
- `notes`: max 2000 chars
- `description`: max 1000 chars

### URLs
- Formato URL válido
- Máximo 1000 caracteres

## 🚦 Rate Limits Configurados

```typescript
// Rotas públicas
100 requisições / 15 minutos / IP

// Headers enviados
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: <timestamp>
```

## 🔑 Headers de Segurança (Helmet)

```
X-DNS-Prefetch-Control: off
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=15552000
X-XSS-Protection: 0
```

## 📝 Rotas Principais

### Públicas (`/api/public`)
- `POST /booking.getSalonInfo` - Info do salão
- `POST /booking.getAllSpecialists` - Lista especialistas
- `POST /booking.getAvailableTimeSlots` - Horários disponíveis
- `POST /booking.createPublicAppointment` - Criar agendamento

### Autenticadas (`/api/trpc`)
- `POST /auth.login` - Login
- `POST /auth.register` - Registro
- `POST /auth.me` - Usuário atual
- `POST /salon.*` - Gestão do salão
- `POST /specialists.*` - Gestão de especialistas
- `POST /services.*` - Gestão de serviços
- `POST /appointments.*` - Gestão de agendamentos
- `POST /clients.*` - Gestão de clientes

### Admin (`/api/trpc`)
- `POST /users.*` - Gestão de usuários
- Requer `role: "admin"`

## 🐛 Debug

### Ver Logs do Servidor
```bash
# Desenvolvimento
pnpm dev
# Logs aparecem no terminal

# Produção com PM2
pm2 logs salon-api
pm2 logs salon-api --lines 100
pm2 logs salon-api --err  # Apenas erros
```

### Verificar Banco
```bash
# Conectar
psql $DATABASE_URL

# Listar tabelas
\dt

# Ver usuários
SELECT id, email, role FROM users;

# Ver agendamentos
SELECT * FROM appointments ORDER BY "appointmentDate" DESC LIMIT 10;
```

## 🔍 Troubleshooting

### Erro: "UNAUTHORIZED"
- Token ausente ou inválido
- Verificar `Authorization: Bearer <token>`
- Token expirado (verificar JWT_SECRET)

### Erro: "FORBIDDEN"
- Usuário sem permissão admin
- Verificar `role` do usuário no banco

### Erro: "Too Many Requests"
- Rate limit atingido
- Aguardar 15 minutos
- Ou aumentar limite em `server/_core/index.ts`

### Erro: "Database connection failed"
- Verificar DATABASE_URL
- PostgreSQL rodando?
- Credenciais corretas?

### Erro: "CORS"
- Verificar FRONTEND_URL em produção
- Em dev, deve ser localhost:3000 ou 5173

## 📚 Documentos de Referência

- `SECURITY-ANALYSIS.md` - Análise completa de segurança
- `SECURITY-DEPLOY.md` - Guia de deploy seguro
- `SUMMARY.md` - Resumo de melhorias
- `README.md` - Documentação geral

## ⚡ Performance Tips

### Banco de Dados
```sql
-- Criar índices importantes
CREATE INDEX idx_appointments_date ON appointments("appointmentDate");
CREATE INDEX idx_appointments_specialist ON appointments("specialistId");
CREATE INDEX idx_specialists_salon ON specialists("salonId");
```

### Cache (Futuro)
- Redis para sessions
- Cache de queries frequentes
- CDN para assets estáticos

## 🎯 Pontos de Atenção

### Sempre Validar
✅ No cliente (UX)  
✅ No servidor (Segurança)  
✅ No banco (Constraints)

### Nunca Fazer
❌ Confiar em input do usuário  
❌ Hardcode de secrets  
❌ Console.log no cliente em produção  
❌ SQL queries dinâmicas sem prepared statements  
❌ Armazenar senhas em plain text  

### Sempre Fazer
✅ Usar bcrypt para senhas  
✅ Validar com Zod  
✅ Usar variáveis de ambiente  
✅ Rate limiting em rotas públicas  
✅ HTTPS em produção  
✅ Backup regular do banco  

---

**Última atualização:** 07/11/2025  
**Mantenha este arquivo atualizado!**
