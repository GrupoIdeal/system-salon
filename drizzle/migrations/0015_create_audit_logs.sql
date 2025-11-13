BEGIN;

CREATE TABLE IF NOT EXISTS audit_logs (
  id varchar(64) PRIMARY KEY,
  "userId" varchar(64),
  action varchar(64) NOT NULL,
  entity varchar(128) NOT NULL,
  "entityId" varchar(128),
  before jsonb,
  after jsonb,
  metadata jsonb,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS audit_logs_userId_idx ON audit_logs("userId");
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON audit_logs(entity, "entityId");
CREATE INDEX IF NOT EXISTS audit_logs_createdAt_idx ON audit_logs("createdAt");

-- Adiciona coluna salonId se não existir (suporta reexecução em ambientes onde migration já foi aplicada parcialmente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'salonId'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN "salonId" varchar(64);
  END IF;
END$$;

-- Cria índice na coluna salonId se não existir
CREATE INDEX IF NOT EXISTS audit_logs_salonId_idx ON audit_logs("salonId");

COMMIT;
