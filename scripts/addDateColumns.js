const mysql = require('mysql2/promise');
require('dotenv').config();

const addDateColumns = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // 先设置允许零日期
    await connection.execute("SET SQL_MODE = 'ALLOW_INVALID_DATES'");
    
    // 添加列但允许NULL
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
    
    // 给现有记录设置默认日期
    const [rows] = await connection.execute('SELECT id FROM itineraries');
    for (const row of rows) {
      const defaultDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await connection.execute(
        'UPDATE itineraries SET startDate = ?, endDate = ? WHERE startDate IS NULL OR endDate IS NULL',
        [defaultDate, defaultDate]
      );
    }
    
    console.log('✓ 已为现有记录设置默认日期');
    
    // 现在把列改为NOT NULL
    try {
      await connection.execute('ALTER TABLE itineraries MODIFY COLUMN startDate DATETIME NOT NULL');
      console.log('✓ 列 startDate 已设置为 NOT NULL');
    } catch (error) {
      console.log('⚠ 列 startDate 设为 NOT NULL 失败:', error.message);
    }
    
    try {
      await connection.execute('ALTER TABLE itineraries MODIFY COLUMN endDate DATETIME NOT NULL');
      console.log('✓ 列 endDate 已设置为 NOT NULL');
    } catch (error) {
      console.log('⚠ 列 endDate 设为 NOT NULL 失败:', error.message);
    }
    
    console.log('\n✅ 所有日期列已处理完成！');
  } catch (error) {
    console.error('处理失败:', error);
  } finally {
    await connection.end();
  }
};

addDateColumns().catch(console.error);
