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
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["user", "admin"]);

/**
 * Core user table for admin authentication
 * @description Tabela principal de usuários com autenticação e autorização
 */
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    // Associação opcional ao salão ao qual o usuário pertence
    salonId: varchar("salonId", { length: 64 }),
    email: varchar("email", { length: 320 }).notNull().unique(),
    password: text("password").notNull(),
    name: text("name").notNull(),
    role: roleEnum("role").default("user").notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
    lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }),
    photoUrl: text("photoUrl"),
    phone: varchar("phone", { length: 20 }),
    // Permissões granulares armazenadas como JSON (ex: { manage_clients: true })
    permissions: jsonb("permissions").$type<Record<string, boolean> | null>(),
    // Campo para soft delete (opcional)
    deletedAt: timestamp("deletedAt", { withTimezone: true }),
  },
  table => ({
    salonIdIdx: index("users_salonId_idx").on(table.salonId),
    emailIdx: index("users_email_idx").on(table.email),
    roleIdx: index("users_role_idx").on(table.role),
    deletedAtIdx: index("users_deletedAt_idx").on(table.deletedAt),
  })
);

// Definição dos relacionamentos
export const usersRelations = relations(users, ({ one, many }) => ({
  salon: one(salons, {
    fields: [users.salonId],
    references: [salons.id],
  }),
  passwordResets: many(passwordResets),
  auditLogs: many(auditLogs),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Salon data table
 * @description Tabela de dados do salão com informações da empresa
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
    // Chave PIX do salão (CPF, CNPJ, email, telefone ou aleatória)
    pixKey: text("pixKey"),
    // Removed workingHours - now using only specialist schedules
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
    deletedAt: timestamp("deletedAt", { withTimezone: true }),
  },
  table => ({
    userIdIdx: index("salons_userId_idx").on(table.userId),
    deletedAtIdx: index("salons_deletedAt_idx").on(table.deletedAt),
  })
);

export const salonsRelations = relations(salons, ({ one, many }) => ({
  owner: one(users, {
    fields: [salons.userId],
    references: [users.id],
  }),
  specialists: many(specialists),
  clients: many(clients),
  services: many(services),
  appointments: many(appointments),
  transactions: many(transactions),
  auditLogs: many(auditLogs),
}));

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
 * @description Tabela de especialistas/colaboradores do salão
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
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
    deletedAt: timestamp("deletedAt", { withTimezone: true }),
  },
  table => ({
    salonIdIdx: index("specialists_salonId_idx").on(table.salonId),
    statusIdx: index("specialists_status_idx").on(table.status),
    deletedAtIdx: index("specialists_deletedAt_idx").on(table.deletedAt),
  })
);

export const specialistsRelations = relations(specialists, ({ one, many }) => ({
  salon: one(salons, {
    fields: [specialists.salonId],
    references: [salons.id],
  }),
  services: many(services),
  appointments: many(appointments),
  transactions: many(transactions),
}));

export type Specialist = typeof specialists.$inferSelect;
export type InsertSpecialist = typeof specialists.$inferInsert;

