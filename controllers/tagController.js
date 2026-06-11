const { Tag, Destination } = require('../models');

// 获取所有标签
exports.getTags = async (req, res, next) => {
  try {
    const tags = await Tag.findAll({
      order: [['id', 'ASC']]
    });

    res.json({
      code: 200,
      message: 'success',
      data: tags
    });
  } catch (error) {
    next(error);
  }
};

// 创建标签
exports.createTag = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        code: 400,
        message: '标签名称不能为空',
        data: null
      });
    }

    const tag = await Tag.create({ name });

    res.status(201).json({
      code: 201,
      message: '创建成功',
      data: tag
    });
  } catch (error) {
    next(error);
  }
};

// 更新标签
exports.updateTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const tag = await Tag.findByPk(id);

    if (!tag) {
      return res.status(404).json({
        code: 404,
        message: '标签不存在',
        data: null
      });
    }

    await tag.update({ name });

    res.json({
      code: 200,
      message: '更新成功',
      data: tag
    });
  } catch (error) {
    next(error);
  }
};

// 删除标签
exports.deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findByPk(id);

    if (!tag) {
      return res.status(404).json({
        code: 404,
        message: '标签不存在',
        data: null
      });
    }

    await tag.destroy();

    res.json({
      code: 200,
      message: '删除成功',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
