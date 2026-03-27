CREATE TABLE `installment_rates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`installments` int NOT NULL,
	`rate` decimal(5,2) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `installment_rates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iphone_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`iphoneId` int NOT NULL,
	`url` text NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`isPrimary` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `iphone_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iphones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`model` varchar(64) NOT NULL,
	`storage` varchar(16) NOT NULL,
	`color` varchar(64),
	`batteryHealth` int NOT NULL,
	`repairs` text,
	`condition` enum('excelente','bom','regular') NOT NULL DEFAULT 'bom',
	`costPrice` decimal(10,2) NOT NULL,
	`priceAdjustType` enum('percentage','fixed') NOT NULL DEFAULT 'percentage',
	`priceAdjustValue` decimal(10,2) NOT NULL DEFAULT '0',
	`cashPrice` decimal(10,2) NOT NULL,
	`installmentConfig` json,
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `iphones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `iphone_photos` ADD CONSTRAINT `iphone_photos_iphoneId_iphones_id_fk` FOREIGN KEY (`iphoneId`) REFERENCES `iphones`(`id`) ON DELETE cascade ON UPDATE no action;