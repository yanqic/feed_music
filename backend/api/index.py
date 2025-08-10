import sys
import os

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.main import app
except ImportError as e:
    print(f"Import error: {e}")
    # 创建一个简单的错误应用
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    
    app = FastAPI()
    
    # 添加 CORS 中间件
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # 保存错误信息到变量
    import_error_detail = str(e)
    
    @app.get("/")
    async def root():
        return {"error": "Failed to import main application", "detail": import_error_detail}