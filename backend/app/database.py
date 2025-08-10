from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

from app.core.config import settings

Base = declarative_base()

# 全局变量用于存储引擎和会话
engine = None
SessionLocal = None

def get_engine():
    global engine
    if engine is None:
        database_url = settings.get_database_url()
        engine = create_engine(database_url)
    return engine

def get_session_local():
    global SessionLocal
    if SessionLocal is None:
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
    return SessionLocal

# 依赖项函数，用于获取数据库会话
def get_db():
    SessionLocal = get_session_local()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()