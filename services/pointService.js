const { User } = require('../models');

// 等级名称映射
const levelNames = {
  1: '初级旅行者',
  2: '背包客',
  3: '旅行达人',
  4: '资深玩家',
  5: '环球旅行家',
  6: '至尊旅行家'
};

// 等级对应的积分范围
const levelThresholds = [0, 100, 300, 600, 1000, 2000];

// 获取等级名称
function getLevelName(level) {
  return levelNames[level] || '未知等级';
}

// 根据积分计算等级
function calculateLevel(points) {
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (points >= levelThresholds[i]) {
      return i + 1;
    }
  }
  return 1;
}

// 获取下一级所需积分和进度
function getLevelProgress(points) {
  const currentLevel = calculateLevel(points);
  if (currentLevel >= 6) {
    return { currentLevel, nextLevelPoints: null, progress: 100 };
  }
  const currentMin = levelThresholds[currentLevel - 1];
  const nextMin = levelThresholds[currentLevel];
  const progress = Math.floor(((points - currentMin) / (nextMin - currentMin)) * 100);
  return {
    currentLevel,
    nextLevelPoints: nextMin,
    currentMinPoints: currentMin,
    progress: Math.min(progress, 100)
  };
}

// 增加积分并自动升级
async function addPoints(userId, points) {
  const user = await User.findByPk(userId);
  if (!user) return null;

  const currentPoints = user.points || 0;
  const newPoints = currentPoints + points;
  const newLevel = calculateLevel(newPoints);
  const oldLevel = user.level || 1;

  await user.update({
    points: newPoints,
    level: newLevel
  });

  return {
    points: newPoints,
    level: newLevel,
    levelUp: newLevel > oldLevel,
    pointsAdded: points,
    oldLevel,
    newLevel
  };
}

// 检查今日是否已登录（用于每日登录奖励）
async function addDailyLoginPoints(userId) {
  const user = await User.findByPk(userId);
  if (!user) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastLoginDate = user.last_login_date ? new Date(user.last_login_date) : null;
  if (lastLoginDate) {
    lastLoginDate.setHours(0, 0, 0, 0);
  }

  if (lastLoginDate && lastLoginDate.getTime() === today.getTime()) {
    // 今天已经登录过，不重复加积分
    return null;
  }

  // 更新最后登录日期并加积分
  const currentPoints = user.points || 0;
  const newPoints = currentPoints + 1;
  const newLevel = calculateLevel(newPoints);
  const oldLevel = user.level || 1;

  await user.update({
    points: newPoints,
    level: newLevel,
    last_login_date: new Date()
  });

  return {
    points: newPoints,
    level: newLevel,
    levelUp: newLevel > oldLevel,
    pointsAdded: 1,
    oldLevel,
    newLevel
  };
}

module.exports = {
  addPoints,
  getLevelName,
  calculateLevel,
  getLevelProgress,
  addDailyLoginPoints,
  levelNames,
  levelThresholds
};
