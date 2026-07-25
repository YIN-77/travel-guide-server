const { Interaction, Guide, News, Itinerary, User, Destination } = require('../models');
const pointService = require('../services/pointService');

// 目标类型映射到模型
const targetModels = {
  destination: Destination,
  guide: Guide,
  news: News,
  itinerary: Itinerary
};

// 获取目标对象的作者ID
async function getTargetOwnerId(targetType, targetId) {
  const TargetModel = targetModels[targetType];
  if (!TargetModel) return null;
  
  const target = await TargetModel.findByPk(targetId);
  if (!target) return null;
  
  if (targetType === 'guide') return target.author_id;
  if (targetType === 'itinerary') return target.userId;
  // destination 和 news 没有明确的作者字段
  return null;
}

// 点赞
exports.like = async (req, res, next) => {
  try {
    // 支持从请求体或URL参数获取数据（驼峰和下划线都支持）
    const { targetType, targetId, target_type, target_id } = { ...req.body, ...req.params };
    const target_type_val = target_type || targetType;
    const target_id_val = target_id || targetId;
    const userId = req.user.id;

    if (!target_type_val || !target_id_val) {
      return res.status(400).json({
        code: 400,
        message: '目标类型和目标ID不能为空',
        data: null
      });
    }

    if (!['destination', 'guide', 'news', 'itinerary'].includes(target_type_val)) {
      return res.status(400).json({
        code: 400,
        message: '无效的目标类型',
        data: null
      });
    }

    // 检查目标是否存在
    const TargetModel = targetModels[target_type_val];
    const target = await TargetModel.findByPk(target_id_val);
    if (!target) {
      return res.status(404).json({
        code: 404,
        message: '目标不存在',
        data: null
      });
    }

    // 检查是否已点赞
    const existingLike = await Interaction.findOne({
      where: {
        user_id: userId,
        target_type: target_type_val,
        target_id: target_id_val,
        interaction_type: 'like'
      }
    });

    if (existingLike) {
      // 已点赞，直接返回成功（幂等性）
      return res.json({
        code: 200,
        message: '已点赞',
        data: { isLiked: true }
      });
    }

    // 创建点赞记录
    await Interaction.create({
      user_id: userId,
      target_type: target_type_val,
      target_id: target_id_val,
      interaction_type: 'like'
    });

    // 更新目标的点赞数
    if (target.likes !== undefined) {
      await target.increment('likes');
    }

    // 给内容作者加积分（被点赞+1，攻略被点赞+2）
    const ownerId = await getTargetOwnerId(target_type_val, target_id_val);
    if (ownerId && ownerId !== userId) {
      const likePoints = target_type_val === 'guide' ? 2 : 1;
      pointService.addPoints(ownerId, likePoints).catch(() => {});
    }

    res.json({
      code: 200,
      message: '点赞成功',
      data: { isLiked: true }
    });
  } catch (error) {
    next(error);
  }
};

// 取消点赞
exports.unlike = async (req, res, next) => {
  try {
    // 支持从请求体或URL参数获取数据（驼峰和下划线都支持）
    const { targetType, targetId, target_type, target_id } = { ...req.body, ...req.params };
    const target_type_val = target_type || targetType;
    const target_id_val = target_id || targetId;
    const userId = req.user.id;

    if (!target_type_val || !target_id_val) {
      return res.status(400).json({
        code: 400,
        message: '目标类型和目标ID不能为空',
        data: null
      });
    }

    // 查找点赞记录
    const likeRecord = await Interaction.findOne({
      where: {
        user_id: userId,
        target_type: target_type_val,
        target_id: target_id_val,
        interaction_type: 'like'
      }
    });

    if (!likeRecord) {
      // 未点赞，直接返回成功（幂等性）
      return res.json({
        code: 200,
        message: '未点赞',
        data: { isLiked: false }
      });
    }

    // 删除点赞记录
    await likeRecord.destroy();

    // 更新目标的点赞数
    const TargetModel = targetModels[target_type_val];
    const target = await TargetModel.findByPk(target_id_val);
    if (target && target.likes !== undefined && target.likes > 0) {
      await target.decrement('likes');
    }

    res.json({
      code: 200,
      message: '已取消点赞',
      data: { isLiked: false }
    });
  } catch (error) {
    next(error);
  }
};

