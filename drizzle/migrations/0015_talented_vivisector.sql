CREATE TABLE "products" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"salonId" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"stock" integer DEFAULT 0 NOT NULL,
	"minStock" integer DEFAULT 5 NOT NULL,
	"costPrice" numeric(10, 2),
	"sellPrice" numeric(10, 2),
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "loyaltyPoints" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_salonId_salons_id_fk" FOREIGN KEY ("salonId") REFERENCES "public"."salons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "products_salonId_idx" ON "products" USING btree ("salonId");