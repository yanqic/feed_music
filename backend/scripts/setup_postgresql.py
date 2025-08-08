#!/usr/bin/env python3
"""
PostgreSQL 设置脚本

这个脚本帮助用户快速设置 PostgreSQL 数据库并运行迁移。
"""

import os
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app.core.supabase_client import supabase_client
from app.core.config import settings

def setup_supabase():
    """设置 Supabase 数据库连接"""
    print("Setting up Supabase database connection...")
    
    try:
        # 测试 Supabase 连接
        print(f"Connecting to Supabase: {settings.SUPABASE_URL}")
        
        # 尝试执行一个简单的查询来测试连接
        response = supabase_client.table('_test_connection').select('*').limit(1).execute()
        print("✅ Supabase connection test completed")
        print("Note: Table '_test_connection' may not exist, which is normal")
        
        print("✅ Supabase setup completed successfully!")
        print("\nNext steps:")
        print("1. Create your database tables in Supabase Dashboard")
        print("2. Set up Row Level Security (RLS) policies")
        print("3. Configure authentication if needed")
        return True
        
    except Exception as e:
        print(f"❌ Supabase setup failed: {e}")
        print("\nTroubleshooting:")
        print("1. Check your SUPABASE_URL and SUPABASE_KEY in .env file")
        print("2. Ensure your Supabase project is active")
        print("3. Verify network connectivity")
        return False

if __name__ == "__main__":
    if setup_supabase():
        print("\n🎉 Supabase setup completed!")
        print("You can now run the application.")
    else:
        print("\n💥 Supabase setup failed!")
        print("Please check your Supabase configuration.")
        sys.exit(1)