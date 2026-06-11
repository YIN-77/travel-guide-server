const { sequelize, Itinerary, ItineraryDay, ItineraryActivity } = require('../models');

async function checkItinerary() {
  try {
    // 检查所有行程
    const itineraries = await Itinerary.findAll({
      attributes: ['id', 'userId', 'title', 'created_at']
    });
    
    console.log('所有行程:');
    itineraries.forEach(it => {
      console.log(`ID: ${it.id}, UserID: ${it.userId}, Title: ${it.title}`);
    });
    
    // 检查特定行程
    const itinerary7 = await Itinerary.findByPk(7, {
      include: [{
        model: ItineraryDay,
        as: 'days'
      }]
    });
    
    if (itinerary7) {
      console.log('\n行程ID 7的详情:');
      console.log('用户ID:', itinerary7.userId);
      console.log('标题:', itinerary7.title);
      console.log('天数:', itinerary7.days?.length || 0);
    } else {
      console.log('\n行程ID 7不存在');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('查询失败:', error);
    process.exit(1);
  }
}

checkItinerary();