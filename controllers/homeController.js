const { Destination, Tag, Itinerary, ItineraryDay, Guide, News, User } = require('../models');
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
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'nickname', 'avatar']
            },
            {
              model: ItineraryDay,
              as: 'days',
              attributes: ['id', 'dayNumber']
            }
          ],
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
          itineraries: itineraries.map(i => {
            const json = i.toJSON();
            return {
              ...json,
              author_name: json.User?.nickname || json.User?.username || (json.isOfficial ? '官方平台' : '匿名'),
              daysCount: json.days?.length || 1
            };
          }),
          guides: guidesRes.map(g => {
            const json = g.toJSON();
            return {
              ...json,
              author_name: json.author_name || json.author?.nickname || json.author?.username || (json.is_official ? '官方平台' : '匿名')
            };
          }),
          newsList: newsList.map(n => {
            const json = n.toJSON();
            return {
              ...json,
              author: json.author || '官方平台'
            };
          })
        }
      });
    } catch (error) {
      console.error('获取首页数据失败:', error);
      res.status(500).json({ code: 500, msg: '服务器内部错误' });
    }
  }
};

module.exports = homeController;
