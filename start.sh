#!/bin/bash

# ErrorCatcher 一键启动脚本

echo "=================================="
echo "  ErrorCatcher 启动脚本"
echo "=================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查 MongoDB
echo -e "${BLUE}[1/5]${NC} 检查 MongoDB..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.version()" &> /dev/null; then
        echo -e "${GREEN}✓${NC} MongoDB 正在运行"
    else
        echo -e "${YELLOW}⚠${NC} MongoDB 未运行，尝试启动..."
        
        # 尝试使用 Docker 启动
        if command -v docker &> /dev/null; then
            if docker ps -a | grep -q mongodb; then
                docker start mongodb
                echo -e "${GREEN}✓${NC} MongoDB 容器已启动"
            else
                docker run -d --name mongodb -p 27017:27017 mongo:7.0
                echo -e "${GREEN}✓${NC} MongoDB 容器已创建并启动"
            fi
        else
            echo -e "${RED}✗${NC} 请先安装并启动 MongoDB"
            echo "   Docker: docker run -d --name mongodb -p 27017:27017 mongo:7.0"
            echo "   或查看: MONGODB_INSTALL.md"
            exit 1
        fi
    fi
else
    echo -e "${YELLOW}⚠${NC} mongosh 未安装，跳过检查"
fi

echo ""

# 检查依赖
echo -e "${BLUE}[2/5]${NC} 检查依赖..."
if [ ! -d "node_modules" ] || [ ! -d "api/node_modules" ] || [ ! -d "admin/node_modules" ]; then
    echo -e "${YELLOW}⚠${NC} 检测到缺少依赖，开始安装..."
    npm run install:all
else
    echo -e "${GREEN}✓${NC} 依赖已安装"
fi

echo ""

# 检查环境配置
echo -e "${BLUE}[3/5]${NC} 检查环境配置..."
if [ ! -f "api/.env" ] && [ ! -f "api/.env.dev" ]; then
    echo -e "${YELLOW}⚠${NC} 创建环境配置文件..."
    npm run setup:env
else
    echo -e "${GREEN}✓${NC} 环境配置已存在"
fi

echo ""

# 显示启动信息
echo -e "${BLUE}[4/5]${NC} 准备启动服务..."
echo ""
echo "  📊 API 服务:      http://localhost:3001"
echo "  🎨 管理后台:      http://localhost:3000"
echo "  📖 文档站点:      http://localhost:5173"
echo ""

# 启动服务
echo -e "${BLUE}[5/5]${NC} 启动所有服务..."
echo ""
echo -e "${GREEN}=================================="
echo "  所有服务正在启动..."
echo "  按 Ctrl+C 停止所有服务"
echo "==================================${NC}"
echo ""

npm run dev
