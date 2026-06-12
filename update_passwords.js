const { sequelize } = require('./models');
const { Admin, User } = require('./models');

async function updatePasswords() {
  try {
    console.log('正在连接数据库...');
    
    // 更新管理员密码
    console.log('\n正在更新管理员密码...');
    const admin = await Admin.findOne({ where: { username: 'admin' } });
    if (admin) {
      admin.password = '$2a$10$qxGsrTrR19/OD7/IIJfwT.Jh2A7HCg7yok.1Y2Nj3vpvtuAbeBqMW';
      await admin.save();
      console.log('管理员密码更新成功');
    } else {
      console.log('管理员账号不存在');
    }

    // 更新用户密码
    console.log('\n正在更新用户密码...');
    const user = await User.findOne({ where: { username: 'user' } });
    if (user) {
      user.password = '$2a$10$LJ9WWPhVZYStg/OSc9VC5.Q078L44uNOv.HH178rNoiE7bGm8SO1u';
      await user.save();
      console.log('用户密码更新成功');
    } else {
      console.log('用户账号不存在');
    }

    console.log('\n✅ 密码更新完成！');
    console.log('管理员账号: admin / admin123');
    console.log('用户账号: user / user123');
    process.exit(0);
  } catch (error) {
    console.error('❌ 密码更新失败:', error);
    process.exit(1);
  }
}

updatePasswords();