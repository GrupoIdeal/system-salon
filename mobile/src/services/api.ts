import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../server/_core/trpc";

/**
 * Configuração do cliente tRPC para React Native
 * @description Cliente compartilhado para comunicação com o backend
 */

// URL do backend - deve ser configurada via variável de ambiente
const getApiUrl = () => {
  // Em desenvolvimento, usar IP local da máquina
  if (__DEV__) {
    return "http://localhost:3000/trpc";
  }
  // Em produção, usar URL configurada
  return process.env.EXPO_PUBLIC_API_URL ?? "https://api.salonbooking.com/trpc";
};

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: getApiUrl(),
      transformer: superjson,
      async headers() {
        // Adicionar autenticação se disponível
        // Implementar com SecureStore ou AsyncStorage
        return {};
      },
      fetch(url, options) {
        return fetch(url, {
          ...options,
          // Configurações específicas para React Native
        });
      },
    }),
  ],
});

/**
 * Hook para obter estado de conexão com a API
 */
export function useApiHealth() {
  // Será implementado com React Query
  return {
    isConnected: true,
    lastCheck: new Date(),
    error: null as Error | null,
  };
}

export default trpcClient;
