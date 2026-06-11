// Sistema de agendamento público para clientes
import { createLogger } from "./_core/logger";

const logger = createLogger("public-booking");

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb, generateId, getAvailableTimeSlots } from "./db";
import {
  specialists,
  services,
  appointments,
  clients,
  salons,
} from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// Validações para agendamento público
const publicBookingSchema = z.object({
  specialistId: z.string().min(1),
  serviceId: z.string().min(1),
  clientName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  clientPhone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  clientEmail: z.string().email("Email inválido").optional(),
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido"),
  appointmentTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de horário inválido"),
  notes: z.string().optional(),
});

export const publicBookingRouter = router({
  // Buscar informações do salão e especialistas para página pública
  getSalonInfo: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const salon = await db
      .select({
        id: salons.id,
        name: salons.name,
        address: salons.address,
        phone: salons.phone,
        email: salons.email,
      })
      .from(salons)
      .limit(1);

    if (!salon[0]) {
      throw new Error("Salão não encontrado");
    }

    return salon[0];
  }),

  // Buscar todos os especialistas ativos
  getAllSpecialists: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const activeSpecialists = await db
      .select({
        id: specialists.id,
        name: specialists.name,
        specialty: specialists.specialty,
        photo: specialists.photo,
        bio: specialists.bio,
        workingDays: specialists.workingDays,
      })
      .from(specialists)
      .where(eq(specialists.status, "active"));

    return activeSpecialists;
  }),

  // Buscar informações do especialista para página pública
  getSpecialistInfo: publicProcedure
    .input(z.object({ specialistId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const specialist = await db
        .select({
          id: specialists.id,
          name: specialists.name,
          specialty: specialists.specialty,
          photo: specialists.photo,
          bio: specialists.bio,
          workingDays: specialists.workingDays,
          salonName: salons.name,
          salonAddress: salons.address,
          salonPhone: salons.phone,
        })
        .from(specialists)
        .innerJoin(salons, eq(specialists.salonId, salons.id))
        .where(eq(specialists.id, input.specialistId))
        .limit(1);

      if (!specialist[0]) {
        throw new Error("Especialista não encontrado");
      }

      return specialist[0];
    }),

  // Buscar serviços do especialista
  getSpecialistServices: publicProcedure
    .input(z.object({ specialistId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Primeiro buscar o salonId do especialista
      const specialist = await db
        .select({ salonId: specialists.salonId })
        .from(specialists)
        .where(eq(specialists.id, input.specialistId))
        .limit(1);

      if (!specialist[0]) {
        throw new Error("Especialista não encontrado");
      }

      // Buscar serviços do salão (que podem ser prestados por qualquer especialista)
      const specialistServices = await db
        .select({
          id: services.id,
          name: services.name,
          description: services.description,
          duration: services.duration,
          price: services.price,
          priceFrom: services.priceFrom,
        })
        .from(services)
        .where(
          and(
            eq(services.salonId, specialist[0].salonId),
            eq(services.status, "active")
          )
        );

      return specialistServices;
    }),

  // Buscar horários disponíveis — usar função centralizada que já considera schedules
  getAvailableTimeSlots: publicProcedure
    .input(
      z.object({
        specialistId: z.string(),
        serviceId: z.string(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
    )
    .query(async ({ input }) => {
      // Converter para Date (usar meio-dia UTC para evitar problemas de fuso)
      const date = new Date(input.date + "T12:00:00.000Z");
      try {
        const slots = await getAvailableTimeSlots(
          input.specialistId,
          input.serviceId,
          date
        );
        return slots;
      } catch (err) {
        logger.error("Erro ao obter horarios disponiveis (public):", err);
        return [];
      }
    }),

  // Criar agendamento público
  createPublicAppointment: publicProcedure
    .input(publicBookingSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Verificar se o especialista existe e está ativo
      const specialist = await db
        .select({ salonId: specialists.salonId })
        .from(specialists)
        .where(
          and(
            eq(specialists.id, input.specialistId),
            eq(specialists.status, "active")
          )
        )
        .limit(1);

      if (!specialist[0]) {
        throw new Error("Especialista não encontrado ou inativo");
      }

      // Verificar se o serviço existe e está ativo
      const service = await db
        .select({ id: services.id })
        .from(services)
        .where(
          and(eq(services.id, input.serviceId), eq(services.status, "active"))
        )
        .limit(1);

      if (!service[0]) {
        throw new Error("Serviço não encontrado ou inativo");
      }

      // Criar ou encontrar cliente
      let clientId: string;

      // Tentar encontrar cliente existente pelo telefone
      const existingClient = await db
        .select({ id: clients.id })
        .from(clients)
        .where(
          and(
            eq(clients.salonId, specialist[0].salonId),
            eq(clients.phone, input.clientPhone)
          )
        )
        .limit(1);

      if (existingClient[0]) {
        clientId = existingClient[0].id;

        // Atualizar dados do cliente se fornecidos
        await db
          .update(clients)
          .set({
            name: input.clientName,
            email: input.clientEmail || null,
            updatedAt: new Date(),
          })
          .where(eq(clients.id, clientId));
      } else {
        // Criar novo cliente
        clientId = generateId();
        await db.insert(clients).values({
          id: clientId,
          salonId: specialist[0].salonId,
          name: input.clientName,
          phone: input.clientPhone,
          email: input.clientEmail || null,
        });
      }

      // Verificar disponibilidade do horário usando a função central (usa meio-dia UTC para evitar problemas de fuso)
      const availabilityDate = new Date(
        input.appointmentDate + "T12:00:00.000Z"
      );
      const availableSlots = await getAvailableTimeSlots(
        input.specialistId,
        input.serviceId,
        availabilityDate
      );

      if (!availableSlots.includes(input.appointmentTime)) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Horário não disponível",
        });
      }

      // Construir um timestamp UTC para o agendamento (armazenamos datetime em UTC)
      // Note: armazenamos também o campo appointmentTime como string para exibição
      const [y, m, d] = input.appointmentDate.split("-").map(Number);
      const [hh, mm] = input.appointmentTime.split(":").map(Number);
      const appointmentDateTime = new Date(Date.UTC(y, m - 1, d, hh, mm, 0));

      // Criar agendamento
      const appointmentId = generateId();
      await db.insert(appointments).values({
        id: appointmentId,
        salonId: specialist[0].salonId,
        clientId,
        serviceId: input.serviceId,
        specialistId: input.specialistId,
        appointmentDate: appointmentDateTime,
        appointmentTime: input.appointmentTime,
        status: "pending", // Agendamentos públicos começam como pendentes
        notes: input.notes || null,
        isPublic: true,
      });

      return {
        success: true,
        appointmentId,
        message: "Agendamento criado com sucesso! Aguarde a confirmação.",
      };
    }),
});
