const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destinationController');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');
const optionalUserAuthMiddleware = require('../middleware/optionalUserAuth');

// 公开路由
router.get('/', destinationController.getDestinations);
router.get('/:id', optionalUserAuthMiddleware, destinationController.getDestination);

// 公开的评论路由 - 获取景点评论和添加评论
router.get('/:id/reviews', reviewController.getDestinationReviews);
router.post('/:id/reviews', reviewController.createReview);

// 管理员路由（需要认证）
router.post('/', authMiddleware, destinationController.createDestination);
router.put('/:id', authMiddleware, destinationController.updateDestination);
router.delete('/:id', authMiddleware, destinationController.deleteDestination);
router.delete('/batch/delete', authMiddleware, destinationController.batchDeleteDestinations);

module.exports = router;
