#!/usr/bin/env node

/**
 * 删除 projects 集合中的 appId 索引
 * 这是一个旧的索引，现在不再使用
 */

require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');

async function dropAppIdIndex() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('projects');

    // 列出所有索引
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`   - ${index.name}:`, JSON.stringify(index.key));
    });

    // 检查是否存在 appId 索引
    const appIdIndex = indexes.find(idx => idx.key.appId !== undefined);
    
    if (appIdIndex) {
      console.log(`\n🗑️  Dropping index: ${appIdIndex.name}`);
      await collection.dropIndex(appIdIndex.name);
      console.log('✅ Index dropped successfully');
    } else {
      console.log('\n✅ No appId index found, nothing to drop');
    }

    // 列出删除后的索引
    const newIndexes = await collection.indexes();
    console.log('\n📋 Indexes after cleanup:');
    newIndexes.forEach(index => {
      console.log(`   - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

dropAppIdIndex();
