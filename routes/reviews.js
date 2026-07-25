const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');
const userAuthMiddleware = require('../middleware/userAuth');

// 管理员路由（需要管理员认证）
router.get('/', authMiddleware, reviewController.getReviews);
router.delete('/:id', authMiddleware, reviewController.deleteReview);

// 用户操作路由（需要用户认证）
router.post('/:id/reply', userAuthMiddleware, reviewController.replyToReview);
router.post('/:id/like', userAuthMiddleware, reviewController.likeReview);
router.post('/upload-image', userAuthMiddleware, reviewController.uploadReviewImage);

module.exports = router;
