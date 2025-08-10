import sys
import os

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.main import app as fastapi_app
    # Vercel需要的是ASGI应用
    app = fastapi_app
except ImportError as e:
    print(f"Import error: {e}")
    # 创建一个简单的错误应用
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/")
    async def root():
        return {"error": "Failed to import main application", "detail": str(e)}

# 为了兼容性，也导出handler
handler = app