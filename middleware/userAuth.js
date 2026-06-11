const jwt = require('jsonwebtoken');
require('dotenv').config();

const userAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log('用户认证请求:', req.method, req.path);
  console.log('Authorization header存在:', !!authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('未提供Token');
    return res.status(401).json({
      code: 401,
      message: '未授权，请重新登录',
      data: null
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token验证成功，用户ID:', decoded.id);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('Token验证失败:', error.message);
    return res.status(401).json({
      code: 401,
      message: 'Token已过期，请重新登录',
      data: null
    });
  }
};

module.exports = userAuthMiddleware;
