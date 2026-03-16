import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { registerRoute } from "workbox-routing";
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

declare let self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();

cleanupOutdatedCaches();
// Faz o precache de todos os assets gerados pelo Vite (JS, CSS, imagens)
precacheAndRoute(self.__WB_MANIFEST);

// ──────────────────────────────────────────────────────────────
// Estratégia "Cache First" para assets estáticos (fontes, imagens)
// Serve do cache imediatamente; útil para PWA offline.
// ──────────────────────────────────────────────────────────────
registerRoute(
  ({ request }) =>
    request.destination === "image" || request.destination === "font",
  new CacheFirst({
    cacheName: "static-assets",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        // Assets ficam em cache por 30 dias
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

// ──────────────────────────────────────────────────────────────
// Estratégia "Stale While Revalidate" para scripts e estilos
// Serve versão em cache instantaneamente e atualiza em background.
// ──────────────────────────────────────────────────────────────
registerRoute(
  ({ request }) =>
    request.destination === "script" || request.destination === "style",
  new StaleWhileRevalidate({
    cacheName: "js-css-cache",
  })
);

// ──────────────────────────────────────────────────────────────
// Estratégia "Network First" para chamadas da API tRPC
// Tenta buscar da rede; em modo offline usa o cache salvo.
// ⚙️ Ponto de troca: aumentar maxAgeSeconds para cache mais longo.
// ──────────────────────────────────────────────────────────────
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkFirst({
    cacheName: "api-cache",
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        // Dados da API ficam em cache por 5 minutos
        maxAgeSeconds: 5 * 60,
      }),
    ],
  })
);
