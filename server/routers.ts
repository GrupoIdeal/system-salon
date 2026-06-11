// biome-ignore assist/source/organizeImports: false positive
import { createLogger } from "./_core/logger";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";

const logger = createLogger("routers");
import { systemRouter } from "./_core/systemRouter";
import {
  createStripePaymentIntent,
  confirmStripePayment,
  generatePaymentOptions,
} from "./stripe";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { z } from "zod";
import bcrypt from "bcrypt";
// biome-ignore lint/style/useNodejsImportProtocol: false positive
import crypto from "crypto";
import { sdk } from "./_core/sdk";
import { eq } from "drizzle-orm";
import { ENV } from "./_core/env";
import {
  getUser,
  getUserByEmail,
  getSalonByUserId,
  getSalonById,
  getSpecialistsBySalonId,
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
  getAppointmentsWithDetailsBySalonId,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  recordAppointmentRevenue,
  createPasswordReset,
  getPasswordResetByToken,
  markPasswordResetAsUsed,
  listUsers,
  upsertUser,
  getDb,
  users,
  getClientsBySalonId,
  getAvailableTimeSlots,
  validateAppointmentSlot,
  timeToMinutes,
  getDashboardMetrics,
  getRevenueChart,
  getMonthlyComparison,
  getAllDashboardData,
  createAuditLog,
  listAuditLogsWithCount,
  // Funções de produtos (Sprint 3)
  getProductsBySalonId,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  // Funções de produtos no atendimento (checkout)
  saveAppointmentProducts,
  getAppointmentProducts,
  // Pontos de fidelidade
  addLoyaltyPoints,
  updateSalon,
  // Avaliações (Sprint 6)
  createRating,
  getRatingByToken,
  submitRating,
  getRatingsBySpecialist,
  getAllSpecialistRatings,
  getAllRatingsBySalon,
} from "./db";
import {
  scheduleAppointmentNotifications,
  sendNotification,
  defaultTemplates,
} from "./notifications";
import {
  addToWaitlist,
  removeFromWaitlist,
  getActiveWaitlistEntries,
  checkWaitlistForSlot,
  confirmWaitlistSlot,
  getWaitlistStats,
} from "./waitlist";
import {
  generateAppointmentStats,
  generateSpecialistPerformance,
  generateServicePopularity,
  generateClientAnalytics,
  generateDailyReport,
  exportToCSV,
} from "./reports";
import {
  updateSpecialistSchedule,
  generateSpecialistTimeSlots,
  getSpecialistScheduleForDisplay,
  addCustomUnavailableDate,
  removeCustomUnavailableDate,
  updateWorkingHoursForDay,
  createSpecialistSchedule,
} from "./specialist-schedule";
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
  scheduleSchema,
  // Schema de produtos (Sprint 3)
  productSchema,
} from "@shared/validations";
import type { Service, User, InsertUser } from "../drizzle/schema";
import { uploadBase64Image } from "./cloudinary";

const generateId = () => crypto.randomBytes(16).toString("hex");

const dashboardRouter = router({
  // ROTA OTIMIZADA: Busca TODOS os dados do dashboard em uma única chamada
  all: protectedProcedure
    .input(
      z
        .object({
          chartDays: z.number().min(7).max(365).default(30),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Salão não encontrado",
        });
      }

      const chartDays = input?.chartDays ?? 30;

      // Busca tudo em paralelo: métricas, gráfico, comparativo e próximos agendamentos
      const now = new Date();
      const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const [dashboardData, upcomingAppointments] = await Promise.all([
        getAllDashboardData(salon.id, chartDays),
        getAppointmentsWithDetailsBySalonId(salon.id, now, in30Days),
      ]);

      return {
        ...dashboardData,
        upcomingAppointments,
      };
    }),

  // Métricas principais do dashboard
  metrics: protectedProcedure.query(async ({ ctx }) => {
    const salon = await getSalonByUserId(ctx.user.id);
    if (!salon) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Salão não encontrado",
      });
    }

    return await getDashboardMetrics(salon.id);
  }),

  // Gráfico de receita dos últimos 30 dias
  revenueChart: protectedProcedure
    .input(
      z.object({
        days: z.number().min(7).max(365).default(30),
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

      return await getRevenueChart(salon.id, input.days);
    }),

  // Comparativo mensal
  monthlyComparison: protectedProcedure.query(async ({ ctx }) => {
    const salon = await getSalonByUserId(ctx.user.id);
    if (!salon) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Salão não encontrado",
      });
    }

    return await getMonthlyComparison(salon.id);
  }),

  // Próximos agendamentos (primeiros 10)
  upcomingAppointments: protectedProcedure.query(async ({ ctx }) => {
    const salon = await getSalonByUserId(ctx.user.id);
    if (!salon) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Salão não encontrado",
      });
    }

    const now = new Date();
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    // Use appointments with details to include client/service/specialist info
    return await getAppointmentsWithDetailsBySalonId(salon.id, now, in30Days);
  }),
});

