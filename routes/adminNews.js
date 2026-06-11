const express = require('express');
const router = express.Router();
const adminNewsController = require('../controllers/adminNewsController');
const authMiddleware = require('../middleware/auth');

// 所有路由都需要管理员认证
router.use(authMiddleware);

// 获取所有资讯列表
router.get('/', adminNewsController.getAllNews);

// 获取统计数据
router.get('/stats', adminNewsController.getStats);

// 获取单个资讯详情
router.get('/:id', adminNewsController.getNewsById);

// 创建资讯
router.post('/', adminNewsController.createNews);

// 更新资讯
router.put('/:id', adminNewsController.updateNews);

// 删除资讯
router.delete('/:id', adminNewsController.deleteNews);

// 批量删除
router.post('/batch-delete', adminNewsController.batchDelete);

module.exports = router;
