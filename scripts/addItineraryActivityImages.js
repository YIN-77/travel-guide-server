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

  try {
    console.log('添加 itinerary_activities 表的 images 字段...');
    try {
      await connection.execute('ALTER TABLE itinerary_activities ADD COLUMN images TEXT');
      console.log('✓ images 字段添加成功');
    } catch (err) {
      if (err.message.includes('Duplicate')) {
        console.log('images 字段已存在');
      } else {
        console.error('添加 images 字段失败:', err.message);
      }
    }

    console.log('\n完成！');
  } catch (error) {
    console.error('执行失败:', error);
  } finally {
    await connection.end();
  }
};

addMissingColumns().catch(console.error);