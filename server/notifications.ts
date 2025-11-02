// Sistema de Notificações e Lembretes
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import {
  appointments,
  clients,
  services,
  specialists,
} from "../drizzle/schema";

export interface NotificationTemplate {
  id: string;
  type:
    | "appointment_confirmation"
    | "appointment_reminder"
    | "appointment_cancellation"
    | "waitlist_available";
  title: string;
  message: string;
  smsTemplate?: string;
  emailTemplate?: string;
  whatsappTemplate?: string;
}

export interface NotificationJob {
  id: string;
  appointmentId: string;
  type: "reminder_24h" | "reminder_2h" | "confirmation";
  scheduledFor: Date;
  status: "pending" | "sent" | "failed";
  channel: "email" | "sms" | "whatsapp" | "push";
  createdAt: Date;
  sentAt?: Date;
  error?: string;
}

// Templates padrão de notificação
export const defaultTemplates: Record<string, NotificationTemplate> = {
  appointment_confirmation: {
    id: "appointment_confirmation",
    type: "appointment_confirmation",
    title: "Agendamento Confirmado",
    message:
      "Seu agendamento foi confirmado para {date} às {time} com {specialist}.",
    smsTemplate:
      "Confirmado: {service} em {date} às {time} com {specialist}. Salão: {salon_name}",
    emailTemplate: `
      <h2>Agendamento Confirmado</h2>
      <p>Olá {client_name},</p>
      <p>Seu agendamento foi confirmado com sucesso!</p>
      <div style="background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
        <strong>Detalhes do Agendamento:</strong><br>
        • Serviço: {service}<br>
        • Data: {date}<br>
        • Horário: {time}<br>
        • Especialista: {specialist}<br>
        • Duração: {duration} minutos<br>
        • Valor: R$ {price}
      </div>
      <p>Endereço: {salon_address}</p>
      <p>Em caso de dúvidas, entre em contato: {salon_phone}</p>
    `,
    whatsappTemplate:
      "✅ *Confirmado!*\n\n🗓️ {service}\n📅 {date} às {time}\n👩‍💼 {specialist}\n🏪 {salon_name}\n\nNos vemos lá! 💄✨",
  },

  appointment_reminder: {
    id: "appointment_reminder",
    type: "appointment_reminder",
    title: "Lembrete de Agendamento",
    message:
      "Lembrete: Você tem um agendamento amanhã às {time} com {specialist}.",
    smsTemplate:
      "Lembrete: {service} amanhã às {time} com {specialist}. {salon_name}",
    emailTemplate: `
      <h2>Lembrete de Agendamento</h2>
      <p>Olá {client_name},</p>
      <p>Este é um lembrete do seu agendamento:</p>
      <div style="background: #fff3cd; padding: 15px; margin: 15px 0; border-radius: 5px; border: 1px solid #ffeaa7;">
        <strong>Amanhã às {time}</strong><br>
        • Serviço: {service}<br>
        • Especialista: {specialist}<br>
        • Duração: {duration} minutos
      </div>
      <p>Não esqueça! Nos vemos em breve 😊</p>
    `,
    whatsappTemplate:
      "⏰ *Lembrete*\n\n🗓️ Amanhã às {time}\n💄 {service}\n👩‍💼 {specialist}\n\nNos vemos lá! ✨",
  },

  appointment_cancellation: {
    id: "appointment_cancellation",
    type: "appointment_cancellation",
    title: "Agendamento Cancelado",
    message: "Seu agendamento para {date} às {time} foi cancelado.",
    smsTemplate:
      "Cancelado: {service} em {date} às {time}. Para reagendar: {salon_phone}",
    emailTemplate: `
      <h2>Agendamento Cancelado</h2>
      <p>Olá {client_name},</p>
      <p>Informamos que seu agendamento foi cancelado:</p>
      <div style="background: #f8d7da; padding: 15px; margin: 15px 0; border-radius: 5px; border: 1px solid #f5c6cb;">
        <strong>Agendamento Cancelado:</strong><br>
        • Serviço: {service}<br>
        • Data: {date}<br>
        • Horário: {time}<br>
        • Especialista: {specialist}
      </div>
      <p>Para reagendar, entre em contato: {salon_phone}</p>
      <p>Pedimos desculpas pelo inconveniente.</p>
    `,
    whatsappTemplate:
      "❌ *Cancelado*\n\n{service} em {date} às {time}\n\nPara reagendar: {salon_phone}\n\nDesculpe o inconveniente! 🙏",
  },

  waitlist_available: {
    id: "waitlist_available",
    type: "waitlist_available",
    title: "Horário Disponível",
    message: "Temos um horário disponível para {service} em {date} às {time}.",
    smsTemplate:
      "Horário disponível: {service} em {date} às {time}. Confirme até {deadline}",
    emailTemplate: `
      <h2>Horário Disponível na Lista de Espera</h2>
      <p>Olá {client_name},</p>
      <p>Temos boas notícias! Um horário ficou disponível:</p>
      <div style="background: #d4edda; padding: 15px; margin: 15px 0; border-radius: 5px; border: 1px solid #c3e6cb;">
        <strong>Horário Disponível:</strong><br>
        • Serviço: {service}<br>
        • Data: {date}<br>
        • Horário: {time}<br>
        • Especialista: {specialist}
      </div>
      <p><strong>Confirme até {deadline} para garantir o horário!</strong></p>
      <p>Clique aqui para confirmar: {confirm_link}</p>
    `,
    whatsappTemplate:
      "🎉 *Horário Disponível!*\n\n💄 {service}\n📅 {date} às {time}\n👩‍💼 {specialist}\n\n⏰ Confirme até {deadline}\n{confirm_link}",
  },
};

