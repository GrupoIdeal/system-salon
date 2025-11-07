-- Backfill de dados legacy de specialists.workingDays para specialistSchedules
INSERT INTO "specialistSchedules" (
  "specialistId",
  "workingHours",
  "createdAt",
  "updatedAt"
)
SELECT id, "workingDays"::jsonb, now(), now()
FROM "specialists"
WHERE "workingDays" IS NOT NULL
ON CONFLICT ("specialistId") DO NOTHING;
