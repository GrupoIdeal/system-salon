-- Sprint 4: adicionar coluna de foto ao cadastro de clientes
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "photo" text;
