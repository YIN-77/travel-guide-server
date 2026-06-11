const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/auth');

// 获取仪表盘统计数据（需要认证）
router.get('/dashboard', authMiddleware, statsController.getDashboardStats);

module.exports = router;
