const { Itinerary, ItineraryDay, ItineraryActivity, Destination, User, sequelize } = require('../models');
const { Op } = require('sequelize');

const adminItineraryController = {
  // 获取所有行程（管理员）
  getAllItineraries: async (req, res) => {
    try {
      const { page = 1, limit = 10, keyword = '', status = '', isFeatured, isOfficial } = req.query;
      const offset = (page - 1) * limit;
      
      const where = {};
      
      // 关键词搜索
      if (keyword) {
        where[Op.or] = [
          { title: { [Op.like]: `%${keyword}%` } },
          { description: { [Op.like]: `%${keyword}%` } }
        ];
      }
      
      // 状态筛选
      if (status === 'public') {
        where.isPublic = true;
      } else if (status === 'private') {
        where.isPublic = false;
      }
      
      // 热门推荐筛选
      if (isFeatured === 'true') {
        where.isFeatured = true;
      } else if (isFeatured === 'false') {
        where.isFeatured = false;
      }
      
      // 官方行程筛选
      if (isOfficial === 'true') {
        where.isOfficial = true;
      } else if (isOfficial === 'false') {
        where.isOfficial = false;
      }
      
      const { count, rows } = await Itinerary.findAndCountAll({
        where,
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'nickname', 'email']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });
      
      // 获取每个行程的统计信息
      const itinerariesWithStats = await Promise.all(
        rows.map(async (itinerary) => {
          const daysCount = await ItineraryDay.count({
            where: { itineraryId: itinerary.id }
          });
          
          const activityCount = await ItineraryActivity.count({
            include: [{
              model: ItineraryDay,
              where: { itineraryId: itinerary.id }
            }]
          });
          
          return {
            ...itinerary.toJSON(),
            daysCount,
            activityCount
          };
        })
      );
      
      res.json({
        code: 200,
        data: {
          list: itinerariesWithStats,
          total: count,
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('获取行程列表失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },
  
  // 获取单个行程详情（管理员）
  getItineraryById: async (req, res) => {
    try {
      const itinerary = await Itinerary.findByPk(req.params.id, {
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'nickname', 'email']
          },
          {
            model: ItineraryDay,
            as: 'days',
            include: [
              {
                model: ItineraryActivity,
                as: 'activities',
                include: [Destination]
              }
            ],
            order: [['dayNumber', 'ASC']]
          }
        ]
      });
      
      if (!itinerary) {
        return res.status(404).json({ code: 404, message: '行程不存在' });
      }
      
      res.json({ code: 200, data: itinerary });
    } catch (error) {
      console.error('获取行程详情失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },
  
  // 创建官方行程（管理员）
  createOfficialItinerary: async (req, res) => {
    try {
      const { title, description, daysCount = 1, isPublic = true, isFeatured = false, coverImage, days, startDate, endDate } = req.body;
      
      // 使用前端传入的日期，如果没有则自动生成
      const sDate = startDate ? new Date(startDate) : new Date();
      const eDate = endDate ? new Date(endDate) : new Date(sDate);
      if (!endDate) {
        eDate.setDate(eDate.getDate() + (daysCount - 1));
      }
      
      const itinerary = await Itinerary.create({
        userId: null, // null表示官方行程，不关联用户，显示为"官方平台"
        title,
        description,
        startDate: sDate,
        endDate: eDate,
        isPublic: true, // 官方行程默认公开，所有用户可见
        isFeatured: isFeatured, // 根据前端传入设置
        isOfficial: true, // 标记为官方行程
        coverImage: coverImage || '',
        favorites: 0,
        shares: 0
      });

      // 自动创建日期
      const start = new Date(sDate);
      const end = new Date(eDate);
      const createdDays = [];
      
      let currentDate = new Date(start);
      let dayNumber = 1;
      
      while (currentDate <= end) {
        const day = await ItineraryDay.create({
          itineraryId: itinerary.id,
          dayNumber,
          date: new Date(currentDate)
        });
        createdDays.push(day);
        dayNumber++;
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // 如果提供了天数活动数据，创建活动
      if (days && Array.isArray(days)) {
        const sortedDays = [...days].sort((a, b) => a.dayNumber - b.dayNumber);
        for (const dayData of sortedDays) {
          const dayRecord = createdDays.find(d => d.dayNumber === dayData.dayNumber);
          if (dayRecord && dayData.activities && Array.isArray(dayData.activities)) {
            const sortedActivities = [...dayData.activities].sort((a, b) => {
              return (a.time || a.startTime || '').localeCompare(b.time || b.startTime || '')
            });
            for (let i = 0; i < sortedActivities.length; i++) {
              const activity = sortedActivities[i];
              await ItineraryActivity.create({
                itineraryDayId: dayRecord.id,
                title: activity.title,
                description: activity.description || '',
                startTime: activity.time || activity.startTime || '',
                location: activity.location || '',
                images: activity.images || [],
                sortOrder: i + 1
              });
            }
          }
        }
      }

      const fullItinerary = await Itinerary.findByPk(itinerary.id, {
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'nickname']
          },
          {
            model: ItineraryDay,
            as: 'days',
            include: [
              {
                model: ItineraryActivity,
                as: 'activities',
                include: [Destination]
              }
            ],
            order: [['dayNumber', 'ASC']]
          }
        ]
      });

      res.json({ code: 200, data: fullItinerary, message: '官方行程创建成功' });
    } catch (error) {
      console.error('创建官方行程失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },
  
  // 更新行程（管理员）
  updateItinerary: async (req, res) => {
    try {
      const itinerary = await Itinerary.findByPk(req.params.id);
      
      if (!itinerary) {
        return res.status(404).json({ code: 404, message: '行程不存在' });
      }
      
      const { title, description, startDate, endDate, coverImage, isPublic, isFeatured, isOfficial } = req.body;
      
      await itinerary.update({
        title: title || itinerary.title,
        description: description || itinerary.description,
        startDate: startDate || itinerary.startDate,
        endDate: endDate || itinerary.endDate,
        coverImage: coverImage !== undefined ? coverImage : itinerary.coverImage,
        isPublic: isPublic !== undefined ? isPublic : itinerary.isPublic,
        isFeatured: isFeatured !== undefined ? isFeatured : itinerary.isFeatured,
        isOfficial: isOfficial !== undefined ? isOfficial : itinerary.isOfficial
      });
      
      res.json({ code: 200, data: itinerary, message: '更新成功' });
    } catch (error) {
      console.error('更新行程失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },
  
  // 删除行程（管理员）
  deleteItinerary: async (req, res) => {
    try {
      const itinerary = await Itinerary.findByPk(req.params.id, {
        include: [
          { model: ItineraryDay, as: 'days' }
        ]
      });
      
      if (!itinerary) {
        return res.status(404).json({ code: 404, message: '行程不存在' });
      }
      
      // 先删除关联的行程天数和活动
      for (const day of itinerary.days || []) {
        await ItineraryActivity.destroy({ where: { itineraryDayId: day.id } });
      }
      await ItineraryDay.destroy({ where: { itineraryId: itinerary.id } });
      
      // 再删除行程
      await itinerary.destroy();
      res.json({ code: 200, message: '删除成功' });
    } catch (error) {
      console.error('删除行程失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },
  
  // 批量删除行程（管理员）
  batchDeleteItineraries: async (req, res) => {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ code: 400, message: '请选择要删除的行程' });
      }
      
      const deletedCount = await Itinerary.destroy({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });
      
      res.json({
        code: 200,
        message: `成功删除 ${deletedCount} 条行程`,
        data: { deletedCount }
      });
    } catch (error) {
      console.error('批量删除行程失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },
  
  // 更新行程公开状态（管理员）
  updateItineraryStatus: async (req, res) => {
    try {
      const { isPublic } = req.body;
      const itinerary = await Itinerary.findByPk(req.params.id);
      
      if (!itinerary) {
        return res.status(404).json({ code: 404, message: '行程不存在' });
      }
      
      await itinerary.update({ isPublic });
      res.json({ code: 200, message: '状态更新成功' });
    } catch (error) {
      console.error('更新行程状态失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },
  
  // 设置/取消热门推荐（管理员）
  updateFeaturedStatus: async (req, res) => {
    try {
      const { isFeatured } = req.body;
      const itinerary = await Itinerary.findByPk(req.params.id);
      
      if (!itinerary) {
        return res.status(404).json({ code: 404, message: '行程不存在' });
      }
      
      await itinerary.update({ isFeatured });
      res.json({ 
        code: 200, 
        message: isFeatured ? '已设为热门推荐' : '已取消热门推荐',
        data: itinerary 
      });
    } catch (error) {
      console.error('更新热门推荐状态失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },
  
  // 设置/取消官方行程（管理员）
  updateOfficialStatus: async (req, res) => {
    try {
      const { isOfficial } = req.body;
      const itinerary = await Itinerary.findByPk(req.params.id);
      
      if (!itinerary) {
        return res.status(404).json({ code: 404, message: '行程不存在' });
      }
      
      await itinerary.update({ isOfficial });
      res.json({ 
        code: 200, 
        message: isOfficial ? '已设为官方行程' : '已取消官方行程',
        data: itinerary 
      });
    } catch (error) {
      console.error('更新官方行程状态失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },
  
  // 获取统计数据
  getStats: async (req, res) => {
    try {
      const totalItineraries = await Itinerary.count();
      const publicItineraries = await Itinerary.count({ where: { isPublic: true } });
      const privateItineraries = await Itinerary.count({ where: { isPublic: false } });
      const featuredItineraries = await Itinerary.count({ where: { isFeatured: true } });
      const officialItineraries = await Itinerary.count({ where: { isOfficial: true } });
      
      // 获取今日新增
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayItineraries = await Itinerary.count({
        where: {
          created_at: {
            [Op.gte]: today
          }
        }
      });
      
      // 获取总收藏数和分享数
      const totalFavorites = await Itinerary.sum('favorites') || 0;
      const totalShares = await Itinerary.sum('shares') || 0;
      
      res.json({
        code: 200,
        data: {
          totalItineraries,
          publicItineraries,
          privateItineraries,
          featuredItineraries,
          officialItineraries,
          todayItineraries,
          totalFavorites,
          totalShares
        }
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }
};

module.exports = adminItineraryController;