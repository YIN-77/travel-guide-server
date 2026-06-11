const mysql = require('mysql2/promise');
require('dotenv').config();

const addItineraryColumns = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const columnsToAdd = [
    { name: 'isPublic', type: 'TINYINT(1)', constraint: 'DEFAULT 0' },
    { name: 'is_featured', type: 'TINYINT(1)', constraint: 'DEFAULT 0' },
    { name: 'is_official', type: 'TINYINT(1)', constraint: 'DEFAULT 0' },
    { name: 'favorites', type: 'INT', constraint: 'DEFAULT 0' },
    { name: 'shares', type: 'INT', constraint: 'DEFAULT 0' },
    { name: 'coverImage', type: 'VARCHAR(500)', constraint: 'NULL' }
  ];

  try {
    for (const col of columnsToAdd) {
      try {
        await connection.execute(`ALTER TABLE itineraries ADD COLUMN ${col.name} ${col.type} ${col.constraint}`);
        console.log(`✓ 列 ${col.name} 添加成功`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠ 列 ${col.name} 已存在，跳过`);
        } else {
          throw error;
        }
      }
    }
    console.log('\n✅ 所有行程相关的列已添加完成！');
  } catch (error) {
    console.error('添加列失败:', error);
  } finally {
    await connection.end();
  }
};

addItineraryColumns().catch(console.error);
