/**
 * 修复 Issue 的 userCount
 * 重新计算所有 Issue 的用户数量
 */

const mongoose = require('mongoose');
const Issue = require('../src/models/Issue');
const Error = require('../src/models/Error');
const config = require('../config');

async function fixUserCount() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');

    const issues = await Issue.find({});
    console.log(`Found ${issues.length} issues to process`);

    let updated = 0;
    let skipped = 0;

    for (const issue of issues) {
      // 查找该 Issue 下所有有 user.id 的错误 - 使用数组完全匹配
      const errors = await Error.find({
        fingerprint: { $eq: issue.fingerprint },  // 数组完全匹配
        projectId: issue.projectId,
        'user.id': { $exists: true, $ne: null }
      }).lean();

      const userIds = await Error.distinct('user.id', {
        fingerprint: { $eq: issue.fingerprint },  // 数组完全匹配
        projectId: issue.projectId,
        'user.id': { $exists: true, $ne: null }
      });

      const newUserCount = userIds.length;

      console.log(`\nIssue ${issue._id}:`);
      console.log(`  Title: ${issue.title}`);
      console.log(`  Fingerprint: ${JSON.stringify(issue.fingerprint)}`);
      console.log(`  Errors with user: ${errors.length}`);
      console.log(`  Old userCount: ${issue.userCount}`);
      console.log(`  New userCount: ${newUserCount}`);
      if (userIds.length > 0) {
        console.log(`  Users: ${userIds.join(', ')}`);
      }

      if (newUserCount !== issue.userCount) {
        issue.userCount = newUserCount;
        await issue.save();
        updated++;
      } else {
        skipped++;
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total issues: ${issues.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Skipped (already correct): ${skipped}`);

    await mongoose.disconnect();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixUserCount();
