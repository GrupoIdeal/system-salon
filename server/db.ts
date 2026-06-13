import {
  eq,
  and,
  gte,
  lte,
  like,
  asc,
  sql,
  desc,
  sum,
  count,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  users,
  salons,
  specialists,
  clients,
  services,
  appointments,
  passwordResets,
  transactions,
  auditLogs,
  products,
  appointmentProducts,
  InsertUser,
  InsertSalon,
  InsertSpecialist,
  InsertClient,
  InsertService,
  InsertAppointment,
  InsertPasswordReset,
  InsertTransaction,
  InsertAuditLog,
  InsertProduct,
  User,
  Salon,
  Specialist,
  Client,
  Service,
  Appointment,
  AppointmentWithDetails,
  PasswordReset,
  AuditLog,
  Product,
  AppointmentProduct,
  ratings,
  Rating,
  InsertRating,
} from "../drizzle/schema";
import * as schema from "../drizzle/schema";
import * as relations from "../drizzle/relations";
import { ENV } from "./_core/env";
import { nanoid } from "nanoid";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client, {
        schema: {
          ...schema,
          ...relations,
        },
      });
    } catch {
      _db = null;
    }
  }
  return _db;
}

// Helper para mascarar campos sensíveis antes de salvar no audit log
function maskSensitiveFields(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(v => maskSensitiveFields(v));
  if (typeof value === "object") {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const lower = k.toLowerCase();
      if (
        /(password|pass|pwd|secret|token|apikey|api_key|private_key|authorization|bearer)/.test(
          lower
        )
      ) {
        obj[k] = "[REDACTED]";
      } else {
        obj[k] = maskSensitiveFields(v);
      }
    }
    return obj;
  }
  return value;
}

/**
 * Cria uma entrada de audit log
 */
export async function createAuditLog(params: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown> | null;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const id = nanoid();
  try {
    // Tentar inferir salonId se não fornecido
    const metadata = { ...(params.metadata ?? {}) } as Record<string, unknown>;
    try {
      if (!metadata.salonId && params.userId) {
        // getSalonByUserId está no mesmo módulo e pode ser usado aqui
        const salon = await getSalonByUserId(params.userId as string).catch(
          () => undefined
        );
        if (salon && salon.id) metadata.salonId = salon.id;
      }
    } catch {
      // ignore
    }

    // Extrair salonId separado para persistência eficiente
    const salonId =
      typeof metadata.salonId === "string" ? metadata.salonId : undefined;

    // Mascarar campos sensíveis em before/after
    const safeBefore = params.before
      ? maskSensitiveFields(params.before)
      : null;
    const safeAfter = params.after ? maskSensitiveFields(params.after) : null;

    await db.insert(auditLogs).values({
      id,
      userId: params.userId ?? null,
      salonId: salonId ?? null,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId ?? null,
      before: safeBefore ?? null,
      after: safeAfter ?? null,
      metadata: Object.keys(metadata).length > 0 ? metadata : null,
      createdAt: new Date(),
    } as InsertAuditLog);
  } catch (err) {
    // Não propagar erro de logging para não quebrar a ação principal
    console.error("createAuditLog failed", err);
  }
}

/**
 * Lista audit logs com filtros simples
 */
