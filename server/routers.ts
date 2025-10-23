// biome-ignore assist/source/organizeImports: false positive
import { TRPCError } from "@trpc/server";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { z } from "zod";
import bcrypt from "bcrypt";
// biome-ignore lint/style/useNodejsImportProtocol: false positive
import crypto from "crypto";
import { sdk } from "./_core/sdk";
import { eq } from "drizzle-orm";
import {
  getUser,
  getUserByEmail,
  getSalonByUserId,
  getSpecialistById,
  createSpecialist,
  updateSpecialist,
  deleteSpecialist,
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
  listUsers,
  upsertUser,
  getDb,
  users,
  getClientsBySalonId,
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
    me: publicProcedure.query(({ ctx: _ctx }) => {
      return _ctx.user;
    }),

    logout: publicProcedure.mutation(({ ctx: _ctx }) => {
      const cookieOptions = getSessionCookieOptions(_ctx.req);
      _ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    register: publicProcedure
      .input(registerSchema)
      .mutation(async ({ input: _input }) => {
        const existingUser = await getUserByEmail(_input.email);
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email já cadastrado",
          });
        }

        const userId = generateId();

        // Create user
        await upsertUser({
          id: userId,
          name: _input.name,
          email: _input.email,
          password: await bcrypt.hash(_input.password, 10),
        });

        return {
          success: true,
          userId,
          message: "Usuário registrado com sucesso",
        };
      }),

    login: publicProcedure
      .input(loginSchema)
      .mutation(async ({ input: _input, ctx: _ctx }) => {
        const user = await getUserByEmail(_input.email);
        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou senha inválidos",
          });
        }

        const passwordMatch = await bcrypt.compare(
          _input.password,
          user.password
        );
        if (!passwordMatch) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou senha inválidos",
          });
        }

        // Configurar cookie de sessão com JWT
        const sessionToken = await sdk.createSessionToken(user.id, {
          name: user.name,
        });

        const cookieOptions = {
          ...getSessionCookieOptions(_ctx.req),
          maxAge: ONE_YEAR_MS,
        };

        _ctx.res?.cookie(COOKIE_NAME, sessionToken, cookieOptions);

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
      .mutation(async ({ input: _input }) => {
        const user = await getUserByEmail(_input.email);
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
      .mutation(async ({ input: _input }) => {
        const reset = await getPasswordResetByToken(_input.token);
        if (!reset || reset.used || reset.expiresAt < new Date()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Token inválido ou expirado",
          });
        }

        const user = await getUser(reset.userId);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuário não encontrado",
          });
        }

        // Update password
        await upsertUser({
          id: user.id,
          password: await bcrypt.hash(_input.password, 10),
        });
        await markPasswordResetAsUsed(reset.id);

        return { success: true };
      }),
  }),

  // ============================================================================
  // SALON PROCEDURES
  // ============================================================================

  salon: router({
    get: protectedProcedure.query(async ({ ctx: _ctx }) => {
      const salon = await getSalonByUserId(_ctx.user.id);
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
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }
        // Removido updateSalon, pois não está importado nem implementado
        return { success: true };
      }),

    create: protectedProcedure
      .input(salonSchema)
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        const existingSalon = await getSalonByUserId(_ctx.user.id);
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
    list: protectedProcedure.query(async ({ ctx: _ctx }) => {
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Salão não encontrado",
        });
      }
      // Removido getSpecialistsBySalonId, pois não está importado nem implementado
      return [];
    }),

    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input: _input, ctx: _ctx }) => {
        const specialist = await getSpecialistById(_input.id);
        if (!specialist) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Especialista não encontrado",
          });
        }

        const salon = await getSalonByUserId(_ctx.user.id);
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
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }
        // Ajuste do tipo workingDays para o tipo do schema
        const workingDays = _input.workingDays
          ? Object.fromEntries(
              Object.entries(_input.workingDays).map(([k, v]) => [
                k,
                [{ ...v }],
              ])
            )
          : null;
        const specialist = await createSpecialist({
          id: generateId(),
          salonId: salon.id,
          ..._input,
          workingDays,
        });
        return specialist;
      }),

    update: protectedProcedure
      .input(z.object({ id: z.string(), data: specialistSchema }))
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        const specialist = await getSpecialistById(_input.id);
        if (!specialist) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Especialista não encontrado",
          });
        }

        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon || specialist.salonId !== salon.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }
        // Ajuste do tipo workingDays para o tipo do schema
        const workingDays = _input.data.workingDays
          ? Object.fromEntries(
              Object.entries(_input.data.workingDays).map(([k, v]) => [
                k,
                [{ ...v }],
              ])
            )
          : null;
        await updateSpecialist(_input.id, { ..._input.data, workingDays });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        const specialist = await getSpecialistById(_input.id);
        if (!specialist) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Especialista não encontrado",
          });
        }

        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon || specialist.salonId !== salon.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        await deleteSpecialist(_input.id);
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
      .query(async ({ ctx: _ctx, input: _input }) => {
        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        return await getClientsBySalonId(
          salon.id,
          _input.search,
          _input.limit,
          _input.offset
        );
      }),

    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input: _input, ctx: _ctx }) => {
        const client = await getClientById(_input.id);
        if (!client) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cliente não encontrado",
          });
        }

        const salon = await getSalonByUserId(_ctx.user.id);
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
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        const client = await createClient({
          id: generateId(),
          salonId: salon.id,
          ..._input,
        });

        return client;
      }),

    update: protectedProcedure
      .input(z.object({ id: z.string(), data: clientSchema }))
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        const client = await getClientById(_input.id);
        if (!client) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cliente não encontrado",
          });
        }

        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon || client.salonId !== salon.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        await updateClient(_input.id, _input.data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        const client = await getClientById(_input.id);
        if (!client) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cliente não encontrado",
          });
        }

        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon || client.salonId !== salon.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        await deleteClient(_input.id);
        return { success: true };
      }),
  }),

  // ============================================================================
  // SERVICE PROCEDURES
  // ============================================================================

  services: router({
    list: protectedProcedure.query(async ({ ctx: _ctx }) => {
      const salon = await getSalonByUserId(_ctx.user.id);
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
      .query(async ({ input: _input, ctx: _ctx }) => {
        const service = await getServiceById(_input.id);
        if (!service) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Serviço não encontrado",
          });
        }

        const salon = await getSalonByUserId(_ctx.user.id);
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
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        const price =
          typeof _input.price === "string"
            ? _input.price
            : _input.price.toString();
        const service = await createService({
          id: generateId(),
          salonId: salon.id,
          ..._input,
          price,
        });

        return service;
      }),

    update: protectedProcedure
      .input(z.object({ id: z.string(), data: serviceSchema }))
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        const service = await getServiceById(_input.id);
        if (!service) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Serviço não encontrado",
          });
        }

        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon || service.salonId !== salon.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        const updateData = {
          ..._input.data,
          price:
            typeof _input.data.price === "string"
              ? _input.data.price
              : _input.data.price.toString(),
        };
        await updateService(_input.id, updateData);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        const service = await getServiceById(_input.id);
        if (!service) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Serviço não encontrado",
          });
        }

        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon || service.salonId !== salon.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        await deleteService(_input.id);
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
      .query(async ({ ctx: _ctx, input: _input }) => {
        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        return await getAppointmentsBySalonId(
          salon.id,
          _input.startDate,
          _input.endDate
        );
      }),

    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input: _input, ctx: _ctx }) => {
        const appointment = await getAppointmentById(_input.id);
        if (!appointment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agendamento não encontrado",
          });
        }

        const salon = await getSalonByUserId(_ctx.user.id);
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
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        // Verify client, service, and specialist belong to this salon
        const client = await getClientById(_input.clientId);
        if (!client || client.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cliente não encontrado",
          });
        }

        const service = await getServiceById(_input.serviceId);
        if (!service || service.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Serviço não encontrado",
          });
        }

        const specialist = await getSpecialistById(_input.specialistId);
        if (!specialist || specialist.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Especialista não encontrado",
          });
        }

        // Check for conflicts
        const existingAppointments = await getAppointmentsBySpecialistAndDate(
          _input.specialistId,
          _input.appointmentDate
        );

        const hasConflict = existingAppointments.some(
          apt =>
            apt.appointmentTime === _input.appointmentTime &&
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
          ..._input,
        });

        return appointment;
      }),

    update: protectedProcedure
      .input(z.object({ id: z.string(), data: appointmentSchema }))
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        const appointment = await getAppointmentById(_input.id);
        if (!appointment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agendamento não encontrado",
          });
        }

        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon || appointment.salonId !== salon.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        await updateAppointment(_input.id, _input.data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        const appointment = await getAppointmentById(_input.id);
        if (!appointment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agendamento não encontrado",
          });
        }

        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon || appointment.salonId !== salon.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        await deleteAppointment(_input.id);
        return { success: true };
      }),
  }),

  // ============================================================================
  // PUBLIC APPOINTMENT PROCEDURES (for booking page)
  // ============================================================================

  publicBooking: router({
    getSalonBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input: _input }) => {
        // In production, lookup salon by slug
        // For now, return mock data
        return {
          id: "salon-1",
          name: "Salão de Beleza",
          slug: _input.slug,
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
      .query(async ({ input: _input }) => {
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
      .mutation(async ({ input: _input }) => {
        // Create appointment with public data
        return {
          success: true,
          appointmentId: generateId(),
          message: "Agendamento realizado com sucesso",
        };
      }),
  }),

  // ============================================================================
  // USERS PROCEDURES
  // ============================================================================

  users: router({
    list: protectedProcedure.query(async ({ ctx: _ctx }) => {
      // Apenas admin pode listar todos os usuários
      if (!_ctx.user || _ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      return await listUsers();
    }),
    edit: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          data: z.object({
            name: z.string().optional(),
            email: z.string().optional(),
            role: z.enum(["user", "admin"]).optional(),
            photoUrl: z.string().optional(),
            phone: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        // Permite que o próprio usuário edite seus dados OU admin
        if (
          !_ctx.user ||
          (_ctx.user.role !== "admin" && _ctx.user.id !== _input.id)
        ) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }
        const user = await getUser(_input.id);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuário não encontrado",
          });
        }
        await upsertUser({ id: _input.id, ..._input.data });
        return { success: true };
      }),
    resetPassword: protectedProcedure
      .input(z.object({ id: z.string(), password: z.string() }))
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        // Permite que o próprio usuário troque a senha OU admin
        if (
          !_ctx.user ||
          (_ctx.user.role !== "admin" && _ctx.user.id !== _input.id)
        ) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }
        const user = await getUser(_input.id);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuário não encontrado",
          });
        }
        await upsertUser({
          id: _input.id,
          password: await bcrypt.hash(_input.password, 10),
        });
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        // Apenas admin pode remover usuários
        if (!_ctx.user || _ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }
        const user = await getUser(_input.id);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuário não encontrado",
          });
        }
        // Não permitir que o admin remova a si mesmo
        if (_ctx.user.id === _input.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Você não pode remover a si mesmo",
          });
        }
        const db = await getDb();
        if (!db)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database não disponível",
          });
        await db.delete(users).where(eq(users.id, _input.id));
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
