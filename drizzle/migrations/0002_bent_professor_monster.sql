-- CREATE TYPE "public"."service_status" AS ENUM('active', 'inactive');--> statement-breakpoint
-- CREATE TYPE "public"."specialist_status" AS ENUM('active', 'inactive');--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "status" "service_status" DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "specialists" ADD COLUMN "status" "specialist_status" DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "service_status";--> statement-breakpoint
ALTER TABLE "specialists" DROP COLUMN "specialist_status";