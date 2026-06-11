const { Guide, User } = require('../models');
const { Op } = require('sequelize');

const guideController = {
  // 获取所有已发布的攻略
  getAllGuides: async (req, res) => {
    try {
      const { page = 1, limit = 20, keyword = '', tag = '', sort = 'latest' } = req.query;
      const offset = (page - 1) * limit;
      
      const where = {
        status: 'published'
      };
      
      if (keyword) {
        where.title = {
          [Op.like]: `%${keyword}%`
        };
      }
      
      if (tag && tag !== 'all') {
        where.tags = {
          [Op.like]: `%${tag}%`
        };
      }
      
      // 排序逻辑
      let order = [];
      switch (sort) {
        case 'latest':
          order = [['created_at', 'DESC']];
          break;
        case 'hot':
          order = [['likes', 'DESC'], ['created_at', 'DESC']];
          break;
        case 'comments':
          order = [['comments', 'DESC'], ['created_at', 'DESC']];
          break;
        case 'views':
          order = [['views', 'DESC'], ['created_at', 'DESC']];
          break;
        default:
          order = [['created_at', 'DESC']];
      }
      
      const { count, rows } = await Guide.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'nickname', 'avatar']
          }
        ],
        order,
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
      res.status(500).json({ code: 500, message: '服务器错误', error: error.message });
    }
  },

  // 获取单个攻略详情
  getGuideById: async (req, res) => {
    try {
      const guide = await Guide.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'nickname', 'avatar']
          }
        ]
      });
      
      if (!guide) {
        return res.status(404).json({ code: 404, message: '攻略不存在' });
      }

      if (guide.status !== 'published') {
        return res.status(403).json({ code: 403, message: '该攻略暂未发布' });
      }

      guide.views = (guide.views || 0) + 1;
      await guide.save();
      
      res.json({ code: 200, data: guide });
    } catch (error) {
      console.error('获取攻略详情失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  // 用户创建攻略（需要登录）
  createGuide: async (req, res) => {
    try {
      const { title, description, content, cover_image, tags, status = 'draft' } = req.body;
      
      if (!title) {
        return res.status(400).json({ code: 400, message: '请输入攻略标题' });
      }
      
      if (!req.user || !req.user.id) {
        return res.status(401).json({ code: 401, message: '用户未登录或登录已过期' });
      }

      const guide = await Guide.create({
        title,
        description,
        content,
        cover_image,
        tags,
        status,
        author_id: req.user.id,
        author_name: req.user.nickname || req.user.username,
        views: 0,
        likes: 0,
        comments: 0,
        is_featured: false,
        published_at: status === 'published' ? new Date() : null
      });
      
      res.json({
        code: 200,
        data: guide,
        message: '创建成功'
      });
    } catch (error) {
      console.error('创建攻略失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误: ' + error.message });
    }
  },

  // 获取官方精选攻略
  getOfficialGuides: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const { count, rows } = await Guide.findAndCountAll({
        where: {
          status: 'published',
          is_official: true
        },
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
      console.error('获取官方攻略失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  // 获取热门攻略
  getFeaturedGuides: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const { count, rows } = await Guide.findAndCountAll({
        where: {
          status: 'published',
          is_featured: true
        },
        order: [['likes', 'DESC'], ['created_at', 'DESC']],
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
      console.error('获取热门攻略失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  // 用户获取自己的攻略列表
  getMyGuides: async (req, res) => {
    try {
      const guides = await Guide.findAll({
        where: { author_id: req.user.id },
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        code: 200,
        data: guides
      });
    } catch (error) {
      console.error('获取我的攻略失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  // 用户更新攻略
  updateGuide: async (req, res) => {
    try {
      const guide = await Guide.findByPk(req.params.id);
      
      if (!guide) {
        return res.status(404).json({ code: 404, message: '攻略不存在' });
      }

      if (guide.author_id !== req.user.id) {
        return res.status(403).json({ code: 403, message: '只能编辑自己的攻略' });
      }

      const { title, description, content, cover_image, tags, status } = req.body;
      
      const updateData = {
        title: title || guide.title,
        description: description !== undefined ? description : guide.description,
        content: content !== undefined ? content : guide.content,
        cover_image: cover_image !== undefined ? cover_image : guide.cover_image,
        tags: tags !== undefined ? tags : guide.tags,
        status: status || guide.status
      };

      if (updateData.status === 'published' && guide.status !== 'published') {
        updateData.published_at = new Date();
      }

      await guide.update(updateData);
      
      res.json({
        code: 200,
        data: guide,
        message: '更新成功'
      });
    } catch (error) {
      console.error('更新攻略失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  // 用户删除攻略
  deleteGuide: async (req, res) => {
    try {
      const guide = await Guide.findByPk(req.params.id);
      
      if (!guide) {
        return res.status(404).json({ code: 404, message: '攻略不存在' });
      }

      if (guide.author_id !== req.user.id) {
        return res.status(403).json({ code: 403, message: '只能删除自己的攻略' });
      }

      await guide.destroy();
      
      res.json({
        code: 200,
        message: '删除成功'
      });
    } catch (error) {
      console.error('删除攻略失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }
};

module.exports = guideController;
