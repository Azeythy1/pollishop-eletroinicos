import { getDb } from './server/db.ts';

const db = await getDb();

if (!db) {
  console.error('Database not available');
  process.exit(1);
}

const migrations = [
  "ALTER TABLE `iphones` ADD `cooler` varchar(128)",
  "ALTER TABLE `iphones` ADD `cabinet` varchar(128)",
  "ALTER TABLE `iphones` ADD `itemCategory` enum('Informática','Acessórios')",
  "ALTER TABLE `iphones` ADD `itemSubcategory` varchar(64)",
  "ALTER TABLE `iphones` MODIFY COLUMN `priceAdjustValue` decimal(10,2) NOT NULL DEFAULT 0"
];

for (const migration of migrations) {
  try {
    console.log(`Executando: ${migration.substring(0, 50)}...`);
    await db.execute(migration);
    console.log('✓ OK');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠ Coluna já existe, pulando...');
    } else {
      console.error('Erro:', error.message);
    }
  }
}

console.log('✓ Todas as migrações aplicadas!');
process.exit(0);
