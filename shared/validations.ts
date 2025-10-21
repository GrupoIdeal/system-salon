import { z } from "zod";

// ============================================================================
// AUTH VALIDATIONS
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const passwordResetSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

// ============================================================================
// SALON VALIDATIONS
// ============================================================================

export const salonSchema = z.object({
  name: z.string().min(2, "Nome do salão é obrigatório"),
  cnpj: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  logo: z.string().optional(),
  workingHours: z
    .record(z.string(), z.object({
        start: z.string(),
        end: z.string(),
      }))
    .optional(),
});

// ============================================================================
// SPECIALIST VALIDATIONS
// ============================================================================

export const specialistSchema = z.object({
  name: z.string().min(2, "Nome do especialista é obrigatório"),
  specialty: z.string().optional(),
  photo: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  workingDays: z
    .record(z.string(), z.object({
        start: z.string(),
        end: z.string(),
      }))
    .optional(),
  status: z.enum(["active", "inactive"]).default("active"),
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
  price: z.string().or(z.number()).refine((val) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return num >= 0;
  }, "Preço deve ser positivo"),
  status: z.enum(["active", "inactive"]).default("active"),
  specialistId: z.string().optional(),
});

// ============================================================================
// APPOINTMENT VALIDATIONS
// ============================================================================

export const appointmentSchema = z.object({
  clientId: z.string().min(1, "Cliente é obrigatório"),
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  specialistId: z.string().min(1, "Especialista é obrigatório"),
  appointmentDate: z.date(),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).default("pending"),
  notes: z.string().optional(),
});

export const appointmentPublicSchema = z.object({
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  specialistId: z.string().optional(),
  appointmentDate: z.date(),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
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

