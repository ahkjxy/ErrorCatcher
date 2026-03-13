/**
 * 检查 Issues 数据
 */

const mongoose = require('mongoose');
const Issue = require('../src/models/Issue');
const Error = require('../src/models/Error');
require('dotenv').config({ path: '../.env.dev' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/error-catcher';

async function checkIssues() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 统计 Issues
    const issueCount = await Issue.countDocuments();
    console.log(`📊 Total Issues: ${issueCount}`);

    // 统计 Errors
    const errorCount = await Error.countDocuments();
    console.log(`📊 Total Errors: ${errorCount}\n`);

    if (issueCount === 0) {
      console.log('⚠️  No issues found. Issues should be created automatically when errors are reported.');
      console.log('   Run: node scripts/seed-data.js to create test data\n');
      return;
    }

    // 显示前 10 个 Issues
    console.log('📝 Sample Issues:\n');
    const issues = await Issue.find()
      .sort({ lastSeen: -1 })
      .limit(10)
      .populate('sampleEvent')
      .lean();

    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.title}`);
      console.log(`   ID: ${issue._id}`);
      console.log(`   Fingerprint: ${issue.fingerprint.join(' > ')}`);
      console.log(`   Count: ${issue.count} events`);
      console.log(`   Users: ${issue.userCount}`);
      console.log(`   Status: ${issue.status}`);
      console.log(`   Level: ${issue.level}`);
      console.log(`   First Seen: ${issue.firstSeen}`);
      console.log(`   Last Seen: ${issue.lastSeen}`);
      console.log('');
    });

    // 检查是否有重复的 fingerprint
    console.log('🔍 Checking for duplicate fingerprints...\n');
    const duplicates = await Issue.aggregate([
      {
        $group: {
          _id: { fingerprint: '$fingerprint', projectId: '$projectId' },
          count: { $sum: 1 },
          ids: { $push: '$_id' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    if (duplicates.length > 0) {
      console.log(`⚠️  Found ${duplicates.length} duplicate fingerprints:`);
      duplicates.forEach((dup, index) => {
        console.log(`${index + 1}. Fingerprint: ${dup._id.fingerprint.join(' > ')}`);
        console.log(`   Count: ${dup.count}`);
        console.log(`   IDs: ${dup.ids.join(', ')}`);
        console.log('');
      });
    } else {
      console.log('✅ No duplicate fingerprints found\n');
    }

    // 检查 Issue 和 Error 的关联
    console.log('🔗 Checking Issue-Error relationships...\n');
    const sampleIssue = issues[0];
    if (sampleIssue) {
      const relatedErrors = await Error.find({
        fingerprint: sampleIssue.fingerprint
      }).limit(5);

      console.log(`Issue: ${sampleIssue.title}`);
      console.log(`Related Errors: ${relatedErrors.length}`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

checkIssues();
