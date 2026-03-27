import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          configure: (proxy) => {
            // 禁用响应缓冲，确保 SSE 流式正常工作
            proxy.on('proxyRes', (proxyRes) => {
              proxyRes.headers['x-accel-buffering'] = 'no';
            });
          }
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      minify: mode === 'production' ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'chart-vendor': ['echarts', 'vue-echarts'],
            'ui-vendor': ['@headlessui/vue', '@heroicons/vue']
          }
        }
      }
    },
    define: {
      __APP_ENV__: JSON.stringify(mode)
    }
  };
});
