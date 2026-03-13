# PHP 集成

ErrorCatcher 可以在 PHP 项目中使用，通过在前端页面引入 JavaScript 库来捕获客户端错误。

## 安装

### 方式 1: CDN

```html
<script src="https://unpkg.com/error-catcher/dist/error-catcher.min.js"></script>
```

### 方式 2: 本地文件

下载 `error-catcher.min.js` 到项目目录：

```bash
wget https://unpkg.com/error-catcher/dist/error-catcher.min.js -P public/js/
```

## 基础使用

在 PHP 模板中引入：

```php
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title><?php echo $title; ?></title>
</head>
<body>
    <!-- 你的内容 -->
    
    <script src="/js/error-catcher.min.js"></script>
    <script>
        const tracker = new ErrorCatcher({
            reportUrl: '<?php echo ERROR_REPORT_URL; ?>',
            projectId: '<?php echo ERROR_PROJECT_ID; ?>',
            apiKey: '<?php echo ERROR_API_KEY; ?>',
            environment: '<?php echo ENVIRONMENT; ?>',
            debug: <?php echo DEBUG ? 'true' : 'false'; ?>
        });
    </script>
</body>
</html>
```

## 配置文件

创建 `config/error-catcher.php`：

```php
<?php

return [
    'report_url' => getenv('ERROR_REPORT_URL') ?: 'http://localhost:3001/api/errors/report',
    'project_id' => getenv('ERROR_PROJECT_ID') ?: 'your-project-id',
    'api_key' => getenv('ERROR_API_KEY') ?: 'your-api-key',
    'environment' => getenv('ENVIRONMENT') ?: 'production',
    'debug' => getenv('DEBUG') === 'true',
    'sample_rate' => 0.8,
];
```

使用配置：

```php
<?php
$config = require __DIR__ . '/config/error-catcher.php';
?>

<!DOCTYPE html>
<html>
<head>
    <title>My PHP App</title>
</head>
<body>
    <script src="/js/error-catcher.min.js"></script>
    <script>
        const tracker = new ErrorCatcher({
            reportUrl: '<?php echo $config['report_url']; ?>',
            projectId: '<?php echo $config['project_id']; ?>',
            apiKey: '<?php echo $config['api_key']; ?>',
            environment: '<?php echo $config['environment']; ?>',
            debug: <?php echo $config['debug'] ? 'true' : 'false'; ?>,
            sampleRate: <?php echo $config['sample_rate']; ?>
        });
    </script>
</body>
</html>
```

## Laravel 集成

### 创建配置文件

`config/error-catcher.php`：

```php
<?php

return [
    'report_url' => env('ERROR_REPORT_URL', 'http://localhost:3001/api/errors/report'),
    'project_id' => env('ERROR_PROJECT_ID', 'your-project-id'),
    'api_key' => env('ERROR_API_KEY', 'your-api-key'),
    'environment' => env('APP_ENV', 'production'),
    'debug' => env('APP_DEBUG', false),
    'sample_rate' => env('ERROR_SAMPLE_RATE', 0.8),
];
```

### 创建 Blade 组件

`resources/views/components/error-catcher.blade.php`：

```blade
<script src="{{ asset('js/error-catcher.min.js') }}"></script>
<script>
    const tracker = new ErrorCatcher({
        reportUrl: '{{ config('error-catcher.report_url') }}',
        projectId: '{{ config('error-catcher.project_id') }}',
        apiKey: '{{ config('error-catcher.api_key') }}',
        environment: '{{ config('error-catcher.environment') }}',
        debug: {{ config('error-catcher.debug') ? 'true' : 'false' }},
        sampleRate: {{ config('error-catcher.sample_rate') }}
    });

    @auth
    // 设置用户信息
    tracker.setUser({
        id: '{{ auth()->id() }}',
        username: '{{ auth()->user()->name }}',
        email: '{{ auth()->user()->email }}'
    });
    @endauth
</script>
```

### 在布局中使用

`resources/views/layouts/app.blade.php`：

