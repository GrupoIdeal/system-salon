// Sistema de Relatórios Avançados
import { eq, and, gte, lte } from "drizzle-orm";
import { getDb } from "./db";
import {
  appointments,
  clients,
  services,
  specialists,
} from "../drizzle/schema";

export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  specialistId?: string;
  serviceId?: string;
  clientId?: string;
  status?: "pending" | "confirmed" | "completed" | "cancelled";
}

export interface AppointmentStats {
  total: number;
  completed: number;
  cancelled: number;
  pending: number;
  confirmed: number;
  revenue: number;
  averageTicket: number;
}

export interface SpecialistPerformance {
  specialistId: string;
  specialistName: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  revenue: number;
  averageTicket: number;
  completionRate: number;
  cancellationRate: number;
  topServices: Array<{
    serviceId: string;
    serviceName: string;
    count: number;
    revenue: number;
  }>;
}

export interface ServicePopularity {
  serviceId: string;
  serviceName: string;
  totalBookings: number;
  completedBookings: number;
  revenue: number;
  averageTicket: number;
  duration: number;
  popularTimeSlots: Array<{
    timeSlot: string;
    count: number;
  }>;
}

export interface ClientAnalytics {
  clientId: string;
  clientName: string;
  totalAppointments: number;
  completedAppointments: number;
  totalSpent: number;
  averageTicket: number;
  frequencyDays: number; // Média de dias entre agendamentos
  favoriteServices: Array<{
    serviceId: string;
    serviceName: string;
    count: number;
  }>;
  favoriteSpecialists: Array<{
    specialistId: string;
    specialistName: string;
    count: number;
  }>;
  lastVisit?: Date;
  riskScore: number; // 0-100, risco de abandono
}

export interface DailyReport {
  date: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  revenue: number;
  busyHours: Array<{
    hour: string;
    appointmentCount: number;
  }>;
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalDays: number;
  workingDays: number;
  totalAppointments: number;
  completedAppointments: number;
  revenue: number;
  averageDailyRevenue: number;
  topSpecialists: SpecialistPerformance[];
  topServices: ServicePopularity[];
  newClients: number;
  returningClients: number;
  growthRate: number; // Comparado com mês anterior
}

