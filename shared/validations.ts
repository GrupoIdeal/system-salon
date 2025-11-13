import { z } from "zod";

// Função helper para sanitizar strings (remove HTML e scripts)
// Disponível para uso futuro em transformações
const sanitizeString = (str: string) => {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
};

// Previne warning de variável não utilizada
void sanitizeString;

// ============================================================================
// AUTH VALIDATIONS
// ============================================================================

export const loginSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .max(320, "Email muito longo")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(100, "Senha muito longa"),
});

export const registerSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .max(320, "Email muito longo")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(100, "Senha muito longa")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Senha deve conter letras maiúsculas, minúsculas e números"
    ),
  name: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome muito longo"),
});

export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .max(320, "Email muito longo")
    .toLowerCase()
    .trim(),
});

export const passwordResetSchema = z.object({
  token: z.string().max(500, "Token inválido"),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(100, "Senha muito longa"),
});

// ============================================================================
// SALON VALIDATIONS
// ============================================================================

export const salonSchema = z.object({
  name: z
    .string()
    .min(2, "Nome do salão é obrigatório")
    .max(200, "Nome muito longo"),
  cnpj: z.string().max(20, "CNPJ inválido").optional(),
  address: z.string().max(500, "Endereço muito longo").optional(),
  phone: z.string().max(20, "Telefone inválido").optional(),
  email: z
    .string()
    .email("Email inválido")
    .max(320, "Email muito longo")
    .optional(),
  logo: z.string().url("URL inválida").max(1000, "URL muito longa").optional(),
  workingHours: z
    .record(
      z.string(),
      z.array(
        z.object({
          start: z
            .string()
            .regex(/^\d{2}:\d{2}$/, "Formato de horário inválido"),
          end: z.string().regex(/^\d{2}:\d{2}$/, "Formato de horário inválido"),
          lunch: z
            .object({
              start: z
                .string()
                .regex(/^\d{2}:\d{2}$/, "Formato de horário inválido"),
              end: z
                .string()
                .regex(/^\d{2}:\d{2}$/, "Formato de horário inválido"),
            })
            .optional(),
        })
      )
    )
    .optional(),
});

// ============================================================================
// SPECIALIST VALIDATIONS
// ============================================================================

export const specialistSchema = z.object({
  name: z
    .string()
    .min(2, "Nome do especialista é obrigatório")
    .max(200, "Nome muito longo"),
  specialty: z.string().max(255, "Especialidade muito longa").optional(),
  photo: z.string().url("URL inválida").max(1000, "URL muito longa").optional(),
  email: z
    .string()
    .email("Email inválido")
    .max(320, "Email muito longo")
    .optional(),
  phone: z.string().max(20, "Telefone inválido").optional(),
  bio: z.string().max(1000, "Biografia muito longa").optional(),
  workingDays: z
    .record(
      z.string(),
      z.array(
        z.object({
          start: z
            .string()
            .regex(/^\d{2}:\d{2}$/, "Formato de horário inválido"),
          end: z.string().regex(/^\d{2}:\d{2}$/, "Formato de horário inválido"),
          lunch: z
            .object({
              start: z
                .string()
                .regex(/^\d{2}:\d{2}$/, "Formato de horário inválido"),
              end: z
                .string()
                .regex(/^\d{2}:\d{2}$/, "Formato de horário inválido"),
            })
            .optional(),
        })
      )
    )
    .optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

// Schedule schema to allow creating specialist together with initial schedule
// workingHours é OBRIGATÓRIO - todo especialista deve ter horários definidos
export const scheduleSchema = z.object({
  timeSlotDuration: z.number().int().min(1).default(30),
  bufferTime: z.number().int().min(0).default(0),
  allowBookingDaysInAdvance: z.number().int().min(0).default(30),
  minimumNoticeHours: z.number().int().min(0).default(2),
  autoConfirmBookings: z.boolean().default(true),
  allowOnlineBooking: z.boolean().default(true),
  workingHours: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      isWorking: z.boolean(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      breakStartTime: z.string().optional(),
      breakEndTime: z.string().optional(),
    })
  ), // OBRIGATÓRIO - array com 7 dias (0-6)
});

// ============================================================================
// CLIENT VALIDATIONS
// ============================================================================

export const clientSchema = z.object({
  name: z.string().min(2, "Nome do cliente é obrigatório"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  birthDate: z.date().optional(),
  notes: z.string().optional(),
});

// ============================================================================
// SERVICE VALIDATIONS
// ============================================================================

export const serviceSchema = z.object({
  name: z.string().min(2, "Nome do serviço é obrigatório"),
  description: z.string().optional(),
  duration: z.number().int().positive("Duração deve ser positiva"),
  // Indica se o preço é um valor mínimo ('a partir de')
  priceFrom: z.boolean().optional().default(false),
  price: z
    .string()
    .or(z.number())
    .refine(val => {
      const num = typeof val === "string" ? parseFloat(val) : val;
      return num >= 0;
    }, "Preço deve ser positivo"),
  status: z.enum(["active", "inactive"]).default("active"),
  specialistId: z.string().nullable().optional(),
});

// ============================================================================
// APPOINTMENT VALIDATIONS
// ============================================================================

export const appointmentSchema = z.object({
  clientId: z.string().min(1, "Cliente é obrigatório"),
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  specialistId: z.string().min(1, "Especialista é obrigatório"),
  appointmentDate: z.date(),
  appointmentTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
  status: z
    .enum(["pending", "confirmed", "completed", "cancelled"])
    .default("pending"),
  notes: z.string().optional(),
});

export const appointmentPublicSchema = z.object({
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  specialistId: z.string().optional(),
  appointmentDate: z.date(),
  appointmentTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
  clientName: z.string().min(2, "Nome é obrigatório"),
  clientEmail: z.string().email("Email inválido"),
  clientPhone: z.string().min(10, "Telefone inválido"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SalonInput = z.infer<typeof salonSchema>;
export type SpecialistInput = z.infer<typeof specialistSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type AppointmentPublicInput = z.infer<typeof appointmentPublicSchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;
