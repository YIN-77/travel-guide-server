const express = require('express');
const router = express.Router();
const adminItineraryController = require('../controllers/adminItineraryController');
const authMiddleware = require('../middleware/auth');

// 所有路由都需要管理员认证
router.use(authMiddleware);

// 获取所有行程列表
router.get('/', adminItineraryController.getAllItineraries);

// 获取统计数据
router.get('/stats', adminItineraryController.getStats);

// 创建官方行程
router.post('/official', adminItineraryController.createOfficialItinerary);

// 获取单个行程详情
router.get('/:id', adminItineraryController.getItineraryById);

// 更新行程（管理员）
router.put('/:id', adminItineraryController.updateItinerary);

// 删除行程
router.delete('/:id', adminItineraryController.deleteItinerary);

// 批量删除行程
router.post('/batch-delete', adminItineraryController.batchDeleteItineraries);

// 更新行程公开状态
router.put('/:id/status', adminItineraryController.updateItineraryStatus);

// 设置/取消热门推荐
router.put('/:id/featured', adminItineraryController.updateFeaturedStatus);

// 设置/取消官方行程
router.put('/:id/official', adminItineraryController.updateOfficialStatus);

module.exports = router;