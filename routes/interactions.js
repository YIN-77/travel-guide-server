const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const userAuth = require('../middleware/userAuth');
const optionalUserAuth = require('../middleware/optionalUserAuth');

// 点赞（需要认证）
router.post('/like', userAuth, interactionController.like);

// 取消点赞（需要认证）- 支持 URL 参数
router.delete('/like/:target_type/:target_id', userAuth, interactionController.unlike);

// 收藏（需要认证）
router.post('/favorite', userAuth, interactionController.favorite);

// 取消收藏（需要认证）- 支持 URL 参数
router.delete('/favorite/:target_type/:target_id', userAuth, interactionController.unfavorite);

// 分享记录（可选认证）
router.post('/share', optionalUserAuth, interactionController.share);

// 获取用户是否已点赞/收藏（可选认证）- 支持 URL 参数
router.get('/check/:target_type/:target_id', optionalUserAuth, interactionController.check);

// 获取用户的收藏列表（需要认证）
router.get('/favorites', userAuth, interactionController.getFavorites);

// 获取用户的点赞列表（需要认证）
router.get('/likes', userAuth, interactionController.getLikes);

module.exports = router;