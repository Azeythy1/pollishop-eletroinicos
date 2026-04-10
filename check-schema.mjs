import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [columns] = await connection.execute('DESCRIBE iphones');
console.log('Colunas da tabela iphones:');
columns.forEach(col => console.log(`  ${col.Field}: ${col.Type}`));

const [iphone16] = await connection.execute(
  'SELECT * FROM iphones WHERE id = 180001'
);
console.log('\niPhone 16 Branco completo:', JSON.stringify(iphone16[0], null, 2));
await connection.end();
