const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController');
const authMiddleware = require('../middleware/userAuth');

// 公开路由（不需要认证）
// 获取公开行程列表
router.get('/public', itineraryController.getPublicItineraries);

// 获取热门行程列表
router.get('/hot', itineraryController.getHotItineraries);

// 获取推荐行程列表
router.get('/featured', itineraryController.getFeaturedItineraries);

// 获取官方行程列表
router.get('/official', itineraryController.getOfficialItineraries);

// 获取公开行程详情
router.get('/public/:id', itineraryController.getPublicItineraryById);

// 增加收藏数（公开）
router.post('/:id/favorites/increment', itineraryController.incrementFavorites);

// 减少收藏数（公开）
router.post('/:id/favorites/decrement', itineraryController.decrementFavorites);

// 增加分享数（公开）
router.post('/:id/shares/increment', itineraryController.incrementShares);

// 以下路由需要认证
router.use(authMiddleware);

// 获取用户的所有行程
router.get('/', itineraryController.getItineraries);

// 创建新行程
router.post('/', itineraryController.createItinerary);

// 获取单个行程详情（用户自己的）
router.get('/:id', itineraryController.getItineraryById);

// 更新行程
router.put('/:id', itineraryController.updateItinerary);

// 更新行程状态（公开/私密）
router.put('/:id/status', itineraryController.updateItineraryStatus);

// 删除行程
router.delete('/:id', itineraryController.deleteItinerary);

// 添加活动
router.post('/activities', itineraryController.addActivity);

// 更新活动
router.put('/activities/:activityId', itineraryController.updateActivity);

// 删除活动
router.delete('/activities/:activityId', itineraryController.deleteActivity);

// 重新排序活动
router.post('/activities/reorder', itineraryController.reorderActivities);

module.exports = router;