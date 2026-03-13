export default {
  title: 'ErrorCatcher',
  description: '通用的 Web 错误监控插件',
  
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '框架', link: '/frameworks/' }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          collapsed: false,
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '安装', link: '/guide/installation' },
            { text: '快速开始', link: '/guide/getting-started' }
          ]
        },
        {
          text: '配置',
          collapsed: false,
          items: [
            { text: '配置选项', link: '/guide/configuration' },
            { text: '环境变量', link: '/guide/environment-variables' }
          ]
        },
        {
          text: '功能',
          collapsed: false,
          items: [
            { text: '自动捕获', link: '/guide/auto-capture' },
            { text: '错误上下文', link: '/guide/error-context' },
            { text: '自定义上报', link: '/guide/custom-report' }
          ]
        },
        {
          text: '高级',
          collapsed: false,
          items: [
            { text: 'SSR 支持', link: '/guide/ssr' },
            { text: '最佳实践', link: '/guide/best-practices' }
          ]
        }
      ],
      
      '/api/': [
        {
          text: 'API 参考',
          collapsed: false,
          items: [
            { text: '概览', link: '/api/' },
            { text: '方法', link: '/api/methods' },
            { text: '事件', link: '/api/events' },
            { text: '详细错误捕获', link: '/api/detailed-error-capture' }
          ]
        }
      ],
      
      '/frameworks/': [
        {
          text: '框架集成',
          collapsed: false,
          items: [
            { text: '概览', link: '/frameworks/' },
            { text: 'Vue 2', link: '/frameworks/vue2' },
            { text: 'Vue 3', link: '/frameworks/vue3' },
            { text: 'React', link: '/frameworks/react' },
            { text: 'Nuxt 2', link: '/frameworks/nuxt2' },
            { text: 'Nuxt 3', link: '/frameworks/nuxt3' },
            { text: 'Next.js', link: '/frameworks/nextjs' },
            { text: 'jQuery', link: '/frameworks/jquery' },
            { text: 'PHP', link: '/frameworks/php' }
          ]
        }
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ]
  }
};
