const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guideController');
const userAuthMiddleware = require('../middleware/userAuth');

// 公开路由
router.get('/', guideController.getAllGuides);
router.get('/:id', guideController.getGuideById);
router.get('/official/list', guideController.getOfficialGuides);
router.get('/featured/list', guideController.getFeaturedGuides);

// 需要用户认证的路由
router.post('/', userAuthMiddleware, guideController.createGuide);
router.get('/my/list', userAuthMiddleware, guideController.getMyGuides);
router.put('/:id', userAuthMiddleware, guideController.updateGuide);
router.delete('/:id', userAuthMiddleware, guideController.deleteGuide);

module.exports = router;
