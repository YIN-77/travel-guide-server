const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const addNewsInteractionColumns = async () => {
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
    // 添加 likes 字段
    try {
      await connection.execute(`
        ALTER TABLE news 
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

    // 添加 favorites 字段
    try {
      await connection.execute(`
        ALTER TABLE news 
        ADD COLUMN favorites INT DEFAULT 0 COMMENT '收藏数'
      `);
      console.log('favorites列添加成功！');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('favorites列已存在，跳过添加');
      } else {
        throw error;
      }
    }

    // 添加 shares 字段
    try {
      await connection.execute(`
        ALTER TABLE news 
        ADD COLUMN shares INT DEFAULT 0 COMMENT '分享数'
      `);
      console.log('shares列添加成功！');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('shares列已存在，跳过添加');
      } else {
        throw error;
      }
    }

    console.log('所有字段添加完成！');
  } finally {
    await connection.end();
  }
};

addNewsInteractionColumns().catch(console.error);