// 收藏
exports.favorite = async (req, res, next) => {
  try {
    // 支持从请求体或URL参数获取数据（驼峰和下划线都支持）
    const { targetType, targetId, target_type, target_id } = { ...req.body, ...req.params };
    const target_type_val = target_type || targetType;
    const target_id_val = target_id || targetId;
    const userId = req.user.id;

    if (!target_type_val || !target_id_val) {
      return res.status(400).json({
        code: 400,
        message: '目标类型和目标ID不能为空',
        data: null
      });
    }

    if (!['destination', 'guide', 'news', 'itinerary'].includes(target_type_val)) {
      return res.status(400).json({
        code: 400,
        message: '无效的目标类型',
        data: null
      });
    }

    // 检查目标是否存在
    const TargetModel = targetModels[target_type_val];
    const target = await TargetModel.findByPk(target_id_val);
    if (!target) {
      return res.status(404).json({
        code: 404,
        message: '目标不存在',
        data: null
      });
    }

    // 检查是否已收藏
    const existingFavorite = await Interaction.findOne({
      where: {
        user_id: userId,
        target_type: target_type_val,
        target_id: target_id_val,
        interaction_type: 'favorite'
      }
    });

    if (existingFavorite) {
      // 已收藏，直接返回成功（幂等性）
      return res.json({
        code: 200,
        message: '已收藏',
        data: { isFavorited: true }
      });
    }

    // 创建收藏记录
    const createdInteraction = await Interaction.create({
      user_id: userId,
      target_type: target_type_val,
      target_id: target_id_val,
      interaction_type: 'favorite'
    });
    
    console.log('收藏记录创建成功:', { userId, target_type: target_type_val, target_id: target_id_val, id: createdInteraction.id });

    // 更新目标的收藏数
    if (target.favorites !== undefined) {
      await target.increment('favorites');
    }

    // 收藏景点 +2分
    pointService.addPoints(userId, 2).catch(() => {});

    res.json({
      code: 200,
      message: '收藏成功',
      data: { isFavorite: true }
    });
  } catch (error) {
    next(error);
  }
};

// 取消收藏
exports.unfavorite = async (req, res, next) => {
  try {
    // 支持从请求体或URL参数获取数据（驼峰和下划线都支持）
    const { targetType, targetId, target_type, target_id } = { ...req.body, ...req.params };
    const target_type_val = target_type || targetType;
    const target_id_val = target_id || targetId;
    const userId = req.user.id;

    if (!target_type_val || !target_id_val) {
      return res.status(400).json({
        code: 400,
        message: '目标类型和目标ID不能为空',
        data: null
      });
    }

    // 查找收藏记录
    const favoriteRecord = await Interaction.findOne({
      where: {
        user_id: userId,
        target_type: target_type_val,
        target_id: target_id_val,
        interaction_type: 'favorite'
      }
    });

    if (!favoriteRecord) {
      // 未收藏，直接返回成功（幂等性）
      return res.json({
        code: 200,
        message: '未收藏',
        data: { isFavorited: false }
      });
    }

    // 删除收藏记录
    await favoriteRecord.destroy();

    // 更新目标的收藏数
    const TargetModel = targetModels[target_type_val];
    const target = await TargetModel.findByPk(target_id_val);
    if (target && target.favorites !== undefined && target.favorites > 0) {
      await target.decrement('favorites');
    }

    res.json({
      code: 200,
      message: '已取消收藏',
      data: { isFavorite: false }
    });
  } catch (error) {
    next(error);
  }
};

// 分享记录
exports.share = async (req, res, next) => {
  try {
    const { target_type, target_id } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!target_type || !target_id) {
      return res.status(400).json({
        code: 400,
        message: '目标类型和目标ID不能为空',
        data: null
      });
    }

    if (!['guide', 'news', 'itinerary'].includes(target_type)) {
      return res.status(400).json({
        code: 400,
        message: '无效的目标类型',
        data: null
      });
    }

    // 检查目标是否存在
    const TargetModel = targetModels[target_type];
    const target = await TargetModel.findByPk(target_id);
    if (!target) {
      return res.status(404).json({
        code: 404,
        message: '目标不存在',
        data: null
      });
    }

    // 创建分享记录（用户可能未登录，user_id 可以为 null）
    await Interaction.create({
      user_id: userId,
      target_type,
      target_id,
      interaction_type: 'share'
    });

    res.json({
      code: 200,
      message: '分享记录成功',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户是否已点赞/收藏
exports.check = async (req, res, next) => {
  try {
    // 支持从查询参数或URL参数获取数据（驼峰和下划线都支持）
    const { targetType, targetId, target_type, target_id } = { ...req.query, ...req.params };
    const target_type_val = target_type || targetType;
    const target_id_val = target_id || targetId;
    const userId = req.user ? req.user.id : null;

    if (!target_type_val || !target_id_val) {
      return res.status(400).json({
        code: 400,
        message: '目标类型和目标ID不能为空',
        data: null
      });
    }

    let isLiked = false;
    let isFavorited = false;

    if (userId) {
      // 检查是否点赞
      const likeRecord = await Interaction.findOne({
        where: {
          user_id: userId,
          target_type: target_type_val,
          target_id: target_id_val,
          interaction_type: 'like'
        }
      });
      isLiked = !!likeRecord;

      // 检查是否收藏
      const favoriteRecord = await Interaction.findOne({
        where: {
          user_id: userId,
          target_type: target_type_val,
          target_id: target_id_val,
          interaction_type: 'favorite'
        }
      });
      isFavorited = !!favoriteRecord;
    }

    res.json({
      code: 200,
      message: 'success',
      data: {
        isLiked,
        isFavorited
      }
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户的收藏列表
exports.getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // 支持 targetType 和 target_type 两种参数名
    const { targetType, target_type, page = 1, pageSize = 10 } = req.query;
    const targetTypeVal = target_type || targetType;

    console.log('=== getFavorites ===');
    console.log('userId:', userId);
    console.log('targetTypeVal:', targetTypeVal);
    console.log('req.query:', req.query);

    const whereClause = {
      user_id: userId,
      interaction_type: 'favorite'
    };

    if (targetTypeVal) {
      whereClause.target_type = targetTypeVal;
    }

    console.log('whereClause:', whereClause);

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const { count, rows } = await Interaction.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      offset,
      limit
    });

    // 获取每个收藏的详细信息，并过滤掉无效数据
    const favorites = await Promise.all(rows.map(async (interaction) => {
      const TargetModel = targetModels[interaction.target_type];
      if (!TargetModel) {
        // 未知的目标类型，跳过
        return null;
      }
      
      const target = await TargetModel.findByPk(interaction.target_id);
      
      if (!target) {
        // 目标不存在，删除无效的交互记录
        await interaction.destroy();
        return null;
      }

      return {
        id: interaction.id,
        target_type: interaction.target_type,
        target_id: interaction.target_id,
        target: target.toJSON(),
        created_at: interaction.created_at
      };
    }));

    // 过滤掉无效的数据
    const validFavorites = favorites.filter(item => item !== null);

    res.json({
      code: 200,
      message: 'success',
      data: {
        list: validFavorites,
        total: validFavorites.length,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户的点赞列表
exports.getLikes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // 支持 targetType 和 target_type 两种参数名
    const { targetType, target_type, page = 1, pageSize = 10 } = req.query;
    const targetTypeVal = target_type || targetType;

    const whereClause = {
      user_id: userId,
      interaction_type: 'like'
    };

    if (targetTypeVal) {
      whereClause.target_type = targetTypeVal;
    }

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const { count, rows } = await Interaction.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      offset,
      limit
    });

    // 获取每个点赞的详细信息，并过滤掉无效数据
    const likes = await Promise.all(rows.map(async (interaction) => {
      const TargetModel = targetModels[interaction.target_type];
      if (!TargetModel) {
        // 未知的目标类型，跳过
        return null;
      }
      
      const target = await TargetModel.findByPk(interaction.target_id);
      
      if (!target) {
        // 目标不存在，删除无效的交互记录
        await interaction.destroy();
        return null;
      }

      return {
        id: interaction.id,
        target_type: interaction.target_type,
        target_id: interaction.target_id,
        target: target.toJSON(),
        created_at: interaction.created_at
      };
    }));

    // 过滤掉无效的数据
    const validLikes = likes.filter(item => item !== null);

    res.json({
      code: 200,
      message: 'success',
      data: {
        list: validLikes,
        total: validLikes.length,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    next(error);
  }
};