const mongoose = require('mongoose');
const ErrorModel = require('../src/models/Error');

async function check() {
  await mongoose.connect('mongodb://localhost:27017/error-catcher-dev');
  
  const error = await ErrorModel.findOne({ 
    projectId: '69a69b5a6b650638ebe3d896' 
  }).sort({ timestamp: -1 });
  
  if (error) {
    console.log('最新错误的 URL 字段:');
    console.log('url:', error.url);
    console.log('pageUrl:', error.pageUrl);
    console.log('\n完整错误对象:');
    console.log(JSON.stringify(error, null, 2));
  } else {
    console.log('没有找到错误');
  }
  
  await mongoose.disconnect();
}

check();