export async function listAuditLogs(filter?: {
  userId?: string;
  userIds?: string[];
  entity?: string;
  entityId?: string;
  limit?: number;
  salonId?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<AuditLog[]> {
  const db = await getDb();
  if (!db) return [];

  const limit = filter?.limit ?? 100;

  // Construir WHERE como fragments SQL e combinar em uma única expressão
  const parts: Array<ReturnType<typeof sql>> = [];
  if (filter?.userId) parts.push(sql`${auditLogs.userId} = ${filter.userId}`);
  if (filter?.userIds && filter.userIds.length > 0)
    parts.push(
      sql`${auditLogs.userId} IN (${sql.join(
        filter.userIds.map(u => sql`${u}`),
        sql`, `
      )})`
    );
  if (filter?.entity) parts.push(sql`${auditLogs.entity} = ${filter.entity}`);
  if (filter?.entityId)
    parts.push(sql`${auditLogs.entityId} = ${filter.entityId}`);
  if (filter?.salonId)
    parts.push(
      sql`(COALESCE(${auditLogs.salonId}::text, '') = ${filter.salonId} OR (${auditLogs.metadata} ->> 'salonId') = ${filter.salonId})`
    );
  if (filter?.startDate)
    parts.push(sql`${auditLogs.createdAt} >= ${filter.startDate}`);
  if (filter?.endDate)
    parts.push(sql`${auditLogs.createdAt} <= ${filter.endDate}`);

  let whereExpr: ReturnType<typeof sql> | undefined = undefined;
  if (parts.length === 1) whereExpr = parts[0];
  else if (parts.length > 1)
    whereExpr = parts.reduce((acc, cur) => sql`${acc} AND ${cur}`);

  if (whereExpr) {
    return await db
      .select()
      .from(auditLogs)
      .where(whereExpr)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  return await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

/**
 * Lista audit logs com paginação e retorna total para paginação no cliente
 */
export async function listAuditLogsWithCount(filter?: {
  userId?: string;
  userIds?: string[];
  entity?: string;
  entityId?: string;
  limit?: number;
  offset?: number;
  salonId?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<{ rows: AuditLog[]; total: number }> {
  const db = await getDb();
  if (!db) return { rows: [], total: 0 };

  const limit = filter?.limit ?? 100;
  const offset = filter?.offset ?? 0;

  const parts: Array<ReturnType<typeof sql>> = [];
  if (filter?.userId) parts.push(sql`${auditLogs.userId} = ${filter.userId}`);
  if (filter?.userIds && filter.userIds.length > 0)
    parts.push(
      sql`${auditLogs.userId} IN (${sql.join(
        filter.userIds.map(u => sql`${u}`),
        sql`, `
      )})`
    );
  if (filter?.entity) parts.push(sql`${auditLogs.entity} = ${filter.entity}`);
  if (filter?.entityId)
    parts.push(sql`${auditLogs.entityId} = ${filter.entityId}`);
  if (filter?.salonId)
    parts.push(
      sql`(COALESCE(${auditLogs.salonId}::text, '') = ${filter.salonId} OR (${auditLogs.metadata} ->> 'salonId') = ${filter.salonId})`
    );
  if (filter?.startDate)
    parts.push(sql`${auditLogs.createdAt} >= ${filter.startDate}`);
  if (filter?.endDate)
    parts.push(sql`${auditLogs.createdAt} <= ${filter.endDate}`);

  let whereExpr: ReturnType<typeof sql> | undefined = undefined;
  if (parts.length === 1) whereExpr = parts[0];
  else if (parts.length > 1)
    whereExpr = parts.reduce((acc, cur) => sql`${acc} AND ${cur}`);

  // total
  let total = 0;
  if (whereExpr) {
    const countRes = await db
      .select({ total: sql`COUNT(*)` })
      .from(auditLogs)
      .where(whereExpr);
    total = Number(
      (countRes[0] as unknown as { total?: string | number }).total ?? 0
    );
  } else {
    const countRes = await db.select({ total: sql`COUNT(*)` }).from(auditLogs);
    total = Number(
      (countRes[0] as unknown as { total?: string | number }).total ?? 0
    );
  }

  // rows
  let rows: AuditLog[] = [];
  if (whereExpr) {
    rows = await db
      .select()
      .from(auditLogs)
      .where(whereExpr)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);
  } else {
    rows = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  return { rows, total };
}

// ============================================================================
// USER QUERIES
// ============================================================================

export async function upsertUser(
  user: Partial<InsertUser> & { id: string }
): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    return;
  }

  try {
    // Monta objeto do tipo InsertUser explicitamente
    const values: InsertUser = {
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      password: user.password || "",
      role: user.role ?? (user.id === ENV.ownerId ? "admin" : "user"),
      lastSignedIn: user.lastSignedIn,
      photoUrl: user.photoUrl ?? null,
      phone: user.phone,
      createdAt: undefined,
      updatedAt: undefined,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.password !== undefined) {
      values.password = user.password;
      updateSet.password = user.password;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }

    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.id === ENV.ownerId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    // Forçar update do photoUrl mesmo se vier vazio ou undefined
    if ("photoUrl" in user) {
      values.photoUrl = user.photoUrl ?? null;
      updateSet.photoUrl = user.photoUrl ?? null;
    }

    // Permissões granulares (JSONB) - permitir setar explicitamente
    if ("permissions" in user) {
      values.permissions = user.permissions ?? null;
      updateSet.permissions = user.permissions ?? null;
    }

    // salonId: permitir associar usuário explicitamente a um salão
    if ("salonId" in user) {
      values.salonId = user.salonId ?? null;
      updateSet.salonId = user.salonId ?? null;
    }

    if (user.phone !== undefined) {
      values.phone = user.phone;
      updateSet.phone = user.phone;
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    try {
      // Primeiro tenta atualizar - se o usuário já existir
      const result = await db
        .update(users)
        .set(updateSet)
        .where(eq(users.id, user.id))
        .returning();

      // Se não atualizou nenhuma linha, então o usuário não existe, então inserimos
      if (result.length === 0) {
        await db.insert(users).values(values);
      }
    } catch {
      throw new Error("Failed to upsert user");
    }
  } catch {
    throw new Error("Failed to upsert user");
  }
}

export async function getUser(id: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listUsers(): Promise<Omit<User, "password">[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(users);
  // Nunca retornar o hash de senha na listagem de usuários
  return result.map(
    ({ password: _p, ...rest }) => rest as Omit<User, "password">
  );
}

// ============================================================================
// SALON QUERIES
// ============================================================================

export async function getSalonByUserId(
  userId: string
): Promise<Salon | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  // Primeiro, tenta encontrar salão onde o usuário é owner
  const ownerResult = await db
    .select()
    .from(salons)
    .where(eq(salons.userId, userId))
    .limit(1);

  if (ownerResult.length > 0) return ownerResult[0];

  // Se não for owner, verificar se o usuário tem salonId associado
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (userResult.length === 0) return undefined;

  const userRow = userResult[0] as User;
  const salonId = userRow.salonId;
  if (!salonId) return undefined;

  const salonResult = await db
    .select()
    .from(salons)
    .where(eq(salons.id, salonId))
    .limit(1);

  return salonResult.length > 0 ? salonResult[0] : undefined;
}

export async function getSalonById(
  salonId: string
): Promise<Salon | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(salons)
    .where(eq(salons.id, salonId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createSalon(data: InsertSalon): Promise<Salon> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  const result = await db.insert(salons).values(data).returning();
  return result[0];
}

export async function updateSalon(
  salonId: string,
  data: Partial<Salon>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(salons).set(data).where(eq(salons.id, salonId));
}

// ============================================================================
// SPECIALIST QUERIES
// ============================================================================

export async function getSpecialistsBySalonId(
  salonId: string
): Promise<Specialist[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(specialists)
    .where(eq(specialists.salonId, salonId));
}

export async function getSpecialistById(
  specialistId: string
): Promise<Specialist | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(specialists)
    .where(eq(specialists.id, specialistId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createSpecialist(
  data: InsertSpecialist
): Promise<Specialist> {
  const db = await getDb();
  if (db == null) throw new Error("Database not available");
  await db.insert(specialists).values(data);
  return data as Specialist;
}

export async function updateSpecialist(
  specialistId: string,
  data: Partial<Specialist>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(specialists)
    .set(data)
    .where(eq(specialists.id, specialistId));
}

export async function deleteSpecialist(specialistId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(specialists).where(eq(specialists.id, specialistId));
}

// ============================================================================
// CLIENT QUERIES
// ============================================================================

export async function getClientsBySalonId(
  salonId: string,
  search?: string,
  limit = 50,
  offset = 0
): Promise<Client[]> {
  const db = await getDb();
  if (!db) return [];

  const whereConditions = search
    ? and(eq(clients.salonId, salonId), like(clients.name, `%${search}%`))
    : eq(clients.salonId, salonId);

  return await db
    .select()
    .from(clients)
    .where(whereConditions)
    .limit(limit)
    .offset(offset);
}

export async function getClientById(
  clientId: string
): Promise<Client | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createClient(data: InsertClient): Promise<Client> {
  const db = await getDb();
  if (db == null) throw new Error("Database not available");
  await db.insert(clients).values(data);
  return data as Client;
}

export async function updateClient(
  clientId: string,
  data: Partial<Client>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(clients).set(data).where(eq(clients.id, clientId));
}

export async function deleteClient(clientId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(clients).where(eq(clients.id, clientId));
}

/**
 * Incrementa os pontos de fidelidade de um cliente.
 * Regra: cada R$ 1,00 pago = 1 ponto.
 * ⚙️ Ponto de troca: ajuste a regra de conversão aqui se necessário.
 */
export async function addLoyaltyPoints(
  clientId: string,
  amountPaid: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const pointsToAdd = Math.floor(amountPaid); // R$1 = 1 ponto
  if (pointsToAdd <= 0) return;

  await db
    .update(clients)
    .set({
      loyaltyPoints: sql`${clients.loyaltyPoints} + ${pointsToAdd}`,
      updatedAt: new Date(),
    })
    .where(eq(clients.id, clientId));
}

// ============================================================================
// SERVICE QUERIES
// ============================================================================

export async function getServicesBySalonId(
  salonId: string
): Promise<Service[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(services).where(eq(services.salonId, salonId));
}

export async function getServiceById(
  serviceId: string
): Promise<Service | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(services)
    .where(eq(services.id, serviceId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createService(data: InsertService): Promise<Service> {
  const db = await getDb();
  if (db == null) throw new Error("Database not available");
  await db.insert(services).values(data);
  return data as Service;
}

export async function updateService(
  serviceId: string,
  data: Partial<Service>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(services).set(data).where(eq(services.id, serviceId));
}

export async function deleteService(serviceId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(services).where(eq(services.id, serviceId));
}

// ============================================================================
// APPOINTMENT QUERIES
// ============================================================================

export async function getAppointmentsBySalonId(
  salonId: string,
  startDate?: Date,
  endDate?: Date
): Promise<Appointment[]> {
  const db = await getDb();
  if (!db) return [];

  const whereConditions =
    startDate && endDate
      ? and(
          eq(appointments.salonId, salonId),
          gte(appointments.appointmentDate, startDate),
          lte(appointments.appointmentDate, endDate)
        )
      : eq(appointments.salonId, salonId);

  return await db
    .select()
    .from(appointments)
    .where(whereConditions)
    .orderBy(asc(appointments.appointmentDate));
}

// New function to get appointments with full details using manual joins
export async function getAppointmentsWithDetailsBySalonId(
  salonId: string,
  startDate?: Date,
  endDate?: Date
): Promise<AppointmentWithDetails[]> {
  const db = await getDb();
  if (!db) return [];

  const whereConditions =
    startDate && endDate
      ? and(
          eq(appointments.salonId, salonId),
          gte(appointments.appointmentDate, startDate),
          lte(appointments.appointmentDate, endDate)
        )
      : eq(appointments.salonId, salonId);

  const result = await db
    .select({
      // Appointment fields
      id: appointments.id,
      salonId: appointments.salonId,
      clientId: appointments.clientId,
      serviceId: appointments.serviceId,
      specialistId: appointments.specialistId,
      appointmentDate: appointments.appointmentDate,
      appointmentTime: appointments.appointmentTime,
      status: appointments.status,
      notes: appointments.notes,
      isPublic: appointments.isPublic,
      paidAmount: appointments.paidAmount,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      deletedAt: appointments.deletedAt,
      // Client fields
      client: {
        id: clients.id,
        name: clients.name,
        email: clients.email,
        phone: clients.phone,
        notes: clients.notes,
        photo: clients.photo,
        salonId: clients.salonId,
        createdAt: clients.createdAt,
        updatedAt: clients.updatedAt,
        loyaltyPoints: clients.loyaltyPoints,
      },
      // Service fields
      service: {
        id: services.id,
        name: services.name,
        description: services.description,
        duration: services.duration,
        price: services.price,
        priceFrom: services.priceFrom,
        status: services.status,
        salonId: services.salonId,
        specialistId: services.specialistId,
        createdAt: services.createdAt,
        updatedAt: services.updatedAt,
        deletedAt: services.deletedAt,
      },
      // Specialist fields
      specialist: {
        id: specialists.id,
        name: specialists.name,
        specialty: specialists.specialty,
        photo: specialists.photo,
        email: specialists.email,
        phone: specialists.phone,
        bio: specialists.bio,
        workingDays: specialists.workingDays,
        status: specialists.status,
        salonId: specialists.salonId,
        createdAt: specialists.createdAt,
        updatedAt: specialists.updatedAt,
        deletedAt: specialists.deletedAt,
      },
    })
    .from(appointments)
    .innerJoin(clients, eq(appointments.clientId, clients.id))
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .innerJoin(specialists, eq(appointments.specialistId, specialists.id))
    .where(whereConditions)
    .orderBy(asc(appointments.appointmentDate));

  // Transform the result to match AppointmentWithDetails type
  return result.map(row => ({
    id: row.id,
    salonId: row.salonId,
    clientId: row.clientId,
    serviceId: row.serviceId,
    specialistId: row.specialistId,
    appointmentDate: row.appointmentDate,
    appointmentTime: row.appointmentTime,
    status: row.status,
    notes: row.notes,
    isPublic: row.isPublic,
    paidAmount: row.paidAmount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
    client: row.client,
    service: row.service,
    specialist: row.specialist,
  }));
}

export async function getAppointmentById(
  appointmentId: string
): Promise<Appointment | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, appointmentId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAppointmentsBySpecialistAndDate(
  specialistId: string,
  date: Date
): Promise<Appointment[]> {
  const db = await getDb();
  if (!db) return [];

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.specialistId, specialistId),
        gte(appointments.appointmentDate, startOfDay),
        lte(appointments.appointmentDate, endOfDay)
      )
    );
}

export async function createAppointment(
  data: InsertAppointment
): Promise<Appointment> {
  const db = await getDb();
  if (db == null) throw new Error("Database not available");
  await db.insert(appointments).values(data);
  return data as Appointment;
}

export async function updateAppointment(
  appointmentId: string,
  data: Partial<Appointment>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(appointments)
    .set(data)
    .where(eq(appointments.id, appointmentId));
}

export async function deleteAppointment(appointmentId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(appointments).where(eq(appointments.id, appointmentId));
}

// ============================================================================
// TRANSACTION FUNCTIONS
// ============================================================================

export type { Transaction, InsertTransaction } from "../drizzle/schema";

/**
 * Cria uma nova transação financeira
 */
export async function createTransaction(transaction: InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database não disponível");

  const [newTransaction] = await db
    .insert(transactions)
    .values(transaction)
    .returning();

  return newTransaction;
}

/**
 * Busca transações por salão
 */
export async function getTransactionsBySalonId(
  salonId: string,
  filters?: {
    type?: "income" | "expense" | "refund";
    status?: "pending" | "completed" | "cancelled";
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
) {
  const db = await getDb();
  if (!db) return [];

  // Construir condições WHERE
  const conditions = [eq(transactions.salonId, salonId)];

  if (filters?.type) {
    conditions.push(eq(transactions.type, filters.type));
  }

  if (filters?.status) {
    conditions.push(eq(transactions.status, filters.status));
  }

  if (filters?.startDate && filters?.endDate) {
    conditions.push(
      gte(transactions.transactionDate, filters.startDate),
      lte(transactions.transactionDate, filters.endDate)
    );
  }

  const baseQuery = db
    .select({
      transaction: transactions,
      client: {
        id: clients.id,
        name: clients.name,
      },
      service: {
        id: services.id,
        name: services.name,
        duration: services.duration,
      },
      specialist: {
        id: specialists.id,
        name: specialists.name,
        specialty: specialists.specialty,
      },
      appointment: {
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
      },
    })
    .from(transactions)
    .leftJoin(clients, eq(transactions.clientId, clients.id))
    .leftJoin(services, eq(transactions.serviceId, services.id))
    .leftJoin(specialists, eq(transactions.specialistId, specialists.id))
    .leftJoin(appointments, eq(transactions.appointmentId, appointments.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.transactionDate));

  // Aplicar limit e offset
  if (filters?.limit && filters?.offset) {
    return baseQuery.limit(filters.limit).offset(filters.offset);
  } else if (filters?.limit) {
    return baseQuery.limit(filters.limit);
  } else if (filters?.offset) {
    return baseQuery.offset(filters.offset);
  }

  return baseQuery;
}

/**
 * Busca estatísticas financeiras do salão
 */
export async function getFinancialStatistics(
  salonId: string,
  startDate: Date,
  endDate: Date
) {
  const db = await getDb();
  if (!db) return null;

  // Receitas
  const incomeResult = await db
    .select({
      total: sum(transactions.amount),
      count: count(transactions.id),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.salonId, salonId),
        eq(transactions.type, "income"),
        eq(transactions.status, "completed"),
        gte(transactions.transactionDate, startDate),
        lte(transactions.transactionDate, endDate)
      )
    );

  // Despesas
  const expenseResult = await db
    .select({
      total: sum(transactions.amount),
      count: count(transactions.id),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.salonId, salonId),
        eq(transactions.type, "expense"),
        eq(transactions.status, "completed"),
        gte(transactions.transactionDate, startDate),
        lte(transactions.transactionDate, endDate)
      )
    );

  const totalIncome = Number(incomeResult[0]?.total || 0);
  const totalExpenses = Number(expenseResult[0]?.total || 0);
  const netProfit = totalIncome - totalExpenses;

  return {
    income: {
      total: totalIncome,
      count: Number(incomeResult[0]?.count || 0),
    },
    expenses: {
      total: totalExpenses,
      count: Number(expenseResult[0]?.count || 0),
    },
    netProfit,
  };
}

/**
 * Registra receita de um agendamento concluído
 */
export async function recordAppointmentRevenue(
  appointmentId: string,
  paymentMethod?:
    | "cash"
    | "credit_card"
    | "debit_card"
    | "pix"
    | "bank_transfer"
    | "other",
  amountPaid?: number // novo parâmetro opcional para sobrescrever o preço do serviço
) {
  const db = await getDb();
  if (!db) throw new Error("Database não disponível");

  // Buscar dados do agendamento
  const appointmentData = await db
    .select({
      appointment: appointments,
      client: { id: clients.id, name: clients.name },
      service: { id: services.id, name: services.name, price: services.price },
      specialist: { id: specialists.id, name: specialists.name },
      salon: { id: salons.id },
    })
    .from(appointments)
    .leftJoin(clients, eq(appointments.clientId, clients.id))
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .leftJoin(specialists, eq(appointments.specialistId, specialists.id))
    .leftJoin(salons, eq(appointments.salonId, salons.id))
    .where(eq(appointments.id, appointmentId))
    .limit(1);

  if (!appointmentData.length || !appointmentData[0].appointment) {
    throw new Error("Agendamento não encontrado");
  }

  const { appointment, client, service, specialist, salon } =
    appointmentData[0];

  if (!salon || !service) {
    throw new Error("Dados incompletos para registrar transação");
  }

  // Se amountPaid foi fornecido, usa esse valor; caso contrário usa o preço do serviço
  const amount =
    typeof amountPaid === "number" && !Number.isNaN(amountPaid)
      ? amountPaid
      : Number(service.price);

  const specialistCommission = amount * 0.6; // 60% para o especialista
  const serviceFee = amount - specialistCommission; // 40% para o salão

  // Criar transação
  const transaction = await createTransaction({
    id: generateId(),
    salonId: salon.id,
    appointmentId: appointment.id,
    clientId: client?.id || null,
    serviceId: service.id,
    specialistId: specialist?.id || null,
    type: "income",
    status: "completed",
    paymentMethod: paymentMethod || "cash",
    amount: amount.toString(),
    serviceFee: serviceFee.toString(),
    specialistCommission: specialistCommission.toString(),
    description: `Serviço: ${service.name} - Cliente: ${client?.name || "N/A"}`,
    transactionDate: new Date(),
  });

  // Se foi fornecido amountPaid, salvar no agendamento (paidAmount)
  if (typeof amountPaid === "number" && !Number.isNaN(amountPaid)) {
    try {
      // Converter para string para compatibilizar com o tipo decimal no schema
      await updateAppointment(appointment.id, {
        paidAmount: amount.toString(),
      });
    } catch (err) {
      console.error("Failed to save paidAmount on appointment:", err);
    }
  }

  return transaction;
}

// ============================================================================
// PASSWORD RESET QUERIES
// ============================================================================

export async function createPasswordReset(
  data: InsertPasswordReset
): Promise<PasswordReset> {
  const db = await getDb();
  if (db == null) throw new Error("Database not available");
  await db.insert(passwordResets).values(data);
  return data as PasswordReset;
}

export async function getPasswordResetByToken(
  token: string
): Promise<PasswordReset | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(passwordResets)
    .where(eq(passwordResets.token, token))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function markPasswordResetAsUsed(resetId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(passwordResets)
    .set({ used: true })
    .where(eq(passwordResets.id, resetId));
}

/**
 * Valida se um agendamento pode ser criado sem conflitos
 */
export async function validateAppointmentSlot(
  specialistId: string,
  serviceId: string,
  date: Date,
  time: string,
  excludeAppointmentId?: string
): Promise<{ valid: boolean; reason?: string }> {
  console.log("🔍 validateAppointmentSlot DEBUG:", {
    specialistId,
    serviceId,
    date: date.toISOString(),
    time,
    excludeAppointmentId,
  });

  const specialist = await getSpecialistById(specialistId);
  const service = await getServiceById(serviceId);

  if (!specialist || !service) {
    return { valid: false, reason: "Especialista ou serviço não encontrado" };
  }

  // Busca dados do salão
  const salon = await getSalonById(specialist.salonId);
  if (!salon) {
    return { valid: false, reason: "Salão não encontrado" };
  }

  // Determina dia da semana
  const dayOfWeek = date.getDay();
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayName = dayNames[dayOfWeek];

  console.log("📅 Day validation info:", {
    dayOfWeek,
    dayName,
    specialistWorkingDays: specialist.workingDays?.[dayName],
  });

  // Agora usamos apenas os horários do especialista (sem verificação de salão)

  // Verifica se especialista trabalha neste dia usando o sistema de schedule primeiro
  let specialistPeriods: Array<{
    start: string;
    end: string;
    lunch?: { start: string; end: string };
  }> = [];

  try {
    // Importa o sistema de schedule
    const { isSpecialistWorking, getSpecialistSchedule } = await import(
      "./specialist-schedule"
    );

    // Verifica se precisa sincronizar os dados legacy
    const { needsSyncronization, syncLegacyWorkingDaysToSchedule } =
      await import("./sync-schedules");
    const needsSync = await needsSyncronization(specialistId);
    if (needsSync) {
      console.log("🔄 Auto-syncing legacy workingDays to schedule system");
      await syncLegacyWorkingDaysToSchedule(specialistId);
    }

    const isWorking = await isSpecialistWorking(specialistId, date);
    if (!isWorking) {
      return { valid: false, reason: "Especialista não trabalha neste dia" };
    }

    const schedule = await getSpecialistSchedule(specialistId);
    const workingHours = schedule.workingHours.find(
      wh => wh.dayOfWeek === dayOfWeek
    );

    if (
      workingHours?.isWorking &&
      workingHours.startTime &&
      workingHours.endTime
    ) {
      specialistPeriods = [
        {
          start: workingHours.startTime,
          end: workingHours.endTime,
          lunch:
            workingHours.breakStartTime && workingHours.breakEndTime
              ? {
                  start: workingHours.breakStartTime,
                  end: workingHours.breakEndTime,
                }
              : undefined,
        },
      ];
      console.log("✅ Using specialist schedule system for validation");
    } else {
      // Fallback para o sistema antigo
      if (!specialist.workingDays?.[dayName]) {
        return { valid: false, reason: "Especialista não trabalha neste dia" };
      }
      specialistPeriods = specialist.workingDays[dayName];
      console.log("⚠️ Using legacy workingDays system for validation");
    }
  } catch (error) {
    console.log(
      "⚠️ Error with schedule system, falling back to legacy:",
      error
    );
    // Fallback para o sistema antigo
    if (!specialist.workingDays?.[dayName]) {
      return { valid: false, reason: "Especialista não trabalha neste dia" };
    }
    specialistPeriods = specialist.workingDays[dayName];
  }

  // Verifica se o horário está dentro dos períodos do especialista
  let isWithinSpecialistHours = false;
  for (const period of specialistPeriods) {
    if (
      isWithinWorkingHours(
        time,
        service.duration,
        { [dayName]: [period] },
        dayName
      )
    ) {
      isWithinSpecialistHours = true;
      break;
    }
  }

  if (!isWithinSpecialistHours) {
    return {
      valid: false,
      reason: "Horário fora do expediente do especialista",
    };
  }

  // Verifica conflitos
  const conflictingAppointments = await getConflictingAppointments(
    specialistId,
    date,
    time,
    service.duration,
    excludeAppointmentId
  );

  if (conflictingAppointments.length > 0) {
    return { valid: false, reason: "Horário já está ocupado" };
  }

  // Verifica se o horário não está no passado
  const brazilNow = getBrazilianDateTime();
  const selectedDateBrazil = new Date(
    date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );
  const isToday =
    selectedDateBrazil.toDateString() === brazilNow.toDateString();

  if (isToday) {
    const currentBrazilTime = `${brazilNow.getHours().toString().padStart(2, "0")}:${brazilNow.getMinutes().toString().padStart(2, "0")}`;
    const slotMinutes = timeToMinutes(time);
    const currentMinutes = timeToMinutes(currentBrazilTime);
    const minimumAdvanceMinutes = 30;

    if (slotMinutes < currentMinutes + minimumAdvanceMinutes) {
      return {
        valid: false,
        reason:
          "Horário muito próximo ao atual (mínimo 30 min de antecedência)",
      };
    }
  }

  console.log("✅ Slot validation passed");
  return { valid: true };
}

/**
 * Busca próximos horários disponíveis se o horário solicitado não estiver disponível
 */
export async function findAlternativeTimeSlots(
  specialistId: string,
  serviceId: string,
  date: Date,
  preferredTime: string,
  maxSuggestions: number = 3
): Promise<string[]> {
  const allAvailableSlots = await getAvailableTimeSlots(
    specialistId,
    serviceId,
    date
  );

  if (allAvailableSlots.includes(preferredTime)) {
    return [preferredTime];
  }

  const preferredMinutes = timeToMinutes(preferredTime);

  // Ordena slots por proximidade ao horário preferido
  const sortedSlots = allAvailableSlots
    .map(slot => ({
      time: slot,
      minutes: timeToMinutes(slot),
      distance: Math.abs(timeToMinutes(slot) - preferredMinutes),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxSuggestions)
    .map(slot => slot.time);

  return sortedSlots;
}

/**
 * Calcula estatísticas de agendamentos para um período
 */
export async function getAppointmentStatistics(
  salonId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  total: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  bySpecialist: Record<string, { name: string; count: number }>;
  byService: Record<string, { name: string; count: number }>;
}> {
  const db = await getDb();
  if (!db) {
    return {
      total: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      bySpecialist: {},
      byService: {},
    };
  }

  const appointmentResults = await db
    .select({
      appointment: appointments,
      specialist: specialists,
      service: services,
    })
    .from(appointments)
    .innerJoin(specialists, eq(appointments.specialistId, specialists.id))
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .where(
      and(
        eq(appointments.salonId, salonId),
        gte(appointments.appointmentDate, startDate),
        lte(appointments.appointmentDate, endDate)
      )
    );

  const stats = {
    total: appointmentResults.length,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    bySpecialist: {} as Record<string, { name: string; count: number }>,
    byService: {} as Record<string, { name: string; count: number }>,
  };

  for (const apt of appointmentResults) {
    // Contagem por status
    if (apt.appointment.status === "confirmed") stats.confirmed++;
    else if (apt.appointment.status === "completed") stats.completed++;
    else if (apt.appointment.status === "cancelled") stats.cancelled++;

    // Contagem por especialista
    const specialistId = apt.specialist.id;
    if (!stats.bySpecialist[specialistId]) {
      stats.bySpecialist[specialistId] = {
        name: apt.specialist.name,
        count: 0,
      };
    }
    stats.bySpecialist[specialistId].count++;

    // Contagem por serviço
    const serviceId = apt.service.id;
    if (!stats.byService[serviceId]) {
      stats.byService[serviceId] = {
        name: apt.service.name,
        count: 0,
      };
    }
    stats.byService[serviceId].count++;
  }

  return stats;
}

/**
 * Verifica disponibilidade de múltiplos especialistas para um serviço
 */
export async function getSpecialistAvailabilityForService(
  salonId: string,
  serviceId: string,
  date: Date
): Promise<
  Array<{
    specialistId: string;
    specialistName: string;
    availableSlots: string[];
  }>
> {
  const service = await getServiceById(serviceId);
  if (!service || service.salonId !== salonId) {
    return [];
  }

  // Busca todos os especialistas do salão
  const allSpecialists = await getSpecialistsBySalonId(salonId);

  const results: Array<{
    specialistId: string;
    specialistName: string;
    availableSlots: string[];
  }> = [];

  for (const specialist of allSpecialists) {
    if (specialist.status !== "active") continue;

    const availableSlots = await getAvailableTimeSlots(
      specialist.id,
      serviceId,
      date
    );

    if (availableSlots.length > 0) {
      results.push({
        specialistId: specialist.id,
        specialistName: specialist.name,
        availableSlots,
      });
    }
  }

  return results.sort(
    (a, b) => b.availableSlots.length - a.availableSlots.length
  );
}

/**
 * Bloqueia/reserva um horário temporariamente (para evitar conflitos durante o processo de agendamento)
 */
export async function createTemporaryBlock(
  specialistId: string,
  date: Date,
  time: string,
  _duration: number,
  _expiresInMinutes: number = 5
): Promise<string | null> {
  // Esta seria uma implementação mais completa em produção
  // Por enquanto, retorna apenas um ID de bloqueio simulado
  const blockId = `temp_${specialistId}_${date.toISOString().split("T")[0]}_${time}_${Date.now()}`;

  // Em produção, isso seria armazenado em uma tabela temporária ou cache
  // com TTL automático

  return blockId;
}

/**
 * Remove bloqueio temporário
 */
export async function removeTemporaryBlock(blockId: string): Promise<void> {
  // Em produção, removeria o bloqueio do cache/tabela temporária
  console.log(`Removendo bloqueio temporário: ${blockId}`);
}

// Removed getCombinedWorkingPeriods, getLatestTime, getEarliestTime functions
// since we now use only specialist schedules (not salon + specialist intersection)

/**
 * Gera horários disponíveis para um especialista em uma data específica
 */
export async function getAvailableTimeSlots(
  specialistId: string,
  serviceId: string,
  date: Date
): Promise<string[]> {
  console.log("🔍 getAvailableTimeSlots DEBUG:", {
    specialistId,
    serviceId,
    date: date.toISOString(),
    dayOfWeek: date.getDay(),
  });

  const db = await getDb();
  if (!db) {
    console.log("❌ Database not available");
    return [];
  }

  // Busca especialista e serviço em paralelo (eram sequenciais antes — 2 round-trips → 1)
  const [specialist, service] = await Promise.all([
    getSpecialistById(specialistId),
    getServiceById(serviceId),
  ]);

  // Busca dados do salão (depende do specialist, então não pode ser em paralelo)
  const salon = specialist ? await getSalonById(specialist.salonId) : null;

  console.log("📊 Specialist data:", {
    found: !!specialist,
    name: specialist?.name,
    workingDays: specialist?.workingDays,
  });

  console.log("🛠️ Service data:", {
    found: !!service,
    name: service?.name,
    duration: service?.duration,
    specialistId: service?.specialistId ?? null,
  });

  console.log("🏢 Salon data:", {
    found: !!salon,
    name: salon?.name,
  });

  // Validations: service must exist; specialist must exist.
  if (!service) {
    console.log("❌ Service not found");
    return [];
  }

  if (!specialist) {
    console.log("❌ Specialist not found");
    return [];
  }

  // If the service is tied to a specific specialist, ensure it matches the requested specialist.
  // If service.specialistId is null, the service is considered "unassigned" and may be performed by any specialist.
  if (service.specialistId && service.specialistId !== specialistId) {
    console.log(
      "❌ Service is assigned to a different specialist:",
      service.specialistId,
      "!=",
      specialistId
    );
    return [];
  }

  // Determina dia da semana (0 = domingo, 1 = segunda, etc.)
  // Usamos o objeto Date recebido (o caller normalmente passa uma data com meio-dia UTC)
  const dayOfWeek = date.getDay();
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayName = dayNames[dayOfWeek];

  console.log("📅 Day info:", {
    dayOfWeek,
    dayName,
    specialistWorkingDays: specialist.workingDays?.[dayName],
  });

  // Verifica se especialista trabalha neste dia
  // Primeiro tenta usar o sistema de schedule (mais novo)
  let specialistPeriods: Array<{
    start: string;
    end: string;
    lunch?: { start: string; end: string };
  }> = [];

  // Importa o sistema de schedule
  const { isSpecialistWorking, getSpecialistSchedule } = await import(
    "./specialist-schedule"
  );

  try {
    // Verifica se precisa sincronizar os dados legacy
    const { needsSyncronization, syncLegacyWorkingDaysToSchedule } =
      await import("./sync-schedules");
    const needsSync = await needsSyncronization(specialistId);
    if (needsSync) {
      console.log("🔄 Auto-syncing legacy workingDays to schedule system");
      await syncLegacyWorkingDaysToSchedule(specialistId);
    }

    const isWorking = await isSpecialistWorking(specialistId, date);
    if (!isWorking) {
      console.log("❌ Specialist does not work on this day (schedule system)");
      return [];
    }

    const schedule = await getSpecialistSchedule(specialistId);
    const workingHours = schedule.workingHours.find(
      wh => wh.dayOfWeek === dayOfWeek
    );

    if (
      workingHours?.isWorking &&
      workingHours.startTime &&
      workingHours.endTime
    ) {
      specialistPeriods = [
        {
          start: workingHours.startTime,
          end: workingHours.endTime,
          lunch:
            workingHours.breakStartTime && workingHours.breakEndTime
              ? {
                  start: workingHours.breakStartTime,
                  end: workingHours.breakEndTime,
                }
              : undefined,
        },
      ];
      console.log("✅ Using specialist schedule system");
    } else {
      // Fallback para o sistema antigo
      if (!specialist.workingDays?.[dayName]) {
        console.log("❌ Specialist does not work on this day");
        return [];
      }
      specialistPeriods = specialist.workingDays[dayName];
      console.log("⚠️ Using legacy workingDays system");
    }
  } catch (error) {
    console.log(
      "⚠️ Error with schedule system, falling back to legacy:",
      error
    );
    // Fallback para o sistema antigo
    if (!specialist.workingDays?.[dayName]) {
      console.log("❌ Specialist does not work on this day");
      return [];
    }
    specialistPeriods = specialist.workingDays[dayName];
  }

  const allSlots: string[] = [];

  console.log("⏰ Specialist working periods:", specialistPeriods);

  // Gera todos os slots possíveis para cada período do especialista
  for (const period of specialistPeriods) {
    console.log("🔄 Generating slots for period:", period);
    const periodSlots = generateTimeSlots(period.start, period.end, 30); // Slots de 30 em 30 minutos
    console.log("📋 Generated slots:", periodSlots.length, "slots");

    // Remove slots que conflitam com horário de almoço
    const filteredSlots = periodSlots.filter(slot => {
      if (!period.lunch) return true;

      const slotEndTime = calculateEndTime(slot, service.duration);
      return !hasTimeOverlap(
        slot,
        slotEndTime,
        period.lunch.start,
        period.lunch.end
      );
    });

    console.log(
      "✅ Filtered slots (after lunch filter):",
      filteredSlots.length,
      "slots"
    );
    allSlots.push(...filteredSlots);
  }

  console.log("📅 Total slots before conflict check:", allSlots.length);

  // Busca agendamentos existentes
  const existingAppointments = await getAppointmentsBySpecialistAndDate(
    specialistId,
    date
  );

  console.log("📋 Existing appointments:", {
    count: existingAppointments.length,
    appointments: existingAppointments.map(apt => ({
      id: apt.id,
      time: apt.appointmentTime,
      status: apt.status,
    })),
  });

  // Filtra slots que não conflitam com agendamentos existentes
  const availableSlots = allSlots.filter(slot => {
    const slotEndTime = calculateEndTime(slot, service.duration);

    const hasConflict = existingAppointments.some(apt => {
      if (apt.status === "cancelled") return false;

      // Validar se appointmentTime existe e é válido
      if (!apt.appointmentTime || typeof apt.appointmentTime !== "string") {
        console.warn("❌ Skipping appointment with invalid time:", {
          id: apt.id,
          appointmentTime: apt.appointmentTime,
        });
        return false;
      }

      // Para calcular conflito, assumimos duração padrão de 60 min se não temos a duração
      const aptEndTime = calculateEndTime(apt.appointmentTime, 60);
      const conflict = hasTimeOverlap(
        slot,
        slotEndTime,
        apt.appointmentTime,
        aptEndTime
      );

      if (conflict) {
        console.log(
          `⚠️ Conflict detected: slot ${slot}-${slotEndTime} conflicts with appointment ${apt.appointmentTime}-${aptEndTime}`
        );
      }

      return conflict;
    });

    return !hasConflict;
  });

  console.log(
    "✅ Available slots before time filter:",
    availableSlots.length,
    availableSlots
  );

  // Filtrar horários que já passaram no fuso horário brasileiro
  const brazilNow = getBrazilianDateTime();
  const currentBrazilTime = `${brazilNow.getHours().toString().padStart(2, "0")}:${brazilNow.getMinutes().toString().padStart(2, "0")}`;

  // Comparar datas corretamente no timezone brasileiro
  const selectedDateBrazil = new Date(
    date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );
  const isToday =
    selectedDateBrazil.toDateString() === brazilNow.toDateString();

  console.log("🕐 Brazil time info:", {
    brazilNow: brazilNow.toISOString(),
    currentBrazilTime,
    isToday,
    selectedDate: date.toISOString(),
    selectedDateBrazil: selectedDateBrazil.toISOString(),
    selectedDateBrazilString: selectedDateBrazil.toDateString(),
    brazilNowString: brazilNow.toDateString(),
  });

  const finalSlots = isToday
    ? availableSlots.filter(slot => {
        // Adicionar apenas 30 minutos de antecedência mínima para permitir mais flexibilidade
        const slotMinutes = timeToMinutes(slot);
        const currentMinutes = timeToMinutes(currentBrazilTime);
        const minimumAdvanceMinutes = 30; // Reduzido de 2 horas para 30 minutos

        const isAvailable =
          slotMinutes >= currentMinutes + minimumAdvanceMinutes;

        if (!isAvailable) {
          console.log(
            `⏰ Filtering out slot ${slot} - too close to current time ${currentBrazilTime} (needs ${minimumAdvanceMinutes} min advance)`
          );
        }

        return isAvailable;
      })
    : availableSlots;

  console.log(
    "✅ Final available slots (after time filter):",
    finalSlots.length,
    finalSlots
  );

  return finalSlots.sort();
}

/**
 * Gera slots de tempo entre dois horários
 */
function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number
): string[] {
  const slots: string[] = [];
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  for (let minutes = start; minutes < end; minutes += intervalMinutes) {
    slots.push(minutesToTime(minutes));
  }

  return slots;
}

/**
 * Calcula horário de fim baseado no início e duração
 */
function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + durationMinutes;
  return minutesToTime(endMinutes);
}

/**
 * Verifica se dois períodos de tempo se sobrepõem
 */
function hasTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 < e2 && s2 < e1;
}

/**
 * Converte minutos desde meia-noite para horário HH:MM
 */
function minutesToTime(minutes: number): string {
  if (typeof minutes !== "number" || Number.isNaN(minutes) || minutes < 0) {
    console.error("❌ minutesToTime: Invalid minutes parameter:", minutes);
    return "00:00";
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

/**
 * Função para obter a data/hora atual no fuso horário brasileiro
 */
function getBrazilianDateTime(): Date {
  // Criar uma nova data no fuso horário de São Paulo
  return new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Sao_Paulo",
    })
  );
}

/**
 * Converte horário HH:MM para minutos desde meia-noite
 */
export function timeToMinutes(time: string): number {
  if (!time || typeof time !== "string") {
    console.error("❌ timeToMinutes: Invalid time parameter:", time);
    return 0;
  }

  const parts = time.split(":");
  if (parts.length !== 2) {
    console.error("❌ timeToMinutes: Invalid time format:", time);
    return 0;
  }

  const [hours, minutes] = parts.map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    console.error("❌ timeToMinutes: Non-numeric time parts:", {
      hours,
      minutes,
    });
    return 0;
  }

  return hours * 60 + minutes;
}

/**
 * Verifica se um horário está dentro do expediente do especialista
 */
export function isWithinWorkingHours(
  time: string,
  durationMinutes: number,
  workingDays: Record<
    string,
    Array<{
      start: string;
      end: string;
      lunch?: { start: string; end: string };
    }>
  >,
  dayName: string
): boolean {
  if (!workingDays || !workingDays[dayName]) {
    return false;
  }

  const periods = workingDays[dayName];
  const startMinutes = timeToMinutes(time);
  const endMinutes = startMinutes + durationMinutes;

  for (const period of periods) {
    const periodStart = timeToMinutes(period.start);
    const periodEnd = timeToMinutes(period.end);

    // Verifica se o horário está dentro do período de trabalho
    if (startMinutes >= periodStart && endMinutes <= periodEnd) {
      // Verifica se não conflita com horário de almoço
      if (period.lunch) {
        const lunchStart = timeToMinutes(period.lunch.start);
        const lunchEnd = timeToMinutes(period.lunch.end);

        // Se há sobreposição com o almoço, não é válido
        if (!(endMinutes <= lunchStart || startMinutes >= lunchEnd)) {
          continue;
        }
      }
      return true;
    }
  }

  return false;
}

/**
 * Busca agendamentos que conflitam com um horário específico
 */
async function getConflictingAppointments(
  specialistId: string,
  date: Date,
  time: string,
  durationMinutes: number,
  excludeAppointmentId?: string
): Promise<Appointment[]> {
  const existingAppointments = await getAppointmentsBySpecialistAndDate(
    specialistId,
    date
  );

  const startMinutes = timeToMinutes(time);
  const endMinutes = startMinutes + durationMinutes;

  return existingAppointments.filter(apt => {
    if (apt.status === "cancelled") return false;
    if (excludeAppointmentId && apt.id === excludeAppointmentId) return false;

    const aptStartMinutes = timeToMinutes(apt.appointmentTime);
    const aptEndMinutes = aptStartMinutes + 60; // Assumimos 60 min se não temos duração

    // Verifica sobreposição
    return !(endMinutes <= aptStartMinutes || startMinutes >= aptEndMinutes);
  });
}

/**
 * Gera um ID único para entidades
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Métricas do Dashboard - Dados financeiros e de negócios
 * OTIMIZADO: Todas as queries rodam em paralelo para melhor performance
 */
/**
 * Cache simples em memória para as métricas do Dashboard.
 * Evita executar 6 queries pesadas toda vez que a página abre.
 * TTL: 10 minutos por salão. Invalidado automaticamente ao expirar.
 *
 * Troca: dados podem ter até 10 min de atraso. Para forçar refresh,
 * chame getDashboardMetrics(salonId, true).
 */
type DashboardMetricsResult = {
  revenue: {
    monthly: number;
    weekly: number;
    monthlyTransactions: number;
    weeklyTransactions: number;
  };
  appointments: {
    today: {
      total: number;
      completed: number;
      confirmed: number;
      pending: number;
      cancelled: number;
    };
    occupationRate: number;
  };
  topServices: {
    serviceId: string | null;
    serviceName: string;
    totalRevenue: string | null;
    totalBookings: number;
  }[];
  topSpecialists: {
    specialistId: string | null;
    specialistName: string;
    totalRevenue: string | null;
    totalAppointments: number;
  }[];
  topClients: {
    clientId: string | null;
    clientName: string;
    totalSpent: string | null;
    totalVisits: number;
    lastVisit: Date;
  }[];
};
const dashboardMetricsCache = new Map<
  string,
  { data: DashboardMetricsResult; expiresAt: number }
>();
const DASHBOARD_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

export async function getDashboardMetrics(
  salonId: string,
  forceRefresh = false
) {
  const db = await getDb();
  if (!db) return null;

  // Verifica cache antes de executar as 6 queries pesadas
  if (!forceRefresh) {
    const cached = dashboardMetricsCache.get(salonId);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
  }

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - 7);
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  // Executar TODAS as queries em paralelo para melhor performance
  const [
    monthlyRevenue,
    weeklyRevenue,
    todayAppointments,
    topServices,
    topSpecialists,
    topClients,
  ] = await Promise.all([
    // Receita do mês atual
    db
      .select({
        total: sum(transactions.amount),
        count: count(transactions.id),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.salonId, salonId),
          eq(transactions.type, "income"),
          eq(transactions.status, "completed"),
          gte(transactions.transactionDate, startOfMonth)
        )
      ),

    // Receita semanal
    db
      .select({
        total: sum(transactions.amount),
        count: count(transactions.id),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.salonId, salonId),
          eq(transactions.type, "income"),
          eq(transactions.status, "completed"),
          gte(transactions.transactionDate, startOfWeek)
        )
      ),

    // Agendamentos de hoje
    db
      .select({
        total: count(appointments.id),
        completed: count(
          sql`CASE WHEN ${appointments.status} = 'completed' THEN 1 END`
        ),
        confirmed: count(
          sql`CASE WHEN ${appointments.status} = 'confirmed' THEN 1 END`
        ),
        pending: count(
          sql`CASE WHEN ${appointments.status} = 'pending' THEN 1 END`
        ),
        cancelled: count(
          sql`CASE WHEN ${appointments.status} = 'cancelled' THEN 1 END`
        ),
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.salonId, salonId),
          gte(appointments.appointmentDate, todayStart),
          lte(appointments.appointmentDate, todayEnd)
        )
      ),

    // Top 5 serviços mais lucrativos do mês
    db
      .select({
        serviceId: transactions.serviceId,
        serviceName: services.name,
        totalRevenue: sum(transactions.amount),
        totalBookings: count(transactions.id),
      })
      .from(transactions)
      .innerJoin(services, eq(transactions.serviceId, services.id))
      .where(
        and(
          eq(transactions.salonId, salonId),
          eq(transactions.type, "income"),
          eq(transactions.status, "completed"),
          gte(transactions.transactionDate, startOfMonth)
        )
      )
      .groupBy(transactions.serviceId, services.name)
      .orderBy(desc(sum(transactions.amount)))
      .limit(5),

    // Top 5 especialistas por receita do mês
    db
      .select({
        specialistId: transactions.specialistId,
        specialistName: specialists.name,
        totalRevenue: sum(transactions.amount),
        totalAppointments: count(transactions.id),
      })
      .from(transactions)
      .innerJoin(specialists, eq(transactions.specialistId, specialists.id))
      .where(
        and(
          eq(transactions.salonId, salonId),
          eq(transactions.type, "income"),
          eq(transactions.status, "completed"),
          gte(transactions.transactionDate, startOfMonth)
        )
      )
      .groupBy(transactions.specialistId, specialists.name)
      .orderBy(desc(sum(transactions.amount)))
      .limit(5),

    // Clientes mais valiosos (por valor total gasto)
    db
      .select({
        clientId: transactions.clientId,
        clientName: clients.name,
        totalSpent: sum(transactions.amount),
        totalVisits: count(transactions.id),
        lastVisit: sql<Date>`MAX(${transactions.transactionDate})`,
      })
      .from(transactions)
      .innerJoin(clients, eq(transactions.clientId, clients.id))
      .where(
        and(
          eq(transactions.salonId, salonId),
          eq(transactions.type, "income"),
          eq(transactions.status, "completed")
        )
      )
      .groupBy(transactions.clientId, clients.name)
      .orderBy(desc(sum(transactions.amount)))
      .limit(10),
  ]);

  // Taxa de ocupação hoje
  const occupationRate = todayAppointments[0]?.completed || 0;
  const totalSlotsToday = 24; // Assumindo horário comercial de 8h às 20h (12 horas) com slots de 30min

  const result = {
    revenue: {
      monthly: Number(monthlyRevenue[0]?.total || 0),
      weekly: Number(weeklyRevenue[0]?.total || 0),
      monthlyTransactions: Number(monthlyRevenue[0]?.count || 0),
      weeklyTransactions: Number(weeklyRevenue[0]?.count || 0),
    },
    appointments: {
      today: {
        total: Number(todayAppointments[0]?.total || 0),
        completed: Number(todayAppointments[0]?.completed || 0),
        confirmed: Number(todayAppointments[0]?.confirmed || 0),
        pending: Number(todayAppointments[0]?.pending || 0),
        cancelled: Number(todayAppointments[0]?.cancelled || 0),
      },
      occupationRate: Math.round((occupationRate / totalSlotsToday) * 100),
    },
    topServices,
    topSpecialists,
    topClients,
  };

  // Salva resultado no cache por 10 minutos
  dashboardMetricsCache.set(salonId, {
    data: result,
    expiresAt: Date.now() + DASHBOARD_CACHE_TTL_MS,
  });

  return result;
}

/**
 * Gráfico de receita dos últimos 30 dias
 */
export async function getRevenueChart(salonId: string, days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const dailyRevenue = await db
    .select({
      date: sql<string>`DATE(${transactions.transactionDate})`,
      revenue: sum(transactions.amount),
      transactions: count(transactions.id),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.salonId, salonId),
        eq(transactions.type, "income"),
        eq(transactions.status, "completed"),
        gte(transactions.transactionDate, startDate),
        lte(transactions.transactionDate, endDate)
      )
    )
    .groupBy(sql`DATE(${transactions.transactionDate})`)
    .orderBy(sql`DATE(${transactions.transactionDate})`);

  return dailyRevenue.map(day => ({
    date: day.date,
    revenue: Number(day.revenue || 0),
    transactions: Number(day.transactions || 0),
  }));
}

/**
 * Comparativo de performance mensal
 */
export async function getMonthlyComparison(salonId: string) {
  const db = await getDb();
  if (!db) return null;

  const today = new Date();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const previousMonthStart = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    1
  );
  const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  // Mês atual
  const currentMonth = await db
    .select({
      revenue: sum(transactions.amount),
      appointments: count(transactions.id),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.salonId, salonId),
        eq(transactions.type, "income"),
        eq(transactions.status, "completed"),
        gte(transactions.transactionDate, currentMonthStart)
      )
    );

  // Mês anterior
  const previousMonth = await db
    .select({
      revenue: sum(transactions.amount),
      appointments: count(transactions.id),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.salonId, salonId),
        eq(transactions.type, "income"),
        eq(transactions.status, "completed"),
        gte(transactions.transactionDate, previousMonthStart),
        lte(transactions.transactionDate, previousMonthEnd)
      )
    );

  const currentRevenue = Number(currentMonth[0]?.revenue || 0);
  const previousRevenue = Number(previousMonth[0]?.revenue || 0);
  const currentAppointments = Number(currentMonth[0]?.appointments || 0);
  const previousAppointments = Number(previousMonth[0]?.appointments || 0);

  const revenueGrowth =
    previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

  const appointmentGrowth =
    previousAppointments > 0
      ? ((currentAppointments - previousAppointments) / previousAppointments) *
        100
      : 0;

  return {
    current: {
      revenue: currentRevenue,
      appointments: currentAppointments,
    },
    previous: {
      revenue: previousRevenue,
      appointments: previousAppointments,
    },
    growth: {
      revenue: revenueGrowth,
      appointments: appointmentGrowth,
    },
  };
}

