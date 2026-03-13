/**
 * 检查错误的 fingerprint
 */

const mongoose = require('mongoose');
const Error = require('../src/models/Error');
const { generateFingerprint } = require('../src/middleware/issueGrouping');
require('dotenv').config({ path: '../.env.dev' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/error-catcher';

async function checkErrorFingerprints() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const errors = await Error.find().limit(10);
    console.log(`📊 Found ${errors.length} errors\n`);

    errors.forEach((error, index) => {
      console.log(`${index + 1}. Error ID: ${error._id}`);
      console.log(`   Type: ${error.type}`);
      console.log(`   Message: ${error.message}`);
      console.log(`   Fingerprint: ${JSON.stringify(error.fingerprint)}`);
      
      // 生成新的 fingerprint
      const newFingerprint = generateFingerprint(error);
      console.log(`   Generated: ${JSON.stringify(newFingerprint)}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

checkErrorFingerprints();
