#!/bin/bash

# Feed Music Backend - 服务器启动脚本

echo "🚀 启动 Feed Music Backend 服务器"
echo "=========================================="

# 检查是否在正确的目录
if [ ! -f "app/main.py" ]; then
    echo "❌ 请在 backend 目录下运行此脚本"
    exit 1
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "❌ 未找到 .env 文件"
    echo "请复制 .env.example 到 .env 并配置数据库连接"
    exit 1
fi

# 检查 POSTGRES_URL 是否配置
if ! grep -q "^POSTGRES_URL=" .env; then
    echo "❌ 未在 .env 文件中找到 POSTGRES_URL 配置"
    echo "请在 .env 文件中添加 PostgreSQL 连接配置"
    exit 1
fi

echo "📋 检查依赖..."
# 检查是否安装了依赖
if ! python -c "import psycopg2" 2>/dev/null; then
    echo "❌ 未安装 psycopg2，正在安装..."
    pip install psycopg2-binary
fi

echo "🔄 运行数据库设置..."
# 运行数据库设置脚本
python scripts/setup_postgresql.py

if [ $? -eq 0 ]; then
    echo "\n🌟 启动开发服务器..."
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
else
    echo "❌ 数据库设置失败，请检查配置"
    exit 1
fi