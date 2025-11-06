DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE public.payment_method AS ENUM('cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer', 'other');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
    CREATE TYPE public.transaction_status AS ENUM('pending', 'completed', 'cancelled');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
    CREATE TYPE public.transaction_type AS ENUM('income', 'expense', 'refund');
  END IF;
END$$;

CREATE TABLE "transactions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"salonId" varchar(64) NOT NULL,
	"appointmentId" varchar(64),
	"clientId" varchar(64),
	"serviceId" varchar(64),
	"specialistId" varchar(64),
	"type" "transaction_type" NOT NULL,
	"status" "transaction_status" DEFAULT 'completed' NOT NULL,
	"paymentMethod" "payment_method",
	"amount" numeric(10, 2) NOT NULL,
	"serviceFee" numeric(10, 2),
	"specialistCommission" numeric(10, 2),
	"description" text NOT NULL,
	"notes" text,
	"transactionDate" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);

ALTER TABLE "transactions" ADD CONSTRAINT "transactions_salonId_salons_id_fk" FOREIGN KEY ("salonId") REFERENCES "public"."salons"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_appointmentId_appointments_id_fk" FOREIGN KEY ("appointmentId") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_clientId_clients_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_serviceId_services_id_fk" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_specialistId_specialists_id_fk" FOREIGN KEY ("specialistId") REFERENCES "public"."specialists"("id") ON DELETE set null ON UPDATE no action;
CREATE INDEX "transactions_salonId_idx" ON "transactions" USING btree ("salonId");
CREATE INDEX "transactions_appointmentId_idx" ON "transactions" USING btree ("appointmentId");
CREATE INDEX "transactions_clientId_idx" ON "transactions" USING btree ("clientId");
CREATE INDEX "transactions_type_idx" ON "transactions" USING btree ("type");
CREATE INDEX "transactions_status_idx" ON "transactions" USING btree ("status");
CREATE INDEX "transactions_date_idx" ON "transactions" USING btree ("transactionDate");