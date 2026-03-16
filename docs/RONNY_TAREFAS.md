# Ronny — Minhas Tarefas como Desenvolvedor do Sistema

**Branch:** `ronny`  
**Papel no grupo:** Desenvolvedor Fullstack (Front-end + Back-end)  
**Responsabilidade principal:** Todo o código do sistema (já existente + novas funcionalidades)

---

## Resumo das Minhas Entregas por Sprint

| Sprint | O que entregarei | Status |
|--------|-----------------|--------|
| Sprint 1 | Ambiente rodando, README de setup, branch `ronny` criada | 🔄 Em andamento |
| Sprint 2 | Ajudar arquiteto com diagrama de classes (já conheço o banco) | ⏳ |
| Sprint 3 | Módulo de Produtos completo (banco + API + tela) | ⏳ |
| Sprint 4 | Upload de foto via câmera do celular + geolocalização | ⏳ |
| Sprint 5 | PIX com QR Code + Pontos de Fidelidade + Acessibilidade visual | ⏳ |
| Sprint 6 | Notificações push reais + Módulo de Avaliações + Offline | ⏳ |
| Sprint 7 | Correções dos testes com surdos + Dashboard com estoque/avaliações | ⏳ |
| Sprint 8 | Build de produção final + geração do APK via PWABuilder | ⏳ |

---

## Sprint 1 — Semanas 1-2
### Tarefas: Configuração e Apresentação do que já existe

- [x] Criar branch `ronny`
- [ ] Garantir que o ambiente local está rodando (`pnpm dev` + Docker)
- [ ] Escrever guia de instalação no README (passo a passo do zero)
- [ ] Preparar demonstração do sistema atual para o grupo (mostrar as telas)
- [ ] Explicar para o arquiteto como funciona o banco (`drizzle/schema.ts`)

**Como rodar localmente:**
```bash
# 1. Instalar dependências
pnpm install

# 2. Subir banco de dados
docker-compose up -d db

# 3. Criar o arquivo .env (pedir o arquivo para o Ronny, NÃO commitar)
cp .env.example .env

# 4. Rodar as migrations do banco
pnpm db:push

# 5. Popular banco com dados de demo
NODE_ENV=development pnpm tsx drizzle/seed-admin.ts

# 6. Iniciar o servidor
NODE_ENV=development pnpm dev

# Acessar: http://localhost:3000
# Login: teste@teste.com / 123123
```

---

## Sprint 2 — Semanas 3-4
### Tarefas: Apoiar documentação + ajustes iniciais

- [ ] Revisar o documento de requisitos com o arquiteto (conferir se bate com o que foi implementado)
- [ ] Validar o Diagrama de Classes feito pelo arquiteto (conferir contra `drizzle/schema.ts`)
- [ ] Criar `docs/diagramas/` com prints das telas atuais (para o pitch)
- [ ] Garantir que o Figma do grupo bate com as telas reais do sistema

**O que o arquiteto vai precisar de mim:**
- Lista de todas as tabelas e colunas → ver `drizzle/schema.ts`
- Como funciona o fluxo de autenticação → JWT + cookie
- Quais são os atores do sistema → Admin, Usuário, Cliente (público)

---

## Sprint 3 — Semanas 5-6
### Tarefas: MÓDULO DE PRODUTOS (novo — tudo a criar)

#### 3.1 — Banco de Dados
- [ ] Criar migration `0019_create_products.sql`

```sql
-- Rodar: pnpm db:push (após ajustar schema.ts)
```

- [ ] Adicionar tabela `products` no `drizzle/schema.ts`:

```typescript
export const products = pgTable('products', {
  id:         varchar('id', { length: 64 }).primaryKey(),
  salonId:    varchar('salon_id', { length: 64 }).references(() => salons.id, { onDelete: 'cascade' }).notNull(),
  name:       text('name').notNull(),
  stock:      integer('stock').default(0),
  minStock:   integer('min_stock').default(5),
  costPrice:  decimal('cost_price', { precision: 10, scale: 2 }),
  sellPrice:  decimal('sell_price', { precision: 10, scale: 2 }),
  createdAt:  timestamp('created_at').defaultNow(),
  updatedAt:  timestamp('updated_at').defaultNow(),
});
```

- [ ] Adicionar coluna `loyaltyPoints` na tabela `clients` (migration `0020_add_loyalty_points.sql`):

```typescript
// Em drizzle/schema.ts, adicionar na tabela clients:
loyaltyPoints: integer('loyalty_points').default(0),
```

#### 3.2 — Backend (server/routers.ts + server/db.ts)
- [ ] Criar funções no `server/db.ts`:
  - `getProductsBySalonId(salonId)`
  - `createProduct(data)`
  - `updateProduct(id, data)`
  - `deleteProduct(id)`
  - `getLowStockProducts(salonId)` — retorna produtos com `stock <= minStock`

