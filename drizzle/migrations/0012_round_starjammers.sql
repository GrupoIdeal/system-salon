DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'salonId'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN "salonId" varchar(64);
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'priceFrom'
  ) THEN
    ALTER TABLE services ADD COLUMN "priceFrom" boolean DEFAULT false NOT NULL;
  END IF;
END $$;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS audit_logs_salonId_idx ON audit_logs("salonId");