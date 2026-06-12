ALTER TABLE "appointments" ALTER COLUMN "appointmentDate" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "passwordResets" ALTER COLUMN "expiresAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "passwordResets" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "passwordResets" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "salons" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "salons" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "salons" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "salons" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "specialistSchedules" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "specialistSchedules" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "specialistSchedules" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "specialistSchedules" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "specialists" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "specialists" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "specialists" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "specialists" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "transactionDate" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "lastSignedIn" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "deletedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "salons" ADD COLUMN "deletedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "deletedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "specialists" ADD COLUMN "deletedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "deletedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deletedAt" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "passwordResets_expiresAt_idx" ON "passwordResets" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "salons_deletedAt_idx" ON "salons" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "services_status_idx" ON "services" USING btree ("status");--> statement-breakpoint
CREATE INDEX "services_deletedAt_idx" ON "services" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "specialists_status_idx" ON "specialists" USING btree ("status");--> statement-breakpoint
CREATE INDEX "specialists_deletedAt_idx" ON "specialists" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "users_salonId_idx" ON "users" USING btree ("salonId");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_deletedAt_idx" ON "users" USING btree ("deletedAt");