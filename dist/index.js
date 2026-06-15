var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  appointmentProducts: () => appointmentProducts,
  appointmentStatusEnum: () => appointmentStatusEnum,
  appointments: () => appointments,
  appointmentsRelations: () => appointmentsRelations,
  auditLogs: () => auditLogs,
  auditLogsRelations: () => auditLogsRelations,
  clients: () => clients,
  clientsRelations: () => clientsRelations,
  passwordResets: () => passwordResets,
  passwordResetsRelations: () => passwordResetsRelations,
  paymentMethodEnum: () => paymentMethodEnum,
  products: () => products,
  ratings: () => ratings,
  roleEnum: () => roleEnum,
  salons: () => salons,
  salonsRelations: () => salonsRelations,
  serviceStatusEnum: () => serviceStatusEnum,
  services: () => services,
  servicesRelations: () => servicesRelations,
  specialistSchedules: () => specialistSchedules,
  specialistSchedulesRelations: () => specialistSchedulesRelations,
  specialistStatusEnum: () => specialistStatusEnum,
  specialists: () => specialists,
  specialistsRelations: () => specialistsRelations,
  transactionStatusEnum: () => transactionStatusEnum,
  transactionTypeEnum: () => transactionTypeEnum,
  transactions: () => transactions,
  transactionsRelations: () => transactionsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
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
  index
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
var roleEnum, users, usersRelations, salons, salonsRelations, specialistStatusEnum, serviceStatusEnum, specialists, specialistsRelations, clients, clientsRelations, services, servicesRelations, appointmentStatusEnum, appointments, appointmentsRelations, passwordResets, passwordResetsRelations, transactionTypeEnum, transactionStatusEnum, paymentMethodEnum, transactions, transactionsRelations, specialistSchedules, specialistSchedulesRelations, auditLogs, auditLogsRelations, products, appointmentProducts, ratings;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    roleEnum = pgEnum("role", ["user", "admin"]);
    users = pgTable(
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
        permissions: jsonb("permissions").$type(),
        // Campo para soft delete (opcional)
        deletedAt: timestamp("deletedAt", { withTimezone: true })
      },
      (table) => ({
        salonIdIdx: index("users_salonId_idx").on(table.salonId),
        emailIdx: index("users_email_idx").on(table.email),
        roleIdx: index("users_role_idx").on(table.role),
        deletedAtIdx: index("users_deletedAt_idx").on(table.deletedAt)
      })
    );
    usersRelations = relations(users, ({ one, many }) => ({
      salon: one(salons, {
        fields: [users.salonId],
        references: [salons.id]
      }),
      passwordResets: many(passwordResets),
      auditLogs: many(auditLogs)
    }));
    salons = pgTable(
      "salons",
      {
        id: varchar("id", { length: 64 }).primaryKey(),
        userId: varchar("userId", { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
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
        deletedAt: timestamp("deletedAt", { withTimezone: true })
      },
      (table) => ({
        userIdIdx: index("salons_userId_idx").on(table.userId),
        deletedAtIdx: index("salons_deletedAt_idx").on(table.deletedAt)
      })
    );
    salonsRelations = relations(salons, ({ one, many }) => ({
      owner: one(users, {
        fields: [salons.userId],
        references: [users.id]
      }),
      specialists: many(specialists),
      clients: many(clients),
      services: many(services),
      appointments: many(appointments),
      transactions: many(transactions),
      auditLogs: many(auditLogs)
    }));
    specialistStatusEnum = pgEnum("specialist_status", [
      "active",
      "inactive"
    ]);
    serviceStatusEnum = pgEnum("service_status", [
      "active",
      "inactive"
    ]);
    specialists = pgTable(
      "specialists",
      {
        id: varchar("id", { length: 64 }).primaryKey(),
        salonId: varchar("salonId", { length: 64 }).notNull().references(() => salons.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        specialty: varchar("specialty", { length: 255 }),
        photo: text("photo"),
        email: varchar("email", { length: 320 }),
        phone: varchar("phone", { length: 20 }),
        bio: text("bio"),
        workingDays: jsonb("workingDays").$type(),
        status: specialistStatusEnum("status").default("active"),
        createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
        updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
        deletedAt: timestamp("deletedAt", { withTimezone: true })
      },
      (table) => ({
        salonIdIdx: index("specialists_salonId_idx").on(table.salonId),
        statusIdx: index("specialists_status_idx").on(table.status),
        deletedAtIdx: index("specialists_deletedAt_idx").on(table.deletedAt)
      })
    );
    specialistsRelations = relations(specialists, ({ one, many }) => ({
      salon: one(salons, {
        fields: [specialists.salonId],
        references: [salons.id]
      }),
      services: many(services),
      appointments: many(appointments),
      transactions: many(transactions)
    }));
    clients = pgTable(
      "clients",
      {
        id: varchar("id", { length: 64 }).primaryKey(),
        salonId: varchar("salonId", { length: 64 }).notNull().references(() => salons.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        email: varchar("email", { length: 320 }),
        phone: varchar("phone", { length: 20 }),
        notes: text("notes"),
        // Foto do cliente (URL do Cloudinary)
        photo: text("photo"),
        // Pontos de fidelidade acumulados pelo cliente
        loyaltyPoints: integer("loyaltyPoints").default(0).notNull(),
        createdAt: timestamp("createdAt").defaultNow(),
        updatedAt: timestamp("updatedAt").defaultNow()
      },
      (table) => ({
        salonIdIdx: index("clients_salonId_idx").on(table.salonId),
        emailIdx: index("clients_email_idx").on(table.email)
      })
    );
    clientsRelations = relations(clients, ({ one, many }) => ({
      salon: one(salons, {
        fields: [clients.salonId],
        references: [salons.id]
      }),
      appointments: many(appointments),
      transactions: many(transactions)
    }));
    services = pgTable(
      "services",
      {
        id: varchar("id", { length: 64 }).primaryKey(),
        salonId: varchar("salonId", { length: 64 }).notNull().references(() => salons.id, { onDelete: "cascade" }),
        specialistId: varchar("specialistId", { length: 64 }).references(
          () => specialists.id,
          { onDelete: "set null" }
        ),
        name: text("name").notNull(),
        description: text("description"),
        duration: integer("duration").notNull(),
        // in minutes
        price: decimal("price", { precision: 10, scale: 2 }).notNull(),
        // Indica se o preço é um valor 'a partir de' (mínimo)
        priceFrom: boolean("priceFrom").default(false).notNull(),
        status: serviceStatusEnum("status").default("active"),
        createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
        updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
        deletedAt: timestamp("deletedAt", { withTimezone: true })
      },
      (table) => ({
        salonIdIdx: index("services_salonId_idx").on(table.salonId),
        specialistIdIdx: index("services_specialistId_idx").on(table.specialistId),
        statusIdx: index("services_status_idx").on(table.status),
        deletedAtIdx: index("services_deletedAt_idx").on(table.deletedAt)
      })
    );
    servicesRelations = relations(services, ({ one, many }) => ({
      salon: one(salons, {
        fields: [services.salonId],
        references: [salons.id]
      }),
      specialist: one(specialists, {
        fields: [services.specialistId],
        references: [specialists.id]
      }),
      appointments: many(appointments),
      transactions: many(transactions)
    }));
    appointmentStatusEnum = pgEnum("appointment_status", [
      "pending",
      "confirmed",
      "completed",
      "cancelled"
    ]);
    appointments = pgTable(
      "appointments",
      {
        id: varchar("id", { length: 64 }).primaryKey(),
        salonId: varchar("salonId", { length: 64 }).notNull().references(() => salons.id, { onDelete: "cascade" }),
        clientId: varchar("clientId", { length: 64 }).notNull().references(() => clients.id, { onDelete: "cascade" }),
        serviceId: varchar("serviceId", { length: 64 }).notNull().references(() => services.id, { onDelete: "cascade" }),
        specialistId: varchar("specialistId", { length: 64 }).notNull().references(() => specialists.id, { onDelete: "cascade" }),
        appointmentDate: timestamp("appointmentDate", { withTimezone: true }).notNull(),
        appointmentTime: varchar("appointmentTime", { length: 10 }).notNull(),
        // HH:MM format
        status: appointmentStatusEnum("appointment_status").default("pending"),
        notes: text("notes"),
        isPublic: boolean("isPublic").default(false),
        // Valor efetivamente pago pelo cliente (opcional)
        paidAmount: decimal("paidAmount", { precision: 10, scale: 2 }),
        createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
        updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
        deletedAt: timestamp("deletedAt", { withTimezone: true })
      },
      (table) => ({
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
        )
      })
    );
    appointmentsRelations = relations(appointments, ({ one }) => ({
      salon: one(salons, {
        fields: [appointments.salonId],
        references: [salons.id]
      }),
      client: one(clients, {
        fields: [appointments.clientId],
        references: [clients.id]
      }),
      service: one(services, {
        fields: [appointments.serviceId],
        references: [services.id]
      }),
      specialist: one(specialists, {
        fields: [appointments.specialistId],
        references: [specialists.id]
      }),
      transaction: one(transactions)
    }));
    passwordResets = pgTable(
      "passwordResets",
      {
        id: varchar("id", { length: 64 }).primaryKey(),
        userId: varchar("userId", { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
        token: varchar("token", { length: 255 }).notNull().unique(),
        expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
        used: boolean("used").default(false),
        createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow()
      },
      (table) => ({
        userIdIdx: index("passwordResets_userId_idx").on(table.userId),
        tokenIdx: index("passwordResets_token_idx").on(table.token),
        expiresAtIdx: index("passwordResets_expiresAt_idx").on(table.expiresAt)
      })
    );
    passwordResetsRelations = relations(passwordResets, ({ one }) => ({
      user: one(users, {
        fields: [passwordResets.userId],
        references: [users.id]
      })
    }));
    transactionTypeEnum = pgEnum("transaction_type", [
      "income",
      // Receita (agendamento concluído)
      "expense",
      // Despesa
      "refund"
      // Estorno
    ]);
    transactionStatusEnum = pgEnum("transaction_status", [
      "pending",
      // Pendente
      "completed",
      // Concluída
      "cancelled"
      // Cancelada
    ]);
    paymentMethodEnum = pgEnum("payment_method", [
      "cash",
      // Dinheiro
      "credit_card",
      // Cartão de crédito
      "debit_card",
      // Cartão de débito
      "pix",
      // PIX
      "bank_transfer",
      // Transferência bancária
      "other"
      // Outros
    ]);
    transactions = pgTable(
      "transactions",
      {
        id: varchar("id", { length: 64 }).primaryKey(),
        salonId: varchar("salonId", { length: 64 }).notNull().references(() => salons.id, { onDelete: "cascade" }),
        // Referências opcionais
        appointmentId: varchar("appointmentId", { length: 64 }).references(
          () => appointments.id,
          { onDelete: "set null" }
        ),
        clientId: varchar("clientId", { length: 64 }).references(() => clients.id, {
          onDelete: "set null"
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
        amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
        // Valor total
        serviceFee: decimal("serviceFee", { precision: 10, scale: 2 }),
        // Taxa do serviço
        specialistCommission: decimal("specialistCommission", {
          precision: 10,
          scale: 2
        }),
        // Comissão do especialista
        // Descrições
        description: text("description").notNull(),
        notes: text("notes"),
        // Observações adicionais
        // Metadados
        transactionDate: timestamp("transactionDate", { withTimezone: true }).notNull(),
        createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
        updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
        deletedAt: timestamp("deletedAt", { withTimezone: true })
      },
      (table) => ({
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
        )
      })
    );
    transactionsRelations = relations(transactions, ({ one }) => ({
      salon: one(salons, {
        fields: [transactions.salonId],
        references: [salons.id]
      }),
      appointment: one(appointments, {
        fields: [transactions.appointmentId],
        references: [appointments.id]
      }),
      client: one(clients, {
        fields: [transactions.clientId],
        references: [clients.id]
      }),
      service: one(services, {
        fields: [transactions.serviceId],
        references: [services.id]
      }),
      specialist: one(specialists, {
        fields: [transactions.specialistId],
        references: [specialists.id]
      })
    }));
    specialistSchedules = pgTable(
      "specialistSchedules",
      {
        specialistId: varchar("specialistId", { length: 64 }).primaryKey(),
        timeSlotDuration: integer("timeSlotDuration").default(30).notNull(),
        bufferTime: integer("bufferTime").default(0).notNull(),
        allowBookingDaysInAdvance: integer("allowBookingDaysInAdvance").default(30).notNull(),
        minimumNoticeHours: integer("minimumNoticeHours").default(2).notNull(),
        autoConfirmBookings: boolean("autoConfirmBookings").default(true).notNull(),
        allowOnlineBooking: boolean("allowOnlineBooking").default(true).notNull(),
        workingHours: jsonb("workingHours").$type(),
        customUnavailableDates: jsonb("customUnavailableDates").default([]).$type(),
        createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
        updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow()
      },
      (table) => ({
        updatedAtIdx: index("specialistSchedules_updatedAt_idx").on(
          table.updatedAt
        )
      })
    );
    specialistSchedulesRelations = relations(specialistSchedules, ({ one }) => ({
      specialist: one(specialists, {
        fields: [specialistSchedules.specialistId],
        references: [specialists.id]
      })
    }));
    auditLogs = pgTable(
      "audit_logs",
      {
        id: varchar("id", { length: 64 }).primaryKey(),
        userId: varchar("userId", { length: 64 }),
        // pode ser null para ações do sistema
        // Associação opcional ao salão para filtragem eficiente
        salonId: varchar("salonId", { length: 64 }),
        action: varchar("action", { length: 64 }).notNull(),
        // create, update, delete, login, etc
        entity: varchar("entity", { length: 128 }).notNull(),
        // users, services, appointments...
        entityId: varchar("entityId", { length: 128 }),
        before: jsonb("before").$type(),
        after: jsonb("after").$type(),
        metadata: jsonb("metadata").$type(),
        // ip, userAgent, reason...
        createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull()
      },
      (table) => ({
        userIdIdx: index("audit_logs_userId_idx").on(table.userId),
        entityIdx: index("audit_logs_entity_idx").on(table.entity, table.entityId),
        salonIdIdx: index("audit_logs_salonId_idx").on(table.salonId),
        createdAtIdx: index("audit_logs_createdAt_idx").on(table.createdAt),
        actionIdx: index("audit_logs_action_idx").on(table.action)
      })
    );
    auditLogsRelations = relations(auditLogs, ({ one }) => ({
      user: one(users, {
        fields: [auditLogs.userId],
        references: [users.id]
      }),
      salon: one(salons, {
        fields: [auditLogs.salonId],
        references: [salons.id]
      })
    }));
    products = pgTable(
      "products",
      {
        id: varchar("id", { length: 64 }).primaryKey(),
        salonId: varchar("salonId", { length: 64 }).notNull().references(() => salons.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        description: text("description"),
        stock: integer("stock").default(0).notNull(),
        // Quantidade mínima antes de acionar alerta de estoque baixo
        minStock: integer("minStock").default(5).notNull(),
        costPrice: decimal("costPrice", { precision: 10, scale: 2 }),
        sellPrice: decimal("sellPrice", { precision: 10, scale: 2 }),
        createdAt: timestamp("createdAt").defaultNow(),
        updatedAt: timestamp("updatedAt").defaultNow()
      },
      (table) => ({
        salonIdIdx: index("products_salonId_idx").on(table.salonId)
      })
    );
    appointmentProducts = pgTable(
      "appointment_products",
      {
        id: varchar("id", { length: 64 }).primaryKey(),
        appointmentId: varchar("appointmentId", { length: 64 }).notNull().references(() => appointments.id, { onDelete: "cascade" }),
        productId: varchar("productId", { length: 64 }).notNull().references(() => products.id),
        salonId: varchar("salonId", { length: 64 }).notNull().references(() => salons.id, { onDelete: "cascade" }),
        // Quantidade vendida
        quantity: integer("quantity").default(1).notNull(),
        // Preço unitário no momento da venda (snapshot)
        unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
        createdAt: timestamp("createdAt").defaultNow()
      },
      (table) => ({
        appointmentIdIdx: index("apt_products_appointmentId_idx").on(
          table.appointmentId
        ),
        salonIdIdx: index("apt_products_salonId_idx").on(table.salonId)
      })
    );
    ratings = pgTable(
      "ratings",
      {
        id: varchar("id", { length: 64 }).primaryKey(),
        salonId: varchar("salonId", { length: 64 }).notNull().references(() => salons.id, { onDelete: "cascade" }),
        specialistId: varchar("specialistId", { length: 64 }).notNull().references(() => specialists.id, { onDelete: "cascade" }),
        appointmentId: varchar("appointmentId", { length: 64 }).notNull().references(() => appointments.id, { onDelete: "cascade" }),
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
        submittedAt: timestamp("submittedAt")
      },
      (table) => ({
        salonIdIdx: index("ratings_salonId_idx").on(table.salonId),
        specialistIdIdx: index("ratings_specialistId_idx").on(table.specialistId),
        tokenIdx: index("ratings_token_idx").on(table.token)
      })
    );
  }
});

// drizzle/relations.ts
var relations_exports = {};
__export(relations_exports, {
  appointmentsRelations: () => appointmentsRelations2,
  clientsRelations: () => clientsRelations2,
  salonsRelations: () => salonsRelations2,
  servicesRelations: () => servicesRelations2,
  specialistsRelations: () => specialistsRelations2,
  usersRelations: () => usersRelations2
});
import { relations as relations2 } from "drizzle-orm";
var usersRelations2, salonsRelations2, specialistsRelations2, clientsRelations2, servicesRelations2, appointmentsRelations2;
var init_relations = __esm({
  "drizzle/relations.ts"() {
    "use strict";
    init_schema();
    usersRelations2 = relations2(users, ({ one }) => ({
      salon: one(salons, {
        fields: [users.id],
        references: [salons.userId]
      })
    }));
    salonsRelations2 = relations2(salons, ({ one, many }) => ({
      user: one(users, {
        fields: [salons.userId],
        references: [users.id]
      }),
      specialists: many(specialists),
      clients: many(clients),
      services: many(services),
      appointments: many(appointments)
    }));
    specialistsRelations2 = relations2(specialists, ({ one, many }) => ({
      salon: one(salons, {
        fields: [specialists.salonId],
        references: [salons.id]
      }),
      services: many(services),
      appointments: many(appointments)
    }));
    clientsRelations2 = relations2(clients, ({ one, many }) => ({
      salon: one(salons, {
        fields: [clients.salonId],
        references: [salons.id]
      }),
      appointments: many(appointments)
    }));
    servicesRelations2 = relations2(services, ({ one, many }) => ({
      salon: one(salons, {
        fields: [services.salonId],
        references: [salons.id]
      }),
      specialist: one(specialists, {
        fields: [services.specialistId],
        references: [specialists.id]
      }),
      appointments: many(appointments)
    }));
    appointmentsRelations2 = relations2(appointments, ({ one }) => ({
      salon: one(salons, {
        fields: [appointments.salonId],
        references: [salons.id]
      }),
      client: one(clients, {
        fields: [appointments.clientId],
        references: [clients.id]
      }),
      service: one(services, {
        fields: [appointments.serviceId],
        references: [services.id]
      }),
      specialist: one(specialists, {
        fields: [appointments.specialistId],
        references: [specialists.id]
      })
    }));
  }
});

// server/_core/env.ts
function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Vari\xE1vel de ambiente obrigat\xF3ria n\xE3o definida: ${key}`);
  }
  return value;
}
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = Object.freeze({
      appId: process.env.VITE_APP_ID ?? "",
      // Obrigatório: usado para assinar JWT / cookies de sessão
      cookieSecret: requireEnv("JWT_SECRET"),
      // Obrigatório: string de conexão com o banco
      databaseUrl: requireEnv("DATABASE_URL"),
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: true,
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
      // Cloudinary (opcional se não usar upload de imagens)
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
      cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? "",
      cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? ""
    });
  }
});

// server/specialist-schedule.ts
var specialist_schedule_exports = {};
__export(specialist_schedule_exports, {
  addCustomUnavailableDate: () => addCustomUnavailableDate,
  createSpecialistSchedule: () => createSpecialistSchedule,
  generateSpecialistTimeSlots: () => generateSpecialistTimeSlots,
  getDayName: () => getDayName,
  getSpecialistSchedule: () => getSpecialistSchedule,
  getSpecialistScheduleForDisplay: () => getSpecialistScheduleForDisplay,
  initializeExistingSpecialists: () => initializeExistingSpecialists,
  isSpecialistWorking: () => isSpecialistWorking,
  removeCustomUnavailableDate: () => removeCustomUnavailableDate,
  updateSpecialistSchedule: () => updateSpecialistSchedule,
  updateWorkingHoursForDay: () => updateWorkingHoursForDay
});
import { eq } from "drizzle-orm";
function getDefaultSchedule() {
  return JSON.parse(
    JSON.stringify({
      workingHours: [
        { dayOfWeek: 0, isWorking: false },
        // Domingo
        {
          dayOfWeek: 1,
          isWorking: true,
          startTime: "09:00",
          endTime: "18:00",
          breakStartTime: "12:00",
          breakEndTime: "13:00"
        },
        // Segunda
        {
          dayOfWeek: 2,
          isWorking: true,
          startTime: "09:00",
          endTime: "18:00",
          breakStartTime: "12:00",
          breakEndTime: "13:00"
        },
        // Terça
        {
          dayOfWeek: 3,
          isWorking: true,
          startTime: "09:00",
          endTime: "18:00",
          breakStartTime: "12:00",
          breakEndTime: "13:00"
        },
        // Quarta
        {
          dayOfWeek: 4,
          isWorking: true,
          startTime: "09:00",
          endTime: "18:00",
          breakStartTime: "12:00",
          breakEndTime: "13:00"
        },
        // Quinta
        {
          dayOfWeek: 5,
          isWorking: true,
          startTime: "09:00",
          endTime: "18:00",
          breakStartTime: "12:00",
          breakEndTime: "13:00"
        },
        // Sexta
        { dayOfWeek: 6, isWorking: true, startTime: "09:00", endTime: "16:00" }
        // Sábado - sem pausa
      ],
      timeSlotDuration: 30,
      bufferTime: 15,
      allowBookingDaysInAdvance: 30,
      minimumNoticeHours: 2,
      autoConfirmBookings: true,
      allowOnlineBooking: true,
      customUnavailableDates: []
    })
  );
}
function rowToSchedule(specialistId, row) {
  const defaultSched = getDefaultSchedule();
  if (!row) {
    return { specialistId, ...defaultSched };
  }
  const customUnavailableDates = Array.isArray(
    row.customUnavailableDates
  ) ? row.customUnavailableDates.map((d) => new Date(d)) : [];
  const workingHours = Array.isArray(row.workingHours) ? JSON.parse(JSON.stringify(row.workingHours)) : JSON.parse(JSON.stringify(defaultSched.workingHours));
  return {
    specialistId,
    workingHours,
    timeSlotDuration: row.timeSlotDuration ?? defaultSched.timeSlotDuration,
    bufferTime: row.bufferTime ?? defaultSched.bufferTime,
    allowBookingDaysInAdvance: row.allowBookingDaysInAdvance ?? defaultSched.allowBookingDaysInAdvance,
    minimumNoticeHours: row.minimumNoticeHours ?? defaultSched.minimumNoticeHours,
    autoConfirmBookings: row.autoConfirmBookings ?? defaultSched.autoConfirmBookings,
    allowOnlineBooking: row.allowOnlineBooking ?? defaultSched.allowOnlineBooking,
    customUnavailableDates
  };
}
async function getSpecialistSchedule(specialistId) {
  const db = await getDb();
  if (!db) {
    return { specialistId, ...getDefaultSchedule() };
  }
  const row = await db.select().from(specialistSchedules).where(eq(specialistSchedules.specialistId, specialistId)).then((r) => r[0] || null);
  if (row) return rowToSchedule(specialistId, row);
  const legacy = await db.select({ workingDays: specialists.workingDays }).from(specialists).where(eq(specialists.id, specialistId)).then((r) => r[0]);
  if (legacy?.workingDays) {
    const dayMapping = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };
    const workingHoursArr = Object.entries(
      legacy.workingDays
    ).flatMap(([dayName, periods]) => {
      const dayOfWeek = dayMapping[dayName];
      if (dayOfWeek === void 0) return [];
      const arr = Array.isArray(periods) ? periods : [periods];
      return arr.map(
        (p) => ({
          dayOfWeek,
          isWorking: true,
          startTime: p.start,
          endTime: p.end,
          breakStartTime: p.lunch?.start ?? void 0,
          breakEndTime: p.lunch?.end ?? void 0
        })
      );
    });
    await db.insert(specialistSchedules).values({
      specialistId,
      workingHours: workingHoursArr,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    const inserted = await db.select().from(specialistSchedules).where(eq(specialistSchedules.specialistId, specialistId)).then((r) => r[0] || null);
    return rowToSchedule(specialistId, inserted);
  }
  return { specialistId, ...getDefaultSchedule() };
}
async function createSpecialistSchedule(specialistId, schedule) {
  const db = await getDb();
  if (!db) {
    return { specialistId, ...getDefaultSchedule() };
  }
  const existing = await db.select().from(specialistSchedules).where(eq(specialistSchedules.specialistId, specialistId)).then((r) => r[0] || null);
  if (existing) {
    return rowToSchedule(specialistId, existing);
  }
  const defaultSched = getDefaultSchedule();
  const createValues = {
    specialistId,
    timeSlotDuration: schedule?.timeSlotDuration ?? defaultSched.timeSlotDuration,
    bufferTime: schedule?.bufferTime ?? defaultSched.bufferTime,
    allowBookingDaysInAdvance: schedule?.allowBookingDaysInAdvance ?? defaultSched.allowBookingDaysInAdvance,
    minimumNoticeHours: schedule?.minimumNoticeHours ?? defaultSched.minimumNoticeHours,
    autoConfirmBookings: schedule?.autoConfirmBookings ?? defaultSched.autoConfirmBookings,
    allowOnlineBooking: schedule?.allowOnlineBooking ?? defaultSched.allowOnlineBooking,
    // Se workingHours foi fornecido, usar; caso contrário, criar array vazio (sem horários padrão)
    workingHours: schedule?.workingHours ? schedule.workingHours.map((wh) => ({ ...wh })) : Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      isWorking: false,
      startTime: void 0,
      endTime: void 0,
      breakStartTime: void 0,
      breakEndTime: void 0
    })),
    customUnavailableDates: schedule?.customUnavailableDates ? schedule.customUnavailableDates.map(
      (d) => d instanceof Date ? d.toISOString() : d
    ) : [],
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  };
  await db.insert(specialistSchedules).values(createValues);
  const row = await db.select().from(specialistSchedules).where(eq(specialistSchedules.specialistId, specialistId)).then((r) => r[0] || null);
  return rowToSchedule(specialistId, row);
}
async function updateSpecialistSchedule(specialistId, updates) {
  const db = await getDb();
  if (!db)
    return { specialistId, ...getDefaultSchedule() };
  const existing = await db.select().from(specialistSchedules).where(eq(specialistSchedules.specialistId, specialistId)).then((r) => r[0] || null);
  if (!existing) {
    const createValues = {
      specialistId,
      timeSlotDuration: updates.timeSlotDuration ?? getDefaultSchedule().timeSlotDuration,
      bufferTime: updates.bufferTime ?? getDefaultSchedule().bufferTime,
      allowBookingDaysInAdvance: updates.allowBookingDaysInAdvance ?? getDefaultSchedule().allowBookingDaysInAdvance,
      minimumNoticeHours: updates.minimumNoticeHours ?? getDefaultSchedule().minimumNoticeHours,
      autoConfirmBookings: updates.autoConfirmBookings ?? getDefaultSchedule().autoConfirmBookings,
      allowOnlineBooking: updates.allowOnlineBooking ?? getDefaultSchedule().allowOnlineBooking,
      workingHours: updates.workingHours ?? getDefaultSchedule().workingHours,
      customUnavailableDates: (updates.customUnavailableDates ?? []).map(
        (d) => d instanceof Date ? d.toISOString() : d
      ),
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    await db.insert(specialistSchedules).values(createValues);
    const row = await db.select().from(specialistSchedules).where(eq(specialistSchedules.specialistId, specialistId)).then((r) => r[0] || null);
    return rowToSchedule(specialistId, row);
  }
  const defaultSched = getDefaultSchedule();
  const mergedWorkingHours = updates.workingHours ? updates.workingHours.map((wh) => ({ ...wh })) : Array.isArray(existing.workingHours) ? existing.workingHours.map((wh) => ({ ...wh })) : defaultSched.workingHours.map((wh) => ({ ...wh }));
  const mergedCustomDates = updates.customUnavailableDates ? updates.customUnavailableDates.map(
    (d) => d instanceof Date ? d.toISOString() : d
  ) : Array.isArray(existing.customUnavailableDates) ? existing.customUnavailableDates.slice() : [];
  const mergedRecord = {
    ...existing,
    ...updates,
    workingHours: mergedWorkingHours,
    customUnavailableDates: mergedCustomDates,
    updatedAt: /* @__PURE__ */ new Date()
  };
  await db.update(specialistSchedules).set(mergedRecord).where(eq(specialistSchedules.specialistId, specialistId));
  const updatedRow = await db.select().from(specialistSchedules).where(eq(specialistSchedules.specialistId, specialistId)).then((r) => r[0] || null);
  return rowToSchedule(specialistId, updatedRow);
}
async function addCustomUnavailableDate(specialistId, date) {
  const schedule = await getSpecialistSchedule(specialistId);
  const db = await getDb();
  if (!db) return;
  const exists = schedule.customUnavailableDates.some(
    (d) => d.toDateString() === date.toDateString()
  );
  if (!exists) {
    const newDates = [
      ...schedule.customUnavailableDates.map((d) => d.toISOString()),
      date.toISOString()
    ];
    await db.update(specialistSchedules).set({ customUnavailableDates: newDates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(specialistSchedules.specialistId, specialistId));
  }
}
async function removeCustomUnavailableDate(specialistId, date) {
  const schedule = await getSpecialistSchedule(specialistId);
  const db = await getDb();
  if (!db) return;
  const newDates = schedule.customUnavailableDates.filter((d) => d.toDateString() !== date.toDateString()).map((d) => d.toISOString());
  await db.update(specialistSchedules).set({ customUnavailableDates: newDates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(specialistSchedules.specialistId, specialistId));
}
async function updateWorkingHoursForDay(specialistId, dayOfWeek, workingHours) {
  const schedule = await getSpecialistSchedule(specialistId);
  const db = await getDb();
  if (!db) return;
  const existing = Array.isArray(schedule.workingHours) ? schedule.workingHours.map((wh) => ({ ...wh })) : [];
  const idx = existing.findIndex((wh) => wh.dayOfWeek === dayOfWeek);
  let newWorkingHours;
  if (idx !== -1) {
    newWorkingHours = existing.map(
      (wh) => wh.dayOfWeek === dayOfWeek ? { dayOfWeek, ...workingHours } : wh
    );
  } else {
    newWorkingHours = [...existing, { dayOfWeek, ...workingHours }];
  }
  await db.update(specialistSchedules).set({ workingHours: newWorkingHours, updatedAt: /* @__PURE__ */ new Date() }).where(eq(specialistSchedules.specialistId, specialistId));
}
async function isSpecialistWorking(specialistId, date) {
  const schedule = await getSpecialistSchedule(specialistId);
  const dayOfWeek = date.getDay();
  const workingHours = schedule.workingHours.find(
    (wh) => wh.dayOfWeek === dayOfWeek
  );
  if (!workingHours || !workingHours.isWorking) {
    return false;
  }
  const dateString = date.toDateString();
  const isCustomUnavailable = schedule.customUnavailableDates.some(
    (unavailableDate) => unavailableDate.toDateString() === dateString
  );
  return !isCustomUnavailable;
}
async function generateSpecialistTimeSlots(specialistId, date, serviceDuration = 60) {
  const schedule = await getSpecialistSchedule(specialistId);
  const slots = [];
  if (!await isSpecialistWorking(specialistId, date)) {
    return slots;
  }
  const dayOfWeek = date.getDay();
  const workingHours = schedule.workingHours.find(
    (wh) => wh.dayOfWeek === dayOfWeek
  );
  if (!workingHours || !workingHours.startTime || !workingHours.endTime) {
    return slots;
  }
  const brazilNow = getBrazilianDateTime();
  const minimumBookingTime = new Date(
    brazilNow.getTime() + schedule.minimumNoticeHours * 60 * 60 * 1e3
  );
  const slotDuration = schedule.timeSlotDuration;
  const totalSlotTime = serviceDuration + schedule.bufferTime;
  const startMinutes = timeToMinutes(workingHours.startTime);
  const endMinutes = timeToMinutes(workingHours.endTime);
  let breakStartMinutes;
  let breakEndMinutes;
  if (workingHours.breakStartTime && workingHours.breakEndTime) {
    breakStartMinutes = timeToMinutes(workingHours.breakStartTime);
    breakEndMinutes = timeToMinutes(workingHours.breakEndTime);
  }
  for (let currentMinutes = startMinutes; currentMinutes + totalSlotTime <= endMinutes; currentMinutes += slotDuration) {
    const slotTime = minutesToTime(currentMinutes);
    const slotEndMinutes = currentMinutes + serviceDuration;
    let isDuringBreak = false;
    if (breakStartMinutes !== void 0 && breakEndMinutes !== void 0) {
      isDuringBreak = currentMinutes < breakEndMinutes && slotEndMinutes > breakStartMinutes;
    }
    const slotDateTime = new Date(date);
    const [hours, minutes] = slotTime.split(":").map(Number);
    slotDateTime.setHours(hours, minutes, 0, 0);
    const isToday = date.toDateString() === brazilNow.toDateString();
    const isTooLate = isToday && slotDateTime < minimumBookingTime;
    let available = true;
    let reason;
    if (isDuringBreak) {
      available = false;
      reason = "Hor\xE1rio de pausa";
    } else if (isTooLate) {
      available = false;
      reason = "Tempo insuficiente para agendamento";
    }
    slots.push({
      time: slotTime,
      available,
      reason
    });
  }
  return slots;
}
async function getSpecialistScheduleForDisplay(specialistId) {
  const schedule = await getSpecialistSchedule(specialistId);
  return {
    ...schedule,
    workingHoursFormatted: schedule.workingHours.map((wh) => ({
      dayName: getDayName(wh.dayOfWeek),
      dayOfWeek: wh.dayOfWeek,
      isWorking: wh.isWorking,
      startTime: wh.startTime,
      endTime: wh.endTime,
      breakStartTime: wh.breakStartTime,
      breakEndTime: wh.breakEndTime,
      hasBreak: !!(wh.breakStartTime && wh.breakEndTime)
    })),
    customUnavailableDatesFormatted: schedule.customUnavailableDates.map(
      (date) => ({
        date: date.toISOString().split("T")[0],
        dateFormatted: date.toLocaleDateString("pt-BR")
      })
    )
  };
}
function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}
function getBrazilianDateTime() {
  const now = /* @__PURE__ */ new Date();
  const brazilTime = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(now);
  return /* @__PURE__ */ new Date(
    `${brazilTime.find((p) => p.type === "year")?.value}-${brazilTime.find((p) => p.type === "month")?.value}-${brazilTime.find((p) => p.type === "day")?.value}T${brazilTime.find((p) => p.type === "hour")?.value}:${brazilTime.find((p) => p.type === "minute")?.value}:${brazilTime.find((p) => p.type === "second")?.value}`
  );
}
function getDayName(dayOfWeek) {
  const days = [
    "Domingo",
    "Segunda",
    "Ter\xE7a",
    "Quarta",
    "Quinta",
    "Sexta",
    "S\xE1bado"
  ];
  return days[dayOfWeek];
}
async function initializeExistingSpecialists(salonId) {
  const db = await getDb();
  if (!db) return 0;
  const specialistsList = await db.select({ id: specialists.id }).from(specialists).where(eq(specialists.salonId, salonId));
  let initialized = 0;
  for (const specialist of specialistsList) {
    const schedule = await getSpecialistSchedule(specialist.id);
    if (schedule) initialized++;
  }
  console.log(
    `\u{1F527} Configura\xE7\xF5es inicializadas para ${initialized} especialistas`
  );
  return initialized;
}
var init_specialist_schedule = __esm({
  "server/specialist-schedule.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/sync-schedules.ts
var sync_schedules_exports = {};
__export(sync_schedules_exports, {
  needsSyncronization: () => needsSyncronization,
  syncAllSpecialistsInSalon: () => syncAllSpecialistsInSalon,
  syncLegacyWorkingDaysToSchedule: () => syncLegacyWorkingDaysToSchedule
});
async function syncLegacyWorkingDaysToSchedule(specialistId) {
  try {
    const specialist = await getSpecialistById(specialistId);
    if (!specialist || !specialist.workingDays) {
      console.log(`\u274C Specialist ${specialistId} not found or no workingDays`);
      return;
    }
    console.log(`\u{1F504} Syncing workingDays for specialist ${specialist.name}`);
    const dayMapping = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };
    for (const [dayName, periods] of Object.entries(specialist.workingDays)) {
      const dayOfWeek = dayMapping[dayName];
      if (dayOfWeek === void 0) continue;
      if (periods && periods.length > 0) {
        const mainPeriod = periods[0];
        await updateWorkingHoursForDay(specialistId, dayOfWeek, {
          isWorking: true,
          startTime: mainPeriod.start,
          endTime: mainPeriod.end,
          breakStartTime: mainPeriod.lunch?.start,
          breakEndTime: mainPeriod.lunch?.end
        });
        console.log(
          `\u2705 Synced ${getDayName(dayOfWeek)}: ${mainPeriod.start}-${mainPeriod.end}`
        );
      } else {
        await updateWorkingHoursForDay(specialistId, dayOfWeek, {
          isWorking: false
        });
        console.log(`\u2705 Set ${getDayName(dayOfWeek)} as non-working day`);
      }
    }
    console.log(`\u2705 Sync completed for specialist ${specialist.name}`);
  } catch (error) {
    console.error(`\u274C Error syncing specialist ${specialistId}:`, error);
  }
}
async function syncAllSpecialistsInSalon(salonId) {
  try {
    const specialists2 = await getSpecialistsBySalonId(salonId);
    console.log(
      `\u{1F504} Starting sync for ${specialists2.length} specialists in salon ${salonId}`
    );
    for (const specialist of specialists2) {
      await syncLegacyWorkingDaysToSchedule(specialist.id);
    }
    console.log(`\u2705 Sync completed for all specialists in salon ${salonId}`);
  } catch (error) {
    console.error(`\u274C Error syncing salon ${salonId}:`, error);
  }
}
async function needsSyncronization(specialistId) {
  try {
    const specialist = await getSpecialistById(specialistId);
    const schedule = await getSpecialistSchedule(specialistId);
    const hasLegacyData = Boolean(
      specialist?.workingDays && Object.keys(specialist.workingDays).length > 0
    );
    const hasScheduleData = schedule.workingHours.some((wh) => wh.isWorking);
    return hasLegacyData && !hasScheduleData;
  } catch {
    return false;
  }
}
var init_sync_schedules = __esm({
  "server/sync-schedules.ts"() {
    "use strict";
    init_db();
    init_specialist_schedule();
  }
});

// server/db.ts
import {
  eq as eq2,
  and,
  gte,
  lte,
  like,
  asc,
  sql,
  desc,
  sum,
  count
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { nanoid } from "nanoid";
import { eq as eq3 } from "drizzle-orm";
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client, {
        schema: {
          ...schema_exports,
          ...relations_exports
        }
      });
    } catch {
      _db = null;
    }
  }
  return _db;
}
function maskSensitiveFields(value) {
  if (value === null || value === void 0) return value;
  if (Array.isArray(value)) return value.map((v) => maskSensitiveFields(v));
  if (typeof value === "object") {
    const obj = {};
    for (const [k, v] of Object.entries(value)) {
      const lower = k.toLowerCase();
      if (/(password|pass|pwd|secret|token|apikey|api_key|private_key|authorization|bearer)/.test(
        lower
      )) {
        obj[k] = "[REDACTED]";
      } else {
        obj[k] = maskSensitiveFields(v);
      }
    }
    return obj;
  }
  return value;
}
async function createAuditLog(params) {
  const db = await getDb();
  if (!db) return;
  const id = nanoid();
  try {
    const metadata = { ...params.metadata ?? {} };
    try {
      if (!metadata.salonId && params.userId) {
        const salon = await getSalonByUserId(params.userId).catch(
          () => void 0
        );
        if (salon && salon.id) metadata.salonId = salon.id;
      }
    } catch {
    }
    const salonId = typeof metadata.salonId === "string" ? metadata.salonId : void 0;
    const safeBefore = params.before ? maskSensitiveFields(params.before) : null;
    const safeAfter = params.after ? maskSensitiveFields(params.after) : null;
    await db.insert(auditLogs).values({
      id,
      userId: params.userId ?? null,
      salonId: salonId ?? null,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId ?? null,
      before: safeBefore ?? null,
      after: safeAfter ?? null,
      metadata: Object.keys(metadata).length > 0 ? metadata : null,
      createdAt: /* @__PURE__ */ new Date()
    });
  } catch (err) {
    console.error("createAuditLog failed", err);
  }
}
async function listAuditLogsWithCount(filter) {
  const db = await getDb();
  if (!db) return { rows: [], total: 0 };
  const limit = filter?.limit ?? 100;
  const offset = filter?.offset ?? 0;
  const parts = [];
  if (filter?.userId) parts.push(sql`${auditLogs.userId} = ${filter.userId}`);
  if (filter?.userIds && filter.userIds.length > 0)
    parts.push(
      sql`${auditLogs.userId} IN (${sql.join(
        filter.userIds.map((u) => sql`${u}`),
        sql`, `
      )})`
    );
  if (filter?.entity) parts.push(sql`${auditLogs.entity} = ${filter.entity}`);
  if (filter?.entityId)
    parts.push(sql`${auditLogs.entityId} = ${filter.entityId}`);
  if (filter?.salonId)
    parts.push(
      sql`(COALESCE(${auditLogs.salonId}::text, '') = ${filter.salonId} OR (${auditLogs.metadata} ->> 'salonId') = ${filter.salonId})`
    );
  if (filter?.startDate)
    parts.push(sql`${auditLogs.createdAt} >= ${filter.startDate}`);
  if (filter?.endDate)
    parts.push(sql`${auditLogs.createdAt} <= ${filter.endDate}`);
  let whereExpr = void 0;
  if (parts.length === 1) whereExpr = parts[0];
  else if (parts.length > 1)
    whereExpr = parts.reduce((acc, cur) => sql`${acc} AND ${cur}`);
  let total = 0;
  if (whereExpr) {
    const countRes = await db.select({ total: sql`COUNT(*)` }).from(auditLogs).where(whereExpr);
    total = Number(
      countRes[0].total ?? 0
    );
  } else {
    const countRes = await db.select({ total: sql`COUNT(*)` }).from(auditLogs);
    total = Number(
      countRes[0].total ?? 0
    );
  }
  let rows = [];
  if (whereExpr) {
    rows = await db.select().from(auditLogs).where(whereExpr).orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset);
  } else {
    rows = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset);
  }
  return { rows, total };
}
async function upsertUser(user) {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    return;
  }
  try {
    const values = {
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      password: user.password || "",
      role: user.role ?? (user.id === ENV.ownerId ? "admin" : "user"),
      lastSignedIn: user.lastSignedIn,
      photoUrl: user.photoUrl ?? null,
      phone: user.phone,
      createdAt: void 0,
      updatedAt: void 0
    };
    const updateSet = {};
    const textFields = ["name", "email"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.password !== void 0) {
      values.password = user.password;
      updateSet.password = user.password;
    }
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.id === ENV.ownerId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if ("photoUrl" in user) {
      values.photoUrl = user.photoUrl ?? null;
      updateSet.photoUrl = user.photoUrl ?? null;
    }
    if ("permissions" in user) {
      values.permissions = user.permissions ?? null;
      updateSet.permissions = user.permissions ?? null;
    }
    if ("salonId" in user) {
      values.salonId = user.salonId ?? null;
      updateSet.salonId = user.salonId ?? null;
    }
    if (user.phone !== void 0) {
      values.phone = user.phone;
      updateSet.phone = user.phone;
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    try {
      const result = await db.update(users).set(updateSet).where(eq2(users.id, user.id)).returning();
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
async function getUser(id) {
  const db = await getDb();
  if (!db) {
    return void 0;
  }
  const result = await db.select().from(users).where(eq2(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq2(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function listUsers() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(users);
  return result.map(
    ({ password: _p, ...rest }) => rest
  );
}
async function getSalonByUserId(userId) {
  const db = await getDb();
  if (!db) return void 0;
  const ownerResult = await db.select().from(salons).where(eq2(salons.userId, userId)).limit(1);
  if (ownerResult.length > 0) return ownerResult[0];
  const userResult = await db.select().from(users).where(eq2(users.id, userId)).limit(1);
  if (userResult.length === 0) return void 0;
  const userRow = userResult[0];
  const salonId = userRow.salonId;
  if (!salonId) return void 0;
  const salonResult = await db.select().from(salons).where(eq2(salons.id, salonId)).limit(1);
  return salonResult.length > 0 ? salonResult[0] : void 0;
}
async function getSalonById(salonId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(salons).where(eq2(salons.id, salonId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateSalon(salonId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(salons).set(data).where(eq2(salons.id, salonId));
}
async function getSpecialistsBySalonId(salonId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(specialists).where(eq2(specialists.salonId, salonId));
}
async function getSpecialistById(specialistId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(specialists).where(eq2(specialists.id, specialistId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createSpecialist(data) {
  const db = await getDb();
  if (db == null) throw new Error("Database not available");
  await db.insert(specialists).values(data);
  return data;
}
async function updateSpecialist(specialistId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(specialists).set(data).where(eq2(specialists.id, specialistId));
}
async function deleteSpecialist(specialistId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(specialists).where(eq2(specialists.id, specialistId));
}
async function getClientsBySalonId(salonId, search, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  const whereConditions = search ? and(eq2(clients.salonId, salonId), like(clients.name, `%${search}%`)) : eq2(clients.salonId, salonId);
  return await db.select().from(clients).where(whereConditions).limit(limit).offset(offset);
}
async function getClientById(clientId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(clients).where(eq2(clients.id, clientId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createClient(data) {
  const db = await getDb();
  if (db == null) throw new Error("Database not available");
  await db.insert(clients).values(data);
  return data;
}
async function updateClient(clientId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(clients).set(data).where(eq2(clients.id, clientId));
}
async function deleteClient(clientId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(clients).where(eq2(clients.id, clientId));
}
async function addLoyaltyPoints(clientId, amountPaid) {
  const db = await getDb();
  if (!db) return;
  const pointsToAdd = Math.floor(amountPaid);
  if (pointsToAdd <= 0) return;
  await db.update(clients).set({
    loyaltyPoints: sql`${clients.loyaltyPoints} + ${pointsToAdd}`,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq2(clients.id, clientId));
}
async function getServicesBySalonId(salonId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(services).where(eq2(services.salonId, salonId));
}
async function getServiceById(serviceId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(services).where(eq2(services.id, serviceId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createService(data) {
  const db = await getDb();
  if (db == null) throw new Error("Database not available");
  await db.insert(services).values(data);
  return data;
}
async function updateService(serviceId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(services).set(data).where(eq2(services.id, serviceId));
}
async function deleteService(serviceId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(services).where(eq2(services.id, serviceId));
}
async function getAppointmentsWithDetailsBySalonId(salonId, startDate, endDate) {
  const db = await getDb();
  if (!db) return [];
  const whereConditions = startDate && endDate ? and(
    eq2(appointments.salonId, salonId),
    gte(appointments.appointmentDate, startDate),
    lte(appointments.appointmentDate, endDate)
  ) : eq2(appointments.salonId, salonId);
  const result = await db.select({
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
    paidAmount: appointments.paidAmount,
    createdAt: appointments.createdAt,
    updatedAt: appointments.updatedAt,
    deletedAt: appointments.deletedAt,
    // Client fields
    client: {
      id: clients.id,
      name: clients.name,
      email: clients.email,
      phone: clients.phone,
      notes: clients.notes,
      photo: clients.photo,
      salonId: clients.salonId,
      createdAt: clients.createdAt,
      updatedAt: clients.updatedAt,
      loyaltyPoints: clients.loyaltyPoints
    },
    // Service fields
    service: {
      id: services.id,
      name: services.name,
      description: services.description,
      duration: services.duration,
      price: services.price,
      priceFrom: services.priceFrom,
      status: services.status,
      salonId: services.salonId,
      specialistId: services.specialistId,
      createdAt: services.createdAt,
      updatedAt: services.updatedAt,
      deletedAt: services.deletedAt
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
      deletedAt: specialists.deletedAt
    }
  }).from(appointments).innerJoin(clients, eq2(appointments.clientId, clients.id)).innerJoin(services, eq2(appointments.serviceId, services.id)).innerJoin(specialists, eq2(appointments.specialistId, specialists.id)).where(whereConditions).orderBy(asc(appointments.appointmentDate));
  return result.map((row) => ({
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
    paidAmount: row.paidAmount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
    client: row.client,
    service: row.service,
    specialist: row.specialist
  }));
}
async function getAppointmentById(appointmentId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(appointments).where(eq2(appointments.id, appointmentId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getAppointmentsBySpecialistAndDate(specialistId, date) {
  const db = await getDb();
  if (!db) return [];
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return await db.select().from(appointments).where(
    and(
      eq2(appointments.specialistId, specialistId),
      gte(appointments.appointmentDate, startOfDay),
      lte(appointments.appointmentDate, endOfDay)
    )
  );
}
async function createAppointment(data) {
  const db = await getDb();
  if (db == null) throw new Error("Database not available");
  await db.insert(appointments).values(data);
  return data;
}
async function updateAppointment(appointmentId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(appointments).set(data).where(eq2(appointments.id, appointmentId));
}
async function deleteAppointment(appointmentId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(appointments).where(eq2(appointments.id, appointmentId));
}
async function createTransaction(transaction) {
  const db = await getDb();
  if (!db) throw new Error("Database n\xE3o dispon\xEDvel");
  const [newTransaction] = await db.insert(transactions).values(transaction).returning();
  return newTransaction;
}
async function recordAppointmentRevenue(appointmentId, paymentMethod, amountPaid) {
  const db = await getDb();
  if (!db) throw new Error("Database n\xE3o dispon\xEDvel");
  const appointmentData = await db.select({
    appointment: appointments,
    client: { id: clients.id, name: clients.name },
    service: { id: services.id, name: services.name, price: services.price },
    specialist: { id: specialists.id, name: specialists.name },
    salon: { id: salons.id }
  }).from(appointments).leftJoin(clients, eq2(appointments.clientId, clients.id)).leftJoin(services, eq2(appointments.serviceId, services.id)).leftJoin(specialists, eq2(appointments.specialistId, specialists.id)).leftJoin(salons, eq2(appointments.salonId, salons.id)).where(eq2(appointments.id, appointmentId)).limit(1);
  if (!appointmentData.length || !appointmentData[0].appointment) {
    throw new Error("Agendamento n\xE3o encontrado");
  }
  const { appointment, client, service, specialist, salon } = appointmentData[0];
  if (!salon || !service) {
    throw new Error("Dados incompletos para registrar transa\xE7\xE3o");
  }
  const amount = typeof amountPaid === "number" && !Number.isNaN(amountPaid) ? amountPaid : Number(service.price);
  const specialistCommission = amount * 0.6;
  const serviceFee = amount - specialistCommission;
  const transaction = await createTransaction({
    id: generateId(),
    salonId: salon.id,
    appointmentId: appointment.id,
    clientId: client?.id || null,
    serviceId: service.id,
    specialistId: specialist?.id || null,
    type: "income",
    status: "completed",
    paymentMethod: paymentMethod || "cash",
    amount: amount.toString(),
    serviceFee: serviceFee.toString(),
    specialistCommission: specialistCommission.toString(),
    description: `Servi\xE7o: ${service.name} - Cliente: ${client?.name || "N/A"}`,
    transactionDate: /* @__PURE__ */ new Date()
  });
  if (typeof amountPaid === "number" && !Number.isNaN(amountPaid)) {
    try {
      await updateAppointment(appointment.id, {
        paidAmount: amount.toString()
      });
    } catch (err) {
      console.error("Failed to save paidAmount on appointment:", err);
    }
  }
  return transaction;
}
async function createPasswordReset(data) {
  const db = await getDb();
  if (db == null) throw new Error("Database not available");
  await db.insert(passwordResets).values(data);
  return data;
}
async function getPasswordResetByToken(token) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(passwordResets).where(eq2(passwordResets.token, token)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function markPasswordResetAsUsed(resetId) {
  const db = await getDb();
  if (!db) return;
  await db.update(passwordResets).set({ used: true }).where(eq2(passwordResets.id, resetId));
}
async function validateAppointmentSlot(specialistId, serviceId, date, time, excludeAppointmentId) {
  console.log("\u{1F50D} validateAppointmentSlot DEBUG:", {
    specialistId,
    serviceId,
    date: date.toISOString(),
    time,
    excludeAppointmentId
  });
  const specialist = await getSpecialistById(specialistId);
  const service = await getServiceById(serviceId);
  if (!specialist || !service) {
    return { valid: false, reason: "Especialista ou servi\xE7o n\xE3o encontrado" };
  }
  const salon = await getSalonById(specialist.salonId);
  if (!salon) {
    return { valid: false, reason: "Sal\xE3o n\xE3o encontrado" };
  }
  const dayOfWeek = date.getDay();
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
  ];
  const dayName = dayNames[dayOfWeek];
  console.log("\u{1F4C5} Day validation info:", {
    dayOfWeek,
    dayName,
    specialistWorkingDays: specialist.workingDays?.[dayName]
  });
  let specialistPeriods = [];
  try {
    const { isSpecialistWorking: isSpecialistWorking2, getSpecialistSchedule: getSpecialistSchedule2 } = await Promise.resolve().then(() => (init_specialist_schedule(), specialist_schedule_exports));
    const { needsSyncronization: needsSyncronization2, syncLegacyWorkingDaysToSchedule: syncLegacyWorkingDaysToSchedule2 } = await Promise.resolve().then(() => (init_sync_schedules(), sync_schedules_exports));
    const needsSync = await needsSyncronization2(specialistId);
    if (needsSync) {
      console.log("\u{1F504} Auto-syncing legacy workingDays to schedule system");
      await syncLegacyWorkingDaysToSchedule2(specialistId);
    }
    const isWorking = await isSpecialistWorking2(specialistId, date);
    if (!isWorking) {
      return { valid: false, reason: "Especialista n\xE3o trabalha neste dia" };
    }
    const schedule = await getSpecialistSchedule2(specialistId);
    const workingHours = schedule.workingHours.find(
      (wh) => wh.dayOfWeek === dayOfWeek
    );
    if (workingHours?.isWorking && workingHours.startTime && workingHours.endTime) {
      specialistPeriods = [
        {
          start: workingHours.startTime,
          end: workingHours.endTime,
          lunch: workingHours.breakStartTime && workingHours.breakEndTime ? {
            start: workingHours.breakStartTime,
            end: workingHours.breakEndTime
          } : void 0
        }
      ];
      console.log("\u2705 Using specialist schedule system for validation");
    } else {
      if (!specialist.workingDays?.[dayName]) {
        return { valid: false, reason: "Especialista n\xE3o trabalha neste dia" };
      }
      specialistPeriods = specialist.workingDays[dayName];
      console.log("\u26A0\uFE0F Using legacy workingDays system for validation");
    }
  } catch (error) {
    console.log(
      "\u26A0\uFE0F Error with schedule system, falling back to legacy:",
      error
    );
    if (!specialist.workingDays?.[dayName]) {
      return { valid: false, reason: "Especialista n\xE3o trabalha neste dia" };
    }
    specialistPeriods = specialist.workingDays[dayName];
  }
  let isWithinSpecialistHours = false;
  for (const period of specialistPeriods) {
    if (isWithinWorkingHours(
      time,
      service.duration,
      { [dayName]: [period] },
      dayName
    )) {
      isWithinSpecialistHours = true;
      break;
    }
  }
  if (!isWithinSpecialistHours) {
    return {
      valid: false,
      reason: "Hor\xE1rio fora do expediente do especialista"
    };
  }
  const conflictingAppointments = await getConflictingAppointments(
    specialistId,
    date,
    time,
    service.duration,
    excludeAppointmentId
  );
  if (conflictingAppointments.length > 0) {
    return { valid: false, reason: "Hor\xE1rio j\xE1 est\xE1 ocupado" };
  }
  const brazilNow = getBrazilianDateTime2();
  const selectedDateBrazil = new Date(
    date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );
  const isToday = selectedDateBrazil.toDateString() === brazilNow.toDateString();
  if (isToday) {
    const currentBrazilTime = `${brazilNow.getHours().toString().padStart(2, "0")}:${brazilNow.getMinutes().toString().padStart(2, "0")}`;
    const slotMinutes = timeToMinutes2(time);
    const currentMinutes = timeToMinutes2(currentBrazilTime);
    const minimumAdvanceMinutes = 30;
    if (slotMinutes < currentMinutes + minimumAdvanceMinutes) {
      return {
        valid: false,
        reason: "Hor\xE1rio muito pr\xF3ximo ao atual (m\xEDnimo 30 min de anteced\xEAncia)"
      };
    }
  }
  console.log("\u2705 Slot validation passed");
  return { valid: true };
}
async function getAvailableTimeSlots(specialistId, serviceId, date) {
  console.log("\u{1F50D} getAvailableTimeSlots DEBUG:", {
    specialistId,
    serviceId,
    date: date.toISOString(),
    dayOfWeek: date.getDay()
  });
  const db = await getDb();
  if (!db) {
    console.log("\u274C Database not available");
    return [];
  }
  const [specialist, service] = await Promise.all([
    getSpecialistById(specialistId),
    getServiceById(serviceId)
  ]);
  const salon = specialist ? await getSalonById(specialist.salonId) : null;
  console.log("\u{1F4CA} Specialist data:", {
    found: !!specialist,
    name: specialist?.name,
    workingDays: specialist?.workingDays
  });
  console.log("\u{1F6E0}\uFE0F Service data:", {
    found: !!service,
    name: service?.name,
    duration: service?.duration,
    specialistId: service?.specialistId ?? null
  });
  console.log("\u{1F3E2} Salon data:", {
    found: !!salon,
    name: salon?.name
  });
  if (!service) {
    console.log("\u274C Service not found");
    return [];
  }
  if (!specialist) {
    console.log("\u274C Specialist not found");
    return [];
  }
  if (service.specialistId && service.specialistId !== specialistId) {
    console.log(
      "\u274C Service is assigned to a different specialist:",
      service.specialistId,
      "!=",
      specialistId
    );
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
    "saturday"
  ];
  const dayName = dayNames[dayOfWeek];
  console.log("\u{1F4C5} Day info:", {
    dayOfWeek,
    dayName,
    specialistWorkingDays: specialist.workingDays?.[dayName]
  });
  let specialistPeriods = [];
  const { isSpecialistWorking: isSpecialistWorking2, getSpecialistSchedule: getSpecialistSchedule2 } = await Promise.resolve().then(() => (init_specialist_schedule(), specialist_schedule_exports));
  try {
    const { needsSyncronization: needsSyncronization2, syncLegacyWorkingDaysToSchedule: syncLegacyWorkingDaysToSchedule2 } = await Promise.resolve().then(() => (init_sync_schedules(), sync_schedules_exports));
    const needsSync = await needsSyncronization2(specialistId);
    if (needsSync) {
      console.log("\u{1F504} Auto-syncing legacy workingDays to schedule system");
      await syncLegacyWorkingDaysToSchedule2(specialistId);
    }
    const isWorking = await isSpecialistWorking2(specialistId, date);
    if (!isWorking) {
      console.log("\u274C Specialist does not work on this day (schedule system)");
      return [];
    }
    const schedule = await getSpecialistSchedule2(specialistId);
    const workingHours = schedule.workingHours.find(
      (wh) => wh.dayOfWeek === dayOfWeek
    );
    if (workingHours?.isWorking && workingHours.startTime && workingHours.endTime) {
      specialistPeriods = [
        {
          start: workingHours.startTime,
          end: workingHours.endTime,
          lunch: workingHours.breakStartTime && workingHours.breakEndTime ? {
            start: workingHours.breakStartTime,
            end: workingHours.breakEndTime
          } : void 0
        }
      ];
      console.log("\u2705 Using specialist schedule system");
    } else {
      if (!specialist.workingDays?.[dayName]) {
        console.log("\u274C Specialist does not work on this day");
        return [];
      }
      specialistPeriods = specialist.workingDays[dayName];
      console.log("\u26A0\uFE0F Using legacy workingDays system");
    }
  } catch (error) {
    console.log(
      "\u26A0\uFE0F Error with schedule system, falling back to legacy:",
      error
    );
    if (!specialist.workingDays?.[dayName]) {
      console.log("\u274C Specialist does not work on this day");
      return [];
    }
    specialistPeriods = specialist.workingDays[dayName];
  }
  const allSlots = [];
  console.log("\u23F0 Specialist working periods:", specialistPeriods);
  for (const period of specialistPeriods) {
    console.log("\u{1F504} Generating slots for period:", period);
    const periodSlots = generateTimeSlots(period.start, period.end, 30);
    console.log("\u{1F4CB} Generated slots:", periodSlots.length, "slots");
    const filteredSlots = periodSlots.filter((slot) => {
      if (!period.lunch) return true;
      const slotEndTime = calculateEndTime(slot, service.duration);
      return !hasTimeOverlap(
        slot,
        slotEndTime,
        period.lunch.start,
        period.lunch.end
      );
    });
    console.log(
      "\u2705 Filtered slots (after lunch filter):",
      filteredSlots.length,
      "slots"
    );
    allSlots.push(...filteredSlots);
  }
  console.log("\u{1F4C5} Total slots before conflict check:", allSlots.length);
  const existingAppointments = await getAppointmentsBySpecialistAndDate(
    specialistId,
    date
  );
  console.log("\u{1F4CB} Existing appointments:", {
    count: existingAppointments.length,
    appointments: existingAppointments.map((apt) => ({
      id: apt.id,
      time: apt.appointmentTime,
      status: apt.status
    }))
  });
  const availableSlots = allSlots.filter((slot) => {
    const slotEndTime = calculateEndTime(slot, service.duration);
    const hasConflict = existingAppointments.some((apt) => {
      if (apt.status === "cancelled") return false;
      if (!apt.appointmentTime || typeof apt.appointmentTime !== "string") {
        console.warn("\u274C Skipping appointment with invalid time:", {
          id: apt.id,
          appointmentTime: apt.appointmentTime
        });
        return false;
      }
      const aptEndTime = calculateEndTime(apt.appointmentTime, 60);
      const conflict = hasTimeOverlap(
        slot,
        slotEndTime,
        apt.appointmentTime,
        aptEndTime
      );
      if (conflict) {
        console.log(
          `\u26A0\uFE0F Conflict detected: slot ${slot}-${slotEndTime} conflicts with appointment ${apt.appointmentTime}-${aptEndTime}`
        );
      }
      return conflict;
    });
    return !hasConflict;
  });
  console.log(
    "\u2705 Available slots before time filter:",
    availableSlots.length,
    availableSlots
  );
  const brazilNow = getBrazilianDateTime2();
  const currentBrazilTime = `${brazilNow.getHours().toString().padStart(2, "0")}:${brazilNow.getMinutes().toString().padStart(2, "0")}`;
  const selectedDateBrazil = new Date(
    date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );
  const isToday = selectedDateBrazil.toDateString() === brazilNow.toDateString();
  console.log("\u{1F550} Brazil time info:", {
    brazilNow: brazilNow.toISOString(),
    currentBrazilTime,
    isToday,
    selectedDate: date.toISOString(),
    selectedDateBrazil: selectedDateBrazil.toISOString(),
    selectedDateBrazilString: selectedDateBrazil.toDateString(),
    brazilNowString: brazilNow.toDateString()
  });
  const finalSlots = isToday ? availableSlots.filter((slot) => {
    const slotMinutes = timeToMinutes2(slot);
    const currentMinutes = timeToMinutes2(currentBrazilTime);
    const minimumAdvanceMinutes = 30;
    const isAvailable = slotMinutes >= currentMinutes + minimumAdvanceMinutes;
    if (!isAvailable) {
      console.log(
        `\u23F0 Filtering out slot ${slot} - too close to current time ${currentBrazilTime} (needs ${minimumAdvanceMinutes} min advance)`
      );
    }
    return isAvailable;
  }) : availableSlots;
  console.log(
    "\u2705 Final available slots (after time filter):",
    finalSlots.length,
    finalSlots
  );
  return finalSlots.sort();
}
function generateTimeSlots(startTime, endTime, intervalMinutes) {
  const slots = [];
  const start = timeToMinutes2(startTime);
  const end = timeToMinutes2(endTime);
  for (let minutes = start; minutes < end; minutes += intervalMinutes) {
    slots.push(minutesToTime2(minutes));
  }
  return slots;
}
function calculateEndTime(startTime, durationMinutes) {
  const startMinutes = timeToMinutes2(startTime);
  const endMinutes = startMinutes + durationMinutes;
  return minutesToTime2(endMinutes);
}
function hasTimeOverlap(start1, end1, start2, end2) {
  const s1 = timeToMinutes2(start1);
  const e1 = timeToMinutes2(end1);
  const s2 = timeToMinutes2(start2);
  const e2 = timeToMinutes2(end2);
  return s1 < e2 && s2 < e1;
}
function minutesToTime2(minutes) {
  if (typeof minutes !== "number" || Number.isNaN(minutes) || minutes < 0) {
    console.error("\u274C minutesToTime: Invalid minutes parameter:", minutes);
    return "00:00";
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}
function getBrazilianDateTime2() {
  return new Date(
    (/* @__PURE__ */ new Date()).toLocaleString("en-US", {
      timeZone: "America/Sao_Paulo"
    })
  );
}
function timeToMinutes2(time) {
  if (!time || typeof time !== "string") {
    console.error("\u274C timeToMinutes: Invalid time parameter:", time);
    return 0;
  }
  const parts = time.split(":");
  if (parts.length !== 2) {
    console.error("\u274C timeToMinutes: Invalid time format:", time);
    return 0;
  }
  const [hours, minutes] = parts.map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    console.error("\u274C timeToMinutes: Non-numeric time parts:", {
      hours,
      minutes
    });
    return 0;
  }
  return hours * 60 + minutes;
}
function isWithinWorkingHours(time, durationMinutes, workingDays, dayName) {
  if (!workingDays || !workingDays[dayName]) {
    return false;
  }
  const periods = workingDays[dayName];
  const startMinutes = timeToMinutes2(time);
  const endMinutes = startMinutes + durationMinutes;
  for (const period of periods) {
    const periodStart = timeToMinutes2(period.start);
    const periodEnd = timeToMinutes2(period.end);
    if (startMinutes >= periodStart && endMinutes <= periodEnd) {
      if (period.lunch) {
        const lunchStart = timeToMinutes2(period.lunch.start);
        const lunchEnd = timeToMinutes2(period.lunch.end);
        if (!(endMinutes <= lunchStart || startMinutes >= lunchEnd)) {
          continue;
        }
      }
      return true;
    }
  }
  return false;
}
async function getConflictingAppointments(specialistId, date, time, durationMinutes, excludeAppointmentId) {
  const existingAppointments = await getAppointmentsBySpecialistAndDate(
    specialistId,
    date
  );
  const startMinutes = timeToMinutes2(time);
  const endMinutes = startMinutes + durationMinutes;
  return existingAppointments.filter((apt) => {
    if (apt.status === "cancelled") return false;
    if (excludeAppointmentId && apt.id === excludeAppointmentId) return false;
    const aptStartMinutes = timeToMinutes2(apt.appointmentTime);
    const aptEndMinutes = aptStartMinutes + 60;
    return !(endMinutes <= aptStartMinutes || startMinutes >= aptEndMinutes);
  });
}
function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
async function getDashboardMetrics(salonId, forceRefresh = false) {
  const db = await getDb();
  if (!db) return null;
  if (!forceRefresh) {
    const cached = dashboardMetricsCache.get(salonId);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
  }
  const today = /* @__PURE__ */ new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - 7);
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  const [
    monthlyRevenue,
    weeklyRevenue,
    todayAppointments,
    topServices,
    topSpecialists,
    topClients
  ] = await Promise.all([
    // Receita do mês atual
    db.select({
      total: sum(transactions.amount),
      count: count(transactions.id)
    }).from(transactions).where(
      and(
        eq2(transactions.salonId, salonId),
        eq2(transactions.type, "income"),
        eq2(transactions.status, "completed"),
        gte(transactions.transactionDate, startOfMonth)
      )
    ),
    // Receita semanal
    db.select({
      total: sum(transactions.amount),
      count: count(transactions.id)
    }).from(transactions).where(
      and(
        eq2(transactions.salonId, salonId),
        eq2(transactions.type, "income"),
        eq2(transactions.status, "completed"),
        gte(transactions.transactionDate, startOfWeek)
      )
    ),
    // Agendamentos de hoje
    db.select({
      total: count(appointments.id),
      completed: count(
        sql`CASE WHEN ${appointments.status} = 'completed' THEN 1 END`
      ),
      confirmed: count(
        sql`CASE WHEN ${appointments.status} = 'confirmed' THEN 1 END`
      ),
      pending: count(
        sql`CASE WHEN ${appointments.status} = 'pending' THEN 1 END`
      ),
      cancelled: count(
        sql`CASE WHEN ${appointments.status} = 'cancelled' THEN 1 END`
      )
    }).from(appointments).where(
      and(
        eq2(appointments.salonId, salonId),
        gte(appointments.appointmentDate, todayStart),
        lte(appointments.appointmentDate, todayEnd)
      )
    ),
    // Top 5 serviços mais lucrativos do mês
    db.select({
      serviceId: transactions.serviceId,
      serviceName: services.name,
      totalRevenue: sum(transactions.amount),
      totalBookings: count(transactions.id)
    }).from(transactions).innerJoin(services, eq2(transactions.serviceId, services.id)).where(
      and(
        eq2(transactions.salonId, salonId),
        eq2(transactions.type, "income"),
        eq2(transactions.status, "completed"),
        gte(transactions.transactionDate, startOfMonth)
      )
    ).groupBy(transactions.serviceId, services.name).orderBy(desc(sum(transactions.amount))).limit(5),
    // Top 5 especialistas por receita do mês
    db.select({
      specialistId: transactions.specialistId,
      specialistName: specialists.name,
      totalRevenue: sum(transactions.amount),
      totalAppointments: count(transactions.id)
    }).from(transactions).innerJoin(specialists, eq2(transactions.specialistId, specialists.id)).where(
      and(
        eq2(transactions.salonId, salonId),
        eq2(transactions.type, "income"),
        eq2(transactions.status, "completed"),
        gte(transactions.transactionDate, startOfMonth)
      )
    ).groupBy(transactions.specialistId, specialists.name).orderBy(desc(sum(transactions.amount))).limit(5),
    // Clientes mais valiosos (por valor total gasto)
    db.select({
      clientId: transactions.clientId,
      clientName: clients.name,
      totalSpent: sum(transactions.amount),
      totalVisits: count(transactions.id),
      lastVisit: sql`MAX(${transactions.transactionDate})`
    }).from(transactions).innerJoin(clients, eq2(transactions.clientId, clients.id)).where(
      and(
        eq2(transactions.salonId, salonId),
        eq2(transactions.type, "income"),
        eq2(transactions.status, "completed")
      )
    ).groupBy(transactions.clientId, clients.name).orderBy(desc(sum(transactions.amount))).limit(10)
  ]);
  const occupationRate = todayAppointments[0]?.completed || 0;
  const totalSlotsToday = 24;
  const result = {
    revenue: {
      monthly: Number(monthlyRevenue[0]?.total || 0),
      weekly: Number(weeklyRevenue[0]?.total || 0),
      monthlyTransactions: Number(monthlyRevenue[0]?.count || 0),
      weeklyTransactions: Number(weeklyRevenue[0]?.count || 0)
    },
    appointments: {
      today: {
        total: Number(todayAppointments[0]?.total || 0),
        completed: Number(todayAppointments[0]?.completed || 0),
        confirmed: Number(todayAppointments[0]?.confirmed || 0),
        pending: Number(todayAppointments[0]?.pending || 0),
        cancelled: Number(todayAppointments[0]?.cancelled || 0)
      },
      occupationRate: Math.round(occupationRate / totalSlotsToday * 100)
    },
    topServices,
    topSpecialists,
    topClients
  };
  dashboardMetricsCache.set(salonId, {
    data: result,
    expiresAt: Date.now() + DASHBOARD_CACHE_TTL_MS
  });
  return result;
}
async function getRevenueChart(salonId, days = 30) {
  const db = await getDb();
  if (!db) return [];
  const endDate = /* @__PURE__ */ new Date();
  const startDate = /* @__PURE__ */ new Date();
  startDate.setDate(endDate.getDate() - days);
  const dailyRevenue = await db.select({
    date: sql`DATE(${transactions.transactionDate})`,
    revenue: sum(transactions.amount),
    transactions: count(transactions.id)
  }).from(transactions).where(
    and(
      eq2(transactions.salonId, salonId),
      eq2(transactions.type, "income"),
      eq2(transactions.status, "completed"),
      gte(transactions.transactionDate, startDate),
      lte(transactions.transactionDate, endDate)
    )
  ).groupBy(sql`DATE(${transactions.transactionDate})`).orderBy(sql`DATE(${transactions.transactionDate})`);
  return dailyRevenue.map((day) => ({
    date: day.date,
    revenue: Number(day.revenue || 0),
    transactions: Number(day.transactions || 0)
  }));
}
async function getMonthlyComparison(salonId) {
  const db = await getDb();
  if (!db) return null;
  const today = /* @__PURE__ */ new Date();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const previousMonthStart = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    1
  );
  const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  const currentMonth = await db.select({
    revenue: sum(transactions.amount),
    appointments: count(transactions.id)
  }).from(transactions).where(
    and(
      eq2(transactions.salonId, salonId),
      eq2(transactions.type, "income"),
      eq2(transactions.status, "completed"),
      gte(transactions.transactionDate, currentMonthStart)
    )
  );
  const previousMonth = await db.select({
    revenue: sum(transactions.amount),
    appointments: count(transactions.id)
  }).from(transactions).where(
    and(
      eq2(transactions.salonId, salonId),
      eq2(transactions.type, "income"),
      eq2(transactions.status, "completed"),
      gte(transactions.transactionDate, previousMonthStart),
      lte(transactions.transactionDate, previousMonthEnd)
    )
  );
  const currentRevenue = Number(currentMonth[0]?.revenue || 0);
  const previousRevenue = Number(previousMonth[0]?.revenue || 0);
  const currentAppointments = Number(currentMonth[0]?.appointments || 0);
  const previousAppointments = Number(previousMonth[0]?.appointments || 0);
  const revenueGrowth = previousRevenue > 0 ? (currentRevenue - previousRevenue) / previousRevenue * 100 : 0;
  const appointmentGrowth = previousAppointments > 0 ? (currentAppointments - previousAppointments) / previousAppointments * 100 : 0;
  return {
    current: {
      revenue: currentRevenue,
      appointments: currentAppointments
    },
    previous: {
      revenue: previousRevenue,
      appointments: previousAppointments
    },
    growth: {
      revenue: revenueGrowth,
      appointments: appointmentGrowth
    }
  };
}
async function getAllDashboardData(salonId, chartDays = 30) {
  const [metrics, revenueChart, monthlyComparison, specRatings] = await Promise.all([
    getDashboardMetrics(salonId),
    getRevenueChart(salonId, chartDays),
    getMonthlyComparison(salonId),
    getAllSpecialistRatings(salonId)
  ]);
  return {
    metrics,
    revenueChart,
    monthlyComparison,
    specRatings
  };
}
async function getProductsBySalonId(salonId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq2(products.salonId, salonId)).orderBy(asc(products.name));
}
async function createProduct(data) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados n\xE3o dispon\xEDvel");
  const rows = await db.insert(products).values({ ...data, id: nanoid() }).returning();
  return rows[0];
}
async function updateProduct(id, salonId, data) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.update(products).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq2(products.id, id), eq2(products.salonId, salonId))).returning();
  return rows[0] ?? null;
}
async function deleteProduct(id, salonId) {
  const db = await getDb();
  if (!db) return false;
  const rows = await db.delete(products).where(and(eq2(products.id, id), eq2(products.salonId, salonId))).returning({ id: products.id });
  return rows.length > 0;
}
async function getLowStockProducts(salonId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(
    and(
      eq2(products.salonId, salonId),
      sql`${products.stock} <= ${products.minStock}`
    )
  ).orderBy(asc(products.stock));
}
async function saveAppointmentProducts(appointmentId, salonId, items) {
  const db = await getDb();
  if (!db || items.length === 0) return;
  for (const item of items) {
    await db.insert(appointmentProducts).values({
      id: nanoid(),
      appointmentId,
      productId: item.productId,
      salonId,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString()
    });
    await db.update(products).set({
      stock: sql`GREATEST(0, ${products.stock} - ${item.quantity})`,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq2(products.id, item.productId));
  }
}
async function createRating(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(ratings).values(data).returning();
  return result[0] ?? null;
}
async function getRatingByToken(token) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(ratings).where(eq2(ratings.token, token)).limit(1);
  return result[0] ?? null;
}
async function submitRating(token, stars, comment) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.update(ratings).set({
    stars,
    comment: comment ?? null,
    used: true,
    submittedAt: /* @__PURE__ */ new Date()
  }).where(eq2(ratings.token, token)).returning();
  return result.length > 0;
}
async function getRatingsBySpecialist(specialistId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(ratings).where(eq2(ratings.specialistId, specialistId));
}
async function getAllRatingsBySalon(salonId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: ratings.id,
    stars: ratings.stars,
    comment: ratings.comment,
    clientName: ratings.clientName,
    submittedAt: ratings.submittedAt,
    specialistId: ratings.specialistId,
    specialistName: specialists.name
  }).from(ratings).leftJoin(specialists, eq2(ratings.specialistId, specialists.id)).where(and(eq2(ratings.salonId, salonId), eq2(ratings.used, true))).orderBy(sql`${ratings.submittedAt} DESC NULLS LAST`);
}
async function getAllSpecialistRatings(salonId) {
  const db = await getDb();
  if (!db) return {};
  const rows = await db.select({
    specialistId: ratings.specialistId,
    average: sql`ROUND(AVG(${ratings.stars})::numeric, 1)`,
    count: sql`COUNT(*)`
  }).from(ratings).where(eq2(ratings.salonId, salonId)).groupBy(ratings.specialistId);
  const map = {};
  for (const row of rows) {
    if (row.specialistId && Number(row.count) > 0) {
      map[row.specialistId] = {
        average: Number(row.average),
        count: Number(row.count)
      };
    }
  }
  return map;
}
var _db, dashboardMetricsCache, DASHBOARD_CACHE_TTL_MS;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_schema();
    init_relations();
    init_env();
    _db = null;
    dashboardMetricsCache = /* @__PURE__ */ new Map();
    DASHBOARD_CACHE_TTL_MS = 10 * 60 * 1e3;
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "session_token";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/oauth.ts
init_db();

// server/_core/cookies.ts
init_env();
function getSessionCookieOptions(_req) {
  const isProd = ENV.isProduction;
  const domain = (() => {
    if (!isProd) return void 0;
    const frontend = process.env.FRONTEND_URL;
    if (!frontend) return void 0;
    try {
      return new URL(frontend).hostname;
    } catch {
      return void 0;
    }
  })();
  return {
    httpOnly: isProd ? true : false,
    path: "/",
    sameSite: isProd ? "lax" : "lax",
    secure: isProd ? true : false,
    domain
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message, code, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = "HttpError";
  }
  toJSON() {
    return {
      name: this.name,
      statusCode: this.statusCode,
      message: this.message,
      code: this.code,
      details: this.details,
      stack: false ? this.stack : void 0
    };
  }
};
var ForbiddenError = (msg, code, details) => new HttpError(403, msg, code, details);

// server/_core/sdk.ts
init_db();
init_env();
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const external = data;
    const platformsArr = Array.isArray(external.platforms) ? external.platforms : external.platforms ? [external.platforms] : external.platform ? [external.platform] : [];
    const loginMethod = this.deriveLoginMethod(
      Array.isArray(platformsArr) ? platformsArr : [],
      typeof external.platform === "string" ? external.platform : null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a user ID
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.id);
   */
  async createSessionToken(userId, options = {}) {
    const token = await this.signSession(
      {
        openId: userId,
        appId: ENV.appId || "system-salon",
        name: options.name || ""
      },
      options
    );
    return token;
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch {
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const external2 = data;
    const platformsArr2 = Array.isArray(external2.platforms) ? external2.platforms : external2.platforms ? [external2.platforms] : external2.platform ? [external2.platform] : [];
    const loginMethod = this.deriveLoginMethod(
      Array.isArray(platformsArr2) ? platformsArr2 : [],
      typeof external2.platform === "string" ? external2.platform : null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    let bearerToken = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      bearerToken = authHeader.substring(7);
    }
    const token = sessionCookie || bearerToken;
    if (!token) {
      throw ForbiddenError("No authentication token provided");
    }
    const session = await this.verifySession(token);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUser(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          id: userInfo.openId,
          name: userInfo.name ?? void 0,
          email: userInfo.email ?? void 0,
          lastSignedIn: signedInAt
          // Adicione outros campos do tipo InsertUser se necessário, sempre validando o tipo
        });
        user = await getUser(userInfo.openId);
      } catch {
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      id: user.id,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        id: userInfo.openId,
        name: userInfo.name ?? void 0,
        email: userInfo.email ?? void 0,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS
      });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/routers.ts
import { TRPCError as TRPCError4 } from "@trpc/server";

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError as TRPCError2 } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError2({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError2({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError2({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError2({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError2({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError2({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/stripe.ts
async function createStripePaymentIntent(input) {
  const amountInCents = Math.round(input.amount * 100);
  if (false) {
    console.log("\u{1F537} [Stripe Mock] Criando Payment Intent:", {
      amount: amountInCents,
      currency: input.currency || "brl",
      description: input.description || "Pagamento BizFlow"
    });
    return {
      id: `pi_mock_${Date.now()}`,
      amount: amountInCents,
      currency: input.currency || "brl",
      status: "requires_payment_method",
      clientSecret: `pi_mock_${Date.now()}_secret_mock`
    };
  }
  throw new Error("Stripe n\xE3o configurado em produ\xE7\xE3o");
}
async function confirmStripePayment(paymentIntentId) {
  if (false) {
    console.log("\u{1F537} [Stripe Mock] Confirmando pagamento:", paymentIntentId);
    return {
      success: true,
      transactionId: `txn_mock_${Date.now()}`,
      paymentMethod: "stripe",
      stripePaymentIntentId: paymentIntentId
    };
  }
  return { success: false, error: "Stripe n\xE3o configurado" };
}
function generatePaymentOptions(amount, pixKey, _salonName) {
  const options = [
    {
      method: "pix",
      label: "PIX",
      icon: "qr-code",
      description: pixKey ? "Pague via QR Code PIX" : "Chave PIX n\xE3o cadastrada"
    },
    {
      method: "stripe",
      label: "Cart\xE3o (Stripe)",
      icon: "credit-card",
      description: "Pagamento via cart\xE3o de cr\xE9dito ou d\xE9bito"
    },
    {
      method: "cash",
      label: "Dinheiro",
      icon: "banknote",
      description: "Pague em dinheiro no local"
    },
    {
      method: "credit_card",
      label: "Cart\xE3o de Cr\xE9dito",
      icon: "credit-card",
      description: "Pague com cart\xE3o de cr\xE9dito (maquininha)"
    },
    {
      method: "debit_card",
      label: "Cart\xE3o de D\xE9bito",
      icon: "credit-card",
      description: "Pague com cart\xE3o de d\xE9bito (maquininha)"
    }
  ];
  return options;
}

// server/routers.ts
import { z as z4 } from "zod";
import bcrypt from "bcrypt";
import crypto from "crypto";
init_env();
init_db();
import { eq as eq7 } from "drizzle-orm";

// server/notifications.ts
init_db();
init_schema();
import { eq as eq4 } from "drizzle-orm";
var defaultTemplates = {
  appointment_confirmation: {
    id: "appointment_confirmation",
    type: "appointment_confirmation",
    title: "Agendamento Confirmado",
    message: "Seu agendamento foi confirmado para {date} \xE0s {time} com {specialist}.",
    smsTemplate: "Confirmado: {service} em {date} \xE0s {time} com {specialist}. Sal\xE3o: {salon_name}",
    emailTemplate: `
      <h2>Agendamento Confirmado</h2>
      <p>Ol\xE1 {client_name},</p>
      <p>Seu agendamento foi confirmado com sucesso!</p>
      <div style="background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
        <strong>Detalhes do Agendamento:</strong><br>
        \u2022 Servi\xE7o: {service}<br>
        \u2022 Data: {date}<br>
        \u2022 Hor\xE1rio: {time}<br>
        \u2022 Especialista: {specialist}<br>
        \u2022 Dura\xE7\xE3o: {duration} minutos<br>
        \u2022 Valor: R$ {price}
      </div>
      <p>Endere\xE7o: {salon_address}</p>
      <p>Em caso de d\xFAvidas, entre em contato: {salon_phone}</p>
    `,
    whatsappTemplate: "\u2705 *Confirmado!*\n\n\u{1F5D3}\uFE0F {service}\n\u{1F4C5} {date} \xE0s {time}\n\u{1F469}\u200D\u{1F4BC} {specialist}\n\u{1F3EA} {salon_name}\n\nNos vemos l\xE1! \u{1F484}\u2728"
  },
  appointment_reminder: {
    id: "appointment_reminder",
    type: "appointment_reminder",
    title: "Lembrete de Agendamento",
    message: "Lembrete: Voc\xEA tem um agendamento amanh\xE3 \xE0s {time} com {specialist}.",
    smsTemplate: "Lembrete: {service} amanh\xE3 \xE0s {time} com {specialist}. {salon_name}",
    emailTemplate: `
      <h2>Lembrete de Agendamento</h2>
      <p>Ol\xE1 {client_name},</p>
      <p>Este \xE9 um lembrete do seu agendamento:</p>
      <div style="background: #fff3cd; padding: 15px; margin: 15px 0; border-radius: 5px; border: 1px solid #ffeaa7;">
        <strong>Amanh\xE3 \xE0s {time}</strong><br>
        \u2022 Servi\xE7o: {service}<br>
        \u2022 Especialista: {specialist}<br>
        \u2022 Dura\xE7\xE3o: {duration} minutos
      </div>
      <p>N\xE3o esque\xE7a! Nos vemos em breve \u{1F60A}</p>
    `,
    whatsappTemplate: "\u23F0 *Lembrete*\n\n\u{1F5D3}\uFE0F Amanh\xE3 \xE0s {time}\n\u{1F484} {service}\n\u{1F469}\u200D\u{1F4BC} {specialist}\n\nNos vemos l\xE1! \u2728"
  },
  appointment_cancellation: {
    id: "appointment_cancellation",
    type: "appointment_cancellation",
    title: "Agendamento Cancelado",
    message: "Seu agendamento para {date} \xE0s {time} foi cancelado.",
    smsTemplate: "Cancelado: {service} em {date} \xE0s {time}. Para reagendar: {salon_phone}",
    emailTemplate: `
      <h2>Agendamento Cancelado</h2>
      <p>Ol\xE1 {client_name},</p>
      <p>Informamos que seu agendamento foi cancelado:</p>
      <div style="background: #f8d7da; padding: 15px; margin: 15px 0; border-radius: 5px; border: 1px solid #f5c6cb;">
        <strong>Agendamento Cancelado:</strong><br>
        \u2022 Servi\xE7o: {service}<br>
        \u2022 Data: {date}<br>
        \u2022 Hor\xE1rio: {time}<br>
        \u2022 Especialista: {specialist}
      </div>
      <p>Para reagendar, entre em contato: {salon_phone}</p>
      <p>Pedimos desculpas pelo inconveniente.</p>
    `,
    whatsappTemplate: "\u274C *Cancelado*\n\n{service} em {date} \xE0s {time}\n\nPara reagendar: {salon_phone}\n\nDesculpe o inconveniente! \u{1F64F}"
  },
  waitlist_available: {
    id: "waitlist_available",
    type: "waitlist_available",
    title: "Hor\xE1rio Dispon\xEDvel",
    message: "Temos um hor\xE1rio dispon\xEDvel para {service} em {date} \xE0s {time}.",
    smsTemplate: "Hor\xE1rio dispon\xEDvel: {service} em {date} \xE0s {time}. Confirme at\xE9 {deadline}",
    emailTemplate: `
      <h2>Hor\xE1rio Dispon\xEDvel na Lista de Espera</h2>
      <p>Ol\xE1 {client_name},</p>
      <p>Temos boas not\xEDcias! Um hor\xE1rio ficou dispon\xEDvel:</p>
      <div style="background: #d4edda; padding: 15px; margin: 15px 0; border-radius: 5px; border: 1px solid #c3e6cb;">
        <strong>Hor\xE1rio Dispon\xEDvel:</strong><br>
        \u2022 Servi\xE7o: {service}<br>
        \u2022 Data: {date}<br>
        \u2022 Hor\xE1rio: {time}<br>
        \u2022 Especialista: {specialist}
      </div>
      <p><strong>Confirme at\xE9 {deadline} para garantir o hor\xE1rio!</strong></p>
      <p>Clique aqui para confirmar: {confirm_link}</p>
    `,
    whatsappTemplate: "\u{1F389} *Hor\xE1rio Dispon\xEDvel!*\n\n\u{1F484} {service}\n\u{1F4C5} {date} \xE0s {time}\n\u{1F469}\u200D\u{1F4BC} {specialist}\n\n\u23F0 Confirme at\xE9 {deadline}\n{confirm_link}"
  }
};
async function scheduleAppointmentNotifications(appointmentId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const appointment = await db.select({
    id: appointments.id,
    appointmentDate: appointments.appointmentDate,
    appointmentTime: appointments.appointmentTime,
    clientId: appointments.clientId
  }).from(appointments).where(eq4(appointments.id, appointmentId)).limit(1);
  if (!appointment.length) {
    throw new Error("Agendamento n\xE3o encontrado");
  }
  const appt = appointment[0];
  const appointmentDateTime = /* @__PURE__ */ new Date(
    `${appt.appointmentDate.toISOString().split("T")[0]}T${appt.appointmentTime}:00`
  );
  await scheduleNotification({
    appointmentId,
    type: "confirmation",
    scheduledFor: /* @__PURE__ */ new Date(),
    // Enviar agora
    channel: "whatsapp"
    // Prioridade WhatsApp
  });
  const reminder24h = new Date(
    appointmentDateTime.getTime() - 24 * 60 * 60 * 1e3
  );
  if (reminder24h > /* @__PURE__ */ new Date()) {
    await scheduleNotification({
      appointmentId,
      type: "reminder_24h",
      scheduledFor: reminder24h,
      channel: "whatsapp"
    });
  }
  const reminder2h = new Date(
    appointmentDateTime.getTime() - 2 * 60 * 60 * 1e3
  );
  if (reminder2h > /* @__PURE__ */ new Date()) {
    await scheduleNotification({
      appointmentId,
      type: "reminder_2h",
      scheduledFor: reminder2h,
      channel: "sms"
    });
  }
}
async function scheduleNotification(job) {
  if (false) {
    console.log("\u{1F4C5} Notifica\xE7\xE3o agendada:", {
      appointmentId: job.appointmentId,
      type: job.type,
      scheduledFor: job.scheduledFor,
      channel: job.channel
    });
  }
  if (job.type === "confirmation") {
    await sendNotification(job.appointmentId, job.type, job.channel);
  }
}
async function sendNotification(appointmentId, type, channel) {
  try {
    const appointmentData = await getAppointmentNotificationData(appointmentId);
    let template;
    switch (type) {
      case "confirmation":
        template = defaultTemplates.appointment_confirmation;
        break;
      case "reminder_24h":
      case "reminder_2h":
        template = defaultTemplates.appointment_reminder;
        break;
      default:
        throw new Error(`Tipo de notifica\xE7\xE3o n\xE3o suportado: ${type}`);
    }
    const message = renderTemplate(template, appointmentData, channel);
    if (false) {
      console.log(
        `\u{1F4F1} Enviando ${channel.toUpperCase()} para ${appointmentData.client_name}:`,
        message
      );
    }
    return { success: true, message: "Notifica\xE7\xE3o enviada com sucesso" };
  } catch (err) {
    console.error("\u274C Erro ao enviar notifica\xE7\xE3o:", err);
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
async function getAppointmentNotificationData(appointmentId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select({
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
    specialist_phone: specialists.phone
  }).from(appointments).innerJoin(clients, eq4(appointments.clientId, clients.id)).innerJoin(services, eq4(appointments.serviceId, services.id)).innerJoin(specialists, eq4(appointments.specialistId, specialists.id)).where(eq4(appointments.id, appointmentId)).limit(1);
  if (!result.length) {
    throw new Error("Dados do agendamento n\xE3o encontrados");
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
    salon_name: "Sal\xE3o de Beleza",
    salon_phone: "(11) 99999-9999",
    salon_address: "Rua das Flores, 123 - Centro"
  };
}
function renderTemplate(template, data, channel) {
  let message;
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
  return message.replace(/\{([^}]+)\}/g, (match, key) => {
    const val = data[key];
    return val !== void 0 && val !== null ? String(val) : match;
  });
}

// server/waitlist.ts
var waitlistStorage = [];
var waitlistIdCounter = 1;
function generateWaitlistId() {
  return `waitlist_${waitlistIdCounter++}`;
}
async function addToWaitlist(entry) {
  const newEntry = {
    ...entry,
    id: generateWaitlistId(),
    status: "active",
    createdAt: /* @__PURE__ */ new Date()
  };
  waitlistStorage.push(newEntry);
  if (false) {
    console.log(`\u{1F4DD} Cliente adicionado \xE0 lista de espera:`, {
      id: newEntry.id,
      clientId: newEntry.clientId,
      serviceId: newEntry.serviceId,
      priority: newEntry.priority
    });
  }
  return newEntry;
}
async function removeFromWaitlist(waitlistId) {
  const initialLength = waitlistStorage.length;
  waitlistStorage = waitlistStorage.filter((entry) => entry.id !== waitlistId);
  const removed = waitlistStorage.length < initialLength;
  if (removed) {
    if (false) {
      console.log(`\u{1F5D1}\uFE0F Removido da lista de espera: ${waitlistId}`);
    }
  }
  return removed;
}
async function getActiveWaitlistEntries(serviceId, specialistId) {
  let entries = waitlistStorage.filter((entry) => entry.status === "active");
  if (serviceId) {
    entries = entries.filter((entry) => entry.serviceId === serviceId);
  }
  if (specialistId) {
    entries = entries.filter(
      (entry) => !entry.specialistId || entry.specialistId === specialistId
    );
  }
  entries.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
  return entries;
}
async function checkWaitlistForSlot(serviceId, specialistId, date, time) {
  const entries = await getActiveWaitlistEntries(serviceId, specialistId);
  for (const entry of entries) {
    if (entry.preferredDate && entry.preferredDate.toDateString() !== date.toDateString()) {
      continue;
    }
    if (entry.preferredTimeStart && time < entry.preferredTimeStart) {
      continue;
    }
    if (entry.preferredTimeEnd && time > entry.preferredTimeEnd) {
      continue;
    }
    const daysDiff = Math.floor(
      (date.getTime() - entry.createdAt.getTime()) / (1e3 * 60 * 60 * 24)
    );
    if (daysDiff > entry.maxWaitDays) {
      entry.status = "expired";
      continue;
    }
    return entry;
  }
  return null;
}
async function confirmWaitlistSlot(waitlistId) {
  const entry = waitlistStorage.find((e) => e.id === waitlistId);
  if (!entry) {
    return {
      success: false,
      error: "Entrada da lista de espera n\xE3o encontrada"
    };
  }
  if (entry.status !== "notified") {
    return { success: false, error: "Esta oferta n\xE3o est\xE1 mais dispon\xEDvel" };
  }
  if (entry.expiresAt && /* @__PURE__ */ new Date() > entry.expiresAt) {
    entry.status = "expired";
    return { success: false, error: "O prazo para confirma\xE7\xE3o expirou" };
  }
  entry.status = "confirmed";
  const appointmentId = `appt_${Date.now()}`;
  if (false) {
    console.log(`\u2705 Hor\xE1rio da lista de espera confirmado:`, {
      waitlistId,
      appointmentId,
      clientId: entry.clientId
    });
  }
  return { success: true, appointmentId };
}
async function getWaitlistStats() {
  const stats = {
    total: waitlistStorage.length,
    active: 0,
    notified: 0,
    confirmed: 0,
    expired: 0,
    byService: {},
    byPriority: {}
  };
  for (const entry of waitlistStorage) {
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
    stats.byService[entry.serviceId] = (stats.byService[entry.serviceId] || 0) + 1;
    stats.byPriority[entry.priority] = (stats.byPriority[entry.priority] || 0) + 1;
  }
  return stats;
}

// server/reports.ts
init_db();
init_schema();
import { eq as eq5, and as and2, gte as gte2, lte as lte2, desc as desc2 } from "drizzle-orm";
async function generateAppointmentStats(salonId, filter = {}) {
  const db = await getDb();
  if (!db) {
    return {
      total: 0,
      completed: 0,
      cancelled: 0,
      pending: 0,
      confirmed: 0,
      revenue: 0,
      averageTicket: 0
    };
  }
  const conditions = [eq5(specialists.salonId, salonId)];
  if (filter.startDate) {
    conditions.push(gte2(appointments.appointmentDate, filter.startDate));
  }
  if (filter.endDate) {
    conditions.push(lte2(appointments.appointmentDate, filter.endDate));
  }
  if (filter.specialistId) {
    conditions.push(eq5(appointments.specialistId, filter.specialistId));
  }
  if (filter.serviceId) {
    conditions.push(eq5(appointments.serviceId, filter.serviceId));
  }
  if (filter.status) {
    conditions.push(eq5(appointments.status, filter.status));
  }
  const results = await db.select({
    id: appointments.id,
    status: appointments.status,
    servicePrice: services.price,
    appointmentDate: appointments.appointmentDate
  }).from(appointments).innerJoin(services, eq5(appointments.serviceId, services.id)).innerJoin(specialists, eq5(appointments.specialistId, specialists.id)).where(and2(...conditions));
  const stats = {
    total: results.length,
    completed: results.filter((r) => r.status === "completed").length,
    cancelled: results.filter((r) => r.status === "cancelled").length,
    pending: results.filter((r) => r.status === "pending").length,
    confirmed: results.filter((r) => r.status === "confirmed").length,
    revenue: 0,
    averageTicket: 0
  };
  const completedRevenue = results.filter((r) => r.status === "completed").reduce((sum2, r) => sum2 + Number(r.servicePrice ?? 0), 0);
  stats.revenue = completedRevenue;
  stats.averageTicket = stats.completed > 0 ? stats.revenue / stats.completed : 0;
  return stats;
}
async function generateSpecialistPerformance(salonId, _filter = {}) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select({
    specialistId: specialists.id,
    specialistName: specialists.name,
    appointmentId: appointments.id,
    status: appointments.status,
    serviceId: services.id,
    serviceName: services.name,
    servicePrice: services.price
  }).from(appointments).innerJoin(services, eq5(appointments.serviceId, services.id)).innerJoin(specialists, eq5(appointments.specialistId, specialists.id)).where(eq5(specialists.salonId, salonId));
  const specialistMap = /* @__PURE__ */ new Map();
  for (const result of results) {
    if (!specialistMap.has(result.specialistId)) {
      specialistMap.set(result.specialistId, {
        name: result.specialistName,
        appointments: []
      });
    }
    const entry = specialistMap.get(result.specialistId);
    if (entry) entry.appointments.push(result);
  }
  const performance = [];
  for (const [specialistId, data] of specialistMap) {
    const appointments2 = data.appointments;
    const completed = appointments2.filter((a) => a.status === "completed");
    const cancelled = appointments2.filter((a) => a.status === "cancelled");
    const revenue = completed.reduce(
      (sum2, a) => sum2 + Number(a.servicePrice ?? 0),
      0
    );
    const serviceMap = /* @__PURE__ */ new Map();
    for (const appt of completed) {
      const sid = appt.serviceId;
      if (!sid) continue;
      const sname = appt.serviceName ?? "";
      if (!serviceMap.has(sid)) {
        serviceMap.set(sid, { name: sname, count: 0, revenue: 0 });
      }
      const svc = serviceMap.get(sid);
      if (svc) {
        svc.count++;
        svc.revenue += Number(appt.servicePrice ?? 0);
      }
    }
    const topServices = Array.from(serviceMap.entries()).map(([serviceId, data2]) => ({
      serviceId,
      serviceName: data2.name,
      count: data2.count,
      revenue: data2.revenue
    })).sort((a, b) => b.count - a.count).slice(0, 5);
    performance.push({
      specialistId,
      specialistName: data.name,
      totalAppointments: appointments2.length,
      completedAppointments: completed.length,
      cancelledAppointments: cancelled.length,
      revenue,
      averageTicket: completed.length > 0 ? revenue / completed.length : 0,
      completionRate: appointments2.length > 0 ? completed.length / appointments2.length * 100 : 0,
      cancellationRate: appointments2.length > 0 ? cancelled.length / appointments2.length * 100 : 0,
      topServices
    });
  }
  return performance.sort((a, b) => b.revenue - a.revenue);
}
async function generateServicePopularity(salonId, _filter = {}) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select({
    serviceId: services.id,
    serviceName: services.name,
    serviceDuration: services.duration,
    servicePrice: services.price,
    appointmentTime: appointments.appointmentTime,
    status: appointments.status
  }).from(appointments).innerJoin(services, eq5(appointments.serviceId, services.id)).innerJoin(specialists, eq5(appointments.specialistId, specialists.id)).where(eq5(specialists.salonId, salonId));
  const serviceMap = /* @__PURE__ */ new Map();
  for (const result of results) {
    if (!serviceMap.has(result.serviceId)) {
      serviceMap.set(result.serviceId, {
        name: result.serviceName,
        duration: result.serviceDuration ?? 0,
        appointments: []
      });
    }
    const entry = serviceMap.get(result.serviceId);
    if (entry) entry.appointments.push(result);
  }
  const popularity = [];
  for (const [serviceId, data] of serviceMap) {
    const appointments2 = data.appointments;
    const completed = appointments2.filter((a) => a.status === "completed");
    const revenue = completed.reduce(
      (sum2, a) => sum2 + Number(a.servicePrice ?? 0),
      0
    );
    const timeSlotMap = /* @__PURE__ */ new Map();
    for (const appt of completed) {
      const hour = (appt.appointmentTime ?? "00:00").split(":")[0] + ":00";
      timeSlotMap.set(hour, (timeSlotMap.get(hour) || 0) + 1);
    }
    const popularTimeSlots = Array.from(timeSlotMap.entries()).map(([timeSlot, count2]) => ({ timeSlot, count: count2 })).sort((a, b) => b.count - a.count).slice(0, 5);
    popularity.push({
      serviceId,
      serviceName: data.name,
      totalBookings: appointments2.length,
      completedBookings: completed.length,
      revenue,
      averageTicket: completed.length > 0 ? revenue / completed.length : 0,
      duration: data.duration,
      popularTimeSlots
    });
  }
  return popularity.sort((a, b) => b.totalBookings - a.totalBookings);
}
async function generateClientAnalytics(salonId, _filter = {}) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select({
    clientId: clients.id,
    clientName: clients.name,
    appointmentDate: appointments.appointmentDate,
    appointmentTime: appointments.appointmentTime,
    status: appointments.status,
    serviceId: services.id,
    serviceName: services.name,
    servicePrice: services.price,
    specialistId: specialists.id,
    specialistName: specialists.name
  }).from(appointments).innerJoin(clients, eq5(appointments.clientId, clients.id)).innerJoin(services, eq5(appointments.serviceId, services.id)).innerJoin(specialists, eq5(appointments.specialistId, specialists.id)).where(eq5(specialists.salonId, salonId)).orderBy(desc2(appointments.appointmentDate));
  const clientMap = /* @__PURE__ */ new Map();
  for (const result of results) {
    if (!clientMap.has(result.clientId)) {
      clientMap.set(result.clientId, {
        name: result.clientName,
        appointments: []
      });
    }
    const entry = clientMap.get(result.clientId);
    if (entry) entry.appointments.push(result);
  }
  const analytics = [];
  for (const [clientId, data] of clientMap) {
    const appointments2 = data.appointments;
    const completed = appointments2.filter((a) => a.status === "completed");
    const totalSpent = completed.reduce(
      (sum2, a) => sum2 + Number(a.servicePrice ?? 0),
      0
    );
    let frequencyDays = 0;
    if (completed.length > 1) {
      const dates = completed.map((a) => a.appointmentDate).sort();
      const intervals = [];
      for (let i = 1; i < dates.length; i++) {
        const diff = Math.abs(dates[i].getTime() - dates[i - 1].getTime()) / (1e3 * 60 * 60 * 24);
        intervals.push(diff);
      }
      frequencyDays = intervals.reduce((sum2, interval) => sum2 + interval, 0) / intervals.length;
    }
    const serviceMap = /* @__PURE__ */ new Map();
    for (const appt of completed) {
      const sid = appt.serviceId;
      if (!sid) continue;
      const sname = appt.serviceName ?? "";
      if (!serviceMap.has(sid)) {
        serviceMap.set(sid, { name: sname, count: 0 });
      }
      const svc = serviceMap.get(sid);
      if (svc) svc.count++;
    }
    const favoriteServices = Array.from(serviceMap.entries()).map(([serviceId, data2]) => ({
      serviceId,
      serviceName: data2.name,
      count: data2.count
    })).sort((a, b) => b.count - a.count).slice(0, 3);
    const specialistMap = /* @__PURE__ */ new Map();
    for (const appt of completed) {
      const sid = appt.specialistId;
      if (!sid) continue;
      const sname = appt.specialistName ?? "";
      if (!specialistMap.has(sid)) {
        specialistMap.set(sid, { name: sname, count: 0 });
      }
      const spec = specialistMap.get(sid);
      if (spec) spec.count++;
    }
    const favoriteSpecialists = Array.from(specialistMap.entries()).map(([specialistId, data2]) => ({
      specialistId,
      specialistName: data2.name,
      count: data2.count
    })).sort((a, b) => b.count - a.count).slice(0, 3);
    const lastVisit = completed.length > 0 ? completed[0].appointmentDate : void 0;
    let riskScore = 0;
    if (lastVisit) {
      const daysSinceLastVisit = Math.floor(
        (Date.now() - lastVisit.getTime()) / (1e3 * 60 * 60 * 24)
      );
      if (frequencyDays > 0) {
        const expectedReturn = frequencyDays * 1.5;
        if (daysSinceLastVisit > expectedReturn) {
          riskScore = Math.min(100, daysSinceLastVisit / expectedReturn * 50);
        }
      } else {
        riskScore = Math.min(100, daysSinceLastVisit / 30 * 25);
      }
    }
    analytics.push({
      clientId,
      clientName: data.name,
      totalAppointments: appointments2.length,
      completedAppointments: completed.length,
      totalSpent,
      averageTicket: completed.length > 0 ? totalSpent / completed.length : 0,
      frequencyDays,
      favoriteServices,
      favoriteSpecialists,
      lastVisit,
      riskScore
    });
  }
  return analytics.sort((a, b) => b.totalSpent - a.totalSpent);
}
async function generateDailyReport(salonId, date) {
  const db = await getDb();
  if (!db)
    return {
      date: date.toISOString().split("T")[0],
      totalAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      revenue: 0,
      busyHours: []
    };
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  const results = await db.select({
    id: appointments.id,
    status: appointments.status,
    appointmentTime: appointments.appointmentTime,
    servicePrice: services.price
  }).from(appointments).innerJoin(services, eq5(appointments.serviceId, services.id)).innerJoin(specialists, eq5(appointments.specialistId, specialists.id)).where(
    and2(
      eq5(specialists.salonId, salonId),
      gte2(appointments.appointmentDate, startOfDay),
      lte2(appointments.appointmentDate, endOfDay)
    )
  );
  const completed = results.filter((r) => r.status === "completed");
  const cancelled = results.filter((r) => r.status === "cancelled");
  const revenue = completed.reduce(
    (sum2, r) => sum2 + Number(r.servicePrice ?? 0),
    0
  );
  const hourMap = /* @__PURE__ */ new Map();
  for (const appt of results) {
    const time = appt.appointmentTime ?? "00:00";
    const hour = time.split(":")[0];
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
  }
  const busyHours = Array.from(hourMap.entries()).map(([hour, appointmentCount]) => ({
    hour: `${hour}:00`,
    appointmentCount
  })).sort((a, b) => b.appointmentCount - a.appointmentCount);
  return {
    date: date.toISOString().split("T")[0],
    totalAppointments: results.length,
    completedAppointments: completed.length,
    cancelledAppointments: cancelled.length,
    revenue,
    busyHours
  };
}
function exportToCSV(headersOrData, rows) {
  if (Array.isArray(headersOrData) && headersOrData.length === 0) return "";
  if (rows !== void 0) {
    const headers2 = headersOrData;
    const escapeCSV = (val) => val.includes(",") || val.includes('"') || val.includes("\n") ? `"${val.replace(/"/g, '""')}"` : val;
    return [headers2.join(","), ...rows.map((row) => row.map(escapeCSV).join(","))].join("\n");
  }
  const data = headersOrData;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map(
      (row) => headers.map((header) => {
        const value = row[header];
        let out = "";
        if (value === null || value === void 0) {
          out = "";
        } else if (typeof value === "string") {
          out = value.includes(",") ? `"${value}"` : value;
        } else if (typeof value === "number") {
          out = value;
        } else {
          try {
            out = JSON.stringify(value);
          } catch {
            out = "";
          }
        }
        return out;
      }).join(",")
    )
  ].join("\n");
  return csvContent;
}

