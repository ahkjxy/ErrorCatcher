/**
 * 检查错误记录中的用户数据
 */

const mongoose = require('mongoose');
const Error = require('../src/models/Error');
const config = require('../config');

async function checkUserData() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');

    // 查找最近的10条错误
    const errors = await Error.find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    console.log(`\n=== Latest 10 Errors ===`);
    errors.forEach((error, index) => {
      console.log(`\n${index + 1}. Error ID: ${error._id}`);
      console.log(`   Message: ${error.message}`);
      console.log(`   Type: ${error.type}`);
      console.log(`   Timestamp: ${error.timestamp}`);
      console.log(`   User: ${JSON.stringify(error.user || 'NO USER DATA')}`);
      console.log(`   Has user.id: ${error.user?.id ? 'YES' : 'NO'}`);
    });

    // 统计有user数据的错误
    const withUser = await Error.countDocuments({ 'user.id': { $exists: true, $ne: null } });
    const total = await Error.countDocuments({});

    console.log(`\n=== Statistics ===`);
    console.log(`Total errors: ${total}`);
    console.log(`Errors with user.id: ${withUser}`);
    console.log(`Errors without user.id: ${total - withUser}`);

    await mongoose.disconnect();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUserData();
