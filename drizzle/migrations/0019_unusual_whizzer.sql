CREATE TABLE "ratings" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"salonId" varchar(64) NOT NULL,
	"specialistId" varchar(64) NOT NULL,
	"appointmentId" varchar(64) NOT NULL,
	"token" varchar(128) NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"stars" integer,
	"comment" text,
	"clientName" text,
	"createdAt" timestamp DEFAULT now(),
	"submittedAt" timestamp,
	CONSTRAINT "ratings_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_salonId_salons_id_fk" FOREIGN KEY ("salonId") REFERENCES "public"."salons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_specialistId_specialists_id_fk" FOREIGN KEY ("specialistId") REFERENCES "public"."specialists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_appointmentId_appointments_id_fk" FOREIGN KEY ("appointmentId") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ratings_salonId_idx" ON "ratings" USING btree ("salonId");--> statement-breakpoint
CREATE INDEX "ratings_specialistId_idx" ON "ratings" USING btree ("specialistId");--> statement-breakpoint
CREATE INDEX "ratings_token_idx" ON "ratings" USING btree ("token");