```blade
<!DOCTYPE html>
<html>
<head>
    <title>@yield('title')</title>
</head>
<body>
    @yield('content')
    
    <x-error-catcher />
</body>
</html>
```

## Symfony 集成

### 创建 Twig 扩展

`src/Twig/ErrorCatcherExtension.php`：

```php
<?php

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class ErrorCatcherExtension extends AbstractExtension
{
    private $reportUrl;
    private $projectId;
    private $apiKey;
    private $environment;
    private $debug;

    public function __construct(
        string $reportUrl,
        string $projectId,
        string $apiKey,
        string $environment,
        bool $debug
    ) {
        $this->reportUrl = $reportUrl;
        $this->projectId = $projectId;
        $this->apiKey = $apiKey;
        $this->environment = $environment;
        $this->debug = $debug;
    }

    public function getFunctions()
    {
        return [
            new TwigFunction('error_catcher_config', [$this, 'getConfig']),
        ];
    }

    public function getConfig(): array
    {
        return [
            'reportUrl' => $this->reportUrl,
            'projectId' => $this->projectId,
            'apiKey' => $this->apiKey,
            'environment' => $this->environment,
            'debug' => $this->debug,
        ];
    }
}
```

### 在模板中使用

`templates/base.html.twig`：

```twig
<!DOCTYPE html>
<html>
<head>
    <title>{% block title %}{% endblock %}</title>
</head>
<body>
    {% block body %}{% endblock %}
    
    <script src="{{ asset('js/error-catcher.min.js') }}"></script>
    <script>
        {% set config = error_catcher_config() %}
        const tracker = new ErrorCatcher({
            reportUrl: '{{ config.reportUrl }}',
            projectId: '{{ config.projectId }}',
            apiKey: '{{ config.apiKey }}',
            environment: '{{ config.environment }}',
            debug: {{ config.debug ? 'true' : 'false' }}
        });

        {% if app.user %}
        tracker.setUser({
            id: '{{ app.user.id }}',
            username: '{{ app.user.username }}',
            email: '{{ app.user.email }}'
        });
        {% endif %}
    </script>
</body>
</html>
```

## WordPress 集成

### 创建插件

`wp-content/plugins/error-catcher/error-catcher.php`：

```php
<?php
/**
 * Plugin Name: ErrorCatcher
 * Description: 前端错误监控
 * Version: 1.0.0
 */

function error_catcher_enqueue_scripts() {
    wp_enqueue_script(
        'error-catcher',
        plugin_dir_url(__FILE__) . 'js/error-catcher.min.js',
        [],
        '1.0.0',
        true
    );

    $config = [
        'reportUrl' => get_option('error_catcher_report_url', 'http://localhost:3001/api/errors/report'),
        'projectId' => get_option('error_catcher_project_id', 'your-project-id'),
        'apiKey' => get_option('error_catcher_api_key', 'your-api-key'),
        'environment' => wp_get_environment_type(),
        'debug' => WP_DEBUG,
    ];

    wp_add_inline_script('error-catcher', '
        const tracker = new ErrorCatcher(' . json_encode($config) . ');
        
        ' . (is_user_logged_in() ? '
        tracker.setUser({
            id: "' . get_current_user_id() . '",
            username: "' . wp_get_current_user()->user_login . '",
            email: "' . wp_get_current_user()->user_email . '"
        });
        ' : '') . '
    ');
}

add_action('wp_enqueue_scripts', 'error_catcher_enqueue_scripts');
```

## 自动捕获

ErrorCatcher 会自动捕获全局 JavaScript 错误、Promise 拒绝和网络请求错误。详见 [自动捕获功能](/guide/auto-capture.md)。

⚠️ jQuery Ajax 错误会自动捕获（如果使用 jQuery）。

## 完整配置示例

