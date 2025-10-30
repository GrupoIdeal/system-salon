// Sistema de Lista de Espera
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import { getDb } from "./db";
import {
  sendNotification,
  defaultTemplates,
  renderTemplate,
} from "./notifications";

export interface WaitlistEntry {
  id: string;
  clientId: string;
  serviceId: string;
  specialistId?: string;
  preferredDate?: Date;
  preferredTimeStart?: string; // "09:00"
  preferredTimeEnd?: string; // "18:00"
  maxWaitDays: number; // Quantos dias esperar
  notificationPreference: "sms" | "whatsapp" | "email";
  priority: number; // 1 = alta, 2 = média, 3 = baixa
  status: "active" | "notified" | "confirmed" | "expired" | "cancelled";
  createdAt: Date;
  notifiedAt?: Date;
  expiresAt?: Date; // Quando expira a chance oferecida
}

// Mock do banco de lista de espera (em produção usar tabela real)
let waitlistStorage: WaitlistEntry[] = [];
let waitlistIdCounter = 1;

export function generateWaitlistId(): string {
  return `waitlist_${waitlistIdCounter++}`;
}

// Adicionar cliente à lista de espera
export async function addToWaitlist(
  entry: Omit<WaitlistEntry, "id" | "status" | "createdAt">
): Promise<WaitlistEntry> {
  const newEntry: WaitlistEntry = {
    ...entry,
    id: generateWaitlistId(),
    status: "active",
    createdAt: new Date(),
  };

  waitlistStorage.push(newEntry);

  console.log(`📝 Cliente adicionado à lista de espera:`, {
    id: newEntry.id,
    clientId: newEntry.clientId,
    serviceId: newEntry.serviceId,
    priority: newEntry.priority,
  });

  return newEntry;
}

// Remover da lista de espera
export async function removeFromWaitlist(waitlistId: string): Promise<boolean> {
  const initialLength = waitlistStorage.length;
  waitlistStorage = waitlistStorage.filter(entry => entry.id !== waitlistId);

  const removed = waitlistStorage.length < initialLength;
  if (removed) {
    console.log(`🗑️ Removido da lista de espera: ${waitlistId}`);
  }

  return removed;
}

// Buscar entradas ativas da lista de espera
export async function getActiveWaitlistEntries(
  serviceId?: string,
  specialistId?: string
): Promise<WaitlistEntry[]> {
  let entries = waitlistStorage.filter(entry => entry.status === "active");

  if (serviceId) {
    entries = entries.filter(entry => entry.serviceId === serviceId);
  }

  if (specialistId) {
    entries = entries.filter(
      entry => !entry.specialistId || entry.specialistId === specialistId
    );
  }

  // Ordenar por prioridade (1 = maior prioridade) e depois por data de criação
  entries.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  return entries;
}

// Verificar se um horário disponível atende alguma entrada da lista de espera
export async function checkWaitlistForSlot(
  serviceId: string,
  specialistId: string,
  date: Date,
  time: string
): Promise<WaitlistEntry | null> {
  const entries = await getActiveWaitlistEntries(serviceId, specialistId);

  for (const entry of entries) {
    // Verificar se o horário está dentro das preferências
    if (
      entry.preferredDate &&
      entry.preferredDate.toDateString() !== date.toDateString()
    ) {
      continue;
    }

    if (entry.preferredTimeStart && time < entry.preferredTimeStart) {
      continue;
    }

    if (entry.preferredTimeEnd && time > entry.preferredTimeEnd) {
      continue;
    }

    // Verificar se ainda está dentro do prazo máximo de espera
    const daysDiff = Math.floor(
      (date.getTime() - entry.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff > entry.maxWaitDays) {
      // Marcar como expirado
      entry.status = "expired";
      continue;
    }

    return entry;
  }

  return null;
}

// Notificar cliente da lista de espera sobre horário disponível
export async function notifyWaitlistClient(
  waitlistEntry: WaitlistEntry,
  availableDate: Date,
  availableTime: string,
  specialistId: string
): Promise<boolean> {
  try {
    // Marcar como notificado e definir prazo de confirmação (30 minutos)
    waitlistEntry.status = "notified";
    waitlistEntry.notifiedAt = new Date();
    waitlistEntry.expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    // Simular envio de notificação
    const message = `🎉 Horário disponível!\n\n📅 ${availableDate.toLocaleDateString("pt-BR")} às ${availableTime}\n⏰ Confirme até ${waitlistEntry.expiresAt?.toLocaleTimeString("pt-BR")}\n\nClique aqui para confirmar: https://salon.app/confirm/${waitlistEntry.id}`;

    console.log(`📱 Notificando cliente da lista de espera:`, {
      waitlistId: waitlistEntry.id,
      clientId: waitlistEntry.clientId,
      date: availableDate.toLocaleDateString("pt-BR"),
      time: availableTime,
      expiresAt: waitlistEntry.expiresAt?.toLocaleTimeString("pt-BR"),
    });

    // Em produção, usar o sistema de notificações real
    // await sendNotification(appointmentId, 'waitlist_available', waitlistEntry.notificationPreference);

    return true;
  } catch (error) {
    console.error("❌ Erro ao notificar cliente da lista de espera:", error);
    return false;
  }
}

// Confirmar horário da lista de espera
export async function confirmWaitlistSlot(
  waitlistId: string
): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
  const entry = waitlistStorage.find(e => e.id === waitlistId);

  if (!entry) {
    return {
      success: false,
      error: "Entrada da lista de espera não encontrada",
    };
  }

  if (entry.status !== "notified") {
    return { success: false, error: "Esta oferta não está mais disponível" };
  }

  if (entry.expiresAt && new Date() > entry.expiresAt) {
    entry.status = "expired";
    return { success: false, error: "O prazo para confirmação expirou" };
  }

  // Marcar como confirmado
  entry.status = "confirmed";

  // Em produção, criar o agendamento real aqui
  const appointmentId = `appt_${Date.now()}`;

  console.log(`✅ Horário da lista de espera confirmado:`, {
    waitlistId,
    appointmentId,
    clientId: entry.clientId,
  });

  return { success: true, appointmentId };
}

