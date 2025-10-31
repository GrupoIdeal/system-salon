-- Remove working_hours column from salons table since we'll use only specialist schedules
ALTER TABLE salons DROP COLUMN IF EXISTS "workingHours";