// Funções para agendar notificações
export async function scheduleAppointmentNotifications(appointmentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const appointment = await db
    .select({
      id: appointments.id,
      appointmentDate: appointments.appointmentDate,
      appointmentTime: appointments.appointmentTime,
      clientId: appointments.clientId,
    })
    .from(appointments)
    .where(eq(appointments.id, appointmentId))
    .limit(1);

  if (!appointment.length) {
    throw new Error("Agendamento não encontrado");
  }

  const appt = appointment[0];
  const appointmentDateTime = new Date(
    `${appt.appointmentDate.toISOString().split("T")[0]}T${appt.appointmentTime}:00`
  );

  // Agendar confirmação imediata
  await scheduleNotification({
    appointmentId,
    type: "confirmation",
    scheduledFor: new Date(), // Enviar agora
    channel: "whatsapp", // Prioridade WhatsApp
  });

  // Agendar lembrete 24h antes
  const reminder24h = new Date(
    appointmentDateTime.getTime() - 24 * 60 * 60 * 1000
  );
  if (reminder24h > new Date()) {
    await scheduleNotification({
      appointmentId,
      type: "reminder_24h",
      scheduledFor: reminder24h,
      channel: "whatsapp",
    });
  }

  // Agendar lembrete 2h antes
  const reminder2h = new Date(
    appointmentDateTime.getTime() - 2 * 60 * 60 * 1000
  );
  if (reminder2h > new Date()) {
    await scheduleNotification({
      appointmentId,
      type: "reminder_2h",
      scheduledFor: reminder2h,
      channel: "sms",
    });
  }
}

async function scheduleNotification(
  job: Omit<NotificationJob, "id" | "status" | "createdAt">
) {
  // Em produção, usar uma fila como Redis/Bull ou database
  if (process.env.NODE_ENV !== "production") {
    console.log("📅 Notificação agendada:", {
      appointmentId: job.appointmentId,
      type: job.type,
      scheduledFor: job.scheduledFor,
      channel: job.channel,
    });
  }

  // Simular agendamento imediato para confirmação
  if (job.type === "confirmation") {
    await sendNotification(job.appointmentId, job.type, job.channel);
  }
}

