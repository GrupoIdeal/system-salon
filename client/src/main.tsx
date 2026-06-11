import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from "@shared/const";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl, APP_TITLE } from "./const";
import { getAuthToken } from "@/lib/auth-utils";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Dados considerados "frescos" por 5 min — evita re-fetch desnecessário
      staleTime: 5 * 60 * 1000,
      // Cache mantido por 10 min após o componente desmontar
      gcTime: 10 * 60 * 1000,
      // Apenas 1 retry em caso de erro (padrão é 3)
      retry: 1,
      // Não re-busca automaticamente ao retornar à aba do browser
      refetchOnWindowFocus: false,
    },
  },
});

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

// Atualiza o título da página dinamicamente com o valor da variável de ambiente
if (typeof document !== "undefined" && APP_TITLE) {
  document.title = APP_TITLE;
}

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        // Obter token de autenticação do localStorage
        const authToken = getAuthToken();

        // Adicionar o token ao header de autorização se disponível
        const headers = new Headers(
          (init?.headers as Record<string, string>) || {}
        );
        if (authToken) {
          headers.set("Authorization", `Bearer ${authToken}`);
        }

        return globalThis.fetch(input, {
          ...(init ?? {}),
          headers,
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root") as HTMLElement).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
