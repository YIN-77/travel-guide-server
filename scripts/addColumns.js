const mysql = require('mysql2/promise');
require('dotenv').config();

const addColumns = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await connection.execute(`
      ALTER TABLE destinations 
      ADD COLUMN latitude DECIMAL(10,7) NULL,
      ADD COLUMN longitude DECIMAL(10,7) NULL,
      ADD COLUMN openingHours VARCHAR(200) NULL,
      ADD COLUMN ticketPrice VARCHAR(200) NULL,
      ADD COLUMN transport TEXT NULL,
      ADD COLUMN bestTime VARCHAR(200) NULL,
      ADD COLUMN duration VARCHAR(100) NULL,
      ADD COLUMN tips TEXT NULL
    `);
    console.log('列添加成功！');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('列已存在，跳过添加');
    } else {
      throw error;
    }
  } finally {
    await connection.end();
  }
};

addColumns().catch(console.error);
