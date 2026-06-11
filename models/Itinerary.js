const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Itinerary = sequelize.define('Itinerary', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'userId'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'startDate'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'endDate'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'isPublic'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_featured'
  },
  isOfficial: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_official'
  },
  favorites: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  shares: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  coverImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'coverImage'
  }
}, {
  tableName: 'itineraries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false
});

module.exports = Itinerary;