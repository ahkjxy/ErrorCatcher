@echo off
chcp 65001 >nul
title ErrorCatcher 启动脚本

echo ==================================
echo   ErrorCatcher 启动脚本
echo ==================================
echo.

REM 检查 MongoDB
echo [1/5] 检查 MongoDB...
mongosh --eval "db.version()" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ MongoDB 正在运行
) else (
    echo ⚠ MongoDB 未运行，尝试启动...
    docker ps -a | findstr mongodb >nul 2>&1
    if %errorlevel% equ 0 (
        docker start mongodb
        echo ✓ MongoDB 容器已启动
    ) else (
        docker run -d --name mongodb -p 27017:27017 mongo:7.0
        echo ✓ MongoDB 容器已创建并启动
    )
)
echo.

REM 检查依赖
echo [2/5] 检查依赖...
if not exist "node_modules" (
    echo ⚠ 检测到缺少依赖，开始安装...
    call npm run install:all
) else (
    echo ✓ 依赖已安装
)
echo.

REM 检查环境配置
echo [3/5] 检查环境配置...
if not exist "api\.env" (
    if not exist "api\.env.dev" (
        echo ⚠ 创建环境配置文件...
        call npm run setup:env
    )
) else (
    echo ✓ 环境配置已存在
)
echo.

REM 显示启动信息
echo [4/5] 准备启动服务...
echo.
echo   📊 API 服务:      http://localhost:3001
echo   🎨 管理后台:      http://localhost:3000
echo   📖 文档站点:      http://localhost:5173
echo.

REM 启动服务
echo [5/5] 启动所有服务...
echo.
echo ==================================
echo   所有服务正在启动...
echo   按 Ctrl+C 停止所有服务
echo ==================================
echo.

call npm run dev
