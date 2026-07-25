const { User, Favorite, Like, Review, Destination, Tag, Interaction } = require('../models');
const notificationController = require('./notificationController');
const pointService = require('../services/pointService');

// 收藏景点
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { destinationId } = req.body;
    const userId = req.user.id;
    const currentUser = req.user;

    if (!destinationId) {
      return res.status(400).json({
        code: 400,
        message: '景点ID不能为空',
        data: null
      });
    }

    // 检查是否已收藏
    const existingFavorite = await Favorite.findOne({
      where: { user_id: userId, destination_id: destinationId }
    });

    if (existingFavorite) {
      // 取消收藏
      await existingFavorite.destroy();
      // 同时删除 Interaction 记录
      await Interaction.destroy({
        where: {
          user_id: userId,
          target_type: 'destination',
          target_id: destinationId,
          interaction_type: 'favorite'
        }
      });
      res.json({
        code: 200,
        message: '已取消收藏',
        data: { isFavorite: false }
      });
    } else {
      // 添加收藏
      await Favorite.create({
        user_id: userId,
        destination_id: destinationId
      });
      // 同时创建 Interaction 记录
      await Interaction.findOrCreate({
        where: {
          user_id: userId,
          target_type: 'destination',
          target_id: destinationId,
          interaction_type: 'favorite'
        }
      });
      
      // 获取景点信息用于通知
      const destination = await Destination.findByPk(destinationId);
      if (destination) {
        const userName = currentUser.nickname || currentUser.username;
        const content = `用户 ${userName} 收藏了您的景点「${destination.name}」`;
        // 注意：实际项目中这里应该获取景点创建者的ID
        // 这里为了演示，暂时跳过发送通知
      }
      
      res.json({
        code: 200,
        message: '收藏成功',
        data: { isFavorite: true }
      });
    }
  } catch (error) {
    next(error);
  }
};

// 获取收藏列表
exports.getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const favorites = await Favorite.findAll({
      where: { user_id: userId },
      include: [{
        model: Destination,
        include: [Tag]
      }],
      order: [['created_at', 'DESC']]
    });

    const destinations = favorites.map(fav => ({
      ...fav.Destination.toJSON(),
      isFavorite: true,
      favoriteAt: fav.created_at
    }));

    res.json({
      code: 200,
      message: 'success',
      data: destinations
    });
  } catch (error) {
    next(error);
  }
};

// 点赞景点
exports.toggleLike = async (req, res, next) => {
  try {
    const { destinationId } = req.body;
    const userId = req.user.id;
    const currentUser = req.user;

    if (!destinationId) {
      return res.status(400).json({
        code: 400,
        message: '景点ID不能为空',
        data: null
      });
    }

    // 检查是否已点赞
    const existingLike = await Like.findOne({
      where: { user_id: userId, destination_id: destinationId }
    });

    if (existingLike) {
      // 取消点赞
      await existingLike.destroy();
      // 同时删除 Interaction 记录
      await Interaction.destroy({
        where: {
          user_id: userId,
          target_type: 'destination',
          target_id: destinationId,
          interaction_type: 'like'
        }
      });
      res.json({
        code: 200,
        message: '已取消点赞',
        data: { isLiked: false }
      });
    } else {
      // 添加点赞
      await Like.create({
        user_id: userId,
        destination_id: destinationId
      });
      // 同时创建 Interaction 记录
      await Interaction.findOrCreate({
        where: {
          user_id: userId,
          target_type: 'destination',
          target_id: destinationId,
          interaction_type: 'like'
        }
      });
      
      // 获取景点信息用于通知
      const destination = await Destination.findByPk(destinationId);
      if (destination) {
        const userName = currentUser.nickname || currentUser.username;
        const content = `用户 ${userName} 点赞了您的景点「${destination.name}」`;
        // 注意：实际项目中这里应该获取景点创建者的ID
        // 这里为了演示，暂时跳过发送通知
      }
      
      res.json({
        code: 200,
        message: '点赞成功',
        data: { isLiked: true }
      });
    }
  } catch (error) {
    next(error);
  }
};

// 获取点赞列表
exports.getLikes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const likes = await Like.findAll({
      where: { user_id: userId },
      include: [{
        model: Destination,
        include: [Tag]
      }],
      order: [['created_at', 'DESC']]
    });

    const destinations = likes.map(like => ({
      ...like.Destination.toJSON(),
      isLiked: true,
      likedAt: like.created_at
    }));

    res.json({
      code: 200,
      message: 'success',
      data: destinations
    });
  } catch (error) {
    next(error);
  }
};

// 添加评论
exports.addReview = async (req, res, next) => {
  try {
    const { destinationId, content, rating, images } = req.body;
    const userId = req.user.id;
    const user = req.user;

    if (!destinationId || !content) {
      return res.status(400).json({
        code: 400,
        message: '景点ID和评论内容不能为空',
        data: null
      });
    }

    const review = await Review.create({
      destination_id: destinationId,
      user_id: userId,
      user_name: user.nickname || user.username,
      content,
      rating: rating || 5,
      images: images || []
    });
    
    // 获取景点信息用于通知
    const destination = await Destination.findByPk(destinationId);
    if (destination) {
      const userName = user.nickname || user.username;
      const contentStr = `用户 ${userName} 评论了您的景点「${destination.name}」: ${content.substring(0, 50)}...`;
      // 注意：实际项目中这里应该获取景点创建者的ID
      // 这里为了演示，暂时跳过发送通知
    }

    res.status(201).json({
      code: 200,
      message: '评论成功',
      data: review
    });

    // 发布评论 +5分
    pointService.addPoints(userId, 5).catch(() => {});
  } catch (error) {
    next(error);
  }
};

// 删除评论
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({
      where: { id, user_id: userId }
    });

    if (!review) {
      return res.status(404).json({
        code: 404,
        message: '评论不存在',
        data: null
      });
    }

    await review.destroy();

    res.json({
      code: 200,
      message: '删除成功',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户的评论
exports.getUserReviews = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reviews = await Review.findAll({
      where: { user_id: userId },
      include: [Destination],
      order: [['created_at', 'DESC']]
    });

    res.json({
      code: 200,
      message: 'success',
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};
