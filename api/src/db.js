const mongoose = require('mongoose');
const config = require('../config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Environment: ${config.env}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    
    // 监听连接事件
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    console.error(`当前环境: ${config.env}`);
    console.error('请确保 MongoDB 已安装并运行');
    console.error('安装命令:');
    console.error('  macOS: brew install mongodb-community && brew services start mongodb-community');
    console.error('  Ubuntu: sudo apt install mongodb && sudo systemctl start mongodb');
    console.error('  Windows: 下载 https://www.mongodb.com/try/download/community');
    process.exit(1);
  }
};

module.exports = { connectDB };
