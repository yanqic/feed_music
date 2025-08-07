from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime


class NewsBase(BaseModel):
    """新闻基础模型"""
    title: str = Field(..., min_length=1, max_length=200, description="新闻标题")
    description: str = Field(..., min_length=1, max_length=2000, description="新闻描述")
    image_url: Optional[str] = Field(None, max_length=500, description="图片URL")
    
    @validator('title')
    def title_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('标题不能为空')
        return v.strip()
    
    @validator('description')
    def description_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('描述不能为空')
        return v.strip()
    
    @validator('image_url')
    def validate_image_url(cls, v):
        if v is not None and not v.startswith(('http://', 'https://')):
            raise ValueError('图片URL必须以http://或https://开头')
        return v


class NewsCreate(NewsBase):
    """创建新闻模型"""
    pass


class NewsUpdate(BaseModel):
    """更新新闻模型"""
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="新闻标题")
    description: Optional[str] = Field(None, min_length=1, max_length=2000, description="新闻描述")
    image_url: Optional[str] = Field(None, max_length=500, description="图片URL")
    
    @validator('title')
    def title_not_empty(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError('标题不能为空')
        return v.strip() if v else None
    
    @validator('description')
    def description_not_empty(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError('描述不能为空')
        return v.strip() if v else None
    
    @validator('image_url')
    def validate_image_url(cls, v):
        if v is not None and not v.startswith(('http://', 'https://')):
            raise ValueError('图片URL必须以http://或https://开头')
        return v


class NewsInDB(NewsBase):
    """数据库中的新闻模型"""
    id: int = Field(..., description="新闻ID")
    creator_id: int = Field(..., description="创建者ID")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: Optional[datetime] = Field(None, description="更新时间")
    
    class Config:
        from_attributes = True


class CreatorInfo(BaseModel):
    """创建者信息模型"""
    id: int = Field(..., description="用户ID")
    username: str = Field(..., description="用户名")
    email: Optional[str] = Field(None, description="邮箱")
    avatar_url: Optional[str] = Field(None, description="头像URL")
    
    class Config:
        from_attributes = True


class NewsResponse(NewsInDB):
    """新闻响应模型"""
    creator: CreatorInfo = Field(..., description="创建者信息")
    
    class Config:
        from_attributes = True


class NewsListResponse(BaseModel):
    """新闻列表响应模型"""
    items: list[NewsResponse] = Field(..., description="新闻列表")
    total: int = Field(..., description="总条数")
    page: int = Field(..., description="当前页码")
    size: int = Field(..., description="每页条数")
    pages: int = Field(..., description="总页数")
    
    class Config:
        from_attributes = True


class NewsSearchParams(BaseModel):
    """新闻搜索参数"""
    keyword: Optional[str] = Field(None, max_length=100, description="搜索关键词")
    creator_id: Optional[int] = Field(None, description="创建者ID")
    sort_by: Optional[str] = Field(
        default="created_at",
        pattern="^(created_at|updated_at|title)$",
        description="排序字段"
    )
    sort_order: Optional[str] = Field(
        default="desc",
        pattern="^(asc|desc)$",
        description="排序顺序"
    )