/**
 * Tipos compartilhados entre Web e Mobile
 * Importa tipos do shared/ para garantir consistência
 */

// Re-exportar todos os tipos do shared
export type {
  User,
  InsertUser,
  Salon,
  InsertSalon,
  Specialist,
  InsertSpecialist,
  Client,
  InsertClient,
  Service,
  InsertService,
  Appointment,
  InsertAppointment,
  AppointmentWithDetails,
  Transaction,
  InsertTransaction,
  PasswordReset,
  InsertPasswordReset,
  SpecialistScheduleRow,
  InsertSpecialistSchedule,
  AuditLog,
  InsertAuditLog,
} from "../../shared/types";

// Enums re-exported as types
export type {
  Role,
  SpecialistStatus,
  ServiceStatus,
  AppointmentStatus,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
} from "../../shared/types";

/**
 * Tipos específicos para Mobile
 */

export interface NavigationParams {
  Home: undefined;
  Appointments: undefined;
  AppointmentDetails: { appointmentId: string };
  Specialists: undefined;
  SpecialistProfile: { specialistId: string };
  Services: undefined;
  ServiceDetails: { serviceId: string };
  Clients: undefined;
  ClientDetails: { clientId: string };
  Settings: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
}

export type RootNavigationParamList = NavigationParams;

export interface MobileScreenProps<T extends keyof NavigationParams> {
  navigation: any; // Será tipado corretamente com @react-navigation/native
  route: {
    name: T;
    params: NavigationParams[T];
  };
}

/**
 * Configurações de tema mobile
 */
export interface MobileTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    success: string;
    warning: string;
    error: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
}

export const defaultMobileTheme: MobileTheme = {
  colors: {
    primary: "#0ea5e9",
    secondary: "#6366f1",
    background: "#ffffff",
    card: "#ffffff",
    text: "#0f172a",
    border: "#e2e8f0",
    notification: "#ef4444",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
};
