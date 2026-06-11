const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('like', 'favorite', 'comment', 'reply', 'system'),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  relatedId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  relatedType: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fromUserId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  underscored: true // 关键配置：自动将驼峰命名转换为下划线
});

module.exports = Notification;
