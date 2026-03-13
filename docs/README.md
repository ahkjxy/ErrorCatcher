# ErrorCatcher 文档

基于 VitePress 的文档站点。

## 安装

```bash
cd docs
npm install
```

## 开发

```bash
npm run dev
```

访问 http://localhost:5173

## 构建

```bash
npm run build
```

构建产物在 `.vitepress/dist` 目录。

## 预览

```bash
npm run preview
```

## 文档结构

```
docs/
├── index.md              # 首页
├── guide/               # 指南
│   ├── index.md         # 介绍
│   ├── getting-started.md
│   ├── configuration.md
│   ├── ssr.md
│   ├── custom-report.md
│   └── best-practices.md
├── api/                 # API 文档
│   ├── error-catcher.md
│   ├── config.md
│   ├── methods.md
│   └── events.md
└── frameworks/          # 框架集成
    ├── vue2.md
    ├── vue3.md
    ├── nuxt2.md
    ├── nuxt3.md
    ├── react.md
    ├── nextjs.md
    ├── jquery.md
    └── php.md
```

## 部署

### GitHub Pages

```bash
npm run build
cd .vitepress/dist
git init
git add -A
git commit -m 'deploy'
git push -f git@github.com:username/repo.git master:gh-pages
```

### Vercel

直接连接 GitHub 仓库，Vercel 会自动检测 VitePress 并部署。

### Netlify

1. 连接 GitHub 仓库
2. 构建命令: `npm run build`
3. 发布目录: `docs/.vitepress/dist`
