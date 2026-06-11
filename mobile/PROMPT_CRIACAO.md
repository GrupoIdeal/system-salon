# Prompt: Gerar o App Mobile BizFlow Access (React Native)

Use a skill `mobile-rn` para ativar todas as instruções de desenvolvimento.

## Objetivo

Criar o aplicativo mobile completo do **BizFlow Access** dentro da pasta `mobile/` usando React Native com Expo. O app deve espelhar todas as funcionalidades do web app existente em `client/`, consumindo a mesma API tRPC e compartilhando tipos e validações.

## Stack Obrigatória

| Tecnologia | Versão |
|------------|--------|
| React Native (Expo) | SDK 52+ |
| TypeScript | 5.x |
| Expo Router | 4.x (file-based routing) |
| tRPC Client + React Query | 11.x / 5.x |
| expo-secure-store | Para JWT |
| expo-sqlite | Offline-first |
| expo-notifications | Push |
| expo-camera | Câmera |
| expo-location | Geolocalização |
| react-native-paper | UI components |
| react-native-reanimated | Animações |
| zod | Validação (compartilhado) |

## Estrutura de Diretórios a Criar

```
mobile/
├── app/                          # Expo Router
│   ├── _layout.tsx               # Root layout (QueryClient + TRPCProvider)
│   ├── index.tsx                 # Redirect to login
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── recuperar-senha.tsx
│   │   └── redefinir-senha.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Bottom tabs navigation
│   │   ├── dashboard.tsx         # KPIs + gráficos
│   │   ├── clientes.tsx          # Lista + CRUD
│   │   ├── servicos.tsx          # Catálogo
│   │   ├── agendamentos.tsx      # Calendário + lista
│   │   ├── produtos.tsx          # Estoque
│   │   └── mais.tsx              # Menu "Mais" (especialistas, avaliações, ajuda)
│   ├── (modal)/
│   │   ├── novo-agendamento.tsx  # 5-step booking flow
│   │   ├── checkout.tsx          # Concluir atendimento + PIX
│   │   ├── perfil-cliente.tsx
│   │   ├── avaliacao.tsx         # Rating pós-atendimento
│   │   └── ajuda-libras.tsx     # Central Libras
│   ├── empresa.tsx               # Admin: dados do salão
│   ├── usuarios.tsx              # Admin: gerenciar usuários
│   ├── logs.tsx                  # Admin: trilha de auditoria
│   ├── especialistas.tsx         # Lista + schedule
│   ├── avaliacoes.tsx            # Ratings management
│   └── agendamento-publico.tsx   # Booking sem login
├── components/
│   ├── AccessibilityBar.tsx      # +A/-A, alto contraste
│   ├── PixQRCode.tsx             # QR Code PIX
│   ├── AppointmentCard.tsx
│   ├── ClientCard.tsx
│   ├── StatsCard.tsx
│   ├── EmptyState.tsx
│   ├── LoadingScreen.tsx
│   ├── ErrorScreen.tsx
│   └── ui/                       # Componentes base
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── TextInput.tsx
│       ├── Select.tsx
│       ├── Modal.tsx
│       ├── Badge.tsx
│       └── Avatar.tsx
├── hooks/
│   ├── useAuth.ts                # Auth context + SecureStore
│   ├── usePushNotifications.ts
│   ├── useOffline.ts
│   └── useDebounce.ts
├── lib/
│   ├── trpc.ts                   # tRPC client config
│   ├── api.ts                    # Helpers
│   ├── storage.ts                # SecureStore wrapper
│   └── constants.ts              # URLs, app config
├── services/
│   ├── offline.ts                # SQLite + sync queue
│   └── notifications.ts         # Push handlers
├── types/
│   └── index.ts                  # Re-exporta @shared/types
├── app.json
├── tsconfig.json
├── babel.config.js
└── package.json
```

## Telas para Implementar (17 no total)

### 1. Autenticação (3 telas)
- **Login:** Email + senha, link "Esqueceu senha", link "Criar conta"
- **Register:** Nome, email, senha com validação (Zod)
- **Recuperar Senha:** Email → token → nova senha

