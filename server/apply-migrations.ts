import { getDb } from "./db";

export async function applyPendingMigrations() {
  const db = await getDb();
  if (!db) {
    console.error("[Migrations] Database not available");
    return false;
  }

  const migrations = [
    { sql: "ALTER TABLE `iphones` ADD `cooler` varchar(128)", name: "cooler" },
    { sql: "ALTER TABLE `iphones` ADD `cabinet` varchar(128)", name: "cabinet" },
    { sql: "ALTER TABLE `iphones` ADD `itemCategory` enum('Informática','Acessórios')", name: "itemCategory" },
    { sql: "ALTER TABLE `iphones` ADD `itemSubcategory` varchar(64)", name: "itemSubcategory" },
    { sql: "ALTER TABLE `iphones` MODIFY COLUMN `priceAdjustValue` decimal(10,2) NOT NULL DEFAULT 0", name: "priceAdjustValue default" },
  ];

  for (const migration of migrations) {
    try {
      console.log(`[Migrations] Applying: ${migration.name}...`);
      await db.execute(migration.sql);
      console.log(`[Migrations] ✓ ${migration.name} applied`);
    } catch (error: any) {
      if (error.code === "ER_DUP_FIELDNAME") {
        console.log(`[Migrations] ⚠ ${migration.name} already exists, skipping...`);
      } else if (error.code === "ER_DUP_KEYNAME") {
        console.log(`[Migrations] ⚠ ${migration.name} constraint already exists, skipping...`);
      } else {
        console.error(`[Migrations] ✗ Error applying ${migration.name}:`, error.message);
      }
    }
  }

  console.log("[Migrations] All migrations completed!");
  return true;
}
