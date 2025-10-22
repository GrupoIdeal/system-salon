-- Nova migration para corrigir tipos ENUM e criar tabelas do sistema
-- Criação dos tipos ENUM necessários (com IF NOT EXISTS)
DO $$ BEGIN
    CREATE TYPE IF NOT EXISTS status AS ENUM ('active', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE IF NOT EXISTS appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE IF NOT EXISTS service_status AS ENUM ('active', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE IF NOT EXISTS specialist_status AS ENUM ('active', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE IF NOT EXISTS role AS ENUM ('user', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Criação das tabelas principais do sistema
CREATE TABLE IF NOT EXISTS "users" (
    "id" varchar(64) PRIMARY KEY NOT NULL,
    "email" varchar(320) NOT NULL,
    "password" text NOT NULL,
    "name" text NOT NULL,
    "role" role DEFAULT 'user' NOT NULL,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    "lastSignedIn" timestamp,
    CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "salons" (
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

CREATE TABLE IF NOT EXISTS "clients" (
    "id" varchar(64) PRIMARY KEY NOT NULL,
    "salonId" varchar(64) NOT NULL,
    "name" text NOT NULL,
    "email" varchar(320),
    "phone" varchar(20),
    "notes" text,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "specialists" (
    "id" varchar(64) PRIMARY KEY NOT NULL,
    "salonId" varchar(64) NOT NULL,
    "name" text NOT NULL,
    "specialty" varchar(255),
    "photo" text,
    "email" varchar(320),
    "phone" varchar(20),
    "bio" text,
    "workingDays" jsonb,
    "status" specialist_status DEFAULT 'active',
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "services" (
    "id" varchar(64) PRIMARY KEY NOT NULL,
    "salonId" varchar(64) NOT NULL,
    "specialistId" varchar(64),
    "name" text NOT NULL,
    "description" text,
    "duration" integer NOT NULL,
    "price" numeric(10, 2) NOT NULL,
    "status" service_status DEFAULT 'active',
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "appointments" (
    "id" varchar(64) PRIMARY KEY NOT NULL,
    "salonId" varchar(64) NOT NULL,
    "clientId" varchar(64) NOT NULL,
    "serviceId" varchar(64) NOT NULL,
    "specialistId" varchar(64) NOT NULL,
    "appointmentDate" timestamp NOT NULL,
    "appointmentTime" varchar(10) NOT NULL,
    "status" appointment_status DEFAULT 'pending',
    "notes" text,
    "isPublic" boolean DEFAULT false,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- Adição de constraints e índices
ALTER TABLE "appointments" ADD CONSTRAINT IF NOT EXISTS "appointments_salonId_salons_id_fk" FOREIGN KEY ("salonId") REFERENCES "salons"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "appointments" ADD CONSTRAINT IF NOT EXISTS "appointments_clientId_clients_id_fk" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "appointments" ADD CONSTRAINT IF NOT EXISTS "appointments_serviceId_services_id_fk" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "appointments" ADD CONSTRAINT IF NOT EXISTS "appointments_specialistId_specialists_id_fk" FOREIGN KEY ("specialistId") REFERENCES "specialists"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "clients" ADD CONSTRAINT IF NOT EXISTS "clients_salonId_salons_id_fk" FOREIGN KEY ("salonId") REFERENCES "salons"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "salons" ADD CONSTRAINT IF NOT EXISTS "salons_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "services" ADD CONSTRAINT IF NOT EXISTS "services_salonId_salons_id_fk" FOREIGN KEY ("salonId") REFERENCES "salons"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "services" ADD CONSTRAINT IF NOT EXISTS "services_specialistId_specialists_id_fk" FOREIGN KEY ("specialistId") REFERENCES "specialists"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "specialists" ADD CONSTRAINT IF NOT EXISTS "specialists_salonId_salons_id_fk" FOREIGN KEY ("salonId") REFERENCES "salons"("id") ON DELETE cascade ON UPDATE no action;

-- Índices
CREATE INDEX IF NOT EXISTS "appointments_salonId_idx" ON "appointments" USING btree ("salonId");
CREATE INDEX IF NOT EXISTS "appointments_clientId_idx" ON "appointments" USING btree ("clientId");
CREATE INDEX IF NOT EXISTS "appointments_serviceId_idx" ON "appointments" USING btree ("serviceId");
CREATE INDEX IF NOT EXISTS "appointments_specialistId_idx" ON "appointments" USING btree ("specialistId");
CREATE INDEX IF NOT EXISTS "appointments_appointmentDate_idx" ON "appointments" USING btree ("appointmentDate");
CREATE INDEX IF NOT EXISTS "clients_salonId_idx" ON "clients" USING btree ("salonId");
CREATE INDEX IF NOT EXISTS "clients_email_idx" ON "clients" USING btree ("email");
CREATE INDEX IF NOT EXISTS "salons_userId_idx" ON "salons" USING btree ("userId");
CREATE INDEX IF NOT EXISTS "services_salonId_idx" ON "services" USING btree ("salonId");
CREATE INDEX IF NOT EXISTS "services_specialistId_idx" ON "services" USING btree ("specialistId");
CREATE INDEX IF NOT EXISTS "specialists_salonId_idx" ON "specialists" USING btree ("salonId");
