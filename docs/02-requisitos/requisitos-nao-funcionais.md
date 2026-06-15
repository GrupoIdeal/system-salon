# Requisitos Não-Funcionais — BeautySalon Access

**Projeto:** Projeto Integrado IV (2026.1)  
**Data:** 15 de junho de 2026

---

## RNF01 a RNF06 — Segurança

| Código | Requisito | Status |
|--------|-----------|--------|
| RNF01 | Senhas devem ser armazenadas com hash bcrypt (10 rounds de salt) | ✅ Implementado |
| RNF02 | Tokens de sessão devem ser JWT assinados com secret forte | ✅ Implementado |
| RNF03 | Rate limiting de 100 req/15min por IP em rotas públicas | ✅ Implementado |
| RNF04 | Rate limiting de 10 tentativas/15min para autenticação | ✅ Implementado |
| RNF05 | Headers HTTP de segurança (Helmet: XSS, clickjacking, sniffing) | ✅ Implementado |
| RNF06 | Tokens de reset de senha com validade de 1 hora e uso único | ✅ Implementado |

---

## RNF07 a RNF12 — Performance

| Código | Requisito | Status |
|--------|-----------|--------|
| RNF07 | API deve responder em menos de 500ms para 95% das requisições | ✅ Implementado |
| RNF08 | Cache de queries em memória (10min para métricas de dashboard) | ✅ Implementado |
| RNF09 | Lazy loading de páginas para reduzir bundle inicial em ~40% | ✅ Implementado |
| RNF10 | Dados considerados frescos por 5 min (React Query staleTime) | ✅ Implementado |
| RNF11 | Retry automático de 1 tentativa em caso de falha de rede | ✅ Implementado |
| RNF12 | Índices compostos no banco para queries de agendamento e transações | ✅ Implementado |

---

## RNF13 a RNF18 — Disponibilidade e Resiliência

| Código | Requisito | Status |
|--------|-----------|--------|
| RNF13 | O sistema deve funcionar offline para consulta de dados cacheados via Service Worker | ✅ Implementado |
| RNF14 | O sistema deve precachear 56 assets estáticos para funcionamento offline | ✅ Implementado |
| RNF15 | O deploy deve ser reprodutível via Docker com docker-compose | ✅ Implementado |
| RNF16 | O sistema deve encontrar porta disponível automaticamente se a padrão estiver ocupada | ✅ Implementado |
| RNF17 | O banco de dados deve ter backups regulares | ✅ Implementado |
| RNF18 | A aplicação deve iniciar com um único comando (`docker-compose up` ou `pnpm dev`) | ✅ Implementado |

---

## RNF19 a RNF24 — Usabilidade e Acessibilidade

| Código | Requisito | Status |
|--------|-----------|--------|
| RNF19 | A interface deve ser responsiva e adaptada para smartphones e tablets | ✅ Implementado |
| RNF20 | O app deve ser instalável como PWA (Add to Home Screen) sem loja de aplicativos | ✅ Implementado |
| RNF21 | Contraste mínimo deve atender critério WCAG 2.1 AA (via modo alto contraste) | ✅ Implementado |
| RNF22 | A fonte deve ser ajustável pelo usuário (aumentar/diminuir) | ✅ Implementado |
| RNF23 | As preferências de acessibilidade devem persistir entre sessões (localStorage) | ✅ Implementado |
| RNF24 | Navegação completa deve ser possível via teclado (ARIA labels) | ✅ Implementado |

---

## RNF25 a RNF30 — Manutenibilidade e Código

| Código | Requisito | Status |
|--------|-----------|--------|
| RNF25 | O código deve ser tipado estaticamente (TypeScript strict mode) | ✅ Implementado |
| RNF26 | O schema do banco deve ser versionado com migrações automáticas (Drizzle Kit) | ✅ Implementado |
| RNF27 | O frontend e backend devem compartilhar tipos via camada `shared/` | ✅ Implementado |
| RNF28 | Validações de entrada devem usar schemas Zod compartilhados | ✅ Implementado |
| RNF29 | O projeto deve seguir padrão de monorepo com pnpm workspace | ✅ Implementado |
| RNF30 | Testes unitários devem cobrir funções críticas (Vitest) | ✅ Implementado |
