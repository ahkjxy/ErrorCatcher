/**
 * 从现有错误创建 Issues
 * 用于修复没有自动创建 Issue 的错误
 */

const mongoose = require('mongoose');
const Error = require('../src/models/Error');
const { createOrUpdateIssue } = require('../src/middleware/issueGrouping');
require('dotenv').config({ path: '../.env.dev' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/error-catcher';

async function createIssuesFromErrors() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 获取所有错误
    const errors = await Error.find().sort({ timestamp: 1 });
    console.log(`📊 Found ${errors.length} errors\n`);

    if (errors.length === 0) {
      console.log('⚠️  No errors found.');
      return;
    }

    console.log('🔄 Creating/updating issues...\n');
    let created = 0;
    let updated = 0;

    for (const error of errors) {
      try {
        const issue = await createOrUpdateIssue(error);
        if (issue.count === 1) {
          created++;
          console.log(`✅ Created issue: ${issue.title}`);
        } else {
          updated++;
          console.log(`🔄 Updated issue: ${issue.title} (count: ${issue.count})`);
        }
      } catch (err) {
        console.error(`❌ Failed to create/update issue for error ${error._id}:`, err.message);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Created: ${created} issues`);
    console.log(`   Updated: ${updated} issues`);
    console.log(`   Total: ${created + updated} issues\n`);

    console.log('✅ Done!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

createIssuesFromErrors();
