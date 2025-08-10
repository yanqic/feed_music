import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import get_engine
from app.models import Base
from app.api import api_router
from app.middleware import register_exception_handlers

# 数据库初始化
def init_database():
    """初始化数据库表"""
    try:
        # 在Vercel环境下，我们需要确保数据库连接正常
        if os.getenv("VERCEL"):
            # 在Vercel环境下，只在需要时创建表
            # 这里可以添加更复杂的迁移逻辑
            pass
        else:
            # 本地开发环境直接创建表
            engine = get_engine()
            print(f"Creating database tables with engine: {engine.url}")
            Base.metadata.create_all(bind=engine)
            print("Database tables created successfully")
    except Exception as e:
        print(f"Database initialization error: {e}")
        # 在生产环境中，我们可能不想因为数据库问题而阻止应用启动
        if not os.getenv("VERCEL"):
            raise

# 初始化数据库
init_database()

# 创建FastAPI应用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if os.getenv("VERCEL") else settings.get_cors_origins(),
    allow_credentials=False if os.getenv("VERCEL") else True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-CSRF-Token",
        "X-Request-ID"
    ],
    expose_headers=["*"],
)

# 注册异常处理器
register_exception_handlers(app)

# 注册路由
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    """根路由"""
    return {
        "message": "Welcome to Feed Music API",
        "version": settings.APP_VERSION,
        "docs": "/api/v1/docs"
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )