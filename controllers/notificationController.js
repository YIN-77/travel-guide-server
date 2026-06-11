const { Notification, User } = require('../models');

exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.findAll({
      where: { userId },
      include: [{
        model: User,
        as: 'fromUser',
        attributes: ['id', 'username', 'nickname', 'avatar']
      }],
      order: [['created_at', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit)
    });

    const unreadCount = await Notification.count({
      where: { userId, isRead: false }
    });

    res.json({
      code: 200,
      message: 'success',
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Notification.count({
      where: { userId, isRead: false }
    });

    res.json({
      code: 200,
      message: 'success',
      data: { unreadCount }
    });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (id) {
      await Notification.update(
        { isRead: true },
        { where: { id, userId } }
      );
    } else {
      await Notification.update(
        { isRead: true },
        { where: { userId, isRead: false } }
      );
    }

    res.json({
      code: 200,
      message: '已标记为已读',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await Notification.destroy({
      where: { id, userId }
    });

    res.json({
      code: 200,
      message: '删除成功',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

exports.createNotification = async (userId, type, content, relatedId = null, relatedType = null, fromUserId = null) => {
  try {
    await Notification.create({
      userId,
      type,
      content,
      relatedId,
      relatedType,
      fromUserId
    });
  } catch (error) {
    console.error('创建通知失败:', error);
  }
};
