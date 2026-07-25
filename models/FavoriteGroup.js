const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FavoriteGroup = sequelize.define('FavoriteGroup', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '收藏夹名称'
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否默认收藏夹'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序'
  },
  cover_image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '收藏夹封面图'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'favorite_groups',
  timestamps: false
});

module.exports = FavoriteGroup;
