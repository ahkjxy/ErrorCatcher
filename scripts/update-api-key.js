#!/usr/bin/env node

/**
 * 更新所有项目的API Key和项目ID
 * 用法: node scripts/update-api-key.js <apiKey> <projectId>
 */

const fs = require('fs');
const path = require('path');

const API_KEY = process.argv[2];
const PROJECT_ID = process.argv[3];

if (!API_KEY || !PROJECT_ID) {
  console.error('❌ 缺少参数');
  console.error('用法: node scripts/update-api-key.js <apiKey> <projectId>');
  console.error('示例: node scripts/update-api-key.js ec_a3f6bf3d2bf6378b8bf13ee9b1889fc3c2c42e5acbb55e27a8bda26cd3d17060 69ae7968cc87edb222a665dc');
  process.exit(1);
}

console.log('🔄 开始更新API Key和项目ID...');
console.log(`📝 API Key: ${API_KEY.substring(0, 20)}...`);
console.log(`📝 Project ID: ${PROJECT_ID}`);
console.log('');

// 需要更新的文件列表
const filesToUpdate = [
  'examples/html/index.html',
  'examples/vanilla/index.html',
  'examples/jquery/index.html',
  'examples/vue2/src/main.js',
  'examples/vue2/index.html',
  'examples/vue3/src/main.js',
  'examples/vue3/index.html',
  'examples/react/src/main.jsx',
  'examples/react/index.html',
  'examples/nextjs/lib/error-catcher.js',
  'examples/nuxt2/plugins/error-catcher.js',
  'examples/nuxt3/plugins/error-catcher.client.js',
  'examples/php/index.php',
  'test-examples.html',
  'src/core/ErrorCatcher.js',
  'admin/src/main.js'
];

let updatedCount = 0;
let skippedCount = 0;

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  跳过 (不存在): ${filePath}`);
    skippedCount++;
    return;
  }
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let updated = false;
    
    // 替换API Key (多种格式)
    const apiKeyPatterns = [
      /apiKey\s*:\s*['"][^'"]*['"]/g,
      /apiKey\s*=\s*['"][^'"]*['"]/g,
      /API_KEY\s*=\s*['"][^'"]*['"]/g,
      /api_key\s*:\s*['"][^'"]*['"]/g,
      /api_key\s*=\s*['"][^'"]*['"]/g,
      /'X-API-Key'\s*:\s*['"][^'"]*['"]/g,
      /"X-API-Key"\s*:\s*['"][^'"]*['"]/g,
      /Authorization\s*:\s*['"]Bearer\s+[^'"]*['"]/g
    ];
    
    apiKeyPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, (match) => {
          if (match.includes('apiKey')) {
            return match.includes(':') ? `apiKey: '${API_KEY}'` : `apiKey = '${API_KEY}'`;
          } else if (match.includes('API_KEY')) {
            return `API_KEY = '${API_KEY}'`;
          } else if (match.includes('api_key')) {
            return match.includes(':') ? `api_key: '${API_KEY}'` : `api_key = '${API_KEY}'`;
          } else if (match.includes('X-API-Key')) {
            return match.includes(':') ? `'X-API-Key': '${API_KEY}'` : `"X-API-Key": "${API_KEY}"`;
          } else if (match.includes('Authorization')) {
            return `Authorization: 'Bearer ${API_KEY}'`;
          }
          return match;
        });
        updated = true;
      }
    });
    
    // 替换项目ID (多种格式)
    const projectIdPatterns = [
      /projectId\s*:\s*['"][^'"]*['"]/g,
      /projectId\s*=\s*['"][^'"]*['"]/g,
      /PROJECT_ID\s*=\s*['"][^'"]*['"]/g,
      /project_id\s*:\s*['"][^'"]*['"]/g,
      /project_id\s*=\s*['"][^'"]*['"]/g
    ];
    
    projectIdPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, (match) => {
          if (match.includes('projectId')) {
            return match.includes(':') ? `projectId: '${PROJECT_ID}'` : `projectId = '${PROJECT_ID}'`;
          } else if (match.includes('PROJECT_ID')) {
            return `PROJECT_ID = '${PROJECT_ID}'`;
          } else if (match.includes('project_id')) {
            return match.includes(':') ? `project_id: '${PROJECT_ID}'` : `project_id = '${PROJECT_ID}'`;
          }
          return match;
        });
        updated = true;
      }
    });
    
    if (updated) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ 已更新: ${filePath}`);
      updatedCount++;
    } else {
      console.log(`⏭️  跳过 (无匹配): ${filePath}`);
      skippedCount++;
    }
  } catch (error) {
    console.error(`❌ 错误: ${filePath} - ${error.message}`);
  }
});

console.log('');
console.log('='.repeat(60));
console.log(`✅ 更新完成`);
console.log(`📊 已更新: ${updatedCount} 个文件`);
console.log(`⏭️  已跳过: ${skippedCount} 个文件`);
console.log('='.repeat(60));
