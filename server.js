/**
 * 简单的 Web 服务器
 * 用于提供 examples 和 dist 文件
 * 
 * 使用方法:
 * node server.js
 * 
 * 然后访问:
 * http://localhost:8080/examples/jquery/
 * http://localhost:8080/examples/vanilla/
 * http://localhost:8080/examples/html/
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const ROOT_DIR = __dirname;

// MIME 类型映射
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
  // 解析 URL
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // 移除开头的斜杠
  if (pathname.startsWith('/')) {
    pathname = pathname.slice(1);
  }

  // 构建完整文件路径
  let filePath = path.join(ROOT_DIR, pathname);

  // 安全检查：防止目录遍历攻击
  const realPath = fs.realpathSync(ROOT_DIR);
  const realFilePath = fs.realpathSync(filePath);
  
  if (!realFilePath.startsWith(realPath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // 如果是目录，尝试提供 index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // 读取文件
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // 文件不存在
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>404 Not Found</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              h1 { color: #e74c3c; }
              p { color: #666; }
              a { color: #3498db; text-decoration: none; }
              a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <h1>404 Not Found</h1>
            <p>请求的文件不存在: ${pathname}</p>
            <p><a href="/">返回首页</a></p>
          </body>
          </html>
        `);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
      return;
    }

    // 获取文件扩展名
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // 设置响应头
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });

    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  🚀 ErrorCatcher Web Server 已启动                        ║
║                                                            ║
║  📍 服务器地址: http://localhost:${PORT}                   ║
║                                                            ║
║  📂 可访问的示例:                                          ║
║     • jQuery:   http://localhost:${PORT}/examples/jquery/  ║
║     • Vanilla:  http://localhost:${PORT}/examples/vanilla/ ║
║     • HTML:     http://localhost:${PORT}/examples/html/    ║
║     • Vue 3:    http://localhost:${PORT}/examples/vue3/    ║
║     • React:    http://localhost:${PORT}/examples/react/   ║
║                                                            ║
║  📦 可访问的文件:                                          ║
║     • UMD:      http://localhost:${PORT}/dist/error-catcher.js
║     • ESM:      http://localhost:${PORT}/dist/error-catcher.esm.js
║     • CJS:      http://localhost:${PORT}/dist/error-catcher.cjs.js
║     • Browser:  http://localhost:${PORT}/dist/error-catcher.browser.js
║                                                            ║
║  ⌨️  按 Ctrl+C 停止服务器                                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n\n👋 服务器已关闭');
  process.exit(0);
});
