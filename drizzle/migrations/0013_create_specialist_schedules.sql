-- Cria tabela persistente para configurações de horário por especialista
CREATE TABLE IF NOT EXISTS "specialistSchedules" (
  "specialistId" varchar(64) PRIMARY KEY NOT NULL,
  "timeSlotDuration" integer NOT NULL DEFAULT 30,
  "bufferTime" integer NOT NULL DEFAULT 0,
  "allowBookingDaysInAdvance" integer NOT NULL DEFAULT 30,
  "minimumNoticeHours" integer NOT NULL DEFAULT 2,
  "autoConfirmBookings" boolean NOT NULL DEFAULT true,
  "allowOnlineBooking" boolean NOT NULL DEFAULT true,
  "workingHours" jsonb,
  "customUnavailableDates" jsonb DEFAULT '[]'::jsonb,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_specialistSchedules_updatedAt" ON "specialistSchedules" ("updatedAt");
