const { Destination, Review, Tag, Admin } = require('../models');

// 获取仪表盘统计数据
exports.getDashboardStats = async (req, res, next) => {
  try {
    const destinationCount = await Destination.count();
    const reviewCount = await Review.count();
    const tagCount = await Tag.count();
    const adminCount = await Admin.count();

    // 获取最近添加的景点
    const recentDestinations = await Destination.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{ model: Tag, attributes: ['id', 'name'] }]
    });

    // 获取最近添加的评论
    const recentReviews = await Review.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{ model: Destination, attributes: ['id', 'name'] }]
    });

    res.json({
      code: 200,
      message: 'success',
      data: {
        destinationCount,
        reviewCount,
        tagCount,
        adminCount,
        recentDestinations,
        recentReviews
      }
    });
  } catch (error) {
    next(error);
  }
};
