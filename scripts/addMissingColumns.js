const mysql = require('mysql2/promise');
require('dotenv').config();

const addMissingColumns = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const columnsToAdd = [
    { name: 'openingHours', type: 'VARCHAR(200)', constraint: 'NULL' },
    { name: 'ticketPrice', type: 'VARCHAR(200)', constraint: 'NULL' },
    { name: 'bestTime', type: 'VARCHAR(200)', constraint: 'NULL' }
  ];

  try {
    for (const col of columnsToAdd) {
      try {
        await connection.execute(`ALTER TABLE destinations ADD COLUMN ${col.name} ${col.type} ${col.constraint}`);
        console.log(`✓ 列 ${col.name} 添加成功`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠ 列 ${col.name} 已存在，跳过`);
        } else {
          throw error;
        }
      }
    }
    console.log('\n✅ 所有缺失的列已添加完成！');
  } catch (error) {
    console.error('添加列失败:', error);
  } finally {
    await connection.end();
  }
};

addMissingColumns().catch(console.error);
