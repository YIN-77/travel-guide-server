const mysql = require('mysql2/promise');
require('dotenv').config();

const checkTable = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const [rows] = await connection.execute('DESCRIBE destinations');
    console.log('destinations 表结构:');
    console.log(rows);
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await connection.end();
  }
};

checkTable().catch(console.error);
