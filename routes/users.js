const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userActionController = require('../controllers/userActionController');
const userAuthMiddleware = require('../middleware/userAuth');

// 用户认证
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', userAuthMiddleware, userController.getProfile);
router.put('/profile', userAuthMiddleware, userController.updateProfile);
router.put('/password', userAuthMiddleware, userController.changePassword);

// 用户操作
router.post('/favorite', userAuthMiddleware, userActionController.toggleFavorite);
router.get('/favorites', userAuthMiddleware, userActionController.getFavorites);
router.post('/like', userAuthMiddleware, userActionController.toggleLike);
router.get('/likes', userAuthMiddleware, userActionController.getLikes);
router.post('/review', userAuthMiddleware, userActionController.addReview);
router.delete('/review/:id', userAuthMiddleware, userActionController.deleteReview);
router.get('/reviews', userAuthMiddleware, userActionController.getUserReviews);

module.exports = router;
