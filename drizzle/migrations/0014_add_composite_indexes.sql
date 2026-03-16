CREATE INDEX "appointments_salonId_date_idx" ON "appointments" USING btree ("salonId","appointmentDate");--> statement-breakpoint
CREATE INDEX "appointments_specialistId_date_idx" ON "appointments" USING btree ("specialistId","appointmentDate");--> statement-breakpoint
CREATE INDEX "transactions_salonId_date_idx" ON "transactions" USING btree ("salonId","transactionDate");