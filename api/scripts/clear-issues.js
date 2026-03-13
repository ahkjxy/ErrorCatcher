/**
 * 清空 Issues 数据
 */

const mongoose = require('mongoose');
const Issue = require('../src/models/Issue');
require('dotenv').config({ path: '../.env.dev' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/error-catcher';

async function clearIssues() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 统计 Issues
    const count = await Issue.countDocuments();
    console.log(`📊 Found ${count} issues\n`);

    if (count === 0) {
      console.log('ℹ️  No issues to clear\n');
      return;
    }

    console.log('🗑️  Clearing all issues...');
    const result = await Issue.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} issues\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

clearIssues();