// server/routers.ts
init_specialist_schedule();

// shared/validations.ts
import { z as z2 } from "zod";
var sanitizeString = (str) => {
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/<[^>]*>/g, "").trim();
};
var safeText = (max, label) => z2.string().max(max, `${label} muito longo`).transform(sanitizeString);
var loginSchema = z2.object({
  email: z2.string().email("Email inv\xE1lido").max(320, "Email muito longo").toLowerCase().trim(),
  password: z2.string().min(6, "Senha deve ter no m\xEDnimo 6 caracteres").max(100, "Senha muito longa")
});
var registerSchema = z2.object({
  email: z2.string().email("Email inv\xE1lido").max(320, "Email muito longo").toLowerCase().trim(),
  password: z2.string().min(8, "Senha deve ter no m\xEDnimo 8 caracteres").max(100, "Senha muito longa").regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?])/,
    "Senha deve conter mai\xFAsculas, min\xFAsculas, n\xFAmeros e um caractere especial"
  ),
  name: z2.string().min(2, "Nome deve ter no m\xEDnimo 2 caracteres").max(100, "Nome muito longo").transform(sanitizeString)
});
var passwordResetRequestSchema = z2.object({
  email: z2.string().email("Email inv\xE1lido").max(320, "Email muito longo").toLowerCase().trim()
});
var passwordResetSchema = z2.object({
  // Tokens são hashes (hex/base64) — máximo razoável de 128 chars
  token: z2.string().min(10, "Token inv\xE1lido").max(128, "Token inv\xE1lido"),
  password: z2.string().min(8, "Senha deve ter no m\xEDnimo 8 caracteres").max(100, "Senha muito longa")
});
var salonSchema = z2.object({
  name: z2.string().min(2, "Nome do sal\xE3o \xE9 obrigat\xF3rio").max(200, "Nome muito longo").transform(sanitizeString),
  cnpj: z2.string().max(20, "CNPJ inv\xE1lido").optional(),
  address: safeText(500, "Endere\xE7o").optional(),
  phone: z2.string().max(20, "Telefone inv\xE1lido").optional(),
  email: z2.string().email("Email inv\xE1lido").max(320, "Email muito longo").optional(),
  logo: z2.string().url("URL inv\xE1lida").max(1e3, "URL muito longa").optional(),
  // Chave PIX: aceita qualquer formato (CPF, CNPJ, email, telefone, chave aleatória)
  pixKey: z2.string().max(200, "Chave PIX muito longa").optional(),
  workingHours: z2.record(
    z2.string(),
    z2.array(
      z2.object({
        start: z2.string().regex(/^\d{2}:\d{2}$/, "Formato de hor\xE1rio inv\xE1lido"),
        end: z2.string().regex(/^\d{2}:\d{2}$/, "Formato de hor\xE1rio inv\xE1lido"),
        lunch: z2.object({
          start: z2.string().regex(/^\d{2}:\d{2}$/, "Formato de hor\xE1rio inv\xE1lido"),
          end: z2.string().regex(/^\d{2}:\d{2}$/, "Formato de hor\xE1rio inv\xE1lido")
        }).optional()
      })
    )
  ).optional()
});
var specialistSchema = z2.object({
  name: z2.string().min(2, "Nome do especialista \xE9 obrigat\xF3rio").max(200, "Nome muito longo").transform(sanitizeString),
  specialty: safeText(255, "Especialidade").optional(),
  photo: z2.string().url("URL inv\xE1lida").max(1e3, "URL muito longa").optional(),
  email: z2.string().email("Email inv\xE1lido").max(320, "Email muito longo").optional(),
  phone: z2.string().max(20, "Telefone inv\xE1lido").optional(),
  bio: safeText(1e3, "Biografia").optional(),
  workingDays: z2.record(
    z2.string(),
    z2.array(
      z2.object({
        start: z2.string().regex(/^\d{2}:\d{2}$/, "Formato de hor\xE1rio inv\xE1lido"),
        end: z2.string().regex(/^\d{2}:\d{2}$/, "Formato de hor\xE1rio inv\xE1lido"),
        lunch: z2.object({
          start: z2.string().regex(/^\d{2}:\d{2}$/, "Formato de hor\xE1rio inv\xE1lido"),
          end: z2.string().regex(/^\d{2}:\d{2}$/, "Formato de hor\xE1rio inv\xE1lido")
        }).optional()
      })
    )
  ).optional(),
  status: z2.enum(["active", "inactive"]).default("active")
});
var scheduleSchema = z2.object({
  timeSlotDuration: z2.number().int().min(1).default(30),
  bufferTime: z2.number().int().min(0).default(0),
  allowBookingDaysInAdvance: z2.number().int().min(0).default(30),
  minimumNoticeHours: z2.number().int().min(0).default(2),
  autoConfirmBookings: z2.boolean().default(true),
  allowOnlineBooking: z2.boolean().default(true),
  workingHours: z2.array(
    z2.object({
      dayOfWeek: z2.number().int().min(0).max(6),
      isWorking: z2.boolean(),
      startTime: z2.string().optional(),
      endTime: z2.string().optional(),
      breakStartTime: z2.string().optional(),
      breakEndTime: z2.string().optional()
    })
  )
  // OBRIGATÓRIO - array com 7 dias (0-6)
});
var clientSchema = z2.object({
  name: z2.string().min(2, "Nome do cliente \xE9 obrigat\xF3rio").transform(sanitizeString),
  email: z2.string().email().optional(),
  phone: z2.string().optional(),
  birthDate: z2.date().optional(),
  notes: safeText(1e3, "Notas").optional(),
  // URL da foto do cliente (salva no Cloudinary)
  photo: z2.string().url().optional().or(z2.literal(""))
});
var serviceSchema = z2.object({
  name: z2.string().min(2, "Nome do servi\xE7o \xE9 obrigat\xF3rio").transform(sanitizeString),
  description: safeText(500, "Descri\xE7\xE3o").optional(),
  duration: z2.number().int().positive("Dura\xE7\xE3o deve ser positiva"),
  // Indica se o preço é um valor mínimo ('a partir de')
  priceFrom: z2.boolean().optional().default(false),
  price: z2.string().or(z2.number()).refine((val) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return num >= 0;
  }, "Pre\xE7o deve ser positivo"),
  status: z2.enum(["active", "inactive"]).default("active"),
  specialistId: z2.string().nullable().optional()
});
var appointmentSchema = z2.object({
  clientId: z2.string().min(1, "Cliente \xE9 obrigat\xF3rio"),
  serviceId: z2.string().min(1, "Servi\xE7o \xE9 obrigat\xF3rio"),
  specialistId: z2.string().min(1, "Especialista \xE9 obrigat\xF3rio"),
  appointmentDate: z2.date(),
  appointmentTime: z2.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inv\xE1lido (HH:MM)").refine(
    (val) => {
      const [h, m] = val.split(":").map(Number);
      return h >= 0 && h <= 23 && m >= 0 && m <= 59;
    },
    { message: "Hora inv\xE1lida (00:00 - 23:59)" }
  ),
  status: z2.enum(["pending", "confirmed", "completed", "cancelled"]).default("pending"),
  notes: safeText(1e3, "Notas").optional()
});
var appointmentPublicSchema = z2.object({
  serviceId: z2.string().min(1, "Servi\xE7o \xE9 obrigat\xF3rio"),
  specialistId: z2.string().optional(),
  appointmentDate: z2.date(),
  appointmentTime: z2.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inv\xE1lido (HH:MM)"),
  clientName: z2.string().min(2, "Nome \xE9 obrigat\xF3rio").transform(sanitizeString),
  clientEmail: z2.string().email("Email inv\xE1lido"),
  clientPhone: z2.string().min(10, "Telefone inv\xE1lido")
});
var productSchema = z2.object({
  name: z2.string().min(2, "Nome deve ter pelo menos 2 caracteres").transform(sanitizeString),
  description: safeText(500, "Descri\xE7\xE3o").optional(),
  // Estoque atual e estoque mínimo para alerta
  stock: z2.coerce.number().int().min(0, "Estoque n\xE3o pode ser negativo").default(0),
  minStock: z2.coerce.number().int().min(0, "Estoque m\xEDnimo n\xE3o pode ser negativo").default(5),
  // Preços opcionais em string decimal (ex: "19.90")
  costPrice: z2.string().optional().nullable(),
  sellPrice: z2.string().optional().nullable()
});

