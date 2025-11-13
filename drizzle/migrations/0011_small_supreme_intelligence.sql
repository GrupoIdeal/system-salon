CREATE TABLE "audit_logs" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"userId" varchar(64),
	"action" varchar(64) NOT NULL,
	"entity" varchar(128) NOT NULL,
	"entityId" varchar(128),
	"before" jsonb,
	"after" jsonb,
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "specialistSchedules" (
	"specialistId" varchar(64) PRIMARY KEY NOT NULL,
	"timeSlotDuration" integer DEFAULT 30 NOT NULL,
	"bufferTime" integer DEFAULT 0 NOT NULL,
	"allowBookingDaysInAdvance" integer DEFAULT 30 NOT NULL,
	"minimumNoticeHours" integer DEFAULT 2 NOT NULL,
	"autoConfirmBookings" boolean DEFAULT true NOT NULL,
	"allowOnlineBooking" boolean DEFAULT true NOT NULL,
	"workingHours" jsonb,
	"customUnavailableDates" jsonb DEFAULT '[]'::jsonb,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity","entityId");--> statement-breakpoint
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "specialistSchedules_updatedAt_idx" ON "specialistSchedules" USING btree ("updatedAt");