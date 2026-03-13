const mongoose = require('mongoose');
const config = require('../config');
const aiAnalysisService = require('../src/services/aiAnalysisService');

async function testAIAnalysis() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('✓ Connected to MongoDB');

    const Error = require('../src/models/Error');

    console.log('\n=== Testing AI Analysis Service ===\n');

    // 检查 AI 服务是否启用
    if (!aiAnalysisService.enabled) {
      console.log('⚠️  AI Analysis is disabled');
      console.log('To enable, set OPENAI_API_KEY in your environment variables');
      console.log('\nExample:');
      console.log('export OPENAI_API_KEY=sk-...');
      process.exit(0);
    }

    console.log('✓ AI Analysis service is enabled');
    console.log(`Model: ${aiAnalysisService.model}`);

    // 查找一个错误进行测试
    const error = await Error.findOne().sort({ timestamp: -1 });

    if (!error) {
      console.log('✗ No errors found in database');
      console.log('Please trigger some errors first');
      process.exit(1);
    }

    console.log('\n--- Testing Error ---');
    console.log('Error ID:', error._id);
    console.log('Message:', error.message);
    console.log('Type:', error.type);
    console.log('Level:', error.level);

    console.log('\n--- Analyzing... ---');
    console.log('This may take a few seconds...\n');

    const startTime = Date.now();
    const analysis = await aiAnalysisService.analyzeError({
      message: error.message,
      type: error.type,
      level: error.level,
      stack: error.stack,
      pageUrl: error.pageUrl,
      apiUrl: error.apiUrl,
      method: error.method,
      status: error.status,
      statusText: error.statusText,
      userAgent: error.userAgent,
      context: error.context
    });
    const duration = Date.now() - startTime;

    console.log('✓ Analysis completed in', duration, 'ms\n');

    console.log('=== Analysis Result ===\n');
    console.log('Success:', analysis.success);
    console.log('Root Cause:', analysis.rootCause);
    console.log('Category:', analysis.category);
    console.log('Confidence:', (analysis.confidence * 100).toFixed(0) + '%');
    console.log('Model:', analysis.model);

    if (analysis.analysis) {
      console.log('\nDetailed Analysis:');
      console.log(analysis.analysis);
    }

    if (analysis.possibleReasons && analysis.possibleReasons.length > 0) {
      console.log('\nPossible Reasons:');
      analysis.possibleReasons.forEach((reason, i) => {
        console.log(`  ${i + 1}. ${reason}`);
      });
    }

    if (analysis.suggestedFixes && analysis.suggestedFixes.length > 0) {
      console.log('\nSuggested Fixes:');
      analysis.suggestedFixes.forEach((fix, i) => {
        console.log(`  ${i + 1}. [${fix.priority.toUpperCase()}] ${fix.title}`);
        console.log(`     ${fix.description}`);
      });
    }

    if (analysis.preventionTips && analysis.preventionTips.length > 0) {
      console.log('\nPrevention Tips:');
      analysis.preventionTips.forEach((tip, i) => {
        console.log(`  ${i + 1}. ${tip}`);
      });
    }

    // 测试保存分析结果
    console.log('\n--- Saving Analysis ---');
    const ErrorAnalysis = require('../src/models/ErrorAnalysis');
    
    const savedAnalysis = await ErrorAnalysis.findOneAndUpdate(
      { errorId: error._id },
      {
        errorId: error._id,
        projectId: error.projectId,
        ...analysis
      },
      { upsert: true, new: true }
    );

    console.log('✓ Analysis saved with ID:', savedAnalysis._id);

    // 测试检索分析结果
    console.log('\n--- Retrieving Analysis ---');
    const retrieved = await ErrorAnalysis.findOne({ errorId: error._id });
    console.log('✓ Analysis retrieved successfully');
    console.log('Root Cause:', retrieved.rootCause);
    console.log('Confidence:', (retrieved.confidence * 100).toFixed(0) + '%');

  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    if (error.response?.data) {
      console.error('API Error:', error.response.data);
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

testAIAnalysis();
