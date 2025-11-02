// Cliente tRPC para APIs públicas (sem autenticação)

import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { PublicRouter } from "../../../server/routers";

// Use variável de ambiente Vite se fornecida, senão use origin em runtime para deploys
const PUBLIC_API_BASE =
  (import.meta.env.VITE_PUBLIC_API_URL as string | undefined) ??
  `${globalThis.location?.origin || ""}/api`;

// Criar cliente tRPC público
export const publicTrpc = createTRPCReact<PublicRouter>();

// Provider para queries públicas
export const publicTrpcClient = publicTrpc.createClient({
  links: [
    httpBatchLink({
      url: `${PUBLIC_API_BASE}/public`,
      transformer: superjson,
      fetch(input, init) {
        console.log("[public-trpc] request:", input, init?.method || "POST");
        return globalThis.fetch(input, {
          ...(init ?? {}),
          headers: new Headers((init?.headers as Record<string, string>) || {}),
        });
      },
    }),
  ],
});
