DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status') THEN
    CREATE TYPE public.status AS ENUM ('active','inactive');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
    CREATE TYPE public.role AS ENUM ('user','admin');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'specialist_status') THEN
    CREATE TYPE public.specialist_status AS ENUM ('active','inactive');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_status') THEN
    CREATE TYPE public.service_status AS ENUM ('active','inactive');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
    CREATE TYPE public.appointment_status AS ENUM ('pending','confirmed','completed','cancelled');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE public.payment_method AS ENUM ('cash','credit_card','debit_card','pix','bank_transfer','other');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
    CREATE TYPE public.transaction_status AS ENUM ('pending','completed','cancelled');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
    CREATE TYPE public.transaction_type AS ENUM ('income','expense','refund');
  END IF;
END$$;

-- CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"salonId" varchar(64) NOT NULL,
	"clientId" varchar(64) NOT NULL,
	"serviceId" varchar(64) NOT NULL,
	"specialistId" varchar(64) NOT NULL,
	"appointmentDate" timestamp NOT NULL,
	"appointmentTime" varchar(10) NOT NULL,
	"status" "appointment_status" DEFAULT 'pending',
	"notes" text,
	"isPublic" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"salonId" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"email" varchar(320),
	"phone" varchar(20),
	"birthDate" timestamp,
	"notes" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "passwordResets" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"userId" varchar(64) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"used" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "passwordResets_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "salons" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"userId" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"cnpj" varchar(20),
	"address" text,
	"phone" varchar(20),
	"email" varchar(320),
	"logo" text,
	"workingHours" jsonb,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"salonId" varchar(64) NOT NULL,
	"specialistId" varchar(64),
	"name" text NOT NULL,
	"description" text,
	"duration" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"status" "status" DEFAULT 'active',
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "specialists" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"salonId" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"specialty" varchar(255),
	"photo" text,
	"email" varchar(320),
	"phone" varchar(20),
	"workingDays" jsonb,
	"status" "status" DEFAULT 'active',
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"lastSignedIn" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_salonId_salons_id_fk" FOREIGN KEY ("salonId") REFERENCES "public"."salons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clientId_clients_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_serviceId_services_id_fk" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_specialistId_specialists_id_fk" FOREIGN KEY ("specialistId") REFERENCES "public"."specialists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_salonId_salons_id_fk" FOREIGN KEY ("salonId") REFERENCES "public"."salons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passwordResets" ADD CONSTRAINT "passwordResets_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salons" ADD CONSTRAINT "salons_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_salonId_salons_id_fk" FOREIGN KEY ("salonId") REFERENCES "public"."salons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_specialistId_specialists_id_fk" FOREIGN KEY ("specialistId") REFERENCES "public"."specialists"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specialists" ADD CONSTRAINT "specialists_salonId_salons_id_fk" FOREIGN KEY ("salonId") REFERENCES "public"."salons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointments_salonId_idx" ON "appointments" USING btree ("salonId");--> statement-breakpoint
CREATE INDEX "appointments_clientId_idx" ON "appointments" USING btree ("clientId");--> statement-breakpoint
CREATE INDEX "appointments_serviceId_idx" ON "appointments" USING btree ("serviceId");--> statement-breakpoint
CREATE INDEX "appointments_specialistId_idx" ON "appointments" USING btree ("specialistId");--> statement-breakpoint
CREATE INDEX "appointments_appointmentDate_idx" ON "appointments" USING btree ("appointmentDate");--> statement-breakpoint
CREATE INDEX "clients_salonId_idx" ON "clients" USING btree ("salonId");--> statement-breakpoint
CREATE INDEX "clients_email_idx" ON "clients" USING btree ("email");--> statement-breakpoint
CREATE INDEX "passwordResets_userId_idx" ON "passwordResets" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "passwordResets_token_idx" ON "passwordResets" USING btree ("token");--> statement-breakpoint
CREATE INDEX "salons_userId_idx" ON "salons" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "services_salonId_idx" ON "services" USING btree ("salonId");--> statement-breakpoint
CREATE INDEX "services_specialistId_idx" ON "services" USING btree ("specialistId");--> statement-breakpoint
CREATE INDEX "specialists_salonId_idx" ON "specialists" USING btree ("salonId");