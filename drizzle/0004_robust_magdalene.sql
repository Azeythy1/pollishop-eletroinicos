ALTER TABLE `iphones` MODIFY COLUMN `storage` varchar(16);--> statement-breakpoint
ALTER TABLE `iphones` MODIFY COLUMN `batteryHealth` int;--> statement-breakpoint
ALTER TABLE `iphones` ADD `processor` varchar(128);--> statement-breakpoint
ALTER TABLE `iphones` ADD `ram` varchar(32);--> statement-breakpoint
ALTER TABLE `iphones` ADD `storageCapacity` varchar(128);--> statement-breakpoint
ALTER TABLE `iphones` ADD `gpu` varchar(128);--> statement-breakpoint
ALTER TABLE `iphones` ADD `powerSupply` varchar(64);--> statement-breakpoint
ALTER TABLE `iphones` ADD `screen` varchar(64);--> statement-breakpoint
ALTER TABLE `iphones` ADD `itemType` varchar(64);--> statement-breakpoint
ALTER TABLE `iphones` ADD `brand` varchar(64);--> statement-breakpoint
ALTER TABLE `iphones` ADD `specifications` text;--> statement-breakpoint
ALTER TABLE `iphones` ADD `compatibility` varchar(256);