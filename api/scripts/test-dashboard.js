const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const API_KEY = process.env.API_KEY || 'ec_a3f6bf3d2bf6378b8bf13ee9b1889fc3c2c42e5acbb55e27a8bda26cd3d17060';

async function testDashboardAPI() {
  try {
    console.log('🧪 Testing Dashboard API...\n');

    // 1. 测试不带 projectId 的请求
    console.log('1️⃣  Testing /api/dashboard/stats (all projects)');
    const response1 = await axios.get(`${API_URL}/api/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    console.log('✅ Response received');
    console.log('📊 Stats:', {
      totalIssues: response1.data.stats.totalIssues,
      totalErrors: response1.data.stats.totalErrors,
      affectedUsers: response1.data.stats.affectedUsers
    });
    console.log('📝 Recent Issues:', response1.data.recentIssues.length);
    console.log('📁 Projects:', response1.data.projects.length);
    console.log('📈 Error Trend:', {
      labels: response1.data.errorTrend.labels,
      dataPoints: response1.data.errorTrend.data.length
    });
    console.log('📊 Issue Levels:', response1.data.issueLevels);
    console.log('\n');

    // 2. 如果有项目，测试带 projectId 的请求
    if (response1.data.projects.length > 0) {
      const projectId = response1.data.projects[0]._id;
      console.log(`2️⃣  Testing /api/dashboard/stats (projectId: ${projectId})`);
      
      const response2 = await axios.get(`${API_URL}/api/dashboard/stats`, {
        params: { projectId },
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      console.log('✅ Response received');
      console.log('📊 Stats:', {
        totalIssues: response2.data.stats.totalIssues,
        totalErrors: response2.data.stats.totalErrors,
        affectedUsers: response2.data.stats.affectedUsers
      });
      console.log('📝 Recent Issues:', response2.data.recentIssues.length);
      console.log('📁 Projects:', response2.data.projects.length);
      console.log('📈 Error Trend:', {
        labels: response2.data.errorTrend.labels,
        dataPoints: response2.data.errorTrend.data.length
      });
      console.log('📊 Issue Levels:', response2.data.issueLevels);
    }

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testDashboardAPI();