/**
 * Client table
 * @description Tabela de clientes do salão
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
    // Foto do cliente (URL do Cloudinary)
    photo: text("photo"),
    // Pontos de fidelidade acumulados pelo cliente
    loyaltyPoints: integer("loyaltyPoints").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
  },
  table => ({
    salonIdIdx: index("clients_salonId_idx").on(table.salonId),
    emailIdx: index("clients_email_idx").on(table.email),
  })
);

export const clientsRelations = relations(clients, ({ one, many }) => ({
  salon: one(salons, {
    fields: [clients.salonId],
    references: [salons.id],
  }),
  appointments: many(appointments),
  transactions: many(transactions),
}));

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Service table
 * @description Tabela de serviços oferecidos pelo salão
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
    // Indica se o preço é um valor 'a partir de' (mínimo)
    priceFrom: boolean("priceFrom").default(false).notNull(),
    status: serviceStatusEnum("status").default("active"),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
    deletedAt: timestamp("deletedAt", { withTimezone: true }),
  },
  table => ({
    salonIdIdx: index("services_salonId_idx").on(table.salonId),
    specialistIdIdx: index("services_specialistId_idx").on(table.specialistId),
    statusIdx: index("services_status_idx").on(table.status),
    deletedAtIdx: index("services_deletedAt_idx").on(table.deletedAt),
  })
);

export const servicesRelations = relations(services, ({ one, many }) => ({
  salon: one(salons, {
    fields: [services.salonId],
    references: [salons.id],
  }),
  specialist: one(specialists, {
    fields: [services.specialistId],
    references: [specialists.id],
  }),
  appointments: many(appointments),
  transactions: many(transactions),
}));

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Appointment table
 * @description Tabela de agendamentos do salão
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
    appointmentDate: timestamp("appointmentDate", { withTimezone: true }).notNull(),
    appointmentTime: varchar("appointmentTime", { length: 10 }).notNull(), // HH:MM format
    status: appointmentStatusEnum("appointment_status").default("pending"),
    notes: text("notes"),
    isPublic: boolean("isPublic").default(false),
    // Valor efetivamente pago pelo cliente (opcional)
    paidAmount: decimal("paidAmount", { precision: 10, scale: 2 }),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
    deletedAt: timestamp("deletedAt", { withTimezone: true }),
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
    // Índices compostos: aceleram as queries mais comuns do sistema
    // (listagem por salão em período e busca de horários por especialista+data)
    salonDateIdx: index("appointments_salonId_date_idx").on(
      table.salonId,
      table.appointmentDate
    ),
    specialistDateIdx: index("appointments_specialistId_date_idx").on(
      table.specialistId,
      table.appointmentDate
    ),
  })
);

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  salon: one(salons, {
    fields: [appointments.salonId],
    references: [salons.id],
  }),
  client: one(clients, {
    fields: [appointments.clientId],
    references: [clients.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  specialist: one(specialists, {
    fields: [appointments.specialistId],
    references: [specialists.id],
  }),
  transaction: one(transactions),
}));

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
 * @description Tabela de tokens para recuperação de senha
 */
export const passwordResets = pgTable(
  "passwordResets",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: varchar("userId", { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    used: boolean("used").default(false),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  },
  table => ({
    userIdIdx: index("passwordResets_userId_idx").on(table.userId),
    tokenIdx: index("passwordResets_token_idx").on(table.token),
    expiresAtIdx: index("passwordResets_expiresAt_idx").on(table.expiresAt),
  })
);

export const passwordResetsRelations = relations(passwordResets, ({ one }) => ({
  user: one(users, {
    fields: [passwordResets.userId],
    references: [users.id],
  }),
}));

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
 * @description Tabela para controle financeiro do salão
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
    transactionDate: timestamp("transactionDate", { withTimezone: true }).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
    deletedAt: timestamp("deletedAt", { withTimezone: true }),
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
    // Índice composto: acelera as 6 queries de agregação do dashboard
    // (filtra por salonId + data ao mesmo tempo, sem varrer a tabela inteira)
    salonDateIdx: index("transactions_salonId_date_idx").on(
      table.salonId,
      table.transactionDate
    ),
  })
);

export const transactionsRelations = relations(transactions, ({ one }) => ({
  salon: one(salons, {
    fields: [transactions.salonId],
    references: [salons.id],
  }),
  appointment: one(appointments, {
    fields: [transactions.appointmentId],
    references: [appointments.id],
  }),
  client: one(clients, {
    fields: [transactions.clientId],
    references: [clients.id],
  }),
  service: one(services, {
    fields: [transactions.serviceId],
    references: [services.id],
  }),
  specialist: one(specialists, {
    fields: [transactions.specialistId],
    references: [specialists.id],
  }),
}));

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
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
  },
  table => ({
    updatedAtIdx: index("specialistSchedules_updatedAt_idx").on(
      table.updatedAt
    ),
  })
);

export const specialistSchedulesRelations = relations(specialistSchedules, ({ one }) => ({
  specialist: one(specialists, {
    fields: [specialistSchedules.specialistId],
    references: [specialists.id],
  }),
}));

export type SpecialistScheduleRow = typeof specialistSchedules.$inferSelect;
export type InsertSpecialistSchedule = typeof specialistSchedules.$inferInsert;

