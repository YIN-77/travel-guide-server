const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

// 管理员路由（需要认证）
router.get('/', authMiddleware, reviewController.getReviews);
router.delete('/:id', authMiddleware, reviewController.deleteReview);

module.exports = router;
