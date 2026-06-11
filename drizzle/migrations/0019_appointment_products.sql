-- Tabela de produtos vendidos em um atendimento
-- Permite adicionar produtos ao checkout de um agendamento,
-- somando ao valor do serviço para calcular o total pago

CREATE TABLE IF NOT EXISTS "appointment_products" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "appointmentId" varchar(64) NOT NULL REFERENCES "appointments"("id") ON DELETE CASCADE,
  "productId" varchar(64) NOT NULL REFERENCES "products"("id"),
  "salonId" varchar(64) NOT NULL REFERENCES "salons"("id") ON DELETE CASCADE,
  "quantity" integer NOT NULL DEFAULT 1,
  "unitPrice" decimal(10,2) NOT NULL,
  "createdAt" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "apt_products_appointmentId_idx" ON "appointment_products" ("appointmentId");
CREATE INDEX IF NOT EXISTS "apt_products_salonId_idx" ON "appointment_products" ("salonId");
