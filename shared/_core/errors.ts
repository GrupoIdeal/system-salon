/**
 * Base HTTP error class with status code.
 * Throw this from route handlers to send specific HTTP errors.
 */
export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "HttpError";
  }

  toJSON() {
    return {
      name: this.name,
      statusCode: this.statusCode,
      message: this.message,
      code: this.code,
      details: this.details,
      stack: process.env.NODE_ENV === "development" ? this.stack : undefined,
    };
  }
}

// Convenience constructors
export const BadRequestError = (msg: string, code?: string, details?: Record<string, unknown>) => 
  new HttpError(400, msg, code, details);

export const UnauthorizedError = (msg: string, code?: string, details?: Record<string, unknown>) => 
  new HttpError(401, msg, code, details);

export const ForbiddenError = (msg: string, code?: string, details?: Record<string, unknown>) => 
  new HttpError(403, msg, code, details);

export const NotFoundError = (msg: string, code?: string, details?: Record<string, unknown>) => 
  new HttpError(404, msg, code, details);

export const ConflictError = (msg: string, code?: string, details?: Record<string, unknown>) => 
  new HttpError(409, msg, code, details);

export const TooManyRequestsError = (msg: string, code?: string, details?: Record<string, unknown>) => 
  new HttpError(429, msg, code, details);

export const InternalServerError = (msg: string, code?: string, details?: Record<string, unknown>) => 
  new HttpError(500, msg, code, details);

/**
 * Error codes padronizados para toda a aplicação
 */
export const ErrorCodes = {
  // Auth errors
  AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  AUTH_TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
  AUTH_TOKEN_INVALID: "AUTH_TOKEN_INVALID",
  AUTH_USER_NOT_FOUND: "AUTH_USER_NOT_FOUND",
  
  // Validation errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  VALIDATION_EMAIL_INVALID: "VALIDATION_EMAIL_INVALID",
  VALIDATION_PHONE_INVALID: "VALIDATION_PHONE_INVALID",
  
  // Resource errors
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  RESOURCE_CONFLICT: "RESOURCE_CONFLICT",
  RESOURCE_ALREADY_EXISTS: "RESOURCE_ALREADY_EXISTS",
  
  // Permission errors
  PERMISSION_DENIED: "PERMISSION_DENIED",
  ROLE_INSUFFICIENT: "ROLE_INSUFFICIENT",
  
  // Business logic errors
  APPOINTMENT_SLOT_UNAVAILABLE: "APPOINTMENT_SLOT_UNAVAILABLE",
  APPOINTMENT_TIME_PAST: "APPOINTMENT_TIME_PAST",
  SPECIALIST_UNAVAILABLE: "SPECIALIST_UNAVAILABLE",
  
  // System errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
} as const;

/**
 * Tipo utilitário para respostas de erro padronizadas
 */
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
    stack?: string;
  };
}

/**
 * Tipo utilitário para respostas de sucesso padronizadas
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

/**
 * Tipo unificado para respostas da API
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Helper para criar respostas de sucesso
 */
export function successResponse<T>(data: T, meta?: SuccessResponse<T>["meta"]): SuccessResponse<T> {
  return { success: true, data, meta };
}

/**
 * Helper para criar respostas de erro
 */
export function errorResponse(error: HttpError | Error, includeStack = false): ErrorResponse {
  const httpError = error instanceof HttpError ? error : BadRequestError(error.message);
  
  return {
    success: false,
    error: {
      message: httpError.message,
      code: httpError.code,
      details: httpError.details,
      stack: includeStack && process.env.NODE_ENV === "development" ? httpError.stack : undefined,
    },
  };
}
