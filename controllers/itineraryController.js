const { Itinerary, ItineraryDay, ItineraryActivity, Destination, User, sequelize } = require('../models');
const { Op } = require('sequelize');

const itineraryController = {
  getItineraries: async (req, res) => {
    try {
      const itineraries = await Itinerary.findAll({
        where: { userId: req.user.id },
        order: [['created_at', 'DESC']]
      });
      res.json({ code: 200, data: itineraries });
    } catch (error) {
      console.error('获取行程列表失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  getItineraryById: async (req, res) => {
    try {
      const itinerary = await Itinerary.findOne({
        where: { 
          id: req.params.id,
          userId: req.user.id
        },
        include: [
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

  createItinerary: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { title, description, startDate, endDate, isPublic, coverImage, activities } = req.body;
      
      const itinerary = await Itinerary.create({
        userId: req.user.id,
        title,
        description,
        startDate,
        endDate,
        isPublic: isPublic || false,
        coverImage,
        isFeatured: false,
        isOfficial: false,
        favorites: 0,
        shares: 0
      }, { transaction });

      const start = new Date(startDate);
      const end = new Date(endDate);
      const createdDays = [];
      
      let currentDate = new Date(start);
      let dayNumber = 1;
      
      while (currentDate <= end) {
        const day = await ItineraryDay.create({
          itineraryId: itinerary.id,
          dayNumber,
          date: new Date(currentDate)
        }, { transaction });
        createdDays.push(day);
        dayNumber++;
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (activities && Array.isArray(activities)) {
        for (const activity of activities) {
          const dayRecord = createdDays.find(d => d.dayNumber === activity.dayNumber);
          if (dayRecord) {
            await ItineraryActivity.create({
              itineraryDayId: dayRecord.id,
              title: activity.title,
              description: activity.description,
              startTime: activity.time,
              location: activity.location,
              images: activity.images || [],
              sortOrder: 1
            }, { transaction });
          }
        }
      }

      await transaction.commit();

      const fullItinerary = await Itinerary.findByPk(itinerary.id, {
        include: [
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

      res.json({ code: 200, data: fullItinerary, message: '创建成功' });
    } catch (error) {
      await transaction.rollback();
      console.error('创建行程失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  updateItinerary: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const itinerary = await Itinerary.findOne({
        where: { 
          id: req.params.id,
          userId: req.user.id
        },
        include: [{
          model: ItineraryDay,
          as: 'days'
        }]
      });

      if (!itinerary) {
        await transaction.rollback();
        return res.status(404).json({ code: 404, message: '行程不存在' });
      }

      const { title, description, startDate, endDate, isPublic, coverImage, activities } = req.body;
      
      await itinerary.update({
        title: title !== undefined ? title : itinerary.title,
        description: description !== undefined ? description : itinerary.description,
        startDate: startDate !== undefined ? startDate : itinerary.startDate,
        endDate: endDate !== undefined ? endDate : itinerary.endDate,
        isPublic: isPublic !== undefined ? isPublic : itinerary.isPublic,
        coverImage: coverImage !== undefined ? coverImage : itinerary.coverImage
      }, { transaction });

      if (activities && Array.isArray(activities)) {
        for (const day of itinerary.days || []) {
          await ItineraryActivity.destroy({ 
            where: { itineraryDayId: day.id },
            transaction 
          });
        }
        
        const days = await ItineraryDay.findAll({ 
          where: { itineraryId: itinerary.id },
          transaction 
        });
        
        for (const activity of activities) {
          const dayRecord = days.find(d => d.dayNumber === activity.dayNumber);
          if (dayRecord) {
            await ItineraryActivity.create({
              itineraryDayId: dayRecord.id,
              title: activity.title,
              description: activity.description,
              startTime: activity.time,
              location: activity.location,
              images: activity.images || [],
              sortOrder: 1
            }, { transaction });
          }
        }
      }

      await transaction.commit();

      const fullItinerary = await Itinerary.findByPk(itinerary.id, {
        include: [
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

      res.json({ code: 200, data: fullItinerary, message: '更新成功' });
    } catch (error) {
      await transaction.rollback();
      console.error('更新行程失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  updateItineraryStatus: async (req, res) => {
    try {
      const itinerary = await Itinerary.findOne({
        where: { 
          id: req.params.id,
          userId: req.user.id
        }
      });

      if (!itinerary) {
        return res.status(404).json({ code: 404, message: '行程不存在' });
      }

      const { isPublic } = req.body;
      await itinerary.update({ isPublic });

      res.json({ code: 200, data: itinerary, message: '更新成功' });
    } catch (error) {
      console.error('更新行程状态失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  deleteItinerary: async (req, res) => {
    try {
      console.log('删除行程请求:', req.params.id, '用户ID:', req.user.id);
      
      const itinerary = await Itinerary.findOne({
        where: { 
          id: req.params.id,
          userId: req.user.id
        },
        include: [{
          model: ItineraryDay,
          as: 'days'
        }]
      });

      if (!itinerary) {
        console.log('行程不存在或不属于当前用户:', req.params.id, req.user.id);
        return res.status(404).json({ code: 404, message: '行程不存在或您无权删除此行程' });
      }

      console.log('找到行程:', itinerary.id, itinerary.title);
      console.log('关联的天数:', itinerary.days?.length || 0);

      for (const day of itinerary.days || []) {
        console.log('删除天数', day.id, '的活动');
        await ItineraryActivity.destroy({ where: { itineraryDayId: day.id } });
      }
      
      console.log('删除行程天数');
      await ItineraryDay.destroy({ where: { itineraryId: itinerary.id } });
      
      console.log('删除行程');
      await itinerary.destroy();

      res.json({ code: 200, message: '删除成功' });
    } catch (error) {
      console.error('删除行程失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误: ' + error.message });
    }
  },

  togglePublic: async (req, res) => {
    try {
      const itinerary = await Itinerary.findOne({
        where: { 
          id: req.params.id,
          userId: req.user.id
        }
      });

      if (!itinerary) {
        return res.status(404).json({ code: 404, message: '行程不存在' });
      }

      const { isPublic } = req.body;
      await itinerary.update({ isPublic });

      res.json({ code: 200, data: itinerary, message: '更新成功' });
    } catch (error) {
      console.error('更新公开状态失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  addActivity: async (req, res) => {
    try {
      const { itineraryDayId, title, description, startTime, endTime, location, notes, destinationId, images } = req.body;
      
      const activity = await ItineraryActivity.create({
        itineraryDayId,
        title,
        description,
        startTime,
        endTime,
        location,
        notes,
        destinationId,
        images: images || [],
        sortOrder: 1
      });

      res.json({ code: 200, data: activity, message: '添加成功' });
    } catch (error) {
      console.error('添加活动失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  updateActivity: async (req, res) => {
    try {
      const activity = await ItineraryActivity.findByPk(req.params.activityId);
      
      if (!activity) {
        return res.status(404).json({ code: 404, message: '活动不存在' });
      }

      const { title, description, startTime, endTime, location, notes, destinationId, sortOrder, images } = req.body;
      
      await activity.update({
        title: title !== undefined ? title : activity.title,
        description: description !== undefined ? description : activity.description,
        startTime: startTime !== undefined ? startTime : activity.startTime,
        endTime: endTime !== undefined ? endTime : activity.endTime,
        location: location !== undefined ? location : activity.location,
        notes: notes !== undefined ? notes : activity.notes,
        destinationId: destinationId !== undefined ? destinationId : activity.destinationId,
        sortOrder: sortOrder !== undefined ? sortOrder : activity.sortOrder,
        images: images !== undefined ? images : activity.images
      });

      res.json({ code: 200, data: activity, message: '更新成功' });
    } catch (error) {
      console.error('更新活动失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  deleteActivity: async (req, res) => {
    try {
      const activity = await ItineraryActivity.findByPk(req.params.activityId);
      
      if (!activity) {
        return res.status(404).json({ code: 404, message: '活动不存在' });
      }

      await activity.destroy();

      res.json({ code: 200, message: '删除成功' });
    } catch (error) {
      console.error('删除活动失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  reorderActivities: async (req, res) => {
    try {
      const { activities } = req.body;
      
      for (const activity of activities) {
        await ItineraryActivity.update(
          { sortOrder: activity.sortOrder },
          { where: { id: activity.id } }
        );
      }

      res.json({ code: 200, message: '排序成功' });
    } catch (error) {
      console.error('重新排序活动失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  getPublicItineraries: async (req, res) => {
    try {
      const { page = 1, limit = 10, keyword = '', sortBy = 'created_at' } = req.query;
      const offset = (page - 1) * limit;
      
      const where = {
        [Op.or]: [
          { isPublic: true },
          { isOfficial: true }
        ]
      };
      
      if (keyword) {
        where[Op.and] = [
          {
            [Op.or]: [
              { title: { [Op.like]: `%${keyword}%` } },
              { description: { [Op.like]: `%${keyword}%` } }
            ]
          }
        ];
      }
      
      let order = [['created_at', 'DESC']];
      if (sortBy === 'favorites') {
        order = [['favorites', 'DESC']];
      } else if (sortBy === 'shares') {
        order = [['shares', 'DESC']];
      }
      
      const { count, rows } = await Itinerary.findAndCountAll({
        where,
        include: [
          {
            model: User,
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
      console.error('获取公开行程列表失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  getHotItineraries: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const { count, rows } = await Itinerary.findAndCountAll({
        where: {
          isFeatured: true,
          [Op.or]: [
            { isPublic: true },
            { isOfficial: true }
          ]
        },
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'nickname', 'avatar']
          }
        ],
        order: [
          ['favorites', 'DESC'],
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
      console.error('获取热门行程列表失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  getFeaturedItineraries: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const { count, rows } = await Itinerary.findAndCountAll({
        where: {
          [Op.or]: [
            { isPublic: true },
            { isOfficial: true }
          ],
          isFeatured: true
        },
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'nickname', 'avatar']
          }
        ],
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
      console.error('获取推荐行程列表失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  getOfficialItineraries: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const { count, rows } = await Itinerary.findAndCountAll({
        where: { isOfficial: true },
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'nickname', 'avatar']
          }
        ],
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
      console.error('获取官方行程列表失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  getPublicItineraryById: async (req, res) => {
    try {
      const itinerary = await Itinerary.findOne({
        where: { 
          id: req.params.id,
          [Op.or]: [
            { isPublic: true },
            { isOfficial: true }
          ]
        },
        include: [
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
          },
          {
            model: User,
            attributes: ['id', 'username', 'nickname', 'avatar']
          }
        ]
      });

      if (!itinerary) {
        return res.status(404).json({ code: 404, message: '行程不存在' });
      }

      res.json({ code: 200, data: itinerary });
    } catch (error) {
      console.error('获取公开行程详情失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  incrementFavorites: async (req, res) => {
    try {
      const itinerary = await Itinerary.findByPk(req.params.id);
      
      if (!itinerary) {
        return res.status(404).json({ code: 404, message: '行程不存在' });
      }

      itinerary.favorites = (itinerary.favorites || 0) + 1;
      await itinerary.save();

      res.json({ code: 200, data: itinerary, message: '收藏成功' });
    } catch (error) {
      console.error('增加收藏数失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  decrementFavorites: async (req, res) => {
    try {
      const itinerary = await Itinerary.findByPk(req.params.id);
      
      if (!itinerary) {
        return res.status(404).json({ code: 404, message: '行程不存在' });
      }

      itinerary.favorites = Math.max(0, (itinerary.favorites || 0) - 1);
      await itinerary.save();

      res.json({ code: 200, data: itinerary, message: '取消收藏成功' });
    } catch (error) {
      console.error('减少收藏数失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  incrementShares: async (req, res) => {
    try {
      const itinerary = await Itinerary.findByPk(req.params.id);
      
      if (!itinerary) {
        return res.status(404).json({ code: 404, message: '行程不存在' });
      }

      itinerary.shares = (itinerary.shares || 0) + 1;
      await itinerary.save();

      res.json({ code: 200, data: itinerary, message: '分享成功' });
    } catch (error) {
      console.error('增加分享数失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  },

  toggleFavorite: async (req, res) => {
    try {
      const itinerary = await Itinerary.findByPk(req.params.id);
      
      if (!itinerary) {
        return res.status(404).json({ code: 404, message: '行程不存在' });
      }

      itinerary.favorites = (itinerary.favorites || 0) + 1;
      await itinerary.save();

      res.json({ code: 200, data: itinerary, message: '收藏成功' });
    } catch (error) {
      console.error('收藏失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }
};

module.exports = itineraryController;