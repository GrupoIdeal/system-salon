BEGIN;

-- Índice composto para consultas por salão ordenadas por createdAt (ajuda paginação por salão)
CREATE INDEX IF NOT EXISTS audit_logs_salonId_createdAt_idx ON audit_logs("salonId", "createdAt" DESC);

COMMIT;
