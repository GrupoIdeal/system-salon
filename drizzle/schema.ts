import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  decimal,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

/**
 * Core user table for admin authentication
 */
export const users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  // Associação opcional ao salão ao qual o usuário pertence
  salonId: varchar("salonId", { length: 64 }),
  email: varchar("email", { length: 320 }).notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn"),
  photoUrl: text("photoUrl"),
  phone: varchar("phone", { length: 20 }),
  // Permissões granulares armazenadas como JSON (ex: { manage_clients: true })
  permissions: jsonb("permissions").$type<Record<string, boolean> | null>(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Salon data table
 */
export const salons = pgTable(
  "salons",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: varchar("userId", { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    cnpj: varchar("cnpj", { length: 20 }),
    address: text("address"),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 320 }),
    logo: text("logo"),
    // Removed workingHours - now using only specialist schedules
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
  },
  table => ({
    userIdIdx: index("salons_userId_idx").on(table.userId),
  })
);

export type Salon = typeof salons.$inferSelect;
export type InsertSalon = typeof salons.$inferInsert;

export const specialistStatusEnum = pgEnum("specialist_status", [
  "active",
  "inactive",
]);
export const serviceStatusEnum = pgEnum("service_status", [
  "active",
  "inactive",
]);

/**
 * Specialist/Collaborator table
 */
export const specialists = pgTable(
  "specialists",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    salonId: varchar("salonId", { length: 64 })
      .notNull()
      .references(() => salons.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    specialty: varchar("specialty", { length: 255 }),
    photo: text("photo"),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 20 }),
    bio: text("bio"),
    workingDays: jsonb("workingDays").$type<
      Record<
        string,
        Array<{
          start: string;
          end: string;
          lunch?: { start: string; end: string };
        }>
      >
    >(),
    status: specialistStatusEnum("status").default("active"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
  },
  table => ({
    salonIdIdx: index("specialists_salonId_idx").on(table.salonId),
  })
);

export type Specialist = typeof specialists.$inferSelect;
export type InsertSpecialist = typeof specialists.$inferInsert;

/**
 * Client table
 */
export const clients = pgTable(
  "clients",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    salonId: varchar("salonId", { length: 64 })
      .notNull()
      .references(() => salons.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 20 }),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
  },
  table => ({
    salonIdIdx: index("clients_salonId_idx").on(table.salonId),
    emailIdx: index("clients_email_idx").on(table.email),
  })
);

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Service table
 */
export const services = pgTable(
  "services",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    salonId: varchar("salonId", { length: 64 })
      .notNull()
      .references(() => salons.id, { onDelete: "cascade" }),
    specialistId: varchar("specialistId", { length: 64 }).references(
      () => specialists.id,
      { onDelete: "set null" }
    ),
    name: text("name").notNull(),
    description: text("description"),
    duration: integer("duration").notNull(), // in minutes
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    status: serviceStatusEnum("status").default("active"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
  },
  table => ({
    salonIdIdx: index("services_salonId_idx").on(table.salonId),
    specialistIdIdx: index("services_specialistId_idx").on(table.specialistId),
  })
);

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Appointment table
 */
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);

export const appointments = pgTable(
  "appointments",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    salonId: varchar("salonId", { length: 64 })
      .notNull()
      .references(() => salons.id, { onDelete: "cascade" }),
    clientId: varchar("clientId", { length: 64 })
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    serviceId: varchar("serviceId", { length: 64 })
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    specialistId: varchar("specialistId", { length: 64 })
      .notNull()
      .references(() => specialists.id, { onDelete: "cascade" }),
    appointmentDate: timestamp("appointmentDate").notNull(),
    appointmentTime: varchar("appointmentTime", { length: 10 }).notNull(), // HH:MM format
    status: appointmentStatusEnum("appointment_status").default("pending"),
    notes: text("notes"),
    isPublic: boolean("isPublic").default(false),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
  },
  table => ({
    salonIdIdx: index("appointments_salonId_idx").on(table.salonId),
    clientIdIdx: index("appointments_clientId_idx").on(table.clientId),
    serviceIdIdx: index("appointments_serviceId_idx").on(table.serviceId),
    specialistIdIdx: index("appointments_specialistId_idx").on(
      table.specialistId
    ),
    appointmentDateIdx: index("appointments_appointmentDate_idx").on(
      table.appointmentDate
    ),
  })
);

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

// Type for appointment with full relations
export type AppointmentWithDetails = Appointment & {
  client: Client;
  service: Service;
  specialist: Specialist;
};