```php
<?php
$config = [
    'report_url' => 'http://your-api.com/api/errors/report',
    'project_id' => 'your-project-id',
    'api_key' => 'your-api-key',
    'environment' => 'production',
    'debug' => false,
    'sample_rate' => 0.8,
    'max_batch_size' => 20,
    'delay' => 2000,
];
?>

<script src="/js/error-catcher.min.js"></script>
<script>
    const tracker = new ErrorCatcher({
        reportUrl: '<?php echo $config['report_url']; ?>',
        projectId: '<?php echo $config['project_id']; ?>',
        apiKey: '<?php echo $config['api_key']; ?>',
        environment: '<?php echo $config['environment']; ?>',
        debug: <?php echo $config['debug'] ? 'true' : 'false'; ?>,
        sampleRate: <?php echo $config['sample_rate']; ?>,
        maxBatchSize: <?php echo $config['max_batch_size']; ?>,
        delay: <?php echo $config['delay']; ?>,
        
        ignoreUrls: [
            /analytics/,
            /tracking/,
            /\.(jpg|png|gif)$/
        ],
        
        beforeSend: function(error) {
            if (error.url && error.url.includes('password')) {
                return false;
            }
            return error;
        },
        
        onError: function(error) {
            console.log('Error captured:', error);
        }
    });

    <?php if (isset($_SESSION['user_id'])): ?>
    // 设置用户信息
    tracker.setUser({
        id: '<?php echo $_SESSION['user_id']; ?>',
        username: '<?php echo $_SESSION['username']; ?>',
        email: '<?php echo $_SESSION['email']; ?>'
    });
    <?php endif; ?>
</script>
```

## API 方法

详见 [错误上下文结构](/guide/error-context.md) 了解完整的 API 方法和上下文结构。

常用方法：

```javascript
// 手动上报错误
tracker.report(new Error('Something went wrong'), {
    action: 'formSubmit',
    formId: 'contact-form'
});

// 设置用户信息
tracker.setUser({
    id: 'user-123',
    username: 'john_doe',
    email: 'john@example.com'
});

// 设置标签
tracker.setTag('page', 'checkout');
tracker.setTags({
    page: 'checkout',
    version: '1.0.0'
});

// 添加面包屑
tracker.addBreadcrumb({
    category: 'user',
    message: 'User submitted form',
    level: 'info',
    data: {
        formId: 'contact-form'
    }
});
```

## 最佳实践

### 1. 使用环境变量

```php
// .env
ERROR_REPORT_URL=http://localhost:3001/api/errors/report
ERROR_PROJECT_ID=your-project-id
ERROR_API_KEY=your-api-key
ENVIRONMENT=production
DEBUG=false
```

### 2. 创建辅助函数

```php
<?php

function get_error_catcher_config() {
    return [
        'reportUrl' => getenv('ERROR_REPORT_URL'),
        'projectId' => getenv('ERROR_PROJECT_ID'),
        'apiKey' => getenv('ERROR_API_KEY'),
        'environment' => getenv('ENVIRONMENT'),
        'debug' => getenv('DEBUG') === 'true',
    ];
}

function render_error_catcher() {
    $config = get_error_catcher_config();
    ?>
    <script src="/js/error-catcher.min.js"></script>
    <script>
        const tracker = new ErrorCatcher(<?php echo json_encode($config); ?>);
    </script>
    <?php
}
```

### 3. 用户登录后设置用户信息

```php
<?php
session_start();

if (isset($_SESSION['user_id'])) {
    ?>
    <script>
        tracker.setUser({
            id: '<?php echo $_SESSION['user_id']; ?>',
            username: '<?php echo $_SESSION['username']; ?>',
            email: '<?php echo $_SESSION['email']; ?>'
        });
    </script>
    <?php
}
?>
```

### 4. AJAX 请求错误处理

```javascript
// 使用 jQuery
$.ajax({
    url: '/api/data',
    method: 'GET',
    success: function(data) {
        console.log('Success:', data);
    },
    error: function(xhr, status, error) {
        // ErrorCatcher 已自动捕获
        console.error('Error:', error);
    }
});

// 使用 Fetch
fetch('/api/data')
    .then(response => response.json())
    .then(data => console.log('Success:', data))
    .catch(error => {
        // ErrorCatcher 已自动捕获
        console.error('Error:', error);
    });
```

## 相关文档

- [配置详解](/guide/configuration)
- [API 方法](/api/methods)
- [最佳实践](/guide/best-practices)
