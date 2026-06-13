import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { API_URL } from "./constants";
import type { AppRouter } from "../../server/routers";

export const publicTrpc = createTRPCReact<AppRouter>();

export function getPublicTRPCConfig() {
  return {
    links: [
      httpBatchLink({
        url: `${API_URL}/api/public`,
        transformer: superjson,
      }),
    ],
  };
}