// Nova tabela de audit logs para trilha de auditoria
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: varchar("userId", { length: 64 }), // pode ser null para ações do sistema
    // Associação opcional ao salão para filtragem eficiente
    salonId: varchar("salonId", { length: 64 }),
    action: varchar("action", { length: 64 }).notNull(), // create, update, delete, login, etc
    entity: varchar("entity", { length: 128 }).notNull(), // users, services, appointments...
    entityId: varchar("entityId", { length: 128 }),
    before: jsonb("before").$type<object | null>(),
    after: jsonb("after").$type<object | null>(),
    metadata: jsonb("metadata").$type<object | null>(), // ip, userAgent, reason...
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  },
  table => ({
    userIdIdx: index("audit_logs_userId_idx").on(table.userId),
    entityIdx: index("audit_logs_entity_idx").on(table.entity, table.entityId),
    salonIdIdx: index("audit_logs_salonId_idx").on(table.salonId),
    createdAtIdx: index("audit_logs_createdAt_idx").on(table.createdAt),
    actionIdx: index("audit_logs_action_idx").on(table.action),
  })
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  salon: one(salons, {
    fields: [auditLogs.salonId],
    references: [salons.id],
  }),
}));

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Tabela de produtos do salão (estoque e venda)
 */
export const products = pgTable(
  "products",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    salonId: varchar("salonId", { length: 64 })
      .notNull()
      .references(() => salons.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    stock: integer("stock").default(0).notNull(),
    // Quantidade mínima antes de acionar alerta de estoque baixo
    minStock: integer("minStock").default(5).notNull(),
    costPrice: decimal("costPrice", { precision: 10, scale: 2 }),
    sellPrice: decimal("sellPrice", { precision: 10, scale: 2 }),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
  },
  table => ({
    salonIdIdx: index("products_salonId_idx").on(table.salonId),
  })
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Produtos vendidos em um atendimento (linha de item do checkout)
 */
export const appointmentProducts = pgTable(
  "appointment_products",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    appointmentId: varchar("appointmentId", { length: 64 })
      .notNull()
      .references(() => appointments.id, { onDelete: "cascade" }),
    productId: varchar("productId", { length: 64 })
      .notNull()
      .references(() => products.id),
    salonId: varchar("salonId", { length: 64 })
      .notNull()
      .references(() => salons.id, { onDelete: "cascade" }),
    // Quantidade vendida
    quantity: integer("quantity").default(1).notNull(),
    // Preço unitário no momento da venda (snapshot)
    unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
  },
  table => ({
    appointmentIdIdx: index("apt_products_appointmentId_idx").on(
      table.appointmentId
    ),
    salonIdIdx: index("apt_products_salonId_idx").on(table.salonId),
  })
);

export type AppointmentProduct = typeof appointmentProducts.$inferSelect;
export type InsertAppointmentProduct = typeof appointmentProducts.$inferInsert;

/**
 * Avaliações pós-atendimento
 * Um token único é gerado ao concluir o atendimento.
 * O cliente acessa /avaliar?token=xxx e submete 1–5 estrelas + comentário.
 */
export const ratings = pgTable(
  "ratings",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    salonId: varchar("salonId", { length: 64 })
      .notNull()
      .references(() => salons.id, { onDelete: "cascade" }),
    specialistId: varchar("specialistId", { length: 64 })
      .notNull()
      .references(() => specialists.id, { onDelete: "cascade" }),
    appointmentId: varchar("appointmentId", { length: 64 })
      .notNull()
      .references(() => appointments.id, { onDelete: "cascade" }),
    // Token único enviado ao cliente (UUID v4)
    token: varchar("token", { length: 128 }).notNull().unique(),
    // true após o cliente enviar a avaliação
    used: boolean("used").notNull().default(false),
    // Estrelas de 1 a 5 (null enquanto não avaliado)
    stars: integer("stars"),
    // Comentário opcional do cliente
    comment: text("comment"),
    // Nome do cliente no momento do atendimento (snapshot)
    clientName: text("clientName"),
    createdAt: timestamp("createdAt").defaultNow(),
    submittedAt: timestamp("submittedAt"),
  },
  table => ({
    salonIdIdx: index("ratings_salonId_idx").on(table.salonId),
    specialistIdIdx: index("ratings_specialistId_idx").on(table.specialistId),
    tokenIdx: index("ratings_token_idx").on(table.token),
  })
);

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;
