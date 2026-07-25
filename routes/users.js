const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userActionController = require('../controllers/userActionController');
const followController = require('../controllers/followController');
const favoriteGroupController = require('../controllers/favoriteGroupController');
const userAuthMiddleware = require('../middleware/userAuth');
const optionalUserAuth = require('../middleware/optionalUserAuth');

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

// 关注/粉丝
router.post('/follow', userAuthMiddleware, followController.follow);
router.delete('/follow/:userId', userAuthMiddleware, followController.unfollow);
router.get('/:userId/followers', optionalUserAuth, followController.getFollowers);
router.get('/:userId/following', optionalUserAuth, followController.getFollowing);
router.get('/:userId/follow-stats', optionalUserAuth, followController.getFollowStats);

// 收藏夹分组
router.get('/favorites/groups', userAuthMiddleware, favoriteGroupController.getGroups);
router.post('/favorites/groups', userAuthMiddleware, favoriteGroupController.createGroup);
router.put('/favorites/groups/:id', userAuthMiddleware, favoriteGroupController.updateGroup);
router.delete('/favorites/groups/:id', userAuthMiddleware, favoriteGroupController.deleteGroup);
router.post('/favorites/move', userAuthMiddleware, favoriteGroupController.addToGroup);

module.exports = router;