// Processar entradas expiradas da lista de espera
export async function processExpiredWaitlist(): Promise<{
  expired: number;
  notified: number;
}> {
  let expiredCount = 0;
  let notifiedCount = 0;
  const now = new Date();

  for (const entry of waitlistStorage) {
    // Marcar ofertas expiradas
    if (
      entry.status === "notified" &&
      entry.expiresAt &&
      now > entry.expiresAt
    ) {
      entry.status = "expired";
      expiredCount++;
    }

    // Marcar entradas antigas como expiradas
    if (entry.status === "active") {
      const daysSinceCreated = Math.floor(
        (now.getTime() - entry.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceCreated > entry.maxWaitDays) {
        entry.status = "expired";
        expiredCount++;
      }
    }
  }

  console.log(
    `🔄 Processamento da lista de espera: ${expiredCount} expiradas, ${notifiedCount} notificadas`
  );

  return { expired: expiredCount, notified: notifiedCount };
}

// Estatísticas da lista de espera
export async function getWaitlistStats(): Promise<{
  total: number;
  active: number;
  notified: number;
  confirmed: number;
  expired: number;
  byService: Record<string, number>;
  byPriority: Record<number, number>;
}> {
  const stats = {
    total: waitlistStorage.length,
    active: 0,
    notified: 0,
    confirmed: 0,
    expired: 0,
    byService: {} as Record<string, number>,
    byPriority: {} as Record<number, number>,
  };

  for (const entry of waitlistStorage) {
    // Contar por status
    switch (entry.status) {
      case "active":
        stats.active++;
        break;
      case "notified":
        stats.notified++;
        break;
      case "confirmed":
        stats.confirmed++;
        break;
      case "expired":
        stats.expired++;
        break;
    }

    // Contar por serviço
    stats.byService[entry.serviceId] =
      (stats.byService[entry.serviceId] || 0) + 1;

    // Contar por prioridade
    stats.byPriority[entry.priority] =
      (stats.byPriority[entry.priority] || 0) + 1;
  }

  return stats;
}

// Buscar entrada da lista de espera por ID
export async function getWaitlistEntry(
  waitlistId: string
): Promise<WaitlistEntry | null> {
  return waitlistStorage.find(entry => entry.id === waitlistId) || null;
}

// Atualizar preferências de uma entrada da lista de espera
export async function updateWaitlistEntry(
  waitlistId: string,
  updates: Partial<
    Pick<
      WaitlistEntry,
      | "preferredDate"
      | "preferredTimeStart"
      | "preferredTimeEnd"
      | "maxWaitDays"
      | "notificationPreference"
      | "priority"
    >
  >
): Promise<boolean> {
  const entry = waitlistStorage.find(e => e.id === waitlistId);

  if (!entry) {
    return false;
  }

  Object.assign(entry, updates);

  console.log(`📝 Lista de espera atualizada:`, {
    waitlistId,
    updates,
  });

  return true;
}
