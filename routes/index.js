const express = require('express');
const router = express.Router();
const path = require('path');

const authRoutes = require('./auth');
const destinationRoutes = require('./destinations');
const reviewRoutes = require('./reviews');
const tagRoutes = require('./tags');
const statsRoutes = require('./stats');
const uploadRoutes = require('./upload');
const userRoutes = require('./users');
const adminUserRoutes = require('./adminUsers');
const notificationRoutes = require('./notifications');
const itineraryRoutes = require('./itineraries');
const adminItineraryRoutes = require('./adminItineraries');
const adminGuideRoutes = require('./adminGuides');
const adminNewsRoutes = require('./adminNews');
const guideRoutes = require('./guides');
const newsRoutes = require('./news');
const interactionRoutes = require('./interactions');
const resetRoutes = require('./reset');
const searchRoutes = require('./search');

router.use('/auth', authRoutes);
router.use('/reset', resetRoutes);
router.use('/users', userRoutes);
router.use('/admin/users', adminUserRoutes);
router.use('/admin/itineraries', adminItineraryRoutes);
router.use('/admin/guides', adminGuideRoutes);
router.use('/admin/news', adminNewsRoutes);
router.use('/destinations', destinationRoutes);
// 评论相关路由
// /api/destinations/:id/reviews - 公开的景点评论
// /api/reviews - 管理员评论管理（需要认证）
router.use('/reviews', reviewRoutes);
router.use('/tags', tagRoutes);
router.use('/stats', statsRoutes);
router.use('/upload', uploadRoutes);
router.use('/notifications', notificationRoutes);
router.use('/itineraries', itineraryRoutes);
router.use('/guides', guideRoutes);
router.use('/news', newsRoutes);
router.use('/interactions', interactionRoutes);
router.use('/search', searchRoutes);

module.exports = router;
