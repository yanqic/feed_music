from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
import logging

from ..schemas.news import NewsCreate, NewsUpdate, NewsResponse, NewsSearchParams
from ..core.exceptions import NotFoundException, ForbiddenException, BadRequestException
from ..core.pagination import PaginationParams, PaginatedResponse
from ..api.users import get_current_user
from ..services.supabase_service import supabase_service
from ..schemas.user import UserResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("", response_model=NewsResponse, status_code=status.HTTP_201_CREATED)
async def create_news(
    news: NewsCreate,
    current_user: dict = Depends(get_current_user)
):
    """创建新闻"""
    try:
        result = await supabase_service.create_news(news, current_user["id"])
        
        logger.info(f"新闻创建成功: {news.title} (用户: {current_user['username']})")
        return NewsResponse(**result)
        
    except Exception as e:
        logger.error(f"新闻创建失败: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=PaginatedResponse[NewsResponse])
async def get_news_list(
    params: PaginationParams = Depends(),
    keyword: Optional[str] = Query(None, description="搜索关键词"),
    creator_id: Optional[int] = Query(None, description="创建者ID"),
    sort_by: str = Query("created_at", regex="^(created_at|updated_at|title)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$")
):
    """获取新闻列表（支持搜索和分页）"""
    try:
        result = await supabase_service.get_news_list(
            page=params.page,
            size=params.size,
            keyword=keyword,
            creator_id=creator_id,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        return PaginatedResponse.create(
            items=[NewsResponse(**item) for item in result["items"]],
            total=result["total"],
            page=result["page"],
            size=result["size"]
        )
        
    except Exception as e:
        logger.error(f"获取新闻列表失败: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{news_id}", response_model=NewsResponse)
async def get_news(news_id: int):
    """根据ID获取新闻详情"""
    try:
        news = await supabase_service.get_news_by_id(news_id)
        if not news:
            raise NotFoundException("新闻不存在")
        
        return NewsResponse(**news)
    except Exception as e:
        logger.error(f"获取新闻详情失败: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{news_id}", response_model=NewsResponse)
async def update_news(
    news_id: int,
    news_update: NewsUpdate,
    current_user: dict = Depends(get_current_user)
):
    """更新新闻"""
    try:
        result = await supabase_service.update_news(news_id, news_update, current_user["id"])
        
        logger.info(f"新闻更新成功: {result['title']} (用户: {current_user['username']})")
        return NewsResponse(**result)
        
    except Exception as e:
        logger.error(f"新闻更新失败: {str(e)}")
        if "不存在" in str(e):
            raise NotFoundException(str(e))
        elif "权限" in str(e):
            raise ForbiddenException(str(e))
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{news_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_news(
    news_id: int,
    current_user: dict = Depends(get_current_user)
):
    """删除新闻"""
    try:
        await supabase_service.delete_news(news_id, current_user["id"])
        
        logger.info(f"新闻删除成功 (用户: {current_user['username']})")
        
    except Exception as e:
        logger.error(f"新闻删除失败: {str(e)}")
        if "不存在" in str(e):
            raise NotFoundException(str(e))
        elif "权限" in str(e):
            raise ForbiddenException(str(e))
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/user/{user_id}", response_model=PaginatedResponse[NewsResponse])
async def get_user_news(
    user_id: int,
    params: PaginationParams = Depends()
):
    """获取指定用户的新闻列表"""
    try:
        # 检查用户是否存在
        user = await supabase_service.get_user_by_id(user_id)
        if not user:
            raise NotFoundException("用户不存在")
        
        # 查询该用户的新闻
        result = await supabase_service.get_news_list(
            page=params.page,
            size=params.size,
            creator_id=user_id,
            sort_by="created_at",
            sort_order="desc"
        )
        
        return PaginatedResponse.create(
            items=[NewsResponse(**item) for item in result["items"]],
            total=result["total"],
            page=result["page"],
            size=result["size"]
        )
        
    except Exception as e:
        logger.error(f"获取用户新闻失败: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
