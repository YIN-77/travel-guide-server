const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Serverless 环境使用 /tmp，传统环境使用 uploads 目录
const isServerless = !!process.env.VERCEL;
const uploadDir = isServerless
  ? '/tmp/uploads'
  : path.join(__dirname, '../uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  console.warn('无法创建上传目录:', e.message);
}

// 配置视频文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${ext}`);
  }
});

// 文件过滤器 - 只允许视频格式
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-flv'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只支持 MP4、WebM、OGG、AVI、FLV 格式的视频'), false);
  }
};

const uploadVideo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

module.exports = uploadVideo;
