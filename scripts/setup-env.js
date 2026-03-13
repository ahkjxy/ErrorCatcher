#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 设置环境配置文件...\n');

// API 环境配置
const apiEnvFiles = [
  { src: 'api/.env.example', dest: 'api/.env.dev' },
  { src: 'api/.env.example', dest: 'api/.env' }
];

apiEnvFiles.forEach(({ src, dest }) => {
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ 创建: ${dest}`);
  } else {
    console.log(`⏭️  跳过: ${dest} (已存在)`);
  }
});

console.log('\n✨ 环境配置完成！\n');
console.log('📝 下一步:');
console.log('1. 启动 MongoDB:');
console.log('   docker run -d --name mongodb -p 27017:27017 mongo:7.0');
console.log('');
console.log('2. 启动所有服务:');
console.log('   npm run dev');
console.log('');
