CREATE TABLE IF NOT EXISTS audit_logs (
    id varchar(64) PRIMARY KEY,
    "userId" varchar(64),
    action varchar(64) NOT NULL,
    entity varchar(128) NOT NULL,
    "entityId" varchar(128),
    before jsonb,
    "after" jsonb,
    metadata jsonb,
    "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS specialistSchedules (
    "specialistId" varchar(64) PRIMARY KEY,
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

CREATE INDEX IF NOT EXISTS audit_logs_userId_idx ON audit_logs("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON audit_logs(entity,"entityId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS audit_logs_createdAt_idx ON audit_logs("createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS specialistSchedules_updatedAt_idx ON specialistSchedules("updatedAt");