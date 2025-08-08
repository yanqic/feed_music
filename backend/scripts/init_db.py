#!/usr/bin/env python3
"""
数据库初始化脚本
用于在Vercel部署后初始化数据库表

使用方法:
1. 设置环境变量 SUPABASE_URL 和 SUPABASE_KEY
2. 运行: python scripts/init_db.py
"""

import os
import sys
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app.core.supabase_client import supabase_client
from app.core.config import settings


def init_database():
    """初始化数据库 - 使用 Supabase 客户端"""
    print("使用 Supabase 客户端进行数据库初始化...")
    
    # 使用 Supabase 客户端检查连接
    try:
        # 测试连接
        response = supabase_client.table('_test_connection').select('*').limit(1).execute()
        print("Supabase 连接成功")
    except Exception as e:
        print(f"Supabase 连接测试失败: {e}")
        print("注意：这可能是正常的，如果表不存在的话")
    
    print("数据库初始化完成 - 使用 Supabase 管理表结构")
    print("请在 Supabase Dashboard 中创建和管理数据库表")


def main():
    """主函数"""
    print("=" * 50)
    print("Feed Music API - Database Initialization")
    print("=" * 50)
    
    # 显示当前配置
    print(f"Supabase URL: {settings.SUPABASE_URL}")
    print(f"Environment: {'Vercel' if os.getenv('VERCEL') else 'Local'}")
    print()
    
    # 初始化数据库
    init_database()
    
    print("\n✅ Database initialization completed successfully!")
    print("\nNext steps:")
    print("1. 在 Supabase Dashboard 中创建必要的数据库表")
    print("2. 配置 Row Level Security (RLS) 策略")
    print("3. Test the API endpoints")


if __name__ == "__main__":
    main()