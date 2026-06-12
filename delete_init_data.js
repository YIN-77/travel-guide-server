const { sequelize } = require('./models');
const { Destination, Guide, News, Itinerary } = require('./models');

// 初始化脚本创建的数据名称列表
const initDestinationNames = [
  '北京故宫', '上海外滩', '杭州西湖', '西安兵马俑', 
  '成都大熊猫基地', '张家界天门山', '三亚亚龙湾', '丽江古城'
];

const initGuideTitles = [
  '北京三日游最佳路线', '杭州西湖深度游指南', '张家界自驾游攻略'
];

const initNewsTitles = [
  '2024年旅游趋势报告发布', '多地推出旅游优惠政策', '暑期旅游旺季即将到来'
];

const initItineraryTitles = [
  '云南七日深度游', '四川熊猫之旅', '海南三亚休闲游',
  '西藏珠峰之旅', '新疆伊犁草原行', '厦门鼓浪屿浪漫之旅'
];

async function deleteInitData() {
  try {
    console.log('正在连接数据库...');
    
    // 删除初始化的景点
    console.log('\n正在删除初始化景点...');
    for (const name of initDestinationNames) {
      const dest = await Destination.findOne({ where: { name } });
      if (dest) {
        await dest.destroy();
        console.log(`已删除景点: ${name}`);
      } else {
        console.log(`景点 ${name} 不存在，跳过`);
      }
    }
    
    // 删除初始化的攻略
    console.log('\n正在删除初始化攻略...');
    for (const title of initGuideTitles) {
      const guide = await Guide.findOne({ where: { title } });
      if (guide) {
        await guide.destroy();
        console.log(`已删除攻略: ${title}`);
      } else {
        console.log(`攻略 ${title} 不存在，跳过`);
      }
    }
    
    // 删除初始化的资讯
    console.log('\n正在删除初始化资讯...');
    for (const title of initNewsTitles) {
      const news = await News.findOne({ where: { title } });
      if (news) {
        await news.destroy();
        console.log(`已删除资讯: ${title}`);
      } else {
        console.log(`资讯 ${title} 不存在，跳过`);
      }
    }
    
    // 删除初始化的行程
    console.log('\n正在删除初始化行程...');
    for (const title of initItineraryTitles) {
      const itinerary = await Itinerary.findOne({ where: { title } });
      if (itinerary) {
        await itinerary.destroy();
        console.log(`已删除行程: ${title}`);
      } else {
        console.log(`行程 ${title} 不存在，跳过`);
      }
    }
    
    console.log('\n✅ 初始化数据删除完成！');
    console.log('您之前添加的数据已保留。');
    process.exit(0);
  } catch (error) {
    console.error('❌ 删除初始化数据失败:', error);
    process.exit(1);
  }
}

deleteInitData();