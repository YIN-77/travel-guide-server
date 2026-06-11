const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const addGuideOfficialColumn = async () => {
  console.log('数据库配置:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
  });
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await connection.execute(`
      ALTER TABLE guides 
      ADD COLUMN is_official BOOLEAN DEFAULT FALSE COMMENT '是否官方攻略'
    `);
    console.log('is_official列添加成功！');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('is_official列已存在，跳过添加');
    } else {
      throw error;
    }
  } finally {
    await connection.end();
  }
};

addGuideOfficialColumn().catch(console.error);
