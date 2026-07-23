const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors({
  origin: ['https://traval-guide-inone.netlify.app', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API 路由（Vercel 环境会自动处理 /api 前缀）
const apiPrefix = process.env.VERCEL ? '/' : '/api';
app.use(apiPrefix, routes);

// Multer 错误处理
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    // 根据请求路径判断是图片还是视频
    if (req.path.includes('video')) {
      return res.status(400).json({
        code: 400,
        message: '视频大小不能超过 100MB',
        data: null
      });
    }
    return res.status(400).json({
      code: 400,
      message: '文件大小不能超过 5MB',
      data: null
    });
  }
  if (err.message && err.message.includes('只支持')) {
    return res.status(400).json({
      code: 400,
      message: err.message,
      data: null
    });
  }
  next(err);
});

// 错误处理
app.use(errorHandler);

// 数据库冷启动初始化（不阻塞请求处理）
const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    await sequelize.sync({ force: false });
    console.log('数据库表同步成功');
  } catch (error) {
    console.error('数据库初始化失败（将重试）:', error.message);
  }
};
// 延迟初始化，避免阻塞模块加载
setTimeout(() => initDB(), 0);

// Vercel Serverless 不调用 listen，导出 app 即可
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
}

module.exports = app;
