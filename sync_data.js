const axios = require('axios');

const localBaseURL = 'http://localhost:3000/api';
const remoteBaseURL = 'https://travel-guide-server-production-ea9a.up.railway.app/api';

let remoteToken = null;

async function loginToRemote() {
  try {
    console.log('正在登录线上服务器...');
    const response = await axios.post(`${remoteBaseURL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    remoteToken = response.data.data.token;
    console.log('✅ 登录成功');
  } catch (error) {
    console.error('登录失败:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function syncDestinations() {
  try {
    console.log('\n正在从本地获取景点数据...');
    const localResponse = await axios.get(`${localBaseURL}/destinations?page=1&limit=100`);
    const localDestinations = localResponse.data.data.list;
    console.log(`本地共有 ${localDestinations.length} 个景点`);

    console.log('正在获取线上景点数据...');
    const remoteResponse = await axios.get(`${remoteBaseURL}/destinations?page=1&limit=100`);
    const remoteDestinations = remoteResponse.data.data.list;
    const remoteNames = new Set(remoteDestinations.map(d => d.name));
    console.log(`线上共有 ${remoteDestinations.length} 个景点`);

    console.log('正在同步景点数据...');
    let addedCount = 0;
    for (const dest of localDestinations) {
      if (!remoteNames.has(dest.name)) {
        try {
          const newDest = {
            name: dest.name,
            description: dest.description,
            image: dest.image,
            location: dest.location,
            rating: dest.rating,
            likesCount: dest.likesCount,
            views: dest.views
          };
          await axios.post(`${remoteBaseURL}/destinations`, newDest, {
            headers: { Authorization: `Bearer ${remoteToken}` }
          });
          console.log(`已添加景点: ${dest.name}`);
          addedCount++;
        } catch (error) {
          console.error(`添加景点失败 ${dest.name}:`, error.response?.data?.message || error.message);
        }
      }
    }

    console.log(`✅ 景点同步完成！新增 ${addedCount} 个景点`);
  } catch (error) {
    console.error('景点同步失败:', error.message);
  }
}

async function syncGuides() {
  try {
    console.log('\n正在从本地获取攻略数据...');
    const localResponse = await axios.get(`${localBaseURL}/guides?page=1&limit=100`);
    const localGuides = localResponse.data.data.list;
    console.log(`本地共有 ${localGuides.length} 个攻略`);

    console.log('正在获取线上攻略数据...');
    const remoteResponse = await axios.get(`${remoteBaseURL}/guides?page=1&limit=100`);
    const remoteGuides = remoteResponse.data.data.list;
    const remoteTitles = new Set(remoteGuides.map(g => g.title));
    console.log(`线上共有 ${remoteGuides.length} 个攻略`);

    console.log('正在同步攻略数据...');
    let addedCount = 0;
    for (const guide of localGuides) {
      if (!remoteTitles.has(guide.title)) {
        try {
          const newGuide = {
            title: guide.title,
            content: guide.content,
            cover_image: guide.cover_image,
            author: guide.author,
            author_name: guide.author_name,
            views: guide.views,
            likes: guide.likes,
            is_official: guide.is_official,
            tags: guide.tags
          };
          await axios.post(`${remoteBaseURL}/guides`, newGuide, {
            headers: { Authorization: `Bearer ${remoteToken}` }
          });
          console.log(`已添加攻略: ${guide.title}`);
          addedCount++;
        } catch (error) {
          console.error(`添加攻略失败 ${guide.title}:`, error.response?.data?.message || error.message);
        }
      }
    }

    console.log(`✅ 攻略同步完成！新增 ${addedCount} 个攻略`);
  } catch (error) {
    console.error('攻略同步失败:', error.message);
  }
}

async function syncNews() {
  try {
    console.log('\n正在从本地获取资讯数据...');
    const localResponse = await axios.get(`${localBaseURL}/news?page=1&limit=100`);
    const localNews = localResponse.data.data.list;
    console.log(`本地共有 ${localNews.length} 条资讯`);

    console.log('正在获取线上资讯数据...');
    const remoteResponse = await axios.get(`${remoteBaseURL}/news?page=1&limit=100`);
    const remoteNews = remoteResponse.data.data.list;
    const remoteTitles = new Set(remoteNews.map(n => n.title));
    console.log(`线上共有 ${remoteNews.length} 条资讯`);

    console.log('正在同步资讯数据...');
    let addedCount = 0;
    for (const news of localNews) {
      if (!remoteTitles.has(news.title)) {
        try {
          const newNews = {
            title: news.title,
            content: news.content,
            cover_image: news.cover_image,
            views: news.views,
            likes: news.likes
          };
          await axios.post(`${remoteBaseURL}/admin/news`, newNews, {
            headers: { Authorization: `Bearer ${remoteToken}` }
          });
          console.log(`已添加资讯: ${news.title}`);
          addedCount++;
        } catch (error) {
          console.error(`添加资讯失败 ${news.title}:`, error.response?.data?.message || error.message);
        }
      }
    }

    console.log(`✅ 资讯同步完成！新增 ${addedCount} 条资讯`);
  } catch (error) {
    console.error('资讯同步失败:', error.message);
  }
}

async function syncItineraries() {
  try {
    console.log('\n正在从本地获取行程数据...');
    const localResponse = await axios.get(`${localBaseURL}/itineraries?page=1&limit=100`);
    const localItineraries = localResponse.data.data.list;
    console.log(`本地共有 ${localItineraries.length} 个行程`);

    console.log('正在获取线上行程数据...');
    const remoteResponse = await axios.get(`${remoteBaseURL}/itineraries?page=1&limit=100`);
    const remoteItineraries = remoteResponse.data.data.list;
    const remoteTitles = new Set(remoteItineraries.map(i => i.title));
    console.log(`线上共有 ${remoteItineraries.length} 个行程`);

    console.log('正在同步行程数据...');
    let addedCount = 0;
    for (const itinerary of localItineraries) {
      if (!remoteTitles.has(itinerary.title)) {
        try {
          const newItinerary = {
            title: itinerary.title,
            description: itinerary.description,
            cover_image: itinerary.cover_image,
            userId: itinerary.userId || 1,
            startDate: itinerary.startDate,
            endDate: itinerary.endDate,
            budget: itinerary.budget,
            status: itinerary.status,
            isPublic: itinerary.isPublic,
            isOfficial: itinerary.isOfficial || false,
            favorites: itinerary.favorites || 0,
            destinations: itinerary.destinations
          };
          await axios.post(`${remoteBaseURL}/admin/itineraries`, newItinerary, {
            headers: { Authorization: `Bearer ${remoteToken}` }
          });
          console.log(`已添加行程: ${itinerary.title}`);
          addedCount++;
        } catch (error) {
          console.error(`添加行程失败 ${itinerary.title}:`, error.response?.data?.message || error.message);
        }
      }
    }

    console.log(`✅ 行程同步完成！新增 ${addedCount} 个行程`);
  } catch (error) {
    console.error('行程同步失败:', error.message);
  }
}

async function main() {
  console.log('🚀 开始同步本地数据到线上...');
  
  await loginToRemote();
  await syncDestinations();
  await syncGuides();
  await syncNews();
  await syncItineraries();

  console.log('\n🎉 所有数据同步完成！');
}

main().catch(err => {
  console.error('同步失败:', err);
  process.exit(1);
});