const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const userAuthMiddleware = require('../middleware/userAuth');

router.get('/', userAuthMiddleware, notificationController.getNotifications);

router.get('/unread', userAuthMiddleware, notificationController.getUnreadCount);

router.put('/read/:id?', userAuthMiddleware, notificationController.markAsRead);

router.delete('/:id', userAuthMiddleware, notificationController.deleteNotification);

module.exports = router;