"""数据验证模型"""
from .user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserInDB,
    UserResponse,
    UserLogin,
    Token,
    TokenData,
)
from .news import (
    NewsBase,
    NewsCreate,
    NewsUpdate,
    NewsInDB,
    NewsResponse,
    NewsListResponse,
    NewsSearchParams,
)

__all__ = [
    # 用户相关
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserInDB",
    "UserResponse",
    "UserLogin",
    "Token",
    "TokenData",
    # 新闻相关
    "NewsBase",
    "NewsCreate",
    "NewsUpdate",
    "NewsInDB",
    "NewsResponse",
    "NewsListResponse",
    "NewsSearchParams",
]