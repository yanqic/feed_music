from supabase import create_client, Client
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime

from app.core.config import settings
from app.schemas.news import NewsCreate, NewsUpdate
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password

logger = logging.getLogger(__name__)

class SupabaseService:
    def __init__(self):
        try:
            self.supabase: Client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_KEY
            )
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise
    
    # 新闻相关操作
    async def get_news_list(
        self, 
        page: int = 1, 
        size: int = 10, 
        keyword: Optional[str] = None,
        creator_id: Optional[int] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> Dict[str, Any]:
        """获取新闻列表"""
        try:
            # 构建查询
            query = self.supabase.table("news").select(
                "*, creator:users(id, username, email)"
            )
            
            # 添加搜索条件
            if keyword:
                query = query.or_(f"title.ilike.%{keyword}%,description.ilike.%{keyword}%")
            
            if creator_id:
                query = query.eq("creator_id", creator_id)
            
            # 添加排序
            ascending = sort_order == "asc"
            query = query.order(sort_by, desc=not ascending)
            
            # 计算偏移量
            offset = (page - 1) * size
            
            # 执行查询
            response = query.range(offset, offset + size - 1).execute()
            
            # 获取总数
            count_query = self.supabase.table("news").select("id", count="exact")
            if keyword:
                count_query = count_query.or_(f"title.ilike.%{keyword}%,description.ilike.%{keyword}%")
            if creator_id:
                count_query = count_query.eq("creator_id", creator_id)
            
            count_response = count_query.execute()
            total = count_response.count
            
            return {
                "items": response.data,
                "total": total,
                "page": page,
                "size": size,
                "pages": (total + size - 1) // size
            }
            
        except Exception as e:
            logger.error(f"获取新闻列表失败: {str(e)}")
            raise Exception(f"获取新闻列表失败: {str(e)}")
    
    async def get_news_by_id(self, news_id: int) -> Optional[Dict[str, Any]]:
        """根据ID获取新闻"""
        try:
            response = self.supabase.table("news").select(
                "*, creator:users(id, username, email)"
            ).eq("id", news_id).execute()
            
            if response.data:
                return response.data[0]
            return None
            
        except Exception as e:
            logger.error(f"获取新闻详情失败: {str(e)}")
            raise Exception(f"获取新闻详情失败: {str(e)}")
    
    async def create_news(self, news_data: NewsCreate, creator_id: int) -> Dict[str, Any]:
        """创建新闻"""
        try:
            data = {
                "title": news_data.title,
                "description": news_data.description,
                "image_url": news_data.image_url,
                "creator_id": creator_id,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            response = self.supabase.table("news").insert(data).execute()
            
            if response.data:
                # 获取完整的新闻信息（包含创建者信息）
                return await self.get_news_by_id(response.data[0]["id"])
            
            raise Exception("创建新闻失败")
            
        except Exception as e:
            logger.error(f"创建新闻失败: {str(e)}")
            raise Exception(f"创建新闻失败: {str(e)}")
    
    async def update_news(self, news_id: int, news_data: NewsUpdate, user_id: int) -> Dict[str, Any]:
        """更新新闻"""
        try:
            # 检查新闻是否存在且用户有权限
            existing_news = await self.get_news_by_id(news_id)
            if not existing_news:
                raise Exception("新闻不存在")
            
            if existing_news["creator_id"] != user_id:
                raise Exception("没有权限更新此新闻")
            
            # 准备更新数据
            update_data = news_data.dict(exclude_unset=True)
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
            response = self.supabase.table("news").update(update_data).eq("id", news_id).execute()
            
            if response.data:
                return await self.get_news_by_id(news_id)
            
            raise Exception("更新新闻失败")
            
        except Exception as e:
            logger.error(f"更新新闻失败: {str(e)}")
            raise Exception(f"更新新闻失败: {str(e)}")
    
    async def delete_news(self, news_id: int, user_id: int) -> bool:
        """删除新闻"""
        try:
            # 检查新闻是否存在且用户有权限
            existing_news = await self.get_news_by_id(news_id)
            if not existing_news:
                raise Exception("新闻不存在")
            
            if existing_news["creator_id"] != user_id:
                raise Exception("没有权限删除此新闻")
            
            response = self.supabase.table("news").delete().eq("id", news_id).execute()
            
            return True
            
        except Exception as e:
            logger.error(f"删除新闻失败: {str(e)}")
            raise Exception(f"删除新闻失败: {str(e)}")
    
    # 用户相关操作
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """根据邮箱获取用户"""
        try:
            response = self.supabase.table("users").select("*").eq("email", email).execute()
            
            if response.data:
                return response.data[0]
            return None
            
        except Exception as e:
            logger.error(f"获取用户失败: {str(e)}")
            raise Exception(f"获取用户失败: {str(e)}")
    
    async def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """根据用户名获取用户"""
        try:
            response = self.supabase.table("users").select("*").eq("username", username).execute()
            
            if response.data:
                return response.data[0]
            return None
            
        except Exception as e:
            logger.error(f"获取用户失败: {str(e)}")
            raise Exception(f"获取用户失败: {str(e)}")
    
    async def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        """根据ID获取用户"""
        try:
            response = self.supabase.table("users").select("*").eq("id", user_id).execute()
            
            if response.data:
                return response.data[0]
            return None
            
        except Exception as e:
            logger.error(f"获取用户失败: {str(e)}")
            raise Exception(f"获取用户失败: {str(e)}")
    
    async def create_user(self, user_data: UserCreate) -> Dict[str, Any]:
        """创建用户"""
        try:
            # 检查邮箱是否已存在
            existing_user = await self.get_user_by_email(user_data.email)
            if existing_user:
                raise Exception("邮箱已被注册")
            
            # 检查用户名是否已存在
            existing_username = await self.get_user_by_username(user_data.username)
            if existing_username:
                raise Exception("用户名已存在")
            
            data = {
                "username": user_data.username,
                "email": user_data.email,
                "hashed_password": get_password_hash(user_data.password),
                "is_active": True,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            response = self.supabase.table("users").insert(data).execute()
            
            if response.data:
                return response.data[0]
            
            raise Exception("创建用户失败")
            
        except Exception as e:
            logger.error(f"创建用户失败: {str(e)}")
            raise Exception(f"创建用户失败: {str(e)}")
    
    async def authenticate_user(self, username_or_email: str, password: str) -> Optional[Dict[str, Any]]:
        """验证用户（支持用户名或邮箱登录）"""
        try:
            # 先尝试通过邮箱查找
            user = await self.get_user_by_email(username_or_email)
            
            # 如果通过邮箱没找到，尝试通过用户名查找
            if not user:
                response = self.supabase.table("users").select("*").eq("username", username_or_email).execute()
                if response.data:
                    user = response.data[0]
            
            if not user:
                return None
            
            if not verify_password(password, user["hashed_password"]):
                return None
            
            return user
            
        except Exception as e:
            logger.error(f"用户验证失败: {str(e)}")
            return None

# 创建全局实例
supabase_service = SupabaseService()