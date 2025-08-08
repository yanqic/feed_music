from supabase import create_client, Client
from app.core.config import settings

# 创建 Supabase 客户端实例
def get_supabase_client() -> Client:
    """获取 Supabase 客户端实例"""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# 全局 Supabase 客户端
supabase_client = get_supabase_client()