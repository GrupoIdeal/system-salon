-- Migration 0018: add paidAmount to appointments
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS "paidAmount" numeric(10,2);

-- No-op for backwards compat: existing rows will have NULL paidAmount
