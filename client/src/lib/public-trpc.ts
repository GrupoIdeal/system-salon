// Cliente tRPC para APIs públicas (sem autenticação)

import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { PublicRouter } from "../../../server/routers";

// Criar cliente tRPC público
export const publicTrpc = createTRPCReact<PublicRouter>();

// Provider para queries públicas
export const publicTrpcClient = publicTrpc.createClient({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/api/public",
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
