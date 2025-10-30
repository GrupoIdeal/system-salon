import { relations } from "drizzle-orm";
import {
  users,
  salons,
  specialists,
  clients,
  services,
  appointments,
} from "./schema";

// User relations
export const usersRelations = relations(users, ({ one }) => ({
  salon: one(salons, {
    fields: [users.id],
    references: [salons.userId],
  }),
}));

// Salon relations
export const salonsRelations = relations(salons, ({ one, many }) => ({
  user: one(users, {
    fields: [salons.userId],
    references: [users.id],
  }),
  specialists: many(specialists),
  clients: many(clients),
  services: many(services),
  appointments: many(appointments),
}));

// Specialist relations
export const specialistsRelations = relations(specialists, ({ one, many }) => ({
  salon: one(salons, {
    fields: [specialists.salonId],
    references: [salons.id],
  }),
  services: many(services),
  appointments: many(appointments),
}));

// Client relations
export const clientsRelations = relations(clients, ({ one, many }) => ({
  salon: one(salons, {
    fields: [clients.salonId],
    references: [salons.id],
  }),
  appointments: many(appointments),
}));

// Service relations
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
}));

// Appointment relations
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
}));
