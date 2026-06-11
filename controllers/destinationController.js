const { Destination, Tag, Review, Favorite, Like, User } = require('../models');
const { Op } = require('sequelize');

// 获取景点列表
exports.getDestinations = async (req, res, next) => {
  try {
    const { search, tag, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } }
      ];
    }

    let destinations;
    if (tag) {
      destinations = await Destination.findAndCountAll({
        where,
        include: [{
          model: Tag,
          where: { name: tag },
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }],
        limit: parseInt(limit),
        offset: offset,
        order: [['created_at', 'DESC']],
        subQuery: false
      });
    } else {
      destinations = await Destination.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: offset,
        order: [['created_at', 'DESC']],
        include: [{ model: Tag, attributes: ['id', 'name'], through: { attributes: [] } }]
      });
    }

    res.json({
      code: 200,
      message: 'success',
      data: {
        list: destinations.rows || [],
        total: destinations.count || 0,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('获取景点列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取景点列表失败',
      error: error.message
    });
  }
};

// 获取景点详情
exports.getDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const destination = await Destination.findByPk(id, {
      include: [
        { model: Tag, attributes: ['id', 'name'] },
        {
          model: Review,
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'nickname', 'avatar']
          }]
        }
      ]
    });

    if (!destination) {
      return res.status(404).json({
        code: 404,
        message: '景点不存在',
        data: null
      });
    }

    // 获取收藏数和点赞数
    const [favoriteCount, likeCount] = await Promise.all([
      Favorite.count({ where: { destination_id: id } }),
      Like.count({ where: { destination_id: id } })
    ]);

    // 检查当前用户是否已收藏和点赞
    let isFavorite = false;
    let isLiked = false;
    if (userId) {
      [isFavorite, isLiked] = await Promise.all([
        Favorite.findOne({ where: { user_id: userId, destination_id: id } }).then(Boolean),
        Like.findOne({ where: { user_id: userId, destination_id: id } }).then(Boolean)
      ]);
    }

    res.json({
      code: 200,
      message: 'success',
      data: {
        ...destination.toJSON(),
        favoriteCount,
        likeCount,
        isFavorite,
        isLiked
      }
    });
  } catch (error) {
    next(error);
  }
};

// 创建景点
exports.createDestination = async (req, res, next) => {
  try {
    const { name, description, image, images, video, location, rating, tags, latitude, longitude, openingHours, ticketPrice, transport, bestTime, duration, tips } = req.body;

    if (!name) {
      return res.status(400).json({
        code: 400,
        message: '景点名称不能为空',
        data: null
      });
    }

    const destination = await Destination.create({
      name,
      description,
      image,
      images: images || [],
      video: video || '',
      location,
      rating,
      latitude,
      longitude,
      openingHours,
      ticketPrice,
      transport,
      bestTime,
      duration,
      tips
    });

    // 添加标签关联
    if (tags && tags.length > 0) {
      const tagInstances = await Tag.findAll({ where: { id: tags } });
      await destination.addTags(tagInstances);
    }

    const result = await Destination.findByPk(destination.id, {
      include: [{ model: Tag, attributes: ['id', 'name'] }]
    });

    res.status(201).json({
      code: 201,
      message: '创建成功',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// 更新景点
exports.updateDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, image, images, video, location, rating, tags, latitude, longitude, openingHours, ticketPrice, transport, bestTime, duration, tips } = req.body;

    const destination = await Destination.findByPk(id);

    if (!destination) {
      return res.status(404).json({
        code: 404,
        message: '景点不存在',
        data: null
      });
    }

    await destination.update({
      name: name || destination.name,
      description: description !== undefined ? description : destination.description,
      image: image !== undefined ? image : destination.image,
      images: images !== undefined ? images : destination.images,
      video: video !== undefined ? video : destination.video,
      location: location !== undefined ? location : destination.location,
      rating: rating !== undefined ? rating : destination.rating,
      latitude: latitude !== undefined ? latitude : destination.latitude,
      longitude: longitude !== undefined ? longitude : destination.longitude,
      openingHours: openingHours !== undefined ? openingHours : destination.openingHours,
      ticketPrice: ticketPrice !== undefined ? ticketPrice : destination.ticketPrice,
      transport: transport !== undefined ? transport : destination.transport,
      bestTime: bestTime !== undefined ? bestTime : destination.bestTime,
      duration: duration !== undefined ? duration : destination.duration,
      tips: tips !== undefined ? tips : destination.tips
    });

    // 更新标签关联
    if (tags) {
      const tagInstances = await Tag.findAll({ where: { id: tags } });
      await destination.setTags(tagInstances);
    }

    const result = await Destination.findByPk(id, {
      include: [{ model: Tag, attributes: ['id', 'name'] }]
    });

    res.json({
      code: 200,
      message: '更新成功',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// 删除景点
exports.deleteDestination = async (req, res, next) => {
  try {
    const { id } = req.params;

    const destination = await Destination.findByPk(id);

    if (!destination) {
      return res.status(404).json({
        code: 404,
        message: '景点不存在',
        data: null
      });
    }

    await destination.destroy();

    res.json({
      code: 200,
      message: '删除成功',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// 批量删除景点
exports.batchDeleteDestinations = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请选择要删除的景点',
        data: null
      });
    }

    await Destination.destroy({ where: { id: ids } });

    res.json({
      code: 200,
      message: '批量删除成功',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
