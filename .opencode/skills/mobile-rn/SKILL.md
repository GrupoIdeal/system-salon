---
name: mobile-rn
description: Mobile app development with React Native (Expo) for the BizFlow Access salon management system
license: MIT
compatibility: opencode
metadata:
  platform: mobile
  framework: react-native
  language: typescript
---

## What I Do

I handle all mobile-specific development for the BizFlow Access project using **React Native** with **Expo**. I build the companion mobile app in the `mobile/` directory that complements the existing PWA web app.

## When to Use Me

Use this skill when:
- Creating new screens or components for the mobile app
- Implementing native features (camera, geolocation, push notifications, biometrics)
- Building the React Native bridge to the existing tRPC API
- Generating APK/IPA builds for distribution
- Adding mobile-specific UI/UX patterns

## Project Context

The existing `system-salon` web app (PWA) has the following shared components:
- **API:** tRPC with full type safety (routers for auth, clients, services, appointments, products, etc.)
- **Validation:** Zod schemas in `shared/validations.ts`
- **Types:** Database types in `drizzle/schema.ts` and `shared/types.ts`
- **Auth:** JWT-based authentication with httpOnly cookies

The mobile app should reuse the shared types and validation from the web project.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React Native (Expo) | Cross-platform mobile framework |
| TypeScript | Type safety |
| Expo Router | File-based navigation |
| tRPC Client | API communication |
| TanStack React Query | Server state management |
| expo-secure-store | Secure token storage |
| expo-camera | Camera integration |
| expo-location | Geolocation |
| expo-notifications | Push notifications |
| expo-sqlite | Local database (offline-first) |
| expo-auth-session | OAuth authentication |
| react-native-paper | UI components |
| react-native-reanimated | Animations |

## Architecture

```
mobile/
├── app/                    # Expo Router pages
│   ├── (auth)/             # Login, register, password reset
│   ├── (tabs)/             # Main tab navigation
│   │   ├── dashboard.tsx
│   │   ├── clients.tsx
│   │   ├── services.tsx
│   │   ├── appointments.tsx
│   │   ├── products.tsx
│   │   └── settings.tsx
│   ├── ajuda-libras/       # Libras help screen
│   └── _layout.tsx         # Root layout
├── components/             # Shared components
│   ├── AccessibilityBar.tsx
│   ├── PixQRCode.tsx
│   └── ui/                 # Reusable UI primitives
├── hooks/                  # Custom hooks
│   ├── useAuth.ts
│   └── usePushNotifications.ts
├── lib/                    # Utilities
│   ├── trpc.ts             # tRPC client setup
│   ├── api.ts              # API helpers
│   └── storage.ts          # Secure storage
├── services/               # Business logic
│   └── offline.ts          # Offline queue
├── app.json                # Expo config
└── package.json
```

## Key Implementation Details

### 1. tRPC Client Setup
```typescript
// lib/trpc.ts
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../server/routers";
export const trpc = createTRPCReact<AppRouter>();
```

### 2. Authentication
Use `expo-secure-store` to store the JWT token and send it as an httpOnly cookie equivalent:
```typescript
import * as SecureStore from "expo-secure-store";
await SecureStore.setItemAsync("session_token", token);
```

### 3. Offline-First
Use `expo-sqlite` for local cache and queue pending mutations when offline:
```typescript
// services/offline.ts
import * as SQLite from "expo-sqlite";
const db = await SQLite.openDatabaseAsync("bizflow.db");
```

### 4. Push Notifications
Use `expo-notifications` to register for push tokens:
```typescript
import * as Notifications from "expo-notifications";
const token = await Notifications.getExpoPushTokenAsync();
```

### 5. Camera Integration
```typescript
import { CameraView } from "expo-camera";
// Upload to Cloudinary via the existing API
```

### 6. Geolocation
```typescript
import * as Location from "expo-location";
const location = await Location.getCurrentPositionAsync({});
```

## Navigation Structure (Expo Router)

```
(tabs)/                  # Bottom tab navigator
├── dashboard.tsx        # Home screen with KPIs
├── clients.tsx          # Client list + CRUD
├── services.tsx         # Service catalog
├── appointments.tsx     # Appointment calendar
├── products.tsx         # Inventory management
└── settings.tsx         # Profile + accessibility settings

(modal)/                 # Modal screens
├── booking.tsx          # New appointment (5-step flow)
├── checkout.tsx         # Complete appointment + payment
├── rating.tsx           # Post-service rating
└── ajuda-libras.tsx     # Libras help
```

## Build & Deploy

```bash
# Development
npx expo start

# Android APK
npx eas build --platform android --profile preview

# iOS IPA (requires macOS)
npx eas build --platform ios --profile preview
```

## Coding Patterns

- Use `StyleSheet.create()` for styles (not inline styles)
- Follow the same naming conventions as the web project
- Import shared types from `@shared/` path alias
- Use React Query for all server state
- Components should be testable with React Native Testing Library

## Mobile-Specific Features to Implement

1. Biometric authentication (fingerprint/face ID)
2. Push notifications via Expo Push API
3. Offline appointment creation with sync
4. Native share sheet for PIX code
5. Haptic feedback for interactions
6. Bottom sheet modals for forms
7. Pull-to-refresh on lists
8. Infinite scroll for large datasets
