#!/usr/bin/env python3
"""
数据库初始化脚本
用于在Vercel部署后初始化数据库表

使用方法:
1. 设置环境变量 POSTGRES_URL
2. 运行: python scripts/init_db.py
"""

import os
import sys
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app.core import settings, engine
from app.models import Base
from app.models.user import User
from app.models.news import News
from app.core.security import get_password_hash
from sqlalchemy.orm import sessionmaker


def create_tables():
    """创建所有数据库表"""
    print("Creating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tables created successfully")
        return True
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False


def create_admin_user():
    """创建默认管理员用户"""
    print("Creating admin user...")
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # 检查是否已存在管理员用户
        existing_admin = db.query(User).filter(User.username == "admin").first()
        if existing_admin:
            print("⚠️  Admin user already exists")
            return True
        
        # 创建管理员用户
        admin_user = User(
            username="admin",
            email="admin@feedmusic.com",
            password=get_password_hash("admin123")
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ Admin user created successfully")
        print("   Username: admin")
        print("   Password: admin123")
        print("   Email: admin@feedmusic.com")
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
        return False
    finally:
        db.close()


def check_database_connection():
    """检查数据库连接"""
    print("Checking database connection...")
    try:
        # 尝试连接数据库
        connection = engine.connect()
        connection.close()
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False


def main():
    """主函数"""
    print("=" * 50)
    print("Feed Music API - Database Initialization")
    print("=" * 50)
    
    # 显示当前配置
    print(f"Database URL: {settings.get_database_url()[:50]}...")
    print(f"Environment: {'Vercel' if os.getenv('VERCEL') else 'Local'}")
    print()
    
    # 检查数据库连接
    if not check_database_connection():
        print("\n❌ Database initialization failed - connection error")
        sys.exit(1)
    
    # 创建表
    if not create_tables():
        print("\n❌ Database initialization failed - table creation error")
        sys.exit(1)
    
    # 创建管理员用户
    if not create_admin_user():
        print("\n⚠️  Database initialization completed with warnings")
        sys.exit(0)
    
    print("\n✅ Database initialization completed successfully!")
    print("\nNext steps:")
    print("1. Test the API endpoints")
    print("2. Login with admin credentials")
    print("3. Create additional users as needed")


if __name__ == "__main__":
    main()