/**
 * Busca TODOS os dados do dashboard em uma única chamada
 * OTIMIZADO: Executa métricas, gráfico e comparativo em paralelo
 */
export async function getAllDashboardData(
  salonId: string,
  chartDays: number = 30
) {
  const [metrics, revenueChart, monthlyComparison, specRatings] =
    await Promise.all([
      getDashboardMetrics(salonId),
      getRevenueChart(salonId, chartDays),
      getMonthlyComparison(salonId),
      getAllSpecialistRatings(salonId),
    ]);

  return {
    metrics,
    revenueChart,
    monthlyComparison,
    specRatings,
  };
}

export { users };
export { eq } from "drizzle-orm";

// ============================================================
// MÓDULO DE PRODUTOS (Sprint 3)
// ============================================================

/** Retorna todos os produtos de um salão ordenados por nome */
export async function getProductsBySalonId(
  salonId: string
): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(products)
    .where(eq(products.salonId, salonId))
    .orderBy(asc(products.name));
}

/** Retorna um produto pelo id (garante que pertence ao salão certo) */
export async function getProductById(
  id: string,
  salonId: string
): Promise<Product | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.salonId, salonId)))
    .limit(1);
  return rows[0] ?? null;
}

/** Cria um novo produto */
export async function createProduct(
  data: Omit<InsertProduct, "id">
): Promise<Product> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados não disponível");
  const rows = await db
    .insert(products)
    .values({ ...data, id: nanoid() })
    .returning();
  return rows[0];
}

/** Atualiza campos de um produto existente */
export async function updateProduct(
  id: string,
  salonId: string,
  data: Partial<InsertProduct>
): Promise<Product | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(products.id, id), eq(products.salonId, salonId)))
    .returning();
  return rows[0] ?? null;
}

/** Remove um produto */
export async function deleteProduct(
  id: string,
  salonId: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const rows = await db
    .delete(products)
    .where(and(eq(products.id, id), eq(products.salonId, salonId)))
    .returning({ id: products.id });
  return rows.length > 0;
}

/**
 * Retorna produtos com estoque baixo (stock <= minStock)
 * Usado para exibir alertas no Dashboard
 */
export async function getLowStockProducts(salonId: string): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.salonId, salonId),
        sql`${products.stock} <= ${products.minStock}`
      )
    )
    .orderBy(asc(products.stock));
}

// ============================================================================
// APPOINTMENT PRODUCTS (produtos vendidos durante o atendimento)
// ============================================================================

/**
 * Retorna os produtos registrados em um agendamento
 */
export async function getAppointmentProducts(
  appointmentId: string
): Promise<(AppointmentProduct & { product: Product })[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      ap: appointmentProducts,
      product: products,
    })
    .from(appointmentProducts)
    .leftJoin(products, eq(appointmentProducts.productId, products.id))
    .where(eq(appointmentProducts.appointmentId, appointmentId));
  return rows
    .filter(r => r.product !== null)
    .map(r => ({ ...r.ap, product: r.product! }));
}

/**
 * Registra os produtos vendidos em um atendimento e desconta o estoque.
 * Chamado durante o checkout (conclusão) do agendamento.
 *
 * @param appointmentId - ID do agendamento
 * @param salonId - ID do salão
 * @param items - Lista de { productId, quantity, unitPrice }
 */
export async function saveAppointmentProducts(
  appointmentId: string,
  salonId: string,
  items: { productId: string; quantity: number; unitPrice: number }[]
): Promise<void> {
  const db = await getDb();
  if (!db || items.length === 0) return;

  for (const item of items) {
    // 1. Inserir linha de produto no atendimento
    await db.insert(appointmentProducts).values({
      id: nanoid(),
      appointmentId,
      productId: item.productId,
      salonId,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
    });

    // 2. Descontar do estoque (não deixa ficar negativo)
    await db
      .update(products)
      .set({
        stock: sql`GREATEST(0, ${products.stock} - ${item.quantity})`,
        updatedAt: new Date(),
      })
      .where(eq(products.id, item.productId));
  }
}

// ============================================================================
// RATINGS FUNCTIONS
// ============================================================================

export type { Rating, InsertRating } from "../drizzle/schema";

/**
 * Cria um registro de avaliação pendente (token ainda não utilizado).
 * Chamado ao concluir o atendimento.
 */
export async function createRating(data: InsertRating): Promise<Rating | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(ratings).values(data).returning();
  return result[0] ?? null;
}

/**
 * Busca uma avaliação pelo token único.
 * Usada na página pública /avaliar?token=xxx
 */
export async function getRatingByToken(token: string): Promise<Rating | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(ratings)
    .where(eq(ratings.token, token))
    .limit(1);
  return result[0] ?? null;
}

/**
 * Submete a avaliação do cliente (stars + comment).
 * Marca o token como usado e registra o timestamp.
 */
export async function submitRating(
  token: string,
  stars: number,
  comment?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .update(ratings)
    .set({
      stars,
      comment: comment ?? null,
      used: true,
      submittedAt: new Date(),
    })
    .where(eq(ratings.token, token))
    .returning();
  return result.length > 0;
}

/**
 * Retorna todas as avaliações enviadas de um especialista.
 * Usado na tela de especialistas do dashboard.
 */
export async function getRatingsBySpecialist(
  specialistId: string
): Promise<Rating[]> {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(ratings)
    .where(eq(ratings.specialistId, specialistId));
}

/**
 * Retorna TODAS as avaliações submetidas de um salão, com join de especialista.
 * Usada na página /avaliacoes do admin.
 */
export async function getAllRatingsBySalon(salonId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      id: ratings.id,
      stars: ratings.stars,
      comment: ratings.comment,
      clientName: ratings.clientName,
      submittedAt: ratings.submittedAt,
      specialistId: ratings.specialistId,
      specialistName: specialists.name,
    })
    .from(ratings)
    .leftJoin(specialists, eq(ratings.specialistId, specialists.id))
    .where(and(eq(ratings.salonId, salonId), eq(ratings.used, true)))
    .orderBy(sql`${ratings.submittedAt} DESC NULLS LAST`);
}

/**
 * Calcula a média de estrelas de um especialista.
 * Retorna null se não houver nenhuma avaliação.
 */
export async function getAverageRating(
  specialistId: string
): Promise<{ average: number; count: number } | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select({
      average: sql<number>`ROUND(AVG(${ratings.stars})::numeric, 1)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(ratings)
    .where(eq(ratings.specialistId, specialistId));
  const row = result[0];
  if (!row || Number(row.count) === 0) return null;
  return { average: Number(row.average), count: Number(row.count) };
}

/**
 * Retorna a média de avaliações de todos os especialistas de um salão.
 * Mapa: specialistId -> { average, count }
 */
export async function getAllSpecialistRatings(
  salonId: string
): Promise<Record<string, { average: number; count: number }>> {
  const db = await getDb();
  if (!db) return {};
  const rows = await db
    .select({
      specialistId: ratings.specialistId,
      average: sql<number>`ROUND(AVG(${ratings.stars})::numeric, 1)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(ratings)
    .where(eq(ratings.salonId, salonId))
    .groupBy(ratings.specialistId);

  const map: Record<string, { average: number; count: number }> = {};
  for (const row of rows) {
    if (row.specialistId && Number(row.count) > 0) {
      map[row.specialistId] = {
        average: Number(row.average),
        count: Number(row.count),
      };
    }
  }
  return map;
}
