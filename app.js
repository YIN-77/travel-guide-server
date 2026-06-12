const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { sequelize } = require('./models');
const initData = require('./init_data');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API 路由
app.use('/api', routes);

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

// 启动服务器
app.listen(PORT, async () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);

  // 同步数据库并初始化数据
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 同步表结构（不修改现有表）
    await sequelize.sync({ force: false });
    console.log('数据库表同步成功');
    
    // 初始化数据（更新密码等）
    await initData();
    console.log('数据初始化完成');
  } catch (error) {
    console.error('数据库连接或初始化失败:', error);
  }
});

module.exports = app;
