import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'iphone_seminovos',
});

try {
  console.log('Aplicando migração 0005...');
  await connection.execute("ALTER TABLE `iphones` ADD `cooler` varchar(128)");
  console.log('✓ cooler adicionado');
  
  await connection.execute("ALTER TABLE `iphones` ADD `cabinet` varchar(128)");
  console.log('✓ cabinet adicionado');
  
  await connection.execute("ALTER TABLE `iphones` ADD `itemCategory` enum('Informática','Acessórios')");
  console.log('✓ itemCategory adicionado');
  
  await connection.execute("ALTER TABLE `iphones` ADD `itemSubcategory` varchar(64)");
  console.log('✓ itemSubcategory adicionado');
  
  console.log('✓ Migração 0005 aplicada com sucesso!');
} catch (error) {
  if (error.code === 'ER_DUP_FIELDNAME') {
    console.log('⚠ Coluna já existe, pulando...');
  } else {
    console.error('Erro:', error.message);
  }
}

await connection.end();
