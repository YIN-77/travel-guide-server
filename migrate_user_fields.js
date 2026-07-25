require('dotenv').config();
const { sequelize } = require('./models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 为 users 表添加缺失字段
    console.log('正在为 users 表添加 points 字段...');
    await sequelize.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0`
    );
    console.log('✓ points 字段添加成功');

    console.log('正在为 users 表添加 level 字段...');
    await sequelize.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1`
    );
    console.log('✓ level 字段添加成功');

    console.log('正在为 users 表添加 last_login_date 字段...');
    await sequelize.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_date TIMESTAMPTZ`
    );
    console.log('✓ last_login_date 字段添加成功');

    // 为现有用户设置默认值
    await sequelize.query(
      `UPDATE users SET points = 0 WHERE points IS NULL`
    );
    await sequelize.query(
      `UPDATE users SET level = 1 WHERE level IS NULL`
    );
    console.log('✓ 现有用户默认值设置完成');

    console.log('\n数据库迁移完成！');
    process.exit(0);
  } catch (error) {
    console.error('迁移失败:', error.message);
    process.exit(1);
  }
})();
