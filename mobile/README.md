# BizFlow Access - Mobile (React Native)

Aplicativo mobile do sistema BizFlow Access desenvolvido com React Native (Expo).

## Estrutura

```
mobile/
├── app/              # Expo Router (pages + layouts)
├── components/       # Componentes reutilizáveis
├── hooks/            # Custom hooks
├── lib/              # Utilitários (tRPC client, storage)
├── services/         # Lógica de negócio (offline, sync)
├── app.json          # Configuração Expo
└── package.json
```

## Getting Started

```bash
cd mobile
npx expo start
```

## Recursos

- tRPC client para consumir a API existente
- Expo Router para navegação
- expo-sqlite para cache offline
- expo-notifications para push
- expo-camera + expo-location

---

**Skill:** Use `mobile-rn` no OpenCode para ativar as instruções de desenvolvimento mobile.
