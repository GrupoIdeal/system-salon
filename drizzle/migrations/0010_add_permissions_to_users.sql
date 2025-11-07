BEGIN;

-- Add permissions column as jsonb nullable so existing installs won't break
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT NULL;

COMMIT;