export const appRouter = router({
  system: systemRouter,

  // ============================================================================
  // AUTH PROCEDURES
  // ============================================================================

  auth: router({
    me: protectedProcedure.query(async ({ ctx }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      return { ...ctx.user, salonId: salon?.id ?? null };
    }),

    logout: publicProcedure.mutation(({ ctx: _ctx }) => {
      const cookieOptions = getSessionCookieOptions(_ctx.req);
      _ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    register: publicProcedure
      .input(registerSchema)
      .mutation(async ({ input: _input, ctx: _ctx }) => {
        const existingUser = await getUserByEmail(_input.email);
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email já cadastrado",
          });
        }

        const userId = generateId();

        const ownerSalon = await getSalonByUserId(ENV.ownerId);
        const defaultSalonId = ownerSalon?.id ?? null;

        await upsertUser({
          id: userId,
          name: _input.name,
          email: _input.email,
          password: await bcrypt.hash(_input.password, 10),
          salonId: defaultSalonId,
        });

        const sessionToken = await sdk.createSessionToken(userId, {
          name: _input.name,
        });

        const cookieOptions = {
          ...getSessionCookieOptions(_ctx.req),
          maxAge: ONE_YEAR_MS,
        };
        _ctx.res?.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        return {
          success: true,
          sessionToken,
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

        // Busca o salão associado ao usuário (pode ser null)
        const salon = await getSalonByUserId(user.id);

        // Criar token de sessão; opcionalmente incluir meta (nome e salonId)
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
          sessionToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            salonId: salon?.id ?? null,
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
      .mutation(async ({ ctx: _ctx, input }) => {
        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }
        await updateSalon(salon.id, {
          name: input.name,
          cnpj: input.cnpj ?? null,
          address: input.address ?? null,
          phone: input.phone ?? null,
          email: input.email ?? null,
          logo: input.logo ?? null,
          pixKey: input.pixKey ?? null,
        });
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
      return await getSpecialistsBySalonId(salon.id);
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
      .input(
        z.object({
          specialist: specialistSchema,
          schedule: scheduleSchema,
        })
      )
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        const specialistPayload = _input.specialist;

        // Ajuste do tipo workingDays para o tipo do schema (compatibilidade)
        const workingDays = specialistPayload.workingDays
          ? (Object.fromEntries(
              Object.entries(specialistPayload.workingDays).map(([k, v]) => [
                k,
                // Ensure each entry is an array of period objects: [{ start, end, lunch? }]
                Array.isArray(v)
                  ? (v as Array<{
                      start: string;
                      end: string;
                      lunch?: { start: string; end: string };
                    }>)
                  : ([v] as Array<{
                      start: string;
                      end: string;
                      lunch?: { start: string; end: string };
                    }>),
              ])
            ) as Record<
              string,
              Array<{
                start: string;
                end: string;
                lunch?: { start: string; end: string };
              }>
            >)
          : null;

        const newSpecialist = await createSpecialist({
          id: generateId(),
          salonId: salon.id,
          ...specialistPayload,
          workingDays,
        });

        // Criar o schedule inicial para o especialista com os dados fornecidos
        try {
          await createSpecialistSchedule(newSpecialist.id, {
            timeSlotDuration: _input.schedule.timeSlotDuration,
            bufferTime: _input.schedule.bufferTime,
            allowBookingDaysInAdvance:
              _input.schedule.allowBookingDaysInAdvance,
            minimumNoticeHours: _input.schedule.minimumNoticeHours,
            autoConfirmBookings: _input.schedule.autoConfirmBookings,
            allowOnlineBooking: _input.schedule.allowOnlineBooking,
            workingHours: _input.schedule.workingHours,
          });
        } catch {
          // Rollback: remover especialista criado para manter consistência
          try {
            await deleteSpecialist(newSpecialist.id);
          } catch {
            // Rollback falhou — estado pode estar inconsistente, monitorar via audit log
          }

          // Falha ao criar schedule inicial
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Falha ao criar agenda inicial. Operação revertida.",
          });
        }

        // Registro de auditoria: criação do especialista
        await createAuditLog({
          userId: _ctx.user?.id ?? null,
          action: "create",
          entity: "specialists",
          entityId: newSpecialist.id,
          before: null,
          after: newSpecialist,
          metadata: {
            ip: _ctx.req?.ip,
            userAgent: _ctx.req?.headers["user-agent"],
          },
        });

        return newSpecialist;
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
          ? (Object.fromEntries(
              Object.entries(_input.data.workingDays).map(([k, v]) => [
                k,
                Array.isArray(v)
                  ? (v as Array<{
                      start: string;
                      end: string;
                      lunch?: { start: string; end: string };
                    }>)
                  : ([v] as Array<{
                      start: string;
                      end: string;
                      lunch?: { start: string; end: string };
                    }>),
              ])
            ) as Record<
              string,
              Array<{
                start: string;
                end: string;
                lunch?: { start: string; end: string };
              }>
            >)
          : null;
        await updateSpecialist(_input.id, { ..._input.data, workingDays });

        // Registro de auditoria: atualização do especialista
        await createAuditLog({
          userId: _ctx.user?.id ?? null,
          action: "update",
          entity: "specialists",
          entityId: _input.id,
          before: specialist,
          after: _input.data,
          metadata: {
            ip: _ctx.req?.ip,
            userAgent: _ctx.req?.headers["user-agent"],
          },
        });

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

        // Registro de auditoria: remoção do especialista
        await createAuditLog({
          userId: _ctx.user?.id ?? null,
          action: "delete",
          entity: "specialists",
          entityId: _input.id,
          before: specialist,
          after: null,
          metadata: {
            ip: _ctx.req?.ip,
            userAgent: _ctx.req?.headers["user-agent"],
          },
        });

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

        // Registro de auditoria: criação do cliente
        await createAuditLog({
          userId: _ctx.user?.id ?? null,
          action: "create",
          entity: "clients",
          entityId: client.id,
          before: null,
          after: client,
          metadata: {
            ip: _ctx.req?.ip,
            userAgent: _ctx.req?.headers["user-agent"],
          },
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

        // Registro de auditoria: atualização do cliente
        await createAuditLog({
          userId: _ctx.user?.id ?? null,
          action: "update",
          entity: "clients",
          entityId: _input.id,
          before: client,
          after: _input.data,
          metadata: {
            ip: _ctx.req?.ip,
            userAgent: _ctx.req?.headers["user-agent"],
          },
        });

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

        // Registro de auditoria: remoção do cliente
        await createAuditLog({
          userId: _ctx.user?.id ?? null,
          action: "delete",
          entity: "clients",
          entityId: _input.id,
          before: client,
          after: null,
          metadata: {
            ip: _ctx.req?.ip,
            userAgent: _ctx.req?.headers["user-agent"],
          },
        });

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
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
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

        const specialistId =
          _input.specialistId === undefined ||
          _input.specialistId === "none" ||
          _input.specialistId === null
            ? null
            : _input.specialistId;

        const service = await createService({
          id: generateId(),
          salonId: salon.id,
          ..._input,
          price,
          specialistId,
        });

        // Registro de auditoria: criação do serviço
        await createAuditLog({
          userId: _ctx.user?.id ?? null,
          action: "create",
          entity: "services",
          entityId: service.id,
          before: null,
          after: service,
          metadata: {
            ip: _ctx.req?.ip,
            userAgent: _ctx.req?.headers["user-agent"],
          },
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
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }

        const updateData = {
          ..._input.data,
          price:
            typeof _input.data.price === "string"
              ? _input.data.price
              : _input.data.price.toString(),
        } as unknown as Partial<Service>;

        if (
          updateData.specialistId === "none" ||
          updateData.specialistId === null
        ) {
          updateData.specialistId = null;
        }

        await updateService(_input.id, updateData);

        // Registro de auditoria: atualização do serviço
        await createAuditLog({
          userId: _ctx.user?.id ?? null,
          action: "update",
          entity: "services",
          entityId: _input.id,
          before: service,
          after: _input.data,
          metadata: {
            ip: _ctx.req?.ip,
            userAgent: _ctx.req?.headers["user-agent"],
          },
        });

        return { success: true };
      }),

    // delete: permite remoção via frontend com validações
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
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }

        // Impedir remoção se houver agendamentos futuros para este serviço
        try {
          const allAppointments = await getAppointmentsWithDetailsBySalonId(
            salon.id
          );
          const now = new Date();
          const hasFuture = allAppointments.some(
            a => a.serviceId === _input.id && new Date(a.appointmentDate) >= now
          );
          if (hasFuture) {
            throw new TRPCError({
              code: "CONFLICT",
              message:
                "Não é possível remover serviço com agendamentos futuros",
            });
          }
        } catch {
          // Se falhar ao checar agendamentos, não bloquear sem razão — continuar
        }

        await deleteService(_input.id);

        // Registro de auditoria: remoção do serviço
        await createAuditLog({
          userId: _ctx.user?.id ?? null,
          action: "delete",
          entity: "services",
          entityId: _input.id,
          before: service,
          after: null,
          metadata: {
            ip: _ctx.req?.ip,
            userAgent: _ctx.req?.headers["user-agent"],
          },
        });

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

        return await getAppointmentsWithDetailsBySalonId(
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

        // Validação robusta do agendamento
        const validation = await validateAppointmentSlot(
          _input.specialistId,
          _input.serviceId,
          _input.appointmentDate,
          _input.appointmentTime
        );

        if (!validation.valid) {
          throw new TRPCError({
            code: "CONFLICT",
            message: validation.reason || "Horário não disponível",
          });
        }

        const appointmentId = generateId();
        const appointment = await createAppointment({
          id: appointmentId,
          salonId: salon.id,
          ..._input,
        });

        // Agendar notificações automáticas
        try {
          await scheduleAppointmentNotifications(appointmentId);
        } catch {
          // Não falhar o agendamento por causa das notificações
        }

        // Verificar se algum cliente da lista de espera pode ser notificado
        try {
          const waitlistEntry = await checkWaitlistForSlot(
            _input.serviceId,
            _input.specialistId,
            _input.appointmentDate,
            _input.appointmentTime
          );

          if (waitlistEntry) {
            // Notificar cliente da lista de espera via serviço de notificação
          }
        } catch {
          // Lista de espera não deve bloquear o agendamento
        }

        // Registro de auditoria: criação do agendamento
        await createAuditLog({
          userId: _ctx.user?.id ?? null,
          action: "create",
          entity: "appointments",
          entityId: appointment.id,
          before: null,
          after: appointment,
          metadata: {
            ip: _ctx.req?.ip,
            userAgent: _ctx.req?.headers["user-agent"],
          },
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

        // Verifica entidades relacionadas
        const client = await getClientById(_input.data.clientId);
        if (!client || client.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cliente não encontrado",
          });
        }

        const service = await getServiceById(_input.data.serviceId);
        if (!service || service.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Serviço não encontrado",
          });
        }

        const specialist = await getSpecialistById(_input.data.specialistId);
        if (!specialist || specialist.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Especialista não encontrado",
          });
        }

        // Validação robusta do novo horário (excluindo o agendamento atual)
        const validation = await validateAppointmentSlot(
          _input.data.specialistId,
          _input.data.serviceId,
          _input.data.appointmentDate,
          _input.data.appointmentTime,
          _input.id // excluir o próprio agendamento da checagem
        );

        if (!validation.valid) {
          throw new TRPCError({
            code: "CONFLICT",
            message: validation.reason || "Horário não disponível",
          });
        }

        await updateAppointment(_input.id, _input.data);

        // Registro de auditoria: atualização do agendamento
        await createAuditLog({
          userId: _ctx.user?.id ?? null,
          action: "update",
          entity: "appointments",
          entityId: _input.id,
          before: appointment,
          after: _input.data,
          metadata: {
            ip: _ctx.req?.ip,
            userAgent: _ctx.req?.headers["user-agent"],
          },
        });

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

        // Registro de auditoria: remoção do agendamento
        await createAuditLog({
          userId: _ctx.user?.id ?? null,
          action: "delete",
          entity: "appointments",
          entityId: _input.id,
          before: appointment,
          after: null,
          metadata: {
            ip: _ctx.req?.ip,
            userAgent: _ctx.req?.headers["user-agent"],
          },
        });

        return { success: true };
      }),

    getAvailableSlots: protectedProcedure
      .input(
        z.object({
          specialistId: z.string(),
          serviceId: z.string(),
          date: z.date(),
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

        // Verifica se o especialista e serviço pertencem ao salão
        const specialist = await getSpecialistById(_input.specialistId);
        const service = await getServiceById(_input.serviceId);

        if (!specialist || specialist.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Especialista não encontrado",
          });
        }

        if (!service || service.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Serviço não encontrado",
          });
        }

        return await getAvailableTimeSlots(
          _input.specialistId,
          _input.serviceId,
          _input.date
        );
      }),

    validateSlot: protectedProcedure
      .input(
        z.object({
          specialistId: z.string(),
          serviceId: z.string(),
          date: z.date(),
          time: z.string(),
          excludeAppointmentId: z.string().optional(),
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

        return await validateAppointmentSlot(
          _input.specialistId,
          _input.serviceId,
          _input.date,
          _input.time,
          _input.excludeAppointmentId
        );
      }),

    getSuggestions: protectedProcedure
      .input(
        z.object({
          specialistId: z.string(),
          serviceId: z.string(),
          date: z.date(),
          preferredTime: z.string(),
          maxSuggestions: z.number().min(1).max(10).default(3),
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

        // Verifica se o especialista e serviço pertencem ao salão
        const specialist = await getSpecialistById(_input.specialistId);
        const service = await getServiceById(_input.serviceId);

        if (!specialist || specialist.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Especialista não encontrado",
          });
        }

        if (!service || service.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Serviço não encontrado",
          });
        }

        // Busca todos os horários disponíveis
        const allSlots = await getAvailableTimeSlots(
          _input.specialistId,
          _input.serviceId,
          _input.date
        );

        // Se o horário preferido está disponível, retorna ele primeiro
        if (allSlots.includes(_input.preferredTime)) {
          return [
            _input.preferredTime,
            ...allSlots.filter(slot => slot !== _input.preferredTime),
          ].slice(0, _input.maxSuggestions);
        }

        // Caso contrário, ordena por proximidade ao horário preferido
        const preferredMinutes = timeToMinutes(_input.preferredTime);

        const sortedSlots = allSlots
          .map(slot => ({
            time: slot,
            distance: Math.abs(timeToMinutes(slot) - preferredMinutes),
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, _input.maxSuggestions)
          .map(slot => slot.time);

        return sortedSlots;
      }),

    // Ação rápida: Concluir agendamento
    complete: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          paymentMethod: z
            .enum([
              "cash",
              "credit_card",
              "debit_card",
              "pix",
              "bank_transfer",
              "other",
            ])
            .optional(),
          amountPaid: z.number().positive().optional(),
          // Produtos vendidos durante o atendimento (opcional)
          products: z
            .array(
              z.object({
                productId: z.string(),
                quantity: z.number().int().positive(),
                unitPrice: z.number().nonnegative(),
              })
            )
            .optional(),
        })
      )
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        // Verifica se o agendamento pertence ao salão
        const appointment = await getAppointmentById(_input.id);
        if (!appointment || appointment.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agendamento não encontrado",
          });
        }

        // Verifica se o agendamento pode ser concluído
        if (appointment.status === "completed") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Agendamento já foi concluído",
          });
        }

        if (appointment.status === "cancelled") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Agendamento cancelado não pode ser concluído",
          });
        }

        // Registrar produtos vendidos e descontar estoque
        if (_input.products && _input.products.length > 0) {
          await saveAppointmentProducts(_input.id, salon.id, _input.products);
        }

        // Atualizar status do agendamento
        await updateAppointment(_input.id, {
          status: "completed",
          updatedAt: new Date(),
        });

        // Registrar transação financeira
        try {
          // Passar amountPaid quando fornecido para usar valor real pago (já inclui produtos)
          await recordAppointmentRevenue(
            _input.id,
            _input.paymentMethod || "cash",
            _input.amountPaid
          );
        } catch {
          // Não falha a operação se não conseguir registrar a receita
        }

        // Acumular pontos de fidelidade para o cliente
        // Regra: R$1 pago = 1 ponto. Usa amountPaid se fornecido, senão price do serviço.
        try {
          let valorBase = _input.amountPaid ?? 0;
          if (!valorBase && appointment.serviceId) {
            const svc = await getServiceById(appointment.serviceId);
            valorBase = parseFloat(svc?.price ?? "0") || 0;
          }
          if (appointment.clientId && valorBase > 0) {
            await addLoyaltyPoints(appointment.clientId, valorBase);
          }
        } catch {
          // Não falha o fluxo principal se pontos não puderem ser adicionados
        }

        // Gerar token único de avaliação e criar registro pendente
        let ratingToken: string | null = null;
        try {
          const token = crypto.randomUUID();
          // Busca nome do cliente para snapshot (não-fatal)
          let clientName: string | null = null;
          if (appointment.clientId) {
            const client = await getClientById(appointment.clientId);
            clientName = client?.name ?? null;
          }
          await createRating({
            id: generateId(),
            salonId: salon.id,
            specialistId: appointment.specialistId ?? "",
            appointmentId: appointment.id,
            token,
            used: false,
            clientName,
          });
          ratingToken = token;
        } catch {
          // Não falha o fluxo principal se o token não puder ser gerado
        }

        return {
          success: true,
          message: "Agendamento concluído com sucesso",
          ratingToken,
        };
      }),

    // Ação rápida: Cancelar agendamento
    cancel: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          reason: z.string().optional(),
        })
      )
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        // Verifica se o agendamento pertence ao salão
        const appointment = await getAppointmentById(_input.id);
        if (!appointment || appointment.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agendamento não encontrado",
          });
        }

        // Verifica se o agendamento pode ser cancelado
        if (appointment.status === "cancelled") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Agendamento já foi cancelado",
          });
        }

        if (appointment.status === "completed") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Agendamento concluído não pode ser cancelado",
          });
        }

        // Atualizar status do agendamento
        const updatedNotes = appointment.notes
          ? `${appointment.notes}\n\nCancelado: ${_input.reason || "Sem motivo especificado"}`
          : `Cancelado: ${_input.reason || "Sem motivo especificado"}`;

        await updateAppointment(_input.id, {
          status: "cancelled",
          notes: updatedNotes,
          updatedAt: new Date(),
        });

        return { success: true, message: "Agendamento cancelado com sucesso" };
      }),

    // Ação rápida: Confirmar agendamento
    confirm: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        const appointment = await getAppointmentById(_input.id);
        if (!appointment || appointment.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agendamento não encontrado",
          });
        }

        if (appointment.status === "confirmed") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Agendamento já está confirmado",
          });
        }

        if (appointment.status === "completed") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Agendamento concluído não pode ser confirmado",
          });
        }

        if (appointment.status === "cancelled") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Agendamento cancelado não pode ser confirmado",
          });
        }

        await updateAppointment(_input.id, {
          status: "confirmed",
          updatedAt: new Date(),
        });

        // Registro de auditoria
        await createAuditLog({
          userId: _ctx.user?.id ?? null,
          action: "update",
          entity: "appointments",
          entityId: _input.id,
          before: appointment,
          after: { ...appointment, status: "confirmed" },
          metadata: {
            ip: _ctx.req?.ip,
            userAgent: _ctx.req?.headers["user-agent"],
          },
        });

        return { success: true, message: "Agendamento confirmado com sucesso" };
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
          specialistId: z.string(),
          serviceId: z.string(),
          date: z.date(),
        })
      )
      .query(async ({ input: _input }) => {
        // Verifica se especialista e serviço existem e pertencem ao salão
        const specialist = await getSpecialistById(_input.specialistId);
        const service = await getServiceById(_input.serviceId);

        if (!specialist || specialist.salonId !== _input.salonId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Especialista não encontrado",
          });
        }

        if (!service || service.salonId !== _input.salonId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Serviço não encontrado",
          });
        }

        return await getAvailableTimeSlots(
          _input.specialistId,
          _input.serviceId,
          _input.date
        );
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
      // Apenas admin pode listar todos os usuários do seu salão
      if (!_ctx.user || _ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      // Garantir que o admin pertence a um salão
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Salão não encontrado",
        });
      }

      // Buscar todos e filtrar apenas usuários do mesmo salão
      const allUsers = await listUsers();
      return allUsers.filter(u => u.salonId === salon.id);
    }),

    // Criar novo usuário (apenas admin) — sempre atribuir ao salão do admin
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(2),
          email: z.string().email(),
          password: z.string().min(6),
          role: z.enum(["user", "admin"]).default("user"),
          permissions: z.record(z.string(), z.boolean()).optional(),
        })
      )
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        if (!_ctx.user || _ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }

        // Associar sempre o novo usuário ao salão do admin
        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        // Se for admin e não recebeu permissões, dar permissão total
        const perms: Record<string, boolean> | undefined =
          _input.role === "admin"
            ? { manage_all: true }
            : (_input.permissions ?? undefined);

        const newId = generateId();
        await upsertUser({
          id: newId,
          name: _input.name,
          email: _input.email,
          password: await bcrypt.hash(_input.password, 10),
          role: _input.role,
          permissions: perms,
          salonId: salon.id,
        });

        // Registro de auditoria: criação do usuário
        await createAuditLog({
          userId: _ctx.user?.id ?? null,
          action: "create",
          entity: "users",
          entityId: newId,
          before: null,
          after: {
            id: newId,
            name: _input.name,
            email: _input.email,
            role: _input.role,
            salonId: salon.id,
          },
          metadata: {
            ip: _ctx.req?.ip,
            userAgent: _ctx.req?.headers["user-agent"],
          },
        });

        return { success: true, userId: newId } as const;
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
            permissions: z.record(z.string(), z.boolean()).optional(),
            password: z.string().min(6).optional(),
          }),
        })
      )
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        // Permite que o próprio usuário edite seus dados OU admin do mesmo salão
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

        // Se o editor é admin, garantir que o usuário alvo pertença ao mesmo salão
        if (_ctx.user.role === "admin") {
          const adminSalon = await getSalonByUserId(_ctx.user.id);
          if (!adminSalon || (user as User).salonId !== adminSalon.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Acesso negado",
            });
          }
        }

        // Construir objeto de update explicitamente
        const updatePayload: Partial<InsertUser> & { id: string } = {
          id: _input.id,
        };
        if (typeof _input.data.name !== "undefined")
          updatePayload.name = _input.data.name;
        if (typeof _input.data.email !== "undefined")
          updatePayload.email = _input.data.email;
        if (typeof _input.data.role !== "undefined")
          updatePayload.role = _input.data.role;
        if ("photoUrl" in _input.data)
          updatePayload.photoUrl = _input.data.photoUrl;
        if (typeof _input.data.phone !== "undefined")
          updatePayload.phone = _input.data.phone;
        if (typeof _input.data.permissions !== "undefined")
          updatePayload.permissions = _input.data.permissions;

        // Se veio password, fazer hash e incluir no payload
        if (
          typeof _input.data.password !== "undefined" &&
          _input.data.password !== null
        ) {
          updatePayload.password = await bcrypt.hash(_input.data.password, 10);
        }

        await upsertUser(updatePayload);

        // Registro de auditoria: atualização do usuário
        await createAuditLog({
          userId: _ctx.user?.id ?? null,
          action: "update",
          entity: "users",
          entityId: _input.id,
          before: user,
          after: updatePayload,
          metadata: {
            ip: _ctx.req?.ip,
            userAgent: _ctx.req?.headers["user-agent"],
          },
        });

        return { success: true };
      }),
    resetPassword: protectedProcedure
      .input(z.object({ id: z.string(), password: z.string() }))
      .mutation(async ({ ctx: _ctx, input: _input }) => {
        // Permite que o próprio usuário troque a senha OU admin do mesmo salão
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

        if (_ctx.user.role === "admin") {
          const adminSalon = await getSalonByUserId(_ctx.user.id);
          if (!adminSalon || (user as User).salonId !== adminSalon.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Acesso negado",
            });
          }
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
        // Apenas admin pode remover usuários do seu próprio salão
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

        const adminSalon = await getSalonByUserId(_ctx.user.id);
        if (!adminSalon || (user as User).salonId !== adminSalon.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
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

        // Registro de auditoria: remoção do usuário
        await createAuditLog({
          userId: _ctx.user?.id ?? null,
          action: "delete",
          entity: "users",
          entityId: _input.id,
          before: user,
          after: null,
          metadata: {
            ip: _ctx.req?.ip,
            userAgent: _ctx.req?.headers["user-agent"],
          },
        });

        return { success: true };
      }),
  }),

  // Audit router para admins - listar logs
  audit: router({
    list: protectedProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(1000).default(50),
          offset: z.number().min(0).default(0),
        })
      )
      .query(async ({ ctx: _ctx, input: _input }) => {
        if (!_ctx.user || _ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }

        const salon = await getSalonByUserId(_ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        const { rows, total } = await listAuditLogsWithCount({
          limit: _input.limit,
          offset: _input.offset,
          salonId: salon.id,
        });

        // Enriquecer logs antes de retornar
        const enriched = await Promise.all(
          rows.map(async log => {
            const [u, s] = await Promise.all([
              log.userId ? getUser(log.userId) : Promise.resolve(undefined),
              log.salonId
                ? getSalonById(log.salonId)
                : Promise.resolve(undefined),
            ]);

            return {
              id: log.id,
              userId: log.userId,
              userName: u?.name ?? null,
              action: log.action,
              entity: log.entity,
              entityId: log.entityId,
              salonId: log.salonId ?? null,
              salonName: s?.name ?? null,
              createdAt: log.createdAt,
              createdAtPretty: new Date(log.createdAt).toLocaleString("pt-BR"),
              metadata: log.metadata,
              before: log.before,
              after: log.after,
            };
          })
        );

        return {
          logs: enriched,
          total,
          offset: _input.offset,
          limit: _input.limit,
        };
      }),
  }),

  // ============================================================================
  // NOTIFICATIONS & ADVANCED FEATURES
  // ============================================================================

  notifications: router({
    sendAppointmentNotification: protectedProcedure
      .input(
        z.object({
          appointmentId: z.string(),
          type: z.enum(["confirmation", "reminder_24h", "reminder_2h"]),
          channel: z.enum(["email", "sms", "whatsapp", "push"]),
        })
      )
      .mutation(async ({ input }) => {
        return await sendNotification(
          input.appointmentId,
          input.type,
          input.channel
        );
      }),

    getTemplates: protectedProcedure.query(async () => {
      return Object.values(defaultTemplates);
    }),

    /** Registra subscription do service worker para push notifications */
    subscribe: protectedProcedure
      .input(
        z.object({
          endpoint: z.string(),
          keys: z.object({
            p256dh: z.string(),
            auth: z.string(),
          }),
        })
      )
      .mutation(async ({ ctx, input }) => {
        logger.info(
          `[Push] Usuario ${ctx.user.id} registrado para notificacoes push`
        );
        return { success: true };
      }),

    /** Remove inscrição push */
    unsubscribe: protectedProcedure.mutation(async ({ ctx }) => {
      logger.info(
        `[Push] Usuario ${ctx.user.id} cancelou notificacoes push`
      );
      return { success: true };
    }),
  }),

  waitlist: router({
    add: protectedProcedure
      .input(
        z.object({
          clientId: z.string(),
          serviceId: z.string(),
          specialistId: z.string().optional(),
          preferredDate: z.date().optional(),
          preferredTimeStart: z.string().optional(),
          preferredTimeEnd: z.string().optional(),
          maxWaitDays: z.number().min(1).max(365).default(7),
          notificationPreference: z
            .enum(["sms", "whatsapp", "email"])
            .default("whatsapp"),
          priority: z.number().min(1).max(3).default(2),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        return await addToWaitlist(input);
      }),

    remove: protectedProcedure
      .input(z.object({ waitlistId: z.string() }))
      .mutation(async ({ input }) => {
        return await removeFromWaitlist(input.waitlistId);
      }),

    list: protectedProcedure
      .input(
        z.object({
          serviceId: z.string().optional(),
          specialistId: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return await getActiveWaitlistEntries(
          input.serviceId,
          input.specialistId
        );
      }),

    confirm: protectedProcedure
      .input(z.object({ waitlistId: z.string() }))
      .mutation(async ({ input }) => {
        return await confirmWaitlistSlot(input.waitlistId);
      }),

    stats: protectedProcedure.query(async () => {
      return await getWaitlistStats();
    }),
  }),

  reports: router({
    appointmentStats: protectedProcedure
      .input(
        z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          specialistId: z.string().optional(),
          serviceId: z.string().optional(),
          status: z
            .enum(["pending", "confirmed", "completed", "cancelled"])
            .optional(),
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

        return await generateAppointmentStats(salon.id, input);
      }),

    specialistPerformance: protectedProcedure
      .input(
        z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          specialistId: z.string().optional(),
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

        return await generateSpecialistPerformance(salon.id, input);
      }),

    servicePopularity: protectedProcedure
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

        return await generateServicePopularity(salon.id, input);
      }),

    clientAnalytics: protectedProcedure
      .input(
        z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          riskThreshold: z.number().min(0).max(100).default(70),
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

        const analytics = await generateClientAnalytics(salon.id, input);

        // Filtrar clientes com risco alto se especificado
        return {
          all: analytics,
          highRisk: analytics.filter(
            client => client.riskScore >= input.riskThreshold
          ),
        };
      }),

    dailyReport: protectedProcedure
      .input(z.object({ date: z.date() }))
      .query(async ({ ctx, input }) => {
        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        return await generateDailyReport(salon.id, input.date);
      }),

    exportCSV: protectedProcedure
      .input(
        z.object({
          reportType: z.enum([
            "appointments",
            "specialists",
            "services",
            "clients",
          ]),
          data: z.any(),
        })
      )
      .mutation(async ({ input }) => {
        const filename = `${input.reportType}_${new Date().toISOString().split("T")[0]}.csv`;
        const csvContent = exportToCSV(input.data);

        return {
          filename,
          content: csvContent,
          mimeType: "text/csv",
        };
      }),
  }),

  schedule: router({
    getSpecialistSchedule: protectedProcedure
      .input(z.object({ specialistId: z.string() }))
      .query(async ({ ctx, input }) => {
        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        // Verificar se especialista pertence ao salão
        const specialist = await getSpecialistById(input.specialistId);
        if (!specialist || specialist.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Especialista não encontrado",
          });
        }

        return await getSpecialistScheduleForDisplay(input.specialistId);
      }),

    updateSpecialistSchedule: protectedProcedure
      .input(
        z.object({
          specialistId: z.string(),
          timeSlotDuration: z.number().min(15).max(120).optional(),
          bufferTime: z.number().min(0).max(60).optional(),
          allowBookingDaysInAdvance: z.number().min(1).max(365).optional(),
          minimumNoticeHours: z.number().min(0).max(72).optional(),
          autoConfirmBookings: z.boolean().optional(),
          allowOnlineBooking: z.boolean().optional(),
          // Permitimos enviar todos os workingHours de uma vez
          workingHours: z
            .array(
              z.object({
                dayOfWeek: z.number().min(0).max(6),
                isWorking: z.boolean(),
                startTime: z.string().optional(),
                endTime: z.string().optional(),
                breakStartTime: z.string().optional(),
                breakEndTime: z.string().optional(),
              })
            )
            .optional(),
          // Datas indisponíveis no formato string ISO
          customUnavailableDates: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        const specialist = await getSpecialistById(input.specialistId);
        if (!specialist || specialist.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Especialista não encontrado",
          });
        }

        const {
          specialistId,
          customUnavailableDates: rawDates,
          ...otherUpdates
        } = input;
        // Converter strings ISO para Date[] isolando o campo para evitar conflito de tipos
        const updates: Partial<
          Omit<
            import("./specialist-schedule").SpecialistSchedule,
            "specialistId"
          >
        > = {
          ...otherUpdates,
          ...(rawDates && {
            customUnavailableDates: rawDates.map(s => new Date(s)),
          }),
        };
        // Persist updates and return the display-ready schedule to the client
        await updateSpecialistSchedule(specialistId, updates);
        return await getSpecialistScheduleForDisplay(specialistId);
      }),

    updateWorkingHours: protectedProcedure
      .input(
        z.object({
          specialistId: z.string(),
          dayOfWeek: z.number().min(0).max(6),
          isWorking: z.boolean(),
          startTime: z.string().optional(),
          endTime: z.string().optional(),
          breakStartTime: z.string().optional(),
          breakEndTime: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        const specialist = await getSpecialistById(input.specialistId);
        if (!specialist || specialist.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Especialista não encontrado",
          });
        }

        const { specialistId, dayOfWeek, ...workingHours } = input;
        await updateWorkingHoursForDay(specialistId, dayOfWeek, workingHours);

        // Retornar o schedule atualizado para facilitar sincronização otimista no cliente
        return await getSpecialistScheduleForDisplay(specialistId);
      }),

    addUnavailableDate: protectedProcedure
      .input(
        z.object({
          specialistId: z.string(),
          date: z.date(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        const specialist = await getSpecialistById(input.specialistId);
        if (!specialist || specialist.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Especialista não encontrado",
          });
        }

        await addCustomUnavailableDate(input.specialistId, input.date);
        return { success: true };
      }),

    removeUnavailableDate: protectedProcedure
      .input(
        z.object({
          specialistId: z.string(),
          date: z.date(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        }

        const specialist = await getSpecialistById(input.specialistId);
        if (!specialist || specialist.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Especialista não encontrado",
          });
        }

        await removeCustomUnavailableDate(input.specialistId, input.date);
        return { success: true };
      }),

    getAvailableSlots: protectedProcedure
      .input(
        z.object({
          specialistId: z.string(),
          date: z.date(),
          serviceDuration: z.number().min(15).max(480).default(60),
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

        const specialist = await getSpecialistById(input.specialistId);
        if (!specialist || specialist.salonId !== salon.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Especialista não encontrado",
          });
        }

        return await generateSpecialistTimeSlots(
          input.specialistId,
          input.date,
          input.serviceDuration
        );
      }),
  }),

  // Image uploads (server-side proxy to Cloudinary)
  images: router({
    upload: protectedProcedure
      .input(z.object({ base64: z.string(), publicId: z.string().optional() }))
      .mutation(async ({ input }) => {
        try {
          const res = await uploadBase64Image(input.base64, input.publicId);
          return { success: true, url: res.url, publicId: res.public_id };
        } catch (e) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: e instanceof Error ? e.message : "Erro ao fazer upload",
          });
        }
      }),
  }),

  dashboard: dashboardRouter,

  // ============================================================
  // MÓDULO DE PRODUTOS (Sprint 3)
  // ============================================================
  products: router({
    /** Lista todos os produtos do salão */
    list: protectedProcedure.query(async ({ ctx }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Salão não encontrado",
        });
      return getProductsBySalonId(salon.id);
    }),

    /** Lista produtos com estoque baixo (stock <= minStock) */
    lowStock: protectedProcedure.query(async ({ ctx }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Salão não encontrado",
        });
      return getLowStockProducts(salon.id);
    }),

    /** Cria um novo produto */
    create: protectedProcedure
      .input(productSchema)
      .mutation(async ({ ctx, input }) => {
        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        return createProduct({ ...input, salonId: salon.id });
      }),

    /** Atualiza um produto existente */
    update: protectedProcedure
      .input(productSchema.extend({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        const { id, ...data } = input;
        const updated = await updateProduct(id, salon.id, data);
        if (!updated)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Produto não encontrado",
          });
        return updated;
      }),

    /** Remove um produto */
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        const ok = await deleteProduct(input.id, salon.id);
        if (!ok)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Produto não encontrado",
          });
        return { success: true };
      }),
  }),

  // ==========================================================================
  // RATINGS — Avaliações pós-atendimento
  // ==========================================================================
  ratings: router({
    /** Lista todas as avaliações enviadas de um especialista */
    getBySpecialist: protectedProcedure
      .input(z.object({ specialistId: z.string() }))
      .query(async ({ ctx, input }) => {
        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        return await getRatingsBySpecialist(input.specialistId);
      }),

    /** Retorna mapa specialistId -> { average, count } para o salão inteiro */
    getAllAverages: protectedProcedure.query(async ({ ctx }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Salão não encontrado",
        });
      return await getAllSpecialistRatings(salon.id);
    }),

    /** Lista todas as avaliações submetidas do salão — para a página /avaliacoes */
    getAll: protectedProcedure.query(async ({ ctx }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Salão não encontrado",
        });
      return await getAllRatingsBySalon(salon.id);
    }),
  }),

  // ==========================================================================
  // STRIPE — Pagamentos via cartão
  // ==========================================================================
  stripe: router({
    /** Cria um Payment Intent e retorna as opções de pagamento */
    createPaymentIntent: protectedProcedure
      .input(
        z.object({
          amount: z.number().positive(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        const paymentIntent = await createStripePaymentIntent({
          amount: input.amount,
          description: input.description || "Pagamento BizFlow Access",
          metadata: { salonId: salon.id, userId: ctx.user.id },
        });
        return paymentIntent;
      }),

    /** Confirma um Payment Intent após o cliente preencher os dados do cartão */
    confirmPayment: protectedProcedure
      .input(
        z.object({
          paymentIntentId: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await confirmStripePayment(input.paymentIntentId);
        return result;
      }),

    /** Retorna as opções de pagamento disponíveis */
    getPaymentOptions: protectedProcedure
      .input(
        z.object({
          amount: z.number().positive(),
        })
      )
      .query(async ({ ctx, input }) => {
        const salon = await getSalonByUserId(ctx.user.id);
        if (!salon)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Salão não encontrado",
          });
        return generatePaymentOptions(
          input.amount,
          salon.pixKey || undefined,
          salon.name
        );
      }),
  }),

});

// Importar o roteador de agendamento público
import { publicBookingRouter } from "./public-booking";

// Roteador público (sem autenticação) para agendamentos e avaliações
// ⚙️ ratings.submit e ratings.getByToken são públicos (acesso via token único)
export const publicRouter = router({
  booking: publicBookingRouter,
  ratings: router({
    /** Busca a avaliação pelo token — retorna info do serviço para exibir na tela pública */
    getByToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const rating = await getRatingByToken(input.token);
        if (!rating)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Avaliação não encontrada",
          });
        return rating;
      }),

    /** Submete a avaliação do cliente (1-5 estrelas + comentário opcional) */
    submit: publicProcedure
      .input(
        z.object({
          token: z.string(),
          stars: z.number().int().min(1).max(5),
          comment: z.string().max(500).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const rating = await getRatingByToken(input.token);
        if (!rating)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Avaliação não encontrada",
          });
        if (rating.used)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Esta avaliação já foi enviada",
          });
        const ok = await submitRating(input.token, input.stars, input.comment);
        if (!ok)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao salvar avaliação",
          });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
export type PublicRouter = typeof publicRouter;