- [ ] Criar router `products` em `server/routers.ts`:
  - `products.list` — query protegida
  - `products.create` — mutation protegida
  - `products.update` — mutation protegida
  - `products.delete` — mutation protegida
  - `products.lowStock` — query para alertas no dashboard

#### 3.3 — Frontend
- [ ] Criar página `client/src/pages/Products.tsx`
  - Tabela com: nome, estoque atual, estoque mínimo, preço de venda
  - Badge vermelho quando `stock <= minStock`
  - Modal de cadastro/edição
  - Botão de deletar com confirmação

- [ ] Adicionar rota `/produtos` em `client/src/App.tsx`
- [ ] Adicionar item "Produtos" no menu do `DashboardLayout.tsx`
- [ ] No Dashboard, adicionar card "Produtos com estoque baixo" (badge de alerta)

---

## Sprint 4 — Semanas 7-8
### Tarefas: Câmera + Geolocalização

#### 4.1 — Câmera (upload via celular)
- [ ] Criar componente `client/src/components/PhotoUpload.tsx`:

```tsx
// Input que abre câmera no celular automaticamente
<input
  type="file"
  accept="image/*"
  capture="environment"   // câmera traseira
  onChange={handleFileChange}
/>
```

- [ ] Integrar no cadastro de clientes (foto do cliente)
- [ ] Integrar no cadastro de especialistas (já tem campo de photo, melhorar UI)
- [ ] Conectar no Cloudinary via `images.upload` (já existe no sistema)

#### 4.2 — Mapa / Geolocalização
- [ ] Na página pública de agendamento (`/agendar`), adicionar seção "Como chegar":
  - Exibir endereço do salão formatado
  - Link de "Abrir no Google Maps" com coordenadas ou endereço
  - Se o navegador liberar, calcular distância do usuário até o salão

