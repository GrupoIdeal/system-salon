import { eq, and, gte, lte, like, asc, or, sql } from "drizzle-orm";
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
  Salon,
  Specialist,
  Client,
  Service,
  Appointment,
  AppointmentWithDetails,
  PasswordReset,
} from "../drizzle/schema";
import * as schema from "../drizzle/schema";
import * as relations from "../drizzle/relations";
import { ENV } from "./_core/env";

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
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      // Client fields
      client: {
        id: clients.id,
        name: clients.name,
        email: clients.email,
        phone: clients.phone,
        notes: clients.notes,
        salonId: clients.salonId,
        createdAt: clients.createdAt,
        updatedAt: clients.updatedAt,
      },
      // Service fields
      service: {
        id: services.id,
        name: services.name,
        description: services.description,
        duration: services.duration,
        price: services.price,
        status: services.status,
        salonId: services.salonId,
        specialistId: services.specialistId,
        createdAt: services.createdAt,
        updatedAt: services.updatedAt,
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
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
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
// APPOINTMENT UTILITY FUNCTIONS
// ============================================================================

/**
 * Converte string de horário "HH:MM" para minutos desde 00:00
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Converte minutos desde 00:00 para string "HH:MM"
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

/**
 * Calcula horário de fim de um agendamento
 */
export function calculateEndTime(
  startTime: string,
  durationMinutes: number
): string {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + durationMinutes;
  return minutesToTime(endMinutes);
}

/**
 * Verifica se há sobreposição entre dois intervalos de tempo
 */
export function hasTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);

  return start1Min < end2Min && start2Min < end1Min;
}

/**
 * Gera slots de horários disponíveis considerando intervalo de tempo
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number = 30
): string[] {
  const slots: string[] = [];
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  for (
    let minutes = startMinutes;
    minutes < endMinutes;
    minutes += intervalMinutes
  ) {
    slots.push(minutesToTime(minutes));
  }

  return slots;
}

/**
 * Tipo para horários de trabalho do especialista
 */
type WorkingDays = Record<
  string,
  Array<{
    start: string;
    end: string;
    lunch?: { start: string; end: string };
  }>
>;

/**
 * Verifica se um horário está dentro do horário de trabalho do especialista
 */
export function isWithinWorkingHours(
  appointmentTime: string,
  serviceDuration: number,
  workingDays: WorkingDays | null,
  dayOfWeek: string
): boolean {
  if (!workingDays || !workingDays[dayOfWeek]) {
    return false;
  }

  const endTime = calculateEndTime(appointmentTime, serviceDuration);
  const daySchedule = workingDays[dayOfWeek];

  for (const period of daySchedule) {
    // Verifica se o agendamento cabe no período de trabalho
    if (appointmentTime >= period.start && endTime <= period.end) {
      // Se há horário de almoço, verifica se não há conflito
      if (period.lunch) {
        if (
          hasTimeOverlap(
            appointmentTime,
            endTime,
            period.lunch.start,
            period.lunch.end
          )
        ) {
          continue; // Conflita com almoço, tenta próximo período
        }
      }
      return true;
    }
  }

  return false;
}

/**
 * Busca agendamentos que podem ter conflito com novo agendamento
 */
