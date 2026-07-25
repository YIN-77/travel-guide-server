const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReviewLike = sequelize.define('ReviewLike', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  review_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'review_likes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['review_id', 'user_id']
    }
  ]
});

module.exports = ReviewLike;
