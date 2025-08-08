#!/bin/bash

# Feed Music Backend - 服务器启动脚本

# 解析命令行参数
RUN_MIGRATION=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --migrate)
            RUN_MIGRATION=true
            shift
            ;;
        -m)
            RUN_MIGRATION=true
            shift
            ;;
        --help|-h)
            echo "用法: $0 [选项]"
            echo "选项:"
            echo "  --migrate, -m    运行数据库迁移"
            echo "  --help, -h       显示此帮助信息"
            exit 0
            ;;
        *)
            echo "未知选项: $1"
            echo "使用 --help 查看可用选项"
            exit 1
            ;;
    esac
done

echo "🚀 启动 Feed Music Backend 服务器"
echo "==========================================="

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

# 检查 Supabase 配置是否存在
if ! grep -q "^SUPABASE_URL=" .env || ! grep -q "^SUPABASE_KEY=" .env; then
    echo "❌ 未在 .env 文件中找到 Supabase 配置"
    echo "请在 .env 文件中添加 SUPABASE_URL 和 SUPABASE_KEY 配置"
    exit 1
fi

echo "📋 检查依赖..."
# 检查是否安装了依赖
if ! python -c "import psycopg2" 2>/dev/null; then
    echo "❌ 未安装 psycopg2，正在安装..."
    pip install psycopg2-binary
fi

# 根据参数决定是否运行数据库迁移
if [ "$RUN_MIGRATION" = true ]; then
    echo "🔄 运行数据库设置..."
    # 运行数据库设置脚本
    python scripts/setup_postgresql.py
    
    if [ $? -ne 0 ]; then
        echo "❌ 数据库设置失败，请检查配置"
        exit 1
    fi
else
    echo "⏭️  跳过数据库迁移（使用 --migrate 或 -m 参数启用迁移）"
fi

echo "\n🌟 启动开发服务器..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000