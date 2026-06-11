const { News } = require('../models');
const { Op } = require('sequelize');

const adminNewsController = {
  // 获取所有资讯
  getAllNews: async (req, res) => {
    try {
      const { page = 1, limit = 10, keyword = '', category = '', status = '' } = req.query;
      const offset = (page - 1) * limit;
      
      const where = {};
      
      if (keyword) {
        where.title = {
          [Op.like]: `%${keyword}%`
        };
      }
      
      if (category) {
        where.category = category;
      }
      
      if (status) {
        where.status = status;
      }
      
      const { count, rows } = await News.findAndCountAll({
        where,
        order: [['is_top', 'DESC'], ['created_at', 'DESC']],
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
  
  // 获取单个资讯
  getNewsById: async (req, res) => {
    try {
      const news = await News.findByPk(req.params.id);
      
      if (!news) {
        return res.status(404).json({ code: 404, message: '资讯不存在' });
      }
      
      res.json({ code: 200, data: news });
    } catch (error) {
      console.error('获取资讯详情失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },
  
  // 创建资讯
  createNews: async (req, res) => {
    try {
      console.log('=== 创建资讯请求 ===');
      console.log('请求体:', req.body);
      
      const data = { ...req.body };
      // 如果是发布状态，自动设置发布时间
      if (data.status === 'published' && !data.published_at) {
        data.published_at = new Date();
      }
      
      console.log('准备创建的数据:', data);
      
      const news = await News.create(data);
      console.log('创建成功:', news.id);
      res.json({ code: 200, message: '创建成功', data: news });
    } catch (error) {
      console.error('创建资讯失败:', error);
      console.error('错误详情:', error.message);
      res.status(500).json({ code: 500, message: '服务器错误: ' + error.message });
    }
  },
  
  // 更新资讯
  updateNews: async (req, res) => {
    try {
      const news = await News.findByPk(req.params.id);
      
      if (!news) {
        return res.status(404).json({ code: 404, message: '资讯不存在' });
      }
      
      await news.update(req.body);
      res.json({ code: 200, message: '更新成功', data: news });
    } catch (error) {
      console.error('更新资讯失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },
  
  // 删除资讯
  deleteNews: async (req, res) => {
    try {
      const news = await News.findByPk(req.params.id);
      
      if (!news) {
        return res.status(404).json({ code: 404, message: '资讯不存在' });
      }
      
      await news.destroy();
      res.json({ code: 200, message: '删除成功' });
    } catch (error) {
      console.error('删除资讯失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },
  
  // 批量删除
  batchDelete: async (req, res) => {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ code: 400, message: '请选择要删除的资讯' });
      }
      
      const deletedCount = await News.destroy({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });
      
      res.json({
        code: 200,
        message: `成功删除 ${deletedCount} 条资讯`,
        data: { deletedCount }
      });
    } catch (error) {
      console.error('批量删除资讯失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },
  
  // 获取统计数据
  getStats: async (req, res) => {
    try {
      const totalNews = await News.count();
      const publishedNews = await News.count({ where: { status: 'published' } });
      const topNews = await News.count({ where: { is_top: true } });
      
      const categories = ['行业动态', '签证政策', '目的她推荐', '活动预告', '特惠信息'];
      const categoryStats = {};
      
      for (const cat of categories) {
        categoryStats[cat] = await News.count({ where: { category: cat } });
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayNews = await News.count({
        where: {
          created_at: {
            [Op.gte]: today
          }
        }
      });
      
      res.json({
        code: 200,
        data: {
          totalNews,
          publishedNews,
          topNews,
          categoryStats,
          todayNews
        }
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }
};

module.exports = adminNewsController;
