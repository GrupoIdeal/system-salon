const IS_DEBUG = process.env.NODE_ENV !== "production";

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function formatMessage(level: LogLevel, module: string, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${module}]`;
  if (data !== undefined) {
    const dataStr = typeof data === "string" ? data : JSON.stringify(data);
    return `${prefix} ${message} ${dataStr}`;
  }
  return `${prefix} ${message}`;
}

function shouldLog(level: LogLevel): boolean {
  if (level === "debug" && !IS_DEBUG) return false;
  return true;
}

function log(level: LogLevel, module: string, message: string, data?: unknown): void {
  if (!shouldLog(level)) return;
  const formatted = formatMessage(level, module, message, data);
  switch (level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "debug":
    case "info":
    default:
      console.log(formatted);
      break;
  }
}

export function createLogger(module: string) {
  return {
    debug: (message: string, data?: unknown) => log("debug", module, message, data),
    info: (message: string, data?: unknown) => log("info", module, message, data),
    warn: (message: string, data?: unknown) => log("warn", module, message, data),
    error: (message: string, data?: unknown) => log("error", module, message, data),
  };
}
