const { sequelize } = require('./models');
const { Destination, Guide, News, Itinerary, User, Admin, Tag } = require('./models');

async function initData() {
  try {
    console.log('正在同步数据库表结构...');
    await sequelize.sync({ force: false });
    console.log('数据库表结构同步完成');

    console.log('\n正在初始化管理员账号...');
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

    console.log('\n正在初始化用户...');
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

    console.log('\n正在初始化标签...');
    const tags = ['热门', '推荐', '自由行', '跟团游', '自驾游', '美食', '亲子', '摄影', '徒步', '海岛', '古镇'];
    for (const tagName of tags) {
      const tagExists = await Tag.findOne({ where: { name: tagName } });
      if (!tagExists) {
        await Tag.create({ name: tagName });
        console.log(`标签 "${tagName}" 创建成功`);
      }
    }
    console.log('标签初始化完成');

    console.log('\n正在初始化景点数据...');
    const destinations = [
      {
        name: '北京故宫',
        description: '世界上现存规模最大、保存最为完整的木质结构古建筑群',
        image: 'https://images.unsplash.com/photo-1585543805890-6051f7829f98?w=800',
        location: '北京市东城区',
        rating: 4.9,
        likesCount: 12580,
        views: 58920
      },
      {
        name: '上海外滩',
        description: '上海最具代表性的城市景观之一',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        location: '上海市黄浦区',
        rating: 4.8,
        likesCount: 9856,
        views: 45620
      },
      {
        name: '杭州西湖',
        description: '人间天堂，中国十大名胜之一',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        location: '浙江省杭州市',
        rating: 4.9,
        likesCount: 15320,
        views: 78960
      },
      {
        name: '西安兵马俑',
        description: '世界八大奇迹之一，秦始皇陵的陪葬坑',
        image: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=800',
        location: '陕西省西安市',
        rating: 4.8,
        likesCount: 11250,
        views: 62350
      },
      {
        name: '成都大熊猫基地',
        description: '世界著名的大熊猫保护研究机构',
        image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800',
        location: '四川省成都市',
        rating: 4.7,
        likesCount: 8960,
        views: 41250
      },
      {
        name: '张家界天门山',
        description: '以其独特的石英砂岩峰林地貌闻名',
        image: 'https://images.unsplash.com/photo-1544551763-d2c5e14b5bfc?w=800',
        location: '湖南省张家界市',
        rating: 4.8,
        likesCount: 10230,
        views: 55680
      },
      {
        name: '三亚亚龙湾',
        description: '中国最美丽的海湾之一',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        location: '海南省三亚市',
        rating: 4.7,
        likesCount: 9680,
        views: 48950
      },
      {
        name: '丽江古城',
        description: '世界文化遗产，保存完好的少数民族古城',
        image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=800',
        location: '云南省丽江市',
        rating: 4.8,
        likesCount: 13450,
        views: 67890
      }
    ];

    for (const dest of destinations) {
      const exists = await Destination.findOne({ where: { name: dest.name } });
      if (!exists) {
        await Destination.create(dest);
        console.log(`景点 "${dest.name}" 创建成功`);
      }
    }
    console.log('景点数据初始化完成');

    console.log('\n正在初始化旅游攻略...');
    const guides = [
      {
        title: '北京三日游最佳路线',
        content: '第一天：天安门广场 → 故宫 → 景山公园\n第二天：八达岭长城 → 明十三陵\n第三天：颐和园 → 圆明园 → 南锣鼓巷',
        cover_image: 'https://images.unsplash.com/photo-1585543805890-6051f7829f98?w=800',
        author: '旅行达人',
        author_name: '旅行达人',
        views: 15620,
        likes: 2350,
        is_official: true,
        tags: '自由行,北京'
      },
      {
        title: '杭州西湖深度游指南',
        content: '西湖十景深度解析，带你领略人间天堂的魅力。推荐游玩时间：2-3天',
        cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        author: '江南墨客',
        author_name: '江南墨客',
        views: 12350,
        likes: 1890,
        is_official: true,
        tags: '自由行,美食'
      },
      {
        title: '张家界自驾游攻略',
        content: '张家界国家森林公园自驾游全攻略，包含路线规划、住宿推荐、门票信息',
        cover_image: 'https://images.unsplash.com/photo-1544551763-d2c5e14b5bfc?w=800',
        author: '自驾爱好者',
        author_name: '自驾爱好者',
        views: 9860,
        likes: 1450,
        is_official: false,
        tags: '自驾游'
      }
    ];

    for (const guide of guides) {
      const exists = await Guide.findOne({ where: { title: guide.title } });
      if (!exists) {
        await Guide.create(guide);
        console.log(`攻略 "${guide.title}" 创建成功`);
      }
    }
    console.log('旅游攻略初始化完成');

    console.log('\n正在初始化旅游资讯...');
    const newsList = [
      {
        title: '2024年旅游趋势报告发布',
        content: '最新数据显示，国内旅游市场持续回暖，文旅融合成为新趋势',
        cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        views: 8560,
        likes: 560,
        shares: 120
      },
      {
        title: '多地推出旅游优惠政策',
        content: '为促进旅游消费，多个省市推出景区门票减免、住宿补贴等优惠政策',
        cover_image: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=800',
        views: 6780,
        likes: 420,
        shares: 95
      },
      {
        title: '暑期旅游旺季即将到来',
        content: '随着暑期来临，各大景区准备就绪，迎接旅游高峰',
        cover_image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800',
        views: 5430,
        likes: 380,
        shares: 85
      }
    ];

    for (const news of newsList) {
      const exists = await News.findOne({ where: { title: news.title } });
      if (!exists) {
        await News.create(news);
        console.log(`资讯 "${news.title}" 创建成功`);
      }
    }
    console.log('旅游资讯初始化完成');

    console.log('\n正在初始化行程规划...');
    const itineraries = [
      {
        title: '云南七日深度游',
        description: '昆明 → 大理 → 丽江 → 香格里拉，带你领略云南美景',
        coverImage: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=800',
        days: 7,
        budget: 5000,
        favorites: 2150,
        views: 18650,
        isFeatured: true,
        isOfficial: true,
        isPublic: true,
        userId: 1
      },
      {
        title: '四川熊猫之旅',
        description: '成都大熊猫基地 + 九寨沟 + 黄龙，亲子游首选',
        coverImage: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800',
        days: 5,
        budget: 4000,
        favorites: 1890,
        views: 15230,
        isFeatured: true,
        isOfficial: true,
        isPublic: true,
        userId: 1
      },
      {
        title: '海南三亚休闲游',
        description: '阳光、沙滩、大海，放松身心的完美假期',
        coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        days: 4,
        budget: 3500,
        favorites: 1560,
        views: 12380,
        isFeatured: false,
        isOfficial: false,
        isPublic: true,
        userId: 1
      },
      {
        title: '西藏珠峰之旅',
        description: '挑战世界之巅，感受高原魅力',
        coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        days: 10,
        budget: 8000,
        favorites: 1280,
        views: 11200,
        isFeatured: true,
        isOfficial: true,
        isPublic: true,
        userId: 1
      },
      {
        title: '新疆伊犁草原行',
        description: '漫步草原花海，体验民族风情',
        coverImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
        days: 8,
        budget: 6000,
        favorites: 980,
        views: 8560,
        isFeatured: false,
        isOfficial: false,
        isPublic: true,
        userId: 1
      },
      {
        title: '厦门鼓浪屿浪漫之旅',
        description: '文艺小岛，浪漫之都',
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        days: 4,
        budget: 3000,
        favorites: 1680,
        views: 14320,
        isFeatured: true,
        isOfficial: false,
        isPublic: true,
        userId: 1
      }
    ];

    for (const itinerary of itineraries) {
      const exists = await Itinerary.findOne({ where: { title: itinerary.title } });
      if (!exists) {
        await Itinerary.create(itinerary);
        console.log(`行程 "${itinerary.title}" 创建成功`);
      }
    }
    console.log('行程规划初始化完成');

    console.log('\n✅ 数据库初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  }
}

initData();