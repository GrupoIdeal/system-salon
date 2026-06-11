-- Sprint 6: Módulo de Avaliações
-- Clientes recebem um token único após o atendimento e podem avaliar o serviço
CREATE TABLE IF NOT EXISTS "ratings" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "salonId" varchar(64) NOT NULL REFERENCES "salons"("id") ON DELETE CASCADE,
  "specialistId" varchar(64) NOT NULL REFERENCES "specialists"("id") ON DELETE CASCADE,
  "appointmentId" varchar(64) NOT NULL REFERENCES "appointments"("id") ON DELETE CASCADE,
  -- Token único enviado ao cliente para acessar a página de avaliação
  "token" varchar(128) NOT NULL UNIQUE,
  -- true após o cliente submeter a avaliação
  "used" boolean NOT NULL DEFAULT false,
  -- 1 a 5 estrelas (null enquanto não avaliado)
  "stars" integer,
  -- Comentário opcional do cliente
  "comment" text,
  -- Nome do cliente (snapshot no momento do atendimento)
  "clientName" text,
  "createdAt" timestamp DEFAULT now(),
  "submittedAt" timestamp
);

CREATE INDEX IF NOT EXISTS "ratings_salonId_idx" ON "ratings"("salonId");
CREATE INDEX IF NOT EXISTS "ratings_specialistId_idx" ON "ratings"("specialistId");
CREATE INDEX IF NOT EXISTS "ratings_token_idx" ON "ratings"("token");
