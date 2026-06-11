const { sequelize, Destination } = require('../models');

// 景点增强信息数据
const destinationsData = [
  {
    name: '东京塔',
    latitude: 35.658581,
    longitude: 139.745433,
    openingHours: '09:00-22:00',
    ticketPrice: '成人1200日元，儿童600日元',
    transport: 'JR山手线滨松町站步行10分钟；都营大江户线赤羽桥站步行5分钟',
    bestTime: '春季（3-4月）樱花季、秋季（11月）红叶季',
    duration: '2-3小时',
    tips: '建议傍晚前往，可以看到白天和夜景两种景色。顶层展望台需要额外付费。'
  },
  {
    name: '富士山',
    latitude: 35.360625,
    longitude: 138.727363,
    openingHours: '五合目全年开放；登山季节7-8月',
    ticketPrice: '免费（登山道免费，五合目停车场收费）',
    transport: '富士急行线河口湖站转乘巴士到五合目',
    bestTime: '夏季（7-8月）登山季、秋季（10月）红叶',
    duration: '登山需1-2天',
    tips: '登山需要提前准备装备，注意高原反应。五合目以上禁止私家车进入。'
  },
  {
    name: '京都金阁寺',
    latitude: 35.039244,
    longitude: 135.729665,
    openingHours: '09:00-17:00（冬季至16:30）',
    ticketPrice: '成人400日元，儿童200日元',
    transport: '市巴士206路金阁寺前站下车',
    bestTime: '秋季（11月）红叶、冬季雪景',
    duration: '1小时',
    tips: '清晨人较少，适合拍照。寺庙内禁止使用三脚架。'
  },
  {
    name: '奈良公园',
    latitude: 34.685194,
    longitude: 135.831362,
    openingHours: '全天开放（东大寺等景点有开放时间）',
    ticketPrice: '公园免费，东大寺成人600日元',
    transport: 'JR奈良站步行10分钟',
    bestTime: '春季（3-4月）樱花、秋季（11月）红叶',
    duration: '半天',
    tips: '公园里有很多小鹿，可以买鹿仙贝喂食，但注意不要被鹿角撞到。'
  },
  {
    name: '大阪环球影城',
    latitude: 34.665664,
    longitude: 135.432763,
    openingHours: '09:00-22:00（季节不同有变动）',
    ticketPrice: '成人7800日元起',
    transport: 'JR樱岛线环球城站直达',
    bestTime: '冬季圣诞主题、夏季水上活动',
    duration: '一整天',
    tips: '建议提前购买快速通行券，热门项目排队时间很长。'
  },
  {
    name: '巴厘岛海滩',
    latitude: -8.726234,
    longitude: 115.167831,
    openingHours: '全天开放',
    ticketPrice: '大部分海滩免费',
    transport: '建议包车或打车前往各海滩',
    bestTime: '4-10月干季',
    duration: '半天到一天',
    tips: '注意防晒，部分海滩有暗流，游泳需谨慎。'
  },
  {
    name: '普吉岛',
    latitude: 7.880425,
    longitude: 98.392376,
    openingHours: '全天开放',
    ticketPrice: '海滩免费',
    transport: '双条车、出租车或租摩托车',
    bestTime: '11月-次年4月',
    duration: '2-3天',
    tips: '芭东海滩热闹，卡塔海滩安静。出海一日游很受欢迎。'
  },
  {
    name: '马尔代夫',
    latitude: 3.202778,
    longitude: 73.220682,
    openingHours: '全天开放',
    ticketPrice: '根据度假村不同差异较大',
    transport: '马累机场转乘水上飞机或快艇',
    bestTime: '11月-次年4月',
    duration: '3-7天',
    tips: '提前预订度假村，大部分度假村是一价全包。'
  },
  {
    name: '悉尼歌剧院',
    latitude: -33.856784,
    longitude: 151.215297,
    openingHours: '09:00-17:00（演出时间另计）',
    ticketPrice: '参观成人38澳元',
    transport: '悉尼市中心步行或渡轮',
    bestTime: '春季（9-11月）、秋季（3-5月）',
    duration: '1-2小时',
    tips: '建议参加导览团，可以参观内部。晚上灯光很美。'
  },
  {
    name: '大堡礁',
    latitude: -16.785971,
    longitude: 145.936398,
    openingHours: '全天（出海团有固定时间）',
    ticketPrice: '出海一日游约200澳元起',
    transport: '从凯恩斯或艾尔利海滩出发',
    bestTime: '5-10月',
    duration: '一天',
    tips: '建议选择有浮潜和潜水的套餐。提前做好防晒。'
  },
  {
    name: '巴黎埃菲尔铁塔',
    latitude: 48.858093,
    longitude: 2.294694,
    openingHours: '09:30-23:00（夏季延长）',
    ticketPrice: '成人25欧元（顶层）',
    transport: '地铁6号线Bir-Hakeim站',
    bestTime: '傍晚日落时分',
    duration: '2-3小时',
    tips: '提前在官网购票，避免长时间排队。第二层观景台视野很好。'
  },
  {
    name: '卢浮宫',
    latitude: 48.860611,
    longitude: 2.337644,
    openingHours: '09:00-18:00（周三周五延长至21:45）',
    ticketPrice: '成人17欧元',
    transport: '地铁1/7号线Palais-Royal站',
    bestTime: '周三周五晚上人较少',
    duration: '半天到一天',
    tips: '建议先参观三大镇馆之宝：蒙娜丽莎、维纳斯、胜利女神。'
  },
  {
    name: '罗马斗兽场',
    latitude: 41.89021,
    longitude: 12.492231,
    openingHours: '08:30-19:15（夏季延长）',
    ticketPrice: '成人17欧元（含古罗马广场）',
    transport: '地铁B线Colosseo站',
    bestTime: '清晨或傍晚',
    duration: '1-2小时',
    tips: '建议提前网上购票，避免排队。可以请导游讲解历史。'
  },
  {
    name: '威尼斯',
    latitude: 45.438761,
    longitude: 12.331569,
    openingHours: '全天',
    ticketPrice: '主要景点收费',
    transport: '步行或水上巴士（Vaporetto）',
    bestTime: '春季（4-5月）、秋季（10-11月）',
    duration: '1-2天',
    tips: '避开旺季，夏季人很多。贡多拉体验价格较贵。'
  },
  {
    name: '伦敦大本钟',
    latitude: 51.500729,
    longitude: -0.124625,
    openingHours: '外观全天，内部需预约',
    ticketPrice: '免费（外观），内部参观约25英镑',
    transport: '地铁Westminster站',
    bestTime: '整点听钟声',
    duration: '30分钟-1小时',
    tips: '建议傍晚拍照，灯光很美。国会大厦内部参观需要提前预约。'
  },
  {
    name: '纽约自由女神像',
    latitude: 40.689249,
    longitude: -74.044505,
    openingHours: '09:00-17:00',
    ticketPrice: '免费（渡轮收费），基座18美元',
    transport: '从曼哈顿炮台公园乘渡轮',
    bestTime: '上午光线好',
    duration: '半天',
    tips: '提前在官网预约门票，尤其是皇冠参观。'
  },
  {
    name: '拉斯维加斯大道',
    latitude: 36.114647,
    longitude: -115.172813,
    openingHours: '全天',
    ticketPrice: '大部分酒店免费进入',
    transport: '步行或出租车',
    bestTime: '晚上夜景',
    duration: '晚上',
    tips: '各大酒店的免费表演值得一看（如Bellagio喷泉）。'
  },
  {
    name: '夏威夷海滩',
    latitude: 21.271604,
    longitude: -157.821986,
    openingHours: '全天',
    ticketPrice: '免费',
    transport: '租车或公交',
    bestTime: '全年皆宜',
    duration: '半天',
    tips: '威基基海滩最热闹，北岸适合冲浪。注意防晒。'
  },
  {
    name: '上海外滩',
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
    name: '北京故宫',
    latitude: 39.916315,
    longitude: 116.397228,
    openingHours: '08:30-17:00（淡季至16:30）',
    ticketPrice: '旺季60元，淡季40元',
    transport: '地铁1号线天安门东/西站',
    bestTime: '春季、秋季',
    duration: '半天到一天',
    tips: '建议从午门进入，神武门出来。珍宝馆和钟表馆值得一看。'
  },
  {
    name: '长城',
    latitude: 40.343139,
    longitude: 116.042425,
    openingHours: '07:30-17:30（季节不同）',
    ticketPrice: '八达岭旺季40元',
    transport: '德胜门乘877路公交',
    bestTime: '秋季（9-10月）',
    duration: '半天',
    tips: '慕田峪长城人较少，景色更优美。建议穿舒适的鞋子。'
  },
  {
    name: '张家界',
    latitude: 29.117494,
    longitude: 110.474372,
    openingHours: '07:30-18:00',
    ticketPrice: '225元（含环保车）',
    transport: '张家界市区乘班车',
    bestTime: '4-6月、9-11月',
    duration: '2-3天',
    tips: '建议安排两天时间，山上住宿可以看日出。'
  },
  {
    name: '九寨沟',
    latitude: 33.141478,
    longitude: 103.944018,
    openingHours: '08:00-18:00',
    ticketPrice: '旺季280元，淡季160元',
    transport: '九寨沟景区观光车',
    bestTime: '秋季（10月）',
    duration: '一天',
    tips: '景区很大，建议早去。观光车会停靠各个景点。'
  },
  {
    name: '桂林山水',
    latitude: 25.274089,
    longitude: 110.299309,
    openingHours: '全天',
    ticketPrice: '漓江游船215元',
    transport: '阳朔乘竹筏或游船',
    bestTime: '4-10月',
    duration: '半天',
    tips: '兴坪段漓江景色最美。遇龙河竹筏漂流很推荐。'
  },
  {
    name: '丽江古城',
    latitude: 26.864149,
    longitude: 100.236344,
    openingHours: '全天',
    ticketPrice: '维护费80元',
    transport: '丽江市区步行',
    bestTime: '4-5月、9-10月',
    duration: '1-2天',
    tips: '晚上四方街很热闹。建议去束河古镇，人少更宁静。'
  },
  {
    name: '三亚海滩',
    latitude: 18.217782,
    longitude: 109.506504,
    openingHours: '全天',
    ticketPrice: '部分海滩免费',
    transport: '公交或打车',
    bestTime: '10月-次年3月',
    duration: '半天',
    tips: '亚龙湾水质最好，蜈支洲岛值得一去。注意防晒。'
  },
  {
    name: '长白山',
    latitude: 42.402919,
    longitude: 128.043976,
    openingHours: '07:30-17:00',
    ticketPrice: '景区门票105元，环保车85元',
    transport: '长白山机场或白河站',
    bestTime: '夏季（7-8月）、秋季（9月）',
    duration: '一天',
    tips: '天池能否看到要看天气。北坡景点最齐全。'
  },
  {
    name: '香格里拉',
    latitude: 27.849711,
    longitude: 99.723846,
    openingHours: '全天',
    ticketPrice: '普达措公园138元',
    transport: '香格里拉县城包车',
    bestTime: '5-6月杜鹃花开、9-10月秋色',
    duration: '1-2天',
    tips: '海拔较高，注意高原反应。普达措国家公园值得一游。'
  },
  {
    name: '杭州西湖',
    latitude: 30.274084,
    longitude: 120.155276,
    openingHours: '全天',
    ticketPrice: '免费（部分景点收费）',
    transport: '地铁1号线龙翔桥站',
    bestTime: '春季（3-4月）、秋季（10-11月）',
    duration: '半天到一天',
    tips: '建议租自行车环湖。雷峰塔门票40元，可以俯瞰西湖。'
  },
  {
    name: '黄山',
    latitude: 30.139687,
    longitude: 118.191297,
    openingHours: '06:30-17:30（季节不同）',
    ticketPrice: '旺季190元，淡季150元',
    transport: '黄山北站乘班车',
    bestTime: '4-5月、9-10月',
    duration: '2-3天',
    tips: '建议山上住宿一晚看日出。西海大峡谷景色壮观。'
  }
];

const updateDestinations = async () => {
  try {
    await sequelize.sync();
    
    for (const data of destinationsData) {
      const destination = await Destination.findOne({ where: { name: data.name } });
      if (destination) {
        await destination.update({
          latitude: data.latitude,
          longitude: data.longitude,
          openingHours: data.openingHours,
          ticketPrice: data.ticketPrice,
          transport: data.transport,
          bestTime: data.bestTime,
          duration: data.duration,
          tips: data.tips
        });
        console.log(`更新景点: ${data.name}`);
      } else {
        console.log(`未找到景点: ${data.name}`);
      }
    }
    
    console.log('所有景点更新完成！');
    process.exit(0);
  } catch (error) {
    console.error('更新失败:', error);
    process.exit(1);
  }
};

updateDestinations();
