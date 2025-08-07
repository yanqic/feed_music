from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, asc
from typing import Optional, List
import logging

from ..database import get_db
from ..models.news import News
from ..models.user import User
from ..schemas.news import NewsCreate, NewsUpdate, NewsResponse, NewsSearchParams
from ..core.exceptions import NotFoundException, ForbiddenException, BadRequestException
from ..core.pagination import PaginationParams, PaginatedResponse, paginate
from ..api.users import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("", response_model=NewsResponse, status_code=status.HTTP_201_CREATED)
async def create_news(
    news: NewsCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新闻"""
    try:
        db_news = News(
            title=news.title,
            description=news.description,
            image_url=news.image_url,
            creator_id=current_user.id
        )
        
        db.add(db_news)
        db.commit()
        db.refresh(db_news)
        
        # 使用JOIN加载创建者信息
        db_news = db.query(News).options(joinedload(News.creator)).filter(News.id == db_news.id).first()
        
        logger.info(f"新闻创建成功: {news.title} (用户: {current_user.username})")
        return NewsResponse.from_orm(db_news)
        
    except Exception as e:
        db.rollback()
        logger.error(f"新闻创建失败: {str(e)}")
        raise


@router.get("", response_model=PaginatedResponse[NewsResponse])
async def get_news_list(
    params: PaginationParams = Depends(),
    keyword: Optional[str] = Query(None, description="搜索关键词"),
    creator_id: Optional[int] = Query(None, description="创建者ID"),
    sort_by: str = Query("created_at", regex="^(created_at|updated_at|title)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    """获取新闻列表（支持搜索和分页）"""
    try:
        # 构建查询，使用JOIN加载创建者信息
        query = db.query(News).options(joinedload(News.creator))
        
        # 搜索条件
        if keyword:
            query = query.filter(
                or_(
                    News.title.contains(keyword),
                    News.description.contains(keyword)
                )
            )
        
        if creator_id:
            query = query.filter(News.creator_id == creator_id)
        
        # 排序
        sort_column = getattr(News, sort_by)
        if sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        # 分页查询
        items, total = paginate(query, params)
        
        return PaginatedResponse.create(
            items=[NewsResponse.from_orm(item) for item in items],
            total=total,
            page=params.page,
            size=params.size
        )
        
    except Exception as e:
        logger.error(f"获取新闻列表失败: {str(e)}")
        raise


@router.get("/{news_id}", response_model=NewsResponse)
async def get_news(news_id: int, db: Session = Depends(get_db)):
    """根据ID获取新闻详情"""
    news = db.query(News).options(joinedload(News.creator)).filter(News.id == news_id).first()
    if not news:
        raise NotFoundException("新闻不存在")
    
    return NewsResponse.from_orm(news)


@router.put("/{news_id}", response_model=NewsResponse)
async def update_news(
    news_id: int,
    news_update: NewsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新新闻"""
    try:
        news = db.query(News).options(joinedload(News.creator)).filter(News.id == news_id).first()
        if not news:
            raise NotFoundException("新闻不存在")
        
        # 检查权限（只有创建者可以更新）
        if news.creator_id != current_user.id:
            raise ForbiddenException("没有权限更新此新闻")
        
        # 更新字段
        update_data = news_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(news, field, value)
        
        db.commit()
        db.refresh(news)
        
        logger.info(f"新闻更新成功: {news.title} (用户: {current_user.username})")
        return NewsResponse.from_orm(news)
        
    except Exception as e:
        db.rollback()
        logger.error(f"新闻更新失败: {str(e)}")
        raise


@router.delete("/{news_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_news(
    news_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除新闻"""
    try:
        news = db.query(News).filter(News.id == news_id).first()
        if not news:
            raise NotFoundException("新闻不存在")
        
        # 检查权限（只有创建者可以删除）
        if news.creator_id != current_user.id:
            raise ForbiddenException("没有权限删除此新闻")
        
        db.delete(news)
        db.commit()
        
        logger.info(f"新闻删除成功: {news.title} (用户: {current_user.username})")
        
    except Exception as e:
        db.rollback()
        logger.error(f"新闻删除失败: {str(e)}")
        raise


@router.get("/user/{user_id}", response_model=PaginatedResponse[NewsResponse])
async def get_user_news(
    user_id: int,
    params: PaginationParams = Depends(),
    db: Session = Depends(get_db)
):
    """获取指定用户的新闻列表"""
    try:
        # 检查用户是否存在
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundException("用户不存在")
        
        # 查询该用户的新闻，使用JOIN加载创建者信息
        query = db.query(News).options(joinedload(News.creator)).filter(News.creator_id == user_id).order_by(desc(News.created_at))
        
        items, total = paginate(query, params)
        
        return PaginatedResponse.create(
            items=[NewsResponse.from_orm(item) for item in items],
            total=total,
            page=params.page,
            size=params.size
        )
        
    except Exception as e:
        logger.error(f"获取用户新闻失败: {str(e)}")
        raise
