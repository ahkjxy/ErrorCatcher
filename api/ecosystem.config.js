module.exports = {
  apps: [
    {
      name: 'error-catcher-dev',
      script: './src/index.js',
      env: {
        NODE_ENV: 'dev',
        PORT: 3001
      },
      watch: true,
      ignore_watch: ['node_modules', 'logs'],
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'error-catcher-test',
      script: './src/index.js',
      env: {
        NODE_ENV: 'test',
        PORT: 3001
      },
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '500M'
    },
    {
      name: 'error-catcher-pre',
      script: './src/index.js',
      env: {
        NODE_ENV: 'pre',
        PORT: 3001
      },
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '800M',
      error_file: './logs/pre-error.log',
      out_file: './logs/pre-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'error-catcher-prod',
      script: './src/index.js',
      env: {
        NODE_ENV: 'prod',
        PORT: 3001
      },
      instances: 'max',
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      error_file: './logs/prod-error.log',
      out_file: './logs/prod-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
