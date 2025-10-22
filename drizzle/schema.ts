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
  email: varchar("email", { length: 320 }).notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn"),
  photoUrl: text("photoUrl"),
  phone: varchar("phone", { length: 20 }),
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
    workingHours:
      jsonb("workingHours").$type<
        Record<
          string,
          Array<{
            start: string;
            end: string;
            lunch?: { start: string; end: string };
          }>
        >
      >(),
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
    workingDays:
      jsonb("workingDays").$type<
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
    birthDate: timestamp("birthDate"),
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
