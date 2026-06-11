const sequelize = require('../config/database');
const Admin = require('./Admin');
const Destination = require('./Destination');
const Tag = require('./Tag');
const Review = require('./Review');
const User = require('./User');
const Favorite = require('./Favorite');
const Like = require('./Like');
const Notification = require('./Notification');
const Itinerary = require('./Itinerary');
const ItineraryDay = require('./ItineraryDay');
const ItineraryActivity = require('./ItineraryActivity');
const Guide = require('./Guide');
const News = require('./News');
const Interaction = require('./Interaction');

// 定义关联关系
Destination.belongsToMany(Tag, {
  through: 'destination_tags',
  foreignKey: 'destination_id',
  otherKey: 'tag_id',
  timestamps: false
});

Tag.belongsToMany(Destination, {
  through: 'destination_tags',
  foreignKey: 'tag_id',
  otherKey: 'destination_id',
  timestamps: false
});

Review.belongsTo(Destination, {
  foreignKey: 'destination_id'
});

Review.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Destination.hasMany(Review, {
  foreignKey: 'destination_id'
});

User.hasMany(Review, {
  foreignKey: 'user_id',
  as: 'userReviews'
});

// 收藏关系
User.belongsToMany(Destination, {
  through: Favorite,
  foreignKey: 'user_id',
  otherKey: 'destination_id',
  as: 'favoriteDestinations'
});

Destination.belongsToMany(User, {
  through: Favorite,
  foreignKey: 'destination_id',
  otherKey: 'user_id',
  as: 'favoritedByUsers'
});

User.hasMany(Favorite, { foreignKey: 'user_id' });
Favorite.belongsTo(User, { foreignKey: 'user_id' });
Favorite.belongsTo(Destination, { foreignKey: 'destination_id' });

// 点赞关系
User.belongsToMany(Destination, {
  through: Like,
  foreignKey: 'user_id',
  otherKey: 'destination_id',
  as: 'likedDestinations'
});

Destination.belongsToMany(User, {
  through: Like,
  foreignKey: 'destination_id',
  otherKey: 'user_id',
  as: 'likedByUsers'
});

User.hasMany(Like, { foreignKey: 'user_id' });
Like.belongsTo(User, { foreignKey: 'user_id' });
Like.belongsTo(Destination, { foreignKey: 'destination_id' });

Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Notification.belongsTo(User, {
  foreignKey: 'fromUserId',
  as: 'fromUser'
});

// 行程关联关系
Itinerary.belongsTo(User, { foreignKey: 'userId', allowNull: true });
User.hasMany(Itinerary, { foreignKey: 'userId', allowNull: true });

ItineraryDay.belongsTo(Itinerary, { foreignKey: 'itineraryId' });
Itinerary.hasMany(ItineraryDay, { foreignKey: 'itineraryId', as: 'days' });

ItineraryActivity.belongsTo(ItineraryDay, { foreignKey: 'itineraryDayId' });
ItineraryDay.hasMany(ItineraryActivity, { foreignKey: 'itineraryDayId', as: 'activities' });

ItineraryActivity.belongsTo(Destination, { foreignKey: 'destinationId' });

// 攻略关联关系
Guide.belongsTo(User, { 
  foreignKey: 'author_id',
  as: 'author',
  constraints: false
});

User.hasMany(Guide, { 
  foreignKey: 'author_id',
  as: 'guides',
  constraints: false
});

module.exports = {
  sequelize,
  Admin,
  Destination,
  Tag,
  Review,
  User,
  Favorite,
  Like,
  Notification,
  Itinerary,
  ItineraryDay,
  ItineraryActivity,
  Guide,
  News,
  Interaction
};
