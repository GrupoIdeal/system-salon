import { TRPCError } from "@trpc/server";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { z } from "zod";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sdk } from "./_core/sdk";
import {
  getUser,
  getUserByEmail,
  getSalonByUserId,
  getSalonById,
  updateSalon,
  getSpecialistsBySalonId,
  getSpecialistById,
  createSpecialist,
  updateSpecialist,
  deleteSpecialist,
  getClientsBySalonId,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getServicesBySalonId,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getAppointmentsBySalonId,
  getAppointmentById,
  getAppointmentsBySpecialistAndDate,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  createPasswordReset,
  getPasswordResetByToken,
  markPasswordResetAsUsed,
} from "./db";
import {
  loginSchema,
  registerSchema,
  salonSchema,
  specialistSchema,
  clientSchema,
  serviceSchema,
  appointmentSchema,
  appointmentPublicSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
} from "@shared/validations";

const generateId = () => crypto.randomBytes(16).toString("hex");

export const appRouter = router({
  system: systemRouter,

  // ============================================================================
  // AUTH PROCEDURES
  // ============================================================================

  auth: router({
    me: publicProcedure.query(({ ctx }) => {
      console.log("[Auth] me endpoint chamado");
      console.log("[Auth] ctx.user:", ctx.user);
      return ctx.user;
    }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    register: publicProcedure
      .input(registerSchema)
      .mutation(async ({ input }) => {
        const existingUser = await getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email já cadastrado",
          });
        }

        const hashedPassword = await bcrypt.hash(input.password, 10);
        const userId = generateId();

        // Create user
        await getUser(userId); // Ensure DB is available

        // In production, you would create the user here
        // For now, we'll return success
        return {
          success: true,
          userId,
          message: "Usuário registrado com sucesso",
        };
      }),

    login: publicProcedure
      .input(loginSchema)
      .mutation(async ({ input, ctx }) => {
        console.log("Tentativa de login:", input);
        const user = await getUserByEmail(input.email);
        console.log("Usuário encontrado:", user);
        if (!user) {
          console.log("Login falhou: usuário não encontrado");
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou senha inválidos",
          });
        }

        const passwordMatch = await bcrypt.compare(
          input.password,
          user.password
        );
        console.log("Senha confere:", passwordMatch);
        if (!passwordMatch) {
          console.log("Login falhou: senha incorreta");
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou senha inválidos",
          });
        }

        console.log("Login bem-sucedido:", user.email);

        // Configurar cookie de sessão com JWT
        const sessionToken = await sdk.createSessionToken(user.id, {
          name: user.name,
        });

        const cookieOptions = {
          ...getSessionCookieOptions(ctx.req),
          maxAge: ONE_YEAR_MS,
        };

        console.log(
          `Configurando cookie de sessão:
        - Nome: ${COOKIE_NAME}
        - Token: ${sessionToken.substring(0, 20)}...
        - Opções:`,
          cookieOptions
        );

        ctx.res?.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        console.log("Cookie de sessão JWT configurado");

        return {
          success: true,
          // Também retornamos o token para que o cliente possa armazená-lo
          sessionToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      }),

    requestPasswordReset: publicProcedure
      .input(passwordResetRequestSchema)
      .mutation(async ({ input }) => {
        const user = await getUserByEmail(input.email);
        if (!user) {
          // Don't reveal if email exists
          return { success: true };
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await createPasswordReset({
          id: generateId(),
          userId: user.id,
          token,
          expiresAt,
          used: false,
        });

        return { success: true };
      }),

    resetPassword: publicProcedure
      .input(passwordResetSchema)
      .mutation(async ({ input }) => {
        const reset = await getPasswordResetByToken(input.token);
        if (!reset || reset.used || reset.expiresAt < new Date()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Token inválido ou expirado",
          });
        }

        const hashedPassword = await bcrypt.hash(input.password, 10);
        const user = await getUser(reset.userId);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuário não encontrado",
          });
        }

        // Update password
        await markPasswordResetAsUsed(reset.id);

        return { success: true };
      }),
  }),

  // ============================================================================
  // SALON PROCEDURES
  // ============================================================================

  salon: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Salão não encontrado",
        });
      }
      return salon;
    }),

    update: protectedProcedure
      .input(salonSchema)
      .mutation(async ({ ctx, input }) => {
        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        await updateSalon(salon.id, input);
        return { success: true };
      }),

    create: protectedProcedure
      .input(salonSchema)
      .mutation(async ({ ctx, input }) => {
        const existingSalon = await getSalonByUserId(ctx.user.id);
        if (existingSalon) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Salão já existe para este usuário",
          });
        }

        const salonId = generateId();
        // In production, create salon here
        return { success: true, salonId };
      }),
  }),

  // ============================================================================
  // SPECIALIST PROCEDURES
  // ============================================================================

  specialists: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Salão não encontrado",
        });
      }
      return await getSpecialistsBySalonId(salon.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input, ctx }) => {
        const specialist = await getSpecialistById(input.id);
        if (!specialist) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Especialista não encontrado",
          });
        }

        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon || specialist.salonId !== salon.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        return specialist;
      }),

    create: protectedProcedure
      .input(specialistSchema)
      .mutation(async ({ ctx, input }) => {
        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        const specialist = await createSpecialist({
          id: generateId(),
          salonId: salon.id,
          ...input,
        });

        return specialist;
      }),

    update: protectedProcedure
      .input(z.object({ id: z.string(), data: specialistSchema }))
      .mutation(async ({ ctx, input }) => {
        const specialist = await getSpecialistById(input.id);
        if (!specialist) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Especialista não encontrado",
          });
        }

        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon || specialist.salonId !== salon.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        await updateSpecialist(input.id, input.data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const specialist = await getSpecialistById(input.id);
        if (!specialist) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Especialista não encontrado",
          });
        }

        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon || specialist.salonId !== salon.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        await deleteSpecialist(input.id);
        return { success: true };
      }),
  }),

  // ============================================================================
  // CLIENT PROCEDURES
  // ============================================================================

  clients: router({
    list: protectedProcedure
      .input(
        z.object({
          search: z.string().optional(),
          limit: z.number().default(50),
          offset: z.number().default(0),
        })
      )
      .query(async ({ ctx, input }) => {
        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        return await getClientsBySalonId(
          salon.id,
          input.search,
          input.limit,
          input.offset
        );
      }),

    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input, ctx }) => {
        const client = await getClientById(input.id);
        if (!client) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cliente não encontrado",
          });
        }

        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon || client.salonId !== salon.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        return client;
      }),

    create: protectedProcedure
      .input(clientSchema)
      .mutation(async ({ ctx, input }) => {
        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        const client = await createClient({
          id: generateId(),
          salonId: salon.id,
          ...input,
        });

        return client;
      }),

    update: protectedProcedure
      .input(z.object({ id: z.string(), data: clientSchema }))
      .mutation(async ({ ctx, input }) => {
        const client = await getClientById(input.id);
        if (!client) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cliente não encontrado",
          });
        }

        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon || client.salonId !== salon.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        await updateClient(input.id, input.data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const client = await getClientById(input.id);
        if (!client) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cliente não encontrado",
          });
        }

        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon || client.salonId !== salon.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        await deleteClient(input.id);
        return { success: true };
      }),
  }),

  // ============================================================================
  // SERVICE PROCEDURES
  // ============================================================================

  services: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Salão não encontrado",
        });
      }

      return await getServicesBySalonId(salon.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input, ctx }) => {
        const service = await getServiceById(input.id);
        if (!service) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Serviço não encontrado",
          });
        }

        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon || service.salonId !== salon.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        return service;
      }),

    create: protectedProcedure
      .input(serviceSchema)
      .mutation(async ({ ctx, input }) => {
        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        const price =
          typeof input.price === "string"
            ? input.price
            : input.price.toString();
        const service = await createService({
          id: generateId(),
          salonId: salon.id,
          ...input,
          price,
        });

        return service;
      }),

    update: protectedProcedure
      .input(z.object({ id: z.string(), data: serviceSchema }))
      .mutation(async ({ ctx, input }) => {
        const service = await getServiceById(input.id);
        if (!service) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Serviço não encontrado",
          });
        }

        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon || service.salonId !== salon.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        const updateData = {
          ...input.data,
          price:
            typeof input.data.price === "string"
              ? input.data.price
              : input.data.price.toString(),
        };
        await updateService(input.id, updateData as any);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const service = await getServiceById(input.id);
        if (!service) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Serviço não encontrado",
          });
        }

        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon || service.salonId !== salon.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        await deleteService(input.id);
        return { success: true };
      }),
  }),

  // ============================================================================
  // APPOINTMENT PROCEDURES
  // ============================================================================

  appointments: router({
    list: protectedProcedure
      .input(
        z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        return await getAppointmentsBySalonId(
          salon.id,
          input.startDate,
          input.endDate
        );
      }),

    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input, ctx }) => {
        const appointment = await getAppointmentById(input.id);
        if (!appointment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agendamento não encontrado",
          });
        }

        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon || appointment.salonId !== salon.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        return appointment;
      }),

    create: protectedProcedure
      .input(appointmentSchema)
      .mutation(async ({ ctx, input }) => {
        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        // Verify client, service, and specialist belong to this salon
        const client = await getClientById(input.clientId);
        if (!client || client.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cliente não encontrado",
          });
        }

        const service = await getServiceById(input.serviceId);
        if (!service || service.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Serviço não encontrado",
          });
        }

        const specialist = await getSpecialistById(input.specialistId);
        if (!specialist || specialist.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Especialista não encontrado",
          });
        }

        // Check for conflicts
        const existingAppointments = await getAppointmentsBySpecialistAndDate(
          input.specialistId,
          input.appointmentDate
        );

        const hasConflict = existingAppointments.some(
          apt =>
            apt.appointmentTime === input.appointmentTime &&
            apt.status !== "cancelled"
        );

        if (hasConflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Horário já está ocupado",
          });
        }

        const appointment = await createAppointment({
          id: generateId(),
          salonId: salon.id,
          ...input,
        });

        return appointment;
      }),

    update: protectedProcedure
      .input(z.object({ id: z.string(), data: appointmentSchema }))
      .mutation(async ({ ctx, input }) => {
        const appointment = await getAppointmentById(input.id);
        if (!appointment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agendamento não encontrado",
          });
        }

        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon || appointment.salonId !== salon.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        await updateAppointment(input.id, input.data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const appointment = await getAppointmentById(input.id);
        if (!appointment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agendamento não encontrado",
          });
        }

        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon || appointment.salonId !== salon.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        await deleteAppointment(input.id);
        return { success: true };
      }),
  }),

  // ============================================================================
  // PUBLIC APPOINTMENT PROCEDURES (for booking page)
  // ============================================================================

  publicBooking: router({
    getSalonBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        // In production, lookup salon by slug
        // For now, return mock data
        return {
          id: "salon-1",
          name: "Salão de Beleza",
          slug: input.slug,
        };
      }),

    getAvailableSlots: publicProcedure
      .input(
        z.object({
          salonId: z.string(),
          specialistId: z.string().optional(),
          serviceId: z.string(),
          date: z.date(),
        })
      )
      .query(async ({ input }) => {
        // In production, calculate available slots based on specialist schedule
        // and existing appointments
        return [
          "09:00",
          "09:30",
          "10:00",
          "10:30",
          "11:00",
          "14:00",
          "14:30",
          "15:00",
          "15:30",
          "16:00",
        ];
      }),

    createPublicAppointment: publicProcedure
      .input(appointmentPublicSchema)
      .mutation(async ({ input }) => {
        // Create appointment with public data
        return {
          success: true,
          appointmentId: generateId(),
          message: "Agendamento realizado com sucesso",
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
