CREATE TABLE "appointment_products" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"appointmentId" varchar(64) NOT NULL,
	"productId" varchar(64) NOT NULL,
	"salonId" varchar(64) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unitPrice" numeric(10, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "appointment_products" ADD CONSTRAINT "appointment_products_appointmentId_appointments_id_fk" FOREIGN KEY ("appointmentId") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_products" ADD CONSTRAINT "appointment_products_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_products" ADD CONSTRAINT "appointment_products_salonId_salons_id_fk" FOREIGN KEY ("salonId") REFERENCES "public"."salons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "apt_products_appointmentId_idx" ON "appointment_products" USING btree ("appointmentId");--> statement-breakpoint
CREATE INDEX "apt_products_salonId_idx" ON "appointment_products" USING btree ("salonId");