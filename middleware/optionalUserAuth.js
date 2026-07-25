const jwt = require('jsonwebtoken');
require('dotenv').config();

const optionalUserAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
    } catch (error) {
      // Token无效或过期时，不阻止请求，只是不设置req.user
    }
  }

  next();
};

module.exports = optionalUserAuthMiddleware;
