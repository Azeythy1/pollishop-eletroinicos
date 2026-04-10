import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await connection.execute(
  'SELECT id, model, color, status FROM iphones WHERE model LIKE ? OR color LIKE ? ORDER BY createdAt DESC LIMIT 10',
  ['%16%', '%branco%']
);
console.log('iPhone 16 encontrado:', JSON.stringify(rows, null, 2));

const [photos] = await connection.execute(
  'SELECT productId, url, isPrimary FROM photos WHERE productId IN (SELECT id FROM iphones WHERE model LIKE ? OR color LIKE ?)',
  ['%16%', '%branco%']
);
console.log('Fotos:', JSON.stringify(photos, null, 2));
await connection.end();
