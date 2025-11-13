#!/usr/bin/env zsh
# Aplica alteração para adicionar coluna salonId em audit_logs se não existir
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERRO: DATABASE_URL não definido. Exporte seu .env antes de rodar."
  exit 1
fi

echo "Conectando ao banco e aplicando alteração (adicionando coluna audit_logs.salonId se necessário)..."

psql "$DATABASE_URL" <<'SQL'
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'salonId'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN "salonId" varchar(64);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS audit_logs_salonId_idx ON audit_logs("salonId");

COMMIT;
SQL

echo "Concluído."
