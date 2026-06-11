const { Guide } = require('../models');
const { Op } = require('sequelize');

const adminGuideController = {
  // 获取所有攻略
  getAllGuides: async (req, res) => {
    try {
      const { page = 1, limit = 10, keyword = '', status = '' } = req.query;
      const offset = (page - 1) * limit;
      
      const where = {};
      
      if (keyword) {
        where.title = {
          [Op.like]: `%${keyword}%`
        };
      }
      
      if (status) {
        where.status = status;
      }
      
      const { count, rows } = await Guide.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
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
      console.error('获取攻略列表失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },
  
  // 获取单个攻略
  getGuideById: async (req, res) => {
    try {
      const guide = await Guide.findByPk(req.params.id);
      
      if (!guide) {
        return res.status(404).json({ code: 404, message: '攻略不存在' });
      }
      
      res.json({ code: 200, data: guide });
    } catch (error) {
      console.error('获取攻略详情失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },
  
  // 创建攻略
  createGuide: async (req, res) => {
    try {
      console.log('=== 创建攻略请求 ===');
      console.log('请求体:', req.body);
      
      const data = { ...req.body };
      // 管理员创建的攻略自动设为官方攻略
      data.is_official = true;
      // 如果是发布状态，自动设置发布时间
      if (data.status === 'published' && !data.published_at) {
        data.published_at = new Date();
      }
      
      console.log('准备创建的数据:', data);
      
      const guide = await Guide.create(data);
      console.log('创建成功:', guide.id);
      res.json({ code: 200, message: '创建成功', data: guide });
    } catch (error) {
      console.error('创建攻略失败:', error);
      console.error('错误详情:', error.message);
      res.status(500).json({ code: 500, message: '服务器错误: ' + error.message });
    }
  },
  
  // 更新攻略
  updateGuide: async (req, res) => {
    try {
      const guide = await Guide.findByPk(req.params.id);
      
      if (!guide) {
        return res.status(404).json({ code: 404, message: '攻略不存在' });
      }
      
      await guide.update(req.body);
      res.json({ code: 200, message: '更新成功', data: guide });
    } catch (error) {
      console.error('更新攻略失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },
  
  // 删除攻略
  deleteGuide: async (req, res) => {
    try {
      const guide = await Guide.findByPk(req.params.id);
      
      if (!guide) {
        return res.status(404).json({ code: 404, message: '攻略不存在' });
      }
      
      await guide.destroy();
      res.json({ code: 200, message: '删除成功' });
    } catch (error) {
      console.error('删除攻略失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },
  
  // 批量删除
  batchDelete: async (req, res) => {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ code: 400, message: '请选择要删除的攻略' });
      }
      
      const deletedCount = await Guide.destroy({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });
      
      res.json({
        code: 200,
        message: `成功删除 ${deletedCount} 条攻略`,
        data: { deletedCount }
      });
    } catch (error) {
      console.error('批量删除攻略失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },
  
  // 获取统计数据
  getStats: async (req, res) => {
    try {
      const totalGuides = await Guide.count();
      const publishedGuides = await Guide.count({ where: { status: 'published' } });
      const draftGuides = await Guide.count({ where: { status: 'draft' } });
      const featuredGuides = await Guide.count({ where: { is_featured: true } });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayGuides = await Guide.count({
        where: {
          created_at: {
            [Op.gte]: today
          }
        }
      });
      
      res.json({
        code: 200,
        data: {
          totalGuides,
          publishedGuides,
          draftGuides,
          featuredGuides,
          todayGuides
        }
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }
};

module.exports = adminGuideController;