/**
 * Password reset token table
 */
export const passwordResets = pgTable(
  "passwordResets",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: varchar("userId", { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expiresAt").notNull(),
    used: boolean("used").default(false),
    createdAt: timestamp("createdAt").defaultNow(),
  },
  table => ({
    userIdIdx: index("passwordResets_userId_idx").on(table.userId),
    tokenIdx: index("passwordResets_token_idx").on(table.token),
  })
);

export type PasswordReset = typeof passwordResets.$inferSelect;
export type InsertPasswordReset = typeof passwordResets.$inferInsert;

/**
 * Enums para transações financeiras
 */
export const transactionTypeEnum = pgEnum("transaction_type", [
  "income", // Receita (agendamento concluído)
  "expense", // Despesa
  "refund", // Estorno
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending", // Pendente
  "completed", // Concluída
  "cancelled", // Cancelada
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash", // Dinheiro
  "credit_card", // Cartão de crédito
  "debit_card", // Cartão de débito
  "pix", // PIX
  "bank_transfer", // Transferência bancária
  "other", // Outros
]);

/**
 * Tabela de transações financeiras
 */
export const transactions = pgTable(
  "transactions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    salonId: varchar("salonId", { length: 64 })
      .notNull()
      .references(() => salons.id, { onDelete: "cascade" }),

    // Referências opcionais
    appointmentId: varchar("appointmentId", { length: 64 }).references(
      () => appointments.id,
      { onDelete: "set null" }
    ),
    clientId: varchar("clientId", { length: 64 }).references(() => clients.id, {
      onDelete: "set null",
    }),
    serviceId: varchar("serviceId", { length: 64 }).references(
      () => services.id,
      { onDelete: "set null" }
    ),
    specialistId: varchar("specialistId", { length: 64 }).references(
      () => specialists.id,
      { onDelete: "set null" }
    ),

    // Dados da transação
    type: transactionTypeEnum("type").notNull(),
    status: transactionStatusEnum("status").default("completed").notNull(),
    paymentMethod: paymentMethodEnum("paymentMethod"),

    // Valores monetários
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Valor total
    serviceFee: decimal("serviceFee", { precision: 10, scale: 2 }), // Taxa do serviço
    specialistCommission: decimal("specialistCommission", {
      precision: 10,
      scale: 2,
    }), // Comissão do especialista

    // Descrições
    description: text("description").notNull(),
    notes: text("notes"), // Observações adicionais

    // Metadados
    transactionDate: timestamp("transactionDate").notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
  },
  table => ({
    salonIdIdx: index("transactions_salonId_idx").on(table.salonId),
    appointmentIdIdx: index("transactions_appointmentId_idx").on(
      table.appointmentId
    ),
    clientIdIdx: index("transactions_clientId_idx").on(table.clientId),
    typeIdx: index("transactions_type_idx").on(table.type),
    statusIdx: index("transactions_status_idx").on(table.status),
    dateIdx: index("transactions_date_idx").on(table.transactionDate),
  })
);

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// Nova tabela persistente para schedules dos especialistas
export const specialistSchedules = pgTable(
  "specialistSchedules",
  {
    specialistId: varchar("specialistId", { length: 64 }).primaryKey(),
    timeSlotDuration: integer("timeSlotDuration").default(30).notNull(),
    bufferTime: integer("bufferTime").default(0).notNull(),
    allowBookingDaysInAdvance: integer("allowBookingDaysInAdvance")
      .default(30)
      .notNull(),
    minimumNoticeHours: integer("minimumNoticeHours").default(2).notNull(),
    autoConfirmBookings: boolean("autoConfirmBookings").default(true).notNull(),
    allowOnlineBooking: boolean("allowOnlineBooking").default(true).notNull(),
    workingHours: jsonb("workingHours").$type<
      Array<{
        dayOfWeek: number;
        isWorking: boolean;
        startTime?: string | null;
        endTime?: string | null;
        breakStartTime?: string | null;
        breakEndTime?: string | null;
      }>
    >(),
    customUnavailableDates: jsonb("customUnavailableDates")
      .default([])
      .$type<string[]>(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
  },
  table => ({
    updatedAtIdx: index("specialistSchedules_updatedAt_idx").on(
      table.updatedAt
    ),
  })
);

export type SpecialistScheduleRow = typeof specialistSchedules.$inferSelect;
export type InsertSpecialistSchedule = typeof specialistSchedules.$inferInsert;
