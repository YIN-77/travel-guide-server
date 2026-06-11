const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');
const authMiddleware = require('../middleware/auth');

// 所有路由都需要管理员认证
router.use(authMiddleware);

// 获取用户列表
router.get('/', adminUserController.getUsers);

// 获取用户统计
router.get('/stats', adminUserController.getUserStats);

// 获取单个用户
router.get('/:id', adminUserController.getUser);

// 更新用户
router.put('/:id', adminUserController.updateUser);

// 删除用户
router.delete('/:id', adminUserController.deleteUser);

// 批量删除用户
router.post('/batch/delete', adminUserController.batchDeleteUsers);

module.exports = router;