// server/cloudinary.ts
init_env();
import cloudinary from "cloudinary";
cloudinary.v2.config({
  cloud_name: ENV.cloudinaryCloudName,
  api_key: ENV.cloudinaryApiKey,
  api_secret: ENV.cloudinaryApiSecret
});
async function uploadBase64Image(base64Data, publicId) {
  const result = await cloudinary.v2.uploader.upload(base64Data, {
    folder: "specialists",
    public_id: publicId,
    overwrite: true
  });
  return { url: result.secure_url, public_id: result.public_id };
}

// server/public-booking.ts
import { z as z3 } from "zod";
init_db();
init_schema();
import { TRPCError as TRPCError3 } from "@trpc/server";
import { eq as eq6, and as and3 } from "drizzle-orm";
var publicBookingSchema = z3.object({
  specialistId: z3.string().min(1),
  serviceId: z3.string().min(1),
  clientName: z3.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  clientPhone: z3.string().min(10, "Telefone deve ter pelo menos 10 d\xEDgitos"),
  clientEmail: z3.string().email("Email inv\xE1lido").optional(),
  appointmentDate: z3.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inv\xE1lido"),
  appointmentTime: z3.string().regex(/^\d{2}:\d{2}$/, "Formato de hor\xE1rio inv\xE1lido"),
  notes: z3.string().optional()
});
var publicBookingRouter = router({
  // Buscar informações do salão e especialistas para página pública
  getSalonInfo: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const salon = await db.select({
      id: salons.id,
      name: salons.name,
      address: salons.address,
      phone: salons.phone,
      email: salons.email
    }).from(salons).limit(1);
    if (!salon[0]) {
      throw new Error("Sal\xE3o n\xE3o encontrado");
    }
    return salon[0];
  }),
  // Buscar todos os especialistas ativos
  getAllSpecialists: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const activeSpecialists = await db.select({
      id: specialists.id,
      name: specialists.name,
      specialty: specialists.specialty,
      photo: specialists.photo,
      bio: specialists.bio,
      workingDays: specialists.workingDays
    }).from(specialists).where(eq6(specialists.status, "active"));
    return activeSpecialists;
  }),
  // Buscar informações do especialista para página pública
  getSpecialistInfo: publicProcedure.input(z3.object({ specialistId: z3.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const specialist = await db.select({
      id: specialists.id,
      name: specialists.name,
      specialty: specialists.specialty,
      photo: specialists.photo,
      bio: specialists.bio,
      workingDays: specialists.workingDays,
      salonName: salons.name,
      salonAddress: salons.address,
      salonPhone: salons.phone
    }).from(specialists).innerJoin(salons, eq6(specialists.salonId, salons.id)).where(eq6(specialists.id, input.specialistId)).limit(1);
    if (!specialist[0]) {
      throw new Error("Especialista n\xE3o encontrado");
    }
    return specialist[0];
  }),
  // Buscar serviços do especialista
  getSpecialistServices: publicProcedure.input(z3.object({ specialistId: z3.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const specialist = await db.select({ salonId: specialists.salonId }).from(specialists).where(eq6(specialists.id, input.specialistId)).limit(1);
    if (!specialist[0]) {
      throw new Error("Especialista n\xE3o encontrado");
    }
    const specialistServices = await db.select({
      id: services.id,
      name: services.name,
      description: services.description,
      duration: services.duration,
      price: services.price,
      priceFrom: services.priceFrom
    }).from(services).where(
      and3(
        eq6(services.salonId, specialist[0].salonId),
        eq6(services.status, "active")
      )
    );
    return specialistServices;
  }),
  // Buscar horários disponíveis — usar função centralizada que já considera schedules
  getAvailableTimeSlots: publicProcedure.input(
    z3.object({
      specialistId: z3.string(),
      serviceId: z3.string(),
      date: z3.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    })
  ).query(async ({ input }) => {
    const date = /* @__PURE__ */ new Date(input.date + "T12:00:00.000Z");
    try {
      const slots = await getAvailableTimeSlots(
        input.specialistId,
        input.serviceId,
        date
      );
      return slots;
    } catch (err) {
      console.error("Erro ao obter hor\xE1rios dispon\xEDveis (public):", err);
      return [];
    }
  }),
  // Criar agendamento público
  createPublicAppointment: publicProcedure.input(publicBookingSchema).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const specialist = await db.select({ salonId: specialists.salonId }).from(specialists).where(
      and3(
        eq6(specialists.id, input.specialistId),
        eq6(specialists.status, "active")
      )
    ).limit(1);
    if (!specialist[0]) {
      throw new Error("Especialista n\xE3o encontrado ou inativo");
    }
    const service = await db.select({ id: services.id }).from(services).where(
      and3(eq6(services.id, input.serviceId), eq6(services.status, "active"))
    ).limit(1);
    if (!service[0]) {
      throw new Error("Servi\xE7o n\xE3o encontrado ou inativo");
    }
    let clientId;
    const existingClient = await db.select({ id: clients.id }).from(clients).where(
      and3(
        eq6(clients.salonId, specialist[0].salonId),
        eq6(clients.phone, input.clientPhone)
      )
    ).limit(1);
    if (existingClient[0]) {
      clientId = existingClient[0].id;
      await db.update(clients).set({
        name: input.clientName,
        email: input.clientEmail || null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq6(clients.id, clientId));
    } else {
      clientId = generateId();
      await db.insert(clients).values({
        id: clientId,
        salonId: specialist[0].salonId,
        name: input.clientName,
        phone: input.clientPhone,
        email: input.clientEmail || null
      });
    }
    const availabilityDate = /* @__PURE__ */ new Date(
      input.appointmentDate + "T12:00:00.000Z"
    );
    const availableSlots = await getAvailableTimeSlots(
      input.specialistId,
      input.serviceId,
      availabilityDate
    );
    if (!availableSlots.includes(input.appointmentTime)) {
      throw new TRPCError3({
        code: "CONFLICT",
        message: "Hor\xE1rio n\xE3o dispon\xEDvel"
      });
    }
    const [y, m, d] = input.appointmentDate.split("-").map(Number);
    const [hh, mm] = input.appointmentTime.split(":").map(Number);
    const appointmentDateTime = new Date(Date.UTC(y, m - 1, d, hh, mm, 0));
    const appointmentId = generateId();
    await db.insert(appointments).values({
      id: appointmentId,
      salonId: specialist[0].salonId,
      clientId,
      serviceId: input.serviceId,
      specialistId: input.specialistId,
      appointmentDate: appointmentDateTime,
      appointmentTime: input.appointmentTime,
      status: "pending",
      // Agendamentos públicos começam como pendentes
      notes: input.notes || null,
      isPublic: true
    });
    return {
      success: true,
      appointmentId,
      message: "Agendamento criado com sucesso! Aguarde a confirma\xE7\xE3o."
    };
  })
});

