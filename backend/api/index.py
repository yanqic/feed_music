import sys
import os
from mangum import Mangum

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.main import app as fastapi_app
    # 使用 Mangum 将 FastAPI 应用转换为 ASGI 处理器
    handler = Mangum(fastapi_app)
except ImportError as e:
    print(f"Import error: {e}")
    # 创建一个简单的错误应用
    from fastapi import FastAPI
    error_app = FastAPI()
    
    @error_app.get("/")
    async def root():
        return {"error": "Failed to import main application", "detail": str(e)}
    
    handler = Mangum(error_app)

# 为了兼容性，也导出app
app = handler