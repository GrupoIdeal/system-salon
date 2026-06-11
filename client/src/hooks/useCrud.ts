import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AppRouter } from "@server/_core/trpc";
import { trpc } from "@/lib/trpc";
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server";

type Router = AppRouter;

// Helper types para inferir inputs e outputs das procedures
type InferProcedureInput<T extends keyof Router> = inferProcedureInput<Router[T]>;
type InferProcedureOutput<T extends keyof Router> = inferProcedureOutput<Router[T]>;

/**
 * Hook genérico para listagem de dados com paginação e filtros
 * @example const { data, isLoading, error } = useCrudList('getSpecialists', { salonId: '123' });
 */
export function useCrudList<
  TProcedure extends keyof Router,
  TInput extends Partial<InferProcedureInput<TProcedure>> = Partial<InferProcedureInput<TProcedure>>,
>(
  procedureName: TProcedure,
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
      const client = await trpc();
      const procedure = client[procedureName] as (input: TInput) => Promise<InferProcedureOutput<TProcedure>>;
      return await procedure(input as TInput);
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 1000 * 60 * 5, // 5 minutes
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook genérico para obtenção de um único item por ID
 * @example const { data, isLoading, error } = useCrudOne('getServiceById', { id: '123' });
 */
export function useCrudOne<
  TProcedure extends keyof Router,
  TInput extends { id: string } & Partial<Omit<InferProcedureInput<TProcedure>, 'id'>> = { id: string } & Partial<Omit<InferProcedureInput<TProcedure>, 'id'>>,
>(
  procedureName: TProcedure,
  input: TInput,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: [procedureName, input.id],
    queryFn: async () => {
      const client = await trpc();
      const procedure = client[procedureName] as (input: TInput) => Promise<InferProcedureOutput<TProcedure>>;
      return await procedure(input);
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 1000 * 60 * 5,
  });
}

/**
 * Hook genérico para criação de registros
 * @example const { mutate, isPending, error } = useCrudCreate('createSpecialist');
 */
export function useCrudCreate<
  TProcedure extends keyof Router,
  TInput extends InferProcedureInput<TProcedure> = InferProcedureInput<TProcedure>,
>(
  procedureName: TProcedure,
  options?: {
    onSuccess?: (data: InferProcedureOutput<TProcedure>) => void;
    onError?: (error: Error) => void;
    invalidateQueries?: Array<{ procedure: keyof Router; input?: any }>;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TInput) => {
      const client = await trpc();
      const procedure = client[procedureName] as (input: TInput) => Promise<InferProcedureOutput<TProcedure>>;
      return await procedure(input);
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
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
 * @example const { mutate, isPending, error } = useCrudUpdate('updateSpecialist');
 */
export function useCrudUpdate<
  TProcedure extends keyof Router,
  TInput extends InferProcedureInput<TProcedure> = InferProcedureInput<TProcedure>,
>(
  procedureName: TProcedure,
  options?: {
    onSuccess?: (data: InferProcedureOutput<TProcedure>) => void;
    onError?: (error: Error) => void;
    invalidateQueries?: Array<{ procedure: keyof Router; input?: any }>;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TInput) => {
      const client = await trpc();
      const procedure = client[procedureName] as (input: TInput) => Promise<InferProcedureOutput<TProcedure>>;
      return await procedure(input);
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
 * @example const { mutate, isPending, error } = useCrudDelete('deleteSpecialist');
 */
export function useCrudDelete<
  TProcedure extends keyof Router,
  TInput extends { id: string } & Partial<Omit<InferProcedureInput<TProcedure>, 'id'>> = { id: string } & Partial<Omit<InferProcedureInput<TProcedure>, 'id'>>,
>(
  procedureName: TProcedure,
  options?: {
    onSuccess?: (data: InferProcedureOutput<TProcedure>) => void;
    onError?: (error: Error) => void;
    invalidateQueries?: Array<{ procedure: keyof Router; input?: any }>;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TInput) => {
      const client = await trpc();
      const procedure = client[procedureName] as (input: TInput) => Promise<InferProcedureOutput<TProcedure>>;
      return await procedure(input);
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
 * @example const crud = useCrud('specialist', 'getSpecialistsBySalonId', 'createSpecialist', 'updateSpecialist', 'deleteSpecialist', { salonId: '123' });
 */
export function useCrud<
  TEntity extends string,
  TListProcedure extends keyof Router,
  TCreateProcedure extends keyof Router,
  TUpdateProcedure extends keyof Router,
  TDeleteProcedure extends keyof Router,
>(
  entity: TEntity,
  listProcedure: TListProcedure,
  createProcedure: TCreateProcedure,
  updateProcedure: TUpdateProcedure,
  deleteProcedure: TDeleteProcedure,
  listInput?: Partial<InferProcedureInput<TListProcedure>>,
  options?: {
    staleTime?: number;
    onSuccess?: (action: 'create' | 'update' | 'delete', data: any) => void;
    onError?: (action: 'create' | 'update' | 'delete', error: Error) => void;
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
      options?.onSuccess?.('create', data);
    },
    onError: (error) => options?.onError?.('create', error),
  });

  const updateMutation = useCrudUpdate(updateProcedure, {
    onSuccess: (data) => {
      invalidateEntityQueries();
      options?.onSuccess?.('update', data);
    },
    onError: (error) => options?.onError?.('update', error),
  });

  const deleteMutation = useCrudDelete(deleteProcedure, {
    onSuccess: (data) => {
      invalidateEntityQueries();
      options?.onSuccess?.('delete', data);
    },
    onError: (error) => options?.onError?.('delete', error),
  });

  return {
    // List
    data: listQuery.data,
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    error: listQuery.error,
    refetch: listQuery.refetch,
    
    // Create
    create: createMutation.mutate,
    createAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    
    // Update
    update: updateMutation.mutate,
    updateAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    
    // Delete
    delete: deleteMutation.mutate,
    deleteAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export type UseCrudReturn = ReturnType<typeof useCrud<any, any, any, any, any>>;
