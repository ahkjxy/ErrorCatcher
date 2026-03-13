<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PHP ErrorCatcher Example</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
    }
    button {
      margin: 10px;
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
      background: #777bb3;
      color: white;
      border: none;
      border-radius: 4px;
    }
    button:hover {
      background: #5f5f9f;
    }
    .info {
      background: #e3f2fd;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .status {
      margin-top: 20px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>PHP ErrorCatcher Example</h1>
  
  <div class="info">
    <p>这个示例展示了如何在 PHP 项目中使用 ErrorCatcher。</p>
    <p>打开浏览器控制台查看错误捕获日志。</p>
    <p>当前用户: <?php echo $_SESSION['user_id'] ?? 'Guest'; ?></p>
  </div>

  <div class="buttons">
    <button onclick="triggerJsError()">触发 JS 错误</button>
    <button onclick="triggerPromiseError()">触发 Promise 错误</button>
    <button onclick="triggerApiError()">触发 API 错误</button>
    <button onclick="manualReport()">手动上报</button>
  </div>

  <div class="status">
    <p>错误已捕获: <span id="errorCount">0</span></p>
  </div>

  <script src="../../dist/error-catcher.min.js"></script>
  <script>
    let errorCount = 0;

    // 初始化 ErrorCatcher
    const tracker = initErrorTracker({
      reportUrl: 'http://localhost:3001/api/errors/report',
      projectId: '69ae7968cc87edb222a665dc',
      apiKey: 'ec_a3f6bf3d2bf6378b8bf13ee9b1889fc3c2c42e5acbb55e27a8bda26cd3d17060',
      environment: '<?php echo getenv('APP_ENV') ?: 'production'; ?>',
      userId: '<?php echo $_SESSION['user_id'] ?? ''; ?>',
      context: {
        page: '<?php echo basename($_SERVER['PHP_SELF']); ?>',
        sessionId: '<?php echo session_id(); ?>'
      },
      debug: true
    });

    function triggerJsError() {
      throw new Error('这是一个测试 JS 错误');
    }

    function triggerPromiseError() {
      Promise.reject(new Error('这是一个测试 Promise 错误'));
    }

    async function triggerApiError() {
      try {
        await fetch('http://localhost:3001/api/not-found');
      } catch (error) {
        console.error('API Error:', error);
      }
    }

    function manualReport() {
      tracker.report(new Error('手动上报的错误'), {
        action: 'manualReport',
        timestamp: new Date().toISOString()
      });
      errorCount++;
      document.getElementById('errorCount').textContent = errorCount;
      alert('错误已手动上报！');
    }
  </script>
</body>
</html>
