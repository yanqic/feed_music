import sys
import os

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.main import app
    handler = app
except ImportError as e:
    print(f"Import error: {e}")
    # 创建一个简单的错误应用
    from fastapi import FastAPI
    handler = FastAPI()
    
    @handler.get("/")
    async def root():
        return {"error": "Failed to import main application", "detail": str(e)}

# 确保应用可以被 Vercel 调用
app = handler