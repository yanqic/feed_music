# Feed Music 音乐资讯网站

一个现代化的音乐资讯网站项目，提供动态背景、响应式新闻展示和完整的用户管理系统。

## 🚀 功能特性

### 前端特性
- **动态首页**: 视频背景 + 文字滚动效果
- **响应式新闻**: 自适应网格布局，PC端3列，移动端1列
- **页面切换**: 流畅的页面转场动画
- **用户认证**: 注册、登录界面
- **新闻管理**: 管理员后台（需登录）
- **移动端优化**: 完美适配各种设备尺寸

### 后端特性
- **用户管理**: 注册、登录、JWT认证、权限控制
- **新闻管理**: 发布、编辑、删除、搜索、分页
- **RESTful API**: 符合REST设计规范
- **数据验证**: Pydantic严格验证
- **错误处理**: 统一异常处理
- **API文档**: 自动生成OpenAPI文档

## 📋 技术栈

### 前端
- **框架**: React 18+
- **路由**: React Router v6
- **状态管理**: React Context API
- **样式**: SCSS + CSS Modules
- **HTTP客户端**: Axios
- **构建工具**: Create React App

### 后端
- **框架**: FastAPI 0.104+
- **数据库**: SQLAlchemy 2.0+ ORM + PostgreSQL
- **数据库迁移**: Alembic
- **认证**: PyJWT + bcrypt
- **验证**: Pydantic v2
- **测试**: pytest + httpx
- **部署**: Uvicorn + Vercel

## 🏗️ 项目结构

```
feed_music/
├── frontend/               # React 前端应用
│   ├── public/            # 静态资源
│   │   ├── videos/       # 背景视频
│   │   └── images/       # 图片资源
│   ├── src/
│   │   ├── components/   # 组件
│   │   │   ├── common/  # 通用组件
│   │   │   ├── Introduction/ # 首页组件
│   │   │   └── News/    # 新闻组件
│   │   ├── contexts/    # React Context
│   │   ├── pages/       # 页面组件
│   │   ├── services/    # API服务
│   │   └── utils/       # 工具函数
│   └── package.json     # 前端依赖
├── backend/               # FastAPI 后端应用
│   ├── app/
│   │   ├── api/         # API路由
│   │   ├── core/        # 核心配置
│   │   ├── models/      # 数据模型
│   │   ├── schemas/     # 数据验证
│   │   └── middleware/  # 中间件
│   ├── scripts/         # 工具脚本
│   ├── alembic/         # 数据库迁移
│   └── requirements.txt # 后端依赖
└── README.md             # 项目文档
```

## 🛠️ 快速开始

### 环境要求

- **前端**: Node.js 16+, npm 或 yarn
- **后端**: Python 3.8+, pip
- **数据库**: PostgreSQL 12+

### 安装步骤

#### 1. 克隆项目
```bash
git clone <repository-url>
cd feed_music
```

#### 2. 后端设置

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置数据库连接等配置

# 一键启动服务器
./start_server.sh

# 或手动启动
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. 前端设置

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 配置环境变量
echo "REACT_APP_API_URL=http://localhost:8000/api/v1" > .env
echo "REACT_APP_UPLOAD_URL=http://localhost:8000" >> .env

# 启动开发服务器
npm start
# 或指定端口
PORT=3001 npm start
```

### 环境变量配置

#### 后端 (.env)
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
POSTGRES_URL=postgresql://username:password@localhost:5432/feed_music_db

# CORS配置
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

#### 前端 (.env)
```bash
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_UPLOAD_URL=http://localhost:8000
```

## 🐘 数据库设置

### PostgreSQL 快速设置

1. **安装 PostgreSQL**
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
```

2. **创建数据库**
```bash
# 连接到 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE feed_music_db;

# 退出
\q
```

3. **运行迁移**
```bash
cd backend
# 一键设置和启动
./start_server.sh
```

## 📖 API文档

启动后端服务后访问：
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

### 后端测试
```bash
cd backend
pytest tests/ -v
```

### 前端测试
```bash
cd frontend
npm test
```

## 🚀 部署

### Vercel 部署（推荐）

#### 后端部署
```bash
cd backend
# 通过 Vercel CLI
vercel

# 设置环境变量
# SECRET_KEY, POSTGRES_URL, BACKEND_CORS_ORIGINS
```

#### 前端部署
```bash
cd frontend
# 构建项目
npm run build

# 部署到 Vercel
vercel --prod
```

### 本地生产环境

#### 后端
```bash
cd backend
# 生产模式启动
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### 前端
```bash
cd frontend
# 构建生产版本
npm run build

# 使用静态服务器
npm install -g serve
serve -s build -l 3000
```

## 🔧 开发指南

### 代码规范
- **后端**: 使用 Black 格式化，isort 排序导入，flake8 检查
- **前端**: 使用 ESLint 检查，Prettier 格式化
- 组件使用 PascalCase，文件使用 camelCase
- 添加适当的注释和文档

### 数据库迁移
```bash
cd backend
# 创建迁移
alembic revision --autogenerate -m "description"

# 应用迁移
alembic upgrade head
```

### 添加新功能
1. 在 `backend/app/models/` 中定义数据模型
2. 在 `backend/app/schemas/` 中定义验证模式
3. 在 `backend/app/api/` 中创建路由
4. 在 `frontend/src/` 中实现前端功能
5. 添加测试用例

## 🐛 故障排除

### 常见问题

1. **端口被占用**
```bash
# 查找占用端口的进程
lsof -ti:3000  # 前端
lsof -ti:8000  # 后端
# 杀死进程
kill -9 <PID>
```

2. **数据库连接失败**
```bash
# 检查 PostgreSQL 服务状态
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux

# 重启 PostgreSQL
brew services restart postgresql      # macOS
sudo systemctl restart postgresql     # Linux
```

3. **依赖安装失败**
```bash
# 前端
cd frontend
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 后端
cd backend
pip cache purge
pip install -r requirements.txt --force-reinstall
```

## 📚 学习资源

- [React 官方文档](https://reactjs.org/)
- [FastAPI 官方文档](https://fastapi.tiangolo.com/)
- [SQLAlchemy 文档](https://docs.sqlalchemy.org/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 项目 Issues: [GitHub Issues]()
- 邮箱: your-email@example.com

---

**享受编码！** 🎵✨