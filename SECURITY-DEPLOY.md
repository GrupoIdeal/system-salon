# 🛡️ Guia de Segurança - Deploy em Produção

## ⚠️ CHECKLIST OBRIGATÓRIO ANTES DO DEPLOY

### 1. Variáveis de Ambiente
```bash
# ❌ NUNCA use valores de exemplo em produção!
# ✅ Gere valores fortes:

# Gerar JWT_SECRET forte:
openssl rand -base64 64

# Configurar no .env de produção:
JWT_SECRET=<cole o valor gerado acima>
NODE_ENV=production
DATABASE_URL=<sua connection string do PostgreSQL>
FRONTEND_URL=https://seu-dominio.com
```

### 2. Banco de Dados
- ✅ Use conexão SSL em produção
- ✅ Crie usuário específico (não use `postgres`)
- ✅ Restrinja acesso por IP
- ✅ Configure backup automático

```bash
# Exemplo de connection string segura:
DATABASE_URL=postgres://app_user:senha_forte@seu-host:5432/db_name?sslmode=require
```

### 3. HTTPS
- ✅ Configure certificado SSL (Let's Encrypt gratuito)
- ✅ Force redirecionamento HTTP → HTTPS
- ✅ Configure HSTS

### 4. CORS
```bash
# Configure apenas o domínio do frontend
FRONTEND_URL=https://seudominio.com
```

### 5. Rate Limiting
✅ Já configurado automaticamente:
- 100 req/15min para rotas públicas
- Headers de segurança via Helmet.js

## 🔐 SENHAS FORTES

### Para Usuários
Implementado requisitos mínimos:
- ✅ Mínimo 6 caracteres
- ✅ Letra maiúscula
- ✅ Letra minúscula  
- ✅ Número

### Para Admin
Recomendações adicionais:
- Use 12+ caracteres
- Adicione caracteres especiais
- Use gerenciador de senhas

## 🚨 MONITORAMENTO

### Logs Importantes
Monitore em produção:
- Tentativas de login falhas
- Erros 500
- Requisições bloqueadas por rate limit
- Acesso de admin

### Ferramentas Recomendadas
- **PM2** - Gerenciamento de processo
- **Sentry** - Monitoramento de erros
- **DataDog/NewRelic** - APM
- **CloudWatch** (AWS) - Logs

## 🔄 BACKUPS

### Banco de Dados
```bash
# Backup manual
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restaurar
psql $DATABASE_URL < backup-20251107.sql
```

### Backup Automático
Configure cron job:
```bash
# Todo dia às 3h da manhã
0 3 * * * pg_dump $DATABASE_URL > /backups/db-$(date +\%Y\%m\%d).sql
```

## 🔒 ATUALIZAÇÕES DE SEGURANÇA

### Verificar Vulnerabilidades
```bash
# Verificar dependências
pnpm audit

# Corrigir automaticamente
pnpm audit fix

# Atualizar dependências
pnpm update
```

### Frequência Recomendada
- Verificação semanal: `pnpm audit`
- Atualização mensal: dependências minor
- Atualização trimestral: dependências major

## 🛡️ PROTEÇÕES IMPLEMENTADAS

### ✅ Já Protegido Contra
- SQL Injection (via Drizzle ORM)
- XSS (validação + sanitização)
- CSRF (tokens + CORS restrito)
- Clickjacking (X-Frame-Options)
- Força bruta (rate limiting)
- Session hijacking (JWT seguro)

### ⚠️ Responsabilidade do Deploy
- DDoS (use CDN/Firewall)
- Backup (configure automação)
- SSL/TLS (configure certificado)
- Firewall (restrinja portas)

## 📋 COMANDOS ÚTEIS

### Desenvolvimento
```bash
# Rodar localmente
pnpm dev

# Verificar tipos
pnpm check

# Verificar segurança
pnpm audit
```

### Produção
```bash
# Build
pnpm build

# Executar
NODE_ENV=production pnpm start

# Com PM2
pm2 start dist/index.js --name salon-api
pm2 save
pm2 startup
```

## 🆘 EM CASO DE INCIDENTE

### 1. Vazamento de JWT_SECRET
```bash
# 1. Gere novo secret
openssl rand -base64 64

# 2. Atualize variável de ambiente
JWT_SECRET=<novo_valor>

# 3. Reinicie aplicação
pm2 restart salon-api

# 4. Notifique usuários (sessões invalidadas)
```

### 2. Suspeita de Invasão
```bash
# 1. Analise logs
pm2 logs salon-api --lines 1000

# 2. Verifique conexões ao banco
SELECT * FROM pg_stat_activity;

# 3. Se confirmado, bloqueie acesso temporário
# 4. Investigue e corrija vulnerabilidade
# 5. Restore de backup se necessário
```

## 📞 CONTATOS DE EMERGÊNCIA

- Suporte PostgreSQL: [documentação](https://www.postgresql.org/docs/)
- Reportar vulnerabilidade: [criar issue](https://github.com/seu-repo/issues)
- Comunidade: Discord/Slack do projeto

---

**Última atualização:** 07/11/2025  
**Versão:** 1.0.0