// server/routers.ts
var generateId2 = () => crypto.randomBytes(16).toString("hex");
var dashboardRouter = router({
  // ROTA OTIMIZADA: Busca TODOS os dados do dashboard em uma única chamada
  all: protectedProcedure.input(
    z4.object({
      chartDays: z4.number().min(7).max(365).default(30)
    }).optional()
  ).query(async ({ ctx, input }) => {
    const salon = await getSalonByUserId(ctx.user.id);
    if (!salon) {
      throw new TRPCError4({
        code: "NOT_FOUND",
        message: "Sal\xE3o n\xE3o encontrado"
      });
    }
    const chartDays = input?.chartDays ?? 30;
    const now = /* @__PURE__ */ new Date();
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3);
    const [dashboardData, upcomingAppointments] = await Promise.all([
      getAllDashboardData(salon.id, chartDays),
      getAppointmentsWithDetailsBySalonId(salon.id, now, in30Days)
    ]);
    return {
      ...dashboardData,
      upcomingAppointments
    };
  }),
  // Métricas principais do dashboard
  metrics: protectedProcedure.query(async ({ ctx }) => {
    const salon = await getSalonByUserId(ctx.user.id);
    if (!salon) {
      throw new TRPCError4({
        code: "NOT_FOUND",
        message: "Sal\xE3o n\xE3o encontrado"
      });
    }
    return await getDashboardMetrics(salon.id);
  }),
  // Gráfico de receita dos últimos 30 dias
  revenueChart: protectedProcedure.input(
    z4.object({
      days: z4.number().min(7).max(365).default(30)
    })
  ).query(async ({ ctx, input }) => {
    const salon = await getSalonByUserId(ctx.user.id);
    if (!salon) {
      throw new TRPCError4({
        code: "NOT_FOUND",
        message: "Sal\xE3o n\xE3o encontrado"
      });
    }
    return await getRevenueChart(salon.id, input.days);
  }),
  // Comparativo mensal
  monthlyComparison: protectedProcedure.query(async ({ ctx }) => {
    const salon = await getSalonByUserId(ctx.user.id);
    if (!salon) {
      throw new TRPCError4({
        code: "NOT_FOUND",
        message: "Sal\xE3o n\xE3o encontrado"
      });
    }
    return await getMonthlyComparison(salon.id);
  }),
  // Próximos agendamentos (primeiros 10)
  upcomingAppointments: protectedProcedure.query(async ({ ctx }) => {
    const salon = await getSalonByUserId(ctx.user.id);
    if (!salon) {
      throw new TRPCError4({
        code: "NOT_FOUND",
        message: "Sal\xE3o n\xE3o encontrado"
      });
    }
    const now = /* @__PURE__ */ new Date();
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3);
    return await getAppointmentsWithDetailsBySalonId(salon.id, now, in30Days);
  })
});
var appRouter = router({
  system: systemRouter,
  // ============================================================================
  // AUTH PROCEDURES
  // ============================================================================
  auth: router({
    me: publicProcedure.query(async ({ ctx: _ctx }) => {
      if (!_ctx.user) return null;
      const salon = await getSalonByUserId(_ctx.user.id);
      return { ..._ctx.user, salonId: salon?.id ?? null };
    }),
    logout: publicProcedure.mutation(({ ctx: _ctx }) => {
      const cookieOptions = getSessionCookieOptions(_ctx.req);
      _ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    register: publicProcedure.input(registerSchema).mutation(async ({ input: _input }) => {
      const existingUser = await getUserByEmail(_input.email);
      if (existingUser) {
        throw new TRPCError4({
          code: "CONFLICT",
          message: "Email j\xE1 cadastrado"
        });
      }
      const userId = generateId2();
      const ownerSalon = await getSalonByUserId(ENV.ownerId);
      const defaultSalonId = ownerSalon?.id ?? null;
      await upsertUser({
        id: userId,
        name: _input.name,
        email: _input.email,
        password: await bcrypt.hash(_input.password, 10),
        salonId: defaultSalonId
      });
      return {
        success: true,
        userId,
        message: "Usu\xE1rio registrado com sucesso"
      };
    }),
    login: publicProcedure.input(loginSchema).mutation(async ({ input: _input, ctx: _ctx }) => {
      const user = await getUserByEmail(_input.email);
      if (!user) {
        throw new TRPCError4({
          code: "UNAUTHORIZED",
          message: "Email ou senha inv\xE1lidos"
        });
      }
      const passwordMatch = await bcrypt.compare(
        _input.password,
        user.password
      );
      if (!passwordMatch) {
        throw new TRPCError4({
          code: "UNAUTHORIZED",
          message: "Email ou senha inv\xE1lidos"
        });
      }
      const salon = await getSalonByUserId(user.id);
      const sessionToken = await sdk.createSessionToken(user.id, {
        name: user.name
      });
      const cookieOptions = {
        ...getSessionCookieOptions(_ctx.req),
        maxAge: ONE_YEAR_MS
      };
      _ctx.res?.cookie(COOKIE_NAME, sessionToken, cookieOptions);
      return {
        success: true,
        sessionToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          salonId: salon?.id ?? null
        }
      };
    }),
    requestPasswordReset: publicProcedure.input(passwordResetRequestSchema).mutation(async ({ input: _input }) => {
      const user = await getUserByEmail(_input.email);
      if (!user) {
        return { success: true };
      }
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
      await createPasswordReset({
        id: generateId2(),
        userId: user.id,
        token,
        expiresAt,
        used: false
      });
      return { success: true };
    }),
    resetPassword: publicProcedure.input(passwordResetSchema).mutation(async ({ input: _input }) => {
      const reset = await getPasswordResetByToken(_input.token);
      if (!reset || reset.used || reset.expiresAt < /* @__PURE__ */ new Date()) {
        throw new TRPCError4({
          code: "BAD_REQUEST",
          message: "Token inv\xE1lido ou expirado"
        });
      }
      const user = await getUser(reset.userId);
      if (!user) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Usu\xE1rio n\xE3o encontrado"
        });
      }
      await upsertUser({
        id: user.id,
        password: await bcrypt.hash(_input.password, 10)
      });
      await markPasswordResetAsUsed(reset.id);
      return { success: true };
    })
  }),
  // ============================================================================
  // SALON PROCEDURES
  // ============================================================================
  salon: router({
    get: protectedProcedure.query(async ({ ctx: _ctx }) => {
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      return salon;
    }),
    update: protectedProcedure.input(salonSchema).mutation(async ({ ctx: _ctx, input }) => {
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      await updateSalon(salon.id, {
        name: input.name,
        cnpj: input.cnpj ?? null,
        address: input.address ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        logo: input.logo ?? null,
        pixKey: input.pixKey ?? null
      });
      return { success: true };
    }),
    create: protectedProcedure.input(salonSchema).mutation(async ({ ctx: _ctx, input: _input }) => {
      const existingSalon = await getSalonByUserId(_ctx.user.id);
      if (existingSalon) {
        throw new TRPCError4({
          code: "CONFLICT",
          message: "Sal\xE3o j\xE1 existe para este usu\xE1rio"
        });
      }
      const salonId = generateId2();
      return { success: true, salonId };
    })
  }),
  // ============================================================================
  // SPECIALIST PROCEDURES
  // ============================================================================
  specialists: router({
    list: protectedProcedure.query(async ({ ctx: _ctx }) => {
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      return await getSpecialistsBySalonId(salon.id);
    }),
    get: protectedProcedure.input(z4.object({ id: z4.string() })).query(async ({ input: _input, ctx: _ctx }) => {
      const specialist = await getSpecialistById(_input.id);
      if (!specialist) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Especialista n\xE3o encontrado"
        });
      }
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon || specialist.salonId !== salon.id) {
        throw new TRPCError4({
          code: "FORBIDDEN",
          message: "Acesso negado"
        });
      }
      return specialist;
    }),
    create: protectedProcedure.input(
      z4.object({
        specialist: specialistSchema,
        schedule: scheduleSchema
      })
    ).mutation(async ({ ctx: _ctx, input: _input }) => {
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      const specialistPayload = _input.specialist;
      const workingDays = specialistPayload.workingDays ? Object.fromEntries(
        Object.entries(specialistPayload.workingDays).map(([k, v]) => [
          k,
          // Ensure each entry is an array of period objects: [{ start, end, lunch? }]
          Array.isArray(v) ? v : [v]
        ])
      ) : null;
      const newSpecialist = await createSpecialist({
        id: generateId2(),
        salonId: salon.id,
        ...specialistPayload,
        workingDays
      });
      try {
        await createSpecialistSchedule(newSpecialist.id, {
          timeSlotDuration: _input.schedule.timeSlotDuration,
          bufferTime: _input.schedule.bufferTime,
          allowBookingDaysInAdvance: _input.schedule.allowBookingDaysInAdvance,
          minimumNoticeHours: _input.schedule.minimumNoticeHours,
          autoConfirmBookings: _input.schedule.autoConfirmBookings,
          allowOnlineBooking: _input.schedule.allowOnlineBooking,
          workingHours: _input.schedule.workingHours
        });
      } catch {
        try {
          await deleteSpecialist(newSpecialist.id);
        } catch {
        }
        throw new TRPCError4({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao criar agenda inicial. Opera\xE7\xE3o revertida."
        });
      }
      await createAuditLog({
        userId: _ctx.user?.id ?? null,
        action: "create",
        entity: "specialists",
        entityId: newSpecialist.id,
        before: null,
        after: newSpecialist,
        metadata: {
          ip: _ctx.req?.ip,
          userAgent: _ctx.req?.headers["user-agent"]
        }
      });
      return newSpecialist;
    }),
    update: protectedProcedure.input(z4.object({ id: z4.string(), data: specialistSchema })).mutation(async ({ ctx: _ctx, input: _input }) => {
      const specialist = await getSpecialistById(_input.id);
      if (!specialist) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Especialista n\xE3o encontrado"
        });
      }
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon || specialist.salonId !== salon.id) {
        throw new TRPCError4({
          code: "FORBIDDEN",
          message: "Acesso negado"
        });
      }
      const workingDays = _input.data.workingDays ? Object.fromEntries(
        Object.entries(_input.data.workingDays).map(([k, v]) => [
          k,
          Array.isArray(v) ? v : [v]
        ])
      ) : null;
      await updateSpecialist(_input.id, { ..._input.data, workingDays });
      await createAuditLog({
        userId: _ctx.user?.id ?? null,
        action: "update",
        entity: "specialists",
        entityId: _input.id,
        before: specialist,
        after: _input.data,
        metadata: {
          ip: _ctx.req?.ip,
          userAgent: _ctx.req?.headers["user-agent"]
        }
      });
      return { success: true };
    }),
    delete: protectedProcedure.input(z4.object({ id: z4.string() })).mutation(async ({ ctx: _ctx, input: _input }) => {
      const specialist = await getSpecialistById(_input.id);
      if (!specialist) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Especialista n\xE3o encontrado"
        });
      }
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon || specialist.salonId !== salon.id) {
        throw new TRPCError4({
          code: "FORBIDDEN",
          message: "Acesso negado"
        });
      }
      await deleteSpecialist(_input.id);
      await createAuditLog({
        userId: _ctx.user?.id ?? null,
        action: "delete",
        entity: "specialists",
        entityId: _input.id,
        before: specialist,
        after: null,
        metadata: {
          ip: _ctx.req?.ip,
          userAgent: _ctx.req?.headers["user-agent"]
        }
      });
      return { success: true };
    })
  }),
  // ============================================================================
  // CLIENT PROCEDURES
  // ============================================================================
  clients: router({
    list: protectedProcedure.input(
      z4.object({
        search: z4.string().optional(),
        limit: z4.number().default(50),
        offset: z4.number().default(0)
      })
    ).query(async ({ ctx: _ctx, input: _input }) => {
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      return await getClientsBySalonId(
        salon.id,
        _input.search,
        _input.limit,
        _input.offset
      );
    }),
    get: protectedProcedure.input(z4.object({ id: z4.string() })).query(async ({ input: _input, ctx: _ctx }) => {
      const client = await getClientById(_input.id);
      if (!client) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Cliente n\xE3o encontrado"
        });
      }
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon || client.salonId !== salon.id) {
        throw new TRPCError4({
          code: "FORBIDDEN",
          message: "Acesso negado"
        });
      }
      return client;
    }),
    create: protectedProcedure.input(clientSchema).mutation(async ({ ctx: _ctx, input: _input }) => {
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      const client = await createClient({
        id: generateId2(),
        salonId: salon.id,
        ..._input
      });
      await createAuditLog({
        userId: _ctx.user?.id ?? null,
        action: "create",
        entity: "clients",
        entityId: client.id,
        before: null,
        after: client,
        metadata: {
          ip: _ctx.req?.ip,
          userAgent: _ctx.req?.headers["user-agent"]
        }
      });
      return client;
    }),
    update: protectedProcedure.input(z4.object({ id: z4.string(), data: clientSchema })).mutation(async ({ ctx: _ctx, input: _input }) => {
      const client = await getClientById(_input.id);
      if (!client) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Cliente n\xE3o encontrado"
        });
      }
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon || client.salonId !== salon.id) {
        throw new TRPCError4({
          code: "FORBIDDEN",
          message: "Acesso negado"
        });
      }
      await updateClient(_input.id, _input.data);
      await createAuditLog({
        userId: _ctx.user?.id ?? null,
        action: "update",
        entity: "clients",
        entityId: _input.id,
        before: client,
        after: _input.data,
        metadata: {
          ip: _ctx.req?.ip,
          userAgent: _ctx.req?.headers["user-agent"]
        }
      });
      return { success: true };
    }),
    delete: protectedProcedure.input(z4.object({ id: z4.string() })).mutation(async ({ ctx: _ctx, input: _input }) => {
      const client = await getClientById(_input.id);
      if (!client) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Cliente n\xE3o encontrado"
        });
      }
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon || client.salonId !== salon.id) {
        throw new TRPCError4({
          code: "FORBIDDEN",
          message: "Acesso negado"
        });
      }
      await deleteClient(_input.id);
      await createAuditLog({
        userId: _ctx.user?.id ?? null,
        action: "delete",
        entity: "clients",
        entityId: _input.id,
        before: client,
        after: null,
        metadata: {
          ip: _ctx.req?.ip,
          userAgent: _ctx.req?.headers["user-agent"]
        }
      });
      return { success: true };
    })
  }),
  // ============================================================================
  // SERVICE PROCEDURES
  // ============================================================================
  services: router({
    list: protectedProcedure.query(async ({ ctx: _ctx }) => {
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      return await getServicesBySalonId(salon.id);
    }),
    get: protectedProcedure.input(z4.object({ id: z4.string() })).query(async ({ input: _input, ctx: _ctx }) => {
      const service = await getServiceById(_input.id);
      if (!service) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Servi\xE7o n\xE3o encontrado"
        });
      }
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon || service.salonId !== salon.id) {
        throw new TRPCError4({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      return service;
    }),
    create: protectedProcedure.input(serviceSchema).mutation(async ({ ctx: _ctx, input: _input }) => {
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      const price = typeof _input.price === "string" ? _input.price : _input.price.toString();
      const specialistId = _input.specialistId === void 0 || _input.specialistId === "none" || _input.specialistId === null ? null : _input.specialistId;
      const service = await createService({
        id: generateId2(),
        salonId: salon.id,
        ..._input,
        price,
        specialistId
      });
      await createAuditLog({
        userId: _ctx.user?.id ?? null,
        action: "create",
        entity: "services",
        entityId: service.id,
        before: null,
        after: service,
        metadata: {
          ip: _ctx.req?.ip,
          userAgent: _ctx.req?.headers["user-agent"]
        }
      });
      return service;
    }),
    update: protectedProcedure.input(z4.object({ id: z4.string(), data: serviceSchema })).mutation(async ({ ctx: _ctx, input: _input }) => {
      const service = await getServiceById(_input.id);
      if (!service) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Servi\xE7o n\xE3o encontrado"
        });
      }
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon || service.salonId !== salon.id) {
        throw new TRPCError4({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      const updateData = {
        ..._input.data,
        price: typeof _input.data.price === "string" ? _input.data.price : _input.data.price.toString()
      };
      if (updateData.specialistId === "none" || updateData.specialistId === null) {
        updateData.specialistId = null;
      }
      await updateService(_input.id, updateData);
      await createAuditLog({
        userId: _ctx.user?.id ?? null,
        action: "update",
        entity: "services",
        entityId: _input.id,
        before: service,
        after: _input.data,
        metadata: {
          ip: _ctx.req?.ip,
          userAgent: _ctx.req?.headers["user-agent"]
        }
      });
      return { success: true };
    }),
    // delete: permite remoção via frontend com validações
    delete: protectedProcedure.input(z4.object({ id: z4.string() })).mutation(async ({ ctx: _ctx, input: _input }) => {
      const service = await getServiceById(_input.id);
      if (!service) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Servi\xE7o n\xE3o encontrado"
        });
      }
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon || service.salonId !== salon.id) {
        throw new TRPCError4({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      try {
        const allAppointments = await getAppointmentsWithDetailsBySalonId(
          salon.id
        );
        const now = /* @__PURE__ */ new Date();
        const hasFuture = allAppointments.some(
          (a) => a.serviceId === _input.id && new Date(a.appointmentDate) >= now
        );
        if (hasFuture) {
          throw new TRPCError4({
            code: "CONFLICT",
            message: "N\xE3o \xE9 poss\xEDvel remover servi\xE7o com agendamentos futuros"
          });
        }
      } catch {
      }
      await deleteService(_input.id);
      await createAuditLog({
        userId: _ctx.user?.id ?? null,
        action: "delete",
        entity: "services",
        entityId: _input.id,
        before: service,
        after: null,
        metadata: {
          ip: _ctx.req?.ip,
          userAgent: _ctx.req?.headers["user-agent"]
        }
      });
      return { success: true };
    })
  }),
  // ============================================================================
  // APPOINTMENT PROCEDURES
  // ============================================================================
  appointments: router({
    list: protectedProcedure.input(
      z4.object({
        startDate: z4.date().optional(),
        endDate: z4.date().optional()
      })
    ).query(async ({ ctx: _ctx, input: _input }) => {
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      return await getAppointmentsWithDetailsBySalonId(
        salon.id,
        _input.startDate,
        _input.endDate
      );
    }),
    get: protectedProcedure.input(z4.object({ id: z4.string() })).query(async ({ input: _input, ctx: _ctx }) => {
      const appointment = await getAppointmentById(_input.id);
      if (!appointment) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Agendamento n\xE3o encontrado"
        });
      }
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon || appointment.salonId !== salon.id) {
        throw new TRPCError4({
          code: "FORBIDDEN",
          message: "Acesso negado"
        });
      }
      return appointment;
    }),
    create: protectedProcedure.input(appointmentSchema).mutation(async ({ ctx: _ctx, input: _input }) => {
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      const client = await getClientById(_input.clientId);
      if (!client || client.salonId !== salon.id) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Cliente n\xE3o encontrado"
        });
      }
      const service = await getServiceById(_input.serviceId);
      if (!service || service.salonId !== salon.id) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Servi\xE7o n\xE3o encontrado"
        });
      }
      const specialist = await getSpecialistById(_input.specialistId);
      if (!specialist || specialist.salonId !== salon.id) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Especialista n\xE3o encontrado"
        });
      }
      const validation = await validateAppointmentSlot(
        _input.specialistId,
        _input.serviceId,
        _input.appointmentDate,
        _input.appointmentTime
      );
      if (!validation.valid) {
        throw new TRPCError4({
          code: "CONFLICT",
          message: validation.reason || "Hor\xE1rio n\xE3o dispon\xEDvel"
        });
      }
      const appointmentId = generateId2();
      const appointment = await createAppointment({
        id: appointmentId,
        salonId: salon.id,
        ..._input
      });
      try {
        await scheduleAppointmentNotifications(appointmentId);
      } catch {
      }
      try {
        const waitlistEntry = await checkWaitlistForSlot(
          _input.serviceId,
          _input.specialistId,
          _input.appointmentDate,
          _input.appointmentTime
        );
        if (waitlistEntry) {
        }
      } catch {
      }
      await createAuditLog({
        userId: _ctx.user?.id ?? null,
        action: "create",
        entity: "appointments",
        entityId: appointment.id,
        before: null,
        after: appointment,
        metadata: {
          ip: _ctx.req?.ip,
          userAgent: _ctx.req?.headers["user-agent"]
        }
      });
      return appointment;
    }),
    update: protectedProcedure.input(z4.object({ id: z4.string(), data: appointmentSchema })).mutation(async ({ ctx: _ctx, input: _input }) => {
      const appointment = await getAppointmentById(_input.id);
      if (!appointment) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Agendamento n\xE3o encontrado"
        });
      }
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon || appointment.salonId !== salon.id) {
        throw new TRPCError4({
          code: "FORBIDDEN",
          message: "Acesso negado"
        });
      }
      const client = await getClientById(_input.data.clientId);
      if (!client || client.salonId !== salon.id) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Cliente n\xE3o encontrado"
        });
      }
      const service = await getServiceById(_input.data.serviceId);
      if (!service || service.salonId !== salon.id) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Servi\xE7o n\xE3o encontrado"
        });
      }
      const specialist = await getSpecialistById(_input.data.specialistId);
      if (!specialist || specialist.salonId !== salon.id) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Especialista n\xE3o encontrado"
        });
      }
      const validation = await validateAppointmentSlot(
        _input.data.specialistId,
        _input.data.serviceId,
        _input.data.appointmentDate,
        _input.data.appointmentTime,
        _input.id
        // excluir o próprio agendamento da checagem
      );
      if (!validation.valid) {
        throw new TRPCError4({
          code: "CONFLICT",
          message: validation.reason || "Hor\xE1rio n\xE3o dispon\xEDvel"
        });
      }
      await updateAppointment(_input.id, _input.data);
      await createAuditLog({
        userId: _ctx.user?.id ?? null,
        action: "update",
        entity: "appointments",
        entityId: _input.id,
        before: appointment,
        after: _input.data,
        metadata: {
          ip: _ctx.req?.ip,
          userAgent: _ctx.req?.headers["user-agent"]
        }
      });
      return { success: true };
    }),
    delete: protectedProcedure.input(z4.object({ id: z4.string() })).mutation(async ({ ctx: _ctx, input: _input }) => {
      const appointment = await getAppointmentById(_input.id);
      if (!appointment) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Agendamento n\xE3o encontrado"
        });
      }
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon || appointment.salonId !== salon.id) {
        throw new TRPCError4({
          code: "FORBIDDEN",
          message: "Acesso negado"
        });
      }
      await deleteAppointment(_input.id);
      await createAuditLog({
        userId: _ctx.user?.id ?? null,
        action: "delete",
        entity: "appointments",
        entityId: _input.id,
        before: appointment,
        after: null,
        metadata: {
          ip: _ctx.req?.ip,
          userAgent: _ctx.req?.headers["user-agent"]
        }
      });
      return { success: true };
    }),
    getAvailableSlots: protectedProcedure.input(
      z4.object({
        specialistId: z4.string(),
        serviceId: z4.string(),
        date: z4.date()
      })
    ).query(async ({ ctx: _ctx, input: _input }) => {
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      const specialist = await getSpecialistById(_input.specialistId);
      const service = await getServiceById(_input.serviceId);
      if (!specialist || specialist.salonId !== salon.id) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Especialista n\xE3o encontrado"
        });
      }
      if (!service || service.salonId !== salon.id) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Servi\xE7o n\xE3o encontrado"
        });
      }
      return await getAvailableTimeSlots(
        _input.specialistId,
        _input.serviceId,
        _input.date
      );
    }),
    validateSlot: protectedProcedure.input(
      z4.object({
        specialistId: z4.string(),
        serviceId: z4.string(),
        date: z4.date(),
        time: z4.string(),
        excludeAppointmentId: z4.string().optional()
      })
    ).query(async ({ ctx: _ctx, input: _input }) => {
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      return await validateAppointmentSlot(
        _input.specialistId,
        _input.serviceId,
        _input.date,
        _input.time,
        _input.excludeAppointmentId
      );
    }),
    getSuggestions: protectedProcedure.input(
      z4.object({
        specialistId: z4.string(),
        serviceId: z4.string(),
        date: z4.date(),
        preferredTime: z4.string(),
        maxSuggestions: z4.number().min(1).max(10).default(3)
      })
    ).query(async ({ ctx: _ctx, input: _input }) => {
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      const specialist = await getSpecialistById(_input.specialistId);
      const service = await getServiceById(_input.serviceId);
      if (!specialist || specialist.salonId !== salon.id) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Especialista n\xE3o encontrado"
        });
      }
      if (!service || service.salonId !== salon.id) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Servi\xE7o n\xE3o encontrado"
        });
      }
      const allSlots = await getAvailableTimeSlots(
        _input.specialistId,
        _input.serviceId,
        _input.date
      );
      if (allSlots.includes(_input.preferredTime)) {
        return [
          _input.preferredTime,
          ...allSlots.filter((slot) => slot !== _input.preferredTime)
        ].slice(0, _input.maxSuggestions);
      }
      const preferredMinutes = timeToMinutes2(_input.preferredTime);
      const sortedSlots = allSlots.map((slot) => ({
        time: slot,
        distance: Math.abs(timeToMinutes2(slot) - preferredMinutes)
      })).sort((a, b) => a.distance - b.distance).slice(0, _input.maxSuggestions).map((slot) => slot.time);
      return sortedSlots;
    }),
    // Ação rápida: Concluir agendamento
    complete: protectedProcedure.input(
      z4.object({
        id: z4.string(),
        paymentMethod: z4.enum([
          "cash",
          "credit_card",
          "debit_card",
          "pix",
          "bank_transfer",
          "other"
        ]).optional(),
        amountPaid: z4.number().positive().optional(),
        // Produtos vendidos durante o atendimento (opcional)
        products: z4.array(
          z4.object({
            productId: z4.string(),
            quantity: z4.number().int().positive(),
            unitPrice: z4.number().nonnegative()
          })
        ).optional()
      })
    ).mutation(async ({ ctx: _ctx, input: _input }) => {
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      const appointment = await getAppointmentById(_input.id);
      if (!appointment || appointment.salonId !== salon.id) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Agendamento n\xE3o encontrado"
        });
      }
      if (appointment.status === "completed") {
        throw new TRPCError4({
          code: "BAD_REQUEST",
          message: "Agendamento j\xE1 foi conclu\xEDdo"
        });
      }
      if (appointment.status === "cancelled") {
        throw new TRPCError4({
          code: "BAD_REQUEST",
          message: "Agendamento cancelado n\xE3o pode ser conclu\xEDdo"
        });
      }
      if (_input.products && _input.products.length > 0) {
        await saveAppointmentProducts(_input.id, salon.id, _input.products);
      }
      await updateAppointment(_input.id, {
        status: "completed",
        updatedAt: /* @__PURE__ */ new Date()
      });
      try {
        await recordAppointmentRevenue(
          _input.id,
          _input.paymentMethod || "cash",
          _input.amountPaid
        );
      } catch {
      }
      try {
        let valorBase = _input.amountPaid ?? 0;
        if (!valorBase && appointment.serviceId) {
          const svc = await getServiceById(appointment.serviceId);
          valorBase = parseFloat(svc?.price ?? "0") || 0;
        }
        if (appointment.clientId && valorBase > 0) {
          await addLoyaltyPoints(appointment.clientId, valorBase);
        }
      } catch {
      }
      let ratingToken = null;
      try {
        const token = crypto.randomUUID();
        let clientName = null;
        if (appointment.clientId) {
          const client = await getClientById(appointment.clientId);
          clientName = client?.name ?? null;
        }
        await createRating({
          id: generateId2(),
          salonId: salon.id,
          specialistId: appointment.specialistId ?? "",
          appointmentId: appointment.id,
          token,
          used: false,
          clientName
        });
        ratingToken = token;
      } catch {
      }
      return {
        success: true,
        message: "Agendamento conclu\xEDdo com sucesso",
        ratingToken
      };
    }),
    // Ação rápida: Cancelar agendamento
    cancel: protectedProcedure.input(
      z4.object({
        id: z4.string(),
        reason: z4.string().optional()
      })
    ).mutation(async ({ ctx: _ctx, input: _input }) => {
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      const appointment = await getAppointmentById(_input.id);
      if (!appointment || appointment.salonId !== salon.id) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Agendamento n\xE3o encontrado"
        });
      }
      if (appointment.status === "cancelled") {
        throw new TRPCError4({
          code: "BAD_REQUEST",
          message: "Agendamento j\xE1 foi cancelado"
        });
      }
      if (appointment.status === "completed") {
        throw new TRPCError4({
          code: "BAD_REQUEST",
          message: "Agendamento conclu\xEDdo n\xE3o pode ser cancelado"
        });
      }
      const updatedNotes = appointment.notes ? `${appointment.notes}

Cancelado: ${_input.reason || "Sem motivo especificado"}` : `Cancelado: ${_input.reason || "Sem motivo especificado"}`;
      await updateAppointment(_input.id, {
        status: "cancelled",
        notes: updatedNotes,
        updatedAt: /* @__PURE__ */ new Date()
      });
      return { success: true, message: "Agendamento cancelado com sucesso" };
    }),
    // Ação rápida: Confirmar agendamento
    confirm: protectedProcedure.input(z4.object({ id: z4.string() })).mutation(async ({ ctx: _ctx, input: _input }) => {
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      const appointment = await getAppointmentById(_input.id);
      if (!appointment || appointment.salonId !== salon.id) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Agendamento n\xE3o encontrado"
        });
      }
      if (appointment.status === "confirmed") {
        throw new TRPCError4({
          code: "BAD_REQUEST",
          message: "Agendamento j\xE1 est\xE1 confirmado"
        });
      }
      if (appointment.status === "completed") {
        throw new TRPCError4({
          code: "BAD_REQUEST",
          message: "Agendamento conclu\xEDdo n\xE3o pode ser confirmado"
        });
      }
      if (appointment.status === "cancelled") {
        throw new TRPCError4({
          code: "BAD_REQUEST",
          message: "Agendamento cancelado n\xE3o pode ser confirmado"
        });
      }
      await updateAppointment(_input.id, {
        status: "confirmed",
        updatedAt: /* @__PURE__ */ new Date()
      });
      await createAuditLog({
        userId: _ctx.user?.id ?? null,
        action: "update",
        entity: "appointments",
        entityId: _input.id,
        before: appointment,
        after: { ...appointment, status: "confirmed" },
        metadata: {
          ip: _ctx.req?.ip,
          userAgent: _ctx.req?.headers["user-agent"]
        }
      });
      return { success: true, message: "Agendamento confirmado com sucesso" };
    })
  }),
  // ============================================================================
  // PUBLIC APPOINTMENT PROCEDURES (for booking page)
  // ============================================================================
  publicBooking: router({
    getSalonBySlug: publicProcedure.input(z4.object({ slug: z4.string() })).query(async ({ input: _input }) => {
      return {
        id: "salon-1",
        name: "Sal\xE3o de Beleza",
        slug: _input.slug
      };
    }),
    getAvailableSlots: publicProcedure.input(
      z4.object({
        salonId: z4.string(),
        specialistId: z4.string(),
        serviceId: z4.string(),
        date: z4.date()
      })
    ).query(async ({ input: _input }) => {
      const specialist = await getSpecialistById(_input.specialistId);
      const service = await getServiceById(_input.serviceId);
      if (!specialist || specialist.salonId !== _input.salonId) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Especialista n\xE3o encontrado"
        });
      }
      if (!service || service.salonId !== _input.salonId) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Servi\xE7o n\xE3o encontrado"
        });
      }
      return await getAvailableTimeSlots(
        _input.specialistId,
        _input.serviceId,
        _input.date
      );
    }),
    createPublicAppointment: publicProcedure.input(appointmentPublicSchema).mutation(async ({ input: _input }) => {
      return {
        success: true,
        appointmentId: generateId2(),
        message: "Agendamento realizado com sucesso"
      };
    })
  }),
  // ============================================================================
  // USERS PROCEDURES
  // ============================================================================
  users: router({
    list: protectedProcedure.query(async ({ ctx: _ctx }) => {
      if (!_ctx.user || _ctx.user.role !== "admin") {
        throw new TRPCError4({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      const allUsers = await listUsers();
      return allUsers.filter((u) => u.salonId === salon.id);
    }),
    // Criar novo usuário (apenas admin) — sempre atribuir ao salão do admin
    create: protectedProcedure.input(
      z4.object({
        name: z4.string().min(2),
        email: z4.string().email(),
        password: z4.string().min(6),
        role: z4.enum(["user", "admin"]).default("user"),
        permissions: z4.record(z4.string(), z4.boolean()).optional()
      })
    ).mutation(async ({ ctx: _ctx, input: _input }) => {
      if (!_ctx.user || _ctx.user.role !== "admin") {
        throw new TRPCError4({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      const perms = _input.role === "admin" ? { manage_all: true } : _input.permissions ?? void 0;
      const newId = generateId2();
      await upsertUser({
        id: newId,
        name: _input.name,
        email: _input.email,
        password: await bcrypt.hash(_input.password, 10),
        role: _input.role,
        permissions: perms,
        salonId: salon.id
      });
      await createAuditLog({
        userId: _ctx.user?.id ?? null,
        action: "create",
        entity: "users",
        entityId: newId,
        before: null,
        after: {
          id: newId,
          name: _input.name,
          email: _input.email,
          role: _input.role,
          salonId: salon.id
        },
        metadata: {
          ip: _ctx.req?.ip,
          userAgent: _ctx.req?.headers["user-agent"]
        }
      });
      return { success: true, userId: newId };
    }),
    edit: protectedProcedure.input(
      z4.object({
        id: z4.string(),
        data: z4.object({
          name: z4.string().optional(),
          email: z4.string().optional(),
          role: z4.enum(["user", "admin"]).optional(),
          photoUrl: z4.string().optional(),
          phone: z4.string().optional(),
          permissions: z4.record(z4.string(), z4.boolean()).optional(),
          password: z4.string().min(6).optional()
        })
      })
    ).mutation(async ({ ctx: _ctx, input: _input }) => {
      if (!_ctx.user || _ctx.user.role !== "admin" && _ctx.user.id !== _input.id) {
        throw new TRPCError4({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      const user = await getUser(_input.id);
      if (!user) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Usu\xE1rio n\xE3o encontrado"
        });
      }
      if (_ctx.user.role === "admin") {
        const adminSalon = await getSalonByUserId(_ctx.user.id);
        if (!adminSalon || user.salonId !== adminSalon.id) {
          throw new TRPCError4({
            code: "FORBIDDEN",
            message: "Acesso negado"
          });
        }
      }
      const updatePayload = {
        id: _input.id
      };
      if (typeof _input.data.name !== "undefined")
        updatePayload.name = _input.data.name;
      if (typeof _input.data.email !== "undefined")
        updatePayload.email = _input.data.email;
      if (typeof _input.data.role !== "undefined")
        updatePayload.role = _input.data.role;
      if ("photoUrl" in _input.data)
        updatePayload.photoUrl = _input.data.photoUrl;
      if (typeof _input.data.phone !== "undefined")
        updatePayload.phone = _input.data.phone;
      if (typeof _input.data.permissions !== "undefined")
        updatePayload.permissions = _input.data.permissions;
      if (typeof _input.data.password !== "undefined" && _input.data.password !== null) {
        updatePayload.password = await bcrypt.hash(_input.data.password, 10);
      }
      await upsertUser(updatePayload);
      await createAuditLog({
        userId: _ctx.user?.id ?? null,
        action: "update",
        entity: "users",
        entityId: _input.id,
        before: user,
        after: updatePayload,
        metadata: {
          ip: _ctx.req?.ip,
          userAgent: _ctx.req?.headers["user-agent"]
        }
      });
      return { success: true };
    }),
    resetPassword: protectedProcedure.input(z4.object({ id: z4.string(), password: z4.string() })).mutation(async ({ ctx: _ctx, input: _input }) => {
      if (!_ctx.user || _ctx.user.role !== "admin" && _ctx.user.id !== _input.id) {
        throw new TRPCError4({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      const user = await getUser(_input.id);
      if (!user) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Usu\xE1rio n\xE3o encontrado"
        });
      }
      if (_ctx.user.role === "admin") {
        const adminSalon = await getSalonByUserId(_ctx.user.id);
        if (!adminSalon || user.salonId !== adminSalon.id) {
          throw new TRPCError4({
            code: "FORBIDDEN",
            message: "Acesso negado"
          });
        }
      }
      await upsertUser({
        id: _input.id,
        password: await bcrypt.hash(_input.password, 10)
      });
      return { success: true };
    }),
    delete: protectedProcedure.input(z4.object({ id: z4.string() })).mutation(async ({ ctx: _ctx, input: _input }) => {
      if (!_ctx.user || _ctx.user.role !== "admin") {
        throw new TRPCError4({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      const user = await getUser(_input.id);
      if (!user) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Usu\xE1rio n\xE3o encontrado"
        });
      }
      const adminSalon = await getSalonByUserId(_ctx.user.id);
      if (!adminSalon || user.salonId !== adminSalon.id) {
        throw new TRPCError4({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      if (_ctx.user.id === _input.id) {
        throw new TRPCError4({
          code: "FORBIDDEN",
          message: "Voc\xEA n\xE3o pode remover a si mesmo"
        });
      }
      const db = await getDb();
      if (!db)
        throw new TRPCError4({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database n\xE3o dispon\xEDvel"
        });
      await db.delete(users).where(eq7(users.id, _input.id));
      await createAuditLog({
        userId: _ctx.user?.id ?? null,
        action: "delete",
        entity: "users",
        entityId: _input.id,
        before: user,
        after: null,
        metadata: {
          ip: _ctx.req?.ip,
          userAgent: _ctx.req?.headers["user-agent"]
        }
      });
      return { success: true };
    })
  }),
  // Audit router para admins - listar logs
  audit: router({
    list: protectedProcedure.input(
      z4.object({
        limit: z4.number().min(1).max(1e3).default(50),
        offset: z4.number().min(0).default(0)
      })
    ).query(async ({ ctx: _ctx, input: _input }) => {
      if (!_ctx.user || _ctx.user.role !== "admin") {
        throw new TRPCError4({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      const salon = await getSalonByUserId(_ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      const { rows, total } = await listAuditLogsWithCount({
        limit: _input.limit,
        offset: _input.offset,
        salonId: salon.id
      });
      const enriched = await Promise.all(
        rows.map(async (log) => {
          const [u, s] = await Promise.all([
            log.userId ? getUser(log.userId) : Promise.resolve(void 0),
            log.salonId ? getSalonById(log.salonId) : Promise.resolve(void 0)
          ]);
          return {
            id: log.id,
            userId: log.userId,
            userName: u?.name ?? null,
            action: log.action,
            entity: log.entity,
            entityId: log.entityId,
            salonId: log.salonId ?? null,
            salonName: s?.name ?? null,
            createdAt: log.createdAt,
            createdAtPretty: new Date(log.createdAt).toLocaleString("pt-BR"),
            metadata: log.metadata,
            before: log.before,
            after: log.after
          };
        })
      );
      return {
        logs: enriched,
        total,
        offset: _input.offset,
        limit: _input.limit
      };
    })
  }),
  // ============================================================================
  // NOTIFICATIONS & ADVANCED FEATURES
  // ============================================================================
  notifications: router({
    sendAppointmentNotification: protectedProcedure.input(
      z4.object({
        appointmentId: z4.string(),
        type: z4.enum(["confirmation", "reminder_24h", "reminder_2h"]),
        channel: z4.enum(["email", "sms", "whatsapp", "push"])
      })
    ).mutation(async ({ input }) => {
      return await sendNotification(
        input.appointmentId,
        input.type,
        input.channel
      );
    }),
    getTemplates: protectedProcedure.query(async () => {
      return Object.values(defaultTemplates);
    }),
    /** Registra subscription do service worker para push notifications */
    subscribe: protectedProcedure.input(
      z4.object({
        endpoint: z4.string(),
        keys: z4.object({
          p256dh: z4.string(),
          auth: z4.string()
        })
      })
    ).mutation(async ({ ctx }) => {
      console.log(
        `\u{1F4F1} [Push] Usu\xE1rio ${ctx.user.id} registrado para notifica\xE7\xF5es push`
      );
      return { success: true };
    }),
    /** Remove inscrição push */
    unsubscribe: protectedProcedure.mutation(async ({ ctx }) => {
      console.log(
        `\u{1F4F1} [Push] Usu\xE1rio ${ctx.user.id} cancelou notifica\xE7\xF5es push`
      );
      return { success: true };
    })
  }),
  waitlist: router({
    add: protectedProcedure.input(
      z4.object({
        clientId: z4.string(),
        serviceId: z4.string(),
        specialistId: z4.string().optional(),
        preferredDate: z4.date().optional(),
        preferredTimeStart: z4.string().optional(),
        preferredTimeEnd: z4.string().optional(),
        maxWaitDays: z4.number().min(1).max(365).default(7),
        notificationPreference: z4.enum(["sms", "whatsapp", "email"]).default("whatsapp"),
        priority: z4.number().min(1).max(3).default(2)
      })
    ).mutation(async ({ ctx, input }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      return await addToWaitlist(input);
    }),
    remove: protectedProcedure.input(z4.object({ waitlistId: z4.string() })).mutation(async ({ input }) => {
      return await removeFromWaitlist(input.waitlistId);
    }),
    list: protectedProcedure.input(
      z4.object({
        serviceId: z4.string().optional(),
        specialistId: z4.string().optional()
      })
    ).query(async ({ input }) => {
      return await getActiveWaitlistEntries(
        input.serviceId,
        input.specialistId
      );
    }),
    confirm: protectedProcedure.input(z4.object({ waitlistId: z4.string() })).mutation(async ({ input }) => {
      return await confirmWaitlistSlot(input.waitlistId);
    }),
    stats: protectedProcedure.query(async () => {
      return await getWaitlistStats();
    })
  }),
  reports: router({
    appointmentStats: protectedProcedure.input(
      z4.object({
        startDate: z4.date().optional(),
        endDate: z4.date().optional(),
        specialistId: z4.string().optional(),
        serviceId: z4.string().optional(),
        status: z4.enum(["pending", "confirmed", "completed", "cancelled"]).optional()
      })
    ).query(async ({ ctx, input }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      return await generateAppointmentStats(salon.id, input);
    }),
    specialistPerformance: protectedProcedure.input(
      z4.object({
        startDate: z4.date().optional(),
        endDate: z4.date().optional(),
        specialistId: z4.string().optional()
      })
    ).query(async ({ ctx, input }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      return await generateSpecialistPerformance(salon.id, input);
    }),
    servicePopularity: protectedProcedure.input(
      z4.object({
        startDate: z4.date().optional(),
        endDate: z4.date().optional()
      })
    ).query(async ({ ctx, input }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      return await generateServicePopularity(salon.id, input);
    }),
    clientAnalytics: protectedProcedure.input(
      z4.object({
        startDate: z4.date().optional(),
        endDate: z4.date().optional(),
        riskThreshold: z4.number().min(0).max(100).default(70)
      })
    ).query(async ({ ctx, input }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      const analytics = await generateClientAnalytics(salon.id, input);
      return {
        all: analytics,
        highRisk: analytics.filter(
          (client) => client.riskScore >= input.riskThreshold
        )
      };
    }),
    dailyReport: protectedProcedure.input(z4.object({ date: z4.date() })).query(async ({ ctx, input }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      return await generateDailyReport(salon.id, input.date);
    }),
    exportCSV: protectedProcedure.input(
      z4.object({
        reportType: z4.enum([
          "appointments",
          "specialists",
          "services",
          "clients"
        ]),
        data: z4.any()
      })
    ).mutation(async ({ input }) => {
      const filename = `${input.reportType}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
      const csvContent = exportToCSV(input.data);
      return {
        filename,
        content: csvContent,
        mimeType: "text/csv"
      };
    })
  }),
  schedule: router({
    getSpecialistSchedule: protectedProcedure.input(z4.object({ specialistId: z4.string() })).query(async ({ ctx, input }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      const specialist = await getSpecialistById(input.specialistId);
      if (!specialist || specialist.salonId !== salon.id) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Especialista n\xE3o encontrado"
        });
      }
      return await getSpecialistScheduleForDisplay(input.specialistId);
    }),
    updateSpecialistSchedule: protectedProcedure.input(
      z4.object({
        specialistId: z4.string(),
        timeSlotDuration: z4.number().min(15).max(120).optional(),
        bufferTime: z4.number().min(0).max(60).optional(),
        allowBookingDaysInAdvance: z4.number().min(1).max(365).optional(),
        minimumNoticeHours: z4.number().min(0).max(72).optional(),
        autoConfirmBookings: z4.boolean().optional(),
        allowOnlineBooking: z4.boolean().optional(),
        // Permitimos enviar todos os workingHours de uma vez
        workingHours: z4.array(
          z4.object({
            dayOfWeek: z4.number().min(0).max(6),
            isWorking: z4.boolean(),
            startTime: z4.string().optional(),
            endTime: z4.string().optional(),
            breakStartTime: z4.string().optional(),
            breakEndTime: z4.string().optional()
          })
        ).optional(),
        // Datas indisponíveis no formato string ISO
        customUnavailableDates: z4.array(z4.string()).optional()
      })
    ).mutation(async ({ ctx, input }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      const specialist = await getSpecialistById(input.specialistId);
      if (!specialist || specialist.salonId !== salon.id) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Especialista n\xE3o encontrado"
        });
      }
      const {
        specialistId,
        customUnavailableDates: rawDates,
        ...otherUpdates
      } = input;
      const updates = {
        ...otherUpdates,
        ...rawDates && {
          customUnavailableDates: rawDates.map((s) => new Date(s))
        }
      };
      await updateSpecialistSchedule(specialistId, updates);
      return await getSpecialistScheduleForDisplay(specialistId);
    }),
    updateWorkingHours: protectedProcedure.input(
      z4.object({
        specialistId: z4.string(),
        dayOfWeek: z4.number().min(0).max(6),
        isWorking: z4.boolean(),
        startTime: z4.string().optional(),
        endTime: z4.string().optional(),
        breakStartTime: z4.string().optional(),
        breakEndTime: z4.string().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      const specialist = await getSpecialistById(input.specialistId);
      if (!specialist || specialist.salonId !== salon.id) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Especialista n\xE3o encontrado"
        });
      }
      const { specialistId, dayOfWeek, ...workingHours } = input;
      await updateWorkingHoursForDay(specialistId, dayOfWeek, workingHours);
      return await getSpecialistScheduleForDisplay(specialistId);
    }),
    addUnavailableDate: protectedProcedure.input(
      z4.object({
        specialistId: z4.string(),
        date: z4.date()
      })
    ).mutation(async ({ ctx, input }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      const specialist = await getSpecialistById(input.specialistId);
      if (!specialist || specialist.salonId !== salon.id) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Especialista n\xE3o encontrado"
        });
      }
      await addCustomUnavailableDate(input.specialistId, input.date);
      return { success: true };
    }),
    removeUnavailableDate: protectedProcedure.input(
      z4.object({
        specialistId: z4.string(),
        date: z4.date()
      })
    ).mutation(async ({ ctx, input }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      const specialist = await getSpecialistById(input.specialistId);
      if (!specialist || specialist.salonId !== salon.id) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Especialista n\xE3o encontrado"
        });
      }
      await removeCustomUnavailableDate(input.specialistId, input.date);
      return { success: true };
    }),
    getAvailableSlots: protectedProcedure.input(
      z4.object({
        specialistId: z4.string(),
        date: z4.date(),
        serviceDuration: z4.number().min(15).max(480).default(60)
      })
    ).query(async ({ ctx, input }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      }
      const specialist = await getSpecialistById(input.specialistId);
      if (!specialist || specialist.salonId !== salon.id) {
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Especialista n\xE3o encontrado"
        });
      }
      return await generateSpecialistTimeSlots(
        input.specialistId,
        input.date,
        input.serviceDuration
      );
    })
  }),
  // Image uploads (server-side proxy to Cloudinary)
  images: router({
    upload: protectedProcedure.input(z4.object({ base64: z4.string(), publicId: z4.string().optional() })).mutation(async ({ input }) => {
      try {
        const res = await uploadBase64Image(input.base64, input.publicId);
        return { success: true, url: res.url, publicId: res.public_id };
      } catch (e) {
        throw new TRPCError4({
          code: "INTERNAL_SERVER_ERROR",
          message: e instanceof Error ? e.message : "Erro ao fazer upload"
        });
      }
    })
  }),
  dashboard: dashboardRouter,
  // ============================================================
  // MÓDULO DE PRODUTOS (Sprint 3)
  // ============================================================
  products: router({
    /** Lista todos os produtos do salão */
    list: protectedProcedure.query(async ({ ctx }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon)
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      return getProductsBySalonId(salon.id);
    }),
    /** Lista produtos com estoque baixo (stock <= minStock) */
    lowStock: protectedProcedure.query(async ({ ctx }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon)
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      return getLowStockProducts(salon.id);
    }),
    /** Cria um novo produto */
    create: protectedProcedure.input(productSchema).mutation(async ({ ctx, input }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon)
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      return createProduct({ ...input, salonId: salon.id });
    }),
    /** Atualiza um produto existente */
    update: protectedProcedure.input(productSchema.extend({ id: z4.string() })).mutation(async ({ ctx, input }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon)
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      const { id, ...data } = input;
      const updated = await updateProduct(id, salon.id, data);
      if (!updated)
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Produto n\xE3o encontrado"
        });
      return updated;
    }),
    /** Remove um produto */
    delete: protectedProcedure.input(z4.object({ id: z4.string() })).mutation(async ({ ctx, input }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon)
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      const ok = await deleteProduct(input.id, salon.id);
      if (!ok)
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Produto n\xE3o encontrado"
        });
      return { success: true };
    })
  }),
  // ==========================================================================
  // RATINGS — Avaliações pós-atendimento
  // ==========================================================================
  ratings: router({
    /** Lista todas as avaliações enviadas de um especialista */
    getBySpecialist: protectedProcedure.input(z4.object({ specialistId: z4.string() })).query(async ({ ctx, input }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon)
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      return await getRatingsBySpecialist(input.specialistId);
    }),
    /** Retorna mapa specialistId -> { average, count } para o salão inteiro */
    getAllAverages: protectedProcedure.query(async ({ ctx }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon)
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      return await getAllSpecialistRatings(salon.id);
    }),
    /** Lista todas as avaliações submetidas do salão — para a página /avaliacoes */
    getAll: protectedProcedure.query(async ({ ctx }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon)
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      return await getAllRatingsBySalon(salon.id);
    })
  }),
  // ==========================================================================
  // STRIPE — Pagamentos via cartão
  // ==========================================================================
  stripe: router({
    /** Cria um Payment Intent e retorna as opções de pagamento */
    createPaymentIntent: protectedProcedure.input(
      z4.object({
        amount: z4.number().positive(),
        description: z4.string().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon)
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      const paymentIntent = await createStripePaymentIntent({
        amount: input.amount,
        description: input.description || "Pagamento BizFlow Access",
        metadata: { salonId: salon.id, userId: ctx.user.id }
      });
      return paymentIntent;
    }),
    /** Confirma um Payment Intent após o cliente preencher os dados do cartão */
    confirmPayment: protectedProcedure.input(
      z4.object({
        paymentIntentId: z4.string()
      })
    ).mutation(async ({ input }) => {
      const result = await confirmStripePayment(input.paymentIntentId);
      return result;
    }),
    /** Retorna as opções de pagamento disponíveis */
    getPaymentOptions: protectedProcedure.input(
      z4.object({
        amount: z4.number().positive()
      })
    ).query(async ({ input, ctx }) => {
      const salon = await getSalonByUserId(ctx.user.id);
      if (!salon)
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Sal\xE3o n\xE3o encontrado"
        });
      return generatePaymentOptions(
        input.amount,
        salon.pixKey || void 0,
        salon.name
      );
    })
  })
});
var publicRouter = router({
  booking: publicBookingRouter,
  ratings: router({
    /** Busca a avaliação pelo token — retorna info do serviço para exibir na tela pública */
    getByToken: publicProcedure.input(z4.object({ token: z4.string() })).query(async ({ input }) => {
      const rating = await getRatingByToken(input.token);
      if (!rating)
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Avalia\xE7\xE3o n\xE3o encontrada"
        });
      return rating;
    }),
    /** Submete a avaliação do cliente (1-5 estrelas + comentário opcional) */
    submit: publicProcedure.input(
      z4.object({
        token: z4.string(),
        stars: z4.number().int().min(1).max(5),
        comment: z4.string().max(500).optional()
      })
    ).mutation(async ({ input }) => {
      const rating = await getRatingByToken(input.token);
      if (!rating)
        throw new TRPCError4({
          code: "NOT_FOUND",
          message: "Avalia\xE7\xE3o n\xE3o encontrada"
        });
      if (rating.used)
        throw new TRPCError4({
          code: "BAD_REQUEST",
          message: "Esta avalia\xE7\xE3o j\xE1 foi enviada"
        });
      const ok = await submitRating(input.token, input.stars, input.comment);
      if (!ok)
        throw new TRPCError4({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao salvar avalia\xE7\xE3o"
        });
      return { success: true };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid as nanoid2 } from "nanoid";
import path from "path";
function serveStatic(app) {
  const distPath = false ? path.resolve(import.meta.dirname, "../..", "dist", "public") : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
init_env();
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(
    helmet({
      contentSecurityPolicy: ENV.isProduction ? {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "blob:", "https:"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          frameSrc: ["'self'", "https://www.youtube.com", "https://www.youtube-nocookie.com"],
          connectSrc: ["'self'", "https:"]
        }
      } : false,
      crossOriginEmbedderPolicy: false
    })
  );
  const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1e3,
    // 15 minutos
    max: 100,
    // Limite de 100 requisições por IP
    message: "Muitas requisi\xE7\xF5es deste IP, tente novamente mais tarde",
    standardHeaders: true,
    legacyHeaders: false
  });
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1e3,
    max: 10,
    // 10 tentativas por 15 min por IP
    message: "Muitas tentativas de autentica\xE7\xE3o, tente novamente em 15 minutos",
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
  });
  app.use(express2.json({ limit: "10mb" }));
  app.use(express2.urlencoded({ limit: "10mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    (req, _res, next) => {
      const url = req.url || "";
      if (url.includes("auth.login") || url.includes("auth.register")) {
        return authLimiter(req, _res, next);
      }
      return next();
    },
    (req, res, next) => {
      const origin = req.headers.origin;
      if (!ENV.isProduction || origin && allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin || "*");
        res.header(
          "Access-Control-Allow-Methods",
          "GET,POST,PUT,DELETE,OPTIONS"
        );
        res.header(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization, Content-Length, X-Requested-With"
        );
        res.header("Access-Control-Allow-Credentials", "true");
      }
      if (req.method === "OPTIONS") {
        res.sendStatus(200);
      } else {
        next();
      }
    },
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  const allowedOrigins = ENV.isProduction ? [process.env.FRONTEND_URL || ""].filter(Boolean) : ["http://localhost:3000", "http://localhost:5173"];
  app.use(
    "/api/public",
    publicLimiter,
    (req, res, next) => {
      const origin = req.headers.origin;
      if (!ENV.isProduction || origin && allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin || "*");
        res.header(
          "Access-Control-Allow-Methods",
          "GET,POST,PUT,DELETE,OPTIONS"
        );
        res.header(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization, Content-Length, X-Requested-With"
        );
        res.header("Access-Control-Allow-Credentials", "true");
      }
      if (req.method === "OPTIONS") {
        res.sendStatus(200);
      } else {
        next();
      }
    },
    createExpressMiddleware({
      router: publicRouter,
      createContext
    })
  );
  if (false) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort && !ENV.isProduction) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, "0.0.0.0", () => {
    if (!ENV.isProduction) {
      console.log(`Servidor em execu\xE7\xE3o: http://localhost:${port}/ (bind 0.0.0.0)`);
    }
  });
}
startServer().catch(console.error);
