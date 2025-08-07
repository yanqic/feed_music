# Feed Music 后端服务

基于FastAPI构建的高性能音乐资讯后端API服务。

## 🚀 功能特性

- **用户管理**: 注册、登录、JWT认证、权限控制
- **新闻管理**: 发布、编辑、删除、搜索、分页
- **音乐资讯**: 音乐相关新闻和资讯管理
- **RESTful API**: 符合REST设计规范
- **数据验证**: Pydantic严格验证
- **错误处理**: 统一异常处理
- **分页功能**: 支持分页查询和排序
- **API文档**: 自动生成OpenAPI文档

## 📋 技术栈

- **框架**: FastAPI 0.104+
- **数据库**: SQLAlchemy 2.0+ ORM + SQLite
- **认证**: PyJWT + bcrypt
- **验证**: Pydantic v2
- **测试**: pytest + httpx
- **部署**: Docker + Uvicorn

## 🏗️ 项目结构

```
backend/
├── app/
│   ├── api/                 # API路由
│   │   ├── __init__.py     # 路由注册
│   │   ├── users.py        # 用户API
│   │   ├── news.py         # 新闻API
│   │   └── dependencies.py # 依赖注入
│   ├── core/               # 核心配置
│   │   ├── __init__.py
│   │   ├── config.py       # 应用配置
│   │   ├── database.py     # 数据库配置
│   │   ├── security.py     # 安全相关
│   │   ├── exceptions.py   # 自定义异常
│   │   └── pagination.py   # 分页功能
│   ├── middleware/         # 中间件
│   │   ├── __init__.py
│   │   └── error_handler.py # 错误处理
│   ├── models/             # 数据模型
│   │   ├── __init__.py
│   │   ├── user.py         # 用户模型
│   │   └── news.py         # 新闻模型
│   ├── schemas/            # 数据验证
│   │   ├── __init__.py
│   │   ├── user.py         # 用户验证
│   │   └── news.py         # 新闻验证
│   └── main.py             # 应用入口
├── .env.example            # 环境变量模板
├── requirements.txt        # 依赖列表
└── README.md              # 项目文档
```

## 🛠️ 快速开始

### 环境要求

- Python 3.8+
- pip (Python包管理器)

### 安装步骤

1. **进入后端目录**
```bash
cd backend
```

2. **创建虚拟环境**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

3. **安装依赖**
```bash
pip install -r requirements.txt
```

4. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，设置必要的配置
```

5. **初始化数据库**
```bash
python -c "from app.core import engine; from app.models import Base; Base.metadata.create_all(bind=engine)"
```

6. **启动服务**
```bash
# 开发模式
python -m app.main

# 或使用uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 环境变量配置

编辑 `.env` 文件：

```bash
# 应用配置
APP_NAME=Feed Music API
APP_VERSION=1.0.0
DEBUG=false

# 安全配置
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# 数据库配置
DATABASE_URL=sqlite:///./feed_music.db

# CORS配置
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:8080

# 文件上传配置
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
ALLOWED_EXTENSIONS=.jpg,.jpeg,.png,.gif,.webp

# 日志配置
LOG_LEVEL=INFO
```

## 📖 API文档

启动服务后访问：
- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc
- **OpenAPI Schema**: http://localhost:8000/api/v1/openapi.json

### 主要API端点

#### 认证相关
- `POST /api/v1/users/register` - 用户注册
- `POST /api/v1/users/login` - 用户登录
- `GET /api/v1/users/me` - 获取当前用户信息

#### 新闻管理
- `GET /api/v1/news` - 获取新闻列表（分页、搜索、排序）
- `POST /api/v1/news` - 创建新闻（管理员）
- `GET /api/v1/news/{news_id}` - 获取新闻详情
- `PUT /api/v1/news/{news_id}` - 更新新闻（管理员）
- `DELETE /api/v1/news/{news_id}` - 删除新闻（管理员）

## 🧪 测试

运行测试套件：
```bash
pytest tests/ -v
```

## 🐳 Docker部署

### 构建镜像
```bash
docker build -t feed-music-api .
```

### 运行容器
```bash
docker run -d \
  --name feed-music-api \
  -p 8000:8000 \
  -e DATABASE_URL=sqlite:///app/data/feed_music.db \
  feed-music-api
```

## 🔧 开发指南

### 代码规范
- 使用Black进行代码格式化
- 使用isort进行导入排序
- 使用flake8进行代码检查

### 数据库迁移
```bash
# 创建迁移
alembic revision --autogenerate -m "description"

# 应用迁移
alembic upgrade head
```

### 添加新功能
1. 在 `models/` 中定义数据模型
2. 在 `schemas/` 中定义验证模式
3. 在 `api/` 中创建路由
4. 更新 `api/__init__.py` 注册路由
5. 添加测试用例

## 📄 许可证

MIT License