import Constants from "expo-constants";

const ENV = Constants.expoConfig?.extra;

export const API_URL = ENV?.API_URL ?? process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export const APP_NAME = "BizFlow Access";

export const STORAGE_KEYS = {
  SESSION_TOKEN: "session_token",
  THEME_MODE: "theme_mode",
  ACCESSIBILITY_FONT_SIZE: "accessibility_font_size",
  ACCESSIBILITY_HIGH_CONTRAST: "accessibility_high_contrast",
  OFFLINE_QUEUE: "offline_queue",
} as const;

export const QUERY_KEYS = {
  DASHBOARD: ["dashboard"],
  CLIENTS: ["clients"],
  SERVICES: ["services"],
  SPECIALISTS: ["specialists"],
  APPOINTMENTS: ["appointments"],
  PRODUCTS: ["products"],
  RATINGS: ["ratings"],
  SALON: ["salon"],
  USERS: ["users"],
  AUDIT_LOGS: ["auditLogs"],
  SCHEDULE: ["schedule"],
  AVAILABLE_SLOTS: ["availableSlots"],
} as const;

export const ERROR_MESSAGES = {
  NETWORK: "Erro de conexão. Verifique sua internet.",
  UNAUTHORIZED: "Sessão expirada. Faça login novamente.",
  GENERIC: "Ocorreu um erro. Tente novamente.",
} as const;
