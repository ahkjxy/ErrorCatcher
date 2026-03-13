#!/usr/bin/env node

/**
 * 批量应用 i18n 到所有视图文件
 * 
 * 使用方法:
 * node admin/scripts/apply-i18n.js
 */

const fs = require('fs');
const path = require('path');

// 需要替换的文本映射
const replacements = {
  // 通用按钮
  '>Save<': '>{{ t(\'common.save\') }}<',
  '>Cancel<': '>{{ t(\'common.cancel\') }}<',
  '>Delete<': '>{{ t(\'common.delete\') }}<',
  '>Edit<': '>{{ t(\'common.edit\') }}<',
  '>Create<': '>{{ t(\'common.create\') }}<',
  '>Search<': '>{{ t(\'common.search\') }}<',
  '>Filter<': '>{{ t(\'common.filter\') }}<',
  '>Refresh<': '>{{ t(\'common.refresh\') }}<',
  '>Back<': '>{{ t(\'common.back\') }}<',
  '>Close<': '>{{ t(\'common.close\') }}<',
  '>Submit<': '>{{ t(\'common.submit\') }}<',
  '>View All<': '>{{ t(\'dashboard.viewAll\') }}<',
  
  // 状态
  '>Enabled<': '>{{ t(\'common.enabled\') }}<',
  '>Disabled<': '>{{ t(\'common.disabled\') }}<',
  '>Active<': '>{{ t(\'common.active\') }}<',
  '>Loading...<': '>{{ t(\'common.loading\') }}<',
  
  // 页面标题
  '>Dashboard<': '>{{ t(\'dashboard.title\') }}<',
  '>Projects<': '>{{ t(\'projects.title\') }}<',
  '>Errors<': '>{{ t(\'errors.title\') }}<',
  '>Issues<': '>{{ t(\'issues.title\') }}<',
  '>Alerts<': '>{{ t(\'alerts.title\') }}<',
  '>Notifications<': '>{{ t(\'notifications.title\') }}<',
  
  // 消息
  'Loading...': '{{ t(\'common.loading\') }}',
  'Operation successful': '{{ t(\'messages.operationSuccess\') }}',
  'Operation failed': '{{ t(\'messages.operationFailed\') }}',
};

// 需要添加 useI18n 导入的文件
const viewsDir = path.join(__dirname, '../src/views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.vue'));

console.log(`Found ${files.length} Vue files to process\n`);

files.forEach(file => {
  const filePath = path.join(viewsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 检查是否已经导入了 useI18n
  if (!content.includes('useI18n')) {
    console.log(`✓ Processing ${file}...`);
    
    // 查找 <script setup> 标签
    const scriptSetupMatch = content.match(/<script setup>([\s\S]*?)<\/script>/);
    
    if (scriptSetupMatch) {
      const scriptContent = scriptSetupMatch[1];
      
      // 添加 useI18n 导入
      if (!scriptContent.includes('import { useI18n }')) {
        const importMatch = scriptContent.match(/import .+ from .+;/);
        if (importMatch) {
          const lastImport = importMatch[0];
          const newImport = `${lastImport}\nimport { useI18n } from 'vue-i18n';`;
          content = content.replace(lastImport, newImport);
          
          // 添加 const { t } = useI18n();
          const firstConst = scriptContent.match(/const .+ = /);
          if (firstConst) {
            const insertion = `\nconst { t } = useI18n();\n`;
            content = content.replace(firstConst[0], insertion + firstConst[0]);
          }
        }
      }
      
      // 应用文本替换
      Object.entries(replacements).forEach(([from, to]) => {
        if (content.includes(from)) {
          content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
          console.log(`  - Replaced: ${from}`);
        }
      });
      
      // 写回文件
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✓ Updated ${file}\n`);
    }
  } else {
    console.log(`⊘ Skipped ${file} (already has i18n)\n`);
  }
});

console.log('\n✓ All files processed!');
console.log('\nNext steps:');
console.log('1. Review the changes');
console.log('2. Test each page');
console.log('3. Add more specific translations as needed');
