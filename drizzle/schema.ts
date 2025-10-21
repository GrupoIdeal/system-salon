import {
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  int,
  decimal,
  boolean,
  json,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table for admin authentication
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
  lastSignedIn: timestamp("lastSignedIn"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Salon data table
 */
export const salons = mysqlTable(
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
    workingHours: json("workingHours").$type<Record<string, { start: string; end: string }>>(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index("userIdIdx").on(table.userId),
  })
);

export type Salon = typeof salons.$inferSelect;
export type InsertSalon = typeof salons.$inferInsert;

/**
 * Specialist/Collaborator table
 */
export const specialists = mysqlTable(
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
    workingDays: json("workingDays").$type<Record<string, { start: string; end: string }>>(),
    status: mysqlEnum("status", ["active", "inactive"]).default("active"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
  },
  (table) => ({
    salonIdIdx: index("salonIdIdx").on(table.salonId),
  })
);

export type Specialist = typeof specialists.$inferSelect;
export type InsertSpecialist = typeof specialists.$inferInsert;

/**
 * Client table
 */
export const clients = mysqlTable(
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
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
  },
  (table) => ({
    salonIdIdx: index("salonIdIdx").on(table.salonId),
    emailIdx: index("emailIdx").on(table.email),
  })
);

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Service table
 */
export const services = mysqlTable(
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
    duration: int("duration").notNull(), // in minutes
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    status: mysqlEnum("status", ["active", "inactive"]).default("active"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
  },
  (table) => ({
    salonIdIdx: index("salonIdIdx").on(table.salonId),
    specialistIdIdx: index("specialistIdIdx").on(table.specialistId),
  })
);

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Appointment table
 */
export const appointments = mysqlTable(
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
    status: mysqlEnum("status", [
      "pending",
      "confirmed",
      "completed",
      "cancelled",
    ]).default("pending"),
    notes: text("notes"),
    isPublic: boolean("isPublic").default(false),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
  },
  (table) => ({
    salonIdIdx: index("salonIdIdx").on(table.salonId),
    clientIdIdx: index("clientIdIdx").on(table.clientId),
    serviceIdIdx: index("serviceIdIdx").on(table.serviceId),
    specialistIdIdx: index("specialistIdIdx").on(table.specialistId),
    appointmentDateIdx: index("appointmentDateIdx").on(table.appointmentDate),
  })
);

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Password reset token table
 */
export const passwordResets = mysqlTable(
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
  (table) => ({
    userIdIdx: index("userIdIdx").on(table.userId),
    tokenIdx: index("tokenIdx").on(table.token),
  })
);

export type PasswordReset = typeof passwordResets.$inferSelect;
export type InsertPasswordReset = typeof passwordResets.$inferInsert;

