// Cliente tRPC para APIs públicas (sem autenticação)

import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { PublicRouter } from "@server/routers";
import { getApiBaseUrl } from "@/lib/capacitor";

const apiBase = getApiBaseUrl();
const PUBLIC_API_BASE = apiBase
  ? `${apiBase}/api`
  : `${globalThis.location?.origin || ""}/api`;

// Criar cliente tRPC público
export const publicTrpc = createTRPCReact<PublicRouter>();

// Provider para queries públicas
export const publicTrpcClient = publicTrpc.createClient({
  links: [
    httpBatchLink({
      url: `${PUBLIC_API_BASE}/public`,
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          headers: new Headers((init?.headers as Record<string, string>) || {}),
        });
      },
    }),
  ],
});
