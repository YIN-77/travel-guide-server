const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadVideo = require('../middleware/uploadVideo');
const path = require('path');

// 图片上传接口
router.post('/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请选择要上传的图片',
        data: null
      });
    }

    // 返回图片URL
    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      code: 200,
      message: '上传成功',
      data: {
        url: imageUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '上传失败',
      data: null
    });
  }
});

// 视频上传接口
router.post('/video', uploadVideo.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请选择要上传的视频',
        data: null
      });
    }

    // 返回视频URL
    const videoUrl = `/uploads/${req.file.filename}`;

    res.json({
      code: 200,
      message: '上传成功',
      data: {
        url: videoUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '上传失败',
      data: null
    });
  }
});

module.exports = router;
