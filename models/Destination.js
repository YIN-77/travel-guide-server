const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Destination = sequelize.define('Destination', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  image: {
    type: DataTypes.STRING(500)
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  video: {
    type: DataTypes.STRING(500),
    defaultValue: ''
  },
  location: {
    type: DataTypes.STRING(100)
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0
  },
  // 新增字段：地图相关
  latitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true
  },
  // 新增字段：景点增强信息
  openingHours: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  ticketPrice: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  transport: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bestTime: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  duration: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tips: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'destinations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Destination;
