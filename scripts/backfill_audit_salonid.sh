#!/usr/bin/env zsh
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERRO: DATABASE_URL não definido. Exporte seu .env antes de rodar."
  exit 1
fi

echo "Populando audit_logs.salonId a partir de metadata->>'salonId' quando possível..."

psql "$DATABASE_URL" <<'SQL'
BEGIN;

-- Atualiza linhas sem salonId quando metadata contém salonId
UPDATE audit_logs
SET "salonId" = (metadata ->> 'salonId')
WHERE ("salonId" IS NULL OR "salonId" = '')
  AND metadata IS NOT NULL
  AND (metadata ->> 'salonId') IS NOT NULL
  AND (metadata ->> 'salonId') <> '';

-- Mostrar quantas linhas foram atualizadas
SELECT COUNT(*) AS updated_count FROM audit_logs WHERE (metadata ->> 'salonId') IS NOT NULL AND ("salonId" = (metadata ->> 'salonId'));

COMMIT;
SQL

echo "Concluído. (verifique o SELECT acima para contagem)"
