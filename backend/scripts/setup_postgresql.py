#!/usr/bin/env python3
"""
PostgreSQL 设置脚本

这个脚本帮助用户快速设置 PostgreSQL 数据库并运行迁移。
"""

import os
import sys
import subprocess
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from app.core.config import settings
from app.database import engine
from sqlalchemy import text

def check_postgresql_connection():
    """检查 PostgreSQL 连接"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ PostgreSQL 连接成功!")
            print(f"📊 数据库版本: {version}")
            return True
    except Exception as e:
        print(f"❌ PostgreSQL 连接失败: {e}")
        print("\n请检查:")
        print("1. PostgreSQL 服务是否正在运行")
        print("2. 数据库连接配置是否正确")
        print("3. 数据库是否已创建")
        return False

def run_migrations():
    """运行数据库迁移"""
    try:
        print("\n🔄 创建迁移文件...")
        result = subprocess.run(
            ["alembic", "revision", "--autogenerate", "-m", "Initial migration"],
            cwd=project_root,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print("✅ 迁移文件创建成功")
        else:
            print(f"⚠️  迁移文件创建警告: {result.stderr}")
        
        print("\n🔄 应用迁移...")
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            cwd=project_root,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print("✅ 数据库迁移完成")
            return True
        else:
            print(f"❌ 迁移失败: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ 运行迁移时出错: {e}")
        return False

def main():
    """主函数"""
    print("🚀 Feed Music PostgreSQL 设置")
    print("=" * 40)
    
    # 显示当前配置
    db_url = settings.get_database_url()
    print(f"📍 数据库URL: {db_url}")
    
    if not db_url.startswith("postgresql"):
        print("❌ 当前配置不是 PostgreSQL")
        print("请在 .env 文件中设置 POSTGRES_URL")
        return False
    
    # 检查连接
    if not check_postgresql_connection():
        return False
    
    # 运行迁移
    if not run_migrations():
        return False
    
    print("\n🎉 PostgreSQL 设置完成!")
    print("\n现在可以启动应用:")
    print("uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)