CREATE TYPE "public"."appointment_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled');--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "appointment_status" "appointment_status" DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "service_status" "service_status" DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "specialists" ADD COLUMN "specialist_status" "specialist_status" DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "specialists" DROP COLUMN "status";