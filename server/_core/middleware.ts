// @ts-nocheck — middleware legado (não utilizado, aguardando refactor para tRPC v11)
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { TrpcContext } from "./context";

/**
 * Middleware de validação de input genérico
 * @description Valida o input de procedures usando schemas Zod
 */
export function validateInput<T extends z.ZodType>(schema: T) {
  return async ({ next, rawInput }: Parameters<ProcedureMiddleware<TrpcContext>>[0]) => {
    const parseResult = await schema.safeParseAsync(rawInput);
    
    if (!parseResult.success) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Validation failed",
        cause: parseResult.error.errors,
      });
    }

    return next({
      rawInput: parseResult.data,
    });
  };
}

/**
 * Middleware para garantir que usuário tem salão associado
 * @description Verifica se o usuário autenticado possui um salão vinculado
 */
export const requireSalon: ProcedureMiddleware<TrpcContext> = async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Usuário não autenticado",
    });
  }

  // Import lazy para evitar circular dependency
  const { getSalonByUserId } = await import("../db");
  const salon = await getSalonByUserId(ctx.user.id);

  if (!salon) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Usuário não possui um salão associado",
    });
  }

  return next({
    ctx: {
      ...ctx,
      salon,
    },
  });
};

/**
 * Middleware para verificar permissões granulares
 * @description Verifica se usuário possui permissão específica baseada em JSON permissions
 */
export function requirePermission(permission: string): ProcedureMiddleware<TrpcContext> {
  return async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Usuário não autenticado",
      });
    }

    // Admin tem todas as permissões
    if (ctx.user.role === "admin") {
      return next();
    }

    // Verificar permissões granulares
    const hasPermission = ctx.user.permissions?.[permission] === true;
    
    if (!hasPermission) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Permissão necessária: ${permission}`,
      });
    }

    return next();
  };
}

/**
 * Middleware para logging de auditoria
 * @description Loga automaticamente ações realizadas nas procedures
 */
export function auditLog(action: {
  entity: string;
  action: "create" | "update" | "delete" | "read";
  getDescription?: (input: any, result: any) => string;
}): ProcedureMiddleware<TrpcContext> {
  return async ({ ctx, next, rawInput }) => {
    const result = await next();
    
    // Log assíncrono para não bloquear a response
    setImmediate(async () => {
      try {
        const { createAuditLog } = await import("../db");
        
        await createAuditLog({
          id: crypto.randomUUID(),
          userId: ctx.user?.id ?? null,
          salonId: ctx.user?.salonId ?? null,
          action: action.action,
          entity: action.entity,
          entityId: typeof rawInput === "object" && rawInput !== null && "id" in rawInput 
            ? String(rawInput.id) 
            : null,
          before: null,
          after: result.data ?? null,
          metadata: {
            input: sanitizeInput(rawInput),
            description: action.getDescription?.(rawInput, result.data),
          },
        });
      } catch (error) {
        console.error("[AuditLog] Failed to create log:", error);
      }
    });

    return result;
  };
}

/**
 * Sanitiza input para logging (remove dados sensíveis)
 */
function sanitizeInput(input: unknown): unknown {
  if (typeof input !== "object" || input === null) {
    return input;
  }

  const sensitiveFields = ["password", "token", "secret", "creditCard", "cvv"];
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Middleware para rate limiting por procedure
 * @description Limita número de requisições por janela de tempo
 */
export function rateLimit(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}): ProcedureMiddleware<TrpcContext> {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  return async ({ ctx, next, path }) => {
    const ip = ctx.req.ip ?? ctx.req.socket.remoteAddress ?? "unknown";
    const key = `${ip}:${path}`;
    const now = Date.now();

    const record = requestCounts.get(key);
    
    if (!record || now > record.resetTime) {
      // Nova janela
      requestCounts.set(key, {
        count: 1,
        resetTime: now + options.windowMs,
      });
    } else {
      // Dentro da janela
      record.count++;
      
      if (record.count > options.maxRequests) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: options.message ?? "Muitas requisições. Tente novamente mais tarde.",
        });
      }
      
      requestCounts.set(key, record);
    }

    return next();
  };
}

/**
 * Middleware composto para operações CRUD padrão
 * @description Combina validação, requerimento de salão e audit log
 */
export function crudMiddleware<T extends z.ZodType>(options: {
  schema?: T;
  entity: string;
  action: "create" | "update" | "delete" | "read";
}) {
  const middlewares: Array<ProcedureMiddleware<TrpcContext>> = [];

  if (options.schema) {
    middlewares.push(validateInput(options.schema));
  }

  middlewares.push(requireSalon);

  middlewares.push(auditLog({
    entity: options.entity,
    action: options.action,
  }));

  return middlewares;
}

// Helper para criptografia (usando crypto do Node)
const crypto = await import("crypto");
