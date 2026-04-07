#!/usr/bin/env node
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const migrations = [
  { sql: "ALTER TABLE `iphones` ADD `cooler` varchar(128)", name: "cooler" },
  { sql: "ALTER TABLE `iphones` ADD `cabinet` varchar(128)", name: "cabinet" },
  { sql: "ALTER TABLE `iphones` ADD `itemCategory` enum('Informática','Acessórios')", name: "itemCategory" },
  { sql: "ALTER TABLE `iphones` ADD `itemSubcategory` varchar(64)", name: "itemSubcategory" },
  { sql: "ALTER TABLE `iphones` MODIFY COLUMN `priceAdjustValue` decimal(10,2) NOT NULL DEFAULT 0", name: "priceAdjustValue default" },
];

async function runMigrations() {
  const connection = await mysql.createConnection(dbUrl);
  
  try {
    console.log('🔄 Applying migrations...\n');
    
    for (const migration of migrations) {
      try {
        console.log(`  → ${migration.name}...`);
        await connection.execute(migration.sql);
        console.log(`  ✓ ${migration.name} applied\n`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_DUP_KEYNAME') {
          console.log(`  ⚠ ${migration.name} already exists, skipping\n`);
        } else {
          console.error(`  ✗ Error: ${error.message}\n`);
          throw error;
        }
      }
    }
    
    console.log('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigrations();
