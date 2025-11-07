BEGIN;

-- Add salonId column to users so each user can be associated to a salon
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS salonId varchar(64);

-- Create index to speed up lookups by salon
CREATE INDEX IF NOT EXISTS users_salonId_idx ON users(salonId);

COMMIT;
