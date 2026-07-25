const { Destination, Guide, Itinerary, News, User } = require('../models');
const { Op } = require('sequelize');

const searchController = {
  // 统一搜索所有内容（景点、攻略、行程、资讯），支持分页和关键词搜索
  globalSearch: async (req, res) => {
    try {
      const { keyword = '', page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      const pageSize = parseInt(limit);

      if (!keyword.trim()) {
        return res.json({
          code: 200,
          data: {
            destinations: { list: [], total: 0 },
            guides: { list: [], total: 0 },
            itineraries: { list: [], total: 0 },
            news: { list: [], total: 0 },
            page: parseInt(page),
            limit: pageSize
          }
        });
      }

      const searchTerm = keyword.trim();
      const likePattern = `%${searchTerm}%`;

      // 并行搜索四种类型
      const [destinations, guides, itineraries, newsItems] = await Promise.all([
        // 景点搜索：按名称、位置、描述
        Destination.findAndCountAll({
          where: {
            [Op.or]: [
              { name: { [Op.like]: likePattern } },
              { location: { [Op.like]: likePattern } },
              { description: { [Op.like]: likePattern } }
            ]
          },
          limit: pageSize,
          offset: offset,
          order: [['rating', 'DESC'], ['created_at', 'DESC']]
        }),

        // 攻略搜索：按标题、描述、内容
        Guide.findAndCountAll({
          where: {
            status: 'published',
            [Op.or]: [
              { title: { [Op.like]: likePattern } },
              { description: { [Op.like]: likePattern } }
            ]
          },
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'nickname', 'avatar']
            }
          ],
          limit: pageSize,
          offset: offset,
          order: [['likes', 'DESC'], ['created_at', 'DESC']]
        }),

        // 行程搜索：按标题、描述
        Itinerary.findAndCountAll({
          where: {
            [Op.or]: [
              { title: { [Op.like]: likePattern } },
              { description: { [Op.like]: likePattern } }
            ]
          },
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'nickname', 'avatar']
            }
          ],
          limit: pageSize,
          offset: offset,
          order: [['likes', 'DESC'], ['created_at', 'DESC']]
        }),

        // 资讯搜索：按标题、描述、分类
        News.findAndCountAll({
          where: {
            status: 'published',
            [Op.or]: [
              { title: { [Op.like]: likePattern } },
              { description: { [Op.like]: likePattern } },
              { category: { [Op.like]: likePattern } }
            ]
          },
          limit: pageSize,
          offset: offset,
          order: [['views', 'DESC'], ['created_at', 'DESC']]
        })
      ]);

      res.json({
        code: 200,
        data: {
          destinations: {
            list: destinations.rows,
            total: destinations.count
          },
          guides: {
            list: guides.rows,
            total: guides.count
          },
          itineraries: {
            list: itineraries.rows,
            total: itineraries.count
          },
          news: {
            list: newsItems.rows,
            total: newsItems.count
          },
          keyword: searchTerm,
          page: parseInt(page),
          limit: pageSize
        }
      });
    } catch (error) {
      console.error('全局搜索失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误', error: error.message });
    }
  },

  // 获取热门搜索词
  getHotSearches: async (req, res) => {
    try {
      const limit = 8;

      // 并行获取浏览量最高的景点名称和点赞数最多的攻略标题
      const [hotDestinations, hotGuides, hotItineraries] = await Promise.all([
        Destination.findAll({
          attributes: ['name'],
          order: [['rating', 'DESC'], ['created_at', 'DESC']],
          limit: Math.ceil(limit / 2)
        }),
        Guide.findAll({
          where: { status: 'published' },
          attributes: ['title'],
          order: [['likes', 'DESC'], ['views', 'DESC']],
          limit: Math.ceil(limit / 2)
        }),
        Itinerary.findAll({
          attributes: ['title'],
          order: [['likes', 'DESC']],
          limit: 4
        })
      ]);

      // 合并去重
      const searchTerms = new Set();
      
      hotDestinations.forEach(d => {
        if (d.name) searchTerms.add(d.name);
      });

      hotGuides.forEach(g => {
        if (g.title) searchTerms.add(g.title);
      });

      hotItineraries.forEach(i => {
        if (i.title) searchTerms.add(i.title);
      });

      // 转换为数组并限制数量
      const hotSearches = Array.from(searchTerms).slice(0, limit).map((term, index) => ({
        id: index + 1,
        keyword: term,
        rank: index + 1
      }));

      res.json({
        code: 200,
        data: hotSearches
      });
    } catch (error) {
      console.error('获取热门搜索失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误', error: error.message });
    }
  }
};

module.exports = searchController;
