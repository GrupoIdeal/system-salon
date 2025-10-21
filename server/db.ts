import { eq, and, gte, lte, like, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  users,
  salons,
  specialists,
  clients,
  services,
  appointments,
  passwordResets,
  type InsertUser,
  type User,
  type Salon,
  type Specialist,
  type Client,
  type Service,
  type Appointment,
  type PasswordReset,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER QUERIES
// ============================================================================

export async function upsertUser(user: Partial<InsertUser> & { id: string }): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: any = {
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      password: user.password || "",
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      (values as any)[field] = normalized;
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
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = "admin";
        values.role = "admin";
        updateSet.role = "admin";
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

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

// ============================================================================
// SALON QUERIES
// ============================================================================

export async function getSalonByUserId(userId: string): Promise<Salon | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(salons)
    .where(eq(salons.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getSalonById(salonId: string): Promise<Salon | undefined> {
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

export async function getSpecialistsBySalonId(salonId: string): Promise<Specialist[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(specialists)
    .where(eq(specialists.salonId, salonId));
}

export async function getSpecialistById(specialistId: string): Promise<Specialist | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(specialists)
    .where(eq(specialists.id, specialistId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createSpecialist(data: any): Promise<Specialist> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(specialists).values(data);
  return data;
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

  await db
    .delete(specialists)
    .where(eq(specialists.id, specialistId));
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
    ? and(
        eq(clients.salonId, salonId),
        like(clients.name, `%${search}%`)
      )
    : eq(clients.salonId, salonId);

  return await db
    .select()
    .from(clients)
    .where(whereConditions)
    .limit(limit)
    .offset(offset);
}

export async function getClientById(clientId: string): Promise<Client | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createClient(data: any): Promise<Client> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(clients).values(data);
  return data;
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

export async function getServicesBySalonId(salonId: string): Promise<Service[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(services)
    .where(eq(services.salonId, salonId));
}

export async function getServiceById(serviceId: string): Promise<Service | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(services)
    .where(eq(services.id, serviceId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createService(data: any): Promise<Service> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(services).values(data);
  return data;
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

  const whereConditions = startDate && endDate
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

export async function getAppointmentById(appointmentId: string): Promise<Appointment | undefined> {
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
    ) as any;
}

export async function createAppointment(data: any): Promise<Appointment> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(appointments).values(data);
  return data;
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

  await db
    .delete(appointments)
    .where(eq(appointments.id, appointmentId));
}

// ============================================================================
// PASSWORD RESET QUERIES
// ============================================================================

export async function createPasswordReset(data: any): Promise<PasswordReset> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(passwordResets).values(data);
  return data;
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

