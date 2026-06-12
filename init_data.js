const { sequelize } = require('./models');
const { User, Admin } = require('./models');

async function initData() {
  try {
    console.log('正在检查管理员账号...');
    const adminExists = await Admin.findOne({ where: { username: 'admin' } });
    const correctAdminPassword = '$2a$10$qxGsrTrR19/OD7/IIJfwT.Jh2A7HCg7yok.1Y2Nj3vpvtuAbeBqMW';
    if (!adminExists) {
      await Admin.create({
        username: 'admin',
        password: correctAdminPassword,
        email: 'admin@travel.com'
      });
      console.log('管理员账号创建成功');
    } else {
      if (adminExists.password !== correctAdminPassword) {
        adminExists.password = correctAdminPassword;
        await adminExists.save();
        console.log('管理员密码已更新');
      } else {
        console.log('管理员账号已存在且密码正确');
      }
    }

    console.log('正在检查用户账号...');
    const userExists = await User.findOne({ where: { username: 'user' } });
    const correctUserPassword = '$2a$10$LJ9WWPhVZYStg/OSc9VC5.Q078L44uNOv.HH178rNoiE7bGm8SO1u';
    if (!userExists) {
      await User.create({
        username: 'user',
        password: correctUserPassword,
        email: 'user@travel.com',
        nickname: '游客'
      });
      console.log('测试用户创建成功');
    } else {
      if (userExists.password !== correctUserPassword) {
        userExists.password = correctUserPassword;
        await userExists.save();
        console.log('用户密码已更新');
      } else {
        console.log('测试用户已存在且密码正确');
      }
    }

    console.log('初始化完成');
  } catch (error) {
    console.error('初始化失败:', error);
    throw error;
  }
}

module.exports = initData;

if (require.main === module) {
  initData().catch(err => {
    console.error(err);
    process.exit(1);
  });
}