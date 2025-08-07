"""API路由模块"""
from fastapi import APIRouter
from .users import router as users_router
from .news import router as news_router

# 创建主路由
api_router = APIRouter()

# 包含子路由
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(news_router, prefix="/news", tags=["news"])

__all__ = ["api_router", "users_router", "news_router"]