CREATE TYPE "public"."payment_method" AS ENUM('cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer', 'other');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('income', 'expense', 'refund');--> statement-breakpoint
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
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_salonId_salons_id_fk" FOREIGN KEY ("salonId") REFERENCES "public"."salons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_appointmentId_appointments_id_fk" FOREIGN KEY ("appointmentId") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_clientId_clients_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_serviceId_services_id_fk" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_specialistId_specialists_id_fk" FOREIGN KEY ("specialistId") REFERENCES "public"."specialists"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transactions_salonId_idx" ON "transactions" USING btree ("salonId");--> statement-breakpoint
CREATE INDEX "transactions_appointmentId_idx" ON "transactions" USING btree ("appointmentId");--> statement-breakpoint
CREATE INDEX "transactions_clientId_idx" ON "transactions" USING btree ("clientId");--> statement-breakpoint
CREATE INDEX "transactions_type_idx" ON "transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "transactions_status_idx" ON "transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "transactions_date_idx" ON "transactions" USING btree ("transactionDate");