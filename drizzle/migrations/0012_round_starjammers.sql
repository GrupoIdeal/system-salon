ALTER TABLE "audit_logs" ADD COLUMN "salonId" varchar(64);--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "priceFrom" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "audit_logs_salonId_idx" ON "audit_logs" USING btree ("salonId");