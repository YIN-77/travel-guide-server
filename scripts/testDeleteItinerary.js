const { sequelize, Itinerary, ItineraryDay, ItineraryActivity } = require('../models');

async function testDelete(itineraryId, userId) {
  try {
    console.log(`尝试删除行程ID: ${itineraryId}, 用户ID: ${userId}`);
    
    const itinerary = await Itinerary.findOne({
      where: { 
        id: itineraryId,
        userId: userId
      },
      include: [{
        model: ItineraryDay,
        as: 'days'
      }]
    });

    if (!itinerary) {
      console.log('行程不存在或不属于当前用户');
      process.exit(1);
    }

    console.log('找到行程:', itinerary.id, itinerary.title);
    console.log('关联的天数:', itinerary.days?.length || 0);

    for (const day of itinerary.days || []) {
      console.log('删除天数', day.id, '的活动');
      await ItineraryActivity.destroy({ where: { itineraryDayId: day.id } });
    }
    
    console.log('删除行程天数');
    await ItineraryDay.destroy({ where: { itineraryId: itinerary.id } });
    
    console.log('删除行程');
    await itinerary.destroy();

    console.log('删除成功');
    process.exit(0);
  } catch (error) {
    console.error('删除失败:', error);
    console.error('错误堆栈:', error.stack);
    process.exit(1);
  }
}

// 测试删除行程ID 7，用户ID 1
testDelete(7, 1);