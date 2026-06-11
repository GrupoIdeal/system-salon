// Sistema de Configurações de Horário por Especialista
import { createLogger } from "./_core/logger";
import { eq } from "drizzle-orm";

const logger = createLogger("specialist-schedule");
import { getDb } from "./db";
import {
  specialists,
  specialistSchedules as specialistSchedulesTable,
  type SpecialistScheduleRow,
} from "../drizzle/schema";

export interface WorkingHours {
  dayOfWeek: number; // 0 = domingo, 1 = segunda, ..., 6 = sábado
  isWorking: boolean;
  startTime?: string; // "09:00"
  endTime?: string; // "18:00"
  breakStartTime?: string; // "12:00"
  breakEndTime?: string; // "13:00"
}

export interface SpecialistSchedule {
  specialistId: string;
  workingHours: WorkingHours[];
  timeSlotDuration: number; // minutos (15, 30, 60)
  bufferTime: number; // tempo entre agendamentos em minutos
  allowBookingDaysInAdvance: number; // quantos dias no futuro permitir agendamentos
  minimumNoticeHours: number; // mínimo de horas de antecedência
  autoConfirmBookings: boolean;
  allowOnlineBooking: boolean;
  customUnavailableDates: Date[]; // férias, feriados específicos
}

export interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string; // motivo da indisponibilidade
}

// Horário padrão para novos especialistas - função que retorna cópia profunda para evitar referências compartilhadas
function getDefaultSchedule(): Omit<SpecialistSchedule, "specialistId"> {
  // Usar JSON para garantir clonagem profunda e evitar qualquer referência compartilhada entre especialistas
  return JSON.parse(
    JSON.stringify({
      workingHours: [
        { dayOfWeek: 0, isWorking: false }, // Domingo
        {
          dayOfWeek: 1,
          isWorking: true,
          startTime: "09:00",
          endTime: "18:00",
          breakStartTime: "12:00",
          breakEndTime: "13:00",
        }, // Segunda
        {
          dayOfWeek: 2,
          isWorking: true,
          startTime: "09:00",
          endTime: "18:00",
          breakStartTime: "12:00",
          breakEndTime: "13:00",
        }, // Terça
        {
          dayOfWeek: 3,
          isWorking: true,
          startTime: "09:00",
          endTime: "18:00",
          breakStartTime: "12:00",
          breakEndTime: "13:00",
        }, // Quarta
        {
          dayOfWeek: 4,
          isWorking: true,
          startTime: "09:00",
          endTime: "18:00",
          breakStartTime: "12:00",
          breakEndTime: "13:00",
        }, // Quinta
        {
          dayOfWeek: 5,
          isWorking: true,
          startTime: "09:00",
          endTime: "18:00",
          breakStartTime: "12:00",
          breakEndTime: "13:00",
        }, // Sexta
        { dayOfWeek: 6, isWorking: true, startTime: "09:00", endTime: "16:00" }, // Sábado - sem pausa
      ],
      timeSlotDuration: 30,
      bufferTime: 15,
      allowBookingDaysInAdvance: 30,
      minimumNoticeHours: 2,
      autoConfirmBookings: true,
      allowOnlineBooking: true,
      customUnavailableDates: [],
    })
  );
}

// Helper para mapear row -> SpecialistSchedule
function rowToSchedule(
  specialistId: string,
  row: SpecialistScheduleRow | null
): SpecialistSchedule {
  const defaultSched = getDefaultSchedule();

  if (!row) {
    return { specialistId, ...defaultSched } as SpecialistSchedule;
  }

  const customUnavailableDates: Date[] = Array.isArray(
    row.customUnavailableDates
  )
    ? row.customUnavailableDates.map((d: string | Date) => new Date(d))
    : [];

  const workingHours = Array.isArray(row.workingHours)
    ? JSON.parse(JSON.stringify(row.workingHours)) // Clonagem profunda para evitar referências compartilhadas
    : JSON.parse(JSON.stringify(defaultSched.workingHours));

  return {
    specialistId,
    workingHours,
    timeSlotDuration: row.timeSlotDuration ?? defaultSched.timeSlotDuration,
    bufferTime: row.bufferTime ?? defaultSched.bufferTime,
    allowBookingDaysInAdvance:
      row.allowBookingDaysInAdvance ?? defaultSched.allowBookingDaysInAdvance,
    minimumNoticeHours:
      row.minimumNoticeHours ?? defaultSched.minimumNoticeHours,
    autoConfirmBookings:
      row.autoConfirmBookings ?? defaultSched.autoConfirmBookings,
    allowOnlineBooking:
      row.allowOnlineBooking ?? defaultSched.allowOnlineBooking,
    customUnavailableDates,
  };
}

// Buscar configuração do especialista (persistida no DB) - NÃO cria automaticamente
export async function getSpecialistSchedule(
  specialistId: string
): Promise<SpecialistSchedule> {
  const db = await getDb();
  if (!db) {
    return { specialistId, ...getDefaultSchedule() } as SpecialistSchedule;
  }

  // Tenta buscar na tabela specialistSchedules
  const row = await db
    .select()
    .from(specialistSchedulesTable)
    .where(eq(specialistSchedulesTable.specialistId, specialistId))
    .then(r => r[0] || null);

  if (row) return rowToSchedule(specialistId, row);

  // Fallback: tentar usar legacy specialists.workingDays (migração de dados antigos)
  const legacy = await db
    .select({ workingDays: specialists.workingDays })
    .from(specialists)
    .where(eq(specialists.id, specialistId))
    .then(r => r[0]);

  if (legacy?.workingDays) {
    // Converter formato legacy (record por dia) para array de workingHours
    const dayMapping: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const workingHoursArr: WorkingHours[] = Object.entries(
      legacy.workingDays
    ).flatMap(([dayName, periods]) => {
      const dayOfWeek = dayMapping[dayName];
      if (dayOfWeek === undefined) return [];
      const arr = Array.isArray(periods) ? periods : [periods];
      return arr.map(
        (p: {
          start: string;
          end: string;
          lunch?: { start: string; end: string };
        }) => ({
          dayOfWeek,
          isWorking: true,
          startTime: p.start,
          endTime: p.end,
          breakStartTime: p.lunch?.start ?? undefined,
          breakEndTime: p.lunch?.end ?? undefined,
        })
      );
    });

    await db.insert(specialistSchedulesTable).values({
      specialistId,
      workingHours: workingHoursArr,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const inserted = await db
      .select()
      .from(specialistSchedulesTable)
      .where(eq(specialistSchedulesTable.specialistId, specialistId))
      .then(r => r[0] || null);

    return rowToSchedule(specialistId, inserted);
  }

  // Se não existe schedule, retorna valores padrão SEM persistir no banco
  // Isso permite que o frontend envie os horários corretos na criação
  return { specialistId, ...getDefaultSchedule() } as SpecialistSchedule;
}

// Criar schedule inicial para um especialista (usado na criação do especialista)
export async function createSpecialistSchedule(
  specialistId: string,
  schedule?: Partial<Omit<SpecialistSchedule, "specialistId">>
): Promise<SpecialistSchedule> {
  const db = await getDb();
  if (!db) {
    return { specialistId, ...getDefaultSchedule() } as SpecialistSchedule;
  }

  // Verificar se já existe
  const existing = await db
    .select()
    .from(specialistSchedulesTable)
    .where(eq(specialistSchedulesTable.specialistId, specialistId))
    .then(r => r[0] || null);

  if (existing) {
    // Já existe, apenas retorna
    return rowToSchedule(specialistId, existing);
  }

  const defaultSched = getDefaultSchedule();

  // Criar novo registro com valores fornecidos ou padrão
  const createValues = {
    specialistId,
    timeSlotDuration:
      schedule?.timeSlotDuration ?? defaultSched.timeSlotDuration,
    bufferTime: schedule?.bufferTime ?? defaultSched.bufferTime,
    allowBookingDaysInAdvance:
      schedule?.allowBookingDaysInAdvance ??
      defaultSched.allowBookingDaysInAdvance,
    minimumNoticeHours:
      schedule?.minimumNoticeHours ?? defaultSched.minimumNoticeHours,
    autoConfirmBookings:
      schedule?.autoConfirmBookings ?? defaultSched.autoConfirmBookings,
    allowOnlineBooking:
      schedule?.allowOnlineBooking ?? defaultSched.allowOnlineBooking,
    // Se workingHours foi fornecido, usar; caso contrário, criar array vazio (sem horários padrão)
    workingHours: schedule?.workingHours
      ? schedule.workingHours.map(wh => ({ ...wh }))
      : Array.from({ length: 7 }, (_, i) => ({
          dayOfWeek: i,
          isWorking: false,
          startTime: undefined,
          endTime: undefined,
          breakStartTime: undefined,
          breakEndTime: undefined,
        })),
    customUnavailableDates: schedule?.customUnavailableDates
      ? schedule.customUnavailableDates.map(d =>
          d instanceof Date ? d.toISOString() : d
        )
      : [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(specialistSchedulesTable).values(createValues);

  const row = await db
    .select()
    .from(specialistSchedulesTable)
    .where(eq(specialistSchedulesTable.specialistId, specialistId))
    .then(r => r[0] || null);

  return rowToSchedule(specialistId, row);
}

// Atualizar configuração do especialista (parcial) — persiste no DB
export async function updateSpecialistSchedule(
  specialistId: string,
  updates: Partial<Omit<SpecialistSchedule, "specialistId">>
): Promise<SpecialistSchedule> {
  const db = await getDb();
  if (!db)
    return { specialistId, ...getDefaultSchedule() } as SpecialistSchedule;

  // Busca registro existente
  const existing = await db
    .select()
    .from(specialistSchedulesTable)
    .where(eq(specialistSchedulesTable.specialistId, specialistId))
    .then(r => r[0] || null);

  if (!existing) {
    // Cria novo registro com valores mesclados
    const createValues = {
      specialistId,
      timeSlotDuration:
        updates.timeSlotDuration ?? getDefaultSchedule().timeSlotDuration,
      bufferTime: updates.bufferTime ?? getDefaultSchedule().bufferTime,
      allowBookingDaysInAdvance:
        updates.allowBookingDaysInAdvance ??
        getDefaultSchedule().allowBookingDaysInAdvance,
      minimumNoticeHours:
        updates.minimumNoticeHours ?? getDefaultSchedule().minimumNoticeHours,
      autoConfirmBookings:
        updates.autoConfirmBookings ?? getDefaultSchedule().autoConfirmBookings,
      allowOnlineBooking:
        updates.allowOnlineBooking ?? getDefaultSchedule().allowOnlineBooking,
      workingHours: updates.workingHours ?? getDefaultSchedule().workingHours,
      customUnavailableDates: (updates.customUnavailableDates ?? []).map(d =>
        d instanceof Date ? d.toISOString() : d
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(specialistSchedulesTable).values(createValues);

    const row = await db
      .select()
      .from(specialistSchedulesTable)
      .where(eq(specialistSchedulesTable.specialistId, specialistId))
      .then(r => r[0] || null);

    return rowToSchedule(specialistId, row);
  }

  // Mesclar updates com existing
  const defaultSched = getDefaultSchedule();
  const mergedWorkingHours = updates.workingHours
    ? updates.workingHours.map(wh => ({ ...wh }))
    : Array.isArray(existing.workingHours)
      ? existing.workingHours.map((wh) => ({ ...wh }))
      : defaultSched.workingHours.map(wh => ({ ...wh }));

  const mergedCustomDates = updates.customUnavailableDates
    ? updates.customUnavailableDates.map(d =>
        d instanceof Date ? d.toISOString() : d
      )
    : Array.isArray(existing.customUnavailableDates)
      ? existing.customUnavailableDates.slice()
      : [];

  const mergedRecord: Record<string, unknown> = {
    ...existing,
    ...updates,
    workingHours: mergedWorkingHours,
    customUnavailableDates: mergedCustomDates,
    updatedAt: new Date(),
  };

  await db
    .update(specialistSchedulesTable)
    .set(mergedRecord)
    .where(eq(specialistSchedulesTable.specialistId, specialistId));

  // Obter row atualizada do DB para retornar
  const updatedRow = await db
    .select()
    .from(specialistSchedulesTable)
    .where(eq(specialistSchedulesTable.specialistId, specialistId))
    .then(r => r[0] || null);

  return rowToSchedule(specialistId, updatedRow);
}

// Adicionar data indisponível personalizada
export async function addCustomUnavailableDate(
  specialistId: string,
  date: Date
): Promise<void> {
  const schedule = await getSpecialistSchedule(specialistId);
  const db = await getDb();
  if (!db) return;

  const exists = schedule.customUnavailableDates.some(
    d => d.toDateString() === date.toDateString()
  );

  if (!exists) {
    const newDates = [
      ...schedule.customUnavailableDates.map(d => d.toISOString()),
      date.toISOString(),
    ];
    await db
      .update(specialistSchedulesTable)
      .set({ customUnavailableDates: newDates, updatedAt: new Date() })
      .where(eq(specialistSchedulesTable.specialistId, specialistId));
  }
}

// Remover data indisponível personalizada
export async function removeCustomUnavailableDate(
  specialistId: string,
  date: Date
): Promise<void> {
  const schedule = await getSpecialistSchedule(specialistId);
  const db = await getDb();
  if (!db) return;

  const newDates = schedule.customUnavailableDates
    .filter(d => d.toDateString() !== date.toDateString())
    .map(d => d.toISOString());

  await db
    .update(specialistSchedulesTable)
    .set({ customUnavailableDates: newDates, updatedAt: new Date() })
    .where(eq(specialistSchedulesTable.specialistId, specialistId));
}

// Configurar horário específico para um dia da semana
export async function updateWorkingHoursForDay(
  specialistId: string,
  dayOfWeek: number,
  workingHours: Omit<WorkingHours, "dayOfWeek">
): Promise<void> {
  const schedule = await getSpecialistSchedule(specialistId);
  const db = await getDb();
  if (!db) return;

  // Criar nova array imutável para evitar mutações que afetem outros especialistas
  const existing = Array.isArray(schedule.workingHours)
    ? schedule.workingHours.map(wh => ({ ...wh }))
    : [];
  const idx = existing.findIndex(wh => wh.dayOfWeek === dayOfWeek);
  let newWorkingHours;
  if (idx !== -1) {
    newWorkingHours = existing.map(wh =>
      wh.dayOfWeek === dayOfWeek ? { dayOfWeek, ...workingHours } : wh
    );
  } else {
    newWorkingHours = [...existing, { dayOfWeek, ...workingHours }];
  }

  await db
    .update(specialistSchedulesTable)
    .set({ workingHours: newWorkingHours, updatedAt: new Date() })
    .where(eq(specialistSchedulesTable.specialistId, specialistId));
}

// Verificar se especialista trabalha em determinado dia
export async function isSpecialistWorking(
  specialistId: string,
  date: Date
): Promise<boolean> {
  const schedule = await getSpecialistSchedule(specialistId);
  const dayOfWeek = date.getDay();

  const workingHours = schedule.workingHours.find(
    wh => wh.dayOfWeek === dayOfWeek
  );

  if (!workingHours || !workingHours.isWorking) {
    return false;
  }

  // Verificar se não está em data personalizada indisponível
  const dateString = date.toDateString();
  const isCustomUnavailable = schedule.customUnavailableDates.some(
    unavailableDate => unavailableDate.toDateString() === dateString
  );

  return !isCustomUnavailable;
}

// Gerar horários disponíveis para um especialista em um dia
export async function generateSpecialistTimeSlots(
  specialistId: string,
  date: Date,
  serviceDuration: number = 60
): Promise<TimeSlot[]> {
  const schedule = await getSpecialistSchedule(specialistId);
  const slots: TimeSlot[] = [];

  // Verificar se trabalha neste dia
  if (!(await isSpecialistWorking(specialistId, date))) {
    return slots;
  }

  const dayOfWeek = date.getDay();
  const workingHours = schedule.workingHours.find(
    wh => wh.dayOfWeek === dayOfWeek
  );

  if (!workingHours || !workingHours.startTime || !workingHours.endTime) {
    return slots;
  }

  // Verificar se não é muito em cima da hora - usar fuso horário brasileiro
  const brazilNow = getBrazilianDateTime();
  const minimumBookingTime = new Date(
    brazilNow.getTime() + schedule.minimumNoticeHours * 60 * 60 * 1000
  );

  const slotDuration = schedule.timeSlotDuration;
  const totalSlotTime = serviceDuration + schedule.bufferTime;

  // Converter horários para minutos
  const startMinutes = timeToMinutes(workingHours.startTime);
  const endMinutes = timeToMinutes(workingHours.endTime);

  let breakStartMinutes: number | undefined;
  let breakEndMinutes: number | undefined;

  if (workingHours.breakStartTime && workingHours.breakEndTime) {
    breakStartMinutes = timeToMinutes(workingHours.breakStartTime);
    breakEndMinutes = timeToMinutes(workingHours.breakEndTime);
  }

  // Gerar slots
  for (
    let currentMinutes = startMinutes;
    currentMinutes + totalSlotTime <= endMinutes;
    currentMinutes += slotDuration
  ) {
    const slotTime = minutesToTime(currentMinutes);
    const slotEndMinutes = currentMinutes + serviceDuration;

    // Verificar se não cai no horário de pausa
    let isDuringBreak = false;
    if (breakStartMinutes !== undefined && breakEndMinutes !== undefined) {
      isDuringBreak =
        currentMinutes < breakEndMinutes && slotEndMinutes > breakStartMinutes;
    }

    // Verificar se não é muito em cima da hora - considerar fuso horário brasileiro
    const slotDateTime = new Date(date);
    const [hours, minutes] = slotTime.split(":").map(Number);
    slotDateTime.setHours(hours, minutes, 0, 0);

    // Se é o dia de hoje, verificar se o horário já passou considerando o horário brasileiro
    const isToday = date.toDateString() === brazilNow.toDateString();
    const isTooLate = isToday && slotDateTime < minimumBookingTime;

    let available = true;
    let reason: string | undefined;

    if (isDuringBreak) {
      available = false;
      reason = "Horário de pausa";
    } else if (isTooLate) {
      available = false;
      reason = "Tempo insuficiente para agendamento";
    }

    slots.push({
      time: slotTime,
      available,
      reason,
    });
  }

  return slots;
}

// Obter configurações para exibição no frontend
export async function getSpecialistScheduleForDisplay(specialistId: string) {
  const schedule = await getSpecialistSchedule(specialistId);

  return {
    ...schedule,
    workingHoursFormatted: schedule.workingHours.map(wh => ({
      dayName: getDayName(wh.dayOfWeek),
      dayOfWeek: wh.dayOfWeek,
      isWorking: wh.isWorking,
      startTime: wh.startTime,
      endTime: wh.endTime,
      breakStartTime: wh.breakStartTime,
      breakEndTime: wh.breakEndTime,
      hasBreak: !!(wh.breakStartTime && wh.breakEndTime),
    })),
    customUnavailableDatesFormatted: schedule.customUnavailableDates.map(
      date => ({
        date: date.toISOString().split("T")[0],
        dateFormatted: date.toLocaleDateString("pt-BR"),
      })
    ),
  };
}

// Funções utilitárias
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

// Função para obter a data/hora atual no fuso horário brasileiro
function getBrazilianDateTime(): Date {
  const now = new Date();
  const brazilTime = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);

  return new Date(
    `${brazilTime.find(p => p.type === "year")?.value}-${brazilTime.find(p => p.type === "month")?.value}-${brazilTime.find(p => p.type === "day")?.value}T${brazilTime.find(p => p.type === "hour")?.value}:${brazilTime.find(p => p.type === "minute")?.value}:${brazilTime.find(p => p.type === "second")?.value}`
  );
}

export function getDayName(dayOfWeek: number): string {
  const days = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];
  return days[dayOfWeek];
}

// Aplicar configuração padrão para todos os especialistas existentes
export async function initializeExistingSpecialists(
  salonId: string
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const specialistsList = await db
    .select({ id: specialists.id })
    .from(specialists)
    .where(eq(specialists.salonId, salonId));

  let initialized = 0;

  for (const specialist of specialistsList) {
    // Garante persistência no DB
    const schedule = await getSpecialistSchedule(specialist.id);
    if (schedule) initialized++;
  }

  logger.info(
    `Configuracoes inicializadas para ${initialized} especialistas`
  );

  return initialized;
}
