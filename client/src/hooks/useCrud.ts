import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

/**
 * Hook genérico para listagem de dados com paginação e filtros
 */
export function useCrudList<TInput extends AnyRecord = AnyRecord>(
  procedureName: string,
  input?: TInput,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: [procedureName, input],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client: any = trpc;
      return await client[procedureName](input);
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 1000 * 60 * 5,
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook genérico para obtenção de um único item por ID
 */
export function useCrudOne<TInput extends { id: string } = { id: string }>(
  procedureName: string,
  input: TInput,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: [procedureName, input.id],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client: any = trpc;
      return await client[procedureName](input);
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 1000 * 60 * 5,
  });
}

/**
 * Hook genérico para criação de registros
 */
export function useCrudCreate<TInput extends AnyRecord = AnyRecord>(
  procedureName: string,
  options?: {
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
    invalidateQueries?: Array<{ procedure: string; input?: any }>;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TInput) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client: any = trpc;
      return await client[procedureName](input);
    },
    onSuccess: (data) => {
      options?.invalidateQueries?.forEach(({ procedure, input }) => {
        queryClient.invalidateQueries({ queryKey: [procedure, input] });
      });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

/**
 * Hook genérico para atualização de registros
 */
export function useCrudUpdate<TInput extends AnyRecord = AnyRecord>(
  procedureName: string,
  options?: {
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
    invalidateQueries?: Array<{ procedure: string; input?: any }>;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TInput) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client: any = trpc;
      return await client[procedureName](input);
    },
    onSuccess: (data) => {
      options?.invalidateQueries?.forEach(({ procedure, input }) => {
        queryClient.invalidateQueries({ queryKey: [procedure, input] });
      });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

/**
 * Hook genérico para exclusão de registros
 */
export function useCrudDelete<TInput extends { id: string } = { id: string }>(
  procedureName: string,
  options?: {
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
    invalidateQueries?: Array<{ procedure: string; input?: any }>;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TInput) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client: any = trpc;
      return await client[procedureName](input);
    },
    onSuccess: (data) => {
      options?.invalidateQueries?.forEach(({ procedure, input }) => {
        queryClient.invalidateQueries({ queryKey: [procedure, input] });
      });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

/**
 * Hook combinado para operações CRUD completas
 */
export function useCrud(
  entity: string,
  listProcedure: string,
  createProcedure: string,
  updateProcedure: string,
  deleteProcedure: string,
  listInput?: AnyRecord,
  options?: {
    staleTime?: number;
    onSuccess?: (action: "create" | "update" | "delete", data: any) => void;
    onError?: (
      action: "create" | "update" | "delete",
      error: Error
    ) => void;
  }
) {
  const queryClient = useQueryClient();

  const invalidateEntityQueries = () => {
    queryClient.invalidateQueries({ queryKey: [entity] });
  };

  const listQuery = useCrudList(listProcedure, listInput, {
    staleTime: options?.staleTime,
  });

  const createMutation = useCrudCreate(createProcedure, {
    onSuccess: (data) => {
      invalidateEntityQueries();
      options?.onSuccess?.("create", data);
    },
    onError: (error) => options?.onError?.("create", error),
  });

  const updateMutation = useCrudUpdate(updateProcedure, {
    onSuccess: (data) => {
      invalidateEntityQueries();
      options?.onSuccess?.("update", data);
    },
    onError: (error) => options?.onError?.("update", error),
  });

  const deleteMutation = useCrudDelete(deleteProcedure, {
    onSuccess: (data) => {
      invalidateEntityQueries();
      options?.onSuccess?.("delete", data);
    },
    onError: (error) => options?.onError?.("delete", error),
  });

  return {
    data: listQuery.data,
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    error: listQuery.error,
    refetch: listQuery.refetch,

    create: createMutation.mutate,
    createAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    update: updateMutation.mutate,
    updateAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    delete: deleteMutation.mutate,
    deleteAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export type UseCrudReturn = ReturnType<typeof useCrud>;
