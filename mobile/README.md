# BizFlow Access Mobile

Aplicativo móvel para gestão de salão de beleza, desenvolvido com Expo SDK 54.

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ instalado
- pnpm instalado (`npm install -g pnpm`)
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app no seu celular (iOS/Android)

### Instalação

```bash
# Instalar dependências
cd mobile
pnpm install

# Iniciar o servidor de desenvolvimento
pnpm start

# Ou usar diretamente
npx expo start
```

### Executando o App

**No navegador (Web):**
```bash
pnpm web
# ou
npx expo start --web
```

**No dispositivo físico (Recomendado):**
1. Execute `pnpm start`
2. Escaneie o QR Code com:
   - **Android:** Expo Go app
   - **iOS:** Câmera nativa ou Expo Go app

**No emulador/simulador:**
```bash
# Android (requer Android Studio/emulador configurado)
pnpm android

# iOS (requer macOS com Xcode)
pnpm ios
```

## 📁 Estrutura do Projeto

```
mobile/
├── app/                    # Rotas do app (expo-router)
│   ├── (auth)/            # Telas de autenticação
│   ├── (tabs)/            # Navegação por abas
│   └── _layout.tsx        # Layout principal
├── components/            # Componentes reutilizáveis
│   └── ui/               # Componentes de UI base
├── hooks/                 # Custom React hooks
├── lib/                   # Utilitários e configurações
│   ├── theme.ts          # Tema e cores (alinhado com front-end)
│   ├── trpc.ts           # Configuração tRPC
│   └── storage.ts        # Armazenamento seguro
└── services/             # Serviços externos
```

## 🎨 Design System

O tema do aplicativo segue o mesmo padrão do front-end web, utilizando as cores da marca:

- **Primária:** `#8b6a3a` (Dourado escuro)
- **Secundária:** `#c6ad8f` (Bege dourado)
- **Background:** `#f6efe6` (Bege claro)
- **Foreground:** `#3b2e24` (Marrom escuro)

## 🔧 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `pnpm start` | Inicia o servidor de desenvolvimento |
| `pnpm dev` | Alias para start |
| `pnpm web` | Roda no navegador |
| `pnpm android` | Roda no emulador Android |
| `pnpm ios` | Roda no simulador iOS |
| `pnpm prebuild` | Gera projetos nativos |

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto mobile:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Ou configure no `app.json`:

```json
{
  "expo": {
    "extra": {
      "API_URL": "http://localhost:3000"
    }
  }
}
```

## 📱 Recursos Implementados

- ✅ Autenticação com JWT
- ✅ tRPC para comunicação com backend
- ✅ React Query para cache de dados
- ✅ Theme dark/light mode
- ✅ Offline-first com persistência
- ✅ Notificações push
- ✅ Upload de imagens
- ✅ Acessibilidade (alto contraste, fonte ajustável)

## 🐛 Troubleshooting

### Erro: "Module not found"
```bash
pnpm clean
pnpm install
pnpm start --clear
```

### Problemas de conexão com API
- Verifique se o backend está rodando em `http://localhost:3000`
- No emulador Android, use `http://10.0.2.2:3000`
- No dispositivo físico, use o IP da sua máquina na rede local

### Build falhando
```bash
# Limpar cache
npx expo start --clear

# Reinstalar dependências
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📚 Recursos Úteis

- [Expo Docs](https://docs.expo.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [tRPC Documentation](https://trpc.io/docs/)
- [TanStack Query](https://tanstack.com/query/latest/)

## 🤝 Contribuição

1. Crie uma branch para sua feature
2. Faça commit das mudanças
3. Envie um PR para revisão
