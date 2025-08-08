from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

from app.core.config import settings
from app.core.supabase_client import supabase_client

Base = declarative_base()

# 全局变量用于存储引擎和会话
engine = None
SessionLocal = None

def get_engine():
    """获取数据库引擎 - 现在使用 Supabase 客户端，不再需要直接的 PostgreSQL 连接"""
    global engine
    if engine is None:
        # 注意：由于我们现在使用 Supabase 客户端，这个引擎主要用于兼容性
        # 实际的数据库操作应该通过 supabase_client 进行
        print("Warning: Direct PostgreSQL connection is deprecated. Use supabase_client instead.")
        # 返回一个虚拟引擎，避免破坏现有代码
        from sqlalchemy import create_engine
        engine = create_engine("sqlite:///:memory:")  # 临时内存数据库
    return engine

def get_session_local():
    """获取数据库会话 - 现在推荐使用 Supabase 客户端"""
    global SessionLocal
    if SessionLocal is None:
        print("Warning: SQLAlchemy sessions are deprecated. Use supabase_client instead.")
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
    return SessionLocal

# 依赖项函数，用于获取数据库会话
def get_db():
    """获取数据库会话 - 现在推荐使用 get_supabase_client"""
    print("Warning: get_db() is deprecated. Use supabase_client for database operations.")
    SessionLocal = get_session_local()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 新的 Supabase 客户端依赖项
def get_supabase_client():
    """获取 Supabase 客户端实例"""
    return supabase_client