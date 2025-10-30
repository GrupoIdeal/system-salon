// Sistema de Configurações de Horário por Especialista
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { specialists } from "../drizzle/schema";

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

// Mock do armazenamento (em produção usar tabela do banco)
let specialistSchedules: Map<string, SpecialistSchedule> = new Map();

// Horário padrão para novos especialistas
const defaultSchedule: Omit<SpecialistSchedule, "specialistId"> = {
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
};

// Buscar ou criar configuração do especialista
export async function getSpecialistSchedule(
  specialistId: string
): Promise<SpecialistSchedule> {
  if (specialistSchedules.has(specialistId)) {
    return specialistSchedules.get(specialistId)!;
  }

  // Criar configuração padrão
  const schedule: SpecialistSchedule = {
    specialistId,
    ...defaultSchedule,
  };

  specialistSchedules.set(specialistId, schedule);

  console.log(
    `📅 Configuração padrão criada para especialista: ${specialistId}`
  );

  return schedule;
}

// Atualizar configuração do especialista
export async function updateSpecialistSchedule(
  specialistId: string,
  updates: Partial<Omit<SpecialistSchedule, "specialistId">>
): Promise<SpecialistSchedule> {
  const currentSchedule = await getSpecialistSchedule(specialistId);

  const updatedSchedule = {
    ...currentSchedule,
    ...updates,
  };

  specialistSchedules.set(specialistId, updatedSchedule);

  console.log(`📝 Configuração do especialista atualizada:`, {
    specialistId,
    updates,
  });

  return updatedSchedule;
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

  // Verificar se não é muito em cima da hora
  const now = new Date();
  const minimumBookingTime = new Date(
    now.getTime() + schedule.minimumNoticeHours * 60 * 60 * 1000
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

    // Verificar se não é muito em cima da hora
    const slotDateTime = new Date(date);
    const [hours, minutes] = slotTime.split(":").map(Number);
    slotDateTime.setHours(hours, minutes, 0, 0);

    const isTooLate = slotDateTime < minimumBookingTime;

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

// Adicionar data indisponível personalizada
export async function addCustomUnavailableDate(
  specialistId: string,
  date: Date
): Promise<void> {
  const schedule = await getSpecialistSchedule(specialistId);

  // Verificar se já existe
  const exists = schedule.customUnavailableDates.some(
    d => d.toDateString() === date.toDateString()
  );

  if (!exists) {
    schedule.customUnavailableDates.push(date);
    specialistSchedules.set(specialistId, schedule);

    console.log(
      `🚫 Data indisponível adicionada para ${specialistId}: ${date.toLocaleDateString("pt-BR")}`
    );
  }
}

// Remover data indisponível personalizada
export async function removeCustomUnavailableDate(
  specialistId: string,
  date: Date
): Promise<void> {
  const schedule = await getSpecialistSchedule(specialistId);

  schedule.customUnavailableDates = schedule.customUnavailableDates.filter(
    d => d.toDateString() !== date.toDateString()
  );

  specialistSchedules.set(specialistId, schedule);

  console.log(
    `✅ Data indisponível removida para ${specialistId}: ${date.toLocaleDateString("pt-BR")}`
  );
}

// Configurar horário específico para um dia da semana
export async function updateWorkingHoursForDay(
  specialistId: string,
  dayOfWeek: number,
  workingHours: Omit<WorkingHours, "dayOfWeek">
): Promise<void> {
  const schedule = await getSpecialistSchedule(specialistId);

  const dayIndex = schedule.workingHours.findIndex(
    wh => wh.dayOfWeek === dayOfWeek
  );

  if (dayIndex !== -1) {
    schedule.workingHours[dayIndex] = {
      dayOfWeek,
      ...workingHours,
    };
  } else {
    schedule.workingHours.push({
      dayOfWeek,
      ...workingHours,
    });
  }

  specialistSchedules.set(specialistId, schedule);

  console.log(
    `📅 Horário atualizado para ${getDayName(dayOfWeek)}:`,
    workingHours
  );
}

// Verificar se pode aceitar agendamento online
export async function canAcceptOnlineBooking(
  specialistId: string,
  date: Date
): Promise<boolean> {
  const schedule = await getSpecialistSchedule(specialistId);

  if (!schedule.allowOnlineBooking) {
    return false;
  }

  const now = new Date();
  const maxDate = new Date(
    now.getTime() + schedule.allowBookingDaysInAdvance * 24 * 60 * 60 * 1000
  );

  return date <= maxDate && (await isSpecialistWorking(specialistId, date));
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

function getDayName(dayOfWeek: number): string {
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
    if (!specialistSchedules.has(specialist.id)) {
      await getSpecialistSchedule(specialist.id); // Cria configuração padrão
      initialized++;
    }
  }

  console.log(
    `🔧 Configurações inicializadas para ${initialized} especialistas`
  );

  return initialized;
}
