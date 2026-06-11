const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Interaction = sequelize.define('Interaction', {
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
  target_type: {
    type: DataTypes.ENUM('destination', 'guide', 'news', 'itinerary'),
    allowNull: false,
    comment: '目标类型：景点/攻略/资讯/行程'
  },
  target_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '目标ID'
  },
  interaction_type: {
    type: DataTypes.ENUM('like', 'favorite', 'share'),
    allowNull: false,
    comment: '交互类型：点赞/收藏/分享'
  }
}, {
  tableName: 'interactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'target_type', 'target_id', 'interaction_type'],
      name: 'unique_user_interaction'
    }
  ]
});

module.exports = Interaction;