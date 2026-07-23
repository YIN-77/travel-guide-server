const { Sequelize } = require('sequelize');
require('dotenv').config();

const isServerless = !!process.env.VERCEL;

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    pool: {
      max: isServerless ? 1 : 5,
      min: 0,
      acquire: 8000,      // 获取连接超时 8 秒（Vercel Hobby 限制 10 秒）
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      connectTimeout: 5000   // TCP 连接超时 5 秒
    },
    // retry 配置，连接失败时自动重试
    retry: {
      max: 2
    }
  }
);

module.exports = sequelize;