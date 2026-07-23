const { sequelize } = require('./models');
const { Destination, Guide, Itinerary, News, Tag, User } = require('./models');

async function initFullData() {
  try {
    console.log('正在创建示例数据...');

    await sequelize.sync();

    const user = await User.findOne({ where: { username: 'user' } });
    const userId = user ? user.id : null;

    const destinationsData = [
      {
        name: '东京塔',
        description: '东京塔是东京的标志性建筑，高333米，是世界上最高的自立式铁塔之一。从塔顶可以俯瞰整个东京市区的美景。',
        image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=600&fit=crop',
        location: '日本东京',
        rating: 4.7,
        latitude: 35.658581,
        longitude: 139.745433,
        openingHours: '09:00-22:00',
        ticketPrice: '成人1200日元，儿童600日元',
        transport: 'JR山手线滨松町站步行10分钟',
        bestTime: '春季（3-4月）樱花季、秋季（11月）红叶季',
        duration: '2-3小时',
        tips: '建议傍晚前往，可以看到白天和夜景两种景色。'
      },
      {
        name: '富士山',
        description: '富士山是日本最高的山峰，海拔3776米，是世界著名的火山。每年夏季吸引大量登山爱好者前来挑战。',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        location: '日本静冈县',
        rating: 4.9,
        latitude: 35.360625,
        longitude: 138.727363,
        openingHours: '五合目全年开放；登山季节7-8月',
        ticketPrice: '免费',
        transport: '富士急行线河口湖站转乘巴士',
        bestTime: '夏季（7-8月）登山季、秋季（10月）红叶',
        duration: '登山需1-2天',
        tips: '登山需要提前准备装备，注意高原反应。'
      },
      {
        name: '北京故宫',
        description: '北京故宫是明清两代的皇家宫殿，是世界上现存规模最大、保存最为完整的木质结构古建筑群。',
        image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop',
        location: '中国北京',
        rating: 4.8,
        latitude: 39.916315,
        longitude: 116.397228,
        openingHours: '08:30-17:00',
        ticketPrice: '旺季60元，淡季40元',
        transport: '地铁1号线天安门东/西站',
        bestTime: '春季、秋季',
        duration: '半天到一天',
        tips: '建议从午门进入，神武门出来。'
      },
      {
        name: '长城',
        description: '长城是中国古代的军事防御工程，是世界七大奇迹之一，全长超过2万公里。',
        image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&h=600&fit=crop',
        location: '中国北京',
        rating: 4.8,
        latitude: 40.343139,
        longitude: 116.042425,
        openingHours: '07:30-17:30',
        ticketPrice: '八达岭旺季40元',
        transport: '德胜门乘877路公交',
        bestTime: '秋季（9-10月）',
        duration: '半天',
        tips: '慕田峪长城人较少，景色更优美。'
      },
      {
        name: '巴黎埃菲尔铁塔',
        description: '埃菲尔铁塔是巴黎的标志性建筑，高324米，是法国最著名的旅游景点之一。',
        image: 'https://images.unsplash.com/photo-1496442266464-2c42f7677e7d?w=800&h=600&fit=crop',
        location: '法国巴黎',
        rating: 4.7,
        latitude: 48.858093,
        longitude: 2.294694,
        openingHours: '09:30-23:00',
        ticketPrice: '成人25欧元（顶层）',
        transport: '地铁6号线Bir-Hakeim站',
        bestTime: '傍晚日落时分',
        duration: '2-3小时',
        tips: '提前在官网购票，避免长时间排队。'
      },
      {
        name: '上海外滩',
        description: '上海外滩是上海最具代表性的景观之一，拥有众多历史建筑和现代化摩天大楼，是观赏黄浦江夜景的绝佳地点。',
        image: 'https://images.unsplash.com/photo-1511134887991-d3544a668fd7?w=800&h=600&fit=crop',
        location: '中国上海',
        rating: 4.6,
        latitude: 31.230416,
        longitude: 121.473701,
        openingHours: '全天',
        ticketPrice: '免费',
        transport: '地铁2号线南京东路站',
        bestTime: '晚上灯光秀',
        duration: '1-2小时',
        tips: '建议从南京东路步行到外滩，对岸陆家嘴夜景很美。'
      },
      {
        name: '巴厘岛海滩',
        description: '巴厘岛拥有世界上最美的海滩之一，清澈的海水、细腻的沙滩和壮观的日落吸引着无数游客。',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
        location: '印度尼西亚巴厘岛',
        rating: 4.7,
        latitude: -8.726234,
        longitude: 115.167831,
        openingHours: '全天开放',
        ticketPrice: '大部分海滩免费',
        transport: '建议包车或打车前往',
        bestTime: '4-10月干季',
        duration: '半天到一天',
        tips: '注意防晒，部分海滩有暗流。'
      },
      {
        name: '三亚海滩',
        description: '三亚是中国最著名的海滨度假城市，拥有亚龙湾、天涯海角等著名景点，是冬季避寒的理想去处。',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
        location: '中国海南三亚',
        rating: 4.5,
        latitude: 18.217782,
        longitude: 109.506504,
        openingHours: '全天',
        ticketPrice: '部分海滩免费',
        transport: '公交或打车',
        bestTime: '10月-次年3月',
        duration: '半天',
        tips: '亚龙湾水质最好，蜈支洲岛值得一去。'
      }
    ];

    for (const data of destinationsData) {
      const existing = await Destination.findOne({ where: { name: data.name } });
      if (!existing) {
        await Destination.create(data);
        console.log(`创建景点: ${data.name}`);
      } else {
        console.log(`景点已存在: ${data.name}`);
      }
    }

    const guidesData = [
      {
        title: '日本东京深度游攻略',
        description: '带你探索东京的热门景点和隐藏宝藏，体验真正的日本文化。',
        content: '<h2>第一天：浅草寺与上野公园</h2><p>早上前往浅草寺，感受东京最古老的寺庙。下午逛上野公园，参观博物馆。</p><h2>第二天：涩谷与原宿</h2><p>体验年轻人的时尚文化，逛涩谷十字路口和原宿竹下通。</p><h2>第三天：筑地市场与台场</h2><p>早上在筑地市场品尝新鲜海鲜，下午去台场看彩虹桥。</p>',
        cover_image: 'https://images.unsplash.com/photo-1488646953003-0b223ec08baf?w=800&h=600&fit=crop',
        author_id: userId,
        author_name: '游客',
        tags: '东京,日本,自由行',
        views: 2580,
        likes: 128,
        comments: 35,
        status: 'published',
        is_featured: true,
        published_at: new Date()
      },
      {
        title: '北京三日游最佳路线',
        description: '三天时间玩转北京，覆盖故宫、长城、颐和园等必游景点。',
        content: '<h2>第一天：故宫与天安门</h2><p>上午参观天安门广场，下午游览故宫博物院。</p><h2>第二天：八达岭长城</h2><p>全天游览长城，建议早起避开人流。</p><h2>第三天：颐和园与圆明园</h2><p>感受皇家园林的壮丽，了解历史故事。</p>',
        cover_image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop',
        author_id: userId,
        author_name: '游客',
        tags: '北京,故宫,长城',
        views: 3120,
        likes: 186,
        comments: 42,
        status: 'published',
        is_featured: true,
        published_at: new Date()
      },
      {
        title: '巴厘岛度假全攻略',
        description: '从机票酒店到景点美食，全方位指南带你玩转巴厘岛。',
        content: '<h2>住宿推荐</h2><p>努沙杜瓦适合家庭度假，乌布适合文化探索。</p><h2>必玩景点</h2><p>乌布皇宫、Tanah Lot神庙、Seminyak海滩。</p><h2>美食推荐</h2><p>脏鸭餐、烤猪饭、新鲜椰子。</p>',
        cover_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
        author_id: userId,
        author_name: '游客',
        tags: '巴厘岛,度假,海滩',
        views: 1890,
        likes: 95,
        comments: 28,
        status: 'published',
        is_featured: false,
        published_at: new Date()
      },
      {
        title: '巴黎浪漫之旅',
        description: '漫步塞纳河畔，感受浪漫之都的魅力。',
        content: '<h2>埃菲尔铁塔</h2><p>傍晚登上铁塔，俯瞰巴黎夜景。</p><h2>卢浮宫</h2><p>欣赏世界艺术珍品，三大镇馆之宝必看。</p><h2>塞纳河游船</h2><p>夜晚游船，欣赏两岸灯光。</p>',
        cover_image: 'https://images.unsplash.com/photo-1496442266464-2c42f7677e7d?w=800&h=600&fit=crop',
        author_id: userId,
        author_name: '游客',
        tags: '巴黎,浪漫,欧洲',
        views: 2340,
        likes: 156,
        comments: 38,
        status: 'published',
        is_featured: true,
        published_at: new Date()
      }
    ];

    for (const data of guidesData) {
      const existing = await Guide.findOne({ where: { title: data.title } });
      if (!existing) {
        await Guide.create(data);
        console.log(`创建攻略: ${data.title}`);
      } else {
        console.log(`攻略已存在: ${data.title}`);
      }
    }

    const itinerariesData = [
      {
        userId: userId,
        title: '东京5日自由行',
        description: '经典东京5日行程，涵盖热门景点和地道体验。',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-04-05'),
        isPublic: true,
        isFeatured: true,
        isOfficial: true,
        favorites: 89,
        likes: 156,
        shares: 42,
        coverImage: 'https://images.unsplash.com/photo-1488646953003-0b223ec08baf?w=800&h=600&fit=crop'
      },
      {
        userId: userId,
        title: '北京4日深度游',
        description: '四天时间深入了解北京的历史与文化。',
        startDate: new Date('2024-05-10'),
        endDate: new Date('2024-05-13'),
        isPublic: true,
        isFeatured: true,
        isOfficial: false,
        favorites: 67,
        likes: 124,
        shares: 35,
        coverImage: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop'
      },
      {
        userId: userId,
        title: '巴厘岛7日度假',
        description: '一周时间享受巴厘岛的阳光沙滩和文化体验。',
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-06-21'),
        isPublic: true,
        isFeatured: false,
        isOfficial: false,
        favorites: 45,
        likes: 89,
        shares: 28,
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop'
      },
      {
        userId: userId,
        title: '欧洲三国十日游',
        description: '法国、意大利、瑞士经典欧洲之旅。',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-07-10'),
        isPublic: true,
        isFeatured: true,
        isOfficial: true,
        favorites: 123,
        likes: 234,
        shares: 56,
        coverImage: 'https://images.unsplash.com/photo-1496442266464-2c42f7677e7d?w=800&h=600&fit=crop'
      }
    ];

    for (const data of itinerariesData) {
      const existing = await Itinerary.findOne({ where: { title: data.title } });
      if (!existing) {
        await Itinerary.create(data);
        console.log(`创建行程: ${data.title}`);
      } else {
        console.log(`行程已存在: ${data.title}`);
      }
    }

    const newsData = [
      {
        title: '2024年旅游趋势预测：这些目的地将成为热门',
        description: '根据最新数据，亚洲和欧洲的一些新兴目的地将在2024年成为旅游热点。',
        content: '<p>随着全球旅游业的复苏，2024年预计将是旅游行业的丰收年。根据各大旅行社的数据，以下目的地最值得关注：</p><ul><li>日本：樱花季和红叶季持续火爆</li><li>冰岛：自然景观吸引探险爱好者</li><li>摩洛哥：文化与沙漠之旅</li><li>新西兰：纯净自然的代表</li></ul>',
        cover_image: 'https://images.unsplash.com/photo-1488646953003-0b223ec08baf?w=800&h=600&fit=crop',
        category: '目的地推荐',
        author: '旅游编辑部',
        views: 3450,
        likes: 189,
        favorites: 78,
        shares: 56,
        status: 'published',
        is_top: true,
        published_at: new Date()
      },
      {
        title: '签证政策更新：多个国家对中国游客放宽限制',
        description: '好消息！近期多个国家宣布对中国游客放宽签证要求，出境游更加便利。',
        content: '<p>近期签证政策利好不断：</p><ul><li>泰国：免签政策延长至2024年</li><li>马来西亚：电子签证简化流程</li><li>欧洲申根：部分国家加快审批速度</li><li>新西兰：在线申请更加便捷</li></ul><p>这些政策将大大便利中国游客的出境旅行。</p>',
        cover_image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=600&fit=crop',
        category: '签证政策',
        author: '旅游编辑部',
        views: 2180,
        likes: 134,
        favorites: 45,
        shares: 32,
        status: 'published',
        is_top: false,
        published_at: new Date()
      },
      {
        title: '春季赏花指南：国内最美赏花地推荐',
        description: '春暖花开，正是赏花好时节。为您推荐国内最美的赏花目的地。',
        content: '<p>春季是赏花的最佳季节：</p><ul><li>武汉樱花：浪漫如云霞</li><li>洛阳牡丹：国色天香</li><li>婺源油菜花：金色海洋</li><li>云南大理：杜鹃花海</li></ul><p>赶紧规划您的赏花之旅吧！</p>',
        cover_image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=600&fit=crop',
        category: '目的地推荐',
        author: '旅游编辑部',
        views: 1980,
        likes: 112,
        favorites: 38,
        shares: 29,
        status: 'published',
        is_top: false,
        published_at: new Date()
      },
      {
        title: '旅游安全提示：出行前必看的注意事项',
        description: '安全第一！为您整理了出行前需要注意的安全事项。',
        content: '<p>旅行安全至关重要，请注意以下事项：</p><ul><li>购买旅行保险</li><li>了解目的地安全状况</li><li>保管好个人财物</li><li>注意饮食卫生</li><li>随身携带紧急联系方式</li></ul>',
        cover_image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop',
        category: '行业动态',
        author: '旅游编辑部',
        views: 1560,
        likes: 89,
        favorites: 32,
        shares: 24,
        status: 'published',
        is_top: false,
        published_at: new Date()
      }
    ];

    for (const data of newsData) {
      const existing = await News.findOne({ where: { title: data.title } });
      if (!existing) {
        await News.create(data);
        console.log(`创建资讯: ${data.title}`);
      } else {
        console.log(`资讯已存在: ${data.title}`);
      }
    }

    const tagsData = ['热门', '文化', '自然', '海滩', '美食', '历史', '购物', '亲子'];
    for (const name of tagsData) {
      const existing = await Tag.findOne({ where: { name } });
      if (!existing) {
        await Tag.create({ name });
        console.log(`创建标签: ${name}`);
      }
    }

    console.log('\n数据初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('数据初始化失败:', error);
    process.exit(1);
  }
}

initFullData();