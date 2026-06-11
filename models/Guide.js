const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Guide = sequelize.define('Guide', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '攻略标题'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '攻略描述'
  },
  content: {
    type: DataTypes.TEXT,
    comment: '攻略正文内容'
  },
  cover_image: {
    type: DataTypes.STRING(500),
    comment: '封面图片'
  },
  author_id: {
    type: DataTypes.INTEGER,
    comment: '作者ID'
  },
  author_name: {
    type: DataTypes.STRING(100),
    comment: '作者名称'
  },
  tags: {
    type: DataTypes.STRING(500),
    comment: '标签，逗号分隔'
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
  comments: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '评论数'
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'published',
    comment: '状态：草稿、已发布、已归档'
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否推荐'
  },
  is_official: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否官方攻略'
  },
  published_at: {
    type: DataTypes.DATE,
    comment: '发布时间'
  }
}, {
  tableName: 'guides',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Guide;
