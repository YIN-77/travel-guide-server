const { FavoriteGroup, Favorite, Interaction, Destination } = require('../models');

// 获取用户的所有收藏夹
exports.getGroups = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const groups = await FavoriteGroup.findAll({
      where: { user_id: userId },
      order: [
        ['is_default', 'DESC'],
        ['sort_order', 'ASC'],
        ['created_at', 'ASC']
      ]
    });

    // 获取每个分组中的收藏数量
    const groupsWithCount = await Promise.all(groups.map(async (group) => {
      const count = await Interaction.count({
        where: {
          user_id: userId,
          interaction_type: 'favorite',
          group_id: group.id
        }
      });
      return {
        ...group.toJSON(),
        favoriteCount: count
      };
    }));

    res.json({
      code: 200,
      data: groupsWithCount
    });
  } catch (error) {
    next(error);
  }
};

// 创建收藏夹
exports.createGroup = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ code: 400, message: '收藏夹名称不能为空', data: null });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({ code: 400, message: '收藏夹名称不能超过50个字符', data: null });
    }

    // 获取当前最大排序值
    const maxOrder = await FavoriteGroup.max('sort_order', {
      where: { user_id: userId }
    });

    const group = await FavoriteGroup.create({
      user_id: userId,
      name: name.trim(),
      is_default: false,
      sort_order: (maxOrder || 0) + 1
    });

    res.status(201).json({
      code: 200,
      message: '创建成功',
      data: group
    });
  } catch (error) {
    next(error);
  }
};

// 更新收藏夹名称
exports.updateGroup = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ code: 400, message: '收藏夹名称不能为空', data: null });
    }

    const group = await FavoriteGroup.findOne({
      where: { id, user_id: userId }
    });

    if (!group) {
      return res.status(404).json({ code: 404, message: '收藏夹不存在', data: null });
    }

    await group.update({ name: name.trim() });

    res.json({
      code: 200,
      message: '更新成功',
      data: group
    });
  } catch (error) {
    next(error);
  }
};

// 删除收藏夹（收藏移入默认收藏夹）
exports.deleteGroup = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const group = await FavoriteGroup.findOne({
      where: { id, user_id: userId }
    });

    if (!group) {
      return res.status(404).json({ code: 404, message: '收藏夹不存在', data: null });
    }

    if (group.is_default) {
      return res.status(400).json({ code: 400, message: '不能删除默认收藏夹', data: null });
    }

    // 找到或创建默认收藏夹
    let defaultGroup = await FavoriteGroup.findOne({
      where: { user_id: userId, is_default: true }
    });

    if (!defaultGroup) {
      defaultGroup = await FavoriteGroup.create({
        user_id: userId,
        name: '默认收藏夹',
        is_default: true,
        sort_order: 0
      });
    }

    // 将该分组下的收藏移到默认收藏夹
    await Interaction.update(
      { group_id: defaultGroup.id },
      { where: { user_id: userId, interaction_type: 'favorite', group_id: id } }
    );

    await group.destroy();

    res.json({
      code: 200,
      message: '删除成功，收藏已移入默认收藏夹',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// 移动收藏到指定分组
exports.addToGroup = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { favoriteId, groupId } = req.body;

    if (!favoriteId || !groupId) {
      return res.status(400).json({ code: 400, message: '收藏ID和分组ID不能为空', data: null });
    }

    // 验证分组属于当前用户
    const group = await FavoriteGroup.findOne({
      where: { id: groupId, user_id: userId }
    });

    if (!group) {
      return res.status(404).json({ code: 404, message: '收藏夹不存在', data: null });
    }

    // 验证收藏属于当前用户
    const favorite = await Interaction.findOne({
      where: { id: favoriteId, user_id: userId, interaction_type: 'favorite' }
    });

    if (!favorite) {
      return res.status(404).json({ code: 404, message: '收藏记录不存在', data: null });
    }

    await favorite.update({ group_id: groupId });

    res.json({
      code: 200,
      message: '移动成功',
      data: favorite
    });
  } catch (error) {
    next(error);
  }
};
