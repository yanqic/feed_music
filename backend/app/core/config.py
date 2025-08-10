from pydantic import field_validator
from pydantic_settings import BaseSettings
from typing import Optional, List
import os


class Settings(BaseSettings):
    """应用配置"""
    
    # 应用配置
    APP_NAME: str = "Feed Music API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # 安全配置
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # 数据库配置
    POSTGRES_URL: str = "postgresql://username:password@localhost:5432/feed_music_db"
    
    # Supabase配置
    SUPABASE_URL: str = "https://your-project.supabase.co"
    SUPABASE_KEY: str = "your-anon-key"
    
    def get_database_url(self) -> str:
        """获取数据库URL"""
        return self.POSTGRES_URL
    
    # CORS配置
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8080"
    
    # 文件上传配置
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_EXTENSIONS: str = ".jpg,.jpeg,.png,.gif,.webp"
    
    # 日志配置
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    def get_cors_origins(self) -> List[str]:
        """获取CORS源列表"""
        if isinstance(self.BACKEND_CORS_ORIGINS, str):
            if self.BACKEND_CORS_ORIGINS == "*":
                return ["*"]
            return [i.strip() for i in self.BACKEND_CORS_ORIGINS.split(",") if i.strip()]
        return self.BACKEND_CORS_ORIGINS
    
    def get_allowed_extensions(self) -> List[str]:
        """获取允许的文件扩展名列表"""
        if isinstance(self.ALLOWED_EXTENSIONS, str):
            return [i.strip() for i in self.ALLOWED_EXTENSIONS.split(",") if i.strip()]
        return self.ALLOWED_EXTENSIONS
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()