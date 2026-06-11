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
    // 为 itinerary_days 表添加缺失的列
    console.log('检查并添加 itinerary_days 表的缺失列...');

    // 添加 itinerary_id 列
    try {
      await connection.execute('ALTER TABLE itinerary_days ADD COLUMN itinerary_id INT(11) NOT NULL AFTER id');
      console.log('已添加 itinerary_id 列');
    } catch (err) {
      if (err.message.includes('Duplicate')) {
        console.log('itinerary_id 列已存在');
      } else {
        console.error('添加 itinerary_id 列失败:', err.message);
      }
    }

    // 添加 day_number 列
    try {
      await connection.execute('ALTER TABLE itinerary_days ADD COLUMN day_number INT(11) NOT NULL AFTER itinerary_id');
      console.log('已添加 day_number 列');
    } catch (err) {
      if (err.message.includes('Duplicate')) {
        console.log('day_number 列已存在');
      } else {
        console.error('添加 day_number 列失败:', err.message);
      }
    }

    // 为 itinerary_activities 表添加缺失的列
    console.log('\n检查并添加 itinerary_activities 表的缺失列...');

    // 添加 itinerary_day_id 列
    try {
      await connection.execute('ALTER TABLE itinerary_activities ADD COLUMN itinerary_day_id INT(11) NOT NULL AFTER id');
      console.log('已添加 itinerary_day_id 列');
    } catch (err) {
      if (err.message.includes('Duplicate')) {
        console.log('itinerary_day_id 列已存在');
      } else {
        console.error('添加 itinerary_day_id 列失败:', err.message);
      }
    }

    // 添加 destination_id 列
    try {
      await connection.execute('ALTER TABLE itinerary_activities ADD COLUMN destination_id INT(11) AFTER itinerary_day_id');
      console.log('已添加 destination_id 列');
    } catch (err) {
      if (err.message.includes('Duplicate')) {
        console.log('destination_id 列已存在');
      } else {
        console.error('添加 destination_id 列失败:', err.message);
      }
    }

    // 添加 start_time 列
    try {
      await connection.execute('ALTER TABLE itinerary_activities ADD COLUMN start_time VARCHAR(10) AFTER destination_id');
      console.log('已添加 start_time 列');
    } catch (err) {
      if (err.message.includes('Duplicate')) {
        console.log('start_time 列已存在');
      } else {
        console.error('添加 start_time 列失败:', err.message);
      }
    }

    // 添加 end_time 列
    try {
      await connection.execute('ALTER TABLE itinerary_activities ADD COLUMN end_time VARCHAR(10) AFTER start_time');
      console.log('已添加 end_time 列');
    } catch (err) {
      if (err.message.includes('Duplicate')) {
        console.log('end_time 列已存在');
      } else {
        console.error('添加 end_time 列失败:', err.message);
      }
    }

    // 添加 sort_order 列
    try {
      await connection.execute('ALTER TABLE itinerary_activities ADD COLUMN sort_order INT(11) DEFAULT 0 AFTER end_time');
      console.log('已添加 sort_order 列');
    } catch (err) {
      if (err.message.includes('Duplicate')) {
        console.log('sort_order 列已存在');
      } else {
        console.error('添加 sort_order 列失败:', err.message);
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