```tsx
const openMaps = (address: string) => {
  const encoded = encodeURIComponent(address);
  window.open(`https://maps.google.com/?q=${encoded}`, '_blank');
};
```

---

## Sprint 5 — Semanas 9-10
### Tarefas: PIX + Fidelidade + Acessibilidade visual

#### 5.1 — PIX com QR Code
- [ ] Instalar lib: `pnpm add qrcode.react`
- [ ] Adicionar coluna `pixKey` na tabela `salons` (migration `0021_add_pix_key.sql`)
- [ ] Campo "Chave PIX" na página de configurações do salão (`/empresa`)
- [ ] Criar componente `client/src/components/PixQRCode.tsx`
- [ ] Integrar no `CompleteAppointmentModal.tsx`: ao concluir, mostrar QR Code PIX com valor

```tsx
// Payload PIX estático (formato simplificado)
const pixString = `00020126360014BR.GOV.BCB.PIX0114${salon.pixKey}52040000530398654${valor}5802BR5913${salon.name.slice(0,13)}6009CIDADE63041D3D`;
<QRCode value={pixString} size={200} />
```

#### 5.2 — Pontos de Fidelidade
- [ ] Ao concluir agendamento (`appointments.complete`), incrementar `loyaltyPoints` do cliente
  - Regra sugerida: cada R$ 1,00 pago = 1 ponto
- [ ] Exibir saldo de pontos na tela de detalhes do cliente (`/clientes`)
- [ ] Exibir badge "X pontos" na listagem de clientes

#### 5.3 — Acessibilidade Visual
- [ ] Criar componente `client/src/components/AccessibilityBar.tsx`:
  - Botão "+A" — aumenta fonte em 2px (salvar em localStorage)
  - Botão "-A" — diminui fonte
  - Botão "Alto Contraste" — aplica classe `.high-contrast` no `<html>`

- [ ] Adicionar no `index.css` as regras de alto contraste:

```css
.high-contrast {
  --background: #000000;
  --foreground: #ffffff;
  --primary: #ffff00;
  --muted: #333333;
}
```

- [ ] Integrar `AccessibilityBar` no `DashboardLayout.tsx` e na página pública `/agendar`

---

## Sprint 6 — Semanas 11-12
### Tarefas: Notificações Push + Avaliações + Offline

#### 6.1 — Notificações Push Reais
- [ ] Instalar: `pnpm add web-push` (no servidor)
- [ ] Criar tabela `push_subscriptions` no banco
- [ ] Criar endpoint `notifications.subscribe` (salvar subscription do navegador)
- [ ] Atualizar `client/src/sw.ts` para registrar e receber push
- [ ] No servidor, disparar push ao criar agendamento (confirmação imediata)
- [ ] Criar cron job para lembretes de 24h antes:

```typescript
import cron from 'node-cron';
// A cada hora, verificar agendamentos em ~24h
cron.schedule('0 * * * *', async () => {
  await sendReminders24h();
});
```

#### 6.2 — Módulo de Avaliações
- [ ] Criar migration `0022_create_ratings.sql` + tabela `ratings` no schema
- [ ] Criar funções no `server/db.ts`: `createRating`, `getRatingsBySpecialist`, `getAverageRating`
- [ ] Router `ratings` em `server/routers.ts`:
  - `ratings.submit` — público (via token único)
  - `ratings.getBySpecialist` — protegido
- [ ] Ao concluir agendamento, gerar token único e salvar em `ratings` (com `used: false`)
- [ ] Criar página pública `client/src/pages/Rating.tsx` (`/avaliar?token=xxx`)
  - Formulário: 1-5 estrelas + comentário opcional
- [ ] Exibir média de estrelas nos cards de especialistas

#### 6.3 — Offline (melhorar Service Worker)
- [ ] Em `client/src/sw.ts`, adicionar cache da lista de agendamentos do dia
- [ ] Estratégia "cache first" para assets estáticos, "network first" para dados da API

---

## Sprint 7 — Semanas 13-14
### Tarefas: Correções + Dashboard atualizado

- [ ] Implementar todas as correções de usabilidade apontadas nos testes com surdos
- [ ] Dashboard: adicionar card "Produtos com estoque baixo" (lista com nome + qtd)
- [ ] Dashboard: adicionar card "Avaliação média do salão" (estrelas)
- [ ] Dashboard: destacar quando houver produtos abaixo do mínimo (badge vermelho no menu)
- [ ] Fazer testes de segurança básicos:
  - Tentar acessar `/dashboard` sem estar logado (deve redirecionar)
  - Tentar editar cliente de outro salão (deve dar erro)
  - Testar rate limiting na rota de login (mais de 10 tentativas seguidas)

---

## Sprint 8 — Semanas 15-16
### Tarefas: Build final + APK + Demo

- [ ] Rodar build de produção e verificar que não há erros:

```bash
pnpm build
```

- [ ] Subir para um servidor de produção (pode ser Railway, Render ou VPS)
- [ ] Gerar APK via [pwabuilder.com](https://www.pwabuilder.com):
  1. Entrar no site
  2. Colocar a URL do app em produção
  3. Baixar o pacote Android (`.apk`)
  4. Testar no celular Android

- [ ] Gravar vídeo de demonstração do sistema (5–10 minutos):
  - Login e dashboard
  - Criar agendamento
  - Concluir com PIX
  - Usar modo alto contraste
  - Mostrar o app instalado no celular

- [ ] Fazer merge da branch `ronny` para `main` após aprovação do grupo

---

## Checklist Final — O que preciso ter feito até a entrega

### Código (minha responsabilidade)
- [ ] Módulo de Produtos com alerta de estoque baixo
- [ ] Pontos de fidelidade nos clientes
- [ ] PIX com QR Code no modal de conclusão
- [ ] Upload de foto via câmera do celular
- [ ] Link de geolocalização na página pública
- [ ] Vídeos em Libras integrados (componente — o conteúdo é da colega)
- [ ] Barra de acessibilidade (+A/-A + alto contraste)
- [ ] Avaliações pós-serviço (tela pública + exibição nos especialistas)
- [ ] Notificações push reais (pelo menos confirmação de agendamento)
- [ ] Dashboard atualizado com produtos e avaliações
- [ ] Build de produção rodando sem erros
- [ ] APK gerado e testado

### Documentação técnica (contribuição minha para o grupo)
- [ ] README com guia de instalação passo a passo
- [ ] Manter `docs/DOCUMENTACAO.md` atualizado conforme novas features
- [ ] Dump do banco de dados final (`.sql`) para entrega

---

## Dicas para o Desenvolvimento

### Sequência certa para criar uma nova feature:

```
1. drizzle/schema.ts       → Adicionar tabela/coluna
2. pnpm db:push            → Gerar e aplicar migration
3. server/db.ts            → Criar funções de query
4. shared/validations.ts   → Criar schema Zod de validação
5. server/routers.ts       → Criar procedures tRPC
6. client/src/pages/       → Criar/atualizar página
7. client/src/App.tsx      → Adicionar rota (se nova página)
8. DashboardLayout.tsx     → Adicionar item no menu (se nova página)
```

### Comandos mais usados:

```bash
# Rodar em desenvolvimento
NODE_ENV=development pnpm dev

# Aplicar mudanças no banco após editar schema.ts
pnpm db:push

# Verificar erros de TypeScript
pnpm check

# Build de produção
pnpm build

# Resetar banco e popular com dados de teste
NODE_ENV=development pnpm tsx drizzle/seed-admin.ts
```

### Onde fica cada coisa:

| O que quero mudar | Arquivo |
|------------------|---------|
| Tabelas do banco | `drizzle/schema.ts` |
| Queries SQL | `server/db.ts` |
| Endpoints da API | `server/routers.ts` |
| Validações de formulário | `shared/validations.ts` |
| Páginas do sistema | `client/src/pages/` |
| Componentes reutilizáveis | `client/src/components/` |
| Menu lateral / layout | `client/src/components/DashboardLayout.tsx` |
| Rotas da aplicação | `client/src/App.tsx` |
| Configurações do servidor | `server/_core/index.ts` |

---

*Documento pessoal — Branch: `ronny` — Projeto Integrado IV 2026.1*
