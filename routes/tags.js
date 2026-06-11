const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const authMiddleware = require('../middleware/auth');

// 公开路由
router.get('/', tagController.getTags);

// 管理员路由（需要认证）
router.post('/', authMiddleware, tagController.createTag);
router.put('/:id', authMiddleware, tagController.updateTag);
router.delete('/:id', authMiddleware, tagController.deleteTag);

module.exports = router;
