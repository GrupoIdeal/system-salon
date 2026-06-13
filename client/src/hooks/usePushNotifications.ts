import { useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

// Chave pública VAPID para Web Push
// Em produção: gerar via web-push ou dashboard do seu provedor de push
const VAPID_PUBLIC_KEY = "BIs_fake_VAPID_PUBLIC_KEY_replace_in_production";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from(rawData.split("").map((char) => char.charCodeAt(0)));
}

export function usePushNotifications(enabled: boolean = true) {
  const subscribeMutation = trpc.notifications.subscribe.useMutation();
  const unsubscribeMutation = trpc.notifications.unsubscribe.useMutation();
  const registered = useRef(false);

  useEffect(() => {
    if (!enabled || registered.current) return;

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("📱 Push notifications não suportadas neste navegador");
      return;
    }

    async function registerPush() {
      try {
        const registration = await navigator.serviceWorker.ready;

        // Verificar se já existe subscription
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
          // Já registrado, enviar para o servidor
          await subscribeMutation.mutateAsync({
            endpoint: existing.endpoint,
            keys: {
              p256dh: btoa(
                String.fromCharCode(
                  ...new Uint8Array(
                    existing.getKey("p256dh") || new Uint8Array()
                  )
                )
              ),
              auth: btoa(
                String.fromCharCode(
                  ...new Uint8Array(
                    existing.getKey("auth") || new Uint8Array()
                  )
                )
              ),
            },
          });
          registered.current = true;
          return;
        }

        // Solicitar permissão
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("📱 Permissão de notificação negada");
          return;
        }

        // Criar nova subscription
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
        });

        await subscribeMutation.mutateAsync({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(
              String.fromCharCode(
                ...new Uint8Array(
                  subscription.getKey("p256dh") || new Uint8Array()
                )
              )
            ),
            auth: btoa(
              String.fromCharCode(
                ...new Uint8Array(
                  subscription.getKey("auth") || new Uint8Array()
                )
              )
            ),
          },
        });

        registered.current = true;
        console.log("📱 Push notifications registradas com sucesso");
      } catch (err) {
        console.error("📱 Erro ao registrar push notifications:", err);
      }
    }

    registerPush();

    return () => {
      // Cleanup opcional: cancelar subscription ao desmontar
    };
  }, [enabled]);
}
