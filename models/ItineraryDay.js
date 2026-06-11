const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ItineraryDay = sequelize.define('ItineraryDay', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  itineraryId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  dayNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'itinerary_days',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

module.exports = ItineraryDay;
