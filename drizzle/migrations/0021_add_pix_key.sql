-- Sprint 5: adicionar chave PIX ao salão
ALTER TABLE "salons" ADD COLUMN IF NOT EXISTS "pixKey" text;
