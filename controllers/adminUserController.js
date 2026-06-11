const { User, Review, Favorite, Like } = require('../models');
const { Op } = require('sequelize');

// 获取用户列表
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    // 搜索条件
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { nickname: { [Op.like]: `%${search}%` } }
      ];
    }

    const { rows: users, count: total } = await User.findAndCountAll({
      where,
      attributes: ['id', 'username', 'email', 'nickname', 'avatar', 'bio', 'created_at', 'updated_at'],
      limit: parseInt(limit),
      offset: offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Review,
          as: 'userReviews',
          attributes: ['id']
        },
        {
          model: Favorite,
          attributes: ['id']
        },
        {
          model: Like,
          attributes: ['id']
        }
      ]
    });

    // 格式化用户数据，添加统计信息
    const formattedUsers = users.map(user => {
      const userData = user.toJSON();
      return {
        ...userData,
        reviewCount: userData.userReviews ? userData.userReviews.length : 0,
        favoriteCount: userData.Favorites ? userData.Favorites.length : 0,
        likeCount: userData.Likes ? userData.Likes.length : 0
      };
    });

    res.json({
      code: 200,
      message: 'success',
      data: {
        list: formattedUsers,
        total: total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// 获取单个用户详情
exports.getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'email', 'nickname', 'avatar', 'bio', 'created_at', 'updated_at'],
      include: [
        {
          model: Review,
          as: 'userReviews',
          include: ['Destination']
        },
        {
          model: Favorite,
          include: ['Destination']
        },
        {
          model: Like,
          include: ['Destination']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: 'success',
      data: {
        ...user.toJSON(),
        reviewCount: user.userReviews ? user.userReviews.length : 0,
        favoriteCount: user.Favorites ? user.Favorites.length : 0,
        likeCount: user.Likes ? user.Likes.length : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// 更新用户信息
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nickname, bio, avatar } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }

    await user.update({
      nickname: nickname !== undefined ? nickname : user.nickname,
      bio: bio !== undefined ? bio : user.bio,
      avatar: avatar !== undefined ? avatar : user.avatar
    });

    res.json({
      code: 200,
      message: '更新成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    next(error);
  }
};

// 删除用户
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }

    // 删除用户的评论、收藏、点赞
    await Promise.all([
      Review.destroy({ where: { user_id: id } }),
      Favorite.destroy({ where: { user_id: id } }),
      Like.destroy({ where: { user_id: id } })
    ]);

    // 删除用户
    await user.destroy();

    res.json({
      code: 200,
      message: '删除成功',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// 批量删除用户
exports.batchDeleteUsers = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请选择要删除的用户',
        data: null
      });
    }

    // 删除用户的评论、收藏、点赞
    await Promise.all([
      Review.destroy({ where: { user_id: { [Op.in]: ids } } }),
      Favorite.destroy({ where: { user_id: { [Op.in]: ids } } }),
      Like.destroy({ where: { user_id: { [Op.in]: ids } } })
    ]);

    // 删除用户
    await User.destroy({ where: { id: { [Op.in]: ids } } });

    res.json({
      code: 200,
      message: '批量删除成功',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户统计信息
exports.getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const totalReviews = await Review.count();
    const totalFavorites = await Favorite.count();
    const totalLikes = await Like.count();

    // 获取最近7天注册的用户数
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.count({
      where: {
        created_at: {
          [Op.gte]: sevenDaysAgo
        }
      }
    });

    res.json({
      code: 200,
      message: 'success',
      data: {
        totalUsers,
        totalReviews,
        totalFavorites,
        totalLikes,
        recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
};
