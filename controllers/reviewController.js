const { Review, Destination, User, ReviewLike } = require('../models');
const pointService = require('../services/pointService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置评论图片上传
const reviewImageDir = path.join(__dirname, '../uploads/review_images');
try {
  if (!fs.existsSync(reviewImageDir)) {
    fs.mkdirSync(reviewImageDir, { recursive: true });
  }
} catch (e) {
  console.warn('无法创建评论图片目录:', e.message);
}

const reviewImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, reviewImageDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `review-${uniqueSuffix}${ext}`);
  }
});

const reviewImageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只支持 JPG、PNG、GIF、WebP 格式的图片'), false);
  }
};

const reviewImageUpload = multer({
  storage: reviewImageStorage,
  fileFilter: reviewImageFilter,
  limits: {
    fileSize: 3 * 1024 * 1024 // 3MB
  }
}).single('image');

// 获取评论列表（管理员）
exports.getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const reviews = await Review.findAndCountAll({
      limit: parseInt(limit),
      offset: offset,
      order: [['created_at', 'DESC']],
      include: [{ model: Destination, attributes: ['id', 'name'] }]
    });

    res.json({
      code: 200,
      message: 'success',
      data: {
        list: reviews.rows,
        total: reviews.count,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// 获取景点评论（公开）- 支持嵌套评论
exports.getDestinationReviews = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reviews = await Review.findAll({
      where: { destination_id: id, parent_id: null },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'nickname', 'avatar']
        },
        {
          model: Review,
          as: 'replies',
          separate: true,
          order: [['created_at', 'ASC']],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'nickname', 'avatar']
            }
          ]
        }
      ]
    });

    res.json({
      code: 200,
      message: 'success',
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// 添加评论（公开）
exports.createReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_name, content, rating, images } = req.body;

    if (!user_name || !content) {
      return res.status(400).json({
        code: 400,
        message: '用户名和评论内容不能为空',
        data: null
      });
    }

    const destination = await Destination.findByPk(id);

    if (!destination) {
      return res.status(404).json({
        code: 404,
        message: '景点不存在',
        data: null
      });
    }

    const review = await Review.create({
      destination_id: id,
      user_name,
      content,
      rating: rating || 5,
      images: images || []
    });

    res.status(201).json({
      code: 201,
      message: '评论添加成功',
      data: review
    });

    // 发布评论 +5分
    if (req.user && req.user.id) {
      pointService.addPoints(req.user.id, 5).catch(() => {});
    }
  } catch (error) {
    next(error);
  }
};

// 删除评论（管理员）
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        code: 404,
        message: '评论不存在',
        data: null
      });
    }

    await review.destroy();

    res.json({
      code: 200,
      message: '删除成功',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// 回复评论
exports.replyToReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, images } = req.body;
    const userId = req.user.id;
    const user = req.user;

    if (!content) {
      return res.status(400).json({
        code: 400,
        message: '回复内容不能为空',
        data: null
      });
    }

    const parentReview = await Review.findByPk(id);

    if (!parentReview) {
      return res.status(404).json({
        code: 404,
        message: '原评论不存在',
        data: null
      });
    }

    const reply = await Review.create({
      destination_id: parentReview.destination_id,
      parent_id: id,
      user_id: userId,
      user_name: user.nickname || user.username,
      content,
      rating: null,
      images: images || []
    });

    // 包含用户信息返回
    const replyWithUser = await Review.findByPk(reply.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'nickname', 'avatar']
      }]
    });

    res.status(201).json({
      code: 200,
      message: '回复成功',
      data: replyWithUser
    });
  } catch (error) {
    next(error);
  }
};

// 点赞评论（切换效果）
exports.likeReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        code: 404,
        message: '评论不存在',
        data: null
      });
    }

    // 检查是否已点赞
    const existingLike = await ReviewLike.findOne({
      where: { review_id: id, user_id: userId }
    });

    if (existingLike) {
      // 取消点赞
      await existingLike.destroy();
      review.like_count = Math.max(0, review.like_count - 1);
      await review.save();

      return res.json({
        code: 200,
        message: '已取消点赞',
        data: { liked: false, like_count: review.like_count }
      });
    } else {
      // 添加点赞
      await ReviewLike.create({
        review_id: id,
        user_id: userId
      });
      review.like_count = review.like_count + 1;
      await review.save();

      return res.json({
        code: 200,
        message: '点赞成功',
        data: { liked: true, like_count: review.like_count }
      });
    }
  } catch (error) {
    next(error);
  }
};

// 上传评论图片
exports.uploadReviewImage = (req, res, next) => {
  reviewImageUpload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          code: 400,
          message: '图片大小不能超过 3MB',
          data: null
        });
      }
      if (err.message && err.message.includes('只支持')) {
        return res.status(400).json({
          code: 400,
          message: err.message,
          data: null
        });
      }
      return res.status(500).json({
        code: 500,
        message: '上传失败',
        data: null
      });
    }

    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请选择图片',
        data: null
      });
    }

    const imageUrl = `/uploads/review_images/${req.file.filename}`;

    res.json({
      code: 200,
      message: '上传成功',
      data: { url: imageUrl }
    });
  });
};