// Função principal para enviar notificações
export async function sendNotification(
  appointmentId: string,
  type: "confirmation" | "reminder_24h" | "reminder_2h",
  channel: "email" | "sms" | "whatsapp" | "push"
) {
  try {
    const appointmentData = await getAppointmentNotificationData(appointmentId);

    let template: NotificationTemplate;
    switch (type) {
      case "confirmation":
        template = defaultTemplates.appointment_confirmation;
        break;
      case "reminder_24h":
      case "reminder_2h":
        template = defaultTemplates.appointment_reminder;
        break;
      default:
        throw new Error(`Tipo de notificação não suportado: ${type}`);
    }

    const message = renderTemplate(template, appointmentData, channel);

    if (process.env.NODE_ENV !== "production") {
      console.log(
        `📱 Enviando ${channel.toUpperCase()} para ${appointmentData.client_name}:`,
        message
      );
    }

    return { success: true, message: "Notificação enviada com sucesso" };
  } catch (err) {
    console.error("❌ Erro ao enviar notificação:", err);
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

// Buscar dados do agendamento para as notificações
async function getAppointmentNotificationData(appointmentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      appointment_id: appointments.id,
      appointment_date: appointments.appointmentDate,
      appointment_time: appointments.appointmentTime,
      appointment_status: appointments.status,
      client_id: clients.id,
      client_name: clients.name,
      client_email: clients.email,
      client_phone: clients.phone,
      service_name: services.name,
      service_duration: services.duration,
      service_price: services.price,
      specialist_name: specialists.name,
      specialist_phone: specialists.phone,
    })
    .from(appointments)
    .innerJoin(clients, eq(appointments.clientId, clients.id))
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .innerJoin(specialists, eq(appointments.specialistId, specialists.id))
    .where(eq(appointments.id, appointmentId))
    .limit(1);

  if (!result.length) {
    throw new Error("Dados do agendamento não encontrados");
  }

  const data = result[0];

  return {
    appointment_id: data.appointment_id,
    client_name: data.client_name,
    client_email: data.client_email,
    client_phone: data.client_phone,
    service: data.service_name,
    duration: data.service_duration?.toString(),
    price: Number(data.service_price).toFixed(2),
    specialist: data.specialist_name,
    specialist_phone: data.specialist_phone,
    date: data.appointment_date.toLocaleDateString("pt-BR"),
    time: data.appointment_time,
    salon_name: "Salão de Beleza",
    salon_phone: "(11) 99999-9999",
    salon_address: "Rua das Flores, 123 - Centro",
  };
}

// Renderizar template com dados
export function renderTemplate(
  template: NotificationTemplate,
  data: Record<string, unknown>,
  channel: "email" | "sms" | "whatsapp" | "push"
): string {
  let message: string;

  switch (channel) {
    case "sms":
      message = template.smsTemplate || template.message;
      break;
    case "email":
      message = template.emailTemplate || template.message;
      break;
    case "whatsapp":
      message = template.whatsappTemplate || template.message;
      break;
    case "push":
      message = template.message;
      break;
    default:
      message = template.message;
  }

  // Substituir placeholders
  return message.replace(/\{([^}]+)\}/g, (match, key) => {
    const val = (data as Record<string, unknown>)[key];
    return val !== undefined && val !== null ? String(val) : match;
  });
}

// Função para processar fila de notificações (executar periodicamente)
export async function processNotificationQueue() {
  if (process.env.NODE_ENV !== "production") {
    console.log("🔄 Processando fila de notificações...");
  }

  // Em produção:
  // 1. Buscar jobs pendentes do banco/fila
  // 2. Verificar se chegou a hora de enviar
  // 3. Executar envios
  // 4. Atualizar status dos jobs

  return { processed: 0, failed: 0 };
}
