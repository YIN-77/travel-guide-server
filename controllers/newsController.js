const { News } = require('../models');
const { Op } = require('sequelize');

const newsController = {
  // 获取所有已发布的资讯
  getAllNews: async (req, res) => {
    try {
      const { page = 1, limit = 20, keyword = '', category = '' } = req.query;
      const offset = (page - 1) * limit;
      
      const where = {
        status: 'published'
      };
      
      if (keyword) {
        where.title = {
          [Op.like]: `%${keyword}%`
        };
      }
      
      if (category && category !== '全部') {
        where.category = category;
      }
      
      const { count, rows } = await News.findAndCountAll({
        where,
        order: [
          ['is_top', 'DESC'],
          ['created_at', 'DESC']
        ],
        limit: parseInt(limit),
        offset: offset
      });
      
      res.json({
        code: 200,
        data: {
          list: rows,
          total: count,
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('获取资讯列表失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  // 获取单个资讯详情
  getNewsById: async (req, res) => {
    try {
      const news = await News.findByPk(req.params.id);
      
      if (!news) {
        return res.status(404).json({ code: 404, message: '资讯不存在' });
      }

      if (news.status !== 'published') {
        return res.status(403).json({ code: 403, message: '该资讯暂未发布' });
      }

      news.views = (news.views || 0) + 1;
      await news.save();
      
      res.json({ code: 200, data: news });
    } catch (error) {
      console.error('获取资讯详情失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }
};

module.exports = newsController;
