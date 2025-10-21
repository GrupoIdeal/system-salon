import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";
import { clearAuthToken, getAuthToken } from "@/lib/auth-utils";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();

  // Verifica se há um token armazenado antes de fazer a consulta
  const hasToken = Boolean(getAuthToken());

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    // Não fazer a consulta se não houver token
    enabled: hasToken,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      clearAuthToken();
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        // Mesmo se a API falhar, ainda assim limpe os tokens locais
        clearAuthToken();
        return;
      }
      throw error;
    } finally {
      // Garante que o token seja removido do localStorage
      clearAuthToken();
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    // Só armazena os dados do usuário se tivermos um token e dados válidos
    if (hasToken && meQuery.data) {
      localStorage.setItem(
        "manus-runtime-user-info",
        JSON.stringify(meQuery.data)
      );
    }

    return {
      user: meQuery.data ?? null,
      // Só considera como carregando se tivermos um token e a consulta estiver em andamento
      loading: hasToken && (meQuery.isLoading || logoutMutation.isPending),
      error: meQuery.error ?? logoutMutation.error ?? null,
      // Só considera como autenticado se tivermos um token e dados de usuário
      isAuthenticated: hasToken && Boolean(meQuery.data),
    };
  }, [
    hasToken,
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
