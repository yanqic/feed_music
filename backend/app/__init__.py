from app.database import Base, get_engine

# 注意：在serverless环境中，不应该在模块导入时创建数据库表
# 数据库表的创建应该通过迁移脚本或者在应用启动时进行