// Relatório de estatísticas gerais
export async function generateAppointmentStats(
  salonId: string,
  filter: ReportFilter = {}
): Promise<AppointmentStats> {
  const db = getDb();

  let query = db
    .select({
      id: appointments.id,
      status: appointments.status,
      servicePrice: services.price,
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .innerJoin(specialists, eq(appointments.specialistId, specialists.id))
    .where(eq(specialists.salonId, salonId));

  // Aplicar filtros
  const conditions = [eq(specialists.salonId, salonId)];

  if (filter.startDate) {
    conditions.push(gte(appointments.appointmentDate, filter.startDate));
  }

  if (filter.endDate) {
    conditions.push(lte(appointments.appointmentDate, filter.endDate));
  }

  if (filter.specialistId) {
    conditions.push(eq(appointments.specialistId, filter.specialistId));
  }

  if (filter.serviceId) {
    conditions.push(eq(appointments.serviceId, filter.serviceId));
  }

  if (filter.status) {
    conditions.push(eq(appointments.status, filter.status));
  }

  const results = await query.where(and(...conditions));

  const stats: AppointmentStats = {
    total: results.length,
    completed: results.filter(r => r.status === "completed").length,
    cancelled: results.filter(r => r.status === "cancelled").length,
    pending: results.filter(r => r.status === "pending").length,
    confirmed: results.filter(r => r.status === "confirmed").length,
    revenue: 0,
    averageTicket: 0,
  };

  // Calcular receita apenas dos agendamentos completados
  const completedRevenue = results
    .filter(r => r.status === "completed")
    .reduce((sum, r) => sum + Number(r.servicePrice), 0);

  stats.revenue = completedRevenue;
  stats.averageTicket =
    stats.completed > 0 ? stats.revenue / stats.completed : 0;

  return stats;
}

// Relatório de performance por especialista
export async function generateSpecialistPerformance(
  salonId: string,
  filter: ReportFilter = {}
): Promise<SpecialistPerformance[]> {
  const db = getDb();

  const results = await db
    .select({
      specialistId: specialists.id,
      specialistName: specialists.name,
      appointmentId: appointments.id,
      status: appointments.status,
      serviceId: services.id,
      serviceName: services.name,
      servicePrice: services.price,
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .innerJoin(specialists, eq(appointments.specialistId, specialists.id))
    .where(eq(specialists.salonId, salonId));

  // Agrupar por especialista
  const specialistMap = new Map<
    string,
    {
      name: string;
      appointments: typeof results;
    }
  >();

  for (const result of results) {
    if (!specialistMap.has(result.specialistId)) {
      specialistMap.set(result.specialistId, {
        name: result.specialistName,
        appointments: [],
      });
    }
    specialistMap.get(result.specialistId)!.appointments.push(result);
  }

  const performance: SpecialistPerformance[] = [];

  for (const [specialistId, data] of specialistMap) {
    const appointments = data.appointments;
    const completed = appointments.filter(a => a.status === "completed");
    const cancelled = appointments.filter(a => a.status === "cancelled");

    const revenue = completed.reduce(
      (sum, a) => sum + Number(a.servicePrice),
      0
    );

    // Agrupar serviços
    const serviceMap = new Map<
      string,
      { name: string; count: number; revenue: number }
    >();
    for (const appt of completed) {
      if (!serviceMap.has(appt.serviceId)) {
        serviceMap.set(appt.serviceId, {
          name: appt.serviceName,
          count: 0,
          revenue: 0,
        });
      }
      const service = serviceMap.get(appt.serviceId)!;
      service.count++;
      service.revenue += Number(appt.servicePrice);
    }

    const topServices = Array.from(serviceMap.entries())
      .map(([serviceId, data]) => ({
        serviceId,
        serviceName: data.name,
        count: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    performance.push({
      specialistId,
      specialistName: data.name,
      totalAppointments: appointments.length,
      completedAppointments: completed.length,
      cancelledAppointments: cancelled.length,
      revenue,
      averageTicket: completed.length > 0 ? revenue / completed.length : 0,
      completionRate:
        appointments.length > 0
          ? (completed.length / appointments.length) * 100
          : 0,
      cancellationRate:
        appointments.length > 0
          ? (cancelled.length / appointments.length) * 100
          : 0,
      topServices,
    });
  }

  return performance.sort((a, b) => b.revenue - a.revenue);
}

// Relatório de popularidade dos serviços
export async function generateServicePopularity(
  salonId: string,
  filter: ReportFilter = {}
): Promise<ServicePopularity[]> {
  const db = getDb();

  const results = await db
    .select({
      serviceId: services.id,
      serviceName: services.name,
      serviceDuration: services.duration,
      servicePrice: services.price,
      appointmentTime: appointments.appointmentTime,
      status: appointments.status,
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .innerJoin(specialists, eq(appointments.specialistId, specialists.id))
    .where(eq(specialists.salonId, salonId));

  // Agrupar por serviço
  const serviceMap = new Map<
    string,
    {
      name: string;
      duration: number;
      appointments: typeof results;
    }
  >();

  for (const result of results) {
    if (!serviceMap.has(result.serviceId)) {
      serviceMap.set(result.serviceId, {
        name: result.serviceName,
        duration: result.serviceDuration,
        appointments: [],
      });
    }
    serviceMap.get(result.serviceId)!.appointments.push(result);
  }

  const popularity: ServicePopularity[] = [];

  for (const [serviceId, data] of serviceMap) {
    const appointments = data.appointments;
    const completed = appointments.filter(a => a.status === "completed");

    const revenue = completed.reduce(
      (sum, a) => sum + Number(a.servicePrice),
      0
    );

    // Calcular horários populares
    const timeSlotMap = new Map<string, number>();
    for (const appt of completed) {
      const hour = appt.appointmentTime.split(":")[0] + ":00";
      timeSlotMap.set(hour, (timeSlotMap.get(hour) || 0) + 1);
    }

    const popularTimeSlots = Array.from(timeSlotMap.entries())
      .map(([timeSlot, count]) => ({ timeSlot, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    popularity.push({
      serviceId,
      serviceName: data.name,
      totalBookings: appointments.length,
      completedBookings: completed.length,
      revenue,
      averageTicket: completed.length > 0 ? revenue / completed.length : 0,
      duration: data.duration,
      popularTimeSlots,
    });
  }

  return popularity.sort((a, b) => b.totalBookings - a.totalBookings);
}

// Análise de clientes
export async function generateClientAnalytics(
  salonId: string,
  filter: ReportFilter = {}
): Promise<ClientAnalytics[]> {
  const db = getDb();

  const results = await db
    .select({
      clientId: clients.id,
      clientName: clients.name,
      appointmentDate: appointments.appointmentDate,
      appointmentTime: appointments.appointmentTime,
      status: appointments.status,
      serviceId: services.id,
      serviceName: services.name,
      servicePrice: services.price,
      specialistId: specialists.id,
      specialistName: specialists.name,
    })
    .from(appointments)
    .innerJoin(clients, eq(appointments.clientId, clients.id))
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .innerJoin(specialists, eq(appointments.specialistId, specialists.id))
    .where(eq(specialists.salonId, salonId))
    .orderBy(desc(appointments.appointmentDate));

  // Agrupar por cliente
  const clientMap = new Map<
    string,
    {
      name: string;
      appointments: typeof results;
    }
  >();

  for (const result of results) {
    if (!clientMap.has(result.clientId)) {
      clientMap.set(result.clientId, {
        name: result.clientName,
        appointments: [],
      });
    }
    clientMap.get(result.clientId)!.appointments.push(result);
  }

  const analytics: ClientAnalytics[] = [];

  for (const [clientId, data] of clientMap) {
    const appointments = data.appointments;
    const completed = appointments.filter(a => a.status === "completed");

    const totalSpent = completed.reduce(
      (sum, a) => sum + Number(a.servicePrice),
      0
    );

    // Calcular frequência (dias entre agendamentos)
    let frequencyDays = 0;
    if (completed.length > 1) {
      const dates = completed.map(a => a.appointmentDate).sort();
      const intervals: number[] = [];
      for (let i = 1; i < dates.length; i++) {
        const diff =
          Math.abs(dates[i].getTime() - dates[i - 1].getTime()) /
          (1000 * 60 * 60 * 24);
        intervals.push(diff);
      }
      frequencyDays =
        intervals.reduce((sum, interval) => sum + interval, 0) /
        intervals.length;
    }

    // Serviços favoritos
    const serviceMap = new Map<string, { name: string; count: number }>();
    for (const appt of completed) {
      if (!serviceMap.has(appt.serviceId)) {
        serviceMap.set(appt.serviceId, { name: appt.serviceName, count: 0 });
      }
      serviceMap.get(appt.serviceId)!.count++;
    }

    const favoriteServices = Array.from(serviceMap.entries())
      .map(([serviceId, data]) => ({
        serviceId,
        serviceName: data.name,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Especialistas favoritos
    const specialistMap = new Map<string, { name: string; count: number }>();
    for (const appt of completed) {
      if (!specialistMap.has(appt.specialistId)) {
        specialistMap.set(appt.specialistId, {
          name: appt.specialistName,
          count: 0,
        });
      }
      specialistMap.get(appt.specialistId)!.count++;
    }

    const favoriteSpecialists = Array.from(specialistMap.entries())
      .map(([specialistId, data]) => ({
        specialistId,
        specialistName: data.name,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Calcular risco de abandono (0-100)
    const lastVisit =
      completed.length > 0 ? completed[0].appointmentDate : undefined;
    let riskScore = 0;

    if (lastVisit) {
      const daysSinceLastVisit = Math.floor(
        (new Date().getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Risco baseado em tempo desde última visita e frequência
      if (frequencyDays > 0) {
        const expectedReturn = frequencyDays * 1.5; // 50% de tolerância
        if (daysSinceLastVisit > expectedReturn) {
          riskScore = Math.min(100, (daysSinceLastVisit / expectedReturn) * 50);
        }
      } else {
        // Cliente novo ou com poucas visitas
        riskScore = Math.min(100, (daysSinceLastVisit / 30) * 25);
      }
    }

    analytics.push({
      clientId,
      clientName: data.name,
      totalAppointments: appointments.length,
      completedAppointments: completed.length,
      totalSpent,
      averageTicket: completed.length > 0 ? totalSpent / completed.length : 0,
      frequencyDays,
      favoriteServices,
      favoriteSpecialists,
      lastVisit,
      riskScore,
    });
  }

  return analytics.sort((a, b) => b.totalSpent - a.totalSpent);
}

// Relatório diário
export async function generateDailyReport(
  salonId: string,
  date: Date
): Promise<DailyReport> {
  const db = getDb();

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const results = await db
    .select({
      id: appointments.id,
      status: appointments.status,
      appointmentTime: appointments.appointmentTime,
      servicePrice: services.price,
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .innerJoin(specialists, eq(appointments.specialistId, specialists.id))
    .where(
      and(
        eq(specialists.salonId, salonId),
        gte(appointments.appointmentDate, startOfDay),
        lte(appointments.appointmentDate, endOfDay)
      )
    );

  const completed = results.filter(r => r.status === "completed");
  const cancelled = results.filter(r => r.status === "cancelled");
  const revenue = completed.reduce((sum, r) => sum + Number(r.servicePrice), 0);

  // Calcular horários mais movimentados
  const hourMap = new Map<string, number>();
  for (const appt of results) {
    const hour = appt.appointmentTime.split(":")[0];
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
  }

  const busyHours = Array.from(hourMap.entries())
    .map(([hour, appointmentCount]) => ({
      hour: `${hour}:00`,
      appointmentCount,
    }))
    .sort((a, b) => b.appointmentCount - a.appointmentCount);

  return {
    date: date.toISOString().split("T")[0],
    totalAppointments: results.length,
    completedAppointments: completed.length,
    cancelledAppointments: cancelled.length,
    revenue,
    busyHours,
  };
}

// Exportar relatório para CSV
export function exportToCSV(data: any[], filename: string): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map(row =>
      headers
        .map(header => {
          let value = row[header];
          if (value === null || value === undefined) {
            value = "";
          } else if (typeof value === "string" && value.includes(",")) {
            value = `"${value}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  return csvContent;
}
