from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """用户基础模型"""
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    email: EmailStr = Field(..., description="邮箱地址")


class UserCreate(UserBase):
    """用户创建模型"""
    password: str = Field(..., min_length=6, max_length=128, description="密码")
    
    @validator('username')
    def username_alphanumeric(cls, v):
        if not v.isalnum():
            raise ValueError('用户名只能包含字母和数字')
        return v
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError('密码长度至少为6位')
        if not any(char.isdigit() for char in v):
            raise ValueError('密码必须包含至少一个数字')
        if not any(char.isalpha() for char in v):
            raise ValueError('密码必须包含至少一个字母')
        return v


class UserUpdate(BaseModel):
    """用户更新模型"""
    username: Optional[str] = Field(None, min_length=3, max_length=50, description="用户名")
    email: Optional[EmailStr] = Field(None, description="邮箱地址")
    
    @validator('username')
    def username_alphanumeric(cls, v):
        if v is not None and not v.isalnum():
            raise ValueError('用户名只能包含字母和数字')
        return v


class UserInDB(UserBase):
    """数据库中的用户模型"""
    id: int = Field(..., description="用户ID")
    created_at: datetime = Field(..., description="创建时间")
    
    class Config:
        from_attributes = True


class UserResponse(UserInDB):
    """用户响应模型"""
    pass


class UserLogin(BaseModel):
    """用户登录模型"""
    username: str = Field(..., description="用户名或邮箱")
    password: str = Field(..., description="密码")


class Token(BaseModel):
    """Token响应模型"""
    access_token: str = Field(..., description="访问令牌")
    token_type: str = Field(default="bearer", description="令牌类型")
    expires_in: int = Field(default=3600, description="过期时间（秒）")


class TokenData(BaseModel):
    """Token数据模型"""
    username: Optional[str] = Field(None, description="用户名")
    user_id: Optional[int] = Field(None, description="用户ID")