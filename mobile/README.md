# Salon Booking Mobile - Aplicativo React Native com Expo

## 📱 Visão Geral

Aplicativo móvel cross-platform (iOS e Android) desenvolvido com **React Native** e **Expo** para o sistema de gestão de salões. O app segue os mesmos padrões de design do front-end web original, mantendo a identidade visual com a paleta de cores bege/dourado.

## ✨ Funcionalidades Implementadas

### Requisitos Técnicos Obrigatórios

- ✅ **Consumo de API REST** - Integração completa com backend via Axios
- ✅ **Armazenamento local** - AsyncStorage + WatermelonDB para dados offline
- ✅ **Notificações push** - Expo Notifications com registro no backend
- ✅ **Câmera** - expo-camera para QR Code e fotos
- ✅ **Geolocalização** - expo-location para encontrar unidades próximas
- ✅ **Offline-first capability** - Sistema de fila para ações offline

### Tópicos Especiais Implementados

1. **Pagamentos digitais via PIX** - Geração e verificação de QR Code PIX
2. **Realidade aumentada** - Visualização de produtos/cortes (estrutura pronta)

## 🏗️ Arquitetura do Projeto

```
mobile/
├── src/
│   ├── app/                    # Expo Router (navegação baseada em arquivos)
│   │   ├── (tabs)/            # Navegação por abas principal
│   │   │   ├── _layout.tsx    # Layout das tabs
│   │   │   ├── index.tsx      # Dashboard
│   │   │   ├── appointments.tsx
│   │   │   ├── booking.tsx
│   │   │   ├── clients.tsx
│   │   │   └── settings.tsx
│   │   ├── login.tsx          # Tela de login
│   │   ├── _layout.tsx        # Root layout com providers
│   │   └── index.tsx          # Splash/Redirect inicial
│   ├── components/            # Componentes reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── StatCard.tsx
│   │   ├── AppointmentCard.tsx
│   │   └── LoadingScreen.tsx
│   ├── contexts/              # Contextos React
│   │   ├── AuthContext.tsx    # Autenticação
│   │   ├── ThemeContext.tsx   # Temas (light/dark/high-contrast)
│   │   └── OfflineContext.tsx # Gerenciamento offline
│   ├── hooks/                 # Custom hooks
│   │   ├── useLocation.ts     # Geolocalização
│   │   └── useQRScanner.ts    # Scanner QR Code
│   ├── services/              # Serviços externos
│   │   ├── api.ts             # Configuração Axios + endpoints
│   │   └── notifications.ts   # Notificações push
│   ├── utils/                 # Utilitários
│   │   └── colors.ts          # Paleta de cores
│   └── types/                 # Tipos TypeScript
├── assets/                     # Imagens, fontes, ícones
├── app.json                   # Configuração Expo
├── package.json
├── tsconfig.json
└── babel.config.js
```

## 🎨 Identidade Visual

A estilização segue exatamente o padrão do front-end original (`client/src/index.css`):

### Paleta de Cores Principal

```typescript
// Cores claras (padrão)
primary: '#8b6a3a'        // Cor principal (dourado escuro)
background: '#f6efe6'     // Fundo claro
foreground: '#3b2e24'     // Texto principal
card: '#ffffff'           // Cards
secondary: '#f1e6d5'      // Secundária
accent: '#c6ad8f'         // Destaque
```

### Temas Suportados

1. **Light** (padrão) - Paleta bege/dourado clara
2. **Dark** - Versão escura adaptada
3. **High Contrast** - Modo de alto contraste para acessibilidade
4. **System** - Segue configuração do dispositivo

## 🚀 Como Executar

### Pré-requisitos

```bash
# Node.js 18+
# pnpm ou npm
# Expo CLI (opcional, pode usar npx)
```

### Instalação

```bash
cd mobile

# Instalar dependências
pnpm install
# ou
npm install

# Iniciar servidor de desenvolvimento
pnpm start
# ou
npx expo start
```

### Executar em Dispositivos

```bash
# Android (emulador ou dispositivo físico)
pnpm android

# iOS (simulador - requer macOS)
pnpm ios

# Web (teste rápido)
pnpm web
```

### Build para Produção

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Configurar projeto EAS
eas build:configure

# Build Android APK
eas build -p android --profile production

# Build iOS IPA (requer conta Apple Developer)
eas build -p ios --profile production
```

## 📋 Estrutura de Componentes

### Componentes UI Reutilizáveis

| Componente | Descrição |
|------------|-----------|
| `Button` | Botões com variantes (primary, secondary, outline, destructive) |
| `Card` | Cards com títulos e variações de estilo |
| `StatCard` | Cards estatísticos com ícones e tendências |
| `AppointmentCard` | Card específico para agendamentos |
| `LoadingScreen` | Tela de carregamento padronizada |

### Custom Hooks

| Hook | Funcionalidade |
|------|---------------|
| `useAuth` | Gerenciamento de autenticação |
| `useTheme` | Controle de temas |
| `useOffline` | Detecção e fila offline |
| `useLocation` | Geolocalização com endereço reverso |
| `useQRScanner` | Scanner de QR Code com câmera |

## 🔌 Integração com Backend

### Endpoints Principais

```typescript
// Autenticação
POST /auth/login
POST /auth/register
POST /auth/logout
GET  /auth/me

// Dashboard
GET /dashboard/all

// Agendamentos
GET  /appointments
POST /appointments
PUT  /appointments/:id
PATCH /appointments/:id/cancel
PATCH /appointments/:id/complete

// Clientes, Serviços, Especialistas, Produtos
CRUD completo disponível

// Pagamentos PIX
POST /payments/pix/:appointmentId
GET  /payments/pix/:appointmentId/verify

// Notificações
POST /notifications/register
POST /notifications/unregister
```

### Configuração da API

```typescript
// Desenvolvimento
API_URL = 'http://192.168.1.100:3000'

// Produção
API_URL = 'https://api.salonbooking.com'
```

## 📦 Dependências Principais

### Core
- `expo` ~53.0.0
- `react-native` 0.79.2
- `expo-router` ~5.1.0

### Navegação
- `@react-navigation/native` ^7.0.0
- `react-native-screens` ~4.10.0
- `react-native-safe-area-context` 5.4.0

### Armazenamento
- `@react-native-async-storage/async-storage` 2.1.0
- `watermelondb` ^0.27.1
- `expo-secure-store` ~14.2.3

### Hardware/Device
- `expo-camera` ~16.1.4
- `expo-location` ~18.1.5
- `expo-notifications` ~0.30.4
- `expo-image-picker` ~16.1.4

### Rede
- `axios` ^1.12.0
- `@react-native-community/netinfo` 11.4.1

### UI/Styling
- `nativewind` ^4.1.23
- `react-native-reanimated` ~3.17.4
- `react-native-gesture-handler` ~2.24.0

## 🔒 Segurança

- Tokens JWT armazenados no `expo-secure-store` (criptografado)
- Interceptores Axios para refresh token automático
- Permissões de hardware solicitadas explicitamente
- HTTPS obrigatório em produção

## 📝 Testes

```bash
# Rodar testes unitários
pnpm test

# Testes com coverage
pnpm test --coverage
```

## 📄 Licença

MIT - Mesmo license do projeto principal

---

**Desenvolvido para o Projeto Integrado IV - 2026**

Disciplinas atendidas:
- ✅ Programação para Dispositivos Móveis
- ✅ Análise e Projeto de Sistemas
- ✅ Tópicos Especiais e Práticas em Desenvolvimento
