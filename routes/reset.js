const express = require('express');
const router = express.Router();
const { Admin, User } = require('../models');

router.get('/env', (req, res) => {
  res.json({
    code: 200,
    message: '环境变量检查',
    data: {
      JWT_SECRET: process.env.JWT_SECRET ? '存在' : '缺失',
      MYSQLHOST: process.env.MYSQLHOST ? '存在' : '缺失',
      MYSQLUSER: process.env.MYSQLUSER ? '存在' : '缺失',
      MYSQLPASSWORD: process.env.MYSQLPASSWORD ? '存在' : '缺失',
      MYSQLDATABASE: process.env.MYSQLDATABASE ? '存在' : '缺失'
    }
  });
});

router.post('/password', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '缺少参数', data: null });
    }

    const admin = await Admin.findOne({ where: { username } });
    if (admin) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      admin.password = hashedPassword;
      await admin.save();
      return res.json({ code: 200, message: '密码更新成功', data: null });
    }

    const user = await User.findOne({ where: { username } });
    if (user) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();
      return res.json({ code: 200, message: '密码更新成功', data: null });
    }

    return res.status(404).json({ code: 404, message: '用户不存在', data: null });
  } catch (error) {
    console.error('密码更新失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
  }
});

router.post('/test-create', async (req, res) => {
  try {
    const { Itinerary, ItineraryDay, ItineraryActivity } = require('../models');
    const { title, description, daysCount = 1, isPublic = true, isFeatured = false, coverImage, days } = req.body;
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (daysCount - 1));
    
    const itinerary = await Itinerary.create({
      userId: 0,
      title: title || 'test',
      description: description || '',
      startDate,
      endDate,
      isPublic: true,
      isFeatured: isFeatured || false,
      isOfficial: true,
      coverImage: coverImage || '',
      favorites: 0,
      shares: 0
    });

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
      });
      createdDays.push(day);
      dayNumber++;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (days && Array.isArray(days)) {
      for (const dayData of days) {
        const dayRecord = createdDays.find(d => d.dayNumber === dayData.dayNumber);
        if (dayRecord && dayData.activities && Array.isArray(dayData.activities)) {
          for (let i = 0; i < dayData.activities.length; i++) {
            const activity = dayData.activities[i];
            await ItineraryActivity.create({
              itineraryDayId: dayRecord.id,
              title: activity.title,
              description: activity.description,
              startTime: activity.time || activity.startTime,
              location: activity.location,
              sortOrder: i + 1
            });
          }
        }
      }
    }

    res.json({ code: 200, message: '创建成功', data: itinerary });
  } catch (error) {
    console.error('创建行程失败:', error);
    res.status(500).json({ code: 500, message: error.message, stack: error.stack });
  }
});

module.exports = router;