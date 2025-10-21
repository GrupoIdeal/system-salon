CREATE TABLE `appointments` (
	`id` varchar(64) NOT NULL,
	`salonId` varchar(64) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`serviceId` varchar(64) NOT NULL,
	`specialistId` varchar(64) NOT NULL,
	`appointmentDate` timestamp NOT NULL,
	`appointmentTime` varchar(10) NOT NULL,
	`status` enum('pending','confirmed','completed','cancelled') DEFAULT 'pending',
	`notes` text,
	`isPublic` boolean DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` varchar(64) NOT NULL,
	`salonId` varchar(64) NOT NULL,
	`name` text NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`birthDate` timestamp,
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `passwordResets` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`used` boolean DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `passwordResets_id` PRIMARY KEY(`id`),
	CONSTRAINT `passwordResets_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `salons` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`name` text NOT NULL,
	`cnpj` varchar(20),
	`address` text,
	`phone` varchar(20),
	`email` varchar(320),
	`logo` text,
	`workingHours` json,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `salons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` varchar(64) NOT NULL,
	`salonId` varchar(64) NOT NULL,
	`specialistId` varchar(64),
	`name` text NOT NULL,
	`description` text,
	`duration` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`status` enum('active','inactive') DEFAULT 'active',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `specialists` (
	`id` varchar(64) NOT NULL,
	`salonId` varchar(64) NOT NULL,
	`name` text NOT NULL,
	`specialty` varchar(255),
	`photo` text,
	`email` varchar(320),
	`phone` varchar(20),
	`workingDays` json,
	`status` enum('active','inactive') DEFAULT 'active',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `specialists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `lastSignedIn` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `password` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_salonId_salons_id_fk` FOREIGN KEY (`salonId`) REFERENCES `salons`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_serviceId_services_id_fk` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_specialistId_specialists_id_fk` FOREIGN KEY (`specialistId`) REFERENCES `specialists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_salonId_salons_id_fk` FOREIGN KEY (`salonId`) REFERENCES `salons`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `passwordResets` ADD CONSTRAINT `passwordResets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `salons` ADD CONSTRAINT `salons_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `services` ADD CONSTRAINT `services_salonId_salons_id_fk` FOREIGN KEY (`salonId`) REFERENCES `salons`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `services` ADD CONSTRAINT `services_specialistId_specialists_id_fk` FOREIGN KEY (`specialistId`) REFERENCES `specialists`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `specialists` ADD CONSTRAINT `specialists_salonId_salons_id_fk` FOREIGN KEY (`salonId`) REFERENCES `salons`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `salonIdIdx` ON `appointments` (`salonId`);--> statement-breakpoint
CREATE INDEX `clientIdIdx` ON `appointments` (`clientId`);--> statement-breakpoint
CREATE INDEX `serviceIdIdx` ON `appointments` (`serviceId`);--> statement-breakpoint
CREATE INDEX `specialistIdIdx` ON `appointments` (`specialistId`);--> statement-breakpoint
CREATE INDEX `appointmentDateIdx` ON `appointments` (`appointmentDate`);--> statement-breakpoint
CREATE INDEX `salonIdIdx` ON `clients` (`salonId`);--> statement-breakpoint
CREATE INDEX `emailIdx` ON `clients` (`email`);--> statement-breakpoint
CREATE INDEX `userIdIdx` ON `passwordResets` (`userId`);--> statement-breakpoint
CREATE INDEX `tokenIdx` ON `passwordResets` (`token`);--> statement-breakpoint
CREATE INDEX `userIdIdx` ON `salons` (`userId`);--> statement-breakpoint
CREATE INDEX `salonIdIdx` ON `services` (`salonId`);--> statement-breakpoint
CREATE INDEX `specialistIdIdx` ON `services` (`specialistId`);--> statement-breakpoint
CREATE INDEX `salonIdIdx` ON `specialists` (`salonId`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `loginMethod`;