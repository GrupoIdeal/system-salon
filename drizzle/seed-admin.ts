/** biome-ignore-all assist/source/organizeImports: false positive */
/**
 * Seed principal do sistema.
 * Usuário admin: teste@teste.com / 123123
 *
 * O que este seed faz (idempotente — pode rodar quantas vezes quiser):
 *  1. Limpa TODOS os dados existentes (users, salons, specialists, services, clients, appointments, transactions, specialistSchedules)
 *  2. Cria o usuário admin teste@teste.com
 *  3. Cria o salão "Graciosa Studio de Beleza" vinculado a ele
 *  4. Cria 3 especialistas com horários de trabalho
 *  5. Cria 8 serviços vinculados aos especialistas
 *  6. Cria 15 clientes
 *  7. Cria ~50 agendamentos distribuídos nos últimos 60 dias e próximos 30 dias
 *  8. Cria transações financeiras para os agendamentos concluídos
 *
 * Para rodar: NODE_ENV=development pnpm tsx drizzle/seed-admin.ts
 */
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import {
  users,
  salons,
  specialists,
  services,
  clients,
  appointments,
  transactions,
  specialistSchedules,
  auditLogs,
} from "../drizzle/schema";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";

config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Environment variable DATABASE_URL is not set");
}
const client = postgres(databaseUrl);
const db = drizzle(client);

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Retorna uma data no passado/futuro relativa a hoje */
function daysFromNow(offset: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Formata Date em "HH:MM" */
function toTimeStr(hour: number, minute = 0): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** Escolhe um item aleatório de um array */
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Horário padrão de trabalho seg–sáb, 9h–19h, almoço 12h–13h */
const DEFAULT_WORKING_HOURS = [0, 1, 2, 3, 4, 5, 6].map(day => ({
  dayOfWeek: day,
  isWorking: day !== 0, // domingo fechado
  startTime: day !== 0 ? "09:00" : null,
  endTime: day !== 0 ? "19:00" : null,
  breakStartTime: day !== 0 ? "12:00" : null,
  breakEndTime: day !== 0 ? "13:00" : null,
}));

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🧹 Limpando banco de dados...");

  // Desativar FK checks para truncate limpo
  await db.execute(sql`TRUNCATE TABLE
    "audit_logs",
    "transactions",
    "appointments",
    "specialistSchedules",
    "services",
    "specialists",
    "clients",
    "salons",
    "users"
    RESTART IDENTITY CASCADE`);

  console.log("✅ Banco limpo!\n");

  // ── 1. Usuário admin principal ────────────────────────────────────────────
  console.log("👤 Criando usuário admin...");
  const userId = nanoid();
  await db.insert(users).values({
    id: userId,
    email: "teste@teste.com",
    password: await bcrypt.hash("123123", 10),
    name: "Administrador",
    role: "admin",
    permissions: { manage_all: true },
  });
  console.log("   📧 teste@teste.com  |  🔑 123123\n");

  // ── 2. Salão ──────────────────────────────────────────────────────────────
  console.log("🏢 Criando salão...");
  const salonId = nanoid();
  await db.insert(salons).values({
    id: salonId,
    userId,
    name: "Graciosa Studio de Beleza",
    cnpj: "12345678000190",
    address: "Rua das Flores, 123 - Centro",
    phone: "(88) 99999-1234",
    email: "contato@graciosa.com.br",
    logo: null,
  });

  // Atualizar salonId no usuário admin
  await db.execute(
    sql`UPDATE users SET "salonId" = ${salonId} WHERE id = ${userId}`
  );
  console.log("   🏢 Graciosa Studio de Beleza\n");

  // ── 3. Especialistas ──────────────────────────────────────────────────────
  console.log("💇 Criando especialistas...");

  const specData = [
    {
      name: "Ana Paula Ferreira",
      specialty: "Cabeleireira",
      email: "ana@graciosa.com.br",
      phone: "(88) 99111-0001",
      bio: "Especialista em cortes modernos e coloração.",
    },
    {
      name: "Beatriz Moura",
      specialty: "Manicure & Pedicure",
      email: "bia@graciosa.com.br",
      phone: "(88) 99111-0002",
      bio: "Nail art e unhas em gel.",
    },
    {
      name: "Camila Rocha",
      specialty: "Esteticista",
      email: "camila@graciosa.com.br",
      phone: "(88) 99111-0003",
      bio: "Tratamentos faciais e depilação.",
    },
  ];

  const specIds: string[] = [];
  for (const spec of specData) {
    const specId = nanoid();
    specIds.push(specId);
    await db.insert(specialists).values({
      id: specId,
      salonId,
      ...spec,
      status: "active",
    });
    // Criar schedule padrão para cada especialista
    await db.insert(specialistSchedules).values({
      specialistId: specId,
      timeSlotDuration: 30,
      bufferTime: 10,
      allowBookingDaysInAdvance: 30,
      minimumNoticeHours: 2,
      autoConfirmBookings: true,
      allowOnlineBooking: true,
      workingHours: DEFAULT_WORKING_HOURS,
      customUnavailableDates: [],
    });
    console.log(`   ✂️  ${spec.name} (${spec.specialty})`);
  }
  console.log();

  // ── 4. Serviços ───────────────────────────────────────────────────────────
  console.log("✨ Criando serviços...");

  const serviceData = [
    // Ana Paula — cabelo
    { name: "Corte Feminino", duration: 60, price: "80.00", specIdx: 0 },
    { name: "Escova Completa", duration: 60, price: "90.00", specIdx: 0 },
    {
      name: "Coloração",
      duration: 120,
      price: "180.00",
      priceFrom: true,
      specIdx: 0,
    },
    // Beatriz — unhas
    { name: "Manicure", duration: 45, price: "35.00", specIdx: 1 },
    { name: "Pedicure", duration: 50, price: "40.00", specIdx: 1 },
    {
      name: "Nail Art",
      duration: 90,
      price: "75.00",
      priceFrom: true,
      specIdx: 1,
    },
    // Camila — estética
    { name: "Limpeza de Pele", duration: 60, price: "120.00", specIdx: 2 },
    { name: "Depilação (pernas)", duration: 50, price: "60.00", specIdx: 2 },
  ];

  const serviceIds: string[] = [];
  for (const svc of serviceData) {
    const svcId = nanoid();
    serviceIds.push(svcId);
    await db.insert(services).values({
      id: svcId,
      salonId,
      specialistId: specIds[svc.specIdx],
      name: svc.name,
      duration: svc.duration,
      price: svc.price,
      priceFrom: svc.priceFrom ?? false,
      status: "active",
    });
    console.log(`   🔸 ${svc.name} — R$ ${svc.price}`);
  }
  console.log();

  // ── 5. Clientes ───────────────────────────────────────────────────────────
  console.log("👥 Criando clientes...");

  const clientData = [
    {
      name: "Fernanda Lima",
      email: "fernanda@email.com",
      phone: "(88) 98001-0001",
    },
    {
      name: "Juliana Costa",
      email: "juliana@email.com",
      phone: "(88) 98001-0002",
    },
    {
      name: "Mariana Souza",
      email: "mariana@email.com",
      phone: "(88) 98001-0003",
    },
    {
      name: "Patricia Mendes",
      email: "patricia@email.com",
      phone: "(88) 98001-0004",
    },
    {
      name: "Renata Alves",
      email: "renata@email.com",
      phone: "(88) 98001-0005",
    },
    {
      name: "Sofia Cardoso",
      email: "sofia@email.com",
      phone: "(88) 98001-0006",
    },
    {
      name: "Tatiane Ribeiro",
      email: "tatiane@email.com",
      phone: "(88) 98001-0007",
    },
    {
      name: "Vanessa Oliveira",
      email: "vanessa@email.com",
      phone: "(88) 98001-0008",
    },
    {
      name: "Amanda Gomes",
      email: "amanda@email.com",
      phone: "(88) 98001-0009",
    },
    { name: "Carla Nunes", email: "carla@email.com", phone: "(88) 98001-0010" },
    {
      name: "Daniela Pinto",
      email: "daniela@email.com",
      phone: "(88) 98001-0011",
    },
    {
      name: "Larissa Freitas",
      email: "larissa@email.com",
      phone: "(88) 98001-0012",
    },
    {
      name: "Isabela Torres",
      email: "isabela@email.com",
      phone: "(88) 98001-0013",
    },
    {
      name: "Nathalia Vieira",
      email: "nathalia@email.com",
      phone: "(88) 98001-0014",
    },
    {
      name: "Priscila Barros",
      email: "priscila@email.com",
      phone: "(88) 98001-0015",
    },
  ];

  const clientIds: string[] = [];
  for (const cli of clientData) {
    const cliId = nanoid();
    clientIds.push(cliId);
    await db.insert(clients).values({ id: cliId, salonId, ...cli });
    console.log(`   👤 ${cli.name}`);
  }
  console.log();

  // ── 6. Agendamentos ───────────────────────────────────────────────────────
  console.log("📅 Criando agendamentos...");

  // Mapeamento: qual serviço pertence a qual especialista
  // serviceIds: [0,1,2] = Ana | [3,4,5] = Bia | [6,7] = Camila
  const specServiceMap: Record<number, number[]> = {
    0: [0, 1, 2],
    1: [3, 4, 5],
    2: [6, 7],
  };

  // Horários disponíveis (9h–18h30, sem almoço 12h–13h)
  const availableHours = [9, 10, 11, 13, 14, 15, 16, 17, 18];
  const availableMinutes = [0, 30];

  type AppStatus = "completed" | "confirmed" | "cancelled" | "pending";

  const appointmentList: {
    date: Date;
    time: string;
    clientIdx: number;
    specIdx: number;
    svcIdx: number;
    status: AppStatus;
  }[] = [];

  // Passado: -60 a -1 dias → completed ou cancelled
  for (let dayOffset = -60; dayOffset <= -1; dayOffset++) {
    const date = daysFromNow(dayOffset);
    // Pular domingos
    if (date.getDay() === 0) continue;
    // 1–3 agendamentos por dia
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      const specIdx = i % 3;
      const svcOptions = specServiceMap[specIdx];
      appointmentList.push({
        date,
        time: toTimeStr(pick(availableHours), pick(availableMinutes)),
        clientIdx: Math.floor(Math.random() * clientIds.length),
        specIdx,
        svcIdx: svcOptions[Math.floor(Math.random() * svcOptions.length)],
        status: Math.random() < 0.1 ? "cancelled" : "completed",
      });
    }
  }

  // Futuro: hoje a +30 dias → confirmed ou pending
  for (let dayOffset = 0; dayOffset <= 30; dayOffset++) {
    const date = daysFromNow(dayOffset);
    if (date.getDay() === 0) continue;
    const count = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < count; i++) {
      const specIdx = i % 3;
      const svcOptions = specServiceMap[specIdx];
      appointmentList.push({
        date,
        time: toTimeStr(pick(availableHours), pick(availableMinutes)),
        clientIdx: Math.floor(Math.random() * clientIds.length),
        specIdx,
        svcIdx: svcOptions[Math.floor(Math.random() * svcOptions.length)],
        status: Math.random() < 0.3 ? "pending" : "confirmed",
      });
    }
  }

  const appointmentIds: string[] = [];
  for (const appt of appointmentList) {
    const apptId = nanoid();
    appointmentIds.push(apptId);
    const svcPrice = serviceData[appt.svcIdx].price;
    await db.insert(appointments).values({
      id: apptId,
      salonId,
      clientId: clientIds[appt.clientIdx],
      serviceId: serviceIds[appt.svcIdx],
      specialistId: specIds[appt.specIdx],
      appointmentDate: appt.date,
      appointmentTime: appt.time,
      status: appt.status,
      paidAmount: appt.status === "completed" ? svcPrice : null,
    });
  }
  console.log(`   📆 ${appointmentList.length} agendamentos criados\n`);

  // ── 7. Transações financeiras (apenas para completed) ─────────────────────
  console.log("💰 Criando transações financeiras...");

  const paymentMethods = ["cash", "credit_card", "debit_card", "pix"] as const;
  let txCount = 0;

  for (let i = 0; i < appointmentList.length; i++) {
    const appt = appointmentList[i];
    if (appt.status !== "completed") continue;

    const svc = serviceData[appt.svcIdx];
    const amount = svc.price;
    const txDate = new Date(appt.date);
    txDate.setHours(
      Number(appt.time.split(":")[0]),
      Number(appt.time.split(":")[1]),
      0,
      0
    );

    await db.insert(transactions).values({
      id: nanoid(),
      salonId,
      appointmentId: appointmentIds[i],
      clientId: clientIds[appt.clientIdx],
      serviceId: serviceIds[appt.svcIdx],
      specialistId: specIds[appt.specIdx],
      type: "income",
      status: "completed",
      paymentMethod: pick(paymentMethods) as "cash" | "credit_card" | "debit_card" | "pix",
      amount,
      description: `${svc.name} — ${clientData[appt.clientIdx].name}`,
      transactionDate: txDate,
    });
    txCount++;
  }
  console.log(`   💵 ${txCount} transações criadas\n`);

  // ── Resumo final ──────────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════");
  console.log("✅ SEED CONCLUÍDO COM SUCESSO!");
  console.log("═══════════════════════════════════════════");
  console.log("📧 Login: teste@teste.com");
  console.log("🔑 Senha: 123123");
  console.log("───────────────────────────────────────────");
  console.log(`👥 Clientes:      ${clientData.length}`);
  console.log(`💇 Especialistas: ${specData.length}`);
  console.log(`✨ Serviços:      ${serviceData.length}`);
  console.log(`📅 Agendamentos:  ${appointmentList.length}`);
  console.log(`💰 Transações:    ${txCount}`);
  console.log("═══════════════════════════════════════════\n");

  process.exit(0);
}

main().catch(err => {
  console.error("❌ Erro no seed:", err);
  process.exit(1);
});
