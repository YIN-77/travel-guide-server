const { Review, Destination, User } = require('../models');

// 获取评论列表（管理员）
exports.getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const reviews = await Review.findAndCountAll({
      limit: parseInt(limit),
      offset: offset,
      order: [['created_at', 'DESC']],
      include: [{ model: Destination, attributes: ['id', 'name'] }]
    });

    res.json({
      code: 200,
      message: 'success',
      data: {
        list: reviews.rows,
        total: reviews.count,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// 获取景点评论（公开）
exports.getDestinationReviews = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reviews = await Review.findAll({
      where: { destination_id: id },
      order: [['created_at', 'DESC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'nickname', 'avatar']
      }]
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

// 添加评论（公开）
exports.createReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_name, content, rating } = req.body;

    if (!user_name || !content) {
      return res.status(400).json({
        code: 400,
        message: '用户名和评论内容不能为空',
        data: null
      });
    }

    const destination = await Destination.findByPk(id);

    if (!destination) {
      return res.status(404).json({
        code: 404,
        message: '景点不存在',
        data: null
      });
    }

    const review = await Review.create({
      destination_id: id,
      user_name,
      content,
      rating: rating || 5
    });

    res.status(201).json({
      code: 201,
      message: '评论添加成功',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// 删除评论（管理员）
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);

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
