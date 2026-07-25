const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const pointService = require('../services/pointService');
require('dotenv').config();

// 用户注册
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, nickname } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名、邮箱和密码不能为空',
        data: null
      });
    }

    // 检查用户名是否已存在
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({
        code: 400,
        message: '用户名已存在',
        data: null
      });
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({
        code: 400,
        message: '邮箱已存在',
        data: null
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      nickname: nickname || username
    });

    // 生成token
    const token = jwt.sign(
      { id: user.id, username: user.username, nickname: user.nickname },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      code: 200,
      message: '注册成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar,
          bio: user.bio,
          points: user.points || 0,
          level: user.level || 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// 用户登录
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空',
        data: null
      });
    }

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
        data: null
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
        data: null
      });
    }

    // 每日登录积分（每天最多1次），不阻塞登录主流程
    try {
      await pointService.addDailyLoginPoints(user.id);
    } catch (err) {
      console.error('每日登录积分发放失败（不影响登录）:', err.message);
    }

    // 重新获取用户数据（积分可能已更新），如果失败使用原始用户
    let updatedUser = user;
    try {
      updatedUser = await User.findByPk(user.id) || user;
    } catch (err) {
      console.error('获取更新后用户数据失败，使用原始数据:', err.message);
    }

    const token = jwt.sign(
      { id: updatedUser.id, username: updatedUser.username, nickname: updatedUser.nickname },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          nickname: updatedUser.nickname,
          avatar: updatedUser.avatar,
          bio: updatedUser.bio,
          points: updatedUser.points || 0,
          level: updatedUser.level || 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户信息
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'nickname', 'avatar', 'bio', 'created_at', 'points', 'level', 'last_login_date']
    });

    res.json({
      code: 200,
      message: 'success',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// 更新用户信息
exports.updateProfile = async (req, res, next) => {
  try {
    const { nickname, bio, avatar } = req.body;
    const user = await User.findByPk(req.user.id);

    await user.update({
      nickname: nickname || user.nickname,
      bio: bio !== undefined ? bio : user.bio,
      avatar: avatar !== undefined ? avatar : user.avatar
    });

    res.json({
      code: 200,
      message: '更新成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    next(error);
  }
};

// 修改密码
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        code: 400,
        message: '请填写所有字段',
        data: null
      });
    }

    const user = await User.findByPk(req.user.id);

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        message: '原密码错误',
        data: null
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    res.json({
      code: 200,
      message: '密码修改成功',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
