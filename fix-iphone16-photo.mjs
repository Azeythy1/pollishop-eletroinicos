import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Verificar se tabela existe
try {
  const [tables] = await connection.execute("SHOW TABLES LIKE 'iphone_photos'");
  console.log('Tabela iphone_photos existe:', tables.length > 0);
  
  if (tables.length > 0) {
    // Verificar fotos do iPhone 16
    const [photos] = await connection.execute(
      'SELECT * FROM iphone_photos WHERE iphoneId = 180001'
    );
    console.log('Fotos do iPhone 16:', photos);
    
    if (photos.length === 0) {
      // Adicionar foto placeholder para iPhone 16
      const photoUrl = 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=400&h=400&fit=crop';
      await connection.execute(
        'INSERT INTO iphone_photos (iphoneId, url, fileKey, isPrimary, sortOrder) VALUES (?, ?, ?, ?, ?)',
        [180001, photoUrl, 'iphone16-branco-primary', true, 0]
      );
      console.log('✓ Foto adicionada para iPhone 16 branco');
    }
  }
} catch (error) {
  console.error('Erro:', error.message);
}

await connection.end();
