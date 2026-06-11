const express = require('express');
const router = express.Router();
const adminGuideController = require('../controllers/adminGuideController');
const authMiddleware = require('../middleware/auth');

// 所有路由都需要管理员认证
router.use(authMiddleware);

// 获取所有攻略列表
router.get('/', adminGuideController.getAllGuides);

// 获取统计数据
router.get('/stats', adminGuideController.getStats);

// 获取单个攻略详情
router.get('/:id', adminGuideController.getGuideById);

// 创建攻略
router.post('/', adminGuideController.createGuide);

// 更新攻略
router.put('/:id', adminGuideController.updateGuide);

// 删除攻略
router.delete('/:id', adminGuideController.deleteGuide);

// 批量删除
router.post('/batch-delete', adminGuideController.batchDelete);

module.exports = router;
