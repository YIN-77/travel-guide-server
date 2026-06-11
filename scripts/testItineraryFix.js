const http = require('http');

const testApi = (path, method = 'GET', data = null, token = '') => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'http://localhost:3000');
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('=== 测试行程相关 API ===\n');

  // 测试获取公开行程列表
  console.log('1. 测试获取公开行程列表 (GET /api/itineraries/public)');
  const publicList = await testApi('/api/itineraries/public');
  console.log('状态码:', publicList.status);
  console.log('响应:', JSON.stringify(publicList.data, null, 2));
  console.log();

  // 测试获取热门行程
  console.log('2. 测试获取热门行程 (GET /api/itineraries/hot)');
  const hotList = await testApi('/api/itineraries/hot');
  console.log('状态码:', hotList.status);
  console.log('响应:', JSON.stringify(hotList.data, null, 2));
  console.log();

  // 如果有行程数据，测试行程详情
  if (publicList.data?.data?.list?.length > 0) {
    const firstItinerary = publicList.data.data.list[0];
    console.log('3. 测试行程详情 (GET /api/itineraries/public/:id)');
    console.log('测试行程ID:', firstItinerary.id);
    const detail = await testApi(`/api/itineraries/public/${firstItinerary.id}`);
    console.log('状态码:', detail.status);
    console.log('响应:', JSON.stringify(detail.data, null, 2));
    console.log();
  }

  // 测试管理员行程列表
  console.log('4. 测试管理员行程列表 (GET /api/admin/itineraries)');
  const adminList = await testApi('/api/admin/itineraries');
  console.log('状态码:', adminList.status);
  console.log('响应:', JSON.stringify(adminList.data, null, 2));
  console.log();
};

runTests().catch(console.error);