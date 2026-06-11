const mysql = require('mysql2/promise');
require('dotenv').config();

const simpleAddDateColumns = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    try {
      await connection.execute('ALTER TABLE itineraries ADD COLUMN startDate DATETIME NULL');
      console.log('✓ 列 startDate 添加成功');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ 列 startDate 已存在，跳过');
      } else {
        throw error;
      }
    }
    
    try {
      await connection.execute('ALTER TABLE itineraries ADD COLUMN endDate DATETIME NULL');
      console.log('✓ 列 endDate 添加成功');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ 列 endDate 已存在，跳过');
      } else {
        throw error;
      }
    }
    
    console.log('\n✅ 所有日期列已添加完成！');
  } catch (error) {
    console.error('添加列失败:', error);
  } finally {
    await connection.end();
  }
};

simpleAddDateColumns().catch(console.error);
