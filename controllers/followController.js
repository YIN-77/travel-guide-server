const { Follow, User } = require('../models');
const { Op } = require('sequelize');

// 关注用户
exports.follow = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const followerId = req.user.id;

    if (!userId) {
      return res.status(400).json({ code: 400, message: '用户ID不能为空', data: null });
    }

    if (followerId === userId) {
      return res.status(400).json({ code: 400, message: '不能关注自己', data: null });
    }

    // 检查目标用户是否存在
    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    // 检查是否已关注
    const existing = await Follow.findOne({
      where: { follower_id: followerId, following_id: userId }
    });

    if (existing) {
      return res.json({ code: 200, message: '已关注', data: { isFollowing: true } });
    }

    await Follow.create({
      follower_id: followerId,
      following_id: userId
    });

    res.json({ code: 200, message: '关注成功', data: { isFollowing: true } });
  } catch (error) {
    next(error);
  }
};

// 取消关注
exports.unfollow = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    const follow = await Follow.findOne({
      where: { follower_id: followerId, following_id: userId }
    });

    if (!follow) {
      return res.json({ code: 200, message: '未关注', data: { isFollowing: false } });
    }

    await follow.destroy();

    res.json({ code: 200, message: '已取消关注', data: { isFollowing: false } });
  } catch (error) {
    next(error);
  }
};

// 粉丝列表
exports.getFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user ? req.user.id : null;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Follow.findAndCountAll({
      where: { following_id: userId },
      include: [{
        model: User,
        as: 'follower',
        attributes: ['id', 'username', 'nickname', 'avatar', 'bio', 'points', 'level']
      }],
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    // 检查当前用户是否关注了这些粉丝
    const followerIds = rows.map(f => f.follower_id);
    const myFollowings = currentUserId ? await Follow.findAll({
      where: {
        follower_id: currentUserId,
        following_id: { [Op.in]: followerIds }
      }
    }) : [];

    const myFollowingSet = new Set(myFollowings.map(f => f.following_id));

    const list = rows.map(f => ({
      ...f.toJSON(),
      isFollowing: myFollowingSet.has(f.follower_id)
    }));

    res.json({
      code: 200,
      data: {
        list,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// 关注列表
exports.getFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user ? req.user.id : null;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Follow.findAndCountAll({
      where: { follower_id: userId },
      include: [{
        model: User,
        as: 'following',
        attributes: ['id', 'username', 'nickname', 'avatar', 'bio', 'points', 'level']
      }],
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    // 检查当前用户是否关注了这些人（当前已登录用户）
    const followingIds = rows.map(f => f.following_id);
    const myFollowings = currentUserId ? await Follow.findAll({
      where: {
        follower_id: currentUserId,
        following_id: { [Op.in]: followingIds }
      }
    }) : [];

    const myFollowingSet = new Set(myFollowings.map(f => f.following_id));

    const list = rows.map(f => ({
      ...f.toJSON(),
      isFollowing: myFollowingSet.has(f.following_id)
    }));

    res.json({
      code: 200,
      data: {
        list,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// 关注统计
exports.getFollowStats = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const followerCount = await Follow.count({ where: { following_id: userId } });
    const followingCount = await Follow.count({ where: { follower_id: userId } });

    let isFollowing = false;
    if (currentUserId && currentUserId !== parseInt(userId)) {
      const followRecord = await Follow.findOne({
        where: { follower_id: currentUserId, following_id: userId }
      });
      isFollowing = !!followRecord;
    }

    res.json({
      code: 200,
      data: {
        followerCount,
        followingCount,
        isFollowing
      }
    });
  } catch (error) {
    next(error);
  }
};
