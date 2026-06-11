const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const addItineraryLikesColumn = async () => {
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
    // 添加 likes 字段到 itineraries 表
    try {
      await connection.execute(`
        ALTER TABLE itineraries 
        ADD COLUMN likes INT DEFAULT 0 COMMENT '点赞数'
      `);
      console.log('likes列添加成功！');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('likes列已存在，跳过添加');
      } else {
        throw error;
      }
    }

    console.log('itineraries表字段添加完成！');
  } finally {
    await connection.end();
  }
};

addItineraryLikesColumn().catch(console.error);
