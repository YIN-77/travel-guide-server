const mysql = require('mysql2/promise');
require('dotenv').config();

const checkTables = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const [daysRows] = await connection.execute('DESCRIBE itinerary_days');
    console.log('itinerary_days 表结构:');
    console.log(daysRows);

    console.log('\n');

    const [activitiesRows] = await connection.execute('DESCRIBE itinerary_activities');
    console.log('itinerary_activities 表结构:');
    console.log(activitiesRows);
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await connection.end();
  }
};

checkTables().catch(console.error);