### 2. Dashboard (1 tela)
- KPIs: receita mês, agendamentos hoje, ticket médio, taxa conclusão
- Gráfico de receita (Recharts ou victory-native)
- Top 5 serviços + Top 5 especialistas
- Agendamentos futuros (próximos 5)
- Alertas de estoque baixo
- Pull-to-refresh

### 3. Clientes (1 tela + 1 modal)
- Lista com search + infinite scroll
- CRUD: criar, editar, excluir
- Foto via câmera/galeria (expo-image-picker)
- Pontos de fidelidade visíveis

### 4. Serviços (1 tela + 1 modal)
- Lista com filtro por status
- CRUD: nome, descrição, duração, preço
- Indicador "a partir de" (priceFrom)

### 5. Especialistas (1 tela + 1 modal)
- Lista com fotos e status
- CRUD + configuração de horários (dias da semana, intervalos)
- Dias indisponíveis

### 6. Produtos (1 tela + 1 modal)
- Lista com indicador visual de estoque baixo
- CRUD: nome, estoque, estoque mínimo, preços
- Badge vermelho quando stock < minStock

### 7. Agendamentos (1 tela + 2 modais)
- 3 visualizações: diária, semanal, mensal (ScrollView + calendário)
- Cards com cor por status
- Novo agendamento: 5-step wizard (serviço → especialista → data → horário → confirmar)
- Concluir atendimento: adicionar produtos + PIX QR Code + método pagamento

### 8. Avaliações (1 tela)
- Lista de avaliações recebidas
- Média por especialista
- Estrelas visuais

### 9. Público (1 tela)
- Agendamento público sem login
- 5-step igual ao interno

### 10. Administrativo (3 telas - admin only)
- Empresa: dados do salão, chave PIX
- Usuários: gerenciar contas
- Logs: trilha de auditoria

### 11. Acessibilidade (1 tela)
- Central de Ajuda Libras: abas Alfabeto / Números / Frases

## Integração com API (tRPC)

Configurar o cliente tRPC para apontar para o mesmo backend:

```typescript
// lib/trpc.ts
import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import * as SecureStore from "expo-secure-store";
import type { AppRouter } from "../../server/routers";

export const trpc = createTRPCReact<AppRouter>();

export function getTRPCConfig() {
  return {
    links: [
      httpBatchLink({
        url: `${API_URL}/api/trpc`,
        transformer: superjson,
        headers: async () => {
          const token = await SecureStore.getItemAsync("session_token");
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  };
}
```

## Autenticação

- Login salva JWT no SecureStore
- Todas as requests enviam token no header
- Logout limpa SecureStore + reseta QueryClient
- Proteção de rotas via `_layout.tsx` (redirect para login se não autenticado)

## Offline-First (SQLite)

```typescript
// Criar tabelas offline
await db.execAsync(`
  CREATE TABLE IF NOT EXISTS offline_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mutation TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )
`);
```

## Notificações Push

```typescript
import * as Notifications from "expo-notifications";
// Configurar handler
// Registrar token no servidor via trpc.notifications.subscribe
```

## Build

```bash
# APK Android
npx eas build --platform android --profile preview

# IPA iOS (requer macOS)
npx eas build --platform ios --profile preview
```

## Observações Importantes

1. **Não criar novas tabelas no banco** — toda a estrutura já existe em `drizzle/schema.ts`
2. **Reutilizar validações** — importar Zod schemas de `shared/validations.ts`
3. **Reutilizar tipos** — importar tipos de `shared/types.ts` e `drizzle/schema.ts`
4. **Temas** — suportar light/dark mode + alto contraste (persistir no SecureStore)
5. **Acessibilidade** — todos os botões devem ter `accessibilityLabel`, suporte a VoiceOver/TalkBack
6. **Responsividade** — suportar portrait + landscape, tablets
7. **Performance** — FlatList com `getItemLayout`, `windowSize`, `removeClippedSubviews`
8. **Tratamento de erros** — ErrorBoundary por tela, toast de erro nas mutations
