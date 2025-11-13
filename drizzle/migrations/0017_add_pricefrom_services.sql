-- Add priceFrom flag to services (boolean, default false)
ALTER TABLE "services"
  ADD COLUMN "priceFrom" boolean DEFAULT false NOT NULL;

-- Create index if you plan to query by this flag (optional)
CREATE INDEX IF NOT EXISTS "services_priceFrom_idx" ON "services" USING btree ("priceFrom");
