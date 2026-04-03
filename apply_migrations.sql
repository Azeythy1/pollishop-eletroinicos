-- Aplicar todas as migrações pendentes ao banco de dados

-- Migração 0003: Adicionar coluna category
ALTER TABLE `iphones` ADD `category` enum('Smartphones','Tablet','Notebook','Computadores','Periféricos','Acessórios') DEFAULT 'Smartphones' NOT NULL;

-- Migração 0004: Fazer storage e batteryHealth nullable, adicionar novos campos
ALTER TABLE `iphones` MODIFY COLUMN `storage` varchar(16);
ALTER TABLE `iphones` MODIFY COLUMN `batteryHealth` int;
ALTER TABLE `iphones` ADD `processor` varchar(128);
ALTER TABLE `iphones` ADD `ram` varchar(32);
ALTER TABLE `iphones` ADD `storageCapacity` varchar(128);
ALTER TABLE `iphones` ADD `gpu` varchar(128);
ALTER TABLE `iphones` ADD `powerSupply` varchar(64);
ALTER TABLE `iphones` ADD `screen` varchar(64);
ALTER TABLE `iphones` ADD `itemType` varchar(64);
ALTER TABLE `iphones` ADD `brand` varchar(64);
ALTER TABLE `iphones` ADD `specifications` text;
ALTER TABLE `iphones` ADD `compatibility` varchar(256);
