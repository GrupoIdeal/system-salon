import { eq, and, gte, lte, like, asc } from "drizzle-orm";
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
  InsertUser,
  InsertSpecialist,
  InsertClient,
  InsertService,
  InsertAppointment,
  InsertPasswordReset,
  User,
  Specialist,
  Client,
  Service,
  Appointment,
  PasswordReset,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch {
      _db = null;
    }
  }
  return _db;
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

export async function listUsers(): Promise<User[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users);
}

// ============================================================================
// SALON QUERIES
// ============================================================================

export async function getSalonByUserId(
  userId: string
): Promise<Salon | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(salons)
    .where(eq(salons.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
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

export { users };
export { eq } from "drizzle-orm";
