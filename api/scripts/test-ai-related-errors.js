#!/usr/bin/env node

/**
 * 测试 AI 分析中的相关错误数据
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Error = require('../src/models/Error');
const ErrorAnalysis = require('../src/models/ErrorAnalysis');

async function testRelatedErrors() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sentry-clone');
    console.log('✓ Connected to MongoDB');

    // 查找一个有分析结果的错误
    const analysis = await ErrorAnalysis.findOne({ 
      relatedErrors: { $exists: true, $ne: [] } 
    }).lean();

    if (!analysis) {
      console.log('⚠️  No analysis with related errors found');
      process.exit(0);
    }

    console.log('\n📊 Analysis found:');
    console.log('- Error ID:', analysis.errorId);
    console.log('- Related Errors (raw):', analysis.relatedErrors);

    // 手动填充相关错误详情
    if (analysis.relatedErrors && analysis.relatedErrors.length > 0) {
      const relatedErrorsDetails = await Error.find({
        _id: { $in: analysis.relatedErrors }
      }).select('_id message type timestamp pageUrl').lean();
      
      console.log('\n📋 Related Errors Details:');
      relatedErrorsDetails.forEach((err, index) => {
        console.log(`\n${index + 1}. Error ${err._id}`);
        console.log('   Message:', err.message);
        console.log('   Type:', err.type);
        console.log('   Timestamp:', err.timestamp);
        console.log('   Page URL:', err.pageUrl || 'N/A');
      });

      // 测试 API 返回格式
      analysis.relatedErrors = relatedErrorsDetails;
      console.log('\n✅ Analysis with populated related errors:');
      console.log(JSON.stringify({
        rootCause: analysis.rootCause,
        relatedErrors: analysis.relatedErrors
      }, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

testRelatedErrors();
