const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// 管理员登录
router.post('/login', authController.login);

// 获取管理员信息（需要认证）
router.get('/profile', authMiddleware, authController.getProfile);

// 修改密码（需要认证）
router.put('/password', authMiddleware, authController.changePassword);

module.exports = router;
