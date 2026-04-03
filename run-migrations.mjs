import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL não está definida");
  process.exit(1);
}

async function runMigrations() {
  try {
    console.log("Conectando ao banco de dados...");
    const db = drizzle(DATABASE_URL);

    const migrations = [
      // Migração 0003: Adicionar coluna category
      `ALTER TABLE \`iphones\` ADD \`category\` enum('Smartphones','Tablet','Notebook','Computadores','Periféricos','Acessórios') DEFAULT 'Smartphones' NOT NULL`,
      
      // Migração 0004: Fazer storage e batteryHealth nullable, adicionar novos campos
      `ALTER TABLE \`iphones\` MODIFY COLUMN \`storage\` varchar(16)`,
      `ALTER TABLE \`iphones\` MODIFY COLUMN \`batteryHealth\` int`,
      `ALTER TABLE \`iphones\` ADD \`processor\` varchar(128)`,
      `ALTER TABLE \`iphones\` ADD \`ram\` varchar(32)`,
      `ALTER TABLE \`iphones\` ADD \`storageCapacity\` varchar(128)`,
      `ALTER TABLE \`iphones\` ADD \`gpu\` varchar(128)`,
      `ALTER TABLE \`iphones\` ADD \`powerSupply\` varchar(64)`,
      `ALTER TABLE \`iphones\` ADD \`screen\` varchar(64)`,
      `ALTER TABLE \`iphones\` ADD \`itemType\` varchar(64)`,
      `ALTER TABLE \`iphones\` ADD \`brand\` varchar(64)`,
      `ALTER TABLE \`iphones\` ADD \`specifications\` text`,
      `ALTER TABLE \`iphones\` ADD \`compatibility\` varchar(256)`,
    ];

    for (const migration of migrations) {
      try {
        console.log(`Executando: ${migration.substring(0, 60)}...`);
        await db.execute(sql.raw(migration));
        console.log("✓ OK");
      } catch (error) {
        // Se a coluna já existe, continua
        if (error.message && error.message.includes("Duplicate column name")) {
          console.log("⚠ Coluna já existe, pulando...");
        } else {
          console.error("✗ Erro:", error.message);
          throw error;
        }
      }
    }

    console.log("\n✓ Todas as migrações foram aplicadas com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("Erro ao executar migrações:", error);
    process.exit(1);
  }
}

runMigrations();