export async function getConflictingAppointments(
  specialistId: string,
  date: Date,
  startTime: string,
  duration: number,
  excludeAppointmentId?: string
): Promise<AppointmentWithDetails[]> {
  const db = await getDb();
  if (!db) return [];

  const endTime = calculateEndTime(startTime, duration);

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const results = await db
    .select({
      appointment: appointments,
      service: services,
      client: clients,
      specialist: specialists,
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .innerJoin(clients, eq(appointments.clientId, clients.id))
    .innerJoin(specialists, eq(appointments.specialistId, specialists.id))
    .where(
      and(
        eq(appointments.specialistId, specialistId),
        gte(appointments.appointmentDate, startOfDay),
        lte(appointments.appointmentDate, endOfDay),
        or(
          eq(appointments.status, "pending"),
          eq(appointments.status, "confirmed")
        ),
        excludeAppointmentId
          ? sql`${appointments.id} != ${excludeAppointmentId}`
          : sql`1=1`
      )
    );

  // Filtra apenas agendamentos que realmente conflitam
  return results
    .filter(result => {
      const existingStartTime = result.appointment.appointmentTime;
      const existingDuration = result.service.duration;
      const existingEndTime = calculateEndTime(
        existingStartTime,
        existingDuration
      );

      return hasTimeOverlap(
        startTime,
        endTime,
        existingStartTime,
        existingEndTime
      );
    })
    .map(result => ({
      ...result.appointment,
      service: result.service,
      client: result.client,
      specialist: result.specialist,
    }));
}

/**
 * Gera horários disponíveis para um especialista em uma data específica
 */
export async function getAvailableTimeSlots(
  specialistId: string,
  serviceId: string,
  date: Date
): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];

  // Busca dados do especialista e serviço
  const specialist = await getSpecialistById(specialistId);
  const service = await getServiceById(serviceId);

  if (!specialist || !service) {
    return [];
  }

  // Determina dia da semana (0 = domingo, 1 = segunda, etc.)
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

  // Verifica se especialista trabalha neste dia
  if (!specialist.workingDays || !specialist.workingDays[dayName]) {
    return [];
  }

  const workingPeriods = specialist.workingDays[dayName];
  const allSlots: string[] = [];

  // Gera todos os slots possíveis para cada período de trabalho
  for (const period of workingPeriods) {
    const periodSlots = generateTimeSlots(period.start, period.end, 30); // Slots de 30 em 30 minutos

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

    allSlots.push(...filteredSlots);
  }

  // Busca agendamentos existentes
  const existingAppointments = await getAppointmentsBySpecialistAndDate(
    specialistId,
    date
  );

  // Filtra slots que não conflitam com agendamentos existentes
  const availableSlots = allSlots.filter(slot => {
    const slotEndTime = calculateEndTime(slot, service.duration);

    return !existingAppointments.some(apt => {
      if (apt.status === "cancelled") return false;

      // Para calcular conflito, precisamos da duração do serviço do agendamento existente
      // Por simplicidade, assumimos 60 minutos se não temos a duração
      const aptEndTime = calculateEndTime(apt.appointmentTime, 60);
      return hasTimeOverlap(slot, slotEndTime, apt.appointmentTime, aptEndTime);
    });
  });

  return availableSlots.sort();
}

/**
 * Versão melhorada que considera duração real dos serviços
 */
export async function getAvailableTimeSlotsAdvanced(
  specialistId: string,
  serviceId: string,
  date: Date
): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];

  const specialist = await getSpecialistById(specialistId);
  const service = await getServiceById(serviceId);

  if (!specialist || !service) {
    return [];
  }

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

  if (!specialist.workingDays || !specialist.workingDays[dayName]) {
    return [];
  }

  const workingPeriods = specialist.workingDays[dayName];
  const allSlots: string[] = [];

  for (const period of workingPeriods) {
    const periodSlots = generateTimeSlots(period.start, period.end, 15); // Slots menores para maior precisão
    allSlots.push(...periodSlots);
  }

  // Busca agendamentos com detalhes para ter duração real
  const conflictingAppointments = await getConflictingAppointments(
    specialistId,
    date,
    "00:00",
    24 * 60 // Todo o dia
  );

  const availableSlots = allSlots.filter(slot => {
    // Verifica se o slot + duração do serviço cabe no horário de trabalho
    if (
      !isWithinWorkingHours(
        slot,
        service.duration,
        specialist.workingDays,
        dayName
      )
    ) {
      return false;
    }

    const slotEndTime = calculateEndTime(slot, service.duration);

    // Verifica conflitos com agendamentos existentes
    return !conflictingAppointments.some(apt => {
      const aptEndTime = calculateEndTime(
        apt.appointmentTime,
        apt.service.duration
      );
      return hasTimeOverlap(slot, slotEndTime, apt.appointmentTime, aptEndTime);
    });
  });

  return availableSlots.sort();
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
  const specialist = await getSpecialistById(specialistId);
  const service = await getServiceById(serviceId);

  if (!specialist || !service) {
    return { valid: false, reason: "Especialista ou serviço não encontrado" };
  }

  // Verifica horário de trabalho
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

  if (
    !isWithinWorkingHours(
      time,
      service.duration,
      specialist.workingDays,
      dayName
    )
  ) {
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

export { users };
export { eq } from "drizzle-orm";
