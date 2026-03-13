const mongoose = require('mongoose');
const Error = require('../src/models/Error');
const Issue = require('../src/models/Issue');
const { createOrUpdateIssue, generateFingerprint } = require('../src/middleware/issueGrouping');

// 从环境变量或配置文件获取数据库连接
const config = require('../config');

async function generateIssuesFromErrors() {
  try {
    console.log('连接数据库...');
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    console.log('数据库连接成功！');

    // 获取所有错误
    console.log('获取所有错误...');
    const errors = await Error.find({}).lean();
    console.log(`找到 ${errors.length} 个错误`);

    if (errors.length === 0) {
      console.log('没有错误数据，无需生成 Issue');
      process.exit(0);
    }

    // 为每个错误生成或更新 fingerprint
    console.log('处理错误并生成 fingerprint...');
    const updatePromises = errors.map(async (error) => {
      if (!error.fingerprint || !Array.isArray(error.fingerprint) || error.fingerprint.length === 0) {
        const fingerprint = generateFingerprint(error);
        await Error.findByIdAndUpdate(error._id, { fingerprint });
        return { ...error, fingerprint };
      }
      return error;
    });

    const updatedErrors = await Promise.all(updatePromises);
    console.log('Fingerprint 生成完成');

    // 为每个错误创建或更新 Issue
    console.log('创建或更新 Issues...');
    let successCount = 0;
    let errorCount = 0;

    for (const error of updatedErrors) {
      try {
        // 重新获取完整的错误对象（包含 _id）
        const fullError = await Error.findById(error._id);
        if (fullError) {
          await createOrUpdateIssue(fullError);
          successCount++;
          if (successCount % 10 === 0) {
            console.log(`已处理 ${successCount} 个错误...`);
          }
        }
      } catch (err) {
        console.error(`处理错误 ${error._id} 失败:`, err.message);
        errorCount++;
      }
    }

    console.log('\n生成完成！');
    console.log(`成功: ${successCount}`);
    console.log(`失败: ${errorCount}`);

    // 统计 Issue 数量
    const issueCount = await Issue.countDocuments();
    console.log(`\n当前 Issue 总数: ${issueCount}`);

    // 显示一些 Issue 示例
    const sampleIssues = await Issue.find().limit(5).lean();
    console.log('\nIssue 示例:');
    sampleIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.title} (${issue.count} 次, ${issue.userCount} 用户)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('生成 Issues 失败:', error);
    process.exit(1);
  }
}

// 运行脚本
generateIssuesFromErrors();
