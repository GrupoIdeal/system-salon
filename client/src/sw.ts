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
// ──────────────────────────────────────────────────────────────
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkFirst({
    cacheName: "api-cache",
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60,
      }),
    ],
  })
);

// ──────────────────────────────────────────────────────────────
// WEB PUSH NOTIFICATIONS
// ──────────────────────────────────────────────────────────────

// Escuta eventos de push: exibe notificação quando recebida
self.addEventListener("push", (event: PushEvent) => {
  let data: {
    title?: string;
    body?: string;
    icon?: string;
    badge?: string;
    url?: string;
  } = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: event.data.text() };
    }
  }

  const title = data.title || "Graciosa Studio";
  const options = {
    body: data.body || "Você tem uma nova notificação",
    icon: data.icon || "/image/Logo.png",
    badge: data.badge || "/image/favicon.png",
    vibrate: [200, 100, 200],
    tag: "salon-notification",
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || "/dashboard",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Abre a URL quando o usuário clica na notificação
self.addEventListener(
  "notificationclick",
  (event: NotificationEvent) => {
    event.notification.close();

    const urlToOpen =
      ((event.notification.data as Record<string, unknown>)?.url as string) || "/dashboard";

    event.waitUntil(
      self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((windowClients) => {
          // Se já tem uma janela aberta, foca nela e navega
          for (const client of windowClients) {
            if ("url" in client && "focus" in client) {
              client.focus();
              if ("navigate" in client) {
                (client as WindowClient).navigate(urlToOpen);
              }
              return;
            }
          }
          // Abre nova janela
          return self.clients.openWindow(urlToOpen);
        })
    );
  }
);
