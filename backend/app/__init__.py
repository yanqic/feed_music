from app.database import Base, engine

# 创建数据库表
Base.metadata.create_all(bind=engine)