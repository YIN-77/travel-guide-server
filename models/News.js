const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const News = sequelize.define('News', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '资讯标题'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '资讯摘要'
  },
  content: {
    type: DataTypes.TEXT,
    comment: '资讯正文内容'
  },
  cover_image: {
    type: DataTypes.STRING(500),
    comment: '封面图片'
  },
  category: {
    type: DataTypes.STRING(50),
    comment: '分类：行业动态、签证政策、目的地推荐、活动预告、特惠信息'
  },
  author: {
    type: DataTypes.STRING(100),
    comment: '作者/来源'
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '浏览量'
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '点赞数'
  },
  favorites: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '收藏数'
  },
  shares: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '分享数'
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'published',
    comment: '状态：草稿、已发布、已归档'
  },
  is_top: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否置顶'
  },
  published_at: {
    type: DataTypes.DATE,
    comment: '发布时间'
  }
}, {
  tableName: 'news',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = News;
