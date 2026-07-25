const { Destination, Tag, Itinerary, Guide, News, User } = require('../models');
const { Op } = require('sequelize');

const homeController = {
  // 获取首页所有数据（合并接口，避免多次冷启动）
  getHomeData: async (req, res) => {
    try {
      const [destinations, itineraries, guidesRes, newsList] = await Promise.all([
        Destination.findAll({
          include: [{
            model: Tag,
            attributes: ['id', 'name'],
            through: { attributes: [] }
          }],
          order: [['rating', 'DESC']],
          limit: 100
        }),
        Itinerary.findAll({
          where: { isPublic: true },
          include: [{
            model: User,
            attributes: ['id', 'username', 'avatar']
          }],
          order: [['created_at', 'DESC']],
          limit: 50
        }),
        Guide.findAll({
          where: { status: 'published' },
          include: [{
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'avatar']
          }],
          order: [['created_at', 'DESC']],
          limit: 50
        }),
        News.findAll({
          where: { status: 'published' },
          order: [['created_at', 'DESC']],
          limit: 10
        })
      ]);

      // 序列化景点数据（提取 tags 名称数组）
      const formattedDestinations = destinations.map(d => ({
        ...d.toJSON(),
        tags: (d.Tags || []).map(t => t.name)
      }));

      res.json({
        code: 200,
        msg: 'success',
        data: {
          destinations: formattedDestinations,
          itineraries: itineraries.map(i => i.toJSON()),
          guides: guidesRes.map(g => g.toJSON()),
          newsList: newsList.map(n => n.toJSON())
        }
      });
    } catch (error) {
      console.error('获取首页数据失败:', error);
      res.status(500).json({ code: 500, msg: '服务器内部错误' });
    }
  }
};

module.exports = homeController;
