// Vercel Serverless 入口
// 通知 app.js 当前在 Vercel 环境
process.env.VERCEL = '1';

const app = require('../app');
module.exports = app;
