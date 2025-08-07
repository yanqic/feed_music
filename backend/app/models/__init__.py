# 导入所有模型，以便在导入包时自动加载
from app.core.database import Base
from app.models.user import User
from app.models.news import News