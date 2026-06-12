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

module.exports = router;