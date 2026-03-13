#!/usr/bin/env node

/**
 * ErrorCatcher 构建脚本
 * 生成多种格式的分发文件
 */

const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '../src/core/ErrorCatcher.js');
const distDir = path.join(__dirname, '../dist');

// 确保 dist 目录存在
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log('📦 Building ErrorCatcher...\n');

// 读取源文件
const source = fs.readFileSync(sourceFile, 'utf-8');

// 1. UMD 版本 (已经在源文件中)
console.log('✅ Building UMD version...');
fs.writeFileSync(
  path.join(distDir, 'error-catcher.js'),
  source
);
console.log('   → dist/error-catcher.js\n');

// 2. ES Module 版本
console.log('✅ Building ES Module version...');
const esmSource = source.replace(
  /\/\/ UMD[\s\S]*?\}\)\);/,
  'export default ErrorCatcher;'
);
fs.writeFileSync(
  path.join(distDir, 'error-catcher.esm.js'),
  esmSource
);
console.log('   → dist/error-catcher.esm.js\n');

// 3. CommonJS 版本
console.log('✅ Building CommonJS version...');
const cjsSource = source.replace(
  /\/\/ UMD[\s\S]*?\}\)\);/,
  'module.exports = ErrorCatcher;'
);
fs.writeFileSync(
  path.join(distDir, 'error-catcher.cjs.js'),
  cjsSource
);
console.log('   → dist/error-catcher.cjs.js\n');

// 4. 浏览器版本 (IIFE)
console.log('✅ Building Browser version...');
const browserSource = source.replace(
  /\/\/ UMD[\s\S]*?\}\)\);/,
  'window.ErrorCatcher = ErrorCatcher;'
);
fs.writeFileSync(
  path.join(distDir, 'error-catcher.browser.js'),
  browserSource
);
console.log('   → dist/error-catcher.browser.js\n');

// 5. 复制到 examples 目录
console.log('✅ Copying to examples...');
fs.writeFileSync(
  path.join(__dirname, '../examples/ErrorCatcher.js'),
  browserSource
);
console.log('   → examples/ErrorCatcher.js');

// 复制到 jquery 子目录
fs.writeFileSync(
  path.join(__dirname, '../examples/jquery/ErrorCatcher.js'),
  browserSource
);
console.log('   → examples/jquery/ErrorCatcher.js');

// 复制到 nuxt3 public 目录
fs.writeFileSync(
  path.join(__dirname, '../examples/nuxt3/public/ErrorCatcher.js'),
  browserSource
);
console.log('   → examples/nuxt3/public/ErrorCatcher.js\n');

// 6. 生成 package.json 的 exports 字段建议
const packageExports = {
  ".": {
    "import": "./dist/error-catcher.esm.js",
    "require": "./dist/error-catcher.cjs.js",
    "browser": "./dist/error-catcher.browser.js",
    "default": "./dist/error-catcher.js"
  }
};

console.log('📝 Suggested package.json exports field:\n');
console.log(JSON.stringify(packageExports, null, 2));
console.log('\n✨ Build complete!\n');

// 7. 生成使用说明
const usageDoc = `# ErrorCatcher Distribution Files

## 📦 Available Formats

### 1. UMD (Universal Module Definition)
\`\`\`javascript
// Works in all environments
import ErrorCatcher from 'error-catcher';
// or
const ErrorCatcher = require('error-catcher');
// or
<script src="error-catcher.js"></script>
\`\`\`
**File:** \`dist/error-catcher.js\`

### 2. ES Module
\`\`\`javascript
import ErrorCatcher from 'error-catcher';
\`\`\`
**File:** \`dist/error-catcher.esm.js\`

### 3. CommonJS
\`\`\`javascript
const ErrorCatcher = require('error-catcher');
\`\`\`
**File:** \`dist/error-catcher.cjs.js\`

### 4. Browser (IIFE)
\`\`\`html
<script src="error-catcher.browser.js"></script>
<script>
  const tracker = new ErrorCatcher({ ... });
</script>
\`\`\`
**File:** \`dist/error-catcher.browser.js\`

## 🚀 Usage

### Browser (CDN)
\`\`\`html
<script src="https://unpkg.com/error-catcher/dist/error-catcher.browser.js"></script>
<script>
  const tracker = new ErrorCatcher({
    reportUrl: 'https://your-api.com/errors',
    projectId: 'your-project-id'
  });
  tracker.init();
</script>
\`\`\`

### Node.js
\`\`\`javascript
const ErrorCatcher = require('error-catcher');

const tracker = new ErrorCatcher({
  reportUrl: 'https://your-api.com/errors',
  projectId: 'your-project-id'
});
tracker.init();
\`\`\`

### ES6 Module
\`\`\`javascript
import ErrorCatcher from 'error-catcher';

const tracker = new ErrorCatcher({
  reportUrl: 'https://your-api.com/errors',
  projectId: 'your-project-id'
});
tracker.init();
\`\`\`

### Vue 3
\`\`\`javascript
import ErrorCatcher from 'error-catcher';
import { createApp } from 'vue';

const app = createApp(App);

const tracker = new ErrorCatcher({
  reportUrl: 'https://your-api.com/errors',
  projectId: 'your-project-id',
  vue: app
});
tracker.init();
\`\`\`

### React
\`\`\`javascript
import ErrorCatcher from 'error-catcher';

const tracker = new ErrorCatcher({
  reportUrl: 'https://your-api.com/errors',
  projectId: 'your-project-id',
  react: true
});
tracker.init();
\`\`\`

## 📊 File Sizes

- UMD: ~35KB
- ES Module: ~35KB
- CommonJS: ~35KB
- Browser: ~35KB

All files are unminified. For production, consider using a minifier.
`;

fs.writeFileSync(
  path.join(distDir, 'README.md'),
  usageDoc
);
console.log('📄 Generated dist/README.